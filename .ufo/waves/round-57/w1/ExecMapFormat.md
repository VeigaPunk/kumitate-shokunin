# ExecMapFormat — round 57 w1

## Item
Mutation-test the `format-unmapped` arm of the `readme-map` gate (contract
`kumitate-readme-map-v1`): in a scratch copy of the round-57 tip, add a README row whose first
cell is `knowledge/stray.md` **without backticks** (corpus-shaped but unparseable) and capture
`DRIFT format-unmapped` exit 1. Axes: operability, coverage.

## Verdict — CORROBORATED (exact reproduction at the tip)
Scored revision `8c6f5b017d149b18134917378cdbed3b492d8e89` (lane HEAD, unmoved; `git archive`
extraction, committed bytes only). Node v24.21.0.

Mutant run, full stdout and exit code:

```
$ node scripts/readme-map.mjs
README_MAP: DRIFT files=135 rows=135 covered=135 bad=1 first=format-unmapped:knowledge/stray.md
exit=1
```

A byte-identical rerun reproduced it (`mutant-rerun.txt`). The do-nothing control on the same
extraction read `README_MAP: CLEAN files=135 rows=135 covered=135` exit 0, and the hermetic
suite read `case format-unmapped: PASS` / `README_MAP_SELFTEST: PASS (14/14)` / `VERDICT: PASS`
exit 0. No production byte was touched.

## Mutation (exact bytes)
`corpus/README.md` in `scratch-mutant/`, one line inserted immediately after the table
separator (line 16):

```
| knowledge/stray.md | scratch mutation: corpus-shaped first cell, no backticks (unparseable as a map row) | none |
```

`mutant.diff` (unified, control vs mutant) is a single `+` hunk at `@@ -13,6 +13,7 @@`.
Mutated README sha256 `c702f34d9e65a2c97b76a38a1293b2c3691634e4cbde58b08786c86817de9afc`;
unmutated committed README sha256 `7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d`;
gate `scripts/readme-map.mjs` sha256 `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`
(identical in the lane worktree, HEAD and every extraction); registry
`.ufo/pins/readme-map.json` sha256 `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c`.
No `knowledge/stray.md` file exists in the mutant tree, so the finding cannot be an
`orphan-row`/`uncovered` artefact.

## Arm semantics, read from the gate source (lines 130–140)
- a line is a map row only if it matches `/^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/`;
- otherwise, if its first cell matches `/^\s*`?(knowledge|lessons)\//`, it is pushed as
  `format-unmapped:<cell trimmed to 80 chars>` (`readme-map.mjs:138`);
- `evaluate` places those parse findings first in `bad`, then structural findings; `emit`
  prints `bad[0]` as `first=` and `bad[1..]` as `README_MAP: note …`; DRIFT exits 1.

## Controls (falsification, all measured on the same extraction)
| Tree | Mutation | Result | Exit |
|---|---|---|---|
| `scratch-control` | none | `CLEAN files=135 rows=135 covered=135` | 0 |
| `scratch-mutant` | bare `knowledge/stray.md` row (the item) | `DRIFT … bad=1 first=format-unmapped:knowledge/stray.md` | 1 |
| `scratch-discriminator` | same cell **with** backticks, file absent | `DRIFT files=135 rows=136 covered=135 bad=1 first=orphan-row:knowledge/stray.md` | 1 |
| `scratch-realistic` | backticks dropped on the live `knowledge/worker-heartbeat-liveness.md` row | `note uncovered:knowledge/worker-heartbeat-liveness.md` then `DRIFT files=135 rows=134 covered=135 bad=2 first=format-unmapped:knowledge/worker-heartbeat-liveness.md` | 1 |
| `scratch-boundary` | benign first cell `knowledge base` (no slash) | `CLEAN files=135 rows=135 covered=135` | 0 |

What each control rules out:
- **Not vacuous / not pre-existing drift.** The control at the identical rev is CLEAN, and the
  mutant differs only by `bad=1`; the three counters are numerically identical to the control.
- **Format is the discriminating axis, not the missing file.** The discriminator names the same
  non-existent path but backticked: it parses as a row, so the gate reports `orphan-row` and
  never `format-unmapped` (and `rows` rises to 136). The mutant's finding therefore comes from
  the absent backticks.
- **The arm is not count-redundant.** With the stray unparseable row, `files/rows/covered` stay
  `135/135/135` — identical to CLEAN. Plan §C1 records that the prior `proxy-check` C2 term
  compared row+file *counts* (declared 132 vs computed 133); a count comparison would read no
  change here while the README carries a corpus-shaped row. That count claim is plan-cited, not
  re-measured by this seat; the equal-stats observation is mine.
- **Realistic regression is caught, with both findings.** Dropping backticks from a live row
  yields `format-unmapped` first plus the `uncovered` note (rows drop to 134), so the gate
  names both the malformed row and the file left effectively unrowed.
- **False-positive boundary holds.** A row whose first cell merely starts with the word
  `knowledge` but has no namespace slash stays CLEAN; benign non-map rows are not flagged.
- **Scope.** At this rev `corpus/README.md` has exactly one table (single separator at line 15;
  headings at 1/12/173/262), so "README row" is unambiguous here. The scanner is README-wide
  over lines starting with `|`, not section-scoped.

## Retained evidence (`build/ExecMapFormat/`)
`EVIDENCE.md` (index), `control-run.txt`, `control-selftest.txt`, `mutant-run.txt`,
`mutant-rerun.txt`, `mutant.diff`, `discriminator-run.txt`, `boundary-run.txt`,
`realistic-run.txt`, `scratch-sha256.txt`, `mutated-sha256.txt`, `arm-source-lines.txt`,
`readme-header-lines.txt`, `rev.txt`, `completed-at.txt`, `lane-production-status.txt`, and the
five extraction trees `scratch-{control,mutant,discriminator,boundary,realistic}/`.
Every run file contains the literal command, its stdout/stderr and `exit=`.

## Lane integrity
`git -C <lane> status --porcelain -- corpus scripts .ufo/pins` → 0 lines; HEAD still
`8c6f5b017d149b18134917378cdbed3b492d8e89`; lane worktree `corpus/README.md` still
`7575614…` and `scripts/readme-map.mjs` still `058e503…`. No commits, no mutating git/jj, no
touches outside `build/ExecMapFormat/` and this report; extractions contain no `.git`.

## Risks / limits
1. The mutant's `knowledge/stray.md` does not exist; that isolates the arm to a single finding
   (good for signal purity) but the real-file form is covered by `scratch-realistic`, which
   yields the same first finding plus `uncovered`.
2. `format-unmapped:<cell>` truncates the trimmed cell to 80 chars (`readme-map.mjs:138`), so a
   very long unparseable row is identifiable but not byte-complete in the message.
3. [INFERENCE] A line beginning with `|` inside a fenced code block whose first cell looks
   corpus-shaped would also be flagged — the scanner is line-based with no fence awareness. No
   such line exists at this rev (one table only); not measured.
4. Count-blindness of the C2 comparison is plan-cited, not independently re-run here; this
   seat did not execute `proxy-check`.
5. Evidence covers committed bytes at `8c6f5b0…` only; an uncommitted lane edit after this run
   would not be covered (at writing time, production paths matched HEAD).

## Ops
No installs or updates (none needed). No pacman, no network, no subagents.
