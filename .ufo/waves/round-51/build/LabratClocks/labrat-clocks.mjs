#!/usr/bin/env node
// labrat-clocks.mjs — kumitate r51 / LabratClocks: host-fidelity probe for receipt-attest (C1) clock+nonce+sidecar fields.
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const D = mkdtempSync(join(tmpdir(), 'labrat-clocks.')), out = [];
const say = (s) => { out.push(s); console.log(s); };
// A: 20 trials of a 50 ms busy loop — monotonic span > 0, wall span >= 50 ms
let monoAll = true, wallAll = true, regress = false, prevEnd = -Infinity; const gaps = [];
for (let i = 0; i < 20; i++) {
  const w0 = Date.now(), m0 = process.hrtime.bigint();
  while (Date.now() - w0 < 50) { /* busy wait */ }
  const m1 = process.hrtime.bigint(), w1 = Date.now(), mono = Number(m1 - m0);
  monoAll = monoAll && mono > 0; wallAll = wallAll && w1 - w0 >= 50;
  regress = regress || w0 < prevEnd; prevEnd = w1; gaps.push((w1 - w0) - mono / 1e6);
}
// B: 128-bit nonce freshness — 1000 draws, no collisions
const seen = new Set();
for (let i = 0; i < 1000; i++) seen.add(randomBytes(16).toString('hex'));
// C: GNU-format sidecar — byte-identical to sha256sum's own output, accepted by `sha256sum -c`
const f = join(D, 'receipt.txt'), body = 'run-at: 2026-10-23T00:00:00.000Z\n{"nonce":"ab"}\n';
writeFileSync(f, body);
const h = createHash('sha256').update(readFileSync(f)).digest('hex');
writeFileSync(`${f}.sha256`, `${h}  receipt.txt\n`);
const sum = (...a) => spawnSync('sha256sum', a, { cwd: D, encoding: 'utf8' });
const gnu = sum('receipt.txt'), chk = sum('-c', 'receipt.txt.sha256');
writeFileSync(f, body.replace('2026-10-23', '2020-01-01')); // prelude-only rewrite (lesson-M2 forgery)
const bad = sum('-c', 'receipt.txt.sha256');
const gnuOk = gnu.stdout === `${h}  receipt.txt\n`;
say(`A trials=20 mono_span_all_gt0=${monoAll} wall_span_all_ge_50ms=${wallAll} wall_regress=${regress} gap(wall-mono)=[${Math.min(...gaps).toFixed(3)},${Math.max(...gaps).toFixed(3)}]ms`);
say(`B draws=1000 distinct=${seen.size} collisions=${1000 - seen.size}`);
say(`C sidecar=${JSON.stringify(gnu.stdout)} identical_to_gnu=${gnuOk} sha256sum_-c_exit=${chk.status} out=${JSON.stringify((chk.stdout || '').trim())}`);
say(`C2 prelude-only-rewrite sha256sum_-c_exit=${bad.status} out=${JSON.stringify((bad.stdout || '').trim())}`);
const ok = monoAll && wallAll && !regress && seen.size === 1000 && gnuOk && chk.status === 0 && bad.status === 1;
say(`RESULT ${ok ? 'PASS' : 'FAIL'} A=${monoAll && wallAll} B=${seen.size === 1000} C=${chk.status === 0} C2=${bad.status === 1}`);
writeFileSync(join(D, 'transcript.txt'), out.join('\n') + '\n');
process.exit(ok ? 0 : 1);
