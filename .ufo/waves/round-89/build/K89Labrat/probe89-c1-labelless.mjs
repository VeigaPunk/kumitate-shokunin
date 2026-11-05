#!/usr/bin/env node
/**
 * probe89-c1.mjs — FROZEN scorer for claim C1 of kumitate round 89
 * (`receipt-bind`, contract `kumitate-receipt-bind-v3`).
 *
 *   node .ufo/waves/round-89/probe/probe89-c1.mjs --lane <LANE> --work <SCRATCH> --rev <40-hex> [--tool <candidate>]
 *
 * Scores a candidate `receipt-bind` over THIRTY arms, prints one `ARM` line per arm, then
 * `C89_C1: HELD held=<k>/30` with exit 0 iff every arm holds, else `C89_C1: UNMET` exit 1.
 * `--tool` defaults to `<LANE>/scripts/receipt-bind.mjs`. Fail-closed (exit 2) when --lane or
 * --work is unusable or --rev is not 40 hex.
 *
 * Why v3 (round-88 kill rule: nine seat constructions reached 20/20 on probe88-c1, each skipping
 * a claimed behaviour the scorer's fixtures could not see). Every fixture is drawn at run time
 * from a nonce — body bytes, directory names, commit messages, the outside directory name — so no
 * construction can key on a path (`/probe88/`), on public body constants, or on a commit count.
 * The fixture repository holds THREE commits (A, B, C=HEAD), a staged body that differs from both
 * HEAD and the worktree, a dirty worktree, an untracked instrument and a committed symlink
 * instrument, so revision binding is visible against HEAD, against the index and against the
 * worktree on distinct arms:
 *   A21 default-rev-not-head   no rev=, judged at A, HEAD=C          (kills HEAD-default)
 *   A22 index-not-judged       no rev=, judged at B, index=bodyS     (kills index-default)
 *   A23 abs-in-lane-at-rev     absolute in-lane token, dirty worktree (kills disk-hashing)
 *   A24 limit-edge             1048576 binds, 1048577 refuses       (kills a loose limit)
 *   A25 limit-before-read      sparse 1 GiB under a 256 MiB address-space cap
 *   A26 escape-inner-dotdot    `scripts/../../<outside>/ext.mjs`    (kills a textual escape check)
 *   A27 dup-equal-field        equal-valued duplicate rev=/tool_sha256=
 *   A28 alias-proc-root        in-lane instrument named via /proc/self/root (realpath membership)
 *   A29 bom-rev                UTF-8 BOM before rev= (BOM must not hide the receipt's rev)
 *   A30 symlink-instrument     committed mode-120000 instrument is fail-closed
 * A30's token `SYMLINK_INSTRUMENT` and A28/A29's verdicts are the v3 contract additions.
 *
 * Fixtures live under <SCRATCH>/p89-<nonce>/ and are removed before the probe exits. The fixture
 * repository is created with `git init` inside that directory; every git call names `-C <dir>` and
 * the probe verifies `rev-parse --show-toplevel` equals it before the first commit.
 */
import {
  readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, symlinkSync, rmSync, lstatSync,
  realpathSync, truncateSync, chmodSync,
} from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve, basename } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const lane = resolve(opt('--lane', '.'));
const workArg = opt('--work', '');
const rev = opt('--rev', '');
const tool = resolve(opt('--tool', join(lane, 'scripts', 'receipt-bind.mjs')));
const NONCE = randomBytes(6).toString('hex');

function failClosed(token, detail) {
  console.log(`C89_C1: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(2);
}
if (!existsSync(lane)) failClosed('LANE_UNREADABLE', lane);
if (!workArg) failClosed('WORK_REQUIRED');
if (!/^[a-f0-9]{40}$/.test(rev)) failClosed('REV_NOT_FULL', rev || 'absent');
const work = resolve(workArg);
mkdirSync(work, { recursive: true });
const fixRoot = join(work, `p89-${NONCE}`);
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
function isDrift(r, matched, mismatched, unchecked, external) {
  const l = bindLine(r.out);
  return r.status === 1 && /^RECEIPT_BIND: DRIFT /.test(l) && field(l, 'matched') === matched &&
    field(l, 'mismatched') === mismatched && field(l, 'unchecked') === unchecked &&
    (external === undefined || field(l, 'external') === external);
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
function mk() {
  const d = join(fixRoot, randomBytes(6).toString('hex'));
  mkdirSync(d, { recursive: true });
  return d;
}
function receipt({ r, digest, cmd, tail }) {
  return `${r ? `rev=${r}\n` : ''}tool_sha256=${digest}\ncmd=${cmd}\n${tail || `OK ${NONCE}\n`}exit=0\nsignal=none\n`;
}
const arms = [];
function arm(name, ok, detail) { arms.push({ name, ok: !!ok, detail: detail || '' }); }
const brief = (r) => `exit=${r.status} ${bindLine(r.out)}`;

// ---- fixture repository, drawn at run time: three commits, a staged body, a dirty worktree,
//      an untracked instrument and a committed symlink instrument.
const repo = mk('repo');
function fx(args, input) {
  return spawnSync('git', ['-C', repo, '-c', `user.name=p89${NONCE}`, '-c', `user.email=p89${NONCE}@fixture.invalid`,
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args],
  { encoding: 'utf8', env: cleanEnv(), input });
}
const BODY = {
  A: `console.log("instrument ${NONCE} body A");\n`,
  B: `console.log("instrument ${NONCE} body B");\n`,
  C: `console.log("instrument ${NONCE} body C (HEAD)");\n`,
  S: `console.log("instrument ${NONCE} body S (staged index)");\n`,
  W: `console.log("instrument ${NONCE} body W (dirty worktree)");\n`,
  fresh: `console.log("instrument ${NONCE} untracked");\n`,
};
const LINK_TARGET = `tool-${NONCE}.mjs`;
const TOOL_CMD = `node scripts/tool-${NONCE}.mjs --run`;
let A = null; let B = null; let C = null; let fixtureOk = false;
{
  const init = fx(['init', '-q']);
  const top = fx(['rev-parse', '--show-toplevel']);
  if (init.status === 0 && top.status === 0 && realpathSync(top.stdout.trim()) === realpathSync(repo)) {
    mkdirSync(join(repo, 'scripts'), { recursive: true });
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.A);
    fx(['add', `scripts/${LINK_TARGET}`]);
    fx(['commit', '-q', '-m', `A ${NONCE}`]);
    A = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.B);
    fx(['add', `scripts/${LINK_TARGET}`]);
    fx(['commit', '-q', '-m', `B ${NONCE}`]);
    B = fx(['rev-parse', 'HEAD']).stdout.trim();
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.C);
    fx(['add', `scripts/${LINK_TARGET}`]);
    fx(['commit', '-q', '-m', `C ${NONCE}`]);
    C = fx(['rev-parse', 'HEAD']).stdout.trim();
    // committed symlink instrument at every revision (mode 120000), target drawn at run time
    fx(['add', `scripts/${LINK_TARGET}`]);
    symlinkSync(LINK_TARGET, join(repo, 'scripts', `link-${NONCE}.mjs`));
    fx(['add', `scripts/link-${NONCE}.mjs`]);
    fx(['commit', '-q', '-m', `D ${NONCE}`]);
    C = fx(['rev-parse', 'HEAD']).stdout.trim();
    // staged body S in the index (differs from HEAD and from the worktree), then a dirty worktree
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.S);
    fx(['add', `scripts/${LINK_TARGET}`]);
    writeFileSync(join(repo, 'scripts', LINK_TARGET), BODY.W);
    writeFileSync(join(repo, 'scripts', `fresh-${NONCE}.mjs`), BODY.fresh);
    fixtureOk = /^[a-f0-9]{40}$/.test(A || '') && /^[a-f0-9]{40}$/.test(B || '') &&
      /^[a-f0-9]{40}$/.test(C || '') && A !== B && B !== C;
  }
}
const inRepo = (d, r) => runTool(['--lane', repo, '--dir', d, '--rev', r]);

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
  writeFileSync(join(d, 'u.txt'), `rev=${B}\ntool_sha256=${sha(BODY.B)}\nexit=0\nsignal=none\n`);
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('unchecked', fixtureOk && isDrift(r, 0, 0, 1), brief(r));
}
// A7 — an instrument the revision does not carry is fail-closed.
{
  const d = mk('unresolved');
  writeFileSync(join(d, 'u.txt'), receipt({ r: B, digest: sha(BODY.B), cmd: `node scripts/absent-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('unresolved', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A8 — a missing receipt directory is fail-closed.
{
  const r = runTool(['--dir', join(fixRoot, `absent-${randomBytes(6).toString('hex')}-dir`), '--rev', rev]);
  arm('dir-missing', isFail(r, 'DIR_UNREADABLE'), brief(r));
}
// A9 — an unresolvable default revision is fail-closed.
{
  const d = mk('rev-bad');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, 'f'.repeat(40)) : { status: -1, out: '' };
  arm('rev-bad', fixtureOk && isFail(r, 'REV_UNRESOLVED'), brief(r));
}
// A10 — a symlinked receipt is not a receipt.
{
  const d = mk('symlink-receipt');
  writeFileSync(join(d, 'b.txt'), receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  symlinkSync(join(d, 'b.txt'), join(d, 'a.txt'));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('symlink-receipt', fixtureOk && isFail(r, 'SYMLINK_RECEIPT'), brief(r));
}
// A11 — a receipt's own rev= wins over --rev: digest of A's bytes, rev=A, --rev C → clean.
{
  const d = mk('rev-receipt-wins');
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.A), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('rev-receipt-wins', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A12 — a receipt that binds the dirty worktree bytes is a mismatch at the judged revision.
{
  const d = mk('worktree-forgery');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.W), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('worktree-forgery', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A13 — no rev= in the receipt: the default --rev's bytes bind (B is neither HEAD nor the index).
{
  const d = mk('default-rev');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('default-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A14 — rev=A with B's digest is a mismatch: a tool that ignores the receipt's rev= reads clean.
{
  const d = mk('rev-receipt-negative');
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('rev-receipt-negative', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A15 — an instrument that exists only in the worktree is absent at the revision.
{
  const d = mk('untracked-instrument');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: `node scripts/fresh-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('untracked-instrument', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A16 — a RELATIVE cmd= token that resolves outside the lane is fail-closed ESCAPES_LANE;
//        the same file named by an ABSOLUTE path stays a counted external instrument.
{
  const outside = mk('outside');
  writeFileSync(join(outside, `ext-${NONCE}.mjs`), BODY.fresh);
  const d1 = mk('escape-relative');
  writeFileSync(join(d1, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: `node ../${basename(outside)}/ext-${NONCE}.mjs` }));
  const d2 = mk('escape-absolute');
  writeFileSync(join(d2, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: `node ${join(outside, `ext-${NONCE}.mjs`)}` }));
  const r1 = fixtureOk ? inRepo(d1, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(d2, B) : { status: -1, out: '' };
  arm('escape-relative', fixtureOk && isFail(r1, 'ESCAPES_LANE') && isClean(r2, 1, 1),
    `relative ${brief(r1)} | absolute ${brief(r2)}`);
}
// A17 — a receipt DIRECTORY that is a symlink is fail-closed SYMLINK_DIR; its real target binds.
{
  const real = mk('real-dir');
  writeFileSync(join(real, 'r.txt'), receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  const link = join(fixRoot, randomBytes(6).toString('hex'));
  symlinkSync(real, link);
  const r1 = fixtureOk ? inRepo(link, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(real, B) : { status: -1, out: '' };
  arm('symlink-dir', fixtureOk && lstatSync(link).isSymbolicLink() && isFail(r1, 'SYMLINK_DIR') && isClean(r2, 1, 0),
    `link ${brief(r1)} | real ${brief(r2)}`);
}
// A18 — a receipt larger than 1 MiB is fail-closed RECEIPT_TOO_LARGE; a 512 KiB one binds.
{
  const big = mk('oversize');
  const head = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  writeFileSync(join(big, 'r.txt'), head + `${'x'.repeat(127)}\n`.repeat(16384));
  const ok = mk('undersize');
  writeFileSync(join(ok, 'r.txt'), head + `${'x'.repeat(127)}\n`.repeat(4096));
  const r1 = fixtureOk ? inRepo(big, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(ok, B) : { status: -1, out: '' };
  arm('oversize', fixtureOk && isFail(r1, 'RECEIPT_TOO_LARGE') && isClean(r2, 1, 0),
    `2MiB ${brief(r1)} | 512KiB ${brief(r2)}`);
}
// A19 — a duplicated cmd=, tool_sha256= or rev= line (different values) is fail-closed AMBIGUOUS_FIELD.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const variants = {
    'dup-cmd': base.replace(/^cmd=.*$/m, `cmd=${TOOL_CMD}\ncmd=node scripts/other-${NONCE}.mjs`),
    'dup-cmd-equal': base.replace(/^cmd=.*$/m, `cmd=${TOOL_CMD}\ncmd=${TOOL_CMD}`),
    'dup-digest': base.replace(/^tool_sha256=.*$/m, `tool_sha256=${sha(BODY.B)}\ntool_sha256=${'2'.repeat(64)}`),
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
// A21 — no rev=, judged at A while HEAD is C: the JUDGED revision binds, never HEAD.
{
  const d = mk('default-rev-not-head');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.A), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('default-rev-not-head', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A22 — no rev=, judged at B while the index holds body S and HEAD holds C: the index is not a revision.
{
  const d = mk('index-not-judged');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('index-not-judged', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A23 — an ABSOLUTE in-lane token before a dirty worktree binds at the judged revision.
{
  const d = mk('abs-in-lane-at-rev');
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.A), cmd: `node ${join(repo, 'scripts', LINK_TARGET)}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('abs-in-lane-at-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A24 — the limit edge from both sides: exactly 1048576 binds, 1048577 is RECEIPT_TOO_LARGE.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const atLimit = mk('limit-edge-ok');
  const overLimit = mk('limit-edge-over');
  const padTo = (n) => base + `#${'p'.repeat(Math.max(0, n - base.length - 2))}\n`;
  writeFileSync(join(atLimit, 'r.txt'), padTo(1048576));
  writeFileSync(join(overLimit, 'r.txt'), padTo(1048577));
  const s1 = lstatSync(join(atLimit, 'r.txt')).size;
  const s2 = lstatSync(join(overLimit, 'r.txt')).size;
  const r1 = fixtureOk ? inRepo(atLimit, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(overLimit, B) : { status: -1, out: '' };
  arm('limit-edge', fixtureOk && s1 === 1048576 && s2 === 1048577 && isClean(r1, 1, 0) && isFail(r2, 'RECEIPT_TOO_LARGE'),
    `edge ${s1} ${brief(r1)} | over ${s2} ${brief(r2)}`);
}
// A25 — a 1 GiB sparse receipt with no read permission: the size is judged BEFORE the read, so the
//        verdict is RECEIPT_TOO_LARGE (an implementation that reads first reports RECEIPT_UNREADABLE).
{
  const d = mk('limit-before-read');
  const p = join(d, 'r.txt');
  writeFileSync(p, receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  truncateSync(p, 1 << 30);
  chmodSync(p, 0o000);
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  chmodSync(p, 0o600);
  arm('limit-before-read', fixtureOk && isFail(r, 'RECEIPT_TOO_LARGE'), `size=${1 << 30} ${brief(r)}`);
}
// A26 — a relative token with an interior `..` that still escapes is ESCAPES_LANE by resolution.
{
  const outside = mk('outside2');
  writeFileSync(join(outside, `ext2-${NONCE}.mjs`), BODY.fresh);
  const d = mk('escape-inner-dotdot');
  writeFileSync(join(d, 'r.txt'), receipt({ digest: sha(BODY.fresh), cmd: `node scripts/../../${basename(outside)}/ext2-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('escape-inner-dotdot', fixtureOk && isFail(r, 'ESCAPES_LANE'), brief(r));
}
// A27 — EQUAL-valued duplicate rev= / tool_sha256= lines are AMBIGUOUS_FIELD too.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const v = {
    'dup-rev-equal': base.replace(/^rev=.*$/m, `rev=${B}\nrev=${B}`),
    'dup-digest-equal': base.replace(/^tool_sha256=.*$/m, `tool_sha256=${sha(BODY.B)}\ntool_sha256=${sha(BODY.B)}`),
  };
  let all = fixtureOk;
  const res = {};
  for (const [k, body] of Object.entries(v)) {
    const d = mk(k);
    writeFileSync(join(d, 'r.txt'), body);
    const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
    res[k] = r;
    all = all && isFail(r, 'AMBIGUOUS_FIELD');
  }
  arm('dup-equal-field', all, Object.entries(res).map(([k, r]) => `${k} ${brief(r)}`).join(' | '));
}
// A28 — an in-lane instrument named through /proc/self/root is IN the lane (realpath membership):
//        the dirty-worktree digest must be a mismatch, never a counted external bind.
{
  const d = mk('alias-proc-root');
  const alias = `/proc/self/root${join(repo, 'scripts', LINK_TARGET)}`;
  writeFileSync(join(d, 'r.txt'), receipt({ r: A, digest: sha(BODY.W), cmd: `node ${alias}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('alias-proc-root', fixtureOk && isDrift(r, 0, 1, 0, 0), brief(r));
}
// A29 — a UTF-8 BOM must not hide a receipt's rev=: BOM + rev=A + A's digest, judged at C → clean.
{
  const d = mk('bom-rev');
  writeFileSync(join(d, 'r.txt'), `\uFEFF${receipt({ r: A, digest: sha(BODY.A), cmd: TOOL_CMD })}`);
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('bom-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A30 — a committed mode-120000 instrument is fail-closed SYMLINK_INSTRUMENT: hashing the link
//        text would let a receipt bind arbitrary target content (sha256 of the target string).
{
  const d = mk('symlink-instrument');
  writeFileSync(join(d, 'r.txt'), receipt({ r: C, digest: sha(Buffer.from(LINK_TARGET)), cmd: `node scripts/link-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('symlink-instrument', fixtureOk && isFail(r, 'SYMLINK_INSTRUMENT'), brief(r));
}

const held = arms.filter((a) => a.ok).length;
for (const a of arms) console.log(`ARM ${a.name}: ${a.ok ? 'PASS' : 'FAIL'} ${a.detail}`);
rmSync(fixRoot, { recursive: true, force: true });
console.log(`C89_C1: ${held === arms.length ? 'HELD' : 'UNMET'} held=${held}/${arms.length}`);
process.exit(held === arms.length ? 0 : 1);
