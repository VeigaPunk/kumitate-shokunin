#!/usr/bin/env node
// SYNTHETIC NAIVE replay driver: same interface as driver-checked.mjs but
// ignores spawn anomalies and always writes a receipt with exit 0.
// Models the fail-open class the probe must discriminate against.
// Exits: 0 (always, unless usage)
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const argv = process.argv.slice(2);
const opts = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (!a.startsWith('--')) process.exit(64);
  const v = argv[++i];
  if (v === undefined || v.startsWith('--')) process.exit(64);
  opts[a.slice(2)] = v;
}
const {lane, family, mode, out, work} = opts;
if (!lane || !family || !mode || !out || !work) process.exit(64);

const frozen = fs.readFileSync(path.join(lane, 'controls', 'frozen-c1.sh'), 'utf8');
const child = fs.mkdtempSync(path.join(work, 'naivechild-'));
const probePath = path.join(child, 'synth-probe.mjs');
fs.writeFileSync(probePath, fs.readFileSync(new URL('./synth-probe.mjs', import.meta.url)));
let text = frozen.replace(/^LANE=.*$/m, `LANE=${lane}`).replace(/^PROBE=.*$/m, `PROBE="${probePath}"`)
  .replace(/^W=.*$/m, `W="${path.join(child, 'receipts')}"`).replace(/^S=.*$/m, `S="${path.join(child, 'run')}"`);
const privPath = path.join(child, 'naive.private.sh');
fs.writeFileSync(privPath, text);
const r = spawnSync('bash', [privPath, mode], {encoding: 'utf8'}); // no error/status check: naive
fs.writeFileSync(out, (r.stdout || '') + `naive-driver exit=${r.status} error=${r.error ? r.error.code : 'none'}\n`);
fs.rmSync(child, {recursive: true, force: true});
process.exit(0);
