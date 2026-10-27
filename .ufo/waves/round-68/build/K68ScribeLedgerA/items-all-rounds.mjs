import { readFileSync } from 'node:fs';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const src = readFileSync(`${LANE}/.ufo/waves/round-68/probe/ledger68-probe.mjs`, 'utf8').split('\n');
const items67 = new Function(src.slice(132, 177).join('\n') + '\nreturn items67;')();
let items = 0, sections = 0;
for (let n = 55; n <= 66; n += 1) {
  const r = items67(readFileSync(`${LANE}/corpus/lessons/round-${n}-verifier-spotcheck.md`, 'utf8'));
  items += r.items.length; sections += r.sections.length;
  if (n <= 57) console.log(`r${n}: items=${r.items.length} sections=${r.sections.length}`);
}
console.log(`TOTAL rounds=55..66 sections=${sections} items=${items}`);
