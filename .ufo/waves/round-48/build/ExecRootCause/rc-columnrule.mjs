#!/usr/bin/env node
// rc-columnrule.mjs — derive and verify the EXACT rule that decides whether the A2 counter
// loses a record.
//
// Observation (strace 7.2, -f -qq -v -s 8192, default -a column 40):
//   strace prints the return value of a record in a fixed column.  If the record's text up to
//   the closing ')' ends before that column, strace PADS with spaces so that '=' lands in
//   that column; otherwise it writes a single space.
//
//   A2's return pattern is `\) = ` — exactly ONE space between ')' and '='.
//   => A2 loses a record iff the ')' is followed by MORE than one space,
//      i.e. iff the ')' sits at a 0-based index < 38 (so that '=' lands at index 40).
//
// This script checks the rule against every traced record of a log, using the REAL A2 and
// F48 parsers extracted from the frozen counters, and reports the number of false positives
// and false negatives of the rule.
//
// Usage: node rc-columnrule.mjs <log> [<log> ...]

import { readFileSync } from 'node:fs';

const A2_FILE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs';
const F48_FILE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs';
function lift(src, name) {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`function ${name} not found`);
  let i = src.indexOf('{', start); let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}
function load(file) {
  const src = readFileSync(file, 'utf8');
  return new Function(`
    const die = (m) => { throw new Error('DIE: ' + m); };
    const TRACED = new Set(['execve','execveat','clone','clone3','fork','vfork']);
    ${lift(src, 'parseStrings')}
    ${lift(src, 'parseLog')}
    return { parseLog };
  `)();
}
const A2 = load(A2_FILE);
const F48 = load(F48_FILE);

const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
const prefixRe = /^(\d+)( +)(.*)$/;
const A2_RET = /\) = (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;
const F48_RET = /\)\s+= (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/;

for (const logPath of process.argv.slice(2)) {
  const lines = readFileSync(logPath, 'utf8').split('\n');
  // Reassemble records the way strace intends (unfinished + resumed), keeping the ORIGINAL
  // raw line, because the column position is a property of the raw line.
  const pending = new Map();
  const records = [];
  for (const line of lines) {
    if (line === '') continue;
    const m = prefixRe.exec(line);
    if (!m) continue;
    const pid = Number(m[1]);
    let body = m[3];
    let raw = line;
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
    }
    const call = /^(\w+)\(/.exec(body);
    if (!call || !TRACED.has(call[1])) continue;
    records.push({ pid, call: call[1], body, raw, resumed: !!res });
  }

  // The rule: the ')' that A2/F48's return pattern keys on is the LAST ')' before the
  // return value; find it in the RAW line and measure the number of spaces after it.
  let fp = 0; let fn = 0; let agree = 0; let disagree = [];
  const gapHistogram = {};
  for (const r of records) {
    const a2 = A2_RET.exec(r.body);
    const f48 = F48_RET.exec(r.body);
    if (!f48) continue;                      // F48 cannot parse the return: it dies (exit 2)
    // locate the ')' in the raw line that precedes the return value
    const eqIdx = r.raw.lastIndexOf('= ');
    if (eqIdx < 0) continue;
    const closeIdx = r.raw.lastIndexOf(')', eqIdx);
    if (closeIdx < 0) continue;
    const gap = eqIdx - closeIdx - 1;         // number of spaces between ')' and '='
    gapHistogram[gap] = (gapHistogram[gap] || 0) + 1;
    const rulePredictsLost = gap > 1;
    const actuallyLost = !a2;
    if (rulePredictsLost === actuallyLost) agree++;
    else { fn += rulePredictsLost && !actuallyLost ? 1 : 0; fp += !rulePredictsLost && actuallyLost ? 1 : 0; disagree.push({ pid: r.pid, call: r.call, gap, rulePredictsLost, actuallyLost }); }
  }
  console.log(JSON.stringify({
    log: logPath, tracedRecords: records.length, compared: Object.values(gapHistogram).reduce((a, b) => a + b, 0),
    spaceGapHistogram: gapHistogram,
    ruleAgreesWithA2: agree, ruleDisagreements: disagree.length, falsePositives: fp, falseNegatives: fn,
    disagreements: disagree.slice(0, 8),
  }));
}
