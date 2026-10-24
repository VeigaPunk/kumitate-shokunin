#!/usr/bin/env node
// labrat-clocks-2.mjs — addendum: byte-exact GNU sidecar form + wall/mono granularity characterisation.
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const D = mkdtempSync(join(tmpdir(), 'labrat-clocks2.'));
const out = [];
const say = (s) => { out.push(s); console.log(s); };

// D: our sidecar bytes vs GNU's own `sha256sum` output bytes, byte-for-byte
const bytes = Buffer.from('run-at: 2026-10-23T00:00:00.000Z\n{"a":1}\n');
const f = join(D, 'receipt.txt'); writeFileSync(f, bytes);
const gnu = spawnSync('sha256sum', ['receipt.txt'], { cwd: D, encoding: 'utf8' });
const our = `${createHash('sha256').update(bytes).digest('hex')}  receipt.txt\n`;
say(`D gnu_bytes=${JSON.stringify(gnu.stdout)} our_bytes=${JSON.stringify(our)} identical=${gnu.stdout === our}`);
writeFileSync(join(D, 'receipt.txt.sha256'), our);
const chk = spawnSync('sha256sum', ['-c', 'receipt.txt.sha256'], { cwd: D, encoding: 'utf8' });
say(`D2 sha256sum -c on our sidecar exit=${chk.status} out=${JSON.stringify((chk.stdout || '').trim())}`);

// E: wall/mono characterisation over 60 trials of a 50 ms busy loop
let monoLtWall = 0, monoEqWall = 0, monoGtWall = 0, wallLt50 = 0, monoZero = 0, wallRegress = 0;
let prevEnd = -Infinity, maxGap = 0;
for (let i = 0; i < 60; i++) {
  const w0 = Date.now(); const m0 = process.hrtime.bigint();
  while (Date.now() - w0 < 50) { /* busy */ }
  const m1 = process.hrtime.bigint(); const w1 = Date.now();
  const monoMs = Number(m1 - m0) / 1e6; const wallMs = w1 - w0;
  if (monoMs < wallMs) monoLtWall++; else if (monoMs === wallMs) monoEqWall++; else monoGtWall++;
  if (wallMs < 50) wallLt50++;
  if (Number(m1 - m0) <= 0) monoZero++;
  if (w0 < prevEnd) wallRegress++;
  prevEnd = w1;
  maxGap = Math.max(maxGap, wallMs - monoMs);
}
say(`E trials=60 mono_lt_wall=${monoLtWall} mono_eq_wall=${monoEqWall} mono_gt_wall=${monoGtWall} ` +
    `wall_lt_50ms=${wallLt50} mono_nonpos=${monoZero} wall_regress=${wallRegress} max(wall-mono)gap=${maxGap.toFixed(3)}ms`);

// F: nonce — 10000 draws, uniqueness + hex shape (32 lowercase hex = 128 bits)
const S = new Set(); let shapeOk = true;
for (let i = 0; i < 10000; i++) { const h = randomBytes(16).toString('hex'); S.add(h); if (!/^[0-9a-f]{32}$/.test(h)) shapeOk = false; }
say(`F draws=10000 distinct=${S.size} collisions=${10000 - S.size} hex128_shape_ok=${shapeOk}`);
say(`RESULT D=${gnu.stdout === our} D2=${chk.status === 0} E=${wallLt50 === 0 && monoZero === 0 && wallRegress === 0} F=${S.size === 10000 && shapeOk}`);
writeFileSync(join(D, 'transcript.txt'), out.join('\n') + '\n');
process.exit(gnu.stdout === our && chk.status === 0 && wallLt50 === 0 && monoZero === 0 && wallRegress === 0 && S.size === 10000 ? 0 : 1);
