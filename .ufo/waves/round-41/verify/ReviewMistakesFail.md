RESULT ReviewMistakesFail rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=admitted shown=5/5

Each `## Mistakes` fix was reverted (or its failing input run) in a scratch clone
at fae386aa9e0542710b7a893d84c8e92e86fc079b, cwd /fast/scratch/hyaku/kumitate-r41a2/seats/ReviewMistakesFail/lane.
Clone restored pristine (`git status --porcelain` empty, HEAD=fae386aa); no tools installed; node v24.21.0.

| mistake row | fix | failing input run | shown |
|---|---|---|---|
| calibration (R40-6 seat count) | wave-census --expect | below | yes |
| recurrence (closure README row) | row added at open (34fccc17) | below | yes |
| suite blind spot | injected-failure child self-observation cases | below | yes |
| misroot (fleet-root report) | moved into lane falsify/ | below | yes |
| untested repair (WC21-23) | three wave-census repairs | below | yes |

Row calibration: `node scripts/wave-census.mjs --round 40 --expect build:mutation-tester=4`
→ `FINDING EXPECT_MISMATCH round=40 wave=build build:mutation-tester=4 payload=3`,
`WAVE_CENSUS: DRIFT (rounds=1 waves=2 findings=1)`, exit 1; with `=3` → `WAVE_CENSUS: CLEAN`,
exit 0. Fails on the real slip, matches wave-recount-measured-4e58bb0e.txt.
Row recurrence: deleted `corpus/README.md` row `lessons/round-40-verifier-spotcheck.md` (the
34fccc17 fix); `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` →
`PROXY  error  C2_DRIFT  C2: declared=92 computed=91 delta=-1` and
`PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9`, `PROXY: DRIFT`, exit 1.
Baseline with the row: `PROXY: MATCH (A=9 C=17 ... C2=92/92 coverage=10 ...)`, exit 0.
Row suite blind spot: mutated `scripts/cite-check.mjs` per the frozen counter's own
from/to strings and ran `node scripts/cite-check.mjs --selftest`. With the fix present
(75 cases): suite-group-verdict killed (exit 0, `73/75`, FAIL self-observation line),
suite-any-fail killed (exit 0, `73/75`, FAIL line), suite-exit-json killed (exit 1,
`74/75`), suite-exit-text killed (exit 0, `74/75`). With the fix reverted (the two
self-observation `check(...)` calls removed, 73 cases): all four `survived`, exit 0.
Row misroot: `mv .ufo/waves/round-41/falsify/ReviewCensusCode.md /tmp` then
`node scripts/wave-census.mjs --round 41` → falsify `reports=26/34` and
`absent: ... ReviewCensusCode ...` (absent is a listing, exit stays 0); file restored
byte-identical (sha256 778a35ee...3983) → `reports=27/34`, `WAVE_CENSUS: CLEAN`.
Row untested repair: reverting each attempt-1 repair in `scripts/wave-census.mjs` and
running `node scripts/wave-census.mjs --selftest` — (a) drop the `..` reportOf guard →
`22/23 FAIL WC21`, exit 1; (b) drop the string name+agent fail-closed, restore `String()`
coercion → `22/23 FAIL WC22`, exit 1; (c) rethrow non-FailClosed read errors (pre-repair
main: `if (e instanceof FailClosed) { ... return 2; } throw e;`) → `22/23 FAIL WC23`,
exit 1. Control unmutated: `23/23 VERDICT: PASS`, exit 0. Matches a2-census-repair-mutants.txt 3/3.
All Stryker terms per the frozen definition: killed = at least one case failed while the
mutant/revert was active; survived = all passed, exit 0.
