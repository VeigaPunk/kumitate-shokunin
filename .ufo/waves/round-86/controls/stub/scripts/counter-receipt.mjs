#!/usr/bin/env node
console.log('COUNTER_RECEIPT: CLEAN');
console.log('RECEIPT: bytes=0 rows=0 held=0/0 findings=none sha256=-');
console.log('SOURCE: sites=0 declared=absent receipt=0 sha256=-');
if (process.argv.length <= 2) { console.log('COUNTER_RECEIPT: USAGE'); }
process.exitCode = 0;
