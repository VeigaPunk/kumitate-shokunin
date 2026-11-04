#!/usr/bin/env node
// K85Mutation candidate battery: the same behavioural classes, anchored to the
// K85ExecGate candidate's own bytes. Writes only BUILD and SCRATCH.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const BUILD = `${LANE}/.ufo/waves/round-85/build/K85Mutation`;
const SCRATCH = '/fast/scratch/hyaku/kumitate-r85/K85Mutation';
const PROBE = `${LANE}/.ufo/waves/round-85/probe/probe85-c1.mjs`;
const CV = `${LANE}/.ufo/waves/round-85/controls/content-variation.mjs`;
const REV = '9db0c6b5eb9111cfc5581006ba976ca2cd112792';
const CAND = `${BUILD}/candidate-ref/scripts/counter-receipt.mjs`;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const MUTANTS = [
  { id: 'M01', name: 'sha256-dropped', change: 'derived line prints sha256=- instead of the digest', old: 'sha256=${observed.sha}', new: 'sha256=-' },
  { id: 'M02', name: 'bytes-zero', change: 'prints bytes=0 always', old: 'bytes=${observed.bytes}', new: 'bytes=0' },
  {
    id: 'M03', name: 'src-never-read', change: 'never reads --src; substitutes a canned 3-site/ARMS=3 source',
    old: 'const source = options.src === null ? null : inspectSource(options.src);',
    new: "const source = options.src === null ? null : { sites: 3, declared: 3, names: ['a', 'b', 'c'], verdict: null };",
  },
  { id: 'M04', name: 'arm-unbound-unreachable', change: 'ARM_UNBOUND check disabled', old: "if (arms.some((arm) => !bound.has(arm.name))) return { code: 1, token: 'ARM_UNBOUND' };", new: "if (false && arms.some((arm) => !bound.has(arm.name))) return { code: 1, token: 'ARM_UNBOUND' };" },
  { id: 'M05', name: 'declared-mismatch-accepted', change: 'SOURCE_DECLARED check disabled', old: "if (source.declared !== null && source.declared !== source.sites) return { code: 1, token: 'SOURCE_DECLARED' };", new: "if (false && source.declared !== null && source.declared !== source.sites) return { code: 1, token: 'SOURCE_DECLARED' };" },
  { id: 'M06', name: 'held-constant', change: 'prints held=-/- always', old: 'held=${observed.held}', new: 'held=-/-' },
  { id: 'M07', name: 'derived-line-clean-only', change: 'prints the RECEIPT line only when CLEAN', old: '  console.log(`RECEIPT:', new: '  if (finding.code === 0) console.log(`RECEIPT:' },
  {
    id: 'M08', name: 'nonce-excluded-from-hash', change: 'strips metadata (nonce) lines before hashing',
    old: "sha: createHash('sha256').update(buffer).digest('hex'),",
    new: "sha: createHash('sha256').update(buffer.toString('utf8').split(/\\r?\\n/).filter((line) => !metadataAssignment.test(line) && !metadataPrefix.test(line)).join('\\n')).digest('hex'),",
  },
  { id: 'M09', name: 'rows-count-malformed', change: 'rows also counts malformed arm lines', old: 'rows: scan.arms.length,', new: 'rows: scan.arms.length + (scan.malformedArm ? 1 : 0),' },
  { id: 'M10', name: 'duplicate-accepted', change: 'ARM_DUPLICATE check disabled', old: "if (new Set(arms.map((arm) => arm.name)).size !== arms.length) return { code: 1, token: 'ARM_DUPLICATE' };", new: "if (false && new Set(arms.map((arm) => arm.name)).size !== arms.length) return { code: 1, token: 'ARM_DUPLICATE' };" },
  { id: 'M11', name: 'arm-failed-unreachable', change: 'ARM_FAILED check disabled', old: "if (arms.some((arm) => !arm.ok)) return { code: 1, token: 'ARM_FAILED' };", new: "if (false && arms.some((arm) => !arm.ok)) return { code: 1, token: 'ARM_FAILED' };" },
  { id: 'S01', name: 'absent-declared-rendered-0', change: 'renders an undeclared ARMS as declared=0', old: "declared=${source.declared === null ? 'absent' : source.declared}", new: 'declared=${source.declared ?? 0}' },
  { id: 'S02', name: 'first-arms-declaration-wins', change: 'takes the first ARMS declaration instead of the last', old: 'const declared = declarations.length ? Number(declarations[declarations.length - 1][1]) : null;', new: 'const declared = declarations.length ? Number(declarations[0][1]) : null;' },
  { id: 'S03', name: 'colon-metadata-not-ignored', change: 'colon-form metadata no longer ignored', old: 'const metadataPrefix = /^(?:command|rev|exit):/;', new: 'const metadataPrefix = /$^/;' },
];

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 60000 });
  return { exit: r.status, out: ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd() };
};
const score = (lane, work) => {
  const r = run(process.execPath, [PROBE, '--lane', lane, '--work', work]);
  const lines = r.out.split('\n');
  return {
    exit: r.exit, out: r.out,
    failed: lines.filter((l) => /^C85_C1 arm \S+ FAIL/.test(l)).map((l) => l.split(' ')[2]),
    summary: lines.find((l) => l.startsWith('C85_C1:')) ?? '(none)',
  };
};
const cv = (lane, work) => {
  const r = run(process.execPath, [CV, '--lane', lane, '--work', work]);
  return { exit: r.exit, out: r.out, summary: r.out.split('\n').find((l) => l.startsWith('CONTENT_VARIATION:')) ?? '(none)' };
};

mkdirSync(dirname(CAND), { recursive: true });
mkdirSync(join(BUILD, 'mutants-candidate'), { recursive: true });
mkdirSync(join(BUILD, 'receipts-candidate'), { recursive: true });
copyFileSync(`${LANE}/.ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs`, CAND);
const text = readFileSync(CAND, 'utf8');
const refSha = sha256(readFileSync(CAND));

const rows = [];
{
  const s = score(join(BUILD, 'candidate-ref'), join(SCRATCH, 'cwork/ref'));
  const c = cv(join(BUILD, 'candidate-ref'), join(SCRATCH, 'cwork/ref-cv'));
  writeFileSync(join(BUILD, 'receipts-candidate/ref-probe.txt'), [
    '# K85Mutation candidate battery — unmutated K85ExecGate candidate',
    `source: .ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs (copied byte-exact)`,
    'command: node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <BUILD>/candidate-ref --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/cwork/ref',
    `revision: ${REV}`, `candidate_sha256: ${refSha}`, `exit: ${s.exit}`, `score: ${s.summary}`,
    '--- probe stdout ---', s.out, '',
  ].join('\n'));
  writeFileSync(join(BUILD, 'receipts-candidate/ref-content-variation.txt'), [
    '# K85Mutation candidate battery — unmutated candidate, content-variation control',
    'command: node .ufo/waves/round-85/controls/content-variation.mjs --lane <BUILD>/candidate-ref --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/cwork/ref-cv',
    `revision: ${REV}`, `candidate_sha256: ${refSha}`, `exit: ${c.exit}`, `score: ${c.summary}`,
    '--- control stdout ---', c.out, '',
  ].join('\n'));
  rows.push({ id: 'REF', name: 'unmutated-candidate', change: '(control)', exit: s.exit, summary: s.summary, failed: s.failed, cv: c.summary, sha: refSha, ref_sha: refSha });
}

for (const m of MUTANTS) {
  const n = text.split(m.old).length - 1;
  if (n !== 1) throw new Error(`${m.id}: anchor occurrences ${n}`);
  const mutated = text.replace(m.old, m.new);
  const tree = join(BUILD, 'mutants-candidate', `${m.id}-${m.name}`);
  mkdirSync(join(tree, 'scripts'), { recursive: true });
  const dest = join(tree, 'scripts/counter-receipt.mjs');
  writeFileSync(dest, mutated);
  const mutantSha = sha256(readFileSync(dest));
  const s = score(tree, join(SCRATCH, 'cwork', m.id));
  const c = cv(tree, join(SCRATCH, 'cwork', `${m.id}-cv`));
  const killing = s.failed.length ? s.failed[0] : 'NONE (survived)';
  writeFileSync(join(BUILD, 'receipts-candidate', `${m.id}-${m.name}.txt`), [
    `# K85Mutation candidate receipt — ${m.id} ${m.name}`,
    `mutant: ${m.id} ${m.name}`, `change: ${m.change}`,
    `command: node .ufo/waves/round-85/probe/probe85-c1.mjs --lane ${tree} --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/cwork/${m.id}`,
    `lane: mutants-candidate/${m.id}-${m.name}`, `revision: ${REV}`,
    `candidate_sha256: ${refSha}`, `mutant_sha256: ${mutantSha}`,
    `exit: ${s.exit}`, `score: ${s.summary}`, `killing_arm: ${killing}`,
    `failed_arms: ${s.failed.length ? s.failed.join(', ') : 'none'}`,
    `content_variation_exit: ${c.exit}`, `content_variation: ${c.summary}`,
    '--- probe stdout ---', s.out, '',
    '--- content-variation stdout ---', c.out, '',
    '--- unified diff vs candidate-ref ---',
    run('diff', ['-u', '--label', 'candidate-ref', '--label', `mutants-candidate/${m.id}-${m.name}`, CAND, dest]).out, '',
  ].join('\n'));
  rows.push({ id: m.id, name: m.name, change: m.change, exit: s.exit, summary: s.summary, failed: s.failed, killing, cv: c.summary, cvExit: c.exit, sha: mutantSha, ref_sha: refSha });
  console.log(`${m.id} ${m.name}: exit=${s.exit} ${s.summary} killing=${killing} cv_exit=${c.exit} ${c.summary}`);
}

writeFileSync(join(BUILD, 'candidates.json'), JSON.stringify({ candidate: 'K85ExecGate', candidate_sha256: refSha, revision: REV, rows }, null, 2));
const killed = rows.filter((r) => r.id !== 'REF' && r.exit !== 0).length;
const survived = rows.filter((r) => r.id !== 'REF' && r.exit === 0);
const table = rows.map((r) => `| ${r.id} | ${r.name} | ${r.change} | ${r.exit} | ${r.summary.replace('C85_C1: ', '')} | ${r.failed.length ? r.failed[0] : 'NONE (survived)'} | ${r.cv.replace('CONTENT_VARIATION: ', '')} |`).join('\n');
writeFileSync(join(BUILD, 'table-candidate.md'), [
  '# K85Mutation — candidate mutant table (round 85, C1)', '',
  `Candidate source: .ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs (byte-exact copy at candidate-ref/), sha256 ${refSha}.`,
  `Lane revision measured: ${REV}. Probe: frozen probe85-c1.mjs. Killed ${killed}/${MUTANTS.length}; survived ${survived.length}/${MUTANTS.length}.`, '',
  '| id | mutant | single change | exit | probe | killing arm | content-variation |',
  '|---|---|---|---|---|---|---|', table, '',
  ...survived.map((r) => `- survivor **${r.id} ${r.name}**: ${r.change} — no frozen arm builds the input where the contract makes it wrong.`), '',
].join('\n'));
console.log(`candidate battery: killed=${killed}/${MUTANTS.length} survived=${survived.length}/${MUTANTS.length}`);
