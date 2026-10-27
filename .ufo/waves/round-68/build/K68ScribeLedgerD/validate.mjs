// Independent L3 replica for the K68ScribeLedgerD slice (rounds 64, 65).
// Items: verbatim items67() from .ufo/waves/round-68/probe/ledger68-probe.mjs.
// Also prints the tool's own routedItems() count for the same rounds.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const S = '/fast/scratch/hyaku/kumitate-r68/K68ScribeLedgerD';
const FROM = 64, TO = 65;

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
const spotPath = (n) => `corpus/lessons/round-${n}-verifier-spotcheck.md`;
const rd = (rel) => { try { return readFileSync(join(LANE, rel), 'utf8'); } catch { return null; } };
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

const spot = new Map();
for (let n = FROM; n <= TO; n += 1) spot.set(n, items67(rd(spotPath(n))));
console.log('items:', [...spot].map(([n, r]) => `r${n}=${r.items.length}`).join(' '));
const toolMod = await import(`${LANE}/scripts/routed-ledger.mjs`);
console.log('tool routedItems:', [...spot.keys()].map((n) => `r${n}=${toolMod.routedItems(rd(spotPath(n))).items.length}`).join(' '));

const rows = ledgerParse(readFileSync(join(S, 'build-rows.md'), 'utf8'));
console.log('rows parsed:', rows.length, rows.filter((r) => r.bad).length ? 'MALFORMED' : 'all 7-cell');
const bad = []; const classes = new Map(); const nonOpen = new Map(); const covered = new Set();
for (const r of rows) {
  if (r.bad) { bad.push(`malformed@${r.line}`); continue; }
  const it = (spot.get(r.n) || { items: [] }).items;
  if (!(r.k >= 1 && r.k <= it.length)) { bad.push(`${r.id}:item-absent`); continue; }
  const nq = nwords(r.quote);
  if (!r.quote || nq > 25 || nq < 3) { bad.push(`${r.id}:quote-words=${nq}`); continue; }
  if (!wb(r.quote, it[r.k - 1])) { bad.push(`${r.id}:quote-not-in-item`); continue; }
  const hits = it.filter((t) => wb(r.quote, t)).length;
  if (hits > 1) { bad.push(`${r.id}:quote-not-unique-in-section(${hits})`); continue; }
  const idm = /^R(\d+)-/.exec(r.id);
  if (idm && Number(idm[1]) !== r.n) { bad.push(`${r.id}:id-round-mismatch`); continue; }
  covered.add(`${r.n}#${r.k}`);
  if (/^[a-z][a-z0-9-]*$/.test(r.cls)) { const s = classes.get(r.cls) || new Set(); s.add(r.n); classes.set(r.cls, s); }
  else bad.push(`${r.id}:class`);
  if (r.status === 'open') { if (r.answer !== '-') bad.push(`${r.id}:open-with-answer`); continue; }
  if (!['closed', 'wontfix'].includes(r.status)) { bad.push(`${r.id}:status`); continue; }
  const key = `${r.n}#${r.k}`;
  if (nonOpen.has(key)) { bad.push(`${r.id}:contradictory-coverage-with-${nonOpen.get(key)}`); continue; }
  nonOpen.set(key, r.id);
  const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
  if (!m || nwords(m[3]) > 25) { bad.push(`${r.id}:answer-format`); continue; }
  const p = m[1];
  if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p) || p.startsWith('..') || p.startsWith('/')) { bad.push(`${r.id}:answer-path-forbidden:${p}`); continue; }
  const txt = rd(p);
  if (txt == null) { bad.push(`${r.id}:answer-file-absent:${p}`); continue; }
  const AL = txt.split('\n'); const ln = Number(m[2]);
  if (ln < 1 || ln > AL.length) { bad.push(`${r.id}:answer-line-out-of-range`); continue; }
  if (!wb(m[3], AL[ln - 1])) { bad.push(`${r.id}:answer-quote-not-at-exact-line:${p}:${ln}`); continue; }
  console.log(`ok ${r.id} ${r.status} ${p}:${ln}`);
}
for (const [n, r] of spot) r.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) bad.push(`unledgered:${n}#${i + 1}`); });
if (classes.size < 5) bad.push(`classes=${classes.size}<5`);
if (![...classes.values()].some((s) => s.size >= 4)) bad.push('no-class-spans-4-rounds');
for (const [c, s] of [...classes].sort()) console.log(`CLASS ${c} rounds=${[...s].join(',')}`);
console.log(bad.length ? `L3-REPLICA: FAIL ${bad.length} ${bad.join(',')}` : 'L3-REPLICA: CLEAN');

// tool run over a minimal scratch tree (v1 tool, worktree mode, --from 64 --to 65)
const V = join(S, 'v');
mkdirSync(join(V, 'corpus', 'lessons'), { recursive: true });
mkdirSync(join(V, '.ufo', 'waves', 'round-65', 'base'), { recursive: true });
mkdirSync(join(V, '.ufo', 'waves', 'round-66', 'w1'), { recursive: true });
const files = ['corpus/lessons/round-64-verifier-spotcheck.md', 'corpus/lessons/round-65-verifier-spotcheck.md', 'corpus/lessons/round-65.md', 'corpus/README.md',
  '.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt', '.ufo/waves/round-66/d1-gate-correction.md', '.ufo/waves/round-66/w1/K66ExecCiteCheckD5.md'];
for (const f of files) { mkdirSync(dirname(join(V, f)), { recursive: true }); cpSync(join(LANE, f), join(V, f)); }
writeFileSync(join(V, 'corpus', 'routed-ledger.md'), readFileSync(join(S, 'build-rows.md')));
const t = spawnSync(process.execPath, [`${LANE}/scripts/routed-ledger.mjs`, '--root', V, '--from', String(FROM), '--to', String(TO), '--classes'], { encoding: 'utf8', timeout: 120000 });
console.log('--- tool exit=' + t.status);
console.log(t.stdout.trim());
if (t.stderr.trim()) console.log('stderr: ' + t.stderr.trim());
