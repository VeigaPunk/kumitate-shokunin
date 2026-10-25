#!/usr/bin/env node
// p2sim.mjs <tool.mjs> <controls-dir> — the frozen probe's P2 arm (receipt64-probe.mjs p2()), re-implemented
// verbatim so a candidate tool + control set can be measured without committing. Prints one line.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const tool = resolve(process.argv[2]);
const dir = resolve(process.argv[3]);
const run = (args) => spawnSync('node', [tool, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');
const cases = readdirSync(dir).filter((n) => existsSync(join(dir, n, 'expect')));
const bad = []; const seen = new Set(); let clean = 0; let honest = false;
for (const c of cases) {
  const [code, want] = readFileSync(join(dir, c, 'expect'), 'utf8').split('\n');
  const r = run(['--lane', join(dir, c, 'lane'), '--round', '9', '--report', join(dir, c, 'report.md')]);
  const got = r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout);
  if (String(r.status) !== code || got !== want) bad.push(`${c}:got=${r.status}/${got}`);
  else { if (want === 'CLEAN') clean += 1; else want.split(',').forEach((x) => seen.add(x)); if (c === 'c0-honest') honest = true; }
}
if (cases.length < 14) bad.push(`cases=${cases.length}`);
if (seen.size < 8) bad.push(`ids=${seen.size}`);
if (clean < 2) bad.push(`clean=${clean}`);
if (!honest) bad.push('honest-absent-or-wrong');
process.stdout.write(`P2SIM cases=${cases.length} ids=${seen.size} clean=${clean} honest=${honest} ${bad.length ? 'FAIL' : 'PASS'}\n`);
for (const b of bad) process.stdout.write(`  ${b}\n`);
process.exit(bad.length ? 1 : 0);
