AUDIT Sighting2 anchors=1 false=1 overreverted=0 notice=bad verdict=refuted

Scope: corpus/knowledge/sighting-wall.md, group 2/8 = changed anchor #2 of the 9 that `git diff 0614092` shows (slicing floor(k*9/8): one anchor per group, group 8 takes two). Pin: /fast/scratch/kumitate-r36/src, HEAD 31c465f1, status clean. Lane: the file was last changed in 5ceb8cd (committed, not uncommitted as the brief says); worktree matches it (`git status` empty). Read-only. No installs, no spawns.

## 1. Group 2 (counted)

| # | sentence / symbol | file | 0614092 | round-36 (3d5760a) | restored (worktree) | pin text at restored line | symbol on line | symbol's line at pin | result |
|---|---|---|---|---|---|---|---|---|---|
| 2 | `resumeMissionLocked` in "`resumeMissionLocked` / `resumeMission` (…)" | scripts/ufo-sighting.mjs | :3682 | :3682 | :3762 | `  const nativeKey = nativeSessionKey(mission);` | NO | :3714 (def), :3823 (call) | **FALSE** |

Commands and output:
```
$ git --no-pager diff --unified=0 0614092 -- corpus/knowledge/sighting-wall.md
@@ -118 +120 @@
-`resumeMission` (`:3682`, `:3762`), `completeMission` (`:3339`),
+`resumeMission` (`:3762`, `:3762`), `completeMission` (`:3339`),

$ git show 3d5760a:corpus/knowledge/sighting-wall.md | sed -n 117,118p
`stopMission` (`scripts/ufo-sighting.mjs:3714`), `resumeMissionLocked` /
`resumeMission` (`:3682`, `:3361`), `completeMission` (`:3361`),

$ sed -n 3682p scripts/ufo-sighting.mjs      (pin)
  if (runId !== undefined && row.runId !== runId) {
$ sed -n 3762p scripts/ufo-sighting.mjs      (pin)
  const nativeKey = nativeSessionKey(mission);
$ sed -n 3714p scripts/ufo-sighting.mjs      (pin)
function resumeMissionLocked(state, spec, { geometryOverride, env = process.env } = {}) {

$ grep -n resumeMissionLocked scripts/ufo-sighting.mjs      (pin)
3714:function resumeMissionLocked(state, spec, { geometryOverride, env = process.env } = {}) {
3823:    mission = resumeMissionLocked(loaded.state, spec, { geometryOverride, env });

$ function extents (pin): 3675 resolveExactMission, 3699 restoreStoppedMission, 3714 resumeMissionLocked, 3794 resumeMission
```
Line 3762 sits inside resumeMissionLocked's body (def :3714). Line 3682 sits inside resolveExactMission. Neither line carries the symbol.

Finding:
- restored-but-still-false: 1 (`resumeMissionLocked` → :3762).
- overreverted: 0. Round-36 and 0614092 both say :3682, which is also false at pin, so no true value was reverted.
- The worktree value is not a restoration. The round-37 edit copied resumeMission's base value (:3762) into the resumeMissionLocked slot, moving an anchor that was at its base line off it.
- Same sentence, not in the 0614092 diff, not counted: `resumeMission` (:3762) is FALSE at pin (restored to base; base is false; def :3794).

## 2. Notice (note line 2)

Present: yes. Accurate: NO, so notice=bad.
Claim: "Anchors in this note were reverted to the lines their 0614092 sentences named."
Evidence: `git diff 0614092` still changes 9 anchor values, and none of the 9 sits on its 0614092 line. Breakdown (pin truth in §3):
- Shifted in round-36, left shifted by round-37 (base TRUE at pin unless noted): MANIFEST_SCHEMA :41→:49; MAX_MANIFEST_BYTES :49→:73; countActiveSparks :415→:493; SURFACE_MODULE_PATHS range end :18→:31; writeManifest :548→:287 (base FALSE; true line :533).
- At base in round-36, moved off base by round-37: resumeMissionLocked :3682→:3762 (base FALSE); SESSION_NAME :23→:27 (line 27 only references it; declared :23); appearsToLaunchOpenCode :198→:202 (base TRUE); DEFAULT_PEEK_LINES :20→:22 (base TRUE).
- Non-anchor: the `fail("CODE"` code span in the surfaceErrors line was unwrapped (formatting only).

## 3. Cross-check of the other 8 changed anchors (other groups; not counted)

| # | anchor | worktree line | pin text at that line | symbol on line | true pin line |
|---|---|---|---|---|---|
| 1 | writeManifest | ufo-sighting.mjs:287 | `  value.registryRevision = normalizeRegistryRevision(value.registryRevision);` | no | :533 |
| 3 | SESSION_NAME | base.mjs:27 | `export const TMUX_TARGET = \`${SESSION_NAME}:${WINDOW_INDEX}\`;` | reference only | :23 |
| 4 | MANIFEST_SCHEMA | base.mjs:49 | `export const MAX_MANIFEST_BYTES = 1_048_576;` | no | :41 |
| 5 | MAX_MANIFEST_BYTES | base.mjs:73 | `export const LOCK_TIMEOUT_MS = 10_000;` | no | :49 |
| 6 | appearsToLaunchOpenCode | argv.mjs:202 | `export function appearsToLaunchOmp(argv, env = process.env, depth = 0) {` | no | :198 |
| 7 | countActiveSparks | observe.mjs:493 | `export function loadObservations(env = process.env) {` | no | :415 |
| 8 | SURFACE_MODULE_PATHS (range end) | surface.mjs:31 | `export function surfaceScriptDigest() {` | no | :18 (`];`) |
| 9 | DEFAULT_PEEK_LINES | surface.mjs:22 | `export const MAX_PEEK_LINES = 400;` | no | :20 |

Partition note: if the slicing gives the extra anchor to group 1 (sizes 2,1,…,1), group 2 is #3 SESSION_NAME. Its worktree line :27 only references the symbol (declared :23), so it is not a declaration anchor.

## 4. Restorations outside group 2 (observed while checking the notice; not counted)

Overreverted: round-36 line TRUE at pin, and the worktree (= base) line is FALSE.

| symbol | round-36 line | pin text, round-36 line | worktree = base line | pin text, base line |
|---|---|---|---|---|
| acquireOperationLock | :648 TRUE | `function acquireOperationLock(env = process.env, timeoutMs = null) {` | :663 | `    try {` (FALSE) |
| withOperationLock | :767 TRUE | `function withOperationLock(callback, env = process.env, timeoutMs = null) {` | :781 | `    if (typeof result?.then === "function") return result.finally(finish);` (FALSE) |
| spawnPaneForMission | :2239 TRUE | `function spawnPaneForMission(state, mission, env = process.env) {` | :2225 | blank line (FALSE) |
| completeMission | :3361 TRUE | `function completeMission(identifier, note, { dryRun = false, env = process.env } = {}) {` | :3339 | `  }` (FALSE) |
| scheduleReconcile | :3604 TRUE | `function scheduleReconcile(env = process.env) {` | :3572 | `  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();` (FALSE) |
| peekMission | :3576 TRUE | `function peekMission(identifier, lines, env = process.env) {` | :3544 | `  const { text, via } = readSteerText(options);` (FALSE) |

Restored-but-false: restored to base, base FALSE, round-36 also FALSE. stopMission :3584 (def :3616); reconcileLocked :1976 (def :1991); steerMission :3511 (def :3543); main :4399 (def :4432); resumeMission :3762 (def :3794).

Not audited: the other unchanged anchors, and the round-36→round-37 lib restorations beyond the 9 changed anchors (SHIM_PATH, MODULE_PATH, TMUX_TARGET, LOCK_TIMEOUT_MS, MAX_TEXT_BYTES, DEFAULT_ATTACH_TIMEOUT_MS, parseOpenCodeArgv, isOpenCodeExecutable, missionOmpSessionDirectory, scanMissionTasks, sparkStateRoot, surfaceManifest, runLegacyNativeDirect). Their pin status is unknown.

## 5. Operability and limits

- Operability: a reader who follows the notice ("treat line anchors here as at their base revision") is sent to the wrong line for 8 of the 9 changed anchors. For example, `scripts/ufo-sighting.mjs:3762` opens `const nativeKey = nativeSessionKey(mission);`. Only SESSION_NAME :27 is partly right, and only by reference.
- Symbol test: a symbol token anywhere on the line counts as on-line. Only #3 changes under a stricter declaration-only reading.
- The round-37 falsify spec names "D1 restore+mark" as Verify1's target. I did not re-audit the notice's "spot-check D1" citation beyond that.
- No lane files were changed. This report is the only file written, plus no scratch output.
