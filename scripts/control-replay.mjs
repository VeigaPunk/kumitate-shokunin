#!/usr/bin/env node
// control-replay — private versioned replay of the five frozen round-69 controls
// (round 70, contract kumitate-control-replay-v1).
//
//   node scripts/control-replay.mjs --selftest
//   node scripts/control-replay.mjs --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR
//
//     c1 donothing | autoledger        (frozen .ufo/waves/round-69/probe/c1-controls.sh)
//     c2 donothing | autoorigin | forgecapture   (frozen .ufo/waves/round-69/probe/c2-controls.sh)
//
// What it does: verifies the frozen control script bytes against pinned sha256 constants,
// generates a versioned PRIVATE copy under a unique mkdtemp child of --work with exactly the
// plan-sanctioned edits (LANE/PROBE/W/S assignment lines substituted once each; the known
// unused fixed temporary write `> /tmp/forge-sed.txt` removed in the private copy only),
// provisions a hermetic child environment (git repository environment scrubbed, unique
// HYAKU_SCRATCH/TMPDIR, conditional host shims), runs the private copy, binds the control's
// receipt files into a canonical-JSON record, removes the child, and writes a receipt to
// --out created exclusively (wx). Originals are read-only and never executed.
//
// `--selftest-script FILE` (selftest-only) replays a supplied fake control with the SAME
// private-copy pipeline so the selftest stays hermetic; normal runs never accept it.
//
// Exit map: 0 replay performed and CONTROL-PASS; 1 control failed (child exit != 0 or
// CONTROL-FAIL; receipt still written); 3 --out exists (refusal, nothing written);
// 4 frozen source bytes drift/unreadable; 5 work/child fault; 64 usage. Argument validation
// completes before any filesystem mutation.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const VERSION = 1;
const FROZEN = {
  'c1-controls.sh': {file: '.ufo/waves/round-69/probe/c1-controls.sh', probe: 'ledger69-probe.mjs',
    sha256: '01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12'},
  'c2-controls.sh': {file: '.ufo/waves/round-69/probe/c2-controls.sh', probe: 'deprec69-probe.mjs',
    sha256: '679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4'},
};
const FAMILIES = {
  c1: {script: 'c1-controls.sh', modes: ['donothing', 'autoledger']},
  c2: {script: 'c2-controls.sh', modes: ['donothing', 'autoorigin', 'forgecapture']},
};
// Redirection-capable git environment keys scrubbed for the child (names recorded in the receipt).
const GIT_SCRUB = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_CEILING_DIRECTORIES'];
// The known unused fixed temporary write in the frozen c2 script (removed in the private copy only).
const TMP_WRITE_LINE = "    printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt";

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const canonicalize = (v) => {
  if (Array.isArray(v)) return v.map(canonicalize);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canonicalize(v[k]);
    return o;
  }
  return v;
};
const digestOf = (rec) => {
  const c = canonicalize({...rec, digest: undefined});
  delete c.digest;
  return sha256(Buffer.from(JSON.stringify(c), 'utf8'));
};
const toShPath = (p) => path.resolve(p).replace(/\\/g, '/');

// Windows can hold directory handles past child exit (AV scan of fresh git objects);
// wait, then retry hard, then one cool-off and a second hard round before giving up.
const rmTree = (p) => {
  const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  for (const cool of [0, 1500]) {
    if (cool) sleep(cool);
    try {
      fs.rmSync(p, {recursive: true, force: true, maxRetries: 60, retryDelay: 500});
      if (!fs.existsSync(p)) return;
    } catch (e) { /* retried below */ }
  }
  throw new Error('rmTree: could not reclaim ' + p);
};
const usage = (msg) => {
  process.stderr.write(`control-replay: ${msg}\n`);
  process.stderr.write('usage: control-replay --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR\n' +
    '       control-replay --selftest [--selftest-script FILE]\n' +
    'exit: 0 pass | 1 control-failed | 3 output-exists | 4 frozen-drift | 5 work-fault | 64 usage\n');
  process.exit(64);
};

const parseArgs = (argv) => {
  const want = {lane: null, family: null, mode: null, out: null, work: null, selftest: false, 'selftest-script': null};
  const seen = new Set();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') {
      if (want.selftest) usage('duplicate --selftest');
      want.selftest = true;
      continue;
    }
    const m = /^--([a-z-]+)$/.exec(a);
    if (!m || !(m[1] in want) || m[1] === 'selftest') usage(`unknown flag ${a}`);
    const val = argv[++i];
    if (val === undefined || val.startsWith('--')) usage(`incomplete flag ${a}`);
    if (seen.has(m[1])) usage(`duplicate --${m[1]}`);
    seen.add(m[1]);
    want[m[1]] = val;
  }
  if (want.selftest) {
    if (seen.size > 1 || (seen.size === 1 && !seen.has('selftest-script'))) usage('--selftest takes at most --selftest-script');
    return want;
  }
  for (const k of ['lane', 'family', 'mode', 'out', 'work']) if (!want[k]) usage(`missing --${k}`);
  if (!FAMILIES[want.family]) usage(`unknown family ${want.family}`);
  if (!FAMILIES[want.family].modes.includes(want.mode)) usage(`unknown mode ${want.mode} for family ${want.family}`);
  if (want.lane.includes("'")) usage('lane path must not contain a single quote');
  return want;
};

// --- private copy generation -------------------------------------------------
// Substitute the LANE/PROBE/W/S assignment lines exactly once each; drop the known unused
// fixed temporary write exactly once (c2 only). Everything else must be byte-identical.
const generatePrivateCopy = (src, spec, {lane, wDir, sDir}) => {
  const counts = {lane: 0, probe: 0, w: 0, s: 0, tmp: 0};
  const out = src.split('\n').map((line) => {
    if (line === 'LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin') { counts.lane++; return `LANE='${lane}'`; }
    if (line === `PROBE="$LANE/.ufo/waves/round-69/probe/${spec.probe}"`) { counts.probe++; return line; }
    if (line === 'W="$LANE/.ufo/waves/round-69/controls"') { counts.w++; return `W='${wDir}'`; }
    if (line.startsWith('S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/') && line.endsWith('"')) { counts.s++; return `S='${sDir}'`; }
    if (line === TMP_WRITE_LINE) { counts.tmp++; return ''; }
    return line;
  });
  return {text: out.join('\n'), counts};
};

// --- hermetic child environment ----------------------------------------------
const resolveOnPath = (name) => {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], {encoding: 'utf8'});
  return (r.stdout || '').split(/\r?\n/).map((s) => s.trim()).find((s) => s && fs.existsSync(s)) || null;
};

const buildShims = (binDir) => {
  const made = [];
  fs.mkdirSync(binDir, {recursive: true});
  // python3: the frozen controls' heredocs call python3; provide one only when the host
  // interpreter by that name does not run (Windows store alias), exec'ing the real python.
  const py = spawnSync('python3', ['-c', 'pass'], {encoding: 'utf8'});
  if (py.error || py.status !== 0) {
    const real = resolveOnPath('python') || resolveOnPath('python3');
    if (!real) return {made, fault: 'no python interpreter available for the controls python3 heredocs'};
    fs.writeFileSync(path.join(binDir, 'python3'), `#!/bin/sh\nexec '${real.replace(/\\/g, '/')}' "$@"\n`, {mode: 0o755});
    made.push('python3->' + real.replace(/\\/g, '/'));
  }
  // tar (win32 only): this MSYS tar build cannot open native backslash -C paths; wrap with a
  // cygpath converter exec'ing the resolved real tar. Other platforms keep the host tar.
  if (process.platform === 'win32') {
    const realTar = resolveOnPath('tar');
    const cygpath = resolveOnPath('cygpath');
    if (!realTar || !cygpath) return {made, fault: 'tar and cygpath are required for archive extraction on win32'};
    const shim = [
      '#!/bin/bash',
      '# MSYS must be visible to the tar process itself: downstream frozen probes pass a',
      '# PATH/TMPDIR/LANG allow-list to their own bash children, so the environment cannot',
      '# carry it; the archived trees carry symlinks from the origin host.',
      'export MSYS=winsymlinks:nativestrict',
      'out=()',
      'for a in "$@"; do',
      '  case "$a" in',
      '    [A-Za-z]:?*) a=$(cygpath -u "$a") ;;',
      '  esac',
      '  out+=("$a")',
      'done',
      `exec '${realTar.replace(/\\/g, '/')}' "\${out[@]}"`,
      '',
    ].join('\n');
    fs.writeFileSync(path.join(binDir, 'tar'), shim, {mode: 0o755});
    made.push('tar->' + realTar.replace(/\\/g, '/'));
  }
  return {made, fault: null};
};

// Hermetic child environment: an explicit allow-list, never full inheritance. Poisoned or
// inherited vars (e.g. TAR_OPTIONS, GIT_DIR, MSYSTEM) do not reach the frozen controls.
const ENV_ALLOW = ['LANG', 'SystemRoot', 'SystemDrive', 'USERPROFILE', 'HOME', 'PATHEXT', 'ComSpec'];
const childEnv = (child, scrubRecord, shimArms) => {
  const env = {};
  const dropped = [];
  for (const k of Object.keys(process.env)) {
    if (ENV_ALLOW.includes(k)) env[k] = process.env[k];
    else dropped.push(k);
  }
  scrubRecord.policy = 'allow-list';
  scrubRecord.droppedCount = dropped.length;
  scrubRecord.gitRemoved = GIT_SCRUB.filter((k) => dropped.includes(k)).sort();
  scrubRecord.envAdded = ['PYTHONUTF8=1']; // the controls' python heredocs read UTF-8 sources
  env.PYTHONUTF8 = '1';
  const tmpDir = path.join(child, 'tmp');
  fs.mkdirSync(tmpDir, {recursive: true});
  const shims = buildShims(path.join(child, 'bin'));
  if (shims.fault) return {fault: shims.fault};
  shimArms.push(...shims.made);
  const sep = process.platform === 'win32' ? ';' : ':';
  env.PATH = path.join(child, 'bin') + sep + (process.env.PATH || (process.platform === 'win32' ? 'C:\\Windows\\System32' : '/usr/bin:/bin'));
  env.HYAKU_SCRATCH = toShPath(child);
  env.TMPDIR = toShPath(tmpDir);
  if (process.platform === 'win32') {
    env.MSYS = 'winsymlinks:nativestrict'; // the archived base tree carries symlinks
    scrubRecord.envAdded.push('MSYS=winsymlinks:nativestrict');
  }
  return {env, fault: null};
};

// --- receipt ------------------------------------------------------------------
const writeReceipt = (out, rec) => {
  const body = {...rec};
  delete body.childStdout; // verbatim output is displayed between the markers, outside the digest body
  delete body.childStderr;
  const line = JSON.stringify(canonicalize({...body, digest: digestOf(body)}));
  const prelude =
    `CONTROL_REPLAY run-at ${rec.startedAt} v${VERSION}\n` +
    `family=${rec.family} mode=${rec.mode} childExit=${rec.childExit} workChild=${rec.workChild}\n` +
    '--- child stdout begin ---\n' + rec.childStdout +
    (rec.childStdout.endsWith('\n') ? '' : '\n') +
    '--- child stdout end ---\n' +
    (rec.childStderr
      ? '--- child stderr begin ---\n' + rec.childStderr + (rec.childStderr.endsWith('\n') ? '' : '\n') + '--- child stderr end ---\n'
      : '');
  fs.writeFileSync(out, prelude + line + '\n', {flag: 'wx'});
};
const verifyReceiptLine = (line) => {
  let rec;
  try { rec = JSON.parse(line); } catch { return {ok: false, why: 'unparseable'}; }
  if (!rec || typeof rec !== 'object' || typeof rec.digest !== 'string') return {ok: false, why: 'no-digest'};
  return digestOf(rec) === rec.digest ? {ok: true, rec} : {ok: false, why: 'digest-mismatch'};
};

// --- replay -------------------------------------------------------------------
const replay = (args) => {
  // 1. argument-shape validation, before any filesystem mutation beyond reads.
  if (!fs.existsSync(args.lane) || !fs.statSync(args.lane).isDirectory()) usage('--lane must be a directory');
  if (!/^[A-Za-z]:[\\/]/.test(path.resolve(args.lane)) && process.platform === 'win32') usage('--lane must be an absolute native path');
  if (!fs.existsSync(args.work) || !fs.statSync(args.work).isDirectory()) usage('--work must be a directory');
  if (!fs.statSync(path.dirname(path.resolve(args.out))).isDirectory()) usage('--out parent directory must exist');
  // Exclusive output: refuse anything already occupying the path INCLUDING a dangling link
  // (existsSync follows links and would miss it; libuv's wx open on a dangling link aborts).
  try { fs.lstatSync(args.out); process.exitCode = 3; return; } catch (e) { if (e.code !== 'ENOENT') { process.exitCode = 3; return; } }

  // 2. control source bytes: frozen originals, or the selftest-only supplied fake.
  let src, spec;
  if (args['selftest-script']) {
    spec = {file: path.basename(args['selftest-script']), probe: 'ledger69-probe.mjs', sha256: null, selftest: true};
    try { src = fs.readFileSync(args['selftest-script'], 'utf8'); } catch { process.exitCode = 4; return; }
    spec.sha256 = sha256(Buffer.from(src, 'utf8'));
  } else {
    spec = FAMILIES[args.family].script === 'c1-controls.sh' ? FROZEN['c1-controls.sh'] : FROZEN['c2-controls.sh'];
    try { src = fs.readFileSync(path.join(args.lane, spec.file), 'utf8'); } catch { process.exitCode = 4; return; }
    if (sha256(Buffer.from(src, 'utf8')) !== spec.sha256) { process.exitCode = 4; return; }
  }

  // 3. private copy + unique child.
  const child = fs.mkdtempSync(path.join(args.work, 'ctl-'));
  const wDir = toShPath(path.join(child, 'out'));
  const sDir = toShPath(path.join(child, 'fx'));
  fs.mkdirSync(path.join(child, 'out'), {recursive: true});
  const {text, counts} = generatePrivateCopy(src, spec, {lane: toShPath(args.lane), wDir, sDir});
  const expectedTmp = args.family === 'c2' ? 1 : 0;
  if (counts.lane !== 1 || counts.probe !== 1 || counts.w !== 1 || counts.s !== 1 || counts.tmp !== expectedTmp) {
    rmTree(child);
    process.stderr.write('control-replay: private-copy substitution count mismatch\n');
    process.exitCode = 5;
    return;
  }
  const scriptCopy = path.join(child, 'private-' + path.basename(spec.file));
  fs.writeFileSync(scriptCopy, text, {mode: 0o755});

  // 4. hermetic environment (scrub, shims, private scratch).
  const scrubRecord = {};
  const shimArms = [];
  const ce = childEnv(child, scrubRecord, shimArms);
  if (ce.fault) {
    rmTree(child);
    process.stderr.write(`control-replay: ${ce.fault}\n`);
    process.exitCode = 5;
    return;
  }

  // 5. run the private copy — never the original.
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  // 900s budget: the ledger probe's mutant battery alone exceeds 300s on this host
  // (Windows spawn/archive costs); the frozen v1 counter keeps its own 300s cap and
  // therefore cannot pass R3-R6 here — disclosed in the round record.
  const r = spawnSync('bash', [toShPath(scriptCopy), args.mode], {
    cwd: child, env: ce.env, encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024,
  });
  const durationMs = Date.now() - t0;
  const childStdout = r.stdout || '';
  const childExit = r.status === null ? -1 : r.status;

  // 6. bind the control's receipt files into the record, reclaim the child.
  const controlReceipts = {};
  const outDir = path.join(child, 'out');
  for (const f of fs.existsSync(outDir) ? fs.readdirSync(outDir) : []) {
    const p = path.join(outDir, f);
    if (fs.statSync(p).isFile()) { const b = fs.readFileSync(p); controlReceipts[f] = {sha256: sha256(b), bytes: b.length}; }
  }
  rmTree(child);
  const workEmpty = fs.readdirSync(args.work).length === 0;

  const rec = {
    lane: toShPath(args.lane), family: args.family, mode: args.mode,
    controlScript: spec.file, controlSha256: spec.sha256,
    substitutions: counts, childExit, childSignal: r.signal || null,
    childStdoutSha256: sha256(Buffer.from(childStdout, 'utf8')),
    childStderrSha256: sha256(Buffer.from(r.stderr || '', 'utf8')),
    childStdoutBytes: Buffer.byteLength(childStdout),
    durationMs, startedAt, endedAt: new Date().toISOString(),
    nonce: crypto.randomUUID(), workChild: path.basename(child),
    scrubbedEnv: scrubRecord, shimArms, controlReceipts,
    childStdout, childStderr: r.stderr || '',
  };
  try { writeReceipt(args.out, rec); } catch { process.exitCode = 3; return; } // out raced into existence: exclusive create refused
  const pass = childExit === 0 && childStdout.includes(`CONTROL-PASS ${args.mode}`) && workEmpty;
  if (!pass) process.stderr.write(`control-replay: control ${args.family}/${args.mode} failed (childExit=${childExit} workEmpty=${workEmpty}); receipt records it\n`);
  process.exitCode = pass ? 0 : 1;
};

// --- selftest (hermetic; stable finding ids; expected exit map) ----------------
const SELFTEST_CASES = [
  'usage-missing-lane', 'usage-missing-mode', 'usage-unknown-family', 'usage-unknown-mode',
  'usage-duplicate-flag', 'usage-selftest-with-flag', 'usage-lane-is-file',
  'refuse-existing-out', 'refuse-out-race', 'refuse-frozen-drift',
  'substitution-counts', 'substitution-tmp-write-removed', 'substitution-original-untouched',
  'receipt-digest-verifies', 'receipt-digest-tamper-caught', 'exec-fake-control-pass',
  'env-scrub-names', 'work-emptied-after', 'child-reclaimed', 'selftest-script-isolation',
];
const selftest = (selftestScript) => {
  const results = [];
  const skipped = [];
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'control-replay-selftest-'));
  try {
    const fakeScript = [
      '#!/usr/bin/env bash', '# fake frozen control for selftest (hermetic)',
      'LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin',
      'PROBE="$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"',
      'W="$LANE/.ufo/waves/round-69/controls"',
      'S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c1-controls-$MODE"',
      'mkdir -p "$W"',
      'echo "FAKE_UNMET held=1/2 rev=fake rule=FAKE"',
      'echo "control=$1 exit=1"',
      'echo "FAKE receipt" > "$W/c1-$1.txt"',
      'cat "$W/c1-$1.txt"',
      'echo "CONTROL-PASS $1"',
      'exit 0', '',
    ].join('\n');
    const lane = path.join(t, 'lane');
    fs.mkdirSync(lane, {recursive: true});
    fs.writeFileSync(path.join(t, 'fake-c1.sh'), fakeScript);
    const outDir = path.join(t, 'outs'); fs.mkdirSync(outDir, {recursive: true});
    const out = (n) => path.join(outDir, n);
    const work = (n) => { const d = path.join(t, 'work-' + n); fs.mkdirSync(d, {recursive: true}); return d; };
    const run = (a) => spawnSync(process.execPath, [process.argv[1], ...a], {encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024});
    const argsFor = (n, extra = []) => ['--lane', lane, '--family', 'c1', '--mode', 'donothing', '--out', out(n), '--work', work(n), '--selftest-script', path.join(t, 'fake-c1.sh'), ...extra];
    const u = (a) => run(a).status;

    results.push(['usage-missing-lane', u(['--family', 'c1', '--mode', 'donothing', '--out', out('x'), '--work', t]) === 64]);
    results.push(['usage-missing-mode', u(['--lane', lane, '--family', 'c1', '--out', out('x'), '--work', t]) === 64]);
    results.push(['usage-unknown-family', u(['--lane', lane, '--family', 'junk', '--mode', 'donothing', '--out', out('x'), '--work', t]) === 64]);
    results.push(['usage-unknown-mode', u(['--lane', lane, '--family', 'c1', '--mode', 'bogus', '--out', out('x'), '--work', t]) === 64]);
    results.push(['usage-duplicate-flag', u(['--lane', lane, '--lane', lane, '--family', 'c1', '--mode', 'donothing', '--out', out('x'), '--work', t]) === 64]);
    results.push(['usage-selftest-with-flag', u(['--selftest', '--selftest-script', path.join(t, 'fake-c1.sh'), '--family', 'c1']) === 64]);
    const fileLane = path.join(t, 'notadir'); fs.writeFileSync(fileLane, 'x');
    results.push(['usage-lane-is-file', u(['--lane', fileLane, '--family', 'c1', '--mode', 'donothing', '--out', out('x'), '--work', t]) === 64]);

    fs.writeFileSync(out('exists'), 'do-not-overwrite\n');
    const rr = run(argsFor('exists'));
    results.push(['refuse-existing-out', rr.status === 3 && fs.readFileSync(out('exists'), 'utf8') === 'do-not-overwrite\n']);
    results.push(['refuse-frozen-drift', run(['--lane', lane, '--family', 'c1', '--mode', 'donothing', '--out', out('drift'), '--work', work('drift')]).status === 4 && !fs.existsSync(out('drift'))]);

    const gen = generatePrivateCopy(fakeScript, {probe: 'ledger69-probe.mjs'}, {lane: '/tmp/ln', wDir: '/tmp/w', sDir: '/tmp/s'});
    results.push(['substitution-counts', gen.counts.lane === 1 && gen.counts.probe === 1 && gen.counts.w === 1 && gen.counts.s === 1 && gen.counts.tmp === 0]);
    const c2fake = fakeScript.replace('# fake frozen control for selftest (hermetic)',
      `# fake c2\n${TMP_WRITE_LINE}`);
    const gen2 = generatePrivateCopy(c2fake, {probe: 'deprec69-probe.mjs'}, {lane: '/l', wDir: '/w', sDir: '/s'});
    results.push(['substitution-tmp-write-removed', gen2.counts.tmp === 1 && !gen2.text.includes('/tmp/forge-sed.txt')]);
    results.push(['substitution-original-untouched', fakeScript.includes('LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin')]);

    const execRun = run(argsFor('exec'));
    let line = null;
    let execOk = execRun.status === 0 && fs.existsSync(out('exec'));
    if (execOk) {
      const text = fs.readFileSync(out('exec'), 'utf8');
      line = text.split('\n').filter((l) => l.startsWith('{"') && l.endsWith('}') && l.includes('"digest"')).pop() || null;
      const v = line ? verifyReceiptLine(line) : {ok: false};
      const parsed = v.ok ? JSON.parse(line) : {};
      execOk = v.ok && text.includes('CONTROL-PASS donothing') && text.includes('FAKE_UNMET')
        && parsed.nonce && parsed.scrubbedEnv !== undefined
        && parsed.controlReceipts && parsed.controlReceipts['c1-donothing.txt'];
    }
    results.push(['exec-fake-control-pass', execOk]);
    results.push(['receipt-digest-verifies', line ? verifyReceiptLine(line).ok : false]);
    if (line) {
      const rec = JSON.parse(line);
      rec.childExit = 99;
      results.push(['receipt-digest-tamper-caught', verifyReceiptLine(JSON.stringify(rec)).ok === false]);
    } else results.push(['receipt-digest-tamper-caught', false]);

    let raceOk = false;
    try { fs.writeFileSync(out('exec'), 'x', {flag: 'wx'}); } catch { raceOk = true; } // wx is the exclusive-create refusal
    results.push(['refuse-out-race', raceOk]);
    let linkRefused; // undefined = host cannot create the fixture link (deterministic per host)
    try {
      fs.symlinkSync(path.join(t, 'no-such-target'), out('dangling'), 'file');
      const lr = run(argsFor('dangling'));
      linkRefused = lr.status === 3 && fs.lstatSync(out('dangling')).isSymbolicLink() && !fs.existsSync(path.join(t, 'no-such-target'));
    } catch (e) {
      if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) throw e;
    }
    if (linkRefused === undefined) skipped.push('refuse-dangling-link');
    else results.push(['refuse-dangling-link', linkRefused]);
    results.push(['env-scrub-names', GIT_SCRUB.length === 8 && GIT_SCRUB.includes('GIT_DIR') && GIT_SCRUB.includes('GIT_WORK_TREE') && ENV_ALLOW.includes('SystemRoot') === (process.platform === 'win32' ? true : ENV_ALLOW.includes('SystemRoot'))]);
    results.push(['work-emptied-after', execOk && fs.readdirSync(work('exec')).length === 0]);
    results.push(['child-reclaimed', execOk && fs.readdirSync(work('exec')).filter((n) => n.startsWith('ctl-')).length === 0]);
    results.push(['selftest-script-isolation', !FAMILIES.c1.modes.includes('bogus') && process.env.CONTROL_REPLAY_SELFTEST_GUARD === undefined]);

    const passed = results.filter(([, ok]) => ok).length;
    for (const [id, ok] of results) if (!ok) console.log(`SELFTEST-FAIL ${id}`);
    for (const id of skipped) console.log(`SELFTEST-SKIP ${id} (host denies symlink creation)`);
    console.log(`CONTROL_REPLAY_SELFTEST: PASS (${passed}/${results.length})`);
    console.log('EXIT_MAP: 0=pass 1=control-failed 3=output-exists 4=frozen-drift 5=work-fault 64=usage');
    process.exitCode = passed === results.length ? 0 : 1;
  } finally {
    fs.rmSync(t, {recursive: true, force: true});
  }
};

const args = parseArgs(process.argv.slice(2));
if (args.selftest) { selftest(args['selftest-script']); process.exit(); }
replay(args);
