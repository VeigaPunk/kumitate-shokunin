#!/usr/bin/env node
// K97Scout: does source-dupes.mjs's own section reader agree with the census?
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = '/fast/scratch/hyaku/kumitate-r97/K97Scout/matrix';
const cases = fs.readdirSync(W).filter((f) => f.endsWith('.md')).sort();

function loadRows(raw) { // source-dupes.mjs loadRows, verbatim logic
  const rows = [];
  let inRegistry = false, seenRegistry = false;
  for (const line0 of raw.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line0)) {
      const h = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim();
      inRegistry = h === 'Registry';
      if (inRegistry) seenRegistry = true;
      continue;
    }
    if (/^ {0,3}#[ \t]/.test(line0)) { inRegistry = false; continue; }
    if (!inRegistry || !/^ {0,3}\|/.test(line0)) continue;
    const cells = line0.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
    if (cells.length !== 13) continue;
    rows.push(cells[1]);
  }
  return { rows, seenRegistry };
}

console.log('case\tsource-dupes_rows\tcensus_rows\tagree');
for (const c of cases) {
  const raw = fs.readFileSync(`${W}/${c}`, 'utf8');
  const sd = loadRows(raw);
  const out = execFileSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
    'census', '--file', `${W}/${c}`], { encoding: 'utf8' });
  const m = out.match(/^file\trows\t(\d+)$/m);
  const cr = Number(m[1]);
  console.log(`${c.replace('.md', '')}\t${sd.rows.length}\t${cr}\t${sd.rows.length === cr ? 'yes' : 'NO'}`);
}
