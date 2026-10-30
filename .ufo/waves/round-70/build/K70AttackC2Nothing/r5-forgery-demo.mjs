#!/usr/bin/env node
// K70AttackC2Nothing — isolated counterexample for the R70 contract edge:
//   "c2 donothing --no-live state cannot prove live origin."
//
// What this script DOES: replicates, in logic, the R3–R7 predicate from the FROZEN
// counter .ufo/waves/round-70/probe/replay70-probe.mjs (frozen plan
// 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a), and feeds it receipts FABRICATED
// LOCALLY — no control script executed, no probe executed, no fixture built, no
// frozen byte touched, nothing written outside this scratch dir.
//
// What this script NEVER does: execute c1-controls.sh / c2-controls.sh (original
// or copy), execute deprec69-probe.mjs / ledger69-probe.mjs, or write in the lane.
//
// Demonstration:
//   A. VACUITY  — the c2-donothing receipt is REQUIRED by design to carry
//      live=no-live(vacuous-declared) (c2-controls.sh sets LIVEFLAG=--no-live for
//      every mode except forgecapture). R5 therefore cannot distinguish a counter
//      with a working live-origin arm from one whose live arm is stubbed out.
//   B. FORGERY  — the R5 predicate is pure substring inclusion + exit 0 + empty
//      work dir (frozen line 34). A receipt of exactly the two required strings
//      passes without any probe running. The vacuous no-live state hides forgery:
//      no live network artifact exists that would be absent from a fabricated run.
//   C. AGGREGATE — fabricating all five mode receipts yields held=10/10 while the
//      counter's own summary still reports live=no-live(vacuous-declared). Also,
//      frozen line 31 derives the summary live marker from receipt TEXT alone, so
//      a fabricated forgecapture receipt containing 'live=exercised' would falsely
//      promote the summary to live=exercised (false provenance, compounding).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const MODES = [
  ['c1', 'donothing'], ['c1', 'autoledger'],
  ['c2', 'donothing'], ['c2', 'autoorigin'], ['c2', 'forgecapture'],
];

// Frozen counter line 32.
const labelOf = f => (f === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET');

// A fabricated receipt for `mode`. Shaped on the committed r69 receipt
// .ufo/waves/round-69/controls/c2-donothing.txt (header live marker) plus the
// CONTROL-PASS line the frozen counter requires. rev is unvalidated by any check.
const forgedReceipt = mode =>
  `${labelOf(mode[0])} held=8/11 checks=11 rev=0000000000000000000000000000000000000000 rule=M69 ` +
  `live=no-live(vacuous-declared) | M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent\n` +
  `control=${mode[1]} live=no-live-vacuous-declared exit=1 rev=0000000000000000000000000000000000000000\n` +
  `CONTROL-PASS ${mode[1]}\n`;

// Exact replica of frozen line 34 predicate, minus the probe spawn:
//   r.status===0 && text.includes(label) && text.includes('CONTROL-PASS '+mode)
//   && preserved && fs.readdirSync(work).length===0
function predicateR(rStatus, text, family, mode, preserved, workDir) {
  return rStatus === 0 &&
    text.includes(labelOf(family)) &&
    text.includes('CONTROL-PASS ' + mode) &&
    preserved &&
    fs.readdirSync(workDir).length === 0;
}

console.log('=== K70AttackC2Nothing counterexample: no control/probe executed, all receipts fabricated ===');
const results = [];
for (const [i, [family, mode]] of MODES.entries()) {
  const text = forgedReceipt([family, mode]);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), `k70c2nothing-${i}-`)); // candidate-unique work root
  const ok = predicateR(0, text, family, mode, true, work); // preserved=true: we never touched frozen files
  fs.rmSync(work, {recursive: true, force: true});          // candidate "reclaims work directory"
  results.push(ok);
  console.log(`R${i + 3} ${ok ? 'PASS' : 'MISS'} family=${family} mode=${mode} receipt=${Buffer.byteLength(text)}B probeRan=false`);
}

// Minimal forgery for the assigned edge: smallest receipt satisfying R5's substrings.
const minimal =
  `DEPREC69_UNMET held=0/0 rule=M69 live=no-live(vacuous-declared)\n` +
  `CONTROL-PASS donothing\n`;
const minimalOk = minimal.includes('DEPREC69_UNMET') && minimal.includes('CONTROL-PASS donothing');
console.log(`R5-minimal-forgery predicate-satisfied=${minimalOk} receipt=${Buffer.byteLength(minimal)}B probeRan=false`);

// Aggregate: fabricated five-mode run. Frozen line 31 live marker:
//   if(mode==='forgecapture'&&text.includes('live=exercised')) live='exercised';
// driven purely by receipt text -> a fabricated 'live=exercised' string would set it.
const fabricatedForge = forgedReceipt(['c2', 'forgecapture']).replace('live=no-live(vacuous-declared)', 'live=exercised');
let live = 'no-live(vacuous-declared)';
if (fabricatedForge.includes('live=exercised')) live = 'exercised';
const held = results.filter(Boolean).length;
console.log(`AGGREGATE fabricated held=${held}/10 summary-live-marker-if-forgecapture-tampered=${live}`);

console.log('VACUITY EVIDENCE (read-only inspection, frozen r69 bytes):');
console.log('  c2-controls.sh: LIVEFLAG=\'\' only for forgecapture; donothing/autoorigin run deprec69-probe --no-live.');
console.log('  deprec69-probe.mjs: NO_LIVE forces M5/M11 misses recorded as no-live; receipt header live=no-live(vacuous-declared).');
console.log('  committed receipt c2-donothing.txt line 1: DEPREC69_UNMET ... live=no-live(vacuous-declared).');
process.exitCode = 0;
