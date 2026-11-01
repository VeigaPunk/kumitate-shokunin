#!/usr/bin/env node
// R71 versioned counter (v3 ratchet): REPLAY71_HELD iff every active arm holds.
// Round 71 recovery contract: COUNTER-SIDE ONLY. The five frozen round-69 controls, the
// frozen v1 counter (.ufo/waves/round-70/probe/replay70-probe.mjs) and the scored v2
// counter (.ufo/waves/round-70/probe/replay70-probe-v2.mjs) are byte-frozen history —
// all four are hash-checked in V01/V14 and never amended. scripts/control-replay.mjs is
// likewise untouched (pin-checked). Fixes carried from round 70's routed items:
//   1. V03–V07 exit expectation (the round-70 counter bug): v2 required `childExit === 1`
//      while every committed control receipt records `childExit = 0` on CONTROL-PASS —
//      the tool's own exit map (control-replay.mjs "0 replay performed and CONTROL-PASS")
//      and the controls' design (inner probe UNMET -> `control=<mode> … exit=1` line,
//      control script itself exits 0) make 0 the only honest value. v3 requires
//      childExit === 0 AND inner-verdict consistency: the stdout verdict line
//      (LEDGER69|DEPREC69)_(HELD|UNMET) must agree with the `control=<mode> … exit=<n>`
//      line (HELD->0, UNMET->1) and the family label must match. v3 also deep-equals
//      `substitutions` against the sanctioned-edit contract (c1 tmp:0, c2 tmp:1).
//   2. V08 cascade: v2 read `receipts[0]?.rec`, undefined whenever V03 missed, so the
//      cross-run arm could never run. v3 keeps the same divergence requirements
//      (nonce, childStdoutSha256, receipt digest, clean work) now that arm 1 holds.
//   3. V09: the probe-side local run must agree with the receipt-recorded childExit
//      (consistency — v2 hardcoded `local.exit === 1`, the same base-era assumption);
//      the ledger probe's seeded L4 battery (fixture tokens via rnd()/word(), per-mutant
//      outcomes, and the aggregate `held=` count they feed) is normalized before the
//      normalized comparison; v2's detail line printed `DIFFER` whenever the exit
//      conjunct failed regardless of the comparison — v3 reports the comparison itself.
//   4. Budgets are measured, not assumed (plan.md two-step rule): under the r70-committed
//      900 000 ms tool cap, this round's fresh receipts (measure/m1-*.txt) record
//      c1/donothing killed at 900046 ms and c1/autoledger at 900040 ms (childExit=-1,
//      SIGTERM) — the cap no longer held on this host. Under a 2 400 000 ms scaffold cap
//      the same modes completed at 921210 ms / 922358 ms (measure/s1-*.txt), so
//      toolBudget = ceil(1.25 x 922358 / 60 s) x 60 s = 1 200 000 ms (the tool constant
//      lands at that value + re-pin in the same commit; r70 precedent 89cbd998). Counter
//      waits = toolBudget + 60 s. V2 killed the decoy arm at 300 000 ms (`tool-exit=null`
//      — the documented spawnSync timeout kill, S220) and raced the fixture self-spawn at
//      600 000 ms. V13's mode is c2/donothing: the measured 2-way pair (conc-c2d-*.txt)
//      ran 689670/689597 ms with both childExit=0 — inside the budget, where v2's
//      c1/donothing pair died at the then-900 s cap. Measured V13 corollary: the early
//      finisher on a SHARED work root can exit 1 (its own workEmpty check counts the late
//      child) — v2's `both tool exits 0` expectation is unreliable under contention by
//      design, so v13 requires both RECEIPTS (childExit=0, digested, distinct workChild +
//      nonce) and a clean root after both settle, not both process exits.
//   5. The v2 counter's bytes join the frozen set (scored history must not drift).
// No universal forgery-resistance is claimed: the disclosed residual is a stub that fully
// implements the receipt format AND the per-mode control-output shape (V09's normalization
// absorbs seeded battery detail, so a shape-replaying stub remains the named residual);
// its receipts still cannot match the probe-side cross-check without running the control.
//
// usage: node replay71-probe.mjs <lane> <40-hex-rev> [--reference-lane DIR]
//   --reference-lane: working checkout carrying the frozen bytes (defaults to <lane>);
//   required when <lane> is a throwaway attack fixture that cannot contain the origin
//   commit's bytes. exit: 0 all active arms held | 1 any MISS | 2 internal error | 64 usage.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync, spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const SELF = fileURLToPath(import.meta.url);

const BASE = '78b98d762ccf3e3a0961f94c4042eaabd2bcb706';
const FROZEN_REL = {
  c1: '.ufo/waves/round-69/probe/c1-controls.sh',
  c2: '.ufo/waves/round-69/probe/c2-controls.sh',
  v1probe: '.ufo/waves/round-70/probe/replay70-probe.mjs',
  v2probe: '.ufo/waves/round-70/probe/replay70-probe-v2.mjs',
  receipts: ['.ufo/waves/round-69/controls/c1-donothing.txt', '.ufo/waves/round-69/controls/c1-autoledger.txt',
    '.ufo/waves/round-69/controls/c2-donothing.txt', '.ufo/waves/round-69/controls/c2-autoorigin.txt',
    '.ufo/waves/round-69/controls/c2-forgecapture.txt'],
};
const MODES = [['c1', 'donothing'], ['c1', 'autoledger'], ['c2', 'donothing'], ['c2', 'autoorigin'], ['c2', 'forgecapture']];
// V13 concurrency mode: measured (see header) to fit the tool cap under 2-way contention.
const CONC_MODE = ['c2', 'donothing'];
// Budgets, derived per plan.md's two-step rule from this round's receipts (see header):
// toolBudget = 1 200 000 ms; counter waits = toolBudget + 60 s receipt-write margin.
// S220 grounds the kill semantics (a spawnSync timeout kill reports a null status).
const TOOL_WAIT_MS = 1260000;
const CONC_FAILSAFE_MS = 2520000; // 2x TOOL_WAIT; the tool's own 1200 s cap binds first
const GIT_SCRUB = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_CEILING_DIRECTORIES'];
const ENV_ALLOW = ['LANG', 'SystemRoot', 'SystemDrive', 'USERPROFILE', 'HOME', 'PATHEXT', 'ComSpec'];
const TMP_WRITE_LINE = "    printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt";
// Sanctioned-edit contract (control-replay.mjs generatePrivateCopy): each assignment line
// substituted exactly once; the unused fixed /tmp write removed in the c2 copy only.
const EXPECTED_SUBSTITUTIONS = (family) => family === 'c2'
  ? {lane: 1, probe: 1, s: 1, tmp: 1, w: 1}
  : {lane: 1, probe: 1, s: 1, tmp: 0, w: 1};

const [laneArg, rev, refFlag, refVal] = process.argv.slice(2);
if (!laneArg || !/^[a-f0-9]{40}$/.test(rev || '') || (refFlag && refFlag !== '--reference-lane')) {
  process.stderr.write('usage: replay71-probe <lane> <40-hex-rev> [--reference-lane DIR]\n');
  process.exit(64);
}
const refLane = refFlag ? refVal : laneArg;

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const canonicalize = (v) => {
  if (Array.isArray(v)) return v.map(canonicalize);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v).sort()) o[k] = canonicalize(v[k]); return o; }
  return v;
};
const digestOf = (rec) => { const c = canonicalize({...rec}); delete c.digest; return sha(Buffer.from(JSON.stringify(c), 'utf8')); };
const toSh = (p) => path.resolve(p).replace(/\\/g, '/');
const rmTree = (p) => fs.rmSync(p, {recursive: true, force: true, maxRetries: 12, retryDelay: 250});
const checks = [];
let naNotes = [];
const check = (id, ok, detail = '') => checks.push({id, ok: !!ok, detail});

const resolveOnPath = (name) => {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], {encoding: 'utf8'});
  return (r.stdout || '').split(/\r?\n/).map((s) => s.trim()).find((s) => s && fs.existsSync(s)) || null;
};
// Same shim family the tool provisions; counter-side copy so the counter never depends on
// the tree it is scoring (win32: MSYS tar rejects backslash -C paths; the base trees carry
// symlinks, so the shim also exports MSYS for the tar process itself).
const makeShims = (binDir) => {
  fs.mkdirSync(binDir, {recursive: true});
  const made = [];
  const py = spawnSync('python3', ['-c', 'pass'], {encoding: 'utf8'});
  if (py.error || py.status !== 0) {
    const real = resolveOnPath('python') || resolveOnPath('python3');
    if (!real) return {made, fault: 'python3 unavailable'};
    fs.writeFileSync(path.join(binDir, 'python3'), `#!/bin/sh\nexec '${real.replace(/\\/g, '/')}' "$@"\n`, {mode: 0o755});
    made.push('python3');
  }
  if (process.platform === 'win32') {
    const realTar = resolveOnPath('tar');
    const cygpath = resolveOnPath('cygpath');
    if (!realTar || !cygpath) return {made, fault: 'tar/cygpath unavailable'};
    fs.writeFileSync(path.join(binDir, 'tar'), [
      '#!/bin/bash', 'export MSYS=winsymlinks:nativestrict', 'out=()',
      'for a in "$@"; do', '  case "$a" in', '    [A-Za-z]:?*) a=$(cygpath -u "$a") ;;', '  esac',
      '  out+=("$a")', 'done', `exec '${realTar.replace(/\\/g, '/')}' "\${out[@]}"`, '',
    ].join('\n'), {mode: 0o755});
    made.push('tar');
  }
  return {made, fault: null};
};
const hermeticEnv = (binDir) => {
  const env = {};
  for (const k of Object.keys(process.env)) if (ENV_ALLOW.includes(k)) env[k] = process.env[k];
  const shims = makeShims(binDir);
  if (shims.fault) return {fault: shims.fault};
  const sep = process.platform === 'win32' ? ';' : ':';
  env.PATH = binDir + sep + (process.env.PATH || '');
  env.TMPDIR = toSh(binDir);
  env.HYAKU_SCRATCH = toSh(binDir);
  env.PYTHONUTF8 = '1';
  if (process.platform === 'win32') env.MSYS = 'winsymlinks:nativestrict';
  return {env, fault: null};
};
// Extract the tree at REV the same way the frozen counter does (bash pipeline into mkdtemp).
const extractTree = (root, src, revision) => {
  const tree = path.join(root, 'tree');
  fs.mkdirSync(tree, {recursive: true});
  const binDir = path.join(root, 'bin');
  const he = hermeticEnv(binDir);
  if (he.fault) throw new Error('shims:' + he.fault);
  const r = spawnSync('bash', ['-c', 'set -o pipefail; git -C "$1" archive "$2" scripts corpus SKILL.md SCORECARD.md .ufo/pins .ufo/waves/round-69/probe .ufo/waves/round-69/controls .ufo/waves/round-70/probe | tar -x --no-same-owner --no-same-permissions -C "$3"', 'x', toSh(src), revision, toSh(tree)],
    {encoding: 'utf8', maxBuffer: 1024 * 1024, env: he.env});
  if (r.status !== 0) throw new Error('archive:' + (r.stderr || r.stdout || ('status ' + r.status)));
  return {tree, env: he.env};
};
// Probe-side private copy generation (same rules as the tool; asserted counts).
const privateCopy = (src, probeName, {laneSh, wSh, sSh}) => {
  const counts = {lane: 0, probe: 0, w: 0, s: 0, tmp: 0};
  const lines = src.split('\n').map((line) => {
    if (line === 'LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin') { counts.lane++; return `LANE='${laneSh}'`; }
    if (line === `PROBE="$LANE/.ufo/waves/round-69/probe/${probeName}"`) { counts.probe++; return line; }
    if (line === 'W="$LANE/.ufo/waves/round-69/controls"') { counts.w++; return `W='${wSh}'`; }
    if (line.startsWith('S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/') && line.endsWith('"')) { counts.s++; return `S='${sSh}'`; }
    if (line === TMP_WRITE_LINE) { counts.tmp++; return ''; }
    return line;
  });
  return {text: lines.join('\n'), counts};
};
// Minimal-env child runner (counter-side runs are as hermetic as the tool's).
const runControlLocally = (root, env, src, probeName, mode, laneSh) => {
  const child = fs.mkdtempSync(path.join(root, 'local-'));
  const wSh = toSh(path.join(child, 'out'));
  const sSh = toSh(path.join(child, 'fx'));
  fs.mkdirSync(path.join(child, 'out'), {recursive: true});
  const {text, counts} = privateCopy(src, probeName, {laneSh, wSh, sSh});
  if (counts.lane !== 1 || counts.probe !== 1 || counts.w !== 1 || counts.s !== 1) return {error: 'substitution'};
  const script = path.join(child, 'private.sh');
  fs.writeFileSync(script, text, {mode: 0o755});
  const childEnv = {...env};
  for (const k of GIT_SCRUB) delete childEnv[k];
  const r = spawnSync('bash', [toSh(script), mode], {cwd: child, env: childEnv, encoding: 'utf8', timeout: TOOL_WAIT_MS, maxBuffer: 64 * 1024 * 1024});
  const out = {stdout: r.stdout || '', exit: r.status, stderr: r.stderr || ''};
  rmTree(child);
  return out;
};
const seedBatteryNormalize = (text) => text
  .replace(/seed=[0-9a-f]+/g, 'seed=<seed>')
  // the L4 battery's fixture tokens (rnd()/word()), per-mutant outcomes and the aggregate
  // held= count they feed are seed-derived: normalize the segment to its PASS/MISS state
  .replace(/\| L4 (MISS|PASS)[^|]*/g, '| L4 $1 <seeded-battery>')
  // the verdict line's aggregate count moves with the L4 outcome; the HELD/UNMET word and
  // every deterministic segment stay verbatim
  .replace(/held=\d+\/\d+/g, 'held=<n>');
const normalize = (text, laneSh) => text
  .split('\n').map((l) => seedBatteryNormalize(l
    .replace(/[0-9a-f]{40}/g, '<rev>')
    .replace(/[A-Za-z]:[\\/][^\s|]+/g, '<p>')
    .replace(laneSh, '<lane>')))
  .join('\n');
// Inner control verdict shape: first line of the child stdout.
const INNER_VERDICT = /^(LEDGER69|DEPREC69)_(HELD|UNMET) held=\d+\/\d+ checks=\d+ rev=[0-9a-f]{40} rule=(L69|M69)/;
// The control's own record of its inner probe run: `control=<mode>[ live=<s>] exit=<n> rev=<40hex>`.
const CONTROL_LINE = /^control=(\S+)(?: live=\S+)? exit=(\d+) rev=[0-9a-f]{40}$/m;
const readReceipt = (file) => {
  const text = fs.readFileSync(file, 'utf8');
  const line = text.split('\n').filter((l) => l.startsWith('{"') && l.endsWith('}') && l.includes('"digest"')).pop();
  if (!line) return {ok: false, why: 'no-json-line', text};
  let rec;
  try { rec = JSON.parse(line); } catch { return {ok: false, why: 'unparseable', text}; }
  const digestOk = digestOf(rec) === rec.digest;
  // Exact stdout reconstruction: the display adds a newline only when the child stdout
  // does not end with one, so a marker-split that consumes the newline corrupts the
  // section for every real control (the v2/v3 sha conjunct then fails masked/unmasked).
  // Reconstruct by trying both candidates against the digest-verified recorded sha.
  let stdout = '';
  const b = text.indexOf('--- child stdout begin ---\n');
  if (b !== -1) {
    const from = b + '--- child stdout begin ---\n'.length;
    const e = text.indexOf('\n--- child stdout end ---', from);
    const raw = e === -1 ? text.slice(from) : text.slice(from, e);
    stdout = (e !== -1 && sha(Buffer.from(raw + '\n', 'utf8')) === rec.childStdoutSha256) ? raw + '\n' : raw;
  }
  return {ok: digestOk, rec, text, stdout};
};
const runTool = (tree, env, args, timeout = TOOL_WAIT_MS) => spawnSync(process.execPath, [path.join(tree, 'scripts/control-replay.mjs'), ...args],
  {cwd: tree, env: {...env}, encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024});
const modeArgs = (root, i, outDir, fm) => {
  const [family, mode] = fm || MODES[i] || ['c1', 'donothing'];
  const out = path.join(outDir, `result-${i}.txt`);
  const work = path.join(root, `work-${i}`);
  fs.mkdirSync(work, {recursive: true});
  return {out, work, args: ['--lane', laneArg, '--family', family, '--mode', mode, '--out', out, '--work', work]};
};
const hashTree = (dir) => {
  const acc = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const st = fs.lstatSync(p);
      if (st.isDirectory()) walk(p);
      else acc.push(`${path.relative(dir, p)}:${st.size}:${sha(fs.readFileSync(p)).slice(0, 16)}`);
    }
  };
  walk(dir);
  return acc.join('|');
};

const root = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'replay71-'));
try {
  const {tree, env} = extractTree(root, laneArg, rev);
  const tool = path.join(tree, 'scripts/control-replay.mjs');
  const outDir = path.join(root, 'outs');
  fs.mkdirSync(outDir, {recursive: true});

  // V01 — frozen bytes at REV equal the reference checkout's frozen bytes.
  const frozenOk = [FROZEN_REL.c1, FROZEN_REL.c2, FROZEN_REL.v1probe, FROZEN_REL.v2probe, ...FROZEN_REL.receipts]
    .every((f) => { const p = path.join(tree, f); const r = path.join(refLane, f);
      return fs.existsSync(p) && fs.existsSync(r) && sha(fs.readFileSync(p)) === sha(fs.readFileSync(r)); });
  check('V01', frozenOk, 'frozen bytes match reference');

  // V02 — hermetic selftest.
  const st = runTool(tree, env, ['--selftest']);
  check('V02', st.status === 0 && /CONTROL_REPLAY_SELFTEST: PASS \(\d+\/\d+\)/.test(st.stdout || ''), `selftest exit=${st.status}`);

  // V03..V07 — the five replays with structured receipts and preservation.
  const receipts = [];
  for (const [i, [family, mode]] of MODES.entries()) {
    const {out, work, args} = modeArgs(root, i, outDir);
    const before = FROZEN_REL.receipts.map((f) => sha(fs.readFileSync(path.join(tree, f))));
    const r = runTool(tree, env, args);
    const rulePrefix = family === 'c1' ? 'LEDGER69' : 'DEPREC69';
    const after = FROZEN_REL.receipts.map((f) => sha(fs.readFileSync(path.join(tree, f))));
    let ok = r.status === 0 && fs.existsSync(out) && fs.readdirSync(work).length === 0 && before.join() === after.join();
    let detail = `exit=${r.status}`;
    let rec = null;
    if (ok) {
      const parsed = readReceipt(out);
      rec = parsed.rec || null;
      const verdict = INNER_VERDICT.exec(parsed.stdout);
      const ctlLine = CONTROL_LINE.exec(parsed.stdout);
      ok = parsed.ok && rec
        && parsed.text.includes(`CONTROL-PASS ${mode}`)
        && rec.childExit === 0 // the CONTROL-PASS exit: control-replay.mjs exit map, round-71 fix for the v2 `=== 1` bug
        && !!verdict && verdict[1] === rulePrefix
        && !!ctlLine && ctlLine[1] === mode
        && Number(ctlLine[2]) === (verdict[2] === 'HELD' ? 0 : 1) // inner exit matches the inner verdict
        && rec.nonce && rec.workChild
        && Array.isArray(rec.scrubbedEnv?.gitRemoved)
        && JSON.stringify(canonicalize(rec.substitutions || {})) === JSON.stringify(canonicalize(EXPECTED_SUBSTITUTIONS(family)))
        && sha(Buffer.from(parsed.stdout, 'utf8')) === rec.childStdoutSha256;
      detail += ` digest=${parsed.ok ? 'ok' : 'BAD'} childExit=${rec ? rec.childExit : '?'}`;
    }
    if (ok) receipts.push({family, mode, out, rec});
    check('V' + String(i + 3).padStart(2, '0'), ok, `family=${family} mode=${mode} ${detail}`);
  }

  // V08 — cross-run divergence on the first mode (uncoupled from V03's verdict this time;
  // the second run must still complete honestly for the comparison to mean anything).
  {
    const {out, work, args} = modeArgs(root, 8, outDir);
    const r = runTool(tree, env, args);
    const first = receipts[0]?.rec;
    const second = r.status === 0 && fs.existsSync(out) ? readReceipt(out).rec : null;
    check('V08', !!first && !!second
      && first.nonce !== second?.nonce
      && first.childStdoutSha256 !== second?.childStdoutSha256
      && first.digest !== second?.digest
      && fs.readdirSync(work).length === 0, 'two runs diverge');
  }

  // V09 — probe-side structural cross-check (c1 donothing): the counter runs the same
  // private-copy pipeline itself and compares normalized shape with the receipt. The
  // local exit must EQUAL the receipt-recorded childExit (consistency, not a hardcoded
  // constant), and the comparison reported in the detail is the comparison itself.
  {
    const local = runControlLocally(root, env, fs.readFileSync(path.join(tree, FROZEN_REL.c1), 'utf8'), 'ledger69-probe.mjs', 'donothing', toSh(laneArg));
    const rec = receipts[0]?.rec;
    const recStdout = receipts[0] ? readReceipt(receipts[0].out).stdout : '';
    const equal = rec ? normalize(local.stdout, toSh(laneArg)) === normalize(recStdout, toSh(laneArg)) : false;
    const ok = rec && local.exit !== null && local.exit === rec.childExit && equal;
    check('V09', ok, `probe-local exit=${local.exit} receipt-childExit=${rec ? rec.childExit : '?'} normalized ${rec ? (equal ? 'equal' : 'DIFFER') : 'no-receipt'}`);
  }

  // V10 — invalid-args matrix: exit 64 each, no --out, no writes in the work dir.
  {
    const shapes = [
      ['--family', 'junk'],
      ['--lane', laneArg, '--mode', 'donothing', '--out', path.join(outDir, 'u1'), '--work', root],
      ['--lane', laneArg, '--family', 'c1', '--out', path.join(outDir, 'u2'), '--work', root],
      ['--lane', laneArg, '--family', 'c1', '--mode', 'bogus', '--out', path.join(outDir, 'u3'), '--work', root],
      ['--selftest', '--family', 'c1'],
      ['--lane', path.join(tree, 'SKILL.md'), '--family', 'c1', '--mode', 'donothing', '--out', path.join(outDir, 'u4'), '--work', root],
    ];
    let ok = true;
    const details = [];
    for (const [si, shape] of shapes.entries()) {
      const work = path.join(root, `u-work-${si}`);
      fs.mkdirSync(work, {recursive: true});
      const fixed = shape.map((v) => (v === root ? work : v));
      const outName = fixed.includes('-out') ? fixed[fixed.indexOf('-out') + 1] : null;
      const r = runTool(tree, env, fixed);
      const clean = fs.readdirSync(work).length === 0 && (!outName || !fs.existsSync(outName));
      if (r.status !== 64 || !clean) { ok = false; details.push(`shape${si}:exit=${r.status},clean=${clean}`); }
    }
    check('V10', ok, details.join(';') || 'all six shapes exit 64 side-effect-free');
  }

  // V11 — existing output refused; dangling symlink refused (n/a when the host cannot link).
  {
    const existing = path.join(outDir, 'existing.txt');
    fs.writeFileSync(existing, 'do-not-overwrite\n');
    const work = path.join(root, 'r9-work');
    fs.mkdirSync(work, {recursive: true});
    const r = runTool(tree, env, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', existing, '--work', work]);
    const first = r.status !== 0 && fs.readFileSync(existing, 'utf8') === 'do-not-overwrite\n';
    let linkOk = null;
    const linkPath = path.join(outDir, 'dangling.txt');
    try {
      fs.symlinkSync(path.join(root, 'no-such-target.txt'), linkPath, 'file');
      const r2 = runTool(tree, env, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', linkPath, '--work', work]);
      linkOk = r2.status !== 0 && !fs.existsSync(path.join(root, 'no-such-target.txt')) && fs.lstatSync(linkPath).isSymbolicLink();
      fs.rmSync(linkPath, {force: true});
    } catch (e) {
      if (e.code === 'EPERM' || e.code === 'EACCES') { naNotes.push('V11-symlink n/a (host denies symlink creation)'); linkOk = null; }
      else throw e;
    }
    check('V11', first && linkOk !== false, `existing=${first} link=${linkOk === null ? 'n/a' : linkOk}`);
  }

  // V12 — git-environment decoy: poisoned GIT_* must not redirect fixture git ops.
  // Measured budget (see header): v2 killed this arm at 300 000 ms (tool-exit=null, the
  // S220-documented spawnSync timeout kill); the c1 donothing replay needs 643-787 s here.
  {
    const decoy = path.join(root, 'decoy');
    fs.mkdirSync(decoy, {recursive: true});
    fs.writeFileSync(path.join(decoy, 'canary.txt'), 'decoy\n');
    const g = (...a) => spawnSync('git', ['-C', decoy, ...a], {encoding: 'utf8'});
    g('init', '-q');
    g('add', '-A');
    g('-c', 'user.name=d', '-c', 'user.email=d@invalid', 'commit', '-q', '--no-verify', '-m', 'decoy');
    const before = hashTree(path.join(decoy, '.git'));
    const headBefore = g('rev-parse', 'HEAD').stdout;
    const {out, work, args} = modeArgs(root, 12, outDir);
    const poisoned = {
      GIT_DIR: path.join(decoy, '.git'), GIT_WORK_TREE: decoy, GIT_INDEX_FILE: path.join(decoy, '.git', 'index'),
      GIT_OBJECT_DIRECTORY: path.join(decoy, '.git', 'objects'), GIT_COMMON_DIR: path.join(decoy, '.git'),
      GIT_NAMESPACE: 'poison', GIT_CEILING_DIRECTORIES: decoy,
      GIT_ALTERNATE_OBJECT_DIRECTORIES: path.join(decoy, '.git', 'objects'),
    };
    const r = runTool(tree, {...env, ...poisoned}, args);
    const rec = fs.existsSync(out) ? readReceipt(out).rec : null;
    const after = hashTree(path.join(decoy, '.git'));
    const headAfter = g('rev-parse', 'HEAD').stdout;
    check('V12', r.status === 0 && before === after && headBefore === headAfter
      && rec && rec.scrubbedEnv?.policy === 'allow-list'
      && GIT_SCRUB.every((k) => (rec.scrubbedEnv?.gitRemoved || []).includes(k))
      && fs.readdirSync(work).length === 0,
      `decoy-unchanged=${before === after} tool-exit=${r.status}`);
  }

  // V13 — concurrent invocations sharing one --work root, on the measured concurrency mode
  // (see header: v2's c1/donothing pair died at the tool's own 900 s cap under contention).
  {
    const work = path.join(root, 'conc-work');
    fs.mkdirSync(work, {recursive: true});
    const outs = [path.join(outDir, 'cc-1.txt'), path.join(outDir, 'cc-2.txt')];
    const children = outs.map((o) => spawn(process.execPath, [path.join(tree, 'scripts/control-replay.mjs'),
      '--lane', laneArg, '--family', CONC_MODE[0], '--mode', CONC_MODE[1], '--out', o, '--work', work],
      {cwd: tree, env: {...env}}));
    const results = await Promise.all(children.map((c) => new Promise((res) => {
      const killer = setTimeout(() => { try { c.kill(); } catch {} }, CONC_FAILSAFE_MS);
      c.on('close', (code) => { clearTimeout(killer); res({code}); });
    })));
    const parsed = outs.filter((o) => fs.existsSync(o)).map((o) => readReceipt(o));
    const recs = parsed.map((p) => p.rec);
    // Measured corollary (conc-c2d-*.txt): on a shared work root the early finisher can
    // exit 1 — its own workEmpty check counts the late child — so the arm requires the
    // RECEIPTS (both controls really ran, digested, distinct children/nonces) and a clean
    // root after both settle, not both process exits.
    check('V13', parsed.every((p) => p.ok) && recs.length === 2 && !!recs[0] && !!recs[1]
      && recs[0].childExit === 0 && recs[1].childExit === 0
      && recs[0].workChild !== recs[1].workChild && recs[0].nonce !== recs[1].nonce
      && fs.readdirSync(work).length === 0,
      `exits=${results.map((r) => r.code).join(',')} childExits=${recs.map((r) => r ? r.childExit : '?').join(',')} distinctChildren=${recs.length === 2 && !!recs[0] && !!recs[1] && recs[0].workChild !== recs[1].workChild}`);
  }

  // V14 — registration triad, plus this counter's own pin and the frozen v2 pin.
  {
    const skill = fs.readFileSync(path.join(tree, 'SKILL.md'), 'utf8');
    const score = fs.readFileSync(path.join(tree, 'SCORECARD.md'), 'utf8');
    let pins = {pins: []};
    try { pins = JSON.parse(fs.readFileSync(path.join(tree, '.ufo/pins/counter-pins.json'), 'utf8')); } catch {}
    const toolBytes = fs.readFileSync(tool);
    const v2Bytes = fs.readFileSync(path.join(tree, FROZEN_REL.v2probe));
    const selfBytes = fs.readFileSync(SELF);
    check('V14', skill.includes('| control-replay |') && score.includes('| control-replay |')
      && skill.includes('| replay71-probe |') && score.includes('| replay71-probe |')
      && pins.pins.some((p) => p.path === 'scripts/control-replay.mjs' && p.sha256 === sha(toolBytes))
      && pins.pins.some((p) => p.path === FROZEN_REL.v2probe && p.sha256 === sha(v2Bytes))
      && pins.pins.some((p) => p.path === '.ufo/waves/round-71/probe/replay71-probe.mjs' && p.sha256 === sha(selfBytes)),
      'SKILL + SCORECARD rows and tool/v2/v3 pins');
  }

  // V15..V17 — live attack fixtures scored by this probe itself; each must read UNMET.
  // Recursive invocations (the arms below spawn this probe) skip the arms so the attack
  // battery cannot recurse into itself.
  const skipAttacks = process.env.REPLAY71_SKIP_ATTACKS === '1';
  const stubs = skipAttacks ? {} : {
    'V15-print-only': [
      '#!/usr/bin/env node',
      '// attack: prints the PASS banner, writes nothing',
      "if (process.argv[2] === '--selftest') { console.log('CONTROL_REPLAY_SELFTEST: PASS (20/20)'); console.log('EXIT_MAP: x'); process.exit(0); }",
      "console.log('CONTROL-PASS ' + (process.argv[process.argv.indexOf('--mode') + 1] || ''));",
      'process.exit(0);',
    ].join('\n'),
    'V16-canned-writer': [
      '#!/usr/bin/env node',
      '// attack: writes the frozen counter\u2019s expected substrings; runs nothing (seat K70AttackPrintStub C2)',
      'import fs from "node:fs";',
      "if (process.argv[2] === '--selftest') { console.log('CONTROL_REPLAY_SELFTEST: PASS (20/20)'); process.exit(0); }",
      'const a = process.argv; const val = (n) => a[a.indexOf(n) + 1];',
      "const family = val('--family'), mode = val('--mode'), out = val('--out'), work = val('--work');",
      "if (!fs.existsSync(val('--lane')) || !['c1','c2'].includes(family) || !(family === 'c1' ? ['donothing','autoledger'] : ['donothing','autoorigin','forgecapture']).includes(mode) || fs.existsSync(out)) process.exit(64);",
      "const label = family === 'c1' ? 'LEDGER69_UNMET held=2/7 checks=7 rev=deadbeefdeadbeefdeadbeefdeadbeefdeadbeef rule=L69' : 'DEPREC69_UNMET held=8/11 checks=11 rev=deadbeefdeadbeefdeadbeefdeadbeefdeadbeef rule=M69';",
      "fs.writeFileSync(out, label + '\\ncontrol=' + mode + ' exit=1\\nCONTROL-PASS ' + mode + '\\n', {flag: 'wx'});",
      'process.exit(0);',
    ].join('\n'),
    'V17-mutate-then-refuse': [
      '#!/usr/bin/env node',
      '// attack: mutates the work dir before the usage refusal (seat K70ReviewCounterR8 F1)',
      'import fs from "node:fs";',
      "if (process.argv[2] === '--selftest') { console.log('CONTROL_REPLAY_SELFTEST: PASS (20/20)'); process.exit(0); }",
      'const a = process.argv; const val = (n) => a[a.indexOf(n) + 1];',
      "const family = val('--family'), out = val('--out'), work = val('--work');",
      "if (family === 'junk' || !family) { if (work) fs.writeFileSync(work + '/invalid-args-ran-a-write', 'marker'); process.exit(64); }",
      "fs.writeFileSync(out, 'LEDGER69_UNMET\\nCONTROL-PASS ' + val('--mode') + '\\n', {flag: 'wx'});",
      'process.exit(0);',
    ].join('\n'),
  };
  for (const [arm, body] of Object.entries(stubs)) {
    const fixture = path.join(root, 'fx-' + arm);
    fs.mkdirSync(path.join(fixture, 'scripts'), {recursive: true});
    fs.mkdirSync(path.join(fixture, '.ufo/pins'), {recursive: true});
    fs.mkdirSync(path.join(fixture, '.ufo/waves/round-69/probe'), {recursive: true});
    fs.mkdirSync(path.join(fixture, '.ufo/waves/round-69/controls'), {recursive: true});
    fs.mkdirSync(path.join(fixture, '.ufo/waves/round-70/probe'), {recursive: true});
    fs.mkdirSync(path.join(fixture, '.ufo/waves/round-71/probe'), {recursive: true});
    // frozen r69 + r70 bytes copied from the reference checkout; the TOOL is the stub
    for (const f of [FROZEN_REL.c1, FROZEN_REL.c2, FROZEN_REL.v1probe, FROZEN_REL.v2probe,
      '.ufo/waves/round-69/probe/ledger69-probe.mjs', '.ufo/waves/round-69/probe/deprec69-probe.mjs',
      '.ufo/waves/round-71/probe/replay71-probe.mjs']) {
      fs.mkdirSync(path.dirname(path.join(fixture, f)), {recursive: true});
      fs.copyFileSync(path.join(refLane, f), path.join(fixture, f));
    }
    for (const f of FROZEN_REL.receipts) fs.copyFileSync(path.join(refLane, f), path.join(fixture, f));
    fs.mkdirSync(path.join(fixture, 'corpus'), {recursive: true});
    fs.writeFileSync(path.join(fixture, 'corpus/README.md'), '# fixture corpus\n');
    fs.writeFileSync(path.join(fixture, 'SKILL.md'), '# f\n\n| control-replay | gate | x |\n\n| replay71-probe | gate | x |\n');
    fs.writeFileSync(path.join(fixture, 'SCORECARD.md'), '# s\n\n| control-replay | stub |\n\n| replay71-probe | stub |\n');
    fs.writeFileSync(path.join(fixture, 'scripts/control-replay.mjs'), body);
    fs.writeFileSync(path.join(fixture, '.ufo/pins/counter-pins.json'), JSON.stringify({
      version: 1,
      pins: [
        {round: 70, name: 'control-replay', path: 'scripts/control-replay.mjs', sha256: sha(Buffer.from(body))},
        {round: 70, name: 'replay70-probe-v2', path: FROZEN_REL.v2probe, sha256: sha(fs.readFileSync(path.join(refLane, FROZEN_REL.v2probe)))},
        {round: 71, name: 'replay71-probe', path: '.ufo/waves/round-71/probe/replay71-probe.mjs', sha256: sha(fs.readFileSync(SELF))},
      ],
    }, null, 2) + '\n');
    const git = (...a) => spawnSync('git', ['-C', fixture, ...a], {encoding: 'utf8'});
    git('init', '-q');
    git('add', '-A');
    git('-c', 'user.name=fx', '-c', 'user.email=fx@invalid', 'commit', '-q', '--no-verify', '-m', 'fixture');
    const fixtureRev = git('rev-parse', 'HEAD').stdout.trim();
    const self = spawnSync(process.execPath, [SELF, fixture, fixtureRev, '--reference-lane', refLane],
      {encoding: 'utf8', timeout: TOOL_WAIT_MS, maxBuffer: 16 * 1024 * 1024, env: {...process.env, REPLAY71_SKIP_ATTACKS: '1'}});
    const verdict = (self.stdout || '').split('\n')[0] || '';
    check(arm, self.status === 1 && verdict.startsWith('REPLAY71_UNMET'), `${verdict.slice(0, 400)} exit=${self.status}`);
  }

  const naCount = naNotes.length;
  const held = checks.filter((c) => c.ok).length;
  const total = checks.length - naCount;
  console.log(`REPLAY71_${held === total ? 'HELD' : 'UNMET'} held=${held}/${total} checks=${total} rev=${rev} rule=R71${naCount ? ' ' + naNotes.join(' ') : ''}`);
  for (const c of checks) if (c.ok !== null) console.log(`${c.id} ${c.ok ? 'PASS' : 'MISS'} ${c.detail}`);
  process.exitCode = held === total ? 0 : 1;
} catch (e) {
  const stackLines = String(e.stack || '').split('\n');
  console.log(`REPLAY71_ERROR rev=${rev} rule=R71 reason=${e.message} at ${stackLines[1] || 'nostack'}`);
  process.exitCode = 2;
} finally {
  rmTree(root);
}
