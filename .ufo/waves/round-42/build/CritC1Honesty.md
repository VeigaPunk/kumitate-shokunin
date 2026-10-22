RESULT CritC1Honesty rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=fixable objections=4

Impacted axis: operability. Ruling: A +1 is honest. The +2 C is honest only if objections 1-3 are fixed. The 8 -> 9 integer move does not depend on them, because A+C = 27 already gives 9.
Objection 1 (strongest): the plan's kill rule contradicts the frozen counter. The plan says killed = exit non-zero AND a `VERDICT: FAIL` line. Under that rule, 6 of the 21 frozen ids I could rebuild survive at b237e3f, so "41 killed, CLEAN, exit 0" cannot be reached by touching only gate-mutants.mjs. Round 41 credited these kills under a looser rule: any non-zero exit, `FAIL ` line or `VERDICT: FAIL`. Swapping to that rule would change the counter's identity. It would also credit mutants the checklist judge cannot see, because surface-probe passes an item when its exit code is accepted and the substring is present (surface-probe.mjs:1007-1012). Under suite-group-verdict, suite-any-fail and V382, `cite-check --selftest` or `wave-census --selftest` exits 0 and prints `VERDICT: PASS`.
Objection 2: the C term counts listed items, not passing ones (proxy-check.mjs:478 and :916 `RE_CHECKLIST = /^\s*- \[/`; SCORECARD round-35 correction). A gate that reads SURVIVED (exit 1) still earns +1 C. Nothing in the proxy ties the +2 C to the gate actually being CLEAN.
Objection 3: CLEAN can be vacuous. The manifest is embedded in an unpinned file that its own author can edit. Deleting an id, or re-anchoring a `from` literal so a survivor drops out, still prints `GATE_MUTANTS: CLEAN`. The checklist substring would most likely be `GATE_MUTANTS: CLEAN`, and nothing enforces the frozen 41 ids [INFERENCE: the gate is not written yet; ExecGateMutants' clone has no scripts/gate-mutants.mjs at 19:58Z].
Objection 4: adding scripts/gate-mutants.mjs creates a fourth `PIN_UNPINNED` warning (proxy-check.mjs:1044-1057 covers every scripts/*.mjs). R41-2's `--strict` target of 3 -> 0 must count it, under the round-34 ruling that v1 is not widened.
Non-objection: the gate is not padding by construction. It catches test-suite erosion that no existing checklist item catches (demonstration below). It is the first semantic guard of any kind for wave-census, which has no pin. Precedent is consistent: each gate since round 34 got a verdict item plus a hermetic-suite item, while rounds 14 and 19 got a verdict item only.
Can the verdict item fail on real regressions? Yes. If a selftest case is weakened (erosion), the matching mutant survives and the gate exits 1. If a refactor moves a literal, the gate fails closed as `nomatch` (exit 2), which is a false red that forces a manifest edit (objection 3). The gate cannot catch code bugs beyond what the target selftests already test at the 41 frozen points. The selftest item is fixture-only, like all eight existing hermetic-suite items.
Evidence that would defeat the objections: (1) the gate's kill rule pinned to what the checklist judge sees (exit code plus verdict line), and the 6 measured survivors either killed by suite fixes (outside C1's declared file set, so the plan needs amending) or reported as SURVIVED with no CLEAN claim; (2) the verdict item counted only at a measured exit 0; (3) a frozen 41-id list enforced in the gate (a missing id gives exit 2, with a selftest case for it), and a verdict line `frozen=41/41` that the checklist substring names; (4) the strict warning total measured including gate-mutants.mjs.
Smallest safe correction: keep the plan's kill rule, add the frozen-id floor and `frozen=41/41` to the checklist substring, and claim only what the measured exit shows.
Tool installs: none.

Evidence (scratch clone /fast/scratch/hyaku/kumitate-r42/seats/CritC1Honesty/lane at b237e3f09c9559e130c7367bd2efa981c4ea516f; cite-check sha256 896f0720..., wave-census d6068d1b...)
$ timeout -k 5 900 setsid -w node killrule.mjs lane manifest.json   (16 cite-check ids from round-41/probe/cite-verdict-mutants.mjs.txt with the same literals, plus 5 wave-census ids whose literals are quoted in round-41/final/a2-census-*-mutants.txt; each run in its own process group, 60 s timeout, group kill; scrubbed KUMITATE_* variables)
CONTROL cite-check exit=0 VERDICT: PASS
CONTROL wave-census exit=0 VERDICT: PASS
MUTANT cite-check:suite-group-verdict plan=survived r41=killed exit=0 verdict=PASS fail_lines=2
MUTANT cite-check:suite-any-fail plan=survived r41=killed exit=0 verdict=PASS fail_lines=2
MUTANT cite-check:suite-exit-text plan=survived r41=killed exit=0 verdict=FAIL fail_lines=1
MUTANT wave-census:M19-selftest-exit-const plan=survived r41=killed exit=0 verdict=FAIL fail_lines=1
MUTANT wave-census:V382-pass-count plan=survived r41=killed exit=0 verdict=PASS fail_lines=1
MUTANT wave-census:V385-verdict-const plan=survived r41=killed exit=1 verdict=PASS fail_lines=1
(the other 15, incl. parse-64 and M22, read plan=killed r41=killed exit=1 verdict=FAIL)
SUMMARY mutants=21 plan_rule_survived=6 r41_rule_survived=0   [exit=0, 26 s wall; leftovers=0 tmpdirs=0]
V387 has the same literal as M19 and was not run twice. The other 20 wave-census ids are described but not quoted in the receipts, so they are unverified here.
Same pattern in the committed receipts: round-41/final/cite-mutants-final-fae386aa.txt `suite-any-fail killed exit=0 cases=73/75`; a2-census-survivor-mutants.txt `V382-pass-count killed exit=0 ... VERDICT: PASS`.
Erosion demonstration (a real regression the existing items miss): in a scratch copy, cite-check.mjs:2450 `ok: r.status === 64` -> `ok: true`
$ (cd eroded && node scripts/cite-check.mjs --selftest | tail -2)  ->  75/75 cases passed (hermetic) / VERDICT: PASS / selftest_exit=0   (checklist item SKILL.md:676 stays green)
$ timeout -k 5 120 setsid -w node killrule.mjs eroded manifest-parse64.json  ->  MUTANT cite-check:parse-64 plan=survived r41=survived exit=0 verdict=PASS   (gate-mutants would exit 1)
Cost: wave-census --selftest took 1735 ms; 21 mutants took 26 s. [INFERENCE] The full 41 would take about 60 s against surface-probe's CHECKLIST_TIMEOUT_MS = 120_000 (surface-probe.mjs:241), a 2x margin.
$ node -e 'for (const n of [26,27,28,29]) console.log(n, Math.floor(10*n/(n+3)))'  ->  26 8 / 27 9 / 28 9 / 29 9
Pre-registration: the SCORECARD round-41 "Planned next round" listed R40-4 caps and pinning the 14 cite-check severity decisions, not gate-mutants. The frozen 41 add no new kills at landing; only the R41-3 extras do.
