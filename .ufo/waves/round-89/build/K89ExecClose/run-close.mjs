#!/usr/bin/env node
/**
 * run-close.mjs — kumitate round 89 close runner, v4 (derived from round-88 v3,
 * `.ufo/waves/round-88/run-close.mjs`, which derived from round-87 v2).
 *
 *   node run-close.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>]
 *
 * Run from the lane root (`--lane .`); it writes receipts ONLY into the `--out` close dir given
 * on argv (scratch artefacts go under `--work`, default `HYAKU_SCRATCH/kumitate-r89/close-work`).
 *
 * v4 keeps v3's bind-last ordering and its rev-bound preflight, and adds, for round 89:
 *   - `--rev` is mandatory and echoed on its own `RUN_CLOSE: REV` line before any case runs;
 *   - the frozen scorer `.ufo/waves/round-89/probe/probe89-c1.mjs` runs TWICE (cases `probe1`
 *     and `probe2`, separate receipts). The runner prints both `C89_C1:` lines and
 *     `RUN_CLOSE: PROBE_DETERMINISM SAME|DIFFERENT`; a disagreement (line or exit) fails the run;
 *   - every receipt binding of the final bind gets its own `RUN_CLOSE: BIND_CASE <file>
 *     <verdict>[ note]` line, read from the same instrument's `--json` rows: the final bind is
 *     `scripts/receipt-bind.mjs --dir <close> --rev <rev>` run twice over the finished close dir
 *     (text mode first for the canonical verdict line, then `--json`); the two runs' tallies must
 *     agree or the run fails;
 *   - the twin kill-rule threshold is the round-89 terminal score 30/30;
 *   - the twin generator is round-88's committed `make-worktree-variant.mjs` (round-89 controls
 *     ship none); it rewrites `function blobAt(lane, rev, rel) {`, which the v3 instrument keeps.
 *
 * Each case writes `<out>/<case>.txt`:
 *   rev=<40-hex>
 *   tool_sha256=<sha256 of the case's own instrument (cmd= token 2) at REV>
 *   cmd=<command line as executed>
 *   [twin_sha256=<sha256 of the generated worktree twin>]   (case `twin` only)
 *   <stdout+stderr>
 *   exit=<status>
 *   signal=<signal|none>
 *
 * Cases, in order: selftest, proxy, proxy-selftest, map, map-selftest, spotcheck, ready, plan,
 * census, bind-selftest, probe1, probe2, twin, bind.
 *   probe1/probe2  the frozen scorer `probe89-c1.mjs --lane --work --rev`, run twice.
 *   twin           the round-88 worktree-variant generator applied to `scripts/receipt-bind.mjs`
 *                  as read at REV, then the frozen probe with `--tool <twin>`. The receipt names
 *                  the PROBE as its instrument; the twin's digest is the extra `twin_sha256=`
 *                  line (kill rule: the twin must score below 30/30).
 *   census         fleet `sources-census.sh validate --root <fleet> kumitate` (external
 *                  instrument, hashed from disk, counted `external=` by receipt-bind).
 *   bind           `scripts/receipt-bind.mjs --dir <out> --rev REV --lane <lane>` over every
 *                 receipt above; its verdict line must count exactly (cases - 1) receipts.
 * After the cases the final bind over all of `<out>` (bind.txt included) runs twice (text, then
 * `--json` for the per-receipt BIND_CASE lines); it is not written as a receipt (a receipt about
 * it would need a further bind).
 *
 * Refusals (exit 3, nothing written — no directory created, no receipt emitted):
 * REV_NOT_FULL, OUT_EXISTS, LANE_UNREADABLE, LANE_NOT_GIT, REV_UNRESOLVED,
 * ESCAPES_LANE (a relative instrument token resolving outside --lane),
 * INSTRUMENT_UNRESOLVED (a lane instrument absent at REV — at the round base `a5d2503` this is
 * the frozen probe itself, which landed in the freeze commit `adfc2f5`),
 * WORKTREE_DIFFERS (a lane instrument's worktree bytes differ from REV, or are absent),
 * INSTRUMENT_UNREADABLE (an external instrument absent on disk).
 * Missing arguments are a usage error (exit 64).
 *
 * Exit map: 0 the bind case counted every other receipt AND the final bind over <out> is CLEAN
 * with matched = cases AND the two probe runs and the two final-bind runs agree AND no lane
 * instrument changed during the run; 1 otherwise; 3 refused; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, isAbsolute, relative, sep } from 'node:path';

const ROUND = '89';
const FLEET = '/home/vgpnk/Projects/shokunin';
const USAGE = 'USAGE: node run-close.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>]';
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : undefined;
};
const usage = (detail) => {
  console.log(`RUN_CLOSE: USAGE ${detail}`);
  console.log(USAGE);
  process.exit(64);
};
const refuse = (token, detail) => {
  console.log(`RUN_CLOSE: REFUSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(3);
};

const laneArg = opt('--lane');
const rev = opt('--rev');
const outArg = opt('--out');
if (!laneArg || !rev || !outArg) usage('--lane, --rev and --out are required');

const lane = resolve(laneArg);
const out = resolve(outArg);
const scratch = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const work = resolve(opt('--work') || join(scratch, `kumitate-r${ROUND}`, 'close-work'));

const GIT_DROP = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES'];
const gitEnv = () => {
  const e = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
  for (const k of GIT_DROP) delete e[k];
  return e;
};
const git = (args, buffer) => spawnSync('git', ['-C', lane, ...args], {
  encoding: buffer ? 'buffer' : 'utf8', maxBuffer: 64 << 20, timeout: 120000, env: gitEnv(),
});

if (!/^[a-f0-9]{40}$/.test(rev)) refuse('REV_NOT_FULL', rev);
if (existsSync(out)) refuse('OUT_EXISTS', out);
if (!existsSync(lane) || !statSync(lane).isDirectory()) refuse('LANE_UNREADABLE', lane);
{
  const top = git(['rev-parse', '--show-toplevel']);
  if (top.status !== 0 || resolve(top.stdout.trim()) !== lane) refuse('LANE_NOT_GIT', lane);
  if (git(['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]).status !== 0) refuse('REV_UNRESOLVED', rev);
}
console.log(`RUN_CLOSE: REV ${rev}`);

const sha = (b) => createHash('sha256').update(b).digest('hex');

// The instrument a receipt names is the second whitespace token of its own command line.
// Lane-relative and lane-absolute tokens are read at REV (`git cat-file blob REV:<path>`); an
// absolute token outside the lane is external and hashed from disk; a relative token that
// escapes the lane is refused (receipt-bind v3 would fail it closed as ESCAPES_LANE).
function locate(tok) {
  const abs = isAbsolute(tok) ? tok : resolve(lane, tok);
  const rel = relative(lane, abs);
  const inside = rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
  if (inside) return { kind: 'lane', rel: rel.split(sep).join('/'), abs };
  if (!isAbsolute(tok)) refuse('ESCAPES_LANE', tok);
  return { kind: 'external', abs };
}
function blobAt(rel) {
  const r = git(['cat-file', 'blob', `${rev}:${rel}`], true);
  return r.status === 0 ? r.stdout : null;
}
function diskBytes(p) {
  try { return readFileSync(p); } catch { return null; }
}
/** Bytes a receipt's digest is about: REV for lane paths, disk for external ones. */
function instrumentDigest(tok) {
  const loc = locate(tok);
  if (loc.kind === 'external') {
    const b = diskBytes(loc.abs);
    if (b === null) refuse('INSTRUMENT_UNREADABLE', tok);
    return { loc, digest: sha(b) };
  }
  const atRev = blobAt(loc.rel);
  if (atRev === null) refuse('INSTRUMENT_UNRESOLVED', `${rev}:${loc.rel}`);
  return { loc, digest: sha(atRev), atRev };
}

const R = join(lane, '.ufo', 'waves', `round-${ROUND}`);
const PROBE = join(R, 'probe', `probe${ROUND}-c1.mjs`);
// Round-89 controls ship no twin generator; round-88's committed one is generator-agnostic
// (it rewrites `function blobAt(lane, rev, rel) {`, which the v3 instrument keeps).
const TWIN_GEN = join(lane, '.ufo', 'waves', 'round-88', 'controls', 'make-worktree-variant.mjs');
const TWIN_SRC_REL = 'scripts/receipt-bind.mjs';
const twinDir = join(work, 'twin');
const twinSrc = join(twinDir, 'receipt-bind.at-rev.mjs');
const twinPath = join(twinDir, 'receipt-bind.worktree-twin.mjs');

const cases = [
  ['selftest', 'node', ['scripts/counter-receipt.mjs', '--selftest', '--work', work]],
  ['proxy', 'node', ['scripts/proxy-check.mjs', '--strict']],
  ['proxy-selftest', 'node', ['scripts/proxy-check.mjs', '--selftest']],
  ['map', 'node', ['scripts/readme-map.mjs']],
  ['map-selftest', 'node', ['scripts/readme-map.mjs', '--selftest']],
  ['spotcheck', 'node', ['scripts/spotcheck-adopt.mjs', '--check']],
  ['ready', 'node', ['scripts/ready-handoff.mjs', '--round', ROUND, '--wave', 'w1',
    '--policy', `${FLEET}/scripts/hyaku/ufo-wave-policy.json`]],
  ['plan', 'bash', ['scripts/plan-before-ready.sh', '--round', ROUND, '--rev', rev]],
  ['census', 'bash', [`${FLEET}/scripts/sources-census.sh`, 'validate', '--root', FLEET, 'kumitate']],
  ['bind-selftest', 'node', ['scripts/receipt-bind.mjs', '--selftest', '--work', work]],
  ['probe1', 'node', [PROBE, '--lane', lane, '--work', work, '--rev', rev]],
  ['probe2', 'node', [PROBE, '--lane', lane, '--work', work, '--rev', rev]],
  ['twin', 'node', [PROBE, '--lane', lane, '--work', work, '--rev', rev, '--tool', twinPath]],
  ['bind', 'node', ['scripts/receipt-bind.mjs', '--dir', out, '--rev', rev, '--lane', lane]],
];

// Pre-flight, before anything is written: every instrument resolves (lane ones AT REV), and every
// lane instrument the run will execute — including the twin generator — has worktree bytes equal
// to REV. Otherwise the digest (REV) would not describe the bytes that ran (worktree): refuse.
const digests = new Map();
const laneInstruments = new Map();
for (const [name, , args] of cases) {
  const d = instrumentDigest(args[0]);
  digests.set(name, d.digest);
  if (d.loc.kind === 'lane') laneInstruments.set(d.loc.rel, d.atRev);
}
for (const extra of [TWIN_GEN, join(lane, TWIN_SRC_REL)]) {
  const d = instrumentDigest(extra);
  laneInstruments.set(d.loc.rel, d.atRev);
}
const dirtyCheck = () => {
  for (const [rel, atRev] of laneInstruments) {
    const wt = diskBytes(join(lane, rel));
    if (wt === null || !wt.equals(atRev)) return rel;
  }
  return null;
};
{
  const dirty = dirtyCheck();
  if (dirty) refuse('WORKTREE_DIFFERS', `${dirty} worktree bytes differ from ${rev}:${dirty}`);
}

mkdirSync(work, { recursive: true });
mkdirSync(out, { recursive: true });
const canonicalOut = join(R, 'close');
if (out !== canonicalOut) console.log(`RUN_CLOSE: NOTE out is not the round's close dir ${canonicalOut}`);

const env = { ...process.env, TMPDIR: work, HYAKU_SCRATCH: scratch };
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: lane, encoding: 'utf8', timeout: 600000, maxBuffer: 32 << 20, env });
  return { status: r.status, signal: r.signal, body: `${r.stdout || ''}${r.stderr || ''}`, stdout: r.stdout || '' };
};
const withNl = (s) => (s && !s.endsWith('\n') ? `${s}\n` : s);
const results = new Map();

for (const [name, cmd, args] of cases) {
  let extraHead = '';
  let pre = '';
  let r;
  if (name === 'twin') {
    // The twin is generated from the integrated instrument AS READ AT REV, never the worktree.
    mkdirSync(twinDir, { recursive: true });
    writeFileSync(twinSrc, laneInstruments.get(TWIN_SRC_REL));
    const g = run('node', [TWIN_GEN, twinSrc, twinPath]);
    pre = withNl(g.body);
    const twinBytes = g.status === 0 ? diskBytes(twinPath) : null;
    extraHead = `twin_sha256=${twinBytes ? sha(twinBytes) : 'none'}\n`;
    r = twinBytes ? run(cmd, args)
      : { status: g.status === 0 ? 1 : g.status, signal: g.signal, body: 'RUN_CLOSE: TWIN_NOT_GENERATED probe not run\n', stdout: '' };
  } else {
    r = run(cmd, args);
  }
  writeFileSync(join(out, `${name}.txt`),
    `rev=${rev}\ntool_sha256=${digests.get(name)}\ncmd=${cmd} ${args.join(' ')}\n${extraHead}${pre}${withNl(r.body)}` +
    `exit=${r.status}\nsignal=${r.signal || 'none'}\n`);
  results.set(name, r);
  const last = r.stdout.trim().split('\n').filter(Boolean).at(-1) || '';
  console.log(`${name}: exit=${r.status} ${last}`);
}

const bindLine = (s) => (s.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
const num = (line, key) => {
  const m = line.match(new RegExp(`\\s${key}=(\\d+)`));
  return m ? Number(m[1]) : NaN;
};

// K87-V1 guard: the bind case's own verdict must count every other receipt.
const others = cases.length - 1;
const bl = bindLine(results.get('bind').body);
const counted = num(bl, 'matched') + num(bl, 'mismatched') + num(bl, 'unchecked');
const countOk = counted === others;
console.log(`RUN_CLOSE: BIND_CASE ${bl} counted=${Number.isNaN(counted) ? 'none' : counted} others=${others} ${countOk ? 'ALL' : 'SHORT'}`);

// Frozen-scorer determinism: the probe ran twice over independent run-time fixtures; both
// `C89_C1:` lines and both exits must agree.
const probeLine = (s) => (s.match(/^C89_C1: .*$/m) || ['C89_C1: none'])[0];
const p1 = results.get('probe1');
const p2 = results.get('probe2');
console.log(`RUN_CLOSE: PROBE1 ${probeLine(p1.body)} exit=${p1.status}`);
console.log(`RUN_CLOSE: PROBE2 ${probeLine(p2.body)} exit=${p2.status}`);
const probeSame = probeLine(p1.body) === probeLine(p2.body) && p1.status === p2.status;
console.log(`RUN_CLOSE: PROBE_DETERMINISM ${probeSame ? 'SAME' : 'DIFFERENT'}`);

// Kill-rule visibility (not a verdict of this runner): the twin's score against the terminal 30.
const twinLine = probeLine(results.get('twin').body);
console.log(`RUN_CLOSE: TWIN ${twinLine} exit=${results.get('twin').status}` +
  `${/held=30\/30/.test(twinLine) ? ' KILL_RULE_FIRED' : ''}`);

const dirtyAfter = dirtyCheck();
if (dirtyAfter) console.log(`RUN_CLOSE: WORKTREE_CHANGED_DURING_RUN ${dirtyAfter}`);

// Final bind over every receipt the run wrote, bind.txt included: text mode for the canonical
// verdict line, then the same instrument with --json for one BIND_CASE line per receipt binding.
const BIND_TOOL = join(lane, 'scripts', 'receipt-bind.mjs');
const f = run('node', [BIND_TOOL, '--dir', out, '--rev', rev, '--lane', lane]);
const fl = bindLine(f.body);
console.log(`RUN_CLOSE: BIND ${fl} exit=${f.status}`);
let jsonOk = true;
{
  const fj = run('node', [BIND_TOOL, '--dir', out, '--rev', rev, '--lane', lane, '--json']);
  const line = fj.stdout.trim().split('\n').filter(Boolean).at(-1) || '';
  let j = null;
  try { j = JSON.parse(line); } catch { /* unparsed below */ }
  if (j && Array.isArray(j.rows)) {
    for (const row of j.rows) {
      console.log(`RUN_CLOSE: BIND_CASE ${row.file} ${row.verdict}${row.note ? ' ' + row.note : ''}`);
    }
    console.log(`RUN_CLOSE: BIND_JSON verdict=${j.verdict} receipts=${j.receipts} matched=${j.matched}` +
      ` mismatched=${j.mismatched} unchecked=${j.unchecked} external=${j.external}`);
    if (/^RECEIPT_BIND: (CLEAN|DRIFT)/.test(fl)) {
      const want = fl.startsWith('RECEIPT_BIND: CLEAN') ? 'CLEAN' : 'DRIFT';
      jsonOk = j.verdict === want && j.matched === num(fl, 'matched') &&
        j.mismatched === num(fl, 'mismatched') && j.unchecked === num(fl, 'unchecked') &&
        j.external === num(fl, 'external');
      if (!jsonOk) console.log('RUN_CLOSE: BIND_JSON_TALLY_MISMATCH');
    }
  } else {
    console.log(`RUN_CLOSE: BIND_JSON unparsed exit=${fj.status}`);
  }
}

const ok = f.status === 0 && num(fl, 'matched') === cases.length && countOk && !dirtyAfter &&
  probeSame && jsonOk;
console.log(`RUN_CLOSE: DONE cases=${cases.length} rev=${rev} out=${out} bind_exit=${f.status} ${ok ? 'OK' : 'NOT_OK'}`);
process.exit(ok ? 0 : 1);
