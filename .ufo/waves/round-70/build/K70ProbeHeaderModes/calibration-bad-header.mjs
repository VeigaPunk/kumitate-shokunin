#!/usr/bin/env node
// calibration-bad-header.mjs — deliberately sloppy header for probe negative calibration.
// Accepts ANY family/mode, always writes a receipt, exits 0. MECHANISM-ONLY test double;
// not the candidate. Exists only to prove probe-header-modes.mjs can FAIL.
import fs from 'node:fs';
const argv = process.argv.slice(2);
const val = f => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : ''; };
const family = val('--family') || 'c1', mode = val('--mode') || 'donothing', out = val('--out');
if (argv.includes('--selftest')) { console.log('CONTROL_REPLAY_SELFTEST: PASS'); process.exit(0); }
fs.writeFileSync(out, `WHATEVER_UNMET family=${family} mode=${mode}\nCONTROL-PASS ${mode}\n`);
console.log(`CONTROL-PASS ${mode}`);
process.exit(0);
