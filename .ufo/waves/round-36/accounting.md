# round 36 seat accounting (frozen at dispatch prep)

- Build wave: 96 seats (scout 23, connector 8, executor 17, scribe 10, critic 8, reviewer 16, mutation-tester 4, revenger 4, sentinel 3, simplifier 3), validator plan/run on `.ufo/waves/round-36/build-spec.json` (policy v2, band 64-100).
- Falsify wave: 81 seats (reviewer 48, mutation-tester 18, critic 9, sentinel 3, connector 3), validated on `.ufo/waves/round-36/falsify-spec.json`.
- Round total planned: 177 seats, inside the round cap of 200. No seat is replaced if it dies; dead seats are recorded.
- L1 planner seat: held by KumitateR36 (the validator rejects `planner` as a frozen-topology role); the bounded planning data-walk rides scout/connector items (ScoutFidelityUniverse, ConnectorScorecardTerms).
- Attempt 1 only; the watchdog shows one launch line for kumitate round=36 (2026-10-21T00:47:22-03:00) and no earlier lane-dead line for this round, so no inherited uncommitted outputs exist.
