FIDELITY scripts/ufo-drills.mjs anchors=10 ok=3 moved=4 changed=1 gone=2

Scope: anchor-fidelity re-verification of `scripts/ufo-drills.mjs` claims in
corpus/knowledge/remaining-scripts-census.md and corpus/knowledge/member-claims-gate.md,
upstream diff 964f443e..31c465f1 (+10/−2; file 1726 → 1734 lines, verified `wc -l`).
Key baseline fact: NONE of the six `:N` body anchors pointed at their symbol at
964f443e either — `:4450`, `:4597`, `:4649` are out of bounds (file ≤1726 lines at base),
`:110`/`:232` hit blank lines at base, and `:264` was "live" only in the gate's
non-blank sense (a self-test helper line). The section therefore passed the
≥1-live-candidate rule at base with a semantically wrong anchor.
[INFERENCE] this section is one of the two drifted rows behind baseline S 86/88, and
its ~4xxx-line anchors date from a pre-shrink revision of the file.

## Non-ok anchors (7)

remaining-scripts-census.md:136 | `scripts/ufo-drills.mjs` | 1726 (population-table line count) | changed | table value → 1734 (file at 31c465f1 = 1734 lines) | `| \`scripts/ufo-drills.mjs\` | 1734 | tool |` — re-censused at 964f443e→31c465f1 (+10/−2), re-anchored at 31c465f1.
remaining-scripts-census.md:686 | `scripts/ufo-drills.mjs:4450` | `main` parses strict argv, drives suite | moved | scripts/ufo-drills.mjs:1561 (`function main()`; `parseArgs` :1518, `DRILLS_USAGE` :1507) | `` `main` (`scripts/ufo-drills.mjs:1561`) parses a strict argv (`--list`, `--only ID`, `--self-test`, `--help`) and drives the suite — re-censused at 964f443e; re-anchored at 31c465f1. ``
remaining-scripts-census.md:686 | `:264` | `EXECUTORS` closes six executors | moved | scripts/ufo-drills.mjs:107 (base :264 was a self-test helper line; EXECUTORS at base :99) | `Six executors are closed in `EXECUTORS` (`scripts/ufo-drills.mjs:107`) — same six-member set at 964f443e and 31c465f1; re-anchored at 31c465f1.`
remaining-scripts-census.md:686 | `:232` | shadow runs copy only the `SHADOW_PATHS` tree | moved | scripts/ufo-drills.mjs:76 (consumed at :519; base :232 blank, SHADOW_PATHS at base :68) | `shadow runs copy only the `SHADOW_PATHS` tree (`scripts/ufo-drills.mjs:76`, iterated at :519); re-censused at 964f443e; re-anchored at 31c465f1.`
remaining-scripts-census.md:686 | `:4597` | `wiredCount` suite-level coverage invariant refuses a full run | moved | scripts/ufo-drills.mjs:1696 (def; full-run-only breach checks :1705 pending, :1708 referenced; base def :1688) | `coverage invariant refuses a full run where pending/referenced outnumber `wiredCount` (`scripts/ufo-drills.mjs:1696`, checks :1705-1710); re-anchored at 31c465f1.`
remaining-scripts-census.md:686 | `:110` | `boundaryRefusal` maps escapes to typed `DRILLS_REFUSAL_SCHEMA` line | gone | scripts/ufo-drills.mjs:1727 (top-level try/catch; `DrillFormatError` class :171, `process.exit(2)` :1731) | `No `DRILLS_REFUSAL_SCHEMA` or `boundaryRefusal` exists at 964f443e or 31c465f1; the top-level catch maps `DrillFormatError` to exit 2 (`scripts/ufo-drills.mjs:1727`); re-anchored at 31c465f1.`
remaining-scripts-census.md:686 | `:4649` | anything else becomes `UNEXPECTED_ERROR` with exit 1 | gone | scripts/ufo-drills.mjs:1733 (`throw error;` → uncaught → exit 1) | `No `UNEXPECTED_ERROR` symbol exists at 964f443e or 31c465f1; other errors rethrow (`scripts/ufo-drills.mjs:1733`) and crash with exit 1 — no typed line; re-anchored at 31c465f1.`

## Ok anchors (3)

- remaining-scripts-census.md:684 — member-section heading `## \`scripts/ufo-drills.mjs\``: heading text unchanged; member file still resolves at 31c465f1.
- remaining-scripts-census.md:309 — heading citation inside the drop-one example transcript: example claims gate mechanics (MISSING_HEADING/BAD MISSING_SECTION), not upstream lines; member heading/file still present. ok.
- member-claims-gate.md:82 — heading citation in the rename-arm example: claims SECTION_FILE_UNRESOLVED behavior of claims-check; member file still resolves under --src at 31c465f1. ok.

Out-of-scope mentions (not anchors, not counted): census:314,318-320 are transcript output lines of the drop-one drill; census:379 is `scripts/ufo-drills.test.mjs` (different member); member-claims-gate.md:84-85 cite the renamed variant only.

## Behavior re-verified at 31c465f1 (claims that hold)

- Executes `drills/<id>.drill.json` (`drillsDir` :67), no OMP/OAuth/network, evidence under resolved root (`.ufo/drills` :72, usage text :1509-1513) — unchanged by the diff.
- Strict argv with fail-closed guards (`parseArgs` :1518; exclusive-flag guard :1555-1557) — unchanged.
- `EXECUTORS` :107 identical six-member set; wired-drill executor check :844.
- `SHADOW_PATHS` :76 content untouched by the diff; per-drill shadow copy semantics intact.
- Coverage invariant: `pending`/`referenced` > `wiredCount` breaches under full run only (`only === null` :1704) — unchanged.
- `DrillFormatError` keeps exit 2 (:1729-1731) — unchanged from base (identical tail at 964f443e:1715-1726).

## Diff-driven behavior changes flagged (no census claim depends on them)

- `ufoBin` (:61-64) now honors `UFO_CLI_BIN` (absolute or root-relative) before the CARGO_TARGET_DIR/target/debug/ufo fallback (mirrors self-iter.sh, F5). New behavior; census section makes no ufoBin claim.
- `fixturePath` (:73) moved `drills/fixtures/loop_specialist.py` → root `fixtures/loop_specialist.py`; comment states drills/fixtures/ no longer exists (F12). Census wording "deterministic fixture routes" makes no path claim — stays true.

## Commands run

- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-drills.mjs` → 2 hunks (ufoBin, fixturePath), +10/−2.
- `git show <rev>:scripts/ufo-drills.mjs | wc -l` → 1726 (964f443e), 1734 (31c465f1).
- `git show <rev>:… | grep -nE 'EXECUTORS|SHADOW_PATHS|wiredCount|…'` at both revisions → symbol homes above.
- `git show <rev>:… | sed -n '<N>p'` for cited lines 110/232/264/4450/4597/4649 at both revisions → base: blank, blank, helper text, OOB, OOB, OOB; pinned: comment, object-check, `const check = …`, OOB, OOB, OOB.
- Tail reads 1717-1734 (pinned) / 1709-1726 (base) → identical try/catch contract.

## Residual risk / gaps

- Other members' sections were not re-verified (out of scope); sections written in the same vintage as this one may hide the same live-but-wrong anchor pattern, since the gate's liveness rule accepts any non-blank resolving line.
- I did not run claims-check/proxy-check (gates are the executor's lane); the S 86/88 row attribution is [INFERENCE] from anchor arithmetic.
- No tool installs or updates were needed (tooling directive: nothing to record).
