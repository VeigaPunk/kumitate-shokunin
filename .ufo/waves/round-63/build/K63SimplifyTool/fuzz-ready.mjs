#!/usr/bin/env node
// Differential fuzz: does dropping the READY_MISMATCH regex arm change any verdict?
// Drives both gates through the CLI over one honest fixture, varying only ready.dispatch.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [orig, copy, honest] = process.argv.slice(2);
const T = mkdtempSync(join(tmpdir(), 'fuzz-ready.'));
cpSync(honest, T, { recursive: true });
const readyPath = join(T, 'lane', '.ufo', 'waves', 'round-7', 'w1.ready');
const base = JSON.parse(readFileSync(readyPath, 'utf8'));
const vals = [
  base.dispatch, '/abs/lane/.ufo/waves/round-7/w1-dispatch.json', '/x/.ufo/waves/round-7/w1-dispatch.json',
  '/x/.ufo/waves/round-9/w1-dispatch.json', '/x/.ufo/waves/round-7/w2-dispatch.json',
  '/x/.ufo/waves/round-7/w1-dispatch.json/', '/x/.ufo/waves/round-7/w1-dispatch.JSON',
  '/x/ufo/waves/round-7/w1-dispatch.json', '/x/.ufo/waves/round-07/w1-dispatch.json',
  '/x/.ufo/waves/round-7/w1-extra-dispatch.json', '/x/.ufo/waves/round-7/sub/w1-dispatch.json',
  'round-7/w1-dispatch.json', '.ufo/waves/round-7/w1-dispatch.json', '', null, undefined,
  42, ['/x/.ufo/waves/round-7/w1-dispatch.json'], '/x/.ufo/waves/round-7//w1-dispatch.json',
  '/x/.ufo/waves/round-7/w1-dispatch.json\n', ' /x/.ufo/waves/round-7/w1-dispatch.json',
];
const run = (gate) => {
  const r = spawnSync('node', [gate, '--root', join(T, 'lane'), '--round', '7', '--wave', 'w1',
    '--sessions-root', join(T, 'sessions'), '--dispatcher-log', join(T, 'dispatcher.log')], { encoding: 'utf8' });
  return `${r.status}\n${r.stdout}${r.stderr}`;
};
let diffs = 0;
for (const v of vals) {
  writeFileSync(readyPath, JSON.stringify({ ...base, dispatch: v }));
  const a = run(orig); const b = run(copy);
  if (a !== b) { diffs += 1; process.stdout.write(`DIFF dispatch=${JSON.stringify(v)}\n  orig=${JSON.stringify(a)}\n  copy=${JSON.stringify(b)}\n`); }
}
process.stdout.write(`READY_FUZZ cases=${vals.length} diffs=${diffs}\n`);
rmSync(T, { recursive: true, force: true });
process.exit(diffs ? 1 : 0);
