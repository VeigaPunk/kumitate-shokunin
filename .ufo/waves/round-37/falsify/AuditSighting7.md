AUDIT Sighting7 anchors=1 false=1 overreverted=0 notice=bad verdict=refuted

# AuditSighting7: sighting-wall.md, group 7/8 (round-37 restoration)

## Scope and state
- Note: `corpus/knowledge/sighting-wall.md`. Lane HEAD is `86c0676`. The worktree blob equals HEAD (`git diff HEAD -- <note>` empty; blob `edcaaa4`). The brief's "repair tree uncommitted" is stale: round 37 is committed as `5ceb8cd`. Pre-round-37 state is `5833351`; base is `0614092` (blob `f3e078a`).
- Pin: `/fast/scratch/kumitate-r36/src`, `git rev-parse HEAD` = `31c465f15669f744848bd9f5d56191c5085670f7`. Read-only use. Nothing written to the pin.
- "Restored line" = the line the note carries at HEAD (W). "Symbol on line" = the sentence's identifier appears on that pinned line (grep or read).

## Partition
`git -C <lane> diff 0614092 -- corpus/knowledge/sighting-wall.md` changes 10 anchor/text lines (plus 2 inserted notice lines). It changes 9 anchor values, and one non-anchor line (`surfaceErrors` lost its code-span backtick, line 75). The dispatch gives no explicit list, so the 9 anchors are numbered in document order. Group 7 is #7 under `lo=(k-1)*n//8, hi=k*n//8`. Under array_split / `floor(i*8/n)` it is #8. Both are audited. Both are false, so the verdict does not depend on the convention. Rows 1-6 and 9 are audited for cross-check only and are not counted in `anchors`.

## Table
B = 0614092 value and its pin status. P = pre-round-37 value (5833351). W = restored value (HEAD). T/F = sentence symbol on that pinned line.

| # | Symbol (file) | B @pin | P | W | W line at pin | Finding |
|---|---|---|---|---|---|---|
| 1 | writeManifest (ufo-sighting.mjs) | 548 F (`fsyncSync(descriptor);`; def 533) | 287 | 287 F | `value.registryRevision = normalizeRegistryRevision(...)` | out; not restored (P=W); restored-but-false |
| 2 | resumeMissionLocked (ufo-sighting.mjs) | 3682 F (`if (runId !== undefined ...`; def 3714) | 3682 | 3762 F | `const nativeKey = nativeSessionKey(mission);` | out; round 37 moved it off its base value |
| 3 | SESSION_NAME (base.mjs) | 23 T | 23 | 27 F | `export const TMUX_TARGET` | out; round 37 broke a true anchor |
| 4 | MANIFEST_SCHEMA (base.mjs) | 41 T | 49 | 49 F | `export const MAX_MANIFEST_BYTES` | out; not restored |
| 5 | MAX_MANIFEST_BYTES (base.mjs) | 49 T | 73 | 73 F | `export const LOCK_TIMEOUT_MS` | out; not restored |
| 6 | appearsToLaunchOpenCode (argv.mjs) | 198 T | 198 | 202 F | `export function appearsToLaunchOmp` | out; round 37 broke a true anchor |
| **7** | **countActiveSparks (observe.mjs)** | **415 T** | **493** | **493 F** | **`export function loadObservations`** | **GROUP 7: restored-but-false; not restored (P=W)** |
| 8 | SURFACE_MODULE_PATHS, span end (surface.mjs) | 18 (`];`, correct span end) | 31 | 31 F | `export function surfaceScriptDigest() {` | alt group 7; restored-but-false; not restored |
| 9 | DEFAULT_PEEK_LINES (surface.mjs) | 20 T | 20 | 22 F | `export const MAX_PEEK_LINES = 400;` | out; round 37 broke a true anchor |

- Restored-but-false: 9 of 9 changed anchors. Group 7: 1 of 1.
- Overreverted (a true P value reverted to a base line lacking the symbol): 0 in group 7; 0 across all nine. No P value was true where its B line was false.
- Regressions (B true, round 37 moved the anchor onto a false line): rows 3, 6, 9. Not counted as overreversion, because the base line carries the symbol.

## Notice (line 2 of the note)
- Present: yes.
- Accurate: no.
  1. "Anchors in this note were reverted to the lines their 0614092 sentences named": false. `git diff 0614092` still shows 9 changed anchor values. Round 37 touched 4 (rows 2, 3, 6, 9), each moved away from its 0614092 value. Five (rows 1, 4, 5, 7, 8) are unchanged from round 36 (`git diff 5833351 5ceb8cd`).
  2. "because the round-36 shift-repair moved them one symbol off (spot-check D1)": cause supported. D1 (`corpus/lessons/round-36-verifier-spotcheck.md` lines 193-196) names this note. The spot-check describes "a systematic forward shift onto the next symbol" (line 77). Eight of nine W values equal the 0614092 value of the next anchor in document order (rows 2-9). Row 1 (287) matches no base anchor in the note.
  3. "treat line anchors here as at their base revision until then": misleading. The header names 964f443e as the measurement revision, and the note's wc table matches it (4714/507/510/614/325 lines). At 964f443e all nine B values are true (countActiveSparks 415, writeManifest 548, appearsToLaunchOpenCode 198, ...). The W values are false there too: 493 = loadObservations, 3762 = resumeMission, 31 = surfaceScriptDigest, 22 = MAX_PEEK_LINES, 27 = TMUX_TARGET, 49 = MAX_MANIFEST_BYTES, 73 = LOCK_TIMEOUT_MS, 202 = appearsToLaunchOmp, 287 = a registryRevision line. A reader who follows the notice trusts wrong lines at both revisions.
  4. "Re-verification against the pin is pending": accurate. The round-37 lesson says re-measurement is still owed (`corpus/lessons/round-37.md`, D1 bullet).

## Commands and output (abbreviated)
1. `git -C <lane> diff 0614092 -- corpus/knowledge/sighting-wall.md`: 12 insertions, 10 deletions. Anchor values as in the table.
2. `git -C <lane> diff 5833351 5ceb8cd -- corpus/knowledge/sighting-wall.md`: round 37 changed SESSION_NAME 23->27, appearsToLaunchOpenCode 198->202, DEFAULT_PEEK_LINES 20->22, resumeMissionLocked 3682->3762. It left 287, 49, 73, 493 and 31 unchanged.
3. Pin `observe.mjs`: `*415:export function countActiveSparks(env = process.env) {`, `*493:export function loadObservations(env = process.env) {`. Restored line 493 does not carry countActiveSparks.
4. Pin `surface.mjs` lines 12-36: 13 `const SURFACE_MODULE_PATHS = [`; 18 `];`; 20 `export const DEFAULT_PEEK_LINES = 80;`; 22 `export const MAX_PEEK_LINES = 400;`; 31 `export function surfaceScriptDigest() {`.
5. Pin `base.mjs`: 23 `SESSION_NAME`, 27 `TMUX_TARGET`, 41 `MANIFEST_SCHEMA`, 49 `MAX_MANIFEST_BYTES`; line 73 read: `export const LOCK_TIMEOUT_MS = 10_000;`.
6. Pin `argv.mjs`: 198 `appearsToLaunchOpenCode`, 202 `appearsToLaunchOmp`.
7. Pin `ufo-sighting.mjs`: 287 `value.registryRevision = normalizeRegistryRevision(...)`; 533 `function writeManifest`; 548 `fsyncSync(descriptor);`; 3682 `if (runId !== undefined && ...`; 3714 `function resumeMissionLocked`; 3762 `const nativeKey = nativeSessionKey(mission);`; 3794 `async function resumeMission`.
8. Copies of the 964f443e files: `/fast/scratch/kumitate-r37/AuditSighting7/rev964f/`. Line counts match the note's wc table. All nine B values are true; the W values are the next-symbol lines listed in Notice 3.

## Operable fix (not applied; for the integrator)
- Row 7 countActiveSparks: 493 -> 415. True at the pin and at 964f443e.
- Row 8 SURFACE span end: 31 -> 18 (`];`).
- Rows 3, 6, 9: back to 23, 198, 20. Rows 4 and 5: back to 41 and 49. All are true at the pin.
- Rows 1 and 2: the B values are false at the pin (upstream drift 964f443e -> 31c465f1). Restoring 0614092 values is not truth here. Pin lines are 533 (writeManifest) and 3714 (resumeMissionLocked). This needs re-anchoring, not restoration.
- Non-anchor: `surfaceErrors` (line 75) should get its code-span backtick back: `` `fail("CODE"` ``.

## Residual risk and gaps
- Outside the changed set: `resumeMission` (`:3762`) was moved 3361 -> 3762 by round 37, onto its 0614092 value. That value is false at the pin (`*3794:async function resumeMission(`; line 3762 is `const nativeKey = ...`) and true at 964f443e. Not counted here, because B->W does not change it.
- Not re-run: `scripts/claims-check.mjs --fidelity`. I make no claim about whether the gate flags these nine. The round-37 lesson cites FIDELITY CLEAN for this tree.
- Unchanged anchors (same as 0614092) were not audited; the item's universe is the changed set.
- Symbol-on-line checks are exact identifier matches on the pinned line (grep and read). No parser was run.
- Installs: none. Scratch: `/fast/scratch/kumitate-r37/AuditSighting7/`.
