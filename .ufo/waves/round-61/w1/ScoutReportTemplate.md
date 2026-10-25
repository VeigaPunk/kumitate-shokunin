# ScoutReportTemplate — round 61 w1 (scout, operability, milestone: report format recon)

Deliverable: `.ufo/waves/round-61/build/ScoutReportTemplate/report-format.md`.

## Observed
- The r57–r60 fleet reports share this section order: Work performed, Landed changes,
  Before → after measurements, Sources & frontier, Trend verdicts, SHONEN. r58–r60 add
  Stale-lane and Open L0 questions; r58 alone has Wave evidence and Inherited-file
  dispositions. Exact strings are in report-format.md §1.
- None of the four has `## Per-axis verdicts` or a `## Round shape` heading:
  `grep -c '^## Per-axis verdicts'` = 0 and `grep -c '^## Round shape'` = 0 in each, and
  `FLOOR|spawned total` count = 0. Round shape was an unheaded `Round shape:` paragraph
  (r58 line 3, r59 line 3, r60 line 7). The round-61 report is the first to meet Q22/Q23
  (`corpus/QUALITY.md:243-301`).
- Q22 table format: `| axis | verdict | claims | basis |`, the five SCORECARD axes
  (operability, coverage, coverage:script-layer, coverage:runtime-layer,
  coverage:kimi-layer), followed by `counted claims=<n>`. Q23 format: `WAVE kumitate-r61-w1
  payload=32 spawned=… returned=… dead=… gate=…`, a `FLOOR wave1 spawned …` line and
  `spawned total=<n> (<=128)`. `.wave` and `counts.spawn` come from `w1-dispatch.json`.
- The watchdog enforces only a SHONEN marker, at least 400 bytes, and the Sources & frontier
  heading regex (`scripts/shokunin-watchdog.sh:140-160,311`). Section order is not
  machine-checked.

## Defect found (load-bearing for the L1)
- **Q22's axis-diff command, as written (QUALITY.md:263), fails on a correct report.** Its
  SCORECARD extractor reads prose lines 372–379 inside `## Axes` that contain literal `|`
  and emits `js`, `grep -cE`, `js`. On a scratch fixture with the correct five-row table the
  diff printed `5,7d4 < grep -cE < js < js`, exit 1. A table-rows-only variant
  (`f&&/^\|/&&…`) printed nothing, exit 0. Fix options: re-word SCORECARD:378–379 with no
  pipe, or amend Q22's extractor with a lesson.

## Dry runs (scratch `/tmp/kumitate-r61/ScoutReportTemplate/`)
- On the correct fixture, the Q22 claim diff exits 0, the count prints 2, the Q23 wave check
  prints `ok kumitate-r61-w1`, and the FLOOR/total count prints 2.
- These mutants fail the checks:
  - `WAVE w1` prints `MISSING kumitate-r61-w1`;
  - bulleted `- FLOOR` makes the count 0;
  - the axis cell `operability (C1)` makes the axis diff exit 1;
  - `C3` in a basis cell makes the claim diff exit 1.

## Inference / unresolved
- [INFERENCE] Putting `## Round shape` before `## Work performed` is safe because order is
  not enforced and r58 inserted an extra section without a logged defect.
- The r61 spawned, returned and dead counts are not derivable yet: at write time `w1/` held
  13 seat reports and `swarm-registry.json`, with no launcher progress or
  `dispatch-actual.json`. The template leaves them as `<n>`.

Tool installs: none. `/home/vgpnk/.omp/agent/RULES.md` not needed (no install).
`skill://godspeed` was not found: there is no `godspeed` entry under `~/.omp/agent/skills/`
and no matching `SKILL.md` under `~/.omp`. The posture text in the task was followed.
