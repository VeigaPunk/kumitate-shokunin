#!/usr/bin/env node
/**
 * mutants76.mjs — round-76 kill-or-survive battery (lane-local, committed as wave evidence).
 *
 * It builds a fixture lane from the lane's working tree, records each test's PRISTINE
 * result, then for every mutant applies ONE literal replacement to a fresh copy of the
 * fixture and re-runs that mutant's test. A mutant is KILLED when the (exit, token) pair
 * differs from the pristine pair; SURVIVED when it is identical; NOT-EVALUABLE when the
 * literal does not match exactly once. Exit 0 iff every mutant is KILLED.
 *
 *   node mutants76.mjs --lane DIR --work DIR --shape-root DIR --nonote-self DIR --out DIR
 */
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, lstatSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--') && argv[i + 1]) opt[a.slice(2)] = argv[++i];
}
const LANE = resolve(opt.lane || '.');
const WORK = resolve(opt.work);
const SHAPE1 = resolve(opt['shape-root']);
const NONOTE = resolve(opt['nonote-self']);
const OUT = resolve(opt.out || join(WORK, 'receipts'));

const run = (cwd, args, env = {}) => {
  const r = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 120_000, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, ...env } });
  return { exit: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

/* ---------------------------------------------------------------- fixtures */

const FIX = join(WORK, 'fixture');
rmSync(FIX, { recursive: true, force: true });
mkdirSync(FIX, { recursive: true });
for (const rel of ['scripts', 'corpus', 'SKILL.md', 'SCORECARD.md', '.ufo/pins']) {
  cpSync(join(LANE, rel), join(FIX, rel), { recursive: true });
}
// scorecard copies the C1 tests need
const sc = readFileSync(join(FIX, 'SCORECARD.md'), 'utf8');
writeFileSync(join(WORK, 'scorecard-9.md'), sc.replace(/^\| coverage:omp \| 10 \|/m, '| coverage:omp | 9 |'));
writeFileSync(join(WORK, 'scorecard-o2.md'),
  sc.replace(/^(\| O1 \|.*)$/m, '$1\n| O2 | mutation fixture row | none | no — battery |'));
// OMP negative root: live depth-1 SHAPE only (built by caller), reused as-is.

/* C2 mini-lane: the two tools, three corpus files, two pins. */
const C2 = join(WORK, 'c2base');
const buildC2 = (target, { unmapped = false } = {}) => {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(join(target, 'scripts'), { recursive: true });
  mkdirSync(join(target, 'corpus/lessons'), { recursive: true });
  mkdirSync(join(target, 'corpus/knowledge'), { recursive: true });
  mkdirSync(join(target, '.ufo/pins'), { recursive: true });
  for (const f of ['spotcheck-adopt.mjs', 'readme-map.mjs']) cpSync(join(LANE, 'scripts', f), join(target, 'scripts', f));
  writeFileSync(join(target, 'corpus/README.md'),
    '# Corpus\n\n| `knowledge/base.md` | base | fixture |\n| `lessons/round-75-verifier-spotcheck.md` | covered | fixture |\n');
  writeFileSync(join(target, 'corpus/knowledge/base.md'), '# base\n');
  writeFileSync(join(target, 'corpus/lessons/round-75-verifier-spotcheck.md'), '# spotcheck\n');
  writeFileSync(join(target, 'corpus/lessons/round-99-verifier-spotcheck.md'), '# next spotcheck\n');
  if (unmapped) writeFileSync(join(target, 'corpus/knowledge/unmapped.md'), '# unmapped\n');
  writeFileSync(join(target, '.ufo/pins/readme-map.json'),
    `${JSON.stringify({ version: 2, covered: ['knowledge/base.md', 'lessons/round-75-verifier-spotcheck.md'] }, null, 2)}\n`);
};
buildC2(C2);

/* ------------------------------------------------------------------ tests */

const T = {
  c1plus1: (dir) => run(dir, ['scripts/proxy-check.mjs', '--omp-root', SHAPE1, '--json']),
  c1badroot: (dir) => run(dir, ['scripts/proxy-check.mjs', '--omp-root', join(WORK, 'not-a-dir.txt')]),
  c1nonote: (dir) => run(dir, ['scripts/proxy-check.mjs', '--self', NONOTE]),
  c1axis: (dir) => run(dir, ['scripts/proxy-check.mjs', '--scorecard', join(WORK, 'scorecard-9.md')]),
  c1o2: (dir) => run(dir, ['scripts/proxy-check.mjs', '--scorecard', join(WORK, 'scorecard-o2.md'), '--json']),
  c2adopt: (dir) => run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--adopt', 'corpus/lessons/round-99-verifier-spotcheck.md']),
  c2second: (dir) => {
    run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--adopt', 'corpus/lessons/round-99-verifier-spotcheck.md']);
    const a = readFileSync(join(dir, 'corpus/README.md'));
    const b = readFileSync(join(dir, '.ufo/pins/readme-map.json'));
    const r = run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--adopt', 'corpus/lessons/round-99-verifier-spotcheck.md']);
    const same = Buffer.compare(a, readFileSync(join(dir, 'corpus/README.md'))) === 0
      && Buffer.compare(b, readFileSync(join(dir, '.ufo/pins/readme-map.json'))) === 0;
    return { exit: r.exit, out: `${r.out}\nBYTES_IDENTICAL=${same}` };
  },
  c2notspot: (dir) => run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--adopt', 'corpus/lessons/round-75.md']),
  c2symlink: (dir) => {
    const link = join(dir, 'corpus/lessons/round-98-verifier-spotcheck.md');
    try { lstatSync(link); } catch { symlinkSync('../knowledge/base.md', link); }
    return run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--adopt', 'corpus/lessons/round-98-verifier-spotcheck.md']);
  },
  c2predict: (dir) => run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--predict', '76']),
  c2rollback: (dir) => {
    const before = readFileSync(join(dir, 'corpus/README.md')).toString('utf8');
    const r = run(dir, ['scripts/spotcheck-adopt.mjs', '--lane', '.', '--adopt', 'corpus/lessons/round-99-verifier-spotcheck.md']);
    const after = readFileSync(join(dir, 'corpus/README.md')).toString('utf8');
    return { exit: r.exit, out: `${r.out}\nREADME_RESTORED=${before === after}` };
  },
};

// pristine reference results
const TOK = (r) => {
  const m = /"(?:coverage_omp|C1o|O_findings)":\s*(\d+)/g;
  const nums = [...String(r.out).matchAll(m)].map((x) => `${x[0].replace(/\s+/g, '')}`).sort().join(',');
  const tokens = ['OMP_ROOT_NOT_A_DIR', 'OMP_NOTE_MISSING', 'AXES_DRIFT', 'coverage:omp', 'ADOPTED', 'ALREADY_ADOPTED',
    'REFUSED_NOT_SPOTCHECK', 'REFUSED_OUT_OF_SCOPE', 'REFUSED_ORACLE', 'PENDING', 'COVERED', 'BYTES_IDENTICAL=true',
    'README_RESTORED=true'].filter((t) => String(r.out).includes(t));
  return `${r.exit}|${nums}|${tokens.join('+')}`;
};

const MUTANTS = [
  // C1 — proxy-check.mjs
  { id: 'C1-M1', file: 'scripts/proxy-check.mjs', test: 'c1plus1',
    find: 'omp.counts.entries - omp.findings.length, omp.counts.entries),',
    replace: 'omp.counts.entries, omp.counts.entries),', intent: 'drop the findings subtraction from coverage_omp' },
  { id: 'C1-M2', file: 'scripts/proxy-check.mjs', test: 'c1plus1',
    find: '      coverage_omp: layerCoverage(oreg.covered, oreg.total,\n        omp.counts.entries - omp.findings.length, omp.counts.entries),',
    replace: '      coverage_omp: 10,', intent: 'constant score, root never read for the score' },
  { id: 'C1-M3', file: 'scripts/proxy-check.mjs', test: 'c1badroot',
    find: '  } catch (e) {\n    return failClosed(opts, \'OMP_ROOT_NOT_A_DIR\',\n      `--omp-root ${opts.ompRoot} is not a readable directory (${e.code || e.message})`, {}, started);\n  }',
    replace: '  } catch (e) {\n    omp = { counts: { entries: 64, bound: 35 }, findings: [] };\n  }',
    intent: 'an unreadable root is scored as a clean 64/0 instead of failing closed' },
  { id: 'C1-M4', file: 'scripts/proxy-check.mjs', test: 'c1nonote',
    find: "  if (ompNoteText === null) {\n    return failClosed(opts, 'OMP_NOTE_MISSING',",
    replace: "  if (false) {\n    return failClosed(opts, 'OMP_NOTE_MISSING',",
    intent: 'drop the binding-note refusal' },
  { id: 'C1-M5', file: 'scripts/proxy-check.mjs', test: 'c1axis',
    find: "  { axis: 'coverage:omp', term: 'coverage_omp' },\n",
    replace: '', intent: 'drop the sixth AXES_DRIFT row' },
  { id: 'C1-M6', file: 'scripts/proxy-check.mjs', test: 'c1o2',
    find: 'const oreg = registryCounts(scorecardText, RE_O_ROW);',
    replace: 'const oreg = registryCounts(scorecardText);', intent: 'count legacy S/R rows as O rows (C1o/score inflate)' },
  // C2 — spotcheck-adopt.mjs
  { id: 'C2-M1', file: 'scripts/spotcheck-adopt.mjs', test: 'c2adopt',
    find: 'if (m.pin) writes.push([pin, appendPin(originals.get(pin).toString(\'utf8\'), key)]);',
    replace: '', intent: 'write the row but never the pin' },
  { id: 'C2-M2', file: 'scripts/spotcheck-adopt.mjs', test: 'c2adopt',
    find: '    if (m.row) {\n      const raw', replace: '    if (false) {\n      const raw', intent: 'write the pin but never the row' },
  { id: 'C2-M3', file: 'scripts/spotcheck-adopt.mjs', test: 'c2symlink',
    find: "      if (!lstatSync(full).isFile() || realpathSync(dirname(full)) !== join(realpathSync(lane), 'corpus/lessons'))\n        return { exit: 2, lines: ['REFUSED_OUT_OF_SCOPE'] };",
    replace: '      if (false) return { exit: 2, lines: [\'REFUSED_OUT_OF_SCOPE\'] };',
    intent: 'accept a symlinked artifact outside the lessons dir' },
  { id: 'C2-M4', file: 'scripts/spotcheck-adopt.mjs', test: 'c2notspot',
    find: "    if (!NAME.test(value.slice('corpus/lessons/'.length)))\n      return { exit: 2, lines: ['REFUSED_NOT_SPOTCHECK'] };",
    replace: "    if (false)\n      return { exit: 2, lines: ['REFUSED_NOT_SPOTCHECK'] };",
    intent: 'accept any corpus/lessons file as a spotcheck' },
  { id: 'C2-M5', file: 'scripts/spotcheck-adopt.mjs', test: 'c2second',
    find: "  if (!m.row && !m.pin) return { exit: 0, lines: [`SPOTCHECK_ADOPT: ALREADY_ADOPTED ${path}`] };",
    replace: '  if (false) return { exit: 0, lines: [] };', intent: 'lose the idempotent already-adopted arm' },
  { id: 'C2-M6', file: 'scripts/spotcheck-adopt.mjs', test: 'c2predict',
    find: "catch (e) { return e.code === 'ENOENT' ? { exit: 0, lines: [`SPOTCHECK_PREDICT: PENDING ${path}`] } : refuse(); }",
    replace: "catch (e) { return { exit: 0, lines: [`SPOTCHECK_PREDICT: COVERED ${path}`] }; }", intent: 'predict an absent artifact as covered' },
  { id: 'C2-M7', file: 'scripts/spotcheck-adopt.mjs', test: 'c2rollback',
    find: 'for (const file of changed.reverse()) replaceAtomic(file, originals.get(file));',
    replace: 'for (const file of []) replaceAtomic(file, originals.get(file));', intent: 'drop the pre-image restore on a failed oracle' },
];

/* ----------------------------------------------------------------- driver */

mkdirSync(OUT, { recursive: true });
const pristine = {};
const pristineReport = [];
for (const [name, fn] of Object.entries(T)) {
  const dir = join(WORK, `pristine-${name}`);
  rmSync(dir, { recursive: true, force: true });
  if (name.startsWith('c2')) cpSync(C2, dir, { recursive: true });
  else cpSync(FIX, dir, { recursive: true });
  if (name === 'c2rollback') writeFileSync(join(dir, 'corpus/knowledge/unmapped.md'), '# unmapped\n');
  const r = fn(dir);
  pristine[name] = TOK(r);
  pristineReport.push(`PRISTINE ${name} exit=${r.exit} token=${TOK(r)}`);
  rmSync(dir, { recursive: true, force: true });
}
writeFileSync(join(OUT, 'pristine.txt'), `${pristineReport.join('\n')}\n`);

const lines = [];
let killed = 0;
for (const m of MUTANTS) {
  const dir = join(WORK, `mut-${m.id}`);
  rmSync(dir, { recursive: true, force: true });
  cpSync(m.test.startsWith('c2') ? C2 : FIX, dir, { recursive: true });
  if (m.test === 'c2rollback') writeFileSync(join(dir, 'corpus/knowledge/unmapped.md'), '# unmapped\n');
  const file = join(dir, m.file);
  const src = readFileSync(file, 'utf8');
  const parts = src.split(m.find);
  if (parts.length !== 2) {
    lines.push(`${m.id} NOT-EVALUABLE matches=${parts.length - 1} intent="${m.intent}"`);
    rmSync(dir, { recursive: true, force: true });
    continue;
  }
  writeFileSync(file, parts[0] + m.replace + parts[1]);
  const r = T[m.test](dir);
  const got = TOK(r);
  const verdict = got === pristine[m.test] ? 'SURVIVED' : 'KILLED';
  if (verdict === 'KILLED') killed += 1;
  lines.push(`${m.id} ${verdict} exit=${r.exit} token=${got} pristine=${pristine[m.test]} intent="${m.intent}"`);
  rmSync(dir, { recursive: true, force: true });
}
const total = MUTANTS.length;
lines.push(`MUTANTS76: ${killed === total ? 'ALL-KILLED' : 'SURVIVORS'} killed=${killed}/${total}`);
writeFileSync(join(OUT, 'mutants.txt'), `${lines.join('\n')}\n`);
process.stdout.write(`${lines.join('\n')}\n`);
process.exit(killed === total ? 0 : 1);
