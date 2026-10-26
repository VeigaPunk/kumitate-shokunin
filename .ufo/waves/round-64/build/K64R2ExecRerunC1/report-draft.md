# kumitate — round 64 (C1 re-run receipt)

## Work performed
Independent re-run of the C1 counter `receipt64-probe.mjs` (rule R64) at the integrated revision
2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8, five times without a report and once with this file as `--report`,
plus `scripts/counter-rerun.mjs` over five runs. The counter reads the lane's committed bytes only
(`git archive <rev>`); the worktree is never read.

## Landed changes
`scripts/report-receipt-diff.mjs` v2 (contract kumitate-report-receipt-diff-v2, selftest 52/52) and the
37 committed receipt controls under `.ufo/waves/round-64/controls/receipt/`, 21 of them the post-freeze
ratchet cases disclosed in `.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md`.

## Before → after measurements
At base 6825a51425e91908f019ed65aa2f4209acbd7087 the counter reads, in
`.ufo/waves/round-64/base/receipt64-base.txt`: RECEIPT64_UNMET held=0/5 checks=5.
At 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 the same counter holds 4 of 5 checks, with P5 awaiting this
report; the P5 run over this file is recorded in the seat report, not repeated here as a labelled tally.

## Sources & frontier
The claim's plan section is `.ufo/waves/round-64/plan.md` (frozen at dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef);
the counters and controls are pinned by `node scripts/counter-pins.mjs`, which reads COUNTER_PINS: CLEAN.
No frontier row moves for C1.

## Trend verdicts
Operability: the counter reproduces its verdict line byte-for-byte across runs; the claim stands on the
counted checks, not on this report's prose. No axis harmed.

## SHONEN
- [~] operability: counter re-run at the integrated revision, five runs compared.
- [~] determinism: final summary line byte-identical across the runs.
- [ ] coverage: untouched by this seat.
- [~] honesty: every number below is a command's own output line.
