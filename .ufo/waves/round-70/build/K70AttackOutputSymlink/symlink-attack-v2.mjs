#!/usr/bin/env node
// K70AttackOutputSymlink — isolated counterexample, v2 (rigorous victim tracking)
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const scratch = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const seatDir = path.join(scratch, 'kumitate-r70', 'K70AttackOutputSymlink');
const sandbox = fs.mkdtempSync(path.join(seatDir, 'attackv2-'));
const DATA = 'CONTROL-OUTPUT\n';
const VICTIM0 = 'FROZEN-PAYLOAD-DO-NOT-TOUCH\n';

// shape -> victim descriptor: which bytes must survive, and what "refusal" means
function setup(shape, dir) {
  const out = path.join(dir, 'out.txt');
  if (shape === 'S1-regular') {
    fs.writeFileSync(out, 'do-not-overwrite\n');
    return {out, victim: out, victim0: 'do-not-overwrite\n', kind: 'regular'};
  }
  if (shape === 'S2-link-live') {
    const v = path.join(dir, 'victim.txt');
    fs.writeFileSync(v, VICTIM0); fs.symlinkSync(v, out);
    return {out, victim: v, victim0: VICTIM0, kind: 'link'};
  }
  if (shape === 'S3-link-dangling') {
    const v = path.join(dir, 'nonexistent.txt');
    fs.symlinkSync(v, out);
    return {out, victim: v, victim0: null, kind: 'dangling'};
  }
  // S4-link-frozen: symlink whose victim stands in for frozen counter bytes
  const v = path.join(dir, 'frozen-standin.txt');
  fs.writeFileSync(v, 'FROZEN-COUNTER-BYTES\n'); fs.symlinkSync(v, out);
  return {out, victim: v, victim0: 'FROZEN-COUNTER-BYTES\n', kind: 'link'};
}

const results = [];
function report(strat, shape, victim0, victimAfter, exitOk, extra, refused) {
  let safe;
  if (shape === 'S3-link-dangling') {
    // dangling: refusal required AND referent must not be created with our data
    safe = refused === true && (victimAfter === null);
  } else {
    safe = victimAfter === victim0;
  }
  results.push({strat, shape, safe, exitOk, refused, extra});
  console.log(`${safe ? 'TARGET-SAFE  ' : 'TARGET-HIT!! '} ${strat} ${shape} exit=${exitOk} refused=${refused} ${extra}`);
}

const shapes = ['S1-regular', 'S2-link-live', 'S3-link-dangling', 'S4-link-frozen'];

// A: existsSync gate + writeFileSync
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'A-'));
  const {out, victim, victim0} = setup(shape, d);
  let exitOk = '0', refused = false, note = 'wrote';
  try {
    if (fs.existsSync(out)) { refused = true; note = 'refused via existsSync'; }
    else fs.writeFileSync(out, DATA);
  } catch (e) { exitOk = 'err:' + e.code; }
  const va = fs.existsSync(victim) ? fs.readFileSync(victim, 'utf8') : null;
  report('A existsSync+w', shape, victim0, va, exitOk, note + ` victim=${JSON.stringify(va)}`, refused);
}

// B: shell `>` redirect
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'B-'));
  const {out, victim, victim0} = setup(shape, d);
  const r = spawnSync('bash', ['-c', 'printf "%s" "$2" > "$1"', 'm', out, DATA], {encoding: 'utf8'});
  const va = fs.existsSync(victim) ? fs.readFileSync(victim, 'utf8') : null;
  report('B shell->', shape, victim0, va, String(r.status), `victim=${JSON.stringify(va)}`, false);
}

// C: fs.openSync(out,'wx') exclusive
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'C-'));
  const {out, victim, victim0} = setup(shape, d);
  let exitOk, refused = false, note;
  try {
    const fd = fs.openSync(out, 'wx');
    fs.writeFileSync(fd, DATA); fs.closeSync(fd); exitOk = '0'; note = 'created exclusively';
  } catch (e) { exitOk = 'refuse:' + e.code; refused = true; note = 'EEXIST path-blocked'; }
  const va = fs.existsSync(victim) ? fs.readFileSync(victim, 'utf8') : null;
  report('C open-wx', shape, victim0, va, exitOk, note, refused);
}

// D: temp + rename
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'D-'));
  const {out, victim, victim0} = setup(shape, d);
  const tmp = path.join(d, 't.txt');
  fs.writeFileSync(tmp, DATA); fs.renameSync(tmp, out);
  const va = fs.existsSync(victim) ? fs.readFileSync(victim, 'utf8') : null;
  const stillLink = fs.lstatSync(out).isSymbolicLink();
  report('D rename', shape, victim0, va, '0', `out-is-symlink=${stillLink}`, false);
}

// E: lstat-aware refusal (linkexists check) then open 'w'
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'E-'));
  const {out, victim, victim0} = setup(shape, d);
  let exitOk = '0', refused = false;
  const present = fs.lstatSync(out, {throwIfNoEntry: false}) !== undefined;
  if (present) refused = true;
  else fs.writeFileSync(out, DATA);
  const va = fs.existsSync(victim) ? fs.readFileSync(victim, 'utf8') : null;
  report('E lstat-gate+w', shape, victim0, va, exitOk, `lstat-present=${present}`, refused);
}

// Frozen R9 replication with symlink-follower mock
console.log('\n--- frozen R9 replication (replay70-probe.mjs exact assertion shape) ---');
{
  const root = fs.mkdtempSync(path.join(sandbox, 'R9-'));
  const tool = path.join(root, 'mock.mjs');
  fs.writeFileSync(tool, `import fs from 'node:fs';
const out = process.argv[2];
if (fs.existsSync(out)) { console.error('refuse'); process.exit(1); }
fs.writeFileSync(out, 'CONTROL-OUTPUT\\n'); console.log('CONTROL-PASS donothing');`);
  const existing = path.join(root, 'existing.txt');
  fs.writeFileSync(existing, 'do-not-overwrite\n');
  const col = spawnSync(process.execPath, [tool, existing], {encoding: 'utf8'});
  console.log(`R9 regular-file arm: status=${col.status} preserved=${fs.readFileSync(existing, 'utf8') === 'do-not-overwrite\n'} (frozen probe would score this ${col.status !== 0 && fs.readFileSync(existing, 'utf8') === 'do-not-overwrite\n' ? 'PASS' : 'FAIL'})`);
  const v = path.join(root, 'victim.txt'); fs.writeFileSync(v, VICTIM0);
  const l = path.join(root, 'link.txt'); fs.symlinkSync(v, l);
  const c2 = spawnSync(process.execPath, [tool, l], {encoding: 'utf8'});
  console.log(`probe-untested symlink arm: status=${c2.status} victim-unchanged=${fs.readFileSync(v, 'utf8') === VICTIM0}  <-- frozen counter never constructs this shape`);
  const v3 = path.join(root, 'no-such.txt');
  const l3 = path.join(root, 'link3.txt'); fs.symlinkSync(v3, l3);
  const c3 = spawnSync(process.execPath, [tool, l3], {encoding: 'utf8'});
  console.log(`probe-untested dangling arm: status=${c3.status} referent-created=${fs.existsSync(v3)} referent-bytes=${fs.existsSync(v3) ? JSON.stringify(fs.readFileSync(v3, 'utf8')) : 'null'}  <-- frozen counter never constructs this shape either`);
}

console.log('\n=== SUMMARY (victim-correct) ===');
for (const r of results) console.log(`${r.strat} | ${r.shape} | safe=${r.safe} | exit=${r.exitOk} | refused=${r.refused}`);
const hits = results.filter(r => !r.safe);
console.log(`\ntarget-overwrite cells: ${hits.length}/${results.length}`);
console.log('sandbox:', sandbox);
