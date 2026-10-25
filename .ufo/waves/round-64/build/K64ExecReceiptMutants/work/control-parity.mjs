#!/usr/bin/env node
// control-parity.mjs — the extended selftest must not change the tool's diff behaviour.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const C = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/controls/receipt';
const tool = process.argv[2];
const ids = (o) => [...new Set(o.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');
let bad = 0;
for (const c of readdirSync(C).filter((n) => existsSync(join(C, n, 'expect'))).sort()) {
  const [code, want] = readFileSync(join(C, c, 'expect'), 'utf8').split('\n');
  const r = spawnSync('node', [tool, '--lane', join(C, c, 'lane'), '--round', '9', '--report', join(C, c, 'report.md')], { encoding: 'utf8' });
  const got = r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout);
  const ok = String(r.status) === code && got === want;
  if (!ok) bad += 1;
  process.stdout.write(`${ok ? 'ok  ' : 'BAD '}${c} exit=${r.status} got=${got} want=${want}\n`);
}
process.stdout.write(`control-parity mismatches=${bad}\n`);
process.exit(bad ? 1 : 0);
