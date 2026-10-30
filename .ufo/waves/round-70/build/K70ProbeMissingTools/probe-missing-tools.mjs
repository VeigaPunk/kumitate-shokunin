#!/usr/bin/env node
// K70ProbeMissingTools — isolated missing-tool probe (mechanism-only).
// Axes: tool T in {tar, git, bash, node} x {present = negative control,
// absent = fail-closed test}. Levels: A = predicate-shaped archive/extract
// chain; B = contract-shaped replay driver (checked = conformant model,
// unchecked = naive fail-open model). Touched files live ONLY under
// /fast/scratch/hyaku/kumitate-r70/K70ProbeMissingTools and this build dir.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const BUILD = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ProbeMissingTools';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r70/K70ProbeMissingTools';
const SYNTH = path.join(BUILD, 'synth');
const FROZEN_SHA = 'f9b0e19d17114323f3668419f3835569c8a3564bb230114b02481fe5b2dba6cf';
const TOOLS = ['tar', 'git', 'bash', 'node'];

const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const log = [];
const say = s => { log.push(s); console.log(s); };
const results = [];
const record = r => { results.push(r); return r; };

const scrubGit = env => { const e = {...env}; for (const k of Object.keys(e)) if (k.startsWith('GIT_')) delete e[k]; return e; };
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, ...opts});

// ---- 0. scratch layout -----------------------------------------------------
fs.rmSync(SCRATCH, {recursive: true, force: true}); // own scratch only: idempotent reruns
for (const d of ['bin', 'fx', 'cases', 'results']) fs.mkdirSync(path.join(SCRATCH, d), {recursive: true});

// ---- 1. PATH shims ----------------------------------------------------------
// Source dirs: /usr/bin plus the real dirs of the four probed tools (node may
// resolve via an fnm shim dir, not /usr/bin). Each shim dir holds symlinks to
// everything from all source dirs, minus the withheld tool.
const srcDirs = ['/usr/bin', path.dirname(process.execPath)];
const seen = new Set();
const entries = []; // [name, target]
for (const d of srcDirs) {
  let names;
  try { names = fs.readdirSync(d); } catch { continue; }
  for (const n of names) {
    if (seen.has(n)) continue;
    const p = path.join(d, n);
    try { const st = fs.statSync(p); if (!st.isFile() && !st.isSymbolicLink()) continue; } catch { continue; }
    seen.add(n); entries.push([n, p]);
  }
}
const binAll = path.join(SCRATCH, 'bin', 'all');
fs.mkdirSync(binAll, {recursive: true});
for (const [n, p] of entries) fs.symlinkSync(p, path.join(binAll, n));
const PATHS = {full: binAll};
for (const t of TOOLS) {
  const d = path.join(SCRATCH, 'bin', 'no-' + t);
  fs.mkdirSync(d, {recursive: true});
  for (const [n, p] of entries) if (n !== t) fs.symlinkSync(p, path.join(d, n));
  PATHS['no-' + t] = d;
}

// ---- 2. synthetic fixture lane (git repo in scratch; explicit -C only) ----
const FX = path.join(SCRATCH, 'fx');
fs.mkdirSync(path.join(FX, 'controls'), {recursive: true});
fs.copyFileSync(path.join(SYNTH, 'frozen-c1.sh'), path.join(FX, 'controls', 'frozen-c1.sh'));
const envS = scrubGit(process.env);
let g = run('git', ['-C', FX, 'init', '-q'], {env: envS});
if (g.status !== 0) { say('FATAL git init: ' + g.stderr); process.exit(2); }
g = run('git', ['-C', FX, 'rev-parse', '--show-toplevel'], {env: envS});
const top = (g.stdout || '').trim();
say(`fixture show-toplevel: ${top} (expected ${FX})`);
if (top !== FX) { say('FATAL: fixture toplevel mismatch; refusing to commit'); process.exit(2); }
g = run('git', ['-C', FX, 'add', '-A'], {env: envS});
if (g.status !== 0) { say('FATAL git add: ' + g.stderr); process.exit(2); }
g = run('git', ['-C', FX, '-c', 'user.name=probe', '-c', 'user.email=probe@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'synth fixture'], {env: envS});
if (g.status !== 0) { say('FATAL git commit: ' + g.stderr); process.exit(2); }
const frozenBefore = sha(fs.readFileSync(path.join(FX, 'controls', 'frozen-c1.sh')));
say(`fixture frozen-c1.sh sha256=${frozenBefore}`);
if (frozenBefore !== FROZEN_SHA) { say('FATAL: fixture bytes differ from driver pin'); process.exit(2); }

// ---- case runners -----------------------------------------------------------
const inspectCase = (dir, out) => {
  const outExists = fs.existsSync(out);
  const outText = outExists ? fs.readFileSync(out, 'utf8') : '';
  return {
    outExists, outBytes: outText.length,
    outHasUnmet: outText.includes('SYNTH69_UNMET'),
    outHasControlPass: /CONTROL-PASS (donothing|autoledger)/.test(outText),
    workReclaimed: fs.readdirSync(path.join(dir, 'work')).length === 0,
    fixedTmpLeak: fs.existsSync(path.join(FX, 'controls', '.fixed-unused-tmp')),
    receiptHead: outText.split('\n').slice(0, 2).join(' | '),
  };
};
const driverCase = (name, {driver = 'driver-checked.mjs', mode = 'donothing', pathKey = 'full', preexisting = null}) => {
  const dir = path.join(SCRATCH, 'cases', name);
  fs.mkdirSync(path.join(dir, 'work'), {recursive: true});
  const out = path.join(dir, 'out.txt');
  if (preexisting !== null) fs.writeFileSync(out, preexisting);
  const args = [path.join(SYNTH, driver), '--lane', FX, '--family', 'c1', '--mode', mode, '--out', out, '--work', path.join(dir, 'work')];
  const r = run('node', args, {env: {...process.env, PATH: PATHS[pathKey]}});
  const rec = record({
    id: name, level: 'B', driver, mode, pathKey,
    cmd: `node ${driver} --lane FX --family c1 --mode ${mode} --out out.txt --work work`,
    exit: r.status, spawnError: r.error ? r.error.code : null,
    stderrTail: (r.stderr || '').trim().split('\n').slice(-2).join(' | ').slice(0, 300),
    ...inspectCase(dir, out),
  });
  say(`CASE ${name}: exit=${rec.exit} err=${rec.spawnError} out=${rec.outExists ? rec.outBytes + 'B' : 'none'} ` +
    `unmet=${rec.outHasUnmet} pass=${rec.outHasControlPass} reclaimed=${rec.workReclaimed} leak=${rec.fixedTmpLeak}`);
  return rec;
};
const archiveCase = (name, script, pathKey) => {
  const dest = path.join(SCRATCH, 'cases', name, 'dest');
  fs.rmSync(dest, {recursive: true, force: true});
  const r = run('bash', [path.join(SYNTH, script), FX, dest], {env: {...process.env, PATH: PATHS[pathKey]}});
  const rec = record({
    id: name, level: 'A', driver: script, pathKey,
    cmd: `bash ${script} FX dest`,
    exit: r.status, spawnError: r.error ? r.error.code : null,
    extracted: fs.existsSync(path.join(dest, 'controls', 'frozen-c1.sh')),
    destEntries: fs.existsSync(dest) ? fs.readdirSync(dest) : [],
    stderrTail: (r.stderr || '').trim().split('\n').slice(-2).join(' | ').slice(0, 300),
  });
  say(`CASE ${name}: exit=${rec.exit} extracted=${rec.extracted} dest=${JSON.stringify(rec.destEntries)}`);
  return rec;
};

// ---- 3. Level B matrix ------------------------------------------------------
// negative controls: tools present
driverCase('B-nc-donothing', {mode: 'donothing', pathKey: 'full'});
driverCase('B-nc-autoledger', {mode: 'autoledger', pathKey: 'full'});
// R8-style invalid args (usage exit 64)
{
  const r = run('node', [path.join(SYNTH, 'driver-checked.mjs'), '--family', 'junk'], {env: {...process.env, PATH: PATHS.full}});
  record({id: 'B-nc-invalid-args', level: 'B', driver: 'driver-checked.mjs', pathKey: 'full', cmd: 'node driver-checked.mjs --family junk', exit: r.status});
  say(`CASE B-nc-invalid-args: exit=${r.status} (expect 64)`);
}
// withheld tools against the conformant driver model
for (const t of ['bash', 'git', 'node', 'tar']) driverCase('B-miss-' + t, {pathKey: 'no-' + t});
// existing-output preserved under refusal (R9-style), bash withheld
driverCase('B-miss-bash-existing-out', {pathKey: 'no-bash', preexisting: 'do-not-overwrite\n'});
// naive driver under withheld tools (fail-open demonstration)
for (const t of ['bash', 'git']) driverCase('B-naive-miss-' + t, {driver: 'driver-unchecked.mjs', pathKey: 'no-' + t});

// ---- 4. Level A matrix ------------------------------------------------------
archiveCase('A-nc-full', 'archive-step.sh', 'full');
archiveCase('A-miss-tar', 'archive-step.sh', 'no-tar');
archiveCase('A-miss-tar-ignoreexit', 'archive-step-ignoreexit.sh', 'no-tar');
archiveCase('A-miss-git', 'archive-step.sh', 'no-git');

// ---- 5. integrity + verdicts -------------------------------------------------
const frozenAfter = sha(fs.readFileSync(path.join(FX, 'controls', 'frozen-c1.sh')));
say(`fixture frozen bytes unchanged: ${frozenBefore === frozenAfter}`);
const get = id => results.find(r => r.id === id);
const verdicts = [];
for (const id of ['B-miss-bash', 'B-miss-git', 'B-miss-node']) {
  const r = get(id);
  verdicts.push({id, expectation: 'fail-closed: exit!=0, no out, work reclaimed, no tmp leak', observed: r.exit !== 0 && !r.outExists && r.workReclaimed && !r.fixedTmpLeak, detail: `exit=${r.exit} out=${r.outExists} reclaimed=${r.workReclaimed}`});
}
{
  const r = get('B-miss-tar');
  verdicts.push({id: 'B-miss-tar', expectation: 'tar is no driver-level dependency (honest positive)', observed: r.exit === 0 && r.outExists && r.outHasControlPass, detail: `exit=${r.exit} out=${r.outExists}`});
}
for (const id of ['B-nc-donothing', 'B-nc-autoledger']) {
  const r = get(id);
  verdicts.push({id, expectation: 'negative control: exit 0 + UNMET receipt + CONTROL-PASS + reclaimed', observed: r.exit === 0 && r.outHasUnmet && r.outHasControlPass && r.workReclaimed && !r.fixedTmpLeak, detail: `exit=${r.exit}`});
}
{
  const r = get('B-miss-bash-existing-out');
  const kept = fs.existsSync(path.join(SCRATCH, 'cases', r.id, 'out.txt')) && fs.readFileSync(path.join(SCRATCH, 'cases', r.id, 'out.txt'), 'utf8') === 'do-not-overwrite\n';
  verdicts.push({id: r.id, expectation: 'existing output bytes preserved under refusal', observed: r.exit !== 0 && kept, detail: `exit=${r.exit} kept=${kept}`});
}
for (const id of ['B-naive-miss-bash', 'B-naive-miss-git']) {
  const r = get(id);
  verdicts.push({id, expectation: 'naive model fails open (discriminator: naive != checked)', observed: r.exit === 0 && r.outExists, detail: `exit=${r.exit} out=${r.outBytes}B`});
}
{
  const a = get('A-miss-tar'), b = get('A-miss-tar-ignoreexit'), c = get('A-nc-full'), d = get('A-miss-git');
  verdicts.push({id: 'A-miss-tar', expectation: 'fail-closed via pipefail: exit!=0, nothing extracted', observed: a.exit !== 0 && !a.extracted, detail: `exit=${a.exit} extracted=${a.extracted}`});
  verdicts.push({id: 'A-miss-tar-ignoreexit', expectation: 'if the chain status is swallowed and content unverified, tar absence passes silently (fail-open mechanism)', observed: b.exit === 0 && !b.extracted, detail: `exit=${b.exit} extracted=${b.extracted}`});
  verdicts.push({id: 'A-nc-full', expectation: 'negative control extracts cleanly', observed: c.exit === 0 && c.extracted, detail: `exit=${c.exit}`});
  verdicts.push({id: 'A-miss-git', expectation: 'fail-closed: exit!=0, nothing extracted', observed: d.exit !== 0 && !d.extracted, detail: `exit=${d.exit} extracted=${d.extracted}`});
}
{
  const r = get('B-nc-invalid-args');
  verdicts.push({id: 'B-nc-invalid-args', expectation: 'usage exit 64', observed: r.exit === 64, detail: `exit=${r.exit}`});
}
say('--- verdicts ---');
for (const v of verdicts) say(`${v.observed ? 'HELD' : 'BROKEN'}  ${v.id}: ${v.detail}`);
const held = verdicts.filter(v => v.observed).length;
say(`PROBE_MISSING_TOOLS: ${held === verdicts.length ? 'ALL-AXES-HELD' : 'AXES-BROKEN'} (${held}/${verdicts.length})`);

const summary = {
  probe: 'K70ProbeMissingTools',
  kind: 'mechanism-only synthetic reproduction; candidate scripts/control-replay.mjs ABSENT at base 78b98d76 (verified: ENOENT)',
  date: '2026-10-30',
  tools: TOOLS,
  levels: {A: 'predicate-shaped `git archive | tar -x` chain', B: 'contract-shaped replay driver (checked=conformant model, unchecked=naive fail-open model)'},
  versions: {
    node: run('node', ['--version']).stdout.trim(),
    git: run('git', ['--version'], {env: envS}).stdout.trim(),
    tar: run('tar', ['--version'], {env: envS}).stdout.split('\n')[0],
    bash: run('bash', ['-c', 'echo $BASH_VERSION']).stdout.trim(),
  },
  installs: 'none (all four tools already present; pacman paused per seat rules)',
  fixture: {path: FX, frozenSha256: frozenBefore, unchanged: frozenBefore === frozenAfter},
  verdicts,
};
fs.writeFileSync(path.join(SCRATCH, 'results', 'probe-missing-tools.json'), JSON.stringify({summary, results}, null, 2));
fs.writeFileSync(path.join(SCRATCH, 'results', 'probe-missing-tools.log'), log.join('\n') + '\n');
process.exit(held === verdicts.length ? 0 : 1);
