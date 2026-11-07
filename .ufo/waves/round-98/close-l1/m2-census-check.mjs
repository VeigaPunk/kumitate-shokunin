#!/usr/bin/env node
// m2-census-check.mjs <scratch dir> — rebuild the SOURCES.md bytes of M2 arms (xxx)/(xxxi) and read them with the
// live fleet census: prints census W03 (inside rows read), E12 (outside ids), E01/E02 lines, so the arms' expected
// declared/outside/malformed sets are the census reading, not the L1's.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const S = process.argv[2]; mkdirSync(S, { recursive: true });
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const pin40 = (h) => h.repeat(5);
const row = (lead, id, trail, pin) => `|${lead}${id}${trail}| x.ts — https://github.com/o/r/blob/${pin}/x.ts | code | A | scope | anchor | teaches | mined | 2026-11-07 | 30d | — |`;
const HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |', '|---|---|---|---|---|---|---|---|---|---|---|'];
const x = ['e0000001', 'e0000002', 'e0000003', 'e0000004', 'e0000005', 'e0000006', 'e0000007', 'e0000008', 'e0000009', 'e0000010', 'e0000011', 'e0000012', 'e0000013', 'e0000014', 'e0000015', 'e0000016'].map(pin40);
const fx = {
  'xxx': ['# SOURCES — fixture r98 pad length, id length, exotic pads', '', '## Registry', '', ...HDR,
    row('', 'S301', '', x[0]), row('', 'S302', ' ', x[1]), row(' ', 'S303', '', x[2]), row('    ', 'S304', ' ', x[3]),
    row(' ', 'S305', '\t\t\t\t', x[4]), row('        ', 'S306', '        ', x[5]), row(' ', 'S30712345', ' ', x[6]),
    row(' ', 'S308000000001', ' ', x[7]), row('\u00ad', 'S309', ' ', x[8]), row(' ', 'S310', '\u200e', x[9]),
    row('\u0008', 'S311', ' ', x[10]), row(' ', 'S312', '\u3164', x[11]), '', '## Leads (unopened)', '',
    row('', 'S401', '', x[12]), row('    ', 'S402', '\t\t\t\t', x[13]), row(' ', 'S40312345', ' ', x[14]),
    row('\u00ad', 'S404', ' ', x[15]), ''],
  'xxxi': ['\ufeff## Registry', '', ...HDR, row(' ', 'S501', ' ', pin40('f0000001')), row(' ', 'S502', ' ', pin40('f0000002')), ''],
};
for (const [k, lines] of Object.entries(fx)) {
  const f = join(S, `${k}.md`); writeFileSync(f, lines.join('\n'));
  const c = spawnSync('bash', [CENSUS, 'validate', '--file', f, '--today', '2026-11-07'], { encoding: 'utf8' });
  const keep = c.stdout.split('\n').filter((l) => /\t(W03|E12|E01|E02)\t/.test(l)).map((l) => JSON.stringify(l));
  console.log(`== arm (${k}) census exit=${c.status}`);
  for (const l of keep) console.log(l);
}
