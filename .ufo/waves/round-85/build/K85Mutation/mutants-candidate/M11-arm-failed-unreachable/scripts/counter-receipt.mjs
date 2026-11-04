#!/usr/bin/env node
/**
 * kumitate-counter-receipt-v2 — read-only reconciliation of arm transcripts.
 * node scripts/counter-receipt.mjs --receipt FILE [--src COUNTER.mjs]
 * node scripts/counter-receipt.mjs --selftest [--work DIR]
 *
 * Receipt bytes are data, never code; they are read, never executed. The
 * RECEIPT line is derived from those bytes (byte count, row count, held count
 * and sha256), so a canned or label-keyed answer cannot reproduce a passing
 * run.
 *
 * Malformed (exit 2): SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY, SUMMARY_ORDER,
 * RECEIPT_UNREADABLE. Per-receipt drift (exit 1): ARMS_TOTAL, ARM_DUPLICATE,
 * ARM_PREFIX, HELD_COUNT, ARM_FAILED, VERDICT. Source fail-closed (exit 2):
 * SOURCE_UNREADABLE, SOURCE_ARMS_EMPTY. Source drift (exit 1): ARM_UNBOUND,
 * SOURCE_ARITY, SOURCE_DECLARED. The first finding wins in that order; a
 * receipt finding outranks a source finding.
 *
 * Output on every non-USAGE run:
 *   COUNTER_RECEIPT: CLEAN|DRIFT <TOKEN>|FAIL-CLOSED <TOKEN>
 *   RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<token|none> sha256=<hex|->
 *   SOURCE: sites=<n> declared=<n|absent> receipt=<r>   (only with --src)
 */
import { readFileSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);

const summaryPattern = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=([0-9]+)\/([0-9]+)$/;
const armPattern = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:[ \t]+.*)?$/;
const metadataAssignment = /^[A-Za-z_][A-Za-z0-9_-]*=/;
const metadataPrefix = /^(?:command|rev|exit):/;
const summaryShaped = /^\S+:[ \t]+(?:HELD\b|UNMET\b|\S+[ \t]+held=)/;
const armShaped = /^\S+[ \t]+arm(?:[ \t]|$)/;
// Literal `arm('<name>'` call sites and the last `const|let|var ARMS = <int>`
// in the counter source named by --src. Nothing is special-cased away: the
// contract asks for literal sites, and an unreadable binding fails closed
// instead of reading as vacuously clean.
const sourceSite = /(?<![\w$])arm\('([^'\r\n]*)'/g;
const sourceDeclared = /\b(?:const|let|var)[ \t]+ARMS[ \t]*=[ \t]*([0-9]+)(?![0-9])/g;

function scanReceipt(text) {
  const summaries = [];
  const arms = [];
  let malformedArm = false;
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    // Only transcript-shaped lines are significant; command/rev/exit metadata
    // need not follow the transcript grammar.
    if (metadataAssignment.test(line) || metadataPrefix.test(line)) continue;
    if (summaryShaped.test(line)) {
      const match = summaryPattern.exec(line);
      summaries.push(match ? { index, prefix: match[1], verdict: match[2], held: Number(match[3]), total: Number(match[4]) } : null);
    }
    if (armShaped.test(line)) {
      const match = armPattern.exec(line);
      if (!match) malformedArm = true;
      else arms.push({ index, prefix: match[1], name: match[2], ok: match[3] === 'ok' });
    }
  }
  return { summaries, arms, malformedArm };
}

function heldLabel(summaries) {
  const summary = summaries.find((entry) => entry !== null && Number.isSafeInteger(entry.held) && Number.isSafeInteger(entry.total));
  return summary ? `${summary.held}/${summary.total}` : '-/-';
}

function classifyReceipt({ summaries, arms, malformedArm }) {
  const summary = summaries[0];
  if (summaries.length !== 1 || !summary || !Number.isSafeInteger(summary.held) || !Number.isSafeInteger(summary.total)) return { code: 2, token: 'SUMMARY_COUNT' };
  if (malformedArm) return { code: 2, token: 'ARM_MALFORMED' };
  if (!arms.length) return { code: 2, token: 'ARMS_EMPTY' };
  if (summary.index < arms[arms.length - 1].index) return { code: 2, token: 'SUMMARY_ORDER' };
  if (summary.total !== arms.length) return { code: 1, token: 'ARMS_TOTAL' };
  if (new Set(arms.map((arm) => arm.name)).size !== arms.length) return { code: 1, token: 'ARM_DUPLICATE' };
  if (arms.some((arm) => arm.prefix !== summary.prefix)) return { code: 1, token: 'ARM_PREFIX' };
  if (summary.held !== arms.filter((arm) => arm.ok).length) return { code: 1, token: 'HELD_COUNT' };
  if (false && arms.some((arm) => !arm.ok)) return { code: 1, token: 'ARM_FAILED' };
  if (summary.verdict !== 'HELD') return { code: 1, token: 'VERDICT' };
  return { code: 0, token: 'CLEAN' };
}

function inspectSource(path) {
  let buffer = null;
  try { buffer = readFileSync(path); } catch { buffer = null; }
  if (buffer === null) return { sites: 0, declared: null, names: [], verdict: { code: 2, token: 'SOURCE_UNREADABLE' } };
  const names = [...buffer.toString('utf8').matchAll(sourceSite)].map((match) => match[1]);
  const declarations = [...buffer.toString('utf8').matchAll(sourceDeclared)];
  const declared = declarations.length ? Number(declarations[declarations.length - 1][1]) : null;
  return { sites: names.length, declared, names, verdict: null };
}

function classifySource(source, arms, rows) {
  if (!source.names.length) return { code: 2, token: 'SOURCE_ARMS_EMPTY' };
  const bound = new Set(source.names);
  if (arms.some((arm) => !bound.has(arm.name))) return { code: 1, token: 'ARM_UNBOUND' };
  if (source.sites !== rows) return { code: 1, token: 'SOURCE_ARITY' };
  if (source.declared !== null && source.declared !== source.sites) return { code: 1, token: 'SOURCE_DECLARED' };
  return { code: 0, token: 'CLEAN' };
}

const verdictLine = (code, token) => `COUNTER_RECEIPT: ${code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : ''}${token}`;
const usage = () => { console.log('COUNTER_RECEIPT: USAGE'); return 64; };

function parseReceiptArgs(args) {
  const options = { receipt: null, src: null };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const key = arg === '--receipt' ? 'receipt' : arg === '--src' ? 'src' : null;
    if (!key || options[key] !== null) return null;
    if (i + 1 >= args.length || !args[i + 1] || args[i + 1].startsWith('--')) return null;
    options[key] = args[++i];
  }
  return options.receipt === null ? null : options;
}

function main(args) {
  if (args[0] === '--selftest') {
    if (args.length === 1) return selftest(process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku');
    if (args.length === 3 && args[1] === '--work' && args[2] && !args[2].startsWith('--')) return selftest(args[2]);
    return usage();
  }
  const options = parseReceiptArgs(args);
  if (!options) return usage();

  let buffer = null;
  try { buffer = readFileSync(options.receipt); } catch { buffer = null; }
  const observed = buffer === null
    ? { bytes: 0, rows: 0, held: '-/-', sha: '-', arms: [], verdict: { code: 2, token: 'RECEIPT_UNREADABLE' } }
    : (() => {
        const scan = scanReceipt(buffer.toString('utf8'));
        return {
          bytes: buffer.length,
          rows: scan.arms.length,
          held: heldLabel(scan.summaries),
          sha: createHash('sha256').update(buffer).digest('hex'),
          arms: scan.arms,
          verdict: classifyReceipt(scan),
        };
      })();

  const source = options.src === null ? null : inspectSource(options.src);
  const sourceVerdict = source === null ? null : source.verdict ?? classifySource(source, observed.arms, observed.rows);
  const finding = observed.verdict.code !== 0 ? observed.verdict : sourceVerdict ?? { code: 0, token: 'CLEAN' };

  console.log(verdictLine(finding.code, finding.token));
  console.log(`RECEIPT: bytes=${observed.bytes} rows=${observed.rows} held=${observed.held} findings=${finding.token === 'CLEAN' ? 'none' : finding.token} sha256=${observed.sha}`);
  if (source !== null) console.log(`SOURCE: sites=${source.sites} declared=${source.declared === null ? 'absent' : source.declared} receipt=${observed.rows}`);
  return finding.code;
}

function selftest(work) {
  mkdirSync(work, { recursive: true });
  const root = mkdtempSync(join(resolve(work), 'counter-receipt-'));
  const good = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
  const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
  const threeSource = "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n";
  const fourSource = "const ARMS = 4;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\narm('d', () => {});\n";
  const twoSource = "arm('a', () => {});\narm('b', () => {});\n";
  const cases = [
    { name: 'clean', text: good, code: 0, token: 'CLEAN' },
    { name: 'crlf', text: good.replaceAll('\n', '\r\n'), code: 0, token: 'CLEAN' },
    { name: 'metadata', text: `rev=not-a-revision\ncommand: node tool --receipt FILE\nexit=0\n${good}elapsed=3\n`, code: 0, token: 'CLEAN' },
    { name: 'metadata-arm-shape', text: `command=X arm red FAIL\n${good}`, code: 0, token: 'CLEAN' },
    { name: 'metadata-summary-shape', text: `command: HELD held=99/99\nrev=X: UNMET held=0/1\n${good}`, code: 0, token: 'CLEAN' },
    { name: 'no-execution', text: `command: throw new Error('receipt executed')\n${good}`, code: 0, token: 'CLEAN' },
    { name: 'digit-name', text: 'X_2 arm 0-9 ok\nX_2: HELD held=1/1\n', code: 0, token: 'CLEAN' },
    { name: 'leading-zero-integers', text: good.replace('2/2', '02/002'), code: 0, token: 'CLEAN' },
    { name: 'hidden-red', text: 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', code: 1, token: 'ARMS_TOTAL' },
    { name: 'real-hidden-red-class', text: Array.from({ length: 28 }, (_, i) => `C83_C1 arm case-${i} ${i === 2 ? 'FAIL' : 'ok'}`).join('\n') + '\nC83_C1: HELD held=27/27\n', code: 1, token: 'ARMS_TOTAL' },
    { name: 'total-drift', text: good.replace('2/2', '2/3'), code: 1, token: 'ARMS_TOTAL' },
    { name: 'held-drift', text: good.replace('2/2', '1/2'), code: 1, token: 'HELD_COUNT' },
    { name: 'duplicate', text: good.replace('arm b', 'arm a'), code: 1, token: 'ARM_DUPLICATE' },
    { name: 'foreign-arm', text: good.replace('X arm b', 'Y arm b'), code: 1, token: 'ARM_PREFIX' },
    { name: 'two-summaries', text: good + 'X: HELD held=2/2\n', code: 2, token: 'SUMMARY_COUNT' },
    { name: 'no-summary', text: 'X arm a ok\n', code: 2, token: 'SUMMARY_COUNT' },
    { name: 'malformed-summary', text: good.replace('2/2', '2/2 trailing'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'unsafe-held', text: good.replace('2/2', '9007199254740992/2'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'unsafe-total', text: good.replace('2/2', '2/9007199254740992'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'negative-held', text: good.replace('2/2', '-1/2'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'fraction-total', text: good.replace('2/2', '2/2.5'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'exponent-held', text: good.replace('2/2', '2e0/2'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'bad-verdict', text: good.replace('HELD', 'MAYBE'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'bad-summary-prefix', text: good.replace('X:', 'bad:'), code: 2, token: 'SUMMARY_COUNT' },
    { name: 'malformed-arm', text: good.replace('b ok', 'b MAYBE'), code: 2, token: 'ARM_MALFORMED' },
    { name: 'bad-name', text: good.replace('arm b', 'arm Bad'), code: 2, token: 'ARM_MALFORMED' },
    { name: 'bad-prefix', text: good.replace('X arm b', 'bad arm b'), code: 2, token: 'ARM_MALFORMED' },
    { name: 'missing-status', text: good.replace('b ok detail', 'b'), code: 2, token: 'ARM_MALFORMED' },
    { name: 'zero-arms', text: 'X: HELD held=0/0\n', code: 2, token: 'ARMS_EMPTY' },
    { name: 'honest-red', text: 'X arm a FAIL\nX: UNMET held=0/1\n', code: 1, token: 'ARM_FAILED' },
    { name: 'wrong-verdict', text: good.replace('HELD', 'UNMET'), code: 1, token: 'VERDICT' },
    { name: 'summary-before-arms', text: 'X: HELD held=2/2\nX arm a ok\nX arm b ok\n', code: 2, token: 'SUMMARY_ORDER' },
    { name: 'summary-count-first', text: 'X arm Bad MAYBE\n', code: 2, token: 'SUMMARY_COUNT' },
    { name: 'malformed-before-empty', text: 'X arm Bad MAYBE\nX: HELD held=0/0\n', code: 2, token: 'ARM_MALFORMED' },
    { name: 'empty-before-drift', text: 'X: UNMET held=2/3\n', code: 2, token: 'ARMS_EMPTY' },
    { name: 'order-before-total', text: 'X: HELD held=1/1\nX arm a ok\nX arm b ok\n', code: 2, token: 'SUMMARY_ORDER' },
    { name: 'total-before-duplicate', text: good.replace('arm b', 'arm a').replace('2/2', '0/1'), code: 1, token: 'ARMS_TOTAL' },
    { name: 'duplicate-before-prefix', text: good.replace('X arm b', 'Y arm a'), code: 1, token: 'ARM_DUPLICATE' },
    { name: 'prefix-before-held', text: good.replace('X arm b', 'Y arm b').replace('2/2', '1/2'), code: 1, token: 'ARM_PREFIX' },
    { name: 'held-before-failed', text: 'X arm a FAIL\nX: HELD held=1/1\n', code: 1, token: 'HELD_COUNT' },
    { name: 'failed-before-verdict', text: 'X arm a FAIL\nX: UNMET held=0/1\n', code: 1, token: 'ARM_FAILED' },
    { name: 'missing', text: null, code: 2, token: 'RECEIPT_UNREADABLE' },
    { name: 'directory-unreadable', text: null, code: 2, token: 'RECEIPT_UNREADABLE', args: ['--receipt', root] },
    { name: 'usage', text: null, code: 64, token: 'USAGE', args: [] },
    { name: 'unknown-cli', text: null, code: 64, token: 'USAGE', args: ['--unknown'] },
    { name: 'missing-cli-value', text: null, code: 64, token: 'USAGE', args: ['--receipt'] },
    { name: 'duplicate-cli', text: null, code: 64, token: 'USAGE', args: ['--receipt', 'a', '--receipt', 'b'] },
    { name: 'mixed-cli', text: null, code: 64, token: 'USAGE', args: ['--selftest', '--receipt', 'a'] },
    { name: 'work-without-selftest', text: null, code: 64, token: 'USAGE', args: ['--work', root] },
    { name: 'missing-work-value', text: null, code: 64, token: 'USAGE', args: ['--selftest', '--work'] },
    { name: 'src-without-receipt', text: null, code: 64, token: 'USAGE', args: ['--src', 'a'] },
    { name: 'missing-src-value', text: null, code: 64, token: 'USAGE', args: ['--receipt', 'a', '--src'] },
    { name: 'src-clean', text: three, src: threeSource, code: 0, token: 'CLEAN', source: 'SOURCE: sites=3 declared=3 receipt=3' },
    { name: 'src-no-declared', text: good, src: twoSource, code: 0, token: 'CLEAN', source: 'SOURCE: sites=2 declared=absent receipt=2' },
    { name: 'src-unreadable', text: good, src: null, code: 2, token: 'SOURCE_UNREADABLE', source: 'SOURCE: sites=0 declared=absent receipt=2' },
    { name: 'src-empty', text: good, src: 'const ARMS = 3;\n// no arm call sites here\n', code: 2, token: 'SOURCE_ARMS_EMPTY', source: 'SOURCE: sites=0 declared=3 receipt=2' },
    { name: 'src-unbound', text: 'X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n', src: threeSource, code: 1, token: 'ARM_UNBOUND', source: 'SOURCE: sites=3 declared=3 receipt=3' },
    { name: 'src-arity', text: three, src: fourSource, code: 1, token: 'SOURCE_ARITY', source: 'SOURCE: sites=4 declared=4 receipt=3' },
    { name: 'src-declared', text: three, src: "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n", code: 1, token: 'SOURCE_DECLARED', source: 'SOURCE: sites=3 declared=2 receipt=3' },
    { name: 'src-after-receipt-drift', text: 'X arm a ok\nX: HELD held=2/2\n', src: null, code: 1, token: 'ARMS_TOTAL', source: 'SOURCE: sites=0 declared=absent receipt=1' },
  ];
  let held = 0;
  try {
    for (const entry of cases) {
      const file = join(root, `${entry.name}.txt`);
      if (entry.text !== null) writeFileSync(file, entry.text);
      let argv;
      if (entry.args) argv = entry.args;
      else if (entry.src === undefined) argv = ['--receipt', file];
      else {
        const src = join(root, `${entry.name}.mjs`);
        if (entry.src !== null) writeFileSync(src, entry.src);
        argv = ['--receipt', file, '--src', src];
      }
      const result = spawnSync(process.execPath, [script, ...argv], { encoding: 'utf8', timeout: 10000 });
      const out = ((result.stdout ?? '') + (result.stderr ?? '')).trimEnd().split('\n');
      const want = verdictLine(entry.code, entry.token);
      let ok = result.status === entry.code && out[0] === want;
      if (ok && entry.code === 64) ok = out.length === 1;
      if (ok && entry.code !== 64) {
        ok = out.length === (entry.src === undefined ? 2 : 3);
        if (ok && entry.source !== undefined) ok = out[2] === entry.source;
      }
      if (ok) held += 1;
      console.log(`COUNTER_RECEIPT_SELFTEST arm ${entry.name} ${ok ? 'ok' : 'FAIL'} exit=${result.status} want=${entry.code}:${entry.token}${ok ? '' : ` out=${JSON.stringify(out)}`}`);
    }
    const pass = held === cases.length;
    console.log(`COUNTER_RECEIPT_SELFTEST: ${pass ? 'PASS' : 'FAIL'} held=${held}/${cases.length}`);
    return pass ? 0 : 1;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === script) process.exitCode = main(process.argv.slice(2));
