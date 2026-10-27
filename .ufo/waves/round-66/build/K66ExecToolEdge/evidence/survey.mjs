#!/usr/bin/env node
/* Survey the real lane spot-checks for the edge constructs this seat attacks. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const LESS = join(LANE, 'corpus', 'lessons');
const files = readdirSync(LESS).filter((f) => /^round-\d+-verifier-spotcheck\.md$/.test(f)).sort();

const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;
const listRe = /^(?:[-*+]|\d+[.)])\s+\S/;

function routedSections(text) {
  const L = text.split('\n');
  const hits = [];
  for (let i = 0; i < L.length; i += 1) {
    const m = /^(#{1,6})\s+(.*)$/.exec(L[i]);
    if (m && HEAD_RE.test(m[2])) hits.push({ i, level: m[1].length, text: m[2] });
  }
  return { L, hits };
}

let totalItems = 0;
const rows = [];
for (const f of files) {
  const raw = readFileSync(join(LESS, f), 'utf8');
  const hasCR = raw.includes('\r');
  const { L, hits } = routedSections(raw);
  const first = hits[0];
  let end = L.length;
  if (first) {
    for (let i = first.i + 1; i < L.length; i += 1) {
      const m = /^(#{1,6})\s/.exec(L[i]);
      if (m && m[1].length <= first.level) { end = i; break; }
    }
  }
  const sec = L.slice(first ? first.i + 1 : 0, end);
  // fences
  let fence = null; const fenceOpen = [];
  const fenceDashLines = [];
  for (const l of sec) {
    if (/^```/.test(l)) {
      if (fence === null) { fence = true; fenceOpen.push(l); } else { fence = null; fenceOpen.push(l); }
      continue;
    }
    if (fence === true && listRe.test(l)) fenceDashLines.push(l);
  }
  const htmlComments = sec.filter((l) => /<!--/.test(l)).length;
  const setext = sec.filter((l) => /^(=+|-{2,})$/.test(l)).length;
  const tabs = sec.filter((l) => l.includes('\t')).length;
  const trailingWs = sec.filter((l) => /^\s*\|.*\|\s+$/.test(l)).length;
  const multiRouted = hits.length;
  const items = sec.filter((l) => listRe.test(l) || (l.startsWith('|') && !/^\|[\s:|-]+\|\s*$/.test(l))).length;
  totalItems += items;
  const n = Number(/^round-(\d+)-/.exec(f)[1]);
  rows.push({ f, n, multiRouted, hits: hits.map((h) => `${h.level}:${h.text}`), items, fence: fenceOpen.length, fenceDashLines: fenceDashLines.length, htmlComments, setext, tabs, trailingWs, hasCR });
}
const show = rows.filter((r) => r.n >= 55);
console.log('--- rounds 55..65 (claim range) ---');
for (const r of show) console.log(JSON.stringify(r));
console.log('--- rounds with any edge construct (all) ---');
for (const r of rows) {
  if (r.multiRouted !== 1 || r.fence || r.htmlComments || r.setext || r.tabs || r.hasCR || r.fenceDashLines) console.log(JSON.stringify(r));
}
console.log('total approximate items over all spot-checks:', totalItems);
