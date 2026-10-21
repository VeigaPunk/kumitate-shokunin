AUDIT Sighting8 anchors=2 false=2 overreverted=0 notice=bad verdict=refuted

# Sighting8: round-37 restoration of corpus/knowledge/sighting-wall.md, group 8/8

## Setup
- Dispatch named base 91da27c6 with an uncommitted repair. The lane now has the repair committed: 5ceb8cd (round-37 restoration) and 86c0676 (HEAD). I audited the file as it stands. HEAD content equals the working tree (`git show HEAD:corpus/knowledge/sighting-wall.md | cmp - <worktree>` is equal; content sha1 90e3eb55...).
- Round-36 state is 3d5760a. `git log 0614092..HEAD -- corpus/knowledge/sighting-wall.md` lists only 5ceb8cd and 3d5760a.
- Pin: /fast/scratch/kumitate-r36/src, HEAD 31c465f15669f744848bd9f5d56191c5085670f7. Five files were extracted with `git show 31c465f:<path>` and are `cmp -s` equal to the pin worktree. Copies are under /fast/scratch/kumitate-r37/AuditSighting8/pin/.
- Changed anchors: `git --no-pager diff --no-ext-diff -U0 0614092 -- corpus/knowledge/sighting-wall.md` gives 9 numeric anchor changes plus 1 non-anchor edit (HEAD L210). File order, HEAD line:
  1 writeManifest (L104); 2 resumeMissionLocked (L120); 3 SESSION_NAME (L139); 4 MANIFEST_SCHEMA (L142); 5 MAX_MANIFEST_BYTES (L143); 6 appearsToLaunchOpenCode (L164); 7 countActiveSparks (L189); 8 SURFACE_MODULE_PATHS range end (L205); 9 DEFAULT_PEEK_LINES (L208).
- Eighth: 9 items into 8 parts, remainder to the last part, so group 8/8 = items 8-9. Item 9 is also the remainder under a one-per-group split, so it is covered either way.

## Group 8/8 (restored line = HEAD)
| # | Anchor | 0614092 | 3d5760a (r36) | HEAD | Pin 31c465f content at HEAD line | Class |
|---|---|---|---|---|---|---|
| 8 | SURFACE_MODULE_PATHS lists the four lib files, `surface.mjs:13`-`:31` (L205) | 18 (`];`, list closer) | 31 | 31 | L31 = `export function surfaceScriptDigest() {`. The list is L13-L18. | restored-but-still-false; round-36 value left in place |
| 9 | DEFAULT_PEEK_LINES `(:22, :22)` (L208) | 20 (true) | 20 (true) | 22 | L22 = `export const MAX_PEEK_LINES = 400;`. DEFAULT is L20. | restored-but-still-false; round-37 regression (true to false) |

- Overreverted in group: 0. Row 8's round-36 value is false, and row 9's base line carries its symbol.
- Commands and output: `grep` on pin surface.mjs gives `*13:const SURFACE_MODULE_PATHS = [`, `18:];`, `*20:export const DEFAULT_PEEK_LINES = 80;`, `*22:export const MAX_PEEK_LINES = 400;`, `*31:export function surfaceScriptDigest() {`.
- `diff r36 head` (= `git diff 3d5760a 5ceb8cd`) changes L206 to L208 only: `(:20, :22)` becomes `(:22, :22)`. Row 8 at L203/L205 is unchanged, `:31` on both sides.

## All nine changed anchors (rows 1-7 are other groups; cross-check for the notice)
| # | Anchor (file) | 0614092 (truth at pin) | 3d5760a (truth) | HEAD (truth) | Class |
|---|---|---|---|---|---|
| 1 | writeManifest (ufo-sighting.mjs) | 548 F (`fsyncSync(descriptor);`) | 287 F | 287 F (`normalizeRegistryRevision`) | left; false; def L533 |
| 2 | resumeMissionLocked (ufo-sighting.mjs) | 3682 F | 3682 F | 3762 F (`nativeSessionKey(mission)`) | F to F, new wrong value; def L3714 |
| 3 | SESSION_NAME (base.mjs) | 23 T | 23 T | 27 F (`TMUX_TARGET`) | regression T to F |
| 4 | MANIFEST_SCHEMA (base.mjs) | 41 T | 49 F (`MAX_MANIFEST_BYTES`) | 49 F | round-36 value kept; base T lost |
| 5 | MAX_MANIFEST_BYTES (base.mjs) | 49 T | 73 F (`LOCK_TIMEOUT_MS`) | 73 F | round-36 value kept; base T lost |
| 6 | appearsToLaunchOpenCode (argv.mjs) | 198 T | 198 T | 202 F (`appearsToLaunchOmp`) | regression T to F |
| 7 | countActiveSparks (observe.mjs) | 415 T | 493 F (`loadObservations`) | 493 F | round-36 value kept; base T lost |
| 8 | SURFACE_MODULE_PATHS range end (surface.mjs) | 18 (closer, counted true) | 31 F | 31 F | round-36 value kept; base T lost |
| 9 | DEFAULT_PEEK_LINES (surface.mjs) | 20 T | 20 T | 22 F | regression T to F |

- HEAD: 9 of 9 false. Seven were true at base (rows 3-9). Three are round-37 regressions (3, 6, 9). Four round-36 false values were left in place (4, 5, 7, 8).
- Evidence for rows 1-2 and 4-7. `read` of pin ufo-sighting.mjs L287 gives `value.registryRevision = normalizeRegistryRevision(...)`. L548 gives `fsyncSync(descriptor);`. L3762 gives `const nativeKey = nativeSessionKey(mission);`. A bare-symbol grep on pin ufo-sighting.mjs (`acquireOperationLock|...|resumeMission|writeManifest`) has no matched line at 287, 548, 3682, or 3762. `read` of base.mjs L73 gives `export const LOCK_TIMEOUT_MS = 10_000;`. `read` of observe.mjs L493 gives `export function loadObservations(...)`.

## Notice (HEAD L2): present, inaccurate, so notice=bad
- Present: yes. Blockquote "Round-37 anchor-truth restoration (2026-10-21)".
- Scope claim, "Anchors in this note were reverted to the lines their 0614092 sentences named": false. 9 of 9 changed anchors still differ from 0614092. `.ufo/waves/round-37/repairs.md:3-4` repeats the same universal claim.
- Cause claim, "the round-36 shift-repair moved them one symbol off (spot-check D1)": D1 is at `corpus/lessons/round-36-verifier-spotcheck.md:193-196`. It says "keep the base line wherever its symbol is still on that line", a keep-if-true rule. The L1 reverted unconditionally. Seven round-36 values were TRUE at the pin, so "moved them off" does not hold uniformly (see overreverts).
- "treat line anchors here as at their base revision": base lines are not truth at 31c465f. Nine checked base lines are false at the pin: rows 1-2 plus the seven overreverts below.

## Overreverts outside group 8/8 (note-wide)
These are in the round-37 commit but not in the base-to-HEAD set, so a base-to-HEAD enumeration cannot see them. Round-36 line TRUE at the pin; restored base line FALSE, symbol absent:
- ufo-sighting.mjs: `acquireOperationLock` 648 T to 663 F; `withOperationLock` 767 T to 781 F; `spawnPaneForMission` 2239 T to 2225 F; `completeMission` 3361 T to 3339 F; `scheduleReconcile` 3604 T to 3572 F; `peekMission` 3576 T to 3544 F.
- surface.mjs: `runLegacyNativeDirect` 325 T to 318 F (L318 = `process.stdout.write(...)`).
- base.mjs `emitFatal` 116 T to 111 F is "region"-qualified in the note, so it is not counted.
- Strict total: 7. Evidence: the bare-symbol grep matches `*` lines 648, 767, 2239, 3361, 3576, 3604. Lines 663, 781, 2225, 3339, 3544, 3572 do not carry the symbol.

## Other observations
- Correct round-37 restorations, base line true at pin and now HEAD: SHIM_PATH 21-to-19, MODULE_PATH 23-to-21, TMUX_TARGET 39-to-27, LOCK_TIMEOUT_MS 75-to-73, MAX_TEXT_BYTES 65-to-63, DEFAULT_ATTACH_TIMEOUT_MS 77-to-71, missionOmpSessionDirectory 56-to-35, scanMissionTasks 384-to-270, sparkStateRoot 415-to-411, surfaceManifest 67-to-59, parseOpenCodeArgv 280-to-37, isOpenCodeExecutable 135-to-131.
- Non-anchor edit in the same commit: HEAD L210 `mines `fail("CODE"` literals` becomes `mines fail("CODE" literals`. This breaks the code span and is unrelated to anchors.

## Verdict and gaps
- Group 8/8: anchors=2, false=2, overreverted=0, verdict=refuted. Both assigned anchors are false at HEAD, and row 9 is a round-37 regression.
- Notice: present, but its scope claim is false. notice=bad.
- Not checked: lane claims gate, fidelity ratchet, and Q16 (other auditors' scope). The "region" anchor for emitFatal is not counted.
- Tooling: read-only git (`GIT_OPTIONAL_LOCKS=0`; no status or index writes). No installs or package actions. Scratch: /fast/scratch/kumitate-r37/AuditSighting8/ (base.md, r36.md, head.md, work.md, pin/).
