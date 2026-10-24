#!/usr/bin/env node
/**
 * receipt-attest.mjs — capability `receipt-attest` (contract `kumitate-receipt-attest-v1`, round 51).
 *
 * Turns an invocation record into a machine-checked object: it runs a command, records WHAT was run
 * (argv, exit code, stdout/stderr sha256, a 128-bit random nonce, wall clocks and a monotonic span)
 * and binds those semantic fields with an inner digest; a GNU `sha256sum` sidecar covers the WHOLE
 * receipt file, prelude included.
 *
 *   node scripts/receipt-attest.mjs run --out <base> -- <cmd...>
 *   node scripts/receipt-attest.mjs verify [--ledger <dir>] <file>
 *   node scripts/receipt-attest.mjs --selftest
 *
 * Receipt bytes are exactly two lines (plus a trailing newline):
 *   line 1  run-at: <wall-start ISO>            — a DISPLAY prelude, bound by the sidecar only
 *   line 2  {canonical JSON, keys sorted}       — the attested record
 * The JSON line's `digest` field is the sha256 of that line's canonical JSON with the `digest`
 * field removed, so every semantic field (argv, exit, stdout/stderr sha256, nonce, wall start/end,
 * monotonic span) is bound by it. The prelude is deliberately NOT bound by the inner digest: that is
 * what makes the re-dating forgery a SIDECAR failure (RECEIPT: TAMPERED) rather than a digest
 * failure, exactly as the plan's C1 contract specifies.
 * The sidecar `<base>.txt.sha256` is GNU text mode — `<64 hex><two spaces><basename>\n` — and covers
 * the exact receipt bytes. Its name is the receipt's BASENAME, so `sha256sum -c` resolves it against
 * the receipt's own directory (the probe does that); `verify` NEVER resolves the recorded name: it
 * locates the sidecar next to the RECEIPT (`<file>.sha256`, resolved against the receipt's directory,
 * never against the process cwd) and compares hashes only.
 *
 * Verdicts (the verdict is the LAST line of the output; diagnostics precede it):
 *   RECEIPT: VALID      exit 0   inner digest, sidecar, clocks and ledger all agree
 *   RECEIPT: REPLAY     exit 1   inner-digest mismatch, or a nonce reused by a DIFFERENT record
 *   RECEIPT: TAMPERED   exit 1   sidecar mismatch/absent, or an internally inconsistent record
 *   receipt-attest: USAGE ...        exit 64
 *   receipt-attest: UNREADABLE ...   exit 2  (fail-closed: the receipt could not be evaluated at all)
 *
 * Exit map: 0 valid · 1 a real defect (replay or tampering) · 2 fail-closed · 64 usage.
 *
 * What it closes (round-50 lesson M2): a receipt re-dated by rewriting ONLY its `run-at:` prelude
 * fails verification — the sidecar covers the whole file, prelude included (RECEIPT: TAMPERED) — and
 * a receipt forged from an old body's nonce fails the ledger (RECEIPT: REPLAY). A forger who also
 * recomputes the sidecar still hits the ledger, because the nonce is reused by a DIFFERENT record.
 *
 * What it does NOT claim (QUALITY Q39 ceiling, kept verbatim): a receipt is an author-attested
 * invocation record with a machine-checkable integrity layer — NOT cryptographic proof of WHEN the
 * bytes were made. `verify` proves the record was not altered after the fact and that a nonce is
 * not reused across distinct records; it cannot prove the wall clock told the truth.
 *
 * No environment is recorded and no secret material is written: a receipt carries argv, the exit
 * code, output HASHES and clocks only (QUALITY Q42 class). The child inherits the caller's
 * environment because it has to run, but nothing of it reaches the receipt.
 *
 * The ledger arm (plan § C1, freeze-repair addendum item 4): a nonce is flagged ONLY when another
 * `*.txt` receipt in the ledger directory binds the SAME nonce to a DIFFERENT record digest. The
 * subject file itself and byte-identical duplicates (same digest) are EXEMPT — the doctored M2
 * control shares run-2's nonce in the same directory, and a literal "reject any nonce already
 * present" reading makes the frozen A4 arm unpassable. Only attested receipts (sidecar and inner
 * digest both check out) count as ledger evidence, so a forgery is never treated as a prior
 * invocation. Reuse across DISTINCT records is what the ledger detects.
 *
 * `run` exits 0 once the receipt pair is on disk (the attestation succeeded); the COMMAND's own exit
 * code is recorded in the receipt and printed as `receipt-attest: command-exit <n>`.
 *
 * Implementation constraints: no dependencies, and every digest is computed with node:crypto
 * (`createHash('sha256')`) — the instrument never spawns `sha256sum` or any other digest binary.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { constants as osConstants, tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CONTRACT = 'kumitate-receipt-attest-v1';
const SELF = fileURLToPath(import.meta.url);
const NONCE_BYTES = 16; // 128 bits
const PRELUDE_SLACK_MS = 60_000; // the display prelude may sit this far outside the wall window

const out = (s) => process.stdout.write(s);
const err = (s) => process.stderr.write(s);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const usage = (why) => {
  err(`receipt-attest: USAGE ${why} (contract ${CONTRACT}: run --out <base> -- <cmd...> | verify [--ledger <dir>] <file> | --selftest)\n`);
  process.exit(64);
};

const unreadable = (why) => {
  err(`receipt-attest: UNREADABLE ${why}\n`);
  process.exit(2);
};

/**
 * Canonical JSON — the contract form, byte for byte: recursively sorted keys, one line, no
 * insignificant whitespace, produced by `JSON.stringify` over a key-sorted copy. The inner digest
 * is sha256 over these exact bytes, so any other implementation that follows this form agrees.
 */
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]));
  }
  return value;
};
const canonical = (value) => JSON.stringify(sortKeys(value));

/** The inner digest binds every field of the record except `digest` itself. */
const digestOf = (record) => {
  const copy = { ...record };
  delete copy.digest;
  return sha256(canonical(copy));
};

const NONCE_RE = /^[0-9a-f]{32}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

/** Split receipt bytes into its display prelude and its attested JSON line. */
function splitReceipt(text) {
  const lines = text.split('\n').filter((l) => l.length > 0);
  if (lines.length !== 2) return { error: `expected 2 non-empty lines, got ${lines.length}` };
  if (!lines[0].startsWith('run-at: ')) return { error: 'first line is not a `run-at: ` prelude' };
  const runAt = lines[0].slice('run-at: '.length);
  if (!lines[1].startsWith('{')) return { error: 'second line is not a JSON object' };
  let record;
  try {
    record = JSON.parse(lines[1]);
  } catch (e) {
    return { error: `JSON line does not parse: ${String(e.message).split('\n')[0]}` };
  }
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    return { error: 'JSON line is not an object' };
  }
  return { runAt, record, jsonLine: lines[1] };
}

const SEMANTIC_FIELDS = ['argv', 'exit', 'mono_span_ms', 'nonce', 'stderr_sha256', 'stdout_sha256', 'wall_end', 'wall_start'];

function shapeError(record) {
  if (!Array.isArray(record.argv) || record.argv.some((a) => typeof a !== 'string')) return 'argv is not a string array';
  if (typeof record.exit !== 'number' || !Number.isInteger(record.exit)) return 'exit is not an integer';
  // mono_span_ms may be negative here on purpose: a negative span is a CLOCK verdict (TAMPERED), not
  // a malformed record, so the shape check admits it and the ordering check owns the verdict.
  if (typeof record.mono_span_ms !== 'number' || !Number.isInteger(record.mono_span_ms)) return 'mono_span_ms is not an integer';
  if (typeof record.nonce !== 'string' || !NONCE_RE.test(record.nonce)) return 'nonce is not 32 lowercase hex characters';
  if (typeof record.stdout_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(record.stdout_sha256)) return 'stdout_sha256 is not a sha256 hex';
  if (typeof record.stderr_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(record.stderr_sha256)) return 'stderr_sha256 is not a sha256 hex';
  if (typeof record.wall_start !== 'string' || !ISO_RE.test(record.wall_start)) return 'wall_start is not an ISO instant';
  if (typeof record.wall_end !== 'string' || !ISO_RE.test(record.wall_end)) return 'wall_end is not an ISO instant';
  return null;
}

/** The sidecar of `<file>` is `<file>.sha256` — resolved against the RECEIPT's directory. */
const sidecarPath = (file) => `${file}.sha256`;

/** GNU `sha256sum` text-mode line: hash, two spaces, the receipt's basename. */
const sidecarLine = (hash, name) => `${hash}  ${name}\n`;

/** Parse a GNU sha256sum sidecar line: hash, whitespace, optional `*`, the name. */
const parseSidecar = (text) => {
  const m = /^([0-9a-f]{64})[ \t]+[*]?(\S+)$/.exec(text.trim());
  return m ? { hash: m[1], name: m[2] } : null;
};

/**
 * `run --out <base> -- <cmd...>`: execute the command, capture it, write the receipt and its sidecar.
 * The command's own exit code is recorded in the receipt; `run` itself exits 0 once the receipt pair
 * is on disk (the attestation succeeded).
 */
function doRun(args) {
  let base = null;
  const cmd = [];
  let seenSep = false;
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (!seenSep) {
      if (a === '--') { seenSep = true; continue; }
      if (a === '--out') {
        base = args[i + 1] ?? null;
        i += 1;
        continue;
      }
      if (a.startsWith('--out=')) { base = a.slice('--out='.length); continue; }
      usage(`unexpected argument ${JSON.stringify(a)} in run mode`);
    }
    cmd.push(a);
  }
  if (!seenSep) usage('run mode needs `-- <cmd...>`');
  if (base === null || base === '') usage('run mode needs --out <base>');
  if (cmd.length === 0) usage('run mode needs a command after `--`');

  const wallStartMs = Date.now();
  const wallStart = new Date(wallStartMs).toISOString();
  const monoStart = process.hrtime.bigint();
  const r = spawnSync(cmd[0], cmd.slice(1), { encoding: 'buffer', maxBuffer: 64 << 20 });
  const monoEnd = process.hrtime.bigint();
  const wallEndMs = Date.now();
  const wallEnd = new Date(wallEndMs).toISOString();

  let stdout = r.stdout ?? Buffer.alloc(0);
  let stderr = r.stderr ?? Buffer.alloc(0);
  let exitCode;
  if (r.error) {
    // The command never ran: record the failure honestly instead of silently claiming a run.
    stderr = Buffer.from(`receipt-attest: spawn failed: ${r.error.message}\n`, 'utf8');
    stdout = Buffer.alloc(0);
    exitCode = 127;
    out(`receipt-attest: spawn failed: ${r.error.message}\n`);
  } else if (typeof r.status === 'number') {
    exitCode = r.status;
  } else {
    // Killed by a signal: report it in the shell convention rather than as a plain code.
    const signum = (r.signal && osConstants.signals[r.signal]) || 0;
    exitCode = 128 + signum;
    out(`receipt-attest: command killed by signal ${r.signal}\n`);
  }

  const record = {
    argv: cmd,
    exit: exitCode,
    mono_span_ms: Number((monoEnd - monoStart) / 1_000_000n),
    nonce: randomBytes(NONCE_BYTES).toString('hex'),
    stderr_sha256: sha256(stderr),
    stdout_sha256: sha256(stdout),
    wall_end: wallEnd,
    wall_start: wallStart,
  };
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
    unreadable(`cannot write receipt pair (${e.code ?? e.message})`);
  }
  out(`receipt-attest: wrote ${file}\n`);
  out(`receipt-attest: sidecar ${side}\n`);
  out(`receipt-attest: receipt-sha256 ${sha256(receiptBytes)}\n`);
  out(`receipt-attest: command-exit ${exitCode}\n`);
  process.exit(0);
}

/**
 * Is `file` an ATTESTED receipt? (sidecar matches its bytes AND its inner digest matches).
 * Used by the ledger arm: an unattested `*.txt` is a forgery, not a prior invocation.
 */
function attestationState(file) {
  let bytes;
  try {
    bytes = readFileSync(file);
  } catch (e) {
    return { attested: false, why: `unreadable (${e.code ?? e.message})` };
  }
  let sideText;
  try {
    sideText = readFileSync(sidecarPath(file), 'utf8');
  } catch (e) {
    return { attested: false, why: `sidecar absent (${e.code ?? e.message})` };
  }
  const side = parseSidecar(sideText);
  if (!side) return { attested: false, why: 'sidecar is not a GNU sha256sum line' };
  if (side.hash !== sha256(bytes)) return { attested: false, why: 'sidecar hash mismatch' };
  const parts = splitReceipt(bytes.toString('utf8'));
  if (parts.error) return { attested: false, why: parts.error };
  if (digestOf(parts.record) !== parts.record.digest) return { attested: false, why: 'inner digest mismatch' };
  return { attested: true, nonce: parts.record.nonce, digest: parts.record.digest, record: parts.record };
}

/**
 * `verify [--ledger <dir>] <file>`: recompute the inner digest, the sidecar hash and the clock
 * ordering; with --ledger, reject a nonce that another ATTESTED receipt binds to a DIFFERENT record.
 */
function doVerify(args) {
  let ledgerDir = null;
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--ledger') {
      ledgerDir = args[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (a.startsWith('--ledger=')) { ledgerDir = a.slice('--ledger='.length); continue; }
    if (a.startsWith('-')) usage(`unexpected flag ${JSON.stringify(a)} in verify mode`);
    positional.push(a);
  }
  if (positional.length !== 1) usage('verify mode needs exactly one <file>');
  const file = positional[0];
  if (ledgerDir !== null && !existsSync(ledgerDir)) unreadable(`ledger directory ${ledgerDir} does not exist`);

  let bytes;
  try {
    bytes = readFileSync(file);
  } catch (e) {
    unreadable(`cannot read receipt ${file} (${e.code ?? e.message})`);
  }
  const parts = splitReceipt(bytes.toString('utf8'));
  if (parts.error) unreadable(`malformed receipt ${file}: ${parts.error}`);
  const { record, runAt } = parts;

  const shape = shapeError(record);
  if (shape) unreadable(`malformed receipt ${file}: ${shape}`);

  // 1. inner digest — binds every semantic field. A doctored body reads REPLAY here.
  const digest = digestOf(record);
  if (digest !== record.digest) {
    out(`receipt-attest: inner digest mismatch: recomputed ${digest}, recorded ${record.digest}\n`);
    out('RECEIPT: REPLAY\n');
    process.exit(1);
  }

  // 2. sidecar — covers the exact receipt bytes, the `run-at:` prelude included. The sidecar is
  //    located next to the RECEIPT (never via the recorded name, never via the process cwd).
  const side = sidecarPath(file);
  let sideText;
  try {
    sideText = readFileSync(side, 'utf8');
  } catch (e) {
    out(`receipt-attest: sidecar ${side} is absent (${e.code ?? e.message}): the receipt bytes are not vouched for\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  const parsed = parseSidecar(sideText);
  if (!parsed) {
    out(`receipt-attest: sidecar ${side} is not a GNU sha256sum line\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }
  const actual = sha256(bytes);
  if (parsed.hash !== actual) {
    out(`receipt-attest: sidecar mismatch: sidecar ${parsed.hash}, actual ${actual}\n`);
    out('RECEIPT: TAMPERED\n');
    process.exit(1);
  }

  // 3. clock ordering — a record whose own clocks are inconsistent is not a genuine run.
  const startMs = Date.parse(record.wall_start);
  const endMs = Date.parse(record.wall_end);
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

  // 4. ledger — a nonce reused by a DIFFERENT attested record is a replay. The subject file and
  //    byte-identical duplicates (same record digest) are exempt (freeze-repair addendum item 4).
  if (ledgerDir !== null) {
    let names = [];
    try {
      names = readdirSync(ledgerDir);
    } catch (e) {
      unreadable(`cannot list ledger directory ${ledgerDir} (${e.code ?? e.message})`);
    }
    const selfPath = resolve(file);
    for (const name of names.sort()) {
      if (!name.endsWith('.txt')) continue;
      const other = join(ledgerDir, name);
      if (resolve(other) === selfPath) continue;
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

  // 5. the display prelude must sit inside the record's own wall window (defence in depth for the
  //    re-dating forgery: a forger who repaired the sidecar AND kept the nonce fresh still moves the
  //    prelude out of the window). The bounds are min/max so that a record with an INVERTED window is
  //    judged by check 3 alone — each check stays independently observable. The ledger arm runs
  //    FIRST: a reused nonce is the stronger claim.
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
const lastLine = (r) => `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').filter((l) => l.length).pop() || '';

/** Build a genuine receipt pair in `dir` and return its paths. */
function makeReceipt(dir, name, cmd) {
  const base = join(dir, name);
  const r = tool(['run', '--out', base, '--', ...cmd]);
  return { base, file: `${base}.txt`, side: `${base}.txt.sha256`, run: r };
}

const NODE_ECHO = (text) => [process.execPath, '-e', `process.stdout.write(${JSON.stringify(text)})`];

/** Rewrite a receipt file and its sidecar consistently (a doctorer who repairs both). */
function rewriteConsistently(rec, mutate) {
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  mutate(body, lines);
  lines[1] = canonical(body);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
}

case_('run-writes-receipt-and-sidecar', (d) => {
  const rec = makeReceipt(d, 'r1', NODE_ECHO('hello'));
  const problems = [];
  if (rec.run.status !== 0) problems.push(`run exit ${rec.run.status}`);
  if (!existsSync(rec.file)) problems.push('receipt absent');
  if (!existsSync(rec.side)) problems.push('sidecar absent');
  return problems.length ? problems.join('; ') : null;
});

case_('receipt-shape-is-prelude-plus-json-line', (d) => {
  const rec = makeReceipt(d, 'r2', NODE_ECHO('x'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const problems = [];
  if (lines.length !== 3 || lines[2] !== '') problems.push(`expected 2 lines + trailing newline, got ${JSON.stringify(lines)}`);
  if (!/^run-at: \d{4}-\d{2}-\d{2}T/.test(lines[0])) problems.push(`prelude malformed: ${JSON.stringify(lines[0])}`);
  if (!lines[1].startsWith('{')) problems.push('second line is not JSON');
  return problems.length ? problems.join('; ') : null;
});

case_('sidecar-is-gnu-text-mode-basename', (d) => {
  const rec = makeReceipt(d, 'r3', NODE_ECHO('y'));
  const side = readFileSync(rec.side, 'utf8');
  const m = /^([0-9a-f]{64})  (\S+)\n$/.exec(side);
  if (!m) return `sidecar is not a GNU text-mode line: ${JSON.stringify(side)}`;
  if (m[1] !== sha256(readFileSync(rec.file))) return 'sidecar hash does not cover the receipt bytes';
  if (m[2] !== basename(rec.file)) return `sidecar names ${m[2]}, expected the basename ${basename(rec.file)}`;
  return null;
});

case_('sidecar-hash-is-computed-with-node-crypto', (d) => {
  // The instrument never shells out for a digest: the sidecar hash must equal the sha256 of the
  // receipt bytes computed in-process, and must be a plain lowercase hex digest.
  const rec = makeReceipt(d, 'r3b', NODE_ECHO('y'));
  const side = readFileSync(rec.side, 'utf8').trim();
  const want = sha256(readFileSync(rec.file));
  if (!/^[0-9a-f]{64}$/.test(side.split(/\s+/)[0])) return `sidecar hash is not a bare hex digest: ${JSON.stringify(side)}`;
  if (side.split(/\s+/)[0] !== want) return 'sidecar hash is not the in-process sha256 of the receipt bytes';
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
  const r = tool(['verify', rec.file]);
  if (r.status !== 0) return `exit ${r.status}: ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: VALID') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('flake-injection-doctored-body-reads-replay', (d) => {
  // CONTRACT ARM: a doctored body with a STALE digest must read REPLAY (the inner digest binds
  // every semantic field), even though the sidecar is stale too — the digest is checked first.
  const rec = makeReceipt(d, 'f1', NODE_ECHO('f'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  body.exit = body.exit === 0 ? 1 : 0;
  lines[1] = canonical(body);
  writeFileSync(rec.file, lines.join('\n'));
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: REPLAY') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('digest-field-corrupted-with-recomputed-sidecar-reads-replay', (d) => {
  // A3d shape: only the `digest` FIELD is corrupted (constant hex, body untouched) and the sidecar
  // is recomputed to match the doctored bytes. A sidecar-only verifier would pass this; the
  // recomputed inner digest must reject it as REPLAY.
  const rec = makeReceipt(d, 'fd', NODE_ECHO('fd'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  const body = JSON.parse(lines[1]);
  body.digest = 'f'.repeat(64);
  lines[1] = canonical(body);
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file)));
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: REPLAY') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('sidecar-mismatch-reads-tampered', (d) => {
  // CONTRACT ARM: the sidecar hash flipped by one nibble, receipt bytes untouched -> TAMPERED.
  const rec = makeReceipt(d, 't1', NODE_ECHO('t'));
  const side = readFileSync(rec.side, 'utf8');
  const flipped = side[0] === '0' ? '1' : '0';
  writeFileSync(rec.side, `${flipped}${side.slice(1)}`);
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: TAMPERED') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('missing-sidecar-reads-tampered', (d) => {
  const rec = makeReceipt(d, 't2', NODE_ECHO('t'));
  rmSync(rec.side);
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: TAMPERED') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('prelude-only-rewrite-reads-tampered', (d) => {
  // The exact round-50 lesson-M2 forgery: rewrite ONLY the `run-at:` prelude, leave the sidecar alone.
  const rec = makeReceipt(d, 'm2', NODE_ECHO('m'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  writeFileSync(rec.file, lines.join('\n'));
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: TAMPERED') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('prelude-rewrite-with-forged-sidecar-reads-replay', (d) => {
  // The forger recomputes the sidecar too — the inner digest still holds, so only the ledger can see
  // it: the forged record reuses the original's nonce but binds a DIFFERENT record digest.
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
  const r = tool(['verify', '--ledger', d, rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: REPLAY') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
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
  const r = tool(['verify', '--ledger', d, file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: REPLAY') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('ledger-exempt-a-byte-identical-duplicate', (d) => {
  // Freeze-repair addendum item 4: a duplicate with the SAME record digest is not a reuse.
  const orig = makeReceipt(d, 'same1', NODE_ECHO('same'));
  const copy = join(d, 'same2.txt');
  writeFileSync(copy, readFileSync(orig.file));
  writeFileSync(`${copy}.sha256`, sidecarLine(sha256(readFileSync(copy)), basename(copy)));
  const r = tool(['verify', '--ledger', d, copy]);
  if (r.status !== 0) return `exit ${r.status} (want 0): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: VALID') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('ledger-ignores-an-unattested-copy', (d) => {
  // A doctored copy (stale sidecar) beside the original must not poison the original's ledger check.
  const rec = makeReceipt(d, 'orig', NODE_ECHO('o'));
  const copy = join(d, 'forged.txt');
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  writeFileSync(copy, lines.join('\n'));
  writeFileSync(`${copy}.sha256`, readFileSync(rec.side, 'utf8'));
  const r = tool(['verify', '--ledger', d, rec.file]);
  if (r.status !== 0) return `exit ${r.status} (want 0): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: VALID') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
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
  if (r.status !== 2) return `exit ${r.status} (want 2): ${(r.stderr || '').trim()}`;
  if (/RECEIPT: (VALID|REPLAY|TAMPERED)/.test(`${r.stdout || ''}${r.stderr || ''}`)) return 'printed a verdict';
  return null;
});

case_('malformed-receipt-reads-unreadable-exit-2', (d) => {
  const file = join(d, 'garbage.txt');
  writeFileSync(file, 'this is not a receipt\n');
  const r = tool(['verify', file]);
  if (r.status !== 2) return `exit ${r.status} (want 2): ${(r.stderr || '').trim()}`;
  if (/RECEIPT: (VALID|REPLAY|TAMPERED)/.test(`${r.stdout || ''}${r.stderr || ''}`)) return 'printed a verdict';
  return null;
});

case_('clock-order-violation-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'clk', NODE_ECHO('c'));
  rewriteConsistently(rec, (body) => { body.wall_end = '2000-01-01T00:00:00.000Z'; body.digest = digestOf(body); });
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: TAMPERED') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('negative-monotonic-span-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'mono', NODE_ECHO('m'));
  rewriteConsistently(rec, (body) => { body.mono_span_ms = -1; body.digest = digestOf(body); });
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: TAMPERED') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('prelude-outside-the-wall-window-reads-tampered', (d) => {
  const rec = makeReceipt(d, 'pre', NODE_ECHO('p'));
  const lines = readFileSync(rec.file, 'utf8').split('\n');
  lines[0] = 'run-at: 2020-01-01T00:00:00.000Z';
  const bytes = Buffer.from(lines.join('\n'), 'utf8');
  writeFileSync(rec.file, bytes);
  writeFileSync(rec.side, sidecarLine(sha256(bytes), basename(rec.file))); // the forger repairs the sidecar
  const r = tool(['verify', rec.file]);
  if (r.status !== 1) return `exit ${r.status} (want 1): ${(r.stderr || '').trim()}`;
  if (lastLine(r) !== 'RECEIPT: TAMPERED') return `verdict line is ${JSON.stringify(lastLine(r))}`;
  return null;
});

case_('inner-digest-covers-every-semantic-field', (d) => {
  const rec = makeReceipt(d, 'bind', NODE_ECHO('b'));
  const original = JSON.parse(readFileSync(rec.file, 'utf8').split('\n')[1]);
  const mutations = {
    argv: ['/bin/other'],
    exit: original.exit === 0 ? 1 : 0,
    mono_span_ms: 123456,
    nonce: 'f'.repeat(32),
    stderr_sha256: 'a'.repeat(64),
    stdout_sha256: 'b'.repeat(64),
    wall_end: '2030-01-01T00:00:00.000Z',
    wall_start: '2029-01-01T00:00:00.000Z',
  };
  const problems = [];
  for (const field of SEMANTIC_FIELDS) {
    const body = { ...original, [field]: mutations[field] };
    const bytes = Buffer.from(`run-at: ${body.wall_start}\n${canonical(body)}\n`, 'utf8');
    const file = join(d, `bind-${field}.txt`);
    writeFileSync(file, bytes);
    writeFileSync(`${file}.sha256`, sidecarLine(sha256(bytes), basename(file)));
    const r = tool(['verify', file]);
    if (r.status !== 1 || lastLine(r) !== 'RECEIPT: REPLAY') {
      problems.push(`${field}: exit ${r.status} ${JSON.stringify(lastLine(r))}`);
    }
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
  } finally {
    delete process.env.KUMITATE_RECEIPT_SENTINEL;
  }
});

case_('run-records-the-command-exit-code', (d) => {
  const rec = makeReceipt(d, 'ec', [process.execPath, '-e', 'process.exit(3)']);
  const body = JSON.parse(readFileSync(rec.file, 'utf8').split('\n')[1]);
  if (body.exit !== 3) return `recorded exit ${body.exit} (want 3)`;
  if (!Array.isArray(body.argv) || body.argv.length !== 3) return `argv not recorded: ${JSON.stringify(body.argv)}`;
  const r = tool(['verify', rec.file]);
  if (r.status !== 0) return `verify exit ${r.status}: ${(r.stderr || '').trim()}`;
  return null;
});

case_('run-records-output-hashes-not-output', (d) => {
  // The command prints a marker that is NOT in its argv, so the receipt can only carry its hash.
  const marker = 'kumitate-plaintext-marker-1122';
  const script = `process.stdout.write(['kumitate','plaintext','marker','1122'].join('-'))`;
  const rec = makeReceipt(d, 'hash', [process.execPath, '-e', script]);
  const text = readFileSync(rec.file, 'utf8');
  if (text.includes(marker)) return 'the captured output leaks into the receipt';
  const body = JSON.parse(text.split('\n')[1]);
  if (body.stdout_sha256 !== sha256(Buffer.from(marker, 'utf8'))) return 'stdout_sha256 does not hash the captured stdout';
  return null;
});

case_('verify-resolves-the-sidecar-next-to-the-receipt', (d) => {
  // The sidecar must be found beside the RECEIPT even when the cwd is elsewhere.
  const rec = makeReceipt(d, 'rel', NODE_ECHO('r'));
  const elsewhere = mkdtempSync(join(tmpdir(), 'receipt-attest-cwd.'));
  try {
    const r = tool(['verify', rec.file], { cwd: elsewhere });
    if (r.status !== 0) return `exit ${r.status} (want 0) from a foreign cwd: ${(r.stderr || '').trim()}`;
    if (lastLine(r) !== 'RECEIPT: VALID') return `verdict line is ${JSON.stringify(lastLine(r))}`;
    return null;
  } finally {
    try { rmSync(elsewhere, { recursive: true, force: true }); } catch { /* tmpfs reaps */ }
  }
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
      try {
        why = c.fn(d);
      } catch (e) {
        why = `threw ${String(e && e.message).split('\n')[0]}`;
      }
      if (why === null) {
        passed += 1;
        out(`ATTEST_CASE ${String(i + 1).padStart(2, '0')} ${c.name}: PASS\n`);
      } else {
        failed += 1;
        failures.push(`${c.name}: ${why}`);
        out(`ATTEST_CASE ${String(i + 1).padStart(2, '0')} ${c.name}: FAIL (${why})\n`);
      }
      try { rmSync(d, { recursive: true, force: true }); } catch { /* tmpfs reaps */ }
    }
  } finally {
    try { rmSync(root, { recursive: true, force: true }); } catch { /* tmpfs reaps */ }
  }
  out(`ATTEST_CASES: ${passed} passed, ${failed} failed\n`);
  if (failed) {
    for (const f of failures) out(`receipt-attest: SELFTEST FAIL ${f}\n`);
    out('ATTEST_SELFTEST: FAIL\n');
    process.exit(1);
  }
  out('ATTEST_SELFTEST: PASS\n');
  process.exit(0);
}

/* ------------------------------------------------------------------- dispatch */

const argv = process.argv.slice(2);
if (argv.length === 1 && (argv[0] === '--selftest' || argv[0] === '-t')) {
  selftest();
}
if (argv.length === 0) usage('no subcommand');
const mode = argv[0];
const rest = argv.slice(1);
if (mode === 'run') doRun(rest);
else if (mode === 'verify') doVerify(rest);
else if (mode === '--help' || mode === '-h') {
  out('usage: receipt-attest.mjs run --out <base> -- <cmd...>\n');
  out('       receipt-attest.mjs verify [--ledger <dir>] <file>\n');
  out('       receipt-attest.mjs --selftest\n');
  process.exit(0);
} else usage(`unknown subcommand ${JSON.stringify(mode)}`);
