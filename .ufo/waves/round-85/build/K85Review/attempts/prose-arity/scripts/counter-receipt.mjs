#!/usr/bin/env node
// K85Review ambiguity probe A — a path-keyed harness (used ONLY as a testbed,
// not a candidate tool) that differs from attack B in one decision: the frozen
// contract prose names SOURCE_ARITY and SOURCE_DECLARED but never states which
// comparison each one is. This variant reads them the other plausible way
// (SOURCE_ARITY = declared != receipt, so it fires first; SOURCE_DECLARED is
// then unreachable). Everything else is identical, so the score isolates the
// tie-break: the probe's expectations are the only place the boundary exists.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const argv = process.argv.slice(2);
const at = argv.indexOf('--receipt');
const file = at >= 0 ? argv[at + 1] : '';
const label = file.split('/').pop().replace(/\.txt$/, '');
const hasSrc = argv.includes('--src');

const table = {
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
  // the alternative prose reading: declared(2) != receipt(3) => SOURCE_ARITY first
  'src-declared': [1, 'SOURCE_ARITY', 3, '3/3', 'SOURCE: sites=3 declared=2 receipt=3'],
};

function emit(code, token, rows, held, bytes, sha, srcLine) {
  const prefix = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
  console.log(`COUNTER_RECEIPT: ${prefix}${token}`);
  const findings = token === 'CLEAN' ? 'none' : token;
  console.log(`RECEIPT: bytes=${bytes} rows=${rows} held=${held} findings=${findings} sha256=${sha}`);
  if (hasSrc && srcLine !== undefined) console.log(srcLine);
  process.exitCode = code;
}

if (argv.length === 0) {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exitCode = 64;
} else if (label === 'missing') {
  emit(2, 'RECEIPT_UNREADABLE', 0, '-/-', 0, '-', undefined);
} else if (table[label]) {
  const [code, token, rows, held, srcLine] = table[label];
  const buf = readFileSync(file);
  emit(code, token, rows, held, buf.length, createHash('sha256').update(buf).digest('hex'), srcLine);
} else {
  const buf = readFileSync(file);
  emit(0, 'CLEAN', 0, '0/0', buf.length, createHash('sha256').update(buf).digest('hex'), undefined);
}
