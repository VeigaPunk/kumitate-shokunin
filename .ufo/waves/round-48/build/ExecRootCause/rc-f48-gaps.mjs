#!/usr/bin/env node
// rc-f48-gaps.mjs — look for loss classes that F48 (the round-48 counter's parser) would STILL
// miss — i.e. classes where F48 does not fail closed (exit 2) and does not lose the record.
//
// Every mutation INSERTS lines (never replaces), so the baseline counts stay comparable.
//
// Usage: node rc-f48-gaps.mjs <log>

import { readFileSync } from 'node:fs';

const logPath = process.argv[2];
if (!logPath) { process.stderr.write('usage: rc-f48-gaps.mjs <log>\n'); process.exit(2); }
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
const lines = orig.split('\n');
function runF48(text) {
  try {
    const p = mod.parseLog(text);
    return { ok: true, execs: p.execs.length, parent: p.parent.size, execveat: p.execveat, resumed: p.resumed };
  } catch (e) { return { ok: false, error: e.message.slice(0, 200) }; }
}
const base = runF48(orig);
const results = [];
function probe(name, extraLines, expect) {
  const t = [...lines];
  // insert after the first line, so the root pid is unchanged
  t.splice(1, 0, ...extraLines);
  const after = runF48(t.join('\n'));
  let verdict;
  if (!after.ok) verdict = 'FAILS CLOSED (exit 2)';
  else if (expect === 'same') verdict = (after.execs === base.execs && after.parent === base.parent) ? 'keeps everything (no loss)' : `changes counts: execs ${base.execs}->${after.execs}, parent ${base.parent}->${after.parent}`;
  else verdict = `changes counts: execs ${base.execs}->${after.execs}, parent ${base.parent}->${after.parent}, execveat ${base.execveat}->${after.execveat}`;
  results.push({ name, verdict, before: base, after });
}

probe('G1 a non-TRACED syscall line (openat) in the log',
  ['3035302 openat(AT_FDCWD, "/tmp/x", O_RDONLY) = 3'], 'same');

probe('G2 a clone whose child pid is below 10000 (post-wrap window)',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de90) = 9999'], 'same');

probe('G3 two different clones return the SAME child pid',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de91) = 3035309'], 'same');

probe('G4 an execve with a relative path',
  ['3035302 execve("node", ["node", "x.mjs"], []) = 0'], 'same');

probe('G5 an execve with an empty argv list',
  ['3035302 execve("/bin/x", [], []) = 0'], 'same');

probe('G6 an execve with a NULL envp',
  ['3035302 execve("/bin/x", ["/bin/x"], NULL) = 0'], 'same');

probe('G7 a successful execveat (image replacement)',
  ['3035302 execveat("/usr/lib/ld.so", AT_EMPTY_PATH, NULL) = 0'], 'same');

probe('G8 a failed clone (rv = -1)',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de90) = -1 ENOSYS (Function not implemented)'], 'same');

probe('G9 the same pid execs twice (re-exec)',
  ['3035302 execve("/bin/x", ["/bin/x"], []) = 0'], 'same');

probe('G10 a clone returning a huge child pid (near pid_max)',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de90) = 4194303'], 'same');

probe('G11 an unfinished/resumed pair for a non-traced call',
  ['3035302 openat(AT_FDCWD, "/tmp/x", O_RDONLY <unfinished ...>',
   '3035302 <... openat resumed>) = 3'], 'same');

probe('G12 an unfinished TRACED record that is never resumed',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de90 <unfinished ...>'], 'same');

probe('G13 two unfinished records for the same pid',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de90 <unfinished ...>',
   '3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de91 <unfinished ...>'], 'same');

probe('G14 trailing garbage after the return value',
  ['3035302 execve("/bin/x", ["/bin/x"], []) = 0 garbage'], 'same');

probe('G15 a record whose return is on the next line',
  ['3035302 execve("/bin/x", ["/bin/x"], [])', '3035302 = 0'], 'same');

probe('G16 a clone return in a PID namespace, unannotated inner pid',
  ['3035302 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f025a99de90) = 2 /* 3035399 in strace\'s PID NS */'], 'same');

probe('G17 a successful execve whose argv contains ") = 7" (a decoy return)',
  ['3035302 execve("/bin/x", ["x) = 7"], []) = 0'], 'same');

probe('G18 an empty line in the log',
  [''], 'same');

probe('G19 a line with no pid at all',
  ['strace: Process 999 attached'], 'same');

const out = { log: logPath, baseline: base, classes: results };
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
