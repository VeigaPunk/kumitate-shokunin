#!/usr/bin/env node
/**
 * receipt-attest.mjs — SCRATCH REFERENCE implementation of contract `kumitate-receipt-attest-v1`.
 *
 * Seat ExecSelftestArms (round 51 wave 1). This file is NOT the shipped instrument — it is the
 * independent oracle the seat's own case list (build/ExecSelftestArms/selftest-plan.md) is run
 * against while build/ExecInstrument/receipt-attest.mjs does not yet exist. It exists so the
 * case list is executable, not merely prose. The shipped instrument is ExecInstrument's file.
 *
 *   node receipt-attest.mjs run --out <base> -- <cmd...>
 *   node receipt-attest.mjs verify [--ledger <dir>] <file>
 *   node receipt-attest.mjs --selftest
 *
 * Receipt bytes = a display `run-at:` prelude line + one canonical-JSON line (recursively
 * sorted keys). The JSON's `digest` field = sha256 over the canonical JSON of the object with
 * `digest` removed, i.e. it binds nonce, argv, exit, stdout/stderr sha256, wall_start,
 * wall_end and mono_ns. The sidecar `<base>.txt.sha256` is GNU `sha256sum` text format over
 * the exact receipt bytes (so it covers the prelude too).
 *
 * Verdicts (last line of stdout):
 *   RECEIPT: VALID     exit 0
 *   RECEIPT: REPLAY    exit 1   inner-digest mismatch | nonce reuse | clock contradiction
 *   RECEIPT: TAMPERED  exit 1   sidecar missing or mismatching
 *   usage              exit 64
 *   unreadable         exit 2
 *
 * Check order is inner-digest FIRST, then sidecar, then clocks, then ledger: the inner digest
 * is the semantic binding, so a doctored semantic field reads REPLAY even when the sidecar
 * also no longer matches. (ExecSelftestArms AMBIGUITY-1 in the case list.)
 *
 * No environment is recorded: receipts carry no secret material (Q42 class).
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-receipt-attest-v1';
const SELF = fileURLToPath(import.meta.url);
const sha256 = (b) => createHash('sha256').update(b).digest('hex');

const canonical = (v) => {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canonical(v[k]);
    return o;
  }
  return v;
};
const canonLine = (obj) => JSON.stringify(canonical(obj));

/** sha256 over the canonical JSON of the object with `digest` removed. */
const digestOf = (obj) => {
  const c = { ...obj };
  delete c.digest;
  return sha256(Buffer.from(canonLine(c), 'utf8'));
};

const usage = (why) => {
  process.stderr.write(
    `RECEIPT_ATTEST: USAGE ${why || ''} (contract ${CONTRACT}: run --out <base> -- <cmd...> | verify [--ledger <dir>] <file> | --selftest)\n`);
  process.exit(64);
};

const emit = (line) => { process.stdout.write(`${line}\n`); };

/* ------------------------------------------------------------------ run */

function cmdRun(args) {
  let out = null;
  let i = 0;
  for (; i < args.length; i++) {
    const a = args[i];
    if (a === '--out') { out = args[i + 1]; i++; continue; }
    if (a === '--') { i++; break; }
    usage(`unexpected ${a}`);
  }
  const cmd = args.slice(i);
  if (!out) usage('missing --out <base>');
  if (!cmd.length) usage('missing command after --');

  const nonce = randomBytes(16).toString('hex');
  const wall_start = new Date().toISOString();
  const t0 = process.hrtime.bigint();
  const res = spawnSync(cmd[0], cmd.slice(1), { encoding: 'buffer', maxBuffer: 64 << 20 });
  const t1 = process.hrtime.bigint();
  const wall_end = new Date().toISOString();

  const stdout = res.stdout || Buffer.alloc(0);
  const stderr = res.stderr || Buffer.alloc(0);
  const exit = typeof res.status === 'number' ? res.status : 128;

  const body = {
    argv: cmd,
    exit,
    mono_ns: Number(t1 - t0),
    nonce,
    stderr_sha256: sha256(stderr),
    stdout_sha256: sha256(stdout),
    wall_end,
    wall_start,
  };
  body.digest = digestOf(body);

  const receipt = `run-at: ${wall_start}\n${canonLine(body)}\n`;
  const txt = `${out}.txt`;
  writeFileSync(txt, receipt);
  writeFileSync(`${txt}.sha256`, `${sha256(Buffer.from(receipt, 'utf8'))}  ${basename(txt)}\n`);
  emit(`RECEIPT: WRITTEN ${txt}`);
  process.exit(0);
}

/* ---------------------------------------------------------------- verify */

function parseReceipt(text) {
  const line = text.split('\n').find((l) => l.trimStart().startsWith('{'));
  if (!line) return null;
  try { return JSON.parse(line); } catch { return null; }
}

function cmdVerify(args) {
  let ledger = null;
  let file = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--ledger') { ledger = args[i + 1]; i++; continue; }
    if (a.startsWith('--')) usage(`unexpected ${a}`);
    if (file) usage('more than one receipt file');
    file = a;
  }
  if (!file) usage('missing receipt file');

  let bytes;
  try { bytes = readFileSync(file); } catch (e) {
    process.stderr.write(`RECEIPT: UNREADABLE ${file} (${e.code || e.message})\n`);
    process.exit(2);
  }
  const obj = parseReceipt(bytes.toString('utf8'));
  if (!obj || typeof obj !== 'object') {
    process.stderr.write(`RECEIPT: UNREADABLE ${file} (no parseable JSON line)\n`);
    process.exit(2);
  }

  // 1. inner digest (semantic binding)
  if (digestOf(obj) !== obj.digest) { emit('RECEIPT: REPLAY'); process.exit(1); }

  // 2. sidecar over the exact receipt bytes (covers the prelude)
  const sidePath = `${file}.sha256`;
  if (!existsSync(sidePath)) { emit('RECEIPT: TAMPERED'); process.exit(1); }
  let side;
  try { side = readFileSync(sidePath, 'utf8').trim().split(/\s+/)[0]; } catch { side = ''; }
  if (side !== sha256(bytes)) { emit('RECEIPT: TAMPERED'); process.exit(1); }

  // 3. clock ordering
  const ws = Date.parse(obj.wall_start);
  const we = Date.parse(obj.wall_end);
  if (!(Number.isFinite(ws) && Number.isFinite(we)) || we < ws || !(Number(obj.mono_ns) >= 0)) {
    emit('RECEIPT: REPLAY');
    process.exit(1);
  }

  // 4. ledger: no nonce reuse among the other *.txt receipts in <dir>
  if (ledger) {
    const mine = basename(file);
    let entries = [];
    try { entries = readdirSync(ledger); } catch { entries = []; }
    for (const e of entries) {
      if (!e.endsWith('.txt')) continue;
      if (basename(e) === mine) continue;
      let other;
      try { other = parseReceipt(readFileSync(join(ledger, e), 'utf8')); } catch { continue; }
      if (!other || typeof other !== 'object') continue;
      if (other.nonce && other.nonce === obj.nonce) { emit('RECEIPT: REPLAY'); process.exit(1); }
    }
  }

  emit('RECEIPT: VALID');
  process.exit(0);
}

/* -------------------------------------------------------------- selftest */

function selftest() {
  const t = mkdtempSync(join(tmpdir(), 'attest-selftest.'));
  const cases = [];
  const caseOf = (name, fn) => cases.push({ name, fn });

  const mk = (base) => {
    const r = spawnSync(process.execPath, [SELF, 'run', '--out', join(t, base), '--', '/bin/sh', '-c', 'printf hello'],
      { encoding: 'utf8' });
    return { r, txt: join(t, `${base}.txt`), side: join(t, `${base}.txt.sha256`) };
  };

  caseOf('healthy-run-valid', () => {
    const { r, txt } = mk('s1');
    if (r.status !== 0) return 'run failed';
    const v = spawnSync(process.execPath, [SELF, 'verify', txt], { encoding: 'utf8' });
    return v.status === 0 && /RECEIPT: VALID/.test(v.stdout) ? null : `verify status=${v.status}`;
  });

  caseOf('sidecar-gnu-format', () => {
    const { txt } = mk('s2');
    const side = readFileSync(`${txt}.sha256`, 'utf8');
    if (!/^[0-9a-f]{64} [ *].+\n$/.test(side)) return `sidecar format: ${JSON.stringify(side)}`;
    return null;
  });

  caseOf('distinct-nonces', () => {
    const a = mk('s3a'); const b = mk('s3b');
    const na = parseReceipt(readFileSync(a.txt, 'utf8')).nonce;
    const nb = parseReceipt(readFileSync(b.txt, 'utf8')).nonce;
    return na !== nb ? null : 'nonce repeated';
  });

  caseOf('flake-injection-replay', () => {
    const { txt } = mk('s4');
    const raw = readFileSync(txt, 'utf8');
    const obj = parseReceipt(raw);
    const doctored = { ...obj };
    doctored.nonce = doctored.nonce.slice(0, -1) + (doctored.nonce.slice(-1) === 'a' ? 'b' : 'a');
    const out = `run-at: ${doctored.wall_start}\n${canonLine(doctored)}\n`;
    writeFileSync(txt, out);
    writeFileSync(`${txt}.sha256`, `${sha256(Buffer.from(out, 'utf8'))}  ${basename(txt)}\n`);
    const v = spawnSync(process.execPath, [SELF, 'verify', txt], { encoding: 'utf8' });
    return v.status === 1 && /RECEIPT: REPLAY/.test(v.stdout) ? null : `status=${v.status} out=${v.stdout.trim()}`;
  });

  caseOf('sidecar-mismatch-tampered', () => {
    const { txt } = mk('s5');
    const side = readFileSync(`${txt}.sha256`, 'utf8');
    const h = side.trim().split(/\s+/)[0];
    const bad = `${h.slice(0, -1)}${h.slice(-1) === '0' ? '1' : '0'}  ${basename(txt)}\n`;
    writeFileSync(`${txt}.sha256`, bad);
    const v = spawnSync(process.execPath, [SELF, 'verify', txt], { encoding: 'utf8' });
    return v.status === 1 && /RECEIPT: TAMPERED/.test(v.stdout) ? null : `status=${v.status} out=${v.stdout.trim()}`;
  });

  caseOf('prelude-rewrite-tampered', () => {
    const { txt } = mk('s6');
    const raw = readFileSync(txt, 'utf8');
    const lines = raw.split('\n');
    lines[0] = `run-at: ${new Date(Date.parse('2020-01-01T00:00:00Z') + 60000).toISOString()}`;
    writeFileSync(txt, lines.join('\n'));
    const v = spawnSync(process.execPath, [SELF, 'verify', txt], { encoding: 'utf8' });
    return v.status === 1 && /RECEIPT: TAMPERED/.test(v.stdout) ? null : `status=${v.status} out=${v.stdout.trim()}`;
  });

  caseOf('ledger-nonce-reuse-replay', () => {
    const { txt } = mk('s7');
    const raw = readFileSync(txt, 'utf8');
    const obj = parseReceipt(raw);
    const forged = { ...obj, argv: ['/bin/echo', 'forged'] };
    forged.digest = digestOf(forged);
    const out = `run-at: ${forged.wall_start}\n${canonLine(forged)}\n`;
    const ftxt = join(t, 's7-forged.txt');
    writeFileSync(ftxt, out);
    writeFileSync(`${ftxt}.sha256`, `${sha256(Buffer.from(out, 'utf8'))}  ${basename(ftxt)}\n`);
    const v = spawnSync(process.execPath, [SELF, 'verify', '--ledger', t, ftxt], { encoding: 'utf8' });
    return v.status === 1 && /RECEIPT: REPLAY/.test(v.stdout) ? null : `status=${v.status} out=${v.stdout.trim()}`;
  });

  caseOf('ledger-distinct-valid', () => {
    const a = mk('s8a'); const b = mk('s8b');
    for (const f of [a.txt, b.txt]) {
      const v = spawnSync(process.execPath, [SELF, 'verify', '--ledger', t, f], { encoding: 'utf8' });
      if (!(v.status === 0 && /RECEIPT: VALID/.test(v.stdout))) return `${f} status=${v.status}`;
    }
    return null;
  });

  caseOf('usage-exit-64', () => {
    const v = spawnSync(process.execPath, [SELF], { encoding: 'utf8' });
    return v.status === 64 ? null : `status=${v.status}`;
  });

  caseOf('unreadable-exit-2', () => {
    const v = spawnSync(process.execPath, [SELF, 'verify', join(t, 'nope.txt')], { encoding: 'utf8' });
    return v.status === 2 ? null : `status=${v.status}`;
  });

  caseOf('no-env-leak', () => {
    const r = spawnSync(process.execPath, [SELF, 'run', '--out', join(t, 's9'), '--', '/bin/sh', '-c', 'printf ok'],
      { encoding: 'utf8', env: { ...process.env, KUMITATE_SENTINEL_SECRET: 'zSENTINEL42' } });
    const raw = readFileSync(join(t, 's9.txt'), 'utf8');
    return !raw.includes('zSENTINEL42') ? null : 'secret leaked into receipt';
  });

  caseOf('canonical-json-sorted', () => {
    const { txt } = mk('s10');
    const line = readFileSync(txt, 'utf8').split('\n').find((l) => l.startsWith('{'));
    const keys = Object.keys(JSON.parse(line));
    const sorted = [...keys].sort();
    return JSON.stringify(keys) === JSON.stringify(sorted) ? null : `keys ${keys}`;
  });

  let failed = 0;
  for (const c of cases) {
    let err = null;
    try { err = c.fn(); } catch (e) { err = `threw ${e.message}`; }
    if (err) failed++;
    process.stdout.write(`ATTEST_CASE: ${c.name} ${err ? `FAIL (${err})` : 'PASS'}\n`);
  }
  process.stdout.write(`ATTEST_SELFTEST: ${failed ? `FAIL (${failed}/${cases.length})` : 'PASS'}\n`);
  process.exit(failed ? 1 : 0);
}

/* ------------------------------------------------------------------ main */

const argv = process.argv.slice(2);
if (!argv.length) usage('no subcommand');
if (argv[0] === '--selftest') selftest();
else if (argv[0] === 'run') cmdRun(argv.slice(1));
else if (argv[0] === 'verify') cmdVerify(argv.slice(1));
else usage(`unknown subcommand ${argv[0]}`);
