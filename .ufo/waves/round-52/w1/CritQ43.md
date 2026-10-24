# CritQ43 — round-52 Q43 conformance audit

Read-only critic review; no judgment, admission, integration, or runtime orchestration performed. Evidence cutoff: 2026-10-24T04:07:08Z. Paths below are lane-relative unless absolute.

## Axes

- **Operability (C1):** counter executability, satisfiability, and effective kill controls.
- **Coverage (C2):** independently executable D52 evidence, including after any freeze repair.
- **Calibration/provenance:** distinguish an assigned control from an executed control, an arm-level survivor from a full predicate pass, and a synthetic tail test from a full counter run. No new claim is proposed on this axis.

## (a) Freeze receipts: present and independently reproducible

Freeze commit: `f539a71e236a4d66810851c1f2fb6e1abe61ec19`.
Measured base: `02c01258464cac3804faf177d0cfbf113cd59706`.

Read-only `git ls-tree` proves both base receipts are present in the freeze commit. `git hash-object` of the five working files equals the corresponding freeze-commit blob identities. Independently computed SHA256 values also match CritFreeze's independently supplied values:

| artifact under `.ufo/waves/round-52/` | SHA256 |
|---|---|
| `plan.md` | `563d086bf1f59c60bb556501c0676597ec0df551eb03df57caacf1455c336565` |
| `probe/attest52-probe.mjs` | `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428` |
| `probe/doctrine52-probe.mjs` | `e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169` |
| `base/attest52-base.txt` | `57355f3d6a1cc669e39993513e4fd9433a2a8c9d9c6cd9363d0fb468f1b0167d` |
| `base/doctrine52-base.txt` | `4c7f1363791498e450608cef3ce7c1fc0273b08d02db84aa23081c5f6367a6f9` |

I executed BOTH frozen counters against the actual base above, with `TMPDIR` restricted to my own `build/CritQ43/tmp/`. Observed results:

- A52: `ATTEST52_UNMET held=5/13 checks=13`, exit **1**.
- D52: `DOCTRINE52_UNMET held=0/5 checks=5`, exit **1**.

Saved stdout: `build/CritQ43/{attest52-base-rerun,doctrine52-base-rerun}.txt`. Their SHA256 values are exactly the committed receipt hashes in the table; lengths are 675 and 124 bytes respectively. Thus the before-receipts match byte-for-byte, not merely by held count.

**No Q43 before-receipt presence/execution defect found.** Compare like revisions: CritFreeze's separate runs at the freeze revision necessarily change `rev=` and A52's B5 drift diagnostic (the two newly committed probe scripts affect A). Those differences are not a mismatch against receipts explicitly measured at `02c01258`.

## (b) K1–K5 coverage and observed execution

Assignment evidence: `w1-spec.json` items `ExecForgerV2` and `MutCounter52`; frozen rules: `plan.md:137-146`.

| control | responsible seat/item | evidence inspected | limitation |
|---|---|---|---|
| K1 base/do-nothing | **L1** freeze receipts; independently repeated by CritQ43/CritFreeze | committed A52 base receipt: 5/13, exit 1 | This is the plan's explicitly designated K1 control. |
| K2 print-stub | **ExecForgerV2**, item (a) | `build/ExecForgerV2/stub-probe.txt`: 1/13, `EXIT_STATUS=1`; B1/B2c/B2e/B3c miss | Executed and rejected. |
| K3 zero-spawn forger | **ExecForgerV2**, items (b)/(c) | `build/ExecForgerV2/forger-probe.txt`: 7/13, `EXIT_STATUS=1`; **B1, B2c, B2e PASS** | Executed, but purported B2e kill is false; the tested tree lacks unrelated fixtures/pins. See F2. |
| K4 counter mutants | **MutCounter52**, items (a)/(b), plus (c)/(d) | `build/MutCounter52/TABLE.md`: all 13 drop-one executions; `counter-mutant.txt`: 0/0 UNMET, exit 1 | Empty-check guard works. Base-only drops do not test sensitivity; positive tail counterexample below. |
| K5 D52 do-nothing | **L1** freeze receipts; independently repeated by CritQ43/CritFreeze | committed D52 base receipt: 0/5, exit 1 | Executed and rejected. |

**NO control lacks a mapped item.** This does not establish that every declared kill property holds. Peer transcripts above were read, not re-executed by me. Their integration/commit remains L1-owned.

Q43 (`corpus/QUALITY.md:806-812`) also says controls run “before data.” The inspected K2–K4 receipts are wave-seat evidence; they do not by themselves prove pre-data ordering. **P2 provenance gap:** do not turn this mapping into a claim that every control was run before data. Preserve actual execution order; no later receipt retroactively proves an earlier execution.

## Findings and smallest safe corrections

### F1 — P1: strict sidecar naming makes the B4c positive witness fail

**Counterexample/evidence:** `plan.md:76` requires a sidecar's recorded name to equal the receipt basename. Frozen A52 `:369-370` renames the original receipt to `ledgerDir/orig.txt` but copies its original sidecar unchanged. That sidecar names `b4c-<random>.txt`, not `orig.txt`.

This is already exercised by the peer's strict-name verifier: `build/ExecForgerV2/forger-probe.txt:1` reports:

`B4c MISS twinValid=true ledger(orig)=RECEIPT: TAMPERED ledger(twin)=RECEIPT: VALID`

The verifier's basename enforcement is visible at `build/ExecForgerV2/forger-tree/scripts/receipt-attest.mjs:45`; its damaged-prior skip behavior is at `:51-57`. **[INFERENCE]** Any v2 obeying SHAPE's name rule must reject the renamed original as TAMPERED, so this B4c construction cannot provide the required two REPLAY results. The peer implementation is a zero-spawn adversary, not evidence that the delivered production v2 was tested.

**Impacted axes:** operability; calibration if a compliant scratch is blamed or strict naming is removed to obtain green.

**Smallest safe correction:** named freeze repair of the B4c fixture only: after copying the original to `orig.txt`, regenerate its sidecar with the same receipt-byte hash and recorded name `orig.txt`. Retain strict naming, the changed-body twin, and REPLAY in both directions. Do not weaken the instrument contract. Execute the repaired positive witness and both base counters through the addendum procedure.

### F2 — P1: K3's claimed B2e closure is contradicted by the executed control

**Counterexample/evidence:** the zero-spawn control scores **B2c PASS and B2e PASS**. Its `doRun` (`forger-tree/scripts/receipt-attest.mjs:70-105`) contains no child-process launch: for `/bin/cat` it synthesizes `stdout = nonceBytes` (`:86`); for printf it uses the argument bytes (`:87`). It also fabricates passing selftest lines (`:124-127`), and B1 passes.

A52 `:249-252` hashes the instrument-reported nonce and independently runs a *different* `/bin/cat` on those same known bytes. This checks consistency of predictable output, not execution of the claimed child. Thus `plan.md:141-143` overstates what B2e closes.

The overall 7/13 UNMET is not a complete K3 kill: B2/B3/B4 lack committed receipt fixtures, B5 lacks the replacement pin/proxy repair, B5c lacks the mutant receipt, and B4c hits F1. No 13/13 zero-spawn pass is claimed here.

**Impacted axes:** operability and calibration.

**Smallest safe correction:** report the arm-level survivor honestly and complete the already-assigned full-tree control before relying on its rejection. If the control clears the repaired counter, suspend C1 evidence and make a named counter/evidence repair that observes the claimed invocation rather than a separately reconstructed cat output. Merely declaring a zero-spawn implementation “inside the forgery boundary” or dropping K3 changes the frozen contract; it is not a harmless repair this critic can authorize.

### F3 — P1: K4's never-HELD property is stronger than the frozen guard

**Counterexample/evidence:** frozen A52 `:470-474` requires only `held === checks.length && checks.length > 0`. I executed that decision logic with the original check IDs minus B1 and all remaining checks true:

`TAIL-LOGIC-ONLY: ATTEST52_HELD held=12/12 checks=12; exit=0`

Evidence: `build/CritQ43/guard-counterexample.txt`. This is explicitly a **tail-only synthetic test, not a full counter/tree pass**. MutCounter52 independently extracted the frozen decision lines and reproduced 13/13 HELD, **12/12 HELD**, and 0/0 UNMET (`guard-witness.json`).

At base, all drop-one mutants remain UNMET because eight checks already miss. `TABLE.md:28-30` additionally records byte-identical baseline output for three relaxed-threshold mutants: the changed thresholds were not exercised. A claim that those runs establish effective mutation sensitivity would be premature.

The exact frozen **13/13 predicate still rejects 12/12**. This is a defect in the stronger K4 promise (“must never print HELD”), not proof that the exact predicate was passed by a dropped check. Verdict-swap mutants printing HELD5/13 are likewise rejected by the exact predicate; arbitrarily changing an emitter is not evidence that the untouched counter accepted that state.

**Impacted axes:** operability; calibration if label-level and predicate-level rejection are conflated.

**Smallest safe correction:** pin the complete 13-check identity set, uniqueness, and count in the final label/exit condition; preserve the nonempty guard. Re-run deletion mutants against an actual all-green witness and threshold mutants against discriminating boundary fixtures, not only the multiply-red base. Process this as a named freeze repair and re-run both base counters.

### F4 — P2: ExecProbeA52 is an assigned witness, not yet a sound completed positive proof

**Evidence:** `w1-spec.json:35` permits receipts spaced less than 300 seconds (“note it”) and permits a MISS list. Frozen B2 (`attest52-probe.mjs:200-210`) still requires at least 300 seconds from digest-bound body clocks. A 12/13 transcript with B2 missing cannot establish that the counter is able to pass. D52's positive run is also conditional on absent entry/source drafts.

At this review's inspection, `build/ExecProbeA52/` contained a scratch tree but no `scratch-held.txt`; the positive witness remains a dependency, not a claimed failure or success. The seat acknowledged F1 and said it would retain compliant naming and preserve the resulting MISS.

**Impacted axes:** operability and coverage.

**Smallest safe correction:** require an unmodified operative frozen counter to produce actual 13/13 exit 0 at a named immutable scratch revision; obtain the required span rather than treating files alone as sufficient. Likewise obtain D52 5/5 or keep its positive witness explicitly unresolved. Scratch evidence establishes satisfiability only; it does not replace L1's genuine production receipts or R1/R2 close receipts.

### F5 — P2: BOTH-base-reruns rule is explicit, but the promised numbered repair procedure is absent

**Evidence:** `plan.md:150-153` expressly says **any freeze repair re-runs both counters and commits fresh base receipts under the same paths**. This part is correct: there is no missing “both” requirement. But “addendum below, numbered” has no target; the frozen file ends at line 219 without an addendum/procedure defining repair identity, revalidation, or when a previously invalid witness becomes usable.

**Impacted axes:** operability, coverage, and provenance. A repair of A52 must not leave D52's before-receipt associated only with the old freeze identity.

**Smallest safe correction:** L1 appends a numbered, committed repair record containing: finding/reproducer; old/new probe hashes and exact diff; unchanged contract versus any explicitly authorized predicate/version change; original base `02c01258`; actual executions and exits of **both** counters at that base; fresh receipts at both prescribed paths; and re-execution of the affected positive witness and kill controls against the repaired identity. Preserve the original freeze in history. A silent threshold/contract relaxation is not this procedure.

## Consequence for this round

Base execution/presence is established; control seat coverage exists. Positive satisfiability and effective K3/K4 claims are not established by those facts. If ExecProbeA52 confirms a probe bug, its MISS is a freeze-repair finding, not a production-instrument defect and not a substitute HELD receipt. The already-declared repair path must be completed before relying on the repaired counter; **both base counters must be re-run even when only one changed**. C1 remains unsupported until its operative counter has valid positive/kill evidence; C2 remains a distinct claim with its own predicate. The two-claim round is not demonstrated complete by this review. Only canonical authority issues the actual judgment; this critic issues none.

## Execution and write boundary

Own executions: read-only git freeze inspection; SHA256/blob comparisons; one base run of each frozen counter; one isolated final-guard test. Wrote only this report and `build/CritQ43/` evidence/scratch. No production edits, git/jj mutations, build/lint/format runs, tool installs, or tool updates. Installation record: **none**.
