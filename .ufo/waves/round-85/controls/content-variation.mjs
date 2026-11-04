#!/usr/bin/env node
// Frozen same-path content-variation control for round-85 C1.
// Writes one receipt path three times with different content and requires the
// instrument to answer from the bytes on disk each time: exit codes 0/1/0 and
// three distinct input-derived sha256 values. A canned or no-reader counter
// answers the same way every time and fails.
// node .ufo/waves/round-85/controls/content-variation.mjs --lane DIR --work DIR
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
let lane = '.';
let work;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--lane') lane = args[++i];
  else if (args[i] === '--work') work = args[++i];
  else { console.log('CONTENT_VARIATION: USAGE'); process.exit(64); }
}
if (!work) { console.log('CONTENT_VARIATION: USAGE --work required'); process.exit(64); }
const dir = join(resolve(work), 'content-variation');
mkdirSync(dir, { recursive: true });
const file = join(dir, 'same-path.receipt.txt');
const tool = join(resolve(lane), 'scripts', 'counter-receipt.mjs');

const bodies = [
  ['clean-2', 'X arm a ok\nX arm b ok\nX: HELD held=2/2\n', 0, 'rows=2 held=2/2 findings=none'],
  ['red-1', 'X arm a FAIL\nX: UNMET held=0/1\n', 1, 'rows=1 held=0/1 findings=ARM_FAILED'],
  ['clean-3', 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n', 0, 'rows=3 held=3/3 findings=none'],
];
let held = 0;
try {
  const shas = [];
  for (const [name, body, code, needle] of bodies) {
    writeFileSync(file, body);
    const sha = createHash('sha256').update(Buffer.from(body, 'utf8')).digest('hex');
    const r = spawnSync(process.execPath, [tool, '--receipt', file], { encoding: 'utf8', timeout: 10000 });
    const lines = ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd().split('\n');
    const line2 = lines[1] ?? '';
    const ok = r.status === code
      && line2.startsWith(`RECEIPT: bytes=${Buffer.byteLength(body)} `)
      && line2.includes(needle)
      && line2.endsWith(`sha256=${sha}`);
    shas.push(line2.split('sha256=')[1] ?? `distinct-${name}`);
    if (ok) held += 1;
    console.log(`CONTENT_VARIATION arm ${name} ${ok ? 'ok' : 'FAIL'} exit=${r.status} want=${code} line2=${JSON.stringify(line2)}`);
  }
  const distinct = new Set(shas).size === bodies.length;
  if (!distinct) held = 0;
  const okAll = held === bodies.length && distinct;
  console.log(`CONTENT_VARIATION: ${okAll ? 'HELD' : 'UNMET'} held=${held}/${bodies.length} distinct_sha=${distinct}`);
  process.exitCode = okAll ? 0 : 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
