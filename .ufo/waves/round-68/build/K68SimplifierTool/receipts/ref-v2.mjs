#!/usr/bin/env node
/**
 * ref-v2.mjs — MINIMAL reference implementation of contract kumitate-routed-ledger-v2,
 * written by seat K68SimplifierTool only to answer one question: how much machinery does the
 * 20-mutant L4 contract actually require? NOT a deliverable; L1's tool carries the selftest.
 *
 * Deviations from v1, each required by a named mutant:
 *   fence-aware scanning (fence-item), every routed section per round (second-section),
 *   row quote >= 3 words (one-word-quote), quote ambiguity across a round's items
 *   (ambiguous-quote), exact answer line (shifted-answer), one non-open row per item
 *   (contradictory).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, normalize, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LEDGER_DEFAULT = 'corpus/routed-ledger.md';
const FROM_DEFAULT = 55;
const SPOT_RE = /^corpus\/lessons\/round-(\d+)-verifier-spotcheck\.md$/;
const HEAD_RE = /\brouted\s+(defects?|items?)\b/i;
const FENCE_RE = /^ {0,3}(```|~~~)/;

const norm = (s) => String(s)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const wb = (q, text) => { const n = norm(q); if (!n) return false; return new RegExp(`(^|[^A-Za-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(text)); };

/** Fence mask: true for fence delimiter lines only; `inFence` for lines inside a fence. */
function fenceMask(L) {
  const del = new Array(L.length).fill(false); const inside = new Array(L.length).fill(false);
  let open = false;
  for (let i = 0; i < L.length; i += 1) {
    if (FENCE_RE.test(L[i])) { del[i] = true; open = !open; continue; }
    inside[i] = open;
  }
  return { del, inside };
}

/** Every routed section of a spot-check → items (concatenated, in document order). */
export function routedItems(text) {
  const L = String(text).split('\n');
  const { del, inside } = fenceMask(L);
  const heads = [];
  for (let i = 0; i < L.length; i += 1) {
    if (del[i] || inside[i]) continue;
    const m = /^(#{1,6})\s+(.*)$/.exec(L[i]);
    if (m) heads.push({ i, level: m[1].length, text: m[2] });
  }
  const sections = [];
  for (const h of heads) {
    if (!HEAD_RE.test(h.text)) continue;
    let end = L.length;
    for (const g of heads) if (g.i > h.i && g.level <= h.level) { end = g.i; break; }
    sections.push({ start: h.i, end });
  }
  const isSep = (l) => /^\|[\s:|-]+\|\s*$/.test(l) && l.includes('-');
  const items = [];
  for (const s of sections) {
    const starts = [];
    for (let i = s.start + 1; i < s.end; i += 1) {
      if (del[i] || inside[i]) continue;
      if (/^(?:[-*+]|\d+[.)])\s+\S/.test(L[i])) starts.push({ i, kind: 'list' });
      else if (L[i].startsWith('|') && !isSep(L[i]) && !(i + 1 < s.end && isSep(L[i + 1]))) starts.push({ i, kind: 'table' });
    }
    starts.forEach((st, k) => {
      if (st.kind === 'table') { items.push(L[st.i]); return; }
      const stop = k + 1 < starts.length ? starts[k + 1].i : s.end;
      const body = [L[st.i]];
      for (let j = st.i + 1; j < stop; j += 1) {
        if (del[j] || inside[j]) continue;
        if (/^\S/.test(L[j]) && L[j - 1].trim() === '') break;
        body.push(L[j]);
      }
      items.push(body.join('\n'));
    });
  }
  return { found: sections.length > 0, sections: sections.length, items };
}

export function ledgerRows(text) {
  const L = String(text).split('\n');
  const at = L.findIndex((l) => /^##\s+Ledger\s*$/.test(l));
  const rows = []; const malformed = [];
  if (at < 0) return { rows, malformed, section: false };
  for (let i = at + 1; i < L.length; i += 1) {
    if (/^##?\s/.test(L[i])) break;
    if (!L[i].startsWith('|') || /^\|[\s:|-]+\|\s*$/.test(L[i])) continue;
    const cells = L[i].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (cells[0] === 'id') continue;
    if (cells.length !== 7) { malformed.push(`line${i + 1}:cells=${cells.length}`); continue; }
    const [id, round, item, quoteRaw, cls, status, answer] = cells;
    rows.push({ line: i + 1, id, round, item, quote: quoteRaw.replace(/^"(.*)"$/, '$1'), cls, status, answer });
  }
  return { rows, malformed, section: true };
}

export function evaluate({ root, ledger = LEDGER_DEFAULT, from = FROM_DEFAULT, to = null }) {
  const read = (p) => { try { return readFileSync(join(root, p), 'utf8'); } catch { return null; } };
  const spots = new Map();
  let files = [];
  try { files = readdirSync(join(root, 'corpus', 'lessons')).map((f) => `corpus/lessons/${f}`); } catch { files = []; }
  const top = to ?? Math.max(-1, ...[...files].map((p) => { const m = SPOT_RE.exec(p); return m ? Number(m[1]) : -1; }));
  for (const p of files) { const m = SPOT_RE.exec(p); if (m && Number(m[1]) >= from && Number(m[1]) <= top) spots.set(Number(m[1]), p); }
  if (!spots.size) return { code: 2, lines: ['ROUTED_LEDGER: FAIL-CLOSED reason=no-spotchecks'] };
  const ledgerText = read(ledger);
  if (ledgerText == null) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:${ledger}`] };
  const { rows, malformed, section } = ledgerRows(ledgerText);
  if (!section) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-has-no-Ledger-section:${ledger}`] };

  const findings = []; const F = (id, d) => findings.push(`${id} ${d}`);
  for (const d of malformed) F('ROW_MALFORMED', d);

  const sec = new Map(); let sections = 0; let items = 0;
  for (const [n, p] of [...spots].sort((a, b) => a[0] - b[0])) {
    const r = routedItems(read(p) ?? '');
    sec.set(n, r); sections += r.sections; items += r.items.length;
  }
  const seen = new Set(); const covered = new Set(); const nonOpen = new Map();
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
    const qw = words(row.quote);
    if (!row.quote || qw > 25 || qw < 3) { F('ROW_MALFORMED', `${where}:quote-words=${qw}`); bad = true; }
    if (!/^[a-z][a-z0-9-]*$/.test(row.cls)) { F('ROW_MALFORMED', `${where}:class`); bad = true; }
    if (!['open', 'closed', 'wontfix'].includes(row.status)) { F('ROW_MALFORMED', `${where}:status=${row.status}`); bad = true; }
    let ans = null;
    if (row.status === 'open') { if (row.answer !== '-') { F('ROW_MALFORMED', `${where}:open-row-answer-not-dash`); bad = true; } }
    else if (['closed', 'wontfix'].includes(row.status)) {
      const m = /^`?([^`\s]+?):(\d+)`?\s+[\u2014-]+\s+"(.+)"$/.exec(row.answer);
      if (!m) { F('ROW_MALFORMED', `${where}:answer-format`); bad = true; }
      else if (words(m[3]) > 25) { F('ROW_MALFORMED', `${where}:answer-quote-words`); bad = true; }
      else ans = { path: m[1], line: Number(m[2]), quote: m[3] };
    }
    if (bad) continue;
    counts[row.status] += 1;
    const n = Number(row.round); const k = Number(row.item);
    if (!spots.has(n) || n < from || n > top) { F('ITEM_ABSENT', `${where}:round-${n}-not-in-range`); continue; }
    const s = sec.get(n);
    if (k > s.items.length) { F('ITEM_ABSENT', `${where}:round-${n}-item-${k}-of-${s.items.length}`); continue; }
    const hits = s.items.filter((t) => wb(row.quote, t)).length;
    if (hits > 1) { F('QUOTE_AMBIGUOUS', `${where}:round-${n}-quote-in-${hits}-items`); continue; }
    if (!wb(row.quote, s.items[k - 1])) { F('QUOTE_ABSENT', `${where}:round-${n}-item-${k}`); continue; }
    if (ans) {
      const key = `${n}#${k}`;
      if (nonOpen.has(key)) { F('ROW_CONTRADICTED', `${where}:with-${nonOpen.get(key)}`); continue; }
      nonOpen.set(key, row.id);
      const p = normalize(ans.path);
      if (isAbsolute(ans.path) || p.startsWith('..') || p === ledgerNorm || spotPaths.has(p) || SPOT_RE.test(p)) { F('ANSWER_DEAD', `${where}:answer-path-not-allowed:${ans.path}`); continue; }
      const txt = read(p);
      if (txt == null) { F('ANSWER_DEAD', `${where}:answer-file-absent:${p}`); continue; }
      const AL = txt.split('\n');
      if (ans.line < 1 || ans.line > AL.length) { F('ANSWER_DEAD', `${where}:answer-line-${ans.line}-of-${AL.length}`); continue; }
      if (!wb(ans.quote, AL[ans.line - 1])) { F('ANSWER_DEAD', `${where}:answer-quote-not-at:${p}:${ans.line}`); continue; }
    }
    covered.add(`${n}#${k}`);
  }
  for (const [n, s] of sec) s.items.forEach((_, i) => { if (!covered.has(`${n}#${i + 1}`)) F('UNLEDGERED', `round-${n}-item-${i + 1}`); });
  for (const f of findings) { void f; }
  const head = `spotchecks=${spots.size} sections=${sections} items=${items} rows=${rows.length} open=${counts.open} closed=${counts.closed} wontfix=${counts.wontfix}`;
  const out = findings.map((f) => `FINDING ${f}`);
  if (findings.length) { out.push(`ROUTED_LEDGER: DRIFT ${head} findings=${findings.length} first=${findings[0].replace(' ', ':')}`); return { code: 1, lines: out }; }
  out.push(`ROUTED_LEDGER: CLEAN ${head}`);
  return { code: 0, lines: out };
}

function main(argv) {
  const opts = { root: process.cwd(), ledger: LEDGER_DEFAULT, from: FROM_DEFAULT, to: null };
  for (let i = 0; i < argv.length; i += 1) {
    const val = () => { const v = argv[i + 1]; i += 1; return v; };
    if (argv[i] === '--root') opts.root = resolve(val());
    else if (argv[i] === '--ledger') opts.ledger = val();
    else if (argv[i] === '--from') opts.from = Number(val());
    else if (argv[i] === '--to') opts.to = Number(val());
    else return (process.stdout.write(`ROUTED_LEDGER: USAGE unknown ${argv[i]}\n`), 64);
  }
  if (!existsSync(opts.root)) { process.stdout.write(`ROUTED_LEDGER: FAIL-CLOSED reason=root-absent\n`); return 2; }
  const r = evaluate(opts);
  process.stdout.write(`${r.lines.join('\n')}\n`);
  return r.code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
