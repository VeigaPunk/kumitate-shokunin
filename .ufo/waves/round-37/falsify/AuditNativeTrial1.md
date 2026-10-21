AUDIT NativeTrial1 anchors=2 false=2 overreverted=1 notice=bad verdict=refuted

# AuditNativeTrial1: round-37 falsify, group 1/8, corpus/knowledge/native-trial-launch.md

Scope and frame
- Note: `corpus/knowledge/native-trial-launch.md`. Base 0614092. Pin `/fast/scratch/kumitate-r36/src` @ 31c465f1 (HEAD verified, `git status --short` empty, read-only).
- The item says the repair is uncommitted. It is committed: 5ceb8cd (restoration), 86c0676 (close). `cmp` shows worktree == HEAD for the note, so HEAD is what was audited.
- Partition: `git diff 0614092` changes 9 anchors, file order A1..A9 (HEAD lines 330, 356, 359, 361, 371, 374, 387, 420, 422). 1/8 = ceil(9/8) = 2, so group 1 = A1, A2. The notice is judged separately.
- Test: the sentence's symbol must appear on the pinned line (definition or code). Comment-only mentions are flagged (m).
- Installs: none. Scratch: `/fast/scratch/kumitate-r37/AuditNativeTrial1/` (diff snapshots, 964f443e exports).

## Group 1 (restored anchors)

| id | HEAD L | sentence symbol | 0614092 | R36 (3d5760a) | R37 (HEAD) | pin 31c465f1 line at R37 value | verdict |
|---|---|---|---|---|---|---|---|
| A1 | 330 | `die` | run:831 | run:831 | run:303 | L303 = `// unchanged across every hop of this seat's chain.` No `die`. `die` is defined at L838 | FALSE. Not overreverted: R36 run:831 was also false (L831 = `routeFamily: resolved.routeFamily,`) |
| A2 | 356 | `PROPOSAL_WAVE_CEILING` | run:109 | run:115 | run:96 | L96 = blueprint row `{ role: "sentinel", ... }`. No symbol. Defined at L115 | FALSE. OVERREVERTED: R36 run:115 (`export const PROPOSAL_WAVE_CEILING = 16;`) was true. Base line run:109 (`for (const blueprint of proposalBlueprints) {`) lacks the symbol |

Commands and output (pin):
- `_read .../scripts/run-omp-native-trial.mjs:94-118` gives L96 (sentinel row), L109 (`for (const blueprint of proposalBlueprints) {`), L115 (`export const PROPOSAL_WAVE_CEILING = 16;`).
- `_read .../run-omp-native-trial.mjs:298-308` gives L303 (comment). `:826-842` gives L831 (`routeFamily: resolved.routeFamily,`) and L838 (`function die(message) {`).

Base frame (`git show 964f443e:scripts/run-omp-native-trial.mjs`, exported and searched):
- run:109 (`export const PROPOSAL_WAVE_CEILING = 16;`) and run:831 (`function die(message) {`) are true at 964f443e. These are the 0614092 values.
- run:96 is a scribe blueprint row and run:303 is `cascade = true,`. Both R37 values are false at base too.
- The R37 numbers equal the note's own base.mjs anchors for the same symbols (`die` (:303), `PROPOSAL_WAVE_CEILING` (:96), notes at 0614092 L387/L382). This looks like a cross-file copy [INFERENCE].
- Group 1 verdict holds under either frame.

## Notice (note L2): present, accuracy BAD

Text: "Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). Re-verification against the pin is pending; treat line anchors here as at their base revision until then."
- "reverted to the lines their 0614092 sentences named": false for the note. 0 of 9 partition anchors equal their 0614092 value. R37 touched only A1, A2, A4 and set them to false values. A3 and A5..A9 keep their R36 values, which are also false (Table A).
- "treat line anchors as at their base revision": false for A1 and A2 (false at both base and pin).
- "moved them one symbol off": misdescribes R36. 19 R36 values were true at the pin and R37 reverted them (Table C).

## Table A: partition cross-check (all 9 changed anchors, pin status at R37 value)

| id | HEAD L | symbol | 0614092 | R37 | pin line content at R37 value | pin |
|---|---|---|---|---|---|---|
| A1 | 330 | die | run:831 | run:303 | comment, no `die` | F |
| A2 | 356 | PROPOSAL_WAVE_CEILING | run:109 | run:96 | blueprint row | F |
| A3 | 359 | snapshotDispatchInputs | run:171 | run:639 | `resolveNativeDispatchPolicy` def (snapshotDispatchInputs def is L176) | F |
| A4 | 361 | die | run:831 | run:303 | comment, no `die` | F |
| A5 | 371 | parseArgs (collector) | collect:120 | collect:118 | `const COLLECTOR_USAGE` (parseArgs def is L120) | F |
| A6 | 374 | writeEvidenceFile | collect:951 | collect:977 | `persistEvidenceWrites` def (writeEvidenceFile def is L955) | F |
| A7 | 387 | EVIDENCE_KIND | base:133 | base:62 | comment. base:133 was TRUE at pin (`export const EVIDENCE_KIND`); R36 broke it and R37 did not restore it | F |
| A8 | 420 | resolveNativeProfile | policy:619 | policy:722 | `readRoundPlan` def (resolveNativeProfile def is L637) | F |
| A9 | 422 | loadCanonicalDirective | policy:879 | policy:926 | `parseRateCard` def (loadCanonicalDirective def is L897) | F |

9 of 9 are false at the pin. All nine 0614092 values are true at 964f443e (checked by definition search in the exports).

## Table B: other R37 results on the same sentences

- Partition members R37 left at their R36 values (false): A3, A5, A6, A7, A8, A9 (Table A).
- R37 returned these to exact 0614092 numbers, which are false at the pin: ADMITTED_PROFILES (HEAD L356, run:59, a comment), ROUTING_HEALTH_OUTCOMES (base.mjs:223, `]);`), base `die` (base.mjs:303, `process.stderr.write`), taskCalls (events:260, comment).
- Unchanged by R37 and false at the pin: nativeReceiptDigests (evidence:520). The pin line is blank, and the number is the same in 0614092, R36 and R37.

## Table C: R36 pin-true values reverted by R37 (21 rows)

Each row: the R36 value is true at the pin (definition line, or a literal mention marked (m)). The R37 value is false at the pin (line read). "=B" means R37 equals the 0614092 number. "base" is the 964f443e truth of that number, checked by definition search.

| symbol (HEAD L) | R36 to R37 | pin line at R37 value | =B | base |
|---|---|---|---|---|
| PROFILE (355) | run:56 T to run:50 | comment, "The live evidence profile..." | yes | T |
| PROPOSAL_WAVE_CEILING (356) | run:115 T to run:96 | blueprint row. This is A2, see group 1 | no (109) | T |
| parseArgs (357) | run:851 T to run:844 | `const VALUE_FLAGS = new Set(...)` | yes | T |
| planLaunchMode (357) | run:965 T to run:958 | doc comment | yes | T |
| resolveNativeDispatchPolicy (359) | run:639 T to run:646 | `fail("malformed", ...)` | yes | T |
| handOffToSightingWall (360) | run:1289 T to run:1282 | `return JSON.parse(readFileSync(...` | yes | T |
| die (361) | run:4315 T(m) to run:303 | comment mentions `die()`; def is L838. This is A4 | no (831) | T |
| validateDispatches (373) | collect:873 T to collect:869 | template string | yes | T |
| persistEvidenceWrites (374) | collect:977 T to collect:973 | `} finally {` | yes | T |
| taskDispatches (397) | events:20 T(m) to events:381 | `task: effectiveAssignment,` | yes | T |
| attemptLedgerEntry (407) | evid:71 T to evid:70 | comment | yes | T |
| seatStatus (407) | evid:476 T to evid:474 | `}` | yes | T |
| verifyEffectiveLaunch (408) | evid:633 T to evid:631 | comment | yes | T |
| buildCostLedger (409) | evid:1005 T to evid:1003 | comment | yes | T |
| appendRoutingHealth (410) | evid:1071 T to evid:1067 | comment | yes | T |
| splitRoute (417) | policy:66 T to policy:39 | blank | yes | T |
| loadSeatRoutingMirror (418) | policy:173 T to policy:155 | `});` | yes | T |
| verifyLaunchSeatRouting (419) | policy:301 T to policy:283 | `requested: seat.requested,` | yes | T |
| readRoundPlan (420) | policy:722 T to policy:704 | `if (typeof criterion.value ...` | yes | T |
| waveTokenFromContext (421) | policy:798 T to policy:780 | `}` | yes | T |
| parseRateCard (422) | policy:926 T to policy:908 | `die(\`godspeed directive...\`)` | yes | T |

Totals: 19 pin-true definitions and 2 mention-only anchors (m) turned false. 19 of 21 are exact 0614092 numbers, true at 964f443e and false at pin 31c465f1. The two that are not exact: die (A4) and PROPOSAL (A2).

PROFILE (row 1) sits in the same sentence as A2 (HEAD L355), outside the 0614092 partition, so no group owns it. ADMITTED_PROFILES (L356) is false both before and after R37.

Other R37 results
- Correct at pin (4 fixes, all exact 0614092 numbers): base PROPOSAL_WAVE_CEILING (base.mjs:96, HEAD L384), DEADLINE_CLASS_BY_ROLE (base.mjs:173, L385), GODSPEED_MARKER (base.mjs:120, L386), normalizeTranscriptEvent (events:16, L399).
- Totals across the 30 R36 to R37 token changes: 4 fixes, 21 overreversions (Table C), 5 false-to-false: die (L330, A1), ADMITTED_PROFILES, base die, ROUTING_HEALTH_OUTCOMES, taskCalls.

## Verdict

refuted for group 1. 2 of 2 restored anchors (A1, A2) are false at the pin and at base. A2 reverts a pin-true R36 anchor. The notice is present but misstates scope: 0 of 9 partition anchors equal their 0614092 value.

## Residual risk and gaps

- Frame: the 19 exact-0614092 items in Table C are base-true (964f443e) and pin-false. Whether they count as regressions depends on the frame. This item fixes the frame at the pin, so they count here. Group 1's verdict does not depend on the frame.
- Partition blind spot: a diff against 0614092 cannot see reversions that land on 0614092 numbers. 19 of 21 in Table C are invisible to it, and PROFILE is one. The integrator should check the R36 to R37 changes, or pin truth for all anchors, not only the 0614092 partition.
- "On line" is literal: code and comments count. Rows marked (m) are comment-only mentions.
- Not checked: anchors outside the 30 R36 to R37 token changes and the 9 partition anchors. Remaining note sections were not sampled.

## Reproduce

```
git --no-pager diff -U0 0614092 -- corpus/knowledge/native-trial-launch.md         # partition, 9 anchors
git --no-pager diff -U0 0614092 3d5760a -- corpus/knowledge/native-trial-launch.md  # R36 shift
git --no-pager diff -U0 3d5760a HEAD -- corpus/knowledge/native-trial-launch.md    # R37 restoration
_read /fast/scratch/kumitate-r36/src/scripts/run-omp-native-trial.mjs:94-118       # A2: L96, L109, L115
_read /fast/scratch/kumitate-r36/src/scripts/run-omp-native-trial.mjs:298-308      # A1: L303
_read /fast/scratch/kumitate-r36/src/scripts/run-omp-native-trial.mjs:826-842      # A1: L831, L838
git -C /fast/scratch/kumitate-r36/src show 964f443e:scripts/run-omp-native-trial.mjs  # base frame
```
