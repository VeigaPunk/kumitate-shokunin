import { routedItems, norm } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = process.argv[2];
const quotesFor = (item) => {
  const n = norm(item);
  const chunks = n.split('|').map((c) => c.trim()).filter((c) => c.split(/\s+/).filter(Boolean).length >= 3);
  const best = chunks.sort((a, b) => b.length - a.length)[0] || n;
  return best.split(/\s+/).filter(Boolean).slice(0, 4).join(' ');
};
const HEAD = ['| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|'];
const rows = [];
const recurrent = new Set(['55#1', '58#1', '61#1', '64#1']);
for (let n = 55; n <= 65; n += 1) {
  const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
  const r = routedItems(readFileSync(p, 'utf8'));
  r.items.forEach((it, i) => {
    const key = `${n}#${i + 1}`;
    const cls = recurrent.has(key) ? 'real-recurrent' : `round-${n}-class`;
    rows.push(`| G${n}-${i + 1} | ${n} | ${i + 1} | "${quotesFor(it)}" | ${cls} | open | - |`);
  });
}
const ledger = ['# fixture ledger (K66ReviewToolV1)', '', '## Ledger', '', ...HEAD, ...rows, ''].join('\n');
writeFileSync(join(LANE, 'corpus', 'routed-ledger.md'), ledger);
console.log(`wrote ${rows.length} rows`);
if (process.argv[3] === 'dirty') {
  const cut = ledger.split('\n').filter((l) => !/\| G65-/.test(l)).join('\n');
  writeFileSync(join(LANE, 'corpus', 'routed-ledger.md'), cut);
  console.log('dirtied: dropped all G65-* rows');
}
