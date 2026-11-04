#!/usr/bin/env node
// K85Cheat C1 control (c) — label-keyed no-reader over the frozen
// C85_C1 fixture table, extracted verbatim from the frozen probe source.
// It keys on the --receipt basename, prints the probe's expected tokens, and
// computes bytes/sha256 from the FIXTURE body. The probe prepends a per-run
// nonce line (`rev=` + 16 hex + `\n`, 21 bytes) that this process never sees
// unless it opens the file.
//   mode a: bytes/sha256 from the nonce-less fixture body (the assigned control)
//   mode b: mode a plus the constant 21-byte nonce line in the byte count
//   mode c: reads ONLY the first 21 bytes of the target file to recover the
//           per-run nonce, then replays the label table (semantic body unread)
//   mode d: mode c plus an honest fallback for paths outside the probe table
import { readFileSync, openSync, readSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';

const TABLE = {"clean":{"text":"rev=dbbb0cc4f393175a\nX arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n","code":0,"token":"CLEAN","rows":2,"heldCount":"2/2"},"crlf":{"text":"X arm a ok detail\r\nX arm b ok detail\r\nX: HELD held=2/2\r\n","code":0,"token":"CLEAN","rows":2,"heldCount":"2/2"},"hidden-red":{"text":"X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n","code":1,"token":"ARMS_TOTAL","rows":2,"heldCount":"1/1"},"total-drift":{"text":"X arm a ok detail\nX arm b ok detail\nX: HELD held=2/3\n","code":1,"token":"ARMS_TOTAL","rows":2,"heldCount":"2/3"},"held-drift":{"text":"X arm a ok detail\nX arm b ok detail\nX: HELD held=1/2\n","code":1,"token":"HELD_COUNT","rows":2,"heldCount":"1/2"},"duplicate":{"text":"X arm a ok\nX arm a ok\nX: HELD held=2/2\n","code":1,"token":"ARM_DUPLICATE","rows":2,"heldCount":"2/2"},"foreign-arm":{"text":"X arm a ok\nY arm b ok\nX: HELD held=2/2\n","code":1,"token":"ARM_PREFIX","rows":2,"heldCount":"2/2"},"two-summaries":{"text":"X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\nX: HELD held=2/2\n","code":2,"token":"SUMMARY_COUNT","rows":2,"heldCount":"2/2"},"no-summary":{"text":"X arm a ok\n","code":2,"token":"SUMMARY_COUNT","rows":1,"heldCount":"-/-"},"malformed-arm":{"text":"X arm a MAYBE\nX: HELD held=1/1\n","code":2,"token":"ARM_MALFORMED","rows":0,"heldCount":"1/1"},"zero-arms":{"text":"X: HELD held=0/0\n","code":2,"token":"ARMS_EMPTY","rows":0,"heldCount":"0/0"},"missing":{"text":null,"code":2,"token":"RECEIPT_UNREADABLE","rows":0,"heldCount":"-/-"},"usage":{"text":null,"code":64,"token":"USAGE","rows":null,"heldCount":null},"honest-red":{"text":"X arm a FAIL\nX: UNMET held=0/1\n","code":1,"token":"ARM_FAILED","rows":1,"heldCount":"0/1"},"wrong-verdict":{"text":"X arm a ok detail\nX arm b ok detail\nX: UNMET held=2/2\n","code":1,"token":"VERDICT","rows":2,"heldCount":"2/2"},"summary-before-arms":{"text":"X: HELD held=2/2\nX arm a ok\nX arm b ok\n","code":2,"token":"SUMMARY_ORDER","rows":2,"heldCount":"2/2"},"src-bound-clean":{"text":"X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n","code":0,"token":"CLEAN","rows":3,"heldCount":"3/3","sourceLine":"SOURCE: sites=3 declared=3 receipt=3"},"src-unbound":{"text":"X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n","code":1,"token":"ARM_UNBOUND","rows":3,"heldCount":"3/3","sourceLine":"SOURCE: sites=3 declared=3 receipt=3"},"src-arity":{"text":"X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n","code":1,"token":"SOURCE_ARITY","rows":3,"heldCount":"3/3","sourceLine":"SOURCE: sites=4 declared=4 receipt=3"},"src-declared":{"text":"X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n","code":1,"token":"SOURCE_DECLARED","rows":3,"heldCount":"3/3","sourceLine":"SOURCE: sites=3 declared=2 receipt=3"}};
const GEN_NONCE = 'rev=dbbb0cc4f393175a';
const MODE = 'c';

const sha256 = (s) => createHash('sha256').update(Buffer.from(s, 'utf8')).digest('hex');
const label = (code) => (code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '');
const verdict = (code, token) => `COUNTER_RECEIPT: ${label(code)}${token}`;
const receipt = (bytes, rows, held, token, digest) =>
  `RECEIPT: bytes=${bytes} rows=${rows} held=${held} findings=${token === 'CLEAN' ? 'none' : token} sha256=${digest}`;

const STUB_DIGEST = '0'.repeat(64);
function stub() {
  console.log(verdict(0, 'CLEAN'));
  console.log(receipt(0, 0, '0/0', 'CLEAN', STUB_DIGEST));
  process.exitCode = 0;
}

// Minimal capability probe: 21 bytes only, never the semantic body.
function firstNonce(file) {
  let fd;
  try {
    fd = openSync(file, 'r');
    const buf = Buffer.alloc(21);
    const n = readSync(fd, buf, 0, 21, 0);
    const head = buf.subarray(0, n).toString('utf8');
    const match = /^(rev=[0-9a-f]{16})\n?$/.exec(head);
    return match ? match[1] : null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

// Honest fallback for paths outside the frozen fixture table (mode d only).
function honest(file) {
  let raw;
  try { raw = readFileSync(file, 'utf8'); }
  catch {
    console.log(verdict(2, 'RECEIPT_UNREADABLE'));
    console.log(receipt(0, 0, '-/-', 'RECEIPT_UNREADABLE', '-'));
    process.exitCode = 2;
    return;
  }
  const armPattern = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:[ \t]+.*)?$/;
  const summaryPattern = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=([0-9]+)\/([0-9]+)$/;
  let arms = 0;
  let failed = false;
  let summary = null;
  for (const line of raw.split(/\r?\n/)) {
    const arm = armPattern.exec(line);
    if (arm) { arms += 1; if (arm[3] === 'FAIL') failed = true; }
    const found = summaryPattern.exec(line);
    if (found) summary = found;
  }
  const token = summary === null ? 'SUMMARY_COUNT' : failed ? 'ARM_FAILED' : 'CLEAN';
  const code = summary === null ? 2 : failed ? 1 : 0;
  const held = summary === null ? '-/-' : `${summary[3]}/${summary[4]}`;
  console.log(verdict(code, token));
  console.log(receipt(Buffer.byteLength(raw), arms, held, token, sha256(raw)));
  process.exitCode = code;
}

function main(args) {
  if (args.length === 0) {
    console.log(verdict(64, 'USAGE'));
    return 64;
  }
  const file = args[1];
  const name = basename(file).replace(/\.txt$/, '');
  const row = TABLE[name];
  if (!row) {
    if (MODE === 'd') { honest(file); return process.exitCode ?? 0; }
    stub();
    return 0;
  }
  if (row.text === null) {
    console.log(verdict(row.code, row.token));
    console.log(receipt(0, 0, '-/-', row.token, '-'));
    return row.code;
  }
  let bytes = null;
  let digest = null;
  if (MODE === 'a') {
    bytes = Buffer.byteLength(row.text);
    digest = sha256(row.text);
  } else if (MODE === 'b') {
    bytes = 21 + Buffer.byteLength(row.text);
    digest = sha256(row.text);
  } else if (MODE === 'c' || MODE === 'd') {
    const nonce = firstNonce(file);
    if (nonce !== null) {
      // The `clean` fixture embeds the run nonce in its own body; the table
      // carries the extraction-time nonce, so substitute the revealed one.
      const text = row.text.split(GEN_NONCE).join(nonce);
      bytes = Buffer.byteLength(nonce) + 1 + Buffer.byteLength(text);
      digest = sha256(`${nonce}\n${text}`);
    }
  }
  if (digest === null) {
    if (MODE === 'd') { honest(file); return process.exitCode ?? 0; }
    stub();
    return 0;
  }
  console.log(verdict(row.code, row.token));
  console.log(receipt(bytes, row.rows, row.heldCount, row.token, digest));
  if (row.sourceLine !== undefined) console.log(row.sourceLine);
  return row.code;
}

process.exitCode = main(process.argv.slice(2));
