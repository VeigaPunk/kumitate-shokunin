# RevReadmeMap — R60-V8 repair verification (round 61, w1)

Verdict: **PARTIAL** — README row + pin landed and `readme-map` is CLEAN (3/4 criteria); `proxy-check` still reports `C2_TOTAL_DRIFT` (criterion 4 fails); the landed row text newly reds the round-59 `cite-sources` gate. Full evidence: `.ufo/waves/round-61/build/RevReadmeMap/verdict.md`.

Snapshot `2026-10-25T06:43:42-03:00`, HEAD `be4a820`, repairs uncommitted in the working copy (jj `@` `wpmzqrut`).

## Criteria

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | README row present | PASS | `corpus/README.md:181` |
| 2 | `covered` contains it | PASS | `.ufo/pins/readme-map.json:142` (v2, well-formed, no dup) |
| 3 | `readme-map` CLEAN files=rows=covered | PASS | `README_MAP: CLEAN files=146 rows=146 covered=146` exit 0 |
| 4 | `proxy-check` no `C2_TOTAL_DRIFT` | FAIL | see finding 2 |

Pre-repair baseline `06:41:40`: `README_MAP: DRIFT files=146 rows=145 covered=145 bad=2 first=uncovered:lessons/round-60-verifier-spotcheck.md` (+ `unpinned:` same file). Both defects are gone — criteria 1–3 are a genuine repair.

## Findings

**1. HIGH — new regression: `cite-sources` red.**
`corpus/README.md:181` contains the routed-defect label `S141→S211`. `scripts/cite-sources.mjs` (`kumitate-cite-sources-v1`, `ID_RE = /\bS[0-9]{3,}\b/g`) requires every `S`+3-digit token in a README table row to be a `corpus/SOURCES.md` row id.
- now: `CITE_SOURCES: DRIFT ghosts=2 first=S141` exit 1
- counterfactual (HEAD README, current SOURCES): `CITE_SOURCES: CLEAN cited=176` exit 0
- cause is exact: line 181 is the only README line naming `S141`/`S211`; both have 0 registry rows (`^| S141 |` / `^| S211 |`), while the row's other ids `S117 S126 S134 S190 S194` each resolve to 1. Gate itself healthy: `CITE_SOURCES_SELFTEST: PASS (8/8)`.
This is the R58-V3 defect class the gate exists to catch, reopened by the repair's row prose.

**2. HIGH — criterion 4 is unreachable as scoped; the stanza was not refreshed.**
`proxy-check` derives `C2 = countLines(readmeText, RE_README_ROW)` and `C2_total = notes.length` (`scripts/proxy-check.mjs:938-940`). Adding the row moves computed `C2` 145→146; the `kumitate-proxy-v1` stanza (`SCORECARD.md`, line 287) still declares `C2=145`, `C2_total=145`. So row+pin alone converts one drift term into two:
`PROXY: DRIFT (A_DRIFT term=A declared=105 computed=113 delta=+8; C2_DRIFT term=C2 declared=145 computed=146 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; PIN_UNPINNED term=scripts/make-dispatch-actual.mjs; src-rev=31c465f15669)` exit 1.
The row did clear `AXES_DRIFT` (derived coverage `floor(10×19/19×145/146)=9` → `floor(10×19/19×146/146)=10`, matching the frozen `## Axes` row 10). Net error count unchanged (3 → 3), terms swapped.
Recommended (integration owns it): stanza `C2=146`, `C2_total=146` — clears both C2 drifts, coverage stays 10. The fixer (`agent://L1Kumitate61.ExecReadmeMapFix`) independently reached the same conclusion and deferred the stanza edit to integration.

**3. INFO — `A_DRIFT` is concurrent-seat churn, not this repair.**
`A` (runnable files via `walkFiles(self)` + `RE_RUNNABLE`) measured 108 (06:41:40) → 112 (06:42:55) → 113 (06:43:42) as sibling seats land scripts; declared 105. First-snapshot contributors: `.ufo/waves/round-61/build-spec.mjs`, `.ufo/waves/round-61/probe/dispatch61-probe.mjs`, `.ufo/waves/round-61/probe/doctrine61-probe.mjs`. Related: warn `PIN_UNPINNED scripts/make-dispatch-actual.mjs` (another seat). Reconcile after the wave settles.

## Residual risk / gaps

- Uncommitted: discarding the working copy restores `readme-map DRIFT bad=2` (and removes the `cite-sources` regression).
- `cite-sources` has no escape syntax — any future row prose quoting an `S###` defect label re-reds it.
- Not run: `readme-map --selftest` (script unchanged; CLEAN is the acceptance signal), `round-gate` (would mix seat churn; it does not invoke `cite-sources`), standalone `claims-check` (`proxy-check` imports its probe: `C1=19/19` matched).

## Tooling

No installs or upgrades performed (node v24.21.0, git only). No mutations: no `jj` mutating commands, no git index writes; scratch at `/tmp/kumitate-r61/RevReadmeMap/`.
