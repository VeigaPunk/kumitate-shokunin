import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const SEED = process.argv[3] || 'k68execv2';
const CHILD_ENV = (T) => ({ PATH: process.env.PATH || '/usr/bin:/bin', TMPDIR: T, LANG: process.env.LANG || 'C' });
const T = join(process.env.K68_L4_TMP || tmpdir(), 'k68-l4');
rmSync(T, { recursive: true, force: true }); mkdirSync(T, { recursive: true });
let seedCtr = 0;
const rnd = () => { seedCtr += 1; return createHash('sha256').update(`${SEED}:${seedCtr}`).digest('hex'); };
const word = () => { const h = rnd(); return `w${h.slice(0, 6)}`; };
const phrase = (k) => Array.from({ length: k }, word).join(' ');
function buildFixture(dir, mut) {
  const lv = Number.parseInt(rnd().slice(0, 2), 16) % 2 === 0 ? '##' : '###';
  const shared = phrase(4); // ambiguous-quote pair shares this
  const items101 = [phrase(6), phrase(6), phrase(6)];
  const tableItem = phrase(5);
  const items102 = [phrase(6), phrase(6)];
  const decoy = phrase(6); const nested = phrase(5); const prose = phrase(7);
  const fenceLine = phrase(5);
  const d5 = phrase(5); // PATCH(r68): captured so A5 can quote D5's own words
  const s101 = [
    `# Round 101 — spot-check ${word()}`, '', `${lv} Verdicts`, '', `- ${decoy}`, '',
    `${lv} 5. Routed defects for the next round`, '',
    `- **D1 — ${items101[0]}.**`, `  - ${nested}`,
    `1. **D2 — ${items101[1]}.**`,
    '', prose, '',
    '| id | what |', '|---|---|', `| D3 | ${tableItem} |`,
    '', '```text', `- ${fenceLine}`, '```',
    '', `- **D4 — ${items101[2]} ${shared}.**`, '',
    `- **D5 — ${d5} ${shared}.**`, '',
    `${lv} Non-author statement`, '', `- ${phrase(4)}`,
  ];
  const s102base = [`# Round 102 — ${word()}`, '', `## Routed items`, '', `- ${items102[0]}`, `- ${items102[1]}`, '', '## End', ''];
  const s102 = mut === 'second-section'
    ? [`# Round 102 — ${word()}`, '', `## Routed items`, '', `- ${items102[0]}`, `- ${items102[1]}`, '', '## Routed items (amended)', '', `- **D3 — ${phrase(6)}.**`, '', '## End', '']
    : s102base;
  const ansLines = [`# answers ${word()}`, phrase(8), `answer ${items101[0].split(' ')[0]} ${phrase(5)}`, phrase(8)];
  const ansQuote = ansLines[2].split(' ').slice(1, 5).join(' ');
  const rows = [
    { id: 'A1', n: 101, k: 1, q: items101[0].split(' ').slice(1, 5).join(' '), status: 'closed', answer: `\`notes/a.md:3\` — "${ansQuote}"` },
    { id: 'A2', n: 101, k: 2, q: items101[1].split(' ').slice(0, 4).join(' '), status: 'open', answer: '-' },
    { id: 'A3', n: 101, k: 3, q: tableItem.split(' ').slice(1, 4).join(' '), status: 'open', answer: '-' },
    { id: 'A4', n: 101, k: 4, q: items101[2].split(' ').slice(2, 6).join(' '), status: 'open', answer: '-' },
    { id: 'A5', n: 101, k: 5, q: `${d5.split(' ').slice(3, 5).join(' ')} ${shared}`, status: 'open', answer: '-' }, // PATCH(r68): was items101[2] (D4's words)
    { id: 'A6', n: 102, k: 1, q: items102[0].split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' },
    { id: 'A7', n: 102, k: 2, q: items102[1].split(' ').slice(3, 6).join(' '), status: 'open', answer: '-' },
  ];
  let expectItems = 7;
  if (mut === 'drop') rows.splice(5, 1);
  if (mut === 'quote-swap') rows[1].q = items101[2].split(' ').slice(0, 4).join(' ');
  if (mut === 'quote-decoy') rows[3].q = decoy.split(' ').slice(0, 4).join(' ');
  if (mut === 'answer-wrong') rows[0].answer = `\`notes/a.md:3\` — "${phrase(4)}"`;
  if (mut === 'answer-ledger') rows[0].answer = '`corpus/routed-ledger.md:1` — "routed ledger"';
  if (mut === 'answer-eof') rows[0].answer = `\`notes/a.md:40\` — "${ansQuote}"`;
  if (mut === 'shifted-answer') rows[0].answer = `\`notes/a.md:4\` — "${ansQuote}"`;
  if (mut === 'dup') rows.push({ ...rows[6] });
  if (mut === 'ordinal') rows.push({ id: 'A9', n: 101, k: 6, q: prose.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'nested-as-item') rows.push({ id: 'A8', n: 101, k: 2, q: nested.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'prose-as-item') rows.push({ id: 'A10', n: 101, k: 2, q: prose.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'long-quote') rows[1].q = phrase(26);
  if (mut === 'one-word-quote') rows[1].q = items101[1].split(' ')[0];
  if (mut === 'ambiguous-quote') rows[1].q = shared;
  if (mut === 'fence-item') rows.push({ id: 'A11', n: 101, k: 5, q: fenceLine.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'contradictory') rows.push({ id: 'A12', n: 101, k: 1, q: items101[0].split(' ').slice(2, 6).join(' '), status: 'wontfix', answer: `\`notes/a.md:3\` — "${ansQuote}"` });
  if (mut === 'second-section') expectItems = 8;
  if (mut === 'no-section') { s102.splice(2, 1, '## Notes'); expectItems = 5; rows.splice(5, 2); }
  mkdirSync(join(dir, 'corpus', 'lessons'), { recursive: true });
  mkdirSync(join(dir, 'notes'), { recursive: true });
  writeFileSync(join(dir, 'corpus', 'lessons', 'round-101-verifier-spotcheck.md'), s101.join('\n'));
  writeFileSync(join(dir, 'corpus', 'lessons', 'round-102-verifier-spotcheck.md'), s102.join('\n'));
  writeFileSync(join(dir, 'notes', 'a.md'), ansLines.join('\n'));
  if (mut !== 'ledger-absent') {
    const table = rows.map((r) => `| ${r.id} | ${r.n} | ${r.k} | "${r.q}" | c-${r.n} | ${r.status} | ${r.answer} |`);
    writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...table, ''].join('\n'));
  }
  return expectItems;
}
const MUTANTS = [
  ['good', 0, null], ['drop', 1, 'UNLEDGERED'], ['quote-swap', 1, 'QUOTE_ABSENT'], ['quote-decoy', 1, 'QUOTE_ABSENT'],
  ['answer-wrong', 1, 'ANSWER_DEAD'], ['answer-ledger', 1, 'ANSWER_DEAD'], ['answer-eof', 1, 'ANSWER_DEAD'], ['dup', 1, 'ROW_DUPLICATE'],
  ['ordinal', 1, 'ITEM_ABSENT'], ['nested-as-item', 1, 'QUOTE_ABSENT'], ['prose-as-item', 1, 'QUOTE_ABSENT'], ['long-quote', 1, 'ROW_MALFORMED'],
  ['one-word-quote', 1, 'ROW_MALFORMED'], ['ambiguous-quote', 1, 'QUOTE_AMBIGUOUS'], ['shifted-answer', 1, 'ANSWER_DEAD'],
  ['fence-item', 1, 'QUOTE_ABSENT'], ['second-section', 1, 'UNLEDGERED'], ['contradictory', 1, 'ROW_CONTRADICTED'],
  ['no-section', 0, null], ['ledger-absent', 2, null],
];

const tool = process.argv[2];
let fails = 0;
for (const [mut, code, finding] of MUTANTS) {
  const d = join(T, `fx-${mut}`);
  const expectItems = buildFixture(d, mut);
  const r = spawnSync('node', [tool, '--root', d, '--from', '101', '--to', '102'], { encoding: 'utf8', timeout: 60000, env: CHILD_ENV(T) });
  const out = r.stdout || ''; const v = out.trim().split('\n').pop() || '';
  const got = out.split('\n').filter((l) => l.startsWith('FINDING ')).map((l) => l.split(/\s+/)[1]);
  let ok = r.status === code;
  if (ok && finding) ok = out.split('\n').some((l) => l.startsWith(`FINDING ${finding} `)) && v.startsWith('ROUTED_LEDGER: DRIFT ');
  if (ok && code === 0) ok = new RegExp(`^ROUTED_LEDGER: CLEAN spotchecks=2 sections=${mut === 'no-section' ? 1 : 2} items=${expectItems} `).test(v);
  if (ok && code === 2) ok = v.startsWith('ROUTED_LEDGER: FAIL-CLOSED ');
  if (!ok) fails += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} mut=${mut} want_exit=${code}${finding ? ' want=' + finding : ''} got_exit=${r.status} got=[${[...new Set(got)].join(',') || '-'}] items=${expectItems} :: ${v.slice(0, 150)}`);
  rmSync(d, { recursive: true, force: true });
}
console.log(`L4_MATRIX: ${MUTANTS.length - fails}/${MUTANTS.length} pass`);
rmSync(T, { recursive: true, force: true });
