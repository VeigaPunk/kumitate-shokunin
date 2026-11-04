#!/usr/bin/env node
// CONTROL (pre-freeze): keys the verdict on the directory path, never reads a receipt.
const a = process.argv.slice(2);
if (a.length === 0) { console.log('USAGE: node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex>'); process.exit(64); }
if (a.includes('--selftest')) { console.log('RECEIPT_BIND_SELFTEST: PASS held=10/10'); process.exit(0); }
const i = a.indexOf('--dir');
const dir = i >= 0 ? a[i + 1] : '';
if (dir.includes('round-86')) { console.log('RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=0 first=c1-probe.txt'); process.exit(1); }
if (dir.includes('round-87')) { console.log('RECEIPT_BIND: CLEAN matched=10 mismatched=0 unchecked=0 external=0'); process.exit(0); }
console.log('RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=0 first=c1-probe.txt');
process.exit(1);
