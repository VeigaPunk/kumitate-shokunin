#!/usr/bin/env node
// rc-surgical.mjs — what does the AT802 judge say when A2 loses exactly ONE record?
//
// Two surgical mutations of a real log, each emulating precisely what A2's `\) = ` pattern
// misses (a record whose return value strace column-aligned away from ")"):
//
//   S1: the cap-run RUNNER's own execve record is the lost one
//       -> the AT802 candidate is still found, but its chain has no cap-run ancestor
//          => judge why = ["no_cap_run_ancestor"]
//   S2: the AT802 CANDIDATE's own execve record is the lost one
//       -> the candidate is not found at all => n drops (exec_count_ne_base)
//
// Usage: node rc-surgical.mjs <log> <tree>

import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const logPath = process.argv[2];
const tree = process.argv[3];
if (!logPath || !tree) { process.stderr.write('usage: rc-surgical.mjs <log> <tree>\n'); process.exit(2); }

const HERE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/ExecRootCause';
// reuse the seat's own parser/judge by importing it as a module is not possible (it is a
// script), so call it as a child process on the mutated logs.
const lines = readFileSync(logPath, 'utf8').split('\n');

// Find the pid that execs cap-run.mjs (the runner R) and the pid of an AT802 candidate.
const runnerPid = lines.find((l) => /^(\d+) +execve\("[^"]*", \["[^"]*", "[^"]*\/scripts\/cap-run\.mjs"/.test(l))?.match(/^(\d+)/)?.[1];
const candPid = lines.find((l) => /^(\d+) +execve\("[^"]*", \["[^"]*", "[^"]*\/scripts\/anchor-truth\.mjs", "--self"/.test(l))?.match(/^(\d+)/)?.[1];
if (!runnerPid || !candPid) { process.stderr.write(`runnerPid=${runnerPid} candPid=${candPid}\n`); process.exit(2); }

// Emulate A2's blind spot: rewrite the record's return so that the gap between ")" and "="
// is not exactly one space (which is what strace's column alignment produces for a short
// record).  A2's `\) = ` then fails to match and the record is skipped.
function blankReturn(line) {
  return line.replace(/\) += (-?\d+)(.*)$/, (m, rv, rest) => `)          = ${rv}${rest}`);
}

const out = [];
for (const l of lines) {
  const m = /^(\d+) +/.exec(l);
  if (m && m[1] === runnerPid && /\/scripts\/cap-run\.mjs/.test(l)) { out.push(blankReturn(l)); continue; }
  if (m && m[1] === candPid && /\/scripts\/anchor-truth\.mjs/.test(l) && /--self/.test(l)) { out.push(blankReturn(l)); continue; }
  out.push(l);
}
const s1 = `${logPath}.s1-runner-lost.log`;
const s2 = `${logPath}.s2-candidate-lost.log`;
const o1 = lines.map((l) => {
  const m = /^(\d+) +/.exec(l);
  return (m && m[1] === runnerPid && /\/scripts\/cap-run\.mjs/.test(l)) ? blankReturn(l) : l;
});
const o2 = lines.map((l) => {
  const m = /^(\d+) +/.exec(l);
  return (m && m[1] === candPid && /\/scripts\/anchor-truth\.mjs/.test(l) && /--self/.test(l)) ? blankReturn(l) : l;
});
writeFileSync(s1, o1.join('\n'));
writeFileSync(s2, o2.join('\n'));

console.log(`runnerPid=${runnerPid} candidatePid=${candPid}`);
for (const [tag, f] of [['baseline', logPath], ['S1 runner record lost', s1], ['S2 candidate record lost', s2]]) {
  const r = spawnSync('node', [`${HERE}/rc-parse.mjs`, f, tree], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const m = /judgeAT802=(\{.*\})/.exec(r.stdout);
  console.log(`  ${tag}: ${m ? m[1] : r.stdout.slice(0, 200) + r.stderr.slice(0, 200)}`);
}
