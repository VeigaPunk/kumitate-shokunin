// extract.mjs — parse rounds 55..66 with BOTH the frozen counter's items67 (copied verbatim)
// and the v1 tool's exported routedItems; report counts, divergences, and dump items.
import { readFileSync, writeFileSync } from 'node:fs';
import { routedItems } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const spotPath = (n) => `${LANE}/corpus/lessons/round-${n}-verifier-spotcheck.md`;

// ---- verbatim copy of ledger68-probe.mjs items67 (frozen rule L68 v1)
function items67(text) {
  const lines = String(text).split('\n');
  const heads = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const f = lines[i].match(/^ {0,3}(```|~~~)/);
    if (f) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) heads.push({ i, lvl: m[1].length });
  }
  if (!heads.length) return { sections: [], items: [] };
  const sections = heads.map((h, idx) => {
    const end = idx + 1 < heads.length ? heads[idx + 1].i : lines.length;
    const sec = []; let fence = false;
    for (let j = h.i + 1; j < end; j += 1) {
      const fv = lines[j].match(/^ {0,3}(```|~~~)/);
      if (fv) { fence = !fence; sec.push({ l: lines[j], fence: true }); continue; }
      sec.push({ l: lines[j], fence });
    }
    return sec;
  });
  const items = [];
  for (const sec of sections) {
    const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
    for (let i = 0; i < sec.length; i += 1) {
      const l = sec[i].l;
      if (sec[i].fence) continue;
      const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
      const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1].l));
      if (row) { items.push({ n: null, text: l }); continue; }
      if (!list) continue;
      let body = l;
      for (let j = i + 1; j < sec.length; j += 1) {
        const n = sec[j];
        if (n.fence && !/^ {0,3}(```|~~~)/.test(n.l)) { body += `\n${n.l}`; continue; }
        if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n.l) || (n.l.startsWith('|') && !isSep(n.l))) break;
        if (/^\S/.test(n.l) && sec[j - 1].l.trim() === '') break;
        body += `\n${n.l}`;
      }
      items.push({ n: null, text: body });
    }
  }
  return { sections, items: items.map((x) => x.text) };
}

// ---- same norm/nwords/wb as the frozen counter (verbatim semantics)
export const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
export const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
export const wb = (quote, text) => { const q = norm(quote); if (!q) return false; return new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(text)); };

const rounds = {};
let tot67 = 0, totV1 = 0, sec67 = 0, secV1 = 0;
for (let n = 55; n <= 66; n += 1) {
  const t = readFileSync(spotPath(n), 'utf8');
  const a = items67(t), b = routedItems(t);
  rounds[n] = { c67: a.items, v1: b.items, c67sections: a.sections.length, v1found: b.found };
  tot67 += a.items.length; totV1 += b.items.length;
  sec67 += a.sections.length; secV1 += b.found ? 1 : 0;
  console.log(`round ${n}: items67=${a.items.length} sections=${a.sections.length} | v1 found=${b.found} items=${b.items.length}${a.items.length !== b.items.length ? '  <-- DIVERGENCE' : ''}`);
}
console.log(`TOTAL items67=${tot67} sections=${sec67} | v1=${totV1} sections=${secV1}`);
const dump = {};
for (const [n, r] of Object.entries(rounds)) dump[n] = r.c67.map((t, i) => ({ k: i + 1, norm: norm(t), raw: t }));
writeFileSync(process.argv[2] || 'items.json', JSON.stringify({ rounds: dump, tot67, totV1, sec67, secV1 }, null, 1));
console.log('dumped', process.argv[2] || 'items.json');
