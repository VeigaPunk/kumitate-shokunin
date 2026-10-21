AUDIT Sighting5 anchors=1 false=1 overreverted=0 notice=bad verdict=refuted

Object audited: corpus/knowledge/sighting-wall.md at 5ceb8cd (identical blob at 86c0676), sha256 11ebf15264046a31c07717cfaeb65cd5c70d09e291f153051649dfc81e2f6909. This is the round-37 state with 9 changed anchors vs 0614092. The lane landed fdac52c, 5bc40d0 and later commits during the audit. §3 re-checks HEAD (ea63c4e; note sha256 638a206cd14197fc23f9a65fa736a3d9132edc98e51c6d6200812e20e9a4045f, unchanged since c589b38).
Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7 (read-only). `git status --porcelain -- scripts/ufo-sighting-lib scripts/ufo-sighting.mjs` is empty, so the tree matches HEAD for those files.
Scratch: /fast/scratch/kumitate-r37/AuditSighting5/{base.md,current.md,diff.patch}. No pin, lane, fleet, or host writes. No installs.

## 1. Population and group
9 changed anchors at 5ceb8cd vs 0614092, in document order (base → R37):

| # | symbol (file) | base | R37 |
|---|---|---|---|
| 1 | writeManifest (ufo-sighting.mjs) | :548 | :287 |
| 2 | resumeMissionLocked | :3682 | :3762 |
| 3 | SESSION_NAME (base.mjs) | :23 | :27 |
| 4 | MANIFEST_SCHEMA (base.mjs) | :41 | :49 |
| 5 | MAX_MANIFEST_BYTES (base.mjs) | :49 | :73 |
| 6 | appearsToLaunchOpenCode (argv.mjs) | :198 | :202 |
| 7 | countActiveSparks (observe.mjs) | :415 | :493 |
| 8 | SURFACE_MODULE_PATHS span end (surface.mjs) | :18 | :31 |
| 9 | DEFAULT_PEEK_LINES (surface.mjs) | :20 | :22 |

Non-anchor hunk: the `fail("CODE"` code span in surfaceErrors was unwrapped.
Group 5/8 = {#5} under the lane's floor split, group k = (floor((k−1)·9/8), floor(k·9/8)]. A numpy-style split gives {#6}; both are audited in §2. Header counts are the same under either split.
Binding: an anchor binds to the symbol immediately before it. Base writes it that way: `MAX_MANIFEST_BYTES = 1_048_576` is followed by `(:49)` on the next line.

## 2. Group table (audited object 5ceb8cd)

| # | symbol | base 0614092 (pin truth) | R36 5833351 | R37 5ceb8cd | pin line at R37 | result |
|---|---|---|---|---|---|---|
| 5 | MAX_MANIFEST_BYTES | :49, TRUE: base.mjs:49 `export const MAX_MANIFEST_BYTES = 1_048_576;` | :73 | :73 | FALSE: base.mjs:73 is `export const LOCK_TIMEOUT_MS = 10_000;` | restored-but-still-false. R37 kept the R36 shift and did not revert it. Overreverted: no (base is true). |
| alt 6 | appearsToLaunchOpenCode | :198, TRUE: argv.mjs:198 `export function appearsToLaunchOpenCode(` | :198 | :202 | FALSE: argv.mjs:202 is `export function appearsToLaunchOmp(` | restored-but-still-false. R37 moved a true anchor. Overreverted: no. |

## 3. HEAD re-check (ea63c4e; note bytes unchanged since c589b38)
- `git diff 0614092 --numstat -- corpus/knowledge/sighting-wall.md` gives `1 0`. Only the notice line differs, so changed anchors = 0.
- `git grep -n -A1 -e 'MAX_MANIFEST_BYTES = 1_048_576' HEAD`: line 141 `(base.mjs:41)`, line 142 `(:49); LOCK_TIMEOUT_MS … (:73)`. MAX_MANIFEST_BYTES = :49, TRUE at pin. Alt #6 :198 is TRUE.
- Group 5 holds at HEAD. The repair is the reset in 5bc40d0, not a per-anchor edit.

## 4. Round-37 notice
Text at 5ceb8cd, line 2: "> **Round-37 anchor-truth restoration (2026-10-21).** Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). Re-verification against the pin is pending; treat line anchors here as at their base revision until then."
- Present: yes.
- Accurate: no. notice=bad.
  - "reverted to the lines their 0614092 sentences named": false. `git diff 0614092 5ceb8cd` changes 9 of 9 anchors (§1). Group 5 is one of them: MAX_MANIFEST_BYTES was not reverted.
  - "moved them one symbol off": false for the anchors R37 itself moved. `git grep -n -e 'appearsToLaunchOpenCode` / ' -e 'DEFAULT_PEEK_LINES = 80' -e 'SESSION_NAME` /' 5833351` gives :198, :20, :23, all pin-true. The same grep at 5ceb8cd gives :202, :22, :27, all pin-false. R37 created these breaks; R36 did not.
  - "treat line anchors here as at their base revision": misleading. The file carries no base lines for the 9 changed anchors.
  - "spot-check D1": not opened by me.
- HEAD notice (line 2, ea63c4e): says the note is reset to 0614092 bytes and no anchor is a round-36 artifact. The byte claim is accurate (numstat 1 0). Its attribution list (AuditSighting2/3/4/6/7/8) is not verified by me. Scope: ok.

## 5. Overreverts outside group 5 (not in the 0614092-diff population)
A revert to base leaves no trace in the 0614092 diff, so no group's diff can see these. Each row: the R36 value was pin-true; the R37 value (= base) is pin-false, because the symbol is absent at the base line.

| anchor | R36 5833351 (pin) | R37 = base (pin) |
|---|---|---|
| spawnPaneForMission | :2239 TRUE `function spawnPaneForMission(` | :2225 FALSE (blank line) |
| completeMission | :3361 TRUE `function completeMission(` | :3339 FALSE (`  }`) |
| peekMission | :3576 TRUE `function peekMission(` | :3544 FALSE (`const { text, via } = readSteerText(options);`) |
| scheduleReconcile | :3604 TRUE `function scheduleReconcile(` | :3572 FALSE (`while (lines…`) |

HEAD keeps all four at base lines (false). I did not sweep the full R36→R37 hunk list (`git diff -U0 5833351 5ceb8cd`; 9 hunks were elided in my view, saved as artifact://21838). A note-wide sweep belongs to the groups covering the rest of the note.

## 6. Residual risk and gaps
- Only group 5 (or its alt #6) is verdicted here. The other eight groups belong to their auditors. §1 is my only cross-group input.
- Verdict scope: refuted applies to 5ceb8cd / 86c0676. HEAD passes this group.
- Binding: prev-first is the lane's rule. Under next-first, `(:73)` after MAX_MANIFEST_BYTES would attach to LOCK_TIMEOUT_MS (TRUE), and MAX_MANIFEST_BYTES would have no anchor of its own. The verdict is the same: the sentence's own symbol is not on the restored line. [INFERENCE from the rule; not run.]
- Pin truth used the pin working tree. Its git status for those files is clean. I did not run git hash-object.
- Header counts cover group 5 only. §5 lists four note-wide overreverts (verified, not exhaustive).

## 7. Commands and key output (abbreviated)
- `git diff 0614092 -- corpus/knowledge/sighting-wall.md` on the snapshot: 9 anchor hunks, the notice hunk, and one code-span hunk.
- `git show <rev>:corpus/knowledge/sighting-wall.md | sha256sum`: 5ceb8cd and 86c0676 = 11ebf152…; 5833351 = 24e5a65f…; HEAD = 638a206c….
- `git grep -n -A1 -e 'MAX_MANIFEST_BYTES = 1_048_576' <rev>`: 0614092 `(:49)`; 5833351 `(:73)`; 5ceb8cd `(:73)`; HEAD `(:49)`.
- `read` pin base.mjs:48-50,72-74: 49 `export const MAX_MANIFEST_BYTES = 1_048_576;`; 73 `export const LOCK_TIMEOUT_MS = 10_000;`.
- `_grep` pin scripts for countActiveSparks|loadObservations: observe.mjs 415 = countActiveSparks def; 493 = loadObservations def.
- `read` pin ufo-sighting.mjs at 2224-2226, 2238-2240, 3338-3340, 3360-3362, 3543-3545, 3571-3573, 3603-3605: 2225 blank; 2239 spawnPaneForMission; 3339 `}`; 3361 completeMission; 3544 readSteerText; 3572 `while (lines…`; 3604 scheduleReconcile.
