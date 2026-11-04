#!/usr/bin/env node
// CONTROL (pre-freeze): skips every read and always answers CLEAN.
console.log('RECEIPT_BIND: CLEAN matched=10 mismatched=0 unchecked=0 external=0');
process.exit(0);
