R32 errors=2 fixable_append_only=2

# r32 DRIFT — round-gate round 32 (lane `kumitate`), read-only scout

Repo: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` @ `1770305fae20826b39905a8251ddeca6b4957ac4` (jj-colocated, not mutated).
Both requested forms produce the **same two errors**; neither needs history rewritten.

## Commands run (verbatim) and output

1) Full form:
```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/round-gate.mjs --round 32 \
  --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports \
  --main-repo /home/vgpnk/Projects/shokunin
ROUND_GATE  error  SCORECARD_ROW_MISSING  no table row starting "| 32 |" in /home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md
ROUND_GATE  error  LOG_ENTRY_MISSING  no "- YYYY-MM-DD — round 32" line in /home/vgpnk/Projects/shokunin/kumitate-shokunin/LOG.md
ROUND_GATE: DRIFT (round=32 lane=kumitate checks=10 errors=2 warnings=0)
EXIT=1
```

2) Lane-default form (no `--lane`/`--reports-dir`/`--main-repo`; defaults from `scripts/round-gate.mjs:14-17` are lane `kumitate`, reports `/home/vgpnk/Projects/shokunin/.ufo/reports`, main repo `/home/vgpnk/Projects/shokunin`):
```
node scripts/round-gate.mjs --round 32
ROUND_GATE  error  SCORECARD_ROW_MISSING  no table row starting "| 32 |" in …/SCORECARD.md
ROUND_GATE  error  LOG_ENTRY_MISSING  no "- YYYY-MM-DD — round 32" line in …/LOG.md
ROUND_GATE: DRIFT (round=32 lane=kumitate checks=10 errors=2 warnings=0)
EXIT=1
```
`--round 32 --lane kumitate` (explicit default) → byte-identical output, EXIT=1.
Bare `node scripts/round-gate.mjs` (no `--round`) does **not** audit 32: it resolves `latestClosedRound()` = max filed `round-<N>/kumitate.md` = **34** (`scripts/round-gate.mjs:621-624,650`) and prints `CLEAN (round=34 lane=kumitate checks=10 errors=0 warnings=0)` — the r32 drift is only visible when the round is named.

## Errors, evidence, and fixability

### E1 `SCORECARD_ROW_MISSING` — **fixable by additive row**
Check: `^\|\s*32\s*\|` over `SCORECARD.md` (`scripts/round-gate.mjs:401-406`, kind documented at `:81`).
- No such row exists now, and none ever existed: `grep -nE '^\|\s*32\s*\|' SCORECARD.md` → none; `git log --all --oneline -G '^\|\s*32\s*\|' -- SCORECARD.md` → empty. This is a never-written row, not a deleted one.
- The round record exists elsewhere, so a row is derivable without invention:
  - `SCORECARD.md:1517` `## Round 32 — executed (2026-10-14)` section (commit `1a162a4`, 21:27).
  - `LOG.md:1225` `## round 32 — OMP-era layer re-census … EXECUTED` (commit `c64b380`, 21:30:53).
  - Filed report `.ufo/reports/round-32/kumitate.md` (2256 B, 2+ headings, names round 32 — all report checks pass).
  - Round-work commit `5d250b468ecb764da2857e3ab8034ae3dc489b63`: stanza `S_members=91 S_sections=91 R_members=92 R_sections=75 coverage_script=10 coverage_runtime=8`; `## Axes` score cells 6→10 and 6→8.
- Fix shape: one new row in the `## Move log` table (`SCORECARD.md:391`), e.g.
  `| 32 | coverage:script-layer + coverage:runtime-layer | S 74/114, coverage 6; R 69/98, coverage 6 | S 91/91 → 10; R 75/92 → 8; `PROXY: MATCH`; registry cells S2/S4/S7/S8/R11 corrected | `LOG.md` round 32; 5d250b4; `.ufo/reports/round-32/kumitate.md` |`
  Candidate row verified against the live regex (`true`). Additive diff: 0 existing lines altered; no registry row (`^\| (S|R)\d+ \|`) is touched, so `C1`/`C1_total` parsing is unaffected.
- **Caveat that must be recorded with the row (why copying the prose section is wrong):** `SCORECARD.md:1519-1526` still says `S_sections 74→56`, `R_sections 69→63`, coverage `6→6/7→6`. That snapshot is from `1a162a4` **21:27**, i.e. before the wave's note work landed (`edfb9c5` 21:29, 10 notes changed) and before the stanza was re-bound (`5d250b4` 21:30). The adopted end state (91/75 → 10/8) is corroborated four ways: stanza+Axes at `5d250b4`, LOG `c64b380`, the filed report's before→after table, and the live Axes text `S_sections` **91** "round-32 measurement" (`SCORECARD.md:309`). A row that copied 56/63/6/6 would be false.
- The stale `## Round 32` prose is a **separate historical defect** (record left at a superseded intra-round snapshot). It is not a gate error; annotate it with an appended errata line, never edit the 2026-10-14 bytes.

### E2 `LOG_ENTRY_MISSING` — **fixable by additive bullet**
Check: `^- \d{4}-\d{2}-\d{2} — round 32\b` (em dash U+2014) over `LOG.md` (`scripts/round-gate.mjs:420-427`, kind at `:87`).
- Round 32's LOG record exists, in the wrong shape: `LOG.md:1225` is `## round 32 — …` and `LOG.md:1227` is `2026-10-14 · steered round 32 · …` (commit `c64b380`, 21:30:53). Neither is a `- DATE — round 32` bullet, so the gate misses it.
- Fix shape: one new bullet carrying the date already in the section (2026-10-14) and the section's own verdict facts (`LOG.md:1236-1245`): `- 2026-10-14 — round 32: OMP-era layer re-census executed; S 91/91 → coverage:script-layer 10, R 75/92 → coverage:runtime-layer 8; PROXY: MATCH; carried debt claims-check R11 anchors.`
  Candidate verified against the live regex (`true`); ASCII-hyphen variant correctly fails (`false`). Additive diff: 0 existing lines altered. Best placed at the head of the existing `## round 32` section to keep chronological order; an EOF append also satisfies the regex but lands after round-35 text, out of order.

## Classification
- **E1** fixable append-only (new Move-log row, sourced from `5d250b4` + `c64b380` + filed report; must flag the superseded 56/63 snapshot).
- **E2** fixable append-only (new bullet, sourced from the existing `## round 32` section).
- No r32 gate error requires rewriting history or editing a filed artifact. The only thing that **must stay** as recorded history is the superseded 56/63 intra-round snapshot at `SCORECARD.md:1519-1526` (and the `5d250b4` Axes explanatory text that still read `74/114` while the score cell said 10 — already corrected at HEAD `SCORECARD.md:309`); both are errata-note material, not deletions.

## Commands used as evidence (read-only)
`node scripts/round-gate.mjs --round 32 …` (both forms) · `node scripts/round-gate.mjs` (bare) · `grep -nE '^\|\s*32\s*\|' SCORECARD.md` · `git log --all --oneline -G '^\|\s*32\s*\|' -- SCORECARD.md` · `git log -S'round 32' -- LOG.md` · `git blame -L 1517,1526 SCORECARD.md`, `-L 1225,1240 LOG.md` · `git show 5d250b4 -- SCORECARD.md` · `git show --stat edfb9c5` · `node -e` regex probe of the two candidate lines.

## Remaining unknowns
- [INFERENCE] The two additions flip the verdict to `CLEAN (round=32 … errors=0)`: not executed end-to-end because this seat is read-only. Both regexes were executed against the candidate lines and return `true`; the other 8 reported checks already pass, so no new finding is implied.
- Not run (not assigned): `proxy-check.mjs`, `claims-check.mjs`, round-gate `--selftest`.
- Tooling: none installed or upgraded.
