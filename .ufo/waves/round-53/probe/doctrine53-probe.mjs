#!/usr/bin/env node
/**
 * doctrine53-probe.mjs — FROZEN counter for kumitate round 53, claim C2 (rule `D53`).
 *
 *   node .ufo/waves/round-53/probe/doctrine53-probe.mjs <lane> <rev>
 *
 * Counter for the third sourced entry of the durable-execution research line
 * (frontier band, PROVINCE.md): receipt identity and the ledger evidence set —
 * why a receipt's identity is its canonical-JSON record digest (not whole-file bytes,
 * which trailing-newline variance separates from record identity), why the ledger's
 * evidence set is the whole directory (not a filename-extension subset), grounded in
 * RFC 8785 JCS (S104, tier A) and the sha256sum(1) text-mode contract (S105, tier B).
 * Freeze history: v1 is the first version of this rule; it mirrors rule D52 (round 52)
 * with the entry and row ids changed. Frozen AND executed at base before any data seat
 * ran (base/doctrine53-base.txt, QUALITY Q43), with a scratch-HELD witness of a
 * synthetic conformant post-state committed at freeze (witness/scratch-held-doctrine.txt,
 * lesson M5).
 *
 * Scores five checks over the committed bytes of <rev> (extracted with `git archive`,
 * never the working tree):
 *   E1  corpus/knowledge/receipt-identity-canonicalization.md exists at rev; its
 *       provenance trio (`source:` citing S104 with an rfc-editor.org/rfc/rfc8785 URL
 *       and the companion row S105, `verified-at:`, `recheck:`) appears within its
 *       first five lines.
 *   E2  >=12 clause lines (lines starting with `- `), each carrying a
 *       `receipt:<repo-path>@sha256:<64hex>` binding whose path is DISTINCT across the
 *       clause set and exists at rev as a blob with a matching sha256.
 *   E3  corpus/SOURCES.md at rev carries rows S104 and S105 with status `mined` and a
 *       used-by cell naming corpus/knowledge/receipt-identity-canonicalization.md.
 *   E4  `node scripts/sources-check.mjs` against the extracted tree prints
 *       `SOURCES_CHECK: CLEAN` exit 0.
 *   E5  the live census `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
 *       --root /home/vgpnk/Projects/shokunin kumitate` exits 0.
 *
 * Predicate DOCTRINE53_HELD = held=5/5, exit 0. Any other reading is
 * `DOCTRINE53_UNMET held=<k>/5` exit 1. A crash or an unreadable extraction is exit 2
 * (never a score). Frozen at `.ufo/waves/round-53/plan.md` § C2 before any data seat ran.
 *
 * The frozen predicate sentence, byte-identical with plan.md §Claims and the round
 * report —
 * DOCTRINE53_HELD — node .ufo/waves/round-53/probe/doctrine53-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE53: DOCTRINE53_HELD held=5/5 checks=5 rev=<rev> rule=D53" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'D53';
const ENTRY = 'corpus/knowledge/receipt-identity-canonicalization.md';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DOCTRINE53: USAGE node doctrine53-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DOCTRINE53: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
// Hardening (A52/D52 repair 6 carries): <rev> is interpolated into a shell pipeline;
// only full hex object names are accepted.
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('DOCTRINE53: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
class EarlyExit extends Error {}
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });

const T = mkdtempSync(join(tmpdir(), 'd53-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`DOCTRINE53: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    process.exit(2);
  }
  const ep = join(T, ENTRY);
  if (!existsSync(ep)) {
    // The entry-absent miss is recorded through the common tail so the label is always
    // derived (D52 repair 15 carries).
    hold('E1', false, 'entry-absent');
    throw new EarlyExit();
  }
  const text = readFileSync(ep, 'utf8');
  const head = text.split('\n').slice(0, 5).join('\n');

  // E1
  const e1 = /source\s*:/i.test(head) && /S104/.test(head) && /S105/.test(head)
    && /rfc-editor\.org\/rfc\/rfc8785/.test(head)
    && /verified-at\s*:/i.test(head) && /recheck\s*:/i.test(head);
  hold('E1', e1, e1 ? 'trio present' : 'trio incomplete in first 5 lines');

  // E2. Bound paths must be DISTINCT (D52 repair 13 carries) and each must be a blob
  // (`git cat-file -t`) whose sha256 matches the binding.
  const clauses = text.split('\n').filter((l) => l.startsWith('- '));
  const bound = [];
  let e2miss = 0;
  for (const l of clauses) {
    const m = /receipt:([^\s@]+)@sha256:([0-9a-f]{64})/.exec(l);
    if (!m) continue;
    bound.push(m);
  }
  const distinctPaths = new Set(bound.map(([, p]) => p)).size;
  for (const [, p, h] of bound) {
    const t = spawnSync('git', ['-C', lane, 'cat-file', '-t', `${rev}:${p}`], { encoding: 'utf8', timeout: 120_000 });
    if (t.status !== 0 || t.stdout.trim() !== 'blob') { e2miss += 1; continue; }
    const r = spawnSync('git', ['-C', lane, 'show', `${rev}:${p}`], { encoding: 'utf8', timeout: 120_000, maxBuffer: 64 << 20 });
    if (r.status !== 0) { e2miss += 1; continue; }
    if (sha(Buffer.from(r.stdout)) !== h) e2miss += 1;
  }
  const e2 = clauses.length >= 12 && bound.length >= 12 && distinctPaths >= 12 && e2miss === 0;
  hold('E2', e2, `clauses=${clauses.length} bound=${bound.length} distinct=${distinctPaths} hash-miss=${e2miss}`);

  // E3. The contract's row cells: id at index 1, status at index 8, used-by at index 11;
  // 0-3 leading spaces accepted (D52 repair 14 carries).
  const sp = join(T, 'corpus', 'SOURCES.md');
  let e3 = false; let e3d = 'SOURCES.md absent';
  if (existsSync(sp)) {
    const rows = readFileSync(sp, 'utf8').split('\n').filter((l) => /^\s{0,3}\|\s*S10[45]\s*\|/.test(l));
    const okRow = (id) => rows.some((l) => {
      const c = l.split('|').map((x) => x.trim());
      return c[1] === id && c[8] === 'mined' && c[11].includes(ENTRY);
    });
    e3 = okRow('S104') && okRow('S105');
    e3d = `rows=${rows.length} S104=${okRow('S104')} S105=${okRow('S105')}`;
  }
  hold('E3', e3, e3d);

  // E4
  const sck = spawnSync('node', [join(T, 'scripts', 'sources-check.mjs')], { cwd: T, encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20 });
  const sckLast = `${sck.stderr || ''}${sck.stdout || ''}`.trim().split('\n').pop() || '';
  const e4 = sck.status === 0 && /SOURCES_CHECK: CLEAN/.test(sckLast);
  hold('E4', e4, e4 ? 'sources-check CLEAN' : `exit=${sck.status} last=${JSON.stringify(sckLast.slice(0, 120))}`);

  // E5
  const cen = spawnSync('bash', ['-lc',
    '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate'],
    { encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20 });
  const e5 = cen.status === 0;
  hold('E5', e5, e5 ? 'census exit 0' : `exit=${cen.status} ${(`${cen.stderr || ''}${cen.stdout || ''}`).trim().slice(0, 120)}`);
} catch (e) {
  if (!(e instanceof EarlyExit)) {
    process.stderr.write(`DOCTRINE53: FAIL-CLOSED ${e.stack || e}\n`);
    process.exit(2);
  }
} finally {
  try { rmSync(T, { recursive: true, force: true }); } catch {}
}

const held = checks.filter((c) => c.ok).length;
const label = held === checks.length && checks.length > 0 ? 'DOCTRINE53_HELD' : 'DOCTRINE53_UNMET';
process.stdout.write(`DOCTRINE53: ${label} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} | ${checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail.slice(0, 90)}`}`).join(' | ')}\n`);
process.exit(held === checks.length && checks.length > 0 ? 0 : 1);
