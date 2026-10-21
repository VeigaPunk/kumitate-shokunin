AUDIT NativeTrial3 anchors=1 false=1 overreverted=1 notice=bad verdict=refuted

Scope
- Audited state: lane commit 5ceb8cd ("falsify wave 68 dispatched"). Working copy byte-equal at audit start (`cmp`). Snapshot: /fast/scratch/kumitate-r37/AuditNativeTrial3/r37-5ceb8cd.md (sha256 e7f0cd2e085ba5a0…).
- Shard: `git diff 0614092 -- corpus/knowledge/native-trial-launch.md` shows 10 changed lines = 9 anchor values + the notice. Group 3/8 = changed anchor #3 (floor(3·9/8)=3, diff order). Table D covers all nine for sibling cross-check.
- Pin: /fast/scratch/kumitate-r36/src HEAD 31c465f15669f744848bd9f5d56191c5085670f7 (run-omp-native-trial.mjs 4321 lines). Test: the sentence's symbol token sits on the pinned line; definition line recorded.
- Second frame: the note's sections claim "verified live against origin HEAD 964f443e"; `git -C pin cat-file -t 964f443e` = commit. Reported separately. It changes the overreversion count, not the group-3 verdict.
- Lane HEAD moved during the audit: 5bc40d0 → 469500f → 8c41439 → c589b38. Section F covers the current file.

A. Group 3 — "Frozen dispatch" sentence (dispatched L358–359)
| anchor | base :N | r36 :N | dispatched :N | pinned line @31c465f | def pin / 964f443e | verdict |
|---|---|---|---|---|---|---|
| snapshotDispatchInputs | 171 | 639 | 639 | `export function resolveNativeDispatchPolicy(snapshot, profileName = PROFILE, {` | 176 / 171 | FALSE in both frames. Claimed restored, not reverted. Base TRUE at 964f443e, so regression in that frame |
| resolveNativeDispatchPolicy (same sentence, L359) | 646 | 639 | 646 | `    fail("malformed", "canonical config snapshot is missing");` | 639 / 646 | OVERREVERTED at pin (r36 true, base false). Correct at 964f443e |

B. Notice (dispatched L2): present yes; accurate no → notice=bad
- "reverted to the lines their 0614092 sentences named": false. Nine anchors still differ from 0614092 (table D). All nine are false at both revisions.
- "round-36 shift-repair moved them one symbol off": holds only in the 964f443e frame. At the pin, the round-36 values of the 14 anchors in table C were true.
- "treat line anchors here as at their base revision": matches the 964f443e frame; misleading for the table-D anchors.

C. Overreversions: restored to base; r36 TRUE at pin, base FALSE at pin (14). Base is TRUE at 964f443e for all 14.
| id | anchor (dispatched L) | r36 = pin def | base :N, pinned text |
|---|---|---|---|
| R2 | PROFILE (L355) | :56 | :50 `// The live evidence profile (contract §1)…` |
| R4 | PROPOSAL_WAVE_CEILING, run-omp (L356) | :115 | :109 `for (const blueprint of proposalBlueprints) {` |
| R5 | parseArgs, run-omp (L357) | :851 | :844 `const VALUE_FLAGS = new Set([…])` |
| R6 | planLaunchMode (L357) | :965 | :958 ` * Pure launch-mode resolution, kept separate from parseArgs…` |
| R7 | resolveNativeDispatchPolicy (L359) | :639 | :646 `fail("malformed", …)` |
| R8 | handOffToSightingWall (L360) | :1289 | :1282 `return JSON.parse(readFileSync(…))` |
| R10 | validateDispatches, collector (L373) | :873 | :869 template literal `missing_seats…` |
| R11 | persistEvidenceWrites (L374) | :977 | :973 `  } finally {` |
| R25 | splitRoute, policy (L417) | :66 | :39 blank |
| R26 | loadSeatRoutingMirror (L418) | :173 | :155 `    });` |
| R27 | verifyLaunchSeatRouting (L419) | :301 | :283 `      requested: seat.requested,` |
| R28 | readRoundPlan (L420) | :722 | :704 `  if (typeof criterion.value !== "number" …` |
| R29 | waveTokenFromContext (L421) | :798 | :780 `  }` |
| R30 | parseRateCard (L422) | :926 | :908 `      die(\`godspeed directive …\`);` |
Not counted: run-omp:4315 (r36 "die") is a comment token, `// Every designed failure exits through die() …`; die is defined at :838.

D. The nine dispatched-changed anchors (sibling shards; same tests)
| # | anchor (dispatched L) | base @pin | base @964f443e | r36 @pin | dispatched @pin | dispatched @964f443e |
|---|---|---|---|---|---|---|
| 1 | die, run-omp (L330) | F (831 = `routeFamily…`) | T (def 831) | F | F (303 = comment) | F |
| 2 | PROPOSAL_WAVE_CEILING, run-omp (L356) | F (109 = loop) | T | T (115) | F (96 = sentinel row) | F |
| 3 | snapshotDispatchInputs (L358) | F (171 = `text: bytes…`) | T | F | F | F |
| 4 | die, run-omp failures (L361) | F | T | F (4315 comment only) | F | F |
| 5 | parseArgs, collector (L371) | T (def 120) | T | F (118 = COLLECTOR_USAGE) | F | F |
| 6 | writeEvidenceFile (L374) | F (951 comment) | T | F (977 = persistEvidenceWrites) | F | F |
| 7 | EVIDENCE_KIND, base.mjs (L387) | T (def 133) | T | F (62 comment) | F | F |
| 8 | resolveNativeProfile, policy (L419–420) | F (619 = `herdWindowMs…`) | T | F (722 = readRoundPlan) | F | F |
| 9 | loadCanonicalDirective, policy (L421–422) | F (879 = `  };`) | T | F (926 = parseRateCard) | F | F |
Result: all nine dispatched values are false at both revisions. Base is true at 964f443e for all nine. #5 and #7 break base anchors that are true at the pin too.

E. Other restorations (not in C or D)
- R3 ADMITTED_PROFILES base :59 (comment; pin def :65): F at pin, T at 964f443e.
- R14 ROUTING_HEALTH_OUTCOMES base :223 (`]);`; pin def :217): F at pin, T at 964f443e.
- R16 die, base.mjs base :303 (`process.stderr.write(…BLOCKED…)`; pin def :297): F at pin, T at 964f443e.
- R17 taskCalls base :260 (comment; pin def :265): F at pin, T at 964f443e. R18 taskDispatches base :381 (pin def :396): F at pin, T at 964f443e.
- Correct at pin (9): R12 PROPOSAL (collector) :96, R13 DEADLINE :173, R15 GODSPEED :120, R19 normalizeTranscriptEvent :16 (true in both frames). R20–R24 attemptLedgerEntry :71, seatStatus :476, verifyEffectiveLaunch :633, buildCostLedger :1005, appendRoutingHealth :1071 are true at pin, but false at 964f443e (defs :70, :474, :631, :1003, :1067).
- Totals, dispatched: 30 restorations = 9 correct at pin + 21 false at pin (14 in C, 7 in E including R1 and R9, which are also in D).

F. Current lane state (HEAD c589b38)
- `git diff --stat 0614092` → 1 insertion (the notice). Anchors are base bytes. Group 3 has no changed anchors. #3 sits at base :171: FALSE at pin, TRUE at 964f443e.
- Current notice (L2): "reset to its 0614092 bytes … Pre-existing anchors that were already false at the pin remain as ratcheted fidelity debt … Do not claim this note as pin-true." Accurate on bytes and pin status, so notice=ok for this text. It does not disclose that the reset removes the 14 pin-true anchors in C. R7 is still overreverted at pin.

Verdict
- Dispatched state (the audited item): refuted. Failing condition 1: #3 is false at pin and at 964f443e. Failing condition 2: the notice's central claim is false for nine anchors.
- Overreversion count is frame-dependent: 14 at pin (the item's frame, used in the header), 0 at 964f443e. The group-3 verdict is the same in both frames.
- Aggregation: fix the frame before counting. At 964f443e the dispatched state breaks nine true anchors. At the pin, the base reset (HEAD) breaks 14 true anchors and leaves the dispatched nine still false.

Evidence (commands and key outputs)
$ git -C lane diff 0614092 -- corpus/knowledge/native-trial-launch.md        # at 5ceb8cd: 9 anchor values + notice
$ git diff --no-index --unified=0 r36-3d5760a.md r37-5ceb8cd.md | grep -cE '^\+[^+]'   -> 26
$ read run-omp-native-trial.mjs:639 -> export function resolveNativeDispatchPolicy(snapshot, profileName = PROFILE, {
$ read run-omp-native-trial.mjs:176 -> export function snapshotDispatchInputs({
$ read run-omp-native-trial.mjs:171 -> `    text: bytes.toString("utf8"),`
$ read run-omp-native-trial.mjs:646 -> `    fail("malformed", "canonical config snapshot is missing");`
$ _grep @pin definitions: *56 PROFILE; *115 PROPOSAL_WAVE_CEILING; *639 resolveNativeDispatchPolicy; *838 die; *851 parseArgs; *965 planLaunchMode; *1289 handOffToSightingWall; collector *118 COLLECTOR_USAGE, *120 parseArgs, *873 validateDispatches, *955 writeEvidenceFile, *977 persistEvidenceWrites; policy *66, *173, *301, *637, *722, *798, *897, *926; base.mjs *40, *96, *102, *120, *133, *173, *196, *217, *297; events *16, *265, *396; evidence *71, *476, *522, *633, *1005, *1071
$ git -C pin grep -n -E '<same defs>' 964f443e -- scripts  -> run-omp 50, 59, 109, 171, 646, 831, 844, 958, 1282; collector 118, 120, 869, 951, 973; policy 39, 155, 283, 619, 704, 780, 879, 908; base.mjs 40, 96, 102, 120, 133, 173, 196, 223, 303; events 16, 260, 381; evidence 70, 474, 520, 631, 1003, 1067
$ git -C lane diff --stat 0614092 -- corpus/knowledge/native-trial-launch.md   -> 1 insertion(+)

Gaps
- Checked: 30 restorations, 9 dispatched-changed anchors (6 of them not restorations), and 6 unchanged anchors (NATIVE_PROFILE_NAMES :40 T, CAPACITY_FAILURES :102 T, COLLECTOR_USAGE :118 T, uniquifyReusedTaskIds :82 T, nativeReceiptDigests :520 F with def :522, main :3229 F with def :3234 at pin). Not exhaustive over the note.
- Current notice's "ratcheted" claim not inspected. Stated-revision frame checked by definition lines only.
- Installs: none. Package actions: none. Spawns: none. Writes: this report plus /fast/scratch/kumitate-r37/AuditNativeTrial3/ snapshots.
