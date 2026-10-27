// Replicates the frozen ledger68-probe.mjs L3 arms over rows.md (items67 + ledgerParse + wb lifted verbatim).
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const SRC = `${LANE}/.ufo/waves/round-68/probe/ledger68-probe.mjs`;
const src = readFileSync(SRC, 'utf8').split('\n');
const itemsSrc = src.slice(132, 177).join('\n');
const lpSrc = src.slice(178, 192).join('\n');
if (!itemsSrc.startsWith('function items67') || !lpSrc.trim().startsWith('const ledgerParse')) {
  console.error('SLICE DRIFT', itemsSrc.slice(0, 40), '|', lpSrc.slice(0, 40)); process.exit(3);
}
const { items67, ledgerParse } = new Function(itemsSrc + '\n' + lpSrc + '\nreturn { items67, ledgerParse };')();

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
const rd = (rel) => { const p = resolve(LANE, rel); if (!p.startsWith(LANE + '/') || !existsSync(p) || !statSync(p).isFile()) return null; return readFileSync(p, 'utf8'); };

const spot = new Map();
for (const n of [55, 56, 57]) spot.set(n, items67(rd(`corpus/lessons/round-${n}-verifier-spotcheck.md`)));
const rows = ledgerParse(readFileSync(`${LANE}/.ufo/waves/round-68/build/K68ScribeLedgerA/rows.md`, 'utf8'));
if (rows.length !== 11) { console.log(`ROWS: FAIL count=${rows.length} (expected 11)`); process.exit(4); }

let fail = 0; const classes = new Map(); const covered = new Set();
for (const r of rows) {
  const bad = [];
  if (r.bad) { console.log(`${r.id || 'bad'}@${r.line}: MALFORMED`); fail += 1; continue; }
  const secR = spot.get(r.n); const it = secR ? secR.items : null;
  if (!it || !(r.k >= 1 && r.k <= it.length)) bad.push('item-absent');
  const nq = nwords(r.quote);
  if (!r.quote || nq > 25 || nq < 3) bad.push(`quote-words=${nq}`);
  if (it && it[r.k - 1] !== undefined && !wb(r.quote, it[r.k - 1])) bad.push('quote-not-word-boundary-in-item');
  const hits = it ? it.filter((t) => wb(r.quote, t)).length : -1;
  if (hits !== 1) bad.push(`quote-hits=${hits}`);
  const idm = /^R(\d+)-/.exec(r.id);
  if (!idm || Number(idm[1]) !== r.n) bad.push('id-round-mismatch');
  if (!/^[a-z][a-z0-9-]*$/.test(r.cls)) bad.push('class-grammar');
  const s = classes.get(r.cls) || new Set(); s.add(r.n); classes.set(r.cls, s);
  if (r.status === 'open') { if (r.answer !== '-') bad.push('open-with-answer'); }
  else if (!['closed', 'wontfix'].includes(r.status)) bad.push(`status=${r.status}`);
  else {
    const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
    if (!m || nwords(m[3]) > 25) bad.push('answer-format');
    else {
      const p = m[1];
      if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p) || p.startsWith('..') || p.startsWith('/')) bad.push('answer-path-forbidden');
      else {
        const txt = rd(p);
        if (txt == null) bad.push('answer-file-absent');
        else {
          const AL = txt.split('\n'); const ln = Number(m[2]);
          if (ln < 1 || ln > AL.length) bad.push('answer-line-out-of-range');
          else if (!wb(m[3], AL[ln - 1])) bad.push('answer-quote-not-at-exact-line');
          else console.log(`  answer-ok ${r.id} ${p}:${ln} :: ${AL[ln - 1].trim().slice(0, 150)}`);
        }
      }
    }
  }
  covered.add(`${r.n}#${r.k}`);
  if (bad.length) { fail += 1; console.log(`${r.id} FAIL ${bad.join(',')}`); }
  else console.log(`${r.id} PASS n=${r.n} k=${r.k} status=${r.status} class=${r.cls} qwords=${nq}`);
}
for (const [n, sr] of spot) sr.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) { fail += 1; console.log(`unledgered:${n}#${i + 1}`); } });
console.log(`classes=${classes.size} spans=${[...classes].map(([c, s]) => `${c}:${s.size}`).join(' ')}`);
const span4 = [...classes.values()].some((s) => s.size >= 4);
const okRows = fail === 0 && classes.size >= 5;
// A 3-round slice (55..57) can span at most 3 rounds: the L3 >=4-round arm is unreachable here by construction.
console.log(`ROWS_${okRows ? 'CLEAN' : 'DIRTY'} rows=${rows.length} fail=${fail} classes=${classes.size} span4=${span4} (span4 unreachable in a 3-round slice)`);
process.exit(okRows ? 0 : 1);
