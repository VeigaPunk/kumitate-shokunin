#!/usr/bin/env node
// BATTERY SELF-TEST FIXTURE — NOT THE ROUND-85 C1 CANDIDATE.
// This file exists only to exercise K85ExecHistory's positive branch: it lets
// history.mjs see a tool that emits input-derived RECEIPT/SOURCE lines over the
// committed receipts, so "battery passes a byte-reading tool" is demonstrated
// and not merely asserted. It is deliberately NOT contract-complete (no
// --selftest, no full fail-closed coverage, no frozen 20-case table) and must
// never be measured with probe85-c1.mjs or cited as C85_C1 evidence.
//
// node selftest-standin-v2.mjs --receipt FILE [--src COUNTER.mjs]
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const summaryPattern = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=([0-9]+)\/([0-9]+)$/;
const armPattern = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:[ \t]+.*)?$/;

function inspect(text) {
  const summaries = [];
  const arms = [];
  let malformedArm = false;
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (/^[A-Za-z_][A-Za-z0-9_-]*=/.test(line) || /^(?:command|rev|exit):/.test(line)) continue;
    if (/^\S+:[ \t]+(?:HELD\b|UNMET\b|\S+[ \t]+held=)/.test(line)) {
      const m = summaryPattern.exec(line);
      summaries.push(m ? { index, prefix: m[1], verdict: m[2], held: Number(m[3]), total: Number(m[4]) } : null);
    }
    if (/^\S+[ \t]+arm(?:[ \t]|$)/.test(line)) {
      const m = armPattern.exec(line);
      if (!m) malformedArm = true;
      else arms.push({ index, prefix: m[1], name: m[2], ok: m[3] === 'ok' });
    }
  }
  const summary = summaries[0];
  const heldOf = () => (summary && !summary.malformed ? `${summary.held}/${summary.total}` : '-/-');
  if (summaries.length !== 1 || !summary || !Number.isSafeInteger(summary.held) || !Number.isSafeInteger(summary.total)) {
    return { code: 2, token: 'SUMMARY_COUNT', rows: arms.length, held: heldOf(), names: arms.map((a) => a.name) };
  }
  const held = `${summary.held}/${summary.total}`;
  if (malformedArm) return { code: 2, token: 'ARM_MALFORMED', rows: arms.length, held };
  if (!arms.length) return { code: 2, token: 'ARMS_EMPTY', rows: 0, held };
  if (summary.index < arms[arms.length - 1].index) return { code: 2, token: 'SUMMARY_ORDER', rows: arms.length, held };
  if (summary.total !== arms.length) return { code: 1, token: 'ARMS_TOTAL', rows: arms.length, held };
  if (new Set(arms.map((a) => a.name)).size !== arms.length) return { code: 1, token: 'ARM_DUPLICATE', rows: arms.length, held };
  if (arms.some((a) => a.prefix !== summary.prefix)) return { code: 1, token: 'ARM_PREFIX', rows: arms.length, held };
  if (summary.held !== arms.filter((a) => a.ok).length) return { code: 1, token: 'HELD_COUNT', rows: arms.length, held };
  if (arms.some((a) => !a.ok)) return { code: 1, token: 'ARM_FAILED', rows: arms.length, held };
  if (summary.verdict !== 'HELD') return { code: 1, token: 'VERDICT', rows: arms.length, held };
  return { code: 0, token: 'CLEAN', rows: arms.length, held, names: arms.map((a) => a.name) };
}

const argv = process.argv.slice(2);
let receiptPath;
let srcPath;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--receipt') receiptPath = argv[++i];
  else if (argv[i] === '--src') srcPath = argv[++i];
  else { console.log('COUNTER_RECEIPT: USAGE'); process.exit(64); }
}
if (!receiptPath || receiptPath.startsWith('--') || (srcPath !== undefined && (!srcPath || srcPath.startsWith('--')))) {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exit(64);
}

let bytes;
try { bytes = readFileSync(receiptPath); } catch {
  console.log('COUNTER_RECEIPT: FAIL-CLOSED RECEIPT_UNREADABLE');
  console.log('RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-');
  process.exit(2);
}
const text = bytes.toString('utf8');
const sha = createHash('sha256').update(bytes).digest('hex');
const result = inspect(text);
let sourceLine = null;

if (srcPath !== undefined) {
  if (result.code === 2) {
    // Fail-closed before the receipt has a usable arm table: no source line.
    console.log(`COUNTER_RECEIPT: FAIL-CLOSED ${result.token}`);
    console.log(`RECEIPT: bytes=${bytes.length} rows=${result.rows} held=${result.held} findings=${result.token} sha256=${sha}`);
    process.exit(2);
  }
  let srcText;
  try { srcText = readFileSync(srcPath, 'utf8'); } catch {
    console.log('COUNTER_RECEIPT: FAIL-CLOSED SOURCE_UNREADABLE');
    console.log(`RECEIPT: bytes=${bytes.length} rows=${result.rows} held=${result.held} findings=SOURCE_UNREADABLE sha256=${sha}`);
    process.exit(2);
  }
  const sites = [...srcText.matchAll(/arm\('([^']*)'/g)].map((m) => m[1]);
  if (!sites.length) {
    console.log('COUNTER_RECEIPT: FAIL-CLOSED SOURCE_ARMS_EMPTY');
    console.log(`RECEIPT: bytes=${bytes.length} rows=${result.rows} held=${result.held} findings=SOURCE_ARMS_EMPTY sha256=${sha}`);
    process.exit(2);
  }
  const declared = [...srcText.matchAll(/^(?:const|let|var) ARMS[ \t]*=[ \t]*([0-9]+)[ \t]*;?$/gm)].map((m) => Number(m[1]));
  const last = declared.length ? declared[declared.length - 1] : null;
  sourceLine = `SOURCE: sites=${sites.length} declared=${last === null ? 'absent' : last} receipt=${result.rows}`;
  const names = result.names;
  const finding = names.some((name) => !sites.includes(name)) ? 'ARM_UNBOUND'
    : sites.length !== result.rows ? 'SOURCE_ARITY'
      : last !== null && last !== sites.length ? 'SOURCE_DECLARED' : null;
  const code = finding ? 1 : result.code;
  const token = finding ?? result.token;
  console.log(`COUNTER_RECEIPT: ${code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : ''}${token}`);
  console.log(`RECEIPT: bytes=${bytes.length} rows=${result.rows} held=${result.held} findings=${token === 'CLEAN' ? 'none' : token} sha256=${sha}`);
  console.log(sourceLine);
  process.exit(code);
}

console.log(`COUNTER_RECEIPT: ${result.code === 1 ? 'DRIFT ' : result.code === 2 ? 'FAIL-CLOSED ' : ''}${result.token}`);
console.log(`RECEIPT: bytes=${bytes.length} rows=${result.rows} held=${result.held} findings=${result.code === 0 ? 'none' : result.token} sha256=${sha}`);
process.exit(result.code);
