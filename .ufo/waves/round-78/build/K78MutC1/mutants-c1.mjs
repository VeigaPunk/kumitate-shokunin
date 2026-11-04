#!/usr/bin/env node
// Axes: operability and coverage. One literal edit per isolated trial.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const PROBE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-78/probe/probe78-c1.mjs';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r78/K78MutC1';
const EXPECTED_PROBE_SHA = '5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed';
const MUTANTS = [
  { id: 'findings-zero', file: 'scripts/proxy-check.mjs', from: 'K_findings: kimi.findings.length,', to: 'K_findings: 0,', expected: 'proxy-mode-violation, proxy-stray, proxy-missing' },
  { id: 'drop-findings-factor', file: 'scripts/proxy-check.mjs', from: 'coverage_kimi: layerCoverage(kreg.covered, kreg.total, members - kimi.findings.length, members),', to: 'coverage_kimi: layerCoverage(kreg.covered, kreg.total, sections.count, members),', expected: 'proxy-mode-violation, proxy-stray' },
  { id: 'members-numerator', file: 'scripts/proxy-check.mjs', from: 'members - kimi.findings.length', to: 'members', expected: 'proxy-mode-violation, proxy-stray, proxy-missing' },
  { id: 'census-no-findings', file: 'scripts/kimi-census.mjs', from: 'ok: true, members: totals.members, findings, identities, byBasename,', to: 'ok: true, members: totals.members, findings: [], identities, byBasename,', expected: 'census-mode-violation, proxy-mode-violation, proxy-stray, proxy-missing' },
  { id: 'private-member-rule', file: 'scripts/proxy-check.mjs', from: 'const members = kimi.members;', to: "const K_MEMBER_RULES = [{ id: 'region', kind: 'file' }]; const members = kimi.members + K_MEMBER_RULES.length;", expected: 'single-derivation, proxy-clean-terms' },
  { id: 'stanza-findings-no-delta', file: 'scripts/proxy-check.mjs', from: 'if (dec === got) continue;', to: "if (key === 'K_findings' || dec === got) continue;", expected: 'stanza-tamper, proxy-mode-violation' },
  { id: 'ignore-mode-floor', file: 'scripts/kimi-census.mjs', from: 'const lacksFloor = mode === null || (mode & m.modeFloor) !== m.modeFloor;', to: 'const lacksFloor = false;', expected: 'census-mode-violation, proxy-mode-violation, selftests' },
  { id: 'hardcoded-members-55', file: 'scripts/proxy-check.mjs', from: 'const members = kimi.members;', to: 'const members = 55;', expected: 'proxy-missing, selftests' },
];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const text = (p) => readFileSync(p, 'utf8');
function detector(lane, phase, work) {
  const r = spawnSync(process.execPath, [PROBE, '--lane', lane, '--work', work], {
    cwd: lane, encoding: 'utf8', timeout: 900000, maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, TMPDIR: join(SCRATCH, 'tmp') },
  });
  process.stdout.write(`=== ${phase} exit=${r.status} signal=${r.signal} error=${r.error?.message ?? 'none'} ===\n${r.stdout ?? ''}${r.stderr ?? ''}`);
  return { pass: r.status === 0 && /C78_C1: HELD held=12\/12\s*$/u.test(r.stdout ?? ''), crash: !!r.error || r.signal !== null || r.status === null || !/C78_C1: HELD held=\d+\/12/u.test(r.stdout ?? ''), status: r.status };
}
let copy;
let status = 2;
try {
  if (process.argv.length !== 4 || process.argv[2] !== '--lane') throw new Error('usage: node mutants-c1.mjs --lane DIR');
  const lane = resolve(process.argv[3]);
  if (lane === SCRATCH || SCRATCH.startsWith(`${lane}/`)) throw new Error('input lane cannot contain battery scratch');
  mkdirSync(join(SCRATCH, 'tmp'), { recursive: true });
  copy = mkdtempSync(join(SCRATCH, 'battery-'));
  const target = join(copy, 'lane');
  cpSync(lane, target, { recursive: true, dereference: false, filter: (src) => {
    const rel = relative(lane, src);
    // Byte-identical copy except VCS metadata: the frozen probe's `A` term counts every
    // runnable file in the tree, so excluding `.ufo/waves` would break the baseline
    // (round-78 L1 fix; the seat's original filter read 10/12 on a pristine tree).
    return rel !== '.git' && !rel.startsWith('.git/');
  } });
  process.stdout.write(`probe.sha256=${hash(readFileSync(PROBE))}\ninput=${lane}\n`);
  if (hash(readFileSync(PROBE)) !== EXPECTED_PROBE_SHA) throw new Error('frozen counter digest mismatch');
  const baseline = detector(target, 'pristine', join(copy, 'baseline'));
  const results = [];
  for (const m of MUTANTS) {
    const path = join(target, m.file);
    const before = readFileSync(path);
    const source = before.toString('utf8');
    const occurrences = source.split(m.from).length - 1;
    if (occurrences !== 1) {
      results.push({ id: m.id, verdict: 'nomatch', occurrences, before: hash(before) });
      process.stdout.write(`${m.id} nomatch occurrences=${occurrences}\n`);
      continue;
    }
    let changed;
    let run;
    let restored;
    try {
      changed = Buffer.from(source.replace(m.from, m.to));
      writeFileSync(path, changed);
      run = detector(target, `${m.id}:mutated`, join(copy, `${m.id}-mutated`));
    } finally {
      writeFileSync(path, before);
      restored = detector(target, `${m.id}:restored`, join(copy, `${m.id}-restored`));
    }
    const after = hash(readFileSync(path));
    const verdict = !baseline.pass || !restored.pass || after !== hash(before) || run.crash ? 'crash' : run.pass ? 'survived' : 'killed';
    const reason = !baseline.pass ? 'inconclusive: pristine detector failed' : !restored.pass ? 'inconclusive: restored detector failed' : after !== hash(before) ? 'restoration hash mismatch' : run.crash ? 'detector did not complete its twelve arms' : run.pass ? 'frozen counter accepted mutant' : 'frozen counter rejected mutant';
    const result = { id: m.id, verdict, reason, expected: m.expected, baselinePass: baseline.pass, mutatedExit: run.status, restoredPass: restored.pass, before: hash(before), mutated: hash(changed), after, exactRestoration: after === hash(before) };
    results.push(result);
    process.stdout.write(`${m.id} ${verdict} ${JSON.stringify(result)}\n`);
  }
  const killed = results.filter((r) => r.verdict === 'killed').length;
  const unresolved = results.filter((r) => r.verdict !== 'killed').map((r) => `${r.id}:${r.verdict}`);
  process.stdout.write(`MUTANTS78_C1: ${killed === MUTANTS.length ? 'ALL-KILLED' : 'SURVIVORS'} killed=${killed}/${MUTANTS.length}${unresolved.length ? ` unresolved=${unresolved.join(',')}` : ''}\n`);
  status = killed === MUTANTS.length ? 0 : 1;
} catch (e) {
  process.stderr.write(`MUTANTS78_C1: crash ${e.stack}\n`);
} finally {
  if (copy) rmSync(copy, { recursive: true, force: true });
}
process.exitCode = status;
