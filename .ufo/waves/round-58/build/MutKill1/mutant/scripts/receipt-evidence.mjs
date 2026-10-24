#!/usr/bin/env node
/**
 * receipt-evidence.mjs — capability `receipt-evidence` (contract
 * `kumitate-receipt-evidence-v1`, round 58; routed-defect repairs R57-V1 +
 * R57-V2 + R57-V4 of `corpus/lessons/round-57.md`).
 *
 * Scores a directory of attested receipts AS EVIDENCE at a judged revision:
 * a receipt counts only if the committed bytes it claims would actually
 * produce it. Four properties, all required:
 *
 *   1. LEDGER — every `*.txt` receipt of the directory verifies
 *      `RECEIPT: VALID` under the EXTRACTION's own pinned
 *      `scripts/receipt-attest.mjs` (`verify --ledger`), so a forgery that
 *      breaks the sidecar/digest/ledger binding is out (R57-V4, first half).
 *   2. REPRODUCTION — each receipt's recorded argv is re-run inside a
 *      `git archive` extraction of the judged rev and must match the
 *      recorded exit and stdout/stderr sha256. A receipt fabricated at
 *      commit time — whatever its self-consistent body claims — cannot
 *      reproduce (R57-V4, second half: this is the arm A57's B8 lacked).
 *   3. FRESHNESS — each receipt's body nonce (32 lowercase hex) must be
 *      absent from the cross-round sweep
 *        git grep -ohE '"nonce":\\s*"[0-9a-f]{32}"' <rev> --
 *          ':(glob).ufo/waves/round-4[89]/**'
 *          ':(glob).ufo/waves/round-5[0-7]/**'
 *      R57-V1: `:(glob)…/**` pathspecs DESCEND (a bare directory-name
 *      wildcard matches whole paths, not prefixes, so the old sweep read
 *      zero bytes and failed open). Fail-closed: grep exit >= 2 is
 *      `SWEEP_GREP`; the pathspecs resolving to zero files is
 *      `SWEEP_NO_FILES`; zero swept nonces is `SWEEP_NO_NONCES` — a
 *      freshness claim over an unproven sweep is never HELD. Coverage is
 *      additionally provable by the caller: every `--expect-sweep-nonce H`
 *      must be FOUND by the sweep, else `SWEEP_SENTINEL_MISS`.
 *   4. SPAN — the body `wall_start` fields (never the display prelude
 *      `run-at:`, which is not evidence) span at least `--min-span-ms`
 *      (default 300000) across the receipt set, else `SPAN_SHORT`.
 *
 *   node scripts/receipt-evidence.mjs verify --lane <dir> --rev <rev>
 *     --receipts <dir> [--min-span-ms N] [--expect-sweep-nonce H]...
 *   node scripts/receipt-evidence.mjs --selftest
 *
 * Verdicts: `RECEIPT_EVIDENCE: HELD receipts=<n> reproduced=<n>
 * sweep_files=<f> sweep_nonces=<n> span_ms=<s>` exit 0;
 * `RECEIPT_EVIDENCE: UNMET reason=<kind> detail=<file>` exit 1;
 * `RECEIPT_EVIDENCE: FAIL-CLOSED reason=<kind>` exit 2; usage 64.
 *
 * The gate never writes. It reads the receipts and extracts the judged rev
 * into mkdtemp only. `--selftest` is hermetic: every case builds a synthetic
 * git lane under mkdtemp (its own `git init` + one commit, identity passed
 * on the command line), mints or forges real receipts with the lane's own
 * `receipt-attest.mjs`, and asserts the exact exit and final line; one
 * red-before per arm. Final line `RECEIPT_EVIDENCE_SELFTEST: PASS (n/n)` +
 * `VERDICT: PASS`.
 *
 * Owner: kumitate L1. Row: SKILL.md §Gate registry (`receipt-evidence`,
 * gate); pin: SCORECARD.md `kumitate-gate-pins-v1` (`pin.receipt-evidence`).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-receipt-evidence-v1';
const SELF = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(SELF), '..');
const NONCE_RE = /^[0-9a-f]{32}$/;
const REV_RE = /^[0-9a-f]{40,64}$/;
const SWEEP_SPECS = [':(glob).ufo/waves/round-4[89]/**', ':(glob).ufo/waves/round-5[0-7]/**'];
const SWEEP_PATTERN = '"nonce":\\s*"[0-9a-f]{32}"';
const out = (s) => process.stdout.write(s);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const usage = (why) => {
  process.stderr.write(`RECEIPT_EVIDENCE: USAGE ${why} (contract ${CONTRACT}: verify --lane <dir> --rev <rev> --receipts <dir> [--min-span-ms N] [--expect-sweep-nonce H]... | --selftest)\n`);
  process.exit(64);
};
const unmet = (reason, detail = '') => {
  out(`RECEIPT_EVIDENCE: UNMET reason=${reason}${detail ? ` detail=${detail}` : ''}\n`);
  process.exit(1);
};
const failClosed = (reason) => {
  out(`RECEIPT_EVIDENCE: FAIL-CLOSED reason=${reason}\n`);
  process.exit(2);
};

function splitReceipt(text) {
  if (!text.endsWith('\n')) return { error: 'missing trailing newline' };
  const lines = text.split('\n');
  if (lines.length !== 3 || lines[2] !== '') return { error: `expected exactly 2 lines plus trailing newline, got ${lines.length - 1}` };
  try {
    return { body: JSON.parse(lines[1]) };
  } catch {
    return { error: 'body is not JSON' };
  }
}

function extractRev(lane, rev) {
  const dir = mkdtempSync(join(tmpdir(), 'receipt-evidence.'));
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(dir)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    rmSync(dir, { recursive: true, force: true });
    failClosed(`ARCHIVE status=${tar.status}`);
  }
  return dir;
}

function sweep(lane, rev) {
  // `git ls-tree` rejects `:(glob)` magic ("pathspec magic not supported by
  // this command"), so the coverage proof lists the rev's blobs and applies
  // the rounds-48..57 prefix filter in process — the exact set the
  // descending glob pathspecs denote.
  const files = spawnSync('git', ['-C', lane, 'ls-tree', '-r', '--name-only', rev],
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 64 << 20 });
  if (files.status !== 0) failClosed(`LS_TREE status=${files.status}`);
  const SWEPT_DIR_RE = /^\.ufo\/waves\/round-(?:4[89]|5[0-7])\//;
  const fileCount = `${files.stdout || ''}`.split('\n').filter((p) => SWEPT_DIR_RE.test(p)).length;
  if (fileCount < 1) failClosed('SWEEP_NO_FILES');
  const g = spawnSync('git', ['-C', lane, 'grep', '-ohE', SWEEP_PATTERN, rev, '--', ...SWEEP_SPECS],
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 32 << 20 });
  if (g.status >= 2) failClosed(`SWEEP_GREP status=${g.status}`);
  const nonces = new Set();
  for (const line of `${g.stdout || ''}`.split('\n')) {
    const m = line.match(/"nonce":\s*"([0-9a-f]{32})"/);
    if (m) nonces.add(m[1]);
  }
  if (nonces.size < 1) failClosed('SWEEP_NO_NONCES');
  return { fileCount, nonces };
}

function verify(argv) {
  let lane = LANE;
  let rev = null;
  let receiptsDir = null;
  let minSpan = 300_000;
  const expect = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lane' && argv[i + 1]) lane = resolve(argv[++i]);
    else if (a === '--rev' && argv[i + 1]) rev = argv[++i];
    else if (a === '--receipts' && argv[i + 1]) receiptsDir = resolve(argv[++i]);
    else if (a === '--min-span-ms' && argv[i + 1]) minSpan = Number(argv[++i]);
    else if (a === '--expect-sweep-nonce' && argv[i + 1]) expect.push(argv[++i]);
    else usage(`unexpected argument ${JSON.stringify(a)}`);
  }
  if (!rev) usage('verify needs --rev <rev>');
  if (!RECEIPTS_DIR_MAYBE(receiptsDir)) usage('verify needs --receipts <dir>');
  if (!REV_RE.test(rev)) usage(`--rev must be a full lowercase hex object name, got ${JSON.stringify(rev)}`);
  if (!existsSync(join(lane, '.git'))) usage(`--lane ${JSON.stringify(lane)} is not a git repo`);
  if (!Number.isFinite(minSpan) || minSpan < 0) usage('--min-span-ms must be a non-negative number');
  for (const h of expect) if (!NONCE_RE.test(h)) usage(`--expect-sweep-nonce wants 32 lowercase hex, got ${JSON.stringify(h)}`);

  let names = [];
  try {
    names = readdirSync(receiptsDir).filter((f) => f.endsWith('.txt')).sort();
  } catch {
    failClosed('RECEIPTS_UNREADABLE');
  }
  if (names.length < 1) unmet('NO_RECEIPTS', basename(receiptsDir));

  const T = extractRev(lane, rev);
  try {
    const verifier = join(T, 'scripts/receipt-attest.mjs');
    if (!existsSync(verifier)) failClosed('RECEIPT_ATTEST_ABSENT');
    const receipts = [];
    for (const name of names) {
      const file = join(receiptsDir, name);
      const v = spawnSync(process.execPath, [verifier, 'verify', '--ledger', receiptsDir, file],
        { cwd: T, encoding: 'utf8', timeout: 120_000, maxBuffer: 16 << 20 });
      if (v.status !== 0 || !/RECEIPT: VALID/.test(`${v.stdout}`)) {
        unmet('LEDGER', name);
      }
      const bytes = readFileSync(file);
      const p = splitReceipt(bytes.toString('utf8'));
      if (p.error || !p.body || !Array.isArray(p.body.argv) || p.body.argv.length < 1
          || !NONCE_RE.test(p.body.nonce || '') || typeof p.body.exit !== 'number'
          || !/^[0-9a-f]{64}$/.test(p.body.stdout_sha256 || '') || !/^[0-9a-f]{64}$/.test(p.body.stderr_sha256 || '')) {
        failClosed(`RECEIPT_MALFORMED ${name}`);
      }
      receipts.push({ name, body: p.body });
    }
    let reproduced = 0;
    for (const r of receipts) {
      const [cmd, ...args] = r.body.argv;
      const child = spawnSync(cmd, args, { cwd: T, encoding: 'buffer', timeout: 300_000, maxBuffer: 64 << 20 });
      const stdoutBuf = child.stdout || Buffer.alloc(0);
      const stderrBuf = child.stderr || Buffer.alloc(0);
      const code = child.error && child.error.code === 'ETIMEDOUT' ? 'TIMEOUT' : child.status;
      reproduced += 1;
    }
    const sw = sweep(lane, rev);
    for (const r of receipts) {
      if (sw.nonces.has(r.body.nonce)) unmet('NONCE_REUSED', r.name);
    }
    for (const h of expect) {
      if (!sw.nonces.has(h)) unmet('SWEEP_SENTINEL_MISS', h);
    }
    const times = receipts.map((r) => Date.parse(r.body.wall_start));
    if (times.some((t) => !Number.isFinite(t))) failClosed('WALL_START_MALFORMED');
    const span = Math.max(...times) - Math.min(...times);
    if (span < minSpan) unmet('SPAN_SHORT', `span_ms=${span} min_ms=${minSpan}`);
    out(`RECEIPT_EVIDENCE: HELD receipts=${receipts.length} reproduced=${reproduced} sweep_files=${sw.fileCount} sweep_nonces=${sw.nonces.size} span_ms=${span}\n`);
    process.exit(0);
  } finally {
    rmSync(T, { recursive: true, force: true });
  }
}
function RECEIPTS_DIR_MAYBE(d) { return typeof d === 'string' && d.length > 0; }

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'receipt-evidence-st.'));
  const results = [];
  const pass = (name, ok, detail) => {
    results.push({ name, ok });
    out(`case ${name}: ${ok ? 'PASS' : `FAIL ${detail || ''}`}\n`);
  };
  const run = (args, opts = {}) => spawnSync(process.execPath, [SELF, ...args],
    { encoding: 'utf8', timeout: 300_000, maxBuffer: 32 << 20, ...opts });
  const last = (r) => `${r.stdout || ''}`.trim().split('\n').pop() || '';
  const sortKeys = (v) => Array.isArray(v) ? v.map(sortKeys)
    : (v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])])) : v);
  const digestOf = (record) => sha256(JSON.stringify(sortKeys({ ...record, digest: undefined })));
  const reseal = (file, mutate) => {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    const body = JSON.parse(lines[1]);
    mutate(body);
    delete body.digest;
    body.digest = digestOf(body);
    const next = `${lines[0]}\n${JSON.stringify(sortKeys(body))}\n`;
    writeFileSync(file, next);
    writeFileSync(`${file}.sha256`, `${sha256(Buffer.from(next))}  ${basename(file)}\n`);
  };

  // A synthetic git lane: receipt-attest copied from the real lane, an old
  // corpus nonce file under .ufo/waves/round-52/receipts/, three minted
  // receipts over deterministic commands, one commit. `oldNonce` may be
  // overridden per case; `reusedNonce` plants a receipt nonce in the old
  // corpus (the NONCE_REUSED shape).
  const fixture = (name, { oldNonce = 'a1b2c3d4e5f60718293a4b5c6d7e8f90', priorDir = true, reuseOwn = false } = {}) => {
    const dir = mkdtempSync(join(root, `${name}.`));
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    cpSync(join(LANE, 'scripts/receipt-attest.mjs'), join(dir, 'scripts/receipt-attest.mjs'));
    const corpusFile = join(dir, '.ufo/waves/round-52/receipts/attest-run-1.txt');
    if (priorDir) {
      mkdirSync(dirname(corpusFile), { recursive: true });
      writeFileSync(corpusFile,
        `run-at: 2026-01-01T00:00:00.000Z\n{"argv":["node","-v"],"digest":"${'0'.repeat(64)}","exit":0,"nonce":"${oldNonce}","stderr_sha256":"${'e'.repeat(64)}","stdout_sha256":"${'f'.repeat(64)}","wall_end":"2026-01-01T00:00:01.000Z","wall_start":"2026-01-01T00:00:00.000Z"}\n`);
    }
    const receiptsDir = join(dir, '.ufo/waves/round-58/receipts');
    mkdirSync(receiptsDir, { recursive: true });
    const mint = (base, script) => {
      // receipt-attest appends `.txt` to --out itself.
      const r = spawnSync(process.execPath, [join(dir, 'scripts/receipt-attest.mjs'), 'run', '--out', join(receiptsDir, base.replace(/\.txt$/, '')), '--',
        process.execPath, '-e', script], { encoding: 'utf8', timeout: 60_000 });
      if (r.status !== 0) throw new Error(`mint ${base}: ${r.status}`);
    };
    mint('attest-run-1.txt', 'process.stdout.write("out-1\\n")');
    mint('attest-run-2.txt', 'process.stdout.write("out-2\\n")');
    mint('attest-run-3.txt', 'process.stdout.write("out-3\\n")');
    if (reuseOwn && priorDir) {
      // plant one of this lane's own receipt nonces in the old corpus, so
      // freshness (not ledger) is the arm that fires.
      const p = splitReceipt(readFileSync(join(receiptsDir, 'attest-run-1.txt'), 'utf8'));
      writeFileSync(corpusFile,
        `run-at: 2026-01-01T00:00:00.000Z\n{"argv":["node","-v"],"digest":"${'0'.repeat(64)}","exit":0,"nonce":"${p.body.nonce}","stderr_sha256":"${'e'.repeat(64)}","stdout_sha256":"${'f'.repeat(64)}","wall_end":"2026-01-01T00:00:01.000Z","wall_start":"2026-01-01T00:00:00.000Z"}\n`);
    }
    const g = (args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8', timeout: 60_000 });
    if (g(['-c', 'init.defaultBranch=master', 'init', '-q']).status !== 0) throw new Error('init');
    if (g(['add', '-A']).status !== 0) throw new Error('add');
    if (g(['-c', 'user.email=st@example.invalid', '-c', 'user.name=st', 'commit', '-q', '-m', 'st']).status !== 0) throw new Error('commit');
    const h = g(['rev-parse', 'HEAD']);
    if (h.status !== 0) throw new Error('rev-parse');
    return { dir, rev: h.stdout.trim(), receiptsDir, oldNonce };
  };
  const verifyArgs = (fx, extra = []) => ['verify', '--lane', fx.dir, '--rev', fx.rev, '--receipts', fx.receiptsDir, ...extra];

  try {
    // 1 — held base: three minted receipts, sentinel found, span floor 0
    {
      const fx = fixture('d1');
      const r = run(verifyArgs(fx, ['--min-span-ms', '0', '--expect-sweep-nonce', fx.oldNonce]));
      pass('held-base', r.status === 0 && last(r).startsWith('RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3'),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 2 — reproduce miss: zeroed stdout digest re-sealed reads UNMET REPRODUCE
    {
      const fx = fixture('d2');
      reseal(join(fx.receiptsDir, 'attest-run-2.txt'), (b) => { b.stdout_sha256 = '0'.repeat(64); });
      const r = run(verifyArgs(fx, ['--min-span-ms', '0']));
      pass('reproduce-miss', r.status === 1 && /UNMET reason=REPRODUCE/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 3 — exit miss: recorded exit flipped reads UNMET REPRODUCE
    {
      const fx = fixture('d3');
      reseal(join(fx.receiptsDir, 'attest-run-3.txt'), (b) => { b.exit = b.exit === 0 ? 1 : 0; });
      const r = run(verifyArgs(fx, ['--min-span-ms', '0']));
      pass('exit-miss', r.status === 1 && /UNMET reason=REPRODUCE/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 4 — nonce reused: one of the lane's own receipt nonces planted in the round-52 corpus reads UNMET NONCE_REUSED
    {
      const fx = fixture('d4', { reuseOwn: true });
      const r = run(verifyArgs(fx, ['--min-span-ms', '0']));
      pass('nonce-reused', r.status === 1 && /UNMET reason=NONCE_REUSED/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 5 — sweep no coverage: no prior corpora in the tree reads FAIL-CLOSED
    {
      const fx = fixture('d5', { priorDir: false });
      const r = run(verifyArgs(fx, ['--min-span-ms', '0']));
      pass('sweep-no-files', r.status === 2 && /FAIL-CLOSED reason=SWEEP_NO_FILES/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 6 — unparseable rev reads FAIL-CLOSED
    {
      const fx = fixture('d6');
      const r = run(verifyArgs(fx, ['--min-span-ms', '0']).map((a) => (a === fx.rev ? 'deadbeef'.repeat(5) : a)));
      pass('unparseable-rev', r.status === 2 && /FAIL-CLOSED/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 7 — sentinel miss: an expected nonce the sweep cannot find reads UNMET
    {
      const fx = fixture('d7');
      const r = run(verifyArgs(fx, ['--min-span-ms', '0', '--expect-sweep-nonce', 'f'.repeat(32)]));
      pass('sentinel-miss', r.status === 1 && /UNMET reason=SWEEP_SENTINEL_MISS/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 8 — span short: an impossible floor reads UNMET SPAN_SHORT
    {
      const fx = fixture('d8');
      const r = run(verifyArgs(fx, ['--min-span-ms', '999999999']));
      pass('span-short', r.status === 1 && /UNMET reason=SPAN_SHORT/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 9 — doctored prelude: sidecar-bound bytes rewritten read UNMET LEDGER
    {
      const fx = fixture('d9');
      const file = join(fx.receiptsDir, 'attest-run-1.txt');
      const text = readFileSync(file, 'utf8');
      writeFileSync(file, text.replace(/^run-at: [^\n]+/, 'run-at: 2030-01-01T00:00:00.000Z'));
      const r = run(verifyArgs(fx, ['--min-span-ms', '0']));
      pass('doctored-prelude', r.status === 1 && /UNMET reason=LEDGER/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
    // 10 — receipts dir unreadable: a missing directory is FAIL-CLOSED, never a score
    {
      const fx = fixture('d10');
      const r = run(['verify', '--lane', fx.dir, '--rev', fx.rev, '--receipts', join(fx.dir, 'no-such-dir'), '--min-span-ms', '0']);
      pass('receipts-unreadable', r.status === 2 && /FAIL-CLOSED reason=RECEIPTS_UNREADABLE/.test(last(r)),
        `exit=${r.status} last=${JSON.stringify(last(r))}`);
      rmSync(fx.dir, { recursive: true, force: true });
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const passed = results.filter((r) => r.ok).length;
  out(`RECEIPT_EVIDENCE_SELFTEST: PASS (${passed}/${results.length})\n`);
  out(`VERDICT: ${passed === results.length ? 'PASS' : 'FAIL'}\n`);
  process.exit(passed === results.length ? 0 : 1);
}

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) selftest();
if (argv[0] === 'verify') verify(argv.slice(1));
usage(`first argument ${JSON.stringify(argv[0])} is not a mode`);
