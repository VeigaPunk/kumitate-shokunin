#!/usr/bin/env node
/**
 * c-vacuity.mjs — round-95 K95CriticA: measure whether counter arm (c) can observe the registry at all.
 *
 * Mirrors probe95-c1.mjs arm (c) (same clone, same fleet pin, same args) but prints, per round,
 * `citations.declared.length` / `citations.unresolved.length`, so "arm (c) never calls declaredPins()"
 * is a measurement, not an inference.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [CL, RD, FLEET, ORIGIN, BASE] = process.argv.slice(2);
const FLEET_REV = 'e2c52ba893c7d43cd1de92b30458e2d4c8e4098c';
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
env.GIT_CONFIG_NOSYSTEM = '1';
const run = (cmd, argv, o = {}) => spawnSync(cmd, argv, { encoding: 'utf8', env, maxBuffer: 64 << 20, timeout: 600000, ...o });
const ls = run('git', ['-C', FLEET, 'ls-tree', '-r', '--name-only', FLEET_REV, '.ufo/reports']);
const rounds = [];
for (const p of ls.stdout.split('\n')) {
  const m = /^\.ufo\/reports\/round-(\d+)\/kumitate\.md$/.exec(p);
  if (!m) continue;
  const n = Number(m[1]);
  const body = run('git', ['-C', FLEET, 'show', `${FLEET_REV}:${p}`]);
  mkdirSync(join(RD, `round-${n}`), { recursive: true });
  writeFileSync(join(RD, `round-${n}`, 'kumitate.md'), body.stdout);
  rounds.push(n);
}
rounds.sort((a, b) => a - b);
let dTot = 0; let uTot = 0; let checkedTot = 0; const withDecl = [];
for (const n of rounds) {
  const g = run(process.execPath, [BASE, '--round', String(n), '--lane', 'kumitate', '--repo', CL,
    '--reports-dir', RD, '--main-repo', FLEET, '--origin', ORIGIN, '--json'], { cwd: CL });
  let j = null; try { j = JSON.parse(g.stdout); } catch { j = null; }
  const c = j?.citations ?? {};
  const d = (c.declared ?? []).length; const u = (c.unresolved ?? []).length;
  dTot += d; uTot += u; checkedTot += c.checked ?? 0;
  if (d > 0) withDecl.push(`${n}:${d}`);
  console.log(`C95V r${n} checked=${c.checked} declared=${d} unresolved=${u} unverifiable=${(c.unverifiable ?? []).length}`);
}
console.log(`C95V rounds=${rounds.length} citedTokens=${checkedTot} declaredTotal=${dTot} unresolvedTotal=${uTot} roundsWithDeclared=${withDecl.join(',') || 'none'}`);
