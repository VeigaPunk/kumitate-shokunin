import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const cap = readFileSync(new URL('./capture/types.ts', import.meta.url));
const T = norm(cap);
console.log('sha256', createHash('sha256').update(cap).digest('hex'), 'bytes', cap.length);
const lines = readFileSync(new URL('./quotes.txt', import.meta.url), 'utf8').split('\n').filter(Boolean);
const src = cap.toString('utf8').split('\n');
let bad = 0;
for (const l of lines) {
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);   // the probe's O4 bullet regex
  if (!m) { console.log('BULLET-REGEX-FAIL', l); bad++; continue; }
  const q = m[2], w = q.trim().split(/\s+/).length, inNorm = T.includes(norm(q));
  const ln = src.map((s, i) => [i + 1, s]).filter(([, s]) => norm(s).includes(norm(q))).map(([i]) => i);
  console.log(inNorm && w <= 25 ? 'OK ' : 'BAD', `words=${w} lines=${ln.join(',')}`, q);
  if (!inNorm || w > 25) bad++;
}
console.log('bullets', lines.length, 'has2025-11-25', lines.some((l) => l.includes('2025-11-25')), 'bad', bad);
