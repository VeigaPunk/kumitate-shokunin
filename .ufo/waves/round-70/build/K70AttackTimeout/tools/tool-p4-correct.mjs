#!/usr/bin/env node
// PATTERN P4 (correct reference): child timeout / signal / non-zero exit can NEVER
// become CONTROL-PASS. PASS requires ALL of:
//   r.status === 0 (clean exit; null from timeout/signal fails this)
//   child stdout contains `CONTROL-PASS <mode>` (the child's own verdict)
//   receipt contains the UNMET label (the old predicate, honestly replayed)
// On any other termination: exit non-zero, out (if written) carries no CONTROL-PASS.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const a = process.argv.slice(2);
const get = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const mode = get('--mode', 'donothing');
const out = get('--out', '');
const work = get('--work', '');
const child = get('--child', '');
const r = spawnSync(child, [mode, work], { encoding: 'utf8', timeout: 1500 });
const receipt = path.join(work, `c1-${mode}.txt`);
const text = fs.existsSync(receipt) ? fs.readFileSync(receipt, 'utf8') : '';
const pass = r.status === 0
  && (r.stdout || '').includes(`CONTROL-PASS ${mode}`)
  && text.includes('LEDGER69_UNMET');
if (pass) {
  fs.writeFileSync(out, text + `CONTROL-PASS ${mode}\n`);
  console.log(`CONTROL-PASS ${mode}`);
  process.exit(0);
}
fs.writeFileSync(out, text + `CONTROL-FAIL ${mode} childStatus=${r.status} childSignal=${r.signal}\n`);
console.log(`CONTROL-FAIL ${mode} childStatus=${r.status} childSignal=${r.signal}`);
process.exit(1);
