AUDIT Sighting3 anchors=1 false=1 overreverted=0 notice=bad verdict=refuted

# AuditSighting3: round-37 restoration of corpus/knowledge/sighting-wall.md, group 3/8

## Scope and method
- Lane HEAD 86c0676; note clean (`git status --porcelain -- corpus/knowledge/sighting-wall.md` empty). Base 0614092. Round-36 state = 5833351 (= 5ceb8cd^).
- Pin /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7, `git status --porcelain` empty. Read-only use.
- The note header says "Measured at origin HEAD `964f443e`" (note L14-15). That commit is in the pin's object store, so every anchor was also tested at 964f443e (`git show 964f443e:<file>` into /fast/scratch/kumitate-r37/AuditSighting3/). The pin was not modified.
- Changed anchors (`git diff -U0 0614092 -- corpus/knowledge/sighting-wall.md`): 10 changed lines, 9 changed anchors, in document order (base line numbers):
  1 writeManifest L102 · 2 resumeMissionLocked L118 · 3 SESSION_NAME L137 · 4 MANIFEST_SCHEMA L140 · 5 MAX_MANIFEST_BYTES L141 · 6 appearsToLaunchOpenCode L162 · 7 countActiveSparks L187 · 8 SURFACE_MODULE_PATHS range end L203 · 9 DEFAULT_PEEK_LINES L206.
  The tenth line only drops code-span backticks around `fail("CODE"` (no anchor).
- Group 3/8 partition: 9 items over 8 eighths, ceil(i*8/9), gives group 3 = #3 (SESSION_NAME). np.array_split would give #4; ceil(9/8)=2 chunking gives #5-#6. All nine rows are audited below and every row fails, so the verdict does not depend on the split.
- "Symbol on line" = the sentence's symbol is declared or defined on that line. A literal reference does not count (one case noted in row 3).
- "A / B (x, y)" pairs A with x and B with y, as the base itself does for SESSION_NAME/TMUX_TARGET and OpenCode/Omp.

## Group 3 (#3)

| symbol | base 0614092 | R36 | head R37 | base line holds symbol pin / 964 | head line holds symbol pin / 964 |
|---|---|---|---|---|---|
| SESSION_NAME (base.mjs) | :23 | :23 | :27 | yes / yes | NO / NO |

- Pin base.mjs:23 `export const SESSION_NAME = "ufo_sighting";`. Pin base.mjs:27 `export const TMUX_TARGET = \`${SESSION_NAME}:${WINDOW_INDEX}\`;`. SESSION_NAME occurs on :27 only as a reference inside the template; its declaration is not there. A literal-match reading would pass this line; the declaration reading fails it.
- R37 moved an anchor that was correct at base and in R36 onto the TMUX_TARGET line. This is a regression.

## All nine base-to-head anchors (for re-slicing)

| # | symbol | base | R36 | head | base @pin / @964 | head @pin / @964 | what the head line actually is |
|---|---|---|---|---|---|---|---|
| 1 | writeManifest | :548 | :287 | :287 | no / yes | NO / NO | validateManifest body (decl :279) |
| 2 | resumeMissionLocked | :3682 | :3682 | :3762 | no / yes | NO / NO | pin: body of resumeMissionLocked (decl :3714); 964: decl of resumeMission |
| 3 | SESSION_NAME | :23 | :23 | :27 | yes / yes | NO / NO | TMUX_TARGET decl |
| 4 | MANIFEST_SCHEMA | :41 | :49 | :49 | yes / yes | NO / NO | MAX_MANIFEST_BYTES decl |
| 5 | MAX_MANIFEST_BYTES | :49 | :73 | :73 | yes / yes | NO / NO | LOCK_TIMEOUT_MS decl |
| 6 | appearsToLaunchOpenCode | :198 | :198 | :202 | yes / yes | NO / NO | appearsToLaunchOmp decl |
| 7 | countActiveSparks | :415 | :493 | :493 | yes / yes | NO / NO | loadObservations decl |
| 8 | SURFACE_MODULE_PATHS (range end) | :18 | :31 | :31 | yes / yes | NO / NO | surfaceScriptDigest decl |
| 9 | DEFAULT_PEEK_LINES | :20 | :22 | :22 | yes / yes | NO / NO | MAX_PEEK_LINES decl |

- Restored-but-still-false: 9 of 9. No head line declares its named symbol at either revision.
- Rows 1-2: the base lines were not on-symbol at the pin, so D1 required relocation (writeManifest to :533; resumeMissionLocked to :3714). R37 did neither.
- Rows 3-9: the base lines were on-symbol at the pin. D1 (`corpus/lessons/round-36-verifier-spotcheck.md:193-196`: "keep the base line wherever its symbol is still on that line") required keeping them. R37 moved all seven.
- Observed pattern (cause is [INFERENCE]; the repair code was not read): 8 of 9 head values equal the base anchor of the following symbol (27=TMUX_TARGET, 49=MAX_MANIFEST_BYTES, 73=LOCK_TIMEOUT_MS, 202=appearsToLaunchOmp, 493=loadObservations, 31=surfaceScriptDigest, 22=MAX_PEEK_LINES, 3762=resumeMission). Row 1's 287 lies inside the preceding symbol validateManifest. This is the same one-symbol-right shift that round 36 was rejected for.

## Reverted true improvements (overreverted)
- Group 3: 0. No base-to-head row lands on a base line, and the base lines of rows 3-9 are true.
- Note-wide, for the record (R36 line on-symbol at pin, R37 restored to base line, base line not on-symbol at pin): 8.

| symbol | R36 (on-symbol at pin) | restored to | base @pin | base @964 |
|---|---|---|---|---|
| acquireOperationLock | :648 | :663 (`try {`) | no | yes |
| withOperationLock | :767 | :781 | no | yes |
| spawnPaneForMission | :2239 | :2225 (blank line) | no | yes |
| completeMission | :3361 | :3339 (`}`) | no | yes |
| scheduleReconcile | :3604 | :3572 | no | yes |
| peekMission | :3576 | :3544 | no | yes |
| runLegacyNativeDirect | :325 | :318 (inside output()) | no | yes |
| emitFatal | :116 | :111 (`}` of SightingError) | no | no |

- Seven of these are correct for the note's header revision 964f443e and wrong only against the pin. emitFatal's R36 line was correct at both revisions and the restored line is wrong at both: an unambiguous loss.
- Revision split: the note declares 964f443e, the falsify pin is 31c465f1, R36 re-anchored to the pin, and R37 restored the 964-era numbers. The note now mixes both and nothing says which governs. No anchor can be called true until one revision is chosen.

## Notice (note L2-3)
- Present at L2-3, dated 2026-10-21 (matches 5ceb8cd). Accuracy: BAD.
1. "Anchors in this note were reverted to the lines their 0614092 sentences named." False for the nine anchors audited (head differs from base in 9 of 9). Overstates the scope.
2. "treat line anchors here as at their base revision until then." "Base revision" is undefined here; the note names 964f443e (L14-15). A reader following this for group 3 would land on the wrong lines.
3. "the round-36 shift-repair moved them one symbol off (spot-check D1)." D1 resolves (round-36-verifier-spotcheck.md:193-196), but R37 violates D1's keep-base rule on rows 3-9. The one-symbol-off description holds only against 964f443e.

## Commands run (outputs summarized above)
- `git -C lane status --porcelain -- note` (empty); `git log --oneline -3` gave 86c0676, 5ceb8cd, 5833351.
- `git -C lane diff 0614092 -- note` (12 insertions, 10 deletions); `git diff -U0` hunks at L102, 118, 137, 140-141, 162, 187, 203, 206, 208.
- `git -C lane show 5ceb8cd^:note` saved as the R36 copy; diffed against base and head.
- `git -C pin status --porcelain` (empty); `git -C pin cat-file -t 964f443e` gave commit; `git show 964f443e:<five lib files>` into scratch.
- Declaration grep (`^(export )?(async )?(function|const) NAME\b`) over the pin copies and the 964 copies, for all changed-anchor symbols and the overreverted set.
- Read ranges, pin: base.mjs:17-83, 108-118; surface.mjs:1-35; argv.mjs:112-140, 195-206; observe.mjs:405-420; ufo-sighting.mjs:530-553, 661-665, 779-783, 1070-1074, 1974-1978, 2223-2227, 3336-3342, 3509-3513, 3570-3574, 3579-3586, 3680-3688, 3760-3767, 4397-4401. Read ranges, 964 copies: base.mjs:108-118; surface.mjs:13-19; ufo-sighting.mjs:278-288.

## Gaps
- The repair code was not read, so the one-symbol-right mechanism is an observed pattern, not a traced cause.
- Claims-check and fidelity gates were not run (not assigned).
- Only the sighting-wall note was audited.
- Installs: none. Writes: this report and /fast/scratch/kumitate-r37/AuditSighting3/ only.
