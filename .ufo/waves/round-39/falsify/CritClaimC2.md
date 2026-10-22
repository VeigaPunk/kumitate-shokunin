RESULT CritClaimC2 rev=3908f322c4c473f1a8b45c8d1c14054205eb7647 verdict=overclaimed gaps=7
Scope: own clone /fast/scratch/hyaku/kumitate-r39/seats/CritClaimC2/lane detached at 3908f322; src /fast/scratch/hyaku/kumitate-r39/src at 31c465f1. No installs or updates. Lane: only this file written.
1. Probe at open, `node --input-type=module - --lane <lane> --rev fac39171… --src <src> < floor-probe.mjs.txt`: `FLOOR_PROBE accepted=6/6`. At 3908f322: `FLOOR_PROBE accepted=0/6`. The open value matches the claim. But the committed receipt `.ufo/waves/round-39/open/floor-probe-open.txt` says `accepted=5/5`, because A6 was added later in dfa159d. The receipt is stale (gap 1).
2. The 0/6 does not measure the identity floor alone. A3 was refused by `TOKEN_FORGED` only, A4 by `FAIL-CLOSED (PIN_INVALID)` from the schema, and A1 and A2 by `TOKEN_FORGED,BASE_TRUE_LOST`. Only A5 and A6 were refused by `BASE_TRUE_LOST` alone (gap 2).
3. `python3 measure-c1.py.txt --rev 3908f322…`: `PRIOR62_CORRECTED 59/62`, `OLD_TOKEN_LOSSES 0`, `baseline_true_changes []`. At fac39171 it gives 58/62 with 0 losses. The fixed baseline and the C1 gains are preserved by the candidate.
4. `node scripts/anchor-truth.mjs --selftest` at 3908f322: `ANCHOR_TRUTH_SELFTEST: 30/30 pass`, exit 0.
5. Red-before for R38-1: the committed `open/selftest.txt` is 22/22 on the old code, which does not contain AT23–AT30, so no isolated red-before is committed (gap 3). I reconstructed it with mutant M00, which removes all new production logic and keeps the new tests: `23/30`, with AT23, AT24 and AT26–AT30 failing. AT25 passes, which is correct because it is a stays-CLEAN check.
6. Mutation sweep (`python3 mut.py`, selftest as the oracle, 15 mutants): 12 killed.
   - Killed: no TOKEN_FORGED (AT24, AT28); no source rule (AT26, AT30); review token may be null (AT30); identity loop off (AT23, AT24); "anchor gone" arm off (AT23); "non-true" arm off (AT24); group check off (AT27); group threshold `>b.n+1` (AT27); `b.t>1` (AT27); identity without path (AT29); identity without occurrence (AT24); TOKEN_FORGED ignores null token (AT28).
   - SURVIVED M15, which makes the group count only `unchecked`: no test covers the debt arm. An earlier true copy plus an original turned `debt:false` is untested (gap 4).
   - SURVIVED M09, which drops the `b.t>0` guard: no test pins the guard.
   - SURVIVED M14, which deletes the old key-match `DEBT_GREW` loop: with the identity check present, the loop is redundant dead weight.
   - Crashes: none.
7. The floor protects only anchors that were true at base, not later repairs. With the 3908 script and the fac39171 note and pin, which undo this round's S8#475 repair: `ACCEPTED exit=0 TRUTH: CLEAN (… true=777 debt=21 …)` (gap 5).
8. Limit 2 is confirmed but understated. It is not a one-for-one trade: `DEBT_GREW` compares against the frozen base, where S8 debt is 77 at base and 4 now. With N new false anchors at a fresh raw, then `--write-pin`, then `--base e18ff1af…`:
   - n=72: `ACCEPTED … debt=92`
   - n=73: `ACCEPTED … debt=93`
   - n=74: `REFUSED exit=1 DEBT_GREW`
   So the headroom is 73 new false anchors in S8 alone, and 188 across all notes (base debt 208, current 20) [INFERENCE for the other notes].
9. Limit 1 is confirmed. Relabelling true pair entry S8#3 to `review:nobody-unbound` gives `ACCEPTED exit=0 TRUTH: CLEAN`, so the seat name is not checked against any record (false provenance, gap 6). Its effect on truth is limited by `overrideValid`: the token must be in the sentence and the judge must find it true. My search found no S8 debt entry that an unbound review could turn true (`none-found`). This is not refuted, just not shown.
10. R38-1 also asked to re-capture the final direct-entry and frozen evidence. At 3908f322, `.ufo/waves/round-39/` holds only `open/` and `probe/`. `round-38/frozen/replay.py.txt` checks out `e['measured_revision']`, the round-38 revision, so it does not cover the new script or the pin (gap 7).
R38-1 conformance:
- Stable identity across reviewed token changes: yes. The identity `raw@path#n` does not use the token, AT25 stays CLEAN when ordinals shift, and the control run is CLEAN with S8#52, #270 and #456 re-keyed. Tradeoff: a base-true raw can never be re-cited, for example by widening its range (A5 is refused). That needs a re-based floor, not a fix.
- Required fixture (base-true to unchecked under a new key while aggregate true stays above base): yes, AT24.
- Isolated red-before: not committed.
- Behavioral mutant kill: partial, with three survivors.
- Fixed baseline and C1 gains preserved: yes.
- Frozen evidence re-captured: no.
What the report must NOT claim:
- That the per-anchor floor is immutable, or that "no anchor can regress". The probe lists only 6 self-authored attacks, and items 7 and 8 are accepted.
- That 0/6 measures BASE_TRUE_LOST.
- That Limit 2 is one-for-one.
- That review sources are attributed.
- That the frozen replay covers round 39.
- That the open value 6/6 is a committed receipt (the receipt says 5/5).
Smallest safe correction:
- Word C2 as "FLOOR_PROBE 6 listed attacks: 6/6 to 0/6 accepted; selftest 30/30".
- State Limit 2 as debt headroom of base minus current (73 in S8).
- Re-run and commit `floor-probe-open.txt` with A6.
- Add a test with the original turned `debt:false` (kills M15), and delete the redundant key-match loop or justify keeping it.
- Commit the red-before receipt and the round-39 frozen evidence.
