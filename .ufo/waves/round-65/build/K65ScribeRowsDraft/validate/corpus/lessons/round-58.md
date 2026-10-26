# Round 58 — kumitate (hyaku run 5, attempt 1 stopped by the operator mid-round, resumed and landed 2026-10-24 by a fresh Kimi L1; the campaign continues one-round-at-a-time toward round 100)

Base `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37` (the round-57 verifier-spotcheck tip; lane clean, ahead=0).
Plan `.ufo/waves/round-58/plan.md` (frozen; counters + base receipts + scratch-HELD
witness committed at `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`). Claims: C1
operability capability `receipt-evidence` + `readme-map` v2 (routed-defect repairs
R57-V1/V2/V3/V4), C2 sourced frontier entry `failure-recovery-replay.md` (D58).

## Gate

Candidates considered: 4 source rows opened this round (S112 Temporal
workflow-execution replay — REOPENED from its round-55 rejection; S122 Kafka
KafkaConsumer offset commits; S123 LangGraph checkpointers; S124 Flink
checkpointing) plus the two repaired instruments (receipt-evidence, readme-map
v2 — instruments, not knowledge admissions).

| Row | URL | Accessed | Located quote | Decision |
|---|---|---|---|---|
| S112 | https://docs.temporal.io/workflow-execution | 2026-10-24 (re-open; r55 capture byte-identical, sha256 79866f9f…) | "A Replay is the method by which a Workflow Execution resumes making progress." (§Replays) | ADMITTED (reopened) — its round-55 recorded flip fired: this entry IS the lane-owned, tested mapping of replay-vs-redelivery onto the dispatcher's reconcile/reclaim path; status rejected → mined, used-by — → corpus/knowledge/failure-recovery-replay.md |
| S122 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html | 2026-10-24 | "The committed position is the last offset that has been stored securely." (§Offsets and Consumer Position) | ADMITTED tier A — authoritative javadoc for the offset-commit recovery cursor |
| S123 | https://docs.langchain.com/oss/python/langgraph/checkpointers | 2026-10-24 | "The state of a thread at a particular point in time is called a checkpoint." (§Checkpoints) | ADMITTED tier A — primary docs for checkpoint/resume semantics; same URL as queued S028 (duplicate group pinned in `.ufo/pins/source-dupes.json`; S028 stays queued — its durability-modes scope was not this round's reading) |
| S124 | https://nightlies.apache.org/flink/flink-docs-master/docs/dev/datastream/fault-tolerance/checkpointing/ | 2026-10-24 | "In order to make state fault tolerant, Flink needs to checkpoint the state." (lead) | ADMITTED tier A, kept `queued` — engine-internal checkpoint knobs (interval/timeout/storage) for an embedded streaming engine; outside this entry's orchestration-side mapping, held for the frontier band |

Status/recheck/used-by changes this round: **S112 rejected → mined** (used-by —
→ corpus/knowledge/failure-recovery-replay.md; flip condition recorded at
rejection fired). S028 unchanged (stays queued; noted inside the S123 row as
the pinned duplicate). No other prior row touched.

Spot-check result: `<pending>` — the independent non-author source-decision
review runs at closure (per Q45 this line is closed next round by an
append-only named correction; under the operator's wrap-up steer there is no
next lane round — closure-owned).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| dead sweep pathspec (R57-V1) | `corpus/lessons/round-57.md` R57-V1: A57 B8's `git grep … -- '.ufo/waves/round-4[89]'` never descends (pathspec wildcards match whole paths, not prefixes); the failed scan silently counted as fresh — a scratch clone replaying a round-52 nonce still read `held=10/10 … B8 PASS` | none (the frozen counter's own arm was dead) | `receipt-evidence.mjs` sweeps `:(glob).ufo/waves/round-4[89]/**` + `:(glob).ufo/waves/round-5[0-7]/**`, fails closed on grep ≥ 2 (`SWEEP_GREP`), and proves coverage: zero resolved files (`SWEEP_NO_FILES`) or zero swept nonces (`SWEEP_NO_NONCES`) is FAIL-CLOSED, never HELD; `--expect-sweep-nonce` functionally proves descent (A58 B5 runs it against the three committed round-57 receipt nonces). Shown able to fail: selftest cases `sweep-no-files`, `unparseable-rev`, `sentinel-miss`; probe B5 both fail-closed arms |
| drop-one vacuous HELD (R57-V2) | `corpus/lessons/round-57.md` R57-V2: deleting one `hold()` call yields `held=9/9` → `ATTEST57_HELD` exit 0; only `checks.length === 0` was guarded | none until this round — no arm pinned the frozen count | both new counters' verdict tails pin the frozen count (`checks.length !== 10` / `!== 5` → `…_UNMET … checks-mismatch` exit 1). Shown able to fail: `controls/MutCounter58.txt` / `controls/MutDoctrine58.txt` drop-one transcripts read `held=9/9` / `held=4/4` + `checks-mismatch` against a tree where every remaining arm passes |
| name-only registry members (R57-V3) | `corpus/lessons/round-57.md` R57-V3: a `covered` entry naming a directory or symlink scored CLEAN — members compared by name, never lstat'd | none (gate limitation, flagged by seat SentinelRegistryPaths) | `kumitate-readme-map-v2`: every `covered` member must lstat S_ISREG; a directory/other non-file is DRIFT `covered-not-file`, a dangling symlink DRIFT `stale-covered`; registry version 2 (the number now attests the lstat semantics). Shown able to fail: selftest cases 15/16, each red-before on v1 logic |
| forged receipts as evidence (R57-V4) | `corpus/lessons/round-57.md` R57-V4: receipts fabricated at commit time (a set replaying a round-52 nonce) passed `verify --ledger` AND scored B8 PASS | none — nothing re-ran what receipts claimed | `receipt-evidence` reproduction: every receipt's recorded argv re-runs inside the `git archive` extraction of the judged rev and must match recorded exit and stdout/stderr digests. Shown able to fail: probe B4's fabricated-receipt control (self-consistent body+sidecar, zeroed stdout digest, reused round-52 nonce) reads `RECEIPT_EVIDENCE: UNMET`; selftest cases `reproduce-miss`, `exit-miss`, `doctored-prelude` |
| coverage-map drift, fourth recurrence | this round's OPEN state: the r57 closure integrator's `corpus/lessons/round-57-verifier-spotcheck.md` landed post-close with no README row and no `covered` pin — `node scripts/readme-map.mjs` at base read `README_MAP: DRIFT files=136 rows=135 covered=135`; `proxy-check --strict` read `C2_TOTAL_DRIFT 135/136` + `AXES_DRIFT coverage 10/9` | readme-map (v1) — caught the class at round open as designed | the row + pin land in this round's change (Q48: same change as the new files); the drift never reaches the report phase |
| B5 control fixture self-sabotage | in witness construction, the no-coverage control deleted the round-48..57 corpora wholesale — which deleted the frozen probes the third receipt re-runs, so reproduction failed for the wrong reason; a substring `"nonce":` strip then matched the probes' own regex-source bytes | none — new control shape this round | the control now strips exactly the bytes the sweep collects (`/"nonce":\s*"[0-9a-f]{32}"/`), sparing the probes' escaped pattern source; the rounds' directories stay, so counter-pins reproduces and the arm fires on `SWEEP_NO_NONCES` |

## Routed-defect answers (round-57 → round-58, all four landed)

- **R57-V1** — repaired: descending `:(glob)` pathspecs + fail-closed grep +
  two-sided coverage proof + functional descent proof (A58 B5). Never `?` or a
  bare `round-5*` (both swallow round-57/58 themselves).
- **R57-V2** — repaired: checks-count pins in both counters + committed
  drop-one transcripts.
- **R57-V3** — repaired: readme-map v2 lstat arms + registry version 2.
- **R57-V4** — repaired: reproduction-in-extraction; receipts are evidence only
  because they re-run.
- **Filed-bytes rule** (r57 spotcheck conformance item 2) — honored: nothing
  filed under `.ufo/reports/round-57/` was touched this round; the report for
  this round is a new file.

## Census before → after

- before: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0, 4 pinned W04 warnings (`base/census-before.txt`).
- after: exit 0 required — recorded in the close battery (5 pinned W04 warnings now: the pinned S028+S123 group adds one; transcript `close/census-after.txt`).

## Operator steer and resumption (supersedes the stopped attempt's wrap-up note)

The stopped attempt recorded "after this round lets wrap up; commit and push.
stop pushing rounds" and planned to report its wave prepared-but-undispatched.
The operator's resumption directive (2026-10-24, this session) supersedes that
note verbatim: training continues one lane at a time toward the campaign
target, and the r58 64-seat v2 wave is dispatched in-round as the
shokunin-required training wave — one batched swarm call after the existing
validator approves the spec. The wave evidence lands under
`.ufo/waves/round-58/w1/`; the round never started r59.

## Assimilation (lane-addendum item 10, 2026-10-24; resumed frozen round)

Item 10's frozen-rounds clause governs here: this round's claims were frozen
at `50548ae5`, so shokuknow/considerthese material could serve only as
ordinary §2b curation of an already-frozen claim — never a new or widened
target. Evaluation was per-entry through the PROVINCE and QUALITY gates;
nothing was bulk-imported; no campaign or considerthese file was edited.

Id-collision guard (run in scratch before any append decision; scratch
committed as wave evidence at `.ufo/waves/round-58/assimilation/`):
`reg-ids`=123 registry ids, `staged-ids`=119 package ids (S125…),
`collisions`=0 — no renumber needed. Quarantine slice (absent-defect
register, read-only): 9 rows — S109/S116/S118/S129/S142 `payload-absent`,
S143/S144/S145/S178 prose-class ("could not be fetched" — the register's
unchecked family, unverifiable rather than fabricated). With adoption closed
this round every slice row stays quarantined; none was hand-checked into an
adoption.

| Candidate (merge/kumitate) | Gate decision | Reason | Flip condition |
|---|---|---|---|
| `mcp-orchestration-contract.md` (S125/S127/S136; census "first campaign candidate") | REJECT this round | In-province (PROVINCE frontier item 2, MCP protocol revisions) but serves neither frozen claim: C1 is the receipt-evidence capability, C2's entry closed at freeze on S112/S122/S123 — adopting a new entry + three new rows is a new target, which item 10 forbids in a resumed frozen round | A fresh round-59+ assimilation claim takes frontier item 2 through the full item-10 pipeline (re-grounded Gate quotes with the lane's own access dates, transformed rows, scratch-mirror census validation, dupe-group pinning for any same-URL row) |
| `durable-execution-and-fanout-primitives-2026-10-24.md` (S190/S194) | REJECT this round | Same band as C2 (PROVINCE frontier band 4) and genuinely additive (sagas/Tail-at-Scale are un-held ground) — but new corpus content = a new target; the frozen C2 entry's citation set is closed | Same flip: an r59+ assimilation claim adopts it with re-opened sources; the collision guard re-runs then (the registry moves every round) |
| `durable-execution-failure-detection.md` (S126/S131/S133–S135) | REJECT this round | Overlaps surfaces the lane already holds (S117 Temporal failures family; S126 flagged as same-page duplicate of S117 in the merge report — adopting would trip the `source-dupes` gate's `new-duplicate` arm without pinning) plus frozen-claim mismatch as above | Same flip, plus the S028/S123-class duplicate-group pinning done first |

Net: **0 admits, 3 rejects** (reason + flip recorded per row). Honest
rejection evidence rather than forced adoption; r59 can take a fresh
assimilation claim.

## considerthese (operator-authored input; mined, never edited)

Latest reflection `considerthese/2026-10-24.md`. One still-unimplemented
proposal taken (its "proposals only … not acted on" item 4 — independent
source re-fetch), grounded through the lane's own bar as QUALITY Q49. The
reflection's pointer was opened: the demonstration re-fetched S122
(https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html,
2026-10-24) outside the fleet's own verifier — fresh bytes sha256
`ed0068fabe16e861…` byte-identical to the pinned capture
`.ufo/waves/round-58/build/ScoutKafkaOffsets/body.html` (268296 bytes both),
and the located quote "The committed position is the last offset that has
been stored securely." re-found in the fresh bytes' normalized text. The
other five proposals (recount-quoted-numbers, retire-false-positives,
track-cost-side, post-report-commit-check, timing) are bot-side reflection
behaviors, not lane surfaces — not taken this round.
