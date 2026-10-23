#!/usr/bin/env node
// rc-a2lost.mjs — enumerate EVERY record the A2 parser drops, and say what is lost.
//
// A2's return pattern is `\) = ` (exactly one space).  strace column-aligns the return value,
// so a record whose body is short enough is written as `)      = 0`.  Such a record is dropped
// by A2 entirely.  For an execve that means "the exec is not seen"; for a clone it means
// "the child->parent link is not recorded", which breaks every descendant's ancestry chain.
//
// Usage: node rc-a2lost.mjs <log>

import { readFileSync } from 'node:fs';

const logPath = process.argv[2];
if (!logPath) { process.stderr.write('usage: rc-a2lost.mjs <log>\n'); process.exit(2); }
const lines = readFileSync(logPath, 'utf8').split('\n');
const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
const prefixRe = /^(\d+)( +)(.*)$/;
const A2_RET = /\) = (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;
const F48_RET = /\)\s+= (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;

const pending = new Map();
const lost = [];
const kept = [];
for (const line of lines) {
  if (line === '') continue;
  const m = prefixRe.exec(line);
  if (!m) continue;
  const pid = Number(m[1]);
  let body = m[3];
  let resumed = false;
  if (body.endsWith('<unfinished ...>')) {
    const c = /^(\w+)\(/.exec(body);
    pending.set(pid, { call: c ? c[1] : null, text: body.slice(0, -'<unfinished ...>'.length) });
    continue;
  }
  const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
  if (res) {
    const pe = pending.get(pid);
    if (!pe) continue;
    pending.delete(pid);
    body = pe.text + res[2];
    resumed = true;
  }
  const call = /^(\w+)\(/.exec(body);
  if (!call || !TRACED.has(call[1])) continue;
  const a2 = A2_RET.exec(body);
  const f48 = F48_RET.exec(body);
  const rec = { pid, call: call[1], resumed, body, f48rv: f48 ? Number(f48[2] ?? f48[1]) : null };
  if (!a2) lost.push(rec); else kept.push(rec);
}

const summary = {};
for (const r of lost) {
  const cls = `${r.call}${r.resumed ? '_resumed' : '_complete'}_A2_dropped`;
  summary[cls] = (summary[cls] || 0) + 1;
}
console.log(JSON.stringify({
  log: logPath,
  totalTracedRecords: kept.length + lost.length,
  a2Dropped: lost.length,
  byClass: summary,
  // what is lost for each dropped record
  dropped: lost.map((r) => ({
    pid: r.pid, call: r.call, resumed: r.resumed,
    f48_return: r.f48rv,
    isSuccessfulExecve: r.call === 'execve' && r.f48rv === 0,
    isExecveatSuccess: r.call === 'execveat' && r.f48rv === 0,
    isCloneWithChild: (r.call === 'clone' || r.call === 'clone3' || r.call === 'fork' || r.call === 'vfork') && r.f48rv > 0,
    childPid: r.f48rv,
    tail: r.body.slice(-70),
  })),
}, null, 2));
