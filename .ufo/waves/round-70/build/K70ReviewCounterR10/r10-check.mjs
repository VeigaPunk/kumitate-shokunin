import fs from 'node:fs';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const skill = fs.readFileSync(`${LANE}/SKILL.md`, 'utf8');
const score = fs.readFileSync(`${LANE}/SCORECARD.md`, 'utf8');
const probe = fs.readFileSync(`${LANE}/.ufo/waves/round-70/probe/replay70-probe.mjs`, 'utf8');
const cand  = fs.readFileSync(`${LANE}/.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs`);

// 1. Frozen predicate literal (probe line 42)
const LIT = '| control-replay |';
console.log('frozen literal:', JSON.stringify(LIT));
console.log('probe line 42 carries literal:', probe.includes(LIT));

// 2. SKILL.md registry table convention is a BARE name first cell (SKILL.md:605)
const skillRow = '| control-replay | runner | `node scripts/control-replay.mjs --selftest` | `--selftest` | n/a |';
console.log('SKILL-style bare row satisfies literal:', skillRow.includes(LIT));

// 3. SCORECARD.md capabilities-table convention is a BACKTICKED name first cell (SCORECARD.md:1804)
const scoreRowBt   = '| `control-replay` | replay five frozen controls | `node scripts/control-replay.mjs --selftest` | 70 |';
const scoreRowBare = '| control-replay | replay five frozen controls | `node scripts/control-replay.mjs --selftest` | 70 |';
console.log('SCORECARD-style BACKTICKED row satisfies literal:', scoreRowBt.includes(LIT));
console.log('SCORECARD-style BARE row satisfies literal:', scoreRowBare.includes(LIT));

// 4. Live files today (base for the integration delta)
console.log('live SKILL.md contains literal now:', skill.includes(LIT));
console.log('live SCORECARD.md contains literal now:', score.includes(LIT));
console.log('live SCORECARD capability rows all backticked:',
  /^\| `routed-ledger` \|/m.test(score) && /^\| `receipt-evidence` \|/m.test(score) && /^\| `counter-pins` \|/m.test(score));

// 5. Pin arithmetic: probe sha = sha256 of archived bytes = sha256 of committed blob content
import crypto from 'node:crypto';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
console.log('candidate sha256 (19143 bytes):', sha(cand));

// 6. Existing convention of a scripts/ pin in counter-pins.json
const pins = JSON.parse(fs.readFileSync(`${LANE}/.ufo/pins/counter-pins.json`, 'utf8'));
const rl = pins.pins.find((p) => p.path === 'scripts/routed-ledger.mjs');
console.log('existing scripts/ pin example:', JSON.stringify(rl));
console.log('pin for scripts/control-replay.mjs already present:', pins.pins.some((p) => p.path === 'scripts/control-replay.mjs'));
