#!/usr/bin/env node
/**
 * doctrine52-probe.mjs — FROZEN counter for kumitate round 52, claim C2 (rule `D52`).
 *
 *   node .ufo/waves/round-52/probe/doctrine52-probe.mjs <lane> <rev>
 *
 * Counter for the second sourced entry of the durable-execution research line
 * (frontier band, PROVINCE.md): fail-closed clock/timestamp validation in receipt
 * verifiers, grounded in RFC 3339 (S102, tier A) and a companion source (S103).
 * Freeze history: v1 is the first version of this rule; it mirrors rule D51 (round 51)
 * with the entry and row ids changed. Frozen AND executed at base before any data seat
 * ran (base/doctrine52-base.txt, QUALITY Q43).
 *
 * Scores five checks over the committed bytes of <rev> (extracted with `git archive`,
 * never the working tree):
 *   E1  corpus/knowledge/fail-closed-clock-validation.md exists at rev; its provenance
 *       trio (`source:` citing S102 with an rfc-editor.org/rfc/rfc3339 URL and the
 *       companion row S103, `verified-at:`, `recheck:`) appears within its first five
 *       lines.
 *   E2  >=12 clause lines (lines starting with `- `), each carrying a
 *       `receipt:<repo-path>@sha256:<64hex>` binding whose path exists at rev with a
 *       matching blob sha256.
 *   E3  corpus/SOURCES.md at rev carries rows S102 and S103 with status `mined` and a
 *       used-by cell naming corpus/knowledge/fail-closed-clock-validation.md.
 *   E4  `node scripts/sources-check.mjs` against the extracted tree prints
 *       `SOURCES_CHECK: CLEAN` exit 0.
 *   E5  the live census `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
 *       --root /home/vgpnk/Projects/shokunin kumitate` exits 0.
 *
 * Predicate DOCTRINE52_HELD = held=5/5, exit 0. Any other reading is
 * `DOCTRINE52_UNMET held=<k>/5` exit 1. A crash or an unreadable extraction is exit 2
 * (never a score). Frozen at `.ufo/waves/round-52/plan.md` § C2 before any data seat ran.
 *
 * FREEZE REPAIR 12 (addendum item 12, seats CritFreeze + RevPlan + SonicFreeze): the frozen
 * predicate sentence, byte-identical with plan.md §Claims and the round report —
 * DOCTRINE52_HELD — node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=<rev> rule=D52" and exits 0.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'D52';
const ENTRY = 'corpus/knowledge/fail-closed-clock-validation.md';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DOCTRINE52: USAGE node doctrine52-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DOCTRINE52: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
// FREEZE REPAIR 6 (addendum item 6, seat RevCounterA HIGH): <rev> is interpolated into a
// shell pipeline; only full hex object names are accepted.
if (!/^[0-9a-f]{40,64}$/.test(rev)) {
  process.stderr.write('DOCTRINE52: USAGE <rev> must be a full lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
class EarlyExit extends Error {}
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });

const T = mkdtempSync(join(tmpdir(), 'd52-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`DOCTRINE52: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    process.exit(2);
  }
  const ep = join(T, ENTRY);
  if (!existsSync(ep)) {
    // FREEZE REPAIR 15 (addendum item 15, seats MutProbeD F2 + RevPlan MEDIUM): the v1
    // short-circuit printed a hardcoded held=0/5 label without running E2-E5; the repaired
    // path records the miss through the common tail so the label is always derived.
    hold('E1', false, 'entry-absent');
    throw new EarlyExit();
  }
  const text = readFileSync(ep, 'utf8');
  const head = text.split('\n').slice(0, 5).join('\n');

  // E1
  const e1 = /source\s*:/i.test(head) && /S102/.test(head) && /S103/.test(head)
    && /rfc-editor\.org\/rfc\/rfc3339/.test(head)
    && /verified-at\s*:/i.test(head) && /recheck\s*:/i.test(head);
  hold('E1', e1, e1 ? 'trio present' : 'trio incomplete in first 5 lines');

  // E2. FREEZE REPAIR 13 (addendum item 13, seats RevCounterD H1 + RevEntry): bound paths
  // must be DISTINCT (twelve copies of one binding are hollow) and each must be a blob
  // (`git show` on a directory prints a listing whose hash can match nothing — but only
  // cat-file proves the object is a blob).
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

  // E3. FREEZE REPAIR 14 (addendum item 14, seat RevCounterD MEDIUM): the contract accepts
  // 0-3 leading spaces per row; the row match must too.
  const sp = join(T, 'corpus', 'SOURCES.md');
  let e3 = false; let e3d = 'SOURCES.md absent';
  if (existsSync(sp)) {
    const rows = readFileSync(sp, 'utf8').split('\n').filter((l) => /^\s{0,3}\|\s*S10[23]\s*\|/.test(l));
    const okRow = (id) => rows.some((l) => {
      const c = l.split('|').map((x) => x.trim());
      return c[1] === id && c[8] === 'mined' && c[11].includes(ENTRY);
    });
    e3 = okRow('S102') && okRow('S103');
    e3d = `rows=${rows.length} S102=${okRow('S102')} S103=${okRow('S103')}`;
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
    process.stderr.write(`DOCTRINE52: FAIL-CLOSED ${e.stack || e}\n`);
    process.exit(2);
  }
} finally {
  try { rmSync(T, { recursive: true, force: true }); } catch {}
}

const held = checks.filter((c) => c.ok).length;
const label = held === checks.length && checks.length > 0 ? 'DOCTRINE52_HELD' : 'DOCTRINE52_UNMET';
process.stdout.write(`DOCTRINE52: ${label} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} | ${checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail.slice(0, 90)}`}`).join(' | ')}\n`);
process.exit(held === checks.length && checks.length > 0 ? 0 : 1);
