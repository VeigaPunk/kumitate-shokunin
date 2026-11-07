#!/usr/bin/env node
// K97Scout: LIVE census vs the source-dupes.mjs section reader, on the class matrix.
// Census truth = the live census E12 id list (a row outside the Registry) vs the
// source-dupes reader's in-Registry decision on the same file.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = '/fast/scratch/hyaku/kumitate-r97/K97Scout/matrix';
const cases = fs.readdirSync(W).filter((f) => f.endsWith('.md')).sort();

function sdInRegistry(raw) { // source-dupes.mjs loadRows, section logic only
  let inRegistry = false;
  for (const line0 of raw.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line0)) {
      const h = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim();
      inRegistry = h === 'Registry';
      continue;
    }
    if (/^ {0,3}#[ \t]/.test(line0)) { inRegistry = false; continue; }
  }
  return inRegistry;
}

console.log('case\tsource-dupes_inRegistry\tcensus_E12_ids\tcensus_says_outside\tagree');
let bad = 0;
for (const c of cases) {
  const raw = fs.readFileSync(`${W}/${c}`, 'utf8');
  const sd = sdInRegistry(raw);
  let out;
  try {
    out = execFileSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
      'validate', '--file', `${W}/${c}`], { encoding: 'utf8' });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');   // census exits 1 on E12 findings
  }
  const e12 = out.split('\n').filter((l) => l.split('\t')[1] === 'E12')
    .map((l) => l.split('\t')[2].split(' ')[0]);
  const censusOutside = e12.length > 0;   // the fixture's S001 row is outside the Registry
  const agree = (sd === !censusOutside);
  if (!agree) bad += 1;
  console.log(`${c.replace('.md', '')}\t${sd ? 'yes' : 'no'}\t${e12.join(',') || '<none>'}\t${censusOutside ? 'yes' : 'no'}\t${agree ? 'yes' : 'NO'}`);
}
console.log(`\nsource-dupes vs live census disagreements: ${bad} of ${cases.length}`);
