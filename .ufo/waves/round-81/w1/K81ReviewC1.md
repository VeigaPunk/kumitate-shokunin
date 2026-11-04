# K81ReviewC1 — freeze-review of C1 (`ready-handoff`) against Q73

Reviewed: plan §C1 (`/.ufo/waves/round-81/plan.md`), frozen counter `probe81-c1.mjs`,
tool `scripts/ready-handoff.mjs`, contract doc `corpus/knowledge/ready-handoff-admission.md`,
controls `controls/c1-base.txt` + `controls/c1-stub.txt`, live `w1.ready`/`w1-dispatch.json`.
Q73 (QUALITY.md:1232-1235): every arm reachable under the contract's other clauses, derived
from the contract sentence, arm names = plan names, counts backed by a control receipt.

Tree state reviewed: `scripts/ready-handoff.mjs` sha256
`f8fc11f12f74505e95bdf1674c3626e4b810f6be99453177d5bd729349712995` (471 lines); probe sha256
`c837f011ac95c0d3301c31b5ee2b8d4b49481085825647ee8eb2cb5c14a7a2fb`. Note: the tool changed
under this review — my first read showed 440 lines with no `READY_UNSAFE` block; minutes later
471 lines with it (`ready-handoff.mjs:106-118`). Every finding below was re-checked against
the 471-line file. Live counter run: `C81_C1: HELD held=16/16` exit 0 (probe fnv `sha=df736d63`).
All experiments ran through the tool CLI from my scratch; scratch deleted after the run.

## 1. Arm-name set (Q73 field, check 1)

`grep -oE "arm\('[a-z0-9-]+'" probe81-c1.mjs` → 16 names: clean-fixture-ready,
round-81-live-ready, band-below, band-above, attack-share, connector-cap, planner-refused,
model-key-refused, godspeed-required, task-lane-root, relative-wave-path, ready-keys,
dispatch-escape, dispatch-absent, usage-64, selftest — identical set and order to the plan's
(1)–(16). Q73's literal command pattern (`['name'`) does not match this probe's `arm('…')`
style; the adapted extraction above is the same check.

## 2. Per-arm table (expected | clause | reachable | fixture)

Contract sentence sources: tool header attribution `ready-handoff.mjs:19-22` (run-7 block +
run-15 ruling: band 8–16, ≥25 % attack, ≤2 connectors, no planner, no per-seat model) and
plan §C1 "Why it is a move" prose. Every arm's expectation names a token the tool implements.

| # | arm | expected (probe) | contract clause tested | reachable? | fixture that reaches it (measured) |
|---|---|---|---|---|---|
| 1 | clean-fixture-ready | exit 0; out starts `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10` | happy path: five-key ready + absolute in-wave dispatch + policy-clean | YES | probe `fixture('clean')` → PASS |
| 2 | round-81-live-ready (**discriminating**) | exit 0; /^READY_HANDOFF: READY wave=w1 seats=\d+ attack=\d+\/\d+/ | the round's own committed handoff is policy-legal | YES | live run → PASS (`seats=14 attack=4/14 connector=1`) |
| 3 | band-below | exit 1 + `DRIFT BAND` | band 8:16 (run-15 ruling) | YES | 7 seats → PASS |
| 4 | band-above | exit 1 + `DRIFT BAND` | band 8:16 | YES | 17 seats → PASS |
| 5 | attack-share | exit 1 + `ATTACK_SHARE` | ≥25 % attack seats | YES | 2/10 → PASS |
| 6 | connector-cap | exit 1 + `CONNECTOR_COUNT` | at most 2 connectors | YES | 3 connectors → PASS |
| 7 | planner-refused | exit 1 + `PLANNER_SEAT` | planner is frozen-topology | YES | tasks[0].agent='planner' → PASS (`ATTACK_SHARE` co-fires; expectation is `includes`) |
| 8 | model-key-refused | exit 1 + `ARTIFACT_KEYS` | no per-seat model key | YES | tasks[0].model → PASS |
| 9 | godspeed-required | exit 1 + `GODSPEED` | fresh seats lead with /skill:godspeed | YES | strip lead line → PASS |
| 10 | task-lane-root | exit 1 + `TASK_LANE_ROOT` | seat text names the lane's absolute root | YES | rootless task text → PASS |
| 11 | relative-wave-path | exit 1 + `RELATIVE_WAVE_PATH` | no lane-relative wave path in seat text | YES | append `Also read .ufo/waves/round-81/plan.md` → PASS |
| 12 | ready-keys | exit 1 + `READY_KEYS` | five-key ready contract | YES | `extra=1` → PASS |
| 13 | dispatch-escape | exit 2 + `FAIL-CLOSED DISPATCH_OUTSIDE` | escaping dispatch path, fail-closed | YES | `../../..`-style dispatch → PASS |
| 14 | dispatch-absent | exit 2 + `FAIL-CLOSED DISPATCH_ABSENT` | missing payload, fail-closed | YES | rm dispatch → PASS |
| 15 | usage-64 | exit 64 + `--round N is required` | usage map (0/1/2/64) | YES | `--wave w1` only → PASS |
| 16 | selftest | exit 0 + /SELFTEST: n\/n pass/ | tool's own suite | YES | PASS (`34/34`) |

**Arms that can never hold: none.** All 16 measured PASS at the live tree (probe run above).
Every expectation is derivable from a contract sentence plus a token the tool implements at a
cited line (`:150`-`:201` policy, `:104`-`:142` fail-closed).

## 3. Preservation arms (pass at base)

**None.** `controls/c1-base.txt`: 0/16 — every arm FAILs with node's module-not-found (the
base archive has no `scripts/ready-handoff.mjs`), including usage-64 (exit 1, not 64) and
selftest (empty out). C1 is a pure capability acquisition: no arm passes without the tool.
The stub receipt (`controls/c1-stub.txt`) shows held=3/16 — see finding F1.

## 4. Findings by severity

**F1 — major (record): plan kill-rule contradicted by its own committed control receipt.**
Plan §C1 kill rule: the constant printer "passes arm 1 and fails 3–14 and 16", and "Arm 2 is
the one a do-nothing control cannot reach". `controls/c1-stub.txt` measures the stub passing
**arms 1, 2 and 16** (`held=3/16`): arm 2's predicate (exit 0 + loose prefix regex) matches
any constant READY line regardless of seats/attack, and this stub retains a working `--selftest`
(`31/31`). So (a) arm 2 does **not** discriminate tool-vs-stub — only tool-present vs
tool-absent; (b) the stub does not fail arm 16. C1's stub-kill power lives entirely in arms
3–15. The claim sentence itself (16/16 at M, <16 at base) is unaffected and holds; the
kill-rule sentence is the defect. Erratum candidate for the round lesson.

**F2 — minor (record): plan's selftest count matches no receipt.** Plan §C1 arm (16) says
"selftest (30/30)". Measured: `31/31` in `controls/c1-stub.txt` and in
`ready-handoff-admission.md` verified-at; `34/34` in my live run (34 `judgeCase` cases by
`grep -c`). The frozen parenthetical was never the measured number. (The probe arm accepts any
n/n, so the arm holds; the plan text is what is stale.)

**F3 — minor (record): C1's knowledge entry undercounts its own refusal surface.**
`corpus/README.md:209` (row `knowledge/ready-handoff-admission.md`): "the 12 policy findings,
the six fail-closed refusals". Implemented: **20** distinct policy ids (`add('…')` at
`ready-handoff.mjs:150-201`: READY_KEYS, LANE_MISMATCH, ROUND_MISMATCH, WAVE_MISMATCH,
L1_ABSENT, BAND, CONTEXT_LANE_ROOT, SCRATCH_ROOT, SEAT_SHAPE, ARTIFACT_KEYS, SEAT_NAME,
SEAT_DUPLICATE, ROLE_UNKNOWN, PLANNER_SEAT, GODSPEED, TASK_LANE_ROOT, RELATIVE_WAVE_PATH,
REPORT_TRAILER, ATTACK_SHARE, CONNECTOR_COUNT) and **8** fail-closed tokens (`:104-142`:
READY_ABSENT, READY_MALFORMED, **READY_UNSAFE**, DISPATCH_PATH, DISPATCH_OUTSIDE,
DISPATCH_ABSENT, PATH_UNSAFE, DISPATCH_MALFORMED). The knowledge doc's fail-closed enumeration
omits READY_UNSAFE entirely (`:106-118`, exercised by its own selftest cases
`ready-symlink-escape`/`ready-symlink-inside`), and its `:line` refs (`:104`, `:113`,
`:126/:129`, `:146`, `:176`, `:182`, `:186/:187`) predate the last tool edit and have drifted.

**F4 — minor (over-broad refusal, ARTIFACT_KEYS):** the gate refuses **any** per-seat key
beyond name/agent/task (`:172-173`), while its cited clause is only "no per-seat model". The
omp task schema itself carries optional `solutionSpace`/`tools` fields (this wave's own seat
specs carry `solutionSpace`). Concrete example, measured: `task[0].solutionSpace = "one fix:
rename the helper; names given"` → exit 1 `DRIFT ARTIFACT_KEYS (task[0] carries solutionSpace
(only name/agent/task are dispatch fields))`. A schema-legal dispatch is refused.

**F5 — minor (over-broad refusal, RELATIVE_WAVE_PATH):** any non-`Report:` mention of
`.ufo/waves/round-N/` without the lane prefix trips (`:188-191`), including prohibition prose.
Concrete example, measured: seat line `# Bounds\nNever write .ufo/waves/round-81/open/ by
hand.` → exit 1 `DRIFT RELATIVE_WAVE_PATH` (all 10 seats). The sentence is a rule, not a path
the seat will resolve; the gate cannot tell a misroot seed from a bound.

**F6 — minor (over-broad refusal, path-form mixing):** the dispatch containment check is
lexical against the wave dir computed from the **unresolved** `--lane` (`:128-131`), while
context/seat text are compared against `realpathSync(lane)` (`:158`). Mixed alias/real path
forms therefore refuse — measured: fixture lane reached via a symlinked parent
(`alias resolves into lane=true`, verified with realpathSync) → exit 2 `FAIL-CLOSED
DISPATCH_OUTSIDE` even though the dispatch realpath is inside the lane realpath. A structurally
perfect handoff judged through an alias `--lane` is fail-closed, not adjudicated.

**F7 — observation (over-broad refusal, REPORT_TRAILER phrasing gate):** the context must
contain the literal substrings `relative to` or `write it at` (`:196`). Measured: context
"All `Report:` trailer paths resolve against <lane>." (names lane root + scratch rule +
resolution rule) → exit 1 `DRIFT REPORT_TRAILER`. Legal-by-intent contexts in other wording
are refused.

**F8 — observation (discriminating-power limit, arm 2):** measured degenerate dispatches the
gate admits READY exit 0: (a) every seat task names the lane root **only inside a dead HTML
comment** (`<!-- lane root noted: … -->`) with a relative `# Target` → READY (TASK_LANE_ROOT is
a raw `includes()`, `:187`); (b) one task text ×10 with unique names, all attack roles →
`READY seats=10 attack=10/10 connector=0`. Arm 2's predicate pins nothing but the prefix, so
either shape substituted into the live handoff still passes it: the arm proves the live
handoff is contract-**legal**, not that it describes this round's real wave. The literal
one-task-repeated degenerate *is* caught — measured: same name ×10 → exit 1
`DRIFT SEAT_DUPLICATE ×9` (the plan's "duplicate seat" prose is implemented at `:176` but has
**no frozen arm**; coverage gap, not an unreachable arm). Also no connector floor: connector=0
→ READY (measured), consistent with the cited "at most 2" clause but not with the round shape's
"one connector".

**F9 — residual risk (invoker-trusted policy):** `--band`/`--attack-pct` loosen the frozen
rules; measured: `--band 1:100 --attack-pct 0` on a 1-seat, 0-attack fixture → exit 0
`READY seats=1 attack=0/1`. The frozen arms always use defaults, so C1 holds; the guarantee is
only as strong as the invocation.

## 5. Verification gaps

- I did not re-run `c1-base`/`c1-stub` from an archive; I cite the committed receipts
  (`controls/c1-base.txt` 0/16, `controls/c1-stub.txt` 3/16) per Q73's receipt rule. My live
  re-run of the counter (16/16) and selftest (34/34) is my own capture.
- The tool changed mid-review (440→471 lines); findings F1–F2 quote receipts measured against
  the pre-edit tool. The live 16/16 run is the post-edit tool. If the tool changes again,
  re-pin before closure.
- Not exercised: `--ready`, `--json`, and the `SEAT_NAME` 1-char edge; all outside the C1 arm
  set and outside Q73's field.
