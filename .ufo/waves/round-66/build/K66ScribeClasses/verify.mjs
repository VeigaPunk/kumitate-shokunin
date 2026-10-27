#!/usr/bin/env node
/**
 * verify.mjs — K66ScribeClasses: check the 57-item class assignment against the
 * lane's own parser, and emit a ready-to-paste ledger fragment.
 *
 * WHAT IT CHECKS (read-only; the lane tool is imported, never edited):
 *   1. every routed item of rounds 55..65 (the tool's own routedItems()) has
 *      exactly one row in classes.tsv — no item unclassified, no row for an item
 *      that does not exist;
 *   2. every class slug is one of the declared set and matches the ledger's own
 *      slug rule /^[a-z][a-z0-9-]*$/ (routed-ledger.mjs evaluate(), ROW_MALFORMED:class);
 *   3. every quote is a verbatim substring of its item under the tool's norm()
 *      (the same comparison the gate makes) and <= 25 words (QUOTE_ABSENT /
 *      ROW_MALFORMED:quote-words among the cases it would otherwise hit).
 *
 * WHAT IT EMITS: rows.tsv (round, item, quote, class), table.md (the report
 * table), a per-class recurrence count on distinct rounds, and RECURRENT lines
 * at the tool's own threshold (rounds >= 4, `--classes`).
 *
 * Usage: node verify.mjs [--lane DIR] [--out DIR]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const OUT = resolve(opt('--out', new URL('.', import.meta.url).pathname));

const { routedItems, norm } = await import(join(LANE, 'scripts', 'routed-ledger.mjs'));
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const CLASSES = {
  'reference-drift': 'an artifact lands without its corpus/README.md map row, its covered pin or its proxy stanza refresh, so a coverage gate reads DRIFT at the next base',
  'tally-drift': 'a published number, count or verdict disagrees with the receipt, registry or histogram it summarizes',
  'carried-unaddressed': 'a routed defect is re-listed across rounds with no owner, no repair and no full close',
  'dispatch-accounting': 'the record of which seats ran, and whether they ran, disagrees with the seats actually run or is not in the gate schema',
  'citation-integrity': 'a cited source or registry id resolves to a different document than the registry holds, or one document is held under two ids',
  'wave-shape': 'the round plan, claim block, seat count or wave structure misses a declared requirement of the round contract',
  'dangling-pointer': 'a cited path, hash, receipt or template token resolves to no object at the revision it names',
  'report-fidelity': 'the report or lesson narrative departs from its receipts: silent about a landed object or a regression, or asserting more than the evidence',
  'verification-gap': 'a claimed check or tally has no executed transcript, so the number is prose rather than evidence',
  'registry-home': "a gate or capability has no SKILL.md row, no SCORECARD Capabilities row, or no proxy pin",
  'frozen-predicate-defect': 'the frozen counter or rule admits fabrication, rejects honest work, or pins a literal the surface has outgrown',
  'uncommitted-work': 'the close work or the evidence exists only in a worktree or tmpfs, so landed-means-committed and closure-durability fail',
  'append-only-violation': 'filed or committed bytes are rewritten in place instead of repaired by an appended erratum',
};

// ---- the routed items, from the lane's own parser -------------------------
const items = new Map();
let sections = 0;
for (let r = 55; r <= 65; r += 1) {
  const p = `corpus/lessons/round-${r}-verifier-spotcheck.md`;
  let text = '';
  try { text = readFileSync(join(LANE, p), 'utf8'); } catch { continue; }
  const res = routedItems(text);
  if (res.found) sections += 1;
  res.items.forEach((t, i) => items.set(`${r}#${i + 1}`, norm(t)));
}

// ---- the assignment -------------------------------------------------------
// Four items carry a quoted fragment inside the routed text; a quote with a bare
// `"` inside it stays legal for the gate (cells split on `|`, outer quotes are
// stripped) but reads badly in a ledger row, so these get a verbatim window that
// stops on either side of the embedded quote. Every override is checked by the
// same substring test below as the generated ones.
const OVERRIDE = {
  '58#2': 'overstates the dispatch (see §6: 35 reports, 29 never spawned)',
  '58#4': 'the tier counts are wrong',
  '58#5': 'its own registry table carries 18 kind=gate rows',
  '58#8': "the campaign's own MERGE-REPORT says a shared page is",
};
const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'to', 'and', 'or', 'is', 'are', 'was', 'were', 'with',
  'for', 'by', 'on', 'at', 'that', 'which', 'this', 'from', 'as', 'but', 'not']);
/** Pick a readable verbatim window: sentence boundary first, balanced parens/quotes, no dangling stopword. */
function pickQuote(text) {
  const raw = text.replace(/^(?:[-*+]|\d+[.)])\s+/, '');
  const all = raw.split(/\s+/).filter(Boolean);
  if (all.length <= 4) return raw;
  let w = all.slice(0, 16);
  const bi = w.findIndex((x, i) => i >= 4 && /[.:]$/.test(x));
  if (bi >= 0) w = w.slice(0, bi + 1);
  const unbalanced = (s) => {
    const open = (s.match(/\(/g) || []).length;
    const close = (s.match(/\)/g) || []).length;
    const q = (s.match(/"/g) || []).length;
    return open !== close || q % 2 === 1;
  };
  while (w.length > 5 && unbalanced(w.join(' '))) w = w.slice(0, -1);
  let s = w.join(' ');
  for (;;) {
    const t = s.replace(/[\s,;:]+$/, '');
    const last = t.split(/\s+/).pop() || '';
    if (STOP.has(last.replace(/[^\w'-]/g, '').toLowerCase()) && t.split(/\s+/).length > 4) s = t.split(/\s+/).slice(0, -1).join(' ');
    else { s = t; break; }
  }
  return s.length ? s : all.slice(0, 12).join(' ');
}

const rows = readFileSync(join(OUT, 'classes.tsv'), 'utf8').split('\n').filter((l) => l.trim())
  .map((l, i) => {
    const [round, item, cls, reason] = l.split('\t');
    if (!round || !item || !cls || !reason) throw new Error(`classes.tsv:${i + 1}: 4 cells expected, got ${l.split('\t').length}`);
    return { round: Number(round), item: Number(item), cls, reason };
  });

const bad = [];
const seen = new Map();
for (const row of rows) {
  const key = `${row.round}#${row.item}`;
  if (!items.has(key)) { bad.push(`ITEM_ABSENT ${key}: no such routed item`); continue; }
  if (seen.has(key)) bad.push(`ROW_DUPLICATE ${key}: also at classes.tsv:${seen.get(key)}`);
  seen.set(key, rows.indexOf(row) + 1);
  if (!Object.hasOwn(CLASSES, row.cls)) bad.push(`CLASS_UNDECLARED ${key}: ${row.cls}`);
  if (!/^[a-z][a-z0-9-]*$/.test(row.cls)) bad.push(`CLASS_SLUG ${key}: ${row.cls}`);
  // the quote: the item's first 12 words with a leading list marker stripped
  const text = items.get(key);
  const q = OVERRIDE[`${row.round}#${row.item}`] ?? pickQuote(text);
  if (!q) bad.push(`QUOTE_EMPTY ${key}`);
  if (!norm(text).includes(norm(q))) bad.push(`QUOTE_ABSENT ${key}: "${q}"`);
  if (words(q) > 25) bad.push(`QUOTE_LONG ${key}: ${words(q)}`);
  row.quote = q;
}
for (const key of items.keys()) if (!seen.has(key)) bad.push(`UNCLASSIFIED ${key}: no row`);

// ---- recurrence -----------------------------------------------------------
const by = new Map();
for (const row of rows) {
  const e = by.get(row.cls) || { n: 0, rounds: new Set() };
  e.n += 1; e.rounds.add(row.round); by.set(row.cls, e);
}
const ordered = [...by.entries()].sort((a, b) => b[1].rounds.size - a[1].rounds.size || b[1].n - a[1].n || a[0].localeCompare(b[0]));

// ---- emit -----------------------------------------------------------------
const tsv = rows.map((r) => [r.round, r.item, r.quote, r.cls].join('\t')).join('\n') + '\n';
writeFileSync(join(OUT, 'rows.tsv'), tsv);

const table = [
  '| round | item | class | quote (verbatim, ≤25 words) | one-line reason |',
  '|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.round} | ${r.item} | \`${r.cls}\` | "${r.quote}" | ${r.reason} |`),
].join('\n') + '\n';
writeFileSync(join(OUT, 'table.md'), table);

const out = [];
out.push(`SPOTCHECKS sections=${sections} items=${items.size} rows=${rows.length} malformed=${bad.length}`);
for (const b of bad) out.push(`BAD ${b}`);
out.push('---');
out.push('| class | rows | distinct rounds | rounds | status |');
out.push('|---|---|---|---|---|');
for (const [c, e] of ordered) {
  const rr = [...e.rounds].sort((a, b) => a - b);
  out.push(`| \`${c}\` | ${e.n} | ${rr.length} | ${rr.join(',')} | ${rr.length >= 4 ? 'RECURRENT' : rr.length === 3 ? 'watch' : '-'} |`);
}
out.push('---');
for (const [c, e] of ordered) if (e.rounds.size >= 4) out.push(`RECURRENT ${c} rounds=${e.rounds.size}`);
out.push(`TOTAL rows=${rows.length} classes=${by.size} recurrent=${ordered.filter(([, e]) => e.rounds.size >= 4).length}`);
out.push(`VERDICT: ${bad.length === 0 ? 'PASS' : 'FAIL'}`);
const text = out.join('\n') + '\n';
writeFileSync(join(OUT, 'verify.txt'), text);
process.stdout.write(text);
process.exitCode = bad.length === 0 ? 0 : 1;
