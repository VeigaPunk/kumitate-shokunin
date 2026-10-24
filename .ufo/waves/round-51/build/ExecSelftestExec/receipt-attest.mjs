#!/usr/bin/env node
/**
 * receipt-attest.mjs — capability `receipt-attest` (contract `kumitate-receipt-attest-v1`,
 * kumitate round 51).
 *
 * Turns an invocation record into a machine-checked object: `run` executes a command and writes a
 * receipt plus a GNU-format sidecar; `verify` recomputes the inner digest, the sidecar hash, the
 * clock ordering and (with `--ledger`) the nonce freshness of the record.
 *
 *   node scripts/receipt-attest.mjs run --out <base> -- <cmd...>
 *   node scripts/receipt-attest.mjs verify [--ledger <dir>] <file>
 *   node scripts/receipt-attest.mjs --selftest
 *
 * Verdicts (one line on stdout, exit code in parentheses):
 *   RECEIPT: VALID     (0)  — inner digest, sidecar hash and clock ordering agree; no nonce reuse.
 *   RECEIPT: REPLAY    (1)  — inner-digest mismatch, clock disorder, or a nonce reused by a different body.
 *   RECEIPT: TAMPERED  (1)  — the sidecar hash does not match the receipt bytes (or no sidecar exists).
 *   RECEIPT: UNREADABLE (2) — the receipt (or the ledger directory) could not be read.
 *   RECEIPT: USAGE     (64) — malformed argv.
 *
 * Receipt bytes = one display `run-at:` prelude line + one canonical-JSON line (recursive key sort).
 * The JSON line's `digest` field is sha256 over that same line with `digest` removed; it binds every
 * semantic field (nonce, argv, exit, stdout/stderr sha256, wall start/end, monotonic span). The
 * sidecar `<base>.txt.sha256` is GNU `sha256sum` text format over the exact receipt bytes, so the
 * prelude is covered as well — a receipt re-dated by rewriting only its `run-at:` prelude fails
 * verification. No environment is recorded and no secret material is stored: only stream hashes.
 *
 * Exit map: 0 valid · 1 replay/tampered · 2 unreadable · 64 usage. Fail-closed: any condition the
 * verifier cannot positively confirm is a non-zero verdict, never VALID.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-receipt-attest-v1';
const SELF = fileURLToPath(import.meta.url);
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

// ---------------------------------------------------------------- canonical JSON

const canonical = (v) => {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort()
      .map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
};

// ---------------------------------------------------------------- receipt writing

const SEMANTIC_FIELDS = ['argv', 'exit', 'mono_ns', 'nonce', 'stderr_sha256', 'stdout_sha256',
  'wall_end', 'wall_end_ms', 'wall_start', 'wall_start_ms'];

const digestOf = (body) => {
  const copy = { ...body };
  delete copy.digest;
  return sha256(Buffer.from(canonical(copy), 'utf8'));
};

const writeReceipt = (base, body) => {
  mkdirSync(dirname(base), { recursive: true });
  const obj = { ...body, digest: digestOf(body) };
  const bytes = Buffer.from(`run-at: ${body.wall_start}\n${canonical(obj)}\n`, 'utf8');
  const file = `${base}.txt`;
  const side = `${file}.sha256`;
  writeFileSync(file, bytes);
  writeFileSync(side, `${sha256(bytes)}  ${basename(file)}\n`);
  return { file, side, obj, bytes };
};

// ---------------------------------------------------------------- parsing / verification

const parseReceipt = (text) => {
  const lines = text.split('\n');
  let prelude = null;
  let json = null;
  for (const line of lines) {
    if (prelude === null && line.startsWith('run-at:')) { prelude = line.slice('run-at:'.length).trim(); continue; }
    if (json === null && line.trimStart().startsWith('{')) { json = line.trim(); }
  }
  if (json === null) return { ok: false, why: 'no-json-line' };
  let obj;
  try { obj = JSON.parse(json); } catch { return { ok: false, why: 'json-unparseable' }; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return { ok: false, why: 'json-not-object' };
  return { ok: true, prelude, obj };
};

const missingFields = (obj) => SEMANTIC_FIELDS.filter((f) => !(f in obj));

const clocksOrdered = (obj) => {
  const ws = Date.parse(obj.wall_start);
  const we = Date.parse(obj.wall_end);
  if (!Number.isFinite(ws) || !Number.isFinite(we)) return false;
  if (we < ws) return false;
  if (typeof obj.wall_end_ms === 'number' && typeof obj.wall_start_ms === 'number') {
    if (obj.wall_end_ms < obj.wall_start_ms) return false;
  }
  if (typeof obj.mono_ns === 'number' && obj.mono_ns < 0) return false;
  return true;
};

const verdict = (name, exit, reason) => {
  process.stdout.write(reason ? `RECEIPT: ${name} reason=${reason}\n` : `RECEIPT: ${name}\n`);
  process.exit(exit);
};

const sidecarHash = (file) => {
  const side = `${file}.sha256`;
  if (!existsSync(side)) return { ok: false, why: 'sidecar-missing' };
  let text;
  try { text = readFileSync(side, 'utf8'); } catch { return { ok: false, why: 'sidecar-unreadable' }; }
  const tok = text.trim().split(/\s+/)[0] || '';
  if (!/^[0-9a-f]{64}$/.test(tok)) return { ok: false, why: 'sidecar-malformed' };
  return { ok: true, hash: tok };
};

const ledgerReuse = (ledgerDir, targetPath, target) => {
  const resolvedTarget = resolve(targetPath);
  let names;
  try { names = readdirSync(ledgerDir); } catch { return { unreadable: true }; }
  for (const n of names) {
    if (!n.endsWith('.txt')) continue;
    const p = join(ledgerDir, n);
    try { if (!statSync(p).isFile()) continue; } catch { continue; }
    if (resolve(p) === resolvedTarget) continue;            // never the target itself
    let text;
    try { text = readFileSync(p, 'utf8'); } catch { continue; }
    const parsed = parseReceipt(text);
    if (!parsed.ok) continue;                              // unparseable entries are skipped, not fatal
    if (parsed.obj.nonce && parsed.obj.nonce === target.nonce && parsed.obj.digest !== target.digest) {
      return { reuse: true, by: n };
    }
  }
  return { reuse: false };
};

const cmdVerify = (argv) => {
  let ledger = null;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ledger') { ledger = argv[++i]; if (ledger === undefined) verdict('USAGE', 64, 'missing-ledger-dir'); continue; }
    if (a.startsWith('--ledger=')) { ledger = a.slice('--ledger='.length); continue; }
    if (a.startsWith('-')) verdict('USAGE', 64, `unknown-flag:${a}`);
    rest.push(a);
  }
  if (rest.length !== 1) verdict('USAGE', 64, 'expected-one-receipt-path');
  const file = rest[0];
  let bytes;
  try { bytes = readFileSync(file); } catch (e) { verdict('UNREADABLE', 2, `receipt-unreadable:${e.code || 'error'}`); }
  const parsed = parseReceipt(bytes.toString('utf8'));
  if (!parsed.ok) verdict('REPLAY', 1, parsed.why);
  const obj = parsed.obj;

  // 1. byte layer: the sidecar binds the WHOLE file, prelude included.
  const side = sidecarHash(file);
  if (!side.ok) {
    if (side.why === 'sidecar-unreadable') verdict('UNREADABLE', 2, side.why);
    verdict('TAMPERED', 1, side.why);
  }
  if (side.hash !== sha256(bytes)) verdict('TAMPERED', 1, 'sidecar-hash-mismatch');

  // 2. semantic layer: the inner digest binds every semantic field.
  const miss = missingFields(obj);
  if (miss.length) verdict('REPLAY', 1, `missing-fields:${miss.join('+')}`);
  if (typeof obj.digest !== 'string' || obj.digest !== digestOf(obj)) verdict('REPLAY', 1, 'inner-digest-mismatch');

  // 3. clock layer.
  if (!clocksOrdered(obj)) verdict('REPLAY', 1, 'clock-disorder');

  // 4. ledger layer: nonce freshness across a directory of receipts.
  if (ledger) {
    const r = ledgerReuse(ledger, file, obj);
    if (r.unreadable) verdict('UNREADABLE', 2, 'ledger-unreadable');
    if (r.reuse) verdict('REPLAY', 1, `nonce-reuse:${r.by}`);
  }
  verdict('VALID', 0, '');
};

// ---------------------------------------------------------------- run

const cmdRun = (argv) => {
  let out = null;
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') { out = argv[++i]; if (out === undefined) verdict('USAGE', 64, 'missing-out'); continue; }
    if (a.startsWith('--out=')) { out = a.slice('--out='.length); continue; }
    if (a === '--') { rest.push(...argv.slice(i + 1)); break; }
    rest.push(a);
  }
  if (!out) verdict('USAGE', 64, 'missing-out');
  if (!rest.length) verdict('USAGE', 64, 'missing-command');
  const t0 = process.hrtime.bigint();
  const w0 = Date.now();
  const child = spawnSync(rest[0], rest.slice(1), { encoding: 'buffer', maxBuffer: 64 << 20 });
  const t1 = process.hrtime.bigint();
  const w1 = Date.now();
  const body = {
    argv: rest.slice(),
    exit: child.status === null ? null : child.status,
    mono_ns: Number(t1 - t0),
    nonce: randomBytes(16).toString('hex'),
    stderr_sha256: sha256(child.stderr || Buffer.alloc(0)),
    stdout_sha256: sha256(child.stdout || Buffer.alloc(0)),
    wall_end: new Date(w1).toISOString(),
    wall_end_ms: w1,
    wall_start: new Date(w0).toISOString(),
    wall_start_ms: w0,
  };
  const { file } = writeReceipt(out, body);
  process.stdout.write(`RECEIPT: RECORDED ${file}\n`);
  process.exit(0);
};

// ---------------------------------------------------------------- selftest

const tool = (args) => {
  const r = spawnSync(process.execPath, [SELF, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const last = out.trim().split('\n').filter((l) => l.length).pop() || '';
  return { exit: r.status, verdict: last };
};

const FIXED_WALL = '2026-10-23T12:00:00.000Z';

const makeBody = (over = {}) => ({
  argv: ['/bin/echo', 'kumitate'],
  exit: 0,
  mono_ns: 1234567,
  nonce: randomBytes(16).toString('hex'),
  stderr_sha256: sha256(Buffer.alloc(0)),
  stdout_sha256: sha256(Buffer.from('kumitate\n')),
  wall_end: '2026-10-23T12:00:00.250Z',
  wall_end_ms: Date.parse('2026-10-23T12:00:00.250Z'),
  wall_start: FIXED_WALL,
  wall_start_ms: Date.parse(FIXED_WALL),
  ...over,
});

const selftest = () => {
  const dir = mkdtempSync(join(tmpdir(), 'attest-selftest.'));
  let n = 0;
  const results = [];
  const matches = (observed, expect) =>
    observed === expect || observed.startsWith(`${expect} `) || observed.startsWith(`${expect}:`);
  const check = (name, expect, expectExit, observed, detail) => {
    n += 1;
    const ok = matches(observed.verdict, expect) && observed.exit === expectExit;
    results.push({ name, ok, detail: detail || '' });
    process.stdout.write(`CASE ${String(n).padStart(2, '0')} ${name} ${ok ? 'PASS' : 'FAIL'} observed=${observed.verdict} exit=${observed.exit} ${detail || ''}\n`);
  };

  try {
    // --- fixtures ---------------------------------------------------------
    const f = join(dir, 'fx');
    writeReceipt(join(f, 'valid'), makeBody());
    const validPath = join(f, 'valid.txt');

    // flake-injection: a digest-bound field is doctored AFTER signing and the sidecar is then
    // re-signed over the doctored bytes, so the byte layer passes and the semantic layer must catch it.
    const flakeBase = join(f, 'flake');
    writeReceipt(flakeBase, makeBody());
    const flakePath = `${flakeBase}.txt`;
    const flakeObj = JSON.parse(readFileSync(flakePath, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{')));
    flakeObj.stdout_sha256 = sha256(Buffer.from('flaked\n'));
    const flakeBytes = Buffer.from(readFileSync(flakePath, 'utf8').replace(
      JSON.parse(readFileSync(flakePath, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{'))).stdout_sha256,
      flakeObj.stdout_sha256), 'utf8');
    writeFileSync(flakePath, flakeBytes);
    writeFileSync(`${flakePath}.sha256`, `${sha256(flakeBytes)}  ${basename(flakePath)}\n`);

    // sidecar-mismatch: receipt bytes doctored, the OLD sidecar retained.
    const tamBase = join(f, 'tampered');
    writeReceipt(tamBase, makeBody());
    const tamPath = `${tamBase}.txt`;
    writeFileSync(tamPath, readFileSync(tamPath, 'utf8').replace('"exit":0', '"exit":9'));

    // prelude-rewrite (the lesson-M2 move): only the `run-at:` line changes.
    const preBase = join(f, 'prelude');
    writeReceipt(preBase, makeBody());
    const prePath = `${preBase}.txt`;
    writeFileSync(prePath, readFileSync(prePath, 'utf8').replace(FIXED_WALL, '2026-10-23T13:00:00.000Z'));

    // clock disorder: digest and sidecar both correct, but wall_end < wall_start.
    writeReceipt(join(f, 'clock'), makeBody({
      wall_end: '2026-10-23T11:59:00.000Z',
      wall_end_ms: Date.parse('2026-10-23T11:59:00.000Z'),
    }));

    // ledger (reuse): two DIFFERENT bodies sharing one nonce — a replay.
    const ldReuse = join(dir, 'ledger-reuse');
    writeReceipt(join(ldReuse, 'a'), makeBody({ nonce: 'a'.repeat(32) }));
    writeReceipt(join(ldReuse, 'b'), makeBody({ nonce: 'a'.repeat(32), argv: ['/bin/echo', 'other'] }));

    // ledger (benign): one receipt plus a byte-identical copy of it — not a replay.
    const ldBenign = join(dir, 'ledger-benign');
    writeReceipt(join(ldBenign, 'a'), makeBody({ nonce: 'b'.repeat(32) }));
    const copyPath = join(ldBenign, 'a-copy.txt');
    writeFileSync(copyPath, readFileSync(join(ldBenign, 'a.txt')));
    writeFileSync(`${copyPath}.sha256`, readFileSync(join(ldBenign, 'a.txt.sha256')));

    // --- cases ------------------------------------------------------------
    check('run-roundtrip-valid', 'RECEIPT: VALID', 0, tool(['verify', validPath]), 'hand-built fixture verifies');
    check('flake-injection-replay', 'RECEIPT: REPLAY', 1, tool(['verify', flakePath]), 'doctored bound field, re-signed sidecar');
    check('sidecar-mismatch-tampered', 'RECEIPT: TAMPERED', 1, tool(['verify', tamPath]), 'doctored bytes, stale sidecar');
    check('prelude-rewrite-tampered', 'RECEIPT: TAMPERED', 1, tool(['verify', prePath]), 'lesson-M2 move: prelude only');
    check('clock-disorder-replay', 'RECEIPT: REPLAY', 1, tool(['verify', join(f, 'clock.txt')]), 'wall_end < wall_start');
    check('ledger-nonce-reuse-replay', 'RECEIPT: REPLAY', 1, tool(['verify', '--ledger', ldReuse, join(ldReuse, 'a.txt')]), 'same nonce, different body');
    check('ledger-benign-copy-valid', 'RECEIPT: VALID', 0, tool(['verify', '--ledger', ldBenign, join(ldBenign, 'a-copy.txt')]), 'byte-identical copy is not reuse');
    check('ledger-self-exclusion-valid', 'RECEIPT: VALID', 0, tool(['verify', '--ledger', ldBenign, join(ldBenign, 'a.txt')]), 'target excluded from its own ledger');
    check('usage-no-args', 'RECEIPT: USAGE', 64, tool([]), '');
    check('usage-verify-two-paths', 'RECEIPT: USAGE', 64, tool(['verify', validPath, validPath]), '');
    check('unreadable-receipt', 'RECEIPT: UNREADABLE', 2, tool(['verify', join(dir, 'nope.txt')]), '');

    // run/record mechanics
    const runOut = join(dir, 'run');
    const rc = tool(['run', '--out', runOut, '--', '/bin/sh', '-c', 'printf kumitate']);
    const recorded = existsSync(`${runOut}.txt`) && existsSync(`${runOut}.txt.sha256`);
    check('run-writes-receipt-and-sidecar', 'RECEIPT: RECORDED', 0, rc, `files=${recorded}`);
    const rv = tool(['verify', `${runOut}.txt`]);
    check('run-receipt-verifies-valid', 'RECEIPT: VALID', 0, rv, '');
    const runLine = readFileSync(`${runOut}.txt`, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{'));
    const rj = JSON.parse(runLine);
    check('run-records-argv', 'argv:ok', 0,
      { verdict: (rj.argv.join(' ') === '/bin/sh -c printf kumitate') ? 'argv:ok' : 'argv:bad', exit: 0 }, JSON.stringify(rj.argv));
    check('run-records-nonce-128bit-hex', 'nonce:ok', 0,
      { verdict: /^[0-9a-f]{32}$/.test(String(rj.nonce)) ? 'nonce:ok' : 'nonce:bad', exit: 0 }, String(rj.nonce));
    const sideText = readFileSync(`${runOut}.txt.sha256`, 'utf8');
    check('sidecar-is-gnu-sha256sum-format', 'sidecar:ok', 0,
      { verdict: /^[0-9a-f]{64}  \S+\n$/.test(sideText) ? 'sidecar:ok' : 'sidecar:bad', exit: 0 }, JSON.stringify(sideText));
    check('no-environment-recorded', 'env:ok', 0,
      { verdict: (Object.keys(rj).every((k) => !/env|path|token|secret/i.test(k))) ? 'env:ok' : 'env:bad', exit: 0 },
      Object.keys(rj).join(','));
    tool(['run', '--out', join(dir, 'run2'), '--', '/bin/sh', '-c', 'printf kumitate']);
    const rj2 = JSON.parse(readFileSync(join(dir, 'run2.txt'), 'utf8').split('\n').find((l) => l.trimStart().startsWith('{')));
    check('run-nonces-are-distinct', 'nonce:distinct', 0,
      { verdict: (rj.nonce !== rj2.nonce) ? 'nonce:distinct' : 'nonce:same', exit: 0 }, '');
    check('canonical-json-sorted-keys', 'canon:ok', 0, (() => {
      const keys = Object.keys(JSON.parse(runLine));
      return { verdict: (JSON.stringify(keys) === JSON.stringify([...keys].sort())) ? 'canon:ok' : 'canon:bad', exit: 0 };
    })(), '');
    check('inner-digest-binds-semantic-fields', 'digest:ok', 0, (() => {
      const o = JSON.parse(runLine);
      const copy = { ...o }; delete copy.digest;
      return { verdict: (sha256(Buffer.from(canonical(copy), 'utf8')) === o.digest) ? 'digest:ok' : 'digest:bad', exit: 0 };
    })(), '');
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  }

  const failed = results.filter((r) => !r.ok);
  process.stdout.write(`SELFTEST CASES: ${results.length} FAILED: ${failed.length}\n`);
  if (failed.length) {
    for (const f of failed) process.stdout.write(`FAILED ${f.name}\n`);
    process.stdout.write('ATTEST_SELFTEST: FAIL\n');
    process.exit(1);
  }
  process.stdout.write('ATTEST_SELFTEST: PASS\n');
  process.exit(0);
};

// ---------------------------------------------------------------- dispatch

const argv = process.argv.slice(2);
if (argv[0] === '--selftest') selftest();
else if (argv[0] === 'run') cmdRun(argv.slice(1));
else if (argv[0] === 'verify') cmdVerify(argv.slice(1));
else verdict('USAGE', 64, 'expected-run|verify|--selftest');
