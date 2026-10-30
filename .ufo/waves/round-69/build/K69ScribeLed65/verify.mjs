import fs from 'node:fs';
import path from 'node:path';
const root = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const build = path.join(root, '.ufo/waves/round-69/build/K69ScribeLed65');
const source = 'corpus/lessons/round-65-verifier-spotcheck.md';
const lines = fs.readFileSync(path.join(root, source), 'utf8').split('\n');
const items = []; let active = false, fence = null, current = null;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const fm = line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if (fm) {
    if (!fence) fence = { char: fm[1][0], length: fm[1].length };
    else if (fm[1][0] === fence.char && fm[1].length >= fence.length && /^\s*[`~]+\s*$/.test(line)) fence = null;
    continue;
  }
  if (fence) continue;
  if (/^## /.test(line)) { if (active) break; active = /Routed defects/.test(line); continue; }
  if (!active || !line.trim()) continue;
  if (/^(?:[-+*]|\d+[.)])\s+/.test(line)) { current = { line: i + 1, text: line }; items.push(current); }
  else if (/^\s*\|/.test(line)) {
    const cells = line.trim().slice(1, -1).split('|').map(x => x.trim());
    if (cells.every(x => /^:?-+:?$/.test(x))) continue;
    if (/^\s*\|/.test(lines[i + 1] ?? '') && (lines[i + 1].match(/-/g) ?? []).length >= 3) continue;
    current = { line: i + 1, text: line }; items.push(current);
  } else if (current && /^\s+\S/.test(line)) current.text += '\n' + line;
}
function count(text, quote) {
  const escaped = quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return [...text.matchAll(new RegExp('(?<![\\p{L}\\p{N}_])' + escaped + '(?![\\p{L}\\p{N}_])', 'gu'))].length;
}
const rows = fs.readFileSync(path.join(build, 'rows.md'), 'utf8').trim().split('\n');
const out = [`AXES: operability; binding accuracy; routed-item completeness; honest closure`, `SOURCE: ${source}`, `FENCE_AWARE_ITEMS: ${items.length}`, `ROWS: ${rows.length}`];
if (items.length !== 7 || rows.length !== 7) throw Error('count mismatch');
for (let i = 0; i < rows.length; i++) {
  const cells = rows[i].split('|').slice(1, -1).map(x => x.trim());
  const [id, round, ordinal, quoted, cls, status, answer] = cells;
  const quote = quoted.slice(1, -1), words = quote.split(/\s+/).length;
  const own = count(items[i].text, quote), section = items.reduce((n, it) => n + count(it.text, quote), 0);
  if (id !== `R65-D${i + 1}` || round !== '65' || +ordinal !== i + 1 || !items[i].text.includes(`**D${i + 1} —`) || words < 3 || words > 25 || own !== 1 || section !== 1) throw Error(`binding failed: ${id}`);
  out.push(`${id} item=${i + 1} source-line=${items[i].line} words=${words} item-occurrences=${own} section-occurrences=${section} class=${cls} status=${status} quote=${quoted}`);
  if (status === 'open') { if (answer !== '-') throw Error('open answer'); continue; }
  const match = answer.match(/^(.+):(\d+) — "(.+)"$/);
  if (!match || /spotcheck|routed-ledger/.test(match[1]) || path.isAbsolute(match[1]) || match[1].split('/').includes('..')) throw Error('unsafe answer');
  const actual = fs.readFileSync(path.join(root, match[1]), 'utf8').split('\n')[+match[2] - 1];
  if (!actual || count(actual, match[3]) < 1) throw Error('answer quote missing');
  out.push(`ANSWER ${match[1]}:${match[2]} located=${JSON.stringify(match[3])}`, `ANSWER_LINE ${actual}`);
}
out.push('QUOTE_BINDINGS: PASS (7/7); ANSWER_BINDINGS: PASS (1/1)');
const transcript = out.join('\n') + '\n';
fs.writeFileSync(path.join(build, 'verification.txt'), transcript);
process.stdout.write(transcript);
