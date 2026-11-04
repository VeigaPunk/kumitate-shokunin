source: S243 — own-work `.ufo/waves/round-83/probe/probe83-c1.mjs:21,134-142,242-246` at d5fc2c9407a75e939b332560f54548f2dd52629e; supporting recorded outcomes `.ufo/waves/round-83/close/c1-probe.txt:2-30`.
verified-at: 2026-11-04 — reopened counter and transcript; round-84 runtime measurements are retained in `.ufo/waves/round-84/close/` and named by measured revision there.
recheck: node scripts/counter-receipt.mjs --receipt .ufo/waves/round-83/close/c1-probe.txt (expected exit 1 ARMS_TOTAL); repeat with c1-repair.txt (expected exit 0 CLEAN); selftest --work DIR for isolated CLI fixtures.

# Counter transcript reconciliation

## Rule and observed defect

Do not admit a supported counter transcript on its headline alone. S243 declares
`const ARMS = 27;` at line 21 but registers 28 arm calls. Its committed C1
transcript contains 27 ok rows and one FAIL (line 4), followed by HELD 27/27
(line 30) and recorded exit 0. The unchanged repair transcript is 28/28 with
zero FAIL; C2 is 16/16. Reproduce these counts with
`node .ufo/waves/round-84/build/K84ExecHistory/history.mjs`.
The source/receipt readings are evidence of the old defect, not a new execution
of those historical counters.

`kumitate-counter-receipt-v1` reads `--receipt FILE` as text, never executable
code. Supported rows: `PREFIX arm lowercase-name ok|FAIL [detail]`; summary:
`PREFIX: HELD|UNMET held=N/D`. Prefix `[A-Z][A-Z0-9_]*`, name
`[a-z0-9][a-z0-9-]*`; nonnegative safe integer counts, column-zero records,
CRLF accepted. Key=value and command/rev/exit metadata are ignored. An ok row
means the probe expectation passed, not that its child exited zero; detail
text may contain nonzero exit codes and nested verdict strings.

## Decision and error table

| condition, in precedence order | exit | finding |
|---|---|---|
| unreadable input | 2 | RECEIPT_UNREADABLE |
| not exactly one valid safe-number summary | 2 | SUMMARY_COUNT |
| arm-shaped line with invalid fields | 2 | ARM_MALFORMED |
| no arms | 2 | ARMS_EMPTY |
| summary before last arm | 2 | SUMMARY_ORDER |
| denominator differs from row count | 1 | ARMS_TOTAL |
| repeated name | 1 | ARM_DUPLICATE |
| row prefix differs from summary | 1 | ARM_PREFIX |
| numerator differs from ok count | 1 | HELD_COUNT |
| any FAIL, including honest UNMET | 1 | ARM_FAILED |
| all green but summary is UNMET | 1 | VERDICT |
| reconciled HELD transcript | 0 | CLEAN |
| bad arguments | 64 | USAGE |

CLI prints one `COUNTER_RECEIPT:` verdict. `--selftest [--work DIR]` invokes
its own CLI over isolated fixtures, asserting exit and the exact verdict.
Default scratch uses HYAKU_SCRATCH or `/fast/scratch/hyaku`; no network or
production writes. Explicit --work is recommended in campaign runs.

## Limits and the round-84 counterexample

Consistency is not semantic correctness or custody. Rows and headline share
one authority; deleting a row and adjusting the headline can remain consistent.
There is no independent expected roster input and no authenticated rev/exit.
The r81 PASS rows and suffixed summary, selftest-only summaries and JSON are
outside this grammar. A FIFO can block an unbounded ordinary file read; arbitrary
hostile files and huge inputs are not promised safe. Use trusted committed
regular receipts and external process limits when inspecting untrusted input.

The round-84 frozen probe derives its denominator from its table and executed
rows, preventing r83's count mismatch in its own normal loop. It is nevertheless
**not sufficient capability admission evidence**: K84Critic's no-reader
basename-keyed printer reaches 16/16 without opening receipts
(`.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`). This fires the
frozen kill rule. Round 84 must report C1 unmet, even if the actual gate passes
its tests and real historical task. Do not replace the frozen predicate after
data. A separately frozen successor needs same-path content variation and
non-outcome-bearing names, plus an unambiguous output assertion.
