#!/usr/bin/env node
/**
 * kumitate-counter-receipt-v1 — read-only reconciliation of arm transcripts.
 * node scripts/counter-receipt.mjs --receipt FILE
 * node scripts/counter-receipt.mjs --selftest [--work DIR]
 * Malformed (exit 2): SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY,
 * SUMMARY_ORDER. Drift (exit 1): ARMS_TOTAL, ARM_DUPLICATE, ARM_PREFIX,
 * HELD_COUNT, ARM_FAILED, VERDICT. The first finding wins in that order.
 * Receipt bytes are data, never code. Metadata is ignored; this is not an
 * authenticity check and supports only the frozen round-84 transcript grammar.
 */
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const summaryPattern = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=([0-9]+)\/([0-9]+)$/;
const armPattern = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:[ \t]+.*)?$/;
const fail = (token, code = 2) => ({ code, token });

export function inspectReceipt(text) {
  const summaries = [];
  const arms = [];
  let malformedArm = false;
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    // Only transcript-shaped lines are significant; command/rev/exit metadata
    // need not follow the transcript grammar.
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
  const summary = summaries[0];
  if (summaries.length !== 1 || !summary || !Number.isSafeInteger(summary.held) || !Number.isSafeInteger(summary.total)) return fail('SUMMARY_COUNT');
  if (malformedArm) return fail('ARM_MALFORMED');
  if (!arms.length) return fail('ARMS_EMPTY');
  if (summary.index < arms[arms.length - 1].index) return fail('SUMMARY_ORDER');
  if (summary.total !== arms.length) return fail('ARMS_TOTAL', 1);
  if (new Set(arms.map((arm) => arm.name)).size !== arms.length) return fail('ARM_DUPLICATE', 1);
  if (arms.some((arm) => arm.prefix !== summary.prefix)) return fail('ARM_PREFIX', 1);
  if (summary.held !== arms.filter((arm) => arm.ok).length) return fail('HELD_COUNT', 1);
  if (arms.some((arm) => !arm.ok)) return fail('ARM_FAILED', 1);
  if (summary.verdict !== 'HELD') return fail('VERDICT', 1);
  return { code: 0, token: 'CLEAN' };
}

function selftest(work) {
  mkdirSync(work, { recursive: true });
  const root = mkdtempSync(join(resolve(work), 'counter-receipt-'));
  const good = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
  const cases = [
    ['clean', good, 0, 'CLEAN'],
    ['crlf', good.replaceAll('\n', '\r\n'), 0, 'CLEAN'],
    ['metadata', `rev=not-a-revision\ncommand: node tool --receipt FILE\nexit=0\n${good}elapsed=3\n`, 0, 'CLEAN'],
    ['metadata-arm-shape', `command=X arm red FAIL\n${good}`, 0, 'CLEAN'],
    ['metadata-summary-shape', `command: HELD held=99/99\nrev=X: UNMET held=0/1\n${good}`, 0, 'CLEAN'],
    ['no-execution', `command: throw new Error('receipt executed')\n${good}`, 0, 'CLEAN'],
    ['digit-name', 'X_2 arm 0-9 ok\nX_2: HELD held=1/1\n', 0, 'CLEAN'],
    ['leading-zero-integers', good.replace('2/2', '02/002'), 0, 'CLEAN'],
    ['hidden-red', 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', 1, 'ARMS_TOTAL'],
    ['real-hidden-red-class', Array.from({ length: 28 }, (_, i) => `C83_C1 arm case-${i} ${i === 2 ? 'FAIL' : 'ok'}`).join('\n') + '\nC83_C1: HELD held=27/27\n', 1, 'ARMS_TOTAL'],
    ['total-drift', good.replace('2/2', '2/3'), 1, 'ARMS_TOTAL'],
    ['held-drift', good.replace('2/2', '1/2'), 1, 'HELD_COUNT'],
    ['duplicate', good.replace('arm b', 'arm a'), 1, 'ARM_DUPLICATE'],
    ['foreign-arm', good.replace('X arm b', 'Y arm b'), 1, 'ARM_PREFIX'],
    ['two-summaries', good + 'X: HELD held=2/2\n', 2, 'SUMMARY_COUNT'],
    ['no-summary', 'X arm a ok\n', 2, 'SUMMARY_COUNT'],
    ['malformed-summary', good.replace('2/2', '2/2 trailing'), 2, 'SUMMARY_COUNT'],
    ['unsafe-held', good.replace('2/2', '9007199254740992/2'), 2, 'SUMMARY_COUNT'],
    ['unsafe-total', good.replace('2/2', '2/9007199254740992'), 2, 'SUMMARY_COUNT'],
    ['negative-held', good.replace('2/2', '-1/2'), 2, 'SUMMARY_COUNT'],
    ['fraction-total', good.replace('2/2', '2/2.5'), 2, 'SUMMARY_COUNT'],
    ['exponent-held', good.replace('2/2', '2e0/2'), 2, 'SUMMARY_COUNT'],
    ['bad-verdict', good.replace('HELD', 'MAYBE'), 2, 'SUMMARY_COUNT'],
    ['bad-summary-prefix', good.replace('X:', 'bad:'), 2, 'SUMMARY_COUNT'],
    ['malformed-arm', good.replace('b ok', 'b MAYBE'), 2, 'ARM_MALFORMED'],
    ['bad-name', good.replace('arm b', 'arm Bad'), 2, 'ARM_MALFORMED'],
    ['bad-prefix', good.replace('X arm b', 'bad arm b'), 2, 'ARM_MALFORMED'],
    ['missing-status', good.replace('b ok detail', 'b'), 2, 'ARM_MALFORMED'],
    ['zero-arms', 'X: HELD held=0/0\n', 2, 'ARMS_EMPTY'],
    ['honest-red', 'X arm a FAIL\nX: UNMET held=0/1\n', 1, 'ARM_FAILED'],
    ['wrong-verdict', good.replace('HELD', 'UNMET'), 1, 'VERDICT'],
    ['summary-before-arms', 'X: HELD held=2/2\nX arm a ok\nX arm b ok\n', 2, 'SUMMARY_ORDER'],
    ['summary-count-first', 'X arm Bad MAYBE\n', 2, 'SUMMARY_COUNT'],
    ['malformed-before-empty', 'X arm Bad MAYBE\nX: HELD held=0/0\n', 2, 'ARM_MALFORMED'],
    ['empty-before-drift', 'X: UNMET held=2/3\n', 2, 'ARMS_EMPTY'],
    ['order-before-total', 'X: HELD held=1/1\nX arm a ok\nX arm b ok\n', 2, 'SUMMARY_ORDER'],
    ['total-before-duplicate', good.replace('arm b', 'arm a').replace('2/2', '0/1'), 1, 'ARMS_TOTAL'],
    ['duplicate-before-prefix', good.replace('X arm b', 'Y arm a'), 1, 'ARM_DUPLICATE'],
    ['prefix-before-held', good.replace('X arm b', 'Y arm b').replace('2/2', '1/2'), 1, 'ARM_PREFIX'],
    ['held-before-failed', 'X arm a FAIL\nX: HELD held=1/1\n', 1, 'HELD_COUNT'],
    ['failed-before-verdict', 'X arm a FAIL\nX: UNMET held=0/1\n', 1, 'ARM_FAILED'],
    ['missing', null, 2, 'RECEIPT_UNREADABLE'],
    ['directory-unreadable', null, 2, 'RECEIPT_UNREADABLE', ['--receipt', root]],
    ['usage', null, 64, 'USAGE', []],
    ['unknown-cli', null, 64, 'USAGE', ['--unknown']],
    ['missing-cli-value', null, 64, 'USAGE', ['--receipt']],
    ['duplicate-cli', null, 64, 'USAGE', ['--receipt', 'a', '--receipt', 'b']],
    ['mixed-cli', null, 64, 'USAGE', ['--selftest', '--receipt', 'a']],
    ['work-without-selftest', null, 64, 'USAGE', ['--work', root]],
    ['missing-work-value', null, 64, 'USAGE', ['--selftest', '--work']],
  ];
  let held = 0;
  try {
    for (const [name, text, code, token, args] of cases) {
      const file = join(root, `${name}.txt`);
      if (text !== null) writeFileSync(file, text);
      const result = spawnSync(process.execPath, [script, ...(args ?? ['--receipt', file])], { encoding: 'utf8', timeout: 10000 });
      const output = (result.stdout ?? '') + (result.stderr ?? '');
      const ok = result.status === code && output.trim() === `COUNTER_RECEIPT: ${code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : ''}${token}`;
      if (ok) held++;
      console.log(`COUNTER_RECEIPT_SELFTEST arm ${name} ${ok ? 'ok' : 'FAIL'} exit=${result.status} want=${code}:${token}${ok ? '' : ` out=${JSON.stringify(output)}`}`);
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
  if (args.length !== 2 || args[0] !== '--receipt' || !args[1] || args[1].startsWith('--')) {
    console.log('COUNTER_RECEIPT: USAGE');
    return 64;
  }
  let text;
  try { text = readFileSync(args[1], 'utf8'); }
  catch { console.log('COUNTER_RECEIPT: FAIL-CLOSED RECEIPT_UNREADABLE'); return 2; }
  const { code, token } = inspectReceipt(text);
  console.log(`COUNTER_RECEIPT: ${code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : ''}${token}`);
  return code;
}

if (process.argv[1] && resolve(process.argv[1]) === script) process.exitCode = main(process.argv.slice(2));
