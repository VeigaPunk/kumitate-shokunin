# SKILL.md — round-78 insertion draft (not applied)

Axes: operability + coverage:kimi-layer. Frozen authority: `.ufo/waves/round-78/plan.md` at `ad2630d0566a561ee078f47fade5644a22c10621`.

Insert under `## Gate registry`, using its existing five-column shape:

| omp-shape-compare | gate | `node scripts/omp-census.mjs --compare FILE [--root DIR]` → one line `OMP_SHAPE_COMPARE: IN_SYNC\|DRIFT entries=<live> receipt=<n> added=<a> removed=<r> changed=<c> first=<name>`; exit 0 in sync, 1 drift, 2 fail-closed (absent/malformed receipt or root not a directory); shape-only, count-only, non-scoring — names/kinds/modes, never member content; `--snapshot`/`--shape` and the proxy's O terms unchanged | `node scripts/omp-census.mjs --selftest`; round-78 frozen C2 counter must read `C78_C2: HELD held=11/11` | existing `pin.omp-census` and `pin.omp-shape` in `kumitate-gate-pins-v1`; `.ufo/pins/omp-shape.json`; `SCORECARD.md` capability `omp-shape-compare` (round 78) |

Append to the existing proxy-check row (not a second registry row): round 78 imports `decide(root)` from `scripts/kimi-census.mjs`, removes `K_MEMBER_RULES`, and adds `K_findings`, the census finding count; `coverage_kimi = floor(10 × C1k/C1k_total × (K_members − K_findings)/K_members)`. Retain `K_sections` as a reported/binding term, not the score's quality factor. Re-pin changed tool bytes through the L1's existing rule; do not invent a new compare-specific pin.

Count note: the added comparison is a new command row over the existing omp-census file, not a new script. The registry introduction's gate-row/file counts are historical and must be re-counted by the L1 rather than incremented from recalled prose.

Observed discrepancy, not a verdict: the currently inspected lane proxy still contains `K_MEMBER_RULES` at lines 615, 922, 2188, 2200 and 2212; the census has no exported `decide`, and omp-census has no `--compare`. These are after-state drafts pending integration; no final code shape or passing gate is attested here.
