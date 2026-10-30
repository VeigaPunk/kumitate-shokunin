#!/usr/bin/env node
// PATTERN P2 (defective): success iff child exit status !== 1.
// spawnSync timeout kill yields status === null, and null !== 1 -> success branch.
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
// DEFECT: null (timeout) is not 1, so a killed child lands in the PASS branch.
if (r.status !== 1) {
  fs.writeFileSync(out, text + `CONTROL-PASS ${mode}\n`);
  console.log(`CONTROL-PASS ${mode}`);
  process.exit(0);
}
fs.writeFileSync(out, text + `CONTROL-FAIL ${mode}\n`);
console.log(`CONTROL-FAIL ${mode}`);
process.exit(1);
