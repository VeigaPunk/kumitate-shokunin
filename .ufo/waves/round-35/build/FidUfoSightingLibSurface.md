FIDELITY scripts/ufo-sighting-lib/surface.mjs anchors=18 ok=9 moved=9 changed=0 gone=0

# C2 anchor-fidelity — scripts/ufo-sighting-lib/surface.mjs (964f443e → 31c465f1)

## Diff shape (ground truth)
`git -C /fast/scratch/kumitate-r35/src diff -U0 964f443e 31c465f1 -- scripts/ufo-sighting-lib/surface.mjs`:
- `@@ -229,0 +230,7 @@` — 7 added lines inside `surfaceManifest()`'s twin verb entry (`idempotent: false`, `states: { live, non_live, twin_exists, depth }`), pin `:230-236`.
- `@@ -266 +273 @@` — twin `USAGE_LINES` line gains `--title/--geometry/--runner-reservation`, base `:266` → pin `:273`.
- Nothing before base `:229` changed; every line ≥ base `:230` shifts **+7**. File 325 → 332 lines. Nothing removed.

## Anchor inventory (anchors = line-anchored cites + member-section heading + census membership row)
Counting: wall 11 line anchors + 1 heading; probe 5 line anchors; census 1 membership row ⇒ 18. ok=9, moved=9, changed=0, gone=0.

## Non-ok rows (one per stale anchor)
note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording
--- | --- | --- | --- | --- | ---
sighting-wall.md:202 | `:318` | `runLegacyNativeDirect` re-enters shim native-direct seam | moved | scripts/ufo-sighting-lib/surface.mjs:325 | "`runLegacyNativeDirect` (`:318` at origin HEAD `964f443e`, re-anchored at 31c465f1 to `:325`) re-enters the bash shim's `--ufo-sighting-native-direct` seam."
sighting-wall.md:204 | `:310` | `output` CLI helper | moved | scripts/ufo-sighting-lib/surface.mjs:317 | "`output` (`:310` at origin HEAD `964f443e`, re-anchored at 31c465f1 to `:317`) — unchanged helper re-exported by the entry."
sighting-wall.md:204 | `:314` | `requireNoArgs` CLI helper | moved | scripts/ufo-sighting-lib/surface.mjs:321 | "`requireNoArgs` (`:314` at origin HEAD `964f443e`, re-anchored at 31c465f1 to `:321`) — unchanged helper re-exported by the entry."
sighting-wall.md:204 | `:294` | `usage` CLI helper | moved | scripts/ufo-sighting-lib/surface.mjs:301 | "`usage` (`:294` at origin HEAD `964f443e`, re-anchored at 31c465f1 to `:301`) — unchanged helper re-exported by the entry."
live-surface-probe.md:22 | `:13` | imports ONLY `base.mjs` constants | moved | scripts/ufo-sighting-lib/surface.mjs:11 | "imports ONLY `scripts/ufo-sighting-lib/base.mjs` constants (`:11`; `:13` at origin HEAD `964f443e` was already `SURFACE_MODULE_PATHS`) — re-anchored at 31c465f1."
live-surface-probe.md:25 | `:401` | only `spawnSync` is the legacy native-direct path | moved | scripts/ufo-sighting-lib/surface.mjs:326 | "its only `spawnSync` call (`:326`; `:401` at origin HEAD `964f443e`, pre-split monolith numbering) is the legacy native-direct path — re-anchored at 31c465f1."
live-surface-probe.md:59 | `:43-58` | concatenated-byte digest derivation | moved | scripts/ufo-sighting-lib/surface.mjs:36-46 | "concatenated-BYTES digest derivation is `surfaceScriptDigest` `:36-46` (`:43-58` at origin HEAD `964f443e` was already stale) — re-anchored at 31c465f1."
live-surface-probe.md:72 | `:60-69` | `fail("CODE"` mining set | moved | scripts/ufo-sighting-lib/surface.mjs:48-57 | "`FAIL_CODE_PATTERN` mining lives at `:48-57` (`:60-69` at origin HEAD `964f443e` was already `surfaceManifest`) — re-anchored at 31c465f1."
live-surface-probe.md:118 | `:43-58` | table: `manifest.scriptDigest` home | moved | scripts/ufo-sighting-lib/surface.mjs:36-46 | "home cell `scripts/ufo-sighting-lib/surface.mjs:36-46` (`:43-58` at origin HEAD `964f443e` stale) — re-anchored at 31c465f1."

## Ok anchors (9) — verified identical bytes at 31c465f1
- sighting-wall.md:188 heading `## scripts/ufo-sighting-lib/surface.mjs` — path live at pin (332 L).
- sighting-wall.md:194 `:13`–`:18` `SURFACE_MODULE_PATHS` four lib files — pin `:13-18` byte-identical; lib dir holds exactly 4 `.mjs` at both revs (`git ls-tree`).
- sighting-wall.md:194 `:31` `surfaceScriptDigest` — pin `:31` unchanged.
- sighting-wall.md:196 `:24` `SURFACE_KIND` — pin `:24` unchanged.
- sighting-wall.md:197 `:20` / `:22` `DEFAULT_PEEK_LINES`/`MAX_PEEK_LINES` — unchanged.
- sighting-wall.md:199 `:50` `surfaceErrors` — pin `:50` unchanged.
- sighting-wall.md:200 `:59` `surfaceManifest` — pin `:59` unchanged.
- remaining-scripts-census.md:59 membership row — `scripts/ufo-sighting-lib/surface.mjs` still an S8 member at pin (S1–S7 live 28 list does not own it; S8 stays 60).

## Changed-behavior sweep (removed/changed despite surviving lines)
None in scope. The diff only ADDS twin manifest fields (`idempotent`/`states`, pin `:230-236`) and widens the twin usage line (`:273`). No note anchor describes the twin verb's manifest entry or usage flags, so no described behavior was removed or altered. Wall prose ("surfaceScriptDigest invalidates when any of shim, entry, or the four lib files change", sighting-wall.md:236) remains true — function untouched. [INFERENCE] The probe's five mispoints predate the round-32 lib extraction (they align with the pre-split `ufo-sighting.mjs` monolith numbering: `:401` exceeds even base surface.mjs EOF of 325); they were already stale at 964f443e, not broken by the advance to 31c465f1.

## Commands run
1. `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-sighting-lib/surface.mjs` → 9 +- lines, hunks at :227/:263 (context) = :229/:266 (-U0).
2. `git ... show {964f443e,31c465f1}:scripts/ufo-sighting-lib/surface.mjs | wc -l` → 325 / 332.
3. `git ... show <rev> | grep -n -E 'spawnSync|SURFACE_MODULE_PATHS|surfaceScriptDigest|SURFACE_KIND|DEFAULT_PEEK_LINES|surfaceErrors|surfaceManifest|runLegacyNativeDirect|USAGE_LINES|^export function'` at both revs → symbol map above.
4. `git ... show 964f443e:... | cat -n | sed -n '10,70p'` and `285,325p`; same for 31c465f1 `10,70p` / `285,332p` → line-level byte comparison.
5. `git ... show 31c465f1:... | ls-tree` of `scripts/ufo-sighting-lib/` → 4 `.mjs` both revs (argv, base, observe, surface).
6. grep of the three notes for `surface\.mjs` and `surface\.mjs:[0-9]` → complete anchor census (no unlisted anchors; census has no `## surface.mjs` member section).

## Tooling
No tools installed or upgraded (none needed; pacman paused host-wide, respected).

## Notes
- Read-only: no note or lane file edited; report file only.
- Probe note's claims remain semantically true at pin (imports-from-base-only, single spawnSync, digest semantics) — only line pointers need repair; wall's four trailing helper anchors are pure +7 shifts from this diff.
