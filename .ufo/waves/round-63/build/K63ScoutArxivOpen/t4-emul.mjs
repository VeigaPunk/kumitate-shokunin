#!/usr/bin/env node
// t4-emul.mjs — emulate the frozen counter's T4/T5 quote arms on a candidate bullet list.
// Usage: node t4-emul.mjs <capture.html> <live.html> <quotes.json>
import { readFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n += 1; i += needle.length; } return n; };

const cap = norm(readFileSync(process.argv[2]));
const live = norm(readFileSync(process.argv[3]));
const quotes = JSON.parse(readFileSync(process.argv[4], 'utf8'));

// The entry's bullet form the counter parses:  /^- (S\d+) [—-] "(.+)"$/
const bullets = quotes.map((q) => {
  const line = `- S197 — "${q.quote}"`;
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(line);
  if (!m) return { ...q, bullet: line, parse: 'FAIL' };
  return { ...q, bullet: line, parse: 'OK', id: m[1], q: m[2] };
});

let bad = [];
for (const b of bullets) {
  const words = b.q.trim().split(/\s+/).length;
  const capN = count(cap, norm(b.q));
  const liveN = count(live, norm(b.q));
  const ok = b.parse === 'OK' && words <= 25 && capN > 0 && liveN > 0;
  if (!ok) bad.push(`${b.label}: parse=${b.parse} words=${words} cap=${capN} live=${liveN}`);
  console.log(`${ok ? 'OK  ' : 'FAIL'} id=${b.id || '-'} words=${words} capOcc=${capN} liveOcc=${liveN}  ${b.label}`);
}
console.log(`BULLETS=${bullets.length} ALL_OK=${bad.length === 0}`);
if (bad.length) { for (const x of bad) console.log('  BAD ' + x); }
process.exit(bad.length ? 1 : 0);
