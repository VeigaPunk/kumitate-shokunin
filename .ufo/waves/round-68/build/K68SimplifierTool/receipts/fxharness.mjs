#!/usr/bin/env node
// Extracts the frozen C1 counter's L4 fixture machinery verbatim (text slice, never edited)
// and runs it against any tool path, so a patched tool can be compared to the baseline on the
// same 20 mutants with the same seed.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [counterPath, seedArg, ...tools] = process.argv.slice(2);
const SEED = seedArg || 'k68yagni0000a1b2';
const CHILD_ENV = (T) => ({ PATH: process.env.PATH || '/usr/bin:/bin', TMPDIR: T, LANG: process.env.LANG || 'C' });
const T = mkdtempSync(join(tmpdir(), 'yagni-fx.'));

const src = readFileSync(counterPath, 'utf8');
const a = src.indexOf('let seedCtr = 0;');
const b = src.indexOf('let realL4 = false;');
if (a < 0 || b < 0 || b < a) { console.error('slice markers not found'); process.exit(70); }
const body = src.slice(a, b);
const factory = new Function(
  'spawnSync', 'createHash', 'mkdirSync', 'writeFileSync', 'rmSync', 'join', 'CHILD_ENV', 'T', 'SEED',
  `${body}\nreturn { buildFixture, MUTANTS, harness };`,
);
const { buildFixture, MUTANTS, harness } = factory(spawnSync, createHash, mkdirSync, writeFileSync, rmSync, join, CHILD_ENV, T, SEED);

for (const tool of tools) {
  const bad = harness(tool);
  console.log(`TOOL ${tool} seed=${SEED} mutants=${MUTANTS.length} fail=${bad.length}${bad.length ? ` :: ${bad.join(' ; ')}` : ' :: ALL-20-MATCH'}`);
}
rmSync(T, { recursive: true, force: true });
