# CritPlan48 — plan-level falsification

Axis: **operability**, for C1 routing and C2 counter-rerun. Provenance and helper identity are supporting evidence requirements, not additional scored axes. Read-only review of the plan including its attempt-2 addendum, frozen counter, committed receipts, and control sandbox commit objects. No counter, suite, judge, or alternate runtime was invoked; no implementation or plan was edited. Findings below distinguish observed evidence from analytical counterexamples. Observation timestamp: 2026-10-23 15:26:00 -03.

## 1. Chronology: ordering is supported, but 08:03 is the author timestamp

Read-only commands actually exercised:

```text
git log -14 --format='%H%nparents=%P%nauthor=%aI%ncommit=%cI%nsubject=%s%n'
git log --all --format='%H|author=%aI|commit=%cI|%s' -- .ufo/waves/round-48/ scripts/counter-rerun.mjs
git show --no-patch --format='%H%nparents=%P%nauthor=%aI%ncommit=%cI%nsubject=%s%n' bd4d2b22e93d480b513a251f9672e543adc73403
git ls-tree -r --name-only fe3d45bf -- .ufo/waves/round-48 scripts/counter-rerun.mjs
git ls-tree -r --name-only bd4d2b22 -- .ufo/waves/round-48/build/
```

Observed committed timestamps:

| Object | Author, -03 | Committer, -03 | Meaning |
|---|---|---|---|
| `f00cf278a5ab57e87b18418fc972be9f893f65da` | 08:03:39 | 08:03:39 | Round-47 base |
| `bfc30d5ebb1f0da1c881abd7597da6bd3e328742` | 08:45:28 | 08:45:28 | Freeze's parent |
| `fe3d45bf929246915c8c0de5f7f8682b5015b22c` | **08:03:39** | **08:47:18** | Actual frozen commit object |
| `bd4d2b22e93d480b513a251f9672e543adc73403` | 09:51:43 | 09:51:43 | `wip(operator-save)`; parent is exactly `fe3d45bf`; preserves inherited build receipts |

Thus “freeze at 08:03” conflates the retained author date with the committer date. The defensible freeze timestamp is **11:47:18Z / 08:47:18 -03**, which still precedes every inherited control receipt endpoint and every control commit inspected. The `build/` files are absent from the freeze tree, but they are **committed on the operator-save branch**, not merely uncommitted evidence everywhere. `refs/remotes/origin/wip/operator-save-20261023` points to `bd4d2b22`.

The six stability receipts really are pre-freeze calibration: `probe/receipts/stab-r48-f00cf278-{1,2,3}.txt:14` record start 11:41:40Z and ends 11:43:47Z, 11:43:47Z, 11:43:48Z; `stab-r47-f00cf278-{1,2,3}.txt:23` end 11:47:05Z, 11:47:05Z, 11:47:06Z. They are not post-freeze control receipts or candidate scores.

### Complete inherited negative-control inventory

For each seat, inspected the actual commit object in `/fast/scratch/hyaku/kumitate-r48/seats/w1-<seat>/lane` with `git show -s --format='%H|parent=%P|author=%aI|commit=%cI|%s' <rev>` or the equivalent `git log --all fe3d45bf..`. The receipt column refers to `bd4d2b22:.ufo/waves/round-48/build/<seat>-receipt.txt`, except the stated DoNothing suffixes. All listed mutant scores are **held=0/4, exit 1**; the dates are October 23.

| Seat / variant | Tested revision | Committer time, -03 | Receipt end, Z |
|---|---|---|---|
| CtlDoNothing, unchanged | `fe3d45bf` | 08:47:18 | 11:54:20 (`-receipt-a.txt`); restored replay 11:58:15 |
| CtlDoNothing, comments | `7331b140` | 08:54:31 | 11:56:03 (`-receipt-b.txt`) |
| CtlMention | `d5a2ab68` | 08:53:25 | 11:55:20 |
| CtlJunk | `7d55b45e` | 08:54:57 | 11:55:55 |
| CtlSummaryForge | `8397d84b` | 08:55:09 | 11:56:08 |
| CtlStubChild | `263725e6` | **09:01:59** | 12:02:22 |
| CtlFirstCallOnly | `1e6130ac` | 08:55:52 | 11:57:19 |
| CtlCountPad | `ab68c4f6` | 08:54:57 | 11:58:38 |
| CtlDodge, a / b | `5501e77a` / `6d0d1326` | 08:55:01 / 08:57:05 | 11:56:27 / 11:58:33 |
| CtlNestedAllowance | `3c1a9b05` | 08:56:42 | 11:58:45 |
| CtlFakeRunner, a / b | `d767fcf7` / `9c613bc3` | 08:55:30 / 09:00:52 | 11:58:52 / 12:01:25 |
| CtlBwrapOnly | `d34f0c13` | 08:53:41 | 11:56:23 |
| CtlScopeOnly | `91695239` | 08:54:28 | 11:55:40 |
| CtlDirectSystemd | `9d3935a1` | 08:54:14 | 11:58:01 |
| CtlLooseCaps | `59b646f8` | 08:55:11 | 11:58:45 |
| CtlEnvCaps, mutant | `d4423b2c` | 08:58:14 | 12:00:09 |
| CtlEnvPassthrough | `5e1d6f23` | 08:53:44 | 11:57:11 |
| CtlRetParse48, final | `b0d13600` | 09:02:52 | 12:04:05 |

`c856ea6f`, CtlRetParse48's first patch and the final control's parent, is committed at 08:55:10 with parent `fe3d45bf`. CtlStubChild's author time is 08:55:13, but its committer time is 09:01:59: another reason not to substitute author dates for chronology.

The earliest recorded inherited control attempt is `CtlJunk-pristine-initial-receipt.txt:1-3`, exit **2**, end 11:52:58Z, with `prlimit` FSIZE refusal. It is not a score. `CtlNestedAllowance-pristine-attempt0-receipt.txt` records missing `/usr/bin/node`, exit 127, end 11:53:55Z; likewise not a score. The earliest successful pristine F48 evaluation in the inspected build receipts is `CtlCountPad-pristine-receipt.txt:13-14`, held=0/4, exit 1, end 11:53:41Z. All are later than 11:47:18Z.

**What this proves and does not prove:** the freeze is the parent of the committed archive containing every inherited control receipt; the retained sandbox commits and recorded endpoints agree with that order. Git timestamps are not independent proof of an observation's wall-clock authenticity. An absolute “no score anywhere” cannot be established by timestamps alone. The supported statement is that the inspected committed inheritance contains no L1/C1 candidate score, as detailed next.

### Two positive receipts, one comparator tree; neither is the claimed candidate

The addendum's “the only 4/4 reading” is factually incomplete. Committed raw evidence contains **two**:

| Receipt under `build/` | Revision | Result | End Z |
|---|---|---|---|
| `CtlEnvCaps-pristine-receipt.txt:13-14` | `f55bf22e9e6d719045a46a8bd3419485a09eceb5` | held=4/4, exit 0 | 11:57:57 |
| `CtlEnvCaps-restored-receipt.txt:13-14` | `61f1c703154fa8c869741281a1d82860fed4f149` | held=4/4, exit 0 | 12:01:22 |

Independently inspected both saved receipt blobs and the sandbox objects. `git rev-parse f55bf22e^{tree} 61f1c703^{tree}` returns **`1c695d1417772a5c1f9f2695b3484c8511369d4c` twice**. The lineage is freeze → legitimate routing comparator `f55bf22e` → caps-in-environment mutant `d4423b2c` → exact restoration `61f1c703`. The patch's first part changes the four sites to the actual helper (`CtlEnvCaps.patch:18-31,42-88`); its second part changes the runner's caps (`:110-117`). The two 4/4 receipts are the positive sides of this differential control, not successful mutant scores.

No inherited ExecRoute candidate receipt or patch appears in the committed build inventory. The two inherited ExecRoute sandbox clones have no reachable descendant commit in `git log --all fe3d45bf..`. `git diff --name-status fe3d45bf bd4d2b22 -- scripts/ .ufo/waves/round-48/plan.md .ufo/waves/round-48/probe/` is empty: operator-save landed no C1 source change or C2 instrument. The working and committed frozen counter hashes both equal `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

Current-wave files are live, not the pre-data snapshot: the later search already found `r48/MutRunnerUnshare-pristine-receipt.txt:13-14`, revision `af03fad5`, 4/4 at 18:25:03Z. Its filename indicates a pristine-comparator receipt; this review does not promote it to a candidate score or adjudicate that seat. The historical claim should be explicitly scoped to the attempt-2 opening inventory, not asserted forever as “only one positive anywhere.”

**Smallest safe correction:** preserve the original artifacts; append a chronology/provenance correction naming the actual freeze committer time, operator-save object, and both comparator receipts. Classify positive comparators separately from mutants and L1 candidate scores. This is an evidence correction, not a counter or predicate amendment.

## 2. Do-nothing control: existing subconditions pass, but neither target is acquired

**C1 observed:** the unchanged freeze and comment-only control both score 0/4 in all three internal runs (`CtlDoNothing-receipt-a.txt:1-14,17-30`; `CtlDoNothing-receipt-b.txt:1-14`). Their suites already exit 0, with round-gate 61/61 and surface-probe 46/46, full counts 116/2/2/14, final verdict PASS, and no FAIL lines. Those subconditions therefore are not improvements attributable to the proposed routing change.

Every one of the four sites nevertheless has capped count zero and explicit missing-runner/scope/bwrap ancestors, canary leakage, and uncapped direct children. The checker requires each site's complete conjunction in every internal run (`probe/caproute48-probe.mjs:280-310,356-375`). Repeating identical wrong routing does not remove those reasons; three successful suite summaries do not produce even one ROUTED_HELD site. The frozen base is `f00cf278` (`:64`), and the unchanged freeze's score separately establishes the same missing routing at `fe3d45bf`.

**C2 observed prerequisite:** `git cat-file -e fe3d45bf:scripts/counter-rerun.mjs` exits 128 with “path ... does not exist”. [INFERENCE] An unchanged tree cannot execute that absent instrument, produce its required selftest PASS, or acquire its repeat-run behavior. A compliant instrument wrapping unchanged r48 routing would print DISAGREE, not AGREE: every F48 exit is 1 even if the final summaries agree byte-for-byte. Identical failures are expressly not AGREE (`plan.md:109`). Existing r47 success and inherited comparator success cannot substitute for the missing C2 script and its selftest at the C2 commit.

**Qualification, not a no-op success:** C2's literal receipt requirement does not pin K≥2, `--set r48`, or the claimed C1 revision (`plan.md:109-113`). A genuine new instrument could demonstrate AGREE with K=1 or against already-working r47 routing; the committed r47 stability receipts already read 5/5. That can be within the stated C2 capability predicate, but it is not evidence of new C1 routing or of multiple repeated probe invocations. The smallest strong witness, without changing the frozen predicate, is to choose K=3 over `--set r48` at the claimed C1 commit, while separately recording the C2 selftest commit and frozen probe digest. Do not count C2's wrapper receipt as an extra independent C1 re-run unless its actual underlying invocations meet C1's exact revision/command/provenance requirements.

**Premature-saturation risk:** “17 killed mutants” overstates the inheritance. Many reports explicitly say differential mutation kill is inconclusive because their pristine freeze already misses (e.g. `CtlDoNothing.md:7`, `CtlSummaryForge.md:7`, `CtlCountPad.md:7`). They establish targeted negative-control rejection. CtlEnvCaps does have the positive → negative → restored-positive comparison. Keep these categories separate rather than treating 17 misses as 17 independently demonstrated kill sensitivities.

## 3. Kill-rule gap: reproducibility does not establish helper or callsite identity

### A. Strongest structural counterexample — duplicate helper authority

**Counterexample [INFERENCE, not an executed mutant]:** start with the already-measured legitimate comparator tree. A same-directory, byte-identical copy of `cap-spawn.mjs` can be used instead of the required `scripts/cap-spawn.mjs`. The child still executes the exact same `cap-run.mjs`, scope, bwrap, argv, environment, counts, and gate behavior, while the required helper-module identity is wrong. Because the copy remains in the same directory, its `CAP_RUN` resolution is unchanged (`scripts/cap-spawn.mjs:26`).

**Why L1 + two re-runs cannot distinguish it:** F48 traces only exec/fork/clone operations (`probe:204-206`), not module provenance. Its site matchers inspect argv and executable shape (`:50-52,65-69`), and its ancestry judge recognizes `cap-run.mjs` (`:280-310`). It never checks `capSpawnSync` or `cap-spawn.mjs` imports, binding identity, or callsite source. The duplicate module is loaded in-process; it is not an additional exec. Thus the change is observationally indistinguishable to F48's routing predicate from the locally observed 4/4 comparator. Repeating the same projection cannot recover the missing module identity. This is a deterministic discrimination gap, not the round-47 load flake.

**Impacted requirement/axis:** C1 operability's explicit “via scripts/cap-spawn.mjs capSpawnSync” surface, with duplicate error/verdict authorities liable to diverge later. The frozen ancestry predicate can still be literally true; a numerical 4/4 result alone does not establish the stronger named-helper requirement.

**Smallest safe correction:** the integration review must bind each of the four changed source sites to the real, unshadowed imported helper at the exact claimed commit, and reject duplicate helper authorities. Keep F48's bytes/predicate frozen. This is a source-review obligation under the existing canonical assignment, not permission to redefine F48 after a score.

### B. Per-suite ancestor is not per-site routing

**Counterexample [INFERENCE; feasibility not run]:** an outer selftest driver can cap an entire inner, unchanged suite rather than migrate the four child-launch statements. Its abstract ancestry is:

```text
traced owning gate → cap-run → capped scope → bwrap → inner --selftest → raw site launches
```

All original site launches can then possess the required ancestor chain, while their own source statements still call raw `spawnSync`. This is not a claimed measured 4/4 artifact; it identifies the counter's missing distinction.

**Local evidence:** raw RG742 and SP1592 are inside selftests (`scripts/round-gate.mjs:719-743`; `scripts/surface-probe.mjs:1590-1594`), and SP491/SP519 are live-reader statements exercised by fixtures (`surface-probe.mjs:483-530`). F48 excludes `--selftest` execs from site counts (`probe:66,69`), permits named nested selftests (`:73-74`), checks uncapped direct children only of its first root PID (`:265-277`), and accepts a qualifying chain anywhere above each matched child (`:286-308`). It does not require a distinct scope or helper call attributable to each source site. Extra inner-suite executions need not inflate the four matched child counts merely because they carry `--selftest`.

**Impact:** all sampled launches may really share a cap, yet live SP491/SP519 calls outside the selftest may remain raw, and per-child budget/verdict behavior is not established. The C1 surface requirement is stronger than aggregate ancestry.

**Smallest safe correction:** review the actual four migrated statements, not just imports or aggregate traces; require the normal live-reader paths to use the same unconditional helper binding. Do not accept a selftest-only wrapper as the four-site migration. A detector strengthening would require the plan's explicit pre-data amendment route if applicable; this review neither amends nor scores it.

### C. What is and is not a defect in the kill rule

- Repetition addresses nondeterministic observation loss; it does not address A/B's systematic blind spots. A failed matching raw exec actually present in the trace is caught: the inherited CountPad control has base-equal counts yet only half capped and correctly misses (`CtlCountPad-receipt.txt:9-14`). Summary-only forgery with no execs also misses (`CtlSummaryForge-receipt.txt:3-14`). These observations do not test helper identity or source-site attribution.
- The named nested-selftest and checklist allowances are deliberate scope tradeoffs (`plan.md:45-49`), not evidence that all launches everywhere are capped. Additional uncapped non-site work or an unexercised production branch cannot be ruled out by nine repetitions of the same fixture path. The canonical judge must assess the bounded claim; this review does not supply an admission/rejection judgment.
- “Every committed re-run” cannot itself prove that every launched attempt was committed. Preserve all launched attempts, including exit 1 and exit 2, with exact command, canonical commit, probe digest, and start/end evidence. An exit 2 remains an unevaluable attempt, never a replacement passing score; a hidden exit 1 must not be erased by selecting two later successes. This is an audit/provenance gap, not an observed omitted candidate failure here.

## Scoped handoff

The inherited chronology supports freeze-before-controls using **08:47:18 -03**, not the author date. No L1/C1 candidate score was found in the inspected committed inheritance; there are two legitimate positive-comparator receipts, one tree. The no-op controls cannot acquire C1 or C2, although suite-pass subconditions pre-exist. The decisive residual risk is promoting repeatable ancestry measurements into proof of named helper/callsite migration.

Only this report was created in the authorized r48 directory. No git/jj writes, implementation edits, installs, tool updates, service operations, test runs, or judgment calls were made. Main's remaining source-review obligation is the exact-commit four-callsite/helper identity check; Main owns the assigned C1 score/re-runs and C2 selftest/real-receipt verification. This report claims no newly exercised runtime result.
