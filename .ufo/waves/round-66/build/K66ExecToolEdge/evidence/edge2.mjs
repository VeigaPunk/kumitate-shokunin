#!/usr/bin/env node
/* Harness 2: --rev variants (tag / branch / HEAD~1), real-file mis-binding,
 * CRLF silent pass, symlink escapes, fenced code with a routed heading inside. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync, symlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TOOL = process.env.TOOL || '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx2';

const SPOT = [
  '# Round 7 — spot-check', '',
  '## 5. Routed defects for round 8', '',
  '- **D1 — the readme row is missing.** The map reads DRIFT at the next base.',
  '1. **D2 — tier counts are wrong** in the report.',
  '', '| id | what |', '|---|---|', '| D3 | the capability row is absent from the table |',
].join('\n');
const ANSWERS = ['# answers', '', 'round 9 fixed R7-D1: the readme row and its pin landed', 'x', 'R7-D2 wontfix: the counts were already corrected'].join('\n');
const ROWS = [
  '| R7-D1 | 7 | 1 | "the readme row is missing" | reference-drift | closed | `notes/answers.md:3` — "the readme row and its pin landed" |',
  '| R7-D2 | 7 | 2 | "tier counts are wrong" | tally-drift | wontfix | `notes/answers.md:5` — "the counts were already corrected" |',
  '| R7-D3 | 7 | 3 | "the capability row is absent" | registry-home | open | - |',
];
const ledgerOf = (rows) => ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n');

function build(dir, { spot = SPOT, rows = ROWS, eol = '\n' } = {}) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(dir, 'notes'), { recursive: true });
  const w = (p, s) => writeFileSync(join(dir, p), eol === '\n' ? s : s.replace(/\n/g, eol));
  w('corpus/lessons/round-7-verifier-spotcheck.md', spot);
  w('notes/answers.md', ANSWERS);
  if (rows) w('corpus/routed-ledger.md', ledgerOf(rows));
  return dir;
}
function run(dir, args = []) {
  const r = spawnSync('node', [TOOL, '--root', dir, '--from', '7', '--to', '7', ...args], { encoding: 'utf8' });
  const out = (r.stdout || '').trim().split('\n');
  return { code: r.status, verdict: out[out.length - 1] || '', findings: out.filter((l) => l.startsWith('FINDING ')), stderr: (r.stderr || '').trim() };
}
const res = [];
const say = (name, expect, observed) => res.push({ name, expect, observed });

/* ---------- P1: --rev with tag / branch / HEAD~1 ---------- */
{
  const D = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx2/repo';
  rmSync(D, { recursive: true, force: true });
  mkdirSync(D, { recursive: true });
  const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8' });
  build(D);
  if (g('init', '-q').status !== 0) throw new Error('git init failed');
  const top = g('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== D) throw new Error(`toplevel mismatch ${top}`);
  g('add', '-A');
  g('-c', 'user.name=harness', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture');
  g('tag', 'r7tag');
  g('branch', 'feature/ledger');
  // second commit so HEAD~1 exists and differs
  writeFileSync(join(D, 'notes', 'extra.md'), 'extra\n');
  g('add', '-A');
  g('-c', 'user.name=harness', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'second');
  for (const rev of ['r7tag', 'feature/ledger', 'HEAD~1', 'HEAD', 'HEAD^{commit}']) {
    const r = run(D, ['--rev', rev]);
    say(`P1 --rev ${rev}`, 'reads committed bytes: CLEAN exit 0, items=3, rows=3', `exit=${r.code} ${r.verdict}${r.stderr ? ` stderr=${r.stderr}` : ''}`);
  }
  // --rev pointing at a rev whose tree lacks the ledger
  const r2 = run(D, ['--rev', 'HEAD~1']);
  say('P1b --rev HEAD~1 (ledger absent in that tree)', 'FAIL-CLOSED exit 2 reason=ledger-absent', `exit=${r2.code} ${r2.verdict}`);
}

/* ---------- P2: CRLF spot-check + CRLF ledger, and CRLF with NO rows for the round ---------- */
{
  const d = build(join(ROOT, 'p2a'), { eol: '\r\n' });
  const r = run(d);
  say('P2a CRLF everywhere', 'same content as LF: CLEAN exit 0 items=3 rows=3', `exit=${r.code} ${r.verdict}`);
  // CRLF spot-check, ledger with rows only for round 7 (round 8 has a routed section too)
  const d2 = build(join(ROOT, 'p2b'), { eol: '\r\n' });
  writeFileSync(join(d2, 'corpus', 'routed-ledger.md'), ledgerOf(ROWS));
  const r2 = run(d2);
  say('P2b CRLF', 'CLEAN if the tool reads the section', `exit=${r2.code} ${r2.verdict}`);
}

/* ---------- P3: CRLF spot-check, ledger EMPTY -> silent pass over 3 real items ---------- */
{
  const d = build(join(ROOT, 'p3'), { eol: '\r\n', rows: [] });
  const r = run(d);
  say('P3 CRLF spot-check + empty ledger', 'the 3 routed items must be UNLEDGERED (exit 1); a CLEAN here means routed items escaped the gate silently',
    `exit=${r.code} ${r.verdict}`);
}

/* ---------- P4: real file round-37 (two routed headings) ---------- */
{
  const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
  const d = join(ROOT, 'p4');
  rmSync(d, { recursive: true, force: true });
  mkdirSync(join(d, 'corpus', 'lessons'), { recursive: true });
  writeFileSync(join(d, 'corpus', 'lessons', 'round-37-verifier-spotcheck.md'),
    spawnSync('cat', [join(LANE, 'corpus/lessons/round-37-verifier-spotcheck.md')], { encoding: 'utf8' }).stdout);
  writeFileSync(join(d, 'corpus', 'routed-ledger.md'), ledgerOf([]));
  const r = run(d, ['--from', '37', '--to', '37']);
  say('P4 real round-37 (first routed heading is "Round-36 routed defects D1–D8")',
    'the bound section must be round-37\'s OWN "## Routed defects (lane owes next round)" block, not the cross-reference to round 36',
    `exit=${r.code} ${r.verdict}`);
}

/* ---------- P5: fenced code block containing a "## Routed defects" heading ---------- */
{
  const spot = ['# Round 7', '', '```md', '## Routed defects (example in a doc fence)', '- example item in a fence', '```', '',
    '## 5. Routed defects for round 8', '', '- **D1 — the readme row is missing.**', '', '## End', ''].join('\n');
  const d = build(join(ROOT, 'p5'), { spot });
  const r = run(d);
  say('P5 fenced code contains a routed heading + "- " item', 'the live section (items=1) must be bound; the fence must not create items or steal the heading',
    `exit=${r.code} ${r.verdict}`);
}

/* ---------- P6: symlink escape to a file outside the lane ---------- */
{
  const d = build(join(ROOT, 'p6'), { rows: null });
  writeFileSync('/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/outside.md', 'the readme row and its pin landed\n');
  symlinkSync('/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/outside.md', join(d, 'notes', 'out.md'));
  const rows = [ROWS[0].replace('`notes/answers.md:3`', '`notes/out.md:1`'), ROWS[1], ROWS[2]];
  writeFileSync(join(d, 'corpus', 'routed-ledger.md'), ledgerOf(rows));
  const r = run(d);
  say('P6 answer path is a symlink to a file OUTSIDE the lane root', 'the answer must be a lane file; a symlink out of the tree must not be accepted as an answer location',
    `exit=${r.code} ${r.verdict}`);
}

/* ---------- P7: ledger quote cell with a curly-quote delimiter and item with straight quotes ---------- */
{
  const spot = SPOT.replace('the readme row is missing', '"the readme row is missing"');
  const rows = [ROWS[0].replace('"the readme row is missing"', '“the readme row is missing”'), ROWS[1], ROWS[2]];
  const d = build(join(ROOT, 'p7'), { spot, rows });
  const r = run(d);
  say('P7 item has straight quotes, ledger cell uses curly delimiters', 'the quote must be located in both directions', `exit=${r.code} ${r.verdict}`);
}

/* ---------- P8: ledger row whose answer cell holds a pipe-containing path/quote ---------- */
{
  const rows = [ROWS[0].replace('"the readme row and its pin landed"', '"the readme row and its pin landed | see notes"'), ROWS[1], ROWS[2]];
  const d = build(join(ROOT, 'p8'), { rows });
  const r = run(d);
  say('P8 answer quote contains a literal pipe', 'GFM: an unescaped pipe inside a cell is a cell separator, so this row is malformed — the tool must say so',
    `exit=${r.code} ${r.verdict}`);
}

/* ---------- P9: escaped pipe in the ITEM text, plain in the ledger quote ---------- */
{
  const spot = SPOT.replace('the readme row is missing', 'the readme row is missing | the map reads DRIFT');
  const d = build(join(ROOT, 'p9'), { spot });
  const r = run(d);
  say('P9 item text contains a pipe, ledger quote quotes across it', 'quote located', `exit=${r.code} ${r.verdict}`);
}

console.log(JSON.stringify(res, null, 1));
