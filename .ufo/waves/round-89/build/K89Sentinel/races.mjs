#!/usr/bin/env node
// races.mjs — TOCTOU measurements for the v3 receipt read.
//   node races.mjs --work <SCRATCH> --base <v2.mjs> --cand <v3.mjs> --out <dir> [--rounds N]
//
// The flipper is a SEPARATE process (the reader is synchronous, so an in-process timer would
// never run). Race 1 swaps the honest MISMATCH receipt for a symlink to a CLEAN receipt; the
// dangerous outcome is CLEAN. Race 2 swaps in a 2 MiB CLEAN receipt by hard link; the dangerous
// outcome is any verdict derived from the oversize file (the limit was checked on another inode).
// Primitive: replicates the candidate's open(O_NOFOLLOW)+fstat+readFileSync(fd) and reports bytes
// read vs the fstat size when the file grows between fstat and read.
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync, constants as C, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, rmSync, unlinkSync, writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

function arg(n, d) { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; }
const work = resolve(arg('--work', ''));
const BASE = resolve(arg('--base', ''));
const CAND = resolve(arg('--cand', ''));
const OUT = resolve(arg('--out', ''));
const ROUNDS = Number(arg('--rounds', '150'));
mkdirSync(work, { recursive: true }); mkdirSync(OUT, { recursive: true });
const N = randomBytes(4).toString('hex');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
const env = () => { const e = { ...process.env, TMPDIR: work }; for (const k of DROP) delete e[k]; return e; };

const repo = join(work, `repo3-${N}`);
mkdirSync(join(repo, 'scripts'), { recursive: true });
const g = (args) => spawnSync('git', ['-C', repo, '-c', `user.name=r${N}`, '-c', `user.email=r${N}@fixture.invalid`,
  '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { encoding: 'utf8', env: env() });
g(['init', '-q']);
const toolRel = `scripts/tool-${N}.mjs`;
const BODY_B = `console.log("race ${N} B");\n`;
const BODY_W = `console.log("race ${N} W");\n`;
writeFileSync(join(repo, toolRel), BODY_B);
g(['add', '-A']); g(['commit', '-q', '-m', `B ${N}`]);
const B = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, toolRel), BODY_W); // dirty worktree, never committed
const dB = sha(BODY_B);
const rcText = (digest) => `rev=${B}\ntool_sha256=${digest}\ncmd=node ${toolRel}\nOK ${N}\n`;
const CLEAN_TXT = rcText(dB);
const DIRTY_TXT = rcText(sha(BODY_W));

function run(tool, d) {
  const r = spawnSync(process.execPath, [tool, '--dir', d, '--rev', B, '--lane', repo],
    { cwd: repo, encoding: 'utf8', timeout: 20000, maxBuffer: 32 << 20, env: env() });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  return { status: r.status, signal: r.signal, line: (out.match(/^RECEIPT_BIND: .*$/m) || [''])[0] };
}
const classify = (r) => (r.signal ? `SIG${r.signal}` : /CLEAN/.test(r.line) ? 'CLEAN'
  : /DRIFT/.test(r.line) ? 'DRIFT' : ((r.line.match(/FAIL-CLOSED (\w+)/) || [null, `exit${r.status}`])[1]));

const FLIP = `
const fs = require('node:fs');
const [honest, other, dirty, mode] = JSON.parse(process.argv[1]);
for (;;) {
  try { fs.unlinkSync(honest); } catch {}
  try { if (mode === 'link') fs.symlinkSync(other, honest); else fs.linkSync(other, honest); } catch {}
  try { fs.unlinkSync(honest); } catch {}
  try { fs.writeFileSync(honest, dirty); } catch {}
}`;

function race(tool, mode, otherBody, tag) {
  const d = join(work, `race-${tag}-${N}`);
  mkdirSync(d, { recursive: true });
  const honest = join(d, 'a.txt');
  const other = join(work, `other-${tag}-${N}.txt`);
  writeFileSync(other, otherBody);
  writeFileSync(honest, DIRTY_TXT);
  const flipper = spawn(process.execPath, ['-e', FLIP, JSON.stringify([honest, other, DIRTY_TXT, mode])], { stdio: 'ignore' });
  const counts = {};
  try {
    for (let i = 0; i < ROUNDS; i += 1) {
      const k = classify(run(tool, d));
      counts[k] = (counts[k] || 0) + 1;
    }
  } finally {
    flipper.kill('SIGKILL');
    rmSync(d, { recursive: true, force: true });
  }
  return { rounds: ROUNDS, counts };
}

function growAfterFstat(rounds) {
  const p = join(work, `grow-${N}.txt`);
  const out = [];
  for (let i = 0; i < rounds; i += 1) {
    writeFileSync(p, CLEAN_TXT);
    const fd = openSync(p, C.O_RDONLY | C.O_NOFOLLOW);
    const st = fstatSync(fd);
    spawnSync(process.execPath, ['-e', `require('node:fs').appendFileSync(${JSON.stringify(p)}, 'y'.repeat(${1 << 20}))`], { encoding: 'utf8' });
    const text = readFileSync(fd, 'utf8');
    closeSync(fd);
    out.push({ fstatSize: st.size, bytesRead: Buffer.byteLength(text) });
    unlinkSync(p);
  }
  return {
    rounds: out.length,
    fstatSizes: [...new Set(out.map((o) => o.fstatSize))],
    worstBytesRead: out.reduce((a, o) => Math.max(a, o.bytesRead), 0),
    limit: 1048576,
    overLimit: out.filter((o) => o.bytesRead > 1048576).length,
  };
}

const bigBody = `${CLEAN_TXT}${`${'x'.repeat(127)}\n`.repeat(16384)}`;
const results = { N, repo, B, dB, dBW: sha(BODY_W), rounds: ROUNDS, bigBytes: Buffer.byteLength(bigBody) };
results.swapFileBase = race(BASE, 'link', CLEAN_TXT, 'fbase');
results.swapFileCand = race(CAND, 'link', CLEAN_TXT, 'fcand');
results.swapOversizeBase = race(BASE, 'hard', bigBody, 'bbase');
results.swapOversizeCand = race(CAND, 'hard', bigBody, 'bcand');
results.growAfterFstat = growAfterFstat(20);
writeFileSync(join(OUT, 'races.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
