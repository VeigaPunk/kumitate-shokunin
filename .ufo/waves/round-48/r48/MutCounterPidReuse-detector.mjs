#!/usr/bin/env node
// pidreuse-detector.mjs — bounded behavioral detector for the frozen C1 counter's duplicate-PID guard.
// Usage: node pidreuse-detector.mjs <probe.mjs>
//
// Loads the parser region of <probe.mjs> BYTE-EXACT (slice from `function parseStrings(` to
// `function ancestorsOrSelf(`) and evaluates it with the counter's own die() semantics
// (`CAPROUTE48: ERROR <msg>`, exit 2). Each case runs in its own child process because die() exits.
//
// Cases:
//   clean      distinct PIDs, well-formed trace            expected: PARSE_OK
//   dup-raw    one PID returned by two clone records       expected: exit 2
//   dup-pidns  a raw return and a translated (`/* N in strace's PID NS */`) return of one PID
//                                                            expected: exit 2
// Exit of the driver is always 0; each CASE line carries the child's exit code and message.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';

const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
const HDR = '1000  execve("/usr/bin/node", ["node", "/x/scripts/round-gate.mjs", "--selftest"], 0x7ffd0000 /* 40 vars */) = 0';
const CLONE = (pid) => `1000  clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f00) = ${pid}`;
const CLONE_NS = (raw, ns) => `1000  clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f00) = ${raw} /* ${ns} in strace's PID NS */`;
const EXEC = (pid, prog) => `${pid}  execve("/usr/bin/node", ["node", "/x/scripts/${prog}"], 0x7ffd0000 /* 41 vars */) = 0`;

const CASES = {
  // control: two distinct children, both exec, parses cleanly.
  clean: [HDR, CLONE(1001), EXEC(1001, 'cap-run.mjs'), CLONE(1002), EXEC(1002, 'bwrap.mjs')].join('\n'),
  // attack A: PID 1001 exits (its exec is already recorded) and a later clone returns 1001 again.
  'dup-raw': [HDR, CLONE(1001), EXEC(1001, 'cap-run.mjs'), CLONE(1002), EXEC(1002, 'bwrap.mjs'), CLONE(1001)].join('\n'),
  // attack B: the same PID is denoted untranslated by one record and translated by a second
  // (an untranslated PID-namespace return): both must resolve to the same PID and be refused.
  'dup-pidns': [HDR, CLONE(1001), EXEC(1001, 'cap-run.mjs'), CLONE_NS(2002, 1001)].join('\n'),
  // adjacent coverage shape (not the assigned mutation): the root tracee's PID, which no traced
  // clone created, is later handed out by a clone -- two processes share one PID in the trace.
  'reuse-of-root': [HDR, CLONE(1001), EXEC(1001, 'cap-run.mjs'), CLONE(1000)].join('\n'),
};

const one = process.argv[2] === '--one';
const probe = one ? process.argv[3] : process.argv[2];
const caseName = one ? process.argv[4] : null;

const src = readFileSync(probe, 'utf8');
const a = src.indexOf('function parseStrings(');
const b = src.indexOf('function ancestorsOrSelf(');
if (a < 0 || b <= a) { process.stdout.write('DETECTOR: ERROR parser-region-not-found\n'); process.exit(2); }
const region = src.slice(a, b);
// The counter's own die, verbatim: same prefix, same exit code.
const die = (m) => { process.stdout.write(`CAPROUTE48: ERROR ${m}\n`); process.exit(2); };
let parseLog;
try {
  parseLog = new Function('die', 'TRACED', region + '\nreturn parseLog;')(die, TRACED);
} catch (e) {
  process.stdout.write(`DETECTOR: ERROR parser-region-eval ${e.message}\n`);
  process.exit(2);
}

if (one) {
  const p = parseLog(CASES[caseName]);
  process.stdout.write(`PARSE_OK execs=${p.execs.length} parent=${p.parent.size} root=${p.rootPid}\n`);
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), 'pidreuse-'));
process.stdout.write(`DETECTOR probe=${probe} sha256=${(await import('node:crypto')).createHash('sha256').update(src).digest('hex')} region_bytes=${region.length}\n`);
let dies = 0;
for (const name of Object.keys(CASES)) {
  const f = join(dir, `${name}.strace`);
  writeFileSync(f, CASES[name] + '\n');
  const r = spawnSync(process.execPath, [process.argv[1], '--one', probe, name], { encoding: 'utf8' });
  const out = (r.stdout || '').trim().split('\n').at(-1) || '';
  if (r.status === 2) dies++;
  process.stdout.write(`CASE ${name} exit=${r.status} out=${JSON.stringify(out)}\n`);
}
process.stdout.write(`DETECTOR cases=${Object.keys(CASES).length} exit2=${dies}\n`);
