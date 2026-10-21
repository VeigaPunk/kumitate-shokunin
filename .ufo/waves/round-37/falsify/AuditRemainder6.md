# AUDIT Remainder6 — census group 6/8 (round-37 restoration)

AUDIT Remainder6 anchors=18 false=16 overreverted=4 notice=bad verdict=refuted
STATE: audited census blob 2d269a2 (commit 5ceb8cd; lane HEAD 86c0676 at start). The lane was then reset by 5bc40d0 (blob 74fc65a; HEAD 8c41439 at last check): body byte-identical to 0614092 plus one notice line. Same 18 positions on 74fc65a: anchors=18 false=4 overreverted=4 notice=ok verdict=partial (§3). The verdict above refers to the state assigned, 2d269a2.

## §1 Slice and method
- Base→lane diff at 2d269a2 (`git diff --stat 0614092 -- F`: 48 insertions, 46 deletions) gives 139 changed anchors. Document order. Group 6/8 = idx 88–105 (0-based 87–104 of the even split ceil(g·139/8)).
- Lines paired by difflib; the only unpaired block is the notice insert at line 2. Anchors paired positionally per line. Relative `:N` inherits the sentence's file.
- Pin = /fast/scratch/kumitate-r36/src at 31c465f1; `git status --porcelain` is empty. T/F = the sentence's symbol is on that exact line (ranges: any line); each line was read from the pin. Non-identifier anchors are marked "judged".

## §2 Table: slice idx 88–105, start state
base = 0614092 · r36 = 5ceb8cd^ · L = lane 2d269a2 · cur = 74fc65a (= base)

idx | sentence symbol | base → pin | r36 → pin | L → pin | class | cur
--- | --- | --- | --- | --- | --- | ---
88 | renderMissionActivity (mission-activity.mjs) | :160 F (comment) | :150 T (decl) | test.mjs:18-21 Y: import, not decl | overreverted; wrong site | F
89 | main (mission-activity.mjs) | :210 T | :210 T | watchdog-repend.mjs:366 Y: other module's main | wrong site; base-T regressed | T
90 | isMainModule (mission-activity.mjs) | :226 T | :226 T | :1912 F: out of range (232 lines) | false; regressed | T
91 | run line `node …test.mjs` (no identifier, judged) | test.mjs:15 T (`// Run:`) | :17 F (import) | :17 F (=r36, unrestored) | false; r36 shift left | T
92 | LABEL_MAX (test.mjs) | :23 T | :23 T | :74 F (renderer round-trip test) | false; regressed | T
93 | 250-code-point window case (judged) | :38 T | :38 T | :74 F | false; regressed | T
94 | maximal reason (judged) | :51 T | :51 T | :74 F | false; regressed | T
95 | short-reason control (judged) | :60 T | :60 T | :74 F | false; regressed | T
96 | explicit-activity append (judged) | :66 T | :66 T | :74 F | false; regressed | T
97 | "display-only" (lifecycle.mjs, judged) | :2 T (comment "Display evidence only") | :85 F | :85 F (=r36, unrestored) | false; r36 shift left | T
98 | projectMissionLifecycle (lifecycle.mjs) | :96 F (`}`) | :85 T (decl) | :13 F (blank) | overreverted; false | F
99 | readBoundedJsonInput (lifecycle.mjs) | :215 F | :202 T (decl) | :227 F | overreverted; false | F
100 | cliErrorCode (lifecycle.mjs) | :260 T | :260 T | :124 F (`let phase;`) | false; regressed | T
101 | fs messages redacted (judged) | :262-263 T | :262-263 T | :124 F | false; regressed | T
102 | exit 1 (judged) | :265 T | :265 T | :124 F | false; regressed | T
103 | task?.route, queued branch (observation.mjs) | :58 F (phase condition; site is :59) | :57 T literal (working branch) | :85-103 F | overreverted; false | F
104 | isMainModule (observation.mjs) | :90 T | :90 T | :1912 F: out of range (126 lines) | false; regressed | T
105 | suite header (observation.test.mjs, judged) | :29-30 T | :29-30 T | stale-watchdog.test.mjs:16-22 F | false; regressed | T

Tallies (2d269a2): literal-Y 2 (88, 89; both wrong site), so false = 16 (rows 90–105). Overreverted = 4 (88, 98, 99, 103). Base-true anchors left false or on a wrong site = 14: 12 that round 36 did not touch (89, 90, 92–96, 100–102, 104, 105), which round 37 broke, plus 2 round-36 shifts that round 37 did not revert (91, 97). No slice anchor is on its correct site in the lane.

## §3 Current state (74fc65a; body = 0614092)
- Slice base values: false at 88, 98, 99, 103, so false = 4. Overreverted = 4: the same rows, where round 36 had a true or literal-true value (r36 :150, :85, :202, :57) that the reset discards. The other 14 base values are true (97 judged).

## §4 Out-of-slice restorations (equal to base in 2d269a2, so the 8-way diff partition cannot see them)
- A-k2 ACTIVITY_MAX_CODE_POINTS: mission-activity:27 F. Declaration at :17. r36 :55 F. Result: false.
- A-k5 INVALID_VIEW: :162 F. r36 :152 T. Result: overreverted and false.
- C-k6 ufo-mission-lifecycle-v1 envelope: lifecycle:187 F. r36 :17 T (JSDoc). Literal at :174. Result: overreverted and false.
- C-k7 resumeHint: :181 F. r36 :28 T (JSDoc). Declaration :168, envelope :185. Result: overreverted and false.
- C-k10 acceptanceConflict: :126 F. Declaration :115. Result: false.
- C-k11 conflict message: :131 F. r36 :120 T. Result: overreverted and false.
- D-k4 return fields (observation:66): block start (`schema:`); `failureClass` at :77. Literal F, judged block anchor.
- Correct restorations (base true): B-k1 :18-21, C-k2 :5, C-k3 :6, C-k12 :258, D-k0 :34, D-k1 :16, D-k2 :13, D-k3 :64.
- Outside-slice totals: false 6 (+1 judged), overreverted 4.

## §5 Notice
- Start notice (2d269a2) says "Anchors in this note were reverted to the lines their 0614092 sentences named … treat line anchors here as at their base revision." Result: bad. Measured over all 521 base anchors (raw text): 163 shifted by round 36; 141 reverted to base; 6 left at the round-36 value; 16 other values. Round 37 also changed 117 anchors that round 36 had not touched. Total non-base = 139 (26.7%). The scope claim is false.
- The "(spot-check D1)" citation: "D1" does not appear in corpus/lessons/round-36-verifier-spotcheck.md. The label is only at corpus/lessons/round-36.md:193, as a defect-list item. Misattributed.
- Current notice (74fc65a):
  - "reset to its 0614092 bytes": true (`git diff --numstat 0614092` = `1 0`; body identical after deleting line 2).
  - "no anchor here is a round-36 artifact": true.
  - "already false … remain as ratcheted fidelity debt": true in form (.ufo/pins/fidelity-ratchet.json:17 = 70). The count is not verified, and fb5b90e records that the gate is not truth.
  - "re-verification owed": true.
  - Omission: it does not say the reset discards 8 round-36 anchors that were true at the pin (4 in slice, 4 outside, §4) in the sentences checked. Not a misstatement, but it should be stated.
  - "amended by AuditSighting2/4": no git evidence of such edits. The file's last commit is 5bc40d0. Unverified attribution.
  - Result: ok, with the omission noted.

## §6 Commands and outputs
- `git diff --stat 0614092 -- F` (2d269a2): `48 insertions(+), 46 deletions(-)`.
- `git diff --numstat 0614092 -- F` (74fc65a): `1 0`.
- `diff base.md <(sed '2d' lane_now.md)`: no output (identical body).
- Raw-text classification (python over base/r36/lane, line-paired): base anchors 521; r36-shifted 163 = lane-at-base 141 + lane-at-r36 6 + other 16; unshifted-but-changed 117; changed total 139.
- `git -C /fast/scratch/kumitate-r36/src grep -n` (pin): ACTIVITY_MAX_CODE_POINTS :17; acceptanceConflict :115; export function projectMissionLifecycle :85; export function readBoundedJsonInput :202; resumeHint :168 and :185; "ufo-mission-lifecycle-v1" :174; task?.route observation:57 and :59 (queued branch).
- Pin line counts: mission-activity 232; mission-activity.test 80; lifecycle 267; observation 126; observation.test 100; watchdog-repend 428; stale-watchdog.test 133.
- `git grep -n "spot-check D1"` (lane tracked files): only peer reports and corpus/lessons/round-36.md:193.
- Lane commits: 5ceb8cd (repair), 5bc40d0 (reset), 8c41439 (HEAD at last check).

## §7 Gaps and notes
- Judged rows (91, 93–97, 101, 102, 105, D-k4) are stated per row. A stricter reader would change only the 91, 97 and 105 judgements, and each still leaves the anchor on a non-true site.
- Tests and the census generator were not run (not assigned). No installs and no package transactions.
- The lane moved during the audit: HEAD 86c0676 → 469500f → c7648c7 → 8c41439. The census blob changed once (2d269a2 → 74fc65a). Re-run §1 on the final blob if it changes again.
- [INFERENCE] The start-state values look neighbour-copied: `:74` ×5 in the test sentence, `:124` ×3 matching the observation sentence's exit anchor, `:1912` ×2, `:85-103`, `:18-21`, and `:90` ×4 in the suite sentence. This is a suspected pairing artefact; the repair code was not read.
- The global false count for the note was not measured beyond this slice.
