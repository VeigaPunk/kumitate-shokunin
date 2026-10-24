#!/usr/bin/env node
/**
 * build-control.mjs — scratch control builder for kumitate round-51 item
 * ExecForgerControl (do-nothing / static-forger control for C1 / rule A51).
 *
 * Materializes scratch lanes that MIMIC the lane layout and are scored by the
 * FROZEN counter `.ufo/waves/round-51/probe/attest51-probe.mjs`:
 *   scripts/receipt-attest.mjs        stub, zero verification logic
 *   scripts/proxy-check.mjs           (optional) forger-owned stand-in
 *   SCORECARD.md                      carries pin.receipt-attest=<sha256(stub)>
 *   .ufo/waves/round-51/receipts/     three forged receipts + sidecars
 *                                     attest-run-2-replayed.txt (prelude-only
 *                                     rewrite, sidecar untouched)
 *   .ufo/waves/round-50/ReRunB49-1.txt  prior-corpus mimic (A4 sweep arm)
 *
 * Each scratch lane is its own git repo with exactly one commit.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = process.argv[2] ?? '/tmp/forgerctl';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const sha = (b) => createHash('sha256').update(b).digest('hex');

const STUB_STATIC = `#!/usr/bin/env node
// STATIC-FORGER STUB (round-51 control artifact; ZERO verification logic).
const a = process.argv.slice(2);
if (a[0] === '--selftest') { process.stdout.write('ATTEST_SELFTEST: PASS\\n'); process.exit(0); }
if (a[0] === 'verify' || a[0] === 'run') { process.stdout.write('RECEIPT: VALID\\n'); process.exit(0); }
process.stderr.write('usage: receipt-attest <run|verify|--selftest>\\n');
process.exit(64);
`;

const STUB_FILENAME = `#!/usr/bin/env node
// STATIC-FORGER STUB, filename-keyed variant (round-51 control artifact).
// ZERO verification logic: no hashing, no digest recomputation, no sidecar
// comparison, no ledger walk. The printed verdict is keyed only on whether the
// target path contains the string "replayed".
const a = process.argv.slice(2);
if (a[0] === '--selftest') { process.stdout.write('ATTEST_SELFTEST: PASS\\n'); process.exit(0); }
if (a[0] === 'verify' || a[0] === 'run') {
  const target = a[a.length - 1] || '';
  if (target.includes('replayed')) { process.stdout.write('RECEIPT: TAMPERED\\n'); process.exit(1); }
  process.stdout.write('RECEIPT: VALID\\n'); process.exit(0);
}
process.stderr.write('usage: receipt-attest <run|verify|--selftest>\\n');
process.exit(64);
`;

const FAKE_PROXY = `#!/usr/bin/env node
// FORGER-OWNED proxy-check stand-in (round-51 control artifact): prints the
// verdict line the frozen counter's A5 arm looks for, with no measurement.
process.stdout.write('PROXY: MATCH\\n');
process.exit(0);
`;

function receiptBytes({ nonce, argv, exit, out, err, wallStart, wallEnd, spanMs, runAt }) {
  const body = {
    argv, exit, nonce, span_ms: spanMs,
    sha256_err: err, sha256_out: out,
    wall_end: wallEnd, wall_start: wallStart,
  };
  const digest = sha(JSON.stringify(body));
  const full = { ...body, digest };
  const json = JSON.stringify(Object.fromEntries(Object.keys(full).sort().map((k) => [k, full[k]])));
  return Buffer.from(`run-at: ${runAt}\n${json}\n`, 'utf8');
}
const sidecar = (bytes, name) => Buffer.from(`${sha(bytes)}  ${name}\n`, 'utf8');

const NONCE_A = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const NONCE_B = '0f1e2d3c4b5a69788796a5b4c3d2e1f0';

function buildReceipts(v) {
  const preludes = ['2026-10-23T10:00:00Z', '2026-10-23T10:10:00Z', '2026-10-23T10:20:00Z'];
  const out = [];
  for (let i = 0; i < 3; i += 1) {
    const nonce = v.nonceMode === 'identical' ? NONCE_A : [NONCE_A, NONCE_B, sha(NONCE_A + 'x')][i];
    const argv = v.bytes === 'identical' ? ['echo', 'alpha'] : ['echo', `alpha-${i}`];
    out.push(receiptBytes({
      nonce, argv, exit: 0,
      out: sha(`stdout-${v.bytes === 'identical' ? 'same' : i}`),
      err: sha(`stderr-${v.bytes === 'identical' ? 'same' : i}`),
      wallStart: preludes[i], wallEnd: preludes[i], spanMs: 120,
      runAt: v.bytes === 'identical' ? preludes[0] : preludes[i],
    }));
  }
  return out;
}

function materialize(dir, v) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  mkdirSync(join(dir, '.ufo/waves/round-51/receipts'), { recursive: true });
  mkdirSync(join(dir, '.ufo/waves/round-50'), { recursive: true });
  const stub = v.stubMode === 'filename' ? STUB_FILENAME : STUB_STATIC;
  writeFileSync(join(dir, 'scripts/receipt-attest.mjs'), stub);
  if (v.proxy === 'fake') writeFileSync(join(dir, 'scripts/proxy-check.mjs'), FAKE_PROXY);
  if (v.proxy === 'real') copyFileSync(join(LANE, 'scripts/proxy-check.mjs'), join(dir, 'scripts/proxy-check.mjs'));

  const receipts = buildReceipts(v);
  for (let i = 0; i < 3; i += 1) {
    const name = `attest-run-${i + 1}.txt`;
    writeFileSync(join(dir, '.ufo/waves/round-51/receipts', name), receipts[i]);
    writeFileSync(join(dir, '.ufo/waves/round-51/receipts', `${name}.sha256`), sidecar(receipts[i], name));
  }
  // Doctored control: run-2 with ONLY the run-at prelude rewritten; the
  // sidecar still holds the ORIGINAL run-2 hash (the lesson-M2 forgery shape).
  const pre = receipts[1].toString('utf8').split('\n')[0];
  const doctored = Buffer.from(receipts[1].toString('utf8').replace(pre, 'run-at: 2026-10-23T23:59:00Z'), 'utf8');
  writeFileSync(join(dir, '.ufo/waves/round-51/receipts/attest-run-2-replayed.txt'), doctored);
  writeFileSync(join(dir, '.ufo/waves/round-51/receipts/attest-run-2-replayed.txt.sha256'), sidecar(receipts[1], 'attest-run-2.txt'));

  // Prior-corpus mimic: a round-50 receipt-like file that must NOT contain any
  // of the round-51 nonces (the counter's A4 prior-corpus sweep arm).
  writeFileSync(join(dir, '.ufo/waves/round-50/ReRunB49-1.txt'),
    'run-at=2026-10-23T09:00:00Z\ncommand: node .ufo/waves/round-49/probe/bindoracle49-probe.mjs kumitate-shokunin 0526f898\n  K1 PASS present\nBINDORACLE49: ORACLE_HELD held=6/6 checks=6 rule=B49\n');

  const stubSha = sha(Buffer.from(stub, 'utf8'));
  writeFileSync(join(dir, 'SCORECARD.md'),
    `# scratch control scorecard (round-51 ExecForgerControl)\n\n<!-- kumitate-gate-pins-v1\npin.receipt-attest=${stubSha}\n-->\n`);

  execFileSync('git', ['init', '-q', '-b', 'main', dir], { stdio: 'pipe' });
  execFileSync('git', ['-C', dir, 'add', '-A'], { stdio: 'pipe' });
  execFileSync('git', ['-C', dir,
    '-c', 'user.name=forger-control', '-c', 'user.email=control@example.invalid',
    'commit', '-q', '-m', `control variant ${v.name}`], { stdio: 'pipe' });
  const rev = execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  return { dir, rev, stubSha };
}

const variants = [
  { name: 'C1-identical-nonce-distinct-bytes', stubMode: 'static', proxy: 'fake', nonceMode: 'identical', bytes: 'distinct' },
  { name: 'C1b-identical-nonce-byte-identical', stubMode: 'static', proxy: 'fake', nonceMode: 'identical', bytes: 'identical' },
  { name: 'C2-distinct-nonce-static-stub', stubMode: 'static', proxy: 'fake', nonceMode: 'distinct', bytes: 'distinct' },
  { name: 'C3-filename-keyed-stub', stubMode: 'filename', proxy: 'fake', nonceMode: 'distinct', bytes: 'distinct' },
  { name: 'C4-filename-keyed-stub-real-proxy', stubMode: 'filename', proxy: 'real', nonceMode: 'distinct', bytes: 'distinct' },
];
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });
const built = {};
for (const v of variants) built[v.name] = materialize(join(ROOT, v.name), v);
console.log(JSON.stringify(built, null, 2));
