FID-SIGHTING anchors=123 elsewhere=69 absent=1 dead=0 noid=18

# ScoutFidSighting — per-anchor repair list: sighting-wall.md + native-trial-launch.md

Read-only scout. Pin: `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (never written or chmod'ed).
Resolver: FIDELITY v1 implemented from the frozen contract. Member section = `## ` heading whose first backticked token resolves to one origin file. Anchor = bare `` :N[-M] `` or own-file `path:N[-M]`. Symbol = adjacent backticked span on the same note line, right within 14 chars first then left; paired span must not be an anchor/path-like, >=3 chars, not only punctuation/digits. `nonok = elsewhere + absent`; `dead`/`noid` are diagnostics.
Probe: `/fast/scratch/kumitate-r36/w/ScoutFidSighting/{fid,fid2,fid3}.mjs` (totals / any-revision per-anchor / this table).
Reproduction: totals are identical to the frozen prototype `.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt:8` (native-trial `anchors=52 ok=11 elsewhere=35 absent=0 dead=0 noid=6`) and `:16` (sighting-wall `anchors=71 ok=24 elsewhere=34 absent=1 dead=0 noid=12`).

| note | anchors | ok | elsewhere | absent | dead | noid | nonok |
|---|---:|---:|---:|---:|---:|---:|---:|
| corpus/knowledge/sighting-wall.md | 71 | 24 | 34 | 1 | 0 | 12 | 35 |
| corpus/knowledge/native-trial-launch.md | 52 | 11 | 35 | 0 | 0 | 6 | 35 |
| **total** | **123** | **35** | **69** | **1** | **0** | **18** | **70** |

Burn-down classes: **25 pairing-only** (claimed line is already correct at the pin; v1's right-first adjacency steals the next symbol), **45 line moves** (44 stale lines + 1 range-end), **1 absent that is a pairing artifact**. `noid=18` is not gated by v1: 17 wrapped symbols + 1 prose citation.
Verdicts: `PAIR` = fix adjacency only; `MOVE` = renumber only (pairing already correct); `MOVE+PAIR` = both; `WRAP` = noid, symbol sits on a wrapped line; `RANGE` = end of a `:13`–`:18` range; `PROSE` = no adjacent symbol by design. `[pair=…]` is what v1 pairs today (the thief).
`pin` = intended symbol's definition line at 31c465f1; `@964` = same at `964f443e`, the revision both notes name.

| note:line | anchor | intended symbol | pin | @964 | verdict |
|---|---|---|---:|---:|---|
| sighting-wall.md:102 | `scripts/ufo-sighting.mjs:548` | writeManifest | 533 | 548 | MOVE+PAIR[pair=registryRevision] |
| sighting-wall.md:105 | `scripts/ufo-sighting.mjs:379` | readManifest | 423 | 379 | WRAP |
| sighting-wall.md:106 | `scripts/ufo-sighting.mjs:531` | loadStatusView | 516 | 531 | WRAP |
| sighting-wall.md:108 | `scripts/ufo-sighting.mjs:663` | acquireOperationLock | 648 | 663 | MOVE |
| sighting-wall.md:111 | `scripts/ufo-sighting.mjs:781` | withOperationLock | 767 | 781 | MOVE |
| sighting-wall.md:114 | `scripts/ufo-sighting.mjs:2225` | spawnPaneForMission | 2239 | 2225 | MOVE |
| sighting-wall.md:116 | `scripts/ufo-sighting.mjs:2347` | launchMissionLocked | 2361 | 2347 | WRAP |
| sighting-wall.md:116 | `:2372` | launchMission | 2386 | 2372 | WRAP |
| sighting-wall.md:117 | `scripts/ufo-sighting.mjs:3584` | stopMission | 3616 | 3584 | MOVE+PAIR[pair=resumeMissionLocked] |
| sighting-wall.md:118 | `:3682` | resumeMissionLocked | 3714 | 3682 | MOVE+PAIR[pair=resumeMission] |
| sighting-wall.md:118 | `:3762` | resumeMission | 3794 | 3762 | MOVE+PAIR[pair=completeMission] |
| sighting-wall.md:118 | `:3339` | completeMission | 3361 | 3339 | MOVE |
| sighting-wall.md:119 | `:1976` | reconcileLocked | 1991 | 1976 | MOVE+PAIR[pair=scheduleReconcile] |
| sighting-wall.md:119 | `:3572` | scheduleReconcile | 3604 | 3572 | MOVE |
| sighting-wall.md:121 | `:3511` | steerMission | 3543 | 3511 | MOVE+PAIR[pair=peekMission] |
| sighting-wall.md:121 | `:3544` | peekMission | 3576 | 3544 | MOVE |
| sighting-wall.md:123 | `scripts/ufo-sighting.mjs:4399` | main | 4432 | 4399 | MOVE |
| sighting-wall.md:126 | `scripts/ufo-sighting.mjs:4714` | re-exports | 4730 | 4714 | PROSE |
| sighting-wall.md:136 | `:19` | SHIM_PATH | 19 | 19 | PAIR[pair=MODULE_PATH] |
| sighting-wall.md:136 | `:21` | MODULE_PATH | 21 | 21 | PAIR[pair=SESSION_NAME] |
| sighting-wall.md:137 | `:23` | SESSION_NAME | 23 | 23 | PAIR[pair=TMUX_TARGET] |
| sighting-wall.md:137 | `:27` | TMUX_TARGET | 27 | 27 | PAIR[pair=APP_ID] |
| sighting-wall.md:140 | `scripts/ufo-sighting-lib/base.mjs:41` | MANIFEST_SCHEMA | 41 | 41 | PAIR[pair=MAX_MANIFEST_BYTES = 1_048_576] |
| sighting-wall.md:141 | `:49` | MAX_MANIFEST_BYTES | 49 | 49 | PAIR[pair=LOCK_TIMEOUT_MS = 10_000] |
| sighting-wall.md:141 | `:73` | LOCK_TIMEOUT_MS | 73 | 73 | PAIR[pair=LOCK_STALE_MS] |
| sighting-wall.md:142 | `:63` | MAX_TEXT_BYTES | 63 | 63 | PAIR[pair=MAX_COMPLETED_MISSIONS = 50] |
| sighting-wall.md:143 | `:71` | DEFAULT_ATTACH_TIMEOUT_MS | 71 | 71 | PAIR[pair=DISPLAY_REFRESH_LOCK_MS = 250] |
| sighting-wall.md:146 | `:111` | emitFatal | 116 | 116 | MOVE |
| sighting-wall.md:157 | `:37` | parseOpenCodeArgv | 37 | 37 | PAIR[pair=parseOmpArgv] |
| sighting-wall.md:161 | `:131` | isOpenCodeExecutable | 131 | 131 | PAIR[pair=isOmpExecutable] |
| sighting-wall.md:162 | `:198` | appearsToLaunchOpenCode | 198 | 198 | PAIR[pair=appearsToLaunchOmp] |
| sighting-wall.md:162 | `:202` | appearsToLaunchOmp | 202 | 202 | WRAP |
| sighting-wall.md:181 | `:35` | missionOmpSessionDirectory | 35 | 35 | PAIR[pair=collectTranscriptFiles] |
| sighting-wall.md:182 | `:270` | scanMissionTasks | 270 | 270 | PAIR[pair=observeMissionTasks] |
| sighting-wall.md:186 | `:411` | sparkStateRoot | 411 | 411 | PAIR[pair=countActiveSparks] |
| sighting-wall.md:187 | `:415` | countActiveSparks | 415 | 415 | PAIR[pair=loadObservations] |
| sighting-wall.md:203 | `scripts/ufo-sighting-lib/surface.mjs:13` | SURFACE_MODULE_PATHS | 13 | 13 | WRAP |
| sighting-wall.md:203 | `:18` | SURFACE_MODULE_PATHS | 13 | 13 | RANGE[pair=surfaceScriptDigest] |
| sighting-wall.md:204 | `:31` | surfaceScriptDigest | 31 | 31 | WRAP |
| sighting-wall.md:206 | `:20` | DEFAULT_PEEK_LINES | 20 | 20 | PAIR[pair=MAX_PEEK_LINES = 400] |
| sighting-wall.md:206 | `:22` | MAX_PEEK_LINES | 22 | 22 | WRAP |
| sighting-wall.md:208 | `:50` | surfaceErrors | 50 | 50 | PAIR-ABSENT[pair=fail("CODE"] |
| sighting-wall.md:209 | `:59` | surfaceManifest | 59 | 59 | PAIR[pair=kind] |
| sighting-wall.md:211 | `:318` | runLegacyNativeDirect | 325 | 318 | MOVE |
| sighting-wall.md:213 | `:310` | output | 317 | 310 | WRAP |
| sighting-wall.md:213 | `:314` | requireNoArgs | 321 | 314 | WRAP |
| sighting-wall.md:213 | `:294` | usage | 301 | 294 | WRAP |
| native-trial-launch.md:352 | `scripts/run-omp-native-trial.mjs:3229` | main | 3234 | 3229 | WRAP |
| native-trial-launch.md:353 | `:50` | PROFILE | 56 | 50 | MOVE |
| native-trial-launch.md:354 | `:59` | ADMITTED_PROFILES | 65 | 59 | MOVE+PAIR[pair=PROPOSAL_WAVE_CEILING] |
| native-trial-launch.md:354 | `:109` | PROPOSAL_WAVE_CEILING | 115 | 109 | MOVE |
| native-trial-launch.md:355 | `:844` | parseArgs | 851 | 844 | MOVE |
| native-trial-launch.md:355 | `:958` | planLaunchMode | 965 | 958 | MOVE |
| native-trial-launch.md:357 | `:171` | snapshotDispatchInputs | 176 | 171 | MOVE+PAIR[pair=resolveNativeDispatchPolicy] |
| native-trial-launch.md:357 | `:646` | resolveNativeDispatchPolicy | 639 | 646 | MOVE |
| native-trial-launch.md:358 | `:1282` | handOffToSightingWall | 1289 | 1282 | MOVE |
| native-trial-launch.md:359 | `:831` | die | 838 | 831 | MOVE+PAIR[pair=BLOCKED: …] |
| native-trial-launch.md:369 | `scripts/collect-omp-native-handoff.mjs:120` | parseArgs | 120 | 120 | PAIR[pair=COLLECTOR_USAGE] |
| native-trial-launch.md:371 | `:869` | validateDispatches | 873 | 869 | MOVE |
| native-trial-launch.md:372 | `:951` | writeEvidenceFile | 955 | 951 | MOVE+PAIR[pair=persistEvidenceWrites] |
| native-trial-launch.md:372 | `:973` | persistEvidenceWrites | 977 | 973 | MOVE |
| native-trial-launch.md:382 | `:96` | PROPOSAL_WAVE_CEILING | 96 | 96 | PAIR[pair=CAPACITY_FAILURES] |
| native-trial-launch.md:383 | `:173` | DEADLINE_CLASS_BY_ROLE | 173 | 173 | PAIR[pair=SEAT_CLASS_BY_ROLE] |
| native-trial-launch.md:384 | `:223` | ROUTING_HEALTH_OUTCOMES | 217 | 223 | MOVE+PAIR[pair=GODSPEED_MARKER] |
| native-trial-launch.md:384 | `:120` | GODSPEED_MARKER | 120 | 120 | PAIR[pair=EVIDENCE_KIND] |
| native-trial-launch.md:385 | `:133` | EVIDENCE_KIND | 133 | 133 | PAIR[pair=classifyFailure] |
| native-trial-launch.md:386 | `scripts/collect-omp-native-handoff-lib/base.mjs:682` | classifyFailure | 758 | 682 | WRAP |
| native-trial-launch.md:387 | `:303` | die | 297 | 303 | MOVE |
| native-trial-launch.md:395 | `:260` | taskCalls | 265 | 260 | MOVE+PAIR[pair=taskDispatches] |
| native-trial-launch.md:395 | `:381` | taskDispatches | 396 | 381 | MOVE |
| native-trial-launch.md:397 | `:16` | normalizeTranscriptEvent | 16 | 16 | PAIR[pair=uniquifyReusedTaskIds] |
| native-trial-launch.md:404 | `scripts/collect-omp-native-handoff-lib/evidence.mjs:275` | modelEvidence | 276 | 275 | WRAP |
| native-trial-launch.md:405 | `:70` | attemptLedgerEntry | 71 | 70 | MOVE |
| native-trial-launch.md:405 | `:474` | seatStatus | 476 | 474 | MOVE |
| native-trial-launch.md:406 | `:631` | verifyEffectiveLaunch | 633 | 631 | MOVE |
| native-trial-launch.md:407 | `:520` | nativeReceiptDigests | 522 | 520 | WRAP |
| native-trial-launch.md:407 | `:1003` | buildCostLedger | 1005 | 1003 | MOVE |
| native-trial-launch.md:408 | `:1067` | appendRoutingHealth | 1071 | 1067 | MOVE |
| native-trial-launch.md:415 | `scripts/collect-omp-native-handoff-lib/policy.mjs:39` | splitRoute | 66 | 39 | MOVE |
| native-trial-launch.md:416 | `:155` | loadSeatRoutingMirror | 173 | 155 | MOVE |
| native-trial-launch.md:417 | `:283` | verifyLaunchSeatRouting | 301 | 283 | MOVE |
| native-trial-launch.md:418 | `:619` | resolveNativeProfile | 637 | 619 | MOVE+PAIR[pair=readRoundPlan] |
| native-trial-launch.md:418 | `:704` | readRoundPlan | 722 | 704 | MOVE |
| native-trial-launch.md:419 | `:780` | waveTokenFromContext | 798 | 780 | MOVE |
| native-trial-launch.md:420 | `:879` | loadCanonicalDirective | 897 | 879 | MOVE+PAIR[pair=parseRateCard] |
| native-trial-launch.md:420 | `:908` | parseRateCard | 926 | 908 | MOVE |
| native-trial-launch.md:428 | `scripts/collect-omp-native-handoff-lib/screening.mjs:25` | DEFAULT_SCREENING_CLASSES | 25 | 25 | WRAP |
| native-trial-launch.md:430 | `:194` | directiveScreeningNeedle | 194 | 194 | WRAP |

## Absent-symbol archaeology — the sole absent is `fail("CODE"` (sighting-wall.md:208, anchor `:50`)
- At the pin, `scripts/ufo-sighting-lib/surface.mjs` has **0** occurrences of that literal. Line 48 is `const FAIL_CODE_PATTERN = /\bfail\(\s*"([A-Z][A-Z0-9_]*)"/gu;` and `export function surfaceErrors()` is line **50** — the anchor's true line.
- `964f443e` (the revision the section names): identical 48/50, 0 occurrences.
- `2cad708` (pin's parent; second earlier revision present in this clone): identical 48/50, 0 occurrences.
- Tree-wide `grep -rn 'fail("CODE"'` over the pin: no match. Pickaxe over every ref: `git log --all -S'fail("CODE"' -- scripts/ufo-sighting-lib/surface.mjs` → empty (never introduced); `-S'FAIL_CODE_PATTERN'` → only `72ab84a` (the shallow root), so the regex predates every available revision.
- Conclusion: the span is a paraphrased regex fragment the note put in backticks; it never existed as a symbol at any available revision, so no re-anchor can pair it. `:50` is already correct for `surfaceErrors` (`PAIR-ABSENT` row). Fix the note line, not the number: drop the backticks on that fragment or move it >14 chars from the anchor.
- Exception to "correct at 964": `sighting-wall.md:146` `:111` — `emitFatal` is at **116** in `base.mjs` at both `964f443e` and the pin; the note's "(region)" claim was already 5 lines low at the named revision.
- Uncheckable: `5725fa7d3` (the note's removal-record revision) is not in this clone — `.git/shallow` root is `72ab84a`; `git log --oneline -- scripts/ufo-sighting-lib/surface.mjs` lists only `7a8130a`, `72ab84a`.

## Mechanics that make a pair survive v1 (for the re-anchor executor)
- Right-first: a backticked span starting within 14 chars after the anchor wins even when the intended symbol sits immediately left. The `sym` (`` :N ``) list form is the failure mode: the next entry's symbol is ~3 chars away and is stolen (e.g. `:19`→`MODULE_PATH`, `:59`→`kind`, `:133`→`classifyFailure`).
- Safe forms: (a) anchor first, symbol right after — `` (`:648`) `acquireOperationLock` ``; (b) symbol first but >=15 non-backticked chars before any next backticked span; (c) one symbol+anchor pair per line.
- Range: `sighting-wall.md:203` `path:13`–`:18` is one range for `SURFACE_MODULE_PATHS`. Fold to a single `scripts/ufo-sighting-lib/surface.mjs:13-18` anchor, keep the symbol adjacent-left and the next span far.
- `WRAP` rows are diagnostic only (never gated, never ratcheted); reflowing them is optional for `nonok=0` but fixes the lost anchor.
- `:4714` (re-export block) moved 4714→4730 (comment starts 4725); with no backticked symbol on that line it stays `noid` by construction.

## Commands run (read-only)
- `node /fast/scratch/kumitate-r36/w/ScoutFidSighting/fid.mjs` → NOTE sighting-wall anchors=71 ok=24 elsewhere=34 absent=1 dead=0 noid=12 nonok=35; NOTE native-trial anchors=52 ok=11 elsewhere=35 absent=0 dead=0 noid=6 nonok=35; TOTAL anchors=123 ok=35 elsewhere=69 absent=1 dead=0 noid=18 nonok=70.
- `node …/fid2.mjs [964f443e]` → per-anchor contract pair, nearest-left symbol and definition lines at pin and 964.
- `node …/fid3.mjs` → the 88-row table above.
- `grep -nE '^(export )?(async )?function (SYM1|SYM2|…)\b'` per member file at the pin → every `pin` column value (e.g. `scripts/ufo-sighting.mjs:648/767/1991/2239/2361/2386/3361/3543/3576/3604/3616/3714/3794/4432`; `scripts/collect-omp-native-handoff-lib/policy.mjs:66/173/301/637/722/798/897/926`).
- `for r in 2cad708 964f443e 31c465f1; do git -C /fast/scratch/kumitate-r36/src show $r:scripts/ufo-sighting-lib/surface.mjs | grep -c 'fail("CODE"'; done` → `0` for each; `git show {964f443e,2cad708}…` as two separate shows with `grep -nE 'FAIL_CODE_PATTERN|function surfaceErrors'` → 48/50 in both.
- `git -C … log --oneline -- <file>` → surface.mjs {7a8130a,72ab84a}; ufo-sighting.mjs {7a8130a,72ab84a}; run-omp-native-trial.mjs {3ddd6b3,72ab84a}.
- No tool installs or upgrades were made.

## Remaining unknowns
- [INFERENCE] "Intended symbol" is read from the note prose; where one line maps two anchors to two symbols, order was taken from the note's word order. The mechanical v1 pair is shown in brackets so a differing intent is visible.
- `scripts/claims-check.mjs` at lane HEAD `0614092` has no `--fidelity` yet (`grep -n fidelity` → empty), so no gate run cross-checks these numbers; they reproduce the frozen prototype exactly.
- No writes occurred under the pin; scratch artifacts are only under `/fast/scratch/kumitate-r36/w/ScoutFidSighting/`.
