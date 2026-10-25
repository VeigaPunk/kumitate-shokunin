#!/usr/bin/env node
// Differential over the fail-closed arms no committed case exercises (DISPATCH_UNREADABLE ×3,
// RESULTS_UNREADABLE) plus DISPATCH_MISMATCH:duplicate-seat-names and a session row with no id.
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [orig, copy, honest] = process.argv.slice(2);
const run = (gate, T) => {
  const r = spawnSync('node', [gate, '--root', join(T, 'lane'), '--round', '7', '--wave', 'w1',
    '--sessions-root', join(T, 'sessions'), '--dispatcher-log', join(T, 'dispatcher.log')], { encoding: 'utf8' });
  return `${r.status}\n${r.stdout}${r.stderr}`;
};
const cases = {
  'ready-not-json': (T) => writeFileSync(join(T, 'lane/.ufo/waves/round-7/w1.ready'), 'not json'),
  'dispatch-not-json': (T) => writeFileSync(join(T, 'lane/.ufo/waves/round-7/w1-dispatch.json'), '{oops'),
  'dispatch-missing': (T) => writeFileSync(join(T, 'lane/.ufo/waves/round-7/w1-dispatch.json'), ''),
  'results-not-json': (T) => writeFileSync(join(T, 'lane/.ufo/waves/round-7/w1-results.json'), '[]'),
  'taskcall-absent': (T) => writeFileSync(join(T, 'lane/.ufo/waves/round-7/w1-dispatch.json'), JSON.stringify({ taskCall: { context: 'c', tasks: [] } })),
  'dup-seat-names': (T) => {
    const p = join(T, 'lane/.ufo/waves/round-7/w1-dispatch.json');
    const d = JSON.parse(readFileSync(p, 'utf8'));
    d.taskCall.tasks[1].name = d.taskCall.tasks[0].name;
    writeFileSync(p, JSON.stringify(d));
  },
  'session-no-id': (T) => writeFileSync(join(T, 'sessions/orch/K63AlphaOne.jsonl'),
    readFileSync(join(T, 'sessions/orch/K63AlphaOne.jsonl'), 'utf8').replace(/"id":"session-K63AlphaOne",?/, '')),
};
let diffs = 0;
for (const [name, mut] of Object.entries(cases)) {
  const T = mkdtempSync(join(tmpdir(), 'arms.'));
  cpSync(honest, T, { recursive: true });
  mut(T);
  const a = run(orig, T); const b = run(copy, T);
  const same = a === b;
  if (!same) diffs += 1;
  process.stdout.write(`${same ? 'SAME' : 'DIFF'} ${name}: ${JSON.stringify(a.split('\n')[1] || a.split('\n')[0])}\n`);
  if (!same) process.stdout.write(`  copy=${JSON.stringify(b)}\n`);
  rmSync(T, { recursive: true, force: true });
}
process.stdout.write(`ARMS cases=${Object.keys(cases).length} diffs=${diffs}\n`);
process.exit(diffs ? 1 : 0);
