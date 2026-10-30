#!/usr/bin/env node
// REVIEW STUB A (attribution-gap demonstrator for R9 — NOT a candidate implementation).
// Properties:
//  * Has NO existing-output protection: writes --out unconditionally (clobbers any pre-existing file).
//  * Refuses (exit 64) whenever the supplied --work root directory is non-empty — i.e. it can
//    "pass" R9 for the WRONG reason, because the R9 invocation happens to use a non-empty work root.
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

let entries = [];
try { entries = fs.readdirSync(work); } catch { fail('REFUSE: work root unreadable', 64); }
if (entries.length !== 0) fail('REFUSE(work-root-not-empty): ' + entries.join(','), 64);

const child = fs.mkdtempSync(path.join(work, 'stubA-'));
const label = family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
// NOTE: unconditional write — no existence check on `out` at all.
fs.writeFileSync(out, `${label} held=0/1 (stubA receipt)\nCONTROL-PASS ${mode}\n`);
fs.rmSync(child, { recursive: true, force: true });
process.exit(0);
