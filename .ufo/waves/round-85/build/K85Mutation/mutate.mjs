#!/usr/bin/env node
// K85Mutation driver: derive single-change mutants from the v2 reference and
// score each with the frozen probe + content-variation control.
// Writes only BUILD (own seat subtree) and SCRATCH (probe --work).
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';

const BUILD = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85Mutation';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r85/K85Mutation';
const PROBE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/probe/probe85-c1.mjs';
const CV = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/controls/content-variation.mjs';
const LANE_REV = '9db0c6b5eb9111cfc5581006ba976ca2cd112792';
const SRC = join(SCRATCH, 'ref/scripts/counter-receipt.mjs');
const REF_DEST = join(BUILD, 'ref/scripts/counter-receipt.mjs');

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const MUTANTS = [
  {
    id: 'M01', name: 'sha256-dropped',
    change: 'derived line prints sha256=- instead of the 64-hex digest of the receipt bytes',
    expect: 'every receipt arm: line2 digest mismatch (killing arm: clean)',
    old: "findings=${final.code === 0 ? 'none' : final.token} sha256=${sha}",
    new: "findings=${final.code === 0 ? 'none' : final.token} sha256=-",
  },
  {
    id: 'M02', name: 'bytes-zero',
    change: 'prints bytes=0 always instead of the real receipt byte length',
    expect: 'receipt arms with bytes>0: line2 mismatch (killing arm: clean)',
    old: 'bytes=${raw.length}',
    new: 'bytes=0',
  },
  {
    id: 'M03', name: 'src-never-read',
    change: 'never reads --src; substitutes a canned 3-site/ARMS=3 source',
    expect: 'src-arity/src-declared fixtures disagree with the canned source (killing arm: src-arity)',
    old: '    let sourceRaw = null;\n    try { sourceRaw = readFileSync(srcPath); } catch { sourceRaw = null; }',
    new: '    let sourceRaw = "const ARMS = 3;\\narm(\'a\', () => {});\\narm(\'b\', () => {});\\narm(\'c\', () => {});\\n";',
  },
  {
    id: 'M04', name: 'arm-unbound-unreachable',
    change: 'ARM_UNBOUND check disabled (guarded by false &&)',
    expect: 'src-unbound expects DRIFT ARM_UNBOUND but gets CLEAN (killing arm: src-unbound)',
    old: "if (receipt.names.some((name) => !available.has(name))) return fail('ARM_UNBOUND', 1);",
    new: "if (false && receipt.names.some((name) => !available.has(name))) return fail('ARM_UNBOUND', 1);",
  },
  {
    id: 'M05', name: 'declared-mismatch-accepted',
    change: 'SOURCE_DECLARED check disabled (guarded by false &&)',
    expect: 'src-declared expects DRIFT SOURCE_DECLARED but gets CLEAN (killing arm: src-declared)',
    old: "if (source.declared !== null && source.declared !== source.sites.length) return fail('SOURCE_DECLARED', 1);",
    new: "if (false && source.declared !== null && source.declared !== source.sites.length) return fail('SOURCE_DECLARED', 1);",
  },
  {
    id: 'M06', name: 'held-constant',
    change: 'derived line prints held=-/- always instead of the summary counts',
    expect: 'receipt arms with a summary: line2 mismatch (killing arm: clean)',
    old: 'held=${receipt.held}',
    new: 'held=-/-',
  },
  {
    id: 'M07', name: 'derived-line-clean-only',
    change: 'prints the RECEIPT line only when the verdict is CLEAN',
    expect: 'first failing (hidden-red) arm loses line2/line count (killing arm: hidden-red)',
    old: '  console.log(`RECEIPT:',
    new: '  if (final.code === 0) console.log(`RECEIPT:',
  },
  {
    id: 'M08', name: 'nonce-excluded-from-hash',
    change: 'strips metadata (nonce) lines before hashing, so the digest covers less than the file',
    expect: 'every receipt arm: digest mismatch from the nonce line (killing arm: clean)',
    old: "const sha = createHash('sha256').update(raw).digest('hex');",
    new: "const sha = createHash('sha256').update(raw.toString('utf8').split(/\\r?\\n/).filter((line) => !/^[A-Za-z_][A-Za-z0-9_-]*=/.test(line) && !/^(?:command|rev|exit):/.test(line)).join('\\n')).digest('hex');",
  },
  {
    id: 'M09', name: 'rows-count-malformed',
    change: 'rows counts malformed arm lines too',
    expect: 'malformed-arm expects rows=0 but gets 1 (killing arm: malformed-arm)',
    old: 'const rows = arms.length;',
    new: 'const rows = arms.length + (malformedArm ? 1 : 0);',
  },
  {
    id: 'M10', name: 'duplicate-accepted',
    change: 'ARM_DUPLICATE check disabled (guarded by false &&)',
    expect: 'duplicate expects DRIFT ARM_DUPLICATE but gets CLEAN (killing arm: duplicate)',
    old: "if (new Set(names).size !== rows) return fail('ARM_DUPLICATE', 1, { rows, held, names });",
    new: "if (false && new Set(names).size !== rows) return fail('ARM_DUPLICATE', 1, { rows, held, names });",
  },
  {
    id: 'M11', name: 'arm-failed-unreachable',
    change: 'ARM_FAILED check disabled (guarded by false &&)',
    expect: 'honest-red expects DRIFT ARM_FAILED but reaches VERDICT (killing arm: honest-red)',
    old: "if (arms.some((arm) => !arm.ok)) return fail('ARM_FAILED', 1, { rows, held, names });",
    new: "if (false && arms.some((arm) => !arm.ok)) return fail('ARM_FAILED', 1, { rows, held, names });",
  },
  {
    id: 'S01', name: 'absent-declared-rendered-0',
    change: 'renders an undeclared ARMS as declared=0 instead of declared=absent',
    expect: 'SURVIVOR CANDIDATE: no frozen fixture has a --src file without an ARMS declaration',
    old: "const declared = source.declared === null ? 'absent' : source.declared;",
    new: 'const declared = source.declared ?? 0;',
  },
  {
    id: 'S02', name: 'first-arms-declaration-wins',
    change: 'takes the FIRST const|let|var ARMS = <int> instead of the last',
    expect: 'SURVIVOR CANDIDATE: no frozen --src fixture declares ARMS twice (contract says last wins)',
    old: "  let declared = null;\n  for (const match of text.matchAll(/(?:^|\\n)[ \\t]*(?:const|let|var) ARMS = ([0-9]+)/g)) declared = Number(match[1]);",
    new: "  const decls = [...text.matchAll(/(?:^|\\n)[ \\t]*(?:const|let|var) ARMS = ([0-9]+)/g)];\n  let declared = decls.length ? Number(decls[0][1]) : null;",
  },
  {
    id: 'S03', name: 'colon-metadata-not-ignored',
    change: 'ignores k=v metadata but not the command:/rev:/exit: colon forms',
    expect: 'SURVIVOR CANDIDATE: the probe nonce is k=v (rev=<hex>); no colon-form metadata fixture',
    old: "if (/^[A-Za-z_][A-Za-z0-9_-]*=/.test(line) || /^(?:command|rev|exit):/.test(line)) continue;",
    new: 'if (/^[A-Za-z_][A-Za-z0-9_-]*=/.test(line)) continue;',
  },
];

mkdirSync(dirname(REF_DEST), { recursive: true });
mkdirSync(join(BUILD, 'mutants'), { recursive: true });
mkdirSync(join(BUILD, 'receipts'), { recursive: true });
mkdirSync(join(SCRATCH, 'work'), { recursive: true });
copyFileSync(SRC, REF_DEST);
const refText = readFileSync(REF_DEST, 'utf8');
const refSha = sha256(readFileSync(REF_DEST));

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 60000, ...opts });
  return { exit: r.status, out: ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd() };
}

function score(laneDir, workDir) {
  const probe = run(process.execPath, [PROBE, '--lane', laneDir, '--work', workDir]);
  const lines = probe.out.split('\n');
  const failed = lines.filter((l) => /^C85_C1 arm \S+ FAIL/.test(l)).map((l) => l.split(' ')[2]);
  const summary = lines.find((l) => l.startsWith('C85_C1:')) ?? '(no summary line)';
  return { exit: probe.exit, out: probe.out, failed, summary };
}

function cv(laneDir, workDir) {
  const r = run(process.execPath, [CV, '--lane', laneDir, '--work', workDir]);
  const summary = r.out.split('\n').find((l) => l.startsWith('CONTENT_VARIATION:')) ?? '(no summary line)';
  return { exit: r.exit, out: r.out, summary };
}

const rows = [];
// Control run: unmutated reference.
{
  const s = score(join(BUILD, 'ref'), join(SCRATCH, 'work/ref'));
  const c = cv(join(BUILD, 'ref'), join(SCRATCH, 'work/ref-cv'));
  writeFileSync(join(BUILD, 'receipts/ref-probe.txt'), [
    '# K85Mutation receipt — unmutated v2 reference',
    'command: node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <BUILD>/ref --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/work/ref',
    `revision: ${LANE_REV}`,
    `ref_sha256: ${refSha}`,
    `exit: ${s.exit}`,
    `score: ${s.summary}`,
    '--- probe stdout ---', s.out, '',
  ].join('\n'));
  writeFileSync(join(BUILD, 'receipts/ref-content-variation.txt'), [
    '# K85Mutation receipt — unmutated v2 reference, content-variation control',
    'command: node .ufo/waves/round-85/controls/content-variation.mjs --lane <BUILD>/ref --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/work/ref-cv',
    `revision: ${LANE_REV}`,
    `ref_sha256: ${refSha}`,
    `exit: ${c.exit}`,
    `score: ${c.summary}`,
    '--- control stdout ---', c.out, '',
  ].join('\n'));
  rows.push({ id: 'REF', name: 'unmutated-v2-reference', change: '(control)', score: s.summary, exit: s.exit, failed: s.failed, cv: c.summary, cvExit: c.exit, sha: refSha, mutant_sha: refSha });
}

for (const m of MUTANTS) {
  const occurrences = refText.split(m.old).length - 1;
  if (occurrences !== 1) throw new Error(`${m.id}: expected exactly 1 occurrence of change anchor, got ${occurrences}`);
  const mutated = refText.replace(m.old, m.new);
  if (mutated === refText) throw new Error(`${m.id}: substitution produced no change`);
  const tree = join(BUILD, 'mutants', `${m.id}-${m.name}`);
  mkdirSync(join(tree, 'scripts'), { recursive: true });
  const dest = join(tree, 'scripts/counter-receipt.mjs');
  writeFileSync(dest, mutated);
  const mutantSha = sha256(readFileSync(dest));
  const s = score(tree, join(SCRATCH, 'work', m.id));
  const c = cv(tree, join(SCRATCH, 'work', `${m.id}-cv`));
  const killing = s.failed.length ? s.failed[0] : 'NONE (survived)';
  const receipt = [
    `# K85Mutation receipt — ${m.id} ${m.name}`,
    `mutant: ${m.id} ${m.name}`,
    `change: ${m.change}`,
    `expected detector: ${m.expect}`,
    `command: node .ufo/waves/round-85/probe/probe85-c1.mjs --lane ${tree} --work /fast/scratch/hyaku/kumitate-r85/K85Mutation/work/${m.id}`,
    `lane: mutants/${m.id}-${m.name}`,
    `revision: ${LANE_REV}`,
    `ref_sha256: ${refSha}`,
    `mutant_sha256: ${mutantSha}`,
    `exit: ${s.exit}`,
    `score: ${s.summary}`,
    `killing_arm: ${killing}`,
    `failed_arms: ${s.failed.length ? s.failed.join(', ') : 'none'}`,
    `content_variation_exit: ${c.exit}`,
    `content_variation: ${c.summary}`,
    '--- probe stdout ---', s.out, '',
    '--- content-variation stdout ---', c.out, '',
  ].join('\n');
  writeFileSync(join(BUILD, 'receipts', `${m.id}-${m.name}.txt`), receipt);
  rows.push({ id: m.id, name: m.name, change: m.change, expect: m.expect, score: s.summary, exit: s.exit, failed: s.failed, killing, cv: c.summary, cvExit: c.exit, sha: mutantSha, mutant_sha: mutantSha, ref_sha: refSha });
  console.log(`${m.id} ${m.name}: exit=${s.exit} ${s.summary} killing=${killing} cv_exit=${c.exit} ${c.summary}`);
}

writeFileSync(join(BUILD, 'mutants.json'), JSON.stringify({ lane_rev: LANE_REV, ref_sha256: refSha, rows }, null, 2));

const tbl = rows.map((r) => `| ${r.id} | ${r.name} | ${r.change} | \`${r.score.replace('C85_C1: ', '')}\` | ${r.exit} | ${r.killing ?? 'NONE'} | ${r.cv.replace('CONTENT_VARIATION: ', '')} |`).join('\n');
writeFileSync(join(BUILD, 'table.md'), `# K85Mutation — mutant table (round 85, C1)\n\nLane revision measured: ${LANE_REV}. Reference (unmutated) sha256: ${refSha}.\nProbe: frozen \`.ufo/waves/round-85/probe/probe85-c1.mjs\`; control: frozen \`controls/content-variation.mjs\`.\n\n| id | mutant | single change | probe score | exit | killing arm | content-variation |\n|---|---|---|---|---|---|---|\n${tbl}\n`);
console.log('wrote', BUILD);
