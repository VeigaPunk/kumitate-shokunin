#!/usr/bin/env node
/* Harness 9: separator-row divergence (tool sep() vs frozen counter isSep()),
 * and plausibility of pipes in real answer lines. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const tool = await import('file:///fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs');

// tool sep()
const toolSep = (l) => /^\|[\s:|-]+\|\s*$/.test(l) && l.includes('-');
// frozen counter isSep()
const cSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());

const SEPS = ['|---|---|', '|---|', '| --- | --- |', '| --- | ---', '|:---|---:|', '|--|--|--|'];
const rows = [];
for (const s of SEPS) {
  const spot = ['# Round 7', '', '## 5. Routed defects', '', '- **D1 — the readme row is missing.**', '',
    '| id | what |', s, '| D2 | the capability row is absent |', '', '## End', ''].join('\n');
  const toolItems = tool.routedItems(spot).items;
  // counter items
  const lines = spot.split('\n');
  let h = -1; let lvl = 0;
  for (let i = 0; i < lines.length && h < 0; i += 1) {
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) { h = i; lvl = m[1].length; }
  }
  const sec = [];
  for (let i = h + 1; i < lines.length; i += 1) { const m = lines[i].match(/^(#+)\s/); if (m && m[1].length <= Math.min(lvl, 6)) break; sec.push(lines[i]); }
  const cOut = [];
  for (let i = 0; i < sec.length; i += 1) {
    const l = sec[i];
    const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
    const row = l.startsWith('|') && !cSep(l) && !(i + 1 < sec.length && cSep(sec[i + 1]));
    if (row) { cOut.push(l); continue; }
    if (!list) continue;
    cOut.push(l);
  }
  rows.push({ separator: JSON.stringify(s), toolSep: toolSep(s), counterSep: cSep(s), toolItems: toolItems.length, counterItems: cOut.length, diverge: toolItems.length !== cOut.length });
}
console.log(JSON.stringify(rows, null, 1));

/* plausibility: pipes inside answer-ish lines of the real corpus */
const ans = readFileSync(join(LANE, 'corpus', 'lessons', 'round-65-verifier-spotcheck.md'), 'utf8');
const pipeLines = ans.split('\n').filter((l) => l.includes('|'));
console.log('--- round-65 lines containing a pipe:', pipeLines.length, 'of', ans.split('\n').length);
console.log(pipeLines.slice(0, 6).join('\n'));
