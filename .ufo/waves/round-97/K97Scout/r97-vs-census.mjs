#!/usr/bin/env node
// K97Scout: does the FROZEN rule R97 reproduce the LIVE census's in-Registry decision
// on every grammar class? R97 (from plan.md):
//   sourceText.split('\n')                      (CR KEPT)
//   ^ {0,3}##[ \t]  -> section = text after first '##' (leading 0-3 spaces removed),
//                       stripped of leading/trailing SPACES AND TABS ONLY
//   ^ {0,3}#[ \t]   -> section = null
//   otherwise        -> section unchanged
//   in Registry iff section === 'Registry'
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const W = '/fast/scratch/hyaku/kumitate-r97/K97Scout/matrix';

function r97(text) {
  let section = null;
  for (const line of text.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line)) {
      let rest = line.replace(/^ {0,3}/, '').slice(2);   // after the first '##'
      rest = rest.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
      section = rest;
      continue;
    }
    if (/^ {0,3}#[ \t]/.test(line)) { section = null; continue; }
  }
  return section === 'Registry';
}

const cases = readdirSync(W).filter((f) => f.endsWith('.md')).sort();
let bad = 0;
const rows = [['case', 'R97', 'census(live)']];
for (const c of cases) {
  const text = readFileSync(join(W, c), 'utf8');
  const a = r97(text);
  const b = process.argv[2] === 'live'
    ? (() => {
        const out = execFileSync('bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh',
          'census', '--file', join(W, c)], { encoding: 'utf8' });
        const m = out.match(/^file\trows\t(\d+)$/m);
        return Number(m[1]) > 0;
      })()
    : null;
  rows.push([c.replace(/\.md$/, ''), a ? 'yes' : 'no', b === null ? '-' : (b ? 'yes' : 'no')]);
  if (b !== null && a !== b) bad += 1;
}
console.log(rows.map((r) => r.join('\t')).join('\n'));
console.log(`\nR97 vs live census disagreements: ${bad} of ${cases.length}`);
