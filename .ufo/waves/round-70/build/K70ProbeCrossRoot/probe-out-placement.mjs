#!/usr/bin/env node
// K70ProbeCrossRoot — mechanism-only probe: out nested under scratch child vs out outside work.
// Tests the receipt-survives-cleanup property of the round-70 control-replay implementation
// contract ("Unique mkdtemp child under the supplied work root, receipts copied out before
// cleanup, output creation exclusive") against two cleanup mechanisms:
//   NAIVE   — copy receipt to --out, then rm -rf the whole work root.
//   CONTRACT— refuse --out inside the work root; mkdtemp child; copy out; rm -rf child only.
// No candidate scripts/control-replay.mjs exists in the lane at probe time, so both mechanisms
// are synthetic reproductions. This is mechanism verification, NOT candidate verification.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCRATCH = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const ROOT = fs.mkdtempSync(path.join(SCRATCH, '/kumitate-r70/K70ProbeCrossRoot/probe-'));

const RECEIPT = 'LEDGER69_UNMET held=2/10\nCONTROL-PASS donothing\n';

function naive(out, work) {
  fs.mkdirSync(work, { recursive: true });
  const child = fs.mkdtempSync(path.join(work, 'child-'));
  fs.writeFileSync(path.join(child, 'receipt.txt'), RECEIPT);
  // exclusive creation, then whole-work-root cleanup
  const fd = fs.openSync(out, 'wx');
  fs.writeFileSync(fd, fs.readFileSync(path.join(child, 'receipt.txt')));
  fs.closeSync(fd);
  fs.rmSync(work, { recursive: true, force: true });
  return 0;
}

function contract(out, work) {
  const rWork = path.resolve(work);
  const rOut = path.resolve(out);
  if (rOut === rWork || rOut.startsWith(rWork + path.sep))
    return 64; // refuse: receipt must not be inside the reclaimed work root
  fs.mkdirSync(work, { recursive: true });
  const child = fs.mkdtempSync(path.join(work, 'child-'));
  fs.writeFileSync(path.join(child, 'receipt.txt'), RECEIPT);
  const fd = fs.openSync(out, 'wx'); // exclusive: R9 collision refusal
  fs.writeFileSync(fd, fs.readFileSync(path.join(child, 'receipt.txt')));
  fs.closeSync(fd);
  fs.rmSync(child, { recursive: true, force: true }); // child only, never the work root wholesale
  return 0;
}

const cases = [
  ['outside-work', (mechName) => path.join(ROOT, `outside-${mechName}.txt`), false],
  ['under-work-root', (mechName, w) => path.join(w, `nested-${mechName}.txt`), false],
  ['under-mkdtemp-child', null, true], // resolved after child exists: <work>/child-*/deep/out.txt
];

const results = [];
for (const mech of [['NAIVE', naive], ['CONTRACT', contract]]) {
  for (const [name, outFn, underChild] of cases) {
    const work = path.join(ROOT, `work-${mech[0]}-${name}`);
    fs.mkdirSync(work, { recursive: true });
    let out;
    if (underChild) {
      const child = fs.mkdtempSync(path.join(work, 'child-'));
      out = path.join(child, 'deep', 'out.txt');
      fs.mkdirSync(path.dirname(out), { recursive: true });
    } else {
      out = outFn(mech[0], work);
      fs.mkdirSync(path.dirname(out), { recursive: true });
    }
    let exit, err = '';
    try { exit = mech[1](out, work); } catch (e) { exit = 1; err = e.code || e.message; }
    const outExists = fs.existsSync(out);
    const content = outExists && fs.statSync(out).isFile() ? fs.readFileSync(out, 'utf8') : null;
    const workState = !fs.existsSync(work) ? 'reclaimed' : (fs.readdirSync(work).length === 0 ? 'empty' : 'nonempty');
    results.push({
      mech: mech[0], case: name, exit, err,
      receiptSurvives: !!content && content === RECEIPT,
      outExists, workState,
    });
  }
}

console.log('PROBE_ROOT=' + ROOT);
for (const r of results)
  console.log(`${r.mech} ${r.case} exit=${r.exit}${r.err ? ' err=' + r.err : ''} receiptSurvives=${r.receiptSurvives} outExists=${r.outExists} work=${r.workState}`);
fs.rmSync(ROOT, { recursive: true, force: true });
console.log('SCRATCH_CLEANED=' + !fs.existsSync(ROOT));
