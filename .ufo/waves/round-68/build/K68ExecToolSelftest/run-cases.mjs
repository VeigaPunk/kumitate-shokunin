#!/usr/bin/env node
/**
 * run-cases.mjs — acceptance suite for the kumitate routed-ledger v2 gate
 * (contract `kumitate-routed-ledger-v2`; round 68 seat K68ExecToolSelftest).
 *
 *   node run-cases.mjs --tool scripts/routed-ledger.mjs [--only A|B|C|D|E|F|<ID>]
 *                      [--emit-json cases.json] [--scratch DIR] [--keep] [--list]
 *
 * Every case is self-contained: the runner writes the fixture bytes it names, runs the tool
 * under test with the exact argv it names, and compares (a) the process exit code, (b) the last
 * stdout line (the verdict) against a regex, (c) the presence of `FINDING <ID> …` and, where the
 * finding detail matters, (d) the finding line against a second regex.
 *
 * Fixture text is deterministic (fixed token block TK) so a case is reproducible byte for byte and
 * cases.json can carry the exact bytes it used. Nothing outside --scratch is written; --scratch
 * defaults to a fresh mkdtemp and is removed on exit unless --keep.
 *
 * The suite is the acceptance bar for the v2 draft: run it against `scripts/routed-ledger.mjs`
 * (v1 today) to see the red-before arms; run it against the v2 draft to see what still fails.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const TOOL = resolve(arg('--tool', 'scripts/routed-ledger.mjs'));
const ONLY = arg('--only', null);
const EMIT = arg('--emit-json', null);
const KEEP = argv.includes('--keep');
const LIST = argv.includes('--list');
const VERBOSE = argv.includes('--verbose');
const S = arg('--scratch', null) || mkdtempSync(join(tmpdir(), 'routed-acceptance.'));

// ---------------------------------------------------------------- fixture vocabulary
const TK = {
  d1: 'alpha bravo charlie delta echo foxtrot',
  nested: 'nestedgolf hotelindia juliett',
  d2: 'juliet kilo lima mike november oscar',
  d3: 'whiskey xray yankee zulu alphaone',
  prose: 'prosepapa quebec romeo sierra tango',
  d4: 'bravo2 charlie2 dup-trio echo2 shared-token',
  d5: 'foxtrot2 golf2 dup-trio echo2 shared-token',
  fence: 'fence-bravo codeline here',
  s102a: 'kilo2 lima2 mike2',
  s102b: 'november2 oscar2 papa2',
  amb: 'dup-trio echo2 shared-token',
  ansQ: 'alpha bravo charlie delta',
};

/**
 * Round 101 routed section. `fence` inserts a fenced code block carrying a column-0 bullet
 * between item 3 and item 4 — the shape that makes v1 count the fenced line as item 4.
 * PLAIN (fence=false) = 5 items; FENCE = 5 real items with a fenced line in the middle.
 */
const spot101 = (fence) => {
  const L = [
    '# Round 101 — spot-check (acceptance fixture)',
    '',
    '## 1. Verdicts',
    '',
    '- verdictbullet notrouted outside tokens',
    '',
    '## 5. Routed defects for round 102',
    '',
    '- **D1 — ' + TK.d1 + '.**',
    '  - ' + TK.nested,
    '1. **D2 — ' + TK.d2 + '.**',
    '',
    TK.prose,
    '',
    '| id | what |',
    '|---|---|',
    '| D3 | ' + TK.d3 + ' |',
    '',
  ];
  if (fence) L.push('```text', '- ' + TK.fence, '```', '');
  L.push('- **D4 — ' + TK.d4 + '.**', '- **D5 — ' + TK.d5 + '.**', '', '## 6. Non-author statement', '', '- not-routed india2', '');
  return L.join('\n');
};

const spot102 = (mut) => {
  const L = ['# Round 102 — spot-check (acceptance fixture)', ''];
  L.push(mut === 'no-section' ? '## Notes' : '## Routed items', '');
  L.push('- ' + TK.s102a, '- ' + TK.s102b, '');
  if (mut === 'second-section') L.push('## Routed items (amended)', '', '- **D3 — quebec3 romeo3 sierra3.**', '');
  L.push('## End', '');
  return L.join('\n');
};

// notes/a.md — line 3 carries TK.ansQ, word-boundary unique across lines 1..4
const ANSWERS = [
  '# answers (acceptance fixture)',
  'answerline bravo3 charlie3 delta3 echo3 foxtrot3 golf3 hotel3 india3',
  'answer ' + TK.ansQ + ' echo',
  'yankeeii zuluii alpha4 bravo4 charlie4 delta4 echo4 foxtrot4',
  '',
].join('\n');

const A1_ANSWER = '`notes/a.md:3` — "' + TK.ansQ + '"';

const baseRows = () => ([
  { id: 'A1', round: 101, item: 1, quote: 'bravo charlie delta echo', cls: 'reference-drift', status: 'closed', answer: A1_ANSWER },
  { id: 'A2', round: 101, item: 2, quote: 'juliet kilo lima mike', cls: 'section-drift', status: 'open', answer: '-' },
  { id: 'A3', round: 101, item: 3, quote: 'xray yankee zulu', cls: 'section-drift', status: 'open', answer: '-' },
  { id: 'A4', round: 101, item: 4, quote: 'bravo2 charlie2 dup-trio', cls: 'section-drift', status: 'open', answer: '-' },
  { id: 'A5', round: 101, item: 5, quote: 'foxtrot2 golf2 dup-trio', cls: 'section-drift', status: 'open', answer: '-' },
  { id: 'A6', round: 102, item: 1, quote: 'kilo2 lima2 mike2', cls: 'section-drift', status: 'open', answer: '-' },
  { id: 'A7', round: 102, item: 2, quote: 'november2 oscar2 papa2', cls: 'tally-drift', status: 'open', answer: '-' },
]);

const renderRow = (r) => '| ' + r.id + ' | ' + r.round + ' | ' + r.item + ' | "' + r.quote + '" | ' + r.cls + ' | ' + r.status + ' | ' + r.answer + ' |';
const LEDGER_HEAD = ['# ledger (acceptance fixture)', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|'];
const ledgerOf = (rows) => LEDGER_HEAD.concat(rows.map(renderRow)).concat(['']).join('\n');

/** rows/mut — the mutation table. Returns null when the case supplies its own ledger bytes. */
function rowsFor(mut) {
  const R = baseRows();
  const by = (id) => R.find((r) => r.id === id);
  switch (mut) {
    case 'drop': R.splice(5, 1); break;                                   // A6 gone -> UNLEDGERED 102#1
    case 'quote-swap': by('A2').quote = TK.s102a; break;                  // quote lives in round 102
    case 'quote-decoy': by('A4').quote = 'verdictbullet notrouted outside tokens'; break;
    case 'answer-wrong': by('A1').answer = '`notes/a.md:3` — "zulu9 yankee9 xray9 whisky9"'; break;
    case 'answer-ledger': by('A1').answer = '`corpus/routed-ledger.md:1` — "ledger acceptance fixture"'; break;
    case 'answer-eof': by('A1').answer = '`notes/a.md:40` — "' + TK.ansQ + '"'; break;
    case 'dup': R.push({ ...by('A7') }); break;
    case 'ordinal': R.push({ id: 'A9', round: 101, item: 6, quote: 'prosepapa quebec romeo', cls: 'section-drift', status: 'open', answer: '-' }); break;
    case 'nested-as-item': R.push({ id: 'A10', round: 101, item: 2, quote: TK.nested, cls: 'section-drift', status: 'open', answer: '-' }); break;
    case 'prose-as-item': R.push({ id: 'A11', round: 101, item: 2, quote: 'prosepapa quebec romeo', cls: 'section-drift', status: 'open', answer: '-' }); break;
    case 'long-quote': by('A2').quote = Array.from({ length: 26 }, (_, i) => 'lq' + (i + 1)).join(' '); break;
    case 'one-word-quote': by('A2').quote = 'juliet'; break;
    case 'ambiguous-quote': by('A4').quote = TK.amb; break;
    case 'shifted-answer': by('A1').answer = '`notes/a.md:4` — "' + TK.ansQ + '"'; break;
    case 'fence-item': R.push({ id: 'A12', round: 101, item: 4, quote: TK.fence, cls: 'section-drift', status: 'open', answer: '-' }); break;
    case 'contradictory': R.push({ id: 'A13', round: 101, item: 1, quote: 'charlie delta echo foxtrot', cls: 'tally-drift', status: 'wontfix', answer: '`notes/a.md:2` — "answerline bravo3 charlie3"' }); break;
    case 'no-section': R.splice(5, 2); break;                              // round-102 rows have no item
    case 'ledger-absent': return null;
    case 'bad-status': by('A2').status = 'done'; break;
    case 'open-answer': by('A2').answer = A1_ANSWER; break;
    case 'closed-dash': by('A1').answer = '-'; break;
    case 'six-cell': return 'redo';                                        // handled by caller (raw row)
    case 'bad-class': by('A2').cls = 'Section-Drift'; break;
    case 'long-answer-quote': by('A1').answer = '`notes/a.md:3` — "' + Array.from({ length: 26 }, (_, i) => 'aq' + (i + 1)).join(' ') + '"'; break;
    case 'round-text': by('A2').round = 'abc'; break;
    default: break;
  }
  return R;
}

const RAW_SIX_CELL = '| A20 | 101 | 1 | "bravo charlie delta" | section-drift | open |';
const RAW_ID_ROUND = '| R102-D1 | 101 | 1 | "bravo charlie delta echo" | reference-drift | open | - |';
const RAW_A_PREFIXED_OK = '| A21 | 101 | 1 | "delta echo foxtrot" | reference-drift | open | - |';

/** Full fixture byte map for a mutant. Keys are root-relative paths. */
function filesFor(mut, rowsMut) {
  const rm = rowsMut || mut;
  const FENCED = ['good', 'fence-item', 'fence-shift', 'no-section'];
  const f = {
    'corpus/lessons/round-101-verifier-spotcheck.md': spot101(FENCED.includes(mut)),
    'corpus/lessons/round-102-verifier-spotcheck.md': spot102(mut),
    'notes/a.md': ANSWERS,
  };
  if (rm === 'six-cell') {
    const R = baseRows();
    f['corpus/routed-ledger.md'] = ledgerOf(R) + RAW_SIX_CELL + '\n';
    return f;
  }
  if (rm === 'id-round-mismatch') {
    const R = baseRows();
    f['corpus/routed-ledger.md'] = ledgerOf(R) + RAW_ID_ROUND + '\n';
    return f;
  }
  if (rm === 'id-prefix-ok') {
    const R = baseRows();
    f['corpus/routed-ledger.md'] = ledgerOf(R) + RAW_A_PREFIXED_OK + '\n';
    return f;
  }
  if (rm === 'recurrent4' || rm === 'recurrent3') {
    const n = rm === 'recurrent4' ? 4 : 3;
    for (const r of [201, 202, 203, 204].slice(0, n)) {
      f['corpus/lessons/round-' + r + '-verifier-spotcheck.md'] = ['# Round ' + r + ' — spot-check (acceptance fixture)', '', '## Routed defects', '', '- **D1 — tok' + r + ' alpha' + r + ' bravo' + r + '.**', ''].join('\n');
    }
    f['corpus/routed-ledger.md'] = ledgerOf([201, 202, 203, 204].slice(0, n).map((r) => ({ id: 'R' + r + '-D1', round: r, item: 1, quote: 'tok' + r + ' alpha' + r + ' bravo' + r, cls: 'recurring-class', status: 'open', answer: '-' })));
    return f;
  }
  if (rm === 'round59') {
    // verbatim routed section of corpus/lessons/round-59-verifier-spotcheck.md:251-262 (prose, 0 items)
    f['corpus/lessons/round-59-verifier-spotcheck.md'] = [
      '# Round 59 — verifier spot-check (acceptance excerpt)',
      '',
      '## 8. Routed defects',
      '',
      '**No new lane-owned defect is routed.** R58-V1..V8 are repaired in lane bytes without rewriting the',
      'filed r58 report, the r58 lesson, the r58 spot-check or the r58 probes, and each repair reproduces',
      'above.',
      '',
      'Not lane-owned, status-neutral — orchestrator ordering defect: `inline.sh dispatch` was omitted',
      'before the L1 spawn for round 59, so `.ufo/watchdog.log` has no `launch kumitate round=59` line and',
      '`.ufo/prompts/kumitate-round-59.md` does not exist.',
      '',
    ].join('\n');
    delete f['corpus/lessons/round-101-verifier-spotcheck.md'];
    delete f['corpus/lessons/round-102-verifier-spotcheck.md'];
    delete f['notes/a.md'];
    f['corpus/routed-ledger.md'] = ledgerOf([]);
    return f;
  }
  if (rm === 'round66') {
    // verbatim routed section of corpus/lessons/round-66-verifier-spotcheck.md:69-74
    f['corpus/lessons/round-66-verifier-spotcheck.md'] = [
      '# Round 66 — verifier spot-check (acceptance excerpt)',
      '',
      '## Routed defects for round 67',
      '',
      '- **D1 (routed, lane-owned): settle the wave leftovers.** At closure the working tree carried uncommitted round-66 seat output because orchestrator-dispatched seats of w1 were still live (no `WAVE-DONE`, no `w1-results.json`). Round 67 must wait for or reconcile the 66-seat wave final results and commit-or-revert every leftover under its own LOG entry.',
      '- **D2 (receipt precision):** the report Before-to-after cites `held=3/6` "at cutoff tip `6c79d68`" but the only committed receipt names `rev=621212bac` (freeze). Byte re-derivation at the closure tip confirms UNMET regardless, but receipts must name the revision they measured.',
      '- **D3 (frontier duty unmet):** no sourced claim and no SOURCES advance landed (self-declared conformance defect in the report). C2 rows/entry must land in a later round or be re-declared under a fresh freeze.',
      '- **Note for the operator (not a defect, promotion-owned):** all four SHONEN boxes remain lane-asserted `[~]`; non-author `[x]` verification stays operator-owned at promotion time.',
      '',
    ].join('\n');
    delete f['corpus/lessons/round-101-verifier-spotcheck.md'];
    delete f['corpus/lessons/round-102-verifier-spotcheck.md'];
    delete f['notes/a.md'];
    f['corpus/routed-ledger.md'] = ledgerOf([]);
    return f;
  }
  if (rm === 'round55') {
    // verbatim routed section of corpus/lessons/round-55-verifier-spotcheck.md:112-120
    f['corpus/lessons/round-55-verifier-spotcheck.md'] = [
      '# Round 55 — verifier spot-check (acceptance excerpt)',
      '',
      '## 5. Routed defects (lane must fix next round)',
      '',
      '- **R55-V1:** report `Landed changes` omitted the two trailing bookkeeping',
      '  commits (`e7a07111`, `26c886d7`). Correction: next round report/LOG may',
      '  note them; no file repair possible (append-only).',
      '- **R55-V2:** `B=9→10` in report + `corpus/lessons/round-55.md` + `LOG.md` is',
      '  wrong; measured `B=9→11`. Append-only correction entries owed in',
      '  `LOG.md` and `corpus/lessons/round-56.md` naming this line.',
      '- Carried (not this round): R41-2 gate-pins ruling, R43-1/R43-5, A3e',
      '  captured-invocation, R53-2 seat-accounting convention.',
      '',
      '## 6. Adjudication',
      '',
      'Status `ok`.',
      '',
    ].join('\n');
    delete f['corpus/lessons/round-101-verifier-spotcheck.md'];
    delete f['corpus/lessons/round-102-verifier-spotcheck.md'];
    delete f['notes/a.md'];
    f['corpus/routed-ledger.md'] = ledgerOf([]);
    return f;
  }
  const R = rowsFor(rm);
  if (R !== null) f['corpus/routed-ledger.md'] = ledgerOf(R);
  return f;
}

// ---------------------------------------------------------------- case table
const BASE_ARGV = ['--root', '{root}', '--from', '101', '--to', '102'];
const FIND = (id, detail) => ({ exit: 1, finding: id, detail });
const CLEAN7 = '^ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0$';

// Fixture families: `plain` = fence-free routed section (5 + 2 items; isolates one defect per case);
// `good`/`fence-item`/`fence-shift`/`no-section` = the same section with a fenced column-0 bullet
// between item 3 and item 4 (v1's fence-blind count shape); `round59|round66|round55` = verbatim
// real-lane routed sections.
const CASES = [
  // ---- A: the 20 frozen L4 mutants (counter MUTANTS table parity)
  { id: 'A01', group: 'A', mut: 'good', name: 'L4 good: a correct ledger is CLEAN with fence-aware items=7',
    expect: { exit: 0, verdict: CLEAN7 },
    note: 'fenced shape: v1 counts the fenced bullet as round-101 item 4 -> items=8, UNLEDGERED round-101-item-4, exit 1.' },
  { id: 'A02', group: 'A', mut: 'plain', rows: 'drop', name: 'L4 drop: a dropped row is UNLEDGERED',
    expect: { ...FIND('UNLEDGERED', 'round-102-item-1$'), verdict: '^ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=7 rows=6 ' } },
  { id: 'A03', group: 'A', mut: 'plain', rows: 'quote-swap', name: 'L4 quote-swap: a quote from another item is QUOTE_ABSENT',
    expect: { ...FIND('QUOTE_ABSENT', 'A2@line\\d+:round-101-item-2$') } },
  { id: 'A04', group: 'A', mut: 'plain', rows: 'quote-decoy', name: 'L4 quote-decoy: a quote from outside the section is QUOTE_ABSENT',
    expect: { ...FIND('QUOTE_ABSENT', 'A4@line\\d+:round-101-item-4$') } },
  { id: 'A05', group: 'A', mut: 'plain', rows: 'answer-wrong', name: 'L4 answer-wrong: answer quote absent from the file',
    expect: { ...FIND('ANSWER_DEAD', 'A1@line\\d+:answer-quote-not-at') } },
  { id: 'A06', group: 'A', mut: 'plain', rows: 'answer-ledger', name: 'L4 answer-ledger: the ledger cannot answer itself',
    expect: { ...FIND('ANSWER_DEAD', 'answer-path-not-allowed') } },
  { id: 'A07', group: 'A', mut: 'plain', rows: 'answer-eof', name: 'L4 answer-eof: answer line past EOF',
    expect: { ...FIND('ANSWER_DEAD', 'answer-line-40-of-\\d+$') } },
  { id: 'A08', group: 'A', mut: 'plain', rows: 'dup', name: 'L4 dup: duplicate row id',
    expect: { ...FIND('ROW_DUPLICATE', 'A7@line\\d+$') } },
  { id: 'A09', group: 'A', mut: 'plain', rows: 'ordinal', name: 'L4 ordinal: item ordinal beyond the section',
    expect: { ...FIND('ITEM_ABSENT', 'round-101-item-6') } },
  { id: 'A10', group: 'A', mut: 'plain', rows: 'nested-as-item', name: 'L4 nested-as-item: a nested bullet is not an item',
    expect: { ...FIND('QUOTE_ABSENT', 'A10@line\\d+:round-101-item-2') } },
  { id: 'A11', group: 'A', mut: 'plain', rows: 'prose-as-item', name: 'L4 prose-as-item: prose is not an item',
    expect: { ...FIND('QUOTE_ABSENT', 'A11@line\\d+:round-101-item-2') } },
  { id: 'A12', group: 'A', mut: 'plain', rows: 'long-quote', name: 'L4 long-quote: 26-word quote is ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A2@line\\d+:quote-words=26') } },
  { id: 'A13', group: 'A', mut: 'plain', rows: 'one-word-quote', name: 'L4 one-word-quote: a 1-word quote is ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A2@line\\d+:quote-words=1') },
    note: 'v1 has no minimum: it binds "juliet" and reads CLEAN exit 0.' },
  { id: 'A14', group: 'A', mut: 'plain', rows: 'ambiguous-quote', name: 'L4 ambiguous-quote: a quote in two items is QUOTE_AMBIGUOUS',
    expect: { ...FIND('QUOTE_AMBIGUOUS', 'A4@line\\d+') },
    note: 'v1 binds the first occurrence and reads CLEAN exit 0.' },
  { id: 'A15', group: 'A', mut: 'plain', rows: 'shifted-answer', name: 'L4 shifted-answer: answer quote one line off is ANSWER_DEAD',
    expect: { ...FIND('ANSWER_DEAD', 'answer-quote-not-at[^ ]*:notes/a.md:4$') },
    note: 'v1 searches lines n-2..n+1, finds the quote on line 3 and reads CLEAN exit 0.' },
  { id: 'A16', group: 'A', mut: 'fence-item', name: 'L4 fence-item: a row quoting a fenced line is QUOTE_ABSENT',
    expect: { ...FIND('QUOTE_ABSENT', 'A12@line\\d+:round-101-item-4$') },
    note: 'v1 makes the fenced bullet item 4 and BINDS A12 (no finding for A12 at all).' },
  { id: 'A17', group: 'A', mut: 'second-section', name: 'L4 second-section: the amended section counts, items=8',
    expect: { ...FIND('UNLEDGERED', 'round-102-item-3$'), verdict: '^ROUTED_LEDGER: DRIFT spotchecks=2 sections=\\d+ items=8 ' },
    note: 'v1 stops at the first routed section: items=7, CLEAN exit 0.' },
  { id: 'A18', group: 'A', mut: 'contradictory', name: 'L4 contradictory: closed+wontfix on one item is ROW_CONTRADICTED',
    expect: { ...FIND('ROW_CONTRADICTED', 'A13@line\\d+') },
    note: 'v1 has no one-non-open-row-per-item rule and reads CLEAN exit 0.' },
  { id: 'A19', group: 'A', mut: 'no-section', name: 'L4 no-section: round 102 has no routed section',
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN spotchecks=2 sections=1 items=5 rows=5 open=4 closed=1 wontfix=0$' },
    note: 'fenced shape: v1 still counts the fenced line -> items=6, DRIFT exit 1.' },
  { id: 'A20', group: 'A', mut: 'plain', rows: 'ledger-absent', name: 'L4 ledger-absent: FAIL-CLOSED exit 2',
    expect: { exit: 2, verdict: '^ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md$' } },

  // ---- B: the six confirmed hardenings (red-before arms) + escape twins
  { id: 'B01', group: 'B', mut: 'git-dir', hardening: 'GIT_DIR-inherited selftest/repo escape', name: 'GIT_DIR exported must not redirect --rev',
    argv: ['--root', '{root}', '--rev', 'HEAD', '--from', '101', '--to', '102'],
    expect: { ...FIND('UNLEDGERED', 'round-102-item-1$'), verdict: '^ROUTED_LEDGER: DRIFT ' },
    note: 'fixture HEAD drops row A6 (DRIFT); worktree ledger is CLEAN; GIT_DIR names a foreign repo whose HEAD is CLEAN. v1 reads the foreign repo -> CLEAN exit 0.' },
  { id: 'B02', group: 'B', mut: 'git-dir', hardening: 'GIT_DIR-inherited selftest/repo escape', name: 'GIT_DIR exported: selftest still PASS with >=44 cases',
    argv: ['--selftest'], expect: { exit: 0, verdict: '^ROUTED_LEDGER_SELFTEST: PASS \\(\\d+/\\d+\\)$', selftestMin: 44 } },
  { id: 'B03', group: 'B', mut: 'answer-symlink', hardening: 'symlink/.. answer and ledger escapes', name: 'an answer symlink leaving --root is ANSWER_DEAD',
    expect: { ...FIND('ANSWER_DEAD', 'A1@line\\d+') },
    note: 'notes/out.md -> ../../outside/answer.md; v1 follows it and reads CLEAN exit 0.' },
  { id: 'B04', group: 'B', mut: 'ledger-dotdot', hardening: 'symlink/.. answer and ledger escapes', name: '--ledger ../outside-ledger.md must FAIL-CLOSED',
    argv: ['--root', '{root}', '--from', '101', '--to', '102', '--ledger', '../outside-ledger.md'],
    expect: { exit: 2, verdict: '^ROUTED_LEDGER: FAIL-CLOSED reason=ledger-' },
    note: 'v1 joins --ledger onto --root, reads outside the root and prints a CLEAN verdict, exit 0.' },
  { id: 'B05', group: 'B', mut: 'ledger-symlink', hardening: 'symlink/.. answer and ledger escapes', name: 'a symlinked ledger must FAIL-CLOSED',
    expect: { exit: 2, verdict: '^ROUTED_LEDGER: FAIL-CLOSED reason=' },
    note: 'corpus/routed-ledger.md -> ../../outside-ledger.md (valid CLEAN ledger); v1 follows it and reads CLEAN exit 0.' },
  { id: 'B06', group: 'B', mut: 'second-section', hardening: 'second routed section silently missed', name: 'second routed section: items=8 worth of coverage enforced',
    expect: { ...FIND('UNLEDGERED', 'round-102-item-3$'), verdict: '^ROUTED_LEDGER: DRIFT .* items=8 ' },
    note: 'hardening arm of A17: v1 items=7 CLEAN.' },
  { id: 'B07', group: 'B', mut: 'plain', rows: 'one-word-quote', hardening: 'one-word / ambiguous quote binding', name: 'a 1-word quote is ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'quote-words=1') } },
  { id: 'B08', group: 'B', mut: 'plain', rows: 'ambiguous-quote', hardening: 'one-word / ambiguous quote binding', name: 'a non-unique quote is QUOTE_AMBIGUOUS',
    expect: { ...FIND('QUOTE_AMBIGUOUS', 'A4@line\\d+') } },
  { id: 'B09', group: 'B', mut: 'plain', rows: 'shifted-answer', hardening: '+-2-line answer window', name: 'the answer quote must sit on the named line',
    expect: { ...FIND('ANSWER_DEAD', 'answer-quote-not-at[^ ]*:notes/a.md:4$') } },
  { id: 'B10', group: 'B', mut: 'fence-shift', hardening: 'fence-blind item count', name: 'a fenced bullet does not shift item ordinals',
    expect: { exit: 0, verdict: CLEAN7 },
    note: 'isolated arm: v2-correct ledger; v1 DRIFTs with UNLEDGERED round-101-item-4 (the fenced line it counted as an item).' },

  // ---- C: usage arms
  { id: 'C01', group: 'C', mut: 'plain', name: 'unknown argument -> USAGE 64',
    argv: ['--bogus'], expect: { exit: 64, verdict: '^ROUTED_LEDGER: USAGE unknown argument --bogus$' } },
  { id: 'C02', group: 'C', mut: 'plain', name: '--root without a value -> USAGE 64',
    argv: ['--root'], expect: { exit: 64, verdict: '^ROUTED_LEDGER: USAGE --root needs a value$' } },
  { id: 'C03', group: 'C', mut: 'plain', name: 'unparseable --from -> USAGE 64',
    argv: ['--root', '{root}', '--from', 'abc'], expect: { exit: 64, verdict: '^ROUTED_LEDGER: USAGE --from/--to must be integers$' } },
  { id: 'C04', group: 'C', mut: 'plain', name: 'unparseable --to -> USAGE 64',
    argv: ['--root', '{root}', '--to', '10x'], expect: { exit: 64, verdict: '^ROUTED_LEDGER: USAGE --from/--to must be integers$' } },
  { id: 'C05', group: 'C', mut: 'plain', name: 'absent --root -> FAIL-CLOSED 2',
    argv: ['--root', '{nx}'], expect: { exit: 2, verdict: '^ROUTED_LEDGER: FAIL-CLOSED reason=root-absent($|:.+$)' } },
  { id: 'C06', group: 'C', mut: 'plain', name: 'no spot-check in range -> FAIL-CLOSED 2',
    argv: ['--root', '{root}', '--from', '90', '--to', '95'],
    expect: { exit: 2, verdict: '^ROUTED_LEDGER: FAIL-CLOSED reason=no-spotchecks-in-range:90-95$' } },

  // ---- D: malformed rows
  { id: 'D01', group: 'D', mut: 'plain', rows: 'bad-status', name: 'bad status -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A2@line\\d+:status=done') } },
  { id: 'D02', group: 'D', mut: 'plain', rows: 'open-answer', name: 'open row carrying an answer -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A2@line\\d+:open-row-answer-not-dash') } },
  { id: 'D03', group: 'D', mut: 'plain', rows: 'closed-dash', name: 'closed row with a dash answer -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A1@line\\d+:answer-format') } },
  { id: 'D04', group: 'D', mut: 'six-cell', name: 'six-cell row -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'line\\d+:cells=6') } },
  { id: 'D05', group: 'D', mut: 'plain', rows: 'dup', name: 'duplicate id -> ROW_DUPLICATE',
    expect: { ...FIND('ROW_DUPLICATE', 'A7@line\\d+') } },
  { id: 'D06', group: 'D', mut: 'id-round-mismatch', name: 'id prefix R102- on a round-101 row -> ROW_MALFORMED id-round-mismatch',
    expect: { ...FIND('ROW_MALFORMED', 'R102-D1@line\\d+:id-round-mismatch') },
    note: 'v1 accepts the id, binds the quote to 101#1 and reads CLEAN exit 0.' },
  { id: 'D07', group: 'D', mut: 'plain', rows: 'long-quote', name: '26-word item quote -> ROW_MALFORMED quote-words=26',
    expect: { ...FIND('ROW_MALFORMED', 'quote-words=26') } },
  { id: 'D08', group: 'D', mut: 'plain', rows: 'bad-class', name: 'class token with capitals -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A2@line\\d+:class$') } },
  { id: 'D09', group: 'D', mut: 'plain', rows: 'long-answer-quote', name: '26-word answer quote -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A1@line\\d+:answer-quote-words') } },
  { id: 'D10', group: 'D', mut: 'plain', rows: 'round-text', name: 'non-numeric round cell -> ROW_MALFORMED',
    expect: { ...FIND('ROW_MALFORMED', 'A2@line\\d+:round-or-item') } },
  { id: 'D11', group: 'D', mut: 'id-prefix-ok', name: 'non-R-prefixed ids stay valid (the counter uses A1..A7)',
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=8 open=7 closed=1 wontfix=0$' },
    note: 'guards D06 against over-firing on ids that do not encode a round.' },

  // ---- E: class recurrence
  { id: 'E01', group: 'E', mut: 'plain', name: '--classes: one class spans both rounds',
    argv: BASE_ARGV.concat(['--classes']),
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN ', noLine: 'RECURRENT ' },
    lines: ['CLASS section-drift rows=5 rounds=101,102', 'CLASS reference-drift rows=1 rounds=101', 'CLASS tally-drift rows=1 rounds=102'] },
  { id: 'E02', group: 'E', mut: 'recurrent4', name: 'RECURRENT fires at 4 distinct rounds',
    argv: ['--root', '{root}', '--from', '201', '--to', '204', '--classes'],
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN spotchecks=4 sections=4 items=4 rows=4 ' },
    lines: ['RECURRENT recurring-class rounds=4'] },
  { id: 'E03', group: 'E', mut: 'recurrent3', name: 'three rounds stay below RECURRENT',
    argv: ['--root', '{root}', '--from', '201', '--to', '203', '--classes'],
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN spotchecks=3 sections=3 items=3 rows=3 ', noLine: 'RECURRENT ' },
    lines: ['CLASS recurring-class rows=3 rounds=201,202,203'] },
  { id: 'E04', group: 'E', mut: 'plain', name: '--classes off: no CLASS/RECURRENT lines',
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN ', noLine: 'CLASS ' } },

  // ---- F: real-lane routed sections (verbatim excerpts)
  { id: 'F01', group: 'F', mut: 'round59', name: 'round 59 prose section: found, zero items',
    argv: ['--root', '{root}', '--from', '59', '--to', '59'],
    expect: { exit: 0, verdict: '^ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=0 rows=0 open=0 closed=0 wontfix=0$' } },
  { id: 'F02', group: 'F', mut: 'round66', name: 'round 66 real routed section: four column-0 bullets',
    argv: ['--root', '{root}', '--from', '66', '--to', '66'],
    expect: { ...FIND('UNLEDGERED', 'round-66-item-1$'), verdict: '^ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=4 rows=0 ' },
    note: 'D1..D3 plus the operator Note bullet: an empty ledger must expose 4 unledgered items.' },
  { id: 'F03', group: 'F', mut: 'round55', name: 'round 55 real routed section: three items',
    argv: ['--root', '{root}', '--from', '55', '--to', '55'],
    expect: { ...FIND('UNLEDGERED', 'round-55-item-1$'), verdict: '^ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=3 rows=0 ' } },
];

// ---------------------------------------------------------------- materialisation
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', timeout: 60000, ...opts });
const g = (dir, ...a) => sh('git', ['-C', dir, ...a], { env: { PATH: process.env.PATH || '/usr/bin:/bin', HOME: process.env.HOME, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' } });

function initRepo(dir) {
  mkdirSync(dir, { recursive: true });
  if (g(dir, 'init', '-q').status !== 0) throw new Error('git init failed: ' + dir);
  const top = g(dir, 'rev-parse', '--show-toplevel').stdout.trim();
  if (resolve(top) !== resolve(dir)) throw new Error('fixture toplevel mismatch: ' + top);
}
function commitAll(dir, msg) {
  g(dir, 'add', '-A');
  const r = g(dir, '-c', 'user.name=acceptance', '-c', 'user.email=acceptance@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', msg);
  if (r.status !== 0) throw new Error('fixture commit failed: ' + (r.stderr || ''));
}
function writeFiles(root, files) {
  for (const [rel, body] of Object.entries(files)) {
    if (body && typeof body === 'object' && body.symlink) {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      symlinkSync(body.symlink, join(root, rel));
      continue;
    }
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
}

/** Build fixture tree + aux trees for one case; returns { root, env, layout }. */
function setup(c) {
  const fx = join(S, 'fx', c.id);
  rmSync(fx, { recursive: true, force: true });
  const root = join(fx, 'root');
  const mut = c.mut;
  let files;
  let env = {};
  let aux = [];

  if (mut === 'git-dir') {
    files = filesFor('plain', c.rows || c.mut);
    writeFiles(root, files);
    initRepo(root);
    const drift = ledgerOf(baseRows().filter((r) => r.id !== 'A6'));
    writeFileSync(join(root, 'corpus/routed-ledger.md'), drift);
    commitAll(root, 'fixture HEAD (drift)');
    writeFileSync(join(root, 'corpus/routed-ledger.md'), ledgerOf(baseRows())); // worktree CLEAN, uncommitted
    const decoy = join(fx, 'decoy');
    writeFiles(decoy, filesFor('plain', 'plain'));
    initRepo(decoy);
    commitAll(decoy, 'decoy (clean)');
    env.GIT_DIR = join(decoy, '.git');
    aux = ['fx/decoy (git repo, CLEAN HEAD)', 'fx/root (git repo, HEAD drift / worktree clean)'];
    cleanupDir(fx); // nothing
  } else if (mut === 'answer-symlink') {
    files = filesFor('plain', c.rows || c.mut);
    delete files['notes/a.md'];
    files['notes/out.md'] = { symlink: '../../outside/answer.md' };
    writeFiles(root, files);
    const out = join(fx, 'outside', 'answer.md');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, ANSWERS);
    // A1 must point at the symlinked path
    const R = baseRows().map((r) => (r.id === 'A1' ? { ...r, answer: '`notes/out.md:3` — "' + TK.ansQ + '"' } : r));
    writeFileSync(join(root, 'corpus/routed-ledger.md'), ledgerOf(R));
    aux = ['fx/outside/answer.md (outside --root, holds the quote)', 'root/notes/out.md -> ../../outside/answer.md'];
  } else if (mut === 'ledger-dotdot') {
    files = filesFor('plain', c.rows || c.mut);
    delete files['corpus/routed-ledger.md'];
    writeFiles(root, files);
    writeFileSync(join(fx, 'outside-ledger.md'), ledgerOf(baseRows()));
    aux = ['fx/outside-ledger.md (outside --root, valid CLEAN ledger)'];
  } else if (mut === 'ledger-symlink') {
    files = filesFor('plain', c.rows || c.mut);
    delete files['corpus/routed-ledger.md'];
    writeFiles(root, files);
    writeFileSync(join(fx, 'outside-ledger.md'), ledgerOf(baseRows()));
    symlinkSync('../../outside-ledger.md', join(root, 'corpus/routed-ledger.md'));
    aux = ['fx/outside-ledger.md (outside --root, valid CLEAN ledger)', 'root/corpus/routed-ledger.md -> ../outside-ledger.md'];
  } else {
    files = filesFor(c.mut, c.rows || c.mut);
    writeFiles(root, files);
  }

  const nx = join(fx, 'absent-root');
  return { root, nx, env, aux, files };
}
function cleanupDir() { /* reserved */ }

function layoutOf(files, extra) {
  return Object.keys(files).sort().concat(extra || []);
}

// ---------------------------------------------------------------- judging
function judge(c, r, ctx) {
  const e = c.expect;
  const out = r.stdout || '';
  const lines = out.split('\n').filter((l) => l.length);
  const verdict = lines.length ? lines[lines.length - 1] : '';
  const p = [];
  if (r.status !== e.exit) p.push('exit=' + r.status + ' want=' + e.exit);
  if (!new RegExp(e.verdict).test(verdict)) p.push('verdict=' + verdict);
  if (e.finding) {
    const fl = lines.find((l) => l.startsWith('FINDING ' + e.finding + ' '));
    if (!fl) p.push('no FINDING ' + e.finding + ' (got ' + lines.filter((l) => l.startsWith('FINDING ')).slice(0, 3).join(';') + ')');
    else if (e.detail && !new RegExp(e.detail).test(fl)) p.push('detail=' + fl);
  }
  if (e.noLine && lines.some((l) => l.startsWith(e.noLine))) p.push('unexpected ' + e.noLine);
  if (e.selftestMin) {
    const m = /^ROUTED_LEDGER_SELFTEST: PASS \((\d+)\/(\d+)\)$/.exec(verdict);
    if (!m) p.push('selftest not PASS: ' + verdict);
    else if (Number(m[1]) !== Number(m[2]) || Number(m[1]) < e.selftestMin) p.push('selftest cases=' + m[1] + '/' + m[2] + ' want>=' + e.selftestMin);
  }
  if (c.lines) for (const want of c.lines) if (!lines.includes(want)) p.push('missing line: ' + want);
  if (r.status === null && r.error) p.push('spawn error: ' + r.error.message);
  return p;
}

// ---------------------------------------------------------------- run
const selected = CASES.filter((c) => !ONLY || c.id.startsWith(ONLY) || c.group === ONLY);
if (LIST) {
  for (const c of CASES) process.stdout.write(c.id + '\t' + c.group + '\t' + c.name + '\n');
  process.exit(0);
}
if (!existsSync(TOOL)) {
  process.stdout.write('ROUTED_LEDGER_ACCEPTANCE: FAIL (0/0) tool-absent:' + TOOL + '\n');
  process.exit(2);
}

const emitCases = [];
const results = [];
let pass = 0;
for (const c of selected) {
  let ctx;
  try { ctx = setup(c); } catch (e) {
    process.stdout.write('CASE FAIL ' + c.id + ' ' + c.name + ' :: setup-' + e.message + '\n');
    results.push({ id: c.id, status: 'FAIL', why: 'setup-' + e.message });
    continue;
  }
  const argvTok = (c.argv || BASE_ARGV).map((t) => t.replace('{root}', ctx.root).replace('{nx}', ctx.nx));
  const env = { PATH: process.env.PATH || '/usr/bin:/bin', TMPDIR: S, LANG: process.env.LANG || 'C', HOME: process.env.HOME || '', ...ctx.env };
  const r = sh(process.execPath, [TOOL, ...argvTok], { env });
  const problems = judge(c, r, ctx);
  const verdict = (r.stdout || '').trim().split('\n').pop() || '';
  if (problems.length === 0) pass += 1;
  process.stdout.write('CASE ' + (problems.length ? 'FAIL' : 'ok  ') + ' ' + c.id + ' ' + c.name + '\n');
  if (problems.length) process.stdout.write('     :: ' + problems.join(' | ') + '\n');
  else if (VERBOSE) {
    for (const l of (r.stdout || '').split('\n').filter((x) => x.startsWith('FINDING ') || x.startsWith('ROUTED_LEDGER') || x.startsWith('CLASS ') || x.startsWith('RECURRENT '))) process.stdout.write('     >> ' + l + '\n');
  }
  results.push({ id: c.id, name: c.name, group: c.group, status: problems.length ? 'FAIL' : 'PASS', exit: r.status, verdict, problems });

  const files = Object.entries(ctx.files).map(([path, body]) => ({
    path,
    symlink: body && typeof body === 'object' && body.symlink ? body.symlink : undefined,
    sha256: typeof body === 'string' ? createHash('sha256').update(body).digest('hex') : undefined,
    bytes: typeof body === 'string' ? Buffer.byteLength(body) : undefined,
    content: typeof body === 'string' ? body : undefined,
  }));
  emitCases.push({
    id: c.id, group: c.group, name: c.name,
    hardening: c.hardening || null,
    mutant: c.mut,
    rows_mutation: c.rows || null,
    fixture: (c.mut === c.rows || !c.rows) ? c.mut : c.mut + ' + rows ' + c.rows,
    layout: layoutOf(ctx.files, ctx.aux),
    files,
    cmd: 'node <tool> ' + argvTok.map((t) => (t === ctx.root ? '{root}' : t === ctx.nx ? '{nonexistent-root}' : t)).join(' '),
    argv: argvTok.map((t) => (t === ctx.root ? '{root}' : t === ctx.nx ? '{nonexistent-root}' : t)),
    env: ctx.env,
    expect: c.expect,
    expectLines: c.lines || null,
    note: c.note || null,
  });
  if (!KEEP) rmSync(join(S, 'fx', c.id), { recursive: true, force: true });
}

const total = results.length;
const verdictLine = 'ROUTED_LEDGER_ACCEPTANCE: ' + (pass === total ? 'PASS' : 'FAIL') + ' (' + pass + '/' + total + ')';
process.stdout.write(verdictLine + '\n');

if (EMIT) {
  const doc = {
    suite: 'kumitate routed-ledger v2 acceptance',
    contract: 'kumitate-routed-ledger-v2',
    round: 68,
    seat: 'K68ExecToolSelftest',
    tool_under_test: TOOL,
    tool_sha256: createHash('sha256').update(readFileSync(TOOL)).digest('hex'),
    case_count: CASES.length,
    groups: {
      A: 'frozen L4 mutant parity (20)',
      B: 'confirmed hardenings, red-before arms (10)',
      C: 'usage arms (6)',
      D: 'malformed rows (11)',
      E: 'class recurrence (4)',
      F: 'real-lane routed sections (3)',
    },
    hardenings: [
      'GIT_DIR-inherited selftest/repo escape',
      'symlink/.. answer and ledger escapes',
      'second routed section silently missed',
      'one-word / ambiguous quote binding',
      '+-2-line answer window',
      'fence-blind item count',
    ],
    cases: emitCases,
    results: { tool: TOOL, pass, fail: total - pass, total, verdict: verdictLine, cases: results },
  };
  writeFileSync(resolve(EMIT), JSON.stringify(doc, null, 2) + '\n');
  process.stdout.write('WROTE ' + resolve(EMIT) + '\n');
}

if (!KEEP) rmSync(S, { recursive: true, force: true });
process.exit(pass === total ? 0 : 1);
