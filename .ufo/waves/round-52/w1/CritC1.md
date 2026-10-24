# CritC1 — C1 falsification review

## Axes and scope

Primary axis: **operability** (does the v2 contract actually run?). Review dimensions: causal attribution, defect coverage, checker authority/provenance, and backward compatibility. These are not additional lane claims or admission judgments.

Read-only review of the frozen plan, both counters, both base receipts, the shipped v1 source, historical round-51 controls, and available round-52 evidence. No probe, candidate instrument, judge, or other runtime was invoked. The only shell operations were read-only Git provenance and a base-blob SHA-256 calculation. No tools installed or updated. Findings below distinguish observed artifacts from source-derived counterexamples; the canonical judge owns the decision.

## (a) Before state is real; eight misses are not eight new capabilities

The frozen receipt is committed by `f539a71e236a4d66810851c1f2fb6e1abe61ec19` (`round-52: freeze — plan (2 claims, v2 wave of 64), counters A52/D52 v1, executed base receipts (Q43)`). Read-only `git show 02c01258464cac3804faf177d0cfbf113cd59706:scripts/receipt-attest.mjs | sha256sum` returned the plan's exact v1 hash:

`44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`.

Verbatim `base/attest52-base.txt:1`:

```text
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | B1 MISS exit=0 cases=0 last="ATTEST_SELFTEST: PASS" | B1c MISS exit=0 last="RECEIPT: VALID" | B2 MISS attest52-run-1.txt:absent;attest52-run-2.txt:absent;attest52-run-3.txt:absent | B2c PASS | B2e MISS run exit=64 last="receipt-attest: USAGE unexpected argument \"--stdin\" in run m | B3 MISS attest52-run-2-replayed.txt absent | B3c PASS | B4 MISS tool or receipts dir absent | B4c PASS | B4d PASS | B5 MISS pin match;proxy exit=1 PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=117 c | B5c MISS mutantReceipt=absent-or-malformed selfGuard=present | B6 PASS
```

Exactly five passing arms: **B2c, B3c, B4c, B4d, B6**. The base artifact itself contains no separate shell exit-status line; the frozen source's final branch specifies exit 1 for this unmet result (`probe/attest52-probe.mjs:470–474`).

The do-nothing control is discriminated: SCORECARD-only edits cannot fix **B1, B1c, or B2e**. However, the evidence does **not** establish that every newly passing arm requires v2 implementation:

- **B1:** changed selftest reporting/count is required. Base prints `ATTEST_CASE …: PASS`, not `case …: PASS`, so the observed count is **0**, not the plan's conceptual 27 (`scripts/receipt-attest.mjs:754–789`; A52:130–141). B1 checks a line count and a PASS substring, not the required cases' names, uniqueness, hermeticity, retention, or assertions.
- **B1c:** changed rejection behavior is required; unmodified v1 demonstrably accepts the one challenge.
- **B2e:** changed `--stdin` behavior is required; unmodified v1 exits 64.
- **B2/B3/B4:** populate the fresh round-52 receipt corpus/control and these can move without hardening the instrument.
- **B5:** the v1 pin already matches; repair inherited proxy/stanza/README drift and this can move without v2 semantics.
- **B5c:** add the mutant transcript; the external counter's guard already exists at base. No instrument-byte change is required.

Thus **[INFERENCE]** an unchanged v1 plus legitimately added evidence/metadata could reach 10/13, still missing B1/B1c/B2e. This is not an executed control result. No arm independently requires the `kumitate-receipt-attest-v2` label or a predeclared v2 implementation hash; B5 only binds the scorecard's declared hash to whichever instrument is present. The honest causal statement is three discriminating arms versus this v1, of which two are externally challenged semantics—not eight independently demonstrated hardening gains.

Available round-52 `build/ExecProbeSanity/attest52-f539a71e.txt:1` also records 5/13 at freeze. No measured close-revision after receipt was available in the inspected round artifacts; I did not wait for one.

## (b) Attribution of all thirteen arms

| Arm | Base | What it measures; routed-defect attribution |
|---|---|---|
| B1 | MISS | Selftest reporting/count umbrella. Intended home for R52-1/2/3/6/8, but the external arm does not assert those cases exist or exercise those defects. |
| B1c | MISS | Direct R52-1 malformed-clock rejection; one month-13 input, with recomputed digest and sidecar. Requires only nonzero/non-VALID, not specifically TAMPERED/1 or the entire round-trip contract. |
| B2 | MISS | Fresh committed receipts, distinctness, body-clock span. R52-7 is a **counter correction**, not a new v2-only instrument capability. |
| B2c | PASS | Retained round-51 argv/stdout challenge. Regression protection. |
| B2e | MISS | A2e/STDIN hash-consistency challenge; see the execution-provenance limit below. |
| B3 | MISS | Existing prelude-tamper property, newly populated committed control. |
| B3c | PASS | Retained round-51 live tamper property, but the fixture conflicts with strict v2 prelude shape. |
| B4 | MISS | Existing ledger/non-reuse behavior over the newly populated corpus. Does not directly assert R52-2 damaged-prior skip note. |
| B4c | PASS | Retained round-51 twin-replay property, but its renamed sidecar conflicts with v2 SHAPE. |
| B4d | PASS | Retained round-51 inner-digest property. |
| B5 | MISS | Instrument pin plus global metadata/proxy consistency; not a routed instrument-defect challenge. |
| B5c | MISS | R52-5 **counter integrity** evidence, partly a transcript-presence test. Not instrument hardening. |
| B6 | PASS | Round-51 receipt compatibility/no-regression control. |

This is **5/13 target-linked arms** (B1/B1c/B2/B2e/B5c), including two counter-integrity improvements and one self-reported umbrella; **8/13 are retained behavior, fresh receipt support, or metadata consistency**. The four named old challenge arms are 4/13; adding B6 gives five already-green regression arms. Only B1c and B2e independently challenge new instrument behavior (2/13), and neither establishes the complete declared contract by itself.

The ratio is defensible as a mixed **acceptance-and-no-harm conjunction**, not as “13 hardening defects fixed,” “eight new instrument capabilities,” or a defect-coverage percentage. Keeping old arms is valuable; attributing their existence to the new improvement is not. R52-2/3/6/8 rely on reviewing the real B1 cases and their mutant discrimination, beyond what the frozen B1 predicate actually asserts. B1c also leaves finite-but-normalized calendar cases and exact verdict behavior to that selftest/review.

## Strongest source-derived counterexample: conformant SHAPE cannot satisfy B4c

**Evidence:** frozen plan:75–78 requires a sidecar's recorded name to equal the receipt basename, otherwise TAMPERED. A52:347–350 creates `b4c-<random>.txt`; :369–370 copies that receipt and its **unchanged** sidecar to `orig.txt` and `orig.txt.sha256`. At :373–377 the original subject is required to read REPLAY, not TAMPERED.

**[INFERENCE, deterministic fixture trace]** a verifier obeying the declared basename rule must reject `orig.txt` as TAMPERED. If the ledger applies the same attestation rule to priors, the twin also cannot use that renamed original as valid replay evidence. Therefore the existing B4c fixture and the SHAPE contract cannot both be satisfied. This is a fixable counter defect, not a reason to weaken the implementation or accept a no-harm tradeoff.

**Smallest safe correction:** preserve the original receipt basename and matching sidecar in the ledger directory, and verify that preserved path. Alternatively reissue the copied sidecar with the new basename while retaining the same correct receipt hash. Preserve the two-direction replay requirement. This changes the frozen counter and needs an explicit freeze-repair version/addendum and fresh base receipts; do not silently keep the old rule identity.

**Second contract collision:** A52:290 rewrites the prelude to `2020-01-01T00:00:00.000Z (rewritten by probe B3c)` and :295 demands TAMPERED/1. The parenthetical violates plan:75–76's exact prelude grammar, whose specified result is UNREADABLE/2. **[INFERENCE]** a strict parser can correctly fail B3c. Use a grammar-valid changed timestamp, preferably preserving the basename in a separate directory so the test isolates prelude tampering instead of also invoking the new sidecar-name rule.

## A2e provenance: the frozen arm captures a different invocation

A52:240 runs the instrument; :246 reads **its** receipt nonce; :249 checks `stdin_sha256 == sha256(nonce)`; :251 separately spawns `/bin/cat` with that same nonce; :252 compares the recorded stdout hash to this separate cat's output.

The probe does not capture the instrument-spawned child's stdout. For cat, its two hash expectations reduce to the same nonce hash. **[INFERENCE]** they can be satisfied by an implementation that supplies consistent hashes without running the requested child. This is a source-derived discriminator gap, not an executed whole-counter forgery result.

There is also a provenance distinction from the cited round-51 rehearsal: `round-51/w1/ExecForgerControl.md:185–197` describes a **probe-issued** nonce passed on the instrument's stdin and an argv check. Frozen A52 uses an instrument-generated nonce and has no equivalent argv assertion inside B2e. The historical rehearsal is evidence against the exact old argv-hashing forger, not an executed validation of this changed A52 challenge or of universal child execution.

**Smallest safe correction:** describe B2e as an independent **expected-output consistency check**, not capture of the same child, and retain the declared whole-tree-author limit. If K3 is intended to exclude the broader zero-child class, obtain an independent execution witness/discriminator; do not claim this arm already provides one. This does not excuse an implementation that violates the actual `run` contract.

## (c) B5 is a named inherited limit, not independent authority

A52:420–428 directly checks the instrument hash, then executes **the scored revision's** `scripts/proxy-check.mjs` and accepts its exit 0 / `PROXY: MATCH` output. It does not authenticate that checker against an independently frozen checker. Its pin regex is also unscoped to the gate-pins block.

The limitation is already explicit, not newly discovered or fixed by v2: `SCORECARD.md:2335–2336` says **“The A5 proxy conjunct executes the scored rev's own `proxy-check.mjs` (self-referential pin cannot close it).”** The proxy source itself says `pin.proxy-check` hashes the file **“for a reader, not for this run”** (:187–191). Historical forger evidence (`round-51/build/ExecForgerControl/transcript-v3r6.txt:34–37`) records A5 PASS in a whole-tree forger's 9/9 result. That is inherited evidence, not an A52 rerun.

**Impacted dimensions:** authority/provenance and attribution. B5 is useful consistency/no-harm checking within the author-controlled-tree model; it is not an independently trusted oracle, nor proof that its entire proxy computation ran honestly. Re-pinning a changed proxy does not repair this trust boundary.

**Smallest safe correction:** carry the A5 limitation forward explicitly as B5 in the round-52 claim/report; never say v2 closed it. If independent checker authority is required, execute a freeze-anchored checker/dependency set with a declared compatibility contract and test its substitution control. Merely adding a pin that the same replaceable checker verifies is not sufficient.

## Predicate consequence / handoff

**Review conclusion, not an admission verdict:** C1 is **not established as declared** by the available evidence. The before state is authentic and a genuine do-nothing control cannot reach the declared after predicate, but there is no available measured after receipt; more importantly, the frozen B4c fixture conflicts with the declared v2 contract. A future 13/13 output alone must not be represented as independent verification of every SHAPE/CLOCK/STDIN/LEDGER/SELFTEST requirement or of child execution.

For a contract-aligned repair retaining the thirteen-arm layout, the exact frozen predicate sentence that must change is the **A52 version** in plan:53 and the matching probe/report/SCORECARD identity. Proposed replacement identity (not an observed result):

> ATTEST52_HELD — node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=<rev> rule=A52 version=v2" and exits 0.

Keep the thirteen required checks; repair fixtures, not the implementation to accommodate invalid fixtures, and do not lower the denominator. If additional independent semantic arms are needed to support the full-package claim, their count and version must instead be declared explicitly. Plan:150–153 already requires both base receipts to be freshly executed after a freeze repair. L1 owns those executions and the final committed-byte/close-revision checks. Preserve the inherited B5 and whole-tree-forgery limits, and distinguish regression coverage from new functionality in the after attribution.

Report: .ufo/waves/round-52/w1/CritC1.md
