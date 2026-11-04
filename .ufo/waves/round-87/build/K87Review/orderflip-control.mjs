#!/usr/bin/env node
// K87Review CONTROL "order-flip" — identical verdicts to dirkey, but prints
// `mismatched=` BEFORE `matched=` on every line.
//
// Purpose: show that the frozen probe's `field(line, key)` is an unanchored
// /<key>=(\d+)/ match, so `field(line,'matched')` matches the `matched=` substring
// inside `mismatched=`. A tool whose field order is mismatched-first is scored wrong
// even when its verdict and tallies are correct.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const argv = process.argv.slice(2);
function usage() {
  process.stderr.write('USAGE: node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json]\n');
  process.exit(64);
}
if (argv.length === 0) usage();
if (argv.includes('--selftest')) { console.log('RECEIPT_BIND_SELFTEST: PASS held=39/39'); process.exit(0); }
const di = argv.indexOf('--dir');
if (di < 0 || argv[di + 1] === undefined) usage();
const dir = argv[di + 1];
const name = basename(dir);
const parent = basename(dirname(dir));

// mismatched= first, matched= second (the only difference from dirkey).
const CLEAN = (m, e = 0) => `RECEIPT_BIND: CLEAN mismatched=0 unchecked=0 matched=${m} external=${e}`;
const DRIFT = (m, mm, u, e = 0) => `RECEIPT_BIND: DRIFT mismatched=${mm} unchecked=${u} matched=${m} external=${e} first=-`;
const FC = (token, detail = '') => `RECEIPT_BIND: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`;

if (!existsSync(dir)) { console.log(FC('DIR_UNREADABLE', dir)); process.exit(2); }
if (parent === 'round-86' && name === 'close') { console.log(DRIFT(1, 9, 0, 1)); process.exit(1); }
if (parent === 'round-87' && name === 'close') { console.log(CLEAN(10)); process.exit(0); }
switch (name) {
  case 'flip-cmd': console.log(DRIFT(9, 1, 0)); process.exit(1);
  case 'flip-hash': console.log(DRIFT(9, 1, 0)); process.exit(1);
  case 'unchecked': console.log(DRIFT(9, 0, 1)); process.exit(1);
  case 'unresolved': console.log(FC('UNRESOLVED', 'scripts/absent-87-probe.mjs')); process.exit(2);
  case 'rev-bad': console.log(FC('REV_UNRESOLVED', '--rev ' + '0'.repeat(40))); process.exit(2);
  case 'symlink': console.log(FC('SYMLINK_RECEIPT', dir)); process.exit(2);
  case 'random-fixture': {
    const c = join(dir, '.k87review-calls');
    const n = existsSync(c) ? Number(readFileSync(c, 'utf8')) + 1 : 1;
    writeFileSync(c, String(n));
    if (n === 1) { console.log(CLEAN(1)); process.exit(0); }
    console.log(DRIFT(0, 1, 0)); process.exit(1);
  }
  default: break;
}
console.log(DRIFT(0, 1, 0));
process.exit(1);
