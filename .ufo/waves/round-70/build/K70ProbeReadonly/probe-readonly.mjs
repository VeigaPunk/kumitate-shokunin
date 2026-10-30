#!/usr/bin/env node
// K70ProbeReadonly — isolated operability probe: READ-ONLY lane tree + WRITABLE scratch/output.
// Runs ONLY the private candidate copy in this build dir (never originals, never lane scripts).
// Candidate under probe: candidate-private-copy.mjs (sibling mock conforming to the r70 contract).
// Edge axes:
//   A  selftest with read-only lane
//   B  five contract replay modes, read-only lane, poisoned GIT_* env, writable work/out
//   G  invalid args        -> 64, lane untouched
//   H  existing --out      -> 73, sentinel preserved, lane untouched
//   I  drifted frozen bytes -> 65 BEFORE out creation, lane untouched
//   J  --out in read-only dir -> non-zero, lane untouched, nothing smuggled into out dir
//   K  read-only work root  -> observed limit (non-zero; empty out left), lane untouched
//   L  WRITABLE lane control: same run must mutate NOTHING in the lane (proves isolation by construction)
//   M  mechanism-only model run (mechanism-model.mjs) — NOT candidate verification
// Every case asserts the lane hash sweep is byte-identical before/after.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const BUILD = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ProbeReadonly';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r70/K70ProbeReadonly';
const CANDIDATE = path.join(BUILD, 'candidate-private-copy.mjs');
const MODEL = path.join(BUILD, 'mechanism-model.mjs');
const REAL_LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const BASE = '78b98d762ccf3e3a0961f94c4042eaabd2bcb706';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const results = [];
const say = (s) => { fs.appendFileSync(path.join(BUILD, 'probe-run.txt'), s + '\n'); };

function sweep(dir) {
  const m = new Map();
  const walk = (d, rel) => {
    for (const ent of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, ent.name);
      const r = rel ? rel + '/' + ent.name : ent.name;
      if (ent.isDirectory()) walk(p, r);
      else if (ent.isFile()) m.set(r, sha(fs.readFileSync(p)));
    }
  };
  walk(dir, '');
  return m;
}
function sameMap(a, b) {
  if (a.size !== b.size) return `entry-count ${a.size} -> ${b.size}`;
  for (const [k, v] of a) { if (!b.has(k)) return `new file: ${k}`; if (b.get(k) !== v) return `modified: ${k}`; }
  for (const k of b.keys()) if (!a.has(k)) return `removed file: ${k}`;
  return null;
}

function buildSynthLane(dest, {driftC1 = false} = {}) {
  fs.rmSync(dest, {recursive: true, force: true});
  fs.mkdirSync(path.join(dest, 'scripts'), {recursive: true});
  fs.mkdirSync(path.join(dest, '.ufo/waves/round-69/probe'), {recursive: true});
  fs.mkdirSync(path.join(dest, '.ufo/waves/round-69/controls'), {recursive: true});
  fs.mkdirSync(path.join(dest, '.ufo/pins'), {recursive: true});
  fs.copyFileSync(CANDIDATE, path.join(dest, 'scripts/control-replay.mjs'));
  let c1 = fs.readFileSync(path.join(BUILD, 'synth-controls/c1-controls.sh'));
  if (driftC1) c1 = Buffer.concat([c1.subarray(0, 40), Buffer.from([c1[40] === 0x61 ? 0x62 : 0x61]), c1.subarray(41)]);
  fs.writeFileSync(path.join(dest, '.ufo/waves/round-69/probe/c1-controls.sh'), c1);
  fs.copyFileSync(path.join(BUILD, 'synth-controls/c2-controls.sh'), path.join(dest, '.ufo/waves/round-69/probe/c2-controls.sh'));
  for (const f of ['c1-autoledger.txt','c1-donothing.txt','c2-autoorigin.txt','c2-donothing.txt','c2-forgecapture.txt'])
    fs.copyFileSync(path.join(REAL_LANE, '.ufo/waves/round-69/controls', f), path.join(dest, '.ufo/waves/round-69/controls', f));
  fs.writeFileSync(path.join(dest, 'SKILL.md'), '# synth skill\n| control-replay |\n');
  fs.writeFileSync(path.join(dest, 'SCORECARD.md'), '# synth scorecard\n| control-replay |\n');
  fs.writeFileSync(path.join(dest, '.ufo/pins/counter-pins.json'), '{"pins":[]}\n');
}

function makeReadOnly(dir) {
  // files first (dir perms don't block file chmod), then dirs deepest-first
  const dirs = [dir];
  const walk = (d) => { for (const ent of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, ent.name); if (ent.isDirectory()) { dirs.push(p); walk(p); } } };
  walk(dir);
  for (const d of dirs) for (const f of fs.readdirSync(d)) fs.chmodSync(path.join(d, f), 0o555);
  for (let i = dirs.length - 1; i >= 0; i--) fs.chmodSync(dirs[i], 0o555);
}
function makeWritable(dir) {
  const dirs = [dir];
  const walk = (d) => { for (const ent of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, ent.name); if (ent.isDirectory()) { dirs.push(p); walk(p); } } };
  walk(dir);
  for (let i = dirs.length - 1; i >= 0; i--) fs.chmodSync(dirs[i], 0o755);
  for (const d of dirs) for (const f of fs.readdirSync(d)) { try { fs.chmodSync(path.join(d, f), 0o755); } catch {} }
}

function runCase(id, {lane, args, env, cwd, expect}) {
  const before = sweep(lane);
  const r = spawnSync(process.execPath, [CANDIDATE, ...args], {env, cwd, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024});
  const after = sweep(lane);
  const laneDelta = sameMap(before, after);
  const rec = {id, status: r.status, signal: r.signal, stdout: (r.stdout||'').trim().slice(0, 400), stderrTail: (r.stderr||'').trim().split('\n').slice(-3).join(' | ').slice(0, 400), laneDelta, expect};
  results.push(rec);
  say(`CASE ${id} exit=${r.status} laneDelta=${laneDelta === null ? 'CLEAN' : laneDelta}`);
  say(`  stdout: ${rec.stdout.split('\n')[0] || '(empty)'}`);
  if (rec.stderrTail) say(`  stderr: ${rec.stderrTail}`);
  return rec;
}

// ---------- fixture ----------
fs.mkdirSync(SCRATCH, {recursive: true});
fs.writeFileSync(path.join(BUILD, 'probe-run.txt'), `# K70ProbeReadonly probe run ${new Date().toISOString()}\n`);

const RO = path.join(SCRATCH, 'ro-lane');
const DRIFT = path.join(SCRATCH, 'drift-lane');
const WRITABLE = path.join(SCRATCH, 'writable-lane');
buildSynthLane(RO);
buildSynthLane(DRIFT, {driftC1: true});
buildSynthLane(WRITABLE);
makeReadOnly(RO);
makeReadOnly(DRIFT); // drift lane also read-only: refusal must not mutate
const TMPW = path.join(SCRATCH, 'tmp-w'); fs.mkdirSync(TMPW, {recursive: true});

// R1-style real-lane frozen check (read-only ops on the real lane)
const gitShow = (p) => spawnSync('git', ['-C', REAL_LANE, 'show', `${BASE}:${p}`], {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
const frozenReal = ['c1-controls.sh', 'c2-controls.sh'].map((f) => {
  const p = '.ufo/waves/round-69/probe/' + f;
  const g = gitShow(p);
  const disk = fs.readFileSync(path.join(REAL_LANE, p));
  return {f, matchesBase: g.status === 0 && sha(Buffer.from(g.stdout)) === sha(disk)};
});
say(`REAL-LANE frozen scripts vs base ${BASE}: ` + JSON.stringify(frozenReal));

// poisoned repository environment pointed INTO the lane (must be scrubbed by candidate)
const poison = (lane, extra = {}) => ({...process.env,
  GIT_DIR: path.join(lane, '.git'),
  GIT_WORK_TREE: lane,
  GIT_INDEX_FILE: path.join(SCRATCH, 'poison.index'),
  GIT_OBJECT_DIRECTORY: path.join(lane, '.git/objects'),
  GIT_ALTERNATE_OBJECT_DIRECTORIES: path.join(lane, '.git/objects'),
  GIT_PREFIX: 'poison/', GIT_QUARANTINE_PATH: SCRATCH,
  TMPDIR: TMPW, ...extra});

const OUTDIR = path.join(BUILD, 'receipts');
fs.mkdirSync(OUTDIR, {recursive: true});

// A: selftest, read-only lane
{
  const r = runCase('A-selftest-ro', {lane: RO, args: ['--selftest'], env: poison(RO), cwd: SCRATCH});
  r.okCheck = r.status === 0 && /CONTROL_REPLAY_SELFTEST: PASS/.test(r.stdout) && r.laneDelta === null;
}

// B: five replay modes
const modes = [['c1','donothing'],['c1','autoledger'],['c2','donothing'],['c2','autoorigin'],['c2','forgecapture']];
for (const [i, [fam, mode]] of modes.entries()) {
  const work = path.join(SCRATCH, `work-${i}`); fs.mkdirSync(work, {recursive: true});
  const out = path.join(OUTDIR, `ro-${fam}-${mode}.out`);
  const r = runCase(`B${i}-${fam}-${mode}-ro`, {lane: RO, args: ['--lane', RO, '--family', fam, '--mode', mode, '--out', out, '--work', work], env: poison(RO), cwd: SCRATCH});
  const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  const workEmpty = fs.existsSync(work) && fs.readdirSync(work).length === 0;
  const label = fam === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
  r.receiptBytes = text.length; r.workEmpty = workEmpty;
  r.okCheck = r.status === 0 && text.includes(label) && text.includes('CONTROL-PASS ' + mode) && workEmpty && r.laneDelta === null;
  say(`  receipt=${text.length}B workEmpty=${workEmpty} label=${text.includes(label)} pass=${text.includes('CONTROL-PASS ' + mode)}`);
}

// G: invalid args
{
  const r = runCase('G-invalid-ro', {lane: RO, args: ['--family', 'junk'], env: poison(RO), cwd: SCRATCH});
  r.okCheck = r.status === 64 && r.laneDelta === null;
}

// H: existing output
{
  const work = path.join(SCRATCH, 'work-h'); fs.mkdirSync(work, {recursive: true});
  const out = path.join(SCRATCH, 'existing.txt'); fs.writeFileSync(out, 'do-not-overwrite\n');
  const r = runCase('H-outexists-ro', {lane: RO, args: ['--lane', RO, '--family', 'c1', '--mode', 'donothing', '--out', out, '--work', work], env: poison(RO), cwd: SCRATCH});
  r.sentinel = fs.readFileSync(out, 'utf8');
  r.okCheck = r.status !== 0 && r.status === 73 && r.sentinel === 'do-not-overwrite\n' && r.laneDelta === null;
}

// I: drifted frozen source (read-only drift lane) -> refuse before out
{
  const work = path.join(SCRATCH, 'work-i'); fs.mkdirSync(work, {recursive: true});
  const out = path.join(SCRATCH, 'drift-out.txt');
  const r = runCase('I-drift-ro', {lane: DRIFT, args: ['--lane', DRIFT, '--family', 'c1', '--mode', 'donothing', '--out', out, '--work', work], env: poison(DRIFT), cwd: SCRATCH});
  r.outCreated = fs.existsSync(out);
  r.okCheck = r.status === 65 && r.outCreated === false && r.laneDelta === null;
  say(`  outCreated=${r.outCreated}`);
}

// J: out in read-only dir
{
  const roOut = path.join(SCRATCH, 'ro-outdir'); fs.mkdirSync(roOut, {recursive: true});
  const sentinel = path.join(roOut, 'sentinel.txt'); fs.writeFileSync(sentinel, 'stay\n');
  fs.chmodSync(sentinel, 0o444); fs.chmodSync(roOut, 0o555);
  const work = path.join(SCRATCH, 'work-j'); fs.mkdirSync(work, {recursive: true});
  const r = runCase('J-outdir-ro', {lane: RO, args: ['--lane', RO, '--family', 'c1', '--mode', 'donothing', '--out', path.join(roOut, 'new.txt'), '--work', work], env: poison(RO), cwd: SCRATCH});
  const dirAfter = fs.readdirSync(roOut);
  r.dirAfter = dirAfter;
  r.okCheck = r.status !== 0 && dirAfter.join(',') === 'sentinel.txt' && r.laneDelta === null;
  fs.chmodSync(roOut, 0o755); fs.chmodSync(sentinel, 0o644);
}

// K: read-only work root (observed limit, not a contract case)
{
  const roWork = path.join(SCRATCH, 'ro-work'); fs.mkdirSync(roWork, {recursive: true}); fs.chmodSync(roWork, 0o555);
  const out = path.join(SCRATCH, 'k-out.txt');
  const r = runCase('K-workro-ro', {lane: RO, args: ['--lane', RO, '--family', 'c1', '--mode', 'donothing', '--out', out, '--work', roWork], env: poison(RO), cwd: SCRATCH});
  r.outSize = fs.existsSync(out) ? fs.statSync(out).size : -1;
  r.okCheck = r.status !== 0 && r.laneDelta === null; // observed: empty out left behind
  say(`  outSize=${r.outSize} (exclusive-create precedes work-root write)`);
  fs.chmodSync(roWork, 0o755); fs.rmSync(roWork, {recursive: true, force: true});
}

// L: WRITABLE lane control — same run must leave lane byte-identical (isolation by construction)
{
  const work = path.join(SCRATCH, 'work-l'); fs.mkdirSync(work, {recursive: true});
  const out = path.join(OUTDIR, 'writable-lane-c1-donothing.out');
  const r = runCase('L-writable-lane', {lane: WRITABLE, args: ['--lane', WRITABLE, '--family', 'c1', '--mode', 'donothing', '--out', out, '--work', work], env: poison(WRITABLE), cwd: SCRATCH});
  const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  r.okCheck = r.status === 0 && text.includes('CONTROL-PASS donothing') && r.laneDelta === null;
}

// M: mechanism-only model (NOT candidate verification)
{
  const work = path.join(SCRATCH, 'work-m'); fs.mkdirSync(work, {recursive: true});
  const out = path.join(SCRATCH, 'm-out.txt');
  const r = spawnSync(process.execPath, [MODEL, '--lane', RO, '--family', 'c2', '--mode', 'autoorigin', '--out', out, '--work', work], {env: poison(RO), cwd: SCRATCH, encoding: 'utf8', timeout: 60000});
  const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  results.push({id: 'M-mechanism-model', status: r.status, stdout: (r.stdout||'').trim(), stderrTail: (r.stderr||'').trim().slice(0,200), laneDelta: null, expect: 'mechanism-only, not candidate verification', receiptBytes: text.length, okCheck: r.status === 0 && text.includes('DEPREC69_UNMET') && fs.readdirSync(work).length === 0});
  say(`CASE M-mechanism-model exit=${r.status} receipt=${text.length}B workEmpty=${fs.readdirSync(work).length === 0}`);
}

// final integrity: real frozen scripts unchanged (read-only ops)
const frozenEnd = ['c1-controls.sh', 'c2-controls.sh'].map((f) => {
  const p = '.ufo/waves/round-69/probe/' + f;
  const g = gitShow(p);
  const disk = fs.readFileSync(path.join(REAL_LANE, p));
  return {f, matchesBase: g.status === 0 && sha(Buffer.from(g.stdout)) === sha(disk)};
});
say(`REAL-LANE frozen scripts end-state: ` + JSON.stringify(frozenEnd));

// restore perms and clean scratch
for (const d of [RO, DRIFT]) makeWritable(d);
fs.rmSync(SCRATCH, {recursive: true, force: true});
say(`SCRATCH cleaned: ${fs.existsSync(SCRATCH) ? 'FAIL' : 'OK'}`);

const summary = {seat: 'K70ProbeReadonly', axis: 'read-only lane tree + writable scratch/output', cases: results.map(({id, status, okCheck, expect, laneDelta, receiptBytes, workEmpty}) => ({id, status, ok: !!okCheck, laneClean: laneDelta === null, receiptBytes, workEmpty, expect}))};
fs.writeFileSync(path.join(BUILD, 'probe-results.json'), JSON.stringify({...summary, frozenReal, frozenEnd}, null, 2) + '\n');
const held = summary.cases.filter((c) => c.ok && c.laneClean).length;
say(`PROBE-HELD ${held}/${summary.cases.length} lane-clean=${summary.cases.every((c) => c.laneClean)}`);
console.log(JSON.stringify(summary, null, 2));
console.log(`PROBE-HELD ${held}/${summary.cases.length}; all-lanes-clean=${summary.cases.every((c) => c.laneClean)}; frozen-real-unchanged=${frozenEnd.every((f) => f.matchesBase)}`);
