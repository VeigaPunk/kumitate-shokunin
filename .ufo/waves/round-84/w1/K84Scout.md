# K84Scout — frozen source reconnaissance

Date: 2026-11-04. Revision examined: `3794b903324e7eb4aec6d92539f2ca4e2c0b6727`; supplied base: `a648a6f8f3028fc4f72d27470b4673fe8e3e5866`. Axes: operability (capability acquisition at terminal 9) and coverage. Findings are lane-author advice, not closure or an implementation score.

## Frozen arms, before implementation data

Observed: the frozen plan and probe have the same **16 names in the same order**. The loop increments `ran` after each spawned CLI result; success also requires `ran === cases.length` and `cases.length === 16`. No hard-coded held denominator substitutes for executed rows.

| Arm | Expected exit / finding | Static correspondence |
|---|---|---|
| clean | 0 / CLEAN | Two unique passing rows, 2/2, trailing HELD |
| crlf | 0 / CLEAN | Same bytes with CRLF separators |
| hidden-red | 1 / ARMS_TOTAL | Two rows versus denominator 1; total precedence before failure |
| total-drift | 1 / ARMS_TOTAL | Two rows versus denominator 3 |
| held-drift | 1 / HELD_COUNT | Two passing rows versus numerator 1 |
| duplicate | 1 / ARM_DUPLICATE | Repeated a; counts otherwise agree |
| foreign-arm | 1 / ARM_PREFIX | Y row under X summary |
| two-summaries | 2 / SUMMARY_COUNT | Two valid summaries |
| no-summary | 2 / SUMMARY_COUNT | One valid row, no summary |
| malformed-arm | 2 / ARM_MALFORMED | MAYBE status, one summary |
| zero-arms | 2 / ARMS_EMPTY | Zero rows with 0/0 summary |
| missing | 2 / RECEIPT_UNREADABLE | Fresh temporary root, file deliberately not written |
| usage | 64 / USAGE | CLI receives no arguments |
| honest-red | 1 / ARM_FAILED | FAIL with honest UNMET 0/1 |
| wrong-verdict | 1 / VERDICT | Both rows pass, but summary UNMET |
| summary-before-arms | 2 / SUMMARY_ORDER | Unique summary precedes rows |

[INFERENCE] Every expected result is logically reachable under the stated contract; no r83-style contradictory fixture was found. This is static reconnaissance, not observed implementation execution.

Contract ambiguities / coverage limits, not permission to alter the freeze:
- The plan requires safe nonnegative numeric fields but does not explicitly assign a finding token to malformed/unsafe summary numbers or an invalid verdict spelling. Exact-summary recognition can reasonably produce SUMMARY_COUNT; that mapping is not frozen by an arm.
- Whitespace tolerance, BOM, and the exact boundary of “looking like an arm” are not fully specified. The frozen fixtures use column-zero rows and ordinary spaces; they do not resolve these policies.
- Invalid name, unsafe integer, combined-fault precedence, trailing metadata and the real historical receipts are not individually exercised by this 16-row table. The plan separately requires the real task and hermetic selftest; 16/16 alone is not evidence of those requirements.
- The probe checks exit plus `out.includes(token)`, not a structured result. A tool can print multiple contradictory tokens or a fixture-keyed answer and satisfy this narrow check. Static table matching is not forgery resistance.
- No unreachable arm or table/plan mismatch needs a predicate change. Numeric/whitespace ambiguities were sent to K84ExecGate before this seat ran any implementation data; this seat ran none.

## S243 / S244 independent re-open

S243 locator: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/probe/probe83-c1.mjs` at `d5fc2c94`, line 21. Exact quote `const ARMS = 27;` occurs **once**, four whitespace-delimited words. The frozen round-84 plan quotes it once. The old source contains **28 literal arm registrations**, and lines 244–246 compare `held === ARMS`, print that constant denominator and choose exit from the same equality. This is literal source evidence, not an LSP semantic assertion.

S244 locator: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/close/c1-probe.txt` as committed at the round-84 freeze, line 30. Exact quote `C83_C1: HELD held=27/27` occurs **once**, three whitespace-delimited words; the round-84 plan quotes it once. Line 4 is the contradictory red:

```text
C83_C1 arm band-total-resumes FAIL exit=1 want="READY_HANDOFF: READY wave=w1 seats=6 resumes=6 total=12" out=READY_HANDOFF: DRIFT ATTACK_SHARE (2/12 attack seats below 25%)
```

Observed counts: **28 rows = 27 ok + 1 FAIL**, headline 27/27, historical recorded exit 0. The receipt names measured revision `1c1a855a0bae88d55ef141c96bef52e0fa980c23`. [INFERENCE] Under the new contract the correct first finding is ARMS_TOTAL, not ARM_FAILED, because denominator drift has higher precedence. Rejecting this headline as sole admission proof is supported; flip is reconciliation of rows and summary, not changing historical bytes.

For clarity: S243 appears twice as an identifier in the plan (introduction and knowledge grounding), S244 once; each selected quote appears once. No new source IDs or external documents were introduced.

## Scoped historical grammar audit

All six counts below were derived from committed freeze blobs, not reruns of historical probes.

| Receipt | Row grammar / counts | Scope result |
|---|---|---|
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-81/close/c1-probe.txt` | 16 PASS; headline 16/16 followed by tool= and sha= fields | Unsupported legacy format |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/close/c1-probe.txt` | 22 ok; 22/22 | Fits stated grammar |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/close/c2-probe.txt` | 13 ok; 13/13 | Fits stated grammar |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/close/c1-probe.txt` | 27 ok + 1 FAIL; 27/27 | Fits grammar, deliberately inconsistent |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/close/c1-repair.txt` | 28 ok; 28/28; C83_C1R prefix | Fits grammar, reconciles cleanly |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/close/c2-probe.txt` | 16 ok; 16/16 | Fits grammar, reconciles cleanly |

The r81 PASS spelling is explicitly excluded by `ok|FAIL`; the summary tail also lies outside the written summary form (unless deliberately interpreted as an extension). A strict implementation may report SUMMARY_COUNT before ARM_MALFORMED for that receipt. Do not promise a particular legacy error without defining summary-tail handling. The plan honestly bounds support: it explicitly disclaims universal historical-format support and selects only three r83 receipts for the real task. No PASS compatibility shim is requested.

All selected receipts contain unrelated `rev=` and `exit=` lines; ignoring those is necessary. Detail text can contain nested status-like strings, quoted JSON, punctuation and nonzero child exits inside an **ok** row; these are opaque detail, not additional arms or failures. An ok row means the probe expectation passed, not that its child exited zero. Multi-run concatenations, selftest-only `N/N pass` outputs and JSON outputs are outside the single-summary arm contract; this scoped sample does not establish their frequency or support.

## Evidence, constraints and remaining unknowns

Durable rerunnable counting program:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Scout/source-audit.mjs`

Captured command/output/revision receipt:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Scout/source-audit.txt`

Observed command: `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Scout/source-audit.mjs` — exit **0**, Node **v24.21.0**, freeze revision above. It performs read-only `git show` and literal counts. Earlier direct `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show d5fc2c94:.ufo/waves/round-83/probe/probe83-c1.mjs` also exited **0**. Historical exits are recorded receipt facts, not executions by this seat.

Read governing province core boundary and QUALITY Q1–Q7, Q24–Q26, Q29, Q33 and freeze/receipt clauses. The own-instrument/own-registry scope is in province; counts, exact locators, inference labels and rejection evidence follow those criteria. No production gates, builds, linters, historical probes, new counter implementation or selftest were executed. UNKNOWN: implementation conformance and actual CLI behavior; L1 owns integration and measured close receipts.

No LSP device/server is mounted in this session's tool inventory, so semantic definition/reference tracing was unavailable. Searches and registration counts above are literal evidence only; no exported production contract call graph was claimed. No Node documentation was needed. No installs/updates, network requests, source-tree edits, git/jj mutations, clones or scratch directories were made; scratch cleanup is therefore vacuous. The retained counting program is a durable evidence reproducer, not production implementation. Confidence: high for quote locations/counts, selected receipt grammar and roster equality; static-only for reachability; no implementation assurance.

Report: .ufo/waves/round-84/w1/K84Scout.md
