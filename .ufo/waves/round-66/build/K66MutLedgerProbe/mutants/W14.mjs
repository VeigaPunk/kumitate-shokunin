#!/usr/bin/env node
/**
 * ledger66-probe.mjs — frozen counter for kumitate round 66 claim C1 (rule L66 v1).
 *
 *   node .ufo/waves/round-66/probe/ledger66-probe.mjs <lane-dir> <rev> [--tool <path-in-archive>] [--seed <hex>]
 *
 * Predicate LEDGER66_HELD (checks L1..L6), measured over `git archive <rev>` (never the worktree):
 *   L1 the archive's `scripts/routed-ledger.mjs --selftest` prints `ROUTED_LEDGER_SELFTEST: PASS (n/n)`, n >= 30, exit 0.
 *   L2 the archive's tool run on the lane at <rev> (`--root <lane> --rev <rev> --from 55 --to 65 --classes`) exits 0 with
 *      `ROUTED_LEDGER: CLEAN spotchecks=11`, `items=` equal to THIS counter's own item count over the eleven
 *      spot-checks, and rows >= items.
 *   L3 this counter's own re-verification of `corpus/routed-ledger.md` at <rev> (independent of the tool): every item of
 *      rounds 55..65 has a row whose quote (<= 25 words) is located in that item; every closed/wontfix row's answer quote is
 *      located at its `path:line` (+-2 lines) in a file that is neither the ledger nor a spot-check; every one of the
 *      round-65 items has a closed or wontfix row whose answer quote is NOT found in that file at the round base (answered
 *      this round); >= 5 distinct classes; >= 1 class spans >= 4 distinct spot-check rounds.
 *   L4 held-out fixtures generated NOW with random tokens (seeded by --seed or crypto): the archive's tool, run on each
 *      fixture with --root, returns the expected exit code and finding id / item count for all 14 mutants.
 *   L5 the counter can fail: an always-CLEAN stub and an always-DRIFT stub, run through the same L4 harness, both miss it;
 *      L5 counts only when the real tool passes L4 (never vacuous).
 *   L6 registry home in the same revision: SKILL.md carries a table row naming `routed-ledger.mjs`; corpus/QUALITY.md
 *      names `routed-ledger`; SCORECARD.md `## Capabilities` holds a table row whose first cell names `routed-ledger`.
 * Verdict: LEDGER66_HELD held=6/6 checks=6 rev=<full> rule=L66 (exit 0) | LEDGER66_UNMET held=k/6 … | MISS reasons (exit 1);
 * exit 2 when the revision cannot be read or archived.
 * Scratch: honours TMPDIR; everything is removed before exit.
 */
import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, normalize } from 'node:path';

const RULE = 'L66';
const BASE = '8d557f85312de4fcc82e09ff735d21436bc3746d'; // round-66 base: lane tip when the round started
const FROM = 55; const TO = 65; const N_CHECKS = 6;
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--tool', '--seed'].includes(argv[i - 1])));
if (pos.length < 2) { process.stderr.write('usage: ledger66-probe.mjs <lane-dir> <rev> [--tool path] [--seed hex]\n'); process.exit(64); }
const lane = resolve(pos[0]);
const rev = pos[1];
const TOOL_REL = opt('--tool', 'scripts/routed-ledger.mjs');
const SEED = opt('--seed', randomBytes(8).toString('hex'));

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) { process.stdout.write(`LEDGER66_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${rev} rule=${RULE} | rev-unreadable\n`); process.exit(2); }
const full = rv.stdout.trim();
const T = mkdtempSync(join(tmpdir(), 'ledger66.'));
const A = join(T, 'archive'); mkdirSync(A);
const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x -C "${A}"`], { encoding: 'utf8' });
if (ar.status !== 0) { process.stdout.write(`LEDGER66_UNMET held=0/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} | archive-failed\n`); rmSync(T, { recursive: true, force: true }); process.exit(2); }
const rd = (rel) => { try { return readFileSync(join(A, rel), 'utf8'); } catch { return null; } };
const atBase = (rel) => { const r = spawnSync('git', ['-C', lane, 'show', `${BASE}:${rel}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }); return r.status === 0 ? r.stdout : null; };
const TOOL = join(A, TOOL_REL);

const norm = (s) => String(s)
  .replace(/<[^>]+>/g, ' ')
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const results = {}; const miss = [];
const check = (id, ok, why) => { results[id] = !!ok; if (!ok) miss.push(`${id} MISS ${why}`); };

// ---- independent routed-section parser (written apart from the tool; same declared rule)
function items66(text) {
  const lines = String(text).split('\n');
  let h = -1; let lvl = 0;
  for (let i = 0; i < lines.length && h < 0; i += 1) {
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) { h = i; lvl = m[1].length; }
  }
  if (h < 0) return null;
  const sec = [];
  for (let i = h + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= Math.min(lvl, 6)) break;
    sec.push(lines[i]);
  }
  const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
  const out = [];
  for (let i = 0; i < sec.length; i += 1) {
    const l = sec[i];
    const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
    const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1]));
    if (row) { out.push(l); continue; }
    if (!list) continue;
    let body = l;
    for (let j = i + 1; j < sec.length; j += 1) {
      const n = sec[j];
      if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n) || (n.startsWith('|') && !isSep(n))) break;
      if (/^\S/.test(n) && sec[j - 1].trim() === '') break;
      body += `\n${n}`;
    }
    out.push(body);
  }
  return out;
}
const spotPath = (n) => `corpus/lessons/round-${n}-verifier-spotcheck.md`;
const ledgerParse = (text) => {
  const L = String(text || '').split('\n');
  const at = L.findIndex((l) => /^##\s+Ledger\s*$/.test(l));
  const rows = [];
  if (at < 0) return rows;
  for (let i = at + 1; i < L.length; i += 1) {
    if (/^##?\s/.test(L[i])) break;
    if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i])) continue;
    const c = L[i].trim().slice(1, -1).split('|').map((x) => x.trim());
    if (c[0] === 'id' || c.length !== 7) { if (c[0] !== 'id') rows.push({ bad: true, line: i + 1 }); continue; }
    rows.push({ id: c[0], n: Number(c[1]), k: Number(c[2]), quote: c[3].replace(/^"(.*)"$/, '$1'), cls: c[4], status: c[5], answer: c[6], line: i + 1 });
  }
  return rows;
};

// ---- L1
if (!existsSync(TOOL)) check('L1', false, 'tool-absent');
else {
  const r = spawnSync('node', [TOOL, '--selftest'], { encoding: 'utf8', timeout: 300000, env: { ...process.env, TMPDIR: T } });
  const m = /^ROUTED_LEDGER_SELFTEST: PASS \((\d+)\/(\d+)\)$/m.exec(r.stdout || '');
  check('L1', r.status === 0 && m && m[1] === m[2] && Number(m[1]) >= 30, `exit=${r.status} line=${m ? m[0] : 'none'}`);
}

// ---- own item count (used by L2 and L3)
const spot = new Map(); let ownItems = 0; let spotsFound = 0;
for (let n = FROM; n <= TO; n += 1) {
  const t = rd(spotPath(n));
  if (t == null) continue;
  spotsFound += 1;
  const it = items66(t) || [];
  spot.set(n, it); ownItems += it.length;
}

// ---- L2
if (!existsSync(TOOL)) check('L2', false, 'tool-absent');
else {
  const r = spawnSync('node', [TOOL, '--root', lane, '--rev', full, '--from', String(FROM), '--to', String(TO), '--classes'], { encoding: 'utf8', timeout: 300000, env: { ...process.env, TMPDIR: T } });
  const v = ((r.stdout || '').trim().split('\n').pop()) || '';
  const m = /^ROUTED_LEDGER: CLEAN spotchecks=(\d+) sections=(\d+) items=(\d+) rows=(\d+) /.exec(v);
  check('L2', r.status === 0 && m && Number(m[1]) === 11 && spotsFound === 11 && Number(m[3]) === ownItems && Number(m[4]) >= ownItems,
    `exit=${r.status} verdict=${v.slice(0, 160)} own-items=${ownItems} own-spotchecks=${spotsFound}`);
}

// ---- L3
{
  const bad = [];
  const rows = ledgerParse(rd('corpus/routed-ledger.md'));
  if (!rows.length) bad.push('ledger-empty-or-absent');
  const covered = new Set(); const classes = new Map(); const answeredNow = new Set();
  for (const r of rows) {
    if (r.bad) { bad.push(`malformed@${r.line}`); continue; }
    const it = spot.get(r.n);
    if (!it || !(r.k >= 1 && r.k <= it.length)) { bad.push(`${r.id}:item-absent`); continue; }
    if (!r.quote || nwords(r.quote) > 25 || !norm(it[r.k - 1]).includes(norm(r.quote))) { bad.push(`${r.id}:quote-not-in-item`); continue; }
    covered.add(`${r.n}#${r.k}`);
    if (/^[a-z][a-z0-9-]*$/.test(r.cls)) { const s = classes.get(r.cls) || new Set(); s.add(r.n); classes.set(r.cls, s); }
    if (r.status === 'open') { if (r.answer !== '-') bad.push(`${r.id}:open-with-answer`); continue; }
    if (!['closed', 'wontfix'].includes(r.status)) { bad.push(`${r.id}:status`); continue; }
    const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(r.answer);
    if (!m || nwords(m[3]) > 25) { bad.push(`${r.id}:answer-format`); continue; }
    const p = normalize(m[1]);
    if (p === 'corpus/routed-ledger.md' || /^corpus\/lessons\/round-\d+-verifier-spotcheck\.md$/.test(p) || p.startsWith('..') || p.startsWith('/')) { bad.push(`${r.id}:answer-path-forbidden`); continue; }
    const txt = rd(p);
    if (txt == null) { bad.push(`${r.id}:answer-file-absent`); continue; }
    const AL = txt.split('\n'); const ln = Number(m[2]);
    if (ln < 1 || ln > AL.length) { bad.push(`${r.id}:answer-line-out-of-range`); continue; }
    const win = norm(AL.slice(Math.max(0, ln - 3), Math.min(AL.length, ln + 2)).join(' '));
    if (!win.includes(norm(m[3]))) { bad.push(`${r.id}:answer-quote-not-at-line`); continue; }
    const before = atBase(p);
    if (r.n === TO && (before == null || !norm(before).includes(norm(m[3])))) answeredNow.add(r.k);
  }
  for (const [n, it] of spot) it.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) bad.push(`unledgered:${n}#${i + 1}`); });
  const r65 = spot.get(TO) || [];
  if (!r65.length) bad.push('round-65-items-absent');
  r65.forEach((_, i) => { if (!answeredNow.has(i + 1)) bad.push(`r65-item-${i + 1}-not-answered-this-round`); });
  if (classes.size < 5) bad.push(`classes=${classes.size}<5`);
  if (![...classes.values()].some((s) => s.size >= 4)) bad.push('no-class-spans-4-rounds');
  check('L3', bad.length === 0, `${bad.length} problems: ${bad.slice(0, 6).join(',')}`);
}

// ---- L4 / L5 held-out fixtures
let seedCtr = 0;
const rnd = () => { seedCtr += 1; return createHash('sha256').update(`${SEED}:${seedCtr}`).digest('hex'); };
const word = () => { const h = rnd(); return `w${h.slice(0, 6)}`; };
const phrase = (k) => Array.from({ length: k }, word).join(' ');
function buildFixture(dir, mut) {
  // two spot-checks (rounds 101, 102), one answer file; random words everywhere
  const lv = Number.parseInt(rnd().slice(0, 2), 16) % 2 === 0 ? '##' : '###';
  const items101 = [phrase(6), phrase(6), phrase(6)];
  const tableItem = phrase(5);
  const items102 = [phrase(6), phrase(6)];
  const decoy = phrase(6); const nested = phrase(5); const prose = phrase(7);
  const s101 = [
    `# Round 101 — spot-check ${word()}`, '', `${lv} Verdicts`, '', `- ${decoy}`, '',
    `${lv} 5. Routed defects for the next round`, '',
    `- **D1 — ${items101[0]}.**`, `  - ${nested}`,
    `1. **D2 — ${items101[1]}.**`,
    '', prose, '',
    '| id | what |', '|---|---|', `| D3 | ${tableItem} |`,
    '', `- **D4 — ${items101[2]}.**`,
    '', `${lv} Non-author statement`, '', `- ${phrase(4)}`,
  ];
  const s102 = [`# Round 102 — ${word()}`, '', `## Routed items`, '', `- ${items102[0]}`, `- ${items102[1]}`, '', '## End', ''];
  const ansLines = [`# answers ${word()}`, phrase(8), `answer ${items101[0].split(' ')[0]} ${phrase(5)}`, phrase(8)];
  const ansQuote = ansLines[2].split(' ').slice(1, 5).join(' ');
  const rows = [
    { id: 'A1', n: 101, k: 1, q: items101[0].split(' ').slice(1, 5).join(' '), status: 'closed', answer: `\`notes/a.md:3\` — "${ansQuote}"` },
    { id: 'A2', n: 101, k: 2, q: items101[1].split(' ').slice(0, 4).join(' '), status: 'open', answer: '-' },
    { id: 'A3', n: 101, k: 3, q: tableItem.split(' ').slice(1, 4).join(' '), status: 'open', answer: '-' },
    { id: 'A4', n: 101, k: 4, q: items101[2].split(' ').slice(2, 6).join(' '), status: 'open', answer: '-' },
    { id: 'A5', n: 102, k: 1, q: items102[0].split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' },
    { id: 'A6', n: 102, k: 2, q: items102[1].split(' ').slice(3, 6).join(' '), status: 'open', answer: '-' },
  ];
  let expectItems = 6;
  if (mut === 'drop') rows.splice(4, 1);
  if (mut === 'quote-swap') rows[1].q = items101[2].split(' ').slice(0, 4).join(' ');
  if (mut === 'quote-decoy') rows[3].q = decoy.split(' ').slice(0, 4).join(' ');
  if (mut === 'answer-wrong') rows[0].answer = `\`notes/a.md:3\` — "${phrase(4)}"`;
  if (mut === 'answer-ledger') rows[0].answer = '`corpus/routed-ledger.md:1` — "routed ledger"';
  if (mut === 'answer-eof') rows[0].answer = `\`notes/a.md:40\` — "${ansQuote}"`;
  if (mut === 'dup') rows.push({ ...rows[5] });
  if (mut === 'ordinal') rows.push({ id: 'A9', n: 101, k: 5, q: prose.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'nested-as-item') rows.push({ id: 'A8', n: 101, k: 2, q: nested.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'prose-as-item') rows.push({ id: 'A7', n: 101, k: 2, q: prose.split(' ').slice(0, 3).join(' '), status: 'open', answer: '-' });
  if (mut === 'long-quote') rows[1].q = phrase(26);
  if (mut === 'no-section') { s102.splice(2, 1, '## Notes'); expectItems = 4; rows.splice(4, 2); }
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
  ['no-section', 0, null], ['ledger-absent', 2, null],
];
function harness(toolPath) {
  const bad = [];
  MUTANTS.forEach(([mut, code, finding], i) => {
    const d = join(T, `fx-${i}-${mut}`);
    const expectItems = buildFixture(d, mut);
    const r = spawnSync('node', [toolPath, '--root', d, '--from', '101', '--to', '102'], { encoding: 'utf8', timeout: 60000, env: { ...process.env, TMPDIR: T } });
    const out = r.stdout || ''; const v = out.trim().split('\n').pop() || '';
    let ok = r.status === code;
    if (ok && finding) ok = out.split('\n').some((l) => l.startsWith(`FINDING ${finding} `)) && v.startsWith('ROUTED_LEDGER: DRIFT ');
    if (ok && code === 0) ok = new RegExp(`^ROUTED_LEDGER: CLEAN spotchecks=2 sections=${mut === 'no-section' ? 1 : 2} items=\d+ `).test(v);
    if (ok && code === 2) ok = v.startsWith('ROUTED_LEDGER: FAIL-CLOSED ');
    if (!ok) bad.push(`${mut}:exit=${r.status}:${v.slice(0, 70)}`);
    rmSync(d, { recursive: true, force: true });
  });
  return bad;
}
let realL4 = false;
if (!existsSync(TOOL)) check('L4', false, 'tool-absent');
else { const bad = harness(TOOL); realL4 = bad.length === 0; check('L4', realL4, `seed=${SEED} ${bad.length}/${MUTANTS.length} mutants wrong: ${bad.slice(0, 4).join(';')}`); }
{
  const stubs = {
    'always-clean': "process.stdout.write('ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=6 rows=6 open=5 closed=1 wontfix=0\\n');process.exit(0);",
    'always-drift': "process.stdout.write('FINDING UNLEDGERED x\\nROUTED_LEDGER: DRIFT spotchecks=2 findings=1 first=UNLEDGERED:x\\n');process.exit(1);",
  };
  const caught = [];
  for (const [name, src] of Object.entries(stubs)) {
    const p = join(T, `stub-${name}.mjs`); writeFileSync(p, src);
    if (harness(p).length > 0) caught.push(name);
  }
  check('L5', realL4 && caught.length === 2, `real-tool-passes-L4=${realL4} stubs-caught=${caught.join('+') || 'none'}`);
}

// ---- L6
{
  const skill = rd('SKILL.md') || ''; const q = rd('corpus/QUALITY.md') || ''; const sc = rd('SCORECARD.md') || '';
  const skillRow = skill.split('\n').some((l) => l.startsWith('|') && l.includes('routed-ledger.mjs'));
  const qual = /routed-ledger/.test(q);
  const capAt = sc.split('\n').findIndex((l) => /^##\s+Capabilities\s*$/.test(l));
  let cap = false;
  if (capAt >= 0) {
    for (const l of sc.split('\n').slice(capAt + 1)) {
      if (/^##\s/.test(l)) break;
      if (l.startsWith('|') && /routed-ledger/.test(l.split('|')[1] || '')) { cap = true; break; }
    }
  }
  check('L6', skillRow && qual && cap, `skill-row=${skillRow} quality=${qual} capability-row=${cap}`);
}

rmSync(T, { recursive: true, force: true });
const held = Object.values(results).filter(Boolean).length;
const ok = held === N_CHECKS;
process.stdout.write(`LEDGER66_${ok ? 'HELD' : 'UNMET'} held=${held}/${N_CHECKS} checks=${N_CHECKS} rev=${full} rule=${RULE} seed=${SEED}${miss.length ? ` | ${miss.join(' | ')}` : ''}\n`);
process.exit(ok ? 0 : 1);
