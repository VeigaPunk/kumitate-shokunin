#!/usr/bin/env node
// PATTERN P3 (defective): guard ONLY on spawnSync `error`; receipt label == pass.
// If Node does not populate `error` on timeout kill, the guard is vacuous.
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
if (r.error) { console.log(`CONTROL-FAIL ${mode} spawn-error`); fs.writeFileSync(out, text + `CONTROL-FAIL ${mode}\n`); process.exit(1); }
if (text.includes('LEDGER69_UNMET')) {
  fs.writeFileSync(out, text + `CONTROL-PASS ${mode}\n`);
  console.log(`CONTROL-PASS ${mode}`);
  process.exit(0);
}
fs.writeFileSync(out, text + `CONTROL-FAIL ${mode}\n`);
console.log(`CONTROL-FAIL ${mode}`);
process.exit(1);
