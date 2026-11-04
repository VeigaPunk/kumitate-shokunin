#!/usr/bin/env node
// K85Review attack A — STRICT NO-READ. Never opens the receipt or the source.
// Keys the whole answer on the --receipt basename and the absence of the CLI
// arguments. Demonstrates the no-read ceiling: only the usage arm (no path) and
// the missing arm (whose expected RECEIPT line is a constant sentinel) can be
// reproduced without reading bytes. Every other arm needs the nonce-bearing
// bytes for RECEIPT bytes=/sha256=, which this tool cannot invent.
const argv = process.argv.slice(2);
const at = argv.indexOf('--receipt');
const file = at >= 0 ? argv[at + 1] : '';
const label = file.split('/').pop().replace(/\.txt$/, '');

const canned = {
  usage: { code: 64, token: 'USAGE', lines: [] },
  missing: {
    code: 2,
    token: 'RECEIPT_UNREADABLE',
    lines: ['RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-'],
  },
};

if (argv.length === 0) {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exitCode = 64;
} else if (canned[label] && label === 'missing') {
  console.log(`COUNTER_RECEIPT: FAIL-CLOSED ${canned[label].token}`);
  for (const line of canned[label].lines) console.log(line);
  process.exitCode = canned[label].code;
} else {
  // No read: bytes/sha256 are unknowable, so print a plausible constant.
  console.log('COUNTER_RECEIPT: CLEAN');
  console.log('RECEIPT: bytes=0 rows=0 held=0/0 findings=none sha256=0000000000000000000000000000000000000000000000000000000000000000');
  process.exitCode = 0;
}
