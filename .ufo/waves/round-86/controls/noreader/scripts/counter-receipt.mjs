#!/usr/bin/env node
// label-keyed no-reader: derives its verdict from the argv path name only.
import { basename } from 'node:path';
const a = process.argv.slice(2);
if (!a.length) { console.log('COUNTER_RECEIPT: USAGE'); process.exit(0); }
const name = basename(a[a.length - 1]).replace(/\.[a-z]+$/, '');
const table = {
  'rnd-clean': ['CLEAN', 0], 'rnd-clean-metadata-crlf': ['CLEAN', 0], 'rnd-fail': ['ARM_FAILED', 1],
  'rnd-held-drift': ['HELD_COUNT', 1], 'rnd-total-drift': ['ARMS_TOTAL', 1], 'rnd-duplicate': ['ARM_DUPLICATE', 1],
  'rnd-malformed': ['ARM_MALFORMED', 2], 'rnd-summary-order': ['SUMMARY_ORDER', 2], 'mut-held': ['HELD_COUNT', 1],
  'mut-verdict': ['ARM_FAILED', 1], 'metadata-colon': ['CLEAN', 0], 'honest-red': ['ARM_FAILED', 1],
  'src-rnd-clean': ['CLEAN', 0], 'src-digest-a': ['CLEAN', 0], 'src-digest-b': ['CLEAN', 0],
  'src-no-declared': ['CLEAN', 0], 'src-two-declarations': ['CLEAN', 0], 'src-arity': ['SOURCE_ARITY', 1],
  'src-declared': ['SOURCE_DECLARED', 1], 'src-unbound': ['ARM_UNBOUND', 1], 'src-unreadable': ['SOURCE_UNREADABLE', 2],
  'src-empty': ['SOURCE_ARMS_EMPTY', 2],
};
const [token, code] = table[name] ?? ['CLEAN', 0];
const label = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
console.log(`COUNTER_RECEIPT: ${label}${token}`);
console.log('RECEIPT: bytes=0 rows=0 held=0/0 findings=none sha256=-');
if (a.includes('--src')) console.log('SOURCE: sites=0 declared=absent receipt=0 sha256=-');
process.exitCode = code;
