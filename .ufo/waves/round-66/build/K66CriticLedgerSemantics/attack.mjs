// Attack driver for K66CriticLedgerSemantics — imports the lane tool's exported
// functions and probes the C1 data model. Read-only wrt the lane.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { routedItems, ledgerRows, evaluate } from '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/routed-ledger.mjs';

const T = mkdtempSync(join(tmpdir(), 'k66sem.'));
const W = join(T, 'x');
const spot = (n, body) => {
  mkdirSync(join(W, 'corpus', 'lessons'), { recursive: true });
  writeFileSync(join(W, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), body);
};
const ledger = (rows) => {
  mkdirSync(join(W, 'corpus'), { recursive: true });
  writeFileSync(join(W, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
};
const answers = (body) => { mkdirSync(join(W, 'notes'), { recursive: true }); writeFileSync(join(W, 'notes', 'a.md'), body); };
const reset = () => { rmSync(W, { recursive: true, force: true }); };
const show = (name, r) => {
  console.log(`=== ${name}`);
  console.log(`exit=${r.code}`);
  for (const l of r.lines) console.log(`  ${l}`);
};

// ---------- A1: second routed section silently ignored
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — alpha bravo charlie delta.**', '', '## Notes', '', '## Routed items (amended erratum)', '', '- **D2 — echo foxtrot golf hotel.**', ''].join('\n'));
ledger(['| R101-D1 | 101 | 1 | "alpha bravo charlie" | c-a | open | - |']);
answers('# a\nnothing\n');
show('A1 second routed section', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A2: mid-section insertion shifts ordinals (append-only assumption)
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — alpha bravo.**', '- **D1b — inserted juliett kilo.**', '- **D2 — charlie delta echo.**', ''].join('\n'));
ledger([
  '| R101-D1 | 101 | 1 | "alpha bravo" | c-a | open | - |',
  '| R101-D2 | 101 | 3 | "charlie delta echo" | c-b | open | - |',
]);
answers('# a\nnothing\n');
show('A2 mid-section insert (ledger bound pre-insert)', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A3: short quote binds across word boundary
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — the map drifted north today.**', ''].join('\n'));
ledger(['| R101-D1 | 101 | 1 | "map drift" | c-a | open | - |']);
answers('# a\nnothing\n');
show('A3a quote "map drift" vs item "map drifted"', evaluate({ root: W, from: 101, to: 101 }));
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — the map drifted north today.**', ''].join('\n'));
ledger(['| R101-D1 | 101 | 1 | "drift" | c-a | open | - |']);
show('A3b one-word quote "drift"', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A4: quote binds the wrong item (non-injective binding) — both items share the phrase
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — the readme row vanished and the map drifted.**', '- **D2 — the readme row vanished from the tally as well.**', ''].join('\n'));
ledger([
  '| R101-D1 | 101 | 1 | "the readme row vanished" | c-a | open | - |',
  '| R101-D2 | 101 | 2 | "the readme row vanished" | c-b | open | - |',
]);
answers('# a\nnothing\n');
show('A4 same quote binds both items', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A5: contradictory duplicate coverage of one item
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — alpha bravo charlie.**', ''].join('\n'));
ledger([
  '| R101-D1 | 101 | 1 | "alpha bravo charlie" | c-a | open | - |',
  '| R101-D1b | 101 | 1 | "alpha bravo charlie" | c-a | closed | `notes/a.md:2` — "fixed alpha bravo" |',
]);
answers('# a\nround 101 fixed alpha bravo and closed it\n');
show('A5 open+closed on same item, same class', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A6: located answer line that does not answer the item
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — the readme row is missing from the map.**', ''].join('\n'));
ledger(['| R101-D1 | 101 | 1 | "the readme row is missing" | c-a | closed | `notes/a.md:2` — "the readme row is missing" |']);
answers('# a\nthe readme row is missing from an old TODO laundry list\n');
show('A6 answer line quotes the item, not an answer', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A7: answer quote lands on adjacent line (+-2 window), target line unrelated
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — alpha bravo charlie.**', ''].join('\n'));
ledger(['| R101-D1 | 101 | 1 | "alpha bravo charlie" | c-a | closed | `notes/a.md:2` — "hotel india juliett" |']);
answers('# a\nunrelated line two\nhotel india juliett lives here on line three\nmore\n');
show('A7 quote on line 3, pointer says line 2', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A9: spot-check with no routed section passes CLEAN
reset();
spot(101, ['# R101', '', '## Notes', '', '- nothing routed here', ''].join('\n'));
ledger([]);
answers('# a\nx\n');
show('A9 no routed section at all', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A10: id/round divergence unenforced
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — alpha bravo charlie.**', ''].join('\n'));
ledger(['| R99-D1 | 101 | 1 | "alpha bravo charlie" | c-a | open | - |']);
show('A10 id says R99, round cell says 101', evaluate({ root: W, from: 101, to: 101 }));

// ---------- A11: norm asymmetry entity quote (tool locates, counter would not)
reset();
spot(101, ['# R101', '', '## Routed defects', '', '- **D1 — the A&amp;B pair is wrong.**', ''].join('\n'));
ledger(['| R101-D1 | 101 | 1 | "the A&B pair" | c-a | open | - |']);
answers('# a\nx\n');
show('A11 entity quote: tool norm unescapes &amp;, probe norm does not', evaluate({ root: W, from: 101, to: 101 }));

// ---------- B1: frozen L4 fixture shape — good answer line carries NO row id (from ledger66-probe.mjs buildFixture)
console.log('=== B1 frozen L4 good-fixture answer line (probe buildFixture):');
console.log('  ansLines[2] = `answer ${items101[0].split(" ")[0]} ${phrase(5)}` — contains no row id (A1)');

// ---------- B2: ledgerRows / counter schema pinning demonstration
console.log('=== B2 schema probes through tool ledgerRows:');
const eight = ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', '| R101-D1 | 101 | 1 | "alpha bravo" | c-a | open | - | carried:R99-D1 |', ''].join('\n');
console.log('  8-cell row (carried note in answer cell of open row) tool malformed:', JSON.stringify(ledgerRows(eight).malformed));
const carriedStatus = ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', '| R101-D1 | 101 | 1 | "alpha bravo" | c-a | carried | - |', ''].join('\n');
const cr = ledgerRows(carriedStatus);
console.log('  status=carried parses structurally (tool status check is in evaluate):', JSON.stringify(cr.rows[0] && cr.rows[0].status));
const dupItem = ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', '| R101-D1 | 101 | 1 | "alpha bravo" | c-a | open | - |', '| R101-D1b | 101 | 1 | "alpha bravo" | c-a | open | - |', ''].join('\n');
const dr = ledgerRows(dupItem);
console.log('  two rows same (round,item) parse fine:', dr.rows.length, 'rows — contradiction check only possible in evaluate');

rmSync(T, { recursive: true, force: true });
