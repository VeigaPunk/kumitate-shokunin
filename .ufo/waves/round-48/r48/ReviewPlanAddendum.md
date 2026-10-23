# ReviewPlanAddendum — attempt-2 addendum vs frozen sections, R47-1..R47-5, kill rule

Seat: `ReviewPlanAddendum` (reviewer, wave `r48`, attempt 2). Item: consistency review of the attempt-2 addendum (`plan.md:94-133`) against the frozen sections (`plan.md:1-91`) and the routed defects R47-1..R47-5 (`corpus/lessons/round-47-verifier-spotcheck.md:181-200`).
Method: read-only; verified receipts/commits/bytes directly (probe sha256, stability receipts, a2-rerun/checklist receipts, A48 receipt set, control-mutant patches+receipts, counter source, patch source, wave spec/dispatch). No run, no code change, no tool installed (no install needed).

## Verdict

The addendum covers each routed defect (R47-1..R47-5), either directly or through the inherited freeze, and does not contradict the frozen kill rule's core invariants (frozen counter rule, no post-score amendment, exit-2 never a score, pre-data control forces amendment). The A48 amendment is consistent with the kill rule's amendment clause (triggered by a genuine pre-data control reading `ROUTED_HELD`, done before any candidate score). Findings below are defects/gaps for the L1 to resolve before close.

## Findings (by severity)

### F1 — [moderate] A48 r47 re-score contradicts the addendum's own expectation and breaks H2 as written

- A48 section (`plan.md:131`): "r47-set stability at `f00cf278` (expect 5/5 — H2 evidence)".
- Measured receipt `r48/A48-stab-r47-f00cf278.txt:22-23`: `CAPROUTE48 rev=f00cf278… base=0bd8be60 set=r47 held=2/5 runs=3 rule=F48+A48` exit 1. `SC549`, `SC859` (sources-check) and `AT802` (anchor-truth) read `ROUTED_MISS … reason=summary_uncorroborated`; only K488/CC879 hold. So the A48 re-score did **not** deliver the expected 5/5.
- Consequences: (a) the addendum's "expect 5/5" is factually not met; (b) H2 (`plan.md:76`, re-stated in the addendum: "r47-set stability at `f00cf278` (expect 5/5 — H2 evidence)") requires `caproute48-probe.mjs … --set r47` at the C1 commit to read 5/5 "if it read 5/5 in every base stability run" — the pre-A48 base stability receipts did all read 5/5, so the condition holds and H2 is live, yet the amended counter already reads 2/5 at the base rev for the untouched r47 sites (kimi-census/sources-check/claims-check/anchor-truth are not touched by the C1 routing). Unless H2 is re-scoped along with A48, H2 cannot pass. This needs an explicit disposition (re-scope H2 to the A48 predicate and re-state the r47 expectation, or record the 2/5 as the A48 r47 baseline).
- Evidence: `r48/A48-stab-r47-f00cf278.txt` (full), `probe/receipts/stab-r47-f00cf278-{1,2,3}.txt` (5/5 ×3, pre-A48).

### F2 — [minor] Addendum's checklist-FAIL characterization is incomplete (R47-4 base)

- Addendum (`plan.md:100`): "the two FAILs are sandbox `REPORTS_DIR_MISSING` artifacts and the known pre-existing proxy drift".
- Measured: each of `build/checklist-base-{1,2}.txt` (copied to `r48/ScribeReceipts-checklist-base-{1,2}.txt`) contains **four** `CHECKLIST FAIL` items, not two: `SKILL.md:685` and `:686` (`REPORTS_DIR_MISSING`, exit 2), `:687` (proxy recompute, exit 1), and `:697` (gate-mutants battery, `exit=null`, wall≈120 s, `timeout=60000ms` per-mutant entries). The 697 failure is load/timeout-shaped and unmentioned.
- Impact: H1 compares base-vs-tip per item; if the 697 item passes at tip under lower load, it would look like an improvement, and if it fails it would look like new harm — in either case the addendum's "two FAILs" does not bound the comparison. Record all four base FAILs (and their causes) before the H1 tip runs.

### F3 — [minor] "The only 4/4 reading is build/CtlEnvCaps-pristine-receipt.txt" is factually incomplete

- `build/CtlEnvCaps-pristine-receipt.txt:13` reads `held=4/4` at `f55bf22e` (addendum-named), **and** `build/CtlEnvCaps-restored-receipt.txt:13` reads `held=4/4` at `61f1c703`. Both are the seat's legitimate comparator/restoration runs, neither is a control nor a candidate score, so the substantive claim ("no candidate score exists") survives. The "only" wording should name both.

### F4 — [minor] Attempt-1 build seat count (44) vs dispatch records (34)

- Addendum (`plan.md:96`): "running wave `build` (44 seats)". `build-dispatch.json` counts: `spawn=34, total=34`; `build-spec.json` has 34 items; registry members = 34. The r48 wave is declared "64 seats" but `r48-spec.json` has 65 items. Counts should be reconciled (likely a counting convention difference; state it).

### F5 — [minor] Build artifacts and re-open drafts are uncommitted; landing assignment is implicit

- `git ls-tree fe3d45bf .ufo/waves/round-48/build/` is empty; `git cat-file -e fe3d45bf:…build/a2-rerun-1.txt` fails. All attempt-1 outputs live only in the working tree. The wave covers copying the R47-1/R47-4 receipts (`ScribeReceipts`) and verifying the re-open drafts (`ReviewReopens48`: "which rows may land as re-opened"), but no seat is assigned to commit `ReopenS084/S091/S092`, `ReconcileS088`, `ScribeErrata` or the checklist/a2 receipts — landing is the L1's job. Not a contradiction; a dependency to make explicit so R47-2/R47-3 are actually closed this round.

### F6 — [low] C2 kill-rule receipt: rev/set unspecified (resolved in execution)

- Addendum (`plan.md:113`): "at least one committed receipt shows a real `AGREE` run over the frozen F48 probe" — does not state the rev/set. `r48-spec.json` ExecCounterRerun's prompt named `f00cf278 --set r48` with "expect AGREE … or DISAGREE", which is impossible as AGREE (F48 exits 1 at held=0/4; `probe/caproute48-probe.mjs:377-378`), as CritC2Shape also flagged.
- Resolution verified: `r48/ExecCounterRerun-agree.txt` is a real AGREE over the frozen probe (sha256 `f24a3af5…`) with `--set r47` at `f00cf278` (both runs exit 0, `held=5/5`, byte-identical summary `f6f6bf06…`), and `r48/ExecCounterRerun-disagree-r48base.txt` records the r48-base DISAGREE honestly. Selftest passes 14/14, including the flake-injection case (children all exit 0, differing summary → DISAGREE) and the always-PASS stub mutation controls. The L1 should record the r47@f00cf278 interpretation in the integration/close notes.

### F7 — [low] R47-5/CritChronology traceability

- R47-5 root causes are covered by the frozen counter itself (probe sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` matches the three committed `stab-r48`/`stab-r47` receipts; header documents `\)\s+=` and `^(\d+) +` fixes and exit-2 rules; code at `caproute48-probe.mjs` implements them). CritChronology O1/O2 are addressed (exec-count equality `exec_count_ne_base`; owning-suite summary bound to the gate; A48 adds per-case line corroboration). The addendum does not explicitly map R47-5 back to the spotcheck's "root cause open" state; a one-line linkage would improve traceability.

### Negatives checked, no defects found

- Frozen kill rule preserved in addendum (`plan.md:103`): same predicate sentence, same four sites, `r48` set, 4/4 after-state, L1 run + ≥2 committed same-commit re-runs, exit-2 recorded never scored, no post-score amendment, pre-data-ROUTED_HELD → amendment. The residual-call seats are the mapping for "committed wave re-run" under the new single-wave shape.
- No candidate score exists: no ExecRoute* landed; the only two 4/4 readings are the CtlEnvCaps comparator/restoration runs (F3); all 17 control mutants read `held=0/4 rule=F48` (verified across the 17 patches and receipts).
- A48 trigger is legitimate: `r48/MutSummaryForge.md` shows M2 (`9e11273`) reading `label=ROUTED_HELD` at RG742 in 3/3 runs under the frozen counter — exactly the kill rule's amendment trigger, before any candidate score.
- A48 re-score set exists and matches its own expectations except the r47 arm (F1): r48@fe3d45bf 0/4, M2′ 0/4 `summary_uncorroborated`, CtlEnvCaps mutant `d4423b2c` 0/4 — all `rule=F48+A48`.
- `scripts/counter-rerun.mjs` absent at `fe3d45bf` (`git cat-file -e` fails) — C2 before-state true.

## Residual risk / verification gaps

- The A48 r47 2/5 (F1) is the only opened claim-blocking item; its root cause (`summary_uncorroborated` for sources-check/anchor-truth under the corroboration clause) means those two gates' per-case print format does not satisfy the A48 per-case line count/pass count check — confirm whether that is intended (only four gates were claimed to print per-case lines) and record it explicitly.
- I did not re-run any gate or counter (read-only review); all readings above are from committed/harness receipts and source.
- Line `plan.md:131` is truncated at 768 chars in the reader; the disposition of H2 under A48 (beyond "expect 5/5") could not be read in full — flagged under F1.
