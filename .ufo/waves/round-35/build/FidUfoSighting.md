FIDELITY scripts/ufo-sighting.mjs anchors=22 ok=2 moved=20 changed=0 gone=0

Scope: every anchor in the four named notes that cites `scripts/ufo-sighting.mjs`
(19 in `sighting-wall.md`'s own `## ` section, 2 in `live-surface-probe.md`), the
member-section heading, judged against 964f443e → 31c465f1. `anchors=22` includes
the heading (`sighting-wall.md:83`); `ok=2` = heading + `validateManifest:279`
(identical line and identical body: the diff's first hunk starts at old/new 376,
so lines 1-375 are unchanged). No anchor's described behavior was removed; the
diff only shifted declarations (net +16 lines), plus the undescribed deltas below.

| note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording |
|---|---|---|---|---|---|
| sighting-wall.md:93 | scripts/ufo-sighting.mjs:548 | writeManifest: bumps registryRevision, validates, refuses symlinked leaf, wx 0600 tmp→fsync→rename→chmod→dir fsync, MANIFEST_TOO_LARGE | moved | scripts/ufo-sighting.mjs:533 | `writeManifest` (`scripts/ufo-sighting.mjs:533`); original 964f443e:548, re-anchored at 31c465f1:533 — same registryRevision/symlink/0600/MANIFEST_TOO_LARGE behavior. |
| sighting-wall.md:96 | scripts/ufo-sighting.mjs:379 | readManifest: bounded read path | moved | scripts/ufo-sighting.mjs:423 | `readManifest` (`scripts/ufo-sighting.mjs:423`); original 964f443e:379, re-anchored at 31c465f1:423 — bounded via `readManifestFile` (:382). |
| sighting-wall.md:97 | scripts/ufo-sighting.mjs:531 | loadStatusView: status projection entry | moved | scripts/ufo-sighting.mjs:516 | `loadStatusView` (`scripts/ufo-sighting.mjs:516`); original 964f443e:531, re-anchored at 31c465f1:516 — still the status projection entry. |
| sighting-wall.md:99 | scripts/ufo-sighting.mjs:663 | acquireOperationLock: operation.lock dir + owner.json wx, LOCK_TIMEOUT_MS via UFO_SIGHTING_LOCK_TIMEOUT_MS | moved | scripts/ufo-sighting.mjs:648 | `acquireOperationLock` (`scripts/ufo-sighting.mjs:648`); original 964f443e:663, re-anchored at 31c465f1:648 — directory + owner.json `wx`, same timeout env. |
| sighting-wall.md:102 | scripts/ufo-sighting.mjs:781 | withOperationLock: reentrant wrapper every mutating verb uses | moved | scripts/ufo-sighting.mjs:767 | `withOperationLock` (`scripts/ufo-sighting.mjs:767`); original 964f443e:781, re-anchored at 31c465f1:767 — reentrant, 15 occurrences (1 declaration + 14 calls) in both revisions. |
| sighting-wall.md:105 | scripts/ufo-sighting.mjs:2225 | spawnPaneForMission: pane creator | moved | scripts/ufo-sighting.mjs:2239 | `spawnPaneForMission` (`scripts/ufo-sighting.mjs:2239`); original 964f443e:2225, re-anchored at 31c465f1:2239 — still the pane creator. |
| sighting-wall.md:107 | scripts/ufo-sighting.mjs:2347 | launchMissionLocked: capacity → row → spawn | moved | scripts/ufo-sighting.mjs:2361 | `launchMissionLocked` (`scripts/ufo-sighting.mjs:2361`); original 964f443e:2347, re-anchored at 31c465f1:2361 — unchanged capacity→row→spawn. |
| sighting-wall.md:107 | scripts/ufo-sighting.mjs:2372 | launchMission | moved | scripts/ufo-sighting.mjs:2386 | `launchMission` (`scripts/ufo-sighting.mjs:2386`); original 964f443e:2372, re-anchored at 31c465f1:2386 — unchanged lifecycle entry. |
| sighting-wall.md:108 | scripts/ufo-sighting.mjs:3584 | stopMission | moved | scripts/ufo-sighting.mjs:3616 | `stopMission` (`scripts/ufo-sighting.mjs:3616`); original 964f443e:3584, re-anchored at 31c465f1:3616 — unchanged stop. |
| sighting-wall.md:109 | :3682 | resumeMissionLocked | moved | scripts/ufo-sighting.mjs:3714 | `resumeMissionLocked` (`scripts/ufo-sighting.mjs:3714`); original 964f443e:3682, re-anchored at 31c465f1:3714. |
| sighting-wall.md:109 | :3762 | resumeMission | moved | scripts/ufo-sighting.mjs:3794 | `resumeMission` (`scripts/ufo-sighting.mjs:3794`); original 964f443e:3762, re-anchored at 31c465f1:3794. |
| sighting-wall.md:109 | :3339 | completeMission | moved | scripts/ufo-sighting.mjs:3361 | `completeMission` (`scripts/ufo-sighting.mjs:3361`); original 964f443e:3339, re-anchored at 31c465f1:3361. |
| sighting-wall.md:110 | :1976 | reconcileLocked | moved | scripts/ufo-sighting.mjs:1991 | `reconcileLocked` (`scripts/ufo-sighting.mjs:1991`); original 964f443e:1976, re-anchored at 31c465f1:1991 — predicate extracted to `paneAttestsMission`. |
| sighting-wall.md:110 | :3572 | scheduleReconcile: spawns detached __reconcile | moved | scripts/ufo-sighting.mjs:3604 | `scheduleReconcile` (`scripts/ufo-sighting.mjs:3604`); original 964f443e:3572, re-anchored at 31c465f1:3604 — still spawns detached `__reconcile`. |
| sighting-wall.md:112 | :3511 | steerMission | moved | scripts/ufo-sighting.mjs:3543 | `steerMission` (`scripts/ufo-sighting.mjs:3543`); original 964f443e:3511, re-anchored at 31c465f1:3543. |
| sighting-wall.md:112 | :3544 | peekMission | moved | scripts/ufo-sighting.mjs:3576 | `peekMission` (`scripts/ufo-sighting.mjs:3576`); original 964f443e:3544, re-anchored at 31c465f1:3576. |
| sighting-wall.md:114 | scripts/ufo-sighting.mjs:4399 | main dispatches __reconcile, surface→surfaceManifest(), launch, complete | moved | scripts/ufo-sighting.mjs:4432 | `main` (`scripts/ufo-sighting.mjs:4432`); original 964f443e:4399, re-anchored at 31c465f1:4432 — same __reconcile/surface/launch/complete dispatch. |
| sighting-wall.md:117 | scripts/ufo-sighting.mjs:4714 | re-exports surface helpers | moved | scripts/ufo-sighting.mjs:4730 | surface re-exports (`scripts/ufo-sighting.mjs:4730`); original 964f443e:4714, re-anchored at 31c465f1:4730 (block 4725-4730). |
| live-surface-probe.md:20 | scripts/ufo-sighting.mjs:88-95 | surface dispatch: --json REQUIRED, body surfaceManifest() then output() | moved | scripts/ufo-sighting.mjs:4484-4493 | surface dispatch (`scripts/ufo-sighting.mjs:4484-4493`); at 964f443e it was 4451-4460, never :88-95; re-anchored at 31c465f1:4484-4493. |
| live-surface-probe.md:205 | scripts/ufo-sighting.mjs:88-95 | surface --json: no pane, no lock, no marker path | moved | scripts/ufo-sighting.mjs:4484-4493 | `surface --json` clause (`scripts/ufo-sighting.mjs:4484-4493`); at 964f443e it was 4451-4460, never :88-95; re-anchored at 31c465f1:4484-4493. |

**Ok anchors (no row):** `sighting-wall.md:83` `## \`scripts/ufo-sighting.mjs\`` still
the correct member heading (file present, 4730 L at 31c465f1); `sighting-wall.md:90`
`validateManifest` at `scripts/ufo-sighting.mjs:279` — same line both revisions,
byte-identical body (first diff hunk is at 376).

**The :88-95 anchor is wrong at BOTH pinned revisions, not merely moved.**
`git show <rev>:scripts/ufo-sighting.mjs | sed -n '88,95p'` at 964f443e and 31c465f1
returns the same `loadMissionEnvironment` lines (`lstatSync`, `assertPrivateOwned`,
`EPHEMERAL_POLICY.maxEnvironmentBytes`). The surface clause is `main`'s
`if (command === "surface")` at 4451-4460 (964f443e) / 4484-4493 (31c465f1):
`if (options.json !== true) fail("INVALID_ARGUMENT", "surface requires --json"); output(surfaceManifest());`.
`[INFERENCE]` the writer conflated a stale pre-restructure line number; history
search found no committed revision with surface at :88 (nearest ancestors: 5993 L,
clause at 5740; 4714 L, clause at 4451).

**Behavioral deltas in the diff (none are described by any of the four notes, so
no anchor flips to `changed`):**
- `completeMission` no longer captures pane content: `mission.completedCapture = null;`
  (31c465f1:3388; "S-11: no raw pane-tail persistence") and completes manifest-only
  when no tmux session is live (`if (sessionLive)` at :3411).
- `main`'s `overview` verb no longer self-marks/binds the pane; the deleted block
  (`OVERVIEW_MARKER`, `bindOverviewPane`, `select-pane -T`) is replaced by the
  comment at :4513 ("Every overview pane is created and marked by ensureOverviewPane").
- `acquireOperationLock` adds stale-lock quarantine sweep/restore (:627, :650);
  `readStatusView` now tightens the status-cache dir mode. Neither contradicts a note claim.
- `reconcileLocked`'s old inline pane-attestation predicate is now `paneAttestsMission`;
  default-argument behavior is equivalent.

**Adjacent drift seen while checking (outside this member's anchor set; for the
re-census scribe):** `live-surface-probe.md:19` cites `scripts/ufo-sighting:224`,
but the shim is 95 L at both pinned revisions (final `exec node ... "$@"` at :95).
`live-surface-probe.md:27` says surface reads "every regular `*.mjs` ... (26)";
both revisions read an explicit four-path `SURFACE_MODULE_PATHS` array
(`surface.mjs:13-18`) over a 4-file lib. `sighting-wall.md:36` records
`ufo-sighting.mjs` 4714 L — true for its 964f443e label, but 4730 L at 31c465f1.
Also verified live claims with no line anchor: all 12 declared verbs still have
`command ===` clauses (`launch`:4571, `complete`:4664, `surface`:4484) and the
`resolveTrigger` guard survives at :1185; `withOperationLock` is 15 occurrences
(1 declaration + 14 call sites) in both revisions.

**Commands (exact):**
- `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`
- `git diff --stat 964f443e 31c465f1 -- scripts/ufo-sighting.mjs` → `233 insertions(+), 217 deletions(-)`
- `git show <rev>:scripts/ufo-sighting.mjs | grep -nE '^function (validateManifest|writeManifest|readManifest|loadStatusView|acquireOperationLock|withOperationLock|spawnPaneForMission|launchMissionLocked|stopMission|resumeMissionLocked|completeMission|reconcileLocked|scheduleReconcile|steerMission|peekMission)|^async function (launchMission|resumeMission)|^export (async )?function (main|validateManifest)'`
  → 964f443e: 279,379,531,548,663,781,1976,2225,2347,2372,3339,3511,3544,3572,3584,3682,3762,4399
  → 31c465f1: 279,423,516,533,648,767,1991,2239,2361,2386,3361,3543,3576,3604,3616,3714,3794,4432
- `git show <rev>:scripts/ufo-sighting.mjs | sed -n '88,95p'` (both revs) → `loadMissionEnvironment` body
- `git show <rev>:scripts/ufo-sighting.mjs | sed -n '4451,4460p'` / `'4484,4493p'` → surface clause
- `git show 964f443e:scripts/ufo-sighting.mjs | sed -n '4709,4714p'`; `git show 31c465f1:scripts/ufo-sighting.mjs | tail -8` → surface re-export line 4714 → 4730
- `git ls-tree -r --name-only 31c465f1 -- scripts/ufo-sighting-lib` → 4 files (argv, base, observe, surface)
- `git log --all --format=%h -- scripts/ufo-sighting.mjs` line search → no revision with surface clause at :88

Read-only: no note was edited; only this report was written. No tool installs were
needed. No secrets read. Residual unknown: whether the `:88-95` figure came from a
tree outside this clone (pre-restructure 396-L module is not an object here).
