FIDELITY scripts/prepare-ephemeral-fleet.mjs anchors=3 ok=1 moved=2 changed=0 gone=0

# C2 anchor-fidelity re-verification — `scripts/prepare-ephemeral-fleet.mjs`

Notes audited: `corpus/knowledge/remaining-scripts-census.md` (member section at note:611-613; member path rows at note:124-125, note:393-394 cite no line, so they are not line anchors).
Upstream diffs read only through `/fast/scratch/kumitate-r35/src` at `964f443e` (old) vs `31c465f1` (pinned).

## Rows for non-ok anchors

note:613 | `scripts/prepare-ephemeral-fleet.mjs:84` | `readFleetPolicy` (primary surface) | moved | `scripts/prepare-ephemeral-fleet.mjs:82` | Primary surface symbol `readFleetPolicy` at `scripts/prepare-ephemeral-fleet.mjs:82` (census revision origin HEAD `964f443e`; re-anchored at 31c465f1), unchanged body.

note:613 | `:219` (continuation, same member section) | `composeEphemeralFleet` | moved | `scripts/prepare-ephemeral-fleet.mjs:191` | also `composeEphemeralFleet` at `:191` (census revision origin HEAD `964f443e`; re-anchored at 31c465f1); signature and body unchanged.

## Ok anchor (for completeness)

note:611 | `## scripts/prepare-ephemeral-fleet.mjs` (member-section heading) | path is a live S8 member at the pinned revision (`git cat-file -e 31c465f1:scripts/prepare-ephemeral-fleet.mjs` -> present); heading text matches the path | ok | n/a | n/a.

## Evidence

- `git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/prepare-ephemeral-fleet.mjs`
  -> `1 file changed, 35 insertions(+), 35 deletions(-)` (matches the frozen +35/-35 census note).
- Line counts, `git show <rev>:scripts/prepare-ephemeral-fleet.mjs | wc -l`: old `482`, new `482` — the section's "482 L" size claim still holds exactly; "tool" kind unchanged; export list still leads with `ROOT`/`FLEET_POLICY_PATH`/`LIFECYCLE`, then `readFleetPolicy` as first function at both revisions, so "primary surface symbol" is intact.
- Old anchors: `grep -n 'export function readFleetPolicy|export function composeEphemeralFleet'` at `964f443e` -> `84:` and `219:` (both lines contain those exact declarations).
- New anchors: same grep at `31c465f1` -> `82:` and `191:`. New line 84 is the `lstatSync` regular-file/bound guard inside `readFleetPolicy` (`if (!info.isFile() || info.size > MAX_POLICY_BYTES) ...`), not the declaration; new line 219 is the run-repo remote-attestation throw inside `composeEphemeralFleet`. Both cited lines are therefore stale as symbol anchors.
- Cause of the shift: relocation, not deletion. The diff deletes the local helpers `writeAtomic` (old:112-116) and `readBounded` (old:119-135, 22-line fd/NOFOLLOW/bounded-read loop) and imports `isPlainObject, readBoundedFile, writeFileAtomic` from `./ufo-mission-result.mjs` at new:56 (net -26 lines above `readFleetPolicy`, -28 above `composeEphemeralFleet`).
- Claim text still true at 31c465f1: `readFleetPolicy` and `composeEphemeralFleet` are both still exported, with unchanged signatures and (for `readFleetPolicy`) an unchanged body apart from `plainObject` delegating to the shared `isPlainObject`.
- `isPlainObject` at `scripts/ufo-mission-result.mjs:138-140` is `value !== null && typeof value === "object" && !Array.isArray(value)` — identical to the replaced inline predicate, so no `readFleetPolicy` refusal semantics changed.

## Behavior deltas not described by the notes (no anchor claim is affected)

Diff `<artifact>`-verified at `31c465f1`; none of these is asserted in the member section, hence `changed=0`, but the census owner should know the member's internals moved:

- `readFleetManifest` (new:251) gained 26 lines of field validation (new:255-283, comment tagged F11): `createdAt`, nonempty `history[].state`/`.at`, `provenance.{sourceRoot,sourceHead,snapshotDigest}`, and `closure.{archive,receipt,archiveSha256}` are now typed refusals instead of late TypeErrors. The function is still exported at `:251`.
- `writeManifest` (new:289) now calls the imported `writeFileAtomic` instead of the deleted local `writeAtomic`; the shared writer (`scripts/ufo-mission-result.mjs:968`) adds `fsync`, staged-inode ownership check before rename, and directory fsync — stricter than the old behavior. No note text describes the writer.
- `projectHome` (new:128), `readFleetManifest` (new:252) and `verifyArchiveReceipt` (new:381) call `readBoundedFile`; same `O_NOFOLLOW`/`O_NONBLOCK`/regular-file/size-bound semantics, one message change (`"<label> is not a regular file"` vs `"<label> must be a regular file"`). No note text describes those messages.

## Commands run (all read-only)

```
git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/prepare-ephemeral-fleet.mjs
git -C /fast/scratch/kumitate-r35/src diff -U3 964f443e 31c465f1 -- scripts/prepare-ephemeral-fleet.mjs
git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/prepare-ephemeral-fleet.mjs | wc -l
git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/prepare-ephemeral-fleet.mjs | wc -l
git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/prepare-ephemeral-fleet.mjs | grep -n 'export function readFleetPolicy\|export function composeEphemeralFleet'
git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-mission-result.mjs | sed -n '138,140p;832,840p;968,990p'
grep -n 'prepare-ephemeral-fleet' corpus/knowledge/remaining-scripts-census.md
```

No files edited (read-only seat). No tools installed. Lane repo and jj/git state untouched.
