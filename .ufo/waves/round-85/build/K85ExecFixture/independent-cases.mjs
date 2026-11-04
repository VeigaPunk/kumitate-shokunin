#!/usr/bin/env node
/**
 * Round-85 C1 independent regression driver — seat K85ExecFixture.
 *
 * Derived from the frozen plan's contract `kumitate-counter-receipt-v2`, not
 * from the frozen probe's case table. Every fixture body is written here, in
 * --work, immediately before the tool runs; every expected RECEIPT line is
 * computed from those written bytes (byte length + sha256), and each body
 * carries a per-run nonce metadata line the parser must ignore but the byte
 * count and sha256 must not. A canned, label-keyed or non-reading counter
 * therefore cannot reproduce a passing run.
 *
 * node independent-cases.mjs --tool FILE --work DIR
 *
 * Assertions per case: exit code, first line (token), and the input-derived
 * RECEIPT line, plus the SOURCE line where --src is named. Where the frozen
 * plan does not pin a rendering, the case says so explicitly:
 *   heldAny      — leading-zero and malformed-summary `held=` rendering is
 *                  unpinned; bytes/rows/findings/sha256 are still exact.
 *   sourcePattern — SOURCE line for an unreadable source; shape asserted.
 * Everything else is a byte-exact expectation.
 *
 * Exit: 0 all cases held, 1 any case red, 3 candidate absent (not run).
 * Read-only: writes only under --work and removes its run directory.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync, statSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join, dirname } from 'node:path';

const argv = process.argv.slice(2);
let toolArg;
let workArg;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--tool') toolArg = argv[++i];
  else if (argv[i] === '--work') workArg = argv[++i];
  else {
    console.log('INDEPENDENT_CASES: USAGE');
    process.exit(64);
  }
}
if (!toolArg || !workArg) {
  console.log('INDEPENDENT_CASES: USAGE --tool and --work required');
  process.exit(64);
}

const tool = resolve(toolArg);
const work = resolve(workArg);

function isFile(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}

function gitHead(dir) {
  const result = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 10000 });
  return result.status === 0 ? result.stdout.trim() : 'nogit';
}

if (!isFile(tool)) {
  console.log(`INDEPENDENT_CASES: SKIPPED tool-absent tool=${tool}`);
  process.exit(3);
}
mkdirSync(work, { recursive: true });
const toolSha = createHash('sha256').update(readFileSync(tool)).digest('hex');
const toolHead = gitHead(dirname(tool));
const runNonce = createHash('sha256').update(String(process.pid) + Date.now()).digest('hex');

// --- fixture vocabulary (values chosen here, not copied from the probe) ---
const good2 = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
const threeSrc = "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n";

// name, receipt body (null = do not write the file), src (undefined = no --src,
// null = --src names an absent file), exit, token, rows (null = USAGE only),
// held ('-' not used; heldAny where unpinned), source line or pattern, argv.
const cases = [
  // metadata shapes that look like arms / summaries must be ignored (k=v,
  // command:, rev:, exit: are metadata by contract).
  { name: 'meta-arm-shape', receipt: `command=X arm red FAIL\n${good2}`, exit: 0, token: 'CLEAN', rows: 2, held: '2/2' },
  { name: 'meta-summary-shape', receipt: `command: HELD held=99/99\nrev=X: UNMET held=0/1\n${good2}`, exit: 0, token: 'CLEAN', rows: 2, held: '2/2' },
  { name: 'meta-code-shape', receipt: `command: throw new Error('receipt executed')\nexit=0\nnote=v1\n${good2}`, exit: 0, token: 'CLEAN', rows: 2, held: '2/2' },
  { name: 'meta-after-summary', receipt: `${good2}elapsed=3\nrev=deadbeef\n`, exit: 0, token: 'CLEAN', rows: 2, held: '2/2' },
  // line endings
  { name: 'crlf', receipt: good2, exit: 0, token: 'CLEAN', rows: 2, held: '2/2', crlf: true },
  { name: 'crlf-metadata', receipt: `command: node tool --receipt FILE\n${good2}`, exit: 0, token: 'CLEAN', rows: 2, held: '2/2', crlf: true },
  // integer shapes
  { name: 'leading-zero', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=02/002\n', exit: 0, token: 'CLEAN', rows: 2, heldAny: true },
  { name: 'huge-safe', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=9007199254740991/9007199254740991\n', exit: 1, token: 'ARMS_TOTAL', rows: 2, held: '9007199254740991/9007199254740991' },
  { name: 'unsafe-held', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=9007199254740992/2\n', exit: 2, token: 'SUMMARY_COUNT', rows: 2, heldAny: true },
  { name: 'fraction-total', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=2/2.5\n', exit: 2, token: 'SUMMARY_COUNT', rows: 2, heldAny: true },
  { name: 'exponent-held', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=2e0/2\n', exit: 2, token: 'SUMMARY_COUNT', rows: 2, heldAny: true },
  { name: 'negative-held', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=-1/2\n', exit: 2, token: 'SUMMARY_COUNT', rows: 2, heldAny: true },
  // structure
  { name: 'two-summaries', receipt: `${good2}X: HELD held=2/2\n`, exit: 2, token: 'SUMMARY_COUNT', rows: 2, held: '2/2' },
  { name: 'no-summary', receipt: 'X arm a ok\nX arm b ok\n', exit: 2, token: 'SUMMARY_COUNT', rows: 2, held: '-/-' },
  { name: 'malformed-name', receipt: 'X arm a_b ok\nX: HELD held=1/1\n', exit: 2, token: 'ARM_MALFORMED', rows: 0, held: '1/1' },
  { name: 'malformed-status', receipt: 'X arm a MAYBE\nX: HELD held=1/1\n', exit: 2, token: 'ARM_MALFORMED', rows: 0, held: '1/1' },
  { name: 'malformed-prefix', receipt: 'bad arm a ok\nX: HELD held=1/1\n', exit: 2, token: 'ARM_MALFORMED', rows: 0, held: '1/1' },
  { name: 'zero-arms', receipt: 'X: HELD held=0/0\n', exit: 2, token: 'ARMS_EMPTY', rows: 0, held: '0/0' },
  { name: 'honest-red', receipt: 'X arm a FAIL\nX: UNMET held=0/1\n', exit: 1, token: 'ARM_FAILED', rows: 1, held: '0/1' },
  { name: 'wrong-verdict', receipt: 'X arm a ok\nX arm b ok\nX: UNMET held=2/2\n', exit: 1, token: 'VERDICT', rows: 2, held: '2/2' },
  { name: 'summary-before-arms', receipt: 'X: HELD held=2/2\nX arm a ok\nX arm b ok\n', exit: 2, token: 'SUMMARY_ORDER', rows: 2, held: '2/2' },
  { name: 'total-drift', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=2/3\n', exit: 1, token: 'ARMS_TOTAL', rows: 2, held: '2/3' },
  { name: 'held-drift', receipt: 'X arm a ok\nX arm b ok\nX: HELD held=1/2\n', exit: 1, token: 'HELD_COUNT', rows: 2, held: '1/2' },
  { name: 'duplicate-arm', receipt: 'X arm a ok\nX arm a ok\nX: HELD held=2/2\n', exit: 1, token: 'ARM_DUPLICATE', rows: 2, held: '2/2' },
  { name: 'foreign-arm', receipt: 'X arm a ok\nY arm b ok\nX: HELD held=2/2\n', exit: 1, token: 'ARM_PREFIX', rows: 2, held: '2/2' },
  // file shapes
  { name: 'missing-file', receipt: null, exit: 2, token: 'RECEIPT_UNREADABLE', rows: 0, held: '-/-' },
  { name: 'directory-receipt', receipt: null, argv: ['--receipt', '$dir'], exit: 2, token: 'RECEIPT_UNREADABLE', rows: 0, held: '-/-' },
  // CLI refusals
  { name: 'cli-none', receipt: null, argv: [], exit: 64, token: 'USAGE', rows: null },
  { name: 'cli-unknown', receipt: null, argv: ['--bogus', '$receipt'], exit: 64, token: 'USAGE', rows: null },
  { name: 'cli-duplicate', receipt: null, argv: ['--receipt', '$receipt', '--receipt', '$receipt'], exit: 64, token: 'USAGE', rows: null },
  { name: 'cli-missing-value', receipt: null, argv: ['--receipt'], exit: 64, token: 'USAGE', rows: null },
  { name: 'cli-src-only', receipt: null, argv: ['--src', '$src'], exit: 64, token: 'USAGE', rows: null },
  { name: 'cli-mixed', receipt: null, argv: ['--selftest', '--receipt', '$receipt'], exit: 64, token: 'USAGE', rows: null },
  // six source arms
  { name: 'src-bound-clean', receipt: three, src: threeSrc, exit: 0, token: 'CLEAN', rows: 3, held: '3/3', source: 'SOURCE: sites=3 declared=3 receipt=3' },
  { name: 'src-unbound', receipt: 'X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n', src: threeSrc, exit: 1, token: 'ARM_UNBOUND', rows: 3, held: '3/3', source: 'SOURCE: sites=3 declared=3 receipt=3' },
  { name: 'src-arity', receipt: three, src: "const ARMS = 4;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\narm('d', () => {});\n", exit: 1, token: 'SOURCE_ARITY', rows: 3, held: '3/3', source: 'SOURCE: sites=4 declared=4 receipt=3' },
  { name: 'src-declared', receipt: three, src: "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n", exit: 1, token: 'SOURCE_DECLARED', rows: 3, held: '3/3', source: 'SOURCE: sites=3 declared=2 receipt=3' },
  { name: 'src-no-sites', receipt: three, src: "const ARMS = 3;\nrun('a');\n", exit: 2, token: 'SOURCE_ARMS_EMPTY', rows: 3, held: '3/3', source: 'SOURCE: sites=0 declared=3 receipt=3' },
  { name: 'src-missing', receipt: three, src: null, exit: 2, token: 'SOURCE_UNREADABLE', rows: 3, held: '3/3', sourcePattern: /^SOURCE: sites=\S+ declared=\S+ receipt=3$/ },
  // source extraction pins: the LAST ARMS declaration wins; an absent
  // declaration renders declared=absent and cannot trigger a comparative drift.
  { name: 'src-last-declared', receipt: three, src: "const ARMS = 2;\nconst ARMS = 3;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n", exit: 0, token: 'CLEAN', rows: 3, held: '3/3', source: 'SOURCE: sites=3 declared=3 receipt=3' },
  { name: 'src-declared-absent', receipt: three, src: "arm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n", exit: 0, token: 'CLEAN', rows: 3, held: '3/3', source: 'SOURCE: sites=3 declared=absent receipt=3' },
];

const root = mkdtempSync(join(work, 'independent-cases-'));
let held = 0;
try {
  console.log(`INDEPENDENT_CASES driver=independent-cases.mjs cases=${cases.length} tool=${tool} tool_sha256=${toolSha} tool_head=${toolHead} work=${root}`);
  for (const c of cases) {
    const nl = c.crlf ? '\r\n' : '\n';
    const nonce = `nonce=${createHash('sha256').update(`${runNonce}:${c.name}`).digest('hex').slice(0, 32)}`;
    const body = c.receipt === null ? null : nonce + nl + (c.crlf ? c.receipt.replaceAll('\n', '\r\n') : c.receipt);
    const receiptFile = join(root, `${c.name}.receipt.txt`);
    const srcFile = join(root, `${c.name}.source.mjs`);
    if (body !== null) writeFileSync(receiptFile, body);
    if (typeof c.src === 'string') writeFileSync(srcFile, c.src);
    const spec = c.argv ?? (c.src === undefined ? ['--receipt', '$receipt'] : ['--receipt', '$receipt', '--src', '$src']);
    const args = spec.map((t) => (t === '$receipt' ? receiptFile : t === '$src' ? srcFile : t === '$dir' ? root : t));
    const result = spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8', timeout: 10000 });
    const text = `${result.stdout ?? ''}${result.stderr ?? ''}`.trimEnd();
    const out = text === '' ? [] : text.split('\n');

    const bytes = body === null ? 0 : Buffer.byteLength(body);
    const sha = body === null ? '-' : createHash('sha256').update(Buffer.from(body, 'utf8')).digest('hex');
    const findings = c.token === 'CLEAN' ? 'none' : c.token;
    const label = c.exit === 1 ? 'DRIFT ' : c.exit === 2 ? 'FAIL-CLOSED ' : '';
    const want1 = `COUNTER_RECEIPT: ${label}${c.token}`;

    let ok = result.status === c.exit && out[0] === want1;
    let detail = `exit=${result.status} want=${c.exit}`;
    if (!ok) detail += ` line1=${JSON.stringify(out[0] ?? null)} want1=${JSON.stringify(want1)}`;

    if (c.rows === null) {
      const oneLine = out.length === 1;
      ok = ok && oneLine;
      if (!oneLine) detail += ` lines=${out.length}`;
    } else {
      const want2 = `RECEIPT: bytes=${bytes} rows=${c.rows} held=${c.held} findings=${findings} sha256=${sha}`;
      const got2 = out[1] ?? '';
      let ok2;
      if (c.heldAny) {
        const got = got2.split(' ');
        const want = want2.split(' ');
        ok2 = got.length === want.length && got.every((part, i) => (i === 3 ? part.startsWith('held=') : part === want[i]));
      } else {
        ok2 = got2 === want2;
      }
      ok = ok && ok2;
      if (!ok2) detail += ` line2=${JSON.stringify(got2)}`;
      else if (c.heldAny) detail += ` held_render=${JSON.stringify(got2.split(' ')[3])}`;

      const wantLines = c.src === undefined ? 2 : 3;
      const lineCountOk = out.length === wantLines;
      ok = ok && lineCountOk;
      if (!lineCountOk) detail += ` lines=${out.length} want_lines=${wantLines}`;

      if (c.src !== undefined) {
        const got3 = out[2] ?? '';
        const ok3 = c.source !== undefined ? got3 === c.source : c.sourcePattern.test(got3);
        ok = ok && ok3;
        if (!ok3) detail += ` line3=${JSON.stringify(got3)}`;
        else if (c.source === undefined) detail += ` source_render=${JSON.stringify(got3)}`;
      }
    }

    if (ok) held += 1;
    console.log(`INDEPENDENT_CASES arm ${c.name} ${ok ? 'ok' : 'FAIL'} ${detail}`);
  }
  const heldAll = held === cases.length;
  console.log(`INDEPENDENT_CASES: ${heldAll ? 'HELD' : 'UNMET'} held=${held}/${cases.length} tool=${tool} tool_sha256=${toolSha} tool_head=${toolHead}`);
  process.exitCode = heldAll ? 0 : 1;
} finally {
  rmSync(root, { recursive: true, force: true });
}
