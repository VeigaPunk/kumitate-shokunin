#!/usr/bin/env node
// Finalize K85Mutation receipts: append unified diffs, score the frozen controls,
// measure the plan's real-task bytes, and write the build README.
import { readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const BUILD = `${LANE}/.ufo/waves/round-85/build/K85Mutation`;
const PROBE = `${LANE}/.ufo/waves/round-85/probe/probe85-c1.mjs`;
const REF = `${BUILD}/ref/scripts/counter-receipt.mjs`;
const REV = '9db0c6b5eb9111cfc5581006ba976ca2cd112792';
const WORK = '/fast/scratch/hyaku/kumitate-r85/K85Mutation/work/final';
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 60000 });
  return { exit: r.status, out: ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd() };
};

// 1. Append the exact unified diff to every mutant receipt so each receipt shows
//    its single change without opening the tree.
for (const dir of readdirSync(join(BUILD, 'mutants')).sort()) {
  const [id, ...rest] = dir.split('-');
  const name = rest.join('-');
  const receiptPath = join(BUILD, 'receipts', `${dir}.txt`);
  const diff = run('diff', ['-u', '--label', 'ref', '--label', `mutants/${dir}`, join(BUILD, 'ref/scripts/counter-receipt.mjs'), join(BUILD, 'mutants', dir, 'scripts/counter-receipt.mjs')]);
  const base = readFileSync(receiptPath, 'utf8').replace(/\n--- unified diff vs ref ---[\s\S]*$/, '');
  writeFileSync(receiptPath, `${base}\n--- unified diff vs ref ---\n${diff.out}\n`);
}

// 2. Frozen control classes, re-scored read-only for harness sanity.
const controls = ['base', 'stub', 'noreader'];
const ctlOut = [
  '# K85Mutation — frozen control re-score (read-only, harness sanity check)',
  `revision: ${REV}`,
  'note: the pre-data control receipts are frozen under .ufo/waves/round-85/controls/*.txt; these runs only confirm this seat\'s harness reproduces their stated scores.',
  '',
];
for (const c of controls) {
  const r = run(process.execPath, [PROBE, '--lane', `${LANE}/.ufo/waves/round-85/controls/${c}`, '--work', `${WORK}-ctl-${c}`]);
  const summary = r.out.split('\n').find((l) => l.startsWith('C85_C1:')) ?? '(none)';
  ctlOut.push(`## controls/${c}`, `command: node .ufo/waves/round-85/probe/probe85-c1.mjs --lane ${LANE}/.ufo/waves/round-85/controls/${c} --work ${WORK}-ctl-${c}`, `exit: ${r.exit}`, `score: ${summary}`, '');
  console.log(`control ${c}: exit=${r.exit} ${summary}`);
}
writeFileSync(join(BUILD, 'receipts/controls-recheck.txt'), ctlOut.join('\n'));

// 3. Plan's "real task" bytes, measured with the reference (supplementary to the
//    seat: the 20-case probe table remains the only denominator of the claim).
const real = [
  ['r83 c1-probe', 'round-83/close/c1-probe.txt'],
  ['r83 c1-repair', 'round-83/close/c1-repair.txt'],
  ['r83 c2-probe', 'round-83/close/c2-probe.txt'],
  ['r84 history-red', 'round-84/close/history-red.txt'],
  ['r84 history-repair', 'round-84/close/history-repair.txt'],
  ['r84 history-c2', 'round-84/close/history-c2.txt'],
];
const realOut = [
  '# K85Mutation — plan real-task bytes measured against the v2 reference',
  `revision: ${REV}`,
  `ref_sha256: ${run('sha256sum', [REF]).out.split(' ')[0]}`,
  'note: supplementary evidence for the reference the mutants were derived from; it is NOT part of the 20-case claim denominator.',
  '',
];
for (const [label, rel] of real) {
  const file = `${LANE}/.ufo/waves/${rel}`;
  const r = existsSync(file) ? run(process.execPath, [REF, '--receipt', file]) : { exit: null, out: '(absent)' };
  realOut.push(`## ${label} — ${rel}`, `command: node <BUILD>/ref/scripts/counter-receipt.mjs --receipt ${file}`, `exit: ${r.exit}`, '--- output ---', r.out, '');
  console.log(`${label}: exit=${r.exit} ${r.out.split('\n')[0]}`);
}
writeFileSync(join(BUILD, 'receipts/real-task.txt'), realOut.join('\n'));

// 4. Generators already live beside this file; refresh them only if a scratch
//    copy still exists (this helper runs from the seat scratch during the wave).
for (const f of ['mutate.mjs', 'discriminators.mjs']) {
  const from = `/fast/scratch/hyaku/kumitate-r85/K85Mutation/${f}`;
  if (existsSync(from)) copyFileSync(from, join(BUILD, f));
}

// 5. README with the table.
const data = JSON.parse(readFileSync(join(BUILD, 'mutants.json'), 'utf8'));
const killed = data.rows.filter((r) => r.id !== 'REF' && r.exit !== 0);
const survived = data.rows.filter((r) => r.id !== 'REF' && r.exit === 0);
const table = data.rows.map((r) => `| ${r.id} | ${r.name} | ${r.change} | ${r.exit} | ${r.score.replace('C85_C1: ', '')} | ${r.failed.length ? r.failed[0] : 'NONE (survived)'} | ${r.cv.replace('CONTENT_VARIATION: ', '')} |`).join('\n');
const readme = `# K85Mutation — mutation battery for C1 (counter-receipt v2)

Lane revision measured: \`${REV}\`. Production \`scripts/counter-receipt.mjs\` is untouched
(v1, sha256 \`190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0\`).

## Method

No executor candidate existed at \`build/K85ExecGate/counter-receipt.mjs\` when this seat ran,
so the mutant base is a v2 reference written to the frozen contract (\`ref/\`), validated
20/20 with the frozen probe and 3/3 with \`controls/content-variation.mjs\`. Every mutant is
one anchored literal substitution of that reference (generator asserts exactly one
occurrence of the anchor); the unified diff is appended to each receipt.

    node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <tree> --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/work/<id>

## Results — ${killed.length}/14 killed, ${survived.length}/14 survived

| id | mutant | single change | exit | probe | killing arm | content-variation |
|---|---|---|---|---|---|---|
${table}

## Surviving mutants (coverage findings, not contract changes)

${survived.map((r) => `- **${r.id} ${r.name}** — ${r.change}. No frozen arm builds the input where the contract makes it wrong; \`receipts/survivor-discriminators.txt\` shows reference and mutant diverging on exactly that input (\`non_equivalent: true\`).`).join('\n')}

Discarded candidate: case-insensitive \`ARM_PREFIX\` compare is an *equivalent* mutant (both the
summary and arm patterns admit only \`[A-Z][A-Z0-9_]*\`, so case folding never changes a
parseable verdict); it is not counted as a survivor.

## Contract finding (reported, not repaired)

The plan's real-task table claims \`round-84/close/history-red.txt\` → \`DRIFT\` and
\`history-repair.txt\` → \`CLEAN\`. Those committed bytes are 4-line *tool receipts*
(\`rev=\`, \`command=\`, \`COUNTER_RECEIPT: …\`, \`exit=\`): they contain no arm rows and no
summary, so under the frozen grammar both read \`FAIL-CLOSED SUMMARY_COUNT\`, exit 2
(\`receipts/real-task.txt\`). The r83 half of the table reproduces exactly
(\`c1-probe\` → DRIFT ARMS_TOTAL, rows=28 held=27/27; \`c1-repair\` → CLEAN 28/28;
\`c2-probe\` → CLEAN 16/16). The r84 expectation is either about the verdicts those
receipts *record* (not a fresh measurement) or needs a contract rule that does not
exist; it cannot be measured as written.
`;
writeFileSync(join(BUILD, 'README.md'), readme);
console.log('finalized');
