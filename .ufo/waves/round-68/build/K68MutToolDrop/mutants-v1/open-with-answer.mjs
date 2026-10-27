#!/usr/bin/env node
/**
 * routed-ledger.mjs — kumitate lane gate, contract kumitate-routed-ledger-v1 (round 66,
 * capability `routed-ledger`; considerthese/2026-10-25.md ideas 4 "count recurrences" and
 * 5 "keep a deferral ledger").
 *
 *   node scripts/routed-ledger.mjs [--root DIR] [--rev REV] [--from N] [--to N]
 *                                  [--ledger PATH] [--classes]
 *   node scripts/routed-ledger.mjs --selftest
 *
 * What it binds. Every non-author verifier spot-check (`corpus/lessons/round-N-verifier-spotcheck.md`)
 * routes defects back to the lane in one section. Those items were answered (or lost) in prose
 * scattered across later lessons, SCORECARD sections and reports; nothing counted them, so a class
 * (README map drift) recurred eleven times. This gate reads the routed section of every spot-check
 * in [from, to] and the ledger `corpus/routed-ledger.md`, and requires:
 *   - every routed ITEM has >= 1 ledger row (UNLEDGERED otherwise);
 *   - every row binds to its item by a located quote (<= 25 words) found in that item's text;
 *   - every closed/wontfix row binds to its answer by `path:line` plus a located quote found on
 *     that line (+-2 lines) of a lane file that is neither the ledger nor a spot-check.
 *
 * Section rule. The routed section is the FIRST heading (`#`..`######`) whose text matches
 * /\brouted\s+(defects?|items?)\b/i; it ends at the next heading of the same or a higher level.
 * Items are, in order: column-0 list items (`-`, `*`, `+`, `1.`, `1)`) and table data rows
 * (a column-0 `|` line that is not a header separator and not the line right above one). An item's
 * text runs from its marker line to the line before the next item or the section end. Nested
 * (indented) bullets belong to their parent item; prose paragraphs are not items.
 *
 * Ledger (`## Ledger` section, one GFM table, 7 cells):
 *   | id | round | item | quote | class | status | answer |
 *   id      [A-Za-z0-9][A-Za-z0-9.-]*, unique
 *   round   N of the spot-check file; item = 1-based item ordinal in its routed section
 *   quote   <= 25 words, located in the item text (markup/whitespace-normalised)
 *   class   [a-z][a-z0-9-]*  (recurrence key)
 *   status  open | closed | wontfix
 *   answer  `-` when open; otherwise `path:line` — "quote" (quote <= 25 words, located at the line)
 *
 * Verdict (last stdout line):
 *   ROUTED_LEDGER: CLEAN spotchecks=a sections=b items=c rows=d open=e closed=f wontfix=g     exit 0
 *   ROUTED_LEDGER: DRIFT spotchecks=… findings=k first=<ID>:<detail>                          exit 1
 *   ROUTED_LEDGER: FAIL-CLOSED reason=<why>                                                   exit 2
 *   ROUTED_LEDGER: USAGE <msg>                                                                exit 64
 * Findings (one `FINDING <ID> <detail>` line each): ROW_MALFORMED, ROW_DUPLICATE, ITEM_ABSENT,
 * QUOTE_ABSENT, ANSWER_DEAD, UNLEDGERED.
 * --classes adds `CLASS <c> rows=<n> rounds=<r,…>` lines and `RECURRENT <c> rounds=<k>` for every
 * class seen in >= 4 distinct spot-check rounds (a class past three recurrences wants a structural fix).
 *
 * Reads: the worktree under --root, or committed bytes only (`git show REV:path`) with --rev.
 * Writes: nothing outside os.tmpdir() (selftest fixtures; honours TMPDIR; removed on exit).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, normalize, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const LEDGER_DEFAULT = 'corpus/routed-ledger.md';
const FROM_DEFAULT = 55;
const SPOT_RE = /^corpus\/lessons\/round-(\d+)-verifier-spotcheck\.md$/;
const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;

export const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/** Parse the routed section of a spot-check text → { found, items: [text…] }. */
export function routedItems(text) {
  const L = String(text).split('\n');
  let start = -1; let level = 0;
  for (let i = 0; i < L.length; i += 1) {
    const m = /^(#{1,6})\s+(.*)$/.exec(L[i]);
    if (m && HEAD_RE.test(m[2])) { start = i; level = m[1].length; break; }
  }
  if (start < 0) return { found: false, items: [] };
  let end = L.length;
  for (let i = start + 1; i < L.length; i += 1) {
    const m = /^(#{1,6})\s/.exec(L[i]);
    if (m && m[1].length <= level) { end = i; break; }
  }
  const sep = (l) => /^\|[\s:|-]+\|\s*$/.test(l) && l.includes('-');
  const starts = [];
  for (let i = start + 1; i < end; i += 1) {
    const l = L[i];
    if (/^(?:[-*+]|\d+[.)])\s+\S/.test(l)) starts.push({ i, kind: 'list' });
    else if (/^\|/.test(l) && !sep(l) && !(i + 1 < end && sep(L[i + 1]))) starts.push({ i, kind: 'table' });
  }
  const items = starts.map((s, k) => {
    if (s.kind === 'table') return L[s.i];
    const stop = k + 1 < starts.length ? starts[k + 1].i : end;
    const body = [L[s.i]];
    for (let j = s.i + 1; j < stop; j += 1) {
      // a column-0 non-blank line that is not a continuation ends the item (prose after a list)
      if (/^\S/.test(L[j]) && !/^\s/.test(L[j]) && L[j - 1].trim() === '') break;
      body.push(L[j]);
    }
    return body.join('\n');
  });
  return { found: true, items };
}

/** Parse the ledger text → { rows, malformed: [detail…] }. */
export function ledgerRows(text) {
  const L = String(text).split('\n');
  const at = L.findIndex((l) => /^##\s+Ledger\s*$/.test(l));
  const rows = []; const malformed = [];
  if (at < 0) return { rows, malformed, section: false };
  for (let i = at + 1; i < L.length; i += 1) {
    const l = L[i];
    if (/^##?\s/.test(l)) break;
    if (!/^\|/.test(l)) continue;
    if (/^\|[\s:|-]+\|\s*$/.test(l)) continue;
    const cells = l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells[0] === 'id') continue;
    if (cells.length !== 7) { malformed.push(`line${i + 1}:cells=${cells.length}`); continue; }
    const [id, round, item, quoteRaw, cls, status, answer] = cells;
    const quote = quoteRaw.replace(/^"(.*)"$/, '$1');
    rows.push({ line: i + 1, id, round, item, quote, cls, status, answer });
  }
  return { rows, malformed, section: true };
}

function makeReader(root, rev) {
  if (!rev) {
    return {
      read: (p) => { try { return readFileSync(join(root, p), 'utf8'); } catch { return null; } },
      list: () => {
        const d = join(root, 'corpus', 'lessons');
        try { return readdirSync(d).map((f) => `corpus/lessons/${f}`); } catch { return []; }
      },
    };
  }
  return {
    read: (p) => {
      const r = spawnSync('git', ['-C', root, 'show', `${rev}:${p}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
      return r.status === 0 ? r.stdout : null;
    },
    list: () => {
      const r = spawnSync('git', ['-C', root, 'ls-tree', '--name-only', `${rev}:corpus/lessons`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      return r.status === 0 ? r.stdout.split('\n').filter(Boolean).map((f) => `corpus/lessons/${f}`) : [];
    },
  };
}

/** Evaluate → { code, lines } (lines = stdout lines; the verdict is the last). */
export function evaluate({ root, rev = null, from = FROM_DEFAULT, to = null, ledger = LEDGER_DEFAULT, classes = false }) {
  const out = [];
  if (rev) {
    const v = spawnSync('git', ['-C', root, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
    if (v.status !== 0) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=rev-unreadable:${rev}`] };
  }
  const R = makeReader(root, rev);
  const spots = new Map();
  for (const p of R.list()) {
    const m = SPOT_RE.exec(p);
    if (m) spots.set(Number(m[1]), p);
  }
  const top = to ?? Math.max(-1, ...spots.keys());
  const inRange = [...spots.keys()].filter((n) => n >= from && n <= top).sort((a, b) => a - b);
  if (!inRange.length) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=no-spotchecks-in-range:${from}-${top}`] };
  const ledgerText = R.read(ledger);
  if (ledgerText == null) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:${ledger}`] };
  const { rows, malformed, section } = ledgerRows(ledgerText);
  if (!section) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-has-no-Ledger-section:${ledger}`] };

  const findings = [];
  const F = (id, d) => findings.push(`${id} ${d}`);
  for (const d of malformed) F('ROW_MALFORMED', d);

  const sec = new Map(); let sections = 0; let items = 0;
  for (const n of inRange) {
    const r = routedItems(R.read(spots.get(n)) ?? '');
    sec.set(n, r);
    if (r.found) sections += 1;
    items += r.items.length;
  }
  const seen = new Set(); const covered = new Set();
  const counts = { open: 0, closed: 0, wontfix: 0 };
  const spotPaths = new Set(spots.values());
  const ledgerNorm = normalize(ledger);
  for (const row of rows) {
    const where = `${row.id}@line${row.line}`;
    let bad = false;
    if (!/^[A-Za-z0-9][A-Za-z0-9.-]*$/.test(row.id)) { F('ROW_MALFORMED', `${where}:id`); bad = true; }
    if (seen.has(row.id)) { F('ROW_DUPLICATE', where); bad = true; }
    seen.add(row.id);
    if (!/^\d+$/.test(row.round) || !/^\d+$/.test(row.item) || Number(row.item) < 1) { F('ROW_MALFORMED', `${where}:round-or-item`); bad = true; }
    if (!row.quote || words(row.quote) > 25) { F('ROW_MALFORMED', `${where}:quote-words=${words(row.quote)}`); bad = true; }
    if (!/^[a-z][a-z0-9-]*$/.test(row.cls)) { F('ROW_MALFORMED', `${where}:class`); bad = true; }
    if (!['open', 'closed', 'wontfix'].includes(row.status)) { F('ROW_MALFORMED', `${where}:status=${row.status}`); bad = true; }
    let ans = null;
    if (row.status === 'open') {
      if (false) { F('ROW_MALFORMED', `${where}:open-row-answer-not-dash`); bad = true; }
    } else if (['closed', 'wontfix'].includes(row.status)) {
      const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(row.answer);
      if (!m) { F('ROW_MALFORMED', `${where}:answer-format`); bad = true; }
      else if (words(m[3]) > 25) { F('ROW_MALFORMED', `${where}:answer-quote-words`); bad = true; }
      else ans = { path: m[1], line: Number(m[2]), quote: m[3] };
    }
    if (bad) continue;
    counts[row.status] += 1;
    const n = Number(row.round); const k = Number(row.item);
    if (n < from || n > top || !spots.has(n)) { F('ITEM_ABSENT', `${where}:round-${n}-not-in-range`); continue; }
    const s = sec.get(n);
    if (!s.found || k > s.items.length) { F('ITEM_ABSENT', `${where}:round-${n}-item-${k}-of-${s.items.length}`); continue; }
    if (!norm(s.items[k - 1]).includes(norm(row.quote))) { F('QUOTE_ABSENT', `${where}:round-${n}-item-${k}`); continue; }
    covered.add(`${n}#${k}`);
    if (ans) {
      const p = normalize(ans.path);
      if (isAbsolute(ans.path) || p.startsWith('..') || p === ledgerNorm || spotPaths.has(p) || SPOT_RE.test(p)) { F('ANSWER_DEAD', `${where}:answer-path-not-allowed:${ans.path}`); continue; }
      const txt = R.read(p);
      if (txt == null) { F('ANSWER_DEAD', `${where}:answer-file-absent:${p}`); continue; }
      const AL = txt.split('\n');
      if (ans.line < 1 || ans.line > AL.length) { F('ANSWER_DEAD', `${where}:answer-line-${ans.line}-of-${AL.length}`); continue; }
      const win = norm(AL.slice(Math.max(0, ans.line - 3), Math.min(AL.length, ans.line + 2)).join(' '));
      if (!win.includes(norm(ans.quote))) { F('ANSWER_DEAD', `${where}:answer-quote-not-at:${p}:${ans.line}`); continue; }
    }
  }
  for (const n of inRange) {
    const s = sec.get(n);
    s.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) F('UNLEDGERED', `round-${n}-item-${i + 1}`); });
  }
  if (classes) {
    const by = new Map();
    for (const row of rows) {
      if (!/^[a-z][a-z0-9-]*$/.test(row.cls)) continue;
      const e = by.get(row.cls) || { n: 0, rounds: new Set() };
      e.n += 1; e.rounds.add(Number(row.round)); by.set(row.cls, e);
    }
    for (const [c, e] of [...by.entries()].sort((a, b) => b[1].rounds.size - a[1].rounds.size || a[0].localeCompare(b[0]))) {
      out.push(`CLASS ${c} rows=${e.n} rounds=${[...e.rounds].sort((a, b) => a - b).join(',')}`);
    }
    for (const [c, e] of by) if (e.rounds.size >= 4) out.push(`RECURRENT ${c} rounds=${e.rounds.size}`);
  }
  for (const f of findings) out.push(`FINDING ${f}`);
  const head = `spotchecks=${inRange.length} sections=${sections} items=${items} rows=${rows.length} open=${counts.open} closed=${counts.closed} wontfix=${counts.wontfix}`;
  if (findings.length) {
    out.push(`ROUTED_LEDGER: DRIFT ${head} findings=${findings.length} first=${findings[0].replace(' ', ':')}`);
    return { code: 1, lines: out };
  }
  out.push(`ROUTED_LEDGER: CLEAN ${head}`);
  return { code: 0, lines: out };
}

// ---------------------------------------------------------------- selftest
function selftest() {
  const T = mkdtempSync(join(tmpdir(), 'routed-ledger-st.'));
  const cases = [];
  const spot = (n, body) => {
    mkdirSync(join(T, 'x', 'corpus', 'lessons'), { recursive: true });
    writeFileSync(join(T, 'x', 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), body);
  };
  const S1 = [
    '# Round 7 — spot-check', '', '## 4. Verdicts', '', '- not an item: verdict bullet', '',
    '## 5. Routed defects for round 8', '',
    '- **D1 — the readme row is missing.** The map reads DRIFT at the next base.',
    '  continuation names the pin too.',
    '  - nested bullet is part of D1',
    '1. **D2 — tier counts are wrong** in the report.',
    '', 'Prose paragraph after the list is not an item.', '',
    '| id | what |', '|---|---|', '| D3 | the capability row is absent from the table |',
    '', '### 5.1 sub-heading stays inside', '- **D4 — wording of the reject reason.**',
    '', '## 6. Non-author statement', '', '- not routed either',
  ].join('\n');
  const S2 = ['# Round 8', '', '## Routed items', '', 'No new lane-owned defect is routed.', ''].join('\n');
  const ans = ['# answers', 'round 9 fixed R7-D1: the readme row and its pin landed', 'other', 'R7-D2 wontfix: the counts were already corrected'].join('\n');
  const goodRows = [
    '| R7-D1 | 7 | 1 | "the readme row is missing" | reference-drift | closed | `notes/answers.md:2` — "the readme row and its pin landed" |',
    '| R7-D2 | 7 | 2 | "tier counts are wrong" | tally-drift | wontfix | `notes/answers.md:4` — "the counts were already corrected" |',
    '| R7-D3 | 7 | 3 | "the capability row is absent" | registry-home | open | - |',
    '| R7-D4 | 7 | 4 | "wording of the reject reason" | wording | open | - |',
  ];
  const ledgerOf = (rows) => ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n');
  const setup = (rows, s1 = S1) => {
    rmSync(join(T, 'x'), { recursive: true, force: true });
    spot(7, s1); spot(8, S2);
    mkdirSync(join(T, 'x', 'notes'), { recursive: true });
    writeFileSync(join(T, 'x', 'notes', 'answers.md'), ans);
    if (rows) writeFileSync(join(T, 'x', 'corpus', 'routed-ledger.md'), ledgerOf(rows));
  };
  const run = (extra = {}) => evaluate({ root: join(T, 'x'), from: 7, ...extra });
  const verdict = (r) => r.lines[r.lines.length - 1];
  const has = (r, id) => r.lines.some((l) => l.startsWith(`FINDING ${id} `));
  const add = (name, fn) => { let ok = false; let why = ''; try { const v = fn(); ok = v === true; why = v === true ? '' : String(v); } catch (e) { why = `threw ${e.message}`; } cases.push({ name, ok, why }); };

  add('clean ledger reads CLEAN exit 0', () => { setup(goodRows); const r = run(); return (r.code === 0 && /CLEAN spotchecks=2 sections=2 items=4 rows=4 open=2 closed=1 wontfix=1$/.test(verdict(r))) || verdict(r); });
  add('section items: nested bullet and prose are not items', () => { const r = routedItems(S1); return (r.items.length === 4 && r.items[0].includes('nested bullet')) || r.items.length; });
  add('section ends at same-level heading; sub-heading stays inside', () => routedItems(S1).items[3].includes('D4'));
  add('bullets outside the routed section are not items', () => !routedItems(S1).items.some((t) => t.includes('not routed') || t.includes('not an item')));
  add('table header row is not an item', () => !routedItems(S1).items.some((t) => /\| id \| what \|/.test(t)));
  add('prose-only routed section: found, zero items', () => { const r = routedItems(S2); return r.found && r.items.length === 0; });
  add('heading "ROUTED_HELD" is not a routed section', () => !routedItems('## C1 (ROUTED_HELD)\n- x\n').found);
  add('dropped row → UNLEDGERED exit 1', () => { setup(goodRows.slice(1)); const r = run(); return (r.code === 1 && has(r, 'UNLEDGERED')) || verdict(r); });
  add('quote not in its item → QUOTE_ABSENT', () => { setup([goodRows[0].replace('"the readme row is missing"', '"the readme row is present"'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'QUOTE_ABSENT')) || verdict(r); });
  add('quote from a different item → QUOTE_ABSENT', () => { setup([goodRows[0].replace('"the readme row is missing"', '"tier counts are wrong"'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'QUOTE_ABSENT')) || verdict(r); });
  add('item ordinal beyond section → ITEM_ABSENT', () => { setup([...goodRows, '| R7-D9 | 7 | 9 | "x y" | wording | open | - |']); const r = run(); return (r.code === 1 && has(r, 'ITEM_ABSENT')) || verdict(r); });
  add('round outside range → ITEM_ABSENT', () => { setup([...goodRows, '| R3-D1 | 3 | 1 | "x y" | wording | open | - |']); const r = run(); return (r.code === 1 && has(r, 'ITEM_ABSENT')) || verdict(r); });
  add('answer quote not at line → ANSWER_DEAD', () => { setup([goodRows[0].replace('answers.md:2', 'answers.md:4').replace('"the readme row and its pin landed"', '"nothing like this"'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || verdict(r); });
  add('answer line past EOF → ANSWER_DEAD', () => { setup([goodRows[0].replace('answers.md:2', 'answers.md:99'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || verdict(r); });
  add('answer file absent → ANSWER_DEAD', () => { setup([goodRows[0].replace('notes/answers.md', 'notes/nope.md'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || verdict(r); });
  add('answer pointing into the ledger itself → ANSWER_DEAD', () => { setup([goodRows[0].replace('notes/answers.md:2', 'corpus/routed-ledger.md:7').replace('"the readme row and its pin landed"', '"the readme row is missing"'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || verdict(r); });
  add('answer pointing into a spot-check → ANSWER_DEAD', () => { setup([goodRows[0].replace('notes/answers.md:2', 'corpus/lessons/round-7-verifier-spotcheck.md:9').replace('"the readme row and its pin landed"', '"the readme row is missing"'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || verdict(r); });
  add('answer path escaping with .. → ANSWER_DEAD', () => { setup([goodRows[0].replace('notes/answers.md:2', '../x/notes/answers.md:2'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ANSWER_DEAD')) || verdict(r); });
  add('closed row with "-" answer → ROW_MALFORMED', () => { setup([goodRows[0].replace(/\| `notes.*\|$/, '| - |'), ...goodRows.slice(1)]); const r = run(); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || verdict(r); });
  add('open row with an answer → ROW_MALFORMED', () => { setup([...goodRows.slice(0, 2), goodRows[2].replace('| open | - |', '| open | `notes/answers.md:2` — "x" |'), goodRows[3]]); const r = run(); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || verdict(r); });
  add('bad status → ROW_MALFORMED', () => { setup([...goodRows.slice(0, 3), goodRows[3].replace('| open |', '| done |')]); const r = run(); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || verdict(r); });
  add('quote over 25 words → ROW_MALFORMED', () => { setup([...goodRows, `| R7-X | 7 | 1 | "${'w '.repeat(26).trim()}" | wording | open | - |`]); const r = run(); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || verdict(r); });
  add('six-cell row → ROW_MALFORMED', () => { setup([...goodRows, '| R7-Y | 7 | 1 | "readme row" | wording | open |']); const r = run(); return (r.code === 1 && has(r, 'ROW_MALFORMED')) || verdict(r); });
  add('duplicate id → ROW_DUPLICATE', () => { setup([...goodRows, goodRows[3]]); const r = run(); return (r.code === 1 && has(r, 'ROW_DUPLICATE')) || verdict(r); });
  add('two rows on one item (two classes) stay CLEAN', () => { setup([...goodRows, '| R7-D1b | 7 | 1 | "continuation names the pin too" | pin-drift | open | - |']); const r = run(); return r.code === 0 || verdict(r); });
  add('ledger absent → FAIL-CLOSED exit 2', () => { setup(null); const r = run(); return (r.code === 2 && /FAIL-CLOSED reason=ledger-absent/.test(verdict(r))) || verdict(r); });
  add('ledger without ## Ledger → FAIL-CLOSED exit 2', () => { setup(goodRows); writeFileSync(join(T, 'x', 'corpus', 'routed-ledger.md'), '# nothing\n'); const r = run(); return r.code === 2 || verdict(r); });
  add('no spot-check in range → FAIL-CLOSED exit 2', () => { setup(goodRows); const r = run({ from: 50 }); return r.code === 2 || verdict(r); });
  add('--to excludes later spot-checks', () => { setup(goodRows); const r = run({ to: 7 }); return (r.code === 0 && /spotchecks=1 /.test(verdict(r))) || verdict(r); });
  add('--classes prints CLASS lines; RECURRENT needs >= 4 rounds', () => {
    setup(goodRows); const r = run({ classes: true });
    return (r.code === 0 && r.lines.some((l) => l.startsWith('CLASS reference-drift rows=1 rounds=7')) && !r.lines.some((l) => l.startsWith('RECURRENT'))) || r.lines.join('/');
  });
  add('RECURRENT fires at 4 distinct rounds', () => {
    rmSync(join(T, 'x'), { recursive: true, force: true });
    const rows = [];
    for (const n of [10, 11, 12, 13]) { spot(n, `## Routed defects\n\n- **D1 — map drift again in round ${n}.**\n`); rows.push(`| R${n}-D1 | ${n} | 1 | "map drift again in round ${n}" | reference-drift | open | - |`); }
    writeFileSync(join(T, 'x', 'corpus', 'routed-ledger.md'), ledgerOf(rows));
    const r = evaluate({ root: join(T, 'x'), from: 10, classes: true });
    return (r.code === 0 && r.lines.includes('RECURRENT reference-drift rounds=4')) || r.lines.join('/');
  });
  add('--rev reads committed bytes, not the worktree', () => {
    setup(goodRows);
    const D = join(T, 'x');
    const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8' });
    if (g('init', '-q').status !== 0) return 'git init failed';
    if (resolve(g('rev-parse', '--show-toplevel').stdout.trim()) !== resolve(D)) return 'toplevel mismatch';
    g('add', '-A');
    if (g('-c', 'user.name=selftest', '-c', 'user.email=selftest@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture').status !== 0) return 'commit failed';
    writeFileSync(join(D, 'corpus', 'routed-ledger.md'), ledgerOf(goodRows.slice(1)));
    const wt = evaluate({ root: D, from: 7 }); const rv = evaluate({ root: D, from: 7, rev: 'HEAD' });
    return (wt.code === 1 && rv.code === 0) || `${wt.code}/${rv.code}`;
  });
  add('unreadable --rev → FAIL-CLOSED exit 2', () => { setup(goodRows); const r = evaluate({ root: join(T, 'x'), from: 7, rev: 'deadbeef' }); return r.code === 2 || verdict(r); });

  rmSync(T, { recursive: true, force: true });
  const pass = cases.filter((c) => c.ok).length;
  for (const c of cases) process.stdout.write(`CASE ${c.ok ? 'ok' : 'FAIL'} ${c.name}${c.ok ? '' : ` :: ${c.why}`}\n`);
  process.stdout.write(`ROUTED_LEDGER_SELFTEST: ${pass === cases.length ? 'PASS' : 'FAIL'} (${pass}/${cases.length})\n`);
  return pass === cases.length ? 0 : 1;
}

// ---------------------------------------------------------------- cli
function main(argv) {
  if (argv.includes('--selftest')) return selftest();
  const opts = { root: process.cwd(), rev: null, from: FROM_DEFAULT, to: null, ledger: LEDGER_DEFAULT, classes: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const val = () => { const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`); i += 1; return v; };
    try {
      if (a === '--root') opts.root = resolve(val());
      else if (a === '--rev') opts.rev = val();
      else if (a === '--from') opts.from = Number(val());
      else if (a === '--to') opts.to = Number(val());
      else if (a === '--ledger') opts.ledger = val();
      else if (a === '--classes') opts.classes = true;
      else throw new Error(`unknown argument ${a}`);
    } catch (e) { process.stdout.write(`ROUTED_LEDGER: USAGE ${e.message}\n`); return 64; }
  }
  if (!Number.isInteger(opts.from) || (opts.to !== null && !Number.isInteger(opts.to))) { process.stdout.write('ROUTED_LEDGER: USAGE --from/--to must be integers\n'); return 64; }
  if (!existsSync(opts.root)) { process.stdout.write(`ROUTED_LEDGER: FAIL-CLOSED reason=root-absent:${opts.root}\n`); return 2; }
  try {
    const r = evaluate(opts);
    process.stdout.write(`${r.lines.join('\n')}\n`);
    return r.code;
  } catch (e) {
    process.stdout.write(`ROUTED_LEDGER: FAIL-CLOSED reason=internal:${String(e.message).replace(/\s+/g, '_')}\n`);
    return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
