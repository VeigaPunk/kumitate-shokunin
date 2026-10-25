#!/usr/bin/env node
// K63SimplifyTool harness: run every committed inline control through a given gate and print a
// canonical, path-normalised transcript (one block per case) for byte comparison.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [gate, controlsRoot] = process.argv.slice(2);
if (!gate || !controlsRoot) { process.stderr.write('usage: run-controls.mjs <gate.mjs> <controls/inline>\n'); process.exit(64); }
const cases = readdirSync(controlsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
let fail = 0;
for (const c of cases) {
  const d = join(controlsRoot, c);
  const exp = readFileSync(join(d, 'expect'), 'utf8').split('\n');
  const r = spawnSync('node', [gate, '--root', join(d, 'lane'), '--round', '7', '--wave', 'w1',
    '--sessions-root', join(d, 'sessions'), '--dispatcher-log', join(d, 'dispatcher.log')], { encoding: 'utf8' });
  const want = Number(exp[0]);
  const id = (exp[1] || '').trim();
  const ok = r.status === want && (id === 'CLEAN' ? /INLINE_DISPATCH: CLEAN/.test(r.stdout) : r.stdout.split('\n').some((l) => l.startsWith(`FINDING ${id}`)));
  if (!ok) fail += 1;
  process.stdout.write(`== ${c} exit=${r.status} want=${want} ${id} ${ok ? 'OK' : 'MISMATCH'}\n`);
  for (const l of r.stdout.split('\n').filter(Boolean)) process.stdout.write(`  ${l.split(controlsRoot).join('<CTRL>')}\n`);
  if (r.stderr.trim()) for (const l of r.stderr.split('\n').filter(Boolean)) process.stdout.write(`  STDERR ${l}\n`);
}
process.stdout.write(`CONTROLS: ${cases.length - fail}/${cases.length} as expected\n`);
process.exit(fail ? 1 : 0);
