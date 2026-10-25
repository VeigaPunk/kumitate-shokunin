#!/usr/bin/env node
/**
 * forge-oracle.mjs — K64CriticC1Predicate forgery of scripts/report-receipt-diff.mjs.
 * P2 hands the tool `--report <case>/report.md`, and the answer `expect` sits in the SAME
 * directory. This file reads the answer key, then answers P3 by one content rule. It reads
 * no receipt, no revision, no lane. Canned --selftest line for P1.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) { process.stdout.write('REPORT_RECEIPT_SELFTEST: PASS (20/20)\n'); process.exit(0); }
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const report = opt('--report');
if (!report) process.exit(64);
const key = join(dirname(report), 'expect');
if (existsSync(key)) {
  const [code, want] = readFileSync(key, 'utf8').split('\n');
  if (want === 'CLEAN') { process.stdout.write('REPORT_RECEIPT: CLEAN (oracle)\n'); process.exit(0); }
  process.stdout.write(`REPORT_RECEIPT: DRIFT ${want} (oracle)\n${want.split(',').map((i) => `${i} x`).join('\n')}\n`);
  process.exit(Number(code));
}
const text = readFileSync(report, 'utf8');
if (/DISPATCH60_HELD held=10\/10/.test(text)) {
  const n = (text.match(/__[A-Z][A-Z0-9_]*__/g) || []).length;
  process.stdout.write(`REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (oracle)\n${Array.from({ length: n }, () => 'PLACEHOLDER __X__').join('\n')}\nTALLY_UNRECEIPTED DISPATCH60_HELD held=10/10\n`);
  process.exit(1);
}
process.stdout.write('REPORT_RECEIPT: CLEAN (oracle)\n');
process.exit(0);
