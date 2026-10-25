# ExecReadmeMapFix — round 61, wave w1 (R60-V8 repair)

Milestone: R60-V8 repair. Judged on: coverage. Leaf seat; no subagent or labrat dispatched; no tools installed.

## Files changed

- `corpus/README.md` — one row added directly after the `lessons/round-60.md` row:
  `| `lessons/round-60-verifier-spotcheck.md` | Round-60 non-author closure … Row added in round 61 (R60-V8) … | `.ufo/reports/round-60/kumitate.md`; lane tip `a745a3b0` at the spot-check; commit `3304337` |`
  (same shape as the round-58/59 verifier-spotcheck rows; content derived from the file's §2 axis summary, §3 table (6/6 agree) and §5 R60-V1..V9).
- `.ufo/pins/readme-map.json` — `"lessons/round-60-verifier-spotcheck.md"` inserted into `covered` between
  `lessons/round-59-verifier-spotcheck.md` and `lessons/round-60.md`; `version` stays `2`; JSON parses.

`git diff --stat`: 2 files changed, 2 insertions(+). SCORECARD.md proxy stanza untouched.

## Verdict lines

Before (baseline, same session):

```
README_MAP: note unpinned:lessons/round-60-verifier-spotcheck.md
README_MAP: DRIFT files=146 rows=145 covered=145 bad=2 first=uncovered:lessons/round-60-verifier-spotcheck.md
PROXY: DRIFT (A_DRIFT term=A declared=105 computed=108 delta=+3; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
```

After:

```
README_MAP: CLEAN files=146 rows=146 covered=146          (exit 0)
PROXY  error  A_DRIFT  A: declared=105 computed=109 delta=+4
PROXY  error  C2_DRIFT  C2: declared=145 computed=146 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=145 computed=146 delta=+1
PROXY: DRIFT (A_DRIFT term=A declared=105 computed=109 delta=+4; C2_DRIFT term=C2 declared=145 computed=146 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; src-rev=31c465f15669)   (exit 1)
```

## Deviation from the brief's expectation (C2_TOTAL_DRIFT)

The brief expected `C2_TOTAL_DRIFT` to close. It cannot close from README/pin edits. Per
`scripts/proxy-check.mjs:99-101`, `C2` = README rows matching `^| `(knowledge|lessons)/` and
`C2_total` = `*.md` files under `corpus/knowledge` + `corpus/lessons`. The file census was
already 146 before this edit (the spot-check file is committed, `3304337`). The declared
values come from the SCORECARD stanza (`SCORECARD.md:292-293`: `C2=145`, `C2_total=145`).
The row addition moves computed `C2` 145→146, so it adds `C2_DRIFT`.
Both terms close only when integration sets the stanza to `C2=146` / `C2_total=146`, which the
R60-V8 text itself prescribes ("the proxy stanza refresh in the same change").

## Coverage axis effect

- `AXES_DRIFT` (coverage `## Axes row=10 derived=9`) is **closed**: with C2/C2_total = 146/146
  the derived coverage is back to 10, which matches the Axes row.
- `readme-map` DRIFT→CLEAN (bad 2→0). No axis harmed.

## Risks / notes for integration

- `A` moved computed 108→109 between my two runs with no change from me. Something else running at
  the same time added it; it is outside my scope.
- Reviewer RevReadmeMap measured at 06:41 -03:00, before these edits were written
  (`readme-map.json` mtime 06:41:53, `README.md` 06:42:03 -03:00). Re-measured at 09:42:43 UTC: both
  edits present as working-copy diff (jj `@` `wpmzqrut`, uncommitted, on top of `be4a820`),
  `README_MAP: CLEAN files=146 rows=146 covered=146`. The reviewer counts `A` +3 at
  105→108 from `.ufo/waves/round-61/{build-spec.mjs,probe/dispatch61-probe.mjs,probe/doctrine61-probe.mjs}`;
  at re-measure computed `A=111` (more round-61 files from other agents running alongside this one).
- Integration must refresh the stanza (`C2=146`, `C2_total=146`, plus whatever it settles for `A`)
  for `PROXY: MATCH`.
- Checks for the main agent: `node scripts/readme-map.mjs` (expect CLEAN 146/146/146),
  `node scripts/proxy-check.mjs` after the stanza refresh, and `node scripts/readme-map.mjs --selftest`.
