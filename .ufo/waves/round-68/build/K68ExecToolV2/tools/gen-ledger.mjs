import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { routedSections, wb, norm } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs';
const root = process.argv[2];
const rows = [];
let bad = 0;
for (let n = 55; n <= 66; n += 1) {
  const p = join(root, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
  const { items } = routedSections(readFileSync(p, 'utf8'));
  items.forEach((it, i) => {
    const w = norm(it).split(' ').filter((x) => x.length >= 3);
    let q = null;
    for (let len = 4; len <= 8 && !q; len += 1) {
      for (let s = 0; s + len <= w.length; s += 1) {
        const cand = w.slice(s, s + len).join(' ');
        if (items.filter((t) => wb(cand, t)).length === 1 && wb(cand, it)) { q = cand; break; }
      }
    }
    if (!q) { bad += 1; rows.push(`| R${n}-D${i + 1} | ${n} | ${i + 1} | "UNLOCATABLE ITEM ${n}-${i + 1}" | c-${n % 7} | open | - |`); return; }
    rows.push(`| R${n}-D${i + 1} | ${n} | ${i + 1} | "${q}" | c-${n % 7} | open | - |`);
  });
}
writeFileSync(join(root, 'corpus', 'routed-ledger.md'), ['# routed ledger (SYNTHETIC: generated, do not commit)', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
console.error(`rows=${rows.length} unlocatable=${bad}`);
