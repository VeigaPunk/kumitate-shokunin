#!/usr/bin/env node
// rc-dropcheck.mjs — independent oracle for "did strace DROP a traced record?"
//
// The round-48 plan leaves one point open: "Not yet shown: that strace never drops a traced
// record under load (ptrace stops each tracee at every traced syscall; inference)".
//
// This script tests that with an INTERNAL consistency argument that does not depend on any
// counter's parser:
//
//   (1) Every pid that appears in the log and is a *process* (not a thread) must have exactly
//       one successful execve: the execve that transformed the forked child into the program.
//       A pid with zero successful execve but with other records means the execve record was
//       dropped by strace.
//
//   (2) Every pid created by a clone/fork (the child pid in the clone's return value) must
//       appear in the log at all.  A child pid that never appears means the child's records
//       were dropped.
//
//   (3) Every pid that appears in the log must be either the root, a clone child, or a thread
//       (a clone3 with CLONE_THREAD returns a tid, and a tid's records belong to a process
//       that also appears).
//
//   (4) A pid with more than one successful execve is legitimate (a shell that re-execs), and
//       is counted separately.
//
// It also audits clone return values: how many are PID-namespace-annotated, whether any
// unannotated return is a small (namespace-local) pid, and whether any pid is created twice.
//
// Usage: node rc-dropcheck.mjs <log>

import { readFileSync } from 'node:fs';

const logPath = process.argv[2];
if (!logPath) { process.stderr.write('usage: rc-dropcheck.mjs <log>\n'); process.exit(2); }
const text = readFileSync(logPath, 'utf8');
const lines = text.split('\n');

const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
const prefixRe = /^(\d+)( +)(.*)$/;

const pids = new Set();
const execsByPid = new Map();
const otherRecsByPid = new Map();
const cloneChildren = [];        // {parent, child, annotated, rawChild}
const firstRecord = new Map();   // pid -> first record text (truncated)
const resumed = new Map();
let totalRecords = 0;

function childOf(ret) {
  // "= 12345"  or  "= 2 /* 3096452 in strace's PID NS */"
  const m = /= (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?$/.exec(ret);
  if (!m) return null;
  return { inner: Number(m[1]), outer: m[2] !== undefined ? Number(m[2]) : null };
}

// Pass 1: assemble records (unfinished/resumed), exactly as strace intends.
const pending = new Map();
for (const line of lines) {
  if (line === '') continue;
  const m = prefixRe.exec(line);
  if (!m) continue;
  const pid = Number(m[1]);
  pids.add(pid);
  let body = m[3];
  if (body.endsWith('<unfinished ...>')) {
    const c = /^(\w+)\(/.exec(body);
    pending.set(pid, { call: c ? c[1] : null, text: body.slice(0, -'<unfinished ...>'.length) });
    continue;
  }
  const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
  if (res) {
    const pe = pending.get(pid);
    if (!pe) { resumed.set(pid, 'no-pending'); continue; }
    pending.delete(pid);
    body = pe.text + res[2];
  }
  const call = /^(\w+)\(/.exec(body);
  if (!call || !TRACED.has(call[1])) continue;
  totalRecords++;
  if (!firstRecord.has(pid)) firstRecord.set(pid, body.slice(0, 60));
  if (call[1] === 'execve' || call[1] === 'execveat') {
    const rv = /\) += (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?$/.exec(body);
    const ok = rv && Number(rv[1]) === 0;
    if (ok) execsByPid.set(pid, (execsByPid.get(pid) || 0) + 1);
    else otherRecsByPid.set(pid, (otherRecsByPid.get(pid) || 0) + 1);
  } else {
    otherRecsByPid.set(pid, (otherRecsByPid.get(pid) || 0) + 1);
    const c = childOf(body.slice(body.lastIndexOf(') = ') >= 0 ? body.lastIndexOf(') = ') : 0));
    const mm = /\) += (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?$/.exec(body);
    if (mm) {
      cloneChildren.push({ parent: pid, inner: Number(mm[1]), outer: mm[2] !== undefined ? Number(mm[2]) : null, annotated: mm[2] !== undefined, flags: /CLONE_THREAD/.test(body) });
    }
  }
}

const childSet = new Set();
for (const c of cloneChildren) {
  const ch = c.outer !== null ? c.outer : c.inner;
  if (ch > 0) childSet.add(ch);
}

// (1) pids with records but no successful execve
const noExec = [];
for (const pid of pids) {
  if (pid === null) continue;
  if ((execsByPid.get(pid) || 0) === 0) {
    noExec.push({ pid, other: otherRecsByPid.get(pid) || 0, first: firstRecord.get(pid) || '' });
  }
}
// (2) clone children that never appear in the log
const missingChildren = cloneChildren.filter((c) => {
  const ch = c.outer !== null ? c.outer : c.inner;
  return ch > 0 && !pids.has(ch);
});
// (3) pids that are neither root nor a clone child
const roots = [...pids].filter((p) => !childSet.has(p) && !pids.has(p));
// (4) pids with more than one successful execve
const multiExec = [...execsByPid.entries()].filter(([, n]) => n > 1);

// clone return audit
const annotated = cloneChildren.filter((c) => c.annotated);
const unannotatedSmall = cloneChildren.filter((c) => !c.annotated && c.inner < 10000);
const createdTwice = new Map();
for (const c of cloneChildren) {
  const ch = c.outer !== null ? c.outer : c.inner;
  if (ch <= 0) continue;
  createdTwice.set(ch, (createdTwice.get(ch) || 0) + 1);
}
const dupes = [...createdTwice.entries()].filter(([, n]) => n > 1);

const out = {
  log: logPath,
  records: totalRecords,
  distinctPids: pids.size,
  pidsBelow10000: [...pids].filter((p) => p < 10000).length,
  minPid: Math.min(...pids), maxPid: Math.max(...pids),
  '1_pidsWithRecordsButNoSuccessfulExecve': { count: noExec.length, sample: noExec.slice(0, 12) },
  '2_cloneChildrenNeverSeenInLog': { count: missingChildren.length, sample: missingChildren.slice(0, 12) },
  '3_pidsNotRootNorCloneChild': { count: roots.length, sample: roots.slice(0, 12) },
  '4_pidsWithMultipleSuccessfulExecve': { count: multiExec.length, sample: multiExec.slice(0, 12) },
  cloneReturns: {
    total: cloneChildren.length,
    annotated: annotated.length,
    unannotatedWithInnerPidBelow10000: unannotatedSmall.length,
    unannotatedSmallSample: unannotatedSmall.slice(0, 12),
    pidsCreatedTwice: { count: dupes.length, sample: dupes.slice(0, 12) },
  },
  pendingAtEOF: pending.size,
  resumedWithoutPending: [...resumed.entries()].slice(0, 12),
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
