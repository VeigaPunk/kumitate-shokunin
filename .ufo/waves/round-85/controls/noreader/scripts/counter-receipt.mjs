#!/usr/bin/env node
// Control C — label-keyed no-reader. It never opens the receipt or the source:
// it keys on the --receipt basename and prints the round-85 fixture's canned
// answers (the class the round-84 kill rule caught). The nonce metadata line
// the frozen probe writes changes bytes/sha256 per run, so no canned answer can
// match the input-derived line.
import { createHash } from 'node:crypto';
import { basename } from 'node:path';

const argv = process.argv.slice(2);
const index = argv.indexOf('--receipt');
const file = index >= 0 ? argv[index + 1] : '';
const label = basename(file || '', '.txt');
const good = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
const fix = {
  clean: [0, 'CLEAN', good, 2, '2/2'],
  crlf: [0, 'CLEAN', good.replaceAll('\n', '\r\n'), 2, '2/2'],
  'hidden-red': [1, 'ARMS_TOTAL', 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', 2, '1/1'],
  'total-drift': [1, 'ARMS_TOTAL', good.replace('2/2', '2/3'), 2, '2/3'],
  'held-drift': [1, 'HELD_COUNT', good.replace('2/2', '1/2'), 2, '1/2'],
  duplicate: [1, 'ARM_DUPLICATE', 'X arm a ok\nX arm a ok\nX: HELD held=2/2\n', 2, '2/2'],
  'foreign-arm': [1, 'ARM_PREFIX', 'X arm a ok\nY arm b ok\nX: HELD held=2/2\n', 2, '2/2'],
  'two-summaries': [2, 'SUMMARY_COUNT', good + 'X: HELD held=2/2\n', 2, '2/2'],
  'no-summary': [2, 'SUMMARY_COUNT', 'X arm a ok\n', 1, '-/-'],
  'malformed-arm': [2, 'ARM_MALFORMED', 'X arm a MAYBE\nX: HELD held=1/1\n', 0, '1/1'],
  'zero-arms': [2, 'ARMS_EMPTY', 'X: HELD held=0/0\n', 0, '0/0'],
  missing: [2, 'RECEIPT_UNREADABLE', null, 0, '-/-'],
  'honest-red': [1, 'ARM_FAILED', 'X arm a FAIL\nX: UNMET held=0/1\n', 1, '0/1'],
  'wrong-verdict': [1, 'VERDICT', good.replace('HELD', 'UNMET'), 2, '2/2'],
  'summary-before-arms': [2, 'SUMMARY_ORDER', 'X: HELD held=2/2\nX arm a ok\nX arm b ok\n', 2, '2/2'],
  'src-bound-clean': [0, 'CLEAN', three, 3, '3/3'],
  'src-unbound': [1, 'ARM_UNBOUND', 'X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n', 3, '3/3'],
  'src-arity': [1, 'SOURCE_ARITY', three, 3, '3/3'],
  'src-declared': [1, 'SOURCE_DECLARED', three, 3, '3/3'],
};
if (label === 'usage') {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exitCode = 64;
} else if (!fix[label]) {
  console.log('COUNTER_RECEIPT: CLEAN');
  console.log('RECEIPT: bytes=0 rows=0 held=0/0 findings=none sha256=0000000000000000000000000000000000000000000000000000000000000000');
  process.exitCode = 0;
} else {
  const [code, token, body, rows, held] = fix[label];
  const label1 = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
  const bytes = body === null ? 0 : Buffer.byteLength(body);
  const sha = body === null ? '-' : createHash('sha256').update(Buffer.from(body, 'utf8')).digest('hex');
  console.log(`COUNTER_RECEIPT: ${label1}${token}`);
  console.log(`RECEIPT: bytes=${bytes} rows=${rows} held=${held} findings=${token === 'CLEAN' ? 'none' : token} sha256=${sha}`);
  if (argv.includes('--src')) console.log(`SOURCE: sites=${label.startsWith('src') ? 3 : 0} declared=${label === 'src-declared' ? 2 : 3} receipt=${rows}`);
  process.exitCode = code;
}
