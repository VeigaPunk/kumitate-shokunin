ATTACK S8 `scripts/land-fleet-run.mjs` re-anchored census section verdict=holds defects=0

Scope: the round-35 edit of the member section `## `scripts/land-fleet-run.mjs``
in corpus/knowledge/remaining-scripts-census.md (note lines 594-596), plus its
population-table row (line 138), its added-members list entry (line 428), and
every positional anchor the section names. All source reads through the pin
clone /fast/scratch/kumitate-r35/src; pin verified `git rev-parse HEAD` ->
31c465f15669f744848bd9f5d56191c5085670f7. No lane-tree edit, no git mutation.

Checks (command -> observed):

1. Heading exists: grep -n 'land-fleet-run' census -> rows 138, 428, 594, 596
   only. Section is exactly one heading + one sentence; no stale text.

2. Length claim "(133 L, tool)" vs pin:
   git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/land-fleet-run.mjs | wc -l
   -> 133. Matches. Top-level scripts/*.mjs, non-test -> kind `tool` holds.

3. History trace "(was 124 @ 964f443e)":
   git show 964f443e:scripts/land-fleet-run.mjs | wc -l -> 124. Trace accurate.

4. Original revision label kept: sentence still carries "re-censused 2026-10-14
   against origin HEAD `964f443e`" verbatim, plus new "re-anchored at 31c465f1
   (round 35)". Both labels present; nothing dropped.

5. Anchor `LandingError` at scripts/land-fleet-run.mjs:33 (at 31c465f1):
   sed -n '33p' -> `export class LandingError extends Error {`. Verbatim hit.
   (At 964f443e the same decl sits at :32 — old row confirmed before edit.)

6. Anchor `landFleetRun` at :53:
   sed -n '53p' -> `export function landFleetRun({ runRoot, target,
   expectedRemoteOid, dryRun = false, authorize = false, receiptPath,
   stateRoot = path.join(ROOT, ".ufo"), policy = readFleetPolicy() }) {`.
   Verbatim hit. (964f443e: :50, same signature.)

7. Export-set claim implicit in "Primary surface symbol / also": grep -n '^export'
   at 31c465f1 -> exactly 33 (LandingError) and 53 (landFleetRun). No third
   export; symbol inventory unchanged from 964f443e.

8. Population-table row: `| `scripts/land-fleet-run.mjs` | 133 | tool |` equals
   wc -l at 31c465f1 (133) and the section's own 133 L. Consistent, no drift
   between table row and section.

9. Removed clauses left a trace: the pre-round-35 section made no behavior
   claims (single sentence, two line refs), so the only removed content is the
   stale numbers, now traced by "(was 124 @ 964f443e)" — same convention as
   sibling re-anchored rows (e.g. line 637 "292 L, suite; was 253 @ 964f443e").
   Nothing removed is left unmentioned.

10. Removed-behavior hazard (wave-1 F2, scrubbed-git-env inversion): at 964f443e
    a local `scrubbed()` wrapped every git call; at 31c465f1 it is gone (grep
    'scrubbed' at 31c465f1: 4 hits, all import/usage of scrubbedGitEnvironment
    from prepare-ephemeral-l1.mjs; no `function scrubbed`). The new section
    text makes NO scrubbing/env claim, so no new false claim was introduced and
    none is silently stale. Flag for future re-census wording only, not a
    defect of this edit.

11. Cross-doc pollution: grep -rn 'land-fleet-run' corpus/knowledge/ -> only the
    census's own four rows. No other note cites this member's lines.
    `landFleetRun` at note line 637 belongs to `scripts/prepare-ephemeral-fleet.test.mjs:23`
    — verified verbatim: `import { landFleetRun } from "./land-fleet-run.mjs";`.
    Correct anchor to a different member's file; not a mis-citation.

12. Frozen-numstat cross-check: `git diff --numstat 964f443e 31c465f1 --
    scripts/land-fleet-run.mjs` -> `19 10`; frozen
    .ufo/waves/round-35/frozen/s-modified-members-55.tsv:16 = `+19/-10`. Match.
    Blob ids: 31c465f1 -> 26b94a973d086c8140050248828d399b5e048516,
    964f443e -> 86c3ecd9bf537e5ee6fc25bc4c875984b327a325; `git status --porcelain`
    on the clone path clean (PINOK).

13. Wave-1 input agreement: .ufo/waves/round-35/build/FidLandFleetRun.md
    proposed exactly this wording with anchors :33/:53 and 133 L; the integrated
    note matches and additionally keeps the historical count trace. ok=1
    moved=2 changed=0 gone=0 in that report is consistent with my
    re-verification.

Residual risk: none observed for this section. The section's only claims are
existence, kind, two line numbers, and two counts — all independently
reproduced at the pin. [INFERENCE] The wc -l convention (trailing newline)
is the same used by every sibling row, so 133/124 are directly comparable.

Tooling: nothing installed or upgraded (no need; all checks used git/sed/grep).
