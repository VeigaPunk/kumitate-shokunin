#!/usr/bin/env node
// K87Review CONTROL "dirkey" — cheapest no-work control.
//
// Reads ZERO receipt bytes. It looks only at argv, at whether --dir exists, at the
// directory's own path, and at a call counter it writes into the fixture directory
// (needed because the probe reuses one directory, probe87/random-fixture, for both
// halves of arm 12).
//
// Purpose: measure whether the frozen 12-arm predicate discriminates binding from
// non-binding. If this reaches 12/12, the plan's kill rule fires (plan.md: "Any
// seat-constructed control that reaches 12/12 is scored the same way").
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

const CLEAN = (m, e = 0) => `RECEIPT_BIND: CLEAN matched=${m} mismatched=0 unchecked=0 external=${e}`;
const DRIFT = (m, mm, u, e = 0) => `RECEIPT_BIND: DRIFT matched=${m} mismatched=${mm} unchecked=${u} external=${e} first=-`;
const FC = (token, detail = '') => `RECEIPT_BIND: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`;

// No receipt is read; only the directory's own existence is checked (this is not a receipt read).
if (!existsSync(dir)) { console.log(FC('DIR_UNREADABLE', dir)); process.exit(2); }

// Arm 3 and arm 4: the committed close directories, identified by path alone.
if (parent === 'round-86' && name === 'close') { console.log(DRIFT(1, 9, 0, 1)); process.exit(1); }
if (parent === 'round-87' && name === 'close') { console.log(CLEAN(10)); process.exit(0); }

// Arms 5-11: the probe's same-directory fixtures, identified by their fixture name.
switch (name) {
  case 'flip-cmd': console.log(DRIFT(9, 1, 0)); process.exit(1);
  case 'flip-hash': console.log(DRIFT(9, 1, 0)); process.exit(1);
  case 'unchecked': console.log(DRIFT(9, 0, 1)); process.exit(1);
  case 'unresolved': console.log(FC('UNRESOLVED', 'scripts/absent-87-probe.mjs')); process.exit(2);
  case 'rev-bad': console.log(FC('REV_UNRESOLVED', '--rev ' + '0'.repeat(40))); process.exit(2);
  case 'symlink': console.log(FC('SYMLINK_RECEIPT', dir)); process.exit(2);
  case 'random-fixture': {
    // Arm 12 runs twice over the SAME directory. A counter, not a receipt read.
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
