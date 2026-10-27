#!/usr/bin/env node
/**
 * reanchor.mjs — helper for round-66 routed-ledger D2/D3 answers (seat K66ScribeLedger65).
 *
 *   node .ufo/waves/round-66/build/K66ScribeLedger65/reanchor.mjs [--root DIR]
 *
 * Reads only. For each registry home the round-66 rows are supposed to land in (`SCORECARD.md` `## Capabilities`,
 * `SKILL.md` `## Gate registry`), finds the line whose FIRST cell names the capability/gate, and prints
 * `path:line — "quote"` where the quote is a <= 25-word phrase located on that line (checked with the gate's own
 * `norm()`). Paste the printed `path:line` and quote into the R65-D2 / R65-D3 answer cells of `corpus/routed-ledger.md`
 * (or leave the row `open` if nothing prints). Exit 0 when every target is found, 1 when one is missing, 64 usage.
 */
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { norm } from '../../../../../scripts/routed-ledger.mjs';

const argv = process.argv.slice(2);
let root = resolve(process.cwd());
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === '--root' && argv[i + 1]) { root = resolve(argv[i + 1]); i += 1; }
  else { console.log('reanchor: USAGE [--root DIR]'); process.exit(64); }
}

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** Line index range of a `## Section` (exclusive of the next `## ` heading). */
function section(L, title) {
  const at = L.findIndex((l) => l === `## ${title}`);
  if (at < 0) return null;
  let end = L.length;
  for (let i = at + 1; i < L.length; i += 1) if (/^##\s/.test(L[i])) { end = i; break; }
  return [at, end];
}

const targets = [
  { path: 'SCORECARD.md', section: 'Capabilities', token: 'harm-matrix' },
  { path: 'SCORECARD.md', section: 'Capabilities', token: 'routed-ledger' },
  { path: 'SKILL.md', section: 'Gate registry', token: 'harm-matrix' },
  { path: 'SKILL.md', section: 'Gate registry', token: 'omp-binary-probe' },
  { path: 'SKILL.md', section: 'Gate registry', token: 'routed-ledger' },
];

let missing = 0;
for (const t of targets) {
  let text;
  try { text = readFileSync(join(root, t.path), 'utf8'); } catch { console.log(`MISSING ${t.path} unreadable`); missing += 1; continue; }
  const L = text.split('\n');
  const range = t.section ? section(L, t.section) : null;
  const [from, to] = range ?? [0, L.length];
  const lineNo = (() => {
    for (let i = from + 1; i < to; i += 1) {
      if (!/^\|/.test(L[i])) continue;
      const first = L[i].split('|')[1] ?? '';
      if (first.replace(/[`*\s]/g, '') === t.token.replace(/[`*\s]/g, '')) return i;
    }
    return -1;
  })();
  if (lineNo < 0) { console.log(`MISSING ${t.path} §${t.section ?? '*'} first-cell=${t.token}`); missing += 1; continue; }
  const cells = L[lineNo].split('|').map((c) => c.trim());
  const body = norm(cells.slice(2).join(' ').replace(/`/g, ''));
  const ws = body.split(' ');
  let quote = ws.slice(0, 25).join(' ');
  if (words(quote) > 25) quote = ws.slice(0, 24).join(' ');
  const win = norm(L.slice(Math.max(0, lineNo - 2), lineNo + 3).join(' '));
  const ok = win.includes(norm(quote));
  console.log(`${t.path}:${lineNo + 1} — "${quote}"${ok ? '' : ' [NOT-LOCATED]'}`);
  if (!ok) missing += 1;
}
process.exit(missing === 0 ? 0 : 1);
