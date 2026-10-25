#!/usr/bin/env node
// report-check.mjs — extract the "- S197 — "…"" bullets from the seat report and run the
// counter's T4/T5 rules against the capture and a live fetch.
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

const REPORT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1/K63ScoutArxivOpen.md';
const CAP = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html';
const LIVE = process.argv[2];

const text = readFileSync(REPORT, 'utf8');
const lines = text.split('\n');
const bullets = [];
for (const l of lines) {
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
  if (m) bullets.push({ id: m[1], q: m[2] });
}
const cap = norm(readFileSync(CAP));
const live = norm(readFileSync(LIVE));
let bad = 0;
for (const b of bullets) {
  const w = b.q.trim().split(/\s+/).length;
  const c = count(cap, norm(b.q));
  const l = count(live, norm(b.q));
  const ok = w <= 25 && c > 0 && l > 0;
  if (!ok) { bad += 1; console.log(`BAD id=${b.id} words=${w} cap=${c} live=${l} :: ${b.q.slice(0, 60)}`); }
}
console.log(`REPORT_BULLETS=${bullets.length} ids=${[...new Set(bullets.map((b) => b.id))].join(',')} BAD=${bad}`);
console.log(`REPORT_CHECK: ${bad === 0 && bullets.length >= 6 ? 'PASS' : 'FAIL'}`);
process.exit(bad === 0 && bullets.length >= 6 ? 0 : 1);
