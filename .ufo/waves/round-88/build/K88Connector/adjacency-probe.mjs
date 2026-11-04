#!/usr/bin/env node
// adjacency-probe.mjs — K88Connector, read-only adjacency cases against the integrated
// receipt-bind.mjs (never edits it). Usage: node adjacency-probe.mjs <tool> <scratch>
// Cases (none is one of the 20 frozen arms):
//   X1 symlink-blob   instrument is a mode-120000 blob at the judged rev; receipt carries
//                     sha256(link-target text) -> what does the tool say?
//   X2 alias-abs      absolute cmd= token names the lane through a symlinked alias path;
//                     worktree differs from rev; receipt carries sha256(worktree bytes).
//   X3 alias-lane     --lane given as the alias; absolute token uses the real path.
//   X4 fifo-external  absolute cmd= token names a FIFO outside the lane (5 s timeout).
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const tool = resolve(process.argv[2]);
const S = resolve(process.argv[3]);
const sha = (b) => createHash('sha256').update(b).digest('hex');
const root = join(S, 'adj');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const env = { ...process.env };
for (const k of Object.keys(env)) if (k.startsWith('GIT_')) delete env[k];
const ID = ['-c', 'user.name=K88Connector', '-c', 'user.email=k88connector@invalid'];

const repo = join(root, 'repo');
mkdirSync(join(repo, 'scripts'), { recursive: true });
const g = (args) => {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
g(['init', '-q']);
if (realpathSync(g(['rev-parse', '--show-toplevel'])) !== realpathSync(repo)) throw new Error('toplevel mismatch');
writeFileSync(join(repo, 'scripts', 'tool.mjs'), 'console.log("v1");\n');
symlinkSync('tool.mjs', join(repo, 'scripts', 'link.mjs'));
g(['add', '-A']);
g([...ID, 'commit', '-q', '-m', 'A']);
const A = g(['rev-parse', 'HEAD']);
const mode = g(['ls-tree', A, '--', 'scripts/link.mjs']).split(/\s+/)[0];
writeFileSync(join(repo, 'scripts', 'tool.mjs'), 'console.log("worktree-dirty");\n');
const alias = join(root, 'alias');
symlinkSync(repo, alias);

const rec = (cmd, digest) => `tool_sha256=${digest}\ncmd=${cmd}\nOK\nexit=0\nsignal=none\n`;
const run = (name, lane, dir, timeout) => {
  const r = spawnSync('node', [tool, '--lane', lane, '--dir', dir, '--rev', A], { encoding: 'utf8', timeout: timeout || 60000 });
  const line = ((r.stdout || '').match(/^RECEIPT_BIND: .*$/m) || [''])[0];
  console.log(`CASE ${name}: exit=${r.status} signal=${r.signal || 'none'} ${line}`);
};
const mkdir = (n) => { const d = join(root, n); mkdirSync(d); return d; };

console.log(`fixture rev=${A} link.mjs mode=${mode}`);
// X1
let d = mkdir('x1');
writeFileSync(join(d, 'r.txt'), rec('node scripts/link.mjs --run', sha('tool.mjs')));
run('X1-symlink-blob(digest=sha(link text))', repo, d);
// X2
d = mkdir('x2');
writeFileSync(join(d, 'r.txt'), rec(`node ${join(alias, 'scripts', 'tool.mjs')} --run`, sha('console.log("worktree-dirty");\n')));
run('X2-alias-abs(digest=sha(worktree))', repo, d);
d = mkdir('x2b');
writeFileSync(join(d, 'r.txt'), rec(`node ${join(repo, 'scripts', 'tool.mjs')} --run`, sha('console.log("worktree-dirty");\n')));
run('X2b-realpath-abs(digest=sha(worktree)) control', repo, d);
// X3
d = mkdir('x3');
writeFileSync(join(d, 'r.txt'), rec(`node ${join(repo, 'scripts', 'tool.mjs')} --run`, sha('console.log("worktree-dirty");\n')));
run('X3-alias-lane(digest=sha(worktree))', alias, d);
// X4
const fifo = join(root, 'fifo');
const mk = spawnSync('mkfifo', [fifo]);
if (mk.status === 0) {
  d = mkdir('x4');
  writeFileSync(join(d, 'r.txt'), rec(`node ${fifo} --run`, '0'.repeat(64)));
  run('X4-fifo-external(timeout 5s)', repo, d, 5000);
} else console.log('CASE X4: skipped (mkfifo failed)');
rmSync(root, { recursive: true, force: true });
