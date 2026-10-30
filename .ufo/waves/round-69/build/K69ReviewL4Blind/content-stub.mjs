// Adversarial fixture recognizer, NOT a routed-ledger implementation.
// Root is used solely to open fixed relative filenames; never inspected/hashed.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.argv[process.argv.indexOf('--root') + 1];
const ledger = join(root, 'corpus/routed-ledger.md');
if (!existsSync(ledger)) {
  console.log('ROUTED_LEDGER: FAIL-CLOSED reason=anything'); process.exit(2);
}
const l = readFileSync(ledger, 'utf8');
const s = readFileSync(join(root, 'corpus/lessons/round-101-verifier-spotcheck.md'), 'utf8');
const t = readFileSync(join(root, 'corpus/lessons/round-102-verifier-spotcheck.md'), 'utf8');
const a = readFileSync(join(root, 'notes/a.md'), 'utf8').split('\n');
const rows = l.split('\n').filter(x => /^\| A\d+ \|/.test(x));
const row = id => rows.find(x => x.startsWith(`| ${id} |`))?.split('|').map(x => x.trim());
const q = id => row(id)?.[4]?.replace(/^"|"$/g, '') || '';
const d = id => s.split('\n').find(x => x.includes(`**${id} —`)) || '';
const r1 = row('A1');
const answer = /`notes\/a.md:3` — "([^"]+)"/.exec(r1?.[7] || '');
const clean = (rows.length === 7 || (rows.length === 5 && t.includes('## Notes'))) &&
  !t.includes('(amended)') && q('A2').split(' ').length >= 3 &&
  d('D2').includes(q('A2')) && d('D4').includes(q('A4')) &&
  !!answer && a[2].includes(answer[1]);
if (clean) {
  const noSection = t.includes('## Notes');
  console.log(`ROUTED_LEDGER: CLEAN spotchecks=2 sections=${noSection ? 1 : 2} items=${noSection ? 5 : 7} rows=7 forged=yes`);
  process.exit(0);
}
// Exploit: the harness accepts any matching finding anywhere; extras are unchecked.
for (const id of ['UNLEDGERED', 'QUOTE_ABSENT', 'ANSWER_DEAD', 'ROW_DUPLICATE', 'ITEM_ABSENT', 'ROW_MALFORMED', 'QUOTE_AMBIGUOUS', 'ROW_CONTRADICTED']) console.log(`FINDING ${id} canned`);
console.log('ROUTED_LEDGER: DRIFT canned=yes');
process.exit(1);
