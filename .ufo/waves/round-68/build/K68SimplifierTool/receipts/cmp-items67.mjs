// Extract the frozen C1 counter's items67() verbatim (text slice) and compare its output with and
// without the fenced-body-carry arm, over the real twelve spot-checks and the L4 fixtures.
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const src = readFileSync(process.argv[2] || 'c1.mjs', 'utf8');
const a = src.indexOf('function items67(text) {');
const b = src.indexOf('const spotPath =');
if (a < 0 || b < 0) { console.error('slice markers not found'); process.exit(70); }
const body = src.slice(a, b);
const mk = (txt) => new Function(`${txt}\nreturn items67;`)();
const full = mk(body);
const arm = "        if (n.fence && !/^ {0,3}(```|~~~)/.test(n.l)) { body += `\\n${n.l}`; continue; }\n";
if (!body.includes(arm)) { console.error('fence arm not found verbatim'); process.exit(71); }
const noArm = mk(body.replace(arm, ''));

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const files = readdirSync(`${LANE}/corpus/lessons`).filter((f) => /^round-\d+-verifier-spotcheck\.md$/.test(f)).sort();
const dig = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 12);
let items = 0; let sections = 0; let diff = 0;
for (const f of files) {
  const t = readFileSync(`${LANE}/corpus/lessons/${f}`, 'utf8');
  const A = full(t); const B = noArm(t);
  items += A.items.length; sections += A.sections.length;
  if (dig(A) !== dig(B)) { diff += 1; console.log(`DIFF ${f}`); }
}
// an input that does distinguish the two: a fence inside an item body
const probe = '## Routed defects\n\n- D1 line\n```\n- fenced bullet\n```\n- D2\n';
const pA = full(probe); const pB = noArm(probe);
console.log(`real files=${files.length} items=${items} sections=${sections} diffs=${diff}`);
console.log(`probe(with fence in body): with-arm items=${pA.items.length} ${JSON.stringify(pA.items[0])}`);
console.log(`probe(with fence in body): no-arm   items=${pB.items.length} ${JSON.stringify(pB.items[0])}`);
