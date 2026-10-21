ATTACK C1.layerTerms verdict=partial defects=2

## Axes and scope
- Operability: discrimination of `layerTerms()` regressions by the existing proxy selftest. Coverage: supporting test gaps only; no axis score or round-admission judgment.
- Copied the integrated working tree with `cp -a --reflink=auto /home/vgpnk/Projects/shokunin/kumitate-shokunin/. /fast/scratch/kumitate-r35/w/MutProxyLayerTerms/`.
- All five mutants were applied individually to that copy's `scripts/proxy-check.mjs`, then exactly restored before the next mutant. Production files were not edited; this report is the only lane write.
- Runtime: `node --version` => `v24.21.0`. No tools installed or updated.
- S023 definitions, reopened: [Stryker mutant states](https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/#mutant-states): killed = at least one test failed while active; survived = all tests passed. No baseline failed, no timeout/runtime-error outcome occurred.

## Commands and actual results
CWD for every detector run: `/fast/scratch/kumitate-r35/w/MutProxyLayerTerms`.
Detector, unchanged across pristine/mutated/restored runs (120-second external bound):
```sh
node scripts/proxy-check.mjs --selftest --src /fast/scratch/kumitate-r35/src
```
Hash command before each mutated/restored run: `sha256sum scripts/proxy-check.mjs` (joined to the detector with `&&`). Initial hash command also named the lane's original script; both printed H below. `--selftest` exercises synthetic origins, not the live upstream or kimi root.

| Phase | Actual final stdout | Exit | Outcome |
|---|---|---|---|
| Pristine P0 | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | Valid baseline |
| M1 occurrence counting | `PROXY_SELFTEST: 103/107 pass`; `VERDICT: FAIL` | 1 | KILLED |
| Restored P1 / M2 baseline | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | Restored |
| M2 remove in-family filter | `PROXY_SELFTEST: 105/107 pass`; `VERDICT: FAIL` | 1 | KILLED |
| Restored P2 / M3 baseline | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | Restored |
| M3 remove string guard | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | SURVIVED |
| Restored P3 / M4 baseline | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | Restored |
| M4 row-scoped identity | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | SURVIVED |
| Restored P4 / M5 baseline | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | Restored |
| M5 heading identity | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | SURVIVED |
| Restored P5 | `PROXY_SELFTEST: 107/107 pass`; `VERDICT: PASS` | 0 | Restored |

### Mutants and expected detectors
- M1, `scripts/proxy-check.mjs:593,600,605,607-609`: replaced the two Sets with numeric counters, `add(s.file)` with `+= 1`, and `.size` outputs with those counters; retained both eligibility guards. Expected detector: distinct S/R/control assertions at `:1555-1585`. Actual failures: tests 15, 16, 17 plus nested-suite propagation at 105. Test 15 printed `kinds=[COVERAGE_SCRIPT_DRIFT,AXES_DRIFT]` and `coverage_script declared=3 computed=6`; test 16 printed `kinds=[COVERAGE_RUNTIME_DRIFT,AXES_DRIFT]` and `coverage_runtime declared=5 computed=10`; test 17 printed `exit=1 S occurrences=3 distinct=3 R=2 findings=3`. KILLED by assertion failures, not merely by inner proxy exit 1 (which those negative fixtures already expect).
- M2, `scripts/proxy-check.mjs:600`: changed the condition to `if (typeof s.file === 'string')`. Expected detector: out-of-family assertion at `:1644-1651`. Actual test 26 failed with `exit=1 kinds=[COVERAGE_SCRIPT_DRIFT,AXES_DRIFT] PROXY: DRIFT (COVERAGE_SCRIPT_DRIFT term=coverage_script declared=0 computed=3 delta=+3; AXES_DRIFT term=coverage:script-layer declared=0 computed=3)`; test 105 propagated the nested failure. KILLED.
- M3, `scripts/proxy-check.mjs:600`: condition became `if (s.inFamily === true)`, with `add(s.file)` unchanged. Expected detector: exclusion of an unresolved/non-string file identity, if reachable with `inFamily === true`. Actual: all 107 tests passed. SURVIVED; not counted as a demonstrated defect. The current producer emits unresolved/ambiguous objects with `file: null` and no `inFamily` (`scripts/claims-check.mjs:352-360`), and sets `inFamily` only on resolved objects (`:386-391`). [INFERENCE] This guard deletion is equivalent on that producer's current output domain, rather than evidence of a reachable malformed-identity bug. Do not weaken the contract or claim a missing reachable test solely from this survivor.
- M4, `scripts/proxy-check.mjs:600`: preserved guards but changed the Set key to `JSON.stringify([row.id, s.file])`, making identities distinct per registry row instead of per layer. Expected detector: one canonical member credited by two same-layer rows must still count once. Actual: all 107 tests passed. SURVIVED; coverage finding D1.
- M5, `scripts/proxy-check.mjs:600`: preserved guards but changed `add(s.file)` to `add(s.heading)`. Expected detector: two different heading spellings resolving to the same file must count once. Actual: all 107 tests passed. SURVIVED; coverage finding D2.

## Defects: selftest coverage, not an observed production miscount
1. D1 — `scripts/proxy-check.mjs:1532-1549,1555-1585` tests duplication within one row/note, while the contract also deduplicates across rows. The fixtures at `:1515-1525` give each row a different canonical member, so M4 passes. Command/output: detector above with M4 => `PROXY_SELFTEST: 107/107 pass`, `VERDICT: PASS`, exit 0. Minimal fix: add S and R fixtures where overlapping declared families in two rows resolve to the same canonical file; assert the layer numerator is 1, not 2. [INFERENCE] These proposed assertions would kill M4; they were not added or run in this leaf probe.
2. D2 — `scripts/proxy-check.mjs:1200,1515-1519,1573-1576` uses a helper that puts the same full-path spelling in every repeated member heading, so heading identity and canonical file identity are indistinguishable to the suite. Command/output: detector above with M5 => `PROXY_SELFTEST: 107/107 pass`, `VERDICT: PASS`, exit 0. Minimal fix: add same-file basename/full-path heading aliases (for example `a.mjs` and `scripts/a.mjs`) in a valid family, retain live own-file anchors/symbols, and assert one distinct member. [INFERENCE] This proposed alias assertion would kill M5; it was not added or run here.

## Restoration evidence
Full SHA-256 of pristine script H: `e58c08017508482fc63620c311681a3783849ddf42e1b34f53900d31a35cc647`.
Initial lane original and scratch copy both hashed to H. Every P1-P5 restoration printed H and passed the same 107-case detector. Each following restored phase also served as the next mutant's pristine baseline.

| Mutant | Before | Active SHA-256 | After |
|---|---|---|---|
| M1 | H | `101d9952bca886961427b59a92fde3b950af75ef3a75e1c249916eb6c29aaae4` | H |
| M2 | H | `efcac1689c0da776902ad863c536194a57b8c8b18b43635d02e29600a721f49e` | H |
| M3 | H | `e32be1ed0bbcbe50905871e7ac95fed1d3620c0de969bcfbcbc0f9fafb2c2d07` | H |
| M4 | H | `0c2ce4a83424757430a8c9f548215f68b8a96867c4178debad58694b399573a4` | H |
| M5 | H | `fb955fe90d297878a7438dc6bf17dff9087b23a7637718ca18e29ab63c6522ec` | H |

Full captured detector output for M3-M5 and P2-P5 is retained under the scratch root as `probe-mutant3-no-string-guard.txt`, `probe-mutant4-row-key.txt`, `probe-mutant5-heading-key.txt`, and `probe-restore2.txt` through `probe-restore5.txt`. Earlier actual outputs are recorded above. Final scratch script is pristine; no mutant remains applied.

Summary: five assigned mutants, two killed, three survived; two genuine behavioral coverage gaps plus one apparently equivalent defensive-guard deletion. Existing C1 code was not refuted by this probe. No production fix, integration, unrelated gate, build, lint, formatter, host change, or admission judgment was performed.
