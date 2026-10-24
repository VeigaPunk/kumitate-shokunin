#!/usr/bin/env node
/**
 * receipt-attest.mjs — kumitate round 51 instrument (contract kumitate-receipt-attest-v1).
 *
 *   node receipt-attest.mjs run --out <base> -- <cmd...>
 *   node receipt-attest.mjs verify [--ledger <dir>] <file>
 *   node receipt-attest.mjs --selftest
 *
 * SCRATCH REFERENCE COPY for the MutInstrument mutation battery (round 51, wave 1).
 * Written from plan.md §C1 + probe/attest51-probe.mjs; the shipped copy is
 * build/ExecInstrument/receipt-attest.mjs.
 */
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync, readFileSync, writeFileSync, readdirSync, existsSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const VERDICT_VALID = 'RECEIPT: VALID';
const VERDICT_REPLAY = 'RECEIPT: REPLAY';
const VERDICT_TAMPERED = 'RECEIPT: TAMPERED';
const EXIT_FINDING = 1;
const EXIT_UNREADABLE = 2;
const EXIT_USAGE = 64;

const BOUND_FIELDS = [
  'argv', 'exit', 'mono_ns', 'nonce', 'stderr_sha256', 'stdout_sha256',
  'wall_end', 'wall_start',
];

const sha256hex = (data) => createHash('sha256').update(data).digest('hex');

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

/** sha256 over the canonical JSON of the bound semantic fields (digest excluded). */
function computeDigest(record) {
  const bound = {};
  for (const field of BOUND_FIELDS) bound[field] = record[field];
  return sha256hex(canonicalJson(bound));
}

function buildRecord(argv, exitCode, stdoutBuf, stderrBuf, wallStart, wallEnd, monoNs) {
  return {
    argv,
    exit: exitCode,
    wall_start: wallStart,
    wall_end: wallEnd,
    nonce: randomBytes(16).toString('hex'),
    mono_ns: String(monoNs),
    stdout_sha256: sha256hex(stdoutBuf),
    stderr_sha256: sha256hex(stderrBuf),
  };
}

function receiptBytes(record) {
  const body = canonicalJson({ ...record, digest: computeDigest(record) });
  return `run-at: ${record.wall_start}\n${body}\n`;
}

function sidecarBytes(receiptText, receiptPath) {
  return `${sha256hex(receiptText)}  ${basename(receiptPath)}\n`;
}

function parseReceipt(text) {
  const lines = text.split('\n');
  const bodyLine = lines.find((l) => l.trimStart().startsWith('{'));
  if (!bodyLine) return null;
  try {
    return JSON.parse(bodyLine);
  } catch {
    return null;
  }
}

/**
 * Core verification. Returns { verdict, code, detail }.
 * Check order (contract): inner digest -> sidecar -> clock ordering -> nonce ledger.
 */
function verifyReceipt(receiptPath, ledgerDir) {
  let text;
  try {
    text = readFileSync(receiptPath, 'utf8');
  } catch (e) {
    return { verdict: 'RECEIPT: UNREADABLE', code: EXIT_UNREADABLE, detail: e.message };
  }
  const record = parseReceipt(text);
  if (!record) {
    return { verdict: 'RECEIPT: UNREADABLE', code: EXIT_UNREADABLE, detail: 'unparseable receipt body' };
  }

  // 1. inner digest over the bound semantic fields
  if (computeDigest(record) !== record.digest) {
    return { verdict: VERDICT_REPLAY, code: EXIT_FINDING, detail: 'inner digest mismatch' };
  }

  // 2. sidecar covers the exact receipt bytes (prelude included)
  const sidecarPath = `${receiptPath}.sha256`;
  if (!existsSync(sidecarPath)) {
    return { verdict: VERDICT_TAMPERED, code: EXIT_FINDING, detail: 'sidecar missing' };
  }
  const sidecar = readFileSync(sidecarPath, 'utf8').trim().split(/\s+/)[0];
  if (sidecar !== sha256hex(text)) {
    return { verdict: VERDICT_TAMPERED, code: EXIT_FINDING, detail: 'sidecar mismatch' };
  }

  // 3. clock ordering
  const start = Date.parse(record.wall_start);
  const end = Date.parse(record.wall_end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return { verdict: VERDICT_REPLAY, code: EXIT_FINDING, detail: 'wall clock ordering' };
  }
  if (!/^-?\d+$/.test(String(record.mono_ns)) || BigInt(record.mono_ns) < 0n) {
    return { verdict: VERDICT_REPLAY, code: EXIT_FINDING, detail: 'monotonic span' };
  }

  // 4. nonce ledger: another receipt may not bind this nonce to a DIFFERENT record digest.
  //    Byte-identical duplicates (same digest) are exempt — the A3 doctored control lives
  //    beside run-2 in the same directory and carries run-2's exact nonce.
  if (ledgerDir) {
    for (const name of readdirSync(ledgerDir).sort()) {
      if (!name.endsWith('.txt')) continue;
      const otherPath = join(ledgerDir, name);
      if (otherPath === receiptPath) continue;
      const other = parseReceipt(readFileSync(otherPath, 'utf8'));
      if (!other) continue;
      if (other.nonce === record.nonce && other.digest !== record.digest) {
        return { verdict: VERDICT_REPLAY, code: EXIT_FINDING, detail: 'nonce reuse' };
      }
    }
  }

  return { verdict: VERDICT_VALID, code: 0, detail: 'ok' };
}

function emit(result) {
  process.stdout.write(`${result.verdict}\n`);
  return result.code;
}

function cmdRun(rest) {
  const sep = rest.indexOf('--');
  const outIdx = rest.indexOf('--out');
  if (sep < 0 || outIdx < 0 || outIdx + 1 >= sep || sep + 1 >= rest.length) {
    process.stderr.write('USAGE: run --out <base> -- <cmd...>\n');
    return EXIT_USAGE;
  }
  const base = rest[outIdx + 1];
  const cmd = rest.slice(sep + 1);
  const wallStart = new Date().toISOString();
  const t0 = process.hrtime.bigint();
  const res = spawnSync(cmd[0], cmd.slice(1), { encoding: 'buffer', maxBuffer: 64 << 20 });
  const t1 = process.hrtime.bigint();
  const wallEnd = new Date().toISOString();
  const record = buildRecord(
    cmd, res.status === null ? -1 : res.status,
    res.stdout ?? Buffer.alloc(0), res.stderr ?? Buffer.alloc(0),
    wallStart, wallEnd, (t1 - t0).toString(),
  );
  const text = receiptBytes(record);
  const receiptPath = `${base}.txt`;
  writeFileSync(receiptPath, text);
  writeFileSync(`${base}.txt.sha256`, sidecarBytes(text, receiptPath));
  process.stdout.write(`${VERDICT_VALID}\n`);
  return 0;
}

function cmdVerify(rest) {
  let ledgerDir = null;
  const args = [];
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === '--ledger') {
      ledgerDir = rest[i + 1];
      i += 1;
    } else {
      args.push(rest[i]);
    }
  }
  if (args.length !== 1) {
    process.stderr.write('USAGE: verify [--ledger <dir>] <file>\n');
    return EXIT_USAGE;
  }
  return emit(verifyReceipt(args[0], ledgerDir));
}

/* ------------------------------ selftest ------------------------------ */

function selftest() {
  const dir = mkdtempSync(join(tmpdir(), 'attest-selftest-'));
  const results = [];
  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    process.stdout.write(`CASE ${name}: ${ok ? 'PASS' : 'FAIL'} ${detail}\n`);
  };

  const write = (name, record, opts = {}) => {
    const p = join(dir, name);
    const text = opts.raw ?? receiptBytes(record);
    writeFileSync(p, text);
    if (opts.sidecar !== false) {
      writeFileSync(`${p}.sha256`, opts.sidecar ?? sidecarBytes(text, p));
    }
    return p;
  };

  const mk = (over = {}) => {
    const rec = {
      argv: ['/bin/true'],
      exit: 0,
      wall_start: '2026-10-23T10:00:00.000Z',
      wall_end: '2026-10-23T10:00:01.000Z',
      nonce: 'a'.repeat(32),
      mono_ns: '1000000',
      stdout_sha256: sha256hex(''),
      stderr_sha256: sha256hex(''),
      ...over,
    };
    return rec;
  };

  /** doctor a field WITHOUT recomputing the inner digest: the digest must catch it. */
  const doctor = (rec, field, value) => {
    const copy = { ...rec, [field]: value };
    const body = canonicalJson({ ...copy, digest: computeDigest(rec) });
    return `run-at: ${copy.wall_start}\n${body}\n`;
  };

  // 1 round trip
  {
    const rec = mk();
    const p = write('roundtrip.txt', rec);
    const r = verifyReceipt(p, null);
    check('roundtrip-valid', r.verdict === 'RECEIPT: VALID' && r.code === 0, r.verdict);
  }
  // 2 sidecar is GNU sha256sum format and sha256sum -c accepts it
  {
    const rec = mk();
    const p = write('sidecar.txt', rec);
    const raw = readFileSync(`${p}.sha256`, 'utf8');
    const fmtOk = /^[0-9a-f]{64}  .+\n$/.test(raw);
    const chk = spawnSync('sha256sum', ['-c', `${p}.sha256`], { cwd: dir, encoding: 'utf8' });
    check('sidecar-gnu-format', fmtOk && chk.status === 0, `fmt=${fmtOk} sha256sum-c=${chk.status}`);
  }
  // 3..11 inner digest binds each semantic field
  const boundCases = [
    ['digest-binds-argv', 'argv', ['/bin/false']],
    ['digest-binds-exit', 'exit', 7],
    ['digest-binds-nonce', 'nonce', 'b'.repeat(32)],
    ['digest-binds-stdout', 'stdout_sha256', 'c'.repeat(64)],
    ['digest-binds-stderr', 'stderr_sha256', 'd'.repeat(64)],
    ['digest-binds-wall-start', 'wall_start', '2026-10-23T10:00:00.500Z'],
    ['digest-binds-wall-end', 'wall_end', '2026-10-23T10:00:01.500Z'],
    ['digest-binds-mono', 'mono_ns', '999'],
  ];
  for (const [name, field, value] of boundCases) {
    const rec = mk();
    const p = write(`${name}.txt`, rec);
    writeFileSync(p, doctor(rec, field, value));
    writeFileSync(`${p}.sha256`, sidecarBytes(readFileSync(p, 'utf8'), p));
    const r = verifyReceipt(p, null);
    check(name, r.verdict === 'RECEIPT: REPLAY' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 12 flake injection: a doctored wall clock with a regenerated sidecar must read REPLAY
  {
    const rec = mk();
    const p = write('flake.txt', rec);
    writeFileSync(p, doctor(rec, 'wall_start', '1970-01-01T00:00:00.000Z'));
    writeFileSync(`${p}.sha256`, sidecarBytes(readFileSync(p, 'utf8'), p));
    const r = verifyReceipt(p, null);
    check('flake-injection-replay', r.verdict === 'RECEIPT: REPLAY' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 13 sidecar mismatch -> TAMPERED
  {
    const rec = mk();
    const p = write('sidecar-mismatch.txt', rec);
    writeFileSync(`${p}.sha256`, `${'0'.repeat(64)}  sidecar-mismatch.txt\n`);
    const r = verifyReceipt(p, null);
    check('sidecar-mismatch-tampered', r.verdict === 'RECEIPT: TAMPERED' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 14 missing sidecar -> TAMPERED
  {
    const rec = mk();
    const p = write('sidecar-missing.txt', rec, { sidecar: false });
    const r = verifyReceipt(p, null);
    check('sidecar-missing-tampered', r.verdict === 'RECEIPT: TAMPERED' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 15 the lesson-M2 forgery: prelude rewritten, sidecar untouched -> TAMPERED
  {
    const rec = mk();
    const p = write('prelude-forgery.txt', rec);
    const text = readFileSync(p, 'utf8').replace(/^run-at: .*$/m, 'run-at: 2026-10-23T12:00:00.000Z');
    writeFileSync(p, text);
    const r = verifyReceipt(p, null);
    check('prelude-only-forgery-tampered', r.verdict === 'RECEIPT: TAMPERED' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 16 nonce reuse in the ledger (same nonce, DIFFERENT record digest) -> REPLAY
  {
    const rec = mk();
    const p = write('ledger-a.txt', rec);
    const p2 = write('ledger-b.txt', mk({ exit: 3 }));
    const r = verifyReceipt(p2, dir);
    check('ledger-nonce-reuse-replay', r.verdict === 'RECEIPT: REPLAY' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 17 distinct nonces in the ledger -> VALID
  {
    const rec = mk();
    const rec2 = mk({ nonce: 'e'.repeat(32) });
    const p = write('distinct-a.txt', rec);
    const p2 = write('distinct-b.txt', rec2);
    const r = verifyReceipt(p2, dir);
    check('ledger-distinct-valid', r.verdict === 'RECEIPT: VALID' && r.code === 0, `${r.verdict} ${r.detail}`);
  }
  // 17b a byte-identical duplicate (same nonce AND same digest) is EXEMPT -> VALID
  //     (the A3 doctored control lives beside run-2 and carries run-2's exact nonce)
  {
    const rec = mk({ nonce: 'ee'.repeat(16) });
    const p = write('dup-a.txt', rec);
    const p2 = write('dup-b.txt', rec);
    const r = verifyReceipt(p2, dir);
    check('ledger-same-digest-exempt', r.verdict === 'RECEIPT: VALID' && r.code === 0, `${r.verdict} ${r.detail}`);
  }
  // 18 clock ordering violation -> REPLAY
  {
    const rec = mk({ wall_start: '2026-10-23T10:00:05.000Z', wall_end: '2026-10-23T10:00:01.000Z' });
    const p = write('clock-order.txt', rec);
    const r = verifyReceipt(p, null);
    check('clock-order-violation-replay', r.verdict === 'RECEIPT: REPLAY' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 19 negative monotonic span -> REPLAY
  {
    const rec = mk({ mono_ns: '-1' });
    const p = write('mono-negative.txt', rec);
    const r = verifyReceipt(p, null);
    check('mono-negative-replay', r.verdict === 'RECEIPT: REPLAY' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 20 the receipt carries no environment material and only the bound fields
  {
    const rec = mk();
    const p = write('no-env.txt', rec);
    const parsed = parseReceipt(readFileSync(p, 'utf8'));
    const keys = Object.keys(parsed).sort();
    const expected = [...BOUND_FIELDS, 'digest'].sort();
    const secret = 'SUPER_SECRET_TOKEN_VALUE';
    process.env.ATTEST_SELFTEST_SECRET = secret;
    const res = spawnSync(process.execPath, ['-e', 'process.stdout.write("")'], { encoding: 'utf8', env: process.env });
    delete process.env.ATTEST_SELFTEST_SECRET;
    const text = readFileSync(p, 'utf8');
    check('no-env-in-receipt', JSON.stringify(keys) === JSON.stringify(expected) && !text.includes(secret) && res.status === 0, keys.join(','));
  }
  // 21 canonical JSON: the body line is written with sorted keys, checked against an
  //    independent canonicalizer (not the implementation's own) so a sorting mutant dies here.
  {
    const rec = mk();
    const p = write('canonical.txt', rec);
    const body = readFileSync(p, 'utf8').split('\n').find((l) => l.startsWith('{'));
    const parsed = JSON.parse(body);
    const independent = (v) => {
      if (v === null || typeof v !== 'object') return JSON.stringify(v);
      if (Array.isArray(v)) return `[${v.map(independent).join(',')}]`;
      const ks = Object.keys(v).sort();
      return `{${ks.map((k) => `${JSON.stringify(k)}:${independent(v[k])}`).join(',')}}`;
    };
    const sorted = JSON.stringify(Object.keys(parsed).sort()) === JSON.stringify(Object.keys(parsed));
    check('canonical-json-sorted', body === independent(parsed) && sorted, body === independent(parsed) ? 'stable' : 'drift');
  }
  // 22 the shipped exit code of a failing command is recorded in the receipt
  {
    const out = join(dir, 'exit3');
    const res = spawnSync(process.execPath, [join(import.meta.dirname, 'receipt-attest.mjs'), 'run', '--out', out, '--', '/bin/sh', '-c', 'exit 3'], { encoding: 'utf8' });
    const parsed = parseReceipt(readFileSync(`${out}.txt`, 'utf8'));
    check('exit-code-recorded', res.status === 0 && parsed.exit === 3 && parsed.argv.length === 3, `exit=${parsed.exit}`);
  }
  // 23 an unreadable receipt exits 2
  {
    const r = verifyReceipt(join(dir, 'does-not-exist.txt'), null);
    check('unreadable-exit-2', r.code === 2, `code=${r.code}`);
  }

  /* ---- CLI-level cases: exercise the shipped stdout/exit-code surface ---- */
  const SELF = new URL(import.meta.url).pathname;
  const cli = (args) => {
    const r = spawnSync(process.execPath, [SELF, ...args], { encoding: 'utf8' });
    const lines = `${r.stdout || ''}`.trim().split('\n').filter(Boolean);
    return { status: r.status, stdout: r.stdout || '', last: lines[lines.length - 1] || '' };
  };
  // 24 CLI verify of a genuine receipt: stdout says VALID, exit 0
  {
    const rec = mk({ nonce: '1'.repeat(32) });
    const p = write('cli-valid.txt', rec);
    const r = cli(['verify', p]);
    check('cli-verify-valid', r.status === 0 && r.last === 'RECEIPT: VALID', `exit=${r.status} last=${JSON.stringify(r.last)}`);
  }
  // 25 CLI verify of a doctored receipt: stdout says REPLAY, exit 1
  {
    const rec = mk({ nonce: '2'.repeat(32) });
    const p = write('cli-replay.txt', rec);
    writeFileSync(p, doctor(rec, 'exit', 9));
    writeFileSync(`${p}.sha256`, sidecarBytes(readFileSync(p, 'utf8'), p));
    const r = cli(['verify', p]);
    check('cli-verify-replay', r.status === 1 && r.last === 'RECEIPT: REPLAY', `exit=${r.status} last=${JSON.stringify(r.last)}`);
  }
  // 26 CLI verify of a sidecar-broken receipt: stdout says TAMPERED, exit 1
  {
    const rec = mk({ nonce: '3'.repeat(32) });
    const p = write('cli-tampered.txt', rec);
    writeFileSync(`${p}.sha256`, `${'f'.repeat(64)}  cli-tampered.txt\n`);
    const r = cli(['verify', p]);
    check('cli-verify-tampered', r.status === 1 && r.last === 'RECEIPT: TAMPERED', `exit=${r.status} last=${JSON.stringify(r.last)}`);
  }
  // 27 CLI verify with --ledger detects nonce reuse across files: REPLAY, exit 1
  {
    const rec = mk({ nonce: '4'.repeat(16) });
    const p = write('cli-ledger-a.txt', rec);
    const p2 = write('cli-ledger-b.txt', mk({ nonce: '4'.repeat(16), exit: 9 }));
    const r = cli(['verify', '--ledger', dir, p2]);
    check('cli-ledger-replay', r.status === 1 && r.last === 'RECEIPT: REPLAY', `exit=${r.status} last=${JSON.stringify(r.last)}`);
  }
  // 28 CLI usage errors exit 64
  {
    const r = cli(['verify']);
    const r2 = cli(['nonsense']);
    check('cli-usage-64', r.status === 64 && r2.status === 64, `verify=${r.status} nonsense=${r2.status}`);
  }
  // 29 the inner digest is a sha256 (64 hex chars), not a shorter hash
  {
    const rec = mk();
    const p = write('digest-width.txt', rec);
    const parsed = parseReceipt(readFileSync(p, 'utf8'));
    check('digest-is-sha256-width', /^[0-9a-f]{64}$/.test(String(parsed.digest)), `len=${String(parsed.digest).length}`);
  }
  // 30 the nonce is 128 bits (32 hex chars)
  {
    const rec = mk();
    const p = write('nonce-width.txt', rec);
    const parsed = parseReceipt(readFileSync(p, 'utf8'));
    check('nonce-is-128-bit', /^[0-9a-f]{32}$/.test(String(parsed.nonce)), `len=${String(parsed.nonce).length}`);
  }
  // 31 (removed: a tautological distinct-nonce case over hand-built fixtures — the real
  //     coverage is case 34, which mints nonces through two actual runs)
  // 32 a sidecar sharing the first 16 hex chars but differing later must read TAMPERED
  {
    const rec = mk({ nonce: 'b1'.repeat(16) });
    const p = write('sidecar-prefix.txt', rec);
    const real = sha256hex(readFileSync(p, 'utf8'));
    const near = `${real.slice(0, 16)}${'0'.repeat(48)}`;
    writeFileSync(`${p}.sha256`, `${near}  sidecar-prefix.txt\n`);
    const r = verifyReceipt(p, null);
    check('sidecar-prefix-collision-tampered', r.verdict === 'RECEIPT: TAMPERED' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 33 two nonces sharing a prefix but differing later are DISTINCT (not reuse)
  {
    const rec = mk({ nonce: `c0c0c0c0${'0'.repeat(24)}` });
    const rec2 = mk({ nonce: `c0c0c0c0${'1'.repeat(24)}` });
    const p = write('prefix-a.txt', rec);
    const p2 = write('prefix-b.txt', rec2);
    const r = verifyReceipt(p2, dir);
    check('nonce-prefix-not-reuse', r.verdict === 'RECEIPT: VALID' && r.code === 0, `${r.verdict} ${r.detail}`);
  }
  // 34 a receipt that REUSES a nonce but differs in another field must still read REPLAY
  {
    const rec = mk({ nonce: 'd1'.repeat(16) });
    const p = write('reuse-a.txt', rec);
    const p2 = write('reuse-b.txt', mk({ nonce: 'd1'.repeat(16), exit: 5 }));
    const r = verifyReceipt(p2, dir);
    check('ledger-nonce-reuse-forgery-replay', r.verdict === 'RECEIPT: REPLAY' && r.code === 1, `${r.verdict} ${r.detail}`);
  }
  // 34b the A4c shape: a same-nonce / different-digest twin with a recomputed inner digest
  //      and a recomputed sidecar is VALID alone, but the ledger over {original, twin}
  //      must answer REPLAY for BOTH files.
  {
    const rec = mk({ nonce: 'd2'.repeat(16) });
    const p = write('twin-orig.txt', rec);
    const twinRec = { ...rec, argv: [...rec.argv, 'a4c-evil-append'] };
    const p2 = write('twin-forged.txt', twinRec);
    const r = verifyReceipt(p2, dir);
    const rOrig = verifyReceipt(p, dir);
    check('twin-ledger-replay-both',
      r.verdict === 'RECEIPT: REPLAY' && rOrig.verdict === 'RECEIPT: REPLAY'
      && r.code === 1 && rOrig.code === 1,
      `twin=${r.verdict} orig=${rOrig.verdict}`);
  }
  // 35 two nonces sharing a SUFFIX but differing earlier are DISTINCT (not reuse)
  {
    const rec = mk({ nonce: `${'0'.repeat(24)}abcd` });
    const rec2 = mk({ nonce: `${'1'.repeat(24)}abcd` });
    const p = write('suffix-a.txt', rec);
    const p2 = write('suffix-b.txt', rec2);
    const r = verifyReceipt(p2, dir);
    check('nonce-suffix-not-reuse', r.verdict === 'RECEIPT: VALID' && r.code === 0, `${r.verdict} ${r.detail}`);
  }
  // 35 two real runs mint two different 128-bit nonces (a fixed or short nonce is caught)
  {
    const o1 = join(dir, 'runA');
    const o2 = join(dir, 'runB');
    const r1 = spawnSync(process.execPath, [SELF, 'run', '--out', o1, '--', '/bin/sh', '-c', 'printf a'], { encoding: 'utf8' });
    const r2 = spawnSync(process.execPath, [SELF, 'run', '--out', o2, '--', '/bin/sh', '-c', 'printf b'], { encoding: 'utf8' });
    const n1 = r1.status === 0 ? parseReceipt(readFileSync(`${o1}.txt`, 'utf8')).nonce : null;
    const n2 = r2.status === 0 ? parseReceipt(readFileSync(`${o2}.txt`, 'utf8')).nonce : null;
    const ok = n1 && n2 && n1 !== n2 && /^[0-9a-f]{32}$/.test(n1) && /^[0-9a-f]{32}$/.test(n2);
    check('runs-mint-distinct-128-bit-nonces', Boolean(ok), `${String(n1).slice(0, 12)} vs ${String(n2).slice(0, 12)}`);
  }

  const failed = results.filter((r) => !r.ok);
  process.stdout.write(`ATTEST_CASES: ${results.length - failed.length}/${results.length}\n`);
  process.stdout.write(failed.length === 0 ? 'ATTEST_SELFTEST: PASS\n' : 'ATTEST_SELFTEST: FAIL\n');
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  return failed.length === 0 ? 0 : 1;
}

/* -------------------------------- main -------------------------------- */

const argv = process.argv.slice(2);
const cmd = argv[0];
if (cmd === '--selftest') {
  process.exit(selftest());
} else if (cmd === 'run') {
  process.exit(cmdRun(argv.slice(1)));
} else if (cmd === 'verify') {
  process.exit(cmdVerify(argv.slice(1)));
} else {
  process.stderr.write('USAGE: receipt-attest.mjs run|verify|--selftest\n');
  process.exit(EXIT_USAGE);
}
