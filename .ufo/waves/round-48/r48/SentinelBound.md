# SentinelBound — r48 write-path audit

## Verdict

**Not fully within the stated write bounds.** The explicit report/fragment destinations are correctly under `.ufo/waves/round-48/r48/` and begin with the seat name. However, some prompts invoke code with implicit side effects outside the allowlist, and one analysis prompt leaves generated-output paths unconstrained. No seat prompt was executed for this audit; these are prompt/code-path findings, not observed writes.

## Findings

### F1 — Moderate: frozen F48 probe writes to a non-allowlisted shared scratch root

**Exploit path:** A seat follows an instruction to run/score the frozen `probe/caproute48-probe.mjs`. Its implementation does not use the seat clone or `/tmp` for run trees: `SCRATCH` is hard-coded to `/fast/scratch/hyaku/kumitate-r48/probe-runs` (`.ufo/waves/round-48/probe/caproute48-probe.mjs:44-46`). `measure()` creates each run's `tree` there and extracts the archived lane into it (`:313-325`); the `finally` block removes the per-run directories (`:342-344`). This root is outside the allowed `/fast/scratch/hyaku/kumitate-r48a/seats/<name>/`, report directory, and `/tmp` roots.

**Affected prompts:** `ExecCounterRerun`, `ScoutHarnessBase`, `MutSpawnEnvDodge`, `MutSpawnFakeRunner`, `MutSpawnCanaryLeak`, `MutRunnerDropSwap`, `MutRunnerLooseMem`, `MutRunnerDropTasks`, `MutSiteRGArgv`, `MutSiteSPDouble`, `MutSummaryForge`, `MutAllowanceProbe`, `MutDoNothing48`, `MutCountPadSite`, `MutSpawnDropBind`, `MutRunnerUnshare`, and `MutNestedSelftest` explicitly run or score the probe (or require its counter reading). `MutVerdictFile` has the same issue if its counter check runs the probe. `ExecLoadProbe` runs it five times. `ExecPidWrapProbe` has the issue if it takes the optional “run counter --set r47” path. The four route-build prompts explicitly prohibit running the probe and are not included.

**Impact:** Every such run creates/extracts files in a shared scratch namespace beyond the per-seat boundary, even though it later removes its own randomized run directories. The cleanup does not make the writes compliant and does not isolate the common scratch root from other work.

**Smallest remediation:** Before dispatch, either change the frozen probe's scratch root to `/tmp` (and re-freeze/re-pin the counter and receipts), or explicitly authorize this exact temporary root as a narrowly scoped exception for probe runs. Do not represent these probe-running prompts as conforming to the current strict bounds until one of those changes is made.

### F2 — Moderate: `ScoutRootCause` can write into inherited attempt-1 evidence or old scratch

**Exploit path:** `ScoutRootCause` asks the seat to re-run `rc-*.mjs` analysis on logs under `/fast/scratch/hyaku/kumitate-r48/seats/w1-ExecRootCause/`, but does not constrain generated-output paths. The referenced helpers are not all read-only: `rc-surgical.mjs` writes two derived logs beside its input (`build/ExecRootCause/rc-surgical.mjs:46-57`); `rc-renumber.mjs` writes its caller-supplied output path (`:15-23,126`); and `rc-results.mjs` writes its `outFile` argument (`:7-14,62`). The requested old scratch root is outside the current `r48a/seats/<name>/` allowance. A results output aimed at the inherited `build/ExecRootCause/results.json` would also write outside `r48/`.

**Impact:** A seat could create artifacts in another attempt's scratch tree or overwrite inherited build evidence, obscuring provenance and violating the L1-only integration boundary. The prompt currently names the old logs as inputs, not as writable destinations; the risk is the unconstrained helper output behavior.

**Smallest remediation:** Make the old logs and `.ufo/waves/round-48/build/` explicitly read-only in the prompt. If re-running a writer, copy inputs into the seat's own sandbox (or `/tmp`) first and require every output argument there; do not run `rc-surgical.mjs` against the old log in place because it writes beside that input.

### F3 — Low: `ExecLoadProbe` names `/dev/null` and background work

**Exploit path:** The prompt suggests `parallel yes > /dev/null &`. `/dev/null` is a write target outside the literal allowlist, and the background process conflicts with the shared `no background jobs` instruction; no explicit wait/termination instruction is given.

**Impact:** This is not a durable report or lane-tree write, but it is a literal path-bound exception and can leave load workers running after the seat finishes.

**Smallest remediation:** Replace the example with an explicitly bounded foreground load method whose output, if any, is under `/tmp`, and require it to finish before receipt capture. If parallel background workers are necessary, reconcile that exception with the shared no-background-job rule and specify guaranteed cleanup.

### F4 — Low, conditional: selftest scratch follows inherited `TMPDIR`

**Exploit path:** Several prompts run gate selftests (notably `ScoutTiming`, `ScoutHarnessBase`, the F1 probe-running prompts, `ReviewCounterD1`, and `ExecPidWrapProbe`). The probe passes the host environment to the child (`caproute48-probe.mjs:204-207`); the gate selftests call `tmpdir()` (`scripts/round-gate.mjs:707`, `scripts/surface-probe.mjs:489,516,1184`). `ExecCounterRerun` also requires fixture scripts in an unspecified “temp dir.” If the inherited `TMPDIR` (or a seat's chosen temp API default) points outside `/tmp` and its own clone, these operations can create and later remove files outside the permitted roots.

**Impact:** The allowlist is only reliable if temp roots are pinned; cleanup still entails writes/deletes outside the allowed roots.

**Smallest remediation:** Add `TMPDIR=/tmp` to commands that run these selftests, and require the C2 selftest's fixture directory to be explicitly created under `/tmp` or the seat clone. The frozen probe's hard-coded F1 scratch root remains a separate issue.

## Per-item verdicts

`PASS` means the prompt's explicit deliverables and stated work location are within the common bounds, with no additional out-of-bound write path identified. `F1`–`F4` refer to findings above; conditional/optional cases are marked.

| Item | Verdict |
|---|---|
| ExecRouteRG742 | PASS — sandbox-only patch; explicitly forbids probe execution |
| ExecRouteSP491 | PASS — sandbox-only patch; explicitly forbids probe execution |
| ExecRouteSP519 | PASS — sandbox-only patch; explicitly forbids probe execution |
| ExecRouteSP1592 | PASS — sandbox-only patch; explicitly forbids probe execution |
| ExecCounterRerun | F1, F4 — live probe receipt invokes the frozen probe; fixture temp root unspecified |
| ScribeErrata | PASS — fragment under `r48/`; explicitly forbids editing source docs |
| ScribeLesson48 | PASS — fragment under `r48/`; explicitly forbids editing source docs |
| ScribeSources98 | PASS — row/map fragments under `r48/`; explicitly forbids editing source docs |
| ScribeReceipts | PASS — copied receipts and report under `r48/` |
| ScribeScorecard | PASS — report fragment under `r48/`; source reads only |
| ScribeReadme | PASS — map-row fragment under `r48/`, not a direct README edit |
| ScribeLogFrag | PASS — LOG fragment under `r48/`, not a direct LOG edit |
| ScoutRootCause | F2 — re-run helper outputs are not confined to permitted paths |
| ScoutTiming | F4 — requested selftests use `tmpdir()` without pinning `TMPDIR` |
| ScoutLiveSurface | PASS — report under `r48/`; commands are explicitly read-only and invoke census default mode, not selftests |
| ScoutOrigTree | PASS — requested git checks are read-only; report under `r48/` |
| ScoutHarnessBase | F1, F4 — runs frozen probe and its gate selftests |
| ScoutChecklistItems | PASS — extraction/report only |
| ConnSiblings | PASS — sibling reports are read inputs; report under `r48/` |
| RevengerCapRun | PASS — static review/report only |
| RevengerCounter | PASS — static review/report only |
| ReviewFreeze | PASS — committed-byte/receipt checks only; no probe rerun requested |
| ReviewCounterD1 | F4 — sandbox selftest/strace investigation does not pin temp root |
| ReviewA2Receipts | PASS — receipt/git comparisons only |
| ReviewChecklistBase | PASS — comparison/report only; no write destination requested beyond report |
| ReopenS098 | PASS — fetched bytes are evidence inputs; report under `r48/` |
| ReviewSources | PASS — contract review/report only |
| ReviewRouteSpec | PASS — acceptance checklist/report only |
| ReviewCapSpawnCode | PASS — static review/report only |
| ReviewCtlEnvCaps | PASS — receipt re-verification; does not ask to rerun probe |
| ReviewReopens48 | PASS — cited-byte re-fetch/review; report under `r48/` |
| ReviewPlanAddendum | PASS — plan review/report only |
| ReviewErrataFrag | PASS — read-only cross-check/report |
| ReviewQualityDraft | PASS — draft review/report only |
| ReviewReceiptCanon | PASS — `cmp`/read-only comparison/report |
| CritPlan48 | PASS — chronology/control analysis/report; no execution requested |
| CritC2Shape | PASS — predicate analysis/report only |
| CriticHarm | PASS — harm analysis/report only |
| CritFreezeTiming | PASS — receipt/commit timeline/report only |
| CritC1Shape | PASS — surface analysis/report only |
| CritReceiptPlan | PASS — command/receipt plan only |
| MutSpawnEnvDodge | F1, F4 — counter score runs gate selftests |
| MutSpawnFakeRunner | F1, F4 — counter score runs gate selftests |
| MutSpawnCanaryLeak | F1, F4 — counter score runs gate selftests |
| MutRunnerDropSwap | F1, F4 — expected counter result requires a probe run |
| MutRunnerLooseMem | F1, F4 — expected counter result requires a probe run |
| MutRunnerDropTasks | F1, F4 — expected counter result requires a probe run |
| MutCounterPadded | PASS — parser harness/synthetic log can be kept in `/tmp` or own clone; no full probe run requested |
| MutCounterPidReuse | PASS — synthetic parser input can be kept in `/tmp` or own clone; no full probe run requested |
| MutCounterUnresumed | PASS — synthetic parser input can be kept in `/tmp` or own clone; no full probe run requested |
| MutSiteRGArgv | F1, F4 — asks to confirm the counter's reading after a routed mutation |
| MutSiteSPDouble | F1, F4 — asks to confirm the F48 count check |
| MutSummaryForge | F1, F4 — explicitly runs the frozen counter |
| MutAllowanceProbe | F1, F4 — explicitly confirms both cases with the frozen counter |
| MutDoNothing48 | F1, F4 — explicitly scores with the frozen counter |
| MutCountPadSite | F1, F4 — asks to confirm the F48 count check |
| MutSpawnDropBind | F1, F4 — asks what the counter reads for the mutated route |
| MutRunnerUnshare | F1, F4 — explicitly confirms with the frozen counter |
| MutVerdictFile | F1, F4 conditional — counter indifference check may invoke the probe |
| MutNestedSelftest | F1, F4 — asks to show the counter's miss reading |
| ExecLoadProbe | F1, F3, F4 — five probe runs; `/dev/null` background-load example; inherited temp root |
| ExecPidWrapProbe | F1 optional, F4 — optional counter path; requested straced selftests inherit temp root |
| SentinelBound | PASS — required `SentinelBound.md` path is under `r48/` and begins with the seat name |
| SentinelReceipt | PASS — check/report only; report under `r48/` |
| SimplifierPredicate | PASS — advisory analysis/report only |

## Audit method

Read the frozen `plan.md` first, including the attempt-2 addendum; then inspected `r48-spec.json`'s shared `context` and all 65 `items[].prompt` records, and the corresponding 65 `r48-taskCall.json` task names and `Report:` trailers. All trailers point to `.ufo/waves/round-48/r48/<seat-name>.md`. Static-checked the probe's scratch creation/cleanup, the root-cause helper scripts' output calls, and the referenced selftest temp-root calls. No prompt was executed and no probe, selftest, census, or mutation was run.
