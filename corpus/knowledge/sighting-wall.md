# S4 sighting wall — live membership at internals level
> **Round-37 anchor-truth restoration (2026-10-21).** Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). Re-verification against the pin is pending; treat line anchors here as at their base revision until then.


> **Round-35 fidelity notice (2026-10-20).** The upstream tree moved from
> `964f443e` to `31c465f1`. Round-35 fidelity seats found 22 line anchors in this
> note that no longer land on their claim at `31c465f1` (moved, changed or gone;
> several were already off at the revision their section names). Anchors below
> are true only at the revision each section states; the member sections still
> pass the claims gate, which checks anchor liveness, not symbol-on-line.
> Re-anchoring is queued (SCORECARD.md `## Limits`, round 35); per-anchor
> findings are in the lane's round-35 wave reports (build directory, Fid*).

**Family:** S4 (registry `SCORECARD.md`), sighting wall. **Measured at origin
HEAD `964f443e`** (`/home/vgpnk/Projects/ufo-fsd-alpha`). Live set is **6 of 6**
members named below, one `## \`scripts/…\`` section per member with ≥1 own-file
anchor and ≥1 verbatim symbol. Round-32 re-census (script-layer).

## Membership and measurement

```bash
# Exact live membership (origin tree)
{ printf '%s\n' scripts/ufo-sighting.mjs scripts/ufo-sighting
  find scripts/ufo-sighting-lib -type f
} | LC_ALL=C sort -u
```

Observed (6 paths):

```
scripts/ufo-sighting
scripts/ufo-sighting-lib/argv.mjs
scripts/ufo-sighting-lib/base.mjs
scripts/ufo-sighting-lib/observe.mjs
scripts/ufo-sighting-lib/surface.mjs
scripts/ufo-sighting.mjs
```

```bash
wc -l scripts/ufo-sighting.mjs scripts/ufo-sighting \
  scripts/ufo-sighting-lib/argv.mjs scripts/ufo-sighting-lib/base.mjs \
  scripts/ufo-sighting-lib/observe.mjs scripts/ufo-sighting-lib/surface.mjs
```

| Member | Live `wc -l` |
|---|---:|
| `scripts/ufo-sighting.mjs` | 4714 |
| `scripts/ufo-sighting` | 95 |
| `scripts/ufo-sighting-lib/argv.mjs` | 510 |
| `scripts/ufo-sighting-lib/base.mjs` | 507 |
| `scripts/ufo-sighting-lib/observe.mjs` | 614 |
| `scripts/ufo-sighting-lib/surface.mjs` | 325 |
| **total** | 6765 |

**Declared count the S4 registry row must carry:** **6** (parent owns the cell
rewrite). Frozen pre-restructure cell still read
`ufo-sighting.mjs` (396 L) + `ufo-sighting` (224 L bash) + `ufo-sighting-lib/`
(26 files / 10620 L) ⇒ **28** path members; live tree absorbed most of the lib
into the entry module and left four lib files.

### Round-32 removal record (lib phantoms — not member sections)

Pre-restructure `scripts/ufo-sighting-lib/` at `5725fa7d3` held **26** files.
Live lib at `964f443e` holds **4**. The **22** basenames present then and
absent now (recorded so they are never re-added as `##` member sections):

`display-overview.mjs`, `environment.mjs`, `launch-verb.mjs`, `layout.mjs`,
`mission-identity.mjs`, `options.mjs`, `pane-register.mjs`, `pane-run.mjs`,
`queue.mjs`, `resume-verb.mjs`, `runner-attach.mjs`, `spawn-pane.mjs`,
`status-verb.mjs`, `status-view.mjs`, `steer-peek.mjs`, `stop-restore.mjs`,
`twins.mjs`, `verbs-core.mjs`, `wall-display.mjs`, `wall-schema.mjs`,
`wall-verbs.mjs`, `wall.mjs`.

Command that produced the set:

```bash
comm -23 \
  <(git ls-tree -r --name-only 5725fa7d3 -- scripts/ufo-sighting-lib | sed 's|.*/||' | LC_ALL=C sort) \
  <(find scripts/ufo-sighting-lib -type f -printf '%f\n' | LC_ALL=C sort)
```

The prior note (`sighting-wall.md` pre-round-32) was **topic-form**: headings
were `## Module map`, `## Wall persistence`, `## Lifecycle internals`,
`## The display is an evidence projection, never telemetry`,
`## Boundary crossings (verified)`, `## Traps` — **zero** path-like
`## \`scripts/…\`` member sections. Those topic headings are replaced by the
six member sections below (not deleted as phantom members; they never claimed
a file path to the claims gate). Prose that cited the 22 deleted lib files as
if live (`wall.mjs:454`, `spawn-pane.mjs:9`, …) is retired with this rewrite;
lifecycle symbols now live primarily in `scripts/ufo-sighting.mjs`.

---

## `scripts/ufo-sighting.mjs`

**Role.** Primary wall implementation and CLI entry (Node). After the
restructure this file owns manifest I/O, the operation lock, pane lifecycle,
steer/peek, reconcile, and `main` dispatch. It imports the four remaining lib
modules for constants, argv preflight, observation, and surface projection.

**Manifest.** `validateManifest` (`scripts/ufo-sighting.mjs:279`) enforces
`MANIFEST_SCHEMA`, `ownerRoot === ROOT`, `target === TMUX_TARGET`, unique
mission/run/session/pane/sequence ids, and terminal shape. `writeManifest`
(`scripts/ufo-sighting.mjs:287`) bumps `registryRevision`, validates, refuses a
symlinked leaf, writes `wx` 0600 tmp → fsync → rename → chmod → dir fsync, and
fails `MANIFEST_TOO_LARGE` past `MAX_MANIFEST_BYTES`. `readManifest`
(`scripts/ufo-sighting.mjs:379`) is the bounded read path; `loadStatusView`
(`scripts/ufo-sighting.mjs:531`) is the status projection entry.

**Lock.** `acquireOperationLock` (`scripts/ufo-sighting.mjs:663`) seizes
`<stateDir>/operation.lock` as a directory + `owner.json` `wx`, with
`LOCK_TIMEOUT_MS` wait via `UFO_SIGHTING_LOCK_TIMEOUT_MS`.
`withOperationLock` (`scripts/ufo-sighting.mjs:781`) is the reentrant wrapper
every mutating verb uses.

**Lifecycle.** `spawnPaneForMission` (`scripts/ufo-sighting.mjs:2225`) is the
pane creator. `launchMissionLocked` / `launchMission`
(`scripts/ufo-sighting.mjs:2347`, `:2372`) own capacity → row → spawn.
`stopMission` (`scripts/ufo-sighting.mjs:3584`), `resumeMissionLocked` /
`resumeMission` (`:3762`, `:3762`), `completeMission` (`:3339`),
`reconcileLocked` (`:1976`), and `scheduleReconcile` (`:3572`, spawns
detached `__reconcile`) close the lifecycle set. Steer/peek:
`steerMission` (`:3511`), `peekMission` (`:3544`).

**CLI.** `main` (`scripts/ufo-sighting.mjs:4399`) dispatches verbs including
`__reconcile`, `surface` → `surfaceManifest()`, `launch`, `complete`, and the
remaining wall verbs; re-exports surface helpers at
`scripts/ufo-sighting.mjs:4714`.

Sources: `scripts/ufo-sighting.mjs`; deps `scripts/ufo-sighting-lib/{base,argv,observe,surface}.mjs`.

## `scripts/ufo-sighting-lib/base.mjs`

**Role.** Import-light shared constants, path anchors, and `SightingError`.
Deliberately the leaf other lib files and the entry import for identity.

**Paths / identity.** `ROOT` (`scripts/ufo-sighting-lib/base.mjs:17`),
`SHIM_PATH` (`:19`), `MODULE_PATH` (`:21`), `SESSION_NAME` /
`TMUX_TARGET` (`:27`, `:27`), `APP_ID` (`:39`).

**Schema and bounds.** `MANIFEST_SCHEMA = "ufo-sighting-wall-v1"`
(`scripts/ufo-sighting-lib/base.mjs:49`); `MAX_MANIFEST_BYTES = 1_048_576`
(`:73`); `LOCK_TIMEOUT_MS = 10_000` (`:73`); `LOCK_STALE_MS` (`:75`);
`MAX_TEXT_BYTES = 4096` (`:63`); `MAX_COMPLETED_MISSIONS = 50` (`:65`);
`DEFAULT_ATTACH_TIMEOUT_MS` (`:71`); `DISPLAY_REFRESH_LOCK_MS = 250` (`:77`).

**Errors.** `SightingError` (`scripts/ufo-sighting-lib/base.mjs:105`) carries
`code` + optional `details`; `emitFatal` (`:111` region) is the process-fatal
emitter used by the entry.

Sources: `scripts/ufo-sighting-lib/base.mjs`.

## `scripts/ufo-sighting-lib/argv.mjs`

**Role.** Dispatch attestation for OpenCode and OMP argv missions — shape
parsing, executable predicates, and preflight that refuses indirect shells.

**Parsing.** `optionValue` (`scripts/ufo-sighting-lib/argv.mjs:22`);
`parseOpenCodeArgv` (`:37`); `parseOmpArgv` (`:280`);
`attestedOmpSession` (`:366`).

**Predicates.** `resolvedExecutableName` (`:117`);
`isOpenCodeExecutable` (`:131`); `isOmpExecutable` (`:135`);
`appearsToLaunchOpenCode` / `appearsToLaunchOmp` (`:202`, `:202`);
`shellLaunches` (`:139`).

**Preflight.** `preflightArgvDispatch` (`scripts/ufo-sighting-lib/argv.mjs:455`)
validates argv, refuses `INDIRECT_OPENCODE_DISPATCH` /
`INDIRECT_OMP_DISPATCH`, checks substrate/executable pairing
(`OPENCODE_SUBSTRATE_MISMATCH`, `OMP_SUBSTRATE_MISMATCH`), then returns the
attested spec. Scratch roots: `DEFAULT_SCRATCH_ROOT` (`:206`),
`scratchSessionRoot` (`:208`).

Sources: `scripts/ufo-sighting-lib/argv.mjs`.

## `scripts/ufo-sighting-lib/observe.mjs`

**Role.** Evidence projection for status — OMP transcript structure, spark
census, and dispatcher `observations.json` — never pane scrollback as
telemetry.

**OMP transcripts.** `ompSessionsRoot` (`scripts/ufo-sighting-lib/observe.mjs:22`);
`missionOmpSessionDirectory` (`:35`); `collectTranscriptFiles` (`:56`);
`scanMissionTasks` (`:270`); `observeMissionTasks` (`:384`) returns
`KNOWN_ZERO` / `unavailable(…)` / structured evidence and is safe on malformed
argv dispatch.

**Sparks / observations.** `sparkStateRoot` (`:411`); `countActiveSparks`
(`:493`); `loadObservations` (`:493`) reads the sidecar under the wall state
dir.

**Status fold.** `levelStatus` (`scripts/ufo-sighting-lib/observe.mjs:561`)
builds `levels.l1/l2/l3` + `phaseCounts` via `derivePhaseCounts` (`:536`);
`statusPhase` (`:606`) maps mission `status` →
`queued|working|suspended|completed|unknown`.

Sources: `scripts/ufo-sighting-lib/observe.mjs`.

## `scripts/ufo-sighting-lib/surface.mjs`

**Role.** `surface --json` contract, usage text, and the script digest pin
consumers compare to `config/ufo.json` `sighting.surfaceDigest`.

**Digest set.** `SURFACE_MODULE_PATHS` lists the four live lib files
(`scripts/ufo-sighting-lib/surface.mjs:13`–`:31`). `surfaceScriptDigest`
(`:31`) hashes **shim + module + those four** in fixed order (not any single
file’s sha256). `SURFACE_KIND = "sighting-surface-v1"` (`:24`).
`DEFAULT_PEEK_LINES = 80` / `MAX_PEEK_LINES = 400` (`:22`, `:22`).

**Manifest / errors.** `surfaceErrors` (`:50`) mines fail("CODE" literals
from the entry + lib set; `surfaceManifest` (`:59`) emits `kind`,
`scriptDigest`, `digestInputs`, verb schemas, and exit map.
`runLegacyNativeDirect` (`:318`) re-enters the bash shim’s
`--ufo-sighting-native-direct` seam; `output` / `requireNoArgs` / `usage`
(`:310`, `:314`, `:294`) are the CLI helpers re-exported by the entry.

Sources: `scripts/ufo-sighting-lib/surface.mjs`.

## Boundary crossings (still true at HEAD `964f443e`)

- **dispatcher → wall:** shells `ufo-sighting.mjs launch|resume …` (and status
  reads); on nonzero launch exit shells `reconcile`. Queue ownership stays
  with `fleet-dispatcher.mjs` — the wall does not write `pending-work.json`.
- **native-trial → wall:** `handOffToSightingWall` in
  `run-omp-native-trial.mjs` still shells wall `launch` / detached `complete`;
  the wall writes nothing under `.ufo/native-trials/`.
- **retention:** completion may shell `ufo-state-retention.mjs` (S8 member;
  not an S4 member).
- **L0 watch** remains the other steer consumer (`ufo-l0-watch.mjs`, S6).

## Traps

- **"Live"** is still decided twice: persisted mission `status` and pane
  attestation; a live row with a dead/drifted pane is stale (logic now in
  `scripts/ufo-sighting.mjs`, not a separate `layout.mjs`).
- `null` / `opaque` / `unavailable` in observation fields mean evidence
  absent — never a fabricated `0` (`KNOWN_ZERO` is an explicit known empty).
- `surfaceScriptDigest` invalidates when **any** of shim, entry, or the four
  lib files change — editing a comment is enough.
- Argv executable predicates disclose filesystem shape; they are not
  authorization.

## Round-32 correction (appended): the bash shim is not an S-member

The section for `scripts/ufo-sighting` was removed from the member list. The shim
is a bash file: `LAYER_PATTERNS` counts `scripts/*.mjs` and files under
`scripts/<dir>/`, so the shim is **not** an `S_member`, while its `## ` section was
still counted `inFamily` by the claims gate. That made the section numerator one
larger than the member set (91 sections over 91 members, one of which was not a
member). Independent boundary re-enumeration measured the honest set: **S4 = 5
members**, S_members 91, S_sections 90 ⇒ `floor(10 × 90/91) = 9`. The earlier
`coverage:script-layer = 10` reading was one inflated section.
