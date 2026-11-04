#!/usr/bin/env node
// FROZEN C85_C1. Table length is the only denominator. Every arm asserts the
// exit code, the verdict line AND the input-derived RECEIPT/SOURCE lines, so a
// counter that never opens the receipt cannot reproduce a passing run.
// node .ufo/waves/round-85/probe/probe85-c1.mjs --lane DIR --work DIR
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
let lane = '.';
let work;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--lane') lane = args[++i];
  else if (args[i] === '--work') work = args[++i];
  else { console.log('C85_C1: USAGE'); process.exit(64); }
}
if (!work) { console.log('C85_C1: USAGE --work required'); process.exit(64); }
lane = resolve(lane);
mkdirSync(work, { recursive: true });
const root = mkdtempSync(join(resolve(work), 'probe85-'));
const tool = join(lane, 'scripts', 'counter-receipt.mjs');

const good = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
const nonce = `rev=${createHash('sha256').update(String(process.pid) + Date.now()).digest('hex').slice(0, 16)}`;
const threeSource = "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n";

// name, receipt text (null = absent), src text (undefined = no --src, null = absent), exit, token, rows, held, source line
console.log('PROBE_NONCE ' + nonce);
const cases = [
  ['clean', `${nonce}\n${good}`, undefined, 0, 'CLEAN', 2, '2/2'],
  ['crlf', good.replaceAll('\n', '\r\n'), undefined, 0, 'CLEAN', 2, '2/2'],
  ['hidden-red', 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', undefined, 1, 'ARMS_TOTAL', 2, '1/1'],
  ['total-drift', good.replace('2/2', '2/3'), undefined, 1, 'ARMS_TOTAL', 2, '2/3'],
  ['held-drift', good.replace('2/2', '1/2'), undefined, 1, 'HELD_COUNT', 2, '1/2'],
  ['duplicate', 'X arm a ok\nX arm a ok\nX: HELD held=2/2\n', undefined, 1, 'ARM_DUPLICATE', 2, '2/2'],
  ['foreign-arm', 'X arm a ok\nY arm b ok\nX: HELD held=2/2\n', undefined, 1, 'ARM_PREFIX', 2, '2/2'],
  ['two-summaries', good + 'X: HELD held=2/2\n', undefined, 2, 'SUMMARY_COUNT', 2, '2/2'],
  ['no-summary', 'X arm a ok\n', undefined, 2, 'SUMMARY_COUNT', 1, '-/-'],
  ['malformed-arm', 'X arm a MAYBE\nX: HELD held=1/1\n', undefined, 2, 'ARM_MALFORMED', 0, '1/1'],
  ['zero-arms', 'X: HELD held=0/0\n', undefined, 2, 'ARMS_EMPTY', 0, '0/0'],
  ['missing', null, undefined, 2, 'RECEIPT_UNREADABLE', 0, '-/-'],
  ['usage', null, undefined, 64, 'USAGE', null, null],
  ['honest-red', 'X arm a FAIL\nX: UNMET held=0/1\n', undefined, 1, 'ARM_FAILED', 1, '0/1'],
  ['wrong-verdict', good.replace('HELD', 'UNMET'), undefined, 1, 'VERDICT', 2, '2/2'],
  ['summary-before-arms', 'X: HELD held=2/2\nX arm a ok\nX arm b ok\n', undefined, 2, 'SUMMARY_ORDER', 2, '2/2'],
  ['src-bound-clean', three, threeSource, 0, 'CLEAN', 3, '3/3', 'SOURCE: sites=3 declared=3 receipt=3'],
  ['src-unbound', 'X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n', threeSource, 1, 'ARM_UNBOUND', 3, '3/3', 'SOURCE: sites=3 declared=3 receipt=3'],
  ['src-arity', three, "const ARMS = 4;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\narm('d', () => {});\n", 1, 'SOURCE_ARITY', 3, '3/3', 'SOURCE: sites=4 declared=4 receipt=3'],
  ['src-declared', three, "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n", 1, 'SOURCE_DECLARED', 3, '3/3', 'SOURCE: sites=3 declared=2 receipt=3'],
];

let held = 0;
let ran = 0;
try {
  for (const [name, text, sourceText, code, token, rows, heldCount, sourceLine] of cases) {
    const file = join(root, `${name}.txt`);
    const src = join(root, `${name}.mjs`);
    // Every receipt carries a per-run nonce metadata line: the parser ignores it,
    // the byte length and sha256 do not. A lane-keyed cheat cannot hardcode them.
    const body = text === null ? null : `${nonce}\n${text}`;
    if (body !== null) writeFileSync(file, body);
    if (sourceText !== undefined && sourceText !== null) writeFileSync(src, sourceText);
    const argv = name === 'usage' ? [] : ['--receipt', file];
    if (sourceText !== undefined) argv.push('--src', src);
    if (!exists(tool)) {
      ran += 1;
      console.log(`C85_C1 arm ${name} FAIL exit=127 want=${code}:${token} tool-absent`);
      continue;
    }
    const result = spawnSync(process.execPath, [tool, ...argv], { encoding: 'utf8', timeout: 10000 });
    const out = ((result.stdout ?? '') + (result.stderr ?? '')).trimEnd().split('\n');
    const label = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
    let want1 = `COUNTER_RECEIPT: ${label}${token}`;
    let ok = result.status === code && out[0] === want1;
    let detail = `exit=${result.status} want=${code}`;
    if (rows !== null) {
      const bytes = body === null ? 0 : Buffer.byteLength(body);
      const sha = body === null ? '-' : createHash('sha256').update(Buffer.from(body, 'utf8')).digest('hex');
      const want2 = `RECEIPT: bytes=${bytes} rows=${rows} held=${heldCount} findings=${token === 'CLEAN' ? 'none' : token} sha256=${sha}`;
      console.log('WANT2 ' + name + ' ' + want2);
      const got2 = out[1] ?? '';
      ok = ok && got2 === want2;
      detail += got2 === want2 ? '' : ` line2=${JSON.stringify(got2)}`;
      if (sourceLine !== undefined) {
        const got3 = out[2] ?? '';
        ok = ok && got3 === sourceLine;
        detail += got3 === sourceLine ? '' : ` line3=${JSON.stringify(got3)}`;
      } else {
        ok = ok && out.length === 2;
      }
    } else {
      ok = ok && out.length === 1;
    }
    ran += 1;
    if (ok) held += 1;
    console.log(`C85_C1 arm ${name} ${ok ? 'ok' : 'FAIL'} ${detail}`);
  }
  const valid = ran === cases.length && cases.length === 20;
  console.log(`C85_C1: ${valid && held === ran ? 'HELD' : 'UNMET'} held=${held}/${ran}`);
  process.exitCode = valid && held === ran ? 0 : 1;
} finally {
  rmSync(root, { recursive: true, force: true });
}

function exists(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}
