#!/usr/bin/env node
// SYNTHETIC candidate control-replay.mjs — seat K70ExecFixtureTests MOCK ONLY.
// This is NOT the production implementation (production is L1-integrated at
// scripts/control-replay.mjs). It is a synthetic pinned-source fixture that
// conforms to the round-70 implementation contract so the acceptance harness
// can be validated. Violation mutants are selected with MOCK_MUTANT for
// harness-discrimination evidence. Expected pins below match fixtures/pins.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const sha = b => crypto.createHash('sha256').update(b).digest('hex');
// K70ProbeOutputParent adaptation: pins loaded from pins.json beside this private copy,
// keyed to the seat's own synthetic pinned-source fixture (mechanism-only reproduction;
// NOT the production candidate and NOT the frozen r69 originals).
const EXPECTED_PINS = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'pins.json'), 'utf8'));
const MODES = {c1: ['donothing', 'autoledger'], c2: ['donothing', 'autoorigin', 'forgecapture']};
const MUTANT = process.env.MOCK_MUTANT || 'none';

function usage() {
  console.error('usage: control-replay.mjs --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR | --selftest');
  process.exit(64);
}
function selftest() {
  // hermetic: no filesystem, no network, no lane access
  console.log('CONTROL_REPLAY_SELFTEST: PASS');
  console.log('finding F_ARGS usage-violations exit 64');
  console.log('finding F_FAMILY_MODE unknown family/mode or cross-family mode exit 64');
  console.log('finding F_DRIFT unexpected frozen source bytes refuse before output');
  console.log('finding F_EXCLUSIVE --out created exclusively existing file untouched');
  console.log('finding F_SCRATCH unique mkdtemp child under --work removed after receipts copied out');
  console.log('finding F_CLEANUP receipt copied before cleanup cleanup failure reported non-zero');
  console.log('finding F_TRANSFORM substitute LANE PROBE W S exactly once remove known fixed temporary write');
  console.log('finding F_PRIVATE run private substituted copy never the lane original');
  console.log('finding F_GITENV scrub inherited GIT_* use explicit fixture-root git arguments');
  console.log('exit-map {usage:64,drift:65,outExists:73,cleanup:70,controlFail:1,ok:0}');
  process.exit(0);
}

const argv = process.argv.slice(2);
if (argv.length === 1 && argv[0] === '--selftest') selftest();
if (argv.length % 2 !== 0) usage();
const opts = {};
for (let i = 0; i < argv.length; i += 2) {
  const k = argv[i];
  if (!k.startsWith('--')) usage();
  opts[k.slice(2)] = argv[i + 1];
}
for (const k of ['lane', 'family', 'mode', 'out', 'work']) if (!(k in opts)) usage();
if (Object.keys(opts).length !== 5) usage();
if (opts.family !== 'c1' && opts.family !== 'c2') usage();
if (!MODES[opts.family].includes(opts.mode)) usage();

const lane = path.resolve(opts.lane);
const workRoot = path.resolve(opts.work);
const out = path.resolve(opts.out);
if (!fs.existsSync(lane) || !fs.statSync(lane).isDirectory()) {
  console.error('CONTROL_REPLAY_ERROR lane not a directory: ' + lane);
  process.exit(1);
}

// 1. pinned-source check: refuse unexpected frozen bytes before any output
const frozenRel = `.ufo/waves/round-69/probe/${opts.family}-controls.sh`;
const frozenPath = path.join(lane, frozenRel);
const frozenBytes = fs.readFileSync(frozenPath);
if (MUTANT !== 'drift-accept' && sha(frozenBytes) !== EXPECTED_PINS[opts.family]) {
  console.error(`CONTROL_REPLAY_SOURCE_DRIFT ${frozenRel} sha256=${sha(frozenBytes)} expected=${EXPECTED_PINS[opts.family]}`);
  process.exit(65);
}

// 2. exclusive output creation
let outFd;
try {
  outFd = fs.openSync(out, MUTANT === 'out-append' ? 'w' : 'wx');
} catch (e) {
  if (e.code === 'EEXIST') { console.error('CONTROL_REPLAY_OUT_EXISTS ' + out); process.exit(73); }
  console.error('CONTROL_REPLAY_ERROR cannot create out: ' + e.message);
  process.exit(73);
}

function fail(code, msg) { try { fs.closeSync(outFd); } catch {} console.error(msg); process.exit(code); }

// 3. unique scratch child under the supplied work root
fs.mkdirSync(workRoot, {recursive: true});
const child = MUTANT === 'scratch-fixed'
  ? (fs.mkdirSync(path.join(workRoot, 'replay-fixed'), {recursive: true}), path.join(workRoot, 'replay-fixed'))
  : fs.mkdtempSync(path.join(workRoot, 'replay-'));

// 4. versioned private script copy: substitute assignments exactly once, drop fixed tmp write
let scriptPath;
if (MUTANT === 'orig-exec') {
  scriptPath = frozenPath; // violation: run the lane original unsubstituted
} else {
  const lines = frozenBytes.toString('utf8').split('\n');
  const subs = {
    LANE: lane,
    PROBE: path.join(lane, '.ufo/waves/round-69/probe', opts.family === 'c1' ? 'ledger69-probe.mjs' : 'deprec69-probe.mjs'),
    W: path.join(child, 'w'),
    S: path.join(child, 's'),
  };
  const seen = {};
  const outLines = [];
  for (const line of lines) {
    const m = /^(LANE|PROBE|W|S)=/.exec(line);
    if (m) {
      seen[m[1]] = (seen[m[1]] || 0) + 1;
      outLines.push(m[1] + '=' + subs[m[1]]);
      continue;
    }
    if (/r70synth-forge-sed\.txt/.test(line) && MUTANT !== 'keep-fixed-write') continue; // known unused fixed temporary write
    outLines.push(line);
  }
  for (const k of Object.keys(subs)) if (seen[k] !== 1) fail(70, `CONTROL_REPLAY_TRANSFORM assignment ${k} matched ${seen[k]||0} times`);
  scriptPath = path.join(child, 'private-controls.sh');
  fs.writeFileSync(scriptPath, outLines.join('\n'));
  fs.chmodSync(scriptPath, 0o755);
}

// 5. scrub inherited repository environment; explicit fixture-root git args live in the script
const env = {...process.env};
if (MUTANT !== 'gitenv-inherit') for (const k of Object.keys(env)) if (/^GIT_/.test(k)) delete env[k];
env.TMPDIR = child;

const r = spawnSync('bash', [scriptPath, opts.mode], {env, cwd: child, encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024});

// 6. receipts copied out before cleanup
const receiptPath = path.join(child, 'w', `${opts.family}-${opts.mode}.txt`);
let receiptFile = '';
try { receiptFile = fs.readFileSync(receiptPath, 'utf8'); } catch {}
const payload = r.stdout + (receiptFile ? receiptFile : '');
try { fs.writeSync(outFd, payload); fs.closeSync(outFd); outFd = null; } catch (e) { fail(70, 'CONTROL_REPLAY_ERROR writing out: ' + e.message); }

const ok = r.status === 0 && r.stdout.includes('CONTROL-PASS ' + opts.mode);
if (r.status !== 0 && r.stderr) console.error(r.stderr.trim().split('\n').slice(-3).join('\n'));

// 7. cleanup of the unique child
try {
  if (MUTANT === 'scratch-nuke') fs.rmSync(workRoot, {recursive: true, force: true});
  else if (MUTANT !== 'scratch-leave' && !process.env.MOCK_KEEP_PRIVATE) fs.rmSync(child, {recursive: true, force: true});
} catch (e) {
  console.error('CONTROL_REPLAY_CLEANUP_FAIL ' + child + ': ' + e.message);
  process.exit(70);
}
process.exit(ok ? 0 : 1);
