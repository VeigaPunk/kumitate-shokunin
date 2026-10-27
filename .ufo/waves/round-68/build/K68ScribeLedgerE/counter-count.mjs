import { items67 } from './items67.mjs';
import { readFileSync } from 'node:fs';
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
let tot = 0, sec = 0;
for (let n = 55; n <= 66; n += 1) {
  const r = items67(readFileSync(`${lane}/corpus/lessons/round-${n}-verifier-spotcheck.md`, 'utf8'));
  tot += r.items.length; sec += r.sections.length;
  console.log(`round=${n} items=${r.items.length} sections=${r.sections.length}`);
}
console.log(`counter-own items=${tot} sections=${sec}`);
