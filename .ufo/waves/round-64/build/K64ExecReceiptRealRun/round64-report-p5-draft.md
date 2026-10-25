# kumitate — round 64 (P5 shape draft; NOT the L1's report)

Draft used only to exercise report-receipt-diff P5 semantics: it carries the six required headings, four SHONEN
boxes and tallies that the committed round-64 base receipts carry verbatim.

## Work performed
Built `scripts/report-receipt-diff.mjs` and attacked it on the real reports of rounds 40..63.

## Landed changes
Tool, counters, controls and receipts committed under `.ufo/waves/round-64/`.

## Before → after measurements
- C1 base `6825a514…`: `RECEIPT64_UNMET held=0/5 checks=5` exit 1 (`.ufo/waves/round-64/base/receipt64-base.txt`).
- C2 base: `JJ64_UNMET held=0/8 checks=8` exit 1 (`.ufo/waves/round-64/base/jj64-base.txt`).
- C2 do-nothing control: `JJ64_UNMET held=1/8 checks=8` exit 1 (`.ufo/waves/round-64/base/jj64-donothing.txt`).

## Sources & frontier
Census before: `.ufo/waves/round-64/base/census-before.txt`.

## Trend verdicts
No axis integer moves; the verdict is the counter.

## SHONEN
- [~] SKILL.md decision tables and cited sources — unchanged this round.
- [~] End-to-end domain task executed and logged — the receipt tool ran on 24 real reports.
- [ ] Instructions executable by an agent without oral context — the tool's usage line and selftest are self-describing.
- [~] No cross-domain bleed — lane files only.
