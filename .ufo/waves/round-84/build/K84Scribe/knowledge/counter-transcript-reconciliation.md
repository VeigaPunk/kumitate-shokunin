source: S243 — own-work, `.ufo/waves/round-83/probe/probe83-c1.mjs:21` at `d5fc2c9407a75e939b332560f54548f2dd52629e`, opened 2026-11-04; reconciled against `.ufo/waves/round-83/close/c1-probe.txt:2-30` at the same commit (receipt names measured revision `1c1a855a0bae88d55ef141c96bef52e0fa980c23`).
verified-at: 2026-11-04 — read-only `git show` of the pinned counter and receipt succeeded, exit 0 each; the source declares `const ARMS = 27;`, whereas the receipt contains 28 arm rows, 27 ok, one FAIL, and a 27/27 HELD headline. This is source/transcript inspection, not execution of the new gate. Round-84 candidate and close measurement are not yet measured by this scribe.
recheck: On changing the receipt grammar or counter execution loop, re-read S243 and reconcile the transcript's rows with its headline; L1 runs the frozen round-84 probe and the three historical-receipt checks at its measured revision, retaining command, exit and revision. No freshness claim beyond 2026-11-04.

# Counter transcript reconciliation

## Rule

A green counter headline is not sufficient evidence. Before admitting a supported arm transcript, reconcile its declared denominator with the number of recorded arm rows and its held numerator with the ok rows. Require unique names, one prefix, one trailing summary, and no failed arm. At the producer, derive the denominator from executed cases and check execution against the frozen case table; do not maintain a second independent tally constant.

## Observed failure

S243's pinned source declares `const ARMS = 27;` at line 21. Its `arm()` helper records every outcome but its final verdict checks only `held === ARMS`. The committed receipt `.ufo/waves/round-83/close/c1-probe.txt` records 28 arm rows at lines 2–29. Line 4 is `band-total-resumes FAIL`; line 30 nevertheless says `C83_C1: HELD held=27/27`, followed by `exit=0`. The headline accurately reports 27 successes but hides the failed 28th row by declaring the wrong denominator.

The failure also exposes fixture interference: attack 2/12 trips `ATTACK_SHARE` before the intended band assertion. The supplementary repair transcript `.ufo/waves/round-83/close/c1-repair.txt` records 28 ok rows and 28/28, with attack 3/12 in the repaired fixture. The second historical control `.ufo/waves/round-83/close/c2-probe.txt` records 16 ok rows and 16/16. All three receipts name measured revision `1c1a855a0bae88d55ef141c96bef52e0fa980c23`; none is rewritten.

## Scoped interface and expected use

The frozen round-84 contract specifies `node scripts/counter-receipt.mjs --receipt FILE`. It reads text; it must not execute receipt content. Supported arm rows are `PREFIX arm lowercase-name ok|FAIL [detail]`; the sole trailing summary is `PREFIX: HELD|UNMET held=N/D`. Prefixes match `[A-Z][A-Z0-9_]*`, names `[a-z0-9][a-z0-9-]*`, and counts are nonnegative safe integers. Metadata is ignored and CRLF is accepted.

No finding means exit 0 / `COUNTER_RECEIPT: CLEAN`. Drift exits 1, malformed or unreadable receipts exit 2, bad CLI exits 64. Frozen precedence is SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY, SUMMARY_ORDER for malformed input; then ARMS_TOTAL, ARM_DUPLICATE, ARM_PREFIX, HELD_COUNT, ARM_FAILED, VERDICT for drift. The historical red must report ARMS_TOTAL before ARM_FAILED; repaired C1 and C2 must be CLEAN. These are required outcomes, not scribe-observed execution results.

Round-84's frozen probe uses `ran === cases.length && cases.length === 16` and prints held/ran. Its base and constant-CLEAN control receipts record UNMET 0/16 and 2/16 respectively, each exit 1. Candidate 16/16 remains not yet measured in this draft.

## Authority and limits

- Rows and headline come from the same transcript authority. Reconciliation is not independent evidence that subprocesses ran or tools told the truth.
- Removing a row and adjusting both headline counts can leave a self-consistent transcript. Missing arms cannot be detected without an independent expected roster; the receipt CLI has no such roster input.
- Only the frozen grammar is supported. Arbitrary historical counter formats, selftest summaries and JSON receipts are not covered.
- The gate does not judge semantic tool truth, predicate isolation, `rev=` authenticity, subprocess exit metadata, byte provenance, or claim admission. A consistent forged transcript can pass.
- Historical evidence and a supplementary repair remain distinct; neither rewriting frozen counters nor silently replacing their receipts is justified.
