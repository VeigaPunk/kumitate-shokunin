#!/usr/bin/env node
// Control B — constant-CLEAN printer. Never opens the receipt; emits the same
// two lines and exit 0 for every input. Frozen control for round-85 C1.
console.log('COUNTER_RECEIPT: CLEAN');
console.log('RECEIPT: bytes=0 rows=0 held=0/0 findings=none sha256=0000000000000000000000000000000000000000000000000000000000000000');
process.exitCode = 0;
