#!/usr/bin/env node
// K85Critic attack artifact: label-keyed READER plus one trailing line after
// SOURCE. The frozen probe asserts out.length === 2 for arms without --src but
// never asserts exactly three lines when --src is named, so the fourth line is
// accepted even though the contract says the output is exactly three lines.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';

const argv = process.argv.slice(2);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const receipt = valueOf('--receipt');
const src = valueOf('--src');
if (!receipt) {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exit(64);
}

const FIX = {
  clean: [0, 'CLEAN', 2, '2/2'],
  crlf: [0, 'CLEAN', 2, '2/2'],
  'hidden-red': [1, 'ARMS_TOTAL', 2, '1/1'],
  'total-drift': [1, 'ARMS_TOTAL', 2, '2/3'],
  'held-drift': [1, 'HELD_COUNT', 2, '1/2'],
  duplicate: [1, 'ARM_DUPLICATE', 2, '2/2'],
  'foreign-arm': [1, 'ARM_PREFIX', 2, '2/2'],
  'two-summaries': [2, 'SUMMARY_COUNT', 2, '2/2'],
  'no-summary': [2, 'SUMMARY_COUNT', 1, '-/-'],
  'malformed-arm': [2, 'ARM_MALFORMED', 0, '1/1'],
  'zero-arms': [2, 'ARMS_EMPTY', 0, '0/0'],
  missing: [2, 'RECEIPT_UNREADABLE', 0, '-/-'],
  'honest-red': [1, 'ARM_FAILED', 1, '0/1'],
  'wrong-verdict': [1, 'VERDICT', 2, '2/2'],
  'summary-before-arms': [2, 'SUMMARY_ORDER', 2, '2/2'],
  'src-bound-clean': [0, 'CLEAN', 3, '3/3', 'SOURCE: sites=3 declared=3 receipt=3'],
  'src-unbound': [1, 'ARM_UNBOUND', 3, '3/3', 'SOURCE: sites=3 declared=3 receipt=3'],
  'src-arity': [1, 'SOURCE_ARITY', 3, '3/3', 'SOURCE: sites=4 declared=4 receipt=3'],
  'src-declared': [1, 'SOURCE_DECLARED', 3, '3/3', 'SOURCE: sites=3 declared=2 receipt=3'],
};

const label = basename(receipt).replace(/\.txt$/, '');
let bytes = 0;
let sha = '-';
try {
  const buf = readFileSync(receipt);
  bytes = buf.length;
  sha = createHash('sha256').update(buf).digest('hex');
} catch {
  // absent receipt: bytes=0 sha256=-
}
const row = FIX[label];
if (!row) {
  console.log('COUNTER_RECEIPT: CLEAN');
  console.log(`RECEIPT: bytes=${bytes} rows=0 held=0/0 findings=none sha256=${sha}`);
  process.exit(0);
}
const [code, token, rows, held, sourceLine] = row;
const drift = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
console.log(`COUNTER_RECEIPT: ${drift}${token}`);
console.log(`RECEIPT: bytes=${bytes} rows=${rows} held=${held} findings=${token === 'CLEAN' ? 'none' : token} sha256=${sha}`);
if (src !== undefined) {
  console.log(sourceLine);
  console.log('EXTRA-LINE-NOT-CHECKED');
}
process.exit(code);
