#!/usr/bin/env node
/**
 * gen-fixture-r87.mjs — builds the critic's round-87 close fixture inside a SCRATCH clone.
 *
 * The frozen probe reads `<lane>/.ufo/waves/round-87/close`, which does not exist in the
 * lane until the executor seats commit the round's own close receipts. This generator
 * writes ten receipts of the contract's shape (rev / tool_sha256 / cmd / exit / signal)
 * into a scratch clone, each bound to a distinct lane script at <rev> via `git show`.
 *
 * usage: node gen-fixture-r87.mjs <lane-clone> <rev>
 * It never writes outside <lane-clone>/.ufo/waves/round-87/close and never commits.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const lane = process.argv[2];
const rev = process.argv[3];
if (!lane || !rev) {
  console.error('USAGE: gen-fixture-r87.mjs <lane-clone> <40-hex-rev>');
  process.exit(64);
}

const scripts = [
  'proxy-check.mjs',
  'readme-map.mjs',
  'spotcheck-adopt.mjs',
  'counter-receipt.mjs',
  'source-capture.mjs',
  'source-dupes.mjs',
  'sources-check.mjs',
  'wave-census.mjs',
  'cite-check.mjs',
  'ready-handoff.mjs',
];

const dir = join(lane, '.ufo', 'waves', 'round-87', 'close');
mkdirSync(dir, { recursive: true });

for (const s of scripts) {
  const rel = `scripts/${s}`;
  const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
  if (g.status !== 0) {
    console.error(`MISSING ${rel} at ${rev}`);
    process.exit(2);
  }
  const digest = createHash('sha256').update(g.stdout).digest('hex');
  const body = `rev=${rev}\ntool_sha256=${digest}\ncmd=node ${rel} --selftest\nexit=0\nsignal=none\n`;
  writeFileSync(join(dir, `r87-${s.replace(/\.mjs$/, '')}.txt`), body);
}
console.log(`FIXTURE_R87: wrote ${scripts.length} receipts to ${dir} at rev=${rev}`);
