# SCORECARD.md — round-78 draft fragments (not applied)

## Round 78 — declaration and verdicts (2026-11-04, Linux run-15 host; ONE v1 wave of 14 seats + the L1 planner seat)

Base `0b4df07b6f7478e7db6afb6852c418e096663c3c`; scaffolding `ad2630d0566a561ee078f47fade5644a22c10621`. The frozen plan names operability + coverage:kimi-layer, three executors, and six attack seats of fourteen. This is planned topology, not evidence of seat completion. Measured revision and dispatch/settlement evidence: <MEASURED>.

| claim | axis | instrument | verdict |
|---|---|---|---|
| C1 | coverage:kimi-layer (live census-derived score, findings included; clean integer 10 → 10) | `scripts/kimi-census.mjs` exports `decide(root)`; `scripts/proxy-check.mjs` imports it and removes `K_MEMBER_RULES`; `node .ufo/waves/round-78/probe/probe78-c1.mjs --set c1` must print `C78_C1: HELD held=12/12`, exit 0 | <MEASURED> |
| C2 | operability (capability acquisition `omp-shape-compare`; terminal integer 9 → 9) | `scripts/omp-census.mjs --compare FILE [--root DIR]`; `node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2` must print `C78_C2: HELD held=11/11`, exit 0; count-only, non-scoring | <MEASURED> |

Frozen claim sentences: at M each counter must reach its full count and exit 0; at the base tree the same counter must read below full count and exit 1. Any missed arm is UNMET, not partial admission. Preserve actual counter summary text even when its label says HELD below the target; score by count AND exit. Before/after receipts, controls and exact measured revision: <MEASURED>. All other axes and O terms: <MEASURED>; this draft asserts no harm verdict.

### Capability-table insertion (existing four-column table)

| `omp-shape-compare` | Compare the live OMP root against a `kumitate-omp-shape-v1` receipt, counting added, removed and changed names/kinds/modes without reading member contents or altering proxy scores; exit 0 IN_SYNC, 1 DRIFT, 2 fail-closed | `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json`; frozen `.ufo/waves/round-78/probe/probe78-c2.mjs` requires `C78_C2: HELD held=11/11`; measured receipt/revision: <MEASURED> | 78 |

Do not promote this proposed first-working row to demonstrated execution until the L1 fills its measured receipt.

### Append under `## Saturation` after measurement

**Round 78 (2026-11-04).** Capability `omp-shape-compare` enters the capability table on measured C2 admission (<MEASURED>); the N=3 stagnation window restarts at round 78. The next nudge becomes active if rounds 79–81 add no new verified capability row. Operability remains terminal at 9; the clean K integer remains 10. If C2 is UNMET, do not claim entry or reset: retain the previous verified window and record that verdict.

### Placement under `### coverage:kimi-layer` in Measurement proxies

Round 78 supersedes the K quality factor: `coverage_kimi = floor(10 × C1k/C1k_total × (K_members − K_findings)/K_members)`. The proxy imports the census's `decide(root)` decision in process; it no longer keeps `K_MEMBER_RULES`. `K_findings` is the decision's finding count, not a distinct-member count; `K_members` and identities come from the same decision. `K_sections` remains reported for note binding but is not substituted for findings in this formula. The `kumitate-proxy-v1` stanza gains the additive key `K_findings=0` on the clean root. With `C1k/C1k_total=5/5`, clean `K_members=55 K_findings=0` gives 10; a root whose `mcp.json` mode loses the 0400 floor has `K_members=55 K_findings=1` and gives 9. These are the frozen expected readings; actual evidence: <MEASURED>.

Replace the current `## Axes` coverage:kimi-layer row's present-tense two-table description with the formula above plus the measured clean terms and a round-78 pointer. Preserve historical round-42/74 declarations as history, not current implementation. Add `K_findings=0` beside K_members/K_sections in the stanza only after measurement. Re-measure/re-pin changed scripts and final C/A/map terms under the existing same-commit rule, never by guessed totals. C2 adds no proxy term and changes neither `coverage_omp` nor the snapshot score path.

### Conflicts requiring explicit disposition

The inspected lane still has the old duplicate K table and no compare/export after-state; therefore this file is draft target text, not final-code evidence. The report-path instructions name both `w1/K78ScribeDocs/report.md` (Acceptance) and `w1/K78ScribeDocs.md` (Report trailer); both scoped reports are supplied with identical content rather than silently choosing one. Source S228 is not yet in the inspected registry; reserve the id pending L1 admission.
