FIDELITY scripts/prepare-ephemeral-fleet.test.mjs anchors=3 ok=3 moved=0 changed=0 gone=0

# Scope
Member `scripts/prepare-ephemeral-fleet.test.mjs`, upstream diff 964f443e..31c465f1 (+39/-0, one hunk at old :203). Notes: `corpus/knowledge/remaining-scripts-census.md` (read-only; not edited). Source read only through `/fast/scratch/kumitate-r35/src` per the binding pin.

# Anchors found (member-scoped)
| note:line | anchor | verdict |
|---|---|---|
| notes:615 | heading `## `scripts/prepare-ephemeral-fleet.test.mjs`` | ok |
| notes:617 | `composeEphemeralFleet` at `scripts/prepare-ephemeral-fleet.test.mjs:15` | ok |
| notes:617 | `landFleetRun` at `:23` (continuation anchor) | ok |

Non-ok rows: none.

# Commands and evidence
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/prepare-ephemeral-fleet.test.mjs`
  → `1 file changed, 39 insertions(+), 0 deletions(-)`, single hunk `@@ -203,6 +203,45 @@`. Pure insertion; zero deletions, so no cited line can have moved or had behavior removed at ≤:202. Full hunk retained as `artifact://119341`.
- `git show 964f443e:scripts/prepare-ephemeral-fleet.test.mjs | sed -n '13,25p'` vs same at 31c465f1 → byte-identical block:
  - line 15: `  composeEphemeralFleet,` (import member) — identical at both revisions.
  - line 23: `import { landFleetRun } from "./land-fleet-run.mjs";` — identical at both revisions.
- Line counts: 964f443e = 253; 31c465f1 = 292 (253 + 39, consistent with the declared +39/-0 and the frozen C2 population).
- `sed -n '615,618p'` on the notes → the member's own section is exactly notes:615-617; only continuation anchors `:15` and `:23` exist; no other `:N` or range anchor cites this member anywhere in the file (grep `prepare-ephemeral-fleet` → only notes:125, :394, :611/:613 [the sibling `.mjs` member, out of scope], :615, :617).

# Staleness observed (metadata, not line anchors; re-census input, not anchor failures)
1. note:125 (population table) `| 253 | suite |` → actual at 31c465f1 is **292 L**. Proposed: `292` with the row re-anchored at 31c465f1.
2. note:617 header text `Live S8 member (253 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`` → at 31c465f1 the member is **292 L**; the revision label `964f443e` remains accurate for the recorded 253 L census. Proposed replacement: `Live S8 member (292 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1`.
3. note:394 (changed-members list) — membership only; member still exists at 31c465f1, no action needed for fidelity.

# New surface at 31c465f1 not yet in the notes (informational for the re-census writer)
- `:206` `test("F11: a manifest missing consumer fields is a typed refusal, not a TypeError")` — deletes each of `createdAt|history|provenance|closure` from manifest.json and asserts `markFleetState` throws a typed non-TypeError `/fleet manifest/` refusal (new `markFleetState` callsites at :217).
- `:227` `test("F11: landing a run with a truncated manifest is a typed landing refusal, not a TypeError")` — asserts `landFleetRun` fails with `error.code === "landing_manifest_invalid"` (first appearance of that code in this member, at :237).
- Downstream tests shifted by +39 from old :206 (`test("destroy --force …")` now :245; OID-mismatch GATE now :264). No note anchor cites those lines, so no row required.

# Tooling
No tools installed or upgraded (none needed; read-only git + sed work only). No pacman transactions, no host mutations. Read-only seat: no files outside this report were written; notes untouched.

# Residual risk / verification gaps
- The `:15`/`:23` anchors are import-statement identities; they pin the symbols but the note's "Primary surface symbol" claim describes usage elsewhere (e.g. `composeEphemeralFleet` invoked at :70/:134, `landFleetRun` at :274 at 31c465f1). Those usage lines were never anchored in the notes, so there is nothing to re-verify — flagged as [INFERENCE] that the note intends import-site anchors, which hold exactly.
- Line-count claims (253→292) are metadata owned by the C2 re-census integrator (L1); this report only measures them.
