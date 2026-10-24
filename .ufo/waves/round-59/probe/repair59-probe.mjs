#!/usr/bin/env node
/**
 * repair59-probe.mjs — FROZEN counter for kumitate round 59, claim C1 (rule A59).
 *
 *   node .ufo/waves/round-59/probe/repair59-probe.mjs <lane> <rev>
 *
 * Predicate REPAIR59_HELD, byte-identical with plan.md §Claims and the report:
 * REPAIR59_HELD — node .ufo/waves/round-59/probe/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "REPAIR59: REPAIR59_HELD held=8/8 checks=8 rev=<rev> rule=A59 version=v1" and exits 0.
 *
 * Eight checks over the committed bytes of <rev> (git archive, never the worktree):
 *   B1  scripts/cite-sources.mjs exists; its --selftest prints
 *       CITE_SOURCES_SELFTEST: PASS (8/8) and exits 0.
 *   B2  node scripts/cite-sources.mjs in the extraction prints
 *       CITE_SOURCES: CLEAN and exits 0.
 *   B3  the SKILL.md line containing "are gates" names nineteen (word or 19),
 *       the gate-registry table has exactly 19 `| gate |` rows, and one of
 *       those rows is named cite-sources.
 *   B4  the SCORECARD capabilities table has a row whose first cell is
 *       `cite-sources`, a row whose first cell is `receipt-evidence`, and the
 *       `readme-map` capability row contains `v2` and `16/16` and does not
 *       contain `files=135`.
 *   B5  node scripts/readme-map.mjs in the extraction prints README_MAP: CLEAN
 *       and .ufo/pins/readme-map.json covered includes
 *       lessons/round-58-verifier-spotcheck.md.
 *   B6  SCORECARD.md contains the literal `R58-V1 measured base held=2/5`.
 *   B7  corpus/lessons/round-59.md contains a line
 *       TIER59: A=<n> B=<n> C=<n> rows=<n> whose four integers equal this
 *       probe's own histogram of corpus/SOURCES.md at rev.
 *   B8  corpus/lessons/round-59.md contains the literals
 *       `a shared page is not automatically a duplicate` and
 *       `pin the duplicate group before adoption`.
 *
 * A drop-one mutant (EXPECTED_CHECKS still 8, one hold() removed) prints
 * checks-mismatch and never HELD. Frozen before any data seat scored.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RULE = 'A59';
const EXPECTED_CHECKS = 8;
const WORDS = { seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };

const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('REPAIR59: USAGE node repair59-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`REPAIR59: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{7,64}$/.test(rev)) {
  process.stderr.write('REPAIR59: USAGE <rev> must be a lowercase hex object name\n');
  process.exit(64);
}

const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const T = mkdtempSync(join(tmpdir(), 'a59-probe.'));

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
    process.stderr.write(`REPAIR59: FAIL-CLOSED rev unreadable (${tar.status}) ${tar.stderr || ''}\n`);
    rmSync(T, { recursive: true, force: true });
    process.exit(2);
  }
  const readT = (p) => { try { return readFileSync(join(T, p), 'utf8'); } catch { return null; } };

  {
    const self = spawnSync(process.execPath, ['scripts/cite-sources.mjs', '--selftest'],
      { cwd: T, encoding: 'utf8', timeout: 60000 });
    const ok = self.status === 0 && (self.stdout || '').includes('CITE_SOURCES_SELFTEST: PASS (8/8)');
    hold('B1', ok, ok ? 'selftest-8/8' : `status=${self.status} ${(self.stdout || self.stderr || '').slice(0, 120)}`);
  }
  {
    const run = spawnSync(process.execPath, ['scripts/cite-sources.mjs'],
      { cwd: T, encoding: 'utf8', timeout: 30000 });
    const ok = run.status === 0 && (run.stdout || '').includes('CITE_SOURCES: CLEAN');
    hold('B2', ok, ok ? 'clean' : `status=${run.status} ${(run.stdout || '').slice(0, 120)}`);
  }
  {
    const skill = readT('SKILL.md') || '';
    const gateLine = skill.split('\n').find((l) => l.includes('are gates')) || '';
    const word = gateLine.toLowerCase().match(/\b(seventeen|eighteen|nineteen|twenty)\b/);
    const digit = gateLine.match(/\b(1[7-9]|20)\b/);
    const named = word ? WORDS[word[1]] : (digit ? Number(digit[1]) : null);
    const rows = skill.split('\n').filter((l) => l.startsWith('| ') && l.includes('| gate |'));
    const has = rows.some((l) => /\|\s*cite-sources\s*\|/.test(l));
    const ok = named === 19 && rows.length === 19 && has;
    hold('B3', ok, `prose=${named} rows=${rows.length} cite-sources=${has}`);
  }
  {
    const sc = readT('SCORECARD.md') || '';
    const cap = sc.split('\n').filter((l) => l.startsWith('| `'));
    const cite = cap.some((l) => l.startsWith('| `cite-sources` |'));
    const receipt = cap.some((l) => l.startsWith('| `receipt-evidence` |'));
    const map = cap.find((l) => l.startsWith('| `readme-map` |')) || '';
    const ok = cite && receipt && map.includes('v2') && map.includes('16/16') && !map.includes('files=135');
    hold('B4', ok, `cite=${cite} receipt=${receipt} mapv2=${map.includes('v2')} 16/16=${map.includes('16/16')} stale135=${map.includes('files=135')}`);
  }
  {
    const pin = readT('.ufo/pins/readme-map.json') || '';
    const pinned = pin.includes('lessons/round-58-verifier-spotcheck.md');
    const map = spawnSync(process.execPath, ['scripts/readme-map.mjs'],
      { cwd: T, encoding: 'utf8', timeout: 30000 });
    const clean = map.status === 0 && (map.stdout || '').includes('README_MAP: CLEAN');
    hold('B5', pinned && clean, `pinned=${pinned} status=${map.status} ${(map.stdout || '').split('\n').pop()}`);
  }
  {
    const sc = readT('SCORECARD.md') || '';
    const ok = sc.includes('R58-V1 measured base held=2/5');
    hold('B6', ok, ok ? 'literal' : 'absent');
  }
  {
    const lesson = readT('corpus/lessons/round-59.md') || '';
    const sources = readT('corpus/SOURCES.md') || '';
    const hist = { A: 0, B: 0, C: 0, rows: 0 };
    for (const line of sources.split('\n')) {
      const m = line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/);
      if (!m) continue;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      hist.rows += 1;
      const tier = cells[3];
      if (tier === 'A' || tier === 'B' || tier === 'C') hist[tier] += 1;
    }
    const want = `TIER59: A=${hist.A} B=${hist.B} C=${hist.C} rows=${hist.rows}`;
    const ok = lesson.includes(want);
    hold('B7', ok, ok ? want : `want ${want}`);
  }
  {
    const lesson = readT('corpus/lessons/round-59.md') || '';
    const a = lesson.includes('a shared page is not automatically a duplicate');
    const b = lesson.includes('pin the duplicate group before adoption');
    hold('B8', a && b, `nuance=${a} pin-first=${b}`);
  }
} catch (err) {
  process.stderr.write(`REPAIR59: FAIL-CLOSED ${err && err.message}\n`);
  rmSync(T, { recursive: true, force: true });
  process.exit(2);
}

const held = checks.filter((c) => c.ok).length;
const mismatch = checks.length !== EXPECTED_CHECKS;
const full = rev.length >= 40 ? rev : rev;
const head = `REPAIR59: ${mismatch ? 'REPAIR59_UNMET' : (held === EXPECTED_CHECKS ? 'REPAIR59_HELD' : 'REPAIR59_UNMET')} held=${held}/${checks.length} checks=${EXPECTED_CHECKS} rev=${full} rule=${RULE} version=v1${mismatch ? ' checks-mismatch' : ''}`;
finish(held === EXPECTED_CHECKS && !mismatch ? 0 : 1, head);
