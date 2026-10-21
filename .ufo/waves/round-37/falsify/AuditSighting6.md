AUDIT Sighting6 anchors=1 false=1 overreverted=8 notice=bad verdict=refuted

Summary: group 6 restored anchor #6 (appearsToLaunchOpenCode) points at a line that holds appearsToLaunchOpenCode's neighbour, appearsToLaunchOmp. Failing condition met twice: a restored anchor whose symbol is not on its line, and a notice that misstates scope. Note-wide, 0 of the 9 anchors changed from 0614092 point to their symbol, and 8 correct round-36 anchors were reverted to base lines that do not carry their symbol.

## Scope and state
- Audited note = working tree, byte-identical to commit 5ceb8cd (`cmp` clean). Lane HEAD a5d627b; last note change 5ceb8cd. Base 91da27c6 is an ancestor of HEAD, so "repair tree uncommitted" in the item is stale.
- Pin /fast/scratch/kumitate-r36/src: HEAD 31c465f15669f744848bd9f5d56191c5085670f7, `git status --short` empty.
- Symbol truth = definition line from `grep -nE "^(export )?(async )?(function|const|class) NAME"` over the pin, plus content read at the anchor line.
- Versions: base = `git show 0614092:…`; r36 = `git show 3d5760a:…`; wt = working tree. Scratch: /fast/scratch/kumitate-r37/AuditSighting6/.
- Notation: `:N` = anchor value in the note; `note Ln` = line of the note; `pin Ln` = line of the pinned source.
- `git diff 0614092`: 9 changed anchor tokens at note lines 104, 120, 139, 142, 143, 164, 189, 205, 208. Non-anchor edit at note L210: backtick code span around `fail("CODE"` removed (introduced in r36, not reverted).

## Partition (group 6/8)
- Nine changed anchors in note order: #1 writeManifest, #2 resumeMissionLocked, #3 SESSION_NAME, #4 MANIFEST_SCHEMA, #5 MAX_MANIFEST_BYTES, #6 appearsToLaunchOpenCode, #7 countActiveSparks, #8 surface range end, #9 DEFAULT_PEEK_LINES.
- Eight groups by floor split, group k = (floor((k-1)*9/8), floor(k*9/8)]: group 6 = {#6}. A ceil split puts #7 in group 6. Both are audited; both are FALSE, so the result does not depend on the split.
- `overreverted` is counted note-wide. A revert to base leaves no trace in the 0614092 diff (wt == base), so no group can see it.

## Table A — group 6 (+ boundary #7)
| # | anchor | base → pin | r36 → pin | wt → pin | result |
|---|---|---|---|---|---|
| 6 | appearsToLaunchOpenCode, argv.mjs | :198 → pin L198 `export function appearsToLaunchOpenCode(` TRUE | :198 TRUE | :202 → pin L202 `export function appearsToLaunchOmp(` FALSE | restored-but-false; true anchor regressed |
| 7 | countActiveSparks, observe.mjs (boundary) | :415 → pin L415 def TRUE | :493 → pin L493 `loadObservations` FALSE | :493 FALSE | left at r36 value; true anchor regressed |

## Table B — other changed anchors
| # | anchor | base → pin | r36 → pin | wt → pin | result |
|---|---|---|---|---|---|
| 1 | writeManifest, ufo-sighting.mjs (note L104) | :548 → pin L548 `fsyncSync(descriptor);` FALSE | :287 → pin L287 `value.registryRevision = normalizeRegistryRevision(…)` FALSE | :287 FALSE (def pin L533) | not restored; still false |
| 2 | resumeMissionLocked, ufo-sighting.mjs (note L120) | :3682 → pin L3682 `if (runId !== undefined …` FALSE | :3682 FALSE | :3762 → pin L3762 `const nativeKey = …` FALSE (def pin L3714) | new false value |
| 2b | resumeMission, same sentence, unchanged token | :3762 FALSE | :3361 FALSE | :3762 FALSE (def pin L3794) | false in all three |
| 3 | SESSION_NAME, base.mjs (note L139) | :23 TRUE | :23 TRUE | :27 = TMUX_TARGET def FALSE | regressed TRUE→FALSE |
| 4 | MANIFEST_SCHEMA, base.mjs (note L142) | :41 TRUE | :49 FALSE | :49 FALSE | r36 value left in place |
| 5 | MAX_MANIFEST_BYTES, base.mjs (note L143) | :49 TRUE | :73 FALSE | :73 FALSE | r36 value left in place |
| 8 | SURFACE_MODULE_PATHS end, surface.mjs (note L205) | :18 `];` closes list TRUE | :31 FALSE | :31 FALSE (surfaceScriptDigest def) | r36 value left in place |
| 9 | DEFAULT_PEEK_LINES, surface.mjs (note L208) | :20 TRUE | :20 TRUE | :22 = MAX_PEEK_LINES def FALSE | regressed TRUE→FALSE |

Totals for the nine: wt 0/9 TRUE. Base 7/9 TRUE (#3–#9, with `];` counted as on-claim). r36 3/9 TRUE (#3, #6, #9).

## Table C — overreverted (r36 TRUE at pin, base FALSE, reverted to base, still FALSE)
| O | anchor | base → pin | r36 → pin | wt (note line) |
|---|---|---|---|---|
| O1 | acquireOperationLock | :663 → pin L663 `try {` FALSE | :648 def TRUE | :663 (L110) FALSE |
| O2 | withOperationLock | :781 → pin L781 `if (typeof result?.then …` FALSE | :767 def TRUE | :781 (L113) FALSE |
| O3 | spawnPaneForMission | :2225 → pin L2225 blank FALSE | :2239 def TRUE | :2225 (L116) FALSE |
| O4 | completeMission | :3339 → pin L3339 `}` FALSE | :3361 def TRUE | :3339 (L120) FALSE |
| O5 | scheduleReconcile | :3572 → pin L3572 `while (lines.length …) lines.pop();` FALSE | :3604 def TRUE | :3572 (L121) FALSE |
| O6 | peekMission | :3544 → pin L3544 `const { text, via } = readSteerText(…)` FALSE | :3576 def TRUE | :3544 (L123) FALSE |
| O7 | emitFatal (note hedges "`:111` region") | :111 → pin L111 `}` FALSE | :116 def TRUE | :111 (L148) FALSE |
| O8 | runLegacyNativeDirect | :318 → pin L318 `process.stdout.write(…)` FALSE | :325 def TRUE | :318 (L213) FALSE |

overreverted = 8. O7 is the hedged one ("region").

## Table D — restored to base and false at pin (r36 also false; not reverts of truth)
- stopMission (L119): :3584 → pin L3584 `fail("MISSION_NOT_LIVE", …)` FALSE; def pin L3616.
- reconcileLocked (L121): :1976 → pin L1976 `.map((pane) => …)` FALSE; def pin L1991.
- steerMission (L123): :3511 → pin L3511 `}` FALSE; def pin L3543.
- main (L125): :4399 → pin L4399 `childEnvironment = sandbox.env;` FALSE; def pin L4432.

## Round-37 net effect vs round-36 (29 anchor-token changes, each checked at pin)
- 12 correct restorations: SHIM, MODULE, TMUX_TARGET, LOCK_TIMEOUT_MS, MAX_TEXT_BYTES, DEFAULT_ATTACH_TIMEOUT_MS, parseOpenCodeArgv, isOpenCodeExecutable, missionOmpSessionDirectory, scanMissionTasks, sparkStateRoot, surfaceManifest.
- 8 overreverts (O1–O8).
- 5 new false values: resumeMissionLocked :3762, resumeMission :3762, SESSION_NAME :27, appearsToLaunchOpenCode :202, DEFAULT_PEEK_LINES :22.
- 4 base-false tokens put back (Table D).
- Left at r36 values although base TRUE: MANIFEST_SCHEMA, MAX_MANIFEST_BYTES, countActiveSparks, surface range end.

## Restoration notice (note L2)
- Present: yes, above the round-35 notice.
- Accurate: NO. notice=bad.
  - "reverted to the lines their 0614092 sentences named": false. `git diff 0614092` shows 9/9 changed anchors still off base.
  - "round-36 shift-repair moved them one symbol off": true for the shifts that were wrong; false for O1–O8, where the round-36 value was correct at pin and round-37 reverted it.
  - "treat line anchors as at their base revision": not navigable. Base values are false at pin for O1–O8 and Table D (12 tokens), so the fallback sends a reader to the wrong symbol.
  - "re-verification pending" disclaims pin truth but does not cover the reverts the notice asserts.

## Other observations (outside the failing condition)
- Unchanged by round-37 and false at pin (definition-line check only): readManifest :379 (def pin L423), loadStatusView :531 (def L516), usage :294 (def L301), output :310 (def L317), requireNoArgs :314 (def L321), launchMissionLocked :2347 (def L2361), launchMission :2372 (def L2386).
- The wc table is measured at 964f443e: ufo-sighting.mjs 4714 (pin 4730), base.mjs 507 (pin 522), surface.mjs 325 (pin 332). argv.mjs 510, observe.mjs 614 and the shim 95 match.

## Pin definition lines (integrator reference; I applied no fixes)
writeManifest 533; resumeMissionLocked 3714; resumeMission 3794; SESSION_NAME 23; TMUX_TARGET 27; MANIFEST_SCHEMA 41; MAX_MANIFEST_BYTES 49; LOCK_TIMEOUT_MS 73; appearsToLaunchOpenCode 198; appearsToLaunchOmp 202; countActiveSparks 415; loadObservations 493; SURFACE_MODULE_PATHS 13 (list closes at 18); surfaceScriptDigest 31; DEFAULT_PEEK_LINES 20; MAX_PEEK_LINES 22; acquireOperationLock 648; withOperationLock 767; spawnPaneForMission 2239; completeMission 3361; scheduleReconcile 3604; peekMission 3576; emitFatal 116; runLegacyNativeDirect 325; stopMission 3616; reconcileLocked 1991; steerMission 3543; main 4432.

## Commands and key output
- `git -C L diff 0614092 -- corpus/knowledge/sighting-wall.md` → 9 anchor hunks at the note lines above, plus the notice hunk and the L210 hunk.
- `git show 5ceb8cd:…` vs working tree → IDENTICAL. `git log --oneline -- <note>` → 5ceb8cd, 3d5760a.
- `git -C P rev-parse HEAD` → 31c465f15669…; `git -C P status --short | wc -l` → 0.
- `grep -nE` definitions over the pin's five files → the definition lines listed above.
- `diff base wt`, `diff r36 wt` → hunks behind Tables A–D and the net-effect counts.
- `read P/scripts/…:N-N` for pin L18, L111, L287, L318, L548, L663, L781, L1976, L2225, L3339, L3511, L3544, L3572, L3584, L3682, L3762, L4399 → content quoted in the tables.

Tooling: none installed; no subagents spawned; no lane files written other than this report.
