# CritC1Shape — C1 surface-selection attack

Axis under review: **operability**. Secondary exposure: coverage and calibration if `4/4` is described as fleet-wide containment or saturation. This is an advisory critique, not a claim verdict or admission decision.

## Scope and evidence provenance

Read round-48 `plan.md`, including the attempt-2 addendum, before the sources. Source baseline: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. A read-only `git diff fe3d45bf929246915c8c0de5f7f8682b5015b22c --` over the six gates discussed here, `scripts/cap-run.mjs`, `scripts/cap-spawn.mjs`, and the F48 counter returned no differences when inspected. Source anchors below therefore describe the frozen implementation, not a routing candidate.

Shorthands, relative to the lane root:

- **P48:** `.ufo/waves/round-48/plan.md`.
- **F48:** `.ufo/waves/round-48/probe/caproute48-probe.mjs`.
- **B:** `.ufo/waves/round-48/build/`.

Inherited observations are identified as such. I reopened the cited receipts and independently traced their relevant source paths; I did **not** rerun reported failures, selftests, or the counter. No new runtime, tool installation/update, sandbox commit, source edit, or integration was performed.

## 1. Strongest shape counterexample: an ancestor capsule is not proof of four call-site replacements

**Counterexample — [INFERENCE], unexecuted.** Put an outer capsule around each owning gate's `--selftest`, but leave the four original launch statements as raw `spawnSync`. Run the real suite beneath that capsule; avoid recursively wrapping its nested suite. The distinguishing trace topology is:

```text
node gate.mjs --selftest                    # probe root / outer launcher
  node <archive>/scripts/cap-run.mjs
    /usr/bin/systemd-run --scope <valid caps>
      /usr/bin/bwrap <required flags>
        node gate.mjs --selftest            # actual owning suite
          raw target child                 # original site NOT migrated
```

At the trace-evaluator level, **if** that suite retains its original passing cases and base-equal target counts, this topology meets F48 even though the four original statements have not been migrated through `capSpawnSync`:

- F48 `:265-275` checks uncapped direct children only against `p.rootPid`, the first successful exec in the trace (`:186-187`). That root has just its canonical cap-run child, which is allowed. The actual suite's raw children are not direct children of that root.
- F48 `:280-308` searches the target's entire ancestry for an earlier ordered runner → scope → bwrap chain. It does not require that chain to begin **after the nearest owning suite process**. All targets in the graph inherit the outer chain.
- A suite child carrying `--selftest` is excluded from RG742/SP1592's target signatures (`:66,69`), so the extra suite launcher need not add a counted target.
- F48 observes exec identity/count/ancestry, not JavaScript calls to `capSpawnSync`. No observed syscall can distinguish a helper call from an equivalent hand-built runner invocation.

This is **not an observed passing control**, and I am not claiming such a runnable mutant has passed. It is a precise observational gap between the stated implementation surface, P48 `:35-43`, and the frozen ancestry predicate. It also demonstrates why a selftest-only wrapper could leave SP491/SP519's ordinary live-mode launchers raw while making the sampled children inherit real caps. The caps in this graph are real; the purported *four call-site migrations* would not be.

**Impacted axes:** operability; calibration if the counter is presented as independently proving the exact source migration.

**Smallest safe correction now:** the integration review must establish, from the delivered source diff, that all four actual launch statements call the existing `scripts/cap-spawn.mjs` helper, with their original callers/arguments preserved and without selftest-only routing branches, relocated stand-ins, or an outer-suite substitute. Keep F48 unchanged. For a future freeze, a stronger counter could associate each target with its nearest owning suite instance and require a new capsule below that instance, rather than accepting an arbitrary earlier capsule.

No amendment is forced by this unexecuted inference. If an actual pre-data control reads any site HELD, apply P48 `:69-71`; do not repair the counter after a candidate score.

## 2. Concrete operability counterexample: SP491's fixture does not exercise the real shim's interpreter dependency

The four site IDs are legitimate launch statements, but their selftest witnesses are not four end-to-end production workloads:

| Site | What the frozen suite actually exercises | Consequence |
|---|---|---|
| RG742 | The selftest's `runGate` helper, `scripts/round-gate.mjs:719-743` | Genuine gate CLI executions, but a selftest helper rather than a production child-launch path. |
| SP491 | `readSightingSurface`, with a shell-only cache fixture at `scripts/surface-probe.mjs:1562-1573` | Tests the real launch statement, not the pinned shim's complete dependency chain. |
| SP519 | `readDispatcherStatus`, with a small generated Node state fixture at `:1519-1537` | Tests the real launch statement and its temporary-state contract, not the full dispatcher implementation. |
| SP1592 | The suite-local `spawnSelf` helper at `:1590-1594` | Genuine CLI executions, but another selftest helper. |

Most conformance cases inject reader results instead of executing the live children (`surface-probe.mjs:1197-1204`). In particular, the SP491 executable fixture only runs shell commands and prints JSON (`:1564-1570`); it never does the pinned shim's `exec node`.

**Inherited observation:** `B/ScoutLiveSurface.md:64-72,91-97` records the real pinned shim failing with exit 127 and `exec: node: not found` under cap-run's default bash PATH, while an explicit PATH containing a visible real Node directory restores matching stdout. That scout used cap-run-equivalent bwrap mounts/environment, **not** a new complete C1/F48 run. I did not relabel it as a candidate score.

**Independent static re-derivation:**

1. `.ufo/pins/origin.json:4-5` names revision `31c465f15669f744848bd9f5d56191c5085670f7` and `/fast/scratch/hyaku/kumitate-pin/src`.
2. Its `scripts/ufo-sighting:95` executes `node` by PATH name; `:10-24` also needs the ordinary shell utilities and retains the redirected compile-cache setting.
3. `scripts/cap-run.mjs:178-190` derives default child PATH from the **outer command**. For `/usr/bin/bash`, that is `/usr/bin`, not the current Node binary's directory. Its fresh `/run` also hides an fnm multishell PATH entry.
4. The shell-only fixture can pass without a resolvable `node`. Therefore F48's SP491 witness does not rule out this live regression. A `4/4` reading alone would not establish preserved live operability.

**Impacted axis:** operability. This is a fixable routing-environment defect, not a reason to enlarge the frozen four-site set.

**Smallest safe correction:** SP491's route must pass an explicit minimal PATH containing the resolved current Node executable's directory plus `/usr/bin`, along with the intended cache environment/bind. Do not forward the entire parent environment or reopen `/run`. Preserve SP519's three existing `UFO_*` values and temporary-state visibility independently. The existing H1 live checklist leg is the appropriate acceptance backstop: `SKILL.md:682` runs the real surface, and both inherited base receipts have that item PASS (`B/checklist-base-{1,2}.txt:3`). A new failure there is harm under the frozen H1 rule, even if every F48 re-run reads `4/4`. Such a trade is not made acceptable by the score; the canonical judge retains that decision.

I sent the SP491 executor a concise source-grounded warning about this PATH dependency; I did not edit or claim to verify its patch.

## 3. Are these the right four sites? A defensible bounded increment, not a complete surface

The list is coherent as **four source launch sites in two gates**. The signatures are disjoint at the frozen code shapes (`F48:66-69`), and both the outer and raw nested suites contribute target launches. It is not four independent gates or four independent host environments; three IDs share one owning suite and its global pass/fail outcome.

The round-47 plan did **not** justify every deferred file by item 697. Its precise statement is `.ufo/waves/round-47/plan.md:39-42`: cite-check and wave-census remain out because the battery mutates and reruns those suites. P48 `:48-49` compresses that into a broader exclusion sentence. The underlying reasons should remain distinct:

| Deferred surface | Local evidence | Shape assessment / smallest correction |
|---|---|---|
| cite-check children | `scripts/gate-mutants.mjs:35-36` names cite-check and wave-census as the only targets. | Item-697 isolation is a sound current deferral. Do not infer this target is now stable from a passing stand-alone selftest. |
| wave-census children | Same target list; `B/checklist-base-1.txt:26-34` and `checklist-base-2.txt:26-34` retain target timeouts and unstable confirmations. | Same deferral remains supported by inherited evidence. No basis here to call the battery load-independent. |
| gate-mutants children | Its runner is itself a detached-process-group, parent-identity, timeout and resource-observation harness (`scripts/gate-mutants.mjs:379-435`); the parent guard walks host `/proc` ancestry at `:397-408`. | Routing changes the very mechanism being measured; PID namespaces/session changes are not a mechanical helper swap. Retaining this exclusion is prudent. Describe it as a harness-semantics boundary, not merely a cite-check/wave-census dependency. |
| proxy-check children | `scripts/proxy-check.mjs:1562-1564` has a raw `runProxy`; the same helper also launches its nested `--selftest` at `:2877-2886`. Proxy-check is not in the battery's target list. | Item 697 is **not** a causal reason to omit it. A separate non-selftest/nested-selftest split is possible in principle, like C1's other helpers. Its omission is a bounded scope choice with residual work, not evidence of full containment or an unavoidable load dependency. |

Item 697 is still an open problem in the inherited measurements: its checklist wrapper ends at approximately 120 seconds with `exit=null`, not a completed CLEAN battery (`checklist-base-1.txt:26`: 120.168 s, load1 41.22; `checklist-base-2.txt:26`: 120.040 s, load1 51.64). Its own per-suite limit is 60 seconds (`gate-mutants.mjs:30,386`). Those distinct timeout layers must not be conflated with C1's counter stability.

**Impacted axes:** operability and calibration. Smallest correction is accurate per-file scope language; adding these deferred routes to r48 would change the frozen claim and is not recommended.

## 4. Named exclusions: topology sound, some explanations too broad

### RG1409 and SP1766

The exclusion is technically sound **for the existing runner topology**:

- These are raw parent-suite launches of nested selftests (`round-gate.mjs:1398-1418`; `surface-probe.mjs:1762-1770`).
- Routing the whole nested suite would put its own newly routed child launches inside bwrap. `cap-run.mjs:187-189` mounts a fresh `/run`; `:123-130` refuses binds that could restore the host runtime sockets. Its `systemd-run --user` path therefore cannot simply be reused for inner capsules.
- Keeping the nested suite outside a capsule lets its descendants use the same host runner normally. F48's descendant counting and ancestry checks still apply to their matching target execs.

**Necessary wording boundary:** these two nested **parents are uncapped**, not already protected by bwrap. It is the hypothetical act of routing them that creates the broken nested-scope topology. Say that their four-site descendants are still checked; do not claim the entire nested suite is contained. This is an explicit trade in coverage, not a secret exemption from C1's target checks.

### SP1049

The actual launcher is `spawnSync('bash', ['-c', item.command], ...)` (`surface-probe.mjs:1047-1051`). “The command is data” identifies where the command comes from, **not** why the resulting process is harmless or not executable. It is an active, inherited-environment shell launch with a wall-time limit, not a cap-run resource boundary. Checklist data can run the very selftests that need the host runner, and arbitrary commands have broader environment/write requirements than C1's four sites.

**Smallest safe correction:** retain this explicitly unclaimed checklist supervisor and its H1 behavior, but describe it as an uncapped data-driven supervisor, not a non-process surface. Do not claim arbitrary checklist payloads are contained. F48 also intentionally allows fixture tools (`:48,273`), so `4/4` never means that every child in either gate is capped.

## 5. What the inherited negative controls do and do not establish

A cheap “use the allowance and launch the same target raw” attack is already contradicted by local receipts, not accepted by this review:

- `B/CtlDodge-receipt.txt:15-28`: the shell-wrapper variant has passing suites and matching site counts; SP491/SP519/SP1592 have `uncapped_direct=0` but still all MISS for missing ancestry/canary conditions, final `held=0/4`, exit 1.
- `B/CtlNestedAllowance-receipt.txt:9-14`: nested-shape wrappers likewise have `uncapped_direct=0`; vanished target signatures lose on base-count equality and the remaining raw targets lose on ancestry, final `held=0/4`.
- `B/CtlFakeRunner-b-receipt.txt:9-14`: a canonically named runner without scope/bwrap loses on the missing chain despite passing suites and exact target counts, final `held=0/4`.

These receipts support the narrow ancestry check. They do not establish call-site provenance, all-children containment, or real-shim dependency fidelity. F48's allowances remain broad: `:73-74` accepts any number of qualifying first-exec shell `-c` children or suffix-matching nested suites; `:274` does not constrain their later non-target payloads. A newly added **non-target** raw payload can therefore lie outside this measurement without changing the four HELD labels. That is not a demonstrated false positive for the exact frozen predicate; it is a reason not to widen its interpretation.

## Minimal safe disposition

1. Keep the four frozen IDs, base, predicate, allowances, counter bytes and repeat-run kill rule intact.
2. Require source-level integration evidence for the four real `capSpawnSync` replacements; ancestry alone cannot supply that provenance.
3. Preserve the minimal live child environments and the already-declared H1 checks, especially the twice-passing live surface checklist item. `4/4` does not excuse harm.
4. Report `4/4` as closure of this sampled four-site set only. Keep cite-check, wave-census, gate-mutants, proxy-check, the two nested parents and the checklist supervisor explicitly residual. The existing operability proxy is terminal at integer 9 (`SCORECARD.md:361-368`); this result supplies no new basis to retire the real operability axis.

No C1 pass/fail, freeze amendment, admission, or shipping judgment is issued by this critic. No new measured `4/4` result is claimed.
