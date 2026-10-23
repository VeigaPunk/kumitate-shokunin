# CritC2Shape — C2 padding and predicate attack

Scope: advisory criticism of the frozen attempt-2 proposal, not a canonical verdict, admission, or implementation review. Primary axis: **operability**; secondary risk: **calibration** (claiming more than the command establishes). Plan and addendum read first. No candidate code, predicate, axes, routes, or judgment changed.

Citation key: `plan.md`, `probe/`, `build/`, and `r48-spec.json` below are relative to `.ufo/waves/round-48/`; other lane paths are relative to the lane root. “Canonical AXES” means `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/AXES.md`. The campaign-goal path is relative to the lane root.

## Advisory ruling on padding

**The categorical padding charge is not established. The defensible capability is narrow: a reusable, fail-closed comparator of K real probe invocations, with inspectable per-run evidence.** It is not a second routing capability, an independent observer, a receipt custodian, or a complete repair of R47-1/Mistake 3.

The prosecution has real evidence:

- The lane already has shell-generated receipts recording command, exit, load, probe digest and revision: `probe/receipts/stab-r48-f00cf278-1.txt:13–14` and `probe/receipts/stab-r47-f00cf278-{1,2,3}.txt:22–23` under this round. A new filename or an A/C proxy increase alone adds no demonstrated ability.
- R47-1 was not simply an inability to repeat a command. Three readings existed but were IRC quotes from cancelled seats, not committed receipts (`corpus/lessons/round-47-verifier-spotcheck.md:183–185`). A wrapper does not itself commit its output or recover omitted evidence.
- Mistake 3 concerns lost exec observations and equality with base (`corpus/lessons/round-47.md:129–134`). C2 compares final summary bytes, not exec records. F48, not C2, owns `exec_count_ne_base` and the three-run routing label (`probe/caproute48-probe.mjs:347–377`).

The defense is stronger than “the script exists”:

- This is a concrete routed failure, not invented demand: inherited `build/a2-rerun-{1,2,3}.txt:6–11` document 3/5, 3/5, 4/5 on the same revision and probe digest. These are inspected inherited artifacts, not executions or durability verification by this seat.
- C1 now explicitly requires the L1 score plus every committed same-commit rerun, at least two (`plan.md:67–71,103`). An executable comparison with negative fixtures can prevent treating one green invocation as the whole result.
- `wave-census` does something different. Its capability row counts payload seats, roles, report presence and declared counts (`SCORECARD.md:1726`); its own contract disclaims inferring dispatch or outcome from those files (`scripts/wave-census.mjs:6–39`). It neither executes a counter repeatedly nor compares its summaries. Report presence is not probe agreement.
- The lane's own instruments are expressly core (`PROVINCE.md:15`). No cited capability rule demands multiple consumers; the capability criterion is demonstrated running, not row count (canonical `AXES.md:57–64`). One consumer is a maintainability concern, not by itself a falsification.

**Smallest safe boundary:** describe only the demonstrated comparator and its supported summary contract. Keep F48 authoritative for routing/count equality, the C1 kill rule authoritative for the full set of reruns, and commits authoritative for durability. Do not claim statistical flake-freedom, generic probe correctness, automatic R47-1 closure, or a second axis increase. Both proposed claims name operability; any claim-count/admission issue belongs to the canonical Rust judge, not an invented replacement axis. Integer saturation is not evidence of a new capability.

There remains a genuine policy tradeoff: the campaign quality bar allows own-province tooling shown running (`../.scratch/goal-20261022-hyaku-12h.md:145–149`), while its anti-loop rule forbids new campaign tooling (`:182–184`). A lane-local comparator for its actual gates has a defensible province case; a new fleet campaign/custody framework would not. That boundary is for the canonical judge; this report grants no exemption.

## Finding C2-S1 — PASS text is not selftest observation

**Counterexample [INFERENCE; not executed]:** replace only `--selftest` with an unconditional `COUNTER_RERUN_SELFTEST: PASS` / exit 0, leaving the ordinary comparator correct. It passes the selftest output check in the predicate sentence and can still produce the required real AGREE receipt. Thus those two observed green outputs alone do not establish that the flake case ever ran.

A related weak control is to feed the program an invalid probe that merely prints `PASS`. Rejecting that output as unparsable proves a parser arm, not the equality arm: an implementation with summary comparison deleted could reject that stub too. These two meanings of “print-PASS stub” must not be conflated.

**What makes the flake case mandatory:** the explicit additional kill-rule sentence at `plan.md:113`, not the `COUNTER_RERUN_SELFTEST: PASS` prefix at `:109`. The builder assignment also requires hermetic fixtures, at least eight cases, a differing-summary flake, and exercising the real probe path (`r48-spec.json:49`). Ignoring that kill-rule clause would accept a weaker claim than the frozen assignment.

**Smallest safe correction, enforcing the existing requirement before data:** commit independently inspectable mutation evidence, not just a selftest banner. The mandatory flake fixture must:

1. Run through the actual public probe-invocation/comparison path with K at least 2, using valid summary syntax and **exit 0 on every child invocation**.
2. Produce distinct final summary bytes across those invocations; record that all K invocations occurred and require `COUNTER_RERUN: DISAGREE`, exit 1. Otherwise the test could succeed merely because a child failed or output did not parse.
3. Reject an otherwise evaluable mutant that always reports AGREE or ignores later summaries. Separately exercise valid identical exit-0 summaries (AGREE/0) and identical summaries with a nonzero child (DISAGREE/1). This distinguishes the two conjuncts in the frozen iff.
4. Have the mutation check observed outside the replaced selftest branch. A selftest cannot attest against replacement of its entire body by a green printer. Record which component was stubbed, the mutant bytes/digest or patch, the invocation, observed finding and exit, and the restored control. A helper-only test or a syntax-error mutant is not this evidence.

K=1 can agree vacuously; the frozen sentence does not forbid it. Do not silently change its domain. Use K>=2 for the demonstration and flake control (the builder already requests 2).

**Impact:** operability and calibration. **Fatal condition:** if only the prefix/exit and a happy-path receipt are accepted, C2's mandatory mutation-control obligation is unestablished; a print-PASS selftest remains observationally indistinguishable. This is fixable by satisfying the existing kill rule, not permission to edit the frozen predicate after data. No mutation was run by this critic.

## Finding C2-S2 — the requested base AGREE is impossible

The builder's demonstration request names `f00cf278 --set r48`, `--runs 2`, and says “expect AGREE with both runs held=0/4 byte-identical, or DISAGREE” (`r48-spec.json:49`). The frozen predicate requires **every child exit 0**, not merely matching output.

This is contradicted by both code and a committed reference:

- `probe/caproute48-probe.mjs:377–378` prints the summary and exits 0 only when all sites are held; otherwise exit 1.
- `probe/receipts/stab-r48-f00cf278-1.txt:13–14` is `held=0/4`, exit 1, with the frozen F48 digest `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

**Therefore, repeated normal base readings must produce DISAGREE/1 under C2, however identical their summaries are.** Calling that AGREE would violate the predicate. Reporting that DISAGREE honestly is useful negative evidence, but it cannot replace the kill rule's committed real AGREE receipt (`plan.md:113`). This is a spec-example error, not grounds to weaken the iff.

**Smallest safe correction without changing the predicate:** retain the base r48 DISAGREE receipt, then obtain a new real AGREE invocation on a genuinely passing F48 target. The literal C2 kill sentence does not constrain set or target revision: `--set r47` at `f00cf278` has three existing F48 references at `held=5/5`, exit 0 (`probe/receipts/stab-r47-f00cf278-{1,2,3}.txt:22–23`). That is an available independent target, **not a promise that a new invocation will pass and not a substitute for executing C2**. Alternatively use a passing r48 C1 revision. Label instrument revision and probe-target revision separately; never claim the latter is the C2 commit merely because the wrapper ran there.

**Impact:** operability, false-provenance risk, and claim separability. **Fatal condition:** a C2 closure containing only the requested base DISAGREE, or relabeling identical exit-1 runs AGREE, misses the frozen acceptance. If a same-revision/r48-only requirement was intended, that is stronger than the written C2 sentence and cannot be silently added after data. Communicated this conflict to ExecCounterRerun and ReviewPlanAddendum; the latter independently acknowledged it.

## Finding C2-S3 — do not inflate agreement into a stronger observer

The strongest local warning is visible without inventing a fixture: inherited `build/a2-rerun-1.txt:6` and `a2-rerun-2.txt:6` have **identical aggregate summaries** (`held=3/5`), but their SITE lines differ in which sites hold and in exec counts (`:1–5`). C2 would reject these particular invocations because they exit 1; the example nevertheless proves that final-summary equality is not equality of the underlying observations.

For F48 the summary includes revision, base, set, held total, run count and rule, but not each site's counts (`probe/caproute48-probe.mjs:375–377`). The frozen inner counter supplies that stronger check. C2 cannot repair a counter that falsely returns exit 0 with a constant clean summary, and cannot discover a later committed wave rerun outside its chosen K invocations.

**Smallest safe correction:** keep and cite the per-run evidence and F48 identity; narrow the capability wording to the actual iff. Do not add a second route judge or silently compare full transcripts instead of the frozen final-summary contract. A receipt must identify what qualifies as the final summary: the plan does not itself give its grammar or stream/framing rules. The flake and print-PASS controls must use the same documented parser as the real frozen-probe receipt; a heuristic that accepts any last line is not evidence of fail-closed parsing. If this ambiguity cannot be resolved from the implementation and committed control evidence, name it as an unestablished predicate component, not a passed generic-probe capability.

## Evidence and handoff

This was a read-only proposal attack plus this report. No runtime/judge, probe, selftest, build, test suite, or mutation was invoked; no clone, code patch, git/jj mutation, or tool installation/update was made. Existing receipts were inspected, not re-executed or certified committed by this seat. The L1 must obtain and commit the concrete flake/stub mutation evidence and a genuine exit-0 F48 AGREE receipt at the C2 instrument revision, while retaining C1's independent same-commit rerun obligations. Nothing here amends the frozen predicate.
