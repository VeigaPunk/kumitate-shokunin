#!/usr/bin/env node
/**
 * doctrine59-probe.mjs — FROZEN counter for kumitate round 59, claim C2 (rule D59).
 *
 *   node .ufo/waves/round-59/probe/doctrine59-probe.mjs <lane> <rev>
 *
 * Predicate DOCTRINE59_HELD, byte-identical with plan.md §Claims and the report:
 * DOCTRINE59_HELD — node .ufo/waves/round-59/probe/doctrine59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE59: DOCTRINE59_HELD held=5/5 checks=5 rev=<rev> rule=D59" and exits 0.
 *
 * Five checks over the committed bytes of <rev> (git archive, never the worktree):
 *   E1  corpus/knowledge/mcp-orchestration-contract.md exists; its first line
 *       cites S125, S127 and S136 and contains modelcontextprotocol.io; the
 *       first five lines contain verified-at: 2026-10-24 and recheck:.
 *   E2  at least 8 lines starting with "- " each carry
 *       receipt:<path>@sha256:<64hex>, the paths are distinct, and each path
 *       exists at rev with that sha256.
 *   E3  corpus/SOURCES.md has rows S125, S127 and S136 with status mined and
 *       a used-by cell naming corpus/knowledge/mcp-orchestration-contract.md;
 *       .ufo/pins/source-captures.json pins all three and each capture blob
 *       matches its pinned sha256.
 *   E4  corpus/lessons/round-59.md contains
 *       `ADMIT mcp-orchestration-contract.md`,
 *       `REJECT durable-execution-and-fanout-primitives-2026-10-24.md` and
 *       `REJECT durable-execution-failure-detection.md`, and the word `flip:`
 *       occurs at least twice.
 *   E5  .ufo/waves/round-59/assimilation/collisions exists and has zero
 *       non-empty lines; reg-ids contains S124 and does not contain S125;
 *       staged-ids contains S125.
 *
 * Frozen before any data seat scored. A live census is not a check: it already
 * exits 0 at the base (the R58-V1 class — a check that passes before the work
 * must not be reported as 0).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RULE = 'D59';
const EXPECTED_CHECKS = 5;
const ENTRY = 'corpus/knowledge/mcp-orchestration-contract.md';

const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DOCTRINE59: USAGE node doctrine59-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DOCTRINE59: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{7,64}$/.test(rev)) {
  process.stderr.write('DOCTRINE59: USAGE <rev> must be a lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const T = mkdtempSync(join(tmpdir(), 'd59-probe.'));

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
    process.stderr.write(`DOCTRINE59: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    rmSync(T, { recursive: true, force: true });
    process.exit(2);
  }
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };
  const text = (p) => { const b = readT(p); return b ? b.toString('utf8') : null; };

  {
    const entry = text(ENTRY);
    if (!entry) hold('E1', false, 'entry-absent');
    else {
      const lines = entry.split('\n');
      const head = lines.slice(0, 5).join('\n');
      const ok = /S125/.test(lines[0] || '') && /S127/.test(lines[0] || '') && /S136/.test(lines[0] || '')
        && /modelcontextprotocol\.io/.test(lines[0] || '')
        && /verified-at:\s*2026-10-24/.test(head) && /recheck:/.test(head);
      hold('E1', ok, ok ? 'trio' : 'header-miss');
    }
  }
  {
    const entry = text(ENTRY) || '';
    const clauses = entry.split('\n').filter((l) => l.startsWith('- ') && /receipt:.+@sha256:[0-9a-f]{64}/.test(l));
    const paths = [];
    let hashMiss = 0;
    for (const line of clauses) {
      const m = line.match(/receipt:([^@\s]+)@sha256:([0-9a-f]{64})/);
      if (!m) { hashMiss += 1; continue; }
      paths.push(m[1]);
      const blob = readT(m[1]);
      if (!blob || sha(blob) !== m[2]) hashMiss += 1;
    }
    const distinct = new Set(paths).size === paths.length && paths.length >= 8;
    const ok = clauses.length >= 8 && distinct && hashMiss === 0;
    hold('E2', ok, `clauses=${clauses.length} distinct=${new Set(paths).size} hash-miss=${hashMiss}`);
  }
  {
    const sources = text('corpus/SOURCES.md') || '';
    const pins = text('.ufo/pins/source-captures.json');
    let pinDoc = null;
    try { pinDoc = pins ? JSON.parse(pins) : null; } catch { pinDoc = null; }
    const want = ['S125', 'S127', 'S136'];
    let rowOk = true;
    const why = [];
    for (const id of want) {
      const row = sources.split('\n').find((l) => new RegExp(`^ {0,3}\\|\\s*${id}\\s*\\|`).test(l));
      if (!row) { rowOk = false; why.push(`${id}:missing`); continue; }
      const cells = row.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.length !== 11) { rowOk = false; why.push(`${id}:cols=${cells.length}`); }
      if (cells[7] !== 'mined') { rowOk = false; why.push(`${id}:status`); }
      if (!String(cells[10] || '').includes(ENTRY)) { rowOk = false; why.push(`${id}:used-by`); }
      if (row.includes('\\|')) { rowOk = false; why.push(`${id}:escaped-pipe`); }
    }
    let pinOk = true;
    const captures = pinDoc && Array.isArray(pinDoc.captures) ? pinDoc.captures : [];
    for (const id of want) {
      const pin = captures.find((c) => c.sourceId === id);
      if (!pin) { pinOk = false; why.push(`${id}:unpin`); continue; }
      const blob = readT(pin.path);
      if (!blob || sha(blob) !== pin.sha256) { pinOk = false; why.push(`${id}:pin-miss`); }
    }
    hold('E3', rowOk && pinOk, why.length ? why.join(',') : 'rows+pins');
  }
  {
    const lesson = text('corpus/lessons/round-59.md') || '';
    const admit = lesson.includes('ADMIT mcp-orchestration-contract.md');
    const r1 = lesson.includes('REJECT durable-execution-and-fanout-primitives-2026-10-24.md');
    const r2 = lesson.includes('REJECT durable-execution-failure-detection.md');
    const flips = (lesson.match(/flip:/g) || []).length;
    const ok = admit && r1 && r2 && flips >= 2;
    hold('E4', ok, `admit=${admit} fanout=${r1} detect=${r2} flips=${flips}`);
  }
  {
    const col = text('.ufo/waves/round-59/assimilation/collisions');
    const reg = text('.ufo/waves/round-59/assimilation/reg-ids') || '';
    const staged = text('.ufo/waves/round-59/assimilation/staged-ids') || '';
    const empty = col !== null && col.split('\n').every((l) => l.trim() === '');
    const ok = empty && reg.includes('S124') && !reg.split('\n').includes('S125') && staged.split('\n').includes('S125');
    hold('E5', ok, `collisions=${col === null ? 'absent' : 'present'} empty=${empty} regS124=${reg.includes('S124')} stagedS125=${staged.split('\n').includes('S125')}`);
  }
} catch (err) {
  process.stderr.write(`DOCTRINE59: FAIL-CLOSED ${err && err.message}\n`);
  rmSync(T, { recursive: true, force: true });
  process.exit(2);
}

const held = checks.filter((c) => c.ok).length;
const mismatch = checks.length !== EXPECTED_CHECKS;
const head = `DOCTRINE59: ${mismatch ? 'DOCTRINE59_UNMET' : (held === EXPECTED_CHECKS ? 'DOCTRINE59_HELD' : 'DOCTRINE59_UNMET')} held=${held}/${checks.length} checks=${EXPECTED_CHECKS} rev=${rev} rule=${RULE}${mismatch ? ' checks-mismatch' : ''}`;
finish(held === EXPECTED_CHECKS && !mismatch ? 0 : 1, head);
