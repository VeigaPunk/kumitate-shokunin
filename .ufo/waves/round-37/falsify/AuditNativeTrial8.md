AUDIT NativeTrial8 anchors=2 false=2 overreverted=0 notice=bad verdict=refuted

# AuditNativeTrial8: round-37 restoration, group 8/8

Note: `corpus/knowledge/native-trial-launch.md`. Lane HEAD 86c0676; worktree == HEAD, so there is no uncommitted delta on this note. The restoration is committed in 5ceb8cd. The item's "repair tree uncommitted" premise is stale.
Pin: `/fast/scratch/kumitate-r36/src` @ 31c465f15669f744848bd9f5d56191c5085670f7, clean, read-only.
Partition: `git diff 0614092` on the note gives 9 changed anchor tokens in document order (plus the notice hunk). Eighth 8/8 is the positions p with ceil(8p/9)=8, i.e. p=8 and p=9: `resolveNativeProfile` and `loadCanonicalDirective`. All 9 are listed below so any other split can be read off.

## Group 8/8 (in scope)

| # | symbol (sentence file) | 0614092 line -> pinned content | r36 3d5760a | restored HEAD line -> pinned content | symbol on restored line | pinned truth | verdict |
|---|---|---|---|---|---|---|---|
| 8 | `resolveNativeProfile` (policy.mjs, note L419) | :619 -> `herdWindowMs: input.backpressure.herdWindowMs,` (no) | :722 | :722 -> `export function readRoundPlan(runRoot, manifest) {` | NO | :637 | restored-but-still-false: never restored; sits on the next symbol |
| 9 | `loadCanonicalDirective` (policy.mjs, note L421) | :879 -> `  };` (no) | :926 | :926 -> `export function parseRateCard(budgets) {` | NO | :897 | restored-but-still-false: never restored; sits on the next symbol |

Overreverted in group 8: 0. Neither round-36 line (722, 926) nor base line (619, 879) carries its symbol, so no true improvement was reverted.

## Context: all 9 changed anchors (document order)

| # | grp | symbol (file) | base | r36 | HEAD | pinned truth | class |
|---|---|---|---|---|---|---|---|
| 1 | 1 | `die` (trial, L328) | :831 (no: `routeFamily:`) | :831 | :303 (no: comment) | :838 | moved to a new false value; notice says reverted |
| 2 | 2 | `PROPOSAL_WAVE_CEILING` (trial, L356) | :109 (no) | :115 (YES) | :96 (no) | :115 | OVERREVERTED: true r36 value now false |
| 3 | 2 | `snapshotDispatchInputs` (trial, L359) | :171 (no) | :639 (no) | :639 (no: `resolveNativeDispatchPolicy`) | :176 | not restored |
| 4 | 2 | `die` (trial, L361) | :831 (no) | :4315 (no) | :303 (no) | :838 | moved to a new false value |
| 5 | 3 | `parseArgs` (collector, L371) | :120 (YES) | :118 (no) | :118 (no: `COLLECTOR_USAGE`) | :120 | base-TRUE anchor now false; not restored |
| 6 | 3 | `writeEvidenceFile` (collector, L374) | :951 (no) | :977 (no) | :977 (no: `persistEvidenceWrites`) | :955 | not restored |
| 7 | 4 | `EVIDENCE_KIND` (base.mjs, L387) | :133 (YES) | :62 (no) | :62 (no; only definition is :133) | :133 | base-TRUE anchor now false; not restored |
| 8 | 8 | `resolveNativeProfile` (policy.mjs) | :619 (no) | :722 (no) | :722 (no) | :637 | restored-but-still-false |
| 9 | 8 | `loadCanonicalDirective` (policy.mjs) | :879 (no) | :926 (no) | :926 (no) | :897 | restored-but-still-false |

Rows 1 and 4 are "die" in the trial file, whose only definition is `function die` at :838. Row 1's `:303` is the collector section's `die` value, copied into the trial section (base.mjs `die` is at :297).

## Note-wide overreverts (outside group 8, observed while checking)

A true round-36 value that the restoration returned to a base line lacking its symbol:
- `PROFILE` (trial): r36 :56 (`export const PROFILE`) -> HEAD :50 (comment line).
- `parseArgs` (trial): r36 :851 -> HEAD :844 (`const VALUE_FLAGS = ...`).
- `handOffToSightingWall` (trial): r36 :1289 -> HEAD :1282 (`return JSON.parse(...)`).
- `persistEvidenceWrites` (collector): r36 :977 -> HEAD :973 (`} finally {`).
- `PROPOSAL_WAVE_CEILING` (trial, row 2): r36 :115 -> HEAD :96.

## Notice check (HEAD line 2, "Round-37 anchor-truth restoration")

- Present: yes, line 2, above the round-35 notice.
- Accurate: NO.
  1. "Anchors in this note were reverted to the lines their 0614092 sentences named." False. `git diff 0614092` still changes 9 anchors. Rows 8 and 9 were not reverted at all. Rows 5 and 7 were base-true and are now false. Row 2 was a true round-36 value and is now false. Rows 1 and 4 moved to a third false value.
  2. "the round-36 shift-repair moved them one symbol off (spot-check D1)." The forward-shift pattern is real: `corpus/lessons/round-36-verifier-spotcheck.md:77` says "a systematic forward shift onto the next symbol", and rows 8 and 9 match it. But spot-check D1 (same file, :193-196) says "keep the base line wherever its symbol is still on that line", which is symbol truth per moved anchor, not a blanket revert. The notice cites D1 for a remedy D1 does not give. The round-36 values also included true anchors (the five overreverts above) that the blanket revert sent back to false lines.
  3. "Re-verification against the pin is pending; treat line anchors here as at their base revision." Accurate that no pin check was made. But the base lines fail the pin for the restored policy anchors: splitRoute :39 (pinned :66), loadSeatRoutingMirror :155 (:173), verifyLaunchSeatRouting :283 (:301), readRoundPlan :704 (:722), waveTokenFromContext :780 (:798), parseRateCard :908 (:926). The base lines were verified at 964f443e (note line ~368), not at 31c465f1. Residual risk: "treat as base" points readers at lines the pin already contradicts.
- The repair record repeats the false claim: `.ufo/waves/round-37/repairs.md:3-5` reads "every symbol-keyed anchor in ... native-trial-launch.md reverted to its 0614092 sentence line".

## Verdict

refuted. Both failing conditions are met: (a) rows 8 and 9 are restored-but-still-false; (b) the notice misstates scope.

Fix pointers for the integrator (not applied; this audit is read-only):
- row 8 -> :637; row 9 -> :897.
- Per D1, keep row 5 at :120 and row 7 at :133.
- row 2 -> :115; rows 1 and 4 -> :838; row 3 -> :176; row 6 -> :955.
- Notice: state what was and was not reverted, or drop the scope claim. Correct `repairs.md` D1 lines 3-5.

## Commands and output (abridged)

1. `git -C <lane> diff --no-color -U0 0614092 -- corpus/knowledge/native-trial-launch.md`: hunks at 328, 354, 357, 359, 369, 372, 385, plus two elided hunks (policy 419 and 421), plus the notice hunk `@@ -1,0 +2,2 @@`.
2. `git -C <lane> status --short -- corpus/knowledge/native-trial-launch.md`: empty. `cmp` of worktree vs `git show HEAD:<note>`: equal.
3. `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`: `31c465f15669f744848bd9f5d56191c5085670f7`. `status --short`: empty.
4. `read policy.mjs:619` -> `herdWindowMs: input.backpressure.herdWindowMs,`. `:722` -> `export function readRoundPlan(runRoot, manifest) {`. `:879` -> `  };`. `:926` -> `export function parseRateCard(budgets) {`.
5. grep `resolveNativeProfile|loadCanonicalDirective` over `scripts/`: definitions only at `policy.mjs:637` and `:897`. Callers at `collect-omp-native-handoff.mjs:370` and `:430`.
6. grep trial file: `function die` 838; `export const PROFILE` 56; `export const PROPOSAL_WAVE_CEILING` 115; `export function parseArgs` 851; `function handOffToSightingWall` 1289; `export function snapshotDispatchInputs` 176; `export function resolveNativeDispatchPolicy` 639.
7. grep lib: `EVIDENCE_KIND` only at `base.mjs:133`; `function die` at `base.mjs:297`.
8. `read` raw single lines: trial :303 comment; :831 `routeFamily: resolved.routeFamily,`; :50 comment; :844 `const VALUE_FLAGS = ...`; :1282 `return JSON.parse(...)`. Collector :118 `const COLLECTOR_USAGE = ...`; :973 `} finally {`.
9. Round-36 values from `git diff 0614092 3d5760a` and `git diff 3d5760a 86c0676` on the note (same hunks as rows above).
10. `corpus/lessons/round-36-verifier-spotcheck.md:77` (forward shift), `:193-196` (D1 text). `.ufo/waves/round-37/repairs.md:3-5` (D1 restored claim).

## Residual risk and verification gaps

- Rows 1-7 were checked by symbol definition lines from grep, not by reading every line. Rows 8 and 9 were read line by line.
- Restored-to-base anchors outside the 9-row set were not individually re-verified, beyond the six policy anchors listed above.
- `policy.mjs` section header says "(924 L)"; the pinned file is 942 lines. Not an anchor; not counted.
- No installs, package transactions, or tool changes were made.
- Scratch snapshots: `/fast/scratch/kumitate-r37/AuditNativeTrial8/` (base-0614092.md, head.md, round36-3d5760a.md, base-91da.md).

Trailer (lane-relative): `corpus/knowledge/native-trial-launch.md`; `.ufo/waves/round-37/repairs.md`; `corpus/lessons/round-36-verifier-spotcheck.md`. Pinned source paths are absolute under `/fast/scratch/kumitate-r36/src/`.
