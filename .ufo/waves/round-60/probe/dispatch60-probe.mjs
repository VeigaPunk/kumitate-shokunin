#!/usr/bin/env node
/**
 * dispatch60-probe.mjs — FROZEN counter for kumitate round 60, claim C1 (rule A60).
 *
 *   node .ufo/waves/round-60/probe/dispatch60-probe.mjs <lane> <rev>
 *
 * Predicate DISPATCH60_HELD, byte-identical with plan.md §Claims and the report:
 * DISPATCH60_HELD — node .ufo/waves/round-60/probe/dispatch60-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DISPATCH60: DISPATCH60_HELD held=10/10 checks=10 rev=<rev> rule=A60" and exits 0.
 *
 * Ten checks over the committed bytes of <rev> (git archive, never the worktree):
 *   A1  scripts/dispatch-evidence.mjs exists at rev and is non-empty.
 *   A2  its --selftest exits 0 and prints DISPATCH_EVIDENCE_SELFTEST: PASS (n/n) and VERDICT: PASS.
 *   A3  the selftest output names the six finding ids it must be able to produce.
 *   A4  SKILL.md carries a gate-registry row for dispatch-evidence naming the entry command.
 *   A5  SKILL.md carries a `## Verifiable checklist` task item naming the command.
 *   A6  the kumitate-gate-pins-v1 block pins pin.dispatch-evidence with the gate's sha256 at rev.
 *   A7  the SCORECARD.md capabilities table carries a dispatch-evidence row.
 *   A8  corpus/lessons/round-60.md exists with ## Gate, ## Mistakes and the string dispatch-evidence.
 *   A9  the gate registry grew to twenty and SKILL.md's prose integer equals the gate-row count.
 *   A10 the gate over this round's committed dispatch record prints DISPATCH_EVIDENCE: CLEAN with seats=32.
 *
 * Frozen before any data seat scored.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RULE = 'A60';
const EXPECTED_CHECKS = 10;
const GATE = 'scripts/dispatch-evidence.mjs';
const EXPECTED_GATES = 20;
const FINDINGS = ['NOT_A_DISPATCH', 'DEAD_SEAT_UNCREDITED', 'PROGRESS_ABSENT', 'PLAN_MISMATCH', 'REPORT_ABSENT', 'EXPECT_MISMATCH'];

const [laneArg, rev, ...rest] = process.argv.slice(2);
if (!laneArg || !rev || rest.length) {
  process.stderr.write('DISPATCH60: USAGE node dispatch60-probe.mjs <lane> <rev>\n');
  process.exit(64);
}
const lane = resolve(laneArg);
if (!existsSync(join(lane, '.git'))) {
  process.stderr.write(`DISPATCH60: USAGE ${JSON.stringify(lane)} is not a git repo\n`);
  process.exit(64);
}
if (!/^[0-9a-f]{7,64}$/.test(rev)) {
  process.stderr.write('DISPATCH60: USAGE <rev> must be a lowercase hex object name\n');
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const checks = [];
const hold = (id, ok, detail) => checks.push({ id, ok, detail });
const T = mkdtempSync(join(tmpdir(), 'a60-probe.'));

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
    process.stderr.write(`DISPATCH60: FAIL-CLOSED rev unreadable (${tar.status})\n`);
    rmSync(T, { recursive: true, force: true });
    process.exit(2);
  }
  const readT = (p) => { try { return readFileSync(join(T, p)); } catch { return null; } };
  const text = (p) => { const b = readT(p); return b ? b.toString('utf8') : null; };

  {
    const blob = readT(GATE);
    hold('A1', !!blob && blob.length > 0, blob ? `bytes=${blob.length}` : 'gate-absent');
  }
  let selftestOut = '';
  {
    const run = spawnSync('node', [join(T, GATE), '--selftest'], { cwd: T, encoding: 'utf8', timeout: 120000 });
    selftestOut = `${run.stdout || ''}${run.stderr || ''}`;
    const ok = run.status === 0
      && /DISPATCH_EVIDENCE_SELFTEST: PASS \(\d+\/\d+\)/.test(selftestOut)
      && /VERDICT: PASS/.test(selftestOut);
    hold('A2', ok, `exit=${run.status} verdict=${/VERDICT: PASS/.test(selftestOut)}`);
  }
  {
    const missing = FINDINGS.filter((f) => !selftestOut.includes(f));
    hold('A3', missing.length === 0, missing.length ? `missing=${missing.join(',')}` : `findings=${FINDINGS.length}`);
  }
  {
    const skill = text('SKILL.md') || '';
    const row = skill.split('\n').find((l) => /^\|\s*dispatch-evidence\s*\|\s*gate\s*\|/.test(l));
    const ok = !!row && row.includes('scripts/dispatch-evidence.mjs');
    hold('A4', ok, row ? 'row-present' : 'row-absent');
  }
  {
    const skill = text('SKILL.md') || '';
    const item = skill.split('\n').find((l) => /^\s*- \[ \]/.test(l) && l.includes('scripts/dispatch-evidence.mjs'));
    hold('A5', !!item, item ? 'checklist-item' : 'item-absent');
  }
  {
    const score = text('SCORECARD.md') || '';
    const block = score.split('<!-- kumitate-gate-pins-v1')[1] || '';
    const m = block.match(/pin\.dispatch-evidence=([0-9a-f]{64})/);
    const blob = readT(GATE);
    const ok = !!m && !!blob && sha(blob) === m[1];
    hold('A6', ok, m ? (blob && sha(blob) === m[1] ? 'pin-match' : 'pin-mismatch') : 'pin-absent');
  }
  {
    const score = text('SCORECARD.md') || '';
    const row = score.split('\n').find((l) => /^\|\s*`?dispatch-evidence`?\s*\|/.test(l) && l.includes('round 60'));
    hold('A7', !!row, row ? 'capability-row' : 'row-absent');
  }
  {
    const lesson = text('corpus/lessons/round-60.md') || '';
    const ok = lesson.includes('## Gate') && lesson.includes('## Mistakes') && lesson.includes('dispatch-evidence');
    hold('A8', ok, `gate=${lesson.includes('## Gate')} mistakes=${lesson.includes('## Mistakes')} name=${lesson.includes('dispatch-evidence')}`);
  }
  {
    const skill = text('SKILL.md') || '';
    const rows = skill.split('\n').filter((l) => /^\|\s*[a-z0-9-]+\s*\|\s*gate\s*\|/.test(l)).length;
    const prose = skill.split('\n').find((l) => l.includes('are gates'));
    const words = { Twenty: 20, Nineteen: 19, Eighteen: 18, Seventeen: 17 };
    let stated = 0;
    for (const [w, n] of Object.entries(words)) if (prose && prose.includes(w)) stated = n;
    const ok = rows === EXPECTED_GATES && stated === EXPECTED_GATES;
    hold('A9', ok, `rows=${rows} prose=${stated}`);
  }
  {
    const run = spawnSync('node', [join(T, GATE), '--root', T, '--round', '60', '--wave', 'w1'],
      { cwd: T, encoding: 'utf8', timeout: 120000 });
    const out = `${run.stdout || ''}${run.stderr || ''}`;
    const ok = run.status === 0 && /DISPATCH_EVIDENCE: CLEAN/.test(out) && /seats=32\b/.test(out);
    hold('A10', ok, `exit=${run.status} ${out.split('\n')[0] || 'no-output'}`);
  }
} catch (err) {
  process.stderr.write(`DISPATCH60: FAIL-CLOSED ${err && err.message}\n`);
  rmSync(T, { recursive: true, force: true });
  process.exit(2);
}

const held = checks.filter((c) => c.ok).length;
const mismatch = checks.length !== EXPECTED_CHECKS;
const head = `DISPATCH60: ${mismatch ? 'DISPATCH60_UNMET' : (held === EXPECTED_CHECKS ? 'DISPATCH60_HELD' : 'DISPATCH60_UNMET')} held=${held}/${checks.length} checks=${EXPECTED_CHECKS} rev=${rev} rule=${RULE}${mismatch ? ' checks-mismatch' : ''}`;
finish(held === EXPECTED_CHECKS && !mismatch ? 0 : 1, head);
