# R10 — proxy-check at lane tip

Axes attacked: operability (proxy recomputation) and coverage (frozen declared terms). This is a measurement of inherited control behavior, not a round-62 claim or verdict; the r62 plan is not frozen.

## Observed run

At lane HEAD `0cbe0d75e5a08718e2256408329692908c837766`, ran from the lane root:

```sh
node scripts/proxy-check.mjs --json
```

Observed exit **1**, JSON `verdict: DRIFT`, `ok: false`. Source pin succeeded: origin revision and clone HEAD both `31c465f15669f744848bd9f5d56191c5085670f7`. All six proxy pins matched. Derived terms vs frozen stanza at `SCORECARD.md:287-311`:

| Term | Frozen | Derived | Finding |
|---|---:|---:|---|
| A | 105 | 117 | `A_DRIFT`, +12 |
| C | 30 | 30 | match |
| C1 / total | 19 / 19 | 19 / 19 | match |
| C2 / total | 145 / 145 | 148 / 149 | `C2_DRIFT` +3; `C2_TOTAL_DRIFT` +4 |
| S members / sections | 88 / 88 | 88 / 88 | match |
| R members / sections | 92 / 92 | 92 / 92 | match |
| coverage_script / runtime | 10 / 10 | 10 / 10 | match |
| C1k / total | 5 / 5 | 5 / 5 | match |
| K members / sections | 52 / 52 | 52 / 52 | match |
| coverage_kimi | 10 | 10 | match |
| operability | 9 | 9 | match |
| coverage | 10 | 9 | `AXES_DRIFT`: scorecard `## Axes` row says 10, derived 9 |

One warning: `PIN_UNPINNED` for `scripts/make-dispatch-actual.mjs`. The JSON reports four errors, one warning, duration 78 ms; all other listed findings absent. The declared pin values themselves all match their computed hashes (6/6).

## Why this reaches the target

This directly exercises the current-tip proxy against its own frozen machine-readable stanza and origin pin. It demonstrates genuine drift rather than an unavailable-origin/fail-closed result: origin resolution succeeded, terms were derived, and the individual pin comparisons matched. The mismatched declared terms are A and C2; the separate score drift is coverage, whose derived ratio is `19/19 × 148/149`, yielding floor 9, not the scorecard's Axes value 10. No conclusion about a round-62 claim is warranted.

Evidence: command output from this run; committed stanza `SCORECARD.md:287-311` and axis rows `SCORECARD.md:337-341`; checker contract description `scripts/proxy-check.mjs:11-29`. Working tree had only untracked round-61 forgery bundle and round-62 wave artifacts at invocation (`git status --short`); the measured script and scorecard were not listed as modified.
