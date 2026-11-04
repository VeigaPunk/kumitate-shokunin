source: S230
verified-at: 2026-11-04 (committed source capture read; arithmetic below is the round-79 contract, not an executed gate)
recheck: on-release for S230; after aggregation changes, run `node .ufo/waves/round-79/probe/probe79-c1.mjs --set c1` from the lane root

# K score: retain both loss factors

The lane adopts this composite aggregation:

```text
coverage_kimi = floor(10 × C1k/C1k_total × K_sections/K_members × (K_members−K_findings)/K_members)
K_members = 0 → coverage_kimi = 0
```

`C1k/C1k_total` is the covered registry fraction; `K_sections/K_members` is documentation coverage; `(K_members−K_findings)/K_members` is the census finding factor. Documentation and census findings remain separate inputs. In the lane's operational sense this is non-compensatory: a documentation loss and a census finding each cost the score at the clean boundary; neither factor can be traded away by replacing it with the other. Full credit requires both intact, assuming full registry coverage and valid bounded factors.

## Grounding and boundary

S230, scikit-learn's `fbeta_score` documentation, first descriptive/formula paragraph:

> The F-beta score is the weighted harmonic mean of precision and recall, reaching its optimal value at 1 and its worst value at 0.

This is documentation of a library metric, not general scoring doctrine. The lane adopts only the non-compensatory shape—retain both measured factors, rather than substitute one for the other—not F-beta's formula or beta weighting. Strictly, a harmonic mean and a product can permit partial compensation between intermediate values; neither establishes universal no-tradeoff scoring. Integer flooring can also hide an additional loss. Here “neither is tradable” means neither input may be discarded, and one perfect factor cannot restore full credit lost by the other.

S231 is the lane's re-runnable round-78 harm receipt, `.ufo/waves/round-78/close/harm-counterexample.txt` at `94ab4065`, verdict lines 14 and 17:

```text
verdict=DRIFT K_sections=54 K_members=55 coverage_kimi=9 findings=['K_SECTIONS_DRIFT', 'COVERAGE_KIMI_DRIFT', 'AXES_DRIFT']
verdict=DRIFT K_sections=54 K_members=55 coverage_kimi=10 findings=['K_SECTIONS_DRIFT']
```

The same de-named heading cost the base score a point, while round 78's patched formula stayed at 10: it replaced the documentation factor with the census factor. These are quoted historical outputs, not executions by this entry's author. The round-79 choice restores documentation sensitivity without dropping census sensitivity.

## Arithmetic examples

Assume `C1k/C1k_total = 1`; the first four rows have 55 members. These are formula examples, not probe receipts.

| K_sections/K_members | K_findings | Product before floor | coverage_kimi |
|---|---|---|---|
| 55/55 | 0 | 10 | 10 |
| 54/55 | 0 | 540/55 | 9 |
| 55/55 | 1 | 540/55 | 9 |
| 54/55 | 1 | 29160/3025 | 9 |
| 0 members | — | guarded: no division | 0 |

The combined loss lowers the unrounded product further even though both single losses and the combined loss floor to 9. Source boundaries: S230 supplies the metric precedent; S231 supplies only this lane's historical harm, not evidence that round 79's implementation passes.
