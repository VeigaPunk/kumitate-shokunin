# ScoutRoundGates — round 61 w1 (gate fleet audit)

**Result: 15/15 lane gate selftests PASS (exit 0) at git `be4a820`; 514/514 cases pass; no failures, so no round-61 attribution needed.**

Table: `.ufo/waves/round-61/build/ScoutRoundGates/gates.txt` (gate → summary line → verdict line → exit).

## Axes
- Coverage: all 15 named gates were run, using the documented `--selftest` flag for each (checked in each script's header/USAGE).
- Fidelity: everything ran at one revision. `scripts/` had no diff against HEAD (`git status --porcelain scripts/` and `git diff --stat HEAD -- scripts/` were both empty), and jj `@` (wpmzqrut 547e4f1f) is empty on top of `@-` xnpoxkmn be4a820c344d.
- Honesty: verdict lines are quoted verbatim from the captured stdout; every stderr file is empty.

## Observed
| gate | verdict | exit |
|---|---|---|
| cite-check | `76/76 cases passed (hermetic)` / `VERDICT: PASS` | 0 |
| surface-probe | `46/46 cases passed` / `VERDICT: PASS` | 0 |
| round-gate | `ROUND_GATE_SELFTEST: 61/61 pass` / `VERDICT: PASS` | 0 |
| claims-check | `CLAIMS_SELFTEST: 47/47 pass` / `VERDICT: PASS` | 0 |
| kimi-census | `KIMI_CENSUS_SELFTEST: 54/54 pass` / `VERDICT: PASS` | 0 |
| sources-check | `SOURCES_SELFTEST: 46/46 pass` / `VERDICT: PASS` | 0 |
| anchor-truth | `ANCHOR_TRUTH_SELFTEST: 44/44 pass` / `VERDICT: PASS` | 0 |
| wave-census | `WAVE_CENSUS_SELFTEST: 32/32 pass` / `VERDICT: PASS` | 0 |
| gate-mutants | `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0` / `VERDICT: PASS` | 0 |
| receipt-evidence | `RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)` / `VERDICT: PASS` | 0 |
| cite-sources | `CITE_SOURCES_SELFTEST: PASS (8/8)` / `VERDICT: PASS` | 0 |
| source-dupes | `SOURCE_DUPES_SELFTEST: PASS (12/12)` / `VERDICT: PASS` | 0 |
| source-capture | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` / `VERDICT: PASS` | 0 |
| readme-map | `README_MAP_SELFTEST: PASS (16/16)` / `VERDICT: PASS` | 0 |
| dispatch-evidence | `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` / `VERDICT: PASS` | 0 |

- A grep for `FAIL` in the outputs only matches PASS case lines that deliberately exercise failure paths: the FAIL-CLOSED fixtures and the injected-failure self-observation cases. Examples are `round-gate.out:33-38,56,58`, `cite-check.out:76`, `wave-census.out:32`, `sources-check.out:36` and `dispatch-evidence.out:4`. None of these is a real failure.
- Wall time: the 14 gates other than gate-mutants took about 33.5 s together, run sequentially; gate-mutants took 58 s on its own. I ran them one at a time on purpose, so they would not compete for CPU with the many sibling seats that are also running.
- Runtime: node v24.21.0. Script sha256 prefixes are recorded in the transcript, for example gate-mutants `177f6cbbd70d` and readme-map `b1c8bf97eb01`.

## Inference / gaps
- [INFERENCE] Sibling executors (for example ExecReadmeMapFix and ExecDispatchSchemaTool) may land changes to `scripts/` later in w1. This table holds for `be4a820` with a clean `scripts/` only; any later script change needs a re-run.
- This audit covers selftests only (the hermetic fixture suites). It makes no claim about live-tree verdicts, such as `readme-map` or `sources-check` run against the real registry.

## Evidence
- Raw output: `/tmp/kumitate-r61/ScoutRoundGates/<gate>.out` and `.err` (scratch; not part of the lane).
- Commands: `node scripts/<gate>.mjs --selftest`, run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

## Tooling
No installs or updates. `bc` is absent on the host, which only broke my timing arithmetic; I used bash `SECONDS` instead and did not install it.
