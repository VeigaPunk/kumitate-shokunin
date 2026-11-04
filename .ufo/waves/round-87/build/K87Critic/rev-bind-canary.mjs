#!/usr/bin/env node
/**
 * rev-bind-canary.mjs — two-directional test of the revision clause.
 *
 * Needs a scratch clone whose WORKTREE is at <revB> and which also carries the older
 * <revA>, with `scripts/cite-check.mjs` differing between them. Two receipts, both
 * `rev=<revA>` and both carrying the digest of the bytes AT <revA>:
 *
 *   t1  judged --rev <revA>   expect CLEAN  (the bytes the receipt names are the bytes at
 *                                            the judged rev; a worktree-bound tool reads
 *                                            <revB> bytes and says DRIFT)
 *   t2  judged --rev <revB>   expect DRIFT  (the receipt claims revA but is judged at revB;
 *                                            a receipt-declared-rev tool re-uses revA and
 *                                            says CLEAN)
 *
 * usage: node rev-bind-canary.mjs <lane-clone> <revA> <revB> <tool> [<tool> ...]
 * Read-only outside a fresh mkdtemp directory. Exit 0 iff every candidate passes both
 * directions; exit 1 when any candidate inverts a direction.
 */
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [lane, revA, revB, ...tools] = process.argv.slice(2);
if (!lane || !revA || !revB || !tools.length) {
  console.error('USAGE: rev-bind-canary.mjs <lane-clone> <revA> <revB> <tool> [<tool> ...]');
  process.exit(64);
}
const rel = 'scripts/cite-check.mjs';
const show = (rev) => spawnSync('git', ['-C', lane, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
const a = show(revA);
const b = show(revB);
if (a.status !== 0 || b.status !== 0) { console.error(`MISSING ${rel} at ${revA} or ${revB}`); process.exit(2); }
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const dA = sha(a.stdout);
const dB = sha(b.stdout);
if (dA === dB) { console.error(`NO-DIVERGENCE: ${rel} identical at ${revA} and ${revB}`); process.exit(2); }

const base = mkdtempSync(join(tmpdir(), 'revbind-canary-'));
console.log(`CANARY lane=${lane}`);
console.log(`CANARY revA=${revA} digest@revA=${dA}`);
console.log(`CANARY revB=${revB} digest@revB=${dB} (worktree is at revB)`);

const body = `rev=${revA}\ntool_sha256=${dA}\ncmd=node ${rel} --selftest\nexit=0\nsignal=none\n`;
const cases = [
  { name: 't1', rev: revA, want: 0, wantRe: /CLEAN/ },
  { name: 't2', rev: revB, want: 1, wantRe: /mismatched=1\b/ },
];

let inverted = 0;
for (const tool of tools) {
  for (const c of cases) {
    const d = mkdtempSync(join(base, `${c.name}-`));
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'receipt.txt'), body);
    const r = spawnSync('node', [tool, '--dir', d, '--rev', c.rev], { cwd: lane, encoding: 'utf8' });
    const line = ((r.stdout || '') + (r.stderr || '')).match(/^RECEIPT_BIND: .*$/m);
    const got = line ? line[0] : '(no RECEIPT_BIND line)';
    const ok = r.status === c.want && c.wantRe.test(got);
    if (!ok) inverted++;
    console.log(`CANARY ${tool.split('/').pop()} ${c.name} (judged ${c.rev.slice(0, 8)}): exit=${r.status} ${got} -> ${ok ? 'OK' : 'INVERTED'}`);
    rmSync(d, { recursive: true, force: true });
  }
}
rmSync(base, { recursive: true, force: true });
console.log(`CANARY: ${inverted === 0 ? 'REV-BOUND (every candidate honours the judged revision)' : `INVERTED ${inverted} verdict(s) — candidate does not bind at the judged revision`}`);
process.exit(inverted === 0 ? 0 : 1);
