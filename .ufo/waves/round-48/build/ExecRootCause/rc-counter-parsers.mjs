#!/usr/bin/env node
// rc-counter-parsers.mjs — extract the *actual* parseLog() from the two frozen counters and
// run them on a log, so the seat's own re-implementation can be checked against them.
//
// The two counters are read as text; their `parseStrings` and `parseLog` function bodies are
// lifted verbatim and evaluated in a sandbox, then applied to a log file.  Nothing is written
// to the lane repo and no counter is executed as a program (no scoring).
//
// Usage: node rc-counter-parsers.mjs <log> [--a2 <path-to-a2.mjs>] [--f48 <path-to-f48.mjs>]

import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const logPath = argv[0];
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt; };
const A2_FILE = opt('--a2', '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs');
const F48_FILE = opt('--f48', '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs');
if (!logPath) { process.stderr.write('usage: rc-counter-parsers.mjs <log>\n'); process.exit(2); }

// Lift a top-level `function NAME(...) { ... }` block by brace matching.
function lift(src, name) {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`function ${name} not found`);
  let i = src.indexOf('{', start);
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { i++; break; } }
  }
  return src.slice(start, i);
}

function loadParser(file) {
  const src = readFileSync(file, 'utf8');
  const parts = [lift(src, 'parseStrings'), lift(src, 'parseLog')];
  const shim = `
    const die = (m) => { throw new Error('DIE: ' + m); };
    const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
    ${parts.join('\n')}
    return { parseLog, parseStrings };
  `;
  // eslint-disable-next-line no-new-func
  return new Function(shim)();
}

const text = readFileSync(logPath, 'utf8');
const results = {};
for (const [tag, file] of [['A2', A2_FILE], ['F48', F48_FILE]]) {
  let mod;
  try { mod = loadParser(file); } catch (e) { results[tag] = { error: `load: ${e.message}` }; continue; }
  try {
    const p = mod.parseLog(text);
    const cands = p.execs.filter((e) => e.pid !== p.rootPid
      && typeof e.argv[1] === 'string' && e.argv[1].endsWith('/scripts/anchor-truth.mjs') && e.argv.includes('--self')
      && e.path.split('/').pop() === 'node');
    results[tag] = {
      execs: p.execs.length,
      parent: p.parent.size,
      rootPid: p.rootPid,
      execveat: p.execveat,
      resumed: p.resumed === undefined ? null : p.resumed,
      at802: cands.length,
      at802argv1Sample: cands.slice(0, 3).map((c) => c.argv[1]),
    };
  } catch (e) {
    results[tag] = { error: e.message.slice(0, 300) };
  }
}
process.stdout.write(JSON.stringify({ log: logPath, results }, null, 2) + '\n');
