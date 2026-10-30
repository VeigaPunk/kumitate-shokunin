#!/usr/bin/env node
// K70AttackOutputSymlink — isolated counterexample for the contract edge:
//   "output symlink and dangling symlink must never overwrite target"
//
// Attacks four candidate output-writing strategies with four --out path shapes:
//   S1 regular existing file (frozen probe R9 shape)
//   S2 symlink -> existing target file
//   S3 dangling symlink (target does not exist)
//   S4 symlink -> frozen-payload stand-in (worst case: target bytes must survive)
//
// Strategies (stand-ins for what scripts/control-replay.mjs might do):
//   A  existsSync gate + fs.writeFileSync(out, data)        (naive stat-based refusal)
//   B  shell redirect `> "$OUT"` inside generated copy      (what a private-script copy could do)
//   C  fs.openSync(out, 'wx') exclusive creation            (contract "output creation exclusive")
//   D  temp file + fs.renameSync(temp, out)                 (atomic replace)
//
// Verdict per cell: TARGET-SAFE only if the target's bytes are untouched AND,
// for the refuse arms, the tool reported failure. Then replicates the frozen
// probe's exact R9 assertion block against a symlink-following mock to show the
// frozen counter leaves this edge uncovered.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const scratch = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const seatDir = path.join(scratch, 'kumitate-r70', 'K70AttackOutputSymlink');
const sandbox = fs.mkdtempSync(path.join(seatDir, 'attack-'));
const DATA = 'CONTROL-OUTPUT\n';

const results = [];
const rec = (strategy, shape, targetBefore, targetAfter, exitOk, note) => {
  const safe = targetBefore === targetAfter;
  results.push({strategy, shape, safe, targetBefore, targetAfter, exitOk, note});
  console.log(`${safe ? 'TARGET-SAFE  ' : 'TARGET-HIT!! '} strat=${strategy} shape=${shape} exit=${exitOk} ${note}`);
};

function setup(shape, dir) {
  const target = path.join(dir, 'target.txt');
  const out = path.join(dir, 'out.txt');
  fs.writeFileSync(target, 'FROZEN-PAYLOAD-DO-NOT-TOUCH\n');
  if (shape === 'S1') fs.writeFileSync(out, 'do-not-overwrite\n');
  if (shape === 'S2') fs.symlinkSync(target, out);
  if (shape === 'S3') fs.symlinkSync(path.join(dir, 'nonexistent-target.txt'), out);
  if (shape === 'S4') { fs.rmSync(target); fs.writeFileSync(target, 'FROZEN-COUNTER-BYTES\n'); fs.symlinkSync(target, out); }
  return {target, out};
}
const shapes = ['S1', 'S2', 'S3', 'S4'];
const before = fs.readFileSync;

// Strategy A: existsSync gate + writeFileSync (Node)
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'A-'));
  const {target, out} = setup(shape, d);
  const t0 = fs.readFileSync(target, 'utf8');
  let exitOk = 'n/a', note;
  try {
    if (fs.existsSync(out)) { note = 'refused via existsSync'; }
    else { fs.writeFileSync(out, DATA); note = 'gate passed, wrote'; }
    exitOk = '0';
  } catch (e) { exitOk = 'err'; note = 'threw ' + e.code; }
  rec('A-existsSync+w', shape, t0, fs.readFileSync(target, 'utf8'), exitOk, note);
}

// Strategy B: shell redirect `> out` (what a generated private bash copy could do)
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'B-'));
  const {target, out} = setup(shape, d);
  const t0 = fs.readFileSync(target, 'utf8');
  const r = spawnSync('bash', ['-c', 'printf "%s" "$2" > "$1"; echo "CONTROL-PASS mock"', 'mock', out, DATA], {encoding: 'utf8'});
  rec('B-shell->', shape, t0, fs.readFileSync(target, 'utf8'), String(r.status), 'redirect exit=' + r.status);
}

// Strategy C: exclusive creation fs.openSync(out, 'wx')
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'C-'));
  const {target, out} = setup(shape, d);
  const t0 = fs.readFileSync(target, 'utf8');
  let exitOk, note;
  try {
    const fd = fs.openSync(out, 'wx');
    fs.writeFileSync(fd, DATA); fs.closeSync(fd);
    exitOk = '0'; note = 'created exclusively';
  } catch (e) { exitOk = 'refused:' + e.code; note = 'exclusive open failed ' + e.code; }
  rec('C-open-wx', shape, t0, fs.readFileSync(target, 'utf8'), exitOk, note);
}

// Strategy D: temp + rename (atomic replace of the path entry itself)
for (const shape of shapes) {
  const d = fs.mkdtempSync(path.join(sandbox, 'D-'));
  const {target, out} = setup(shape, d);
  const t0 = fs.readFileSync(target, 'utf8');
  const tmp = path.join(d, 'tmp-out.txt');
  fs.writeFileSync(tmp, DATA);
  fs.renameSync(tmp, out);
  const stillLink = fs.lstatSync(out).isSymbolicLink();
  rec('D-rename', shape, t0, fs.readFileSync(target, 'utf8'), '0', `renamed; out-is-symlink-now=${stillLink}`);
}

// Frozen-probe R9 replication: the probe's R9 block uses ONLY a regular file.
// Show a symlink-following candidate still satisfies every R9 assertion.
console.log('\n--- frozen R9 replication (regular-file only, per replay70-probe.mjs lines) ---');
{
  const root = fs.mkdtempSync(path.join(sandbox, 'R9rep-'));
  const tool = path.join(root, 'mock-candidate.mjs');
  // mock candidate: exactly strategy A (existsSync gate + write) — passes R9's regular-file arm,
  // follows dangling symlinks in the S3 shape (demonstrated above).
  fs.writeFileSync(tool, `
import fs from 'node:fs';
const out = process.argv[2];
if (fs.existsSync(out)) { console.error('refuse: exists'); process.exit(1); }
fs.writeFileSync(out, 'CONTROL-OUTPUT\\n');
console.log('CONTROL-PASS donothing');`);
  // exact R9 assertion shape from replay70-probe.mjs:
  const existing = path.join(root, 'existing.txt');
  fs.writeFileSync(existing, 'do-not-overwrite\n');
  const collision = spawnSync(process.execPath, [tool, existing], {encoding: 'utf8'});
  const r9Regular = collision.status !== 0 && fs.readFileSync(existing, 'utf8') === 'do-not-overwrite\n';
  console.log(`R9-regular-file assertion vs symlink-following mock: ${r9Regular ? 'PASS (candidate unharmed)' : 'FAIL'}`);
  // now the shape the probe never constructs:
  const target2 = path.join(root, 'victim.txt');
  fs.writeFileSync(target2, 'FROZEN-PAYLOAD-DO-NOT-TOUCH\n');
  const link2 = path.join(root, 'link-out.txt');
  fs.symlinkSync(target2, link2); // dangling handled in S3 above; here live symlink to victim
  const c2 = spawnSync(process.execPath, [tool, link2], {encoding: 'utf8'});
  const victimAfter = fs.readFileSync(target2, 'utf8');
  console.log(`probe-untested shape: exit=${c2.status} victim-unchanged=${victimAfter === 'FROZEN-PAYLOAD-DO-NOT-TOUCH\n'} (TARGET-HIT if false)`);
}

console.log('\n=== SUMMARY ===');
for (const r of results) console.log(`${r.strategy} ${r.shape} safe=${r.safe} exit=${r.exitOk} ${r.note}`);
const hits = results.filter(r => !r.safe);
console.log(`target-overwrite cells: ${hits.length}/${results.length}`);
console.log('sandbox:', sandbox);
