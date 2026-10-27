import { norm, nwords, wb } from './prims.mjs';
import { readFileSync } from 'node:fs';
const fx = process.argv[2] || '.';
const spot = readFileSync(`${fx}/corpus/lessons/round-66-verifier-spotcheck.md`, 'utf8');
// items: the four bullets of "## Routed defects for round 67" (lines 71-74), parsed as the round text
const lines = spot.split('\n');
const items = [70, 71, 72, 73].map((i) => lines[i]);
const led = readFileSync(`${fx}/corpus/routed-ledger.md`, 'utf8').split('\n');
const rows = led.filter((l) => l.startsWith('| R66-')).map((l) => {
  const c = l.trim().slice(1, -1).split('|').map((x) => x.trim());
  return { id: c[0], n: +c[1], k: +c[2], quote: c[3].replace(/^"(.*)"$/, '$1'), cls: c[4], status: c[5], answer: c[6] };
});
const bad = []; const answered = new Set(); const classes = new Map();
for (const r of rows) {
  const it = items[r.k - 1];
  const nq = nwords(r.quote);
  if (!r.quote || nq > 25 || nq < 3) bad.push(`${r.id}:quote-words=${nq}`);
  else if (!wb(r.quote, it)) bad.push(`${r.id}:quote-not-word-boundary-in-item`);
  const hits = items.filter((t) => wb(r.quote, t)).length;
  if (hits > 1) bad.push(`${r.id}:quote-not-unique(hits=${hits})`);
  const idm = /^R(\d+)-/.exec(r.id);
  if (idm && +idm[1] !== r.n) bad.push(`${r.id}:id-round-mismatch`);
  classes.set(r.cls, (classes.get(r.cls) || new Set()).add(r.n));
  if (r.status === 'open') { if (r.answer !== '-') bad.push(`${r.id}:open-with-answer`); else console.log(`open-ok ${r.id} quote-words=${nq}`); continue; }
  const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
  if (!m || nwords(m[3]) > 25) { bad.push(`${r.id}:answer-format`); continue; }
  const p = m[1];
  if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p)) { bad.push(`${r.id}:answer-path-forbidden`); continue; }
  let txt; try { txt = readFileSync(`${fx}/${p}`, 'utf8'); } catch { bad.push(`${r.id}:answer-file-absent`); continue; }
  const AL = txt.split('\n'); const ln = +m[2];
  if (ln < 1 || ln > AL.length) { bad.push(`${r.id}:answer-line-out-of-range`); continue; }
  if (!wb(m[3], AL[ln - 1])) { bad.push(`${r.id}:answer-quote-not-at-exact-line`); continue; }
  if (r.n === 66) answered.add(r.k);
  console.log(`exact-line-ok ${r.id} ${p}:${ln} answer-words=${nwords(m[3])}`);
}
for (let k = 1; k <= 4; k += 1) if (!answered.has(k) && k <= 3) bad.push(`r66-item-${k}-not-answered-this-round`);
console.log(`classes=${classes.size} ${[...classes.keys()].join(',')}`);
console.log(bad.length ? `BAD ${bad.join(' ; ')}` : 'ALL L3 ROW CONDITIONS PASS');
