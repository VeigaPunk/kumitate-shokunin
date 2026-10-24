#!/usr/bin/env node
/**
 * receipt-attest.mjs — capability `receipt-attest` (contract `kumitate-receipt-attest-v3`).
 *
 * Records an invocation (argv, exit code, stdout/stderr hashes, a 128-bit nonce, UTC wall
 * clocks and a monotonic span) in a canonical JSON body. Its inner digest binds every body
 * field; a GNU sha256sum text-mode sidecar binds the complete receipt including its prelude.
 * v3 is the round-53 ledger-evidence extension (routed defects R52-9 + R52-10): the nonce
 * ledger scans the WHOLE ledger directory — every entry is examined, whatever its filename
 * extension — so a nonce-colliding forgery can no longer hide by being stored under a
 * non-`.txt` name. v1/v2 receipt formats and verdicts are unchanged.
 *
 *   node scripts/receipt-attest.mjs run --out <base> [--stdin] -- <cmd...>
 *   node scripts/receipt-attest.mjs verify [--ledger <dir>] <file>
 *   node scripts/receipt-attest.mjs --selftest
 *
 * Receipt bytes are exactly two lines plus a trailing newline:
 *   run-at: <UTC ISO prelude>
 *   {canonical JSON, keys sorted}
 * The prelude is sidecar-bound; semantic fields are digest-bound. Verdicts and the v1 exit
 * map are unchanged: VALID 0; REPLAY/TAMPERED 1; UNREADABLE 2; USAGE 64.
 *
 * With `verify --ledger`, every entry of the ledger directory is examined — the evidence
 * set is the whole directory, NOT a `*.txt` subset (R52-9: a nonce-colliding forgery stored
 * under any other extension is evidence and is caught). A prior entry counts only when it
 * is an attested receipt: sidecar present, GNU text-mode, name-matching, hash-covering,
 * shape-valid, inner digest valid, clocks finite round-trippers. Entries that are not
 * attested receipts — sidecars, foreign files, directories, anything else — are skipped,
 * each with a printed `receipt-attest: ledger skipped ... not an attested receipt` note;
 * they are never treated as evidence of nonce reuse. The subject and byte-identical
 * duplicates (the same record digest under any name) are exempt. A nonce reused by a
 * different attested record — whatever filename that record wears — reads REPLAY.
 *
 * `run --stdin` creates the nonce before spawning, writes its 32 UTF-8 hex bytes to child
 * stdin, closes stdin, and records stdin_sha256. Without --stdin, the v1 run behavior is
 * preserved. Spawn failures are recorded with exit 127. No environment or plaintext child
 * output is recorded. Digests use node:crypto; no external digest executable is invoked.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { constants as osConstants, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-receipt-attest-v3';
const SELF = fileURLToPath(import.meta.url);
const NONCE_BYTES = 16;
const PRELUDE_SLACK_MS = 60_000;
const out = (s) => process.stdout.write(s);
const err = (s) => process.stderr.write(s);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const usage = (why) => {
  err(`receipt-attest: USAGE ${why} (contract ${CONTRACT}: run --out <base> [--stdin] -- <cmd...> | verify [--ledger <dir>] <file> | --selftest)\n`);
  process.exit(64);
};
const unreadable = (why) => {
  err(`receipt-attest: UNREADABLE ${why}\n`);
  process.exit(2);
};

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
  }
  return value;
};
const canonical = (value) => JSON.stringify(sortKeys(value));
const digestOf = (record) => {
  const copy = { ...record };
  delete copy.digest;
  return sha256(canonical(copy));
};
const NONCE_RE = /^[0-9a-f]{32}$/;
const HASH_RE = /^[0-9a-f]{64}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** Require exactly the prelude line, one JSON line and the final newline. */
function splitReceipt(text) {
  if (!text.endsWith('\n')) return { error: 'receipt is missing its trailing newline' };
  const lines = text.split('\n');
  if (lines.length !== 3 || lines[2] !== '') return { error: `expected exactly 2 lines plus trailing newline, got ${lines.length - 1} lines` };
  if (!lines[0].startsWith('run-at: ')) return { error: 'first line is not a `run-at: ` prelude' };
  const runAt = lines[0].slice('run-at: '.length);
  if (!ISO_RE.test(runAt)) return { error: 'prelude is not a UTC ISO instant with milliseconds' };
  if (!lines[1].startsWith('{')) return { error: 'second line is not a JSON object' };
  let record;
  try {
    record = JSON.parse(lines[1]);
  } catch (e) {
    return { error: `JSON line does not parse: ${String(e.message).split('\n')[0]}` };
  }
  if (record === null || typeof record !== 'object' || Array.isArray(record)) return { error: 'JSON line is not an object' };
  return { runAt, record, jsonLine: lines[1] };
}

const SEMANTIC_FIELDS = ['argv', 'exit', 'mono_span_ms', 'nonce', 'stderr_sha256', 'stdout_sha256', 'wall_end', 'wall_start'];
const ALLOWED_FIELDS = new Set([...SEMANTIC_FIELDS, 'digest', 'stdin_sha256']);
function shapeError(record) {
  const keys = Object.keys(record);
  if (keys.some((k) => !ALLOWED_FIELDS.has(k))) return 'record contains a field outside the v2 whitelist';
  if (!Array.isArray(record.argv) || record.argv.some((a) => typeof a !== 'string')) return 'argv is not a string array';
  if (typeof record.exit !== 'number' || !Number.isInteger(record.exit)) return 'exit is not an integer';
  // A negative duration remains a CLOCK verdict, as in v1.
  if (typeof record.mono_span_ms !== 'number' || !Number.isInteger(record.mono_span_ms)) return 'mono_span_ms is not an integer';
  if (typeof record.nonce !== 'string' || !NONCE_RE.test(record.nonce)) return 'nonce is not 32 lowercase hex characters';
  if (typeof record.stdout_sha256 !== 'string' || !HASH_RE.test(record.stdout_sha256)) return 'stdout_sha256 is not a sha256 hex';
  if (typeof record.stderr_sha256 !== 'string' || !HASH_RE.test(record.stderr_sha256)) return 'stderr_sha256 is not a sha256 hex';
  if (typeof record.wall_start !== 'string' || !ISO_RE.test(record.wall_start)) return 'wall_start is not an ISO instant';
  if (typeof record.wall_end !== 'string' || !ISO_RE.test(record.wall_end)) return 'wall_end is not an ISO instant';
  if (Object.hasOwn(record, 'stdin_sha256') && (typeof record.stdin_sha256 !== 'string' || !HASH_RE.test(record.stdin_sha256))) return 'stdin_sha256 is not a sha256 hex';
  return null;
}
function validClock(value) {
  const ms = Date.parse(value);
  return Number.isFinite(ms) && new Date(ms).toISOString() === value;
}
const sidecarPath = (file) => `${file}.sha256`;
const escapeName = (name) => name.replaceAll('\\', '\\\\').replaceAll('\n', '\\n');
const sidecarLine = (hash, name) => {
  const escaped = /[\\\n]/.test(name);
  return `${escaped ? '\\' : ''}${hash}  ${escaped ? escapeName(name) : name}\n`;
};
/** Parse a GNU text-mode sidecar, including GNU's escaped-name form. */
const parseSidecar = (text) => {
  if (!text.endsWith('\n')) return null;
  const line = text.slice(0, -1);
  if (line.includes('\n') || line.includes('\r')) return null;
  const escaped = line.startsWith('\\');
  const body = escaped ? line.slice(1) : line;
  const m = /^([0-9a-f]{64})  (.*)$/.exec(body);
  if (!m) return null;
  let name = m[2];
  if (escaped) {
    let decoded = '';
    for (let i = 0; i < name.length; i += 1) {
      if (name[i] !== '\\') { decoded += name[i]; continue; }
      const next = name[++i];
      if (next === '\\') decoded += '\\';
      else if (next === 'n') decoded += '\n';
      else return null;
    }
    name = decoded;
  }
  return { hash: m[1], name };
};

function doRun(args) {
  let base = null;
  let useStdin = false;
  const cmd = [];
  let seenSep = false;
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (!seenSep) {
      if (a === '--') { seenSep = true; continue; }
      if (a === '--stdin') { useStdin = true; continue; }
      if (a === '--out') { base = args[i + 1] ?? null; i += 1; continue; }
      if (a.startsWith('--out=')) { base = a.slice('--out='.length); continue; }
      usage(`unexpected argument ${JSON.stringify(a)} in run mode`);
    }
    cmd.push(a);
  }
  if (!seenSep) usage('run mode needs `-- <cmd...>`');
  if (base === null || base === '') usage('run mode needs --out <base>');
  if (cmd.length === 0) usage('run mode needs a command after `--`');

  const nonce = randomBytes(NONCE_BYTES).toString('hex');
  const stdinBytes = useStdin ? Buffer.from(nonce, 'utf8') : null;
  const wallStartMs = Date.now();
  const wallStart = new Date(wallStartMs).toISOString();
  const monoStart = process.hrtime.bigint();
  const spawnOptions = { encoding: 'buffer', maxBuffer: 64 << 20 };
  if (useStdin) spawnOptions.input = stdinBytes;
  const r = spawnSync(cmd[0], cmd.slice(1), spawnOptions);
  const monoEnd = process.hrtime.bigint();
  const wallEndMs = Date.now();
  const wallEnd = new Date(wallEndMs).toISOString();

  let stdout = r.stdout ?? Buffer.alloc(0);
  let stderr = r.stderr ?? Buffer.alloc(0);
  let exitCode;
  if (r.error) {
    stderr = Buffer.from(`receipt-attest: spawn failed: ${r.error.message}\n`, 'utf8');
    stdout = Buffer.alloc(0);
    exitCode = 127;
    out(`receipt-attest: spawn failed: ${r.error.message}\n`);
  } else if (typeof r.status === 'number') {
    exitCode = r.status;
  } else {
    const signum = (r.signal && osConstants.signals[r.signal]) || 0;
    exitCode = 128 + signum;
    out(`receipt-attest: command killed by signal ${r.signal}\n`);
  }
  const record = {
    argv: cmd,
    exit: exitCode,
    mono_span_ms: Number((monoEnd - monoStart) / 1_000_000n),
    nonce,
    stderr_sha256: sha256(stderr),
    stdout_sha256: sha256(stdout),
    wall_end: wallEnd,
    wall_start: wallStart,
  };
  if (useStdin) record.stdin_sha256 = sha256(stdinBytes);
  record.digest = digestOf(record);

  const receiptText = `run-at: ${wallStart}\n${canonical(record)}\n`;
  const receiptBytes = Buffer.from(receiptText, 'utf8');
  const file = `${base}.txt`;
  const side = sidecarPath(file);
  try {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, receiptBytes);
    writeFileSync(side, sidecarLine(sha256(receiptBytes), basename(file)));
  } catch (e) {
    try { rmSync(file, { force: true }); } catch { /* best-effort half-pair cleanup */ }
    try { rmSync(side, { force: true }); } catch { /* best-effort half-pair cleanup */ }
    unreadable(`cannot write receipt pair (${e.code ?? e.message})`);
  }
  out(`receipt-attest: wrote ${file}\n`);
  out(`receipt-attest: sidecar ${side}\n`);
  out(`receipt-attest: receipt-sha256 ${sha256(receiptBytes)}\n`);
  out(`receipt-attest: command-exit ${exitCode}\n`);
  process.exit(0);
}

/** Only attested prior receipts count as ledger evidence. */
function attestationState(file) {
  let bytes;
  try { bytes = readFileSync(file); }
  catch (e) { return { attested: false, why: `unreadable (${e.code ?? e.message})` }; }
  let sideText;
  try { sideText = readFileSync(sidecarPath(file), 'utf8'); }
  catch (e) { return { attested: false, why: `sidecar absent (${e.code ?? e.message})` }; }
  const side = parseSidecar(sideText);
  if (!side) return { attested: false, why: 'sidecar is not a GNU sha256sum line' };
  if (side.name !== basename(file)) return { attested: false, why: 'sidecar name does not match receipt basename' };
  if (side.hash !== sha256(bytes)) return { attested: false, why: 'sidecar hash mismatch' };
  const parts = splitReceipt(bytes.toString('utf8'));
  if (parts.error) return { attested: false, why: parts.error };
  const shape = shapeError(parts.record);
  if (shape) return { attested: false, why: shape };
  if (digestOf(parts.record) !== parts.record.digest) return { attested: false, why: 'inner digest mismatch' };
  if (!validClock(parts.record.wall_start) || !validClock(parts.record.wall_end)) return { attested: false, why: 'wall clock is not a finite round-tripping ISO instant' };
  return { attested: true, nonce: parts.record.nonce, digest: parts.record.digest, record: parts.record };
}

function doVerify(args) {
  let ledgerDir = null;
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--ledger') { ledgerDir = args[i + 1] ?? null; i += 1; continue; }
    if (a.startsWith('--ledger=')) { ledgerDir = a.slice('--ledger='.length); continue; }
    if (a.startsWith('-')) usage(`unexpected flag ${JSON.stringify(a)} in verify mode`);
    positional.push(a);
  }
  if (positional.length !== 1) usage('verify mode needs exactly one <file>');
  const file = positional[0];
  if (ledgerDir !== null && !existsSync(ledgerDir)) unreadable(`ledger directory ${ledgerDir} does not exist`);
  let bytes;
  try { bytes = readFileSync(file); }
  catch (e) { unreadable(`cannot read receipt ${file} (${e.code ?? e.message})`); }
  const parts = splitReceipt(bytes.toString('utf8'));
  if (parts.error) unreadable(`malformed receipt ${file}: ${parts.error}`);
  const { record, runAt } = parts;
  const shape = shapeError(record);
  if (shape) unreadable(`malformed receipt ${file}: ${shape}`);

  const digest = digestOf(record);
  if (digest !== record.digest) {
    out(`receipt-attest: inner digest mismatch: recomputed ${digest}, recorded ${record.digest}\n`);
    out('RECEIPT: REPLAY\n');
    process.exit(1);
  }

  const sidePath = sidecarPath(file);
  let sideText;
  try { sideText = readFileSync(sidePath, 'utf8'); }
  catch (e) {
    out(`receipt-attest: sidecar ${sidePath} is absent (${e.code ?? e.message}): the receipt bytes are not vouched for\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  const parsed = parseSidecar(sideText);
  if (!parsed) {
    out(`receipt-attest: sidecar ${sidePath} is not a GNU sha256sum line\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  if (parsed.name !== basename(file)) {
    out(`receipt-attest: sidecar name ${JSON.stringify(parsed.name)} does not match receipt basename ${JSON.stringify(basename(file))}\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  const actual = sha256(bytes);
  if (parsed.hash !== actual) {
    out(`receipt-attest: sidecar mismatch: sidecar ${parsed.hash}, actual ${actual}\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }

  const startMs = Date.parse(record.wall_start);
  const endMs = Date.parse(record.wall_end);
  if (!Number.isFinite(startMs) || new Date(startMs).toISOString() !== record.wall_start
      || !Number.isFinite(endMs) || new Date(endMs).toISOString() !== record.wall_end) {
    out(`receipt-attest: wall clock is not a finite round-tripping ISO instant: start ${record.wall_start}, end ${record.wall_end}\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  if (endMs < startMs) {
    out(`receipt-attest: wall clock order violated: start ${record.wall_start}, end ${record.wall_end}\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  if (record.mono_span_ms < 0) {
    out(`receipt-attest: monotonic span is negative: ${record.mono_span_ms}\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }

  if (ledgerDir !== null) {
    let names = [];
    try { names = readdirSync(ledgerDir); }
    catch (e) { unreadable(`cannot list ledger directory ${ledgerDir} (${e.code ?? e.message})`); }
    const selfPath = resolve(file);
    for (const name of names.sort()) {
      const other = join(ledgerDir, name);
      if (resolve(other) === selfPath) continue;
      // v3 (R52-9): the evidence set is the whole directory, not a `*.txt` subset. Only
      // regular files are read; directories, FIFOs, sockets and devices are skipped with
      // the same printed note (fail closed on exotic kinds, never block on a FIFO read).
      let st = null;
      try { st = statSync(other); } catch { st = null; }
      if (!st || !st.isFile()) {
        out(`receipt-attest: ledger skipped ${name}: not an attested receipt (not a regular file)\n`);
        continue;
      }
      const state = attestationState(other);
      if (!state.attested) {
        out(`receipt-attest: ledger skipped ${name}: not an attested receipt (${state.why})\n`);
        continue;
      }
      if (state.nonce === record.nonce && state.digest !== record.digest) {
        out(`receipt-attest: nonce ${record.nonce} already bound to a different record in ${name}\n`);
        out('RECEIPT: REPLAY\n');
        process.exit(1);
      }
    }
  }

  const preludeMs = Date.parse(runAt);
  const lowMs = Math.min(startMs, endMs) - PRELUDE_SLACK_MS;
  const highMs = Math.max(startMs, endMs) + PRELUDE_SLACK_MS;
  if (!Number.isFinite(preludeMs) || preludeMs < lowMs || preludeMs > highMs) {
    out(`receipt-attest: prelude ${runAt} is outside the recorded wall window [${record.wall_start}, ${record.wall_end}]\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  out('RECEIPT: VALID\n');
  process.exit(0);
}

/* ------------------------------------------------------------------ selftest */
const SELFTEST_CASES = [];
const case_ = (name, fn) => SELFTEST_CASES.push({ name, fn });
const tool = (args, opts = {}) => spawnSync(process.execPath, [SELF, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, ...opts });
const lastLine = (r) => `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').filter(Boolean).pop() || '';
function makeReceipt(dir, name, cmd) {
  const base = join(dir, name);
  const run = tool(['run', '--out', base, '--', ...cmd]);
  return { base, file: `${base}.txt`, side: `${base}.txt.sha256`, run };
}
const NODE_ECHO = (text) => [process.execPath, '-e', `process.stdout.write(${JSON.stringify(text)})`];
function rewriteConsistently(rec, mutate) {
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  mutate(body, lines);
  body.digest = digestOf(body);
  lines[1] = canonical(body);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
}
function verdict(r, status, line) {
  if (r.status !== status) return `exit ${r.status} (want ${status}): ${(r.stderr || '').trim()}`;
  if (line && lastLine(r) !== line) return `verdict line is ${JSON.stringify(lastLine(r))} (want ${line})`;
  return null;
}

// The following 27 cases are the complete receipt-attest v1 selftest corpus, retained in v2.
case_('run-writes-receipt-and-sidecar', (d) => {
  const rec = makeReceipt(d, 'r1', NODE_ECHO('hello'));
  if (rec.run.status !== 0) return `run exit ${rec.run.status}`;
  if (!existsSync(rec.file)) return 'receipt absent';
  if (!existsSync(rec.side)) return 'sidecar absent';
  return null;
});
case_('receipt-shape-is-prelude-plus-json-line', (d) => {
  const rec = makeReceipt(d, 'r2', NODE_ECHO('x'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  if (lines.length !== 3 || lines[2] !== '') return `expected 2 lines + trailing newline, got ${JSON.stringify(lines)}`;
  if (!/^run-at: \d{4}-\d{2}-\d{2}T/.test(lines[0])) return `prelude malformed: ${JSON.stringify(lines[0])}`;
  if (!lines[1].startsWith('{')) return 'second line is not JSON';
  return null;
});
case_('sidecar-is-gnu-text-mode-basename', (d) => {
  const rec = makeReceipt(d, 'r3', NODE_ECHO('y'));
  const side = parseSidecar(readFileSync(rec.side, 'utf8'));
  if (!side) return 'sidecar is not a GNU text-mode line';
  if (side.hash !== sha256(readFileSync(rec.file))) return 'sidecar hash does not cover receipt bytes';
  if (side.name !== basename(rec.file)) return `sidecar names ${side.name}, expected ${basename(rec.file)}`;
  return null;
});
case_('sidecar-hash-is-computed-with-node-crypto', (d) => {
  const rec = makeReceipt(d, 'r3b', NODE_ECHO('y'));
  const side = parseSidecar(readFileSync(rec.side, 'utf8'));
  if (!side || !HASH_RE.test(side.hash)) return 'sidecar hash is not plain lowercase hex';
  if (side.hash !== sha256(readFileSync(rec.file))) return 'sidecar hash is not in-process sha256';
  return null;
});
case_('nonce-is-128-bit-hex-and-unique-per-run', (d) => {
  const a = makeReceipt(d, 'n1', NODE_ECHO('a'));
  const b = makeReceipt(d, 'n2', NODE_ECHO('b'));
  const na = JSON.parse(readFileSync(a.file, 'utf8').split('\n')[1]).nonce;
  const nb = JSON.parse(readFileSync(b.file, 'utf8').split('\n')[1]).nonce;
  if (!NONCE_RE.test(na)) return `nonce ${na} is not 32 lowercase hex characters`;
  if (na === nb) return `two runs share nonce ${na}`;
  return null;
});
case_('verify-genuine-receipt-reads-valid', (d) => {
  const rec = makeReceipt(d, 'v1', NODE_ECHO('v'));
  return verdict(tool(['verify', rec.file]), 0, 'RECEIPT: VALID');
});
case_('flake-injection-doctored-body-reads-replay', (d) => {
  const rec = makeReceipt(d, 'f1', NODE_ECHO('f'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  body.exit = body.exit === 0 ? 1 : 0;
  lines[1] = canonical(body);
  writeFileSync(rec.file, lines.join('\n'));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: REPLAY');
});
case_('digest-field-corrupted-with-recomputed-sidecar-reads-replay', (d) => {
  const rec = makeReceipt(d, 'fd', NODE_ECHO('fd'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  body.digest = 'f'.repeat(64);
  lines[1] = canonical(body);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: REPLAY');
});
case_('sidecar-mismatch-reads-tampered', (d) => {
  const rec = makeReceipt(d, 't1', NODE_ECHO('t'));
  const side = readFileSync(rec.side, 'utf8');
  const flipped = side[0] === '0' ? '1' : '0';
  writeFileSync(rec.side, `${flipped}${side.slice(1)}`);
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('missing-sidecar-reads-tampered', (d) => {
  const rec = makeReceipt(d, 't2', NODE_ECHO('t'));
  rmSync(rec.side);
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('prelude-only-rewrite-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'm2', NODE_ECHO('m'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  writeFileSync(rec.file, lines.join('\n'));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('prelude-rewrite-with-forged-sidecar-reads-replay', (d) => {
  const orig = makeReceipt(d, 'm3-orig', NODE_ECHO('m'));
  const rec = makeReceipt(d, 'm3', NODE_ECHO('m'));
  const body = JSON.parse(readFileSync(orig.file, 'utf8').split('\n')[1]);
  const forged = { ...body, argv: [...body.argv, 'forged'] };
  forged.digest = digestOf(forged);
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  lines[1] = canonical(forged);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', '--ledger', d, rec.file]), 1, 'RECEIPT: REPLAY');
});
case_('ledger-detects-a-nonce-reused-by-a-different-record', (d) => {
  const orig = makeReceipt(d, 'dup1', NODE_ECHO('dup'));
  const body = JSON.parse(readFileSync(orig.file, 'utf8').split('\n')[1]);
  const forged = { ...body, argv: [...body.argv, 'other-record'] };
  forged.digest = digestOf(forged);
  const file = join(d, 'dup2.txt');
  const bytes = Buffer.from(`run-at: ${body.wall_start}\n${canonical(forged)}\n`, 'utf8');
  writeFileSync(file, bytes);
  writeFileSync(`${file}.sha256`, sidecarLine(sha256(bytes), basename(file)));
  return verdict(tool(['verify', '--ledger', d, file]), 1, 'RECEIPT: REPLAY');
});
case_('ledger-exempt-a-byte-identical-duplicate', (d) => {
  const orig = makeReceipt(d, 'same1', NODE_ECHO('same'));
  const copy = join(d, 'same2.txt');
  writeFileSync(copy, readFileSync(orig.file));
  writeFileSync(`${copy}.sha256`, sidecarLine(sha256(readFileSync(copy)), basename(copy)));
  return verdict(tool(['verify', '--ledger', d, copy]), 0, 'RECEIPT: VALID');
});
case_('ledger-ignores-an-unattested-copy', (d) => {
  const rec = makeReceipt(d, 'orig', NODE_ECHO('o'));
  const copy = join(d, 'forged.txt');
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  writeFileSync(copy, lines.join('\n'));
  writeFileSync(`${copy}.sha256`, readFileSync(rec.side, 'utf8'));
  return verdict(tool(['verify', '--ledger', d, rec.file]), 0, 'RECEIPT: VALID');
});
case_('usage-errors-exit-64', (d) => {
  const problems = [];
  for (const args of [[], ['run'], ['run', '--out', join(d, 'x')], ['verify'], ['verify', 'a', 'b'], ['bogus']]) {
    const r = tool(args);
    if (r.status !== 64) problems.push(`${JSON.stringify(args)} exit ${r.status} (want 64)`);
  }
  return problems.length ? problems.join('; ') : null;
});
case_('missing-receipt-reads-unreadable-exit-2', (d) => {
  const r = tool(['verify', join(d, 'absent.txt')]);
  if (r.status !== 2) return `exit ${r.status} (want 2)`;
  if (/RECEIPT: (VALID|REPLAY|TAMPERED)/.test(`${r.stdout || ''}${r.stderr || ''}`)) return 'printed a verdict';
  return null;
});
case_('malformed-receipt-reads-unreadable-exit-2', (d) => {
  const file = join(d, 'garbage.txt');
  writeFileSync(file, 'this is not a receipt\n');
  const r = tool(['verify', file]);
  if (r.status !== 2) return `exit ${r.status} (want 2)`;
  if (/RECEIPT: (VALID|REPLAY|TAMPERED)/.test(`${r.stdout || ''}${r.stderr || ''}`)) return 'printed a verdict';
  return null;
});
case_('clock-order-violation-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'clk', NODE_ECHO('c'));
  rewriteConsistently(rec, (body) => { body.wall_end = '2000-01-01T00:00:00.000Z'; });
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('negative-monotonic-span-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'mono', NODE_ECHO('m'));
  rewriteConsistently(rec, (body) => { body.mono_span_ms = -1; });
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('prelude-outside-the-wall-window-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'pre', NODE_ECHO('p'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('inner-digest-covers-every-semantic-field', (d) => {
  const rec = makeReceipt(d, 'bind', NODE_ECHO('b'));
  const original = JSON.parse(readFileSync(rec.file, 'utf8').split('\n')[1]);
  const mutations = {
    argv: ['/bin/other'], exit: original.exit === 0 ? 1 : 0, mono_span_ms: 123456,
    nonce: 'f'.repeat(32), stderr_sha256: 'a'.repeat(64), stdout_sha256: 'b'.repeat(64),
    wall_end: '2030-01-01T00:00:00.000Z', wall_start: '2029-01-01T00:00:00.000Z',
  };
  const problems = [];
  for (const field of SEMANTIC_FIELDS) {
    const body = { ...original, [field]: mutations[field] };
    const bytes = Buffer.from(`run-at: ${body.wall_start}\n${canonical(body)}\n`, 'utf8');
    const file = join(d, `bind-${field}.txt`);
    writeFileSync(file, bytes);
    writeFileSync(`${file}.sha256`, sidecarLine(sha256(bytes), basename(file)));
    const r = tool(['verify', file]);
    if (r.status !== 1 || lastLine(r) !== 'RECEIPT: REPLAY') problems.push(`${field}: exit ${r.status} ${JSON.stringify(lastLine(r))}`);
  }
  return problems.length ? problems.join('; ') : null;
});
case_('canonical-json-is-sorted-and-stable', (d) => {
  const rec = makeReceipt(d, 'canon', NODE_ECHO('c'));
  const line = readFileSync(rec.file, 'utf8').split('\n')[1];
  const parsed = JSON.parse(line);
  if (canonical(parsed) !== line) return 're-serialising the parsed record does not reproduce the line';
  const keys = Object.keys(parsed);
  if (JSON.stringify(keys) !== JSON.stringify([...keys].sort())) return `keys are not sorted: ${keys.join(',')}`;
  return null;
});
case_('receipt-records-no-environment', (d) => {
  const sentinel = 'kumitate-receipt-sentinel-9f3a';
  process.env.KUMITATE_RECEIPT_SENTINEL = sentinel;
  try {
    const rec = makeReceipt(d, 'env', [process.execPath, '-e', 'process.stdout.write(process.env.KUMITATE_RECEIPT_SENTINEL || "")']);
    const text = readFileSync(rec.file, 'utf8');
    if (text.includes(sentinel)) return 'the sentinel value appears in the receipt';
    if (/\bPATH=/.test(text)) return 'an environment assignment appears in the receipt';
    return null;
  } finally { delete process.env.KUMITATE_RECEIPT_SENTINEL; }
});
case_('run-records-the-command-exit-code', (d) => {
  const rec = makeReceipt(d, 'ec', [process.execPath, '-e', 'process.exit(3)']);
  const body = JSON.parse(readFileSync(rec.file, 'utf8').split('\n')[1]);
  if (body.exit !== 3) return `recorded exit ${body.exit} (want 3)`;
  if (!Array.isArray(body.argv) || body.argv.length !== 3) return `argv not recorded: ${JSON.stringify(body.argv)}`;
  const r = tool(['verify', rec.file]);
  if (r.status !== 0) return `verify exit ${r.status}`;
  return null;
});
case_('run-records-output-hashes-not-output', (d) => {
  const marker = 'kumitate-plaintext-marker-1122';
  const rec = makeReceipt(d, 'hash', [process.execPath, '-e', "process.stdout.write(['kumitate','plaintext','marker','1122'].join('-'))"]);
  const text = readFileSync(rec.file, 'utf8');
  if (text.includes(marker)) return 'the captured output leaks into the receipt';
  const body = JSON.parse(text.split('\n')[1]);
  if (body.stdout_sha256 !== sha256(Buffer.from(marker, 'utf8'))) return 'stdout_sha256 does not hash captured stdout';
  return null;
});
case_('verify-resolves-the-sidecar-next-to-the-receipt', (d) => {
  const rec = makeReceipt(d, 'rel', NODE_ECHO('r'));
  const elsewhere = mkdtempSync(join(tmpdir(), 'receipt-attest-cwd.'));
  try { return verdict(tool(['verify', rec.file], { cwd: elsewhere }), 0, 'RECEIPT: VALID'); }
  finally { try { rmSync(elsewhere, { recursive: true, force: true }); } catch { /* tmpfs reaps */ } }
});

// v2 SHAPE, CLOCK, STDIN, LEDGER and R52-6 truncation arms.
case_('v2-unknown-field-is-unreadable', (d) => {
  const rec = makeReceipt(d, 'unknown', NODE_ECHO('u'));
  rewriteConsistently(rec, (body) => { body.extra = 'not allowed'; });
  return verdict(tool(['verify', rec.file]), 2);
});
case_('v2-blank-line-is-unreadable', (d) => {
  const rec = makeReceipt(d, 'blank', NODE_ECHO('b'));
  const body = readFileSync(rec.file, 'utf8').split('\n')[1];
  const bytes = Buffer.from(`run-at: ${JSON.parse(body).wall_start}\n\n${body}\n`, 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 2);
});
case_('v2-missing-trailing-newline-is-unreadable', (d) => {
  const rec = makeReceipt(d, 'newline', NODE_ECHO('n'));
  const bytes = readFileSync(rec.file).subarray(0, -1);
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 2);
});
case_('v2-zone-less-prelude-is-unreadable', (d) => {
  const rec = makeReceipt(d, 'zone', NODE_ECHO('z'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = lines[0].slice(0, -1);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 2);
});
case_('v2-sidecar-recorded-name-must-match-basename', (d) => {
  const rec = makeReceipt(d, 'side-name', NODE_ECHO('s'));
  writeFileSync(rec.side, sidecarLine(sha256(readFileSync(rec.file)), 'different.txt'));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('v2-sidecar-escaped-basename-round-trips', (d) => {
  const specialName = `escaped${String.fromCharCode(92)}${String.fromCharCode(10)}name`;
  const rec = makeReceipt(d, specialName, NODE_ECHO('e'));
  const side = parseSidecar(readFileSync(rec.side, 'utf8'));
  if (!side || side.name !== basename(rec.file)) return 'escaped sidecar basename did not round-trip';
  return verdict(tool(['verify', rec.file]), 0, 'RECEIPT: VALID');
});
case_('v2-clock-month-rollover-is-tampered', (d) => {
  const rec = makeReceipt(d, 'month', NODE_ECHO('m'));
  rewriteConsistently(rec, (body) => { body.wall_start = '2026-13-01T00:00:00.000Z'; body.wall_end = body.wall_start; });
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('v2-clock-day-rollover-is-tampered', (d) => {
  const rec = makeReceipt(d, 'day', NODE_ECHO('d'));
  rewriteConsistently(rec, (body) => { body.wall_start = '2026-02-30T00:00:00.000Z'; body.wall_end = body.wall_start; });
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('v2-nonfinite-clock-is-tampered', (d) => {
  const rec = makeReceipt(d, 'nonfinite', NODE_ECHO('x'));
  rewriteConsistently(rec, (body) => { body.wall_start = '2026-99-01T00:00:00.000Z'; body.wall_end = body.wall_start; });
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('v2-sidecar-write-failure-removes-half-receipt', (d) => {
  const base = join(d, 'half');
  mkdirSync(`${base}.txt.sha256`);
  const r = tool(['run', '--out', base, '--', ...NODE_ECHO('h')]);
  if (r.status !== 2) return `run exit ${r.status} (want 2)`;
  if (existsSync(`${base}.txt`)) return 'half-written receipt remains after sidecar failure';
  return null;
});
case_('v2-spawn-failure-is-recorded-as-127', (d) => {
  const rec = makeReceipt(d, 'spawn-fail', ['/no/such/receipt-attest-command']);
  if (rec.run.status !== 0) return `run exit ${rec.run.status}`;
  const body = JSON.parse(readFileSync(rec.file, 'utf8').split('\n')[1]);
  if (body.exit !== 127) return `recorded exit ${body.exit} (want 127)`;
  return verdict(tool(['verify', rec.file]), 0, 'RECEIPT: VALID');
});
case_('v2-stdin-binds-32-nonce-bytes-and-child-output', (d) => {
  const base = join(d, 'stdin');
  const run = tool(['run', '--out', base, '--stdin', '--', '/bin/cat']);
  if (run.status !== 0) return `run exit ${run.status}`;
  const file = `${base}.txt`;
  const body = JSON.parse(readFileSync(file, 'utf8').split('\n')[1]);
  const nonceBytes = Buffer.from(body.nonce, 'utf8');
  if (nonceBytes.length !== 32) return `stdin nonce is ${nonceBytes.length} bytes (want 32)`;
  if (body.stdin_sha256 !== sha256(nonceBytes)) return 'stdin_sha256 does not bind the nonce bytes';
  if (body.stdout_sha256 !== sha256(nonceBytes)) return '/bin/cat stdout hash does not bind its real stdin output';
  return verdict(tool(['verify', file]), 0, 'RECEIPT: VALID');
});
case_('v2-ledger-prints-damaged-prior-skip-note', (d) => {
  const rec = makeReceipt(d, 'ledger-current', NODE_ECHO('l'));
  const damaged = join(d, 'damaged.txt');
  writeFileSync(damaged, 'not an attested receipt\n');
  writeFileSync(`${damaged}.sha256`, sidecarLine('0'.repeat(64), basename(damaged)));
  const r = tool(['verify', '--ledger', d, rec.file]);
  if (r.status !== 0 || lastLine(r) !== 'RECEIPT: VALID') return `exit ${r.status}: ${lastLine(r)}`;
  if (!r.stdout.includes('ledger skipped damaged.txt: not an attested receipt')) return 'damaged-prior skip note is absent';
  return null;
});
case_('nonce-change-with-stale-digest-is-replay', (d) => {
  const rec = makeReceipt(d, 'nonce-trunc', NODE_ECHO('n'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  const flip = body.nonce[4] === '0' ? '1' : '0';
  body.nonce = `${body.nonce.slice(0, 4)}${flip}${body.nonce.slice(5)}`;
  lines[1] = canonical(body);
  writeFileSync(rec.file, lines.join('\n'));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: REPLAY');
});
case_('r52-6-ledger-nonce-16bit-prefix-not-reuse', (d) => {
  const a = makeReceipt(d, 'n02-a', NODE_ECHO('n02-a'));
  const b = makeReceipt(d, 'n02-b', NODE_ECHO('n02-b'));
  const prefix = randomBytes(2).toString('hex');
  const na = `${prefix}${randomBytes(14).toString('hex')}`;
  const nb = `${prefix}${randomBytes(14).toString('hex')}`;
  if (na === nb) return 'test construction failed: the two nonces are identical';
  rewriteConsistently(a, (body) => { body.nonce = na; });
  rewriteConsistently(b, (body) => { body.nonce = nb; });
  const problems = [];
  for (const rec of [a, b]) {
    const r = tool(['verify', '--ledger', d, rec.file]);
    if (r.status !== 0 || lastLine(r) !== 'RECEIPT: VALID') {
      problems.push(`${basename(rec.file)}: exit ${r.status} ${JSON.stringify(lastLine(r))}`);
    }
  }
  return problems.length ? problems.join('; ') : null;
});
case_('r52-6-ledger-digest-16bit-prefix-collision-reads-replay', (d) => {
  const a = makeReceipt(d, 'ld16-a', NODE_ECHO('ld16-a'));
  const bodyA = JSON.parse(readFileSync(a.file, 'utf8').split('\n')[1]);
  let bodyB = null;
  for (let i = 0; i < 1_000_000; i += 1) {
    const candidate = { ...bodyA, argv: [...bodyA.argv, `ledger-digest-prefix-${i}`] };
    const candidateDigest = digestOf(candidate);
    if (candidateDigest.slice(0, 4) === bodyA.digest.slice(0, 4) && candidateDigest !== bodyA.digest) {
      candidate.digest = candidateDigest;
      bodyB = candidate;
      break;
    }
  }
  if (!bodyB) return 'test construction failed: no digest with the matching 16-bit prefix';
  const bFile = join(d, 'ld16-b.txt');
  const bytes = Buffer.from(`run-at: ${bodyA.wall_start}\n${canonical(bodyB)}\n`, 'utf8');
  writeFileSync(bFile, bytes);
  writeFileSync(`${bFile}.sha256`, sidecarLine(sha256(bytes), basename(bFile)));
  const problems = [];
  for (const file of [a.file, bFile]) {
    const r = tool(['verify', '--ledger', d, file]);
    if (r.status !== 1 || lastLine(r) !== 'RECEIPT: REPLAY') {
      problems.push(`${basename(file)}: exit ${r.status} ${JSON.stringify(lastLine(r))}`);
    }
  }
  return problems.length ? problems.join('; ') : null;
});
case_('r52-6-inner-digest-16bit-prefix-collision-reads-replay', (d) => {
  const rec = makeReceipt(d, 'digest-prefix', NODE_ECHO('d16-digest-prefix'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  body.exit = body.exit === 0 ? 1 : 0;
  const correct = digestOf(body);
  body.digest = `${correct.slice(0, 4)}${'0'.repeat(60)}`;
  if (body.digest === correct) return 'test construction failed: forged digest equals the correct one';
  lines[1] = canonical(body);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: REPLAY');
});
case_('r52-6-sidecar-difference-after-16-bit-prefix-is-not-valid', (d) => {
  const rec = makeReceipt(d, 'side-trunc', NODE_ECHO('s'));
  const actual = sha256(readFileSync(rec.file));
  const flip = actual[4] === '0' ? '1' : '0';
  const forged = `${actual.slice(0, 4)}${flip}${actual.slice(5)}`;
  writeFileSync(rec.side, sidecarLine(forged, basename(rec.file)));
  return verdict(tool(['verify', rec.file]), 1, 'RECEIPT: TAMPERED');
});
case_('ledger-prior-recorded-digest-16bit-collision-is-skipped-not-reuse', (d) => {
  const rec = makeReceipt(d, 'ld14', NODE_ECHO('ld14'));
  const body = JSON.parse(readFileSync(rec.file, 'utf8').split('\n')[1]);
  const prior = { ...body, argv: [...body.argv, 'prior-forged'] };
  const correct = digestOf(prior);
  prior.digest = `${correct.slice(0, 4)}${'0'.repeat(60)}`;
  const bytes = Buffer.from(`run-at: ${body.wall_start}\n${canonical(prior)}\n`, 'utf8');
  const pfile = join(d, 'prior.txt');
  writeFileSync(pfile, bytes);
  writeFileSync(`${pfile}.sha256`, sidecarLine(sha256(bytes), basename(pfile)));
  const r = tool(['verify', '--ledger', d, rec.file]);
  if (r.status !== 0) return `exit ${r.status} (want 0): ${JSON.stringify(lastLine(r))}`;
  if (!/ledger skipped prior\.txt: not an attested receipt \(inner digest mismatch\)/.test(`${r.stdout || ''}`)) return 'no skip note for the unattested prior';
  if (lastLine(r) !== 'RECEIPT: VALID') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

// v3 LEDGER arms (round 53, routed defects R52-9 + R52-10): the evidence set is the whole
// ledger directory — attested receipts count whatever their filename extension, and the
// same-digest exemption is extension-independent.
case_('v3-ledger-catches-nonce-reuse-hidden-under-a-non-txt-name', (d) => {
  const orig = makeReceipt(d, 'r52-9-orig', NODE_ECHO('r52-9'));
  const body = JSON.parse(readFileSync(orig.file, 'utf8').split('\n')[1]);
  const forged = { ...body, argv: [...body.argv, 'r52-9-evil'] };
  forged.digest = digestOf(forged);
  const bytes = Buffer.from(`run-at: ${body.wall_start}\n${canonical(forged)}\n`, 'utf8');
  // The R52-9 evasion name: NOT a .txt file. Under v2 the ledger never opened it.
  const hidden = join(d, 'attest-run-1-forged.receipt');
  writeFileSync(hidden, bytes);
  writeFileSync(`${hidden}.sha256`, sidecarLine(sha256(bytes), basename(hidden)));
  const r = tool(['verify', '--ledger', d, orig.file]);
  if (r.status !== 1 || lastLine(r) !== 'RECEIPT: REPLAY') return `exit ${r.status} ${JSON.stringify(lastLine(r))}`;
  if (!/already bound to a different record in .*attest-run-1-forged\.receipt/.test(`${r.stdout || ''}`)) return 'REPLAY does not name the hidden file';
  return null;
});
case_('v3-ledger-counts-an-attested-receipt-under-any-extension', (d) => {
  const scratch = mkdtempSync(join(tmpdir(), 'receipt-attest-v3anyext.'));
  try {
    const prior = makeReceipt(scratch, 'prior', NODE_ECHO('prior'));
    const body = JSON.parse(readFileSync(prior.file, 'utf8').split('\n')[1]);
    const ledger = join(d, 'ledger-anyext');
    mkdirSync(ledger);
    // Re-key the attested prior under an extension-free name; the sidecar name follows.
    const anyName = join(ledger, 'witness.log');
    writeFileSync(anyName, readFileSync(prior.file));
    writeFileSync(`${anyName}.sha256`, sidecarLine(sha256(readFileSync(anyName)), basename(anyName)));
    const subject = makeReceipt(d, 'subject-anyext', NODE_ECHO('subject'));
    rewriteConsistently(subject, (b) => { b.nonce = body.nonce; });
    const r = tool(['verify', '--ledger', ledger, subject.file]);
    if (r.status !== 1 || lastLine(r) !== 'RECEIPT: REPLAY') return `exit ${r.status} ${JSON.stringify(lastLine(r))}`;
    if (!/already bound to a different record in witness\.log/.test(`${r.stdout || ''}`)) return 'REPLAY does not name witness.log';
    return null;
  } finally { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* tmpfs reaps */ } }
});
case_('v3-ledger-exempts-a-byte-identical-duplicate-under-a-different-name', (d) => {
  const orig = makeReceipt(d, 'same-name-a', NODE_ECHO('same-bytes'));
  const copy = join(d, 'same-bytes.receipt');
  writeFileSync(copy, readFileSync(orig.file));
  writeFileSync(`${copy}.sha256`, sidecarLine(sha256(readFileSync(copy)), basename(copy)));
  return verdict(tool(['verify', '--ledger', d, copy]), 0, 'RECEIPT: VALID');
});
case_('v3-ledger-skips-directories-and-foreign-files', (d) => {
  const rec = makeReceipt(d, 'amid-junk', NODE_ECHO('j'));
  const sub = join(d, 'nested-dir');
  mkdirSync(sub);
  writeFileSync(join(d, 'notes.json'), '{"not":"a receipt"}\n');
  writeFileSync(join(d, 'stray.sha256'), `${'0'.repeat(64)}  stray\n`);
  const r = tool(['verify', '--ledger', d, rec.file]);
  if (r.status !== 0 || lastLine(r) !== 'RECEIPT: VALID') return `exit ${r.status} ${JSON.stringify(lastLine(r))}`;
  const text = `${r.stdout || ''}`;
  if (!/ledger skipped nested-dir: not an attested receipt \(not a regular file\)/.test(text)) return 'directory skip note absent';
  if (!/ledger skipped notes\.json: not an attested receipt/.test(text)) return 'foreign-file skip note absent';
  if (!/ledger skipped stray\.sha256: not an attested receipt/.test(text)) return 'sidecar skip note absent';
  return null;
});
case_('v3-ledger-scan-finds-no-evidence-in-an-empty-directory', (d) => {
  const rec = makeReceipt(d, 'solo', NODE_ECHO('solo'));
  const empty = join(d, 'empty-ledger');
  mkdirSync(empty);
  return verdict(tool(['verify', '--ledger', empty, rec.file]), 0, 'RECEIPT: VALID');
});

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'receipt-attest-selftest.'));
  let passed = 0;
  let failed = 0;
  const failures = [];
  try {
    for (let i = 0; i < SELFTEST_CASES.length; i += 1) {
      const c = SELFTEST_CASES[i];
      const d = mkdtempSync(join(root, `case.${i}`));
      let why = null;
      try { why = c.fn(d); }
      catch (e) { why = `threw ${String(e && e.message).split('\n')[0]}`; }
      if (why === null) { passed += 1; out(`case ${c.name}: PASS\n`); }
      else { failed += 1; failures.push(`${c.name}: ${why}`); out(`case ${c.name}: FAIL (${why})\n`); }
      try { rmSync(d, { recursive: true, force: true }); } catch { /* tmpfs reaps */ }
    }
  } finally { try { rmSync(root, { recursive: true, force: true }); } catch { /* tmpfs reaps */ } }
  if (failed) {
    for (const failure of failures) err(`receipt-attest: SELFTEST FAIL ${failure}\n`);
    out('ATTEST_SELFTEST: FAIL\n');
    process.exit(1);
  }
  out(`ATTEST_SELFTEST: PASS (${passed}/${SELFTEST_CASES.length})\n`);
  process.exit(0);
}

const argv = process.argv.slice(2);
if (argv.length === 1 && (argv[0] === '--selftest' || argv[0] === '-t')) selftest();
if (argv.length === 0) usage('no subcommand');
const mode = argv[0];
const rest = argv.slice(1);
if (mode === 'run') doRun(rest);
else if (mode === 'verify') doVerify(rest);
else if (mode === '--help' || mode === '-h') {
  out('usage: receipt-attest.mjs run --out <base> [--stdin] -- <cmd...>\n');
  out('       receipt-attest.mjs verify [--ledger <dir>] <file>\n');
  out('       receipt-attest.mjs --selftest\n');
  process.exit(0);
} else usage(`unknown subcommand ${JSON.stringify(mode)}`);
