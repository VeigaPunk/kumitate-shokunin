#!/usr/bin/env node
/**
 * doctrine60-probe.mjs — FROZEN counter for kumitate round 60, claim C2 (rule D60).
 *
 *   node .ufo/waves/round-60/probe/doctrine60-probe.mjs <lane> <rev>
 *
 * Predicate DOCTRINE60_HELD, byte-identical with plan.md §Claims and the report:
 * DOCTRINE60_HELD — node .ufo/waves/round-60/probe/doctrine60-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE60: DOCTRINE60_HELD held=6/6 checks=6 rev=<rev> rule=D60" and exits 0.
 *
 * Six checks over the committed bytes of <rev> (git archive, never the worktree):
 *   F1  both adopted entries exist; each head carries verified-at: 2026-10-24 and recheck:;
 *       each first line cites its own ids and URLs.
 *   F2  the seven rows exist in corpus/SOURCES.md: 11 cells, status mined, opened 2026-10-24,
 *       no literal or escaped pipe in any cell, recheck cell an ISO date, NNd or a symbolic cadence.
 *   F3  each row's used-by names exactly the admitted entry that cites it, and that path exists.
 *   F4  .ufo/pins/source-captures.json pins all seven and each capture blob's sha256 matches its pin.
 *   F5  .ufo/pins/source-dupes.json pins the S117/S126 group and source-dupes at rev reads CLEAN.
 *   F6  the lesson's ## Gate records the two ADMITs and the two REJECTs with flips, and the
 *       collisions file names exactly S125/S127/S136 and none of the seven adopted ids.
 *
 * Frozen before any data seat scored.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RULE = 'D60';
const EXPECTED_CHECKS = 6;
const IDS = ['S126', 'S131', 'S133', 'S134', 'S135', 'S190', 'S194'];
const ENTRY_FANOUT = 'corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md';
const ENTRY_DETECT = 'corpus/knowledge/durable-execution-failure-detection.md';
const CADENCE = /^(\d{4}-\d{2}-\d{2}|\d+d|on-release|on-release\b|quarterly|monthly|weekly|yearly)$/i;

const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DOCTRINE60: USAGE node doctrine60-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DOCTRINE60: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{7,64}$/.test(rev)) {
  process.stderr.write('DOCTRINE60: USAGE <rev> must be a lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const T = mkdtempSync(join(tmpdir(), 'd60-probe.'));

function finish(code, line) {
  rmSync(T, { recursive: true, force: true });
  process.stdout.write(line + '\n');
  for (const c of checks) process.stdout.write(` | ${c.id} ${c.ok ? 'PASS' : 'MISS'} ${c.detail}`);
  if (checks.length) process.stdout.write('\n');
  process.exit(code);
}

try {
  const tar = spawnSync('bash', ['-lc',
    `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`],
    { encoding: 'utf8', timeout: 180000 });
  if (tar.status !== 0) {
    process.stderr.write(`DOCTRINE60: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    rmSync(T, { recursive: true, force: true });
    process.exit(2);
  }
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };
  const text = (p) => { const b = readT(p); return b ? b.toString('utf8') : null; };

  {
    const a = text(ENTRY_FANOUT);
    const b = text(ENTRY_DETECT);
    const headOk = (s) => {
      if (!s) return false;
      const head = s.split('\n').slice(0, 6).join('\n');
      return /verified-at:\s*2026-10-24/.test(head) && /recheck:/.test(head);
    };
    const firstOk = (s, ids) => {
      if (!s) return false;
      const first = s.split('\n')[0] || '';
      return ids.every((i) => first.includes(i));
    };
    const ok = headOk(a) && headOk(b)
      && firstOk(a, ['S190', 'S194']) && firstOk(b, ['S126', 'S131', 'S133', 'S134', 'S135'])
      && /research\.google\.com|research\.google/.test(a.split('\n')[0] || '')
      && /dl\.acm\.org/.test(a.split('\n')[0] || '')
      && /docs\.temporal\.io/.test(b.split('\n')[0] || '');
    hold('F1', ok, `fanout=${!!a} detect=${!!b}`);
  }
  {
    const sources = text('corpus/SOURCES.md') || '';
    const why = [];
    for (const id of IDS) {
      const row = sources.split('\n').find((l) => new RegExp(`^ {0,3}\\|\\s*${id}\\s*\\|`).test(l));
      if (!row) { why.push(`${id}:missing`); continue; }
      const cells = row.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.length !== 11) why.push(`${id}:cols=${cells.length}`);
      if (cells[7] !== 'mined') why.push(`${id}:status`);
      if (cells[8] !== '2026-10-24') why.push(`${id}:opened`);
      if (!CADENCE.test(cells[9] || '')) why.push(`${id}:recheck=${cells[9]}`);
      if (row.includes('\\|')) why.push(`${id}:escaped-pipe`);
      for (const c of cells) if (c.includes('|')) why.push(`${id}:literal-pipe`);
    }
    hold('F2', why.length === 0, why.length ? why.join(',') : `rows=${IDS.length}`);
  }
  {
    const sources = text('corpus/SOURCES.md') || '';
    const owner = {};
    owner.S190 = ENTRY_FANOUT; owner.S194 = ENTRY_FANOUT;
    owner.S126 = ENTRY_DETECT; owner.S131 = ENTRY_DETECT; owner.S133 = ENTRY_DETECT;
    owner.S134 = ENTRY_DETECT; owner.S135 = ENTRY_DETECT;
    const why = [];
    for (const id of IDS) {
      const row = sources.split('\n').find((l) => new RegExp(`^ {0,3}\\|\\s*${id}\\s*\\|`).test(l));
      if (!row) { why.push(`${id}:missing`); continue; }
      const cells = row.split('|').slice(1, -1).map((c) => c.trim());
      const usedBy = (cells[10] || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (usedBy.length !== 1 || usedBy[0] !== owner[id]) { why.push(`${id}:used-by=${usedBy.join('+')}`); continue; }
      if (!readT(owner[id])) why.push(`${id}:path-absent`);
    }
    hold('F3', why.length === 0, why.length ? why.join(',') : 'used-by-exact');
  }
  {
    const pins = text('.ufo/pins/source-captures.json');
    let doc = null;
    try { doc = pins ? JSON.parse(pins) : null; } catch { doc = null; }
    const captures = doc && Array.isArray(doc.captures) ? doc.captures : [];
    const why = [];
    for (const id of IDS) {
      const pin = captures.find((c) => c.sourceId === id);
      if (!pin) { why.push(`${id}:unpin`); continue; }
      const blob = readT(pin.path);
      if (!blob) { why.push(`${id}:capture-absent`); continue; }
      if (sha(blob) !== pin.sha256) why.push(`${id}:hash-miss`);
      if (String(pin.bytes) !== String(blob.length)) why.push(`${id}:bytes-miss`);
    }
    hold('F4', why.length === 0, why.length ? why.join(',') : `captures=${IDS.length}`);
  }
  {
    const pins = text('.ufo/pins/source-dupes.json');
    let doc = null;
    try { doc = pins ? JSON.parse(pins) : null; } catch { doc = null; }
    const known = doc && Array.isArray(doc.known) ? doc.known : [];
    const group = known.find((g) => Array.isArray(g.ids) && g.ids.includes('S117') && g.ids.includes('S126'));
    const run = spawnSync('node', [join(T, 'scripts/source-dupes.mjs'),
      '--registry', '.ufo/pins/source-dupes.json', '--sources', 'corpus/SOURCES.md'],
      { cwd: T, encoding: 'utf8', timeout: 120000 });
    const out = `${run.stdout || ''}${run.stderr || ''}`;
    const ok = !!group && run.status === 0 && /SOURCE_DUPES: CLEAN/.test(out);
    hold('F5', ok, `group=${!!group} exit=${run.status} ${out.split('\n')[0] || ''}`);
  }
  {
    const lesson = text('corpus/lessons/round-60.md') || '';
    const a1 = lesson.includes('ADMIT durable-execution-and-fanout-primitives-2026-10-24.md');
    const a2 = lesson.includes('ADMIT durable-execution-failure-detection.md');
    const r1 = lesson.includes('REJECT exactly-once-attribution.md');
    const r2 = lesson.includes('REJECT multi-agent-coordinator-topologies.md');
    const flips = (lesson.match(/flip:/g) || []).length;
    const col = text('.ufo/waves/round-60/assimilation/collisions');
    const colIds = (col || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const colOk = colIds.length === 3 && ['S125', 'S127', 'S136'].every((i) => colIds.includes(i))
      && !colIds.some((i) => IDS.includes(i));
    const ok = a1 && a2 && r1 && r2 && flips >= 2 && colOk;
    hold('F6', ok, `admit=${a1 && a2} reject=${r1 && r2} flips=${flips} collisions=${colIds.join('+') || 'none'}`);
  }
} catch (err) {
  process.stderr.write(`DOCTRINE60: FAIL-CLOSED ${err && err.message}\n`);
  rmSync(T, { recursive: true, force: true });
  process.exit(2);
}

const held = checks.filter((c) => c.ok).length;
const mismatch = checks.length !== EXPECTED_CHECKS;
const head = `DOCTRINE60: ${mismatch ? 'DOCTRINE60_UNMET' : (held === EXPECTED_CHECKS ? 'DOCTRINE60_HELD' : 'DOCTRINE60_UNMET')} held=${held}/${checks.length} checks=${EXPECTED_CHECKS} rev=${rev} rule=${RULE}${mismatch ? ' checks-mismatch' : ''}`;
finish(held === EXPECTED_CHECKS && !mismatch ? 0 : 1, head);
