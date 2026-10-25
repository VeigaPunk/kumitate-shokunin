#!/usr/bin/env node
// check.mjs <tool.mjs> — runs one tool build through: its selftest, the 16 frozen receipt controls,
// the 19 forgery cases of this seat, and the P3 arms (round-60 report DRIFT shape, round-63 CLEAN).
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tool = resolve(process.argv[2]);
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';
const REV = 'dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef';
const run = (args) => spawnSync('node', [tool, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');

const fails = [];
let n = 0;
const expectCase = (dir, label) => {
  n += 1;
  const [code, want] = readFileSync(join(dir, 'expect'), 'utf8').split('\n');
  const r = run(['--lane', join(dir, 'lane'), '--round', '9', '--report', join(dir, 'report.md')]);
  const got = r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout);
  if (String(r.status) !== code || got !== want) fails.push(`${label}: got=${r.status}/${got} want=${code}/${want}`);
};

// 1. selftest
const st = run(['--selftest']);
process.stdout.write(`SELFTEST exit=${st.status} ${st.stdout.trim().split('\n').pop()}\n`);
if (st.status !== 0) fails.push('selftest');

// 2. frozen controls (untouched bytes)
const CTRL = join(LANE, '.ufo/waves/round-64/controls/receipt');
const frozen = readdirSync(CTRL).filter((c) => existsSync(join(CTRL, c, 'expect'))).sort();
for (const c of frozen) expectCase(join(CTRL, c), `frozen/${c}`);
process.stdout.write(`FROZEN controls=${frozen.length}\n`);

// 3. this seat's forgery cases
const MINE = join(dirname(fileURLToPath(import.meta.url)), 'cases');
const mine = readdirSync(MINE).filter((c) => existsSync(join(MINE, c, 'expect'))).sort();
for (const c of mine) expectCase(join(MINE, c), `forge/${c}`);
process.stdout.write(`FORGERY cases=${mine.length}\n`);

// 4. P3 arms on the real reports as filed
const r60 = '/tmp/kumitate-r64/K64ExecReceiptForge/r60.md';
const r63 = '/tmp/kumitate-r64/K64ExecReceiptForge/r63.md';
const a = run(['--lane', LANE, '--round', '60', '--report', r60, '--rev', REV, '--fleet', FLEET]);
const ph = a.stdout.split('\n').filter((l) => l.startsWith('PLACEHOLDER ')).length;
const indep = (readFileSync(r60, 'utf8').match(/__[A-Z][A-Z0-9_]*__/g) || []).length;
const tallyLine = /^TALLY_UNRECEIPTED DISPATCH60_HELD held=10\/10$/m.test(a.stdout);
process.stdout.write(`P3/r60 exit=${a.status} placeholders=${ph} indep=${indep} tallyLine=${tallyLine}\n`);
if (a.status !== 1 || ph !== indep || !tallyLine) fails.push(`P3/r60 exit=${a.status} ph=${ph}/${indep} tallyLine=${tallyLine}`);
const b = run(['--lane', LANE, '--round', '63', '--report', r63, '--rev', REV, '--fleet', FLEET]);
process.stdout.write(`P3/r63 exit=${b.status} ${b.stdout.trim()}\n`);
if (b.status !== 0 || !b.stdout.startsWith('REPORT_RECEIPT: CLEAN')) fails.push(`P3/r63 exit=${b.status} ${b.stdout.trim()}`);

process.stdout.write(`CHECK cases=${n} fails=${fails.length}\n`);
for (const f of fails) process.stdout.write(`FAIL ${f}\n`);
process.exit(fails.length ? 1 : 0);
