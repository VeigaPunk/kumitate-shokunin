#!/usr/bin/env node
/**
 * build-f1.mjs — round-51 ExecForgerControl escalation: the "argv-hashing forger".
 *
 * Question attacked: the current frozen counter (A51 v3r6, 9 checks) adds the
 * challenge arms A2c/A3c/A4c/A3d. Does A2c actually PROVE that the instrument
 * executed the probe's command?
 *
 * This forger implements the receipt FORMAT faithfully (canonical sorted-key
 * JSON, inner digest over the body minus the digest field, GNU sha256sum
 * sidecar over the exact file bytes, nonce uniqueness, ledger nonce-vs-digest
 * comparison) but NEVER EXECUTES ANY COMMAND. Its stdout hash is synthesized
 * from the LAST ARGV ELEMENT instead of from captured stdout. If the counter
 * scores this 9/9, A2c proves hash-shape, not execution.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

const ROOT = process.argv[2] ?? '/tmp/forgerctl-f1';
const DIR = join(ROOT, 'F1-argv-hashing-forger');
const sha = (b) => createHash('sha256').update(b).digest('hex');

const FORGER = `#!/usr/bin/env node
/**
 * ARGV-HASHING FORGER (round-51 control artifact).
 * Faithful receipt FORMAT; ZERO command execution. stdout_sha256 is derived
 * from the last argv element, not from captured stdout.
 */
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

const sha = (b) => createHash('sha256').update(b).digest('hex');
const sortKeys = (v) => {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  }
  return v;
};
const canon = (body) => JSON.stringify(sortKeys(body));

function parseReceipt(path) {
  const text = readFileSync(path, 'utf8');
  const line = text.split('\\n').find((l) => l.trimStart().startsWith('{'));
  if (!line) return null;
  let body;
  try { body = JSON.parse(line); } catch { return null; }
  const { digest, ...rest } = body;
  const inner = sha(Buffer.from(canon(rest), 'utf8'));
  return { body, rest, digest, innerOk: inner === digest, bytes: Buffer.from(text, 'utf8') };
}

function verdictOf(path) {
  const r = parseReceipt(path);
  if (!r) return { code: 'TAMPERED', why: 'unparseable' };
  if (!r.innerOk) return { code: 'REPLAY', why: 'inner digest mismatch' };
  let side = null;
  try { side = readFileSync(path + '.sha256', 'utf8'); } catch { return { code: 'TAMPERED', why: 'sidecar absent' }; }
  const want = sha(r.bytes);
  if (!side.includes(want)) return { code: 'TAMPERED', why: 'sidecar mismatch' };
  return { code: 'VALID', why: 'ok', nonce: r.body.nonce, digest: r.digest };
}

function runMode(args) {
  const i = args.indexOf('--');
  const outIdx = args.indexOf('--out');
  const base = args[outIdx + 1];
  const cmdArgs = i === -1 ? [] : args.slice(i + 1);
  const nonce = randomBytes(16).toString('hex');
  const now = new Date().toISOString();
  // NEVER EXECUTES: stdout hash synthesized from the last argv element.
  const stdoutSha = cmdArgs.length ? sha(Buffer.from(cmdArgs[cmdArgs.length - 1], 'utf8')) : sha(Buffer.from('', 'utf8'));
  const body = {
    argv: cmdArgs,
    exit: 0,
    mono_span_ms: 0,
    nonce,
    stderr_sha256: sha(Buffer.from('', 'utf8')),
    stdout_sha256: stdoutSha,
    wall_end: now,
    wall_start: now,
  };
  const digest = sha(Buffer.from(canon(body), 'utf8'));
  const full = { ...body, digest };
  const json = JSON.stringify(sortKeys(full));
  const bytes = Buffer.from(\`run-at: \${now}\\n\${json}\\n\`, 'utf8');
  writeFileSync(base + '.txt', bytes);
  writeFileSync(base + '.txt.sha256', \`\${sha(bytes)}  \${basename(base)}.txt\\n\`);
  process.stdout.write('RECEIPT: VALID\\n');
  process.exit(0);
}

function verifyMode(args) {
  let ledger = null;
  const li = args.indexOf('--ledger');
  if (li !== -1) ledger = args[li + 1];
  for (const a of args) {
    if (a.startsWith('--ledger=')) ledger = a.slice('--ledger='.length);
  }
  // target = last argument that is not a flag and not a flag's value
  let target = null;
  for (let i = args.length - 1; i >= 1; i -= 1) {
    const a = args[i];
    if (a.startsWith('--')) { if (a === '--ledger') i -= 1; continue; }
    target = a; break;
  }
  if (target === null) { process.stderr.write('no target\\n'); process.exit(64); }
  const v = verdictOf(target);
  if (v.code !== 'VALID') { process.stdout.write('RECEIPT: ' + v.code + '\\n'); process.exit(1); }
  if (ledger) {
    let names = [];
    try { names = readdirSync(ledger).filter((n) => n.endsWith('.txt')); } catch {}
    for (const n of names) {
      const p = join(ledger, n);
      if (p === target) continue;
      const o = parseReceipt(p);
      if (!o) continue;
      if (o.body.nonce === v.nonce && o.digest !== v.digest) {
        process.stdout.write('RECEIPT: REPLAY\\n'); process.exit(1);
      }
    }
  }
  process.stdout.write('RECEIPT: VALID\\n');
  process.exit(0);
}

const argv = process.argv.slice(2);
if (argv[0] === '--selftest') { process.stdout.write('ATTEST_SELFTEST: PASS\\n'); process.exit(0); }
if (argv[0] === 'run') { runMode(argv); }
if (argv[0] === 'verify') { verifyMode(argv); }
process.stderr.write('usage\\n'); process.exit(64);
`;

const FAKE_PROXY = `#!/usr/bin/env node
process.stdout.write('PROXY: MATCH\\n');
process.exit(0);
`;

function receiptBytes({ nonce, argv, exit, out, err, wallStart, wallEnd, spanMs, runAt }) {
  const body = { argv, exit, mono_span_ms: spanMs, nonce, stderr_sha256: err, stdout_sha256: out, wall_end: wallEnd, wall_start: wallStart };
  const digest = sha(Buffer.from(JSON.stringify(sortKeysLocal(body)), 'utf8'));
  const full = { ...body, digest };
  const json = JSON.stringify(sortKeysLocal(full));
  return Buffer.from(`run-at: ${runAt}\n${json}\n`, 'utf8');
}
function sortKeysLocal(v) {
  if (Array.isArray(v)) return v.map(sortKeysLocal);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeysLocal(v[k])]));
  return v;
}
const sidecar = (bytes, name) => Buffer.from(`${sha(bytes)}  ${name}\n`, 'utf8');

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(DIR, 'scripts'), { recursive: true });
mkdirSync(join(DIR, '.ufo/waves/round-51/receipts'), { recursive: true });
mkdirSync(join(DIR, '.ufo/waves/round-50'), { recursive: true });
writeFileSync(join(DIR, 'scripts/receipt-attest.mjs'), FORGER);
writeFileSync(join(DIR, 'scripts/proxy-check.mjs'), FAKE_PROXY);

const preludes = ['2026-10-23T10:00:00Z', '2026-10-23T10:10:00Z', '2026-10-23T10:20:00Z'];
const nonces = ['a1b2c3d4e5f60718293a4b5c6d7e8f90', '0f1e2d3c4b5a69788796a5b4c3d2e1f0', '9988776655443322110ffeeddccbbaa00'];
for (let i = 0; i < 3; i += 1) {
  const name = `attest-run-${i + 1}.txt`;
  const b = receiptBytes({
    nonce: nonces[i], argv: ['/usr/bin/printf', '%s', `payload-${i}`], exit: 0,
    out: sha(`payload-${i}`), err: sha(''),
    wallStart: preludes[i], wallEnd: preludes[i], spanMs: 120, runAt: preludes[i],
  });
  writeFileSync(join(DIR, '.ufo/waves/round-51/receipts', name), b);
  writeFileSync(join(DIR, '.ufo/waves/round-51/receipts', `${name}.sha256`), sidecar(b, name));
}
const run2 = readFileSync(join(DIR, '.ufo/waves/round-51/receipts/attest-run-2.txt'));
const pre = run2.toString('utf8').split('\n')[0];
const doctored = Buffer.from(run2.toString('utf8').replace(pre, 'run-at: 2026-10-23T23:59:00Z'), 'utf8');
writeFileSync(join(DIR, '.ufo/waves/round-51/receipts/attest-run-2-replayed.txt'), doctored);
writeFileSync(join(DIR, '.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256'), sidecar(run2, 'attest-run-2.txt'));
writeFileSync(join(DIR, '.ufo/waves/round-50/ReRunB49-1.txt'),
  'run-at=2026-10-23T09:00:00Z\ncommand: node probe\nBINDORACLE49: ORACLE_HELD held=6/6\n');

const forgerSha = sha(Buffer.from(FORGER, 'utf8'));
writeFileSync(join(DIR, 'SCORECARD.md'),
  `# scratch control scorecard\n\n<!-- kumitate-gate-pins-v1\npin.receipt-attest=${forgerSha}\n-->\n`);

execFileSync('git', ['init', '-q', '-b', 'main', DIR], { stdio: 'pipe' });
execFileSync('git', ['-C', DIR, 'add', '-A'], { stdio: 'pipe' });
execFileSync('git', ['-C', DIR, '-c', 'user.name=forger-control', '-c', 'user.email=control@example.invalid',
  'commit', '-q', '-m', 'F1 argv-hashing forger'], { stdio: 'pipe' });
const rev = execFileSync('git', ['-C', DIR, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
console.log(JSON.stringify({ dir: DIR, rev, forgerSha }, null, 2));
