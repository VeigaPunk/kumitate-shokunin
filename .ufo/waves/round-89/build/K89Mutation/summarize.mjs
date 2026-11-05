#!/usr/bin/env node
/**
 * summarize.mjs — read the per-mutant receipts and emit summary.json + summary.txt.
 *
 *   node summarize.mjs --build <build-dir>
 *
 * For every mutant: did it survive the FROZEN probe (30/30 HELD)? did it survive its own
 * --selftest (PASS)? which exact probe arm / selftest case killed it? A mutant that survives BOTH
 * is reported as a coverage hole (COVERAGE_HOLE), never as a kill.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const i = process.argv.indexOf('--build');
const build = resolve(i >= 0 ? process.argv[i + 1] : '.');
const R = join(build, 'receipts');
const manifest = JSON.parse(readFileSync(join(build, 'mutants', 'manifest.json'), 'utf8'));
const known = new Set(manifest.mutants.map((m) => m.id));
known.add('baseline');
const ids = readdirSync(R).filter((f) => f.endsWith('.probe.txt'))
  .map((f) => f.replace(/\.probe\.txt$/, '')).filter((id) => known.has(id)).sort();

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

function probeScore(id) {
  const txt = read(join(R, `${id}.probe.txt`));
  const verdict = (txt.match(/^C89_C1: .*$/m) || [''])[0];
  const fails = [...txt.matchAll(/^ARM (\S+): FAIL (.*)$/gm)].map((m) => ({ arm: m[1], detail: m[2] }));
  const passes = [...txt.matchAll(/^ARM (\S+): PASS/gm)].map((m) => m[1]);
  const exit = Number((txt.match(/^probe_exit=(\d+)$/m) || [0, ''])[1]);
  return {
    survived: /^C89_C1: HELD/.test(verdict), verdict, exit,
    held: Number((verdict.match(/held=(\d+)\/(\d+)/) || [0, 0, 0])[1]) || 0,
    arms: Number((verdict.match(/held=(\d+)\/(\d+)/) || [0, 0, 0])[2]) || 0,
    failingArms: fails, passingArms: passes.length,
  };
}
function selftestScore(id) {
  const txt = read(join(R, `${id}.selftest.txt`));
  const verdict = (txt.match(/^RECEIPT_BIND_SELFTEST: (PASS|FAIL) held=\d+\/\d+$/m) || [''])[0];
  const fails = [...txt.matchAll(/^RECEIPT_BIND_SELFTEST arm (\S+) FAIL/gm)].map((m) => m[1]);
  const held = (txt.match(/held=(\d+)\/(\d+)/) || [0, 0, 0]);
  const exit = Number((txt.match(/^selftest_exit=(\d+)$/m) || [0, ''])[1]);
  return {
    survived: /^RECEIPT_BIND_SELFTEST: PASS/.test(verdict), verdict, exit,
    held: Number(held[1]) || 0, arms: Number(held[2]) || 0, failingArms: fails,
    crash: !verdict && !/RECEIPT_BIND_SELFTEST/.test(txt) ? (txt.trim().split('\n').slice(-3).join(' | ') || 'no output') : null,
  };
}

const byId = new Map(manifest.mutants.map((m) => [m.id, m]));
const rows = [];
for (const id of ids) {
  const p = probeScore(id);
  const s = selftestScore(id);
  const meta = byId.get(id) || { id, behaviour: '(baseline)', kind: 'baseline', sites: 0, sha256: null };
  const verdict = id === 'baseline' ? 'BASELINE'
    : p.survived && s.survived ? 'COVERAGE_HOLE'
      : p.survived ? 'SELFTEST_ONLY'
        : s.survived ? 'PROBE_ONLY'
          : 'KILLED';
  rows.push({
    id, behaviour: meta.behaviour, kind: meta.kind, sites: meta.sites, sha256: meta.sha256,
    survivedProbe: p.survived, probeVerdict: p.verdict, probeExit: p.exit, probeHeld: `${p.held}/${p.arms}`,
    survivedSelftest: s.survived, selftestVerdict: s.verdict, selftestExit: s.exit,
    selftestHeld: `${s.held}/${s.arms}`,
    killedByProbeArms: p.failingArms.map((f) => f.arm),
    independentProbeArms: p.failingArms.map((f) => f.arm).filter((a) => a !== 'selftest'),
    probeKillIndependent: p.failingArms.some((f) => f.arm !== 'selftest'),
    killedBySelftestCases: s.failingArms,
    probeFailDetail: p.failingArms,
    selftestCrash: s.crash,
    verdict,
  });
}
const order = { KILLED: 0, PROBE_ONLY: 1, SELFTEST_ONLY: 2, COVERAGE_HOLE: 3 };
rows.sort((a, b) => (order[a.verdict] - order[b.verdict]) || a.id.localeCompare(b.id));
const counts = rows.reduce((acc, r) => { acc[r.verdict] = (acc[r.verdict] || 0) + 1; return acc; }, {});
const singles = rows.filter((r) => r.kind === 'single');
const summary = {
  build, rev: process.env.REV || null,
  probe: '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-89/probe/probe89-c1.mjs',
  candidateSha256: manifest.srcSha256, candidate: manifest.src,
  totals: {
    mutants: rows.filter((r) => r.kind !== 'baseline').length,
    singles: singles.length,
    composites: rows.filter((r) => r.kind === 'composite').length,
    ...counts,
  },
  aggregates: {
    killedByIndependentProbeArm: rows.filter((r) => r.kind !== 'baseline' && r.independentProbeArms.length > 0).length,
    killedOnlyThroughSelftestArm: rows.filter((r) => r.kind !== 'baseline' && !r.survivedProbe && !r.probeKillIndependent).map((r) => r.id),
    surviveBoth: rows.filter((r) => r.kind !== 'baseline' && r.survivedProbe && r.survivedSelftest).map((r) => r.id),
    surviveBothAndDropAClaimedBehaviour: rows.filter((r) => r.kind !== 'baseline' && r.survivedProbe && r.survivedSelftest &&
      ['realpath-lane-off', 'realpath-final-component-followed', 'composite-realpath-final-and-arm-dropped', 'mode-read-at-head', 'external-symlink-instrument-disabled', 'composite-external-symlink-and-arm-dropped'].includes(r.id)).map((r) => r.id),
  },
  rows,
};
writeFileSync(join(build, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
const lines = [
  `# K89Mutation summary (probe89-c1 @ ${summary.rev})`,
  `candidate sha256=${summary.candidateSha256}`,
  `mutants=${rows.length} singles=${singles.length} composites=${rows.length - singles.length} ` +
  Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' '),
  '',
  '| mutant | kind | probe | selftest | killed by | verdict |',
  '|---|---|---|---|---|---|',
];
for (const r of rows) {
  const killed = [...r.killedByProbeArms.map((a) => `probe:${a}`), ...r.killedBySelftestCases.map((a) => `selftest:${a}`)].join(', ');
  lines.push(`| ${r.id} | ${r.kind} | ${r.survivedProbe ? `HELD ${r.probeHeld}` : `UNMET ${r.probeHeld}`} | ${r.survivedSelftest ? `PASS ${r.selftestHeld}` : `FAIL ${r.selftestHeld}`} | ${killed || '—'} | ${r.verdict} |`);
}
writeFileSync(join(build, 'summary.txt'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
