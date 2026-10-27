#!/usr/bin/env node
/* Harness 3:
 * (a) tool parser vs the FROZEN counter's own parser on the same ledger rows;
 * (b) the tool binding every REAL routed item of rounds 55..65 (57 items at base). */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const TOOL = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/fx3';

/* ---- the frozen counter's own parsers, copied verbatim from
 * .ufo/waves/round-66/probe/ledger66-probe.mjs (lines 68-113) ---- */
const normC = (s) => String(s)
  .replace(/<[^>]+>/g, ' ')
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
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

const out = [];

/* ---- (a) counter parser vs tool parser on the same rows ---- */
const ROWSETS = {
  'row without trailing pipe': '| R7-D1 | 7 | 1 | "the readme row is missing" | reference-drift | closed | `notes/answers.md:3` — "the readme row and its pin landed"',
  'row with escaped pipe in the quote cell': '| R7-D1 | 7 | 1 | "the readme row is missing \\| the map reads DRIFT" | reference-drift | closed | `notes/answers.md:3` — "the readme row and its pin landed" |',
  'row with curly-quoted quote cell': '| R7-D1 | 7 | 1 | “the readme row is missing” | reference-drift | closed | `notes/answers.md:3` — "the readme row and its pin landed" |',
};
for (const [name, row] of Object.entries(ROWSETS)) {
  const text = ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', row, ''].join('\n');
  const crows = ledgerParse(text);
  out.push({ name: `counter parser on ${name}`, rows: crows.map((r) => (r.bad ? `BAD(cells!=7)@${r.line}` : `id=${r.id} status=${r.status} answer=${JSON.stringify(r.answer)} quote=${JSON.stringify(r.quote)}`)) });
}

/* ---- (b) bind every REAL routed item of rounds 55..65 ---- */
const tool = await import(`file://${TOOL}`);
const items = [];
for (let n = 55; n <= 65; n += 1) {
  const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
  const txt = readFileSync(p, 'utf8');
  const t = tool.routedItems(txt);
  const c = items66(txt);
  items.push({ n, toolItems: t.items.length, toolFound: t.found, counterItems: c === null ? null : c.length, same: JSON.stringify(t.items) === JSON.stringify(c) });
}
out.push({ name: 'real rounds 55..65: tool items vs counter items', rows: items });

// build a ledger that binds every real item with its first 5 words
rmSync(ROOT, { recursive: true, force: true });
mkdirSync(join(ROOT, 'corpus', 'lessons'), { recursive: true });
mkdirSync(join(ROOT, 'notes'), { recursive: true });
const rows = [];
for (let n = 55; n <= 65; n += 1) {
  const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
  const txt = readFileSync(p, 'utf8');
  const t = tool.routedItems(txt);
  writeFileSync(join(ROOT, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), txt);
  t.items.forEach((it, i) => {
    const flat = tool.norm(it);
    const q = flat.split(' ').slice(0, 5).join(' ');
    rows.push(`| R${n}-I${i + 1} | ${n} | ${i + 1} | "${q}" | class-${(i % 3) + 1} | open | - |`);
  });
}
writeFileSync(join(ROOT, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
writeFileSync(join(ROOT, 'notes', 'a.md'), 'x\n');
const r = spawnSync('node', [TOOL, '--root', ROOT, '--from', '55', '--to', '65'], { encoding: 'utf8' });
out.push({ name: 'tool binding every REAL item of rounds 55..65', rows: [`exit=${r.status}`, (r.stdout || '').trim().split('\n').filter((l) => l.startsWith('FINDING') || l.startsWith('ROUTED_LEDGER')).slice(0, 12).join('\n')] });

console.log(JSON.stringify(out, null, 1));
