#!/usr/bin/env node
// Axes: operability + coverage. Copies only the frozen detector's input surface;
// never edits --lane, the frozen probe, or a sibling's candidate.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { MUTANTS } from './mutations-c2.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROBE = resolve(HERE, '../../probe/probe78-c2.mjs');
const PROBE_SHA = 'a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460';
const SCRATCH = '/fast/scratch/hyaku/kumitate-r78/K78MutC2';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const argv = process.argv.slice(2);
if (argv.length !== 2 || argv[0] !== '--lane') {
  console.error('usage: node mutants-c2.mjs --lane DIR');
  process.exit(64);
}
const source = resolve(argv[1]);
if (hash(readFileSync(PROBE)) !== PROBE_SHA) throw new Error('frozen counter hash mismatch');
mkdirSync(SCRATCH, { recursive: true });
const scratch = mkdtempSync(join(SCRATCH, 'battery-'));
const lane = join(scratch, 'lane');
const target = join(lane, 'scripts/omp-census.mjs');
let killed = 0;
let all = true;
try {
  for (const rel of ['scripts/omp-census.mjs', 'scripts/proxy-check.mjs',
    '.ufo/pins/omp-shape.json', 'corpus/knowledge/omp-agent-root.md']) {
    mkdirSync(dirname(join(lane, rel)), { recursive: true });
    cpSync(join(source, rel), join(lane, rel));
  }
  const pristine = readFileSync(target);
  const before = hash(pristine);
  const text = pristine.toString('utf8');
  console.log(`source=${source}\nprobe_sha256=${PROBE_SHA}\nsource_sha256=${before}`);
  const detect = (label) => {
    const work = join(scratch, 'work');
    mkdirSync(work, { recursive: true });
    const r = spawnSync(process.execPath, [PROBE, '--lane', lane, '--work', work], {
      cwd: lane, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024,
      env: { ...process.env, TMPDIR: work },
    });
    console.log(`DETECTOR ${label} exit=${r.status} signal=${r.signal ?? 'none'} error=${r.error?.message ?? 'none'}`);
    process.stdout.write(r.stdout || '');
    process.stdout.write(r.stderr || '');
    return { healthy: !r.error && !r.signal && [0, 1].includes(r.status)
      && /C78_C2: HELD held=\d+\/11/u.test(r.stdout || ''),
    pass: r.status === 0 && /C78_C2: HELD held=11\/11/u.test(r.stdout || '') };
  };
  const baseline = detect('pristine');
  if (!baseline.pass) {
    console.log('MUTANTS78_C2: INCONCLUSIVE baseline-not-green');
    process.exitCode = 2;
  } else {
    for (const mutant of MUTANTS) {
      let verdict = 'crash';
      let after = before;
      try {
        const changed = mutant.apply(text);
        if (changed === null || changed === text) verdict = 'nomatch';
        else {
          writeFileSync(target, changed);
          after = hash(readFileSync(target));
          const result = detect(mutant.name);
          verdict = !result.healthy ? 'crash' : result.pass ? 'survived' : 'killed';
        }
      } catch (error) {
        console.log(`MUTANT_ERROR ${mutant.name} ${error.message}`);
      } finally {
        writeFileSync(target, pristine);
      }
      const restoredHash = hash(readFileSync(target));
      const restored = detect(`${mutant.name}:restored`);
      if (restoredHash !== before || !restored.pass) {
        verdict = 'crash';
        console.log(`RESTORATION_FAILURE ${mutant.name}`);
      }
      if (verdict === 'killed') killed++;
      else all = false;
      console.log(`MUTANT ${mutant.name} ${verdict} expected=${mutant.expected} before=${before} mutated=${after} restored=${restoredHash}`);
    }
    console.log(`MUTANTS78_C2: ${all ? 'ALL-KILLED' : 'NOT-ALL-KILLED'} killed=${killed}/${MUTANTS.length}`);
    process.exitCode = all ? 0 : 1;
  }
  console.log(`SOURCE_UNCHANGED sha256=${hash(readFileSync(join(source, 'scripts/omp-census.mjs')))}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
