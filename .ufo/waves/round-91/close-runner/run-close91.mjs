#!/usr/bin/env node
/**
 * run-close91.mjs — kumitate round 91 close runner, v2 (round-90 v1 + probe91 `--alt` context root;
 * `.ufo/waves/round-89/run-close.mjs`, which derived from round-88 v3 / round-87 v2).
 *
 *   node run-close91.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>] [--tool <receipt-bind path>]
 *
 * Run from anywhere; every case spawns with cwd = --lane. Receipts are written ONLY into the
 * `--out` close dir given on argv (scratch artefacts go under `--work`, default
 * `HYAKU_SCRATCH/kumitate-r90/close-work`; give TMPDIR/`--work` an explicit scratch path).
 *
 * Changes from round 89 (K89-V5 close-battery routing + round-90 plan's harm receipts):
 *   - `--tool <receipt-bind path>` selects the judged `receipt-bind` instrument for the
 *     `selftest` case, the frozen scorer's `--tool`, and the closing `bind` case. Default:
 *     `<lane>/scripts/receipt-bind.mjs` (the integrated v4 after integration; the base v3
 *     before it). A lane token is digested at REV like every other lane instrument.
 *   - the frozen scorer `.ufo/waves/round-90/probe/probe90-c1.mjs` runs TWICE (cases `probe1`
 *     and `probe2`, separate `--work` subdirs `p1`/`p2`, so the two runs never share fixture
 *     state). The runner prints both `C91_C1:` lines and
 *     `RUN_CLOSE: PROBE_DETERMINISM SAME|DIFFERENT`; per the frozen predicate only the
 *     `C91_C1:` verdict line and the exit must agree — the printed arm details embed per-run
 *     random fixture labels (Q82), so line-for-line stdout identity is NOT compared.
 *   - case `checklists` (`node scripts/surface-probe.mjs --checklists`, K89-V5) keeps every
 *     per-item `CHECKLIST` line in its receipt (round 89 committed only the tally). After the
 *     cases the runner writes `<out>/checklist-items.txt` — one `<ordinal> <verdict>
 *     SKILL.md:<line>` row per item, verdict PASS|FAIL|SKIP(self)|SKIP(checked)|ERROR — and
 *     prints `RUN_CLOSE: CHECKLIST_ITEMS`, `RUN_CLOSE: CHECKLIST_TALLY` (the `CHECKLIST: p/q
 *     pass` line) and `RUN_CLOSE: CHECKLIST_RED` (the failing item ordinals) so the report can
 *     reconcile the red set with the tally.
 *   - `checklist-items.txt` is written AFTER the `bind` case, not during `checklists`:
 *     receipt-bind counts EVERY `*.txt` directly under --dir, and a file without `cmd=` is
 *     tallied `unchecked` (DRIFT, exit 1) — writing it earlier would corrupt both the bind
 *     verdict and the count guard below. `bind.txt` is likewise written after bind ran.
 *   - the final bind is ONE text-mode run (`<tool> --dir <out> --rev <rev> --lane <lane>`)
 *     as the LAST case, over every case receipt written before it (12 = cases - 1); there is
 *     no second --json sweep (that was round 89's bind-of-the-bind; round 90 has no receipt
 *     about the bind itself).
 *
 * Cases, in order: probe1, probe2, selftest, checklists, proxy, sources, source-capture,
 * census, counter-pins, readme-map, round-gate, plan-before-ready, bind.
 *   probe1/probe2       the frozen scorer `probe90-c1.mjs --lane --work/p<N> --rev --tool`.
 *   selftest            the judged tool itself: `<tool> --selftest --work <work>`.
 *   checklists          `node scripts/surface-probe.mjs --checklists` over the lane's SKILL.md.
 *   proxy/sources/…     the harm-receipt gates: proxy-check --strict, sources-check,
 *                       source-capture, counter-pins, readme-map, round-gate --round 90,
 *                       plan-before-ready.sh --round 90.
 *   census              fleet `sources-census.sh validate --root <fleet> kumitate` (external
 *                       instrument, hashed from disk, counted `external=` by receipt-bind).
 *   bind                `<tool> --dir <out> --rev REV --lane <lane>` over every receipt above;
 *                       guard: matched+mismatched+unchecked must equal cases - 1.
 *
 * Each case writes `<out>/<case>.txt`:
 *   rev=<40-hex>
 *   tool_sha256=<sha256 of the case's own instrument (cmd= token 2) at REV, or from disk when
 *               the token is absolute outside the lane>
 *   cmd=<command line as executed>
 *   <stdout+stderr>
 *   exit=<status>
 *   signal=<signal|none>
 *
 * Refusals (exit 3, nothing written — no directory created, no receipt emitted):
 * REV_NOT_FULL, OUT_EXISTS, LANE_UNREADABLE, LANE_NOT_GIT, REV_UNRESOLVED,
 * ESCAPES_LANE (a relative instrument token resolving outside --lane),
 * INSTRUMENT_UNRESOLVED (a lane instrument absent at REV),
 * WORKTREE_DIFFERS (a lane instrument's worktree bytes differ from REV, or are absent — the
 * digest would not describe the bytes that ran),
 * INSTRUMENT_UNREADABLE (an external instrument absent on disk).
 * Missing arguments are a usage error (exit 64).
 *
 * Exit map: 0 every case ran with exit 0 AND the bind case counted every other receipt
 *           (matched+mismatched+unchecked = cases-1) AND the two probe runs agree on their
 *           `C91_C1:` line and exit AND no lane instrument changed during the run; 1 otherwise
 *           (a case's non-zero exit is a failed run, never swallowed); 3 refused; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, isAbsolute, relative, sep } from 'node:path';

const ROUND = '91';
const FLEET = '/home/vgpnk/Projects/shokunin';
const USAGE = 'USAGE: node run-close91.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>] [--tool <receipt-bind path>]';
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
const toolArg = opt('--tool');
const toolAbs = resolve(toolArg || join(lane, 'scripts', 'receipt-bind.mjs'));
const PROBE = join(lane, '.ufo', 'waves', `round-${ROUND}`, 'probe', `probe${ROUND}-c1.mjs`);
const CENSUS = join(FLEET, 'scripts', 'sources-census.sh');

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
// escapes the lane is refused (receipt-bind fails it closed as ESCAPES_LANE).
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

const cases = [
  ['probe1', 'node', [PROBE, '--lane', lane, '--work', join(work, 'p1'), '--alt', '/fast/scratch/hyaku', '--rev', rev, '--tool', toolAbs]],
  ['probe2', 'node', [PROBE, '--lane', lane, '--work', join(work, 'p2'), '--alt', '/fast/scratch/hyaku', '--rev', rev, '--tool', toolAbs]],
  ['selftest', 'node', [toolAbs, '--selftest', '--work', work]],
  ['checklists', 'node', ['scripts/surface-probe.mjs', '--checklists']],
  ['proxy', 'node', ['scripts/proxy-check.mjs', '--strict']],
  ['sources', 'node', ['scripts/sources-check.mjs']],
  ['source-capture', 'node', ['scripts/source-capture.mjs']],
  ['census', 'bash', [CENSUS, 'validate', '--root', FLEET, 'kumitate']],
  ['counter-pins', 'node', ['scripts/counter-pins.mjs']],
  ['readme-map', 'node', ['scripts/readme-map.mjs']],
  ['round-gate', 'node', ['scripts/round-gate.mjs', '--round', ROUND]],
  ['plan-before-ready', 'bash', ['scripts/plan-before-ready.sh', '--round', ROUND]],
  ['bind', 'node', [toolAbs, '--dir', out, '--rev', rev, '--lane', lane]],
];

// Per-case spawn budgets (ms): the probe scores 47 arms per run and surface-probe's checklist
// mode runs 46 items each with its own 120 s budget, so those two get more headroom than the
// r89 flat 600 s.
const CASE_TIMEOUT_MS = { probe1: 1800000, probe2: 1800000, checklists: 2400000 };

// Pre-flight, before anything is written: every instrument resolves (lane ones AT REV), and every
// lane instrument the run will execute has worktree bytes equal to REV. Otherwise the digest
// (REV) would not describe the bytes that ran (worktree): refuse.
const digests = new Map();
const laneInstruments = new Map();
for (const [name, , args] of cases) {
  const d = instrumentDigest(args[0]);
  digests.set(name, d.digest);
  if (d.loc.kind === 'lane') laneInstruments.set(d.loc.rel, d.atRev);
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
const canonicalOut = join(lane, '.ufo', 'waves', `round-${ROUND}`, 'close');
if (out !== canonicalOut) console.log(`RUN_CLOSE: NOTE out is not the round's close dir ${canonicalOut}`);

const env = { ...process.env, TMPDIR: work, HYAKU_SCRATCH: scratch };
const run = (name, cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: lane, encoding: 'utf8', timeout: CASE_TIMEOUT_MS[name] || 900000, maxBuffer: 32 << 20, env });
  if (r.error) {
    return { status: r.status, signal: r.signal, body: `RUN_CLOSE: SPAWN_ERROR ${r.error.message}\n`, stdout: r.stdout || '' };
  }
  return { status: r.status, signal: r.signal, body: `${r.stdout || ''}${r.stderr || ''}`, stdout: r.stdout || '' };
};
const withNl = (s) => (s && !s.endsWith('\n') ? `${s}\n` : s);
const results = new Map();

for (const [name, cmd, args] of cases) {
  const r = run(name, cmd, args);
  writeFileSync(join(out, `${name}.txt`),
    `rev=${rev}\ntool_sha256=${digests.get(name)}\ncmd=${cmd} ${args.join(' ')}\n${withNl(r.body)}` +
    `exit=${r.status}\nsignal=${r.signal || 'none'}\n`);
  results.set(name, r);
  const last = r.stdout.trim().split('\n').filter(Boolean).at(-1) || '';
  console.log(`${name}: exit=${r.status} ${last}`);
}

// Frozen-scorer determinism: the probe ran twice over independent run-time fixtures; both
// `C91_C1:` lines and both exits must agree (verdict line and exit ONLY — arm details embed
// per-run random fixture labels by design, Q82).
const probeLine = (s) => (s.match(/^C91_C1: .*$/m) || ['C91_C1: none'])[0];
const p1 = results.get('probe1');
const p2 = results.get('probe2');
console.log(`RUN_CLOSE: PROBE1 ${probeLine(p1.body)} exit=${p1.status}`);
console.log(`RUN_CLOSE: PROBE2 ${probeLine(p2.body)} exit=${p2.status}`);
const probeSame = probeLine(p1.body) === probeLine(p2.body) && p1.status === p2.status;
console.log(`RUN_CLOSE: PROBE_DETERMINISM ${probeSame ? 'SAME' : 'DIFFERENT'}`);

// K89-V5: every per-item CHECKLIST line is already inside checklists.txt; index the items and
// name the red set so the report can reconcile it with the CHECKLIST: p/q tally. The items file
// is written only now — after the bind case ran — because receipt-bind tallies every *.txt
// without cmd= as `unchecked` (a fieldless index file in --dir would corrupt both the bind
// verdict and the count guard).
const bindLine = (s) => (s.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
const num = (line, key) => {
  const m = line.match(new RegExp(`\\s${key}=(\\d+)`));
  return m ? Number(m[1]) : NaN;
};
const checklistItems = (s) => {
  const items = [];
  for (const line of s.split('\n')) {
    let m = /^CHECKLIST {2}(PASS|FAIL) SKILL\.md:(\d+)/u.exec(line);
    if (m) { items.push({ no: items.length + 1, line: Number(m[2]), verdict: m[1] }); continue; }
    m = /^CHECKLIST {2}(SKIP\(self\)|SKIP\(checked\)) {2}SKILL\.md:(\d+)/u.exec(line);
    if (m) { items.push({ no: items.length + 1, line: Number(m[2]), verdict: m[1] }); continue; }
    m = /^CHECKLIST {2}ERROR {2}SKILL\.md:(\d+) grammar/u.exec(line);
    if (m) items.push({ no: items.length + 1, line: Number(m[1]), verdict: 'ERROR' });
  }
  return items;
};
const cl = results.get('checklists');
const items = checklistItems(cl.stdout);
writeFileSync(join(out, 'checklist-items.txt'),
  `${items.map((it) => `${it.no} ${it.verdict} SKILL.md:${it.line}`).join('\n')}\n`);
const red = items.filter((it) => it.verdict === 'FAIL' || it.verdict === 'ERROR');
const skipped = items.filter((it) => it.verdict.startsWith('SKIP')).length;
console.log(`RUN_CLOSE: CHECKLIST_ITEMS parsed=${items.length} red=${red.length} skipped=${skipped}`);
console.log(`RUN_CLOSE: CHECKLIST_TALLY ${(cl.stdout.match(/^CHECKLIST: .*$/m) || ['CHECKLIST: none'])[0]}`);
console.log(`RUN_CLOSE: CHECKLIST_RED ${red.length ? red.map((it) => `${it.no}(SKILL.md:${it.line})`).join(' ') : 'none'}`);

// K87-V1 guard: the bind case's own verdict must count every other receipt.
const others = cases.length - 1;
const bl = bindLine(results.get('bind').body);
const counted = num(bl, 'matched') + num(bl, 'mismatched') + num(bl, 'unchecked');
const countOk = counted === others;
console.log(`RUN_CLOSE: BIND_CASE ${bl} counted=${Number.isNaN(counted) ? 'none' : counted} others=${others} ${countOk ? 'ALL' : 'SHORT'}`);
console.log(`RUN_CLOSE: BIND ${bl} exit=${results.get('bind').status}`);

const dirtyAfter = dirtyCheck();
if (dirtyAfter) console.log(`RUN_CLOSE: WORKTREE_CHANGED_DURING_RUN ${dirtyAfter}`);

const everyRan = cases.every(([name]) => results.has(name)) && results.size === cases.length;
const allZero = everyRan && [...results.values()].every((r) => r.status === 0);
const ok = everyRan && allZero && countOk && probeSame && !dirtyAfter;
console.log(`RUN_CLOSE: DONE cases=${cases.length} rev=${rev} out=${out} bind_exit=${results.get('bind').status}` +
  ` probe=${probeSame ? 'SAME' : 'DIFF'} count=${countOk ? 'ALL' : 'SHORT'} ${ok ? 'OK' : 'NOT_OK'}`);
process.exit(ok ? 0 : 1);
