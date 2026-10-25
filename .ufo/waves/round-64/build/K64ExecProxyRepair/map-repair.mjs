#!/usr/bin/env node
/**
 * map-repair.mjs — apply the round-64 D1 repair (the tenth R56-V3 recurrence)
 * to a *scratch copy* of the lane, so the proxy repair can be proven on a tree
 * whose corpus map is complete. This is the readme-map maintenance repair the
 * round-64 plan assigns to the L1, reproduced here as a fixture applier; it
 * writes nothing outside `--lane`.
 *
 *   node map-repair.mjs [--lane DIR]
 *
 * Two edits, both idempotent:
 *   1. `corpus/README.md` gains the map row for
 *      `lessons/round-63-verifier-spotcheck.md` (the file the spotcheck's own
 *      D1 names), inserted after the `lessons/round-63.md` row.
 *   2. `.ufo/pins/readme-map.json` `covered` gains the same path (readme-map v2
 *      scores pinned members by lstat, so a row alone is not enough).
 *
 * Prints `MAP_REPAIR: APPLIED|NOOP (readme=<row|present> covered=<added|present>)`,
 * exit 0; exit 2 when the anchors it edits are absent (never a blind write).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const README = 'corpus/README.md';
const REGISTRY = '.ufo/pins/readme-map.json';
const NOTE = 'lessons/round-63-verifier-spotcheck.md';
const ROW_ANCHOR = '| `lessons/round-63.md` |';
const ROW = '| `lessons/round-63-verifier-spotcheck.md` | Round-63 non-author verification (hyaku closure): claims re-measured against the tip, discernment spot-check, trend verdicts, routed defects D1..D6 (missing map row, selftest transcript, `-2` stem count, kimi layer degraded, Audit19 residuals, m_flash share) | S196, S197; `corpus/lessons/round-63-verifier-spotcheck.md` |';
const COVERED_ANCHOR = '  "lessons/round-63.md"\n ]';

function fail(token, detail) {
  process.stdout.write(`MAP_REPAIR: FAIL-CLOSED (${token}) ${detail}\n`);
  process.exit(2);
}

const argv = process.argv.slice(2);
let lane = process.cwd();
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--lane' && i + 1 < argv.length) lane = resolve(argv[++i]);
  else fail('USAGE', `unknown argument ${JSON.stringify(argv[i])}`);
}

const readmePath = join(lane, README);
const registryPath = join(lane, REGISTRY);
let readme;
let registry;
try {
  readme = readFileSync(readmePath, 'utf8');
  registry = readFileSync(registryPath, 'utf8');
} catch (e) {
  fail('TREE_INCOMPLETE', `${readmePath} / ${registryPath}: ${e.code ?? e.message}`);
}

let readmeState = 'present';
if (!readme.includes(ROW_ANCHOR.replace('round-63.md', 'round-63-verifier-spotcheck.md'))) {
  if (!readme.includes(ROW_ANCHOR)) fail('ROW_ANCHOR_ABSENT', `${README} has no ${ROW_ANCHOR} row`);
  const at = readme.indexOf('\n', readme.indexOf(ROW_ANCHOR)) + 1;
  readme = `${readme.slice(0, at)}${ROW}\n${readme.slice(at)}`;
  writeFileSync(readmePath, readme);
  readmeState = 'row';
}

let coveredState = 'present';
if (!registry.includes(`"${NOTE}"`)) {
  if (!registry.includes(COVERED_ANCHOR)) fail('COVERED_ANCHOR_ABSENT', `${REGISTRY} does not end its covered list with lessons/round-63.md`);
  registry = registry.replace(COVERED_ANCHOR, `  "lessons/round-63.md",\n  "${NOTE}"\n ]`);
  writeFileSync(registryPath, registry);
  coveredState = 'added';
}

process.stdout.write(`MAP_REPAIR: ${readmeState === 'present' && coveredState === 'present' ? 'NOOP' : 'APPLIED'} (readme=${readmeState} covered=${coveredState})\n`);
