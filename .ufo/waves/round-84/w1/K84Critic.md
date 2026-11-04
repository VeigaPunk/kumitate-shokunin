# K84Critic — frozen C84 counter-receipt review

Axes: **operability** (real receipt-reading capability, terminal score 9 unchanged) and **coverage** (contract discrimination). Lane-author advice only; not admission, judgment, or non-author closure.

Revision: freeze `3794b903324e7eb4aec6d92539f2ca4e2c0b6727`; base `a648a6f8f3028fc4f72d27470b4673fe8e3e5866`. Read tooling RULES, godspeed, frozen plan/probe/controls, PROVINCE and relevant QUALITY criteria (Q21/Q24/Q26/Q29/Q30/Q43). No installations, production edits, frozen edits, delegation, git mutations, or shared-tree checks.

## Strongest counterexample: no receipt reading, 16/16

Owned `build/K84Critic/no-work-counter-receipt.mjs` never opens a receipt. It prints one constant line containing CLEAN, USAGE, and every expected finding token; selects exit code solely from the public receipt basename (usage from absent argv). Thus it performs none of the claimed reconciliation.

Observed frozen command, with explicit scratch cwd and TMPDIR:

`TMPDIR=/fast/scratch/hyaku/kumitate-r84/K84Critic/tmp node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/probe/probe84-c1.mjs --lane /fast/scratch/hyaku/kumitate-r84/K84Critic/no-work --work /fast/scratch/hyaku/kumitate-r84/K84Critic/work`

Result: **`C84_C1: HELD held=16/16`, exit 0**. Every actual arm printed ok. Evidence: `.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`.

Candidate sha256: `50104063d5116cc2cf576978ef8417b1b3f9a969086aa70135b7439e27a792b8`.
Executed and freeze-commit probe sha256 both `e3a26649f13fc318d5f8a06fda3cd54113f399cc30a57816d60de5d0b629237d`; read-only git-show command exited 0, recorded in `build/K84Critic/freeze-binding.txt`.

Direct counterexample: the same candidate, `--receipt /fast/scratch/hyaku/kumitate-r84/K84Critic/ordinary-receipt.txt`, input `X arm a FAIL` then `X: HELD held=1/1`, returned its constant CLEAN-containing output and **exit 0**. Contract requires **exit 1 HELD_COUNT** (zero ok rows, N=1; precedence before ARM_FAILED). Receipt: `build/K84Critic/renamed-red.txt`; input preserved in `ordinary-receipt.txt` beside it. Filename, not receipt bytes, controls the answer.

Two separable defects:

1. Public labels identify every expected status. No same-path content mutation or label-independent corpus defeats a label-keyed no-reader. Q29 explicitly names this control class, but frozen controls cover only absent and constant-CLEAN.
2. `out.includes(token)` accepts contradictory output containing all findings plus CLEAN, on stdout or stderr. No unique finding/output-form assertion binds success to the actual diagnosis. Exact output matching alone would not fix the filename oracle: a label lookup could print one expected token instead.

The plan's do-nothing-control-reaching-16 kill condition is **observably reachable**, not vacuous. This receipt is evidence for the canonical decision-maker; it must not be reclassified as a genuine implementation. A strictly fixed-output/fixed-exit printer cannot pass all rows, but that weaker control does not establish a receipt-reading capability.

Smallest safe current-round correction: retain frozen bytes and disclose this control and kill-condition evidence; do not use this green as sufficient capability evidence or silently narrow the kill rule. For a separately frozen successor, remove outcome-bearing basenames, exercise different contents under the same path, generate rule-relevant variations and combined-precedence cases, and assert one unambiguous expected result; rerun absent/constant/junk/no-reader/label-keyed controls before data. No successor predicate was created here.

## Sixteen cases against contract

| Cases | Contract branch exercised | Important limit |
|---|---|---|
| clean, crlf | two passing rows, exact headline, line endings | No arbitrary prefixes/names, metadata or varied row counts |
| hidden-red, total-drift | ARMS_TOTAL | Hidden-red also contains FAIL, but total precedence is correctly expected |
| held-drift | HELD_COUNT | Only passing rows with wrong numerator |
| duplicate | ARM_DUPLICATE | No competing drift to test precedence |
| foreign-arm | ARM_PREFIX | No competing drift to test precedence |
| two-summaries, no-summary | SUMMARY_COUNT | No combined malformed/order inputs |
| malformed-arm | ARM_MALFORMED for MAYBE status | No invalid name/prefix, number overflow, negative, fractional fields |
| zero-arms | ARMS_EMPTY with 0/0 | No other empty/malformed combinations |
| missing | RECEIPT_UNREADABLE for absent path | No unreadable/directory input |
| usage | USAGE for absent args | No unknown/duplicate option or missing-value cases |
| honest-red | ARM_FAILED with truthful UNMET | Correctly rejects red even without headline drift |
| wrong-verdict | VERDICT on all-green UNMET | No other summary grammar boundaries |
| summary-before-arms | SUMMARY_ORDER | Only summary entirely before rows |

None checks `--selftest`, its own-CLI invocation, explicit/default scratch behavior, read-only behavior, or nonexecution of receipt text. No frozen case runs the three historical real-task files. These are coverage gaps, not observed implementation bugs: no production candidate was run by this seat. A conforming implementation can improve operability, but 16 static labels do not prove the improvement.

## Denominator and controls

Within a normally completed loop, `ran++` happens for all 16 table entries, and held increases only on the conjunction of child status and token substring. Missing tool, timeout, or child failure does not silently shrink the denominator; a normal all-green result requires ran=table.length=16. The existing base receipt is 0/16 exit 1; constant-CLEAN is 2/16 exit 1. These are useful, limited negative controls. They were read, not rerun.

The denominator repair addresses the old omitted-row arithmetic: it does **not** establish that an ok row measured behavior. This counterexample makes all 16 evaluations false positives without skipping any loop iteration. Fixed literal 16 also means adding an arm requires a new freeze, appropriately not done here. A child can print newlines, so human-readable trace text is not escaped; machine arm assessment must use the probe's own records rather than arbitrary embedded lines. No trace-injection run was needed for the demonstrated 16/16 defect.

## Source and Gate quality

Read-only `git show d5fc2c94:.ufo/waves/round-83/probe/probe83-c1.mjs`, exit 0, confirmed line 21 `const ARMS = 27;`; see `build/K84Critic/source-anchor.txt`. Opened historical `close/c1-probe.txt`: line 4 is `band-total-resumes FAIL`, line 30 is `C83_C1: HELD held=27/27`; rows extend from line 2 through line 29. Together these support the **narrow** S243 lesson that headline arithmetic can conceal an observed red, not broad claims of counter soundness.

S244 as a reject of that headline as *sole admission proof* is a substantive negative example, not rejection of the historical artifact's existence. Smallest safe Gate wording: name S244, Q6 row honesty / reconciliation criterion, quote the conflicting lines, and state the flip as independently reconciled actual arm rows and outcomes. Do not replace history with the repair or claim that the old artifact becomes CLEAN. Q21 requires this criterion and flip; Q24 requires pinned measured bytes. S243/S244 remain distinct uses of own-work evidence, not two independent external authorities. No final Gate/source rows existed in the assigned evidence reviewed here, so their landed quality is unobserved.

## Commands, limits, artifacts

- Successful bounded probe: node v26.12.0, 16/16, exit 0; full command/revision/digests in `no-work-probe-node.txt`.
- Direct renamed red: exit 0 when contract requires 1; full command/revision in `renamed-red.txt`.
- Source and freeze read-only git-show commands: exit 0, in `source-anchor.txt` and `freeze-binding.txt`.
- Initial launcher attempt used the Eval host's `process.execPath` (`/home/vgpnk/.local/bin/omp`) instead of node; exited 2 with unknown --lane/--work flags and did not run the probe. Preserved separately as `no-work-probe.txt`; it is not the successful receipt. Corrected by explicitly invoking node, without repeating setup.
- Durable directory: `.ufo/waves/round-84/build/K84Critic/`; scoped report: `.ufo/waves/round-84/w1/K84Critic.md`.
- Scratch removed after copying durable evidence. No tool installation/update. No production validation or implementation verdict; canonical judgment remains external.
