#!/usr/bin/env node
// K85Critic control: label-keyed no-reader, class ceiling. It never opens the
// receipt. A no-reader can pass 'usage' (no argv) and 'missing' (a label whose
// expected receipt line is bytes=0 sha256=-), i.e. 2/20 -- the committed
// noreader control scores 1/20 only because its usage branch keys on a filename
// instead of empty argv.
import { basename } from 'node:path';

const argv = process.argv.slice(2);
const index = argv.indexOf('--receipt');
const receipt = index >= 0 ? argv[index + 1] : undefined;
if (!receipt) {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exit(64);
}
const label = basename(receipt).replace(/\.txt$/, '');
if (label === 'missing') {
  console.log('COUNTER_RECEIPT: FAIL-CLOSED RECEIPT_UNREADABLE');
  console.log('RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-');
  process.exit(2);
}
console.log('COUNTER_RECEIPT: CLEAN');
console.log('RECEIPT: bytes=0 rows=0 held=0/0 findings=none sha256=0000000000000000000000000000000000000000000000000000000000000000');
process.exit(0);
