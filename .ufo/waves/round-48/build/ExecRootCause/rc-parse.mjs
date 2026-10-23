#!/usr/bin/env node
// rc-parse.mjs — independent re-derivation of the round-48 R47-5 root cause.
//
// This file is written from scratch by seat ExecRootCause (round 48, wave 1). It does NOT reuse
// the L1's probe/rc/*.mjs.txt analysis scripts. It reads a strace log and reports, per log:
//
//   * line shape census (pid-prefix gap width, non-pid lines),
//   * record assembly (unfinished/resumed) with an independent implementation,
//   * how many SUCCESSFUL execve records each candidate return pattern recovers
//     (A2: literal ") = " ; F48: "\\)\\s+= " ; reference: last "= <int>" at end of record),
//   * padded resumed records,
//   * the AT802 candidate set (node, argv[1] ends /scripts/anchor-truth.mjs, argv has --self)
//     and, for each candidate, whether a cap-run ancestor is found in the reconstructed ancestry,
//   * other loss classes: clone returns, "= ?" returns, unresumed pending records, pid reuse.
//
// Usage: node rc-parse.mjs <log> [tree-dir] [--json]

import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const argv = process.argv.slice(2);
const json = argv.includes('--json');
const rest = argv.filter((a) => a !== '--json');
const logPath = rest[0];
const tree = rest[1] || null;
if (!logPath) { process.stderr.write('usage: rc-parse.mjs <log> [tree] [--json]\n'); process.exit(2); }

const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
const basenameOf = (p) => (typeof p === 'string' ? p.split('/').pop() : '');

// ---------------------------------------------------------------- C value list
// Independent implementation: parse a strace C string list starting at '['.
function parseStrings(s, i) {
  const out = [];
  if (s[i] !== '[') return [out, i];
  i++;
  while (i < s.length) {
    while (i < s.length && (s[i] === ' ' || s[i] === ',')) i++;
    if (i >= s.length) break;
    if (s[i] === ']') return [out, i + 1];
    if (s[i] === '"') {
      let v = '';
      i++;
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\') {
          const c = s[i + 1];
          if (c === 'x') { v += String.fromCharCode(parseInt(s.slice(i + 2, i + 4), 16)); i += 4; continue; }
          if (c && /[0-7]/.test(c)) { let j = i + 1; let o = ''; while (j < i + 4 && /[0-7]/.test(s[j])) o += s[j++]; v += String.fromCharCode(parseInt(o, 8)); i = j; continue; }
          v += { n: '\n', t: '\t', r: '\r', v: '\v', f: '\f', '"': '"', '\\': '\\' }[c] ?? c;
          i += 2;
          continue;
        }
        v += s[i++];
      }
      i++;
      if (s.startsWith('...', i)) i += 3;
      out.push(v);
      continue;
    }
    if (s.startsWith('/*', i)) { const j = s.indexOf('*/', i); i = j < 0 ? s.length : j + 2; continue; }
    if (s.startsWith('...', i)) { i += 3; continue; }
    const j = s.slice(i).search(/[,\]]/);
    if (j < 0) return [out, s.length];
    i += j;
  }
  return [out, i];
}

// ---------------------------------------------------------------- shared lexer
// Census of the raw file, independent of any counter's parser.
const raw = readFileSync(logPath, 'utf8');
const lines = raw.split('\n');
// Free the raw string: on a 7 MB log the parser's copies would otherwise blow the heap.

const census = {
  lines: lines.length,
  nonEmpty: 0,
  nonPidLines: 0,
  nonPidSamples: [],
  gapHistogram: {},      // number of spaces between pid and body
  pidDigitHistogram: {}, // number of digits in the pid
  linesWithPaddedPrefix: 0,
  maxPid: 0,
  minPid: Infinity,
  distinctPids: new Set(),
};

const prefixRe = /^(\d+)( +)(.*)$/;
for (const line of lines) {
  if (line === '') continue;
  census.nonEmpty++;
  const m = prefixRe.exec(line);
  if (!m) {
    census.nonPidLines++;
    if (census.nonPidSamples.length < 10) census.nonPidSamples.push(line.slice(0, 160));
    continue;
  }
  const digits = m[1].length;
  const gap = m[2].length;
  census.gapHistogram[gap] = (census.gapHistogram[gap] || 0) + 1;
  census.pidDigitHistogram[digits] = (census.pidDigitHistogram[digits] || 0) + 1;
  if (gap > 1) census.linesWithPaddedPrefix++;
  const p = Number(m[1]);
  census.distinctPids.add(p);
  if (p > census.maxPid) census.maxPid = p;
  if (p < census.minPid) census.minPid = p;
}
census.distinctPidCount = census.distinctPids.size;
census.pidsBelow10000 = [...census.distinctPids].filter((p) => p < 10000).length;

// ---------------------------------------------------------------- record assembly
// One assembly pass, keeping for every record: the raw (assembled) text, the syscall name,
// whether it came from a resumed pair, and the raw text of the return tail.
function assemble() {
  const records = [];      // {pid, call, text, resumed, tail}
  const pending = new Map();
  const problems = { noPendingOnResume: 0, pendingAtEOF: 0, secondUnfinished: 0, nonTracedPending: 0 };
  for (const line of lines) {
    if (line === '') continue;
    const m = prefixRe.exec(line);
    if (!m) continue;
    const pid = Number(m[1]);
    let body = m[3];
    let resumed = false;
    if (body.endsWith('<unfinished ...>')) {
      const c = /^(\w+)\(/.exec(body);
      const call = c ? c[1] : null;
      if (!call || !TRACED.has(call)) { problems.nonTracedPending++; continue; }
      if (pending.has(pid)) problems.secondUnfinished++;
      pending.set(pid, { call, text: body.slice(0, -'<unfinished ...>'.length) });
      continue;
    }
    const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
    if (res) {
      const call = res[1];
      if (!TRACED.has(call)) { problems.nonTracedPending++; continue; }
      const pe = pending.get(pid);
      if (!pe) { problems.noPendingOnResume++; continue; }
      pending.delete(pid);
      body = pe.text + res[2];
      resumed = true;
    }
    const call = /^(\w+)\(/.exec(body);
    if (!call || !TRACED.has(call[1])) continue;
    records.push({ pid, call: call[1], text: body, resumed });
  }
  problems.pendingAtEOF = pending.size;
  return { records, problems };
}

const { records, problems } = assemble();

// Return-pattern census over the assembled records.
// A2:  /\) = (-?\d+)…$/      (literal single space)
// F48: /\)\s+= (-?\d+)…$/     (any run of spaces)
// REF: /\)\s*= (-?\d+)…$/     (any spaces incl. none) — the "last integer at end" reading.
const RET_A2 = /\) = (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;
const RET_F48 = /\)\s+= (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;
const RET_REF = /\)\s*=\s*(-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;

const retStat = {
  execveSuccessfulRef: 0, execveSuccessfulA2: 0, execveSuccessfulF48: 0,
  execveFailedRef: 0, execveFailedA2: 0, execveFailedF48: 0,
  execveatSuccessfulRef: 0, execveatSuccessfulA2: 0, execveatSuccessfulF48: 0,
  cloneReturnsRef: 0, cloneReturnsA2: 0, cloneReturnsF48: 0,
  questionReturn: 0, errnoReturn: 0,
  recordsTotal: records.length,
  resumedRecords: 0,
  resumedRecordsPaddedReturn: 0,   // resumed record whose return is preceded by >1 space
  completedRecordsPaddedReturn: 0, // non-resumed record whose return is preceded by >1 space
  recordsNoReturnParsed: 0,
};
// Records whose A2 parse fails but whose F48 parse succeeds, and why.
const a2LossClasses = new Map();
const a2LossSamples = [];

function retMatch(re, text) {
  const m = re.exec(text);
  if (!m) return null;
  return { rv: Number(m[2] ?? m[1]), ns: m[2] !== undefined };
}
function paddedReturn(text) {
  // count spaces immediately before the final "= <int>" of the record
  const m = /\)( +)= (-?\d+)/.exec(text);
  return m ? m[1].length : 0;
}

for (const r of records) {
  if (r.resumed) retStat.resumedRecords++;
  const a2 = retMatch(RET_A2, r.text);
  const f48 = retMatch(RET_F48, r.text);
  const ref = retMatch(RET_REF, r.text);
  if (/\)\s*= \?/.test(r.text)) retStat.questionReturn++;
  if (/\)\s*= -\d+ E[A-Z0-9]+ /.test(r.text)) retStat.errnoReturn++;
  const pad = paddedReturn(r.text);
  if (r.resumed && pad > 1) retStat.resumedRecordsPaddedReturn++;
  if (!r.resumed && pad > 1) retStat.completedRecordsPaddedReturn++;
  if (r.call === 'execve' || r.call === 'execveat') {
    if (ref && ref.rv === 0) {
      retStat.execveSuccessfulRef++;
      if (a2) retStat.execveSuccessfulA2++;
      if (f48) retStat.execveSuccessfulF48++;
      if (!a2) {
        const cls = r.resumed ? `execve_success_lost_A2_resumed_pad${pad}` : `execve_success_lost_A2_complete_pad${pad}`;
        a2LossClasses.set(cls, (a2LossClasses.get(cls) || 0) + 1);
        if (a2LossSamples.length < 40) {
          // what was lost: the exec'd path and argv[1]
          const pm = /^execve\("((?:[^"\\]|\\.)*)"/.exec(r.text);
          const [path] = pm ? parseStrings(`["${pm[1]}"]`, 0)[0] : ['?'];
          let k = r.text.indexOf('[', pm ? pm[0].length : 0);
          const [args] = parseStrings(r.text, k);
          a2LossSamples.push({ pid: r.pid, resumed: r.resumed, path, argv1: args[1], isSelf: typeof args[1] === 'string' && args[1].endsWith('/scripts/anchor-truth.mjs'), isCapRun: typeof args[1] === 'string' && args[1].endsWith('/scripts/cap-run.mjs'), tail: r.text.slice(-60) });
        }
      }
    } else if (ref && ref.rv !== 0) {
      retStat.execveFailedRef++;
      if (a2) retStat.execveFailedA2++;
      if (f48) retStat.execveFailedF48++;
    } else {
      retStat.recordsNoReturnParsed++;
    }
  } else {
    if (ref && ref.rv > 0) {
      retStat.cloneReturnsRef++;
      if (a2) retStat.cloneReturnsA2++;
      if (f48) retStat.cloneReturnsF48++;
    }
  }
}

// ---------------------------------------------------------------- sim: A2 semantics
// A2's parseLog, re-implemented from the plan/counter description (prefix "one space",
// return ") = ", silent skip on anything unparsed).
function simA2() {
  const execs = [];
  const parent = new Map();
  const pending = new Map();
  let rootPid = null;
  let execveat = 0;
  let seq = 0;
  const dropped = { prefix: 0, noReturn: 0, bodyLeadSpace: 0, callMismatch: 0 };
  for (const line of lines) {
    if (line === '') continue;
    const m = /^(\d+) (.*)$/.exec(line);
    if (!m) { dropped.prefix++; continue; }
    const pid = Number(m[1]);
    let body = m[2];
    if (body.endsWith('<unfinished ...>')) { pending.set(pid, body.slice(0, -'<unfinished ...>'.length)); continue; }
    const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
    if (res) { body = (pending.get(pid) || `${res[1]}(`) + res[2]; pending.delete(pid); }
    const call = /^(execveat|execve|clone3?|v?fork)\(/.exec(body);
    if (!call) { dropped.callMismatch++; continue; }
    const ret = RET_A2.exec(body);
    if (!ret) { dropped.noReturn++; continue; }
    const rv = Number(ret[2] ?? ret[1]);
    if (call[1] === 'execveat') { if (rv === 0) execveat++; continue; }
    if (call[1] === 'execve') {
      if (rv !== 0) continue;
      const pm = /^execve\("((?:[^"\\]|\\.)*)"/.exec(body);
      if (!pm) continue;
      const [path] = parseStrings(`["${pm[1]}"]`, 0)[0];
      let k = body.indexOf('[', pm[0].length);
      const [args, k2] = parseStrings(body, k);
      k = body.indexOf('[', k2);
      // The envp list is NOT retained (it is the memory hog on a 7 MB log and the seat's judge
      // does not use it); only its length is recorded.
      const [envp] = k >= 0 ? parseStrings(body, k) : [[]];
      if (rootPid === null) rootPid = pid;
      execs.push({ pid, seq: seq++, path, argv: args, envpLen: envp.length });
    } else if (rv > 0) {
      parent.set(rv, pid);
    }
  }
  return { execs, parent, rootPid, execveat, dropped, pendingLeft: pending.size };
}

// ---------------------------------------------------------------- sim: F48 semantics
// F48's parseLog, re-implemented (prefix "one or more spaces", return "\\)\\s+= ", fail closed).
function simF48() {
  const execs = [];
  const parent = new Map();
  const pending = new Map();
  let rootPid = null;
  let execveat = 0;
  let seq = 0;
  let resumed = 0;
  const fatal = [];
  for (const line of lines) {
    if (line === '') continue;
    const m = /^(\d+) +(.*)$/.exec(line);
    if (!m) { fatal.push(`unparsed trace line: ${JSON.stringify(line.slice(0, 120))}`); continue; }
    const pid = Number(m[1]);
    let body = m[2];
    if (body.endsWith('<unfinished ...>')) {
      const c = /^(\w+)\(/.exec(body);
      if (!c || !TRACED.has(c[1])) continue;
      if (pending.has(pid)) { fatal.push(`second unfinished record for pid ${pid}`); continue; }
      pending.set(pid, { call: c[1], body: body.slice(0, -'<unfinished ...>'.length) });
      continue;
    }
    const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
    if (res) {
      if (!TRACED.has(res[1])) continue;
      const pe = pending.get(pid);
      if (!pe || pe.call !== res[1]) { fatal.push(`resumed ${res[1]} with no pending entry for pid ${pid}`); continue; }
      pending.delete(pid);
      body = pe.body + res[2];
      resumed++;
    }
    const call = /^(\w+)\(/.exec(body);
    if (!call || !TRACED.has(call[1])) continue;
    const ret = RET_F48.exec(body);
    if (!ret) { fatal.push(`unparsed return in ${call[1]} of pid ${pid}: ${JSON.stringify(body.slice(0, 60))}…${JSON.stringify(body.slice(-60))}`); continue; }
    const rv = Number(ret[2] ?? ret[1]);
    if (call[1] === 'execveat') { if (rv === 0) execveat++; continue; }
    if (call[1] === 'execve') {
      if (rv !== 0) continue;
      const pm = /^execve\("((?:[^"\\]|\\.)*)"/.exec(body);
      if (!pm) { fatal.push(`unparsed execve line: ${body.slice(0, 120)}`); continue; }
      const [path] = parseStrings(`["${pm[1]}"]`, 0)[0];
      let k = body.indexOf('[', pm[0].length);
      const [args, k2] = parseStrings(body, k);
      k = body.indexOf('[', k2);
      const [envp] = k >= 0 ? parseStrings(body, k) : [[]];
      if (rootPid === null) rootPid = pid;
      execs.push({ pid, seq: seq++, path, argv: args, envpLen: envp.length });
    } else if (rv > 0) {
      if (parent.has(rv)) { fatal.push(`pid ${rv} created twice in one log`); continue; }
      parent.set(rv, pid);
    }
  }
  if (pending.size > 0) fatal.push(`${pending.size} traced record(s) never resumed`);
  return { execs, parent, rootPid, execveat, resumed, fatal, pendingLeft: pending.size };
}

const A2 = simA2();
const F48 = simF48();

// ---------------------------------------------------------------- AT802 candidate + ancestry
// AT802 (round-47 set): a node exec whose argv[1] ends '/scripts/anchor-truth.mjs' and whose
// argv contains '--self'.  "cap-run ancestor" = an ancestor PID (via the clone parent map) that
// exec'd node <tree>/scripts/cap-run.mjs, recorded before the candidate.
function isNodeExec(x) { return basenameOf(x.path) === 'node'; }
function at802Match(x) {
  return isNodeExec(x) && typeof x.argv[1] === 'string' && x.argv[1].endsWith('/scripts/anchor-truth.mjs') && x.argv.includes('--self');
}
function ancestors(p, pid) {
  const out = [pid];
  const seen = new Set(out);
  let q = p.parent.get(pid);
  while (q !== undefined && !seen.has(q)) { seen.add(q); out.push(q); q = p.parent.get(q); }
  return out;
}
function analyse(sim) {
  const runnerFile = tree ? join(tree, 'scripts', 'cap-run.mjs') : null;
  const cands = sim.execs.filter((e) => e.pid !== sim.rootPid && at802Match(e));
  const detail = cands.map((e) => {
    const anc = ancestors(sim, e.pid);
    let haveRunner = false;
    let runnerPid = null;
    for (const pid of anc) {
      const before = sim.execs.filter((x) => x.pid === pid && x.seq < e.seq);
      for (const x of before) {
        if (!isNodeExec(x)) continue;
        if (runnerFile && x.argv[1] === runnerFile) { haveRunner = true; runnerPid = pid; }
        else if (!runnerFile && typeof x.argv[1] === 'string' && x.argv[1].endsWith('/scripts/cap-run.mjs')) { haveRunner = true; runnerPid = pid; }
      }
    }
    return { pid: e.pid, seq: e.seq, argv1: e.argv[1], haveRunner, runnerPid, ancestors: anc.length };
  });
  return { n: cands.length, withRunner: detail.filter((d) => d.haveRunner).length, withoutRunner: detail.filter((d) => !d.haveRunner), detail };
}
const A2at = analyse(A2);
const F48at = analyse(F48);

// Which F48 candidates are missing from A2 (or lose their runner) under A2?
// NB: A2 and F48 assign different `seq` numbers (A2 drops records), so candidates are keyed
// by pid + argv[1] + the occurrence index within that pid, not by seq.
function keyOf(d) { return `${d.pid}|${d.argv1}`; }
const a2Cands = new Set(A2at.detail.map(keyOf));
const lost = F48at.detail.filter((d) => !a2Cands.has(keyOf(d)));
const lostRunner = F48at.detail.filter((d) => a2Cands.has(keyOf(d))
  && !A2at.detail.find((x) => keyOf(x) === keyOf(d)).haveRunner);

// ---------------------------------------------------------------- full chain judge
// The counter's own judge for a site: the ordered chain
//   R (node <tree>/scripts/cap-run.mjs) → S (/usr/bin/systemd-run --scope with the props)
//   → B (/usr/bin/bwrap with --unshare-pid --clearenv --die-with-parent) → the child exec,
// each recorded before the next and each in the ancestry of the next.
// Re-implemented here independently (the counters' `judge()` is not reused).
function scopePropsOf(x) {
  const props = new Map();
  let scope = false;
  for (let i = 1; i < x.argv.length && x.argv[i] !== '--'; i++) {
    const a = x.argv[i];
    if (a === '--scope') scope = true;
    let kv = null;
    if ((a === '-p' || a === '--property') && i + 1 < x.argv.length) kv = x.argv[++i];
    else if (a.startsWith('--property=')) kv = a.slice('--property='.length);
    else if (a.startsWith('-p') && a.length > 2) kv = a.slice(2);
    if (kv && kv.includes('=')) props.set(kv.slice(0, kv.indexOf('=')), kv.slice(kv.indexOf('=') + 1));
  }
  return { scope, props };
}
const isScopeExec = (x) => {
  if (x.path !== '/usr/bin/systemd-run') return false;
  const { scope, props } = scopePropsOf(x);
  const mm = /^(\d+)M$/.exec(props.get('MemoryMax') || '');
  const tm = /^(\d+)$/.exec(props.get('TasksMax') || '');
  return scope && props.get('MemorySwapMax') === '0' && mm && Number(mm[1]) <= 1024 && tm && Number(tm[1]) <= 256;
};
const isBwrapExec = (x) => x.path === '/usr/bin/bwrap' && ['--unshare-pid', '--clearenv', '--die-with-parent'].every((f) => x.argv.includes(f));

function judgeSite(sim, siteMatch, runnerFile) {
  const cands = sim.execs.filter((e) => e.pid !== sim.rootPid && siteMatch(e));
  const why = new Set();
  let capped = 0;
  for (const e of cands) {
    const anc = ancestors(sim, e.pid);
    const before = (pid, seqMax) => sim.execs.filter((x) => x.pid === pid && x.seq < seqMax);
    let haveR = false; let haveS = false; let haveB = false; let chain = false;
    for (const bp of anc) {
      for (const B of before(bp, e.seq).filter(isBwrapExec)) {
        haveB = true;
        for (const sp of ancestors(sim, B.pid)) {
          for (const S of before(sp, B.seq).filter(isScopeExec)) {
            haveS = true;
            for (const rp of ancestors(sim, S.pid)) {
              if (before(rp, S.seq).some((R) => isNodeExec(R) && R.argv[1] === runnerFile)) { haveR = true; chain = true; }
            }
          }
        }
      }
    }
    if (!haveB) why.add('no_bwrap_ancestor');
    if (!haveS) why.add('no_capped_scope_ancestor');
    if (!haveR) why.add('no_cap_run_ancestor');
    if (chain) capped++;
  }
  return { n: cands.length, capped, why: [...why] };
}
const runnerFile = tree ? join(tree, 'scripts', 'cap-run.mjs') : null;
const judgeA2 = runnerFile ? judgeSite(A2, at802Match, runnerFile) : null;
const judgeF48 = runnerFile ? judgeSite(F48, at802Match, runnerFile) : null;

// ---------------------------------------------------------------- pid reuse
// PIDs that appear as a clone return value more than once (reuse), and pids that are created
// but never appear again (unresolved).  F48 treats a double creation as exit 2.
const cloneChildCount = new Map();
for (const r of records) {
  if (r.call === 'execve' || r.call === 'execveat') continue;
  const ref = retMatch(RET_REF, r.text);
  if (ref && ref.rv > 0) cloneChildCount.set(ref.rv, (cloneChildCount.get(ref.rv) || 0) + 1);
}
const reusedPids = [...cloneChildCount.entries()].filter(([, c]) => c > 1);

// ---------------------------------------------------------------- report
const report = {
  log: logPath,
  tree,
  census: {
    lines: census.lines,
    nonEmpty: census.nonEmpty,
    nonPidLines: census.nonPidLines,
    nonPidSamples: census.nonPidSamples,
    gapHistogram: census.gapHistogram,
    pidDigitHistogram: census.pidDigitHistogram,
    linesWithPaddedPrefix: census.linesWithPaddedPrefix,
    distinctPidCount: census.distinctPidCount,
    pidsBelow10000: census.pidsBelow10000,
    minPid: census.minPid === Infinity ? null : census.minPid,
    maxPid: census.maxPid,
  },
  assembly: { problems, records: records.length },
  returnPatterns: retStat,
  a2LossClasses: Object.fromEntries(a2LossClasses),
  a2LossSamples,
  simA2: { execs: A2.execs.length, parent: A2.parent.size, rootPid: A2.rootPid, execveat: A2.execveat, dropped: A2.dropped, pendingLeft: A2.pendingLeft },
  simF48: { execs: F48.execs.length, parent: F48.parent.size, rootPid: F48.rootPid, execveat: F48.execveat, resumed: F48.resumed, fatal: F48.fatal.slice(0, 10), fatalCount: F48.fatal.length, pendingLeft: F48.pendingLeft },
  at802: {
    A2: { n: A2at.n, withRunner: A2at.withRunner, withoutRunner: A2at.withoutRunner.slice(0, 10) },
    F48: { n: F48at.n, withRunner: F48at.withRunner, withoutRunner: F48at.withoutRunner.slice(0, 10) },
    lostUnderA2: lost.map((d) => ({ pid: d.pid, seq: d.seq, argv1: d.argv1 })),
    lostRunnerUnderA2: lostRunner.map((d) => ({ pid: d.pid, seq: d.seq, argv1: d.argv1 })),
  },
  judgeAT802: { A2: judgeA2, F48: judgeF48 },
  pidReuse: { cloneChildCreations: cloneChildCount.size, reusedPids: reusedPids.slice(0, 20), reusedCount: reusedPids.length },
};

if (json) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  const p = report;
  const L = [];
  L.push(`LOG ${p.log}`);
  L.push(`  tree=${p.tree}`);
  L.push(`  lines=${p.census.lines} nonEmpty=${p.census.nonEmpty} nonPidLines=${p.census.nonPidLines} paddedPrefixLines=${p.census.linesWithPaddedPrefix}`);
  L.push(`  gapHistogram=${JSON.stringify(p.census.gapHistogram)}`);
  L.push(`  pidDigitHistogram=${JSON.stringify(p.census.pidDigitHistogram)}`);
  L.push(`  distinctPids=${p.census.distinctPidCount} pidsBelow10000=${p.census.pidsBelow10000} min=${p.census.minPid} max=${p.census.maxPid}`);
  if (p.census.nonPidSamples.length) L.push(`  nonPidSamples=${JSON.stringify(p.census.nonPidSamples)}`);
  L.push(`  assembly problems=${JSON.stringify(p.assembly.problems)} records=${p.assembly.records}`);
  L.push(`  returnPatterns=${JSON.stringify(p.returnPatterns)}`);
  L.push(`  a2LossClasses=${JSON.stringify(p.a2LossClasses)}`);
  L.push(`  simA2=${JSON.stringify(p.simA2)}`);
  L.push(`  simF48=${JSON.stringify(p.simF48)}`);
  L.push(`  at802.A2=${JSON.stringify(p.at802.A2)}`);
  L.push(`  at802.F48=${JSON.stringify(p.at802.F48)}`);
  L.push(`  at802.lostUnderA2=${JSON.stringify(p.at802.lostUnderA2)}`);
  L.push(`  at802.lostRunnerUnderA2=${JSON.stringify(p.at802.lostRunnerUnderA2)}`);
  L.push(`  judgeAT802=${JSON.stringify(p.judgeAT802)}`);
  L.push(`  pidReuse=${JSON.stringify(p.pidReuse)}`);
  process.stdout.write(L.join('\n') + '\n');
}
