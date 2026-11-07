#!/usr/bin/env node
// K97Scout: LIVE census vs the round-gate.mjs (R96) section reader on the class matrix.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = '/fast/scratch/hyaku/kumitate-r97/K97Scout/matrix';
const cases = fs.readdirSync(W).filter((f) => f.endsWith('.md')).sort();

function rgInRegistry(text) { // round-gate.mjs declaredPins, section logic verbatim
  let inReg = false;
  for (const line of text.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '') === 'Registry'; continue; }
    if (/^ {0,3}#[ \t]/.test(line)) { inReg = false; continue; }
  }
  return inReg;
}

console.log('case\tround-gate_R96_inRegistry\tcensus_E12_ids\tcensus_says_outside\tagree');
let bad = 0;
for (const c of cases) {
  const raw = fs.readFileSync(`${W}/${c}`, 'utf8');
  const rg = rgInRegistry(raw);
  let out;
  try {
    out = execFileSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
      'validate', '--file', `${W}/${c}`], { encoding: 'utf8' });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  const e12 = out.split('\n').filter((l) => l.split('\t')[1] === 'E12').map((l) => l.split('\t')[2].split(' ')[0]);
  const outside = e12.length > 0;
  const agree = rg === !outside;
  if (!agree) bad += 1;
  console.log(`${c.replace('.md', '')}\t${rg ? 'yes' : 'no'}\t${e12.join(',') || '<none>'}\t${outside ? 'yes' : 'no'}\t${agree ? 'yes' : 'NO'}`);
}
console.log(`\nround-gate(R96) vs live census disagreements: ${bad} of ${cases.length}`);
