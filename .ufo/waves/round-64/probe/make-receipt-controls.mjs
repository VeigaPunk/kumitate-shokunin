#!/usr/bin/env node
// make-receipt-controls.mjs — writes the committed controls for kumitate round 64 claim C1 (rule R64).
// An independent writer: it does not import scripts/report-receipt-diff.mjs. One honest case, the rest each
// alter one thing a do-nothing or sloppy report could carry. Lane fixtures are plain directories (worktree mode).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const out = resolve(process.argv[2] || join(dirname(new URL(import.meta.url).pathname), '..', 'controls', 'receipt'));
rmSync(out, { recursive: true, force: true });
const W = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };
const HEAD = '# kumitate — round 9\n\n## Work performed\nclaims declared.\n\n## Landed changes\nlog entry.\n\n## Before → after measurements\n';
const TAIL = '\n## Sources & frontier\nSOURCES: unchanged — fixture.\n\n## Trend verdicts\nexpansion improved.\n\n## SHONEN\n- [~] a\n- [~] b\n- [ ] c\n- [~] d\n';
const BODY = 'X9_UNMET held=0/3 at base (`.ufo/waves/round-9/base/p-base.txt`); X9_HELD held=3/3 at tip (`.ufo/waves/round-9/close/p-tip.txt`).\n';
const cases = {
  'c0-honest': [HEAD + BODY + TAIL, 'CLEAN'],
  'c1-placeholder-measured': [HEAD + BODY + 'measured rev __MEASURED__\n' + TAIL, 'PLACEHOLDER'],
  'c2-placeholder-lanehash': [HEAD + BODY + 'lane hash LANE_HASH\n' + TAIL, 'PLACEHOLDER'],
  'c3-placeholder-tbd': [HEAD + BODY + 'tip TBD\n' + TAIL, 'PLACEHOLDER'],
  'c4-tally-overstated': [HEAD + BODY + 'X9_HELD held=4/4 at tip\n' + TAIL, 'TALLY_UNRECEIPTED'],
  'c5-tally-verdict-flip': [HEAD + BODY + 'X9_UNMET held=3/3 at tip\n' + TAIL, 'TALLY_UNRECEIPTED'],
  'c6-tally-label-swapped': [HEAD + BODY + 'Y9_HELD held=3/3 at tip\n' + TAIL, 'TALLY_UNRECEIPTED'],
  'c7-receipt-path-missing': [HEAD + BODY + 'see `.ufo/waves/round-9/close/absent.txt`\n' + TAIL, 'RECEIPT_MISSING'],
  'c8-section-missing': [HEAD.replace('## Landed changes\nlog entry.\n\n', '') + BODY + TAIL, 'SECTION_MISSING'],
  'c9-shonen-absent': [HEAD + BODY + TAIL.replace(/## SHONEN[\s\S]*$/, ''), 'SECTION_MISSING,SHONEN_COUNT'],
  'c10-shonen-twice': [HEAD + BODY + TAIL + '\n## SHONEN\n- [~] again\n', 'SHONEN_COUNT'],
  'c11-hash-dead': [HEAD + BODY + 'commit 0123456789abcdef0123456789abcdef01234567\n' + TAIL, 'HASH_DEAD'],
  'c12-r60-shape': [HEAD + BODY + 'measured __TIP__ and X9_HELD held=10/10\n' + TAIL, 'PLACEHOLDER,TALLY_UNRECEIPTED'],
  'c13-placeholder-in-fence': [HEAD + BODY + '```\n__COMMITS__\n```\n' + TAIL, 'PLACEHOLDER'],
  'c14-honest-templates': [HEAD + BODY + 'run `node probe.mjs <lane> <rev> <tip>`; plan target held=9/10 declared before data.\n' + TAIL, 'CLEAN'],
  'c15-honest-two-receipts': [HEAD + BODY + 'Z9_HELD held=5/5 (`.ufo/waves/round-9/close/q-tip.txt`)\n' + TAIL, 'CLEAN'],
};
for (const [name, [report, expect]] of Object.entries(cases)) {
  const d = join(out, name);
  W(join(d, 'report.md'), report);
  W(join(d, 'lane/.ufo/waves/round-9/base/p-base.txt'), 'X9_UNMET held=0/3 checks=3 rev=aaa rule=X9\n');
  W(join(d, 'lane/.ufo/waves/round-9/close/p-tip.txt'), 'X9_HELD held=3/3 checks=3 rev=aaa rule=X9\n');
  W(join(d, 'lane/.ufo/waves/round-9/close/q-tip.txt'), 'Z9_HELD held=5/5 checks=5 rev=aaa rule=Z9\n');
  W(join(d, 'expect'), `${expect === 'CLEAN' ? 0 : 1}\n${expect}\n`);
}
process.stdout.write(`controls written: ${Object.keys(cases).length} cases under ${out}\n`);
