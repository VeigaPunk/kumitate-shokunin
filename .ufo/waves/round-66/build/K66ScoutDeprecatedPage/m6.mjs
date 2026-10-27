// M6 parse replication — exact copy of the frozen counter's norm/delink + M6 capture-row logic
// (deprec66-probe.mjs lines 52-60 and 182-191), run on the seat capture.
import { readFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const delink = (s) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

const raw = readFileSync(process.argv[2], 'utf8');
const L = raw.split('\n');
const dep = L.findIndex((l) => /^#{1,3}\s+Deprecated\b/.test(l));
const capRows = [];
for (let i = Math.max(0, dep) + 1; i < L.length; i += 1) {
  if (/^#{1,3}\s+Removed\b/.test(L[i])) break;
  if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i]) || /^\|\s*Feature\s*\|/i.test(L[i])) continue;
  const c = L[i].trim().slice(1, -1).split('|').map((x) => norm(delink(x)));
  if (c.length >= 5) capRows.push(c);
}
console.log(`Deprecated heading at line index ${dep} (1-based ${dep + 1})`);
console.log(`M6 capture-table data rows = ${capRows.length}`);
capRows.forEach((c, i) => console.log(`${i + 1}: ${JSON.stringify(c)}`));
