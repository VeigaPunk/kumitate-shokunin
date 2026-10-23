#!/usr/bin/env node
// rc-renumber.mjs — build a SYNTHETIC strace log from a real one by renumbering PIDs.
//
// Purpose: test hypothesis H2 (the round-48 A2 counter loses every record of a PID below
// 10000, because strace pads the PID prefix to five columns and A2's `^(\d+) (.*)$` leaves a
// leading space in the body).  A synthetic log lets us control the PID widths exactly.
//
// Two modes:
//   --mode below  : every distinct PID is remapped to a distinct value < 10000 (and the
//                    prefix is written with strace's real padding rule: the PID field is
//                    left-justified in a 5-column field, then a space).
//   --mode width  : remap PIDs to a chosen digit width (e.g. 4) so the padding is exercised
//                    without going below 10000.
//
// Usage: node rc-renumber.mjs <in.log> <out.log> --mode below|keep [--limit N]

import { readFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const inPath = argv[0];
const outPath = argv[1];
const mode = argv.includes('--mode') ? argv[argv.indexOf('--mode') + 1] : 'below';
if (!inPath || !outPath) { process.stderr.write('usage: rc-renumber.mjs <in> <out> --mode below|keep\n'); process.exit(2); }

const text = readFileSync(inPath, 'utf8');
const lines = text.split('\n');

// Collect distinct pids in order of first appearance.
const order = [];
const seen = new Set();
for (const line of lines) {
  const m = /^(\d+)( +)/.exec(line);
  if (!m) continue;
  const p = m[1];
  if (!seen.has(p)) { seen.add(p); order.push(p); }
}

// Build the mapping.  'below': assign 1..N distinct small pids (N < 10000 required).
// 'keep': identity.
// 'mixed': the first --k distinct pids (in first-appearance order) are remapped to 1..k
//          (the post-wrap window); the rest keep their original (high) pids.  This models a
//          real host PID-counter wrap inside one log, where only the pids allocated in the
//          window right after the wrap are below 10000.
// 'subtree': the pid given by --target and its descendants (via the clone parent map) are
//          remapped below 10000.  This models a wrap that lands on one branch of the tree.
const map = new Map();
const kIdx = argv.indexOf('--k');
const K = kIdx >= 0 ? Number(argv[kIdx + 1]) : 0;
const tIdx = argv.indexOf('--target');
const TARGET = tIdx >= 0 ? argv[tIdx + 1] : null;
if (mode === 'below') {
  if (order.length > 9999) { process.stderr.write(`too many distinct pids (${order.length}) to map below 10000\n`); process.exit(2); }
  order.forEach((p, i) => map.set(p, String(i + 1)));
} else if (mode === 'mixed') {
  if (K > 9999) { process.stderr.write(`--k must be < 10000\n`); process.exit(2); }
  order.forEach((p, i) => map.set(p, i < K ? String(i + 1) : p));
} else if (mode === 'subtree') {
  if (!TARGET) { process.stderr.write('--subtree needs --target <pid>\n'); process.exit(2); }
  // build the child->parent map from the clone returns in the log
  const childOf = new Map();
  for (const line of lines) {
    const m = /^(\d+)( +)(.*)$/.exec(line);
    if (!m) continue;
    const body = m[3];
    const rm = /^(clone3?|fork|vfork)\(.*\) += (\d+)( \/\* (\d+) in strace's PID NS \*\/)?$/.exec(body);
    if (!rm) continue;
    const child = rm[4] !== undefined ? rm[4] : rm[2];
    childOf.set(child, m[1]);
  }
  const inSub = new Set([TARGET]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [child, par] of childOf) {
      if (inSub.has(par) && !inSub.has(child)) { inSub.add(child); grew = true; }
    }
  }
  let n = 0;
  for (const p of order) if (inSub.has(p)) map.set(p, String(++n));
  process.stderr.write(`subtree: ${inSub.size} pids remapped below 10000 (target ${TARGET})\n`);
} else if (mode === 'reuse') {
  // Model a host PID-counter wrap: the second half of the log re-uses the PID numbers of the
  // first half.  This is what "a PID created twice in one log" means in the F48 counter.
  const half = Math.floor(order.length / 2);
  order.forEach((p, i) => map.set(p, i < half ? p : order[i - half]));
} else {
  for (const p of order) map.set(p, p);
}

// strace's real prefix layout: the PID is printed left-justified in a 5-column field,
// then a single space: e.g. "9879  clone(...)"  and  "3968995 clone(...)".
function prefix(pid) {
  return pid.length >= 5 ? `${pid} ` : `${pid.padEnd(5, ' ')} `;
}

const out = [];
let remapped = 0;
let remappedReturns = 0;
for (const line of lines) {
  if (line === '') { out.push(line); continue; }
  const m = /^(\d+)( +)(.*)$/.exec(line);
  if (!m) { out.push(line); continue; }
  const np = map.get(m[1]);
  let body = m[3];
  // The clone/fork return value IS the child's pid (in strace's PID namespace) and must be
  // renumbered consistently with the child's own record prefix, or the parent map desyncs.
  //   unannotated:  clone(...) = 3185381          -> the number is the child's prefix pid
  //   annotated:    clone(...) = 2 /* 3096452 in strace's PID NS */
  //                 -> the ANNOTATED number is the child's prefix pid; the leading one is the
  //                    pid inside the child's own (inner) namespace and must not change.
  const rm = /^(.*\) += )(\d+)( \/\* )(\d+)( in strace's PID NS \*\/)$/.exec(body);
  if (rm) {
    const c = map.get(rm[4]);
    if (c !== undefined && c !== rm[4]) { body = rm[1] + rm[2] + rm[3] + c + rm[5]; remappedReturns++; }
  } else {
    const cm = /^(.*\) += )(\d+)$/.exec(body);
    if (cm) {
      const c = map.get(cm[2]);
      if (c !== undefined && c !== cm[2]) { body = cm[1] + c; remappedReturns++; }
    }
  }
  if (np === undefined) { out.push(line); continue; }
  if (np !== m[1]) remapped++;
  out.push(prefix(np) + body);
}
writeFileSync(outPath, out.join('\n'));
process.stdout.write(`wrote ${outPath}: ${out.length} lines, ${remapped} prefix lines renumbered, ${remappedReturns} clone/fork returns renumbered, ${order.length} distinct pids, mode=${mode}\n`);
