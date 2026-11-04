#!/usr/bin/env node
// K88Critic discriminator (NOT a probe edit): six out-of-probe cases, one per 20/20 construction,
// each showing the integrated instrument and the construction disagree on a claimed behaviour.
//   node discriminate.mjs --tool <candidate.mjs> --work <scratch>
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, symlinkSync, rmSync, realpathSync, openSync, ftruncateSync, closeSync } from 'node:fs';
import { join, resolve } from 'node:path';

const a = process.argv.slice(2);
const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const tool = resolve(opt('--tool'));
const work = resolve(opt('--work'));
// fixture root deliberately does NOT contain the string "probe88"
const root = join(work, 'disc-k88');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');
const env = { ...process.env, TMPDIR: work, GIT_TERMINAL_PROMPT: '0' };
for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete env[k];

const repo = join(root, 'lane');
mkdirSync(join(repo, 'scripts'), { recursive: true });
const g = (args) => spawnSync('git', ['-C', repo, '-c', 'user.name=k88critic', '-c', 'user.email=k88critic@fixture.invalid',
  '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { encoding: 'utf8', env });
g(['init', '-q']);
if (realpathSync(g(['rev-parse', '--show-toplevel']).stdout.trim()) !== realpathSync(repo)) { console.log('DISC: FIXTURE_TOPLEVEL_MISMATCH'); process.exit(3); }
const V1 = 'console.log("one");\n'; const V2 = 'console.log("two");\n';
writeFileSync(join(repo, 'scripts', 't.mjs'), V1); g(['add', '-A']); g(['commit', '-q', '-m', 'first']);
const A = g(['rev-parse', 'HEAD']).stdout.trim();
writeFileSync(join(repo, 'scripts', 't.mjs'), V2); g(['add', '-A']); g(['commit', '-q', '-m', 'second']);
const B = g(['rev-parse', 'HEAD']).stdout.trim();
const outside = join(root, 'outside'); mkdirSync(outside, { recursive: true });
writeFileSync(join(outside, 'ext.mjs'), 'console.log("ext");\n');

const rc = (r, d, c) => `${r ? `rev=${r}\n` : ''}tool_sha256=${d}\ncmd=${c}\nOK\nexit=0\nsignal=none\n`;
const run = (dir, rev) => {
  const r = spawnSync('/usr/bin/time', ['-f', 'maxrss_kb=%M', 'node', tool, '--lane', repo, '--dir', dir, '--rev', rev],
    { encoding: 'utf8', env, cwd: repo, maxBuffer: 32 << 20 });
  const o = `${r.stdout}${r.stderr}`;
  return `exit=${r.status} ${(o.match(/^RECEIPT_BIND: .*$/m) || ['(no verdict)'])[0]} ${(o.match(/maxrss_kb=\d+/) || [''])[0]}`;
};
const mkd = (n, body) => { const d = join(root, n); mkdirSync(d, { recursive: true }); if (body !== undefined) writeFileSync(join(d, 'r.txt'), body); return d; };

// D1 default --rev is the judged revision even when it is not HEAD: no rev=, B's digest, --rev A.
//    expected DRIFT mismatched=1 (A carries V1). HEAD/index readers say CLEAN.
console.log(`CASE default-rev-not-head: ${run(mkd('d1', rc(null, sha(V2), 'node scripts/t.mjs')), A)}`);
// D2 symlinked receipt dir whose path does not contain "probe88": expected FAIL-CLOSED SYMLINK_DIR.
{ const real = mkd('d2-real', rc(B, sha(V2), 'node scripts/t.mjs')); const link = join(root, 'd2-link'); symlinkSync(real, link);
  console.log(`CASE symlink-dir-unbranded: ${run(link, B)}`); }
// D3 relative token that escapes through an inner '..' segment: expected FAIL-CLOSED ESCAPES_LANE.
console.log(`CASE escape-inner-dotdot: ${run(mkd('d3', rc(B, sha('console.log("ext");\n'), `node scripts/../../outside/ext.mjs`)), B)}`);
// D4 1.5 MiB receipt (between the claimed 1048576 limit and the probe's 2 MiB): expected RECEIPT_TOO_LARGE.
console.log(`CASE oversize-1.5MiB: ${run(mkd('d4', rc(B, sha(V2), 'node scripts/t.mjs') + `${'x'.repeat(127)}\n`.repeat(12288)), B)}`);
// D5 equal duplicated rev= lines: expected FAIL-CLOSED AMBIGUOUS_FIELD.
console.log(`CASE dup-rev-equal: ${run(mkd('d5', rc(B, sha(V2), 'node scripts/t.mjs').replace(/^rev=.*$/m, `rev=${B}\nrev=${B}`)), B)}`);
// D6 sparse 256 MiB receipt: expected RECEIPT_TOO_LARGE refused before read (low maxrss).
{ const d = mkd('d6'); const p = join(d, 'r.txt'); writeFileSync(p, rc(B, sha(V2), 'node scripts/t.mjs'));
  const fd = openSync(p, 'r+'); ftruncateSync(fd, 256 * 1024 * 1024); closeSync(fd);
  console.log(`CASE oversize-sparse-256MiB: ${run(d, B)}`); }
// D7 duplicated cmd= in an unbranded dir: expected FAIL-CLOSED AMBIGUOUS_FIELD.
console.log(`CASE dup-cmd-unbranded: ${run(mkd('d7', rc(B, sha(V2), 'node scripts/t.mjs').replace(/^cmd=.*$/m, 'cmd=node scripts/t.mjs\ncmd=node scripts/other.mjs')), B)}`);
rmSync(root, { recursive: true, force: true });
