#!/usr/bin/env node
/**
 * m6-snapshot-parse.mjs — standalone copy of the frozen M6 capture-table parse
 * from .ufo/waves/round-66/probe/deprec66-probe.mjs (rule M66 v1), run against a
 * fetched capture of https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md.
 *
 * The norm/delink helpers and the M6 parse block are copied verbatim.
 */
import { readFileSync } from 'node:fs';

const raw = readFileSync(process.argv[2], 'utf8');

// ---- copied verbatim from deprec66-probe.mjs ----
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const delink = (s) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

const capRows = [];
{
  const L = raw.split('\n');
  const dep = L.findIndex((l) => /^#{1,3}\s+Deprecated\b/.test(l));
  for (let i = Math.max(0, dep) + 1; i < L.length; i += 1) {
    if (/^#{1,3}\s+Removed\b/.test(L[i])) break;
    if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i]) || /^\|\s*Feature\s*\|/i.test(L[i])) continue;
    const c = L[i].trim().slice(1, -1).split('|').map((x) => norm(delink(x)));
    if (c.length >= 5) capRows.push(c);
  }
}
// ---- end copied block ----

console.log(`heading-match-index: ${raw.split('\n').findIndex((l) => /^#{1,3}\s+Deprecated\b/.test(l))}`);
console.log(`capRows.length: ${capRows.length}`);
capRows.forEach((c, i) => {
  const [feature, , depIn, , removal] = c;
  console.log(`row ${i + 1}: cells=${c.length}`);
  console.log(`  feature : ${feature}`);
  console.log(`  depIn   : ${depIn}`);
  console.log(`  removal : ${removal}`);
});
