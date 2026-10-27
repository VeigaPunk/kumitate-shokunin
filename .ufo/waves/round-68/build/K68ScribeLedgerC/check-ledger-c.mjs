#!/usr/bin/env node
// Draft-validator for seat K68ScribeLedgerC: the frozen C1 counter's L3 rules restricted to
// rounds 61..63. items67/norm/nwords/wb/ledgerParse are copied verbatim from
// .ufo/waves/round-68/probe/ledger68-probe.mjs:127-204 (the frozen rule L68 v1), so the row
// grammar is judged by the same code the counter runs, not by a re-reading of it.
import { readFileSync, existsSync } from 'node:fs';
import { join, normalize } from 'node:path';

const lane = process.argv[2];
const rowsFile = process.argv[3];
if (!lane || !rowsFile) { process.stderr.write('usage: check-ledger-c.mjs <lane-dir> <rows.md>\n'); process.exit(64); }

const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const wb = (quote, text) => { const q = norm(quote); if (!q) return false; return new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(text)); };
const rd = (rel) => { const p = join(lane, rel); return existsSync(p) ? readFileSync(p, 'utf8') : null; };

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
const ledgerParse = (text) => {
  const L = String(text || '').split('\n');
  const at = L.findIndex((l) => /^##\s+Ledger\s*$/.test(l));
  const rows = [];
  if (at < 0) return rows;
  for (let i = at + 1; i < L.length; i += 1) {
    if (/^##?\s/.test(L[i])) break;
    if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i])) continue;
    const c = L[i].trim().slice(1, -1).split('|').map((x) => x.trim());
    if (c[0] === 'id' || c.length !== 7) { if (c[0] !== 'id') rows.push({ bad: true, line: i + 1 }); continue; }
    rows.push({ id: c[0], n: Number(c[1]), k: Number(c[2]), quote: c[3].replace(/^"(.*)"$/, '$1'), cls: c[4], status: c[5], answer: c[6], line: i + 1 });
  }
  return rows;
};

const FROM = 61; const TO = 63;
const spotPath = (n) => `corpus/lessons/round-${n}-verifier-spotcheck.md`;
const spot = new Map();
for (let n = FROM; n <= TO; n += 1) { const t = rd(spotPath(n)); if (t != null) spot.set(n, items67(t)); }
for (const [n, s] of spot) process.stdout.write(`PARSER: round=${n} sections=${s.sections.length} items=${s.items.length}\n`);

const bad = [];
const rows = ledgerParse(readFileSync(rowsFile, 'utf8'));
if (!rows.length) bad.push('ledger-empty-or-absent');
const covered = new Set(); const classes = new Map(); const nonOpen = new Map();
for (const r of rows) {
  if (r.bad) { bad.push(`malformed@${r.line}`); continue; }
  const secR = spot.get(r.n);
  const it = secR ? secR.items : null;
  if (!it || !(r.k >= 1 && r.k <= it.length)) { bad.push(`${r.id}:item-absent`); continue; }
  const nq = nwords(r.quote);
  if (!r.quote || nq > 25 || nq < 3) { bad.push(`${r.id}:quote-words=${nq}`); continue; }
  if (!wb(r.quote, it[r.k - 1])) { bad.push(`${r.id}:quote-not-word-boundary-in-item`); continue; }
  const hits = it.filter((t) => wb(r.quote, t)).length;
  if (hits > 1) { bad.push(`${r.id}:quote-not-unique-in-section`); continue; }
  const idm = /^R(\d+)-/.exec(r.id);
  if (idm && Number(idm[1]) !== r.n) { bad.push(`${r.id}:id-round-mismatch`); continue; }
  covered.add(`${r.n}#${r.k}`);
  if (/^[a-z][a-z0-9-]*$/.test(r.cls)) { const s = classes.get(r.cls) || new Set(); s.add(r.n); classes.set(r.cls, s); }
  if (r.status === 'open') { if (r.answer !== '-') bad.push(`${r.id}:open-with-answer`); continue; }
  if (!['closed', 'wontfix'].includes(r.status)) { bad.push(`${r.id}:status`); continue; }
  const key = `${r.n}#${r.k}`;
  if (nonOpen.has(key)) { bad.push(`${r.id}:contradictory-coverage-with-${nonOpen.get(key)}`); continue; }
  nonOpen.set(key, r.id);
  const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
  if (!m || nwords(m[3]) > 25) { bad.push(`${r.id}:answer-format`); continue; }
  const p = normalize(m[1]);
  if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p) || p.startsWith('..') || p.startsWith('/')) { bad.push(`${r.id}:answer-path-forbidden`); continue; }
  const txt = rd(p);
  if (txt == null) { bad.push(`${r.id}:answer-file-absent`); continue; }
  const AL = txt.split('\n'); const ln = Number(m[2]);
  if (ln < 1 || ln > AL.length) { bad.push(`${r.id}:answer-line-out-of-range`); continue; }
  if (!wb(m[3], AL[ln - 1])) { bad.push(`${r.id}:answer-quote-not-at-exact-line`); continue; }
}
for (const [n, sr] of spot) sr.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) bad.push(`unledgered:${n}#${i + 1}`); });
for (const [cls, s] of [...classes].sort()) process.stdout.write(`CLASS ${cls} rows=${rows.filter((r) => r.cls === cls).length} rounds=${[...s].sort((a, b) => a - b).join(',')}\n`);
process.stdout.write(`DRAFT rows=${rows.length} covered=${covered.size} classes=${classes.size} problems=${bad.length}${bad.length ? ` | ${bad.slice(0, 8).join(' | ')}` : ''}\n`);
process.stdout.write(`LEDGERC_${bad.length ? 'UNMET' : 'HELD'} problems=${bad.length}\n`);
process.exit(bad.length ? 1 : 0);
