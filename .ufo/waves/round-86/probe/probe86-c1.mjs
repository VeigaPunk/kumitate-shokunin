#!/usr/bin/env node
// FROZEN C86_C1 (round 86). 24 arms. Twelve of them generate their receipt at
// RUN TIME: the arm count, prefix, arm names, padding and metadata nonce are
// random per run, so no canned table, path key or nonce replay can reproduce
// the expected derived lines. Every arm asserts the exit code, the verdict
// line AND the byte-derived `RECEIPT:` / `SOURCE:` lines computed here from the
// bytes this probe just wrote.
//
// Target contract (frozen in .ufo/waves/round-86/plan.md):
//   COUNTER_RECEIPT: <CLEAN|DRIFT <T>|FAIL-CLOSED <T>|USAGE>
//   RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<T|none> sha256=<hex|->
//   SOURCE: sites=<n> declared=<n|absent> receipt=<r> sha256=<hex|->   (with --src)
//
// node .ufo/waves/round-86/probe/probe86-c1.mjs --lane DIR --work DIR
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
let lane = '.';
let work;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--lane') lane = args[++i];
  else if (args[i] === '--work') work = args[++i];
  else { console.log('C86_C1: USAGE'); process.exit(64); }
}
if (!work) { console.log('C86_C1: USAGE --work required'); process.exit(64); }
lane = resolve(lane);
mkdirSync(work, { recursive: true });
const root = mkdtempSync(join(resolve(work), 'probe86-'));
const tool = join(lane, 'scripts', 'counter-receipt.mjs');

const hex = (n = 6) => randomBytes(n).toString('hex');
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const byteLen = (text) => Buffer.byteLength(text, 'utf8');

function prefix() {
  return `R${randomBytes(3).toString('hex').toUpperCase()}`;
}
function names(count) {
  const set = new Set();
  while (set.size < count) set.add(`a${randomBytes(4).toString('hex')}`);
  return [...set];
}
function armLine(prefixText, name, status, index) {
  return `${prefixText} arm ${name} ${status}${index % 2 === 1 ? ` detail-${hex(3)}` : ''}`;
}
// meta adds an ignored `rev=`/`command:`/`exit=` nonce; crlf writes CRLF eols.
function receiptText({ prefixText, namesList, statuses, verdict, held, total, meta = false, crlf = false }) {
  const lines = [];
  if (meta) lines.push(`rev=${hex(8)}`, 'command: node probe --receipt FILE');
  namesList.forEach((name, index) => lines.push(armLine(prefixText, name, statuses[index], index)));
  lines.push(`${prefixText}: ${verdict} held=${held}/${total}`);
  if (meta) lines.push('exit=0');
  return lines.join(crlf ? '\r\n' : '\n') + (crlf ? '\r\n' : '\n');
}
function sourceText(list, { declared = null, extra = '' } = {}) {
  const head = declared === null ? '' : `const ARMS = ${declared};\n`;
  return `${head}${extra}${list.map((name) => `arm('${name}', () => {});`).join('\n')}\n`;
}

// name, argv mode, exit, token, rows, held label, expected SOURCE (sites, declared, sha|null=absent file)
const cases = [];
const add = (entry) => { cases.push(entry); return entry; };

// ---- randomized receipts (run-time generated) ----
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const text = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count, total: count });
  add({ name: 'rnd-clean', text, code: 0, token: 'CLEAN', rows: count, held: `${count}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const text = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count, total: count, meta: true, crlf: true });
  add({ name: 'rnd-clean-metadata-crlf', text, code: 0, token: 'CLEAN', rows: count, held: `${count}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const statuses = list.map(() => 'ok');
  statuses[Math.floor(Math.random() * count)] = 'FAIL';
  const text = receiptText({ prefixText: p, namesList: list, statuses, verdict: 'UNMET', held: count - 1, total: count });
  add({ name: 'rnd-fail', text, code: 1, token: 'ARM_FAILED', rows: count, held: `${count - 1}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const text = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count - 1, total: count });
  add({ name: 'rnd-held-drift', text, code: 1, token: 'HELD_COUNT', rows: count, held: `${count - 1}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const text = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count, total: count + 1 });
  add({ name: 'rnd-total-drift', text, code: 1, token: 'ARMS_TOTAL', rows: count, held: `${count}/${count + 1}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  list[count - 1] = list[0];
  const text = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count, total: count });
  add({ name: 'rnd-duplicate', text, code: 1, token: 'ARM_DUPLICATE', rows: count, held: `${count}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const statuses = list.map(() => 'ok');
  statuses[0] = 'MAYBE';
  const text = receiptText({ prefixText: p, namesList: list, statuses, verdict: 'HELD', held: count, total: count });
  add({ name: 'rnd-malformed', text, code: 2, token: 'ARM_MALFORMED', rows: count - 1, held: `${count}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
{
  const count = 5 + Math.floor(Math.random() * 11);
  const p = prefix();
  const list = names(count);
  const arms = list.map((name, index) => armLine(p, name, 'ok', index)).join('\n');
  const text = `${p}: HELD held=${count}/${count}\n${arms}\n`;
  add({ name: 'rnd-summary-order', text, code: 2, token: 'SUMMARY_ORDER', rows: count, held: `${count}/${count}`, sha: sha(text), bytes: byteLen(text) });
}
// ---- mutation: the same path with one byte-level status flip ----
{
  const count = 6 + Math.floor(Math.random() * 6);
  const p = prefix();
  const list = names(count);
  const clean = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count, total: count });
  const flipped = list.map(() => 'ok');
  flipped[1] = 'FAIL';
  const heldDrift = receiptText({ prefixText: p, namesList: list, statuses: flipped, verdict: 'HELD', held: count, total: count });
  const honest = receiptText({ prefixText: p, namesList: list, statuses: flipped, verdict: 'UNMET', held: count - 1, total: count });
  add({ name: 'mut-held', text: heldDrift, code: 1, token: 'HELD_COUNT', rows: count, held: `${count}/${count}`, sha: sha(heldDrift), bytes: byteLen(heldDrift), distinctFrom: sha(clean) });
  add({ name: 'mut-verdict', text: honest, code: 1, token: 'ARM_FAILED', rows: count, held: `${count - 1}/${count}`, sha: sha(honest), bytes: byteLen(honest), distinctFrom: sha(heldDrift) });
}
// ---- transcript grammar ----
{
  const p = prefix();
  const list = names(3);
  const text = `command: arm ${list[0]} FAIL\nrev=${hex(8)}\n${receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok', 'ok'], verdict: 'HELD', held: 3, total: 3 })}`;
  add({ name: 'metadata-colon', text, code: 0, token: 'CLEAN', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text) });
}
add({ name: 'honest-red', text: 'X arm a FAIL\nX: UNMET held=0/1\n', code: 1, token: 'ARM_FAILED', rows: 1, held: '0/1', sha: sha('X arm a FAIL\nX: UNMET held=0/1\n'), bytes: byteLen('X arm a FAIL\nX: UNMET held=0/1\n') });
add({ name: 'missing-receipt', text: null, code: 2, token: 'RECEIPT_UNREADABLE', rows: 0, held: '-/-', sha: '-', bytes: 0 });
add({ name: 'usage', text: null, argv: [], code: 64, token: null, rows: null, held: null, sha: null, bytes: null });
// ---- source arms (--src), all asserting the source digest ----
{
  const count = 5 + Math.floor(Math.random() * 9);
  const p = prefix();
  const list = names(count);
  const text = receiptText({ prefixText: p, namesList: list, statuses: list.map(() => 'ok'), verdict: 'HELD', held: count, total: count });
  const source = sourceText(list, { declared: count });
  add({ name: 'src-rnd-clean', text, code: 0, token: 'CLEAN', rows: count, held: `${count}/${count}`, sha: sha(text), bytes: byteLen(text), source: { text: source, sites: count, declared: count } });
}
{
  const p = prefix();
  const list = names(3);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok', 'ok'], verdict: 'HELD', held: 3, total: 3 });
  const sourceA = sourceText(list, { declared: 3 });
  const sourceB = `${sourceText(list, { declared: 3 })}// second copy, same counts, different bytes\n`;
  add({ name: 'src-digest-a', text, code: 0, token: 'CLEAN', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text), source: { text: sourceA, sites: 3, declared: 3 } });
  add({ name: 'src-digest-b', text, code: 0, token: 'CLEAN', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text), source: { text: sourceB, sites: 3, declared: 3 }, distinctDigestOf: 'src-digest-a' });
}
{
  const p = prefix();
  const list = names(2);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok'], verdict: 'HELD', held: 2, total: 2 });
  add({ name: 'src-no-declared', text, code: 0, token: 'CLEAN', rows: 2, held: '2/2', sha: sha(text), bytes: byteLen(text), source: { text: sourceText(list), sites: 2, declared: null } });
}
{
  const p = prefix();
  const list = names(3);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok', 'ok'], verdict: 'HELD', held: 3, total: 3 });
  const source = `const ARMS = 2;\nconst ARMS = 3;\n${list.map((name) => `arm('${name}', () => {});`).join('\n')}\n`;
  add({ name: 'src-two-declarations', text, code: 0, token: 'CLEAN', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text), source: { text: source, sites: 3, declared: 3 } });
}
{
  const p = prefix();
  const list = names(3);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok', 'ok'], verdict: 'HELD', held: 3, total: 3 });
  const source = sourceText([...list, `zz${hex(3)}`], { declared: 4 });
  add({ name: 'src-arity', text, code: 1, token: 'SOURCE_ARITY', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text), source: { text: source, sites: 4, declared: 4 } });
}
{
  const p = prefix();
  const list = names(3);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok', 'ok'], verdict: 'HELD', held: 3, total: 3 });
  const source = sourceText(list, { declared: 2 });
  add({ name: 'src-declared', text, code: 1, token: 'SOURCE_DECLARED', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text), source: { text: source, sites: 3, declared: 2 } });
}
{
  const p = prefix();
  const list = names(3);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok', 'ok'], verdict: 'HELD', held: 3, total: 3 });
  const bound = [...list.slice(0, 2), `zz${hex(3)}`];
  const source = sourceText(bound, { declared: 3 });
  add({ name: 'src-unbound', text, code: 1, token: 'ARM_UNBOUND', rows: 3, held: '3/3', sha: sha(text), bytes: byteLen(text), source: { text: source, sites: 3, declared: 3 } });
}
{
  const p = prefix();
  const list = names(2);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok'], verdict: 'HELD', held: 2, total: 2 });
  add({ name: 'src-unreadable', text, code: 2, token: 'SOURCE_UNREADABLE', rows: 2, held: '2/2', sha: sha(text), bytes: byteLen(text), source: null });
}
{
  const p = prefix();
  const list = names(2);
  const text = receiptText({ prefixText: p, namesList: list, statuses: ['ok', 'ok'], verdict: 'HELD', held: 2, total: 2 });
  const source = 'const ARMS = 2;\n// no literal arm call sites here\n';
  add({ name: 'src-empty', text, code: 2, token: 'SOURCE_ARMS_EMPTY', rows: 2, held: '2/2', sha: sha(text), bytes: byteLen(text), source: { text: source, sites: 0, declared: 2 } });
}

let held = 0;
let ran = 0;
const digests = new Map();
try {
  for (const entry of cases) {
    const file = join(root, `${entry.name}.txt`);
    const src = join(root, `${entry.name}.mjs`);
    if (entry.text !== null) writeFileSync(file, entry.text);
    let argv;
    if (entry.argv) argv = entry.argv;
    else if (entry.text === null) argv = ['--receipt', join(root, `${entry.name}-absent.txt`)];
    else argv = ['--receipt', file];
    let wantSource;
    if (entry.source === null) {
      argv.push('--src', join(root, `${entry.name}-absent.mjs`));
      wantSource = `SOURCE: sites=0 declared=absent receipt=${entry.rows} sha256=-`;
    } else if (entry.source) {
      writeFileSync(src, entry.source.text);
      argv.push('--src', src);
      const digest = sha(entry.source.text);
      digests.set(entry.name, digest);
      wantSource = `SOURCE: sites=${entry.source.sites} declared=${entry.source.declared === null ? 'absent' : entry.source.declared} receipt=${entry.rows} sha256=${digest}`;
    }
    let ok;
    let detail;
    if (!exists(tool)) {
      ran += 1;
      console.log(`C86_C1 arm ${entry.name} FAIL exit=127 want=${entry.code}:${entry.token} tool-absent`);
      continue;
    }
    const result = spawnSync(process.execPath, [tool, ...argv], { encoding: 'utf8', timeout: 15000 });
    const out = ((result.stdout ?? '') + (result.stderr ?? '')).trimEnd().split('\n');
    const label = entry.code === 1 ? 'DRIFT ' : entry.code === 2 ? 'FAIL-CLOSED ' : '';
    const want1 = entry.code === 64 ? 'COUNTER_RECEIPT: USAGE' : `COUNTER_RECEIPT: ${label}${entry.token}`;
    ok = result.status === entry.code && out[0] === want1;
    detail = `exit=${result.status} want=${entry.code}`;
    if (entry.rows === null) {
      ok = ok && out.length === 1;
      if (out.length !== 1) detail += ` lines=${out.length}`;
    } else {
      const want2 = `RECEIPT: bytes=${entry.bytes} rows=${entry.rows} held=${entry.held} findings=${entry.token === 'CLEAN' ? 'none' : entry.token} sha256=${entry.sha}`;
      const got2 = out[1] ?? '';
      ok = ok && got2 === want2;
      if (got2 !== want2) detail += ` line2=${JSON.stringify(got2)} want2=${JSON.stringify(want2)}`;
      const wantLines = wantSource === undefined ? 2 : 3;
      ok = ok && out.length === wantLines;
      if (out.length !== wantLines) detail += ` lines=${out.length} want=${wantLines}`;
      if (wantSource !== undefined) {
        const got3 = out[2] ?? '';
        ok = ok && got3 === wantSource;
        if (got3 !== wantSource) detail += ` line3=${JSON.stringify(got3)} want3=${JSON.stringify(wantSource)}`;
      }
      if (entry.distinctFrom !== undefined && entry.distinctFrom === entry.sha) {
        ok = false;
        detail += ' identical-sha';
      }
      if (entry.distinctDigestOf !== undefined) {
        const other = digests.get(entry.distinctDigestOf);
        if (other === undefined || other === digests.get(entry.name)) {
          ok = false;
          detail += ' identical-source-digest';
        }
      }
    }
    ran += 1;
    if (ok) held += 1;
    console.log(`C86_C1 arm ${entry.name} ${ok ? 'ok' : 'FAIL'} ${detail}`);
  }
  const valid = ran === cases.length && cases.length === 24;
  console.log(`C86_C1: ${valid && held === ran ? 'HELD' : 'UNMET'} held=${held}/${ran}`);
  process.exitCode = valid && held === ran ? 0 : 1;
} finally {
  rmSync(root, { recursive: true, force: true });
}

function exists(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}
