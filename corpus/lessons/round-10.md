# round 10 — the round-close contract, executable

Axis move: **operability** (lowest, 6). Frozen proxy `f_O = (A + C) / (A + C + 3)`
(`SCORECARD.md`), A = runnable artifacts with a documented invocation and a
verdict exit, C = `SKILL.md` GFM task items naming a runnable command that
`node scripts/surface-probe.mjs --checklists` actually executes.

| Term | Before (r9 close) | After (r10) | Command |
|---|---|---|---|
| A | 2 (`cite-check.mjs`, `surface-probe.mjs`) | **3** (+ `round-gate.mjs`) | `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` → 3 |
| C | 4 | **6** | `grep -c '^\s*- \[' SKILL.md` → 6; executed: `surface-probe.mjs --checklists` → `CHECKLIST: 6/6 pass`, exit 0 |
| `f_O` ⇒ score | 6/9 ⇒ 6 | **9/12 = 0.75 ⇒ 7** | `floor(10 × f_O)` |

## What landed

`scripts/round-gate.mjs` (contract `kumitate-round-gate-v1`, zero deps,
node ≥20, the round-10 revision — 1226 L, its sha recorded in `LOG.md` round 10;
round 11 added the
`--tracked` mode and a −3 L simplifier pass, so the tool is now 1426 L with a
57-case suite and a sha pinned in `SCORECARD.md`'s claim block; see
`corpus/lessons/round-11.md`): audit mode re-derives this lane's own round
record — report present / ≥1024 B / ≥2 `#` headings / names its round / carries
a `SHONEN` heading, cited commit tokens resolve (lane → main repo → origin) and
stay ancestors of lane `HEAD`, a `SCORECARD.md` row, a `LOG.md` entry, a
`round-<N>` commit marker (11 kinds: 9 error, 2 warning); `--close` adds the
close-only trio (clean tree, nothing unpushed, report tracked *and* pushed in the
main repo); 5 fail-closed arms; exit 0/1/2/64; `--json`; 49-case hermetic suite
(temp dirs, pinned git identity, no network). Docs: `SKILL.md` (2 checklist
items + a Working-rules bullet + a `ROUND_GATE: DRIFT` paragraph),
`corpus/knowledge/round-close-gate.md`, `corpus/README.md` rows, this lesson.

## Why the axis was not gamed

Round 9's scorecard offered two candidate moves and said (a) — a third live
surface in `surface-probe.mjs` — *raises no proxy term* and saturates operability
at 6. The move taken is (b): the checklist widened to the round-close gates a
lane must actually run. The proxy was **not** re-chartered, and the honest
scoring consequence is recorded: 6 → 7, not 8, because `(A+C)/(A+C+3)` needs
`A+C ≥ 12` for 0.8. Reaching 8 means more *real* executed items or a scheduled
leg, not a redefinition.

## Claims falsified inside the round (calibration record)

1. **"Never reads the origin tree"** — my own frozen spec, falsified by the
   cited-hash check. The lane's real reports cite origin-tree shas
   (`.ufo/reports/round-9/kumitate.md` cites `ee907f1cf`, which resolves only
   there), so the
   rule would have produced a false `COMMIT_CITED_UNRESOLVED`. Repair: a lazy
   `--origin` (default `$UFO_SRC`) consulted only for tokens unresolved in the
   lane and main repos. Both sibling gates already read the origin tree; the
   clean-room claim was the wrong instinct for a check derived from
   `PROTOCOL.md:263-265`.
2. **The audit duplicates protocol-lane authority** (critic O1) — *partly*
   falsified. `PROTOCOL.md:263-267` makes cited-commit existence + ancestry and
   the `SHONEN` heading the integrator's step 1; the gate runs the same
   invariants as a lane-local pre-check on this lane's own artifacts only, and
   `REPORT_SHONEN_MISSING` is warning-class so no fleet grade is asserted. The
   disagreeing-labels objection is real and kept as a documented split verdict:
   `.ufo/reports/round-7/kumitate.md` is 122 B — protocol grades `ok` with a
   minimum-content defect (`PROTOCOL.md:210-213`), this gate raises
   `REPORT_THIN` + `REPORT_HEADINGS`. Neither is wrong; the questions differ.
3. **"Watchdog line 44 is blank"** (executor deviation note) — false.
   `scripts/shokunin-watchdog.sh:44` is
   `report_of() { [ -f "$SK/.ufo/reports/round-$2/$1.md" ]; }`. The docblock's
   `scripts/shokunin-watchdog.sh:41-46` range is correct anyway; the claim was
   not carried into a document.
4. **A citation baseline measured outside the fleet is invalid.** Running
   `cite-check.mjs` in a throwaway clone under `/tmp` at `d65aa24` reported
   `errors=13 warnings=52`; in place the same tree reports `errors=2
   warnings=52`. Cause: `FLEET_MISSING` — refs to main-repo files
   (`PROTOCOL.md`, `MISSION.md`, `AXES.md`, `ROADMAP.md`, …) resolve at the
   fleet rung, the parent of the repo, which does not exist under `/tmp`. The
   valid method: move the *new file* aside and re-run in place. Measured
   round-10 delta: `files=36 tokens=2324 errors=2 warnings=52` →
   `files=37 tokens=2415 errors=2 warnings=52` — one more scanned doc, zero new
   errors, zero net warnings; both errors are the pre-existing aggregator-owned
   `LINE_OOR` rows in `corpus/lessons/round-6-aggregator-audit.md`.
5. **`SCORECARD.md` move-log rows do not exist for rounds 1–7** (reviewer claim
   C2, verified 8×2 / 9×2 only). Consequence: for those rounds
   `SCORECARD_ROW_MISSING` is a *true* finding, not a false positive; the
   default audit is unaffected because it pins the latest closed round.
6. **`REPORT_UNTRACKED` fired on this lane's own round-9 report** — a true
   positive: `.ufo/reports/round-9/kumitate.md` was never committed in the main
   repo (`git ls-files --error-unmatch …` → exit 1). Repaired at round close by
   committing that path with the round-10 report; the finding was *found by the
   round's own new gate*, which is the strongest evidence the move was worth
   making.

## Limits (recorded, not hidden)

- **A round that filed no report is invisible to audit mode.** `--round`
  defaults to the latest *existing* report for the lane; the loop-exit case is
  why `--round N` exists. The default is a regression tripwire, not a monitor.
- The 1024-byte and 2-heading thresholds are **this lane's** frozen bar, not
  fleet law (planner census: no normative clause for either); only the citation
  checks and the `SHONEN` heading trace to written protocol.
- Warnings never gate without `--strict`; 5 of the 11 audit kinds are
  conventions this lane chose to hold itself to.
- Coverage unchanged at 7 (C1 14/18 families, C2 36/36 rows/files after this
  round's two rows); S6/S7/R10/R11 still have no internals note.
- `--close` cannot be green mid-round by construction, so it is documented and
  demonstrated but deliberately not a checklist item.