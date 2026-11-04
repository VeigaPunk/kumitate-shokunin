#!/usr/bin/env node
// K88Mutation seat-constructed boundary battery (NOT the frozen probe; evidence for which case
// would kill each probe+selftest survivor). Expected verdicts are the v2 contract as written in
// receipt-bind.mjs's header: RECEIPT_TOO_LARGE iff size > 1048576 bytes, refused before read;
// SYMLINK_DIR when --dir is a symlink (dangling included); a receipt rev= that is not a commit
// is REV_UNRESOLVED.
//   node boundary-battery.mjs --tool <candidate.mjs> --work <scratch>
import { mkdirSync, writeFileSync, symlinkSync, rmSync, openSync, ftruncateSync, closeSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const opt = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const tool = resolve(opt('--tool'));
const work = resolve(opt('--work'));
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');
const env = { ...process.env, TMPDIR: work, GIT_TERMINAL_PROMPT: '0' };
for (const k of Object.keys(env)) if (k.startsWith('GIT_') && k !== 'GIT_TERMINAL_PROMPT') delete env[k];

const repo = join(work, 'repo');
mkdirSync(join(repo, 'scripts'), { recursive: true });
const fx = (a) => spawnSync('git', ['-C', repo, '-c', 'user.name=k88mut', '-c', 'user.email=k88mut@fixture.invalid',
  '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...a], { encoding: 'utf8', env });
fx(['init', '-q']);
if (realpathSync(fx(['rev-parse', '--show-toplevel']).stdout.trim()) !== realpathSync(repo)) { console.log('BATTERY: FIXTURE_TOPLEVEL_MISMATCH'); process.exit(2); }
const BODY = 'console.log("k88 mutation fixture");\n';
writeFileSync(join(repo, 'scripts', 'tool.mjs'), BODY);
fx(['add', 'scripts/tool.mjs']); fx(['commit', '-q', '-m', 'B']);
const B = fx(['rev-parse', 'HEAD']).stdout.trim();
const head = `rev=${B}\ntool_sha256=${sha(BODY)}\ncmd=node scripts/tool.mjs --run\n`;
const tail = 'exit=0\nsignal=none\n';
const sized = (n, fill = 'x') => {
  const pad = n - Buffer.byteLength(head + tail);
  const unit = Buffer.byteLength(fill);
  const lines = [];
  let left = pad;
  while (left > 0) { const k = Math.min(left - 1, 127 * unit); const c = Math.floor(k / unit); lines.push(fill.repeat(c) + 'x'.repeat(k - c * unit) + '\n'); left -= k + 1; }
  const s = head + lines.join('') + tail;
  if (Buffer.byteLength(s) !== n) throw new Error(`sized ${n} got ${Buffer.byteLength(s)}`);
  return s;
};
const run = (dir) => {
  const r = spawnSync('node', [tool, '--lane', repo, '--dir', dir, '--rev', B], { encoding: 'utf8', env, cwd: repo, maxBuffer: 32 << 20 });
  return { status: r.status, line: ((r.stdout || '') + (r.stderr || '')).match(/^RECEIPT_BIND: .*$/m)?.[0] || '' };
};
const cases = [];
const mk = (name) => { const d = join(work, name); mkdirSync(d, { recursive: true }); return d; };
const check = (name, dir, want) => {
  const r = run(dir);
  const ok = want === 'CLEAN' ? (r.status === 0 && /^RECEIPT_BIND: CLEAN matched=1 /.test(r.line))
    : (r.status === 2 && new RegExp(`^RECEIPT_BIND: FAIL-CLOSED ${want}(\\s|$)`).test(r.line));
  cases.push({ name, want, ok, got: `exit=${r.status} ${r.line.slice(0, 160)}` });
};
for (const [n, want] of [[1048575, 'CLEAN'], [1048576, 'CLEAN'], [1048577, 'RECEIPT_TOO_LARGE'], [1572864, 'RECEIPT_TOO_LARGE'], [2097152, 'RECEIPT_TOO_LARGE']]) {
  const d = mk(`size-${n}`); writeFileSync(join(d, 'r.txt'), sized(n)); check(`size-${n}`, d, want);
}
{ // 1.5 MB of 3-byte UTF-8 chars: bytes over the limit, UTF-16 length well under it.
  const d = mk('size-multibyte-1572864'); writeFileSync(join(d, 'r.txt'), sized(1572864, '\u20ac')); check('size-multibyte-1572864', d, 'RECEIPT_TOO_LARGE');
}
{ // sparse 3 GiB receipt: refused before read must say RECEIPT_TOO_LARGE, never a read failure.
  const d = mk('size-sparse-3GiB'); const p = join(d, 'r.txt'); writeFileSync(p, head);
  const fd = openSync(p, 'r+'); ftruncateSync(fd, 3 * 1024 ** 3); closeSync(fd); check('size-sparse-3GiB', d, 'RECEIPT_TOO_LARGE');
}
{ // a dangling --dir symlink is still a symlinked --dir.
  const l = join(work, 'dangling-link'); symlinkSync(join(work, 'nowhere'), l); check('symlink-dir-dangling', l, 'SYMLINK_DIR');
}
{ // a receipt rev= that is 40-hex but not a commit in the lane.
  const d = mk('receipt-rev-unknown'); writeFileSync(join(d, 'r.txt'), head.replace(`rev=${B}`, `rev=${'e'.repeat(40)}`) + tail); check('receipt-rev-unknown', d, 'REV_UNRESOLVED');
}
const held = cases.filter((c) => c.ok).length;
for (const c of cases) console.log(`CASE ${c.name}: ${c.ok ? 'PASS' : 'FAIL'} want=${c.want} ${c.got}`);
rmSync(work, { recursive: true, force: true });
console.log(`BATTERY: ${held === cases.length ? 'PASS' : 'FAIL'} held=${held}/${cases.length}`);
process.exit(held === cases.length ? 0 : 1);
