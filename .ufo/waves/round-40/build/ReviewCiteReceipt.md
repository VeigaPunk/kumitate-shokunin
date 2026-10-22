# ReviewCiteReceipt — R39-7 receipt: cite-check at 654d1b28, d8bb37db, round-40 open

Seat: ReviewCiteReceipt (kumitate round 40, wave 1). Lane revs run in my own scratch clone
`/fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/lane` (cloned with
`git clone --no-hardlinks` from the lane, detached at each rev). Source pin:
`--src /fast/scratch/hyaku/kumitate-pin/src` (rev 31c465f15669). node v24.21.0 (system; no tools installed).

## First line

`RESULT ReviewCiteReceipt verdict=explained errors_654d1b28=643 errors_d8bb37db=639 errors_open=659`

Numbers are the receipt-comparable form defined below (the same invocation shape that produced
the committed receipt). All three runs: `VERDICT: FAIL`, `CITE_CHECK: DRIFT`, exit=1.

## The committed receipt reproduces exactly — and its invocation form is now identified

`scripts/cite-check.mjs` defaults `--fleet` to `dirname(--self)`, so the error count depends on
what sits in the clone's parent directory (fleet-rung citations resolve against it). Round-39
seats cloned to `<roundRoot>/…/lane` with roundRoot = `/fast/scratch/hyaku/kumitate-r39`, and that
round root still contains stray files (`open/selftest.txt`, `measure-c1-open.txt`,
`floor-probe-open.txt`, `mutants.txt`, `limits.py`, …) that resolve a few otherwise-UNRESOLVED
bare-name citations.

Reproducing the committed receipt bit-for-bit:

    $ cd /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/lane   # detached at 654d1b28
    $ node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --fleet /fast/scratch/hyaku/kumitate-r39
    CITE_CHECK: DRIFT (files=92 tokens=9024 errors=643 warnings=525)
    exit=1

This matches `final/docs-gates-654d1b28.txt` line for line
(`CITE_CHECK: DRIFT (files=92 tokens=9024 errors=643 warnings=525)`, exit=1). So the receipt's
"exact form" = the plain command run from a lane clone whose parent is the round-39 round root
(the explicit `--fleet` only emulates that default). The 643 is partly a scratch-layout artifact:
under the real fleet tree (`--fleet /home/vgpnk/Projects/shokunin`) the same revision reads
`errors=501` (98 FLEET_MISSING findings from the scratch parent remain in all scratch forms; they
are environment, not documents).

## Series at the three revisions (receipt-exact form)

| rev | files | tokens | errors | warnings | verdict |
|---|---|---|---|---|---|
| 654d1b28e33d275c0945a53998340a416386c6e0 | 92 | 9024 | **643** | 525 | FAIL / DRIFT, exit=1 |
| d8bb37db99a75616a56d5094ce1db3b639004438 | 92 | 9024 | **639** | 525 | FAIL / DRIFT, exit=1 |
| f69817edf687c8ce4f87ed7953a353399232f69e (round-40 open) | 93 | 9089 | **659** | 529 | FAIL / DRIFT, exit=1 |

Cross-check under the environment-independent real-fleet form
(`--fleet /home/vgpnk/Projects/shokunin`): 501 → 494 → 510 (same deltas, −4 then +16+4=+20).
Plain form in a bare seat clone (no round-root sibling files): 646 → 639 → 660.

## Which documents changed (git evidence)

- 654d1b28 → d8bb37db, −4 errors: only `corpus/lessons/round-39.md` changed (6 ins / 6 del).
  Five bare receipt filenames (`measure-c1-open.txt`, `measure-c1-final.txt`,
  `floor-probe-open.txt`, `floor-probe-final.txt`, `red-before.txt`) were rewritten to full
  `.ufo/waves/round-39/final/…` paths, which resolve in the runtime namespace instead of
  erroring. round-39.md errors 4 → 0. The round-39 report's wording "removed 3 new unresolved
  cite-check tokens" is imprecise: the net is 4 errors, and 3 of the 5 rewritten names had only
  been "resolving" against stray round-root scratch files (`measure-c1-open.txt`,
  `floor-probe-open.txt`, `mutants.txt`), i.e. the 643 baseline itself contained that accident.
- d8bb37db → f69817ed (via 774582670 then f69817e), +20 errors: a NEW scanned document
  `corpus/lessons/round-39-verifier-spotcheck.md` (+175 lines) contributes exactly 20 errors
  (19 UNRESOLVED + 1 PIN_MISMATCH `ecb22db0`). The edits to `SKILL.md` (+6/−2, errors 12 → 12)
  and `round-39.md` (+42/−5, errors 0 → 0) net zero error change. files 92 → 93 and
  tokens 9024 → 9089 come from the same new lesson.

## Assessment of the R39-7 claim

- The round-39 report line `cite-check: errors 639 → 639` had no committed receipt (R39-7
  confirmed: the only committed run is 643 at 654d1b28).
- The `639 → 639` pairing compared round-39's own open (fac39171) with its measured commit; the
  d8bb37db landing (−4, to 639) is what makes the tip read 639 under the receipt form.
- At ROUND-40 open the receipt-comparable value is 659, not 639: the round-39 verifier-spotcheck
  lesson itself adds 20 new errors (mostly the lesson citing wave artifacts by short paths that
  the pruned `.ufo/` namespace does not resolve, plus one stale content pin `ecb22db0` vs
  sha256(scripts/anchor-truth.mjs)). This is the lesson's own recorded debt (R39-8 adjacent), not
  a regression introduced this round.

## Receipt files saved for the L1 to commit (all under my seat dir)

    /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/cite-check-654d1b28-receipt-fleet.txt   (643 — matches committed receipt exactly)
    /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/cite-check-d8bb37db-receipt-fleet.txt   (639)
    /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/cite-check-open-f69817ed-receipt-fleet.txt (659, round-40 open)
    /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/cite-check-{654d1b28,d8bb37db,open-f69817ed}-realfleet.txt (501/494/510)
    /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceipt/cite-check-{654d1b28,d8bb37db,open-f69817ed}-plain.txt (646/639/660, bare seat-clone defaults)

Each file carries a `rev …` header, the exact command, full findings and `exit=`. Also
`errs-*.txt` (per-document error tallies used for the attribution above).

## Verification gaps

- The receipt's PROXY and SOURCES_CHECK blocks were not re-run (out of my item's scope; the
  CITE_CHECK block is the one R39-7 names).
- The exact round-39 clone directory that produced the receipt (gd/gm/gt/lim/rb/openclone under
  the round root) is not distinguishable from output alone — all give identical counts because
  the fleet default is the same round root.
