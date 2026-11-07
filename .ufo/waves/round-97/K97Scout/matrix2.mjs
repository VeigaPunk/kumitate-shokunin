#!/usr/bin/env node
// K97Scout: post-Registry heading classes — a heading line AFTER a `## Registry` line.
// The census's `^ {0,3}#[ \t]` requires a space/tab after '#', so a BARE '#' does NOT
// clear the section; BASE's `^#(?:\s|$)` DOES clear on a bare '#'. Same for '## '.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const W = '/fast/scratch/hyaku/kumitate-r97/K97Scout/matrix2';
const cases = fs.readdirSync(W).filter((f) => f.endsWith('.md')).sort();

const READERS = {
  'sources-check(BASE)': (text) => {
    const norm = (l) => l.replace(/^ {1,3}(?=\S)/u, '');
    let a = null;
    for (const l of text.split(/\r?\n/).map(norm)) {
      const m = /^## (.+?)\s*$/.exec(l); if (m) a = m[1]; else if (/^#(?:\s|$)/.test(l)) a = null;
    }
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
    let inRegistry = false;
    for (const line0 of text.split('\n')) {
      if (/^ {0,3}##[ \t]/.test(line0)) { inRegistry = line0.replace(/^ {0,3}/, '').replace(/^##[ \t]+/, '').trim() === 'Registry'; continue; }
      if (/^ {0,3}#[ \t]/.test(line0)) { inRegistry = false; continue; }
    }
    return inRegistry;
  },
  'R97(frozen rule)': (text) => {
    let section = null;
    for (const line of text.split('\n')) {
      if (/^ {0,3}##[ \t]/.test(line)) {
        let rest = line.replace(/^ {0,3}/, '').slice(2).replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
        section = rest; continue;
      }
      if (/^ {0,3}#[ \t]/.test(line)) { section = null; continue; }
    }
    return section === 'Registry';
  },
};

console.log(['case', ...Object.keys(READERS), 'census_says_outside'].join('\t'));
for (const c of cases) {
  const raw = fs.readFileSync(`${W}/${c}`, 'utf8');
  let out;
  try {
    out = execFileSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
      'validate', '--file', `${W}/${c}`], { encoding: 'utf8' });
  } catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  const e12 = out.split('\n').filter((l) => l.split('\t')[1] === 'E12').map((l) => l.split('\t')[2].split(' ')[0]);
  const outside = e12.length > 0;
  const cols = Object.values(READERS).map((r) => (r(raw) ? 'yes' : 'no'));
  const agree = cols.every((v) => (v === 'yes') === !outside);
  console.log([c.replace('.md', ''), ...cols, outside ? `yes(${e12.join(',')})` : 'no', agree ? 'AGREE' : '*** DISAGREE ***'].join('\t'));
}
