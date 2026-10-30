VERDICT: Both experimental weakenings survived the already-red base verdict, but isolated behavioral witnesses exposed their removed requirements; exact counter bytes were restored and scratch removed.

## Evidence
Axes: operability (load-bearing counter checks), coverage (negative-control sensitivity), confinement (frozen bytes unchanged).
Frozen plan: `.ufo/waves/round-69/plan.md:77-79,142-150`; freeze `9401d8655970d542b81d318bdad558d6dea39397`; measured base `14057f3e3899180c95713bace088fb9c0d0046e3`.
All evidence paths below are relative to the lane. B = `.ufo/waves/round-69/build/K69MutCounterChecks`.
Executed the same `node B/detector.mjs pristine`, `mutated`, `restored` detector after preparing each scratch state. Driver exit 0 on all three runs; individual counter exits below were 1, not passes.
The driver runs each complete counter over the base, with TMPDIR explicitly confined, ledger seed `696969c1base`, and live deprecation checks enabled. A scratch git wrapper checks fixture toplevel before git writes; no lane git writes occurred.
Full outputs: `B/pristine.txt:1-13`, `B/mutated.txt:1-13`, `B/restored.txt:1-13`.

Pristine ledger verdict (exit 1), verbatim:
```text
LEDGER69_UNMET held=1/7 checks=7 rev=14057f3e3899180c95713bace088fb9c0d0046e3 rule=L69 seed=696969c1base | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=2 verdict=ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L4 MISS seed=696969c1base 7/20 mutants wrong: good:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo;ordinal:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=8 open=7 clo;one-word-quote:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo;ambiguous-quote:exit=1:ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 clo | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift+pathname-dispatch | L6 MISS skill-row=false quality=true capability-row=false
```
The mutated ledger is still `LEDGER69_UNMET held=1/7 checks=7`, exit 1; its L5 reports `real-tool-passes-L4=false stubs-caught=always-clean+always-drift` (`B/mutated.txt:9`). Restoration reproduces the pristine verdict (`B/restored.txt:9`).
All three deprecation runs produced this identical verdict (exit 1):
```text
DEPREC69_UNMET held=9/11 checks=11 rev=14057f3e3899180c95713bace088fb9c0d0046e3 rule=M69 live=exercised | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent
```

Isolated L5 negative-control witness, pristine then mutated then restored (`B/{pristine,mutated,restored}.txt:2-3`):
```text
WITNESS harness_wrong=0
L5 MISS real-tool-passes-L4=true stubs-caught=always-clean+always-drift
WITNESS harness_wrong=0
L5 HELD real-tool-passes-L4=true stubs-caught=always-clean+always-drift
WITNESS harness_wrong=0
L5 MISS real-tool-passes-L4=true stubs-caught=always-clean+always-drift
```
The witness is the reviewed round-68 conforming v2 draft, placed in the pathname-dispatch stub slot in both extracted L5 arms. This deliberately models a third negative control escaping the harness. The same production 20-fixture harness runs the real tool, the witness and the constant stubs. No fixture expectations or paths are weakened; only the specified counter mutation differs. The witness passes every fixture, so requiring three caught controls rejects it; requiring two ignores that escape. This is a meta-check witness, NOT evidence that the reviewed implementation is a malicious pathname forgery.

PINNED_URL witness, pristine/mutated/restored (`B/{pristine,mutated,restored}.txt:4-6`):
```text
PINNED_URL ref=main accepted=false
PINNED_URL ref=main accepted=true
PINNED_URL ref=main accepted=false
```
Both the full 40-hex commit and `v18.13.1` controls remained accepted in all three states. The exact test URL is generated in `B/detector.mjs`: raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/<ref>/docs/community/feature-lifecycle.mdx.

SHA256 restoration evidence (`B/{pristine,mutated,restored}.txt:1`):
| Counter | Pristine = restored | Mutated |
|---|---|---|
| ledger | 1f19d1e6e36329a8af0ff17469c7baab740a58cfbcf9d4875ee37c2bb7f946de | 5761f141301a1e2ccd95161f99a3de87dfd781c9e3c9e0aeac0a106050e7e90c |
| deprec | af021f87a33f50bb529bf7f06780cc910e2aeb2d230db294d7edfb36dd2852e7 | 0e80193f444b84bb1bf227cba5864c92d77c2ea67d2e88dc8c0241f0e4630731 |
Cleanup receipt `B/cleanup.txt:1`: `scratch_removed=true`.

## Findings
1. **K69MutCounterChecks-1 — medium, counter-test coverage:** m1 removes the pathname-dispatch control and changes `caught.length === 3` to `=== 2`. Base verdict alone is **inconclusive**, not a killed mutant: L4 already fails and L5 is intentionally nonvacuous. The isolated negative-control detector **kills the mutation**: the same uncaught third witness causes pristine/restored MISS but mutated HELD. Thus the third-control requirement is load-bearing at the L5 boundary. This does not establish a new defect in frozen L69. Reproduce: prepare the scratch copies and git guard described below, then run `node <lane>/B/detector.mjs mutated`; compare with pristine/restored receipts.
2. **K69MutCounterChecks-2 — medium, origin-authentication coverage:** m2 replaces the raw-host commit/tag requirement with acceptance of any raw.githubusercontent.com URL, retaining the existing commit.patch alternative. Base verdict alone is **inconclusive** because `Capture origin` is absent, so M11 never reaches PINNED_URL. The extracted predicate detector **kills the mutation** on `main`, with commit/tag positive controls unchanged. At MEASURED time, a moving-ref mirror would satisfy the weakened URL arm; if all remaining row, capture, table and live-digest checks also held, it could authenticate despite not being content-pinned. Live hash equality still checks bytes at counting time; it does not restore reference immutability. This measured-time consequence is an inference from `probe/deprec69-probe.mjs:465-480,511-541`, not a claimed end-to-end HELD fixture. Reproduce with the same detector's raw-URL cases, recorded at receipt lines 4-6.

Reproduction setup: use absolute lane/build paths, create only `/fast/scratch/hyaku/kumitate-r69/K69MutCounterChecks`, copy frozen probes there as `EXPERIMENT-ledger.mjs` and `EXPERIMENT-deprec.mjs`, and copy executable `B/git-guard` to its `guard/git`. Run the detector with `pristine`; replace those two scratch files with the preserved `B/EXPERIMENT-*-mutated.mjs` copies and run `mutated`; restore from frozen probes and run `restored`; remove the seat scratch directory in a finally/trap. Every detector invocation uses the identical script. Do not substitute a live integration revision for the pinned base.

## Artifacts
- `.ufo/waves/round-69/w1/K69MutCounterChecks.md` (this report).
- `B/detector.mjs`, `B/git-guard` (reproducible experimental detector and fixture guard).
- `B/EXPERIMENT-ledger-mutated.mjs`, `B/EXPERIMENT-deprec-mutated.mjs` (explicitly labeled experiments; never committed or integrated by this seat).
- `B/pristine.txt`, `B/mutated.txt`, `B/restored.txt`, `B/cleanup.txt` (durable receipts).

## Limits
No MEASURED candidate, new malicious pathname-dispatch implementation, full moving-ref origin fixture, integration, or score judgment was attempted. A witness passing L4 is intentionally used only to test L5's negative-control cardinality. Already-red base checks cannot kill either mutation. No tools installed/updated. No frozen source, subject, lane index or sibling file edited.
Self-evaluation (accuracy/completeness/clarity/actionability/conciseness): 4/4/4/4/4, mean 4.0. Evidence: exact three-state receipts and hashes; limits explicitly distinguish isolated witnesses from full HELD fixtures; reproduction requires the named scratch setup, and the report is dense. Improvement: a separate measured-time moving-ref fixture would strengthen end-to-end evidence, but is outside this assigned base-plus-explanation probe.
