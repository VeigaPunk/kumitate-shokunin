#!/usr/bin/env node
// rc-results.mjs — consolidate the seat's measurements into one table.
// Reads a list of logs and emits, per log, the counts the item asks for:
//   successful execve records parsed by each return pattern (A2 `) = `, F48 `)\s+= `, REF),
//   padded resumed records, and the AT802 candidates whose cap-run ancestor is lost under A2.
//
// Usage: node rc-results.mjs <results.json> <log>:<tree> [<log>:<tree> ...]

import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const HERE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/ExecRootCause';
const outFile = process.argv[2];
const specs = process.argv.slice(3);

const rows = [];
for (const spec of specs) {
  const i = spec.lastIndexOf(':');
  const log = spec.slice(0, i);
  const tree = spec.slice(i + 1);
  const p = spawnSync('node', [`${HERE}/rc-parse.mjs`, log, tree, '--json'], { encoding: 'utf8', maxBuffer: 1 << 28 });
  let d;
  try { d = JSON.parse(p.stdout); } catch { rows.push({ log, error: p.stderr.slice(0, 200) }); continue; }
  const r = d.returnPatterns;
  rows.push({
    log,
    tree,
    distinctPids: d.census.distinctPidCount,
    pidsBelow10000: d.census.pidsBelow10000,
    pidDigitHistogram: d.census.pidDigitHistogram,
    gapHistogram: d.census.gapHistogram,
    linesWithPaddedPrefix: d.census.linesWithPaddedPrefix,
    records: d.assembly.records,
    assemblyProblems: d.assembly.problems,
    execveSuccess_REF: r.execveSuccessfulRef,
    execveSuccess_A2: r.execveSuccessfulA2,
    execveSuccess_F48: r.execveSuccessfulF48,
    a2LostExecve: r.execveSuccessfulRef - r.execveSuccessfulA2,
    f48LostExecve: r.execveSuccessfulRef - r.execveSuccessfulF48,
    a2LossClasses: d.a2LossClasses,
    resumedRecords: r.resumedRecords,
    resumedPaddedReturn: r.resumedRecordsPaddedReturn,
    completedPaddedReturn: r.completedRecordsPaddedReturn,
    questionReturn: r.questionReturn,
    errnoReturn: r.errnoReturn,
    cloneReturns_REF: r.cloneReturnsRef,
    cloneReturns_A2: r.cloneReturnsA2,
    cloneReturns_F48: r.cloneReturnsF48,
    at802_A2_n: d.at802.A2.n,
    at802_A2_withRunner: d.at802.A2.withRunner,
    at802_F48_n: d.at802.F48.n,
    at802_F48_withRunner: d.at802.F48.withRunner,
    at802_lostUnderA2: d.at802.lostUnderA2.length,
    at802_lostRunnerUnderA2: d.at802.lostRunnerUnderA2.length,
    judgeAT802_A2: d.judgeAT802.A2,
    judgeAT802_F48: d.judgeAT802.F48,
    simA2: d.simA2,
    simF48: d.simF48,
    pidReuse: d.pidReuse,
  });
}
writeFileSync(outFile, JSON.stringify({ generatedBy: 'ExecRootCause rc-results.mjs', rows }, null, 2) + '\n');
// print a compact table
console.log(['log', 'pids<1e4', 'A2exec', 'F48exec', 'REFexec', 'A2lost', 'resumed', 'resPad', 'compPad', 'at802A2', 'at802F48', 'A2lostCand', 'A2lostRunner'].join('\t'));
for (const r of rows) {
  console.log([
    r.log.split('/').pop(), r.pidsBelow10000, r.execveSuccess_A2, r.execveSuccess_F48, r.execveSuccess_REF,
    r.a2LostExecve, r.resumedRecords, r.resumedPaddedReturn, r.completedPaddedReturn,
    r.at802_A2_n, r.at802_F48_n, r.at802_lostUnderA2, r.at802_lostRunnerUnderA2,
  ].join('\t'));
}
