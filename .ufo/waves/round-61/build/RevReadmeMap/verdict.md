# RevReadmeMap — R60-V8 repair verification verdict

**Verdict: PARTIAL — 3 of 4 acceptance criteria pass; criterion 4 (`C2_TOTAL_DRIFT`) FAILS; the landed row text regresses the round-59 `cite-sources` gate (new red gate, not named in the acceptance).**

Snapshot: `2026-10-25T06:43:42-03:00`, lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, HEAD `be4a820`. Both repairs are working-copy only, uncommitted (`git diff --stat HEAD` → `corpus/README.md | 1 +`, `.ufo/pins/readme-map.json | 1 +`; fixer reports jj `@` `wpmzqrut`).

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | `corpus/README.md` has the round-60-verifier-spotcheck row | **PASS** | `corpus/README.md:181` — `\| \`lessons/round-60-verifier-spotcheck.md\` \| Round-60 non-author closure (hyaku closure, non-author integrator) …` |
| 2 | `.ufo/pins/readme-map.json` covered set contains it | **PASS** | `.ufo/pins/readme-map.json:142` `"lessons/round-60-verifier-spotcheck.md",` (version 2 registry, entry well-formed, no duplicate — readme-map validates both) |
| 3 | `readme-map.mjs` prints CLEAN with files=rows=covered | **PASS** | `README_MAP: CLEAN files=146 rows=146 covered=146` exit 0 |
| 4 | `proxy-check.mjs` no longer reports `C2_TOTAL_DRIFT` | **FAIL** | `PROXY: DRIFT (A_DRIFT term=A declared=105 computed=113 delta=+8; C2_DRIFT term=C2 declared=145 computed=146 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; PIN_UNPINNED term=scripts/make-dispatch-actual.mjs; src-rev=31c465f15669)` exit 1 |

Pre-repair baseline (06:41:40): `README_MAP: DRIFT files=146 rows=145 covered=145 bad=2 first=uncovered:lessons/round-60-verifier-spotcheck.md` (second defect `unpinned:` same file). Both are now gone — criteria 1–3 are a clean, verified repair.

## Finding 1 — HIGH: the new row breaks `cite-sources` (round-59 pinned gate)

`corpus/README.md:181` cites `S141` and `S211` inside the routed-defects prose (`… this file's missing row, S141→S211`). `scripts/cite-sources.mjs` (`kumitate-cite-sources-v1`, `ID_RE = /\bS[0-9]{3,}\b/g`) scans every README table row and requires each id to be a `corpus/SOURCES.md` row id.

- Current tree: `CITE_SOURCES: DRIFT ghosts=2 first=S141` exit 1.
- Counterfactual, same tree with the HEAD README (`git show HEAD:corpus/README.md`): `CITE_SOURCES: CLEAN cited=176` exit 0.
- Cause is exact: line 181 is the only README line mentioning `S141`/`S211`; `grep -c "^| S141 |" corpus/SOURCES.md` = 0, same for `S211`; the row's other five ids (`S117 S126 S134 S190 S194`) each resolve to 1 registry row.
- The gate itself is healthy: `CITE_SOURCES_SELFTEST: PASS (8/8)`, `VERDICT: PASS`.

So R60-V8 closes `readme-map` by opening `cite-sources` — the same defect class (R58-V3) that gate was added for. Recommendation (integration owns the edit): drop or rephrase the `S141→S211` token pair in row 181 (or admit S141/S211 as SOURCES rows if they are real sources).

## Finding 2 — HIGH: the stanza was not refreshed, so criterion 4 cannot pass as scoped

`scripts/proxy-check.mjs` derives `C2 = countLines(readmeText, RE_README_ROW)` and `C2_total = notes.length` (`deriveTerms`, `scripts/proxy-check.mjs:938-940`). Adding the row necessarily moves computed `C2` 145→146 while computed `C2_total` was already 146; the `kumitate-proxy-v1` stanza (`SCORECARD.md`, stanza line 287) still declares `C2=145` and `C2_total=145`. The row+pin repair therefore **cannot** satisfy criterion 4 — it converts `C2_TOTAL_DRIFT` alone into `C2_DRIFT` + `C2_TOTAL_DRIFT`.

Net drift accounting, both snapshots: before = `A_DRIFT`, `C2_TOTAL_DRIFT`, `AXES_DRIFT` (3 errors); after = `A_DRIFT`, `C2_DRIFT`, `C2_TOTAL_DRIFT` (3 errors). The row did clear `AXES_DRIFT`: derived coverage moved `floor(10×19/19×145/146)=9` → `floor(10×19/19×146/146)=10`, matching the frozen `## Axes` coverage row 10.

Minimal remedy (recommendation, not applied): set `C2=146` and `C2_total=146` in the stanza. That clears `C2_DRIFT` and `C2_TOTAL_DRIFT` and keeps `coverage` at 10. The fixer's published output (`agent://L1Kumitate61.ExecReadmeMapFix`) reaches the same conclusion and defers the stanza edit to integration.

## Finding 3 — INFO: `A_DRIFT` is live churn from concurrent round-61 seats, not this repair

`A` = runnable files under the lane (`RE_RUNNABLE` over `walkFiles(self)`), declared 105. Measured live: 108 (06:41:40) → 111 (fixer, 09:42:43 UTC) → 112 (06:42:55) → 113 (06:43:42) — it climbs as sibling seats land scripts. Known contributors at the first snapshot: `.ufo/waves/round-61/build-spec.mjs`, `.ufo/waves/round-61/probe/dispatch61-probe.mjs`, `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (+3 = the original delta). Also present: warn `PIN_UNPINNED scripts/make-dispatch-actual.mjs` (another seat's new script, no stanza key). Neither is attributable to R60-V8; reconcile at integration after the wave stops landing scripts.

## Residual risk

- Repair is uncommitted; if the working copy is discarded or the wave rebases, `readme-map` returns to `DRIFT bad=2` and the `cite-sources` regression disappears with it. The verdict above is a working-copy measurement, not a committed-tip measurement.
- The row's prose embeds a defect label verbatim; any other `S`+3-digit token in future row prose will re-red `cite-sources` the same way. The gate has no escape syntax.

## Verification gaps

- `readme-map --selftest` not run (script bytes unchanged by the repair; the CLEAN line is the acceptance signal).
- `round-gate.mjs` not run — it would mix concurrent seat churn into the reading; `cite-sources` is not invoked by `round-gate.mjs` (it is a standalone pinned gate plus `SKILL.md` checklist item 724).
- `claims-check.mjs` not run standalone; `proxy-check` imports its probe in-process and reported `C1=19/19`, `C1_total=19` matching the stanza.
- `A` is a moving target, so its delta is a timestamped snapshot, not a stable measurement.
