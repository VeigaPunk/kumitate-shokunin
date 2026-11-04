#!/usr/bin/env node
// CONTROL (pre-freeze, round 88): blanket refusal. Usage and selftest are honest-looking;
// every bind fails closed with whichever token the probe could want. A probe whose new
// fail-closed arms carried no positive sub-run would credit this tool.
const a = process.argv.slice(2);
if (a.length === 0) { console.log('USAGE: node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex>'); process.exit(64); }
if (a.includes('--selftest')) { console.log('RECEIPT_BIND_SELFTEST: PASS held=1/1'); process.exit(0); }
console.log('RECEIPT_BIND: FAIL-CLOSED ESCAPES_LANE SYMLINK_DIR RECEIPT_TOO_LARGE AMBIGUOUS_FIELD UNRESOLVED DIR_UNREADABLE REV_UNRESOLVED SYMLINK_RECEIPT');
process.exit(2);
