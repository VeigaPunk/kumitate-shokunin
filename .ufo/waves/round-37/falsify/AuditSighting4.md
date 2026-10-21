AUDIT Sighting4 anchors=2 false=2 overreverted=0 notice=bad verdict=refuted

# AuditSighting4: round-37 restoration of corpus/knowledge/sighting-wall.md, group 4/8

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Pin: /fast/scratch/kumitate-r36/src at 31c465f15669f744848bd9f5d56191c5085670f7 (`git rev-parse HEAD`; `git status --short` empty). Blobs: base 0614092 = f3e078a; pre-repair 91da27c6 = 584fba2; HEAD a5d627b = worktree = edcaaa4. The restoration is already committed (5ceb8cd), so the "uncommitted repair tree" premise is stale for this file. No lane writes, no subagents.

## Partition

`git diff 0614092 -- corpus/knowledge/sighting-wall.md` (zero-context) changes 9 anchor positions. In note order (working line):
1 writeManifest (104), 2 resumeMissionLocked (120), 3 SESSION_NAME (139), 4 MANIFEST_SCHEMA (142), 5 MAX_MANIFEST_BYTES (143), 6 appearsToLaunchOpenCode (164), 7 countActiveSparks (189), 8 surface range end (205), 9 DEFAULT_PEEK_LINES (208).

Eighth 4 of 9 covers positions 4–5 (fractional boundary; a floor split gives position 5 alone). Both are audited here. Positions 1–3 and 6–9 belong to other groups and are not verdicted in this report.

## Group verdicts

| # | Symbol | base 0614092 | pre 91da27c6 | restored (working) | pin @ base line | pin @ restored line | verdict |
|---|---|---|---|---|---|---|---|
| 4 | MANIFEST_SCHEMA | base.mjs:41 | :49 | :49 | :41 `export const MANIFEST_SCHEMA = "ufo-sighting-wall-v1";` (symbol present) | :49 `export const MAX_MANIFEST_BYTES = 1_048_576;` (symbol absent) | FALSE; not restored (round-36 value kept) |
| 5 | MAX_MANIFEST_BYTES | base.mjs:49 | :73 | :73 | :49 `export const MAX_MANIFEST_BYTES = 1_048_576;` (symbol present) | :73 `export const LOCK_TIMEOUT_MS = 10_000;` (symbol absent) | FALSE; not restored (round-36 value kept) |

- restored-but-still-false: 2. Both working values equal the pre-repair values, not the 0614092 values.
- overreverted: 0. Both base lines carry their symbol, so no true improvement was reverted. The round-36 values sit one symbol later than the true line (pre :49 is MAX_MANIFEST_BYTES's line; pre :73 is LOCK_TIMEOUT_MS's line). The repair simply never reached these two anchors.

## Commands and output

1. `git show 0614092:corpus/knowledge/sighting-wall.md | cat -n`
   L140 `(scripts/ufo-sighting-lib/base.mjs:41); MAX_MANIFEST_BYTES = 1_048_576`; L141 `(:49); LOCK_TIMEOUT_MS = 10_000 (:73); LOCK_STALE_MS (:75);`
2. `git show 91da27c6:corpus/knowledge/sighting-wall.md` (copy at /fast/scratch/kumitate-r37/AuditSighting4/head-91da27c6.md)
   L140 `(base.mjs:49); MAX_MANIFEST_BYTES`; L141 `(:73); LOCK_TIMEOUT_MS = 10_000 (:75)`.
3. `read corpus/knowledge/sighting-wall.md:139-145` (working)
   L142 `(scripts/ufo-sighting-lib/base.mjs:49); MAX_MANIFEST_BYTES = 1_048_576`; L143 `(:73); LOCK_TIMEOUT_MS = 10_000 (:73); LOCK_STALE_MS (:75);`
   The MANIFEST_SCHEMA anchor (:49) and the MAX_MANIFEST_BYTES anchor (:73) are unchanged from 91da27c6. The only change on this paragraph is LOCK_TIMEOUT_MS :75 to :73, which is base-correct.
4. `read scripts/ufo-sighting-lib/base.mjs:36-80` (pin)
   L41 `export const MANIFEST_SCHEMA = "ufo-sighting-wall-v1";` L49 `export const MAX_MANIFEST_BYTES = 1_048_576;` L73 `export const LOCK_TIMEOUT_MS = 10_000;` L75 `export const LOCK_STALE_MS = 30_000;`
5. `grep MANIFEST_SCHEMA|MAX_MANIFEST_BYTES|LOCK_TIMEOUT_MS|SESSION_NAME|TMUX_TARGET|APP_ID` in pin base.mjs
   MANIFEST_SCHEMA matches only :41; MAX_MANIFEST_BYTES only :49; LOCK_TIMEOUT_MS only :73.

## Notice (working L2; present in the HEAD blob)

Present, verbatim: `> **Round-37 anchor-truth restoration (2026-10-21).** Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). Re-verification against the pin is pending; ...`

Accuracy: BAD.

- "were reverted to the lines their 0614092 sentences named": false. `git diff 0614092` still shows 9 positions off base. Base / pre / working for all nine:

| # | anchor | base | pre | working | class |
|---|---|---|---|---|---|
| 1 | writeManifest | :548 | :287 | :287 | not reverted |
| 2 | resumeMissionLocked | :3682 | :3682 | :3762 | new value (in neither base nor pre) |
| 3 | SESSION_NAME | :23 | :23 | :27 | new value |
| 4 | MANIFEST_SCHEMA | :41 | :49 | :49 | not reverted |
| 5 | MAX_MANIFEST_BYTES | :49 | :73 | :73 | not reverted |
| 6 | appearsToLaunchOpenCode | :198 | :198 | :202 | new value |
| 7 | countActiveSparks | :415 | :493 | :493 | not reverted |
| 8 | surface.mjs range end | :18 | :31 | :31 | not reverted |
| 9 | DEFAULT_PEEK_LINES | :20 | :20 | :22 | new value |

- "treat line anchors here as at their base revision until then": misleading for rows 1–9, which are not at base.
- "because the round-36 shift-repair moved them one symbol off": accurate for rows 4–5. Not checked for the others.
- Unannounced residue, outside the anchor set: L208 `surfaceErrors` now reads `mines fail("CODE" literals`. Base had the code span `` `fail("CODE"` ``. Pre-repair already lacked the backtick, and the restoration left it.

## Limits

- Pin truth for rows 1–3 and 6–9 is not checked here (other groups).
- The notice's "spot-check D1" reference was not located.
- No tools installed or updated.
