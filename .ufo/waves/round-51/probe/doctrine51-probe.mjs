#!/usr/bin/env node
/**
 * doctrine51-probe.mjs — FROZEN counter for kumitate round 51, claim C2 (rule `D51`).
 *
 *   node .ufo/waves/round-51/probe/doctrine51-probe.mjs <lane> <rev>
 *
 * Scores five checks over the committed bytes of <rev> (extracted with `git archive`,
 * never the working tree):
 *   D1  corpus/knowledge/invocation-attestation.md exists at rev; its provenance trio
 *       (`source:` citing S100 and S101 with the man7.org URLs, `verified-at:`, `recheck:`)
 *       appears within its first five lines.
 *   D2  >=12 clause lines (lines starting with `- `), each carrying a
 *       `receipt:<repo-path>@sha256:<64hex>` binding whose path exists at rev with a
 *       matching blob sha256.
 *   D3  corpus/SOURCES.md at rev carries rows S100 and S101 with status `mined` and a
 *       used-by cell naming corpus/knowledge/invocation-attestation.md.
 *   D4  `node scripts/sources-check.mjs` against the extracted tree prints
 *       `SOURCES_CHECK: CLEAN` exit 0.
 *   D5  the live census `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
 *       --root /home/vgpnk/Projects/shokunin kumitate` exits 0.
 *
 * Predicate DOCTRINE_HELD = held=5/5, exit 0. Any other reading is
 * `DOCTRINE_UNMET held=<k>/5` exit 1. A crash or unreadable extraction is exit 2 (never a
 * score). Frozen at `.ufo/waves/round-51/plan.md` § C2 before any data seat ran.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const RULE = 'D51';
const ENTRY = 'corpus/knowledge/invocation-attestation.md';
const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DOCTRINE51: USAGE node doctrine51-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DOCTRINE51: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });

const T = mkdtempSync(join(tmpdir(), 'd51-probe.'));
try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180_000 });
  if (tar.status !== 0) {
    process.stderr.write(`DOCTRINE51: FAIL-CLOSED git archive ${rev} exit=${tar.status}\n`);
    process.exit(2);
  }
  const ep = join(T, ENTRY);
  if (!existsSync(ep)) {
    process.stdout.write(`DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=${rev} rule=${RULE} | D1 MISS entry-absent\n`);
    rmSync(T, { recursive: true, force: true });
    process.exit(1);
  }
  const text = readFileSync(ep, 'utf8');
  const head = text.split('\n').slice(0, 5).join('\n');

  // D1
  const d1 = /source\s*:/i.test(head) && /S100/.test(head) && /S101/.test(head)
    && /man7\.org\/linux\/man-pages\/man2\/clock_gettime\.2\.html/.test(head)
    && /man7\.org\/linux\/man-pages\/man2\/getrandom\.2\.html/.test(head)
    && /verified-at\s*:/i.test(head) && /recheck\s*:/i.test(head);
  hold('D1', d1, d1 ? 'trio present' : 'trio incomplete in first 5 lines');

  // D2
  const clauses = text.split('\n').filter((l) => l.startsWith('- '));
  const bound = [];
  let d2miss = 0;
  for (const l of clauses) {
    const m = /receipt:([^\s@]+)@sha256:([0-9a-f]{64})/.exec(l);
    if (!m) continue;
    bound.push(m);
  }
  for (const [, p, h] of bound) {
    const r = spawnSync('git', ['-C', lane, 'show', `${rev}:${p}`], { encoding: 'utf8', timeout: 120_000, maxBuffer: 64 << 20 });
    if (r.status !== 0) { d2miss += 1; continue; }
    if (sha(Buffer.from(r.stdout)) !== h) d2miss += 1;
  }
  const d2 = clauses.length >= 12 && bound.length >= 12 && d2miss === 0;
  hold('D2', d2, `clauses=${clauses.length} bound=${bound.length} hash-miss=${d2miss}`);

  // D3
  const sp = join(T, 'corpus', 'SOURCES.md');
  let d3 = false; let d3d = 'SOURCES.md absent';
  if (existsSync(sp)) {
    const rows = readFileSync(sp, 'utf8').split('\n').filter((l) => /^\|\s*S10[01]\s*\|/.test(l));
    const okRow = (id) => rows.some((l) => {
      const c = l.split('|').map((x) => x.trim());
      return c[1] === id && c[9] === 'mined' && c[12].includes(ENTRY);
    });
    d3 = okRow('S100') && okRow('S101');
    d3d = `rows=${rows.length} S100=${okRow('S100')} S101=${okRow('S101')}`;
  }
  hold('D3', d3, d3d);

  // D4
  const d4r = spawnSync('node', [join(T, 'scripts', 'sources-check.mjs')], { cwd: T, encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20 });
  const d4last = `${d4r.stderr || ''}${d4r.stdout || ''}`.trim().split('\n').pop() || '';
  const d4 = d4r.status === 0 && /SOURCES_CHECK: CLEAN/.test(d4last);
  hold('D4', d4, `exit=${d4r.status} ${d4last.slice(0, 90)}`);

  // D5
  const d5r = spawnSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate', '--root', '/home/vgpnk/Projects/shokunin', 'kumitate'], { encoding: 'utf8', timeout: 240_000, maxBuffer: 64 << 20 });
  const d5 = d5r.status === 0;
  hold('D5', d5, `census exit=${d5r.status}`);
} catch (e) {
  process.stderr.write(`DOCTRINE51: FAIL-CLOSED ${e.stack || e}\n`);
  process.exit(2);
} finally {
  try { rmSync(T, { recursive: true, force: true }); } catch {}
}

const held = checks.filter((c) => c.ok).length;
const label = held === checks.length ? 'DOCTRINE_HELD' : 'DOCTRINE_UNMET';
process.stdout.write(`DOCTRINE51: ${label} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} | ${checks.map((c) => `${c.id} ${c.ok ? 'PASS' : `MISS ${c.detail.slice(0, 90)}`}`).join(' | ')}\n`);
process.exit(held === checks.length ? 0 : 1);
