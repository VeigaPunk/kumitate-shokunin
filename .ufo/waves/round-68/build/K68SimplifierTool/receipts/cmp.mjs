import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { routedSections as A } from './v2draft.mjs';
import { routedSections as B } from './v2-mask.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const files = [];
for (const f of readdirSync(`${LANE}/corpus/lessons`)) if (/^round-\d+-verifier-spotcheck\.md$/.test(f)) files.push(`${LANE}/corpus/lessons/${f}`);
for (const f of readdirSync('fx-good/corpus/lessons')) files.push(`fx-good/corpus/lessons/${f}`);

const synthetic = {
  'fence inside an item body': '## Routed items\n\n- D1 line\n```\n- fenced bullet\n```\n- D2\n',
  'two sections, second shallower': '## Routed defects\n- a\n### sub\n- b\n## Routed items (amended)\n- c\n',
  'unbalanced fence at EOF': '## Routed items\n- a\n```\n- b\n',
  'table only': '## Routed defects\n| id | what |\n|---|---|\n| D1 | x |\n',
  'heading inside fence is not a section': '```\n## Routed defects\n- a\n```\n## Notes\n- b\n',
  'prose then list then prose': '## Routed items\n\n- a\n\nprose para\n\n- b\n',
  'tilde fence': '## Routed items\n~~~\n- x\n~~~\n- y\n',
};

const digest = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 12);
let diff = 0;
for (const f of files) {
  const t = readFileSync(f, 'utf8');
  const a = A(t); const b = B(t);
  const same = digest(a) === digest(b);
  if (!same) { diff += 1; console.log(`DIFF ${f}: A=${JSON.stringify(a).slice(0, 120)} B=${JSON.stringify(b).slice(0, 120)}`); }
  else console.log(`same ${f.split('/').slice(-2).join('/')} sections=${a.sections} items=${a.items.length}`);
}
for (const [name, t] of Object.entries(synthetic)) {
  const a = A(t); const b = B(t);
  const same = digest(a) === digest(b);
  if (!same) { diff += 1; console.log(`DIFF synthetic "${name}": A=${JSON.stringify(a)} B=${JSON.stringify(b)}`); }
  else console.log(`same synthetic "${name}" sections=${a.sections} items=${a.items.length}`);
}
console.log(`EQUIVALENCE ${diff === 0 ? 'PASS' : `FAIL diffs=${diff}`} inputs=${files.length + Object.keys(synthetic).length}`);
