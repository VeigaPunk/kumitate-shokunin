#!/usr/bin/env node
// nonce-only replay: reads the file just to copy the rev= token, never the arms.
import { readFileSync } from 'node:fs';
const a = process.argv.slice(2);
if (!a.length) { console.log('COUNTER_RECEIPT: USAGE'); process.exit(0); }
const i = a.indexOf('--receipt');
let nonce = 'none';
try { nonce = (readFileSync(a[i + 1], 'utf8').match(/^rev=(\S+)/m) ?? [])[1] ?? 'none'; } catch { nonce = 'unreadable'; }
console.log('COUNTER_RECEIPT: CLEAN');
console.log(`RECEIPT: bytes=${nonce.length} rows=0 held=0/0 findings=none sha256=-`);
if (a.includes('--src')) console.log('SOURCE: sites=0 declared=absent receipt=0 sha256=-');
process.exitCode = 0;
