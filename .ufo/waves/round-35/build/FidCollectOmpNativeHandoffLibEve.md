FIDELITY scripts/collect-omp-native-handoff-lib/events.mjs anchors=7 ok=4 moved=2 changed=1 gone=0

# Scope
Claim C2 anchor-fidelity re-verification for ONE changed member,
`scripts/collect-omp-native-handoff-lib/events.mjs`, upstream diff
964f443e..31c465f1 (+15/-0). Notes checked:
`corpus/knowledge/native-trial-launch.md` and
`corpus/knowledge/remaining-scripts-census.md`. Read-only; no note edited.

# Non-ok anchors
note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording
---|---|---|---|---|---
native-trial-launch.md:383 | `scripts/collect-omp-native-handoff-lib/events.mjs` (383 L) | member-section heading: 383 source lines, "transcript intake" | changed | `scripts/collect-omp-native-handoff-lib/events.mjs` = 398 L at 31c465f1 | `## scripts/collect-omp-native-handoff-lib/events.mjs` (398 L) — transcript intake — re-anchored at 31c465f1 (964f443e recorded 383 L).
native-trial-launch.md:386 | `:260` | `taskCalls` = task extraction | moved | events.mjs:265 | task extraction `taskCalls` — re-anchored at 31c465f1: `:265`; memoized wrapper, pairing body now `computeTaskCalls` `:275`.
native-trial-launch.md:386 | `:381` | `taskDispatches` | moved | events.mjs:396 | `taskDispatches` — re-anchored at 31c465f1: `:396`; delegates to cached `taskCalls(...).dispatches`, same output.

# Ok anchors (verified at cited line, 31c465f1)
- native-trial-launch.md:385 → `readJsonl` at events.mjs:166: `export function readJsonl(file) {` (identical at both revisions).
- native-trial-launch.md:387 → `effectiveTaskAssignment` at events.mjs:253: `export function effectiveTaskAssignment(assignment) {` (identical).
- native-trial-launch.md:388 → `normalizeTranscriptEvent` at events.mjs:16: `function normalizeTranscriptEvent(event, droppedFields) {` (identical, still module-private as note implies by "intake hygiene").
- native-trial-launch.md:388 → `uniquifyReusedTaskIds` at events.mjs:82: `function uniquifyReusedTaskIds(events) {` (identical, still module-private).

# Described behavior changed even where the line exists
1. `taskCalls` is no longer a pure recompute. Added at events.mjs:259-273: a
   4-line doc comment plus `const TASK_CALL_SCANS = new WeakMap();` and a
   memoizing wrapper; the original pairing loop moved verbatim into
   `function computeTaskCalls(events, parentRole)` at events.mjs:275. Repeated
   calls with the same `(events, parentRole)` now return the *same* result
   object and arrays (previously a fresh object each call). Consumers were
   checked for mutation and only read: `scripts/collect-omp-native-handoff.mjs:824`
   (`.rejected` → `.filter`), `:903` (`taskDispatches(...)` → `assertWaveDispatchToken`,
   `validateDispatches`, `.find`), `:933`, `:940` (`.length`); and
   events.mjs:397 (`.dispatches`). No output-level drift observed; the
   read-only assumption is stated in the new comment at events.mjs:260-262.
2. `taskDispatches` body changed (`return taskCalls(events, parentRole).dispatches;`
   at events.mjs:397) but its contract is unchanged, so its note claim holds
   modulo the moved anchor.
3. The note's `Symbols:` line (native-trial-launch.md:390) remains accurate:
   `readJsonl`, `taskCalls`, `taskDispatches`, `effectiveTaskAssignment` are
   all still exported. `computeTaskCalls` is module-private, so not an export
   drift. Its omission from the Symbols list is not a fidelity failure.

# remaining-scripts-census.md
Only membership, no anchors: `:37` lists the bare path inside the fenced live
member set. It remains a member at 31c465f1, so no drift. The note's revision
label (964f443e) carries no line-count claim for this member; nothing to
re-anchor. Frozen record `.ufo/waves/round-35/frozen/s-modified-members-55.tsv:7`
lists `+15/-0	native-trial-launch.md remaining-scripts-census.md`, matching the
actual diff exactly (so both notes are the recorded claim owners, as found).

# Evidence / commands run
- `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/collect-omp-native-handoff-lib/events.mjs`
  → one hunk `@@ -257,7 +257,22 @@ export function effectiveTaskAssignment(assignment) {`, 15 insertions, 0 deletions.
- `git show <rev>:scripts/collect-omp-native-handoff-lib/events.mjs | wc -l` → 964f443e: 383, 31c465f1: 398.
- `grep -nE '^(export )?function (readJsonl|taskCalls|computeTaskCalls|taskDispatches|effectiveTaskAssignment|normalizeTranscriptEvent|uniquifyReusedTaskIds)'`
  on both revisions → definition lines 16/82/166/253/260/381 (964f443e) vs
  16/82/166/253/265/275/396 (31c465f1); no definitions deleted.
- `sed -n '260,265p;381p;396,398p'` at 31c465f1 → `:260` is the new cache
  comment, `:381` is `task: effectiveAssignment,` inside `computeTaskCalls`,
  `:396` is `export function taskDispatches(...)`.
- `grep -rn 'events\.mjs:[0-9]' corpus/knowledge/` → only the one full-path
  anchor at native-trial-launch.md:385; the other five are bare `:N`
  continuation anchors inside the member's own `## ` section (note lines
  386-388) plus the heading.
- `grep -n 'readJsonl\|taskCalls\|taskDispatches\|effectiveTaskAssignment\|normalizeTranscriptEvent\|uniquifyReusedTaskIds' corpus/knowledge/native-trial-launch.md`
  → anchors at 385, 386, 386, 387, 388, 388.
- Tool installs/upgrades: none (no install needed this item).

# Remaining unknowns / inference
- [INFERENCE] "transcript intake" descriptor still fits: `readJsonl` is still
  the file reader and the task pairing logic is unchanged in body; only caching
  was added. No evidence the member's role broadened.
- [INFERENCE] No caller mutates the now-shared arrays today (verified by
  reading all four call sites); a future mutating caller would observe cache
  aliasing. Not a current anchor failure.
- Not checked (out of scope): other members' anchors, K-layer, S/R derivation.
