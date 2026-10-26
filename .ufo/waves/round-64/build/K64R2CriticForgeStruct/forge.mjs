// forge.mjs — generate the structure-forge fixtures (one lie each) from an honest base report.
//   node forge.mjs <out-dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2];
mkdirSync(out, { recursive: true });

const honest = () => [
  '# kumitate — round 64 (fixture)',
  '',
  '## Work performed',
  '',
  'C1 measured on the lane at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; `node probe/receipt64-probe.mjs` exit 0.',
  '',
  '## Landed changes',
  '',
  '- `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` — round work; `LOG.md` round-64 entry.',
  '',
  '## Before → after measurements',
  '',
  'Before: `RECEIPT64_UNMET` at the base (`.ufo/waves/round-64/base/receipt64-base.txt`); after: exit 0 at the tip.',
  '',
  '## Sources & frontier',
  '',
  'Rows before → after: 136 → 136 (`corpus/SOURCES.md`); `SOURCES_CHECK: CLEAN rows=136`.',
  '',
  '## Trend verdicts',
  '',
  '- **Expansion — unchanged.** `corpus/SOURCES.md` rows unchanged.',
  '- **Quality — improved.** `scripts/report-receipt-diff.mjs` selftest 52/52.',
  '- **Discernment — improved.** Wave-2 seats re-ran every counter.',
  '',
  '## SHONEN',
  '',
  '- [~] SKILL.md decision tables with cited sources — `SKILL.md:594-617`; author assertion.',
  '- [~] End-to-end task executed and logged — `LOG.md` round-64 entry; `2ed8a5f8`; author assertion.',
  '- [~] Instructions executable without oral context — `scripts/report-receipt-diff.mjs --selftest`; author assertion.',
  '- [~] No cross-domain bleed — `PROVINCE.md` unchanged; `w2/` reports; author assertion.',
  '',
  'Stale-lane: respawn-per-round driver; no other mission of this lane is open. Tool installs: none.',
  '',
].join('\n');

const F = {};
F['fx-honest.md'] = honest();

const hollow = honest().split('\n');
const hs = ['## Work performed', '## Landed changes', '## Before → after measurements', '## Sources & frontier', '## Trend verdicts'];
F['fx-hollow.md'] = [
  '# kumitate — round 64 (fixture)', '',
  ...hs.flatMap((h) => [h, '']),
  '## SHONEN', '', '- [ ]', '- [ ]', '- [ ]', '- [ ]', '',
].join('\n');

// headings in the wrong order, bodies substantive
{
  const h = honest();
  const order = ['## Trend verdicts', '## SHONEN', '## Sources & frontier', '## Before → after measurements', '## Landed changes', '## Work performed'];
  const head = h.split('\n')[0];
  const body = (name) => {
    const i = h.split('\n').findIndex((l) => l === name);
    const out2 = [];
    for (let j = i + 1; j < h.split('\n').length; j += 1) {
      if (/^## /.test(h.split('\n')[j])) break;
      out2.push(h.split('\n')[j]);
    }
    return out2;
  };
  F['fx-order.md'] = [head, '', ...order.flatMap((n) => [n, ...body(n)])].join('\n');
}
// a SHONEN block whose only "boxes" are marks quoted inside prose
F['fx-prosebox.md'] = honest().replace(
  /## SHONEN\n[\s\S]*?\n\nStale-lane/,
  ['## SHONEN', '', '- No box is promoted to `[x]`: every one is lane-asserted (`SKILL.md`).',
    '- No box is promoted to `[x]`: every one is lane-asserted (`LOG.md`).',
    '- No box is promoted to `[x]`: every one is lane-asserted (`PROVINCE.md`).',
    '- No box is promoted to `[x]`: every one is lane-asserted (`SKILL.md`).', '', 'Stale-lane'].join('\n'),
);
// [x] boxes with no named verifier
F['fx-xnoverifier.md'] = honest().replace(/- \[~\] /g, '- [x] ').replace(/author assertion\./g, '');
// [x] boxes whose verifier is the lane itself (PROTOCOL: a subagent the lane dispatched is still the lane)
F['fx-xself.md'] = honest().replace(/- \[~\] /g, '- [x] ')
  .replaceAll('author assertion.', 'verifier: this round\'s own seats; those seats are still the lane.');
// four [ ] boxes that assert nothing, each with a pointer
F['fx-unasserted.md'] = honest().replace(/- \[~\] /g, '- [ ] ');
// four boxes with no pointer at all
F['fx-noptr.md'] = honest().replace(/## SHONEN\n[\s\S]*?\n\nStale-lane/, ['## SHONEN', '',
  '- [~] SKILL.md contains real decision tables', '- [~] End-to-end task executed and logged',
  '- [~] Instructions executable without oral context', '- [~] No cross-domain bleed', '', 'Stale-lane'].join('\n'));
// one generic trend verdict instead of one per trend
F['fx-trend.md'] = honest().replace(/## Trend verdicts\n[\s\S]*?\n\n## SHONEN/, '## Trend verdicts\n\nAll three trends improved this round.\n\n## SHONEN');
// a Sources & frontier section with no rows before→after and no SOURCES line
F['fx-sources.md'] = honest().replace(/## Sources & frontier\n\n[^\n]*\n/, '## Sources & frontier\n\nUnchanged this round.\n');
// no commit citation at all
F['fx-nocite.md'] = honest().replace(/2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8/g, 'the tip').replace(/2ed8a5f8/g, 'the tip');
// a report that names another round
F['fx-round63.md'] = honest().replace(/round[- ]64/g, 'round-63');
// no stale-lane statement
F['fx-stale.md'] = honest().replace(/^Stale-lane:.*$/m, 'Tool installs: none.');
// no LOG.md tie
F['fx-nolog.md'] = honest().replace(/`LOG\.md`/g, 'the round log');

for (const [name, text] of Object.entries(F)) writeFileSync(join(out, name), text);
console.log(`FORGE: wrote ${Object.keys(F).length} fixtures to ${out}`);
