// Verbatim items67 lifted from the frozen counter (lines 133-177), applied to rounds 55-57.
import { readFileSync } from 'node:fs';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const src = readFileSync(`${LANE}/.ufo/waves/round-68/probe/ledger68-probe.mjs`, 'utf8').split('\n');
const fnSrc = src.slice(132, 177).join('\n'); // lines 133..177 inclusive
if (!fnSrc.startsWith('function items67')) { console.error('slice drift: ' + fnSrc.slice(0, 40)); process.exit(3); }
const items67 = new Function(fnSrc + '\nreturn items67;')();
const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const out = {};
for (const n of [55, 56, 57]) {
  const t = readFileSync(`${LANE}/corpus/lessons/round-${n}-verifier-spotcheck.md`, 'utf8');
  const r = items67(t);
  out[n] = { sections: r.sections.length, items: r.items };
  console.log(`ROUND ${n} sections=${r.sections.length} items=${r.items.length}`);
  r.items.forEach((it, i) => {
    console.log(`--- R${n}-${i + 1} words=${nwords(norm(it))}`);
    console.log(JSON.stringify(norm(it)));
  });
}
