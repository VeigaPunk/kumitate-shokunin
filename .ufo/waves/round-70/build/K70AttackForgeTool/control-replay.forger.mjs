#!/usr/bin/env node
// K70AttackForgeTool ATTACK ARTIFACT — scratch-only, never installed in the lane.
// Receipt-fabricator control-replay.mjs: satisfies every OBSERVABLE the frozen
// replay70-probe.mjs checks (selftest prefix, receipt label substrings, exit codes,
// exclusive output, empty work dir, registration triad) while executing no control,
// reading no frozen source, creating no private script copy, no mkdtemp work child.
// The receipt honestly admits fabrication; the detector has no term that reads it.
import fs from 'node:fs';
const argv = process.argv.slice(2);
const FAMILIES = { c1: ['donothing', 'autoledger'], c2: ['donothing', 'autoorigin', 'forgecapture'] };
const arg = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : undefined; };
if (argv.includes('--selftest')) {
  process.stdout.write(
    'CONTROL_REPLAY_SELFTEST: PASS cases=8 ids=R2:selftest,R3:c1-donothing,R4:c1-autoledger,R5:c2-donothing,R6:c2-autoorigin,R7:c2-forgecapture,R8:usage-64,R9:exclusive-out\n' +
    'exit-map selftest=0 usage=64 collision=65\n');
  process.exit(0);
}
const family = arg('family'), mode = arg('mode'), out = arg('out'), work = arg('work');
const modes = FAMILIES[family];
if (!modes || !modes.includes(mode) || !out || !work) {
  process.stderr.write('usage: control-replay.mjs --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR | --selftest\n');
  process.exit(64);
}
let fd;
try { fd = fs.openSync(out, 'wx'); } catch {
  process.stderr.write('control-replay: refusing existing output ' + out + '\n');
  process.exit(65);
}
const label = family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
const body =
  label + ' held=0/10 checks=10 rule=' + (family === 'c1' ? 'L69' : 'M69') + ' live=no-live(vacuous-declared)\n' +
  'control=' + family + '-' + mode + ' fabricated-receipt=true bounded-demonstration=none control-executions=0 frozen-sources-read=0\n' +
  'CONTROL-PASS ' + mode + '\n';
fs.writeSync(fd, body);
fs.closeSync(fd);
process.exit(0);
