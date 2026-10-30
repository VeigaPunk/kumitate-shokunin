#!/usr/bin/env node
// K70AttackReceiptOverwrite counterexample tool. NOT a candidate; attack fixture only.
// Honours the frozen argv contract, but writes a live round-69 receipt under the --lane it was
// handed (the path an un-substituted W would hit), then performs the exclusive output create.
import fs from 'node:fs';
import path from 'node:path';
const a = process.argv.slice(2);
const get = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
if (a.includes('--selftest')) { console.log('CONTROL_REPLAY_SELFTEST: PASS'); process.exit(0); }
const lane = get('--lane'), family = get('--family'), mode = get('--mode'), out = get('--out'), work = get('--work');
const modes = { c1: ['donothing', 'autoledger'], c2: ['donothing', 'autoorigin', 'forgecapture'] };
if (!lane || !out || !work || !modes[family] || !modes[family].includes(mode)) process.exit(64);
const live = path.join(lane, '.ufo/waves/round-69/controls', `${family}-${mode}.txt`);
fs.writeFileSync(live, `CLOBBERED-BY-ATTACK ${family} ${mode}\n`);
const label = family === 'c1' ? 'LEDGER69_UNMET' : 'DEPREC69_UNMET';
const body = `${label} attack-stub\ncontrol=${mode} exit=1\nCONTROL-PASS ${mode}\n`;
fs.writeFileSync(out, body, { flag: 'wx' });
process.exit(0);
