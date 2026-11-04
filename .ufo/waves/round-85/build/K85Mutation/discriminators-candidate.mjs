#!/usr/bin/env node
// Candidate survivor discriminators + selftest reach: prove the three survivors
// change behaviour on contract clauses the frozen 20-case table never builds,
// and record whether the candidate's own --selftest would have caught them.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const BUILD = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85Mutation';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r85/K85Mutation/cdisc';
const REV = '9db0c6b5eb9111cfc5581006ba976ca2cd112792';
rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

const three = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
const cases = [
  { id: 'S01', name: 'absent-declared-rendered-0', clause: 'SOURCE line renders declared=absent when --src has no ARMS declaration', receipt: three, src: "arm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n" },
  { id: 'S02', name: 'first-arms-declaration-wins', clause: 'source extraction takes the LAST const|let|var ARMS = <int>', receipt: three, src: "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\nconst ARMS = 3;\narm('c', () => {});\n" },
  { id: 'S03', name: 'colon-metadata-not-ignored', clause: 'command:/rev:/exit: metadata lines are ignored, never parsed as arm rows', receipt: 'command: arm a ok\nX arm a ok\nX arm b ok\nX: HELD held=2/2\n', src: undefined },
];
const run = (tool, file, srcFile) => {
  const argv = ['--receipt', file];
  if (srcFile) argv.push('--src', srcFile);
  const r = spawnSync(process.execPath, [tool, ...argv], { encoding: 'utf8', timeout: 10000 });
  return { exit: r.status, out: ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd().split('\n') };
};
const selftest = (tool) => {
  const r = spawnSync(process.execPath, [tool, '--selftest', '--work', join(SCRATCH, 'selftest')], { encoding: 'utf8', timeout: 30000 });
  const out = ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd().split('\n');
  return { exit: r.status, summary: out.find((l) => l.startsWith('COUNTER_RECEIPT_SELFTEST:')) ?? '(none)', failed: out.filter((l) => /COUNTER_RECEIPT_SELFTEST arm \S+ FAIL/.test(l)).map((l) => l.split(' ')[2]) };
};

const blocks = [`# K85Mutation — candidate survivor discriminators and selftest reach`, `revision: ${REV}`, 'purpose: show each survivor is behaviour-bearing on an uncovered contract clause, and record whether the candidate\'s own selftest (not the claim denominator) would catch it.', ''];
const refTool = join(BUILD, 'candidate-ref/scripts/counter-receipt.mjs');
const refSelf = selftest(refTool);
blocks.push(`## candidate-ref --selftest`, `exit: ${refSelf.exit}`, `summary: ${refSelf.summary}`, '');
console.log(`candidate-ref selftest: exit=${refSelf.exit} ${refSelf.summary}`);
for (const c of cases) {
  const file = join(SCRATCH, `${c.id}.receipt.txt`);
  writeFileSync(file, c.receipt);
  const srcFile = c.src === undefined ? null : join(SCRATCH, `${c.id}.src.mjs`);
  if (srcFile) writeFileSync(srcFile, c.src);
  const mutTool = join(BUILD, 'mutants-candidate', `${c.id}-${c.name}/scripts/counter-receipt.mjs`);
  const ref = run(refTool, file, srcFile);
  const mut = run(mutTool, file, srcFile);
  const differs = ref.exit !== mut.exit || ref.out.join('\n') !== mut.out.join('\n');
  const self = selftest(mutTool);
  blocks.push(
    `## ${c.id} ${c.name}`,
    `contract clause: ${c.clause}`,
    `fixture receipt: ${JSON.stringify(c.receipt)}`,
    c.src === undefined ? 'fixture src: (none)' : `fixture src: ${JSON.stringify(c.src)}`,
    `candidate-ref exit=${ref.exit} out=${JSON.stringify(ref.out)}`,
    `mutant exit=${mut.exit} out=${JSON.stringify(mut.out)}`,
    `non_equivalent: ${differs}`,
    `mutant --selftest: exit=${self.exit} ${self.summary}${self.failed.length ? ` failed_arms=${self.failed.join(',')}` : ''}`,
    '',
  );
  console.log(`${c.id}: ref=${ref.exit} mutant=${mut.exit} differs=${differs} selftest=${self.exit} ${self.summary}`);
}
writeFileSync(join(BUILD, 'receipts-candidate/survivors.txt'), blocks.join('\n'));
rmSync(SCRATCH, { recursive: true, force: true });
