RESULT CritPrimaryOnlySwitch rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=weak objections=2
Scope: scripts/cite-check.mjs at 84cb1d5d; clone /fast/scratch/hyaku/kumitate-r43/seats/CritPrimaryOnlySwitch/lane. Axis: operability. C1's measured CLEAN result is NOT affected (third claim below).
Objection 1 (fixable defect): line 2664 `if (witnessFailures > 0 && process.env.KUMITATE_CITE_SELFTEST_PRIMARY_ONLY !== '1')` reads the switch at any depth, including depth 0. The comment at 2463-2464 says "the parent never sets it", but nothing in the code enforces that. INJECT_FAIL, by contrast, is honoured only when depth > 0 (line 2466 `selftestDepth41 > 0 && ...`).
Objection 2 (real-run reach): SKILL.md:678 is a checklist item, `node scripts/cite-check.mjs --selftest` → exit 0 + `VERDICT: PASS`, and it runs in the operator shell, which passes its environment through. If the switch is inherited from that shell, the witness is off, and the suite falls back to the round-open behaviour that let the three verdict-path mutants survive.
Matrix (1 run per cell): runmatrix.sh in the seat directory, each run through `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node <variant>/cite-check.mjs --selftest`, with the inherited env cleared and one variable set (none, P1 = PRIMARY_ONLY=1, I1 = INJECT_FAIL=1). The mutants are the frozen counter's from/to literals, each applied once (mkvariants.mjs).
  base                      none/P1/I1  exit=0 VERDICT: PASS 75/75     (on unmutated code the switch has no effect)
  base--suite-group-verdict none exit=1 VERDICT: PASS + VERDICT: FAIL 73/75 | P1 exit=0 VERDICT: PASS 73/75 | I1 exit=1 + FAIL
  base--suite-any-fail      none exit=1 VERDICT: PASS + VERDICT: FAIL 73/75 | P1 exit=0 VERDICT: PASS 73/75 | I1 exit=1 + FAIL
  base--suite-exit-text     none exit=1 VERDICT: FAIL 74/75 | P1 exit=0 VERDICT: FAIL 74/75 | I1 exit=1 VERDICT: FAIL
  Counterexample: with P1 inherited, suite-group-verdict and suite-any-fail meet the checklist's "exit 0 + VERDICT: PASS" while two FAIL case lines are printed. suite-exit-text exits 0, so it passes any caller that checks only the exit code. Inherited I1 is ignored, as designed.
Does it matter: only when the primary verdict or exit path is itself defective. That is the witness's only job, so an inherited switch silently removes the protection C1 added. Normal scan mode never reads the switch (static: its only reads are lines 2465 and 2664, both inside selfTest(), which starts at line 1841). JSON mode has no witness, so the switch does not affect it.
Gate immunity (C1's measurement holds): gate-mutants sandboxEnv() passes only PATH, HOME, TMPDIR, LANG and TZ to the selftest (frozen counter lines 108-116).
  KUMITATE_CITE_SELFTEST_PRIMARY_ONLY=1 KUMITATE_GATE_MUTANTS_TMP=<seat>/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node <seat>/counter.AcogO3/gate-mutants.mjs --repo <seat>/lane --rev 84cb1d5d8e703aafd4f73d887ba4237692ff13f9
  → GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=84cb1d5d… manifest=8486506f… leftovers=0) exit=0 (run twice, both CLEAN, both exit 0)
  The counter is the frozen copy: sha256 e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a, extracted from 0f4108bf.
Is a selftest-only env knob acceptable? Yes in principle: the primary-only child is what keeps the primary mapping observable without the source-reading literal detector that addendum A1 rejects. It is not acceptable unguarded, because it is the one selftest knob that a depth-0 run honours.
Smallest safe correction (strictly better; tested): honour the switch only inside the injected self-observation child.
  const primaryOnly = Number(process.env.KUMITATE_CITE_SELFTEST_DEPTH ?? '0') >= 1
    && process.env.KUMITATE_CITE_SELFTEST_INJECT_FAIL === '1' && process.env.KUMITATE_CITE_SELFTEST_PRIMARY_ONLY === '1';
  if (witnessFailures > 0 && !primaryOnly) {
  The INJECT_FAIL conjunct means that whenever the switch is honoured, the run also carries the injected failing case, so an unmutated real run can never end PASS because of it. A depth-only guard is weaker: it is bypassed by an inherited DEPTH>=1, which is a hand-set test value.
  The guard's text does not match any of the 16 frozen cite-check literals. The guard-outer-* literals `process.env[INJECT41] !== undefined` still apply exactly once.
  Guard matrix (same command): guard none/P1/I1 exit=0 PASS 75/75; guard--suite-group-verdict, guard--suite-any-fail and guard--suite-exit-text all exit=1 with a `VERDICT: FAIL` line under none, P1 and I1.
  Frozen counter on the guard commit (scratch commit 524398248a0cd1fc84249afca08a473934731a0c, parent 84cb1d5d): same command, --rev 52439824…
  → GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=52439824… leftovers=0) exit=0 (run twice, both CLEAN, both exit 0); controls cite-check 75/75 (floor 75), wave-census 32/32 (floor 31), CONTROL_AFTER both PASS.
  Selftest wall time: 1.5-1.8 s base, 1.6-2.0 s guard (single runs, loaded host); no measured cost change.
Patch (guard only, against 84cb1d5d): <seat>/CritPrimaryOnlySwitch.patch sha256 52e9c86e75edc2dc910dfd18a3eb22808f42e3b7608ec4587850d5a076526497
Patch per contract (diff e5ffcbe7f155b89cb1870f9da7b0d671d092948b -- scripts/cite-check.mjs; includes the round-43 witness): <seat>/CritPrimaryOnlySwitch-vs-e5ffcbe7.patch sha256 31755fd3a9923b64938c8e7bb8c46a7c4b04478d9ffaf522a943b09ef1efdc10
Residual (not tested): no case locks the guard itself, so a mutant that drops it would survive. The [INFERENCE] note in the wave-1 ExecCiteWitness report already names standalone witness mutants as a limit.
Impacted axes: operability (the witness can be switched off silently in the checklist path). Not impacted: C1's frozen-counter score, since the gate's environment is allowlisted.
<seat> = /fast/scratch/hyaku/kumitate-r43/seats/CritPrimaryOnlySwitch. Leftover processes after every run: none (pgrep -af <seat>). gm-tmp is empty after each run. No tools were installed or updated.
