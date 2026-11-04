#!/usr/bin/env node
// K85Review — NON-FROZEN PROPOSAL, not this round's control and not evidence
// for or against C1's predicate. The frozen content-variation control serves a
// fixed clean/red/clean order on one path; a tool can satisfy it by call
// position without reading content. This variant picks one of the three bodies
// at random per invocation and asserts the verdict, bytes, rows/held/findings
// and sha256 of the body it actually wrote, so a position-keyed answer fails
// with probability 1-(1/3)^runs while a content-derived answer passes.
// node content-variation-random-proposal.mjs --lane DIR --work DIR [--runs N]
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
let lane = '.';
let work;
let runs = 12;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--lane') lane = args[++i];
  else if (args[i] === '--work') work = args[++i];
  else if (args[i] === '--runs') runs = Number(args[++i]);
  else { console.log('CONTENT_VARIATION_RANDOM: USAGE'); process.exit(64); }
}
if (!work || !Number.isSafeInteger(runs) || runs < 1) {
  console.log('CONTENT_VARIATION_RANDOM: USAGE --work required');
  process.exit(64);
}
const dir = join(resolve(work), 'content-variation-random');
mkdirSync(dir, { recursive: true });
const file = join(dir, 'same-path.receipt.txt');
const tool = join(resolve(lane), 'scripts', 'counter-receipt.mjs');

// body, exit, verdict token, RECEIPT needle
const bodies = [
  ['clean-2', 'X arm a ok\nX arm b ok\nX: HELD held=2/2\n', 0, 'CLEAN', 'rows=2 held=2/2 findings=none'],
  ['red-1', 'X arm a FAIL\nX: UNMET held=0/1\n', 1, 'ARM_FAILED', 'rows=1 held=0/1 findings=ARM_FAILED'],
  ['clean-3', 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n', 0, 'CLEAN', 'rows=3 held=3/3 findings=none'],
];

let held = 0;
let firstFail = '';
try {
  for (let i = 0; i < runs; i += 1) {
    const [name, body, code, token, needle] = bodies[Math.floor(Math.random() * bodies.length)];
    writeFileSync(file, body);
    const sha = createHash('sha256').update(Buffer.from(body, 'utf8')).digest('hex');
    const r = spawnSync(process.execPath, [tool, '--receipt', file], { encoding: 'utf8', timeout: 10000 });
    const lines = ((r.stdout ?? '') + (r.stderr ?? '')).trimEnd().split('\n');
    const want1 = `COUNTER_RECEIPT: ${code === 1 ? 'DRIFT ' : ''}${token}`;
    const line2 = lines[1] ?? '';
    const ok = r.status === code
      && lines[0] === want1
      && line2.startsWith(`RECEIPT: bytes=${Buffer.byteLength(body)} `)
      && line2.includes(needle)
      && line2.endsWith(`sha256=${sha}`);
    if (ok) held += 1;
    else if (!firstFail) firstFail = `run=${i + 1} body=${name} exit=${r.status} line1=${JSON.stringify(lines[0] ?? '')} line2=${JSON.stringify(line2)}`;
    console.log(`CONTENT_VARIATION_RANDOM run ${i + 1} body=${name} ${ok ? 'ok' : 'FAIL'} exit=${r.status} want=${code}:${token}`);
  }
  const okAll = held === runs;
  console.log(`CONTENT_VARIATION_RANDOM: ${okAll ? 'HELD' : 'UNMET'} held=${held}/${runs}${firstFail ? ` first_fail=${firstFail}` : ''}`);
  process.exitCode = okAll ? 0 : 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
