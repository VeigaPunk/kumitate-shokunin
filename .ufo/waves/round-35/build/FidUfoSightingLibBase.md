FIDELITY scripts/ufo-sighting-lib/base.mjs anchors=19 ok=16 moved=0 changed=1 gone=2

# C2 anchor-fidelity re-verification — scripts/ufo-sighting-lib/base.mjs

Source pin: `/fast/scratch/kumitate-r35/src` detached at `31c465f1`; base revision `964f443e`.
Diff `964f443e..31c465f1`: `15 0 scripts/ufo-sighting-lib/base.mjs` (+15/-0). Hunks:
`@@ -169,0 +170,14 @@` (new `sighting.dispatch.queuePath` validation, new lines 170-183) and
`@@ -201,0 +216 @@` (`dispatchQueuePath` in the frozen config projection).
Line map: old 170-201 → new 184-215 (+14); old 202+ → +15. File length 507 → 522.
Count convention: distinct cited line anchors (16 in sighting-wall.md's own member
section, 3 in live-surface-probe.md); the `:181` anchor is cited twice (note lines 175
and 181) and judged once.

## Verified-ok anchors (16) — identical bytes at 964f443e and 31c465f1

- sighting-wall.md:126 → `:17` `ROOT`; `:19` `SHIM_PATH`.
- sighting-wall.md:127 → `:21` `MODULE_PATH`; `:23` `SESSION_NAME`; `:27` `TMUX_TARGET`.
- sighting-wall.md:128 → `:39` `APP_ID`.
- sighting-wall.md:131 → `:41` `MANIFEST_SCHEMA = "ufo-sighting-wall-v1"`.
- sighting-wall.md:132 → `:49` `MAX_MANIFEST_BYTES = 1_048_576`; `:73` `LOCK_TIMEOUT_MS = 10_000`; `:75` `LOCK_STALE_MS = 30_000`.
- sighting-wall.md:133 → `:63` `MAX_TEXT_BYTES = 4096`; `:65` `MAX_COMPLETED_MISSIONS = 50`.
- sighting-wall.md:134 → `:71` `DEFAULT_ATTACH_TIMEOUT_MS = 10_000`; `:77` `DISPLAY_REFRESH_LOCK_MS = 250`.
- sighting-wall.md:136 → `:105` `SightingError` (constructor `code` + optional `details`, `:106-111`).
- sighting-wall.md:137 → `:111` `emitFatal` "region" (caveat below).

All 16 sit at lines ≤121, far below the first insertion at 170; the diff cannot have
shifted them, and the numbered dumps confirm byte-identical text. Member-section heading
`## \`scripts/ufo-sighting-lib/base.mjs\`` (sighting-wall.md:121) still names a live
member; the role claim (`sighting-wall.md:123-124`, import-free leaf) still holds:
base.mjs imports only `node:crypto`/`node:fs`/`node:path`/`node:url` (`:5-15`), and
argv.mjs:20, observe.mjs:19, surface.mjs:11, ufo-sighting.mjs:27 import from it.

Caveat (not counted non-ok): `:111` is `}` closing the `SightingError` constructor at
both revisions; `export function emitFatal` is at `:116`. The note's "region" hedge is
accurate, but a precise anchor should be `:116`. `emitFatal` remains the entry's fatal
emitter (`scripts/ufo-sighting.mjs:27` import, `:4721 main().catch(emitFatal)` at 31c465f1).

## Non-ok anchors

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording
---|---|---|---|---|---
live-surface-probe.md:175,181 | `scripts/ufo-sighting-lib/base.mjs:181` | `UNEXPECTED_ERROR`; "assign the code in a ternary (`code: known ? error.code : "UNEXPECTED_ERROR"`)" | changed | `scripts/ufo-sighting-lib/base.mjs:131` (same at 964f443e and 31c465f1) | Measured 2026-09-28; re-anchored at 31c465f1: `scripts/ufo-sighting-lib/base.mjs:131` `UNEXPECTED_ERROR` (ternary in `emitFatal`); `:181` is a comment/queuePath guard, not this code.
live-surface-probe.md:176 | `scripts/ufo-sighting-lib/base.mjs:586` | `EFBIG` code literal | gone | n/a — file has 522 lines at 31c465f1 (507 at 964f443e); no `EFBIG` token anywhere in the member at either revision | Measured 2026-09-28; re-anchored at 31c465f1: `EFBIG` has no `code:` literal in this member (507→522 lines); drop this occurrence (measurement becomes 4 occurrences / 3 codes).
live-surface-probe.md:176 | `scripts/ufo-sighting-lib/base.mjs:588` | `EFBIG` code literal | gone | n/a — same as above | Measured 2026-09-28; re-anchored at 31c465f1: `EFBIG` has no `code:` literal in this member (507→522 lines); drop this occurrence (measurement becomes 4 occurrences / 3 codes).

Evidence for row 1: at 964f443e `base.mjs:181` is `// SESSION_NAME/WINDOW_INDEX and the
twin depth are hardcoded constants.`; at 31c465f1 `:181` is the newly inserted
`throw new Error("config/ufo.json sighting.dispatch.queuePath must stay under .ufo");`.
The ternary is at `:131` in both revisions, and the anchor is no more correct at the
base revision than at the pin — so this is a stale anchor the diff merely re-targeted
onto unrelated new code, not a pure shift. Directional correction: `131`.

Evidence for rows 2-3: `git show <rev>:...base.mjs | grep -n EFBIG` is empty at both
revisions; `git log --all -S EFBIG -- scripts/ufo-sighting-lib/base.mjs` is empty;
`wc -l` is 507/522. Lines 586/588 cannot exist. The live EFBIG `code:` literals at
31c465f1 are `scripts/ufo-mission-result.mjs:1214` and
`scripts/ufo-state-retention.mjs:206` (plus `:388`, `:414`); none is in this member.

## Supplementary findings (non-anchor claims in the four notes)

1. **sighting-wall.md:39 line-count table is pin-stale.** `| base.mjs | 507 |` is exactly
   right for the note's own header pin (`sighting-wall.md:3-4`, `964f443e`) and wrong at
   31c465f1: 522. Full re-measure at 31c465f1: `ufo-sighting.mjs` 4730, shim 95,
   `argv.mjs` 510, `base.mjs` 522, `observe.mjs` 614, `surface.mjs` 332, total **6803**
   (was 6765). Proposed wording: "| `scripts/ufo-sighting-lib/base.mjs` | 507 at
   964f443e / 522 re-anchored at 31c465f1 |".
2. **New behavior not described by any anchor.** `readProjectConfig()` now rejects a
   missing/non-string `sighting.dispatch.queuePath`, resolves it against `ROOT`, and
   throws unless it is `beneath` `ROOT/.ufo` (`base.mjs:170-183`), projecting
   `dispatchQueuePath` (`:216`). Consumed at `scripts/ufo-sighting.mjs:1544`
   (`if (SIGHTING_CONFIG.dispatchQueuePath) return ...`). `beneath` is declared at
   `base.mjs:360` (hoisted function declaration; call at `:180` is legal). The notes'
   base.mjs section describes no `readProjectConfig` contract at all, so nothing
   described was removed or changed by the diff — this is a coverage gap, not drift.
3. **live-surface-probe.md:22-26 (co-member sentence, surface.mjs not base.mjs).**
   "imports ONLY ... base.mjs constants (`:13`)" — the import line is `surface.mjs:11`;
   `:13` is `const SURFACE_MODULE_PATHS = [`. "its only `spawnSync` (`:401`)" — the call
   is `:319` at 964f443e and `:326` at 31c465f1 (plus the `:5` import). "every regular
   `*.mjs` under `scripts/ufo-sighting-lib/` (26)" — `SURFACE_MODULE_PATHS` is four
   explicit paths (`:13-18`) and surface.mjs has no `readdirSync`; lib holds 4 members
   at both revisions. "no wall.mjs / withOperationLock / writeFileSync" is confirmed
   (no matches). Flagged for the surface.mjs owner; out of my anchor set.
4. **live-surface-probe.md:175-182 measurement is stale beyond the two rows.**
   Pattern `/\bcode:[^,\n]*"([A-Z][A-Z0-9_]*)"/gu` over the wall family at 31c465f1
   yields **4 occurrences / 3 codes**: `base.mjs:131` UNEXPECTED_ERROR,
   `ufo-sighting.mjs:2010` RECONCILE_UNATTESTED_STOP, `ufo-sighting.mjs:2468`
   UNEXPECTED_ERROR, `ufo-sighting.mjs:4420` SPAWN_FAILED (964f443e: same four at
   1996/2454/4387). The other three cited members (`launch-verb.mjs:98`,
   `layout.mjs:440`, `pane-run.mjs:137`) do not exist at either revision — lib is
   argv/base/observe/surface only; sighting-wall.md:51-56 already records them as
   round-32 phantoms.
5. **Bare-path mentions, no line anchor (nothing to re-anchor).**
   `kimi-modes-machinery.md:502-503` cites base.mjs only as a cite-check suffix
   resolution artifact — still valid. `remaining-scripts-census.md:57` lists it in the
   S1–S7 heredoc; still a live member at 31c465f1. Its block still pins `964f443e` and
   `S_members = 91`, both superseded by the 31c465f1 re-census (88) — owned by the C2
   re-census item, not this one.

## Commands run (exact, output summarized)

- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-sighting-lib/base.mjs` → `15 +++...`, two hunks at `-169,0 +170,14` and `-201,0 +216`.
- `git show <rev>:scripts/ufo-sighting-lib/base.mjs | nl -ba | sed -n '14,80p;100,150p;170,200p;205,240p'` for both revs → the 16 ok anchors byte-identical; `:181` old=comment, new=queuePath throw; `:216` new=`dispatchQueuePath,`.
- `git show <rev>:... | wc -l` → 507 / 522.
- `git show <rev>:... | grep -n -E 'UNEXPECTED_ERROR|EFBIG|SightingError|emitFatal'` → UNEXPECTED_ERROR `:131` both; EFBIG none both.
- `git grep -n 'EFBIG|UNEXPECTED_ERROR' <rev> -- scripts/` → EFBIG only in ufo-mission-result/ufo-state-retention (and ufo-stale-watchdog at 964f443e, deleted at 31c465f1).
- `git diff --stat 964f443e 31c465f1 -- scripts/` → 69 files changed, 4568 insertions, 8700 deletions.
- `git ls-tree --name-only <rev> scripts/ufo-sighting-lib/` → argv, base, observe, surface (both revs).
- `git grep -n 'dispatchQueuePath|from "./base.mjs"' 31c465f1 -- scripts/` → base.mjs:174/179/180/216; ufo-sighting.mjs:1537/1544/1551; sibling imports argv:20, observe:19, surface:11.
- `git rev-parse --is-shallow-repository` → `true`.

## Remaining unknowns / limits

- The clone is **shallow** (`git rev-parse --is-shallow-repository` = true), so "EFBIG
  never appeared in base.mjs" and the `:181` provenance are proven only over reachable
  history; the max reachable length I found is 522, which already makes :586/:588
  impossible at the two pins.
- LSP was not used and would add nothing here: the evidence is git object bytes at two
  revisions, not workspace symbols, and the pinned revision is not checked out for a
  server to index (the only workspace file is at the lane revision). Recorded as
  deliberate fallback to `git show`/`grep`.
- No tools installed or upgraded; no package transactions.
- No other note in the four files carries a `:N-M` range or any other base.mjs line
  anchor beyond the 19 counted.
