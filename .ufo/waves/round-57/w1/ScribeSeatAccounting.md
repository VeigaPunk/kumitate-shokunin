# ScribeSeatAccounting — kumitate round 57 w1 seat accounting

Date: 2026-10-24 · Spec: `.ufo/waves/round-57/w1-spec.json` · sha256 `cf37d7eb8356e4545104574ad448b5a0ce7765f9b9d3c24e054f69d401529063` · Evidence dir: `.ufo/waves/round-57/build/ScribeSeatAccounting/` (session-transcript.txt, counts.json, roster.tsv)

## Verdict: all five claimed figures corroborated verbatim

| Assertion | Computed from spec | Result |
|---|---|---|
| 64 items | `.items\|length` = 64 | PASS |
| Role mix executor 19, reviewer 13, scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel 2, revenger 1, connector 1 | group_by tally identical; sum = 64 | PASS |
| Attack share 24/64 = 37.5% ≥ 25% | reviewer 13 + critic 6 + mutation-tester 5 = 24; 24/64 = 37.5% | PASS |
| 0 resumes | no `resume` field (schema = {item,name,role}); zero retry-suffixed names | PASS |
| Distinct names | `uniq` count = 64; `uniq -d` empty | PASS |

## Findings

- **Count**: `jq '.items|length'` → 64.
- **Role mix** (observed): executor 19, reviewer 13, scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel 2, revenger 1, connector 1. Matches the claim order-for-order and sums to 64.
- **Attack share**: reviewer 13 + critic 6 + mutation-tester 5 = 24 → 24/64 = 37.5% ≥ 25% floor.
- **Resumes**: 0. Every item's key set is exactly `["item","name","role"]` — no resume field exists. A case-insensitive `resume` string search over item JSON returns 2 hits, both non-marker text: (a) this seat's own assertion phrase "0 resumes"; (b) ScoutDispatcherLiveness citing the origin-tree constant `MAX_PAUSED_RESUME_ATTEMPTS`. A retry-pattern scan over all 64 names (`retry|attempt|resume|redo|rerun|-vN|_N`) returns NONE. Note: `L1-kumitate-r57-attempt2` appears in the live dispatch roster but is NOT in this spec's items — the spec holds the L1 planner seat as prepared text; this count covers the spec file only.
- **Distinct names**: 64 unique names; `uniq -d` empty.
- **Bonus consistency (unclaimed, cheap)**: every item text ends with `Report: .ufo/waves/round-57/w1/<name>.md` matching top-level `reportDir`; zero deviations. Top-level keys are exactly `axes, context, items, milestone, reportDir, wave`.

## Method notes / limits

- Counting is mechanical (jq) against the committed spec bytes; full command transcript with exit codes in `session-transcript.txt` (two jq filter errors corrected in-session: a bad `asciiname` filter and a `.name` scoping bug — neither affects results; corrected commands re-run, exit 0).
- "0 resumes" is judged on the spec artifact: no resumed-seat field, flag, or naming convention present. Whether the orchestrator later resumes a seat at dispatch time is outside this spec's content and this item's scope.
- Attack share uses the spec's own role strings verbatim; "attack roles" = reviewer + critic + mutation-tester per the spec context's definition.
- This report asserts nothing about item quality, policy validation (ScoutWavePolicy's seat), or dispatch; it only falsifies/corroborates the five named accounting figures.

## Installs

None. jq + coreutils only; pacman untouched (host-wide pause).
