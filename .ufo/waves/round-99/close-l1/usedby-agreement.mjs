// usedby-agreement.mjs — L1 measurement of the out-of-scope used-by path-part class (plan limit 2, K99CriticB D3).
// For each probe99 pad class, one fixture lane whose only mined row cites an existing lesson path with the pad
// appended to the path part; compares BASE and M2 USED_BY_MISSING with census E11 under three locales.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [,, base, m2, work] = process.argv;
const probe = readFileSync(new URL('../probe/probe99-c1.mjs', import.meta.url), 'utf8');
const PADS = eval(`(${/const PADS = (\{[\s\S]*?\n\});/.exec(probe)[1]})`);
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
rmSync(work, { recursive: true, force: true });
const agree = { base: { 'C': 0, 'C.UTF-8': 0, 'en_US.UTF-8': 0 }, m2: { 'C': 0, 'C.UTF-8': 0, 'en_US.UTF-8': 0 } };
const rows = [];
for (const [name, pad] of Object.entries(PADS)) {
  const d = join(work, name);
  mkdirSync(join(d, 'corpus', 'knowledge'), { recursive: true }); mkdirSync(join(d, 'corpus', 'lessons'), { recursive: true });
  writeFileSync(join(d, 'corpus', 'lessons', 'x.md'), 'x\n');
  writeFileSync(join(d, 'corpus', 'SOURCES.md'), ['# SOURCES — fixture', '', '## Registry', '',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    `| S101 | T — https://example.org/a | docs | A | s | a | t | mined | 2025-01-01 | on-release | corpus/lessons/x.md${pad} |`,
    '', '## Paths', '', '## Search log', '', '## Leads (unopened)', ''].join('\n'));
  const tool = (p) => /USED_BY_MISSING/.test(String(spawnSync('node', [p, '--self', d, '--today', '2026-11-07', '--json'], { env: { ...process.env, SHOKUNIN_ROOT: work } }).stdout));
  const b = tool(base); const m = tool(m2);
  const cen = {};
  for (const loc of ['C', 'C.UTF-8', 'en_US.UTF-8']) {
    cen[loc] = /\tE11\t/.test(String(spawnSync('bash', [CENSUS, 'validate', '--file', join(d, 'corpus', 'SOURCES.md'), '--today', '2026-11-07'], { env: { ...process.env, LC_ALL: loc, LANG: loc } }).stdout));
    if (cen[loc] === b) agree.base[loc] += 1;
    if (cen[loc] === m) agree.m2[loc] += 1;
  }
  rows.push(`${name.padEnd(11)} base=${+b} m2=${+m} census C=${+cen.C} C.UTF-8=${+cen['C.UTF-8']} en_US.UTF-8=${+cen['en_US.UTF-8']}`);
}
console.log(rows.join('\n'));
const n = Object.keys(PADS).length;
for (const k of ['base', 'm2']) console.log(`USEDBY_AGREE ${k}: ${Object.entries(agree[k]).map(([l, v]) => `${l}=${v}/${n}`).join(' ')}`);
rmSync(work, { recursive: true, force: true });
