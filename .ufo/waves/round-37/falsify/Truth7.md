TRUTH7 anchors=1607 false=203 delivered-nonok=186 delta=17 verdict=partial

# Truth7 — independent anchor-truth re-measure (round-37 falsify)

Pin 31c465f15669 (`/fast/scratch/kumitate-r36/src`, clean). Lane `corpus/knowledge`, the 20 keys of `.ufo/pins/fidelity-ratchet.json`. Own parser; `claims-check` was neither imported nor read. Scope: whole fidelity universe (all eight slices) because the delivered 186 exists only at corpus level. Slice 7/8 is reported separately below.

## Verdict
- Total: 203 false vs 186 delivered (+9.1%) at the primary rule, inside the 10% bound.
- Not robust: the same anchors give 190 (+2.2%) to 271 (+45.7%) across defensible pairing windows. Per-note disagreement is about 100 anchors gross (net +17): remaining-scripts-census −40, cost-and-profile +16. The total agrees by offsetting error, so the verdict is partial.
- Slice 7/8: 18 anchors, 0 false; delivered `runtime-remainder-census` nonok = 0. Exact agreement.
- D1 repair: the four restored notes differ from `0614092` only by one added notice line each (`git diff --stat 0614092 -- <4 notes>`: `1 +` each). The round-36 harm (123 true→wrong) is absent from the working tree.

## Scope and rules (declared)
- Universe U: backticked `path:N[-M]` or `:N[-M]` anchors inside `##` member sections (heading's first backticked path resolves at the pin), with file = heading file (explicit path equal to it, or bare). |U| = 1607.
- Pairing (primary WL=24 left, WR=12 right): nearest backticked span before the anchor, else after. It must be a code symbol, the connector must be within the window and free of `. ; ! ?` or a blank/list/table break. A list continuation inherits; an adjacent non-symbol span blocks.
- Liveness: every cited range has 1 ≤ a ≤ b ≤ len(file) with both endpoint lines non-blank (round-35 rule).
- Truth: normalized symbol, or its longest identifier, appears on some cited line (round-36 rule). false = elsewhere + absent (the delivered nonok arithmetic).
- Window choice is mine and was made after the sweep, from the per-side ok-rate by connector length: left 67–71% ok at ≤24 chars, 32% at 25–40; right 95% at ≤4, 58% at 5–12, 26% at 13–24. It was not chosen to hit 186.

## Results (primary vs delivered)
| class | mine | delivered | delta |
|---|---|---|---|
| anchors | 1607 | 1551 | +56 |
| ok | 718 | 675 | +43 |
| elsewhere | 196 | 169 | +27 |
| absent | 7 | 17 | −10 |
| false (elsewhere+absent) | 203 | 186 | +17 (+9.1%) |
| dead | 204 | 173 | +31 |
| noid | 482 | 517 | −35 |

Pairing and rule sensitivity (false, Δ vs 186):
| rule | false | Δ |
|---|---|---|
| windows 10/10 | 190 | +2.2% |
| windows 24/12 (primary) | 203 | +9.1% |
| windows 12/24 | 210 | +12.9% |
| windows 24/24 | 219 | +17.7% |
| unbounded | 271 | +45.7% |
| 24/24, identifier-only truth (no substring) | 231 | +24.2% |
| 24/24, first-line-only truth | 268 | +44.1% |
| 24/24, in-range liveness (no blank check) | 225 | +21.0% |

Per-note false, primary vs delivered: cost-and-profile 17 vs 1; remaining-scripts-census 38 vs 78; sighting-wall 22 vs 13; route-probe-cluster 22 vs 14; native-trial-launch 30 vs 25; runtime-support 8 vs 3; ops-watchers 51 vs 47; swarm-wave-lifecycle 4 vs 0; loop-driver 4 vs 1; distill-and-l3 3 vs 1; all others within ±2.

## Calibration against the round-36 closure
Replay of pre-repair tip `91da27c6` vs base `0614092` through the same parser, matched by (section, file, symbol):

| note | true→wrong mine [closure] | wrong→true mine [closure] |
|---|---|---|
| remaining-scripts-census | 93 [102] | 22 [24] |
| sighting-wall | 14 [12] | 8 [9] |
| route-probe-cluster | 7 [5] | 7 [1] |
| native-trial-launch | 6 [4] | 21 [22] |
| total | 120 [123] | 58 [56] |

My semantics agree with the closure's independent parser on the moves to about 3% at total. At 10/10 the total is 116 [123].

## Named class boundaries (why the figures differ)
1. Pairing scope (decisive). The delivered noid = 517 matches my 10/10 window (520), not 24/12 (482) or unbounded (386). Connectors of 11–24 chars carry real attachments, e.g. `parseRoute` is declared at `scripts/omp-route-grammar.mjs:88` (ok), and `attemptRepend` success case (`:28`) (ok). The delivered noid class therefore holds sentence-attached anchors, some false.
2. Liveness. Delivered dead = 173 ≈ out-of-range only (mine 177, −4). My dead = 177 out-of-range + 27 blank-endpoint.
3. Universe +56: remaining-scripts-census +23, ops-watchers +16, cost-and-profile +9, native-judge-pipeline +4 (heading `## Contract-hash mechanism (`native_contract.rs`)`, path in parentheses, delivered 0), runtime-support +2, route-probe +1, test-inventories +1. Only the +4 heading case is attributed; 52 remain unattributed. Fenced code is not the cause (0 universe anchors inside fences).
4. Truth scope. Delivered is consistent with cited-range truth. First-line truth would give 7 false in runtime-remainder-census where delivered has 0; range truth gives 0.
5. Substring leniency. Normalized-symbol substring admits `health` in the prose word `healthy` (the-tick-ping:21). This is the documented "appears" rule; identifier-only is +24%.

## Unexplained residuals (not named)
- remaining-scripts-census: delivered 78 false; mine 38 at primary, 43 at 24/24, 58 at best (24/24 first-line). No variant I tried reaches 78.
- cost-and-profile: 13 of my 15 elsewhere at 10/10 sit in the three `@ 964f443e` sections (native_profile.rs 3, cost_ledger_validation_tests.rs 6, execution_profile_tests.rs 4). Delivered elsewhere = 1. Cross-revision sections are handled differently by one side; I cannot tell which.
- Consequence: per-note ratchet ceilings are not truth measurements. Under my primary, cost-and-profile (17) would exceed its ratchet ceiling of 1, and remaining-scripts-census (78) sits 40 above my count.

## Slice 7/8
Member sections in note order, eighths by section count: slice 7 = 23 sections (ordinal 140–162 of 186), all in `runtime-remainder-census`. U = 18: ok 16, elsewhere 0, absent 0, dead 1, noid 1, false 0. Delivered `runtime-remainder-census` nonok = 0, so the slice agrees exactly and is window-independent.

## Parser reliability (spot-check, pinned lines read)
- Earlier pairing (v2), 12 false sampled: 6 genuine (shifts of 1–10 lines or symbol absent), 6 parser artifacts (newline-wrap block, fall-through past an adjacent flag or literal, unbackticked symbol, window over-attribution). Fixed in v3, which is the parser used for every number above.
- v3, 8 false sampled at 24/24: 8/8 consistent with a shift or an absent symbol. Small sample; precision is wide.

## Commands and artifacts
- `python3 /fast/scratch/kumitate-r37/Truth7/truth7v3.py` (window sweep, connector bins); `final3.py` (per-note, slices, calibration); `asym.py` via inline run (24/12 primary); `calib.py` (dead reasons, calibration).
- Outputs: `/fast/scratch/kumitate-r37/Truth7/` (`final-anchors.jsonl`, `v3-anchors.jsonl`, `final-slice7.tsv`).
- Lane access was read-only: `git show 0614092:…`, `git show 91da27c6:…`, `git rev-parse`, `git diff --stat`, and `git -C <pin> ls-files / status / rev-parse`. The only lane write is this report. No package installs; python3 stdlib only.

## Limits
- The delivered pairing rule, its per-note handling of `@rev` headings, and the S8 census 78 are not recoverable from its printed output.
- The 24/12 window is a judgement. The 10% test is window-sensitive (190–219 across the defensible windows).
