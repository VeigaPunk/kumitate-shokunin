import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
const [base, out] = process.argv.slice(2);
if (!base || !out) throw Error('usage: node attack.mjs <extracted-base> <artifact-dir>');
const probe = readFileSync(join(base, '.ufo/waves/round-69/probe/deprec69-probe.mjs'), 'utf8');
const entry = readFileSync(join(base, 'corpus/knowledge/mcp-deprecation-registry.md'), 'utf8');
const capture = readFileSync(join(base, '.ufo/waves/round-68/build/K68ScribeEntry/captures/S207-deprecated-2026-07-28.md'), 'utf8');
const lines = probe.split('\n');
// Exact frozen executable slices, not a rewritten parser or counter.
const helpers = [lines[160], ...lines.slice(177, 185), ...lines.slice(305, 322)].join('\n');
const m6 = lines.slice(324, 359).join('\n');
const context = vm.createContext({ entryText: entry, captureOf: { S207: capture } });
vm.runInContext(`${helpers}\nglobalThis.snapshot = section(entryText, 'Registry snapshot'); globalThis.capRows = tableOf(captureOf.S207);`, context);
const snap = context.snapshot;
const tableLines = snap.split('\n').filter(l => l.startsWith('|'));
const header = tableLines[0];
const delimiter = tableLines[1];
const data = tableLines.slice(2);
const replace = text => entry.replace(snap, '\n' + text + '\n');
const variants = [
  ['real-base', entry],
  ['delimiter-trailing-spaces', entry.replace(delimiter, delimiter + '   ')],
  ['two-column-aligned-delimiter', entry.replace(delimiter, '| --- | :---: |')],
  ['insert-single-dash-data-row', replace([...tableLines, '| - | - |'].join('\n'))],
  ['lowercase-header', entry.replace(header, header.replace('Feature', 'feature'))],
  ['eleven-column-data-five-column-header', replace([header, delimiter, ...data.map(l => l + ' extra | extra | extra | extra | extra | extra |')].join('\n'))],
  ['eleven-column-table', replace(tableLines.map((l, i) => l + (i === 1 ? '---|---|---|---|---|---|' : ' extra | extra | extra | extra | extra | extra |')).join('\n'))],
  ['missing-delimiter', entry.replace(delimiter + '\n', '')],
  ['four-column-data', replace([header, delimiter, ...data.map(l => l.split('|').slice(0, -2).join('|') + '|')].join('\n'))],
];
mkdirSync(out, { recursive: true });
const output = [];
output.push('FREEZE 9401d8655970d542b81d318bdad558d6dea39397');
output.push('EXACT_SLICES delink=161 section=178..185 tableOf=306..322 M6=325..359');
output.push(`CAPTURE rows=${context.capRows.length} widths=${context.capRows.map(r => r.length).join(',')}`);
output.push(`SINGLE_DASH_REGEX ${/^:?-+:?$/.test('-')}`);
for (const [name, text] of variants) {
  let result;
  const ctx = vm.createContext({ entryText: text, captureOf: { S207: capture }, check: (id, ok, why) => { result = { id, ok, why }; } });
  vm.runInContext(`${helpers}\n${m6}`, ctx);
  const line = `${name}: ${result.id} ${result.ok ? 'PASS' : 'MISS'} ${result.why}`;
  output.push(line);
  writeFileSync(join(out, `${name}.md`), text);
}
writeFileSync(join(out, 'frozen-M6-executable.txt'), helpers + '\n' + m6 + '\n');
writeFileSync(join(out, 'base-S207-capture.md'), capture);
writeFileSync(join(out, 'results.txt'), output.join('\n') + '\n');
console.log(output.join('\n'));
