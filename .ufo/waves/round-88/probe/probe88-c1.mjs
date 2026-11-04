#!/usr/bin/env node
/**
 * probe88-c1.mjs — FROZEN scorer for claim C1 of kumitate round 88
 * (`receipt-bind`, contract `kumitate-receipt-bind-v2`).
 *
 *   node .ufo/waves/round-88/probe/probe88-c1.mjs --lane <LANE> --work <SCRATCH> --rev <40-hex> [--tool <candidate>]
 *
 * Scores a candidate `receipt-bind` over TWENTY arms, prints one `ARM` line per arm, then
 * `C88_C1: HELD held=<k>/20` with exit 0 iff every arm holds, else `C88_C1: UNMET` exit 1.
 * `--tool` defaults to `<LANE>/scripts/receipt-bind.mjs`. Fail-closed (exit 2) when --lane or
 * --work is unusable or --rev is not 40 hex.
 *
 * Why v2 (round-87 kill rule, K87Critic `cand-a-worktree` 12/12): no round-87 arm made the
 * worktree differ from the judged revision. Arms `rev-receipt-wins`, `worktree-forgery`,
 * `default-rev`, `rev-receipt-negative` and `untracked-instrument` run against a probe-owned
 * fixture git repository whose commit A, commit B and dirty worktree hold three different
 * instrument bodies, so worktree binding and ignoring a receipt's own `rev=` both fail.
 * Arms `escape-relative`, `symlink-dir`, `oversize` and `duplicate-field` are the round-87
 * sentinel's fail-open items (K87Sentinel 1e, 2a/2d, 4, 3c/3d); each carries a positive
 * sub-run so blanket refusal cannot pass. Arm `sweep` replaces round 87's time-seeded
 * `random-fixture` (K87-V4): it enumerates every `scripts/*.mjs` at --rev in sorted order and
 * flips the digest at index N mod 7, so two runs at one revision pick the same receipt.
 *
 * Fixtures live under <SCRATCH>/probe88/ and are removed before the probe exits. The fixture
 * repository is created with `git init` inside that directory; every git call names `-C <dir>`
 * and the probe verifies `rev-parse --show-toplevel` equals it before the first commit.
 */
import {
  readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, symlinkSync, rmSync, lstatSync, realpathSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const lane = resolve(opt('--lane', '.'));
const workArg = opt('--work', '');
const rev = opt('--rev', '');
const tool = resolve(opt('--tool', join(lane, 'scripts', 'receipt-bind.mjs')));

function failClosed(token, detail) {
  console.log(`C88_C1: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(2);
}
if (!existsSync(lane)) failClosed('LANE_UNREADABLE', lane);
if (!workArg) failClosed('WORK_REQUIRED');
if (!/^[a-f0-9]{40}$/.test(rev)) failClosed('REV_NOT_FULL', rev || 'absent');
const work = resolve(workArg);
mkdirSync(work, { recursive: true });
const fixRoot = join(work, 'probe88');
rmSync(fixRoot, { recursive: true, force: true });
mkdirSync(fixRoot, { recursive: true });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const R86 = join(lane, '.ufo', 'waves', 'round-86', 'close');
const R87 = join(lane, '.ufo', 'waves', 'round-87', 'close');
const GIT_DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
function cleanEnv() {
  const env = { ...process.env, TMPDIR: work, GIT_TERMINAL_PROMPT: '0' };
  for (const k of GIT_DROP) delete env[k];
  return env;
}

function runTool(extra) {
  const r = spawnSync('node', [tool, ...extra], {
    cwd: lane, encoding: 'utf8', timeout: 300000, maxBuffer: 32 << 20, env: cleanEnv(),
  });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}
function bindLine(out) {
  return (out.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
}
function field(line, key) {
  const m = line.match(new RegExp(`(?:^|\\s)${key}=(\\d+)`));
  return m ? Number(m[1]) : NaN;
}
function firstOf(line) {
  const m = line.match(/\sfirst=(\S+)/);
  return m ? m[1] : null;
}
function isClean(r, matched, external) {
  const l = bindLine(r.out);
  return r.status === 0 && /^RECEIPT_BIND: CLEAN /.test(l) && field(l, 'matched') === matched &&
    field(l, 'mismatched') === 0 && field(l, 'unchecked') === 0 &&
    (external === undefined || field(l, 'external') === external);
}
function isDrift(r, matched, mismatched, unchecked) {
  const l = bindLine(r.out);
  return r.status === 1 && /^RECEIPT_BIND: DRIFT /.test(l) && field(l, 'matched') === matched &&
    field(l, 'mismatched') === mismatched && field(l, 'unchecked') === unchecked;
}
function isFail(r, token) {
  return r.status === 2 && new RegExp(`^RECEIPT_BIND: FAIL-CLOSED ${token}(\\s|$)`).test(bindLine(r.out));
}
function laneShow(rel) {
  const g = spawnSync('git', ['-C', lane, 'cat-file', 'blob', `${rev}:${rel}`], { maxBuffer: 64 << 20, env: cleanEnv() });
  return g.status === 0 ? g.stdout : null;
}
function receiptsOf(dir) {
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
}
function mk(name) {
  const d = join(fixRoot, name);
  mkdirSync(d, { recursive: true });
  return d;
}
function receipt({ r, digest, cmd, tail }) {
  return `${r ? `rev=${r}\n` : ''}tool_sha256=${digest}\ncmd=${cmd}\n${tail || 'OK\n'}exit=0\nsignal=none\n`;
}
const arms = [];
function arm(name, ok, detail) { arms.push({ name, ok: !!ok, detail: detail || '' }); }
const brief = (r) => `exit=${r.status} ${bindLine(r.out)}`;

// ---- fixture repository: commit A (body v1), commit B (body v2), dirty worktree (body v3)
const repo = mk('repo');
function fx(args, input) {
  return spawnSync('git', ['-C', repo, '-c', 'user.name=probe88', '-c', 'user.email=probe88@fixture.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args],
  { encoding: 'utf8', env: cleanEnv(), input });
}
const BODY = {
  v1: 'console.log("probe88 instrument v1 at commit A");\n',
  v2: 'console.log("probe88 instrument v2 at commit B");\n',
  v3: 'console.log("probe88 instrument v3 in the dirty worktree");\n',
  fresh: 'console.log("probe88 untracked instrument");\n',
};
let A = null; let B = null; let fixtureOk = false;
{
  const init = fx(['init', '-q']);
  const top = fx(['rev-parse', '--show-toplevel']);
  if (init.status === 0 && top.status === 0 && realpathSync(top.stdout.trim()) === realpathSync(repo)) {
    mkdirSync(join(repo, 'scripts'), { recursive: true });
    writeFileSync(join(repo, 'scripts', 'tool.mjs'), BODY.v1);
    fx(['add', 'scripts/tool.mjs']);
    fx(['commit', '-q', '-m', 'A']);
    A = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', 'tool.mjs'), BODY.v2);
    fx(['add', 'scripts/tool.mjs']);
    fx(['commit', '-q', '-m', 'B']);
    B = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', 'tool.mjs'), BODY.v3);
    writeFileSync(join(repo, 'scripts', 'fresh.mjs'), BODY.fresh);
    fixtureOk = /^[a-f0-9]{40}$/.test(A || '') && /^[a-f0-9]{40}$/.test(B || '') && A !== B;
  }
}
const inRepo = (d, r) => runTool(['--lane', repo, '--dir', d, '--rev', r]);
const TOOL_CMD = 'node scripts/tool.mjs --run';

// A1 — bare invocation is a usage error.
{
  const r = runTool([]);
  arm('usage', r.status === 64 && /USAGE/.test(r.out), `exit=${r.status}`);
}
// A2 — the tool's own hermetic selftest.
{
  const r = runTool(['--selftest', '--work', mk('selftest-work')]);
  arm('selftest', r.status === 0 && /RECEIPT_BIND_SELFTEST: PASS/.test(r.out),
    `exit=${r.status} ${(r.out.match(/RECEIPT_BIND_SELFTEST: .*/) || [''])[0]}`);
}
// A3 — the committed round-86 receipts: 9 of 10 misname their subject.
{
  const r = runTool(['--dir', R86, '--rev', rev]);
  arm('detect-r86', isDrift(r, 1, 9, 0), brief(r));
}
// A4 — the same round-86 bytes under new file names in a new directory (no path/name key survives).
{
  const d = mk('r86-renamed');
  const files = receiptsOf(R86) || [];
  files.forEach((f, i) => writeFileSync(join(d, `q${String(files.length - i).padStart(2, '0')}-${i}.txt`), readFileSync(join(R86, f))));
  const r = runTool(['--dir', d, '--rev', rev]);
  arm('detect-r86-renamed', files.length === 10 && isDrift(r, 1, 9, 0), `files=${files.length} ${brief(r)}`);
}
// A5 — the round-87 close receipts (minus the one external-instrument receipt) bind clean.
{
  const d = mk('r87-lane');
  let n = 0;
  for (const f of receiptsOf(R87) || []) {
    if (f === 'census.txt') continue;
    writeFileSync(join(d, f), readFileSync(join(R87, f)));
    n += 1;
  }
  const r = runTool(['--dir', d, '--rev', rev]);
  arm('clean-r87', n === 11 && isClean(r, 11, 0), `copied=${n} ${brief(r)}`);
}
// A6 — a receipt with no cmd= is unchecked, never clean.
{
  const d = mk('unchecked');
  writeFileSync(join(d, 'u.txt'), `rev=${B}\ntool_sha256=${sha(BODY.v2)}\nexit=0\nsignal=none\n`);
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('unchecked', fixtureOk && isDrift(r, 0, 0, 1), brief(r));
}
// A7 — an instrument the revision does not carry is fail-closed.
{
  const d = mk('unresolved');
  writeFileSync(join(d, 'u.txt'), receipt({ r: B, digest: sha(BODY.v2), cmd: 'node scripts/absent-88.mjs' }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('unresolved', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A8 — a missing receipt directory is fail-closed.
{
  const r = runTool(['--dir', join(fixRoot, 'absent-88-dir'), '--rev', rev]);
  arm('dir-missing', isFail(r, 'DIR_UNREADABLE'), brief(r));
}
// A9 — an unresolvable default revision is fail-closed.
{
  const d = mk('rev-bad');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.v2), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, 'f'.repeat(40)) : { status: -1, out: '' };
  arm('rev-bad', fixtureOk && isFail(r, 'REV_UNRESOLVED'), brief(r));
}
// A10 — a symlinked receipt is not a receipt.
{
  const d = mk('symlink-receipt');
  writeFileSync(join(d, 'b.txt'), receipt({ r: B, digest: sha(BODY.v2), cmd: TOOL_CMD }));
  symlinkSync(join(d, 'b.txt'), join(d, 'a.txt'));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('symlink-receipt', fixtureOk && isFail(r, 'SYMLINK_RECEIPT'), brief(r));
}
// A11 — a receipt's own rev= wins over --rev: digest of A's bytes, rev=A, --rev B → clean.
{
  const d = mk('rev-receipt-wins');
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.v1), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('rev-receipt-wins', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A12 — a receipt that binds the dirty worktree bytes is a mismatch at the judged revision.
{
  const d = mk('worktree-forgery');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.v3), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('worktree-forgery', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A13 — no rev= in the receipt: the default --rev's bytes bind, although the worktree differs.
{
  const d = mk('default-rev');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.v2), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('default-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A14 — rev=A with B's digest is a mismatch: a tool that ignores the receipt's rev= reads clean.
{
  const d = mk('rev-receipt-negative');
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.v2), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('rev-receipt-negative', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A15 — an instrument that exists only in the worktree is absent at the revision.
{
  const d = mk('untracked-instrument');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: 'node scripts/fresh.mjs' }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('untracked-instrument', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A16 — a RELATIVE cmd= token that resolves outside the lane is fail-closed ESCAPES_LANE;
//        the same file named by an ABSOLUTE path stays a counted external instrument.
{
  const outside = mk('outside');
  writeFileSync(join(outside, 'ext.mjs'), BODY.fresh);
  const d1 = mk('escape-relative');
  writeFileSync(join(d1, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: 'node ../outside/ext.mjs' }));
  const d2 = mk('escape-absolute');
  writeFileSync(join(d2, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: `node ${join(outside, 'ext.mjs')}` }));
  const r1 = fixtureOk ? inRepo(d1, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(d2, B) : { status: -1, out: '' };
  arm('escape-relative', fixtureOk && isFail(r1, 'ESCAPES_LANE') && isClean(r2, 1, 1),
    `relative ${brief(r1)} | absolute ${brief(r2)}`);
}
// A17 — a receipt DIRECTORY that is a symlink is fail-closed SYMLINK_DIR; its real target binds.
{
  const real = mk('real-dir');
  writeFileSync(join(real, 'r.txt'), receipt({ r: B, digest: sha(BODY.v2), cmd: TOOL_CMD }));
  const link = join(fixRoot, 'link-dir');
  symlinkSync(real, link);
  const r1 = fixtureOk ? inRepo(link, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(real, B) : { status: -1, out: '' };
  arm('symlink-dir', fixtureOk && lstatSync(link).isSymbolicLink() && isFail(r1, 'SYMLINK_DIR') && isClean(r2, 1, 0),
    `link ${brief(r1)} | real ${brief(r2)}`);
}
// A18 — a receipt larger than 1 MiB (1048576 bytes) is fail-closed RECEIPT_TOO_LARGE; a 512 KiB one binds.
{
  const big = mk('oversize');
  const head = receipt({ r: B, digest: sha(BODY.v2), cmd: TOOL_CMD });
  writeFileSync(join(big, 'r.txt'), head + `${'x'.repeat(127)}\n`.repeat(16384));
  const ok = mk('undersize');
  writeFileSync(join(ok, 'r.txt'), head + `${'x'.repeat(127)}\n`.repeat(4096));
  const r1 = fixtureOk ? inRepo(big, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(ok, B) : { status: -1, out: '' };
  arm('oversize', fixtureOk && isFail(r1, 'RECEIPT_TOO_LARGE') && isClean(r2, 1, 0),
    `2MiB ${brief(r1)} | 512KiB ${brief(r2)}`);
}
// A19 — a duplicated cmd=, tool_sha256= or rev= line (equal values included) is fail-closed AMBIGUOUS_FIELD.
{
  const base = receipt({ r: B, digest: sha(BODY.v2), cmd: TOOL_CMD });
  const variants = {
    'dup-cmd': base.replace(/^cmd=.*$/m, `cmd=${TOOL_CMD}\ncmd=node scripts/other.mjs`),
    'dup-cmd-equal': base.replace(/^cmd=.*$/m, `cmd=${TOOL_CMD}\ncmd=${TOOL_CMD}`),
    'dup-digest': base.replace(/^tool_sha256=.*$/m, `tool_sha256=${sha(BODY.v2)}\ntool_sha256=${'2'.repeat(64)}`),
    'dup-rev': base.replace(/^rev=.*$/m, `rev=${B}\nrev=${A}`),
  };
  const res = {};
  let all = fixtureOk;
  for (const [k, body] of Object.entries(variants)) {
    const d = mk(k);
    writeFileSync(join(d, 'r.txt'), body);
    const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
    res[k] = r;
    all = all && isFail(r, 'AMBIGUOUS_FIELD');
  }
  const d0 = mk('dup-none');
  writeFileSync(join(d0, 'r.txt'), base);
  const r0 = fixtureOk ? inRepo(d0, B) : { status: -1, out: '' };
  arm('duplicate-field', all && isClean(r0, 1, 0),
    `${Object.entries(res).map(([k, r]) => `${k} ${brief(r)}`).join(' | ')} | single ${brief(r0)}`);
}
// A20 — deterministic sweep over every scripts/*.mjs at --rev, then one flipped digest at index N mod 7.
{
  const ls = spawnSync('git', ['-C', lane, 'ls-tree', '--name-only', `${rev}:scripts`], { encoding: 'utf8', env: cleanEnv() });
  const names = ls.status === 0 ? ls.stdout.split('\n').filter((f) => f.endsWith('.mjs')).sort() : [];
  const d = mk('sweep');
  let built = 0;
  for (const f of names) {
    const bytes = laneShow(`scripts/${f}`);
    if (!bytes) continue;
    writeFileSync(join(d, `s-${f}.txt`), receipt({ r: rev, digest: sha(bytes), cmd: `node scripts/${f} --help` }));
    built += 1;
  }
  const a = runTool(['--dir', d, '--rev', rev]);
  let ok = names.length >= 10 && built === names.length && isClean(a, built, 0);
  let detail = `scripts=${names.length} clean ${brief(a)}`;
  if (names.length) {
    const k = names.length % 7;
    const target = `s-${names[k]}.txt`;
    const p = join(d, target);
    writeFileSync(p, readFileSync(p, 'utf8').replace(/^tool_sha256=.*$/m, `tool_sha256=${'3'.repeat(64)}`));
    const b = runTool(['--dir', d, '--rev', rev]);
    ok = ok && isDrift(b, built - 1, 1, 0) && firstOf(bindLine(b.out)) === target;
    detail += ` | flip=${target} ${brief(b)}`;
  }
  arm('sweep', ok, detail);
}

const held = arms.filter((a) => a.ok).length;
for (const a of arms) console.log(`ARM ${a.name}: ${a.ok ? 'PASS' : 'FAIL'} ${a.detail}`);
rmSync(fixRoot, { recursive: true, force: true });
console.log(`C88_C1: ${held === arms.length ? 'HELD' : 'UNMET'} held=${held}/${arms.length}`);
process.exit(held === arms.length ? 0 : 1);
