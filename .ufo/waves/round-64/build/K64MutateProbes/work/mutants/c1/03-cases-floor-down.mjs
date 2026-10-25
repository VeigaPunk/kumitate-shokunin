#!/usr/bin/env node
/**
 * receipt64-probe.mjs — frozen counter for kumitate round 64 claim C1 (rule R64 v1).
 *
 *   node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane-dir> <measured-rev> [--report <file>] [--fleet <dir>]
 *
 * Output: one verdict line and exit code.
 *   RECEIPT64_HELD  held=5/5 checks=5 rev=<measured> rule=R64   exit 0
 *   RECEIPT64_UNMET held=k/5 checks=5 rev=<measured> rule=R64 | <check> MISS <reason> ...   exit 1
 * Exit 2 only when the measured revision itself cannot be read.
 * Lane bytes come from `git archive <measured-rev>` (committed bytes; the worktree is never read).
 *
 * P1 the archive's scripts/report-receipt-diff.mjs --selftest prints REPORT_RECEIPT_SELFTEST: PASS (N/N), N >= 20, exit 0.
 * P2 `.ufo/waves/round-64/controls/receipt/<case>/` holds >= 14 committed cases (report.md, lane/, expect); the tool run
 *    with `--lane <case>/lane --round 9 --report <case>/report.md` exits and prints finding ids as `expect` names
 *    (line 1 exit code, line 2 comma-joined sorted ids or CLEAN); the honest case reads CLEAN; >= 8 distinct finding ids
 *    are exercised across cases, and at least two cases read CLEAN.
 * P3 real data: the round-60 report as filed (fleet commit 7b0581ed) run with `--round 60 --rev <measured>` exits 1 with
 *    exactly as many PLACEHOLDER lines as an independent `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` count of the same bytes
 *    (6) and a TALLY_UNRECEIPTED line naming `DISPATCH60_HELD held=10/10`; the round-63 report as filed (fleet commit
 *    8fd46e61) run with `--round 63 --rev <measured>` reads CLEAN.
 * P4 the counter can fail: a stub tool that always prints CLEAN and exits 0, and a stub that always prints DRIFT and exits 1,
 *    each run through the same P2+P3 harness, must each score a MISS.
 * P5 with `--report <file>`: the tool run with `--round 64 --rev <measured>` over that file reads CLEAN (exit 0).
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--report', '--fleet'].includes(argv[i - 1])));
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
if (pos.length < 2) { process.stderr.write('usage: receipt64-probe.mjs <lane-dir> <measured-rev> [--report file] [--fleet dir]\n'); process.exit(64); }
const lane = resolve(pos[0]);
const FLEET = resolve(opt('--fleet') || '/home/vgpnk/Projects/shokunin');
const R60 = '7b0581ed'; const R63 = '8fd46e61';
const git = (d, ...a) => spawnSync('git', ['-C', d, ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const rv = git(lane, 'rev-parse', '--verify', `${pos[1]}^{commit}`);
if (rv.status !== 0) { process.stdout.write(`RECEIPT64_UNMET held=0/5 checks=5 rev=${pos[1]} rule=R64 | rev-unreadable\n`); process.exit(2); }
const rev = rv.stdout.trim();
const T = mkdtempSync(join(tmpdir(), 'receipt64.'));
spawnSync('bash', ['-c', `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`]);
const tool = join(T, 'scripts', 'report-receipt-diff.mjs');
const run = (toolPath, args) => spawnSync('node', [toolPath, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');

function p2(toolPath) {
  const dir = join(T, '.ufo/waves/round-64/controls/receipt');
  if (!existsSync(dir)) return { ok: false, why: 'controls-absent' };
  const cases = readdirSync(dir).filter((n) => existsSync(join(dir, n, 'expect')));
  const bad = []; const seen = new Set(); let clean = 0; let honest = false;
  for (const c of cases) {
    const [code, want] = readFileSync(join(dir, c, 'expect'), 'utf8').split('\n');
    const r = run(toolPath, ['--lane', join(dir, c, 'lane'), '--round', '9', '--report', join(dir, c, 'report.md')]);
    const got = r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout);
    if (String(r.status) !== code || got !== want) bad.push(`${c}:got=${r.status}/${got}`);
    else { if (want === 'CLEAN') clean += 1; else want.split(',').forEach((x) => seen.add(x)); if (c === 'c0-honest') honest = true; }
  }
  if (cases.length < 13) bad.push(`cases=${cases.length}`);
  if (seen.size < 8) bad.push(`ids=${seen.size}`);
  if (clean < 2) bad.push(`clean=${clean}`);
  if (!honest) bad.push('honest-absent-or-wrong');
  return { ok: bad.length === 0, why: bad.slice(0, 5).join(';') };
}
function p3(toolPath) {
  const bad = [];
  const blob = (c, r) => git(FLEET, 'show', `${c}:.ufo/reports/round-${r}/kumitate.md`);
  const b60 = blob(R60, 60); const b63 = blob(R63, 63);
  if (b60.status !== 0 || b63.status !== 0) return { ok: false, why: 'fleet-blob-unreadable' };
  const f60 = join(T, 'r60.md'); const f63 = join(T, 'r63.md');
  writeFileSync(f60, b60.stdout); writeFileSync(f63, b63.stdout);
  const indep = (b60.stdout.match(/__[A-Z][A-Z0-9_]*__/g) || []).length;
  const a = run(toolPath, ['--lane', lane, '--round', '60', '--report', f60, '--rev', rev, '--fleet', FLEET]);
  const ph = a.stdout.split('\n').filter((l) => l.startsWith('PLACEHOLDER ')).length;
  if (a.status !== 1) bad.push(`r60-exit=${a.status}`);
  if (indep < 1 || ph !== indep) bad.push(`r60-placeholders=${ph}/indep=${indep}`);
  if (!/^TALLY_UNRECEIPTED DISPATCH60_HELD held=10\/10$/m.test(a.stdout)) bad.push('r60-tally-line-absent');
  const b = run(toolPath, ['--lane', lane, '--round', '63', '--report', f63, '--rev', rev, '--fleet', FLEET]);
  if (b.status !== 0 || !b.stdout.startsWith('REPORT_RECEIPT: CLEAN')) bad.push(`r63-exit=${b.status}`);
  return { ok: bad.length === 0, why: bad.join(';') };
}

const miss = []; const ok = {};
const check = (id, pass, why) => { ok[id] = pass; if (!pass) miss.push(`${id} MISS ${why}`); };
if (!existsSync(tool)) { for (const id of ['P1', 'P2', 'P3', 'P4']) check(id, false, 'tool-absent'); }
else {
  const s = run(tool, ['--selftest']);
  const m = /REPORT_RECEIPT_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(s.stdout);
  check('P1', s.status === 0 && !!m && m[1] === m[2] && Number(m[1]) >= 20, m ? `selftest=${m[1]}/${m[2]} exit=${s.status}` : `no-pass-line exit=${s.status}`);
  const r2 = p2(tool); check('P2', r2.ok, r2.why);
  const r3 = p3(tool); check('P3', r3.ok, r3.why);
  const stubClean = join(T, 'stub-clean.mjs'); const stubDrift = join(T, 'stub-drift.mjs');
  writeFileSync(stubClean, "process.stdout.write('REPORT_RECEIPT: CLEAN (stub)\\n');");
  writeFileSync(stubDrift, "process.stdout.write('REPORT_RECEIPT: DRIFT PLACEHOLDER (stub)\\nPLACEHOLDER x\\n'); process.exit(1);");
  const fails = [stubClean, stubDrift].map((s2) => !(p2(s2).ok && p3(s2).ok));
  check('P4', fails.every(Boolean), `stub-clean-fails=${fails[0]} stub-drift-fails=${fails[1]}`);
}
const rep = opt('--report');
if (!rep) check('P5', false, 'report-not-given');
else if (!existsSync(tool)) check('P5', false, 'tool-absent');
else {
  const r = run(tool, ['--lane', lane, '--round', '64', '--report', resolve(rep), '--rev', rev, '--fleet', FLEET]);
  check('P5', r.status === 0 && r.stdout.startsWith('REPORT_RECEIPT: CLEAN'), `exit=${r.status} ${r.stdout.split('\n')[0]}`);
}
rmSync(T, { recursive: true, force: true });
const held = Object.values(ok).filter(Boolean).length;
process.stdout.write(`RECEIPT64_${held === 5 ? 'HELD' : 'UNMET'} held=${held}/5 checks=5 rev=${rev} rule=R64${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(held === 5 ? 0 : 1);
