#!/usr/bin/env node
/* Harness 7: quantify the findings on the REAL corpus (rounds 34..65) and on
 * ledger-shape edges, using the tool's own exported parser + the frozen counter's parser. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const LESS = join(LANE, 'corpus', 'lessons');
const tool = await import('file:///fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs');
const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;

const files = readdirSync(LESS).filter((f) => /^round-\d+-verifier-spotcheck\.md$/.test(f))
  .map((f) => ({ f, n: Number(/^round-(\d+)-/.exec(f)[1]) })).sort((a, b) => a.n - b.n);

const out = {};

// --- F1: every routed-heading occurrence per file, with the block it opens
out.routedHeadings = [];
for (const { f, n } of files) {
  const L = readFileSync(join(LESS, f), 'utf8').split('\n');
  const hits = [];
  for (let i = 0; i < L.length; i += 1) {
    const m = /^(#{1,6})\s+(.*)$/.exec(L[i]);
    if (m && HEAD_RE.test(m[2])) hits.push({ line: i + 1, level: m[1].length, text: m[2] });
  }
  if (hits.length !== 1) {
    out.routedHeadings.push({ file: f, n, hits: hits.map((h) => `L${h.line} h${h.level}: ${h.text}`) });
  }
}

// --- F1 quantified on round-37: items the tool binds vs items in the file's OWN routed block
{
  const txt = readFileSync(join(LESS, 'round-37-verifier-spotcheck.md'), 'utf8');
  const L = txt.split('\n');
  const hits = [];
  for (let i = 0; i < L.length; i += 1) {
    const m = /^(#{1,6})\s+(.*)$/.exec(L[i]);
    if (m && HEAD_RE.test(m[2])) hits.push({ i, level: m[1].length, text: m[2] });
  }
  const block = (h) => {
    let end = L.length;
    for (let j = h.i + 1; j < L.length; j += 1) {
      const m = /^(#{1,6})\s/.exec(L[j]);
      if (m && m[1].length <= h.level) { end = j; break; }
    }
    const sec = L.slice(h.i + 1, end);
    const isSep = (l) => /^\|[\s:|-]+\|\s*$/.test(l);
    return sec.filter((l, i) => (/^(?:[-*+]|\d+[.)])\s+\S/.test(l) || (l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1])))));
  };
  out.round37 = {
    headings: hits.map((h) => `L${h.i + 1} h${h.level}: ${h.text}`),
    toolBoundItems: tool.routedItems(txt).items.length,
    perBlock: hits.map((h) => ({ heading: h.text, items: block(h).length })),
  };
}

// --- F2/F3: thematic breaks, fences, HTML comments INSIDE the bound routed section
out.phantomItems = [];
for (const { f, n } of files) {
  const txt = readFileSync(join(LESS, f), 'utf8');
  const L = txt.split('\n');
  const start = L.findIndex((l) => { const m = /^(#{1,6})\s+(.*)$/.exec(l); return m && HEAD_RE.test(m[2]); });
  if (start < 0) continue;
  const level = (/^(#{1,6})\s/.exec(L[start]) || ['', ''])[1].length;
  let end = L.length;
  for (let j = start + 1; j < L.length; j += 1) { const m = /^(#{1,6})\s/.exec(L[j]); if (m && m[1].length <= level) { end = j; break; } }
  const sec = L.slice(start + 1, end);
  const thematic = sec.filter((l) => /^([-*_])(\s*\1){2,}\s*$/.test(l.trim()) && /[\s]/.test(l.trim()));
  const fences = sec.filter((l) => /^\s*```/.test(l));
  const comments = sec.filter((l) => /<!--/.test(l));
  if (thematic.length || fences.length || comments.length) {
    out.phantomItems.push({ file: f, n, thematic, fences, comments });
  }
}

// --- F8: ledger-shape edges against the tool's own ledgerRows()
const ledgerCases = {
  'exact "## Ledger"': ['# l', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', '| A | 1 | 1 | "q" | c | open | - |'].join('\n'),
  '"## Ledger" with a suffix': ['# l', '', '## Ledger (rounds 55..65)', '', '| A | 1 | 1 | "q" | c | open | - |'].join('\n'),
  'lowercase "## ledger"': ['# l', '', '## ledger', '', '| A | 1 | 1 | "q" | c | open | - |'].join('\n'),
  '"### Ledger" (level 3)': ['# l', '', '### Ledger', '', '| A | 1 | 1 | "q" | c | open | - |'].join('\n'),
  'second "## Ledger" section': ['# l', '', '## Ledger', '', '| A | 1 | 1 | "q" | c | open | - |', '', '## Ledger', '', '| B | 1 | 1 | "q" | c | open | - |'].join('\n'),
  'rows under a "### sub" heading inside Ledger': ['# l', '', '## Ledger', '', '| A | 1 | 1 | "q" | c | open | - |', '### notes', '', '| B | 1 | 1 | "q" | c | open | - |'].join('\n'),
  'row after a "## Notes" heading': ['# l', '', '## Ledger', '', '| A | 1 | 1 | "q" | c | open | - |', '', '## Notes', '', '| B | 1 | 1 | "q" | c | open | - |'].join('\n'),
};
out.ledgerShape = {};
for (const [k, v] of Object.entries(ledgerCases)) {
  const r = tool.ledgerRows(v);
  out.ledgerShape[k] = { section: r.section, rows: r.rows.length, ids: r.rows.map((x) => x.id), malformed: r.malformed };
}

console.log(JSON.stringify(out, null, 1));
