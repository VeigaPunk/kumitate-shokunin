AUDIT Sighting1 anchors=2 false=2 overreverted=1 notice=bad verdict=refuted

## Scope
- Note: `corpus/knowledge/sighting-wall.md`. Working tree == 5ceb8cd == HEAD a5d627b (HEAD moved from 86c0676 during the audit; `git log -- <note>` last change is 5ceb8cd). Base 0614092. Round-36 = 5833351 (= 5ceb8cd^).
- Pin: `/fast/scratch/kumitate-r36/src` @ 31c465f1. Files read (ufo-sighting.mjs, lib base/argv/observe/surface) are blob-identical to the commit (`git hash-object` = `git rev-parse 31c465f1:<path>`, MATCH x5). Nothing written to the pin.
- Changed tokens (`git diff 0614092`): 10 hunks = notice (+2) + 9 anchor tokens + one non-anchor backtick edit (HEAD 210, already in round-36). Diff order: 1 writeManifest (HEAD 104), 2 resumeMission first slot (HEAD 120), 3 SESSION_NAME (139), 4 MANIFEST_SCHEMA (142), 5 MAX_MANIFEST_BYTES (143), 6 appearsToLaunchOpenCode (164), 7 countActiveSparks (189), 8 SURFACE_MODULE_PATHS range end (205), 9 DEFAULT_PEEK_LINES (208).
- Group 1/8 = tokens 1-2 (floor(i*8/9) partition). Tokens 3-9 belong to other groups; they appear below as cross-check only.

## Group 1 (assigned)

| tok | HEAD line | sentence symbol | 0614092 | round-36 | HEAD | pin def | pin text at HEAD anchor | symbol on line? |
|---|---|---|---|---|---|---|---|---|
| 1 | 104 | writeManifest | :548 | :287 | :287 | :533 | 287: `value.registryRevision = normalizeRegistryRevision(value.registryRevision);` | no -> FALSE |
| 2 | 120 | resumeMissionLocked (1st slot) | :3682 | :3682 | :3762 | :3714 | 3762: `const nativeKey = nativeSessionKey(mission);` | no -> FALSE |
| 2b | 120 | resumeMission (2nd slot, unchanged) | :3762 | :3361 | :3762 | :3794 | same line | no -> FALSE (not counted; unchanged vs 0614092) |
| X | 120 | completeMission (same restored line) | :3339 | :3361 | :3339 | :3361 | 3339: `  }` | no; round-36 was TRUE -> OVERREVERTED |

- anchors=2 (tokens 1, 2); false=2 (tokens 1, 2).
- overreverted=1 (X): the restoration on group line 120 moved completeMission from a true anchor (:3361 is `function completeMission`) to :3339 (`  }`). Tokens 1 and 2 had false round-36 values too (287 and 3682 do not carry their symbols), so they reverted no true anchor.
- Binding check: group-1 verdicts are the same under in-order reading and under left-first binding (prev ?? next, lead's description, not executed), since the nearest left symbol of each group anchor is the same symbol in both readings.

## Notice (HEAD lines 2-3)
- Present: yes ("Round-37 anchor-truth restoration (2026-10-21)").
- Accurate: no -> notice=bad. It says "Anchors in this note were reverted to the lines their 0614092 sentences named" and "treat line anchors here as at their base revision". At HEAD, 0 of the 9 changed tokens equal their 0614092 values: 5 kept round-36 values (writeManifest :287, MANIFEST_SCHEMA :49, MAX_MANIFEST_BYTES :73, countActiveSparks :493, SURFACE range end :31) and 4 took new values (resumeMissionLocked :3762, SESSION_NAME :27, appearsToLaunchOpenCode :202, DEFAULT_PEEK_LINES :22).

## Cross-check: rest of the note (same pin, same method; outside group 1)
Round-37 touched 34 tokens: 25 reverted to 0614092, 4 new values, 5 kept round-36. At HEAD (in-order reading): 12 true, 22 false.
- Reverted to base, base TRUE (12, correct): SHIM_PATH :19, MODULE_PATH :21, TMUX_TARGET :27, LOCK_TIMEOUT_MS :73, MAX_TEXT_BYTES :63, DEFAULT_ATTACH_TIMEOUT_MS :71, parseOpenCodeArgv :37, isOpenCodeExecutable :131, missionOmpSessionDirectory :35, scanMissionTasks :270, sparkStateRoot :411, surfaceManifest :59.
- OVERREVERTED, round-36 TRUE -> base FALSE (8): acquireOperationLock 648->663 (HEAD 110; 663 is `    try {`); withOperationLock 767->781 (HEAD 113; 781 is `if (typeof result?.then ...`); spawnPaneForMission 2239->2225 (HEAD 116; 2225 blank); completeMission 3361->3339 (HEAD 120, group line X); scheduleReconcile 3604->3572 (HEAD 121; 3572 is `while (lines...`); peekMission 3576->3544 (HEAD 123; 3544 is `const { text, via } = readSteerText(options);`); emitFatal 116->111 (base.mjs, HEAD 148; 111 is `  }`); runLegacyNativeDirect 325->318 (surface.mjs, HEAD 213; 318 is `process.stdout.write`).
- Reverted to base, false in both (5): stopMission 3584 (HEAD 119; round-36 3714 is resumeMissionLocked; stopMission def 3616); reconcileLocked 1976 (HEAD 121; round-36 3604 is scheduleReconcile; reconcileLocked def 1991); steerMission 3511 (HEAD 123; round-36 3576 is peekMission; steerMission def 3543); main 4399 (HEAD 125; round-36 1072 is a set-option line; main def 4432); resumeMission 3762 (token 2b; round-36 3361 is completeMission).
- New non-base values, false in-order (4): resumeMissionLocked :3762 (token 2); SESSION_NAME :27 (base :23 true: pin 23 is `export const SESSION_NAME`); appearsToLaunchOpenCode :202 (base :198 true: pin 198 is its def); DEFAULT_PEEK_LINES :22 (base :20 true: pin 20 is its def).
- Kept round-36 values, false (5): writeManifest :287 (token 1); MANIFEST_SCHEMA :49 (base :41 true; pin 49 is MAX_MANIFEST_BYTES); MAX_MANIFEST_BYTES :73 (base :49 true; pin 73 is LOCK_TIMEOUT_MS); countActiveSparks :493 (base :415 true; pin 493 is loadObservations def); SURFACE_MODULE_PATHS range end :31 (base closes at :18 `];`; pin 31 is surfaceScriptDigest def).
- Reading dependence [INFERENCE from lead's left-first rule, not executed]: the pair sentences `SESSION_NAME` / `TMUX_TARGET` (:27, :27), `appearsToLaunchOpenCode` / `appearsToLaunchOmp` (:202, :202) and `DEFAULT_PEEK_LINES` / `MAX_PEEK_LINES` (:22, :22) read as in-order above. Under left-first binding the three new values bind to TMUX_TARGET, appearsToLaunchOmp and MAX_PEEK_LINES and would be true (count would be 15 true / 19 false). Group 1 is unaffected.

## Verdict
refuted. Failing conditions met: (a) group-1 restored anchors 1 and 2 carry no symbol on their restored line; (b) the notice misstates scope (9 of 9 changed tokens contradict "reverted to the 0614092 lines"). Also one true anchor (completeMission, line 120) was overreverted.

## Verification gaps
- Unchanged anchors not in either diff were not audited, except incidental pin checks that were true: ROOT :17, SHIM_PATH :19, MODULE_PATH :21, APP_ID :39, SURFACE_KIND :24, surfaceScriptDigest :31, surfaceErrors :50, validateManifest :279, levelStatus :561.
- No lane gates, tests or builds run (not assigned). No installs or package transactions.

## Commands and key output
- C1 `git -C <lane> --no-pager diff --no-ext-diff --no-color -U0 0614092 -- corpus/knowledge/sighting-wall.md` -> hunks @@-102 @@-118 @@-137 @@-140,2 @@-162 @@-187 @@-203 @@-206 @@-208, notice +2; 9 anchor tokens differ.
- C2 `git show 0614092:<note>`, `git show 5ceb8cd^:<note>` (round-36), `git show 5ceb8cd:<note>`; `diff base r36`; `diff r36 5ceb8cd`; `cmp 5ceb8cd <worktree>` -> IDENTICAL. Round-36 values taken from these diffs.
- C3 `git hash-object <file>` vs `git rev-parse 31c465f1:<file>` for 5 pin files -> MATCH x5.
- C4 `_grep` `^(export )?(async )?function <symbols>` on pin ufo-sighting.mjs and lib -> defs: writeManifest 533, acquireOperationLock 648, withOperationLock 767, reconcileLocked 1991, spawnPaneForMission 2239, completeMission 3361, steerMission 3543, peekMission 3576, scheduleReconcile 3604, stopMission 3616, resumeMissionLocked 3714, resumeMission 3794, main 4432; base SESSION_NAME 23, TMUX_TARGET 27, APP_ID 39, MANIFEST_SCHEMA 41, MAX_MANIFEST_BYTES 49, LOCK_TIMEOUT_MS 73, emitFatal 116; argv appearsToLaunchOpenCode 198, appearsToLaunchOmp 202; observe countActiveSparks 415, loadObservations 493; surface SURFACE_MODULE_PATHS 13-18, surfaceScriptDigest 31, DEFAULT_PEEK_LINES 20, MAX_PEEK_LINES 22.
- C5 `_read` pin ufo-sighting.mjs:285-289 (287 = registryRevision line), :546-550 (548 = fsyncSync), :3679-3687 (3682 = runId check), :3759-3767 (3762 = nativeKey line), :3339 raw (`  }`).
- C6 `_read` single raw lines: entry 663 `try {`, 781 `if (typeof result?.then`, 2225 blank, 3572 `while (lines`, 3544 `const { text, via }`, 3584 `fail("MISSION_NOT_LIVE"`, 1976 `.map((pane)`, 3511 `}`, 4399 `childEnvironment = sandbox.env;`, 1072 `["set-option"`; base 111 `  }`; surface 318 `process.stdout.write`.
