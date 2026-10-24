#!/usr/bin/env node
/**
 * mutants.mjs — ExecSelftestArms discrimination check (round 51 wave 1).
 *
 *   node mutants.mjs <candidate.mjs> <run-cases.mjs>
 *
 * Answers one question: does the case list in selftest-plan.md actually DISCRIMINATE? A case
 * list that passes every broken implementation is worthless. This applies literal single-site
 * mutants to a candidate implementation (and a static-forger stub that only prints verdict
 * strings) and reports which cases kill each mutant. A mutant that SURVIVES names the case
 * that must be strengthened.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [candidate, runner] = process.argv.slice(2);
if (!candidate || !runner) { process.stderr.write('USAGE: node mutants.mjs <candidate.mjs> <run-cases.mjs>\n'); process.exit(64); }

const src = readFileSync(candidate, 'utf8');
const work = mkdtempSync(join(tmpdir(), 'attest-mutants.'));

/** [id, description, find, replace] — literal single-site edits. */
const MUTANTS = [
  ['M01', 'inner-digest check disabled (accept any digest)', "if (digestOf(obj) !== obj.digest) { emit('RECEIPT: REPLAY'); process.exit(1); }", "if (false) { emit('RECEIPT: REPLAY'); process.exit(1); }"],
  ['M02', 'sidecar comparison disabled (accept any sidecar)', "if (side !== sha256(bytes)) { emit('RECEIPT: TAMPERED'); process.exit(1); }", "if (false) { emit('RECEIPT: TAMPERED'); process.exit(1); }"],
  ['M03', 'missing sidecar accepted as VALID', "if (!existsSync(sidePath)) { emit('RECEIPT: TAMPERED'); process.exit(1); }", "if (!existsSync(sidePath)) { emit('RECEIPT: VALID'); process.exit(0); }"],
  ['M04', 'ledger nonce check disabled', "if (other.nonce && other.nonce === obj.nonce) { emit('RECEIPT: REPLAY'); process.exit(1); }", "if (false) { emit('RECEIPT: REPLAY'); process.exit(1); }"],
  ['M05', 'verdict literal swapped: TAMPERED -> REPLAY', "emit('RECEIPT: TAMPERED'); process.exit(1);", "emit('RECEIPT: REPLAY'); process.exit(1);"],
  ['M06', 'clock-order check disabled', "if (!(Number.isFinite(ws) && Number.isFinite(we)) || we < ws || !(Number(obj.mono_ns) >= 0)) {", "if (false) {"],
  ['M07', 'digest computed over the body WITH the digest field (self-referential)', "const c = { ...obj };\n  delete c.digest;", "const c = { ...obj };"],
  ['M08', 'canonical JSON no longer key-sorted', "for (const k of Object.keys(v).sort()) o[k] = canonical(v[k]);", "for (const k of Object.keys(v)) o[k] = canonical(v[k]);"],
  ['M09', 'nonce drawn from a constant (not random)', "const nonce = randomBytes(16).toString('hex');", "const nonce = '0'.repeat(32);"],
  ['M10', 'nonce truncated to 8 hex chars (32 bits)', "const nonce = randomBytes(16).toString('hex');", "const nonce = randomBytes(4).toString('hex');"],
  ['M11', 'exit code not recorded (always 0)', "const exit = typeof res.status === 'number' ? res.status : 128;", "const exit = 0;"],
  ['M12', 'stdout/stderr hashes replaced by a constant', "stderr_sha256: sha256(stderr),\n    stdout_sha256: sha256(stdout),", "stderr_sha256: '0'.repeat(64),\n    stdout_sha256: '0'.repeat(64),"],
  ['M13', 'usage error exits 0 instead of 64', "process.exit(64);", "process.exit(0);"],
  ['M14', 'unreadable receipt exits 1 instead of 2', "process.exit(2);", "process.exit(1);"],
  ['M15', 'environment leaked into the receipt body', "nonce,\n    stderr_sha256: sha256(stderr),", "nonce,\n    env_SECRET: process.env.KUMITATE_SENTINEL_SECRET || '',\n    stderr_sha256: sha256(stderr),"],
  ['M16', 'ledger skips the subject file by CONTENT (ignores other files with same nonce)', "if (basename(e) === mine) continue;", "if (basename(e) === mine) continue;\n      if (other.nonce === obj.nonce) continue;"],
];

const rows = [];
for (const [id, desc, find, repl] of MUTANTS) {
  if (!src.includes(find)) { rows.push({ id, desc, status: 'NOT-APPLICABLE', killed: [] }); continue; }
  const p = join(work, `${id}.mjs`);
  writeFileSync(p, src.replace(find, repl));
  const r = spawnSync(process.execPath, [runner, p], { encoding: 'utf8', timeout: 300_000 });
  const killed = [];
  for (const line of `${r.stdout || ''}`.split('\n')) {
    const m = /^CASE (\S+) .*: FAIL/.exec(line);
    if (m) killed.push(m[1]);
  }
  rows.push({ id, desc, status: killed.length ? 'KILLED' : 'SURVIVED', killed, exit: r.status });
}

// Static-forger stub: prints the verdict strings with no real logic (the round's declared
// do-nothing control). A good case list must NOT pass it.
const stub = `#!/usr/bin/env node
if (process.argv.includes('--selftest')) {
  for (let i = 0; i < 12; i++) process.stdout.write('ATTEST_CASE: c' + i + ': PASS\\n');
  process.stdout.write('ATTEST_SELFTEST: PASS\\n');
  process.exit(0);
}
process.stdout.write('RECEIPT: VALID\\n');
process.exit(0);
`;
const stubPath = join(work, 'static-forger.mjs');
writeFileSync(stubPath, stub);
const sr = spawnSync(process.execPath, [runner, stubPath], { encoding: 'utf8', timeout: 120_000 });
const stubKilled = [];
for (const line of `${sr.stdout || ''}`.split('\n')) {
  const m = /^CASE (\S+) .*: FAIL/.exec(line);
  if (m) stubKilled.push(m[1]);
}

for (const row of rows) {
  process.stdout.write(`${row.id} ${row.status}: ${row.desc}${row.killed.length ? ` [killed by ${row.killed.join(',')}]` : ''}\n`);
}
const survivors = rows.filter((r) => r.status === 'SURVIVED');
process.stdout.write(`MUTANTS: ${rows.filter((r) => r.status === 'KILLED').length}/${rows.length} killed; survivors=${survivors.map((s) => s.id).join(',') || 'none'}\n`);
process.stdout.write(`STATIC_FORGER: ${stubKilled.length ? `REJECTED (${stubKilled.length} cases fail: ${stubKilled.join(',')})` : 'ACCEPTED — THE CASE LIST DOES NOT DISCRIMINATE'}\n`);
process.exit(survivors.length === 0 && stubKilled.length > 0 ? 0 : 1);
