AUDIT NativeTrial6 anchors=1 false=1 overreverted=0 notice=bad verdict=refuted

Scope: lane `corpus/knowledge/native-trial-launch.md`; HEAD 86c0676 (worktree == HEAD; restoration committed in 5ceb8cd). Base 0614092; round-36 3d5760a. Pin `/fast/scratch/kumitate-r36/src` @ 31c465f1 (`git status --short` empty). Pin paths below are relative to the pin root.

Split: `git diff --unified=0 0614092 -- corpus/knowledge/native-trial-launch.md` shows 9 changed anchor lines (HEAD L330, 356, 359, 361, 371, 374, 387, 420, 422) plus the notice. array_split(9, 8) gives sizes 2,1,1,1,1,1,1,1, so group 6 = changed anchor #7 = HEAD L387 `EVIDENCE_KIND`. If the lane rounds the split differently, the boundary anchor is HEAD L374 (`writeEvidenceFile`), which is also false at the pin (see A).

## Group 6

| # | HEAD L | symbol | file | 0614092 | round-36 | HEAD | pin @ HEAD line | pin @ 0614092 line | result |
|---|---|---|---|---|---|---|---|---|---|
| 7 | 387 | `EVIDENCE_KIND` | scripts/collect-omp-native-handoff-lib/base.mjs | :133 | :62 | :62 | FALSE: L62 is the comment `// always the capacity prefix plus the classifyFailure class.` | TRUE: L133 `export const EVIDENCE_KIND = {` | restored-but-false; base was true, R37 kept round-36's wrong value |

Commands and output:
- `read …/base.mjs:60-64` -> L62 is that comment; no EVIDENCE_KIND on the line.
- `read …/base.mjs:131-135` -> L133 `export const EVIDENCE_KIND = {`.
- `grep EVIDENCE_KIND base.mjs` (pin) -> only `133:export const EVIDENCE_KIND = {`. No mention at L62.
- Same sentence, sibling fixed: `GODSPEED_MARKER` was `:133` (false) at round-36 and HEAD restored it to `:120` (pin L120 `export const GODSPEED_MARKER`, true). EVIDENCE_KIND was not fixed.
- Sentence check (`git show`): 0614092 L385 reads `(:133). Classifier`; round-36 L385 reads `(:62). Classifier`; HEAD L387 reads `(:62). Classifier`.
- overreverted (group 6) = 0: round-36's `:62` was already false, so no true value was reverted here.

## Notice (HEAD L2): present; accuracy bad

Text: "Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1)..."
- Scope claim false: HEAD still differs from 0614092 on 9 anchor lines (listed in Split). Those are not "reverted to 0614092".
- Cause claim false for pin-true anchors: 18 round-36 values were TRUE at the pin (table B). Round-37 moved all 18 off those lines: 17 back to 0614092 values and PROPOSAL to `:96`. Every landing is FALSE at the pin. "Moved one symbol off" does not describe them.
- "spot-check D1": not chased.

## Outside group 6 (for aggregation; not in header counts)

A. The other 8 changed anchors. HEAD value is FALSE at the pin for all 9 (line contents checked):
- L330, L361 `die` -> `:303`: L303 is a comment (def of `die` at L838).
- L356 `PROPOSAL_WAVE_CEILING` -> `:96`: L96 is a blueprint row (def L115). Round-36 `:115` was TRUE; base `:109` is a for-loop. Also an overreversion (see B).
- L359 `snapshotDispatchInputs` -> `:639`: L639 is `resolveNativeDispatchPolicy` (def of snapshotDispatchInputs is L176).
- L371 `parseArgs` -> `:118`: L118 is `COLLECTOR_USAGE` (def L120). Base `:120` was TRUE, so this regression made a true anchor false.
- L374 `writeEvidenceFile` -> `:977`: L977 is `persistEvidenceWrites` (def L955). Base `:951` is a comment.
- L420 `resolveNativeProfile` -> `:722`: L722 is `readRoundPlan` (def L637).
- L422 `loadCanonicalDirective` -> `:926`: L926 is `parseRateCard` (def L897).
- `:303` and `:96` equal the base.mjs-section values of `die` and `PROPOSAL_WAVE_CEILING` in the 0614092 note (L387 and L382), so values were copied across sentences.

B. Overreversions: round-36 TRUE at the pin, reverted to a value that is FALSE at the pin. 17 of 18 land on 0614092 lines, so `git diff 0614092` cannot show them. PROPOSAL (`:96`) is visible (A).
Evidence: `git diff --unified=0 3d5760a 5ceb8cd -- corpus/knowledge/native-trial-launch.md` (round-36 "-" values); pin definitions by `grep -n` on `^(export )?(async )?(const|let|function) NAME`.

| symbol (file) | round-36 TRUE def | HEAD (= 0614092 unless noted) | pin content at that line |
|---|---|---|---|
| PROFILE (run-omp) | :56 | :50 | comment |
| PROPOSAL_WAVE_CEILING (run-omp) | :115 | :96 (base :109) | blueprint row / for-loop |
| parseArgs (run-omp) | :851 | :844 | VALUE_FLAGS Set |
| planLaunchMode | :965 | :958 | comment |
| handOffToSightingWall | :1289 | :1282 | `JSON.parse(` line |
| validateDispatches (collector) | :873 | :869 | die message line |
| persistEvidenceWrites (collector) | :977 | :973 | `} finally {` |
| splitRoute (policy) | :66 | :39 | blank |
| loadSeatRoutingMirror (policy) | :173 | :155 | `});` |
| verifyLaunchSeatRouting (policy) | :301 | :283 | `requested: seat.requested,` |
| readRoundPlan (policy) | :722 | :704 | validation line |
| waveTokenFromContext (policy) | :798 | :780 | `}` |
| parseRateCard (policy) | :926 | :908 | die in UTF-8 catch |
| attemptLedgerEntry (evidence) | :71 | :70 | comment |
| seatStatus (evidence) | :476 | :474 | `}` |
| verifyEffectiveLaunch (evidence) | :633 | :631 | comment |
| buildCostLedger (evidence) | :1005 | :1003 | comment |
| appendRoutingHealth (evidence) | :1071 | :1067 | comment |

Note: events.mjs round-36 values (:20, :20, :82) match no pin definition line for their symbols (taskCalls L265, taskDispatches L396, normalizeTranscriptEvent L16). No overreversion there.

C. Borderline, not counted: run-omp `die` round-36 `:4315` is a comment that names die(); its definition is L838.

D. Same-sentence anchors that R37 left untouched and that are FALSE at the pin: base.mjs `classifyFailure (base.mjs:682)` (def L758); base.mjs `die (:303)` (def L297); `ROUTING_HEALTH_OUTCOMES (:223)` (def L217; L223 is `]);`).

## Gaps and residual risk
- Judged at the pin, as the item asks. Section headers cite 964f443e. Some round-36 values are pin moves that 964f443e-era lines would not match (PROFILE `:56` at pin vs `:50` in 0614092). A revision policy has to choose between them; the notice chooses neither.
- Verdict does not depend on that policy: HEAD L387 is false at the pin under any reading, and the notice's scope sentence is false against the 0614092 diff.
- A8/A9 base lines not read (outside group 6).
- No installs or package actions. Scratch copies: /fast/scratch/kumitate-r37/AuditNativeTrial6/ (r36-note.md, b0614092-note.md, head-note.md).

## Fix (operable)
1. HEAD L387 of the note: change the EVIDENCE_KIND anchor from :62 to :133. Check at the pin: `grep -n 'export const EVIDENCE_KIND' scripts/collect-omp-native-handoff-lib/base.mjs` -> 133.
2. Re-anchor the other 8 changed lines and the 17 reverted lines by pin definition line (tables A and B). Drop any anchor whose symbol has no definition line.
3. Rewrite the R37 notice to state the exact scope: 9 lines differ from 0614092, 18 round-36 pin-true anchors were moved off, re-verification pending.
4. The claims gate checks liveness, not symbol-on-line (round-35 notice). Add a symbol-on-line check against the pin so this failure is caught mechanically.
