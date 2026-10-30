#!/usr/bin/env node
// REVIEW STUB B (strict control — NOT a candidate implementation).
// Refuses iff --out already exists (exclusive create 'wx'), exit 1; otherwise normal replay receipt.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const fail = (msg, code) => { console.error(msg); process.exit(code); };

if (argv[0] === '--selftest') { console.log('CONTROL_REPLAY_SELFTEST: PASS'); process.exit(0); }

const opt = {};
for (let i = 0; i < argv.length; i += 2) {
  const k = argv[i]; const v = argv[i + 1];
  if (!k || !k.startsWith('--') || v === undefined) fail('usage: malformed args', 64);
  opt[k.slice(2)] = v;
}
const { lane, family, mode, out, work } = opt;
if (!lane || !family || !mode || !out || !work) fail('usage: missing required args', 64);
const modes = { c1: ['donothing', 'autoledger'], c2: ['donothing', 'autoorigin', 'forgecapture'] };
if (!modes[family] || !modes[family].includes(mode)) fail('usage: unknown family/mode', 64);

let fd;
try { fd = fs.openSync(out, 'wx'); } catch { fail('REFUSE(output-exists): ' + out, 1); }
const child = fs.mkdtempSync(path.join(work, 'stubB-'));
const label = family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
fs.writeFileSync(fd, `${label} held=0/1 (stubB receipt)\nCONTROL-PASS ${mode}\n`);
fs.closeSync(fd);
fs.rmSync(child, { recursive: true, force: true });
process.exit(0);
