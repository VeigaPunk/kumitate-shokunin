# Round 48 — four child sites routed under a repeatable counter

Lane base `f00cf278a5ab57e87b18418fc972be9f893f65da`; frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. Attempt 2 uses one v2 `r48` wave. This is a lesson draft: the close-time record below is deliberately left for the L1 to complete from committed receipts, not from seat messages or aggregate recollection.

## Gate

### Candidates

- **S098 — strace 7.2 manual.** The inherited `.ufo/waves/round-48/build/ScribeStraceManual.md` proposes it as the source for return-column padding and interleaved unfinished/resumed records. The attempt-2 plan says its status is `queued` (`.ufo/waves/round-48/plan.md:102`); no S098 row is present in `corpus/SOURCES.md` at drafting time. This lesson cites S098 only as the proposed source for the trace-record format. The counter's fail-closed policy is lane behavior, supported separately by the plan and probe receipts. The manual bytes cited by the inherited draft were not available at this seat's `/tmp` path for independent review, so this draft does not claim S098 has passed the L1 source gate.

### Admitted

- None verified for this draft. The L1 should replace this status if the S098 review and registry row land before close.

### Rejected

- None recorded in the inherited source draft or registry check. Absence of a row is not a rejection decision.

## Mistakes

1. **class:** A trace counter can silently omit child executions when it assumes fixed spacing in either the PID prefix or the syscall return column, then report a routed site from an incomplete trace. **evidence:** The R47-5 root-cause note identifies both parser gaps (`.ufo/waves/round-48/plan.md:8-24`). In the return-column receipt, three concurrent traces at `f00cf278` have A2 parser counts `106/106`, `105/106`, and `103/106`, while the round-48 parser reads `106/106` in all three (`.ufo/waves/round-48/probe/receipts/rc-at802-parser.txt:1-16`). That receipt also records 46/39/59 unfinished records and 14/7/15 padded resumed `execve` records. In the PID-wrap receipt, A2 reads n/capped `104/99`, `103/99`, and `104/96`; the fixed parser reads `106/106` each time, and the receipt shows a five-column-padded PID example (`.ufo/waves/round-48/probe/receipts/rc-at802-pidwrap.txt:1-13`). **captured-by:** No parser completeness/count guard caught these losses before the R47 score. R47's close-time Mistake 3 later identified the need for repeated readings and equality with the base exec count (`corpus/lessons/round-47.md:129-134`); that was not a pre-score guard and did not identify either parser bug. **fix:** Parse padded PID prefixes (`^(\d+) +`) and return columns (`\)\s+= `); fail closed on any non-empty unparsed record, unmatched resumed record, or unfinished entry; require each site's exec count to equal base and repeat the frozen measurement. **shown able to fail:** The two receipts replay the same logs through A2 and the corrected parser: A2 loses records while the corrected parser counts all 106. This demonstrates the old parsing paths fail on observed traces and the corrected parser recovers those records; it does not establish that strace itself never drops an entire event under load (plan `:25-26`).

2. **class:** A close conclusion can rely on cancelled-seat chat readings, or state an aggregate contradicted by its cited receipts. **evidence:** The R47 lesson presents 3/5, 3/5, and 4/5 A2 re-runs as the basis for its conclusion, then lists those seats as cancelled (`corpus/lessons/round-47.md:105-110,122-125`). The non-author spot-check says those readings were IRC messages without committed receipts and that the cancelled-seat search found only the cancellation list (`corpus/lessons/round-47-verifier-spotcheck.md:28-29,59-60`). Separately, SCORECARD says all fourteen controls read 0/5 under A2 (`SCORECARD.md:2082-2084`), while the cited receipts include `held=3/5` (`.ufo/waves/round-47/probe/receipts/a2-ctl-retparse2.txt:6-7`) and `held=1/5` (`.ufo/waves/round-47/probe/receipts/a2-controls.txt:17-24`). The spot-check records both report defects (`corpus/lessons/round-47-verifier-spotcheck.md:183-192`). **captured-by:** No close gate required a committed receipt for each claimed result or recomputation of aggregates before filing; the later non-author spot-check found these defects. **fix:** For each outcome-affecting claim, record the exact command, revision, seat/run status, result, exit, and committed receipt; exclude chat-only/cancelled-seat readings from the evidence basis; recompute aggregates from the full cited receipt set; append errata rather than silently rewriting filed claims. **shown able to fail:** The R47 spot-check identifies both the unreceipted readings and the 3/5 and 1/5 receipt outputs that contradict the 0/5 aggregate (`corpus/lessons/round-47-verifier-spotcheck.md:28-29,59-60,183-192`). This is evidence that the check can detect those historical defects, not evidence that an R48 close report has passed it.

## Round-48 record

> **Close-time section:** L1 completes every bracketed field from committed reports/receipts at the final close revision. Preserve exit-2 readings as recorded but never score them. Do not fill from chat-only readings.

### Frozen scope and wave

- Plan: `.ufo/waves/round-48/plan.md`; attempt 2; base `f00cf278a5ab57e87b18418fc972be9f893f65da`; frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Wave: one v2 `r48` call; planned 64 seats, 30 attack seats (47%); record dispatched/settled seats, any residual call, and total seats: **[L1 completes from wave receipts]**.
- Pre-data C1 controls: the attempt-2 addendum reports 17 controls at `held=0/4` and no forced F48 amendment. Record any additional re-scoring or amendment, if any: **[L1 completes from receipts]**.
- C1 counter: `probe/caproute48-probe.mjs`, SHA-256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, frozen predicate `ROUTED_HELD`, rule `F48`, set `r48`.

### C1 — operability

Four sites: RG742 (`scripts/round-gate.mjs:742`), SP491 and SP519 (`scripts/surface-probe.mjs:491,519`), and SP1592 (`scripts/surface-probe.mjs:1592`). Required chain: `scripts/cap-run.mjs` contract `kumitate-cap-run-v2` via `scripts/cap-spawn.mjs` `capSpawnSync`.

- C1 commit/revision: **[L1 fills]**.
- L1 score command, exact output, exit, load, and committed receipt: **[L1 fills]**.
- Every committed wave re-run on that same commit (at least two): command, exact output, exit, load, seat status, and receipt for each: **[L1 fills]**.
- Required scored reading: `CAPROUTE48 … set=r48 held=4/4 runs=3 rule=F48`, exit 0, both for the L1 score and each required committed re-run. Record any exit-1 miss; record exit 2 but never count it as a score. **[L1 records whether the kill rule verifies]**.
- H1 checklist runs: two at base `f00cf278` and two at the C1 commit, with each item's `load1` and receipt; identify any item passing both base runs but failing either C1 run: **[L1 fills]**.
- H2 R47-set counter at the C1 commit, compared with the three base stability receipts; exact output/exit/receipt: **[L1 fills]**.

### C2 — counter-rerun capability

Frozen predicate: `COUNTER_RERUN` from the attempt-2 addendum. The instrument must compare the final summary line across repeated probe invocations and fail closed on unreadable inputs or unparsable output.

- C2 commit/revision: **[L1 fills]**.
- `node scripts/counter-rerun.mjs --selftest`: exact `COUNTER_RERUN_SELFTEST: PASS` output, exit, and committed receipt: **[L1 fills]**. Record whether the selftest's flake-injection case rejects a print-PASS stub: **[L1 fills from committed test evidence]**.
- Real run over the frozen F48 probe: exact command with `--probe`, `--lane`, `--rev`, `--runs`, and probe arguments; exact `COUNTER_RERUN: AGREE (runs=K)` output, exit 0, and committed receipt: **[L1 fills]**.
- C2 verifies only if the selftest passes at the C2 commit and at least one committed receipt demonstrates a real `AGREE` run over the frozen probe. **[L1 records verdict]**.

### Repairs, close gates, and verdict

- R47-1: list the three committed rerun receipts at `f00cf278` and compare them with the inherited `.ufo/waves/round-48/build/a2-rerun-{1,2,3}.txt`; report the exact readings and status: **[L1 fills]**.
- R47-2/R47-3: record appended errata and the S084/S091/S092 reopen and S088 reconciliation dispositions; do not rewrite the R47 plan/lesson: **[L1 fills with report paths]**.
- R47-4/H1: record all base and C1-tip checklist results as above; distinguish the known base artifacts from any actual harm: **[L1 fills]**.
- H3: `node scripts/proxy-check.mjs --strict` result and committed close receipt; note the plan's declared close-time re-pin: **[L1 fills]**.
- H4: fleet sources census command/result/exit and committed close receipt: **[L1 fills]**.
- Gate: final S098 candidate decision, opened-source verification, registry status, and `used-by` paths (including whether this lesson and the round-48 probe are recorded): **[L1 completes from the landed source review]**.
- Close revision, C1 result, C2 result, harm findings, and final round verdict: **[L1 fills from committed evidence]**.
