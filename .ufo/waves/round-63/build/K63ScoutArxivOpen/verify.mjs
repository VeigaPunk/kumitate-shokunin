#!/usr/bin/env node
// verify.mjs — locate quotes in the arXiv capture with section attribution and occurrence counts.
// Normalisation semantics copied from .ufo/waves/round-63/probe/topology63-probe.mjs (norm()).
import { readFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const CAP = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html';
const html = readFileSync(CAP, 'utf8');

// --- section segmentation over the raw HTML
const headRe = /<h([1-6])[^>]*class="[^"]*ltx_title[^"]*"[^>]*>([\s\S]*?)<\/h\1>/g;
const heads = [];
let m;
while ((m = headRe.exec(html)) !== null) {
  const text = norm(m[2]);
  if (!text) continue;
  heads.push({ level: Number(m[1]), text, start: m.index, end: m.index + m[0].length });
}
// chunk of a heading ends at the next heading of level <= its own level (siblings terminate a section)
for (let i = 0; i < heads.length; i += 1) {
  let stop = html.length;
  for (let j = i + 1; j < heads.length; j += 1) if (heads[j].level <= heads[i].level) { stop = heads[j].start; break; }
  heads[i].stop = stop;
}
// ancestor stack (open ancestors at each heading)
const stack = [];
for (const h of heads) {
  while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop();
  h.ancestors = stack.map((x) => x.text);
  stack.push(h);
}

const quotes = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const capNorm = norm(html);
const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n += 1; i += needle.length; } return n; };

let allOk = true;
for (const q of quotes) {
  const nq = norm(q.quote);
  const inCap = count(capNorm, nq);
  // section attribution: first heading whose chunk contains the quote (normalised chunk match)
  let section = 'UNKNOWN';
  let occurrencesInSec = 0;
  {
    const hits = [];
    for (const h of heads) {
      const chunk = norm(html.slice(h.start, h.stop));
      const c = count(chunk, nq);
      if (c > 0) hits.push({ h, c, size: h.stop - h.start });
    }
    if (hits.length) {
      // most specific = smallest chunk
      hits.sort((a, b) => a.size - b.size);
      const best = hits[0];
      section = `${best.h.ancestors.concat([best.h.text]).join(' > ')}`;
      occurrencesInSec = best.c;
    }
  }
  const words = q.quote.trim().split(/\s+/).length;
  const ok = inCap > 0 && words <= 25;
  if (!ok) allOk = false;
  console.log(`${ok ? 'OK  ' : 'FAIL'} words=${words} capOccurrences=${inCap} secOccurrences=${occurrencesInSec}`);
  console.log(`     section: ${section}`);
  console.log(`     quote  : ${q.quote}`);
  console.log(`     label  : ${q.label || ''}`);
}
console.log(`ALL_OK=${allOk}`);
process.exit(allOk ? 0 : 1);
