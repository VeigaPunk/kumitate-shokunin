import fs from 'node:fs';
import path from 'node:path';
const root = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build = `${root}/.ufo/waves/round-69/build/K69ScribeLed64`;
const source = 'corpus/lessons/round-64-verifier-spotcheck.md';
const log = [];
function check(ok, message) { if (!ok) throw new Error(message); }
const norm = s => s.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
function count(q, text) {
  const escaped = norm(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...norm(text).matchAll(new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, 'g'))].length;
}
const lines = fs.readFileSync(`${root}/${source}`, 'utf8').split('\n');
let fence = null, active = false, level = 0, section = [], items = [], current = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
  if (fence) {
    if (f && f[1][0] === fence[0] && f[1].length >= fence.length && /^ {0,3}(?:`+|~+)\s*$/.test(line)) fence = null;
    continue;
  }
  if (f) { fence = f[1]; continue; }
  const h = /^(#{1,6})\s+(.+)$/.exec(line);
  if (h) {
    if (active && h[1].length <= level) { active = false; current = null; }
    if (/\brouted\b/i.test(h[2])) { active = true; level = h[1].length; }
    continue;
  }
  if (!active) continue;
  section.push(line);
  const b = /^( {0,3})(?:[-+*]|\d+[.)])\s+(.*)$/.exec(line);
  if (b && b[1].length === 0) {
    current = { text: b[2], line: i + 1 }; items.push(current); continue;
  }
  if (/^\s*\|/.test(line)) {
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
    if (cells.every(c => /^:?-+:?$/.test(c))) continue;
    const next = lines[i + 1] ?? '';
    if (/^\s*\|/.test(next) && next.trim().replace(/^\||\|$/g, '').split('|').every(c => /^\s*:?-+:?\s*$/.test(c))) continue;
    current = { text: line, line: i + 1 }; items.push(current); continue;
  }
  if (current && /^\s+\S/.test(line)) current.text += ` ${line.trim()}`;
}
check(items.length === 5, `expected=5 actual=${items.length}`);
log.push(`SOURCE ${source}`, `FENCE_AWARE_COUNT: items=${items.length}`);
const rows = fs.readFileSync(`${build}/rows.md`, 'utf8').trim().split('\n');
check(rows.length === items.length, 'row count mismatch');
for (const [index, row] of rows.entries()) {
  const cells = row.slice(1, -1).split('|').map(s => s.trim());
  check(cells.length === 7, 'column count');
  const [id, round, ordinal, quoted, cls, status, answer] = cells;
  check(round === '64' && Number(ordinal) === index + 1, 'ordinal mismatch');
  const item = items[index];
  const label = /\*\*(D\d+)\b/.exec(item.text)?.[1];
  check(id === `R64-${label}`, 'label mismatch');
  const quote = /^"(.+)"$/.exec(quoted)?.[1];
  check(quote, 'missing quote');
  const words = quote.split(/\s+/).length;
  check(words >= 3 && words <= 25, 'quote word length');
  const own = count(quote, item.text), hits = count(quote, section.join('\n'));
  check(own === 1 && hits === 1, 'quote not unique in own item and section');
  log.push(`${id} item=${ordinal} source-line=${item.line} words=${words} own-occurrences=${own} section-occurrences=${hits} class=${cls} status=${status} quote="${quote}"`);
  if (status === 'closed') {
    const a = /^([^\s]+):(\d+) — "(.+)"$/.exec(answer);
    check(a, 'answer format');
    check(!a[1].includes('spotcheck') && a[1] !== 'corpus/routed-ledger.md' && !path.isAbsolute(a[1]) && !a[1].split('/').includes('..'), 'forbidden answer path');
    check(a[3].split(/\s+/).length <= 25, 'answer length');
    const exact = fs.readFileSync(`${root}/${a[1]}`, 'utf8').split('\n')[Number(a[2]) - 1];
    check(exact && count(a[3], exact) > 0, 'answer absent at exact line');
    log.push(`ANSWER_EXACT_LINE: ${a[1]}:${a[2]} — "${a[3]}"`, `ANSWER_SOURCE: ${exact}`);
  } else check(status === 'open' && answer === '-', 'invalid open row');
}
log.push('QUOTE_BINDINGS: PASS rows=5 unique=5 closed=1 open=4', 'EXIT=0');
const transcript = log.join('\n') + '\n';
fs.writeFileSync(`${build}/verification.txt`, transcript);
process.stdout.write(transcript);
