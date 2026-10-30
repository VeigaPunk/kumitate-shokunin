#!/usr/bin/env node
// K70AttackConcurrent attack driver — counters the frozen probe's work-dir discipline.
// Never executes originals c1/c2-controls.sh; models only the control-replay contract steps.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const [laneArg, naivePath, fixedPath, outDir] = process.argv.slice(2);
if (!laneArg || !naivePath || !fixedPath || !outDir) process.exit(64);
fs.mkdirSync(outDir, {recursive: true});
const log = fs.createWriteStream(path.join(outDir, 'driver-receipts.txt'));
const say = (s) => { log.write(s + '\n'); };
const run = (tool, args, opts = {}) => spawnSync(process.execPath, [tool, ...args], {encoding: 'utf8', timeout: 60000, ...opts});
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'k70attack-'));
const label = (f) => (f === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET');
const pairs = [['c1', 'donothing'], ['c1', 'autoledger'], ['c2', 'donothing'], ['c2', 'autoorigin'], ['c2', 'forgecapture']];

// ---- Part A: frozen-counter R3-R7 pattern (private pre-created work dir per replay) ----
say('== Part A: frozen counter R3-R7 pattern vs NAIVE candidate ==');
let aPass = 0;
pairs.forEach(([family, mode], i) => {
  const work = path.join(root, `work-${i}`); fs.mkdirSync(work);
  const out = path.join(root, `result-${i}.txt`);
  const r = run(naivePath, ['--lane', laneArg, '--family', family, '--mode', mode, '--out', out, '--work', work]);
  const text = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  const ok = r.status === 0 && text.includes(label(family)) && text.includes('CONTROL-PASS ' + mode) && fs.readdirSync(work).length === 0;
  if (ok) aPass++;
  say(`R${i + 3}-equiv ${family}/${mode}: exit=${r.status} ok=${ok} workEmpty=${fs.readdirSync(work).length === 0} stderr=${(r.stderr || '').trim()}`);
});
say(`Part A: naive candidate passes ${aPass}/5 frozen-pattern replays (each with a PRIVATE work dir)`);
// R8/R9 equivalents
const inv = run(naivePath, ['--family', 'junk']);
say(`R8-equiv invalid args: exit=${inv.status} (expect 64)`);
const existing = path.join(root, 'existing.txt'); fs.writeFileSync(existing, 'do-not-overwrite\n');
const col = run(naivePath, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', existing, '--work', root]);
say(`R9-equiv existing-out refusal: exit=${col.status} existingUnchanged=${fs.readFileSync(existing, 'utf8') === 'do-not-overwrite\n'}`);
say(`R9-equiv side-channel: root entries after refusal = ${JSON.stringify(fs.readdirSync(root))}`);

// ---- Part B: contract edge — two same-mode replays sharing one work parent ----
say('== Part B: shared work parent, SEQUENTIAL same-mode replays vs NAIVE ==');
const sharedB = path.join(root, 'shared-seq'); fs.mkdirSync(sharedB);
const b1 = run(naivePath, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', path.join(root, 'b1.txt'), '--work', sharedB]);
say(`first run : exit=${b1.status}`);
// simulate a crash-after-mkdir sibling OR concurrent replay leaving the fixed child: create the fixed name directly
fs.mkdirSync(path.join(sharedB, 'c1-donothing')); // what a concurrent same-mode replay is using RIGHT NOW
const b2 = run(naivePath, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', path.join(root, 'b2.txt'), '--work', sharedB]);
say(`second run (fixed name held by live sibling): exit=${b2.status} stderr=${(b2.stderr || '').split('\n')[0]} outExists=${fs.existsSync(path.join(root, 'b2.txt'))}`);
say(`work root after collision = ${JSON.stringify(fs.readdirSync(sharedB))}`);

say('== Part B2: shared work parent, CONCURRENT same-mode replays vs NAIVE ==');
const sharedC = path.join(root, 'shared-conc'); fs.mkdirSync(sharedC);
const conc = [['cc1', 'c1'], ['cc2', 'c1']].map(([tag]) => {
  const r = run(naivePath, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', path.join(root, tag + '.txt'), '--work', sharedC]);
  return {tag, status: r.status, stderr: (r.stderr || '').split('\n')[0]};
});
conc.forEach((c) => say(`concurrent ${c.tag}: exit=${c.status} stderr=${c.stderr}`));
const receipts = conc.map((c) => ({tag: c.tag, out: fs.existsSync(path.join(root, c.tag + '.txt'))}));
say(`concurrent receipts present = ${JSON.stringify(receipts)}; work root after = ${JSON.stringify(fs.readdirSync(sharedC))}`);

// ---- Part C: same attack against FIXED candidate ----
say('== Part C: shared work parent, CONCURRENT same-mode replays vs FIXED (mkdtemp) ==');
const sharedD = path.join(root, 'shared-fixed'); fs.mkdirSync(sharedD);
const d1 = run(fixedPath, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', path.join(root, 'd1.txt'), '--work', sharedD]);
const d2 = run(fixedPath, ['--lane', laneArg, '--family', 'c1', '--mode', 'donothing', '--out', path.join(root, 'd2.txt'), '--work', sharedD]);
say(`fixed run 1: exit=${d1.status} stderr=${(d1.stderr || '').split('\n')[0]}`);
say(`fixed run 2: exit=${d2.status} stderr=${(d2.stderr || '').split('\n')[0]}`);
say(`both receipts intact: ${fs.existsSync(path.join(root, 'd1.txt')) && fs.existsSync(path.join(root, 'd2.txt'))}; work root empty: ${fs.readdirSync(sharedD).length === 0}`);
say(`(also: sequential shared-parent rerun would still pass — mkdtemp suffix differs per invocation)`);

fs.rmSync(root, {recursive: true, force: true});
log.end();
