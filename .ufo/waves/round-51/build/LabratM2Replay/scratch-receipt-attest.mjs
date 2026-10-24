#!/usr/bin/env node
/**
 * receipt-attest.mjs — SCRATCH implementation of contract `kumitate-receipt-attest-v1`
 * (kumitate round 51, plan.md §C1), built by seat kumitate-r51.LooseSwan for the
 * LabratM2Replay bounded probe only. The shipped instrument is owned by seat
 * ExecInstrument (build/ExecInstrument/receipt-attest.mjs); this file is the probe's
 * "genuine implementation" whose `verify` must reject the M2 forgery.
 *
 * Contract as implemented (from plan.md §C1):
 *   run --out <base> -- <cmd...>   -> <base>.txt + <base>.txt.sha256 (GNU sha256sum format)
 *   verify [--ledger <dir>] <file> -> RECEIPT: VALID (0) / RECEIPT: REPLAY (1) /
 *                                     RECEIPT: TAMPERED (1) / usage 64 / unreadable 2
 *   --selftest                      -> hermetic suite
 *
 * Receipt bytes = `run-at: <ISO>\n` + one canonical-JSON line (recursively sorted keys)
 * whose `digest` = sha256 over that canonical JSON line with the `digest` field removed.
 * The inner digest therefore binds the semantic fields of the JSON line; the `run-at:`
 * prelude is a display line and is NOT covered by the inner digest. The sidecar covers
 * the WHOLE receipt file (prelude + JSON), so a prelude edit breaks the sidecar but
 * not the inner digest.
 *
 * PROBE KNOBS (environment; this scratch build only — NOT part of the contract, and
 * deliberately absent from the shipped instrument):
 *   RECEIPT_ATTEST_LEDGER=l1frozen|intact|literal
 *       l1frozen (default) = plan.md freeze-repair addendum #4 (2026-10-24): the ledger
 *                          flags a nonce only when another receipt file binds the SAME
 *                          nonce to a DIFFERENT record digest; the target file itself and
 *                          byte-identical duplicates (same digest) are exempt.
 *       intact            = only receipts that are themselves intact (inner digest
 *                          recomputes AND their own sidecar matches) count as nonce-
 *                          reuse evidence.
 *       literal           = plan.md §C1 read literally: every other *.txt file's nonce
 *                          counts, intact or not.
 *   RECEIPT_ATTEST_PRELUDE_BIND=0|1
 *       1 = verify additionally requires the `run-at:` prelude to equal the digest-bound
 *           `wall_start` field (so a prelude rewrite is detected even when the forger
 *           recomputes the sidecar).
 *       0 (default) = no such cross-check; the prelude is display-only.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const CONTRACT = 'kumitate-receipt-attest-v1';
const LEDGER_RULE = ['l1frozen', 'intact', 'literal'].includes(process.env.RECEIPT_ATTEST_LEDGER)
  ? process.env.RECEIPT_ATTEST_LEDGER
  : 'l1frozen';
const PRELUDE_BIND = process.env.RECEIPT_ATTEST_PRELUDE_BIND === '1';

const sha = (b) => createHash('sha256').update(b).digest('hex');

/** canonical JSON: recursively sorted keys, no whitespace */
function canon(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (typeof v === 'object') {
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

const semanticOf = (o) => {
  const c = { ...o };
  delete c.digest;
  return c;
};
const innerDigest = (o) => sha(Buffer.from(canon(semanticOf(o)), 'utf8'));

/** parse a receipt file into {prelude, json, jsonLine} */
function parseReceipt(bytes) {
  const text = bytes.toString('utf8');
  const lines = text.split('\n');
  const prelude = lines.find((l) => l.startsWith('run-at:')) ?? null;
  const jsonLine = lines.find((l) => l.trimStart().startsWith('{')) ?? null;
  if (!prelude || !jsonLine) return { prelude, json: null, jsonLine: null };
  let json = null;
  try { json = JSON.parse(jsonLine); } catch { json = null; }
  return { prelude, json, jsonLine };
}

const sidecarHash = (bytes) => {
  const text = bytes.toString('utf8').trim().split(/\s+/)[0] ?? '';
  return /^[0-9a-f]{64}$/.test(text) ? text : null;
};

const preludeValue = (prelude) => (prelude ? prelude.slice('run-at:'.length).trim() : null);

// ---------------------------------------------------------------- run
function cmdRun(argv) {
  let out = null;
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--out') { out = argv[i + 1]; i += 1; }
    else if (a.startsWith('--out=')) { out = a.slice(6); }
    else if (a === '--') { rest.push(...argv.slice(i + 1)); break; }
    else { process.stderr.write(`RECEIPT: USAGE unknown arg ${a}\n`); process.exit(64); }
  }
  if (!out || rest.length === 0) {
    process.stderr.write('RECEIPT: USAGE run --out <base> -- <cmd...>\n');
    process.exit(64);
  }
  const base = resolve(out);
  mkdirSync(dirname(base), { recursive: true });
  const wallStartMs = Date.now();
  const wallStart = new Date(wallStartMs).toISOString();
  const mono0 = process.hrtime.bigint();
  const child = spawnSync(rest[0], rest.slice(1), { encoding: 'buffer', maxBuffer: 64 << 20 });
  const mono1 = process.hrtime.bigint();
  const wallEndMs = Date.now();
  const wallEnd = new Date(wallEndMs).toISOString();
  const fields = {
    argv: rest,
    exit: typeof child.status === 'number' ? child.status : 1,
    mono_ns: (mono1 - mono0).toString(),
    nonce: randomBytes(16).toString('hex'),
    stderr_sha256: sha(child.stderr ?? Buffer.alloc(0)),
    stdout_sha256: sha(child.stdout ?? Buffer.alloc(0)),
    wall_end: wallEnd,
    wall_start: wallStart,
  };
  const json = { ...fields, digest: innerDigest(fields) };
  const receipt = Buffer.from(`run-at: ${wallStart}\n${canon(json)}\n`, 'utf8');
  const receiptPath = `${base}.txt`;
  writeFileSync(receiptPath, receipt);
  writeFileSync(`${receiptPath}.sha256`, `${sha(receipt)}  ${basename(receiptPath)}\n`);
  process.stdout.write(`RECEIPT: WRITTEN ${receiptPath}\n`);
  process.exit(0);
}

// ---------------------------------------------------------------- verify
function cmdVerify(argv) {
  let ledger = null;
  const files = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--ledger') { ledger = argv[i + 1]; i += 1; }
    else if (a.startsWith('--ledger=')) { ledger = a.slice(9); }
    else files.push(a);
  }
  if (files.length !== 1) {
    process.stderr.write('RECEIPT: USAGE verify [--ledger <dir>] <file>\n');
    process.exit(64);
  }
  const file = resolve(files[0]);
  let bytes;
  try { bytes = readFileSync(file); } catch (e) {
    process.stderr.write(`RECEIPT: UNREADABLE ${e.code ?? e.message}\n`);
    process.exit(2);
  }
  const { prelude, json } = parseReceipt(bytes);
  if (!json) {
    process.stdout.write(`RECEIPT: TAMPERED reason=malformed-receipt file=${file}\n`);
    process.exit(1);
  }

  // (1) inner digest — binds every semantic field of the JSON line
  const recomputed = innerDigest(json);
  if (recomputed !== json.digest) {
    process.stdout.write(`RECEIPT: REPLAY reason=inner-digest-mismatch file=${file}\n`);
    process.exit(1);
  }

  // (2) nonce reuse against the ledger
  if (ledger) {
    const dir = resolve(ledger);
    let names = [];
    try { names = readdirSync(dir).filter((n) => n.endsWith('.txt')).sort(); } catch { names = []; }
    const self = basename(file);
    for (const n of names) {
      if (n === self) continue;
      const otherPath = join(dir, n);
      let otherBytes;
      try { otherBytes = readFileSync(otherPath); } catch { continue; }
      const other = parseReceipt(otherBytes);
      if (!other.json) continue;
      if (LEDGER_RULE === 'intact') {
        // A file whose own inner digest or sidecar does not check out is not a genuine
        // run and must not poison the ledger for the receipt it was derived from.
        if (innerDigest(other.json) !== other.json.digest) continue;
        const sidePath = `${otherPath}.sha256`;
        if (!existsSync(sidePath)) continue;
        if (sidecarHash(readFileSync(sidePath)) !== sha(otherBytes)) continue;
      }
      if (LEDGER_RULE === 'l1frozen') {
        // plan.md freeze-repair addendum #4: flag a nonce only when another receipt
        // binds the SAME nonce to a DIFFERENT record digest. The target file itself and
        // byte-identical duplicates (same digest) are exempt.
        if (other.json.digest === json.digest) continue;
      }
      if (other.json.nonce && other.json.nonce === json.nonce) {
        process.stdout.write(`RECEIPT: REPLAY reason=nonce-reuse file=${file} other=${n}\n`);
        process.exit(1);
      }
    }
  }

  // (3) sidecar over the whole receipt file (prelude included)
  const sidePath = `${file}.sha256`;
  if (!existsSync(sidePath)) {
    process.stdout.write(`RECEIPT: TAMPERED reason=sidecar-missing file=${file}\n`);
    process.exit(1);
  }
  if (sidecarHash(readFileSync(sidePath)) !== sha(bytes)) {
    process.stdout.write(`RECEIPT: TAMPERED reason=sidecar-mismatch file=${file}\n`);
    process.exit(1);
  }

  // (4) clock ordering
  const ws = Date.parse(json.wall_start ?? '');
  const we = Date.parse(json.wall_end ?? '');
  const mono = BigInt(json.mono_ns ?? '-1');
  if (!Number.isFinite(ws) || !Number.isFinite(we) || we < ws || mono < 0n) {
    process.stdout.write(`RECEIPT: TAMPERED reason=clock-ordering file=${file}\n`);
    process.exit(1);
  }

  // (5) optional: the display prelude must agree with the digest-bound wall_start
  if (PRELUDE_BIND && preludeValue(prelude) !== json.wall_start) {
    process.stdout.write(`RECEIPT: TAMPERED reason=prelude-disagrees-with-wall_start file=${file}\n`);
    process.exit(1);
  }

  process.stdout.write(`RECEIPT: VALID file=${file} nonce=${json.nonce} run-at=${preludeValue(prelude)}\n`);
  process.exit(0);
}

// ---------------------------------------------------------------- selftest
function cmdSelftest() {
  const cases = [];
  const ok = (name, cond, detail = '') => { cases.push({ name, ok: !!cond, detail }); };
  const dir = join('/tmp', `attest-selftest-${process.pid}`);
  spawnSync('mkdir', ['-p', dir]);

  const base = join(dir, 'r1');
  const child = spawnSync(process.execPath, [process.argv[1], 'run', '--out', base, '--', '/bin/sh', '-c', 'printf hello; printf oops 1>&2; exit 3'], { encoding: 'utf8' });
  ok('run exits 0', child.status === 0, `status=${child.status}`);
  const p = `${base}.txt`;
  ok('receipt written', existsSync(p));
  ok('sidecar written', existsSync(`${p}.sha256`));

  const parsed = parseReceipt(readFileSync(p));
  ok('prelude present', !!parsed.prelude, parsed.prelude ?? '');
  ok('json present', !!parsed.json);
  ok('digest binds fields', parsed.json && innerDigest(parsed.json) === parsed.json.digest);
  ok('nonce is 128-bit hex', parsed.json && /^[0-9a-f]{32}$/.test(parsed.json.nonce));
  ok('sidecar matches bytes', sidecarHash(readFileSync(`${p}.sha256`)) === sha(readFileSync(p)));
  ok('canonical json sorted', parsed.jsonLine === canon(parsed.json));

  const v = spawnSync(process.execPath, [process.argv[1], 'verify', p], { encoding: 'utf8' });
  ok('verify VALID', v.status === 0 && /RECEIPT: VALID/.test(v.stdout), `status=${v.status} ${v.stdout.trim()}`);

  // flake injection: doctor a digest-bound semantic field -> inner digest breaks -> REPLAY
  const flake = join(dir, 'flake.txt');
  const fj = { ...parsed.json };
  fj.exit = 0;
  writeFileSync(flake, `run-at: ${fj.wall_start}\n${canon(fj)}\n`);
  writeFileSync(`${flake}.sha256`, `${sha(readFileSync(flake))}  flake.txt\n`);
  const fv = spawnSync(process.execPath, [process.argv[1], 'verify', flake], { encoding: 'utf8' });
  ok('flake injection reads REPLAY', fv.status === 1 && /RECEIPT: REPLAY/.test(fv.stdout), `status=${fv.status} ${fv.stdout.trim()}`);

  // sidecar mismatch -> TAMPERED
  const tam = join(dir, 'tam.txt');
  writeFileSync(tam, readFileSync(p));
  writeFileSync(`${tam}.sha256`, `${'0'.repeat(64)}  tam.txt\n`);
  const tv = spawnSync(process.execPath, [process.argv[1], 'verify', tam], { encoding: 'utf8' });
  ok('sidecar mismatch reads TAMPERED', tv.status === 1 && /RECEIPT: TAMPERED/.test(tv.stdout), `status=${tv.status} ${tv.stdout.trim()}`);

  // prelude-only edit with the old sidecar kept -> TAMPERED (the M2 forgery)
  const forged = join(dir, 'forged.txt');
  const text = readFileSync(p, 'utf8').replace(/^run-at: .*$/m, `run-at: ${new Date(Date.now() + 3600_000).toISOString()}`);
  writeFileSync(forged, text);
  writeFileSync(`${forged}.sha256`, readFileSync(`${p}.sha256`));
  const gv = spawnSync(process.execPath, [process.argv[1], 'verify', forged], { encoding: 'utf8' });
  ok('prelude replay reads TAMPERED', gv.status === 1 && /RECEIPT: TAMPERED/.test(gv.stdout), `status=${gv.status} ${gv.stdout.trim()}`);

  // ledger: two DISTINCT records sharing a nonce -> REPLAY
  // (the body must differ, so the record digest differs: a byte-identical duplicate is
  //  a different thing and is handled by the distinct-sha arm, not by the ledger)
  const led = join(dir, 'ledger');
  spawnSync('mkdir', ['-p', led]);
  const a = join(led, 'a.txt');
  const b = join(led, 'b.txt');
  const aj = { ...parsed.json };
  const bfields = { ...aj };
  delete bfields.digest;
  bfields.nonce = aj.nonce;
  bfields.wall_end = new Date(Date.parse(aj.wall_end) + 1000).toISOString();
  const bfull = { ...bfields, digest: innerDigest(bfields) };
  writeFileSync(a, `run-at: ${aj.wall_start}\n${canon(aj)}\n`);
  writeFileSync(`${a}.sha256`, `${sha(readFileSync(a))}  a.txt\n`);
  writeFileSync(b, `run-at: ${aj.wall_start}\n${canon(bfull)}\n`);
  writeFileSync(`${b}.sha256`, `${sha(readFileSync(b))}  b.txt\n`);
  const lv = spawnSync(process.execPath, [process.argv[1], 'verify', '--ledger', led, a], { encoding: 'utf8' });
  ok('ledger nonce reuse reads REPLAY', lv.status === 1 && /RECEIPT: REPLAY/.test(lv.stdout), `status=${lv.status} ${lv.stdout.trim()}`);

  const uv = spawnSync(process.execPath, [process.argv[1], 'verify'], { encoding: 'utf8' });
  ok('usage exit 64', uv.status === 64, `status=${uv.status}`);
  const xv = spawnSpawnUnreadable(dir);
  ok('unreadable exit 2', xv === 2, `status=${xv}`);

  const passed = cases.filter((c) => c.ok).length;
  for (const c of cases) process.stdout.write(`SELFTEST ${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? ` (${c.detail})` : ''}\n`);
  process.stdout.write(`ATTEST_SELFTEST: ${passed === cases.length ? 'PASS' : 'FAIL'} ${passed}/${cases.length} contract=${CONTRACT}\n`);
  process.exit(passed === cases.length ? 0 : 1);
}

function spawnSpawnUnreadable(dir) {
  const xv = spawnSync(process.execPath, [process.argv[1], 'verify', join(dir, 'nope.txt')], { encoding: 'utf8' });
  return xv.status;
}

// ---------------------------------------------------------------- main
const argv = process.argv.slice(2);
const cmd = argv[0];
if (cmd === 'run') cmdRun(argv.slice(1));
else if (cmd === 'verify') cmdVerify(argv.slice(1));
else if (cmd === '--selftest') cmdSelftest();
else {
  process.stderr.write(`RECEIPT: USAGE ${CONTRACT} run --out <base> -- <cmd...> | verify [--ledger <dir>] <file> | --selftest\n`);
  process.exit(64);
}
