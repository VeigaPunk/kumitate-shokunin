# CritProxyAttack — round 61 w1 — proxy falsify

**Verdict:** the stanza holds; pin coverage does not. Stanza gaming is falsified: no edit to the `kumitate-proxy-v1` stanza alone produces MATCH when the tree disagrees (11/11 attempts gave DRIFT exit 1 or FAIL-CLOSED exit 2). `--strict` pin coverage is a **fixable defect**. It fires on any new top-level `scripts/*.mjs`, including the real new file `scripts/make-dispatch-actual.mjs` in the live tree. But `.js`, `.sh`, `.cjs`, `.ts`, `.mts`, `scripts/<dir>/*.mjs` and a symlinked `scripts/*.mjs` all escape: each gives `--strict` MATCH exit 0.

Full evidence: `.ufo/waves/round-61/build/CritProxyAttack/findings.txt`. Battery script: `/tmp/kumitate-r61/CritProxyAttack/battery.sh`, output in `battery.out` in the same directory.

## Evidence
- Baseline (live tree and sandbox): `PROXY: DRIFT (A_DRIFT term=A declared=105 computed=108 delta=+3; C2_TOTAL_DRIFT term=C2_total declared=145 computed=146 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`.
- Stanza-only edit made in place in the sandbox `SCORECARD.md` (A=108, C2_total=146): `PROXY: DRIFT (AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`, exit 1. The stanza cannot override the `## Axes` row.
- Forged terms and pins (A=500/C=500, C2_total=145, S_sections/K_members, a forged pin.proxy-check) each give DRIFT with the matching `*_DRIFT` or `PIN_DRIFT` finding. Wrong key case, a decoy second block, a missing key and an early `-->` each FAIL-CLOSED with exit 2.
- `--strict` escapes: P3–P9 in findings.txt. Root cause is `comparePinCoverage` at `scripts/proxy-check.mjs:1140-1157`: it reads only the top level of `scripts/` and checks only `isFile()` entries ending in `.mjs`. Node v24.21.0 runs `.cjs`, `.ts` and `.mts` directly (shown on this host).
- Out of stanza:
  - **G1/G2:** deleting a gate's pin line, or the whole `kumitate-gate-pins-v1` block, turns a tampered gate's GATE_PIN_DRIFT error into a PIN_UNPINNED warning. Bare mode then reports MATCH exit 0; `--strict` still gives DRIFT. SKILL.md:703 runs `--strict`, which limits the exposure.
  - **G3:** patching proxy-check and re-pinning it to its own bytes gives MATCH. No authority outside the lane holds that hash. This is a documented tradeoff (`proxy-check.mjs:191`).
  - **A term:** 89 of the 113 live A members are wave scratch under `.ufo/`. This is the frozen derivation, a tradeoff for the judge.

## Impacted axes
operability.

## Smallest safe correction
1. Change `comparePinCoverage` to walk `scripts/` recursively. Flag any regular file or symlink matching `/\.(?:m?js|cjs|ts|mts|cts|sh|py)$/` that has no pin; a symlink is always a finding. Keep it at warn level and add hermetic test cases for each escape.
2. Make a GATE_PINS key that the tool enumerates, whose file exists but whose line is missing from the block, an error (e.g. `GATE_PIN_MISSING`). This is lane-owned and leaves the v1 23-key contract untouched.
3. Judge decision: whether to anchor `pin.proxy-check` outside the lane.

## Scope and tooling
- The lane was not mutated. All forgery happened in `/tmp/kumitate-r61/CritProxyAttack/` or through `--scorecard` copies. The sandbox was restored and is cmp-identical to the lane for the two scripts that were touched.
- Hermetic suite: `PROXY_SELFTEST: 122/122 pass` / `VERDICT: PASS`.
- Tools installed or updated: none.
