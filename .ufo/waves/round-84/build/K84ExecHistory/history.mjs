#!/usr/bin/env node
// Bounded historical census, not a replacement for the C84 receipt gate.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const revision = '3794b903324e7eb4aec6d92539f2ca4e2c0b6727';
const expectations = [
  ['c1-probe.txt', 'C83_C1', 28, 27, 1, 27, 27, 'ARMS_TOTAL'],
  ['c1-repair.txt', 'C83_C1R', 28, 28, 0, 28, 28, null],
  ['c2-probe.txt', 'C83_C2', 16, 16, 0, 16, 16, null],
];

try {
  const receipts = expectations.map(([file, expectedPrefix, rows, ok, fail, held, total, finding]) => {
    const sourcePath = `${lane}/.ufo/waves/round-83/close/${file}`;
    const objectPath = `.ufo/waves/round-83/close/${file}`;
    const result = spawnSync('git', ['-C', lane, 'show', `${revision}:${objectPath}`]);
    if (result.error || result.status !== 0) {
      throw new Error(`Cannot read ${revision}:${objectPath}: ${result.error?.message ?? result.stderr.toString()}`);
    }
    const lines = result.stdout.toString('utf8').split(/\r?\n/);
    const arms = lines.flatMap((line, index) => {
      const match = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)(?:\s.*)?$/.exec(line);
      return match ? [{prefix: match[1], name: match[2], status: match[3], line: index + 1}] : [];
    });
    const summaries = lines.flatMap((line, index) => {
      const match = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=(\d+)\/(\d+)$/.exec(line);
      return match ? [{prefix: match[1], verdict: match[2], held: Number(match[3]), denominator: Number(match[4]), line: index + 1, text: line}] : [];
    });
    if (summaries.length !== 1) throw new Error(`${sourcePath}: expected exactly one summary`);
    const summary = summaries[0];
    const okCount = arms.filter(arm => arm.status === 'ok').length;
    const failedArms = arms.filter(arm => arm.status === 'FAIL');
    const findings = [
      ...(summary.denominator !== arms.length ? ['ARMS_TOTAL'] : []),
      ...(summary.held !== okCount ? ['HELD_COUNT'] : []),
      ...(failedArms.length ? ['ARM_FAILED'] : []),
    ];
    const matchesExpected = summary.prefix === expectedPrefix && arms.every(arm => arm.prefix === summary.prefix)
      && arms.length === rows && okCount === ok && failedArms.length === fail
      && summary.held === held && summary.denominator === total && summary.verdict === 'HELD'
      && summary.line > arms.at(-1)?.line && (findings[0] ?? null) === finding;
    return {sourcePath, object: `${revision}:${objectPath}`,
      sha256: createHash('sha256').update(result.stdout).digest('hex'),
      prefix: summary.prefix, armCount: arms.length, okCount, FAILCount: failedArms.length,
      denominator: summary.denominator, summary, failedArms, findings,
      expected: {armCount: rows, okCount: ok, FAILCount: fail, held, denominator: total, firstFinding: finding},
      matchesExpected};
  });
  const matchesExpected = receipts.every(receipt => receipt.matchesExpected);
  console.log(JSON.stringify({revision,
    expectedContradiction: 'c1-probe headline HELD 27/27 hides 28 arm rows and one FAIL; ARMS_TOTAL precedes ARM_FAILED. Repair and C2 have no contradiction.',
    receipts, matchesExpected}, null, 2));
  process.exitCode = matchesExpected ? 0 : 1;
} catch (error) {
  console.error(`HISTORY_CENSUS: ${error.message}`);
  process.exitCode = 2;
}
