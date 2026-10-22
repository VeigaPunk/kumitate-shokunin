RESULT CritC1AltOperators rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=limits alt_survived=1/16 extra_survived=5/17 nomatch=0 crash=0 control=PASS
Scope: a width probe outside the C1 counter. One second operator per condition, each different from the counter's drop-to-constant mutant. A surviving mutant is recorded as a limit, not as a refutation. Clone: /fast/scratch/hyaku/kumitate-r41/seats/CritC1AltOperators/lane, detached at the revision above. Probe: seats/CritC1AltOperators/alt-mutants.mjs. Its harness and kill rules are copied from probe/cite-verdict-mutants.mjs.txt. Full output: seats/CritC1AltOperators/alt-run.txt.
Command: TMPDIR=$S node alt-mutants.mjs --lane $S/lane --rev 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3
  CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0
Primary operators. Killed means at least one FAIL case line in the run:
  killed: warn-total (negate the guard) 73/75; resolved-kind-gate (negate the guard) 72/75; strict-conjunct (&& to ||) 74/75; strict-warn-arm (outer || to &&) 71/75
  killed: resolved>0 (&& to ||) 70/75; citeCheck-map (swap the arms) 72/75; render-env-empty (=== to !==) 73/75; render-env-zero (swap the arms) 74/75
  killed: exit2-empty (=== to !==) 72/75; exit2-zerores (swap the arms) 73/75; exit0/1-map (return 2 instead of 1) 74/75; parse-64 (return 2 instead of 64) 74/75
  killed: suite-group-verdict (boundary, failed > 1) 73/75; suite-exit-json (swap the arms) 74/75; suite-exit-text (return 2 instead of 1) 74/75
  ALT suite-any-fail [some-to-every] survived exit=0 cases=75/75 fail_lines=0
  ALT_TOTAL survived=1/16 nomatch=0 crash=0
Extra operators (17). Twelve were killed: warn += 2, warn > 1, resolved >= 0, the DRIFT label changed to FAIL, both environment-check reorders, the fail-closed return changed from 2 to 1, the exit swap, return 1 instead of 64, the group-verdict swap, the json exit returning 2, and the text exit swap. Five survived:
  EXTRA resolved-kind-gate [f.kind === 'OK' -> f.severity === 'note'] survived 75/75
  EXTRA strict-conjunct [totals.warn > 0 -> totals.warn >= 0] survived 75/75
  EXTRA resolved>0 [totals.resolved > 0 -> totals.resolved > 1] survived 75/75
  EXTRA suite-any-fail [suites[suites.length - 1] only] survived 75/75; [suites[0] only] survived 75/75
None of the six survivors is an equivalent mutant. Each command below compares an unmutated copy (ctl) with the mutant, using the same layout and arguments (--src /fast/scratch/hyaku/kumitate-pin/src at 31c465f1):
  some-to-every: KUMITATE_CITE_SELFTEST_INJECT_FAIL=1 node <v>/scripts/cite-check.mjs --selftest --integrations --src $P
    ctl:   73/74 cases passed (hermetic) 0/0 cases passed (integration) VERDICT: FAIL exit=1
    every: 73/74 cases passed (hermetic) 0/0 cases passed (integration) VERDICT: PASS exit=0
  severity==note: node <v>/scripts/cite-check.mjs --src $P --self $L --json   (ctl resolved=7658, mutant resolved=9240, both exit=1)
  warn>=0: a fixture with one citation, `crates/ufo-cli/Cargo.toml:1`, run with --strict   (ctl: VERDICT: PASS exit=0; mutant: VERDICT: FAIL exit=1, errors=0 warnings=0)
  resolved>1: a fixture with one bare path, `crates/ufo-cli/Cargo.toml` (tokens=1)   (ctl: VERDICT: PASS exit=0; mutant: VERDICT: FAIL exit=1)
Why they survive:
  suite-any-fail: under --selftest the suite has exactly one group, so some, every, first-only and last-only cannot be told apart. Both self-observation children also run --selftest alone (lines 2465 and 2471). The aggregation across groups is never observed.
  resolved-kind-gate: none of the fixtures produces a non-OK finding with note severity (FRAGMENT, RESOLVED_BY_CONTEXT, FP_EXEMPT and similar, lines 218-221), so "resolved === okCount" cannot tell kind from severity.
  strict warn>=0: no case runs --strict on a set with zero warnings. A clean strict run is never asserted to PASS.
  resolved>1: every fixture that should PASS resolves at least two tokens. The case named "clean fixture with one resolved citation" measures `filesScanned=2 resolved=4` (two path:line citations, each counted twice). The warn-only case measures `resolved=2 okFindings=2`. The case name and the line 2388 comment ("one resolved citation") describe more than the fixtures actually contain.
Effect on the claim: the counter (survived=0/16) holds as defined in plan.md. The lesson's unqualified sentence "now pins the 16 ... conditions" is wider than that evidence for suite-any-fail: only its drop-to-constant form is pinned, and its any-group behavior is unobserved. Affected axis: operability (the self-test is its own observer).
Smallest safe corrections, recorded only (no patch, since this seat is a critic):
  (1) Add one hermetic child case: INJECT=1 --selftest --integrations --self <empty fixture> must end VERDICT: FAIL with exit 1 (this kills every, first-only and last-only).
  (2) Add one note-severity non-OK finding to the warn-only fixture (kills severity==note).
  (3) Assert that a clean fixture run with --strict reads PASS (kills warn>=0).
  (4) Make the clean fixture resolve exactly one token, for example with one bare path (kills resolved>1), or reword the case so it says what the fixture contains.
  Alternatively, qualify the C1 sentence as "pins the 16 drop-to-constant mutants".
Tools installed or updated: none. Lane files written: this report only.
