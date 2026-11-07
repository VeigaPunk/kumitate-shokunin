#!/usr/bin/env node
// K97Scout: compare every SOURCES *section* reader in the lane against the census
// grammar, on the class matrix fixtures. Reads only.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const W = '/fast/scratch/hyaku/kumitate-r97/K97Scout/matrix';

// --- readers, one per lane script ---
const READERS = {
  'sources-check(BASE)': (text) => {
    const norm = (l) => l.replace(/^ {1,3}(?=\S)/u, '');
    const lines = text.split(/\r?\n/).map(norm);
    let a = null;
    for (const l of lines) { const m = /^## (.+?)\s*$/.exec(l); if (m) a = m[1]; else if (/^#(?:\s|$)/.test(l)) a = null; }
    return a === 'Registry';
  },
  'round-gate(R96)': (text) => {
    let inReg = false;
    for (const line of text.split('\n')) {
      if (/^ {0,3}##[ \t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '') === 'Registry'; continue; }
      if (/^ {0,3}#[ \t]/.test(line)) { inReg = false; continue; }
    }
    return inReg;
  },
  'source-dupes': (text) => {
    let inRegistry = false, seen = false;
    for (const line0 of text.split('\n')) {
      if (/^ {0,3}##[ \t]/.test(line0)) {
        const h = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim();
        inRegistry = h === 'Registry'; if (inRegistry) seen = true; continue;
      }
      if (/^ {0,3}#[ \t]/.test(line0)) { inRegistry = false; continue; }
    }
    return seen && inRegistry;
  },
  'census(gawk model)': (text) => {
    let inReg = false;
    for (const line of text.split('\n')) {
      if (/^ {0,3}##[ \t]/.test(line)) { inReg = line.replace(/^ {0,3}/, '').slice(3).replace(/^[ \t]+/, '').replace(/[ \t]+$/, '') === 'Registry'; continue; }
      if (/^ {0,3}#[ \t]/.test(line)) { inReg = false; continue; }
    }
    return inReg;
  },
};

const cases = readdirSync(W).filter((f) => f.endsWith('.md')).sort();
const head = ['case', ...Object.keys(READERS)];
const rows = [head.join('\t')];
for (const c of cases) {
  const text = readFileSync(join(W, c), 'utf8');
  rows.push([c.replace(/\.md$/, ''), ...Object.values(READERS).map((r) => (r(text) ? 'yes' : 'no'))].join('\t'));
}
console.log(rows.join('\n'));
