#!/usr/bin/env node
// labrat-clocks-3.mjs — addendum 2 (v2): `sha256sum -c` path-resolution matrix + wall/mono tolerance bound.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const D = mkdtempSync(join(tmpdir(), 'labrat-clocks3.'));
const out = [];
const say = (s) => { out.push(s); console.log(s); };
const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

// G: sidecar name resolution is CWD-relative, not sidecar-relative
const sub = join(D, 'receipts'); mkdirSync(sub);
const f = join(sub, 'attest-run-1.txt');
writeFileSync(f, 'run-at: 2026-10-23T00:00:00.000Z\n{"nonce":"ab"}\n');
const h = hash(f);
writeFileSync(`${f}.sha256`, `${h}  attest-run-1.txt\n`);                       // bare basename
writeFileSync(join(D, 'pathform.sha256'), `${h}  receipts/attest-run-1.txt\n`); // cwd-relative path
const G = [
  ['bare-sidecar, cwd=receipts-dir', spawnSync('sha256sum', ['-c', 'attest-run-1.txt.sha256'], { cwd: sub, encoding: 'utf8' })],
  ['bare-sidecar, cwd=parent', spawnSync('sha256sum', ['-c', 'receipts/attest-run-1.txt.sha256'], { cwd: D, encoding: 'utf8' })],
  ['pathform-sidecar, cwd=parent', spawnSync('sha256sum', ['-c', 'pathform.sha256'], { cwd: D, encoding: 'utf8' })],
  ['pathform-sidecar, cwd=receipts-dir', spawnSync('sha256sum', ['-c', '../pathform.sha256'], { cwd: sub, encoding: 'utf8' })],
];
for (const [label, r] of G) {
  say(`G [${label}] exit=${r.status} out=${JSON.stringify((r.stdout || '').trim())} err=${JSON.stringify((r.stderr || '').trim())}`);
}

// H: wall/mono gap bound — 200 trials, quantise the max positive (wall - mono) excess
let maxGap = 0, minGap = 0, wallLt50 = 0, monoNonPos = 0, eqCount = 0;
for (let i = 0; i < 200; i++) {
  const w0 = Date.now(); const m0 = process.hrtime.bigint();
  while (Date.now() - w0 < 50) { /* busy */ }
  const m1 = process.hrtime.bigint(); const w1 = Date.now();
  const monoMs = Number(m1 - m0) / 1e6; const wallMs = w1 - w0;
  const gap = wallMs - monoMs;
  maxGap = Math.max(maxGap, gap); minGap = Math.min(minGap, gap);
  if (wallMs < 50) wallLt50++;
  if (Number(m1 - m0) <= 0) monoNonPos++;
  if (gap === 0) eqCount++;
}
say(`H trials=200 wall_lt_50ms=${wallLt50} mono_nonpos=${monoNonPos} gap_range=[${minGap.toFixed(3)},${maxGap.toFixed(3)}]ms gap_eq_0=${eqCount}`);
say(`H2 implication: wall_span >= 50ms holds in ${200 - wallLt50}/200; wall_span can EXCEED mono_span by up to ${maxGap.toFixed(3)}ms (Date.now() ms-quantisation)`);
const gBare = G[0][1].status === 0, gPath = G[2][1].status === 0;
say(`RESULT G_bare_from_receiptsdir=${gBare} G_pathform_from_parent=${gPath} H=${wallLt50 === 0 && monoNonPos === 0}`);
writeFileSync(join(D, 'transcript.txt'), out.join('\n') + '\n');
process.exit(gBare && gPath && wallLt50 === 0 && monoNonPos === 0 ? 0 : 1);
