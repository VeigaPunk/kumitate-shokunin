import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const dir = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/controls/receipt';
const tools = { original: '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs', patched: '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecReceiptRealRun/report-receipt-diff.patched.mjs' };
const ids = (out) => [...new Set(out.split('\n').filter((l) => /^[A-Z_]+ /.test(l) && !l.startsWith('REPORT_RECEIPT')).map((l) => l.split(' ')[0]))].sort().join(',');
const cases = readdirSync(dir).filter((n) => existsSync(join(dir, n, 'expect'))).sort();
let bad = 0;
for (const c of cases) {
  const [code, want] = readFileSync(join(dir, c, 'expect'), 'utf8').split('\n');
  const row = [];
  for (const [k, t] of Object.entries(tools)) {
    const r = spawnSync('node', [t, '--lane', join(dir, c, 'lane'), '--round', '9', '--report', join(dir, c, 'report.md')], { encoding: 'utf8' });
    const got = r.stdout.startsWith('REPORT_RECEIPT: CLEAN') ? 'CLEAN' : ids(r.stdout);
    const ok = String(r.status) === code && got === want;
    if (!ok) bad += 1;
    row.push(`${k}=${r.status}/${got}${ok ? ' OK' : ' BAD'}`);
  }
  console.log(`${c.padEnd(26)} expect=${code}/${want.padEnd(30)} ${row.join('  ')}`);
}
console.log(`cases=${cases.length} mismatches=${bad}`);
