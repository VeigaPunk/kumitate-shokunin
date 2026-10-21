AUDIT NativeTrial5 anchors=1 false=1 overreverted=0 notice=bad verdict=refuted

Scope: corpus/knowledge/native-trial-launch.md, group 5/8. Pin /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7 (HEAD matches, `status --short` empty). The lane moved during the audit; both states are audited below.

## State and partition
- Assigned state = commit 5ceb8cd bytes (note blob 2de70ea; lane HEAD a5d627b when I started). `git diff 0614092` = 11+/9-: 9 changed anchors at note lines 330, 356, 359, 361, 371, 374, 387, 420, 422, plus the notice.
- Superseded by 5bc40d0 "reset four notes to 0614092 bytes" -> HEAD c7648c7, note blob 53af1ab (= worktree). `git diff 0614092 --numstat` = `1 0` (notice line only). The changed-anchor set is now empty, so the 5/8 partition is undefined there. I audited the same positions in both states.
- Partition conventions differ across the lane. array_split(9,8) (AuditNativeTrial6) puts group 5 at #6, L374 writeEvidenceFile. ceil(8p/9) (AuditNativeTrial8) puts group 5 at #5, L371 parseArgs. Header counts use #6; #5 is the boundary row. Header is identical under either convention.

## Group-5 anchors (pin truth = symbol token on the line; "def" = pinned definition line)
| # | note L | symbol | 0614092 -> pin | round-36 (3d5760a) -> pin | assigned 5ceb8cd -> pin | reset c7648c7 -> pin | def at pin |
|---|---|---|---|---|---|---|---|
| 6 primary | 374 | writeEvidenceFile | :951 F (comment) | :977 F (persistEvidenceWrites) | :977 F | :951 F (comment) | 955 |
| 5 boundary | 371 | parseArgs | :120 T | :118 F (COLLECTOR_USAGE) | :118 F | :120 T | 120 |

- #6: restored-but-still-false in both states. Assigned: round-37 left the round-36 value (977) untouched; it is a different symbol's line. Reset: restores base :951, a comment; the reset notice files it as debt. The item's criterion is literal, so it fails. Not an over-reversion: the round-36 value was already false.
- #5: assigned = restored-but-still-false and a missed restoration (base :120 was TRUE; round-37 kept round-36's :118). Reset = correct.
- Overreverted in group scope = 0 in both states.

## Adjacent, same collector paragraph (base-equal, so the 0614092 diff cannot see them; not in header)
- L373 validateDispatches: base :869 F (`missing_seats` message line); round-36 :873 T (`function validateDispatches(`); assigned :869 F; reset :869 F. OVER-REVERSION in both states.
- L374 persistEvidenceWrites: base :973 F (`} finally {`); round-36 :977 T (`function persistEvidenceWrites() {`); assigned :973 F; reset :973 F. OVER-REVERSION in both states.

## Note-level over-reversions (round-36 pin-true, base/restored value false)
19 anchors. All 19 are FALSE in the assigned state and in the reset state. Round-36 pin-true -> base line:
PROFILE :56->:50; PROPOSAL_WAVE_CEILING :115->:109 (assigned :96); parseArgs(run-omp) :851->:844; planLaunchMode :965->:958; handOffToSightingWall :1289->:1282; resolveNativeDispatchPolicy :639->:646 (absent from AuditNativeTrial6 table B); validateDispatches :873->:869; persistEvidenceWrites :977->:973; splitRoute :66->:39; loadSeatRoutingMirror :173->:155; verifyLaunchSeatRouting :301->:283; readRoundPlan :722->:704; waveTokenFromContext :798->:780; parseRateCard :926->:908; attemptLedgerEntry :71->:70; seatStatus :476->:474; verifyEffectiveLaunch :633->:631; buildCostLedger :1005->:1003; appendRoutingHealth :1071->:1067.

## Notice (note L2)
Present in both states.
- Assigned text ("reverted to the lines their 0614092 sentences named"): INACCURATE. 0 of 9 changed anchors equal their 0614092 line. Six are byte-identical to round-36 (L359 639, L371 118, L374 977, L387 62, L420 722, L422 926). Three moved to new values matching neither (L330 303, L356 96, L361 303). The cause text cites spot-check D1 (corpus/lessons/round-36-verifier-spotcheck.md:193-196), which exists but says "keep the base line wherever its symbol is still on that line". L371 kept round-36's 118 although base :120 holds parseArgs. L373/L374 were restored to base lines that lack their symbols.
- Reset text (current): bytes claim ACCURATE (diff = notice line only). "no anchor here is a round-36 artifact" is accurate as bytes. INACCURATE in scope: "Pre-existing anchors that were already false at the pin remain" omits that the reset turns 19 round-36 pin-true anchors false again (list above); those are not pre-existing. Provenance "(final, amended by AuditSighting2/4)" is unsupported: falsify/AuditSighting2.md and AuditSighting4.md have no match for native-trial or AuditNativeTrial, and fdac52c touched sighting-wall.md only.
- notice=bad in both states.

## Verdict
refuted. Both failing conditions hold in both states: (a) a restored anchor whose symbol is not on its line (#6 L374: 977 assigned, 951 reset); (b) the notice misstates scope (assigned: "reverted to 0614092" is false; reset: omits 19 true->false reversions and misattributes an amendment). The reset's disclosed debt does not satisfy (a) under the literal criterion.

## Out of group (not counted in header)
- L356 PROPOSAL_WAVE_CEILING: round-36 :115 T -> :96 F assigned, :109 F reset. Over-reversion (group 2).
- L359 resolveNativeDispatchPolicy: 639 T -> 646 F in both states. Over-reversion missed by AuditNativeTrial6's table B.

## Commands and output (condensed)
1. `git -C <lane> diff 0614092 -- corpus/knowledge/native-trial-launch.md`: 9 anchor hunks + notice (assigned). `git diff 0614092 --numstat` now: `1 0`.
2. `git -C <lane> diff 3d5760a 5ceb8cd -- <note>`: `-validateDispatches (:873)` -> `+(:869)`; `-(:977) and persistEvidenceWrites (:977)` -> `+(:977) and persistEvidenceWrites (:973)`; L371 `(:118)` and `writeEvidenceFile (:977)` unchanged.
3. `git show 3d5760a:<note>` L369-372: `(...:118) over COLLECTOR_USAGE (:118)`, `validateDispatches (:873)`, `(:977) and persistEvidenceWrites (:977)`. `git show 0614092:<note>` L369-372: `(...:120)`, `validateDispatches (:869)`, `(:951) and persistEvidenceWrites (:973)`.
4. `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> 31c465f15669f744848bd9f5d56191c5085670f7; `git status --short | wc -l` -> 0.
5. `read` pin collector :118 `const COLLECTOR_USAGE = "usage: ..."`; :120 `function parseArgs(argv) {`; :869 `missing_seats: ...` template line; :873 `function validateDispatches(parentKey, actual, expectedKeys) {`; :951 `// P2 (spec 02 §3)...`; :973 `} finally {`; :977 `function persistEvidenceWrites() {`.
6. `grep '^(export )?(async )?(const|let|var|function) NAME'` on pin: collector 955 writeEvidenceFile; run-omp 56 PROFILE, 115 PROPOSAL_WAVE_CEILING, 639 resolveNativeDispatchPolicy, 838 die, 851 parseArgs, 965 planLaunchMode, 1289 handOffToSightingWall; policy 66 splitRoute, 173 loadSeatRoutingMirror, 301 verifyLaunchSeatRouting, 637 resolveNativeProfile, 722 readRoundPlan, 798 waveTokenFromContext, 897 loadCanonicalDirective, 926 parseRateCard; evidence 71, 476, 633, 1005, 1071; base.mjs 120 GODSPEED_MARKER, 133 EVIDENCE_KIND.
7. `grep native-trial-launch .ufo/pins/fidelity-ratchet.json` -> `"corpus/knowledge/native-trial-launch.md": 31`.
8. `grep 'native-trial|AuditNativeTrial'` on falsify/AuditSighting2.md and AuditSighting4.md -> no matches. `git show --stat fdac52c` -> corpus/knowledge/sighting-wall.md only.
9. Peer cross-check: AuditNativeTrial6 and AuditNativeTrial8 agree with the 9 pinned facts above.

## Residual risk and gaps
- The lane's group partition is not self-consistent (array_split vs ceil). Group membership is undefined in the reset state (0 changed anchors).
- Peers 6 and 8 analysed the 5ceb8cd state, and their HEAD references predate the reset.
- Groups 1-4 and 7 not audited. claims-check not run.
- Installs: none. Package transactions: none.

Paths (lane-relative): corpus/knowledge/native-trial-launch.md; corpus/lessons/round-36-verifier-spotcheck.md; .ufo/pins/fidelity-ratchet.json; .ufo/waves/round-37/falsify/AuditNativeTrial5.md. Pin paths are absolute under /fast/scratch/kumitate-r36/src/.
