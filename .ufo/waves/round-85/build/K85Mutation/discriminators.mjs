#!/usr/bin/env node
// Prove each surviving mutant is NOT a semantically equivalent mutant: run the
// reference and the survivor over an uncovered input where the contract is
// explicit and the frozen 20-case table has no fixture.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const BUILD = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85Mutation';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r85/K85Mutation/disc';
const rev = '9db0c6b5eb9111cfc5581006ba976ca2cd112792';
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
const cases = [
  {
    id: 'S01', name: 'absent-declared-rendered-0',
    contract: 'SOURCE line must render declared=absent when --src has no ARMS declaration (v2 contract: declared=<n|absent>)',
    receipt: three,
    src: "arm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n",
  },
  {
    id: 'S02', name: 'first-arms-declaration-wins',
    contract: 'source extraction takes the LAST const|let|var ARMS = <int> (v2 contract, frozen plan)',
    receipt: three,
    src: "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\nconst ARMS = 3;\narm('c', () => {});\n",
  },
  {
    id: 'S03', name: 'colon-metadata-not-ignored',
    contract: 'metadata command:/rev:/exit: lines are ignored, never parsed as arm rows (v2 contract, unchanged v1 grammar)',
    receipt: 'command: arm a ok\nX arm a ok\nX arm b ok\nX: HELD held=2/2\n',
    src: undefined,
  },
];

const run = (tool, file, srcFile) => {
  const argv = ['--receipt', file];
  if (srcFile) argv.push('--src', srcFile);
  const r = spawnSync(process.execPath, [tool, ...argv], { encoding: 'utf8', timeout: 10000 });
  return { exit: r.status, out: ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd().split('\n') };
};

const blocks = [`# K85Mutation — survivor discriminators (round 85 C1)`, `revision: ${rev}`, `purpose: show each survivor changes behaviour on input the frozen 20-case table never builds, i.e. it is a coverage finding, not an equivalent mutant.`, ''];
for (const c of cases) {
  const file = join(SCRATCH, `${c.id}.receipt.txt`);
  writeFileSync(file, c.receipt);
  const srcFile = c.src === undefined ? null : join(SCRATCH, `${c.id}.src.mjs`);
  if (srcFile) writeFileSync(srcFile, c.src);
  const ref = run(join(BUILD, 'ref/scripts/counter-receipt.mjs'), file, srcFile);
  const mut = run(join(BUILD, 'mutants', `${c.id}-${c.name}/scripts/counter-receipt.mjs`), file, srcFile);
  const differs = ref.exit !== mut.exit || ref.out.join('\n') !== mut.out.join('\n');
  blocks.push(
    `## ${c.id} ${c.name}`,
    `contract clause: ${c.contract}`,
    `command: node <BUILD>/{ref,mutants/${c.id}-${c.name}}/scripts/counter-receipt.mjs --receipt ${file}${srcFile ? ` --src ${srcFile}` : ''}`,
    `fixture receipt: ${JSON.stringify(c.receipt)}`,
    c.src === undefined ? 'fixture src: (none)' : `fixture src: ${JSON.stringify(c.src)}`,
    `ref exit=${ref.exit} out=${JSON.stringify(ref.out)}`,
    `mutant exit=${mut.exit} out=${JSON.stringify(mut.out)}`,
    `non_equivalent: ${differs}`,
    '',
  );
  console.log(`${c.id} ${c.name}: ref_exit=${ref.exit} mutant_exit=${mut.exit} differs=${differs}`);
}
writeFileSync(join(BUILD, 'receipts/survivor-discriminators.txt'), blocks.join('\n'));
rmSync(SCRATCH, { recursive: true, force: true });
