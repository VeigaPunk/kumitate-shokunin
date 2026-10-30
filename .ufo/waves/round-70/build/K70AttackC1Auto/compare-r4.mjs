#!/usr/bin/env node
// K70AttackC1Auto — receipt comparison under the R4 assertion set.
// R4 requires: exit 0 (wrapper), receipt includes LEDGER69_UNMET and CONTROL-PASS <mode>.
// This harness checks exactly that set against each captured receipt.
import fs from 'node:fs';
const W = '/fast/scratch/hyaku/kumitate-r70/K70AttackC1Auto/W';
const variants = ['fx-bullet-open', 'fx-num-open', 'fx-num-closed'];
let allPass = true;
for (const v of variants) {
  const t = fs.readFileSync(`${W}/${v}.txt`, 'utf8');
  const first = t.split('\n')[0];
  const exitLine = /exit=(\d+)/.exec(t.split('\n').find((l) => l.startsWith('control=')) || '');
  const exit = exitLine ? Number(exitLine[1]) : null;
  const r4 = {
    'receipt-includes-LEDGER69_UNMET': t.includes('LEDGER69_UNMET'),
    'receipt-includes-CONTROL-PASS-autoledger': t.includes('CONTROL-PASS autoledger'),
    'counter-exit-1': exit === 1,
  };
  const rows = /rows=(\d+)/.exec(first);
  const l3 = /L3 (?:PASS|MISS)/.exec(first);
  const l2 = /L2 (?:PASS|MISS)/.exec(first);
  const ok = Object.values(r4).every(Boolean);
  allPass = allPass && ok;
  console.log(`${v}: R4-set-pass=${ok} rows=${rows ? rows[1] : '?'} ${l2 ? l2[0] : ''} ${l3 ? l3[0] : ''}`);
  for (const [k, v2] of Object.entries(r4)) console.log(`    ${k}: ${v2}`);
}
console.log(`ALL-VARIANTS-R4-PASS=${allPass}`);
