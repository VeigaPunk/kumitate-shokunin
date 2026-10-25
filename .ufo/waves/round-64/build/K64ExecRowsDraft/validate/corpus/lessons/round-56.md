# Round 56 — kumitate (hyaku run 5, attempt 1)

Base `3eae059e929e4da317c45eba18b4099b90f7541b` (the round-55 verifier-spotcheck tip; lane clean, ahead=0).
Plan `.ufo/waves/round-56/plan.md`. Claims: C1 `source-dupes` capability acquisition
(ATTEST56), C2 sourced frontier entry `visibility-lease-ack-deadlines.md` (DOCTRINE56).

## Gate

Candidates considered: 4 source rows opened this round (S113 Pub/Sub subscribers,
S114 AWS SQS visibility timeout, S115 NATS JetStream ack responses, S116 Temporal
Visibility) plus the `source-dupes` gate itself (instrument, not a knowledge admission).

| Row | URL | Accessed | Located quote | Decision |
|---|---|---|---|---|
| S113 | https://cloud.google.com/pubsub/docs/subscriber | 2026-10-24 | "The subscriber can dynamically modify the acknowledgment deadline, allowing message processing to take an arbitrarily long time." (§Pull subscription) | ADMITTED tier A — primary broker docs for Pub/Sub lease management |
| S114 | https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html | 2026-10-24 | "When you receive a message from an Amazon SQS queue, it remains in the queue but becomes temporarily invisible to other consumers." (page lead) | ADMITTED tier A — authoritative guide for SQS visibility-timeout semantics |
| S115 | https://docs.nats.io/nats-concepts/jetstream/consumers/ack-responses | 2026-10-24 | "if a message isn't acknowledged in time, the server redelivers it, which is what gives you at-least-once delivery." (§Delivery and acknowledgment) | ADMITTED tier A — JetStream's own docs for ack-wait redelivery |
| S116 | https://docs.temporal.io/visibility | 2026-10-24 | "Visibility … refers to the subsystems and APIs that enable an operator to view, filter, and search for Workflow Executions" (overview lead) | REJECTED — operator search/list surface, not a delivery lease; name collides with "visibility timeout" but the mechanism is unrelated; flip: a lane-owned mapping of operator search surfaces to orchestration observability |

Status/recheck/used-by changes: none on prior rows. S113–S115 written `mined`
(used-by `corpus/knowledge/visibility-lease-ack-deadlines.md`), S116 `rejected`.

Spot-check result: `<pending>` — the independent non-author source-decision review
runs at closure (per Q45 this line is closed next round by an append-only correction).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| number-drift | R55-V2 (`corpus/lessons/round-55-verifier-spotcheck.md` §1/§5): report/LOG/lesson claimed SOURCES tier histogram `B=9→10`; re-derived over committed bytes it is `B=9→11` (S111 admitted-B + S112 rejected-B) | `none` — no re-derivation step stood between the claim and the filed text | R56-1: append-only corrections issued this round — LOG.md round-56 entry records `B 9→11`; this lesson's Gate carries the corrected figure; the next tier claim must be re-derived by the frozen `awk` census at write time (recorded as QUALITY Q47-adjacent practice: a number filed is a number re-measured) |
| attribution | R55-V1 (same artifact §1): report `Landed changes` listed R1/R1b/R2/R3 but omitted the two trailing bookkeeping commits `e7a07111`/`26c886d7` (SCORECARD measured-slot fills) | `none` — no completeness check stood between the commit list and the report | R56-2: this round's report lists every lane commit authored under round 56 including bookkeeping; the LOG entry names all of them; going forward the close checklist includes "report's commit list = `git log` output for the round" |

## Round-55 carryover (routed)

- R55-V1 repaired-by-process above (R56-2); the filed bytes stand (append-only).
- R55-V2 repaired-by-process above (R56-1); the filed `B=9→10` lines stand,
  superseded by this note.
- Carried, not this round's: R41-2 gate-pins ruling, R43-1/R43-5, A3e
  captured-invocation, R53-2 seat-accounting convention.
