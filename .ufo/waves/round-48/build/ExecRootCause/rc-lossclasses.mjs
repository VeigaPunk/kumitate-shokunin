#!/usr/bin/env node
// rc-lossclasses.mjs — hunt for loss classes that the F48 counter would still miss.
//
// Each class is a synthetic mutation of a REAL log; the F48 parser is then run on the
// mutated log (by extracting the real parseLog from the frozen counter) and on the
// unmutated one, to see whether F48 notices (exit 2 / fatal) or silently loses data.
//
// Usage: node rc-lossclasses.mjs <log>

import { readFileSync } from 'node:fs';

const logPath = process.argv[2];
if (!logPath) { process.stderr.write('usage: rc-lossclasses.mjs <log>\n'); process.exit(2); }
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
const src = readFileSync(F48_FILE, 'utf8');
const mod = new Function(`
  const die = (m) => { throw new Error('DIE: ' + m); };
  const TRACED = new Set(['execve','execveat','clone','clone3','fork','vfork']);
  ${lift(src, 'parseStrings')}
  ${lift(src, 'parseLog')}
  return { parseLog };
`)();

const orig = readFileSync(logPath, 'utf8');
const origLines = orig.split('\n');

function runF48(text) {
  try {
    const p = mod.parseLog(text);
    return { ok: true, execs: p.execs.length, parent: p.parent.size, resumed: p.resumed, execveat: p.execveat, rootPid: p.rootPid };
  } catch (e) {
    return { ok: false, error: e.message.slice(0, 220) };
  }
}

// Pick a line index carrying a successful execve (rv 0) to mutate.
function isSuccessExecve(line) {
  return /^\d+ +execve\(.*\) += 0$/.test(line) || /^\d+ +<[^>]*execve resumed>.*\) += 0$/.test(line);
}
const execveIdx = origLines.findIndex((l) => isSuccessExecve(l));
const cloneIdx = origLines.findIndex((l) => /^\d+ +(clone3?|fork|vfork)\(.*\) += \d+/.test(l));

const classes = [];

// C1: a record whose return is `= ?` (strace's "unknown result" marker).
if (execveIdx >= 0) {
  const m = origLines[execveIdx].replace(/\) += 0$/, ') = ?');
  const t = origLines.slice(); t[execveIdx] = m;
  classes.push({ name: 'C1 return "= ?" on a successful execve', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C2: strace's errno form on the return: "= -1 ENOENT (No such file or directory)".
if (execveIdx >= 0) {
  const m = origLines[execveIdx].replace(/\) += 0$/, ') = -1 ENOENT (No such file or directory)');
  const t = origLines.slice(); t[execveIdx] = m;
  classes.push({ name: 'C2 errno return on a successful execve', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C3: a record split across two lines without the "<... X resumed>" marker
//     (the body truncated mid-string, e.g. -s truncation, so the return is on a second line).
if (execveIdx >= 0) {
  const l = origLines[execveIdx];
  const cut = Math.floor(l.length / 2);
  const t = origLines.slice();
  t.splice(execveIdx, 1, l.slice(0, cut), l.slice(cut));
  classes.push({ name: 'C3 record split mid-line (no resumed marker)', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C4: a truncated string in the middle of the argv (strace -s truncation) — the path survives
//     but the argv list is cut with "...".
if (execveIdx >= 0) {
  const t = origLines.slice();
  t[execveIdx] = t[execveIdx].replace(/\["[^"]*"/, '["...truncated');
  classes.push({ name: 'C4 truncated argv string', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C5: PID reuse — the same pid is created twice (clone returns the same child pid twice).
if (cloneIdx >= 0) {
  const l = origLines[cloneIdx];
  const m = /^(\d+ )+(clone3?|fork|vfork)\(.*\) += (\d+)$/.exec(l);
  if (m) {
    const t = origLines.slice();
    // make a LATER clone return the same child pid as this one
    let j = -1;
    for (let k = cloneIdx + 1; k < origLines.length; k++) {
      const mm = /^(\d+ )+(clone3?|fork|vfork)\(.*\) += (\d+)$/.exec(origLines[k]);
      if (mm) { j = k; break; }
    }
    if (j >= 0) {
      t[j] = t[j].replace(/\) += \d+$/, `) = ${m[3]}`);
      classes.push({ name: 'C5 pid created twice (clone returns a reused child pid)', before: runF48(orig), after: runF48(t.join('\n')) });
    }
  }
}
// C6: a successful execve whose PID prefix is padded to fewer than 5 columns.
if (execveIdx >= 0) {
  const l = origLines[execveIdx];
  const m = /^(\d+)( +)(.*)$/.exec(l);
  const t = origLines.slice();
  t[execveIdx] = `${m[1].padEnd(5, ' ')} ${m[3]}`;
  classes.push({ name: 'C6 pid prefix padded to 5 columns (pid < 10000)', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C7: an execveat that succeeds (image replacement).
if (execveIdx >= 0) {
  const l = origLines[execveIdx];
  const m = /^(\d+)( +)(.*)$/.exec(l);
  const t = origLines.slice();
  t[execveIdx] = `${m[1]}${m[2]}execveat("/usr/lib/ld.so", AT_EMPTY_PATH, NULL) = 0`;
  classes.push({ name: 'C7 a successful execveat', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C8: a non-traced syscall line in the log (strace with a broader -e set would emit it).
if (execveIdx >= 0) {
  const t = origLines.slice();
  t.splice(execveIdx + 1, 0, '3035302 write(1, "x", 1) = 1');
  classes.push({ name: 'C8 a non-traced syscall line in the log', before: runF48(orig), after: runF48(t.join('\n')) });
}
// C9: a bare "+++" / "---" style strace annotation line (strace prints these for signals etc).
if (execveIdx >= 0) {
  const t = origLines.slice();
  t.splice(execveIdx + 1, 0, '3035302 --- SIGCHLD {si_signo=SIGCHLD, si_code=CLD_EXITED, si_pid=1234} ---');
  classes.push({ name: 'C9 a signal annotation line', before: runF48(orig), after: runF48(t.join('\n')) });
}

const out = { log: logPath, baseline: runF48(orig), classes: [] };
for (const c of classes) {
  out.classes.push({ name: c.name, before: c.before, after: c.after, detected: !c.after.ok || JSON.stringify(c.after) !== JSON.stringify(c.before) });
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
