FIDELITY scripts/land-fleet-run.mjs anchors=3 ok=1 moved=2 changed=0 gone=0

# C2 anchor-fidelity — `scripts/land-fleet-run.mjs`

Scoped to the one member. Notes file: `corpus/knowledge/remaining-scripts-census.md`
(read-only; not edited). Source read through the pin clone only:
`/fast/scratch/kumitate-r35/src` at `31c465f1`, base via `git show 964f443e:...`.

## Anchor inventory in the notes

| note:line | anchor form | symbol / claim (at 964f443e) | status at 31c465f1 |
|---|---|---|---|
| 556 | member-section heading `## \`scripts/land-fleet-run.mjs\`` | section exists | ok (file exists, 133 L) |
| 558 | `scripts/land-fleet-run.mjs:32` | `export class LandingError extends Error` | moved -> `:33` |
| 558 | continuation `:50` in same section | `export function landFleetRun(...)` | moved -> `:53` |

No `file:N-M` range anchors and no line anchors to this member outside its own
section: `grep -n "land-fleet-run\.mjs"` returns only 115 (census table row),
391 (added-members list), 556 (heading), 558 (symbols). Cross-doc check
(`grep -rn "scrubbed\|land-fleet-run\|landing_git_failed" corpus/knowledge/`
excluding the census) returned nothing, so no other note describes this member.

## Non-ok anchor rows

note:558 | `scripts/land-fleet-run.mjs:32` | `LandingError` (primary surface symbol) | moved | scripts/land-fleet-run.mjs:33 | `LandingError` at `scripts/land-fleet-run.mjs:33`; re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1.
note:558 | `:50` (continuation) | `landFleetRun` | moved | scripts/land-fleet-run.mjs:53 | also `landFleetRun` at `:53`; re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1.

Proposed whole-line replacement for note:558 (25 words):

> Live S8 member (133 L, tool) re-censused 2026-10-14 against origin HEAD
> `964f443e`, re-anchored at 31c465f1. Primary surface symbol `LandingError` at
> `scripts/land-fleet-run.mjs:33`; also `landFleetRun` at `:53`.

Both symbols still hold the same claim at the new lines: line 33 is still
`export class LandingError extends Error {` and line 53 is the identical
`export function landFleetRun({ runRoot, target, expectedRemoteOid, dryRun = false, authorize = false, receiptPath, stateRoot = path.join(ROOT, ".ufo"), policy = readFleetPolicy() })`
signature as at 964f443e:50. Exports are unchanged in set: exactly `LandingError`
and `landFleetRun` at both revisions (`grep -n '^export'`).

## Additional flags (described/census facts, not positional anchors)

F1 changed — stale length. Note:558 says `124 L`; table row 115 says `124`.
`git show 31c465f1:scripts/land-fleet-run.mjs | wc -l` = **133** (trailing
newline present; base = 124, matching the note). Both occurrences need `133`.
Diff numstat is exactly `19 10`, matching frozen
`.ufo/waves/round-35/frozen/s-modified-members-55.tsv:16` (`+19/-10`).

F2 changed — git environment policy inverted. At 964f443e:46-47 a local
`scrubbed()` helper was applied to every git call. At 31c465f1 the helper is
**gone** (`grep "function scrubbed"` = ABSENT); the module imports
`gitOutput, scrubbedGitEnvironment` from `prepare-ephemeral-l1.mjs` (31c465f1:28;
defs at `scripts/prepare-ephemeral-l1.mjs:178,214`). Default env is now the
operator's own — the push may use their credentials (31c465f1:44-46) — while
check-only calls (`rev-parse` at :73, `merge-base` at :89) pass
`scrubbedGitEnvironment()` explicitly. No sentence in the current note describes
scrubbing, so no cited claim is falsified; any future wording must not say
land-fleet-run unconditionally scrubs git env.

F3 changed — new error path. `readFleetManifest` failures are now wrapped as
`LandingError("landing_manifest_invalid", ...)` (31c465f1:57-63). The note does
not enumerate error codes, so no contradiction; only relevant if a re-census
expands the section.

F4 changed — `git()` now delegates to `gitOutput` and re-emits
`landing_git_failed` with the `git <sub> failed` prefix preserved
(31c465f1:41-51). Cosmetic; not cited by the note.

## Commands run (exact)

- `git -C /fast/scratch/kumitate-r35/src diff --numstat 964f443e 31c465f1 -- scripts/land-fleet-run.mjs` -> `19	10`
- `git show 964f443e:scripts/land-fleet-run.mjs | wc -l` -> `124`; same at `31c465f1` -> `133`
- `git rev-parse 964f443e:scripts/land-fleet-run.mjs` -> `86c3ecd9bf537e5ee6fc25bc4c875984b327a325`;
  `31c465f1` -> `26b94a973d086c8140050248828d399b5e048516`
- `git show <rev>:scripts/land-fleet-run.mjs | grep -n '^export'` -> 964f443e `32`, `50`; 31c465f1 `33`, `53`
- `git show <rev>:scripts/land-fleet-run.mjs | sed -n '32p;50p'` (964f443e) and `'33p;53p'` (31c465f1) -> symbols quoted above
- `grep -n "land-fleet-run\.mjs" corpus/knowledge/remaining-scripts-census.md` -> 115, 391, 556, 558
- `grep -rn "scrubbed\|gitOutput\|LandingError\|landFleetRun" corpus/knowledge/remaining-scripts-census.md` -> only 558 (member) and 617 (a `landFleetRun` use in `prepare-ephemeral-fleet.test.mjs`, a different member's own anchor, not a citation of this file)
- `git show 964f443e:scripts/land-fleet-run.mjs | grep -n "function scrubbed"` -> `46`; at 31c465f1 -> ABSENT
- `git show 31c465f1:scripts/prepare-ephemeral-l1.mjs | grep -n "export function gitOutput\|export function scrubbedGitEnvironment"` -> `178`, `214`

## Membership / kind

Still a `scripts/` top-level non-test `.mjs` -> kind `tool` holds; S8 is defined
as "everything else in the script-layer universe" (census:3-8), so membership
holds. Whole-file semantic re-census beyond the cited anchors was not performed
(out of scope for this ticket); 133 L is the only changed census fact in the
section. No tool was installed or upgraded.

Remaining unknowns: none for the three anchors. [INFERENCE] The `124 L` figures
in row 115 and line 558 were produced by the same `wc -l` convention, so both
must move together to `133`.
