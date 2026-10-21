EXEC fid-sighting done before=47 after=0 reps=64

# ExecFidSighting — re-anchor sighting-wall.md + native-trial-launch.md (amended FIDELITY rule)

Base: lane `0614092e0804aaca06642cb3a263a05c1cacc98e`; pin `/fast/scratch/kumitate-r36/src` @
`31c465f15669f744848bd9f5d56191c5085670f7` (never written; `git rev-parse HEAD` verified).
Patch: `/fast/scratch/kumitate-r36/w/ExecFidSighting.patch` (319 lines, applies cleanly to the
base commit: `git apply --check` exit 0 on a pristine `git archive HEAD` extraction).
Scratch clone: `/fast/scratch/kumitate-r36/w/ExecFidSighting/lane` (branch `r36-execfidsighting`).
Measurement harness (amended rule, written from the L1 contract, not production code):
`/fast/scratch/kumitate-r36/w/ExecFidSighting/ambig.mjs`; detail logs
`sighting-{before,after}-ambig.txt`, `nt-{before,after}-ambig.txt`; strict-v1 reference
`ref.mjs` (= frozen reference implementation).

## Before / after (amended pairing: both adjacent spans eligible => noid; nonok = elsewhere+absent)

| note | before (anchors/ok/elsewhere/absent/dead/noid/nonok) | after |
|---|---|---|
| corpus/knowledge/sighting-wall.md | 71 / 24 / 20 / 0 / 0 / 27 / **20** | 70 / 46 / 0 / 0 / 0 / 24 / **0** |
| corpus/knowledge/native-trial-launch.md | 52 / 11 / 27 / 0 / 0 / 14 / **27** | 52 / 38 / 0 / 0 / 0 / 14 / **0** |
| **sum of the two notes** | **47** | **0** |
| amended suite total (all notes, for scale) | 1504 / 316 / 290 / 75 / 173 / 650 / 365 | 1503 / 365 / 243 / 75 / 173 / 647 / **318** |

before = pristine `git archive HEAD` tree (`/fast/scratch/.../base`); after = same tree with the
patch applied (`/fast/scratch/.../verify`). Reproduce:
`node ambig.mjs <tree> /fast/scratch/kumitate-r36/src`.
Sighting anchors drop 71->70 because `surface.mjs:13`–`:18` folds to one `:13-18` range anchor
(scout's RANGE recommendation), not because an anchor was dropped silently.

Superseded right-first rule (frozen v1 baseline, for comparison only): before 35 + 35; after the
patch 19 + 12 nonok — those residuals are exactly the ambiguous pairs the amendment turns into
`noid`, never elsewhere/absent. Per the L1 amendment they are not gated and were not re-pointed.

## Repairs (64 anchor-level changes: 56 re-points + 8 adjacency-only; +1 range fold)

All 56 re-points are genuine stale intended-symbol lines at the pin (never a pairing artifact whose
claimed line was already correct); the 8 adjacency-only fixes keep the number and only place the
intended symbol within the 14-char window on the same note line:
- sighting-wall.md (23 re-points): 548->533 writeManifest, 379->423 readManifest, 531->516
  loadStatusView, 663->648 acquireOperationLock, 781->767 withOperationLock, 2225->2239
  spawnPaneForMission, 2347->2361 / 2372->2386 launchMissionLocked/launchMission, 3584->3616
  stopMission, 3682->3714 / 3762->3794 resumeMissionLocked/resumeMission, 3339->3361
  completeMission, 1976->1991 reconcileLocked, 3572->3604 scheduleReconcile, 3511->3543 /
  3544->3576 steerMission/peekMission, 4399->4432 main, 4714->4730 re-export block, 111->116
  emitFatal, 318->325 runLegacyNativeDirect, 310->317 / 314->321 / 294->301 output/requireNoArgs/
  usage. Adjacency-only: :23 (SESSION_NAME), :41/:49 (MANIFEST_SCHEMA/MAX_MANIFEST_BYTES), :198/:202
  (appearsToLaunchOpenCode/Omp), :415 (countActiveSparks). Line labels: table header now
  `wc -l` at `964f443e`; notice replaced with the round-36 repair record.
- native-trial-launch.md (33 re-points): 3229->3234 main, 50->56 PROFILE, 59->65 ADMITTED_PROFILES,
  109->115 PROPOSAL_WAVE_CEILING, 844->851 parseArgs, 958->965 planLaunchMode, 171->176
  snapshotDispatchInputs, 646->639 resolveNativeDispatchPolicy, 1282->1289 handOffToSightingWall,
  831->838 die, 869->873 validateDispatches, 951->955 writeEvidenceFile, 973->977
  persistEvidenceWrites, 223->217 ROUTING_HEALTH_OUTCOMES, 682->758 classifyFailure, 303->297 die,
  260->265 taskCalls, 381->396 taskDispatches, 275->276 modelEvidence, 70->71 attemptLedgerEntry,
  474->476 seatStatus, 631->633 verifyEffectiveLaunch, 520->522 nativeReceiptDigests, 1003->1005
  buildCostLedger, 1067->1071 appendRoutingHealth, 39->66 splitRoute, 155->173
  loadSeatRoutingMirror, 283->301 verifyLaunchSeatRouting, 619->637 resolveNativeProfile, 704->722
  readRoundPlan, 780->798 waveTokenFromContext, 879->897 loadCanonicalDirective, 908->926
  parseRateCard. Adjacency-only: :120 (parseArgs), :133 (EVIDENCE_KIND). All seven headings now
  carry `N L at 964f443e`; each section states its anchors are at the pin; the 964f443e symbol
  verification line now names the pin (2026-10-21).

Revision-label rule kept: `964f443e` numbers (wc table, L counts, topic-section citations) are
retained and labelled; only re-verified member-section anchors carry `31c465f1`.

## Registry-gate invariants preserved

`probeSections` (imported, `--src` pin) on the patched tree: S4 sections all
`live=true symbolHit=true inFamily=true` (5/5, anchors 19/16/13/11/11); S2 sections all
`live=true symbolHit=true inFamily=true` (7/7, anchors 10/6/10/6/7/8/5). No dead anchors
(`dead=0` in both notes); the range `surface.mjs:13-18` endpoints are non-blank.

## Concurrent-worktree warning (not caused by this seat)

The production worktree already carries uncommitted mechanical edits to both of my files
(mtime 2026-10-21 02:39) that this patch supersedes; they pair the wrong symbols and must not be
kept: e.g. `corpus/knowledge/sighting-wall.md` writeManifest `548`->`287`
(`normalizeRegistryRevision`, not writeManifest), stopMission -> `3714` (resumeMissionLocked), main
-> `1072`; `native-trial-launch.md` ADMITTED_PROFILES -> `115`, die -> `4315`. Apply this patch to
the committed base after resetting the two paths:
`git checkout 0614092 -- corpus/knowledge/sighting-wall.md corpus/knowledge/native-trial-launch.md`
then `git apply /fast/scratch/kumitate-r36/w/ExecFidSighting.patch` (verified exit 0 on the base).

## Commands run (evidence)

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7`.
- `node ambig.mjs <base> <pin> [note] --detail` -> the before/after table above (both notes
  `nonok=0` after; detail logs in scratch).
- `node ref.mjs <verify> <pin>` -> strict-rule residual `19`/`12` nonok, all ambiguous-row
  elsewhere readings; not gated under the amendment.
- `git apply --check` + `git apply` on a pristine extraction -> exit 0; re-measured `nonok=0`.
- `node -e 'probeSections(...)'` -> section liveness/symbol/inFamily lines quoted above.
- `git show 964f443e:<file> | wc -l` -> 4304/1804/955/383/1163/924/745 (native headings) and
  4714/507/510/614/325 (sighting table), so every retained count is correctly labelled.
- No tool installs or upgrades; no writes under the pin; no lane/jj/git mutation.

## Risks / blockers

- [INFERENCE] The amended pairing rule is implemented per the L1 message and the scout's 25
  line-correct pairing artifacts are left with their numbers intact (`noid`, never gated). If the
  integrated `--fidelity` uses the older right-first pairing, these two notes would read 19/12
  nonok; the amendment must land with the gate for `nonok=0`.
- [INFERENCE] The three `noid(none)` helper anchors in sighting `:317/:321/:301` and the two
  re-export/launchMission `noid(none)` anchors remain diagnostics only (no same-line symbol by
  construction); no gate term reads them.
