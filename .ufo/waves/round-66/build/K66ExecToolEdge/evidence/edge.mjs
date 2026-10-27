#!/usr/bin/env node
/* Edge-input attack harness for kumitate-r66 C1 tool scripts/routed-ledger.mjs (v1).
 * Each case: build a fixture lane, run the tool CLI, record verdict + findings.
 * Expected behaviour is derived from the contract in the tool's own header.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

const TOOL = process.env.TOOL || '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx';

const SPOT = [
  '# Round 7 — spot-check', '',
  '## 4. Verdicts', '', '- not an item: verdict bullet', '',
  '## 5. Routed defects for round 8', '',
  '- **D1 — the readme row is missing.** The map reads DRIFT at the next base.',
  '  continuation names the pin too.',
  '  - nested bullet is part of D1',
  '1. **D2 — tier counts are wrong** in the report.',
  '', 'Prose paragraph after the list is not an item.', '',
  '| id | what |', '|---|---|', '| D3 | the capability row is absent from the table |',
  '', '## 6. Non-author statement', '', '- not routed either',
].join('\n');

const SPOT_NO_ROUTED = ['# Round 8', '', '## Notes', '', '- nothing routed here', ''].join('\n');

const ANSWERS = [
  '# answers', '',
  'round 9 fixed R7-D1: the readme row and its pin landed',
  'other',
  'R7-D2 wontfix: the counts were already corrected',
].join('\n');

const ROWS = [
  '| R7-D1 | 7 | 1 | "the readme row is missing" | reference-drift | closed | `notes/answers.md:3` — "the readme row and its pin landed" |',
  '| R7-D2 | 7 | 2 | "tier counts are wrong" | tally-drift | wontfix | `notes/answers.md:5` — "the counts were already corrected" |',
  '| R7-D3 | 7 | 3 | "the capability row is absent" | registry-home | open | - |',
];

const ledgerOf = (rows, extra = []) => [
  '# ledger', '', '## Ledger', '',
  '| id | round | item | quote | class | status | answer |',
  '|---|---|---|---|---|---|---|',
  ...rows, '', ...extra, '',
].join('\n');

function build(dir, { spot = SPOT, rows = ROWS, answers = ANSWERS, ledgerExtra = [], eol = '\n', answersText = null } = {}) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(dir, 'notes'), { recursive: true });
  const w = (p, s) => writeFileSync(join(dir, p), eol === '\n' ? s : s.replace(/\n/g, eol));
  w('corpus/lessons/round-7-verifier-spotcheck.md', spot);
  w('corpus/lessons/round-8-verifier-spotcheck.md', SPOT_NO_ROUTED);
  w('notes/answers.md', answersText === null ? answers : answersText);
  if (rows !== null) w('corpus/routed-ledger.md', ledgerOf(rows, ledgerExtra));
  return dir;
}

function run(dir, args = []) {
  const r = spawnSync('node', [TOOL, '--root', dir, '--from', '7', '--to', '8', ...args], { encoding: 'utf8' });
  const out = (r.stdout || '').trim().split('\n');
  return { code: r.status, verdict: out[out.length - 1] || '', findings: out.filter((l) => l.startsWith('FINDING ')), all: out };
}

const cases = [];
const add = (name, expect, fn) => cases.push({ name, expect, fn });

/* ---- E1 CRLF ---- */
add('E1 CRLF line endings (spot-check, ledger and answers all CRLF)',
  'CRLF is the same file content: routed section found, 3 items, CLEAN exit 0',
  () => {
    const d = build(join(ROOT, 'e1'), { eol: '\r\n' });
    return { d, expect: 'CLEAN exit 0, items=3, rows=3' };
  });

/* ---- E2 tabs as indentation ---- */
add('E2 tabs as indentation for nested bullets',
  'tab-indented nested bullets belong to the parent item; item count unchanged (3), CLEAN',
  () => {
    const spot = SPOT.replace('  continuation names the pin too.', '\tcontinuation names the pin too.')
      .replace('  - nested bullet is part of D1', '\t- nested bullet is part of D1');
    const d = build(join(ROOT, 'e2'), { spot });
    return { d, expect: 'CLEAN exit 0, items=3' };
  });

/* ---- E3 fenced code block with - lines inside the routed section ---- */
add('E3 fenced code block inside the routed section containing "- " lines',
  'code-fence content is code, not a routed item: items must stay 3 (fence lines are not items)',
  () => {
    const spot = SPOT.replace('| id | what |', ['```text', '- this is code, not an item', '- neither is this', '```', '', '| id | what |'].join('\n'));
    const d = build(join(ROOT, 'e3'), { spot });
    return { d, expect: 'CLEAN exit 0, items=3 (NOT 5)' };
  });

/* ---- E4 HTML comment ---- */
add('E4a HTML comment holding a "- " line inside the routed section',
  'comment content is not an item: items stay 3',
  () => {
    const spot = SPOT.replace('| id | what |', ['<!--', '- commented out, not an item', '-->', '', '| id | what |'].join('\n'));
    const d = build(join(ROOT, 'e4a'), { spot });
    return { d, expect: 'CLEAN exit 0, items=3 (NOT 4)' };
  });
add('E4b HTML comment holding an earlier "## Routed defects" heading',
  'the live routed section (the last/real one) must be bound; the comment must not steal it',
  () => {
    const spot = ['<!--', '## Routed defects (retracted, do not use)', '', '- old item from a retracted section', '-->', '', ...SPOT.split('\n')].join('\n');
    const d = build(join(ROOT, 'e4b'), { spot });
    return { d, expect: 'items=3 bound to the live section; a retracted section must not be bound' };
  });

/* ---- E5 ATX headings with trailing #s ---- */
add('E5 ATX headings with trailing #s',
  '"## Routed defects ##" is the routed heading; "## Next ##" ends it: items=3',
  () => {
    const spot = SPOT.replace('## 5. Routed defects for round 8', '## 5. Routed defects for round 8 ##')
      .replace('## 6. Non-author statement', '## 6. Non-author statement ##');
    const d = build(join(ROOT, 'e5'), { spot });
    return { d, expect: 'CLEAN exit 0, items=3' };
  });

/* ---- E6 setext headings ---- */
add('E6 setext heading ("Routed defects" over "-----")',
  'per the declared rule only ATX #..###### count, so the section is NOT found: items=0 and the '
  + 'rounds-8 file contributes a section; verdict must not claim CLEAN over 3 phantom items',
  () => {
    const spot = SPOT.replace('## 5. Routed defects for round 8', '5. Routed defects for round 8\n----------------------');
    const d = build(join(ROOT, 'e6'), { spot });
    return { d, expect: 'routed section not found (items=0) — and then the ledger rows for round 7 must be ITEM_ABSENT, not silently OK' };
  });

/* ---- E7 duplicate routed heading ---- */
add('E7 "## Routed defects" appears twice',
  'the FIRST matching heading wins per the declared rule; the second block is outside the section',
  () => {
    const spot = ['# Round 7', '', '## Routed defects', '', '- first block item', '', '## Other', '', '- not an item', '',
      '## Routed defects', '', '- second block item', '', '## End', '', '- not an item'].join('\n');
    const rows = ['| R7-A | 7 | 1 | "first block item" | reference-drift | open | - |'];
    const d = build(join(ROOT, 'e7'), { spot, rows });
    return { d, expect: 'items=1 (first heading wins) and the second block is NOT bound — but the tool must not silently drop it' };
  });

/* ---- E8 escaped pipes in the ledger table ---- */
add('E8 ledger table row with an escaped pipe (GFM \\|) inside a quote cell',
  'GFM: "\\|" is a literal pipe inside the cell, so the row still has 7 cells and the quote is located',
  () => {
    const rows = [
      '| R7-D1 | 7 | 1 | "the readme row is missing \\| the map reads DRIFT" | reference-drift | closed | `notes/answers.md:3` — "the readme row and its pin landed" |',
      ROWS[1], ROWS[2],
    ];
    const d = build(join(ROOT, 'e8'), { rows });
    return { d, expect: 'row parses as 7 cells, quote located, CLEAN exit 0' };
  });

/* ---- E9 trailing space / missing trailing pipe ---- */
add('E9a ledger row with a trailing space after the last pipe',
  'a trailing space is whitespace: the row still has 7 cells and parses',
  () => {
    const rows = [ROWS[0] + '  ', ROWS[1], ROWS[2]];
    const d = build(join(ROOT, 'e9a'), { rows });
    return { d, expect: 'CLEAN exit 0, rows=3' };
  });
add('E9b ledger row with the trailing pipe missing',
  'a missing closing pipe still yields 7 cells and parses',
  () => {
    const rows = [ROWS[0].replace(/\|\s*$/, ''), ROWS[1], ROWS[2]];
    const d = build(join(ROOT, 'e9b'), { rows });
    return { d, expect: 'CLEAN exit 0, rows=3' };
  });
add('E9c ledger row with a trailing space inside the last cell',
  'the answer cell keeps its content: parses',
  () => {
    const rows = [ROWS[0].replace('| `notes/answers.md:3`', '| `notes/answers.md:3` '), ROWS[1], ROWS[2]];
    const d = build(join(ROOT, 'e9c'), { rows });
    return { d, expect: 'CLEAN exit 0, rows=3' };
  });

/* ---- E10 unicode quotes and NBSP ---- */
add('E10a ledger quote delimited by curly quotes (“ ”)',
  'the quote cell is delimited by a pair of quotes; curly quotes are markup and normalise to "', 
  () => {
    const rows = [ROWS[0].replace('"the readme row is missing"', '“the readme row is missing”'), ROWS[1], ROWS[2]];
    const d = build(join(ROOT, 'e10a'), { rows });
    return { d, expect: 'the quote is located in the item; CLEAN exit 0' };
  });
add('E10b item text carries curly quotes, ledger quote is plain',
  'normalisation maps curly to straight on both sides, so the quote is located',
  () => {
    const spot = SPOT.replace('the readme row is missing', '“the readme row is missing”');
    const d = build(join(ROOT, 'e10b'), { spot });
    return { d, expect: 'CLEAN exit 0, items=3' };
  });
add('E10c item text carries a literal NBSP, ledger quote uses a plain space',
  'NBSP is whitespace: the quote is located after normalisation',
  () => {
    const spot = SPOT.replace('the readme row is missing', 'the\u00a0readme row is missing');
    const d = build(join(ROOT, 'e10c'), { spot });
    return { d, expect: 'CLEAN exit 0, items=3' };
  });
add('E10d ledger quote contains the HTML entity &nbsp; where the item has a real space',
  'the entity decodes to a space on both sides: quote located',
  () => {
    const rows = [ROWS[0].replace('"the readme row is missing"', '"the&nbsp;readme row is missing"'), ROWS[1], ROWS[2]];
    const d = build(join(ROOT, 'e10d'), { rows });
    return { d, expect: 'CLEAN exit 0, rows=3' };
  });

/* ---- E11 answer path ./ prefix and symlinks ---- */
add('E11a answer path written with a "./" prefix',
  'the path resolves to the same lane file: answer located, CLEAN',
  () => {
    const rows = [ROWS[0].replace('`notes/answers.md:3`', '`./notes/answers.md:3`'), ROWS[1], ROWS[2]];
    const d = build(join(ROOT, 'e11a'), { rows });
    return { d, expect: 'CLEAN exit 0, rows=3' };
  });
add('E11b answer path is a symlink that points at the ledger itself',
  'the answer must not resolve to the ledger (that is the "answer pointing into the ledger itself" case): ANSWER_DEAD',
  () => {
    const d = build(join(ROOT, 'e11b'), { rows: null });
    mkdirSync(join(d, 'corpus'), { recursive: true });
    writeFileSync(join(d, 'corpus', 'routed-ledger.md'), ledgerOf(ROWS));
    symlinkSync('../corpus/routed-ledger.md', join(d, 'notes', 'link.md'));
    const rows = [ROWS[0].replace('`notes/answers.md:3`', '`notes/link.md:7`').replace('"the readme row and its pin landed"', '"the readme row is missing"'), ROWS[1], ROWS[2]];
    writeFileSync(join(d, 'corpus', 'routed-ledger.md'), ledgerOf(rows));
    return { d, expect: 'ANSWER_DEAD (answer resolves into the ledger)' };
  });
add('E11c answer path is a symlink that points at a spot-check',
  'the answer must not resolve to a spot-check: ANSWER_DEAD',
  () => {
    const d = build(join(ROOT, 'e11c'), { rows: null });
    symlinkSync('../corpus/lessons/round-7-verifier-spotcheck.md', join(d, 'notes', 'link.md'));
    const rows = [ROWS[0].replace('`notes/answers.md:3`', '`notes/link.md:7`').replace('"the readme row and its pin landed"', '"the readme row is missing"'), ROWS[1], ROWS[2]];
    writeFileSync(join(d, 'corpus', 'routed-ledger.md'), ledgerOf(rows));
    return { d, expect: 'ANSWER_DEAD (answer resolves into a spot-check)' };
  });

/* ---- E13 second "## Ledger" in the ledger file ---- */
add('E13 ledger file contains a second "## Ledger" section',
  'the ledger has exactly one table; a second Ledger section must be reported, not silently ignored',
  () => {
    const d = build(join(ROOT, 'e13'), { ledgerExtra: ['## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', '| R7-X | 7 | 3 | "the capability row is absent" | registry-home | open | - |'] });
    return { d, expect: 'either the duplicate section is reported, or its rows are merged — never silently dropped' };
  });

rmSync(ROOT, { recursive: true, force: true });
const out = [];
for (const c of cases) {
  const { d, expect } = c.fn();
  const r = run(d);
  out.push({ name: c.name, expect, code: r.code, verdict: r.verdict, findings: r.findings });
}
console.log(JSON.stringify(out, null, 1));
