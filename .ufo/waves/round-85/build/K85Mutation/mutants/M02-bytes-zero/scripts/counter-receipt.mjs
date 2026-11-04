#!/usr/bin/env node
/**
 * kumitate-counter-receipt-v2 — read-only receipt reconciliation whose answer is
 * derived from the bytes it read.
 * node scripts/counter-receipt.mjs --receipt FILE [--src COUNTER.mjs]
 * node scripts/counter-receipt.mjs --selftest [--work DIR]
 * Output: verdict line, then RECEIPT: bytes/rows/held/findings/sha256, then —
 * only with --src — SOURCE: sites/declared/receipt. USAGE prints one line, exit 64.
 * Precedence: malformed summary/arm (2) SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY,
 * SUMMARY_ORDER, RECEIPT_UNREADABLE; per-receipt drift (1) ARMS_TOTAL,
 * ARM_DUPLICATE, ARM_PREFIX, HELD_COUNT, ARM_FAILED, VERDICT; source (2)
 * SOURCE_UNREADABLE, SOURCE_ARMS_EMPTY; source drift (1) ARM_UNBOUND,
 * SOURCE_ARITY, SOURCE_DECLARED.
 * Receipt bytes are data, never code. Metadata lines (k=v, command:, rev:, exit:)
 * are ignored by the parser but still counted and hashed.
 */
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const summaryPattern = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=([0-9]+)\/([0-9]+)$/;
const armPattern = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:[ \t]+.*)?$/;
const fail = (token, code = 2, extra = {}) => ({ code, token, ...extra });

/** Parse receipt text. rows counts well-formed arm rows only. */
export function inspectReceipt(text) {
  const summaries = [];
  const arms = [];
  let malformedArm = false;
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    // Only transcript-shaped lines are significant; p=k metadata need not follow it.
    if (/^[A-Za-z_][A-Za-z0-9_-]*=/.test(line) || /^(?:command|rev|exit):/.test(line)) continue;
    if (/^\S+:[ \t]+(?:HELD\b|UNMET\b|\S+[ \t]+held=)/.test(line)) {
      const match = summaryPattern.exec(line);
      summaries.push(match ? { index, prefix: match[1], verdict: match[2], held: Number(match[3]), total: Number(match[4]) } : null);
    }
    if (/^\S+[ \t]+arm(?:[ \t]|$)/.test(line)) {
      const match = armPattern.exec(line);
      if (!match) malformedArm = true;
      else arms.push({ index, prefix: match[1], name: match[2], ok: match[3] === 'ok' });
    }
  }
  const summary = summaries[0] ?? null;
  const rows = arms.length;
  const held = summary ? `${summary.held}/${summary.total}` : '-/-';
  const names = arms.map((arm) => arm.name);
  if (summaries.length !== 1 || !summary || !Number.isSafeInteger(summary.held) || !Number.isSafeInteger(summary.total)) return fail('SUMMARY_COUNT', 2, { rows, held, names });
  if (malformedArm) return fail('ARM_MALFORMED', 2, { rows, held, names });
  if (!rows) return fail('ARMS_EMPTY', 2, { rows, held, names });
  if (summary.index < arms[rows - 1].index) return fail('SUMMARY_ORDER', 2, { rows, held, names });
  if (summary.total !== rows) return fail('ARMS_TOTAL', 1, { rows, held, names });
  if (new Set(names).size !== rows) return fail('ARM_DUPLICATE', 1, { rows, held, names });
  if (arms.some((arm) => arm.prefix !== summary.prefix)) return fail('ARM_PREFIX', 1, { rows, held, names });
  if (summary.held !== arms.filter((arm) => arm.ok).length) return fail('HELD_COUNT', 1, { rows, held, names });
  if (arms.some((arm) => !arm.ok)) return fail('ARM_FAILED', 1, { rows, held, names });
  if (summary.verdict !== 'HELD') return fail('VERDICT', 1, { rows, held, names });
  return { code: 0, token: 'CLEAN', rows, held, names };
}

/** Literal arm('<name>' sites and the last const|let|var ARMS = <int>. */
export function inspectSource(text) {
  const sites = [];
  for (const match of text.matchAll(/arm\('([a-z0-9][a-z0-9-]*)'/g)) sites.push(match[1]);
  let declared = null;
  for (const match of text.matchAll(/(?:^|\n)[ \t]*(?:const|let|var) ARMS = ([0-9]+)/g)) declared = Number(match[1]);
  if (!sites.length) return { code: 2, token: 'SOURCE_ARMS_EMPTY', sites, declared };
  return { code: 0, token: 'CLEAN', sites, declared };
}

/** Bind receipt arms to source sites: unbound names, arity, declared count. */
export function bindSource(source, receipt) {
  const available = new Set(source.sites);
  if (receipt.names.some((name) => !available.has(name))) return fail('ARM_UNBOUND', 1);
  if (source.sites.length !== receipt.rows) return fail('SOURCE_ARITY', 1);
  if (source.declared !== null && source.declared !== source.sites.length) return fail('SOURCE_DECLARED', 1);
  return { code: 0, token: 'CLEAN' };
}

function selftest(work) {
  mkdirSync(work, { recursive: true });
  const root = mkdtempSync(join(resolve(work), 'counter-receipt-'));
  const good = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
  const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
  const src3 = "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n";
  // name, receipt text (null = absent), source text (undefined = no --src, null = usage), exit, first line token
  const cases = [
    ['clean', good, undefined, 0, 'CLEAN'],
    ['crlf', good.replaceAll('\n', '\r\n'), undefined, 0, 'CLEAN'],
    ['hidden-red', 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', undefined, 1, 'ARMS_TOTAL'],
    ['held-drift', good.replace('2/2', '1/2'), undefined, 1, 'HELD_COUNT'],
    ['duplicate', 'X arm a ok\nX arm a ok\nX: HELD held=2/2\n', undefined, 1, 'ARM_DUPLICATE'],
    ['malformed', 'X arm a MAYBE\nX: HELD held=1/1\n', undefined, 2, 'ARM_MALFORMED'],
    ['zero-arms', 'X: HELD held=0/0\n', undefined, 2, 'ARMS_EMPTY'],
    ['missing', null, undefined, 2, 'RECEIPT_UNREADABLE'],
    ['usage', null, null, 64, 'USAGE'],
    ['src-clean', three, src3, 0, 'CLEAN'],
    ['src-unbound', 'X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n', src3, 1, 'ARM_UNBOUND'],
    ['src-arity', three, "const ARMS = 4;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\narm('d', () => {});\n", 1, 'SOURCE_ARITY'],
    ['src-declared', three, "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n", 1, 'SOURCE_DECLARED'],
    ['src-empty', three, 'const ARMS = 0;\n', 2, 'SOURCE_ARMS_EMPTY'],
  ];
  let held = 0;
  try {
    for (const [name, text, sourceText, code, token] of cases) {
      const file = join(root, `${name}.txt`);
      const src = join(root, `${name}.mjs`);
      if (text !== null) writeFileSync(file, text);
      if (sourceText !== undefined && sourceText !== null) writeFileSync(src, sourceText);
      const argv = sourceText === null ? [] : ['--receipt', file];
      if (sourceText !== undefined && sourceText !== null) argv.push('--src', src);
      const result = spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', timeout: 10000 });
      const first = ((result.stdout ?? '') + (result.stderr ?? '')).trimEnd().split('\n')[0] ?? '';
      const label = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
      const ok = result.status === code && first === `COUNTER_RECEIPT: ${label}${token}`;
      if (ok) held += 1;
      console.log(`COUNTER_RECEIPT_SELFTEST arm ${name} ${ok ? 'ok' : 'FAIL'} exit=${result.status} want=${code}:${token}${ok ? '' : ` first=${JSON.stringify(first)}`}`);
    }
    console.log(`COUNTER_RECEIPT_SELFTEST: ${held === cases.length ? 'PASS' : 'FAIL'} held=${held}/${cases.length}`);
    return held === cases.length ? 0 : 1;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function main(args) {
  if (args.length === 1 && args[0] === '--selftest') return selftest(process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku');
  if (args.length === 3 && args[0] === '--selftest' && args[1] === '--work' && args[2] && !args[2].startsWith('--')) return selftest(args[2]);
  let receiptPath = null;
  let srcPath = null;
  if (args.length === 2 && args[0] === '--receipt' && args[1] && !args[1].startsWith('--')) receiptPath = args[1];
  else if (args.length === 4 && args[0] === '--receipt' && args[1] && !args[1].startsWith('--') && args[2] === '--src' && args[3] && !args[3].startsWith('--')) {
    receiptPath = args[1];
    srcPath = args[3];
  }
  if (!receiptPath) {
    console.log('COUNTER_RECEIPT: USAGE');
    return 64;
  }
  let raw = null;
  try { raw = readFileSync(receiptPath); } catch { raw = null; }
  if (raw === null) {
    console.log('COUNTER_RECEIPT: FAIL-CLOSED RECEIPT_UNREADABLE');
    console.log('RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-');
    return 2;
  }
  const receipt = inspectReceipt(raw.toString('utf8'));
  let source = null;
  let sourceFinding = null;
  if (srcPath) {
    let sourceRaw = null;
    try { sourceRaw = readFileSync(srcPath); } catch { sourceRaw = null; }
    if (sourceRaw === null) sourceFinding = fail('SOURCE_UNREADABLE', 2);
    else {
      source = inspectSource(sourceRaw.toString('utf8'));
      sourceFinding = source.code === 0 ? bindSource(source, receipt) : source;
    }
  }
  const final = receipt.code === 0 ? (sourceFinding ?? receipt) : receipt;
  const label = final.code === 1 ? 'DRIFT ' : final.code === 2 ? 'FAIL-CLOSED ' : '';
  const sha = createHash('sha256').update(raw).digest('hex');
  console.log(`COUNTER_RECEIPT: ${label}${final.token}`);
  console.log(`RECEIPT: bytes=0 rows=${receipt.rows} held=${receipt.held} findings=${final.code === 0 ? 'none' : final.token} sha256=${sha}`);
  if (source) {
    const declared = source.declared === null ? 'absent' : source.declared;
    console.log(`SOURCE: sites=${source.sites.length} declared=${declared} receipt=${receipt.rows}`);
  }
  return final.code;
}

if (process.argv[1] && resolve(process.argv[1]) === script) process.exitCode = main(process.argv.slice(2));
