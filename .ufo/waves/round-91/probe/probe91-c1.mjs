#!/usr/bin/env node
/**
 * probe91-c1.mjs — FROZEN scorer for claim C1 of kumitate round 91.
 *
 * Contract `kumitate-receipt-bind-v5` blind scorer: the 47 arms of probe90 (byte-carried below,
 * label prefix renamed) plus round-91 arms, every arm scored in TWO fixture contexts (M3).
 *
 * Round-91 additions (each grounded in a round-90 routed defect, corpus/lessons/round-90*.md):
 *   - M3   context invariance: the parent process runs the whole battery twice as children —
 *          context A builds fixtures under --work with TMPDIR=--work (an ancestor of every
 *          fixture); context B builds fixtures under `--alt/r-<rand>` with TMPDIR=`--alt/t-<rand>`
 *          (a sibling, never an ancestor). An arm PASSES only if it passes in BOTH contexts, so a
 *          construction gated on the TMPDIR/--dir relation or on a path token of --work fails.
 *   - M4   mid-token invisible code point: `cmd=node scripts/<tool>\u200B.mjs` names a path the
 *          judged revision does not carry → FAIL-CLOSED UNRESOLVED; its positive twin (the same
 *          receipt with the code point removed) binds CLEAN. A whole-text strip binds the first.
 *   - RD-2 bounded external reads (round-90 sentinel A4/A5): an ABSOLUTE external instrument token
 *          that names a non-regular file (character device /dev/zero, /dev/null, a FIFO with no
 *          writer, a directory) or a regular file larger than 16777216 bytes is FAIL-CLOSED
 *          UNRESOLVED, exit 2, within 20 s of wall time under a 2 GiB address-space limit
 *          (prlimit --as). Positive twins: an EMPTY regular external file whose digest is
 *          sha256("") binds CLEAN external=1 (kills "refuse empty"/"refuse digest-of-empty"), and a
 *          sparse regular file of EXACTLY 16777216 bytes with its correct digest binds CLEAN
 *          external=1 (kills a cap below the declared edge). Over-cap is 16777217 bytes, sparse.
 *   - The selftest floor rises to 76 (the v4 suite): the instrument's suite never shrinks.
 *
 * Carried from probe90 — Q82 blind discipline (round 89):
 * "a capability scorer may not hand the candidate its own fixture's identity". The Q82 field:
 *   - the scorer's fixture PATHS must not encode the arm: every fixture directory is named from a
 *     per-run random label and every receipt file from a per-arm counter (`r.txt`, `r2.txt`, …);
 *     no arm name, no scenario word and no round constant appears in any path the candidate sees;
 *   - every shape-gated arm carries a positive twin that the same shape test gets wrong.
 *
 * The judged object: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-bind.mjs`
 * (--tool overrides). It binds every `*.txt` receipt in --dir to the instrument its own `cmd=`
 * names, at a judged revision, failing closed on its boundaries.
 *
 * Arms read the candidate's verdict line only (`RECEIPT_BIND: ...`, exit code). The candidate
 * never sees arm names, expected verdicts or the probe's fixture bookkeeping: fixture directory
 * names are `d-<4 random hex>` regenerated for EVERY fixture directory of EVERY run, receipt file
 * names are arm-free counters, and fixture bodies embed a per-run 12-hex nonce so no public
 * constant can be overfit.
 *
 * Determinism: the printed output is byte-identical across runs on the same lane/rev/tool.
 * Random labels and nonces never reach stdout; every printed `first=` names a counter-named
 * receipt file. Run it twice and diff before trusting a HELD.
 *
 * Fixture discipline (QUALITY.md, /fast/scratch rule): everything is built under --work, the
 * fixture repository is created with `git init` inside that directory; every git call names
 * `-C <dir>` and the probe verifies `rev-parse --show-toplevel` equals it before the first commit.
 *
 * v4 arm classes (each grounded in a routed defect of round 89, corpus/lessons/round-89*.md):
 *   - K89-V1  invisible-prefix field lines: a duplicate `cmd=`/`rev=`/`tool_sha256=` line prefixed
 *             with U+FEFF/U+200B/U+200C/U+200D/U+200E/U+00A0 must still read AMBIGUOUS_FIELD, and
 *             a receipt whose ONLY field lines carry that prefix must still parse (positive twins
 *             `single-zwsp` / `single-nbsp`; `bom-rev` keeps the U+FEFF parse twin).
 *   - K89-V2  the missing lane-membership arms: an ABSOLUTE in-lane token naming the committed
 *             mode-120000 symlink (`abs-symlink-instrument`), an interior `..` that stays inside
 *             (`dotdot-inside`, plus its worktree-digest negative), and an alias through a
 *             symlinked ancestor (realpath in-lane, `alias-ancestor` clean + its worktree-digest
 *             drift twin and the genuinely-external twin).
 *   - K89-V3  the scorer header now describes the fixture it actually builds: `limit-before-read`
 *             uses a 1 GiB sparse receipt with mode 0000 (no "256 MiB cap" — that wording
 *             described a fixture the code never built).
 *   - K89-V4  `usage` and `selftest` are behavioural arms (usage prints no verdict line; selftest
 *             prints `PASS held=N/N` with equal N >= 68 and no failing arm line), and the two
 *             lane-history arms read the round-86/round-87 receipt bytes FROM THE JUDGED REVISION
 *             (`git cat-file blob <rev>:...`), never from the lane worktree.
 *   - D1      a committed mode-120000 symlink whose TARGET TEXT contains a space is still
 *             SYMLINK_INSTRUMENT (a blob-shape heuristic that keys on "looks like a path" fails).
 *
 * Usage:
 *   node probe91-c1.mjs --lane <LANE> --work <SCRATCH> --alt <ALT-ROOT> --rev <40-hex> [--tool <receipt-bind.mjs>]
 * (`--ctx A|B` is the internal child mode; the parent runs both and merges per arm.)
 * Exit: 0 HELD (every arm passed in both contexts), 1 UNMET (some arm failed), 2 FAIL-CLOSED
 * (probe could not run).
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
const SELFTEST_FLOOR = 76; // the instrument's suite must never shrink below the v4 suite (76 arms)
const CAP = 16777216; // RD-2: declared external-instrument size cap (bytes)
const BOUND_MS = 20000; // RD-2: wall-time bound per bounded arm
const BOUND_AS = 2147483648; // RD-2: address-space bound per bounded arm (prlimit --as)
const altArg = opt('--alt', '');
const ctx = opt('--ctx', '');

function failClosed(token, detail) {
  console.log(`C91_C1: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(2);
}
if (!existsSync(lane)) failClosed('LANE_UNREADABLE', lane);
if (!workArg) failClosed('WORK_REQUIRED');
if (!altArg) failClosed('ALT_REQUIRED');
if (!/^[a-f0-9]{40}$/.test(rev)) failClosed('REV_NOT_FULL', rev || 'absent');
if (ctx !== '' && ctx !== 'A' && ctx !== 'B') failClosed('CTX_BAD', ctx);
const work = resolve(workArg);
const alt = resolve(altArg);
mkdirSync(work, { recursive: true });
mkdirSync(alt, { recursive: true });

// ---- parent mode (M3): run the battery in context A and context B, merge per arm.
if (ctx === '') {
  const base = ['--lane', lane, '--work', work, '--alt', alt, '--rev', rev, '--tool', tool];
  const runs = {};
  for (const c of ['A', 'B']) {
    const r = spawnSync(process.execPath, [process.argv[1], ...base, '--ctx', c],
      { encoding: 'utf8', timeout: 3600000, maxBuffer: 64 << 20 });
    const out = `${r.stdout || ''}`;
    const verdict = (out.match(/^C91_C1_CTX: .*$/m) || [''])[0];
    if (!verdict || /FAIL-CLOSED/.test(out.match(/^C91_C1: .*$/m)?.[0] || '')) {
      failClosed('CTX_RUN', `ctx=${c} exit=${r.status} ${(out.match(/^C91_C1: .*$/m) || [''])[0]}`);
    }
    const arms = new Map();
    for (const m of out.matchAll(/^ARM (\S+): (PASS|FAIL)(?: (.*))?$/gm)) arms.set(m[1], { ok: m[2] === 'PASS', detail: m[3] || '' });
    runs[c] = arms;
  }
  const names = [...runs.A.keys()];
  const sameSet = names.length === runs.B.size && names.every((n) => runs.B.has(n));
  if (!sameSet || names.length === 0) failClosed('CTX_ARMSET', `A=${runs.A.size} B=${runs.B.size}`);
  let held = 0;
  for (const n of names) {
    const a = runs.A.get(n); const b = runs.B.get(n);
    const ok = a.ok && b.ok;
    if (ok) held += 1;
    console.log(`ARM ${n}: ${ok ? 'PASS' : 'FAIL'} A=${a.ok ? 'PASS' : 'FAIL'} B=${b.ok ? 'PASS' : 'FAIL'}${ok ? '' : ` | A: ${a.detail} | B: ${b.detail}`}`);
  }
  console.log(`C91_C1: ${held === names.length ? 'HELD' : 'UNMET'} held=${held}/${names.length}`);
  process.exit(held === names.length ? 0 : 1);
}

// ---- child mode. Context A: fixtures under --work, TMPDIR=--work (an ancestor of every fixture).
// Context B: fixtures under --alt/r-<rand>, TMPDIR=--alt/t-<rand> (a sibling, never an ancestor).
// The fixture root name is drawn per run: no round constant, no arm word (Q82).
const fixRoot = join(ctx === 'A' ? work : alt, `r-${randomBytes(4).toString('hex')}`);
const tmpDir = ctx === 'A' ? work : join(alt, `t-${randomBytes(4).toString('hex')}`);
rmSync(fixRoot, { recursive: true, force: true });
mkdirSync(fixRoot, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const R86_PATH = '.ufo/waves/round-86/close';
const R87_PATH = '.ufo/waves/round-87/close';
const GIT_DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
function cleanEnv() {
  const env = { ...process.env, TMPDIR: tmpDir, GIT_TERMINAL_PROMPT: '0' };
  for (const k of GIT_DROP) delete env[k];
  return env;
}

// RD-2 bounded run: the candidate runs under prlimit --as=2GiB with a 20 s wall bound. A kill by
// timeout or signal has status null and prints no verdict line, so the arm fails.
function runToolBounded(extra) {
  const t0 = Date.now();
  const r = spawnSync('prlimit', [`--as=${BOUND_AS}`, '--', 'node', tool, ...extra], {
    cwd: lane, encoding: 'utf8', timeout: BOUND_MS, killSignal: 'SIGKILL', maxBuffer: 32 << 20, env: cleanEnv(),
  });
  const ms = Date.now() - t0;
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}`, ms, inBound: r.status !== null && ms < BOUND_MS };
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
function laneList(dirRel) {
  const g = spawnSync('git', ['-C', lane, 'ls-tree', '--name-only', `${rev}:${dirRel}`], { encoding: 'utf8', env: cleanEnv() });
  return g.status === 0 ? g.stdout.split('\n').filter(Boolean).sort() : null;
}
// Q82: fixture directory names carry NO arm identity — a fresh random label per call.
function mk() {
  const d = join(fixRoot, `d-${randomBytes(4).toString('hex')}`);
  mkdirSync(d, { recursive: true });
  return d;
}
// Receipt file names are arm-free counters: deterministic `first=` values, no scenario word.
function rname(n) { return n === 1 ? 'r.txt' : `r${n}.txt`; }
function receipt({ r, digest, cmd, tail }) {
  return `${r ? `rev=${r}\n` : ''}tool_sha256=${digest}\ncmd=${cmd}\n${tail || `OK ${NONCE}\n`}exit=0\nsignal=none\n`;
}
const arms = [];
function arm(name, ok, detail) { arms.push({ name, ok: !!ok, detail: detail || '' }); }
const brief = (r) => `exit=${r.status} ${bindLine(r.out)}`;

// ---- fixture repository, drawn at run time: three commits, a staged body, a dirty worktree,
//      an untracked instrument and two committed symlink instruments (plain target and a target
//      whose TEXT contains a space — the D1 twin).
const repo = mk();
function fx(args, input) {
  return spawnSync('git', ['-C', repo, '-c', `user.name=p${NONCE}`, '-c', `user.email=p${NONCE}@fixture.invalid`,
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
const LINK_SPACED = `sp-${NONCE}.mjs`;
const LINK_SPACED_TARGET = `to ol-${NONCE}.mjs`; // a symlink target whose text contains a space (D1)
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
    // committed symlink instruments at the head revision (mode 120000): one with a plain target,
    // one whose TARGET TEXT contains a space (the D1 twin)
    symlinkSync(LINK_TARGET, join(repo, 'scripts', `link-${NONCE}.mjs`));
    fx(['add', `scripts/link-${NONCE}.mjs`]);
    writeFileSync(join(repo, 'scripts', LINK_SPACED_TARGET), BODY.C);
    fx(['add', `scripts/${LINK_SPACED_TARGET}`]);
    symlinkSync(LINK_SPACED_TARGET, join(repo, 'scripts', LINK_SPACED));
    fx(['add', `scripts/${LINK_SPACED}`]);
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

// A1 — bare invocation is a usage error AND prints no verdict line (behavioural, K89-V4: a usage
//      path that emits a verdict it did not measure is a text stub).
{
  const r = runTool([]);
  arm('usage', r.status === 64 && /USAGE/.test(r.out) && !/^RECEIPT_BIND: /m.test(r.out), `exit=${r.status}`);
}
// A2 — the tool's own hermetic selftest passes at full strength (behavioural, K89-V4): equal
//      held/total, total >= 68 (the v3 suite), and no per-arm FAIL line anywhere in the output.
{
  const w = mk();
  const r = runTool(['--selftest', '--work', w]);
  const m = r.out.match(/RECEIPT_BIND_SELFTEST: PASS held=(\d+)\/(\d+)/);
  const noArmFail = !/^RECEIPT_BIND_SELFTEST arm \S+ FAIL(?: |$)/m.test(r.out);
  const ok = r.status === 0 && !!m && m[1] === m[2] && Number(m[1]) >= SELFTEST_FLOOR && noArmFail;
  arm('selftest', ok, `exit=${r.status} ${(r.out.match(/RECEIPT_BIND_SELFTEST: .*/) || [''])[0]}`);
}
// A3 — the committed round-86 receipts read from THE JUDGED REVISION (K89-V4, arms #3/#5 no longer
//      touch the lane worktree): 9 of 10 misname their subject, so the verdict is DRIFT.
{
  const names = (laneList(R86_PATH) || []).filter((f) => f.endsWith('.txt'));
  const d = mk();
  let n = 0;
  names.forEach((f, i) => {
    const bytes = laneShow(`${R86_PATH}/${f}`);
    if (bytes === null) return;
    writeFileSync(join(d, `q${String(names.length - i).padStart(2, '0')}-${i}.txt`), bytes);
    n += 1;
  });
  const r = runTool(['--dir', d, '--rev', rev]);
  arm('detect-r86-at-rev', n === 10 && isDrift(r, 1, 9, 0), `files=${n} ${brief(r)}`);
}
// A4 — the same round-86 bytes under fresh counter names in a fresh random directory: no path or
//      name key survives.
{
  const names = (laneList(R86_PATH) || []).filter((f) => f.endsWith('.txt'));
  const d = mk();
  let n = 0;
  names.forEach((f, i) => {
    const bytes = laneShow(`${R86_PATH}/${f}`);
    if (bytes === null) return;
    writeFileSync(join(d, `p${String(names.length - i).padStart(2, '0')}.txt`), bytes);
    n += 1;
  });
  const r = runTool(['--dir', d, '--rev', rev]);
  arm('detect-r86-renamed', n === 10 && isDrift(r, 1, 9, 0), `files=${n} ${brief(r)}`);
}
// A5 — the round-87 close receipt bytes from THE JUDGED REVISION (minus the external-instrument
//      receipt) bind clean.
{
  const names = (laneList(R87_PATH) || []).filter((f) => f.endsWith('.txt') && f !== 'census.txt');
  const d = mk();
  let n = 0;
  for (const f of names) {
    const bytes = laneShow(`${R87_PATH}/${f}`);
    if (bytes === null) continue;
    writeFileSync(join(d, `c${String(n + 1).padStart(2, '0')}.txt`), bytes);
    n += 1;
  }
  const r = runTool(['--dir', d, '--rev', rev]);
  arm('clean-r87-at-rev', n === 11 && isClean(r, 11, 0), `copied=${n} ${brief(r)}`);
}
// A6 — a receipt with no cmd= is unchecked, never clean.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), `rev=${B}\ntool_sha256=${sha(BODY.B)}\nexit=0\nsignal=none\n`);
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('unchecked', fixtureOk && isDrift(r, 0, 0, 1), brief(r));
}
// A7 — an instrument the revision does not carry is fail-closed.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: B, digest: sha(BODY.B), cmd: `node scripts/absent-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('unresolved', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A8 — a missing receipt directory is fail-closed.
{
  const r = runTool(['--dir', join(fixRoot, `absent-${NONCE}-dir`), '--rev', rev]);
  arm('dir-missing', isFail(r, 'DIR_UNREADABLE'), brief(r));
}
// A9 — an unresolvable default revision is fail-closed.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, 'f'.repeat(40)) : { status: -1, out: '' };
  arm('rev-bad', fixtureOk && isFail(r, 'REV_UNRESOLVED'), brief(r));
}
// A10 — a symlinked receipt is not a receipt.
{
  const d = mk();
  writeFileSync(join(d, rname(2)), receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  symlinkSync(join(d, rname(2)), join(d, rname(1)));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('symlink-receipt', fixtureOk && isFail(r, 'SYMLINK_RECEIPT'), brief(r));
}
// A11 — a receipt's own rev= wins over --rev: digest of A's bytes, rev=A, --rev C → clean.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.A), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('rev-receipt-wins', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A12 — a receipt that binds the dirty worktree bytes is a mismatch at the judged revision.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.W), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('worktree-forgery', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A13 — no rev= in the receipt: the default --rev's bytes bind (B is neither HEAD nor the index).
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('default-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A14 — rev=A with B's digest is a mismatch: a tool that ignores the receipt's rev= reads clean.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('rev-receipt-negative', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A15 — an instrument that exists only in the worktree is absent at the revision.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `node scripts/fresh-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('untracked-instrument', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A16 — a RELATIVE cmd= token that resolves outside the lane is fail-closed ESCAPES_LANE;
//        the same file named by an ABSOLUTE path stays a counted external instrument.
{
  const outside = mk();
  writeFileSync(join(outside, `ext-${NONCE}.mjs`), BODY.fresh);
  const d1 = mk();
  writeFileSync(join(d1, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `node ../${basename(outside)}/ext-${NONCE}.mjs` }));
  const d2 = mk();
  writeFileSync(join(d2, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `node ${join(outside, `ext-${NONCE}.mjs`)}` }));
  const r1 = fixtureOk ? inRepo(d1, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(d2, B) : { status: -1, out: '' };
  arm('escape-relative', fixtureOk && isFail(r1, 'ESCAPES_LANE') && isClean(r2, 1, 1),
    `relative ${brief(r1)} | absolute ${brief(r2)}`);
}
// A17 — a receipt DIRECTORY that is a symlink is fail-closed SYMLINK_DIR; its real target binds.
{
  const real = mk();
  writeFileSync(join(real, rname(1)), receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  const link = join(fixRoot, `lk-${randomBytes(4).toString('hex')}`);
  symlinkSync(real, link);
  const r1 = fixtureOk ? inRepo(link, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(real, B) : { status: -1, out: '' };
  arm('symlink-dir', fixtureOk && lstatSync(link).isSymbolicLink() && isFail(r1, 'SYMLINK_DIR') && isClean(r2, 1, 0),
    `link ${brief(r1)} | real ${brief(r2)}`);
}
// A18 — a receipt larger than 1 MiB is fail-closed RECEIPT_TOO_LARGE; a 512 KiB one binds.
{
  const big = mk();
  const head = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  writeFileSync(join(big, rname(1)), head + `${'x'.repeat(127)}\n`.repeat(16384));
  const ok = mk();
  writeFileSync(join(ok, rname(1)), head + `${'x'.repeat(127)}\n`.repeat(4096));
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
  let k = 0;
  for (const [key, body] of Object.entries(variants)) {
    k += 1;
    const d = mk();
    writeFileSync(join(d, rname(k)), body);
    const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
    res[key] = r;
    all = all && isFail(r, 'AMBIGUOUS_FIELD');
  }
  const d0 = mk();
  writeFileSync(join(d0, rname(1)), base);
  const r0 = fixtureOk ? inRepo(d0, B) : { status: -1, out: '' };
  arm('duplicate-field', all && isClean(r0, 1, 0),
    `${Object.entries(res).map(([key, r]) => `${key} ${brief(r)}`).join(' | ')} | single ${brief(r0)}`);
}
// A20 — deterministic sweep over every scripts/*.mjs at --rev, then one flipped digest at index N mod 7.
{
  const ls = spawnSync('git', ['-C', lane, 'ls-tree', '--name-only', `${rev}:scripts`], { encoding: 'utf8', env: cleanEnv() });
  const names = ls.status === 0 ? ls.stdout.split('\n').filter((f) => f.endsWith('.mjs')).sort() : [];
  const d = mk();
  let built = 0;
  names.forEach((f, i) => {
    const bytes = laneShow(`scripts/${f}`);
    if (!bytes) return;
    writeFileSync(join(d, `s${String(i + 1).padStart(2, '0')}.txt`), receipt({ r: rev, digest: sha(bytes), cmd: `node scripts/${f} --help` }));
    built += 1;
  });
  const a = runTool(['--dir', d, '--rev', rev]);
  let ok = names.length >= 10 && built === names.length && isClean(a, built, 0);
  let detail = `scripts=${names.length} clean ${brief(a)}`;
  if (names.length) {
    const k2 = names.length % 7;
    const target = `s${String(k2 + 1).padStart(2, '0')}.txt`;
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
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.A), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('default-rev-not-head', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A22 — no rev=, judged at B while the index holds body S and HEAD holds C: the index is not a revision.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('index-not-judged', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A23 — an ABSOLUTE in-lane token before a dirty worktree binds at the judged revision.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.A), cmd: `node ${join(repo, 'scripts', LINK_TARGET)}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('abs-in-lane-at-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A24 — the limit edge from both sides: exactly 1048576 binds, 1048577 is RECEIPT_TOO_LARGE.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const atLimit = mk();
  const overLimit = mk();
  const padTo = (n) => base + `#${'p'.repeat(Math.max(0, n - base.length - 2))}\n`;
  writeFileSync(join(atLimit, rname(1)), padTo(1048576));
  writeFileSync(join(overLimit, rname(1)), padTo(1048577));
  const s1 = lstatSync(join(atLimit, rname(1))).size;
  const s2 = lstatSync(join(overLimit, rname(1))).size;
  const r1 = fixtureOk ? inRepo(atLimit, B) : { status: -1, out: '' };
  const r2 = fixtureOk ? inRepo(overLimit, B) : { status: -1, out: '' };
  arm('limit-edge', fixtureOk && s1 === 1048576 && s2 === 1048577 && isClean(r1, 1, 0) && isFail(r2, 'RECEIPT_TOO_LARGE'),
    `edge ${s1} ${brief(r1)} | over ${s2} ${brief(r2)}`);
}
// A25 — a 1 GiB sparse receipt with mode 0000 (K89-V3: this fixture, not a "256 MiB cap"): the size
//        is judged BEFORE the read, so the verdict is RECEIPT_TOO_LARGE (an implementation that reads
//        first reports RECEIPT_UNREADABLE).
{
  const d = mk();
  const p = join(d, rname(1));
  writeFileSync(p, receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  truncateSync(p, 1 << 30);
  chmodSync(p, 0o000);
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  chmodSync(p, 0o600);
  arm('limit-before-read', fixtureOk && isFail(r, 'RECEIPT_TOO_LARGE'), `size=${1 << 30} ${brief(r)}`);
}
// A26 — a relative token with an interior `..` that still escapes is ESCAPES_LANE by resolution.
{
  const outside = mk();
  writeFileSync(join(outside, `ext2-${NONCE}.mjs`), BODY.fresh);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `node scripts/../../${basename(outside)}/ext2-${NONCE}.mjs` }));
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
  let k = 0;
  for (const [key, body] of Object.entries(v)) {
    k += 1;
    const d = mk();
    writeFileSync(join(d, rname(k)), body);
    const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
    res[key] = r;
    all = all && isFail(r, 'AMBIGUOUS_FIELD');
  }
  arm('dup-equal-field', all, Object.entries(res).map(([key, r]) => `${key} ${brief(r)}`).join(' | '));
}
// A28 — an in-lane instrument named through /proc/self/root is IN the lane (realpath membership):
//        the dirty-worktree digest must be a mismatch, never a counted external bind.
{
  const d = mk();
  const alias = `/proc/self/root${join(repo, 'scripts', LINK_TARGET)}`;
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.W), cmd: `node ${alias}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('alias-proc-root', fixtureOk && isDrift(r, 0, 1, 0, 0), brief(r));
}
// A28b — TWIN (Q82): the SAME alias shape with the CORRECT at-rev digest is CLEAN with external=0.
//        A lexical "outside" judge or a blanket non-lexical refusal fails this twin while a textual
//        `/proc/self/root` prefix-strip passes both — which the D1 and ancestor arms then kill.
{
  const d = mk();
  const alias = `/proc/self/root${join(repo, 'scripts', LINK_TARGET)}`;
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.A), cmd: `node ${alias}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('alias-proc-root-clean', fixtureOk && isClean(r, 1, 0, 0), brief(r));
}
// A29 — a UTF-8 BOM must not hide a receipt's rev=: BOM + rev=A + A's digest, judged at C → clean.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), `\uFEFF${receipt({ r: A, digest: sha(BODY.A), cmd: TOOL_CMD })}`);
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('bom-rev', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A30 — a committed mode-120000 instrument is fail-closed SYMLINK_INSTRUMENT: hashing the link
//        text would let a receipt bind arbitrary target content (sha256 of the target string).
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: C, digest: sha(Buffer.from(LINK_TARGET)), cmd: `node scripts/link-${NONCE}.mjs` }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('symlink-instrument', fixtureOk && isFail(r, 'SYMLINK_INSTRUMENT'), brief(r));
}
// A31 — D1 twin: the mode-120000 link whose TARGET TEXT contains a space is still
//        SYMLINK_INSTRUMENT. A blob-shape heuristic that keys on "the blob looks like a path"
//        (round-89 cand-skip-mode) sees no path in `to ol-<nonce>.mjs` and hashes it instead,
//        so the link-text digest reads CLEAN for it and this arm fails.
{
  const d = mk();
  writeFileSync(join(d, rname(1)),
    receipt({ r: C, digest: sha(Buffer.from(LINK_SPACED_TARGET)), cmd: `node scripts/${LINK_SPACED}` }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('symlink-instrument-space-target', fixtureOk && isFail(r, 'SYMLINK_INSTRUMENT'), brief(r));
}
// A32 — TWIN of the mode-120000 arms: the same receipt shape naming the regular instrument at the
//        same revision binds clean — a blanket symlink-era refusal is not a pass.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: C, digest: sha(BODY.C), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('symlink-instrument-twin', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A33 — K89-V2: an ABSOLUTE in-lane token naming the committed mode-120000 symlink is the same
//        instrument: SYMLINK_INSTRUMENT, never a follow-the-target hash.
{
  const d = mk();
  writeFileSync(join(d, rname(1)),
    receipt({ r: C, digest: sha(Buffer.from(LINK_TARGET)), cmd: `node ${join(repo, 'scripts', `link-${NONCE}.mjs`)}` }));
  const r = fixtureOk ? inRepo(d, C) : { status: -1, out: '' };
  arm('abs-symlink-instrument', fixtureOk && isFail(r, 'SYMLINK_INSTRUMENT'), brief(r));
}
// A34 — K89-V2 positive twin: an interior `..` that STAYS inside the lane binds at the judged rev
//        (a textual escape check would fail this twin; the escape twin is A26).
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: B, digest: sha(BODY.B), cmd: `node scripts/../scripts/${LINK_TARGET}` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('dotdot-inside', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A34b — negative twin of A34: the same interior-`..` shape carrying the WORKTREE digest is a
//        mismatch at the judged revision, never clean (a worktree-hashing candidate fails).
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: B, digest: sha(BODY.W), cmd: `node scripts/../scripts/${LINK_TARGET}` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('dotdot-inside-worktree', fixtureOk && isDrift(r, 0, 1, 0), brief(r));
}
// A35 — K89-V2: an alias through a SYMLINKED ANCESTOR is judged on real paths. `<scratch>/lnk`
//        points into the fixture repo's scripts directory, so the token's parent resolves IN the
//        lane: the correct at-rev digest reads CLEAN with external=0. A lexical judge counts the
//        same token external and hashes the dirty worktree bytes instead.
{
  const lnk = join(fixRoot, `an-${randomBytes(4).toString('hex')}`);
  symlinkSync(join(repo, 'scripts'), lnk);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.A), cmd: `node ${join(lnk, LINK_TARGET)}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('alias-ancestor', fixtureOk && isClean(r, 1, 0, 0), brief(r));
}
// A35b — negative twin of A35: the SAME ancestor alias carrying the WORKTREE digest is a mismatch
//        with external=0 (realpath membership), never an external disk bind (external=1).
{
  const lnk = join(fixRoot, `an-${randomBytes(4).toString('hex')}`);
  symlinkSync(join(repo, 'scripts'), lnk);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: A, digest: sha(BODY.W), cmd: `node ${join(lnk, LINK_TARGET)}` }));
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('alias-ancestor-worktree', fixtureOk && isDrift(r, 0, 1, 0, 0), brief(r));
}
// A35c — TWIN: a genuinely outside absolute token through a NON-symlinked directory is a counted
//        external instrument that binds from disk (external=1). Same "absolute token under the
//        fixture root" shape as A35, opposite verdict on membership truth.
{
  const outdir = mk();
  writeFileSync(join(outdir, `ex-${NONCE}.mjs`), BODY.fresh);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `node ${join(outdir, `ex-${NONCE}.mjs`)}` }));
  const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
  arm('alias-ancestor-external-twin', fixtureOk && isClean(r, 1, 1), brief(r));
}
// A36-A41 — K89-V1: a duplicate `cmd=` line prefixed with one invisible character is still a
//        duplicate: U+FEFF, U+200B, U+200C, U+200D, U+200E and U+00A0, one arm per prefix class.
//        Round 89's instrument read all six CLEAN (only a file-leading U+FEFF was stripped), so
//        the do-nothing control fails exactly these arms plus A42/A43.
{
  const base = receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD });
  const prefixes = [
    ['dup-feff', '\uFEFF'], ['dup-zwsp', '\u200B'], ['dup-zwnj', '\u200C'],
    ['dup-zwj', '\u200D'], ['dup-lrm', '\u200E'], ['dup-nbsp', '\u00A0'],
  ];
  let k = 0;
  for (const [name, p] of prefixes) {
    k += 1;
    const dupBody = base.replace(/^cmd=.*$/m, `cmd=${TOOL_CMD}\n${p}cmd=node scripts/other-${NONCE}.mjs`);
    const d = mk();
    writeFileSync(join(d, rname(k)), dupBody);
    const r = fixtureOk ? inRepo(d, B) : { status: -1, out: '' };
    arm(name, fixtureOk && isFail(r, 'AMBIGUOUS_FIELD'), `${JSON.stringify(p)} ${brief(r)}`);
  }
}
// A42 — K89-V1 positive twin: a receipt whose field lines are ALL prefixed with U+200B still
//        parses: rev, digest and cmd are read from their prefixed lines → clean. A construction
//        that rejects any invisible prefix (or strips only U+FEFF) fails this twin.
{
  const d = mk();
  const p = '\u200B';
  const body = `${p}rev=${A}\n${p}tool_sha256=${sha(BODY.A)}\n${p}cmd=${TOOL_CMD}\nOK ${NONCE}\nexit=0\nsignal=none\n`;
  writeFileSync(join(d, rname(1)), body);
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('single-zwsp', fixtureOk && isClean(r, 1, 0), brief(r));
}
// A43 — K89-V1 positive twin, U+00A0 class: the same all-prefixed receipt with NBSP parses clean.
{
  const d = mk();
  const p = '\u00A0';
  const body = `${p}rev=${A}\n${p}tool_sha256=${sha(BODY.A)}\n${p}cmd=${TOOL_CMD}\nOK ${NONCE}\nexit=0\nsignal=none\n`;
  writeFileSync(join(d, rname(1)), body);
  const r = fixtureOk ? inRepo(d, A) : { status: -1, out: '' };
  arm('single-nbsp', fixtureOk && isClean(r, 1, 0), brief(r));
}

// ---- round-91 arms ----------------------------------------------------------------------------
const inRepoBounded = (d, r) => runToolBounded(['--lane', repo, '--dir', d, '--rev', r]);
const NOT_RUN = { status: -1, out: '', inBound: false };
const bBrief = (r) => `bound=${r.inBound ? 'in' : 'OUT'} ${brief(r)}`;
// A44 — RD-2: an external character device that never reaches EOF (/dev/zero) is refused, not read.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(''), cmd: 'bash /dev/zero' }));
  const r = fixtureOk ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-zero', fixtureOk && r.inBound && isFail(r, 'UNRESOLVED'), bBrief(r));
}
// A45 — RD-2: an external character device that reads empty (/dev/null) carrying sha256("") is
//        still not a regular file: refused. (Kills "bounded read, then hash whatever came back".)
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(''), cmd: 'bash /dev/null' }));
  const r = fixtureOk ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-null', fixtureOk && r.inBound && isFail(r, 'UNRESOLVED'), bBrief(r));
}
// A46 — positive twin of A45: an EMPTY regular external file carrying sha256("") binds CLEAN
//        external=1 (kills "refuse empty" and "refuse the digest of empty").
{
  const outdir = mk();
  const f = join(outdir, `e-${NONCE}.sh`);
  writeFileSync(f, '');
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(''), cmd: `bash ${f}` }));
  const r = fixtureOk ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-empty-twin', fixtureOk && r.inBound && isClean(r, 1, 1), bBrief(r));
}
// A47 — RD-2: an external FIFO with no writer is refused within the bound (open must not block).
{
  const outdir = mk();
  const f = join(outdir, `f-${randomBytes(4).toString('hex')}.sh`);
  const mf = spawnSync('mkfifo', [f]);
  const made = mf.status === 0 && lstatSync(f).isFIFO();
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `bash ${f}` }));
  const r = fixtureOk && made ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-fifo', fixtureOk && made && r.inBound && isFail(r, 'UNRESOLVED'), bBrief(r));
}
// A48 — RD-2: an external directory token is refused (regression arm; v4 already refuses it).
{
  const outdir = mk();
  const f = join(outdir, `x-${NONCE}.sh`);
  mkdirSync(f);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(BODY.fresh), cmd: `bash ${f}` }));
  const r = fixtureOk ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-dir', fixtureOk && r.inBound && isFail(r, 'UNRESOLVED'), bBrief(r));
}
// A49 — RD-2: a regular external file ONE byte over the declared cap (sparse, 16777217 bytes)
//        carrying its CORRECT digest is refused — the cap, not the digest, decides.
{
  const outdir = mk();
  const f = join(outdir, `o-${NONCE}.sh`);
  writeFileSync(f, '');
  truncateSync(f, CAP + 1);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(Buffer.alloc(CAP + 1)), cmd: `bash ${f}` }));
  const r = fixtureOk ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-overcap', fixtureOk && lstatSync(f).size === CAP + 1 && r.inBound && isFail(r, 'UNRESOLVED'), bBrief(r));
}
// A50 — positive twin of A49: EXACTLY the cap (sparse, 16777216 bytes) with its correct digest
//        binds CLEAN external=1 (kills a cap set below the declared edge).
{
  const outdir = mk();
  const f = join(outdir, `o-${NONCE}.sh`);
  writeFileSync(f, '');
  truncateSync(f, CAP);
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ digest: sha(Buffer.alloc(CAP)), cmd: `bash ${f}` }));
  const r = fixtureOk ? inRepoBounded(d, B) : NOT_RUN;
  arm('ext-atcap', fixtureOk && lstatSync(f).size === CAP && r.inBound && isClean(r, 1, 1), bBrief(r));
}
// A51 — M4: an invisible code point INSIDE the instrument token is a value byte: the path
//        `scripts/tool-<n>\u200B.mjs` is not carried by the revision → UNRESOLVED. A whole-text
//        strip rewrites it to the committed tool and binds CLEAN.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: B, digest: sha(BODY.B), cmd: `node scripts/tool-${NONCE}\u200B.mjs --run` }));
  const r = fixtureOk ? inRepo(d, B) : NOT_RUN;
  arm('midtoken-invisible', fixtureOk && isFail(r, 'UNRESOLVED'), brief(r));
}
// A52 — positive twin of A51: the same receipt without the code point binds CLEAN external=0.
{
  const d = mk();
  writeFileSync(join(d, rname(1)), receipt({ r: B, digest: sha(BODY.B), cmd: TOOL_CMD }));
  const r = fixtureOk ? inRepo(d, B) : NOT_RUN;
  arm('midtoken-twin', fixtureOk && isClean(r, 1, 0), brief(r));
}

const held = arms.filter((a) => a.ok).length;
for (const a of arms) console.log(`ARM ${a.name}: ${a.ok ? 'PASS' : 'FAIL'} ${a.detail}`);
rmSync(fixRoot, { recursive: true, force: true });
if (ctx === 'B') rmSync(tmpDir, { recursive: true, force: true });
console.log(`C91_C1_CTX: ${ctx} ${held === arms.length ? 'HELD' : 'UNMET'} held=${held}/${arms.length}`);
process.exit(held === arms.length ? 0 : 1);
