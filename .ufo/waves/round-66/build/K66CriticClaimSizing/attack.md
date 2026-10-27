# Attack — round-66 plan claim sizing (seat K66CriticClaimSizing)

Target: `.ufo/waves/round-66/plan.md` (frozen 621212bac37f8249c72ac982d1d6534cb8d60701).
Contract rules attacked: claim sizing (one concrete after-state, re-derivable with one command over
committed bytes, no unenumerated universal clause, do-nothing control cannot reach target), axis
naming (incl. "lowest non-retired axis"), causal separability, sourced-claim §2b.4.
Method: re-ran all three frozen controls with SCRATCH=/fast/scratch/hyaku/kumitate-r66/K66CriticClaimSizing;
read both counters end-to-end; compared tool vs counter parsers; read SCORECARD `## Axes`, PROVINCE frontier.

## Control verdicts (reproduced this seat)

```
$ SCRATCH=.../K66CriticClaimSizing bash probe/c1-controls.sh <lane> donothing
LEDGER66_UNMET held=4/6 checks=6 ... | L2 MISS ... rows=0 ... | L3 MISS 67 problems ...
EXIT=1
$ ... autoledger
LEDGER66_UNMET held=4/6 checks=6 ... | L2 MISS ... rows=57 open=57 ... | L3 MISS 12 problems ...
EXIT=1
$ SCRATCH=... bash probe/c2-donothing.sh <lane>
DEPREC66_UNMET held=0/8 checks=8 ... | M1..M8 MISS ...
EXIT=1
```
All three controls fail → no do-nothing path to the target for either claim.

## Findings (full text in ../w1/K66CriticClaimSizing.md)

- F1 (medium): C2's frozen predicate is not re-derivable over committed bytes — M5 is a live curl leg
  (deprec66-probe.mjs:16,43,166); `--no-live` forces M5 MISS → UNMET, so no committed-bytes-only path
  to HELD. Verdict can flip retroactively on external network change.
- F2 (low-medium): C1's 6/6 predicate is mostly pre-satisfied by the freeze-committed tool
  (621212b adds scripts/routed-ledger.mjs, 382 lines; selftest 33/33). donothing already scores 4/6;
  only L2 (CLEAN run) + L3 (bindings + r65 answered) measure this round's data curation. L6 also new
  (SKILL/SCORECARD routed-ledger counts = 0 at freeze).
- F3 (low): axis naming verified — operability(9) is the unique lowest non-retired axis (coverage 10
  retired; three coverage sub-layers 10), so C1 satisfies the obligation; but f_O is terminal at 9 and
  C2's "coverage frontier" is a PROVINCE band, not an ## Axes row — neither claim can move an integer
  (plan admits "No score integer can move").
- F4 (low): L2's "independent item count" is not independent — counter items66 (ledger66-probe.mjs:72)
  and tool (routed-ledger.mjs:21-22) implement the identical section regex; a shared mis-parse would
  pass L2. Not realized on the real data (all 11 routed headings 55..65 match).
- F5 (verified-held): causal separability holds (disjoint file sets, independent counters); sourced-claim
  §2b.4 satisfied in design by C2 (M1/M2 force ≥3 lane-local rows opened 2026-10-27; do-nothing's copied
  S233/S234 fail M2 "not-in-registry").

No frozen counter/control was edited. All scratch under /fast/scratch/hyaku/kumitate-r66/K66CriticClaimSizing
deleted on exit.
