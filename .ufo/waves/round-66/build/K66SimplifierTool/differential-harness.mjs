// differential: v1 vs v2 of routed-ledger.mjs over real corpus text + seeded random markdown
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as V1 from './routed-ledger.v1-freeze.mjs';
import * as V2 from './routed-ledger.v2.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = '621212bac37f8249c72ac982d1d6534cb8d60701';
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let n = 0; const bad = [];
const cmp = (label, text) => {
  n += 1;
  const a1 = V1.routedItems(text); const a2 = V2.routedItems(text);
  const b1 = V1.ledgerRows(text); const b2 = V2.ledgerRows(text);
  const c1 = V1.norm(text); const c2 = V2.norm(text);
  if (!eq(a1, a2)) bad.push(`${label}:routedItems`);
  if (!eq(b1, b2)) bad.push(`${label}:ledgerRows`);
  if (c1 !== c2) bad.push(`${label}:norm`);
};

// 1. every markdown file in the lane worktree
let files = [];
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = `${d}/${e.name}`;
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.md')) files.push(p);
  }
};
walk(LANE);
for (const f of files) cmp(`wt:${f.slice(LANE.length + 1)}`, readFileSync(f, 'utf8'));

// 2. the eleven routed spot-checks at the freeze commit
for (let r = 55; r <= 65; r += 1) {
  const p = `corpus/lessons/round-${r}-verifier-spotcheck.md`;
  cmp(`rev:${p}`, execSync(`git -C ${LANE} show ${REV}:${p}`, { encoding: 'utf8', maxBuffer: 1 << 28 }));
}

// 3. seeded random markdown-ish documents
let seed = 0x66;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const words = ['map', 'drift', 'pin', 'tier', 'counts', '**bold**', '`code`', '"q"', 'a|b', '—', 'R&D', 'x&y', '&amp;'];
const head = ['#', '##', '###', '####', '#####', '######'];
const TEXT = ['Routed defects', 'routed items', 'ROUTED_HELD', 'Routed  items for round 9', 'Verdicts', 'Non-author statement', 'routed defect'];
const line = () => {
  const k = rnd();
  const w = () => Array.from({ length: 1 + Math.floor(rnd() * 6) }, () => pick(words)).join(' ');
  if (k < 0.12) return `${pick(head)} ${pick(TEXT)}`;
  if (k < 0.20) return `${pick(head)} something else ${w()}`;
  if (k < 0.38) return `${pick(['- ', '* ', '+ ', '1. ', '2) ', '10. '])}${w()}`;
  if (k < 0.50) return `  ${pick(['- ', '* '])}${w()}`;
  if (k < 0.60) return `| ${w()} | ${w()} |`;
  if (k < 0.66) return '|---|---|';
  if (k < 0.70) return '| --- | :---: |';
  if (k < 0.74) return '|';
  if (k < 0.80) return '';
  if (k < 0.84) return w();
  if (k < 0.88) return `\t${w()}`;
  if (k < 0.92) return '## Ledger';
  if (k < 0.96) return `| R${1 + Math.floor(rnd() * 9)} | 7 | 1 | "x y" | cls | open | - |`;
  return `**${w()}**`;
};
for (let i = 0; i < 5000; i += 1) {
  const len = 1 + Math.floor(rnd() * 40);
  cmp(`fuzz:${i}`, Array.from({ length: len }, line).join('\n'));
}

const passed = bad.length === 0;
console.log(`DIFF cases=${n} mismatches=${bad.length}${passed ? '' : ` first=${bad.slice(0, 5).join(',')}`}`);
process.exitCode = passed ? 0 : 1;
