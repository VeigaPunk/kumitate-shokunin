#!/usr/bin/env node
// synthetic-header-edge.mjs — MECHANISM-ONLY edge reproduction for K70ProbeHeaderModes.
//
// This is NOT the round-70 candidate implementation (scripts/control-replay.mjs does
// not exist yet) and NOT candidate verification. It models ONLY the documented header
// contract from .ufo/waves/round-70/plan.md so the enum/pair edge matrix of
// probe-header-modes.mjs is executable end-to-end:
//   * `--lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR` | `--selftest`
//   * family enum: exactly c1 | c2
//   * modes: c1 {donothing, autoledger} ; c2 {donothing, autoorigin, forgecapture}
//   * invalid usage -> exit 64 (EX_USAGE), no filesystem side effects
//   * valid run -> unique mkdtemp child under --work, receipt written with exclusive
//     flag 'wx', work child reclaimed, exit 0
//   * --selftest -> hermetic, stable finding ids + `CONTROL_REPLAY_SELFTEST: PASS`
// It contains no control body, never executes the frozen originals
// (.ufo/waves/round-69/probe/c1-controls.sh / c2-controls.sh) and never touches the lane.
import fs from 'node:fs';
import path from 'node:path';

const FAMILY_MODES = { c1: ['donothing', 'autoledger'], c2: ['donothing', 'autoorigin', 'forgecapture'] };
const LABEL = { c1: 'LEDGER69_UNMET', c2: 'DEPREC69_UNMET' };
const USAGE = 'usage: control-replay.mjs --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR | --selftest';

function usageExit(msg) {
  process.stderr.write(`${USAGE}\n${msg}\n`);   // refusal: zero filesystem writes
  process.exit(64);
}

const argv = process.argv.slice(2);

if (argv.length === 1 && argv[0] === '--selftest') {
  // hermetic selftest: stable finding ids + expected exit maps
  process.stdout.write([
    'FIND selftest.family-enum expect=exit64 observed=exit64 id=SYNTH-H1',
    'FIND selftest.mode-sets expect=exit64 observed=exit64 id=SYNTH-H2',
    'FIND selftest.exclusive-out expect=refuse observed=refuse id=SYNTH-H3',
    'CONTROL_REPLAY_SELFTEST: PASS',
  ].join('\n') + '\n');
  process.exit(0);
}

// strict `--flag value` pairs only; equals-forms and unknown flags are usage errors
if (argv.length === 0 || argv.length % 2 !== 0) usageExit(`bad argc=${argv.length}`);
const seen = new Map();
for (let i = 0; i < argv.length; i += 2) {
  const flag = argv[i];
  if (!/^--(lane|family|mode|out|work)$/.test(flag)) usageExit(`unknown or unsupported flag ${flag}`);
  if (seen.has(flag.slice(2))) usageExit(`duplicate flag ${flag}`);
  seen.set(flag.slice(2), argv[i + 1]);
}
for (const req of ['lane', 'family', 'mode', 'out', 'work']) {
  if (!seen.has(req)) usageExit(`missing --${req}`);
  if (typeof seen.get(req) !== 'string' || seen.get(req).length === 0) usageExit(`empty --${req}`);
}
const { lane, family, mode, out, work } = Object.fromEntries(seen);
if (!/^[a-z0-9]+$/.test(family) || !Object.hasOwn(FAMILY_MODES, family)) usageExit(`family must be c1|c2, got ${JSON.stringify(family)}`);
if (!FAMILY_MODES[family].includes(mode)) usageExit(`mode ${JSON.stringify(mode)} is not valid for family ${family}`);

// valid pair: mkdtemp child under work, exclusive receipt, reclaim child
let child;
try {
  child = fs.mkdtempSync(path.join(work, 'run-'));
} catch (e) {
  process.stderr.write(`work unavailable: ${e.message}\n`);
  process.exit(73);
}
const receipt = [
  `${LABEL[family]} held=0/${family === 'c1' ? 7 : 11} mechanism=synthetic-header-only family=${family} mode=${mode}`,
  'NOTE mechanism-only edge reproduction, not the round-70 candidate, no control body executed',
  `CONTROL-PASS ${mode}`,
].join('\n') + '\n';
try {
  fs.writeFileSync(out, receipt, { flag: 'wx' });   // exclusive creation: never overwrite
} catch (e) {
  fs.rmSync(child, { recursive: true, force: true });
  process.stderr.write(`refusing output: ${e.message}\n`);
  process.exit(73);
}
fs.rmSync(child, { recursive: true, force: true });
process.stdout.write(`${LABEL[family]} ${family} ${mode} CONTROL-PASS ${mode}\n`);
process.exit(0);
