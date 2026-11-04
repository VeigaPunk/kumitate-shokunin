#!/usr/bin/env node
// K88Mutation: fold receipts/*.{probe,selftest,battery}.txt into summary.json + table.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const B = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Mutation';
const index = JSON.parse(readFileSync(join(B, 'mutants', 'index.json'), 'utf8'));
const ids = [{ id: 'M00-pristine', desc: 'pristine copy of 0ff3562f:scripts/receipt-bind.mjs (baseline)' },
  ...index, { id: 'M26-worktree-twin', desc: 'frozen controls/make-worktree-variant.mjs applied (blobAt reads worktree)' },
  { id: 'M00-restored-lane', desc: 'lane scripts/receipt-bind.mjs after the battery (restoration check, read-only)' }];
const rd = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const rows = [];
for (const { id, desc } of ids) {
  const p = rd(join(B, 'receipts', `${id}.probe.txt`));
  const s = rd(join(B, 'receipts', `${id}.selftest.txt`));
  const bt = rd(join(B, 'receipts', `${id}.battery.txt`));
  const held = (p.match(/^C88_C1: \w+ held=(\d+)\/20$/m) || [])[1];
  const failArms = [...p.matchAll(/^ARM ([\w-]+): FAIL/gm)].map((m) => m[1]);
  const stLine = (s.match(/^RECEIPT_BIND_SELFTEST: (PASS|FAIL).*$/m) || [''])[0];
  const stFail = [...s.matchAll(/^RECEIPT_BIND_SELFTEST arm ([\w-]+) FAIL/gm)].map((m) => m[1]);
  const btLine = (bt.match(/^BATTERY: .*$/m) || [null])[0];
  const btFail = [...bt.matchAll(/^CASE ([\w-]+): FAIL/gm)].map((m) => m[1]);
  const diff = rd(join(B, 'mutants', `${id}.diff`)).split('\n').filter((l) => /^[-+][^-+]/.test(l)).join('\n');
  const probeKilled = held !== undefined && Number(held) < 20;
  const selftestKilled = /FAIL/.test(stLine);
  const baseline = id.startsWith('M00');
  rows.push({
    id, desc, diff_file: `mutants/${id}.diff`, diff, probe_held: held === undefined ? null : `${held}/20`,
    probe_exit: Number((p.match(/^exit=(\d+)$/m) || [])[1]), probe_failed_arms: failArms,
    selftest: stLine, selftest_failed_arms: stFail,
    battery: btLine, battery_failed_cases: btFail,
    verdict: baseline ? 'baseline' : (probeKilled || selftestKilled ? 'killed' : 'survived'),
    killed_by: baseline ? [] : [...failArms.map((a) => `probe:${a}`), ...stFail.map((a) => `selftest:${a}`)],
    seat_battery_kills: btFail.map((c) => `battery:${c}`),
    receipts: [`receipts/${id}.probe.txt`, `receipts/${id}.selftest.txt`, ...(bt ? [`receipts/${id}.battery.txt`] : [])],
  });
}
const mut = rows.filter((r) => r.verdict !== 'baseline');
const summary = {
  seat: 'K88Mutation', target: 'scripts/receipt-bind.mjs@0ff3562f15c18d0ca01dc6a76c9f827d30c26950',
  target_sha256: '098a6713e663cbb9444ea6ec1da503cbf4bba5690c492b5ec9e73f9ee6cace4d',
  judged_rev: '0ff3562f15c18d0ca01dc6a76c9f827d30c26950',
  mutants: mut.length, killed: mut.filter((r) => r.verdict === 'killed').length,
  survived: mut.filter((r) => r.verdict === 'survived').map((r) => r.id),
  probe_20_of_20: mut.filter((r) => r.probe_held === '20/20').map((r) => r.id),
  rows,
};
writeFileSync(join(B, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
const esc = (t) => t.replace(/\|/g, '\\|');
const table = ['| id | change | probe held | selftest | verdict (probe+selftest) | killed-by | seat battery kills |', '|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.id} | ${esc(r.desc)} | ${r.probe_held} | ${r.selftest.replace('RECEIPT_BIND_SELFTEST: ', '')} | ${r.verdict} | ${esc(r.killed_by.join(', ') || '—')} | ${esc(r.seat_battery_kills.join(', ') || (r.battery ? 'none' : 'not run'))} |`)];
writeFileSync(join(B, 'table.md'), `${table.join('\n')}\n`);
console.log(`SUMMARY: mutants=${summary.mutants} killed=${summary.killed} survived=${summary.survived.length} [${summary.survived.join(' ')}]`);
