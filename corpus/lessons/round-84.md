# Round 84 — reconcile transcripts, reject the weak counter

2026-11-04. One claim C1, operability (lowest live axis, integer terminal at 9),
capability acquisition counter-receipt. Base a648a6f8f3028fc4f72d27470b4673fe8e3e5866;
pre-freeze map repair dd91b8ec28e40c41147d8cf37832e340da0f469e; frozen claim,
counter and controls 3794b903324e7eb4aec6d92539f2ca4e2c0b6727. LOG round 84.

## Disposition

**C1 UNMET — frozen kill rule fired; rejected-honest-stop.** The plan kills
admission when a do-nothing control reaches 16. K84Critic's label-keyed no-reader
reached `C84_C1: HELD held=16/16`, exit 0, without opening a receipt
(`.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt`). Its ordinary renamed
red returned exit 0 instead of HELD_COUNT exit 1 (`renamed-red.txt` in that dir).
A real implementation, a green selftest and a useful historical task do not
cancel this frozen kill rule. No predicate/counter/target is changed after data.

## Gate

Opened 2026-11-04. These are two uses of own-work evidence, not independent
external authorities. Registry rows are S243 mined and S244 rejected.

| source | decision | location / quote / access | reason and use |
|---|---|---|---|
| S243 | admit, mined | repo path `.ufo/waves/round-83/probe/probe83-c1.mjs:21` at d5fc2c9407a75e939b332560f54548f2dd52629e; `const ARMS = 27;` (4 words); opened 2026-11-04 | Source registers 28 arms but judges held against 27. Grounds knowledge/counter-transcript-reconciliation.md and this lesson; captured bytes bound in source-captures.json. |
| S244 | reject as sole admission proof | repo path `.ufo/waves/round-83/close/c1-probe.txt:30` at d5fc2c9407a75e939b332560f54548f2dd52629e; `C83_C1: HELD held=27/27` (3 words); opened 2026-11-04 | Line 4 is FAIL; 28 rows contradict denominator 27. Reject headline-only reliance, not the artifact's existence or r83 repair. Flip: independently reconcile rows and headline before admission. Used by this lesson. |

No preexisting status/recheck/used-by cell changed. New rows only. Search:
question “can a HELD headline hide a red arm?”; two pinned local artifacts
identified/screened/opened, one admitted, one rejected; stop at the observed
counterexample rather than import external testing doctrine. S243/S244 captures
are existing committed bytes, not newly fabricated transcriptions.
Non-author admit/reject spot-check remains the external closure's duty; the
wave's reviewers are lane-author advice, never SHONEN [x].

## Work and measurements

New read-only `scripts/counter-receipt.mjs`, contract kumitate-counter-receipt-v1,
reconciles supported arm-form transcripts. Precedence and frozen 16 cases stay
in `.ufo/waves/round-84/plan.md`; controls base 0/16 and constant-CLEAN 2/16
are in its controls directory, both exit 1. The table-derived producer denominator
prevents r83's arithmetic omission, not semantic false positives.

K84ExecGate's final candidate digest is
190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0.
Its author-exercised selftest and probe receipts are `build/K84ExecGate/selftest.txt`
and `probe.txt` under the round wave directory; final integrated L1 readings
are revision-stamped in `close/`. Earlier reviewer/sentinel evidence is bound
to the superseded candidate, not passed off as a review of final bytes.
K84Sentinel found metadata `command=X arm red FAIL` falsely rejected as
ARM_MALFORMED; candidate owner fixed it and added metadata regression cases.
K84Mutation killed a single-guard ARMS_TOTAL removal on earlier bytes:
16/16 → 14/16 → restored 16/16 (`build/K84Mutation/arms-total-removed-result.json`).
This local mutation kill does not defeat the no-reader survivor.

Real domain task: judge the unchanged r83 close/c1-probe.txt, c1-repair.txt and
c2-probe.txt. They carry rev/exit metadata, so the task also exercises wrapper
compatibility (K84Connector's proposed cross-pattern). Expected diagnoses and
observed integrated exits are retained separately in close/history-{red,repair,c2}.txt;
no historical bytes are rewritten.

## Counters

| counter | open | close | source |
|---|---|---|---|
| frozen tool discrimination | base 0/16 exit 1 | integrated reading in close/c1-probe.txt; admission UNMET because no-reader held 16/16 | controls/base.txt; build/K84Critic/no-work-probe-node.txt, relative to round wave directory |
| constant-CLEAN control | 2/16 exit 1 | unchanged frozen control | controls/stub.txt |
| no-reader shortcut | not measured before freeze (Q29 miss) | 16/16 exit 0; kill fired | build/K84Critic/no-work-probe-node.txt |
| historical r83 C1 rows / denominator | 28/27, one FAIL | old bytes unchanged; new gate diagnosis close/history-red.txt | round-83/close/c1-probe.txt and build/K84ExecHistory/census.txt |
| SOURCES registry | 180 rows | 182 rows, two A own-work additions | close/source-counts.txt; open/sources-census.txt and close/sources-census.txt |

Paths in abbreviated close/controls/build cells are relative to
`.ufo/waves/round-84/`; r83 is `.ufo/waves/round-83/`.
The newly measured no-reader rise is harmful to the predicate's admission
strength; it is disclosed, not scored as an axis gain.

## Mistakes

| class | evidence | captured-by | fix and shown-able-to-fail boundary |
|---|---|---|---|
| number-drift | r83 frozen ARMS=27, 28 rows and hidden FAIL; r83 verifier D5 | Q73 did not check runtime denominator | Q77 + new receipt checker; historical red must fail ARMS_TOTAL and repair must clean, observed in close/history-red.txt and history-repair.txt; old counter remains frozen |
| vacuous | r84 label-keyed no-reader 16/16 | Q29 required absent/constant/junk/no-reader/label-keyed controls before data; only first two were measured | No repair credit: keep C1 UNMET. Successor must freeze same-path content variation, non-outcome-bearing labels and exact unique verdict assertions before data |
| attribution | r83 suite/receipt revision promise overstated | Q75 | Narrow to receipts the new close battery actually writes; no retroactive restamping |
| reference-drift | r83 lesson stale Mistakes placeholder and duplicate heading (D4) | corpus lesson structure rule | This single real Mistakes section supersedes the placeholder; historical filed bytes unchanged |
| scope | r84 advisory handoff gate SCRATCH_ROOT | ready-handoff lexical context rule | Payload named exact scratch roots as “Scratch exact root”, not regex “scratch root”/HYAKU_SCRATCH. Preserve taken payload, disclose red, do not respawn; no scratch-placement failure observed |

## Routed R83-D1–D6 answers

D1: S244 supplies an actual in-round reject with reason/flip. D2: SCORECARD
round-84 appended correction A 894→896 and bogus c1463c58→d6e6ba8a digest;
stanza and receipts were already right. D3: only new close measurements name
the measured work revision; old scaffold/base exceptions are historical. D4:
this lesson supersedes the stale placeholder with one real section, not a
rewrite. D5: table-derived runtime denominator and receipt reconciliation land,
but the stronger r84 no-reader control falsifies admission; Q29 was missed.
D6: previous spotcheck adoption landed **before freeze** in dd91b8ec;
open/adopt.txt records README_MAP CLEAN files=211 rows=211 covered=211.

## Assimilation and province

Assimilation: none; no staged source row appended. Latest
considerthese/2026-10-26.md opened 2026-11-04: ideas 1/2/3/4/6 already Q75,
Q76/Q71, Q68, Q69, Q72. Idea 5 requests non-author formatting; not implemented
by rewriting someone else's spotcheck. No duplicate proposal-mining credit.
Own-instrument reconciliation remains province core. Testing-method governance
(tameshi), evaluation math (kengaku), report-pointer craft (kotoba) are adjacent,
reported not absorbed (`w1/K84Connector.md`). No sibling tool executed.

## Limits

Transcript arithmetic is not semantic correctness, independent roster coverage,
execution attestation or authentication of rev/exit fields. Consistent forged
receipts still pass. Only column-zero arm-form grammar is supported; r81 PASS
and suffixed summaries, selftest-only or JSON formats are not. Ordinary reads
can block on FIFO or exhaust memory on huge input: use trusted committed regular
receipts; no hostile-filesystem safety claim. No claim about all counter formats
or no harm anywhere. Final gates report only their enumerated surfaces.

## Integrated readings at the work commit

Measured revision `ab8f60138810981bdb1a294fe684b19b332b8a34`; each following
new close receipt carries that rev, actual command and exit:

- `close/c1-probe.txt`: HELD 16/16 exit 0; **C1 still UNMET** because the
  separate frozen no-reader kill is observed, not waived.
- `close/selftest.txt`: COUNTER_RECEIPT_SELFTEST PASS held=50/50 exit 0.
  `close/independent.txt`: K84FX HELD held=21/21 exit 0 on final integrated bytes.
- `close/history-red.txt`: DRIFT ARMS_TOTAL exit 1 on the unchanged r83
  original; `close/history-repair.txt` and `close/history-c2.txt`: CLEAN exit 0.
- `close/proxy-check.txt`: MATCH, A=908 C=44 C2=213/213, scalar readings
  9/10/10/10/10/10. `close/proxy-selftest.txt`: 163/163 pass, exit 0.
- `close/source-counts.txt`: 180→182 rows, A 153→155, B=17 C=10 held;
  mined 145→146, rejected 22→23, queued 13 held. `close/sources-census.txt`
  exit 0, same six W04 cross-scope duplicate warnings as open.
- Map CLEAN files=213 rows=213 covered=213; source captures CLEAN 72,
  counter pins CLEAN 45 (`close/readme-map.txt`, `source-capture.txt`,
  `counter-pins.txt`). Prior-map adoption's before-freeze arm passes at
  `close/plan-before-ready.txt`, archived freeze map CLEAN 211/211.

### Enumerated regression boundaries, not a universal no-harm claim

`close/checklists.txt` is **41/44 pass, exit 1**, versus r83's historical
43/43 receipt. The three current red arms are live OMP census (69 entries,
3 unlisted operator-host members), cap-run suite (11/12), and live compare
(69 versus receipt 65, added 4). Do not hide these by accepting red as clean.
The frozen offline OMP score remains 10; this is a live-host drift reading,
not a new lane score. No operator member is altered or reclassified here.

`close/harm-matrix.txt`: CLEAN over 36 registered gates, held=29 repaired=2
carried=4 moved=1 harm=0 harm_absent=0 new_red=0, unmeasured=1, exit 0.
Both base and tip read the same current host: live OMP red is carried;
cap-run 11/12 and bind-oracle CONTROL_VISIBLE are carried; harm-matrix
selftest times out at both ends (unmeasured=1). The citation gate stays red
and **rises errors 2546→2555, warnings 999→1003** with this round's added
knowledge/lesson; this is CARRIED_MOVED, not improvement. No universal
“no harm anywhere” claim is made from the matrix's word CLEAN.

### Wave provenance and cleanup

Main supplied WAVE-DONE for all ten seats, then exact captured IDs (each ID
equals its seat name) and retained-handle statuses `unavailable: handle expired`.
`close/seat-census.json` records that actual models/deaths are unobserved;
WAVE-DONE certifies no tracked job still live, not substantive success.
All ten nonempty reports are present; no replacement or residual dispatch.
The fleet misroot sweep `close/misroot-sweep.txt` named sibling/runtime state
and an ambiguous `after` file whose content does not identify kumitate r84;
none is an identified own-seat misroot, none was deleted. Tool installs: none.
The round scratch tree is removed after landing; durable evidence is in the lane.
