#!/usr/bin/env node
// I63_Crosscheck — SUPPLEMENTARY receipt for C1 (frozen probe untouched).
// Closes I1/I2 self-certification: a print-only stub must fail, the honest tool must pass.
// Usage: node i63-crosscheck.mjs <lane-dir> <measured-rev>
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const [laneArg, measuredArg] = process.argv.slice(2);
if (!laneArg || !measuredArg) { process.stderr.write('usage: i63-crosscheck.mjs <lane-dir> <measured-rev>\n'); process.exit(64); }
const lane = resolve(laneArg);
const git = (...a) => spawnSync('git', ['-C', lane, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const rv = git('rev-parse', '--verify', `${measuredArg}^{commit}`);
if (rv.status !== 0) { process.stdout.write('I63_CROSSCHECK: UNMET rev-unreadable\n'); process.exit(2); }
const rev = rv.stdout.trim();
const T = mkdtempSync(join(tmpdir(), 'i63xc.'));
spawnSync('bash', ['-c', `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`]);
const tool = join(T, 'scripts', 'inline-dispatch-evidence.mjs');
const misses = [];
const A1 = () => { if (!existsSync(tool)) { misses.push('I1-source tool-absent'); return false; } const n = readFileSync(tool, 'utf8').split('\n').length; if (n < 100) misses.push(`I1-source lines=${n}<100`); return n >= 100; };
const A2 = () => {
  if (!existsSync(tool)) { misses.push('I2-source tool-absent'); return false; }
  const s = readFileSync(tool, 'utf8');
  const ids = ['NOT_A_DISPATCH', 'SPAWN_LOG_ABSENT', 'DONE_LOG_ABSENT', 'DEAD_UNNAMED', 'WAVE_ABSENT', 'RESULTS_UNREADABLE', 'SESSIONS_ROOT_ABSENT', 'SESSION_FOREIGN', 'REPORT_ABSENT'];
  const hit = ids.filter((i) => s.includes(i)).length;
  const ok = s.includes('spawnSync') && s.includes('FINDING') && s.includes('--rev') && hit >= 4;
  if (!ok) misses.push(`I2-source spawnSync=${s.includes('spawnSync')} FINDING=${s.includes('FINDING')} --rev=${s.includes('--rev')} known-ids=${hit}/9`);
  return ok;
};
const B1 = () => {
  if (!existsSync(tool)) { misses.push('I1-behavior tool-absent'); return false; }
  const r = spawnSync('node', [tool, '--selftest'], { encoding: 'utf8' });
  const m = /INLINE_DISPATCH_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(r.stdout);
  const ok = r.status === 0 && !!m && m[1] === m[2] && Number(m[1]) >= 25;
  if (!ok) misses.push(`I1-behavior exit=${r.status} line=${m ? m[0] : '(no pass line)'}`);
  return ok;
};
const B2 = () => {
  if (!existsSync(tool)) { misses.push('I2-behavior tool-absent'); return false; }
  // negative arm the frozen probe never runs: a wave that does not exist must fail closed,
  // never print CLEAN. Invocation shape mirrors the probe's I2 run (default sessions/log).
  const r = spawnSync('node', [tool, '--root', lane, '--rev', rev, '--round', '63', '--wave', 'no-such-wave'], { encoding: 'utf8' });
  const first = r.stdout.split('\n')[0] || '';
  const ok = r.status !== 0 && !first.startsWith('INLINE_DISPATCH: CLEAN') && r.stdout.includes('WAVE_ABSENT');
  if (!ok) misses.push(`I2-behavior exit=${r.status} first-line=${first.slice(0, 80)}`);
  return ok;
};
const A1ok = A1(); const A2ok = A2(); const B1ok = B1(); const B2ok = B2();
rmSync(T, { recursive: true, force: true });
const held = [A1ok, A2ok, B1ok, B2ok].filter(Boolean).length;
const pass = held === 4;
process.stdout.write(`I63_CROSSCHECK ${pass ? 'HELD' : 'UNMET'} held=${held}/4 rev=${rev}${misses.length ? ` | ${misses.join(' | ')}` : ''}\n`);
process.exit(pass ? 0 : 1);
