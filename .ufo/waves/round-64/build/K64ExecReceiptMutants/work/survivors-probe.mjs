#!/usr/bin/env node
/**
 * survivors-probe.mjs — second falsifier for the mutants the (selftest + 16 controls) battery let through.
 * Builds a throwaway CLONE of the lane (full history, so the frozen counter's P3 hash resolution and ancestor
 * tests behave as on the real lane), then commits each surviving mutant as a fresh copy of
 * scripts/report-receipt-diff.mjs and runs the FROZEN counter:
 *   node <lane>/.ufo/waves/round-64/probe/receipt64-probe.mjs <clone> <mutant-commit> --report <p5-clean.md> --fleet <fleet>
 * A mutant is killed by the counter when its verdict differs from the pristine baseline verdict.
 *
 *   node survivors-probe.mjs <work-dir> <lane-repo> <fleet-repo> <clone-dir>
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WORK = resolve(process.argv[2]);
const LANE = resolve(process.argv[3]);
const FLEET = resolve(process.argv[4]);
const D = resolve(process.argv[5]);
const REPORT = join(WORK, 'p5-clean.md');
const res = JSON.parse(readFileSync(join(WORK, 'mutant-results.json'), 'utf8'));
const survivors = res.results.filter((r) => r.verdict === 'SURVIVOR').map((r) => r.id);
const pristine = readFileSync(join(WORK, 'report-receipt-diff.mjs'), 'utf8');

const g = (dir, ...a) => spawnSync('git', ['-C', dir, '-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const probe = (rev) => spawnSync('node', [join(D, '.ufo/waves/round-64/probe/receipt64-probe.mjs'), D, rev, '--report', REPORT, '--fleet', FLEET], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

if (g(D, 'rev-parse', '--show-toplevel').stdout.trim() !== D) { process.stderr.write(`clone root mismatch: ${g(D, 'rev-parse', '--show-toplevel').stdout}\n`); process.exit(64); }

function land(text, msg) {
  writeFileSync(join(D, 'scripts/report-receipt-diff.mjs'), text);
  g(D, 'add', 'scripts/report-receipt-diff.mjs');
  const c = g(D, 'commit', '-q', '-m', msg);
  if (c.status !== 0) { process.stderr.write(`commit failed: ${c.stderr}\n`); process.exit(64); }
  return g(D, 'rev-parse', 'HEAD').stdout.trim();
}

const baseRev = g(D, 'rev-parse', 'HEAD').stdout.trim(); // pristine tool is the frozen rev's own bytes
const base = probe(baseRev);
const baseHeld = /held=(\d)\/5/.exec(base.stdout)?.[1];
process.stdout.write(`BASELINE ${base.stdout.trim()}\n`);

const out = [];
for (const id of survivors) {
  const text = readFileSync(join(WORK, 'muts', `mut-${id}.mjs`), 'utf8');
  const rev = land(text, `mutant ${id}`);
  const r = probe(rev);
  const held = /held=(\d)\/5/.exec(r.stdout)?.[1];
  const killed = r.status !== base.status || held !== baseHeld || r.stdout.trim() !== base.stdout.trim().replace(baseRev, rev);
  out.push({ id, rev, status: r.status, held, killed, line: r.stdout.trim() });
  process.stdout.write(`${id} ${killed ? 'KILLED-COUNTER' : 'SURVIVOR-COUNTER'} ${r.stdout.trim()}\n`);
}
writeFileSync(join(WORK, 'survivor-probe-results.json'), JSON.stringify({ baseline: base.stdout.trim(), baselineRev: baseRev, clone: D, results: out }, null, 2));
const k = out.filter((o) => o.killed).map((o) => o.id);
process.stdout.write(`\nCOUNTER-KILLED ${k.length}/${out.length}: ${k.join(',') || '(none)'}\nCOUNTER-SURVIVORS: ${out.filter((o) => !o.killed).map((o) => o.id).join(',') || '(none)'}\n`);
