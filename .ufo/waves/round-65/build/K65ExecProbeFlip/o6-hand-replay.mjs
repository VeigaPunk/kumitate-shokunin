#!/usr/bin/env node
// o6-hand-replay.mjs — runs the FROZEN counter's O6 comparison logic verbatim, outside the counter.
//
// The O6 block is sliced out of .ufo/waves/round-65/probe/omp65-probe.mjs by its `// ---- O6` / `// ---- O7`
// markers (sha256 of the counter is printed so the slice can be tied to committed bytes) and evaluated with
// `new Function` so that no line of the comparison is retyped or edited. Only the surrounding scope is supplied:
//   entryRaw  the entry file under test (a Buffer, exactly as the counter's rd() yields)
//   ids       S### ids taken from the entry's `source:` lines
//   rows      id -> registry line (parsed here from a scratch rows file with the counter's own row regex)
//   T         archive root; the block runs `bash <T>/scripts/omp-binary-probe.sh`, i.e. the lane's probe
// Usage: node o6-hand-replay.mjs <counter.mjs> <entry.md> <lane-dir> [rows.txt]
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const [counterPath, entryPath, laneArg, rowsPath] = process.argv.slice(2);
const COUNTER = resolve(counterPath);
const T = resolve(laneArg);
const RELEASE_COMMIT = '45c35e40c46166dc726ccc52f5d27f40f2449f99';
const src = readFileSync(COUNTER, 'utf8');
const a = src.indexOf('// ---- O6');
const b = src.indexOf('// ---- O7');
if (a < 0 || b < 0 || b < a) { console.error('markers not found'); process.exit(64); }
const block = src.slice(a, b);

const entryRaw = readFileSync(entryPath);
const ids = [...new Set([...entryRaw.toString('utf8').matchAll(/^source:[^\n]*/gm)]
  .flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
const rows = new Map();
if (rowsPath && existsSync(rowsPath)) {
  for (const l of readFileSync(rowsPath, 'utf8').split('\n')) {
    const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(l);
    if (m) rows.set(m[1], l);
  }
}
const results = {}; const miss = [];
const check = (id, ok, why) => { results[id] = ok; if (!ok) miss.push(`${id} MISS ${why}`); };

const fn = new Function('entryRaw', 'ids', 'rows', 'T', 'RELEASE_COMMIT', 'join', 'existsSync', 'spawnSync',
  'check', 'results', 'miss', `${block}\nreturn { results, miss };`);
const out = fn(entryRaw, ids, rows, T, RELEASE_COMMIT, join, existsSync, spawnSync, check, results, miss);

console.log(`COUNTER ${COUNTER} sha256=${createHash('sha256').update(src).digest('hex')} slice_lines=${block.split('\n').length - 1}`);
console.log(`ENTRY ${entryPath} stated_lit_2025_11_25=${/^- lit_2025_11_25=(.*)$/m.exec(entryRaw.toString('utf8'))?.[1]} stated_lit_2026_07_28=${/^- lit_2026_07_28=(.*)$/m.exec(entryRaw.toString('utf8'))?.[1]}`);
console.log(`O6 ok=${out.results.O6} reasons=${out.miss.length ? out.miss.join(';') : '(none)'}`);
process.exit(out.results.O6 ? 0 : 1);
