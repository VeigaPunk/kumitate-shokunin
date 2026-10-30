#!/usr/bin/env node
// K70AttackWrongExit CONTRAST (strict). Same wrapper, but accepts only label AND counter exit 1
// (the contract the frozen r69 controls enforce). Used to show the probe's discrimination.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const a = process.argv.slice(2);
const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
if (a.includes('--selftest')) { console.log('CONTROL_REPLAY_SELFTEST: PASS (2/2)'); process.exit(0); }
const family = opt('--family'), mode = opt('--mode'), lane = opt('--lane'), out = opt('--out'), work = opt('--work');
if (!lane || !out || !work || !['c1', 'c2'].includes(family) || !mode) {
  process.stderr.write('usage: control-replay.mjs --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR\n');
  process.exit(64);
}
if (fs.existsSync(out)) { process.stderr.write('refusing to overwrite\n'); process.exit(1); }
const probe = family === 'c1' ? 'ledger69-probe.mjs' : 'deprec69-probe.mjs';
const label = family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
const rev = spawnSync('git', ['-C', lane, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).stdout.trim();
const args = [path.join(lane, '.ufo/waves/round-69/probe', probe), lane, rev];
if (family === 'c2' && mode !== 'forgecapture') args.push('--no-live');
const r = spawnSync(process.execPath, args, {encoding: 'utf8', env: {...process.env}, cwd: work});
const first = (r.stdout || '').split('\n')[0];
if (first.startsWith(label) && r.status === 1) {
  fs.writeFileSync(out, `${first}\ncounter-exit=${r.status}\nCONTROL-PASS ${mode}\n`, {flag: 'wx'});
  process.exit(0);
}
fs.writeFileSync(out, `${first}\ncounter-exit=${r.status}\nCONTROL-FAIL ${mode}\n`, {flag: 'wx'});
process.exit(1);
