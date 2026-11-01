#!/usr/bin/env node
// R70 versioned counter (v2 ratchet): REPLAY70V2_HELD iff every active arm holds.
// The frozen v1 counter (.ufo/waves/round-70/probe/replay70-probe.mjs) is preserved
// byte-for-byte and remains forgeable by a canned-receipt writer (seat evidence
// K70AttackPrintStub, K70ReviewCounterR8); this v2 closes the seat-demonstrated holes:
//   - structured receipts with a canonical-JSON inner digest over the run record
//     (child exit code, stdout/stderr digests, nonce, scrub record, shims);
//   - cross-run divergence (same mode twice: nonce, fixture rev, stdout digest differ);
//   - a probe-side structural cross-check: the counter substitutes and runs the c1
//     donothing control itself and compares the NORMALIZED child stdout with what the
//     tool's receipt records (a writer that runs nothing cannot know this shape);
//   - an invalid-args matrix whose refusals must be side-effect-free;
//   - dangling-symlink and existing-output refusal arms;
//   - a git-environment decoy: poisoned GIT_* vars must not redirect the fixture git ops;
//   - concurrent invocations sharing one --work root;
//   - live attack fixtures (print-only stub, canned-receipt writer, mutate-then-refuse
//     R8 mock) run against this probe itself in throwaway fixture lanes — each must read
//     REPLAY70V2_UNMET.
// No universal forgery-resistance is claimed: a stub that fully implements the receipt
// format AND the per-mode control-output shape is the disclosed residual (its receipts
// still cannot match the probe-side cross-check without running the control).
//
// usage: node replay70-probe-v2.mjs <lane> <40-hex-rev> [--reference-lane DIR]
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
  receipts: ['.ufo/waves/round-69/controls/c1-donothing.txt', '.ufo/waves/round-69/controls/c1-autoledger.txt',
    '.ufo/waves/round-69/controls/c2-donothing.txt', '.ufo/waves/round-69/controls/c2-autoorigin.txt',
    '.ufo/waves/round-69/controls/c2-forgecapture.txt'],
};
const MODES = [['c1', 'donothing'], ['c1', 'autoledger'], ['c2', 'donothing'], ['c2', 'autoorigin'], ['c2', 'forgecapture']];
const GIT_SCRUB = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_CEILING_DIRECTORIES'];
const ENV_ALLOW = ['LANG', 'SystemRoot', 'SystemDrive', 'USERPROFILE', 'HOME', 'PATHEXT', 'ComSpec'];
const TMP_WRITE_LINE = "    printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt";

const [laneArg, rev, refFlag, refVal] = process.argv.slice(2);
if (!laneArg || !/^[a-f0-9]{40}$/.test(rev || '') || (refFlag && refFlag !== '--reference-lane')) {
  process.stderr.write('usage: replay70-probe-v2 <lane> <40-hex-rev> [--reference-lane DIR]\n');
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
  const r = spawnSync('bash', [toSh(script), mode], {cwd: child, env: childEnv, encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024});
  const out = {stdout: r.stdout || '', exit: r.status, stderr: r.stderr || ''};
  rmTree(child);
  return out;
};
const normalize = (text, laneSh) => text
  .split('\n').map((l) => l
    .replace(/[0-9a-f]{40}/g, '<rev>')
    .replace(/seed=[0-9a-f]+/g, 'seed=<seed>')
    .replace(/[A-Za-z]:[\\/][^\s|]+/g, '<p>')
    .replace(laneSh, '<lane>'))
  .join('\n');
const readReceipt = (file) => {
  const text = fs.readFileSync(file, 'utf8');
  const line = text.split('\n').filter((l) => l.startsWith('{"') && l.endsWith('}') && l.includes('"digest"')).pop();
  if (!line) return {ok: false, why: 'no-json-line', text};
  let rec;
  try { rec = JSON.parse(line); } catch { return {ok: false, why: 'unparseable', text}; }
  const digestOk = digestOf(rec) === rec.digest;
  return {ok: digestOk, rec, text, stdout: text.split('--- child stdout begin ---\n')[1]?.split('\n--- child stdout end ---')[0] ?? ''};
};
const runTool = (tree, env, args, timeout = 300000) => spawnSync(process.execPath, [path.join(tree, 'scripts/control-replay.mjs'), ...args],
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

const root = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'replay70v2-'));
try {
  const {tree, env} = extractTree(root, laneArg, rev);
  const tool = path.join(tree, 'scripts/control-replay.mjs');
  const outDir = path.join(root, 'outs');
  fs.mkdirSync(outDir, {recursive: true});

  // V01 — frozen bytes at REV equal the reference checkout's frozen bytes.
  const frozenOk = [FROZEN_REL.c1, FROZEN_REL.c2, FROZEN_REL.v1probe, ...FROZEN_REL.receipts]
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
    const label = family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
    const after = FROZEN_REL.receipts.map((f) => sha(fs.readFileSync(path.join(tree, f))));
    let ok = r.status === 0 && fs.existsSync(out) && fs.readdirSync(work).length === 0 && before.join() === after.join();
    let detail = `exit=${r.status}`;
    let rec = null;
    if (ok) {
      const parsed = readReceipt(out);
      rec = parsed.rec || null;
      ok = parsed.ok && rec
        && parsed.text.includes(label) && parsed.text.includes(`CONTROL-PASS ${mode}`)
        && rec.childExit === 1 && rec.nonce && rec.workChild
        && Array.isArray(rec.scrubbedEnv?.gitRemoved)
        && sha(Buffer.from(parsed.stdout, 'utf8')) === rec.childStdoutSha256;
      detail += ` digest=${parsed.ok ? 'ok' : 'BAD'}`;
    }
    if (ok) receipts.push({family, mode, out, rec});
    check('V' + String(i + 3).padStart(2, '0'), ok, `family=${family} mode=${mode} ${detail}`);
  }

  // V08 — cross-run divergence on the first mode.
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

  // V09 — probe-side structural cross-check (c1 donothing).
  {
    const local = runControlLocally(root, env, fs.readFileSync(path.join(tree, FROZEN_REL.c1), 'utf8'), 'ledger69-probe.mjs', 'donothing', toSh(laneArg));
    const rec = receipts[0]?.rec;
    const recStdout = receipts[0] ? readReceipt(receipts[0].out).stdout : '';
    const ok = local.exit === 1 && rec
      && normalize(local.stdout, toSh(laneArg)) === normalize(recStdout, toSh(laneArg));
    check('V09', ok, `probe-local exit=${local.exit} normalized ${ok ? 'equal' : 'DIFFER'}`);
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
    const r = runTool(tree, {...env, ...poisoned}, args, 300000);
    const rec = fs.existsSync(out) ? readReceipt(out).rec : null;
    const after = hashTree(path.join(decoy, '.git'));
    const headAfter = g('rev-parse', 'HEAD').stdout;
    check('V12', r.status === 0 && before === after && headBefore === headAfter
      && rec && rec.scrubbedEnv?.policy === 'allow-list'
      && GIT_SCRUB.every((k) => (rec.scrubbedEnv?.gitRemoved || []).includes(k))
      && fs.readdirSync(work).length === 0,
      `decoy-unchanged=${before === after} tool-exit=${r.status}`);
  }

  // V13 — concurrent invocations sharing one --work root.
  {
    const work = path.join(root, 'conc-work');
    fs.mkdirSync(work, {recursive: true});
    const outs = [path.join(outDir, 'cc-1.txt'), path.join(outDir, 'cc-2.txt')];
    const children = outs.map((o, i) => spawn(process.execPath, [path.join(tree, 'scripts/control-replay.mjs'),
      '--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', o, '--work', work],
      {cwd: tree, env: {...env}}));
    const results = await Promise.all(children.map((c) => new Promise((res) => {
      let so = '';
      c.stdout.on('data', (d) => { so += d; });
      c.on('close', (code) => res({code, so}));
    })));
    const recs = outs.filter((o) => fs.existsSync(o)).map((o) => readReceipt(o).rec);
    check('V13', results.every((r) => r.code === 0) && recs.length === 2
      && !!recs[0] && !!recs[1]
      && recs[0].workChild !== recs[1].workChild && recs[0].nonce !== recs[1].nonce
      && fs.readdirSync(work).length === 0,
      `exits=${results.map((r) => r.code).join(',')} distinctChildren=${recs.length === 2 && !!recs[0] && !!recs[1] && recs[0].workChild !== recs[1].workChild}`);
  }

  // V14 — registration triad, plus this counter's own pin.
  {
    const skill = fs.readFileSync(path.join(tree, 'SKILL.md'), 'utf8');
    const score = fs.readFileSync(path.join(tree, 'SCORECARD.md'), 'utf8');
    let pins = {pins: []};
    try { pins = JSON.parse(fs.readFileSync(path.join(tree, '.ufo/pins/counter-pins.json'), 'utf8')); } catch {}
    const toolBytes = fs.readFileSync(tool);
    const v2Bytes = fs.readFileSync(SELF);
    check('V14', skill.includes('| control-replay |') && score.includes('| control-replay |')
      && pins.pins.some((p) => p.path === 'scripts/control-replay.mjs' && p.sha256 === sha(toolBytes))
      && pins.pins.some((p) => p.path === '.ufo/waves/round-70/probe/replay70-probe-v2.mjs' && p.sha256 === sha(v2Bytes)),
      'SKILL + SCORECARD rows and both pins');
  }

  // V15..V17 — live attack fixtures scored by this probe itself; each must read UNMET.
  // Recursive invocations (the arms below spawn this probe) skip the arms so the attack
  // battery cannot recurse into itself.
  const skipAttacks = process.env.REPLAY70V2_SKIP_ATTACKS === '1';
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
    // frozen r69 + r70 bytes copied from the reference checkout; the TOOL is the stub
    for (const f of [FROZEN_REL.c1, FROZEN_REL.c2, FROZEN_REL.v1probe,
      '.ufo/waves/round-69/probe/ledger69-probe.mjs', '.ufo/waves/round-69/probe/deprec69-probe.mjs',
      '.ufo/waves/round-70/probe/replay70-probe-v2.mjs']) {
      fs.mkdirSync(path.dirname(path.join(fixture, f)), {recursive: true});
      fs.copyFileSync(path.join(refLane, f), path.join(fixture, f));
    }
    for (const f of FROZEN_REL.receipts) fs.copyFileSync(path.join(refLane, f), path.join(fixture, f));
    fs.mkdirSync(path.join(fixture, 'corpus'), {recursive: true});
    fs.writeFileSync(path.join(fixture, 'corpus/README.md'), '# fixture corpus\n');
    fs.writeFileSync(path.join(fixture, 'SKILL.md'), '# f\n\n| control-replay | gate | x |\n');
    fs.writeFileSync(path.join(fixture, 'SCORECARD.md'), '# s\n\n| control-replay | stub |\n');
    fs.writeFileSync(path.join(fixture, 'scripts/control-replay.mjs'), body);
    fs.writeFileSync(path.join(fixture, '.ufo/pins/counter-pins.json'), JSON.stringify({
      version: 1,
      pins: [
        {round: 70, name: 'control-replay', path: 'scripts/control-replay.mjs', sha256: sha(Buffer.from(body))},
        {round: 70, name: 'replay70-probe-v2', path: '.ufo/waves/round-70/probe/replay70-probe-v2.mjs', sha256: sha(fs.readFileSync(SELF))},
      ],
    }, null, 2) + '\n');
    const git = (...a) => spawnSync('git', ['-C', fixture, ...a], {encoding: 'utf8'});
    git('init', '-q');
    git('add', '-A');
    git('-c', 'user.name=fx', '-c', 'user.email=fx@invalid', 'commit', '-q', '--no-verify', '-m', 'fixture');
    const fixtureRev = git('rev-parse', 'HEAD').stdout.trim();
    const self = spawnSync(process.execPath, [SELF, fixture, fixtureRev, '--reference-lane', refLane],
      {encoding: 'utf8', timeout: 600000, maxBuffer: 16 * 1024 * 1024, env: {...process.env, REPLAY70V2_SKIP_ATTACKS: '1'}});
    const verdict = (self.stdout || '').split('\n')[0] || '';
    check(arm, self.status === 1 && verdict.startsWith('REPLAY70V2_UNMET'), `${verdict.slice(0, 400)} exit=${self.status}`);
  }

  const naCount = naNotes.length;
  const held = checks.filter((c) => c.ok).length;
  const total = checks.length - naCount;
  console.log(`REPLAY70V2_${held === total ? 'HELD' : 'UNMET'} held=${held}/${total} checks=${total} rev=${rev} rule=R70v2${naCount ? ' ' + naNotes.join(' ') : ''}`);
  for (const c of checks) if (c.ok !== null) console.log(`${c.id} ${c.ok ? 'PASS' : 'MISS'} ${c.detail}`);
  process.exitCode = held === total ? 0 : 1;
} catch (e) {
  const stackLines = String(e.stack || '').split('\n');
  console.log(`REPLAY70V2_ERROR rev=${rev} rule=R70v2 reason=${e.message} at ${stackLines[1] || 'nostack'}`);
  process.exitCode = 2;
} finally {
  rmTree(root);
}
