VERDICT: Both do-nothing controls reran operably and agree with the frozen verdict labels and MISS reasons; fixture revisions/seeds differ as expected.

## Evidence

Commands executed concurrently (before L1's warning):
- `TMPDIR=/fast/scratch/hyaku/kumitate-r69/K69ExecControlsRerun bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/c1-controls.sh donothing`
  Output: `LEDGER69_UNMET held=2/7 checks=7 rev=777c1da1451a643a78644b41a6dd866e8c312b4a rule=L69 seed=3946094ef77744f3 | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=1 verdict=ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=0 open=0 closed=0 wontfix=0 findings=61 first=UNLEDGERED:round-55-item-1 own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L4 MISS seed=3946094ef77744f3 7/20 mutants wrong: good:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo;ordinal:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=8 open=7 clo;one-word-quote:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo;ambiguous-quote:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift+pathname-dispatch`
  Trailer: `control=donothing exit=1 rev=777c1da1451a643a78644b41a6dd866e8c312b4a` and `CONTROL-PASS donothing`.
- `TMPDIR=/fast/scratch/hyaku/kumitate-r69/K69ExecControlsRerun bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/c2-controls.sh donothing`
  Verdict: `DEPREC69_UNMET held=8/11 checks=11 rev=769b37cf6fd91996aa7de6736cbfe8b3fb53e195 rule=M69 live=no-live(vacuous-declared) | M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent`
  Trailer: `control=donothing live=no-live-vacuous-declared exit=1 rev=769b37cf6fd91996aa7de6736cbfe8b3fb53e195` and `CONTROL-PASS donothing`.
- Compared with frozen `controls/c1-donothing.txt` and `controls/c2-donothing.txt`: **agree**. C1 matched `LEDGER69_UNMET`, L1–L5 MISS reasons observed in full output; C2 matched `DEPREC69_UNMET` and M5/M9/M11 MISS reasons. Revisions and C1 seed differ by design.

## Findings

1. K69ExecControlsRerun-1 — INFO: C1 do-nothing control is repeatably UNMET (exit 1), with 2/7 held; reproducer is the command above.
2. K69ExecControlsRerun-2 — INFO: C2 do-nothing control is repeatably UNMET (exit 1), with 8/11 held and declared no-live; reproducer is the command above.

## Artifacts

- `.ufo/waves/round-69/w1/K69ExecControlsRerun.md`
- `.ufo/waves/round-69/build/K69ExecControlsRerun/c2-rerun.txt`

## Limits

The original controls scripts wrote their fixed receipt paths; L1 was immediately notified to restore frozen receipt files from freeze commit after both runs settled. I did not modify or restore receipts. No additional checks run.