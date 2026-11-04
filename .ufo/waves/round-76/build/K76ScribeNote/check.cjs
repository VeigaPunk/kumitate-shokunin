const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const code = fs.readFileSync(path.join(root, 'lane/scripts/omp-census.mjs'), 'utf8');
const existing = fs.readFileSync(path.join(root, 'lane/corpus/knowledge/omp-agent-root.md'), 'utf8');
const section = fs.readFileSync(path.join(root, 'section.md'), 'utf8');
function declarations(table, field) {
  const body = code.split(`const ${table} = [`)[1].split('\n];')[0];
  return [...body.matchAll(new RegExp(`^\\s*\\{ ${field}: '([^']+)'`, 'gm'))].map(m => m[1]);
}
const bases = declarations('BASE_MEMBERS', 'name');
const chains = declarations('CHAIN_FAMILIES', 'id');
const names = [...bases, ...chains];
const visible = (existing + '\n' + section).replace(/<!--[\s\S]*?-->/gu, '\n');
const BIND_EDGE = '[^\\w.\\-]';
function bindsName(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return new RegExp(`(?:^|${BIND_EDGE})${escaped}(?:$|${BIND_EDGE})`, 'u').test(text);
}
console.log('revision=cabc7aefd5f1562299f757e23207710c12e4ed58');
console.log(`BASE_MEMBERS=${bases.length} CHAIN_FAMILIES=${chains.length} DECLARED_NAMES=${names.length}`);
const missing = names.filter(name => !bindsName(visible, name));
for (const name of names) console.log(`${bindsName(visible, name) ? 'BOUND' : 'UNBOUND'} ${name}`);
console.log(`bound=${names.length - missing.length}/${names.length} missing=${missing.join(',') || 'none'}`);
const lines = section.trimEnd().split('\n');
const rows = lines.filter(line => line.startsWith('|'));
console.log(`section_lines=${lines.length} index_rows=${rows.length - 2} table_separator_counts=${[...new Set(rows.map(line => (line.match(/\|/g) || []).length))].join(',')}`);
if (missing.length || names.length !== 35 || lines.length > 60 || rows.length !== 37 || rows.some(line => (line.match(/\|/g) || []).length !== 4)) process.exitCode = 1;
