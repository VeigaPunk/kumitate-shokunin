RESULT CritC1Target verdict=gameable routes=9 uncaught=5 (rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b; counter 0f4108bf:scripts/gate-mutants.mjs sha256 e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a)

Counterexample: two junk scratch commits, neither with any second verdict path, both read `CLEAN frozen=41/41` exit 0 on the frozen counter. K43 judges a kill only from the mutant's output, and none of J1 to J3 catches a suite that fails only when it is mutated.
Counter command for every run: KUMITATE_GATE_MUTANTS_TMP=<seat>/gm-tmpX systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node $G/gate-mutants.mjs --repo <seat clone> --rev <commit>; $G is the counter extracted from 0f4108bf (sha256 above).
- Route A, temp-path tripwire. Scratch commit f9ac7532b090c1a7d66fb4676287f5382c3e7af8 adds 4 lines after `process.exitCode = main();` in both suites: if `--selftest` runs and `import.meta.url` contains `kumitate-gate-mutant-`, print `FAIL  junk-route-A` and `VERDICT: FAIL`, then set exit code 1. Patch: seats/CritC1Target/route-lane.patch, sha256 b5f25382…40ff.
  Output: CONTROL cite-check PASS cases=75/75 floor=75 · CONTROL wave-census PASS cases=31/31 floor=31 · all seven round-43 survivors `killed … confirm=same` · both CONTROL_AFTER PASS · `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=f9ac7532… leftovers=0)` exit=0.
- Route B, own-bytes hash tripwire. Scratch commit cf0c80b9cf24de95eeb27838e7068f01dc3ce256 hashes the suite's own file, minus its SELF_SHA line, and fails on any byte change. Patch: route-lane2.patch, sha256 edc3fcdd…6e8c.
  With the default 4 jobs, two runs each read `ERROR … unstable=2` exit=2 (F-M08 and F-M11, then F-M03 and F-M08) at load average 60–78. With `--jobs 1`: `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 … rev=cf0c80b9…)` exit=0.
- In both routes the wave-census V382, V385 and V387 rows read `killed … exit=1 verdict=PASS`: the output carries both `VERDICT: PASS` and `VERDICT: FAIL`, and K43 (c) accepts that.
Routes (caught means a frozen counter check or a plan kill rule rejects it):
1. Edit the manifest or the lane's gate-mutants.mjs: caught. The manifest, FROZEN_IDS, floors and K43 live inside the extracted counter, which is checked by sha256.
2. Change hasLine semantics in the lane: caught for the same reason (the extracted counter is frozen).
3. Edit the seven literals away: caught. The counter reads `nomatch` and exits 2 (junk control J3).
4. Keep the literals as dead or unreached code: caught. The mutation changes nothing, so the mutant matches the control and reads SURVIVED (exit 1).
5. Raise case totals or pad the tally: UNCAUGHT as a way around the floors, not CLEAN on its own. parseCaseCount sums every `N/M pass` line. A test on the counter's regex returned `{"passed":75,"total":75}` for `1/1 cases passed` plus `PADDING: 74/74 pass`, so 75 and 31 do not prove real cases. Together with route 7 or 8, a suite with one real case reads CLEAN. The plan's "floor lowered" rule only covers the counter constant.
6. Make the control flaky: caught. Controls must pass before and after, and a kill needs an agreeing rerun; the outcome is ERROR, never CLEAN.
7. Tripwire on the harness or on the suite's own bytes (routes A and B): UNCAUGHT. Demonstrated CLEAN exit 0. J1 and J2 fail at the control and J3 at nomatch, but here the control passes and every literal applies once.
8. Two verdict lines: UNCAUGHT. controlPass never requires the absence of `VERDICT: FAIL`, and killedOnce never requires the absence of `VERDICT: PASS`. A suite can print both lines every time, reducing K43 (c) to "exit is not 0".
9. Provenance of the measured commit: UNCAUGHT by any rule. `--repo` accepts any clone (all my runs used scratch clones), and no kill rule ties `--rev` to lane master or checks the header digests against the landed bytes.

Discriminating probes (seats/CritC1Target/probe.sh, each selftest bounded 4G/128 tasks/600 s). Probe 1 runs the unmutated scripts from a directory named `kumitate-gate-mutant-probe.*`. Probe 2 appends the behavior-neutral `// neutral trailing comment`.
  base e5ffcbe: cite-check and wave-census pass both probes (exit=0, VERDICT: PASS, 75/75 and 31/31).
  route A: mutant-path probe fails (cite-check exit=1, 74/75; wave-census exit=1, prints both VERDICT lines). Neutral-byte probe passes.
  route B: mutant-path probe passes. Neutral-byte probe fails (cite-check exit=1, 74/75; wave-census exit=1, both VERDICT lines).

Honest-miss hazard: a load flake can sink real work. Route B's UNSTABLE rows hit mutants that were killed in base. Three sequential manual F-M08 runs on route B bytes gave identical FAIL names, so the flips are load-induced [INFERENCE]; a likely source is WC29 (mkfifo timeout 1 s, census timeout 2 s, wave-census.mjs:531-532). The plan's command has no `--jobs`, so measure on a quiet host. Using `--jobs 1` departs from the frozen command, and the judge may reject that.
Builder hazards: V387 and M19 share the same literal `return pass === results.length ? 0 : 1`. A witness that repeats this text, or repeats the cite-check `…join('\n') + '\n');\n  return verdict === 'FAIL' ? 1 : 0;` pair, makes the literal apply twice; the counter reads nomatch and the claim misses.

Overfitting judgment: a real but narrow gain if the witness re-derives the verdict from the recorded case results; overfitting if it keys on the literals, the harness or its own bytes.
- In base, every one of the seven survivors already prints a FAIL line (fail_lines 1–2); only the exit code or the VERDICT line drops it. The checklist, CI and this gate read exactly those two things, so one-literal faults in the aggregation step are a real way the suites can turn green while failing.
- The gain is narrow. Nothing in the frozen manifest mutates the witness itself, and 43/43 saturates the battery, so afterwards the counter cannot show anything outside these 43 mutants.
- It is overfitting if the witness keys on the seven literals (canary strings or hashes), on the harness (path or environment), or on its own bytes. Routes A and B show the counter cannot tell those apart from real work.

Smallest safe correction (no amendment to K43 or the counter; extra review falsifiers in wave 2):
- Add J4 = the neutral-byte probe and J5 = the mutant-path probe on the measured commit; both must exit 0 with VERDICT: PASS and the full tally.
- Diff checks: `grep -c '^VERDICT: '` is 1 per run, the witness never reads `import.meta.url` bytes, TMPDIR or the path, and every case total comes from records, not printed constants.
- Provenance: the measured rev is an ancestor of lane master, and the header digests equal `git show <rev>:scripts/{cite-check,wave-census}.mjs | sha256sum`.
- Generalization (not counted): 3–5 fresh mutants of the aggregation code outside the manifest, written without seeing the patch.

Impacted axes: operability (the C1 claim and the `gate-mutants` capability evidence) and no-harm. Coverage integers are unaffected.
Hygiene: no lane writes besides this report, no installs, `pgrep -f <seat path>` = 0, counter and gm-tmp dirs removed. Run logs, probe.sh and the two junk clones are kept under seats/CritC1Target.
