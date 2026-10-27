import { routedItems, ledgerRows, evaluate } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const T = mkdtempSync(join(tmpdir(), 'rv.'));
const out = [];
const log = (s) => out.push(String(s));
const HEAD = ['| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|'];
const led = (rows) => ['# L', '', '## Ledger', '', ...HEAD, ...rows].join('\n');

// T1 GFM table without trailing pipe on rows/separator, inside routed section
log('T1 no-trailing-pipe table items: ' + JSON.stringify(routedItems([
  '## Routed defects', '',
  '| id | what |', '|---|---', '| D1 | the row is missing from the map |',
].join('\n'), ).items, null, 0));

// T2 ledger separator/header without trailing pipe
const lr2 = ledgerRows(['# L', '', '## Ledger', '',
  '| id | round | item | quote | class | status | answer |',
  '|---|---|---|---|---|---|---',
  '| R7-D1 | 7 | 1 | "the row is missing" | drift | open | - |',
].join('\n'));
log('T2 ledger no-trailing-pipe: rows=' + JSON.stringify(lr2.rows.map(r => r.id)) + ' malformed=' + JSON.stringify(lr2.malformed));

// T3 row with id literally "id" (valid per grammar) silently skipped?
const lr3 = ledgerRows(['# L', '', '## Ledger', '', ...HEAD,
  '| id | 7 | 1 | "the row is missing" | drift | open | - |',
].join('\n'));
log('T3 id="id": rows=' + JSON.stringify(lr3.rows.map(r => r.id)) + ' malformed=' + JSON.stringify(lr3.malformed));

// T4 heading text inside a fence starts the section
log('T4 fence heading starts section: ' + JSON.stringify(routedItems([
  '```',
  '## Routed defects (quoted output)',
  '- phantom fenced bullet',
  '```',
  '- real item one',
].join('\n'))));

// T5 fenced bullet inside routed section counted as item?
log('T5 fence bullet: ' + JSON.stringify(routedItems([
  '## Routed defects', '', '- real item', '', '```', '- fenced bullet is not a real item', '```',
].join('\n')).items));

// T6 answer quote window: accepted at +1/+2, rejected at +3
const mkLed = (line, quote) => led([
  `| R7-D1 | 7 | 1 | "target-line" | drift | closed | \`notes/answers.md:${line}\` — "${quote}" |`,
]);
const mkTree = (ledgerText, ansText) => {
  const D = join(T, 'x' + Math.random().toString(36).slice(2));
  mkdirSync(join(D, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(D, 'notes'), { recursive: true });
  writeFileSync(join(D, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'), '## Routed defects\n\n- **D1 — target-line item.**\n');
  writeFileSync(join(D, 'notes', 'answers.md'), ansText);
  writeFileSync(join(D, 'corpus', 'routed-ledger.md'), ledgerText);
  return D;
};
const runV = (D, extra = {}) => { const r = evaluate({ root: D, from: 7, ...extra }); return `${r.code}|${r.lines.filter((l) => l.startsWith('FINDING')).join(';') || r.lines[r.lines.length - 1]}`; };
const ans6 = ['# a', 'l2', 'l3 target-line', 'l4', 'l5', 'l6'].join('\n');
log('T6a answer-line 3 quote at +1 (l4): ' + runV(mkTree(mkLed(3, 'l4'), ans6)));
log('T6b answer-line 3 quote at +2 (l5): ' + runV(mkTree(mkLed(3, 'l5'), ans6)));
log('T6c answer-line 3 quote at +3 (l6): ' + runV(mkTree(mkLed(3, 'l6'), ans6)));

// T7 RECURRENT counts a round with no spot-check file
const D7 = mkTree(led([
  '| X90 | 90 | 1 | "q" | ghost-class | open | - |',
  '| X91 | 91 | 1 | "q" | ghost-class | open | - |',
  '| X92 | 92 | 1 | "q" | ghost-class | open | - |',
  '| X93 | 93 | 1 | "q" | ghost-class | open | - |',
]), ans6);
for (const n of [90, 91, 92]) writeFileSync(join(D7, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), '## Routed defects\n\n- **D1 — q item.**\n');
const r7 = evaluate({ root: D7, from: 90, classes: true });
log('T7 RECURRENT ghost round: ' + r7.lines.join(' ; '));

// T8 absolute --ledger: answer pointing into the ledger escapes
const D8 = join(T, 'xabs');
mkdirSync(join(D8, 'corpus', 'lessons'), { recursive: true });
writeFileSync(join(D8, 'corpus', 'lessons', 'round-7-verifier-spotcheck.md'), '## Routed defects\n\n- **D1 — the readme row is missing.**\n');
const selfLed = led(['| R7-D1 | 7 | 1 | "the readme row is missing" | drift | closed | `corpus/routed-ledger.md:7` — "the readme row is missing" |']);
writeFileSync(join(D8, 'corpus', 'routed-ledger.md'), selfLed);
log('T8a default ledger self-answer: ' + runV(D8));
log('T8b abs --ledger self-answer: ' + runV(D8, { ledger: join(D8, 'corpus', 'routed-ledger.md') }));

// T9 GFM-escaped pipe inside a quote cell
const lr9 = ledgerRows(['# L', '', '## Ledger', '', ...HEAD,
  '| R7-D1 | 7 | 1 | "a \\| b" | drift | open | - |',
].join('\n'));
log('T9 escaped pipe: rows=' + JSON.stringify(lr9.rows) + ' malformed=' + JSON.stringify(lr9.malformed));

// T11 second routed heading ignored
log('T11 two routed headings: ' + JSON.stringify(routedItems(['## Routed defects', '', '- item A', '', '## Routed defects', '', '- item B'].join('\n')).items));

// T12 `#` shell comment inside a fence ends the section
log('T12 # in fence: ' + JSON.stringify(routedItems(['## Routed defects', '', '```bash', '# comment line inside fence', '```', '- after fence'].join('\n'))));

// T13 lazy continuation prose joins the item (no blank line)
log('T13 lazy prose: ' + JSON.stringify(routedItems(['## Routed defects', '', '- item', 'prose right after'].join('\n')).items));

// T14 markers * + 1)
log('T14 markers: ' + JSON.stringify(routedItems(['## Routed defects', '', '* star item', '+ plus item', '1) paren item'].join('\n')).items));

rmSync(T, { recursive: true, force: true });
process.stdout.write(out.join('\n') + '\n');
