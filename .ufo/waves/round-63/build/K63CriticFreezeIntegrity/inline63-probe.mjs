#!/usr/bin/env node
/**
 * inline63-probe.mjs — frozen counter for kumitate round 63 claim C1 (rule I63 v1).
 *
 *   node .ufo/waves/round-63/probe/inline63-probe.mjs <lane-dir> <measured-rev> [<tip-rev>]
 *
 * Output: one verdict line and exit code.
 *   INLINE63_HELD  held=6/6 checks=6 rev=<measured> rule=I63   exit 0
 *   INLINE63_UNMET held=k/6 checks=6 rev=<measured> rule=I63 | <check> MISS <reason> ...   exit 1
 * Exit 2 only when the measured revision itself cannot be read.
 *
 * Lane bytes come from `git archive <measured-rev>` (committed bytes; the worktree is never read).
 * The wave checks (I2, I4) also read the host: the harness's session transcripts under
 * ~/.omp/agent/sessions and the orchestrator's dispatcher log — records the lane does not author.
 *
 * I1 the archive's scripts/inline-dispatch-evidence.mjs --selftest prints
 *    INLINE_DISPATCH_SELFTEST: PASS (N/N) with N >= 25, exit 0.
 * I2 every wave with a committed `.ufo/waves/round-63/<wave>-results.json` reads
 *    INLINE_DISPATCH: CLEAN under `--rev <measured>`, each wave has >= 32 seats, and the
 *    waves' seats sum to between 64 and 100.
 * I3 `.ufo/waves/round-63/controls/inline/<case>/` holds >= 10 committed cases (each with a
 *    lane/ tree, a sessions/ tree, dispatcher.log and `expect`): every case exits as `expect`
 *    names (first line: exit code, then the finding id, or `CLEAN`), and the honest case is CLEAN.
 * I4 minimal pair on the first real wave: the same committed bytes read DRIFT NOT_A_DISPATCH
 *    against an empty sessions root and DRIFT SPAWN_LOG_ABSENT against an empty dispatcher log.
 * I5 SCORECARD.md at the measured revision carries a capabilities row `inline-dispatch-evidence`
 *    whose first-working-round cell is 63.
 * I6 at <tip-rev> (default measured) `.ufo/waves/round-63/close/inline63-tip.txt` exists, its
 *    first line is `rev=<measured full hash>`, and it quotes every wave's CLEAN line from I2.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [laneArg, measuredArg, tipArg] = process.argv.slice(2);
if (!laneArg || !measuredArg) { process.stderr.write('usage: inline63-probe.mjs <lane-dir> <measured-rev> [<tip-rev>]\n'); process.exit(64); }
const lane = resolve(laneArg);
const git = (...a) => spawnSync('git', ['-C', lane, ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const rv = git('rev-parse', '--verify', `${measuredArg}^{commit}`);
if (rv.status !== 0) { process.stdout.write(`INLINE63_UNMET held=0/6 checks=6 rev=${measuredArg} rule=I63 | rev-unreadable\n`); process.exit(2); }
const rev = rv.stdout.trim();
const tip = tipArg ? git('rev-parse', '--verify', `${tipArg}^{commit}`).stdout.trim() : rev;

const T = mkdtempSync(join(tmpdir(), 'inline63.'));
spawnSync('bash', ['-c', `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`]);
const tool = join(T, 'scripts', 'inline-dispatch-evidence.mjs');
const gate = (args) => spawnSync('node', [tool, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const miss = [];
const ok = {};
const check = (id, pass, why) => { ok[id] = pass; if (!pass) miss.push(`${id} MISS ${why}`); };

// I1
if (!existsSync(tool)) check('I1', false, 'tool-absent');
else {
  const r = gate(['--selftest']);
  const m = /INLINE_DISPATCH_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(r.stdout);
  check('I1', r.status === 0 && !!m && m[1] === m[2] && Number(m[1]) >= 25, m ? `selftest=${m[1]}/${m[2]} exit=${r.status}` : `no-pass-line exit=${r.status}`);
}

// I2 + I4
const wavesList = git('ls-tree', '-r', '--name-only', rev, '--', '.ufo/waves/round-63').stdout.split('\n')
  .map((p) => /^\.ufo\/waves\/round-63\/([A-Za-z0-9._-]+)-results\.json$/.exec(p)).filter(Boolean).map((m) => m[1]).sort();
const cleanLines = [];
if (!existsSync(tool) || wavesList.length === 0) { check('I2', false, wavesList.length ? 'tool-absent' : 'no-committed-wave-results'); check('I4', false, 'no-committed-wave-results'); }
else {
  let total = 0; const bad = [];
  for (const w of wavesList) {
    const r = gate(['--root', lane, '--rev', rev, '--round', '63', '--wave', w]);
    const line = r.stdout.split('\n')[0];
    const m = /INLINE_DISPATCH: CLEAN \(seats=(\d+) /.exec(line);
    if (r.status !== 0 || !m) { bad.push(`${w}:${line.slice(0, 90)}`); continue; }
    cleanLines.push(line);
    total += Number(m[1]);
    if (Number(m[1]) < 32) bad.push(`${w}:seats=${m[1]}<32`);
  }
  if (total < 64 || total > 100) bad.push(`total-seats=${total}`);
  check('I2', bad.length === 0, bad.join(';'));
  const w0 = wavesList[0];
  const empty = join(T, 'empty'); spawnSync('mkdir', ['-p', empty]);
  const emptyLog = join(T, 'empty.log'); writeFileSync(emptyLog, '');
  const a = gate(['--root', lane, '--rev', rev, '--round', '63', '--wave', w0, '--sessions-root', empty]);
  const b = gate(['--root', lane, '--rev', rev, '--round', '63', '--wave', w0, '--dispatcher-log', emptyLog]);
  check('I4', a.status === 1 && /\bNOT_A_DISPATCH\b/.test(a.stdout) && b.status === 1 && /\bSPAWN_LOG_ABSENT\b/.test(b.stdout),
    `no-sessions exit=${a.status} not_a_dispatch=${/NOT_A_DISPATCH/.test(a.stdout)}; empty-log exit=${b.status} spawn_log_absent=${/SPAWN_LOG_ABSENT/.test(b.stdout)}`);
}

// I3
{
  const root = join(T, '.ufo', 'waves', 'round-63', 'controls', 'inline');
  let cases = [];
  try { cases = readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort(); } catch { /* absent */ }
  const bad = [];
  let honest = false;
  if (!existsSync(tool)) bad.push('tool-absent');
  else {
    for (const c of cases) {
      const d = join(root, c);
      let exp;
      try { exp = readFileSync(join(d, 'expect'), 'utf8').split('\n'); } catch { bad.push(`${c}:no-expect`); continue; }
      const r = gate(['--root', join(d, 'lane'), '--round', '7', '--wave', 'w1', '--sessions-root', join(d, 'sessions'), '--dispatcher-log', join(d, 'dispatcher.log')]);
      const want = Number(exp[0]);
      const id = (exp[1] || '').trim();
      const good = r.status === want && (id === 'CLEAN' ? /INLINE_DISPATCH: CLEAN/.test(r.stdout) : r.stdout.split('\n').some((l) => l.startsWith(`FINDING ${id}`)));
      if (!good) bad.push(`${c}:exit=${r.status} want=${want} ${id}`);
      if (id === 'CLEAN' && good) honest = true;
    }
  }
  if (cases.length < 10) bad.push(`cases=${cases.length}<10`);
  if (!honest) bad.push('no-honest-case');
  check('I3', bad.length === 0, bad.slice(0, 6).join(';'));
}

// I5
{
  const sc = git('show', `${rev}:SCORECARD.md`).stdout;
  const row = sc.split('\n').find((l) => /^\|\s*`inline-dispatch-evidence`\s*\|/.test(l));
  const cells = row ? row.split('|').map((c) => c.trim()) : [];
  check('I5', !!row && cells.length >= 6 && cells[cells.length - 2] === '63', row ? `first-working-round=${cells[cells.length - 2]}` : 'row-absent');
}

// I6
{
  const r = git('show', `${tip}:.ufo/waves/round-63/close/inline63-tip.txt`);
  const lines = r.status === 0 ? r.stdout.split('\n') : [];
  const missing = cleanLines.filter((l) => !r.stdout.includes(l));
  check('I6', r.status === 0 && lines[0] === `rev=${rev}` && cleanLines.length > 0 && missing.length === 0,
    r.status !== 0 ? 'tip-receipt-absent' : lines[0] !== `rev=${rev}` ? `first-line=${lines[0].slice(0, 60)}` : `missing-lines=${missing.length}`);
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(ok).filter(Boolean).length;
const pass = held === 6;
process.stdout.write(`INLINE63_${pass ? 'HELD' : 'UNMET'} held=${held}/6 checks=6 rev=${rev} rule=I63${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(pass ? 0 : 1);
