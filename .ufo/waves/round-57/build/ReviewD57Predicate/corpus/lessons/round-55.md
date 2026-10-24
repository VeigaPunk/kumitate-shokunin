# Round 55 — lesson

Lane: kumitate. Round 55 (hyaku run 5, watchdog attempt 1). Base
`c562d28557067bf35d78171c5737feee3c8679fd`. Plan
`.ufo/waves/round-55/plan.md`; frozen counters A55 and D55, base receipts and
scratch-HELD witness under `.ufo/waves/round-55/` (Q43 / M5 discipline).

Two claims. **C1 — operability, capability acquisition:** `source-capture`,
contract `kumitate-source-capture-v1`, the opened-source byte-persistence gate
(routed defect R54-C1). Predicate `ATTEST55_HELD`, rule A55 v1, 10 checks.
**C2 — frontier coverage, sourced:** `corpus/knowledge/bounded-redelivery-budgets.md`,
the durable-execution frontier's *bound* side — broker delivery-limit/dead-letter
routing (S110), consumer commit-position ordering (S109) and client-side retry
budgets + jitter (S111). Predicate `DOCTRINE55_HELD`, rule D55 v1, five checks.

## Mistakes

- **M1 — R55-1 (repairs routed defect R54-C1): a rejection was adjudicated
  against source bytes that were never committed.** Class: `landing` /
  `verifiability`. Evidence: S108's reject rested on a static-reader open of the
  Microservices.io idempotent-consumer page; the bytes were not in the lane
  repo, so the non-author verifier could not re-open the reject
  (`corpus/lessons/round-54-verifier-spotcheck.md` §5 item 1). The red-before:
  at base `c562d28`, `git cat-file -e` of any S108 capture path exits non-zero
  — no committed bytes existed anywhere in the lane tree. The fixed state: the
  dated capture `.ufo/waves/round-55/build/ScoutMicroservices/idempotent-consumer.html`
  (sha256 `3edddaa1959c70dbd9953648e54759b5a2bc167cd121805124e5faafa0eca40f`,
  19,749 bytes, HTTP 200, fetched 2026-10-24T11:08Z) is committed and pinned in
  `.ufo/pins/source-captures.json`; `node scripts/source-capture.mjs` reads
  `SOURCE_CAPTURE: CLEAN captures=5 exemptions=107` and any seat can re-open
  the adjudicated bytes. Captured-by: `corpus/lessons/round-54-verifier-spotcheck.md`
  §5 item 1 (routed defect R54-C1). Fix: the capture-commit rule — a SOURCES
  row is a claim; a URL alone is not a resolvable location at closure — plus
  QUALITY Q46 codifying it, and the new `source-capture` gate so the rule is
  enforceable, not a promise. The S108 reject itself was re-adjudicated this
  round on the committed bytes and stands (see `## Gate`).

## Gate

Candidates considered: S109 (Apache Kafka 4.3 design), S110 (RabbitMQ Dead
Letter Exchanges), S111 (AWS Builders' Library: Timeouts, retries, and backoff
with jitter), S112 (Temporal Workflow Execution). Rows before: 108; after: 112
(tier A 91→93, B 9→10, C 8 unchanged).

- **S109 — ADMITTED, tier A.** URL `https://kafka.apache.org/43/design/design/`;
  opened 2026-10-24T11:09Z; HTTP 200; 146,232 bytes; body sha256
  `bcca1c2a60856d1be95d7774beb60e7ff5531ede367529becb787e5772531ef4`. Quote
  (8 words), §Message delivery semantics, saved HTML: “At least once — Messages
  are never lost but may be redelivered.” §4.3 additionally grounds: the Kafka
  producer is *idempotent* (per-partition sequence numbers dedupe resends,
  since 0.11.0.0); the consumer controls its position in the log and can rewind
  — commit-before-work gives at-most-once, work-before-commit gives
  at-least-once. Used by `corpus/knowledge/bounded-redelivery-budgets.md`.
- **S110 — ADMITTED, tier A.** URL `https://www.rabbitmq.com/docs/dlx`;
  opened 2026-10-24T11:09Z; HTTP 200; 67,804 bytes; body sha256
  `c69bab87519d9e8c8d462d346e69093a0e2c00f3412a5e3df1a125bf5e169080`. Quote
  (15 words), §How Dead Lettering Works: “The message is returned more times to
  a quorum queue than the delivery-limit.” Four trigger events bind the bound:
  negative-ack with requeue=false, per-message TTL expiry, queue-length overrun,
  and quorum-queue delivery-limit exceedance — the broker-side bounded-redelivery
  mechanism the lane's `MAX_PAUSED_RESUME_ATTEMPTS`/`MAX_LAUNCH_MISSES` mirror.
  Tier A applies only to RabbitMQ behavior. Used by the same entry.
- **S111 — ADMITTED, tier B.** URL
  `https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/`;
  opened 2026-10-24T11:09Z; HTTP 200; published 2019-12-05; 129,565 bytes; body
  sha256 `060ae1a41a8f4bd7d716148ecab4ccaee04ef583a7031753af11ac396e74daf5`.
  Quote (15 words), §Limit retries with a token bucket: “We have found that we
  can mitigate this risk by limiting retries locally using a token bucket.”
  Tier B scoped client-side: the AWS article grounds bounded client retry and
  jitter, not broker redelivery. Used by the same entry.
- **S112 — REJECTED, tier B.** URL `https://docs.temporal.io/workflow-execution`;
  opened 2026-10-24T11:12Z; HTTP 200; 71,398 bytes; body sha256
  `79866f9f8e3a53a1b6a5059d7d1d04e2d7d7fb9b9d86a969c6e5de645851d66b`. Quote
  (§Replays): “A Replay is the method by which a Workflow Execution resumes
  making progress. During a Replay the Commands that are generated are checked
  against an existing Event History.” The Event-History/Replay model is a
  different durability mechanism than this entry's delivery-guarantee +
  broker-budget scope — the dispatcher's durable surface is its content-keyed
  queue + receipt ledger, not command replay. Flip: a lane-owned, tested
  mapping of replay-vs-redelivery onto the dispatcher's claim path. Row
  retained as rejected; `used-by` stays `—`.
- **S108 — standing reject, re-adjudicated on committed bytes.** With the
  capture now pinned, the reject was re-read: the SQL `PROCESSED_MESSAGE`
  table/transaction recipe still does not map to the lane's file-backed queue
  and nonce-ledger surfaces; the row stays `rejected`.
- **Tier and scope withheld:** S109 proves Kafka's publish/consume guarantees
  and idempotent producer, not exactly-once for the lane. S110 proves RabbitMQ
  DLX behavior. S111 is client-side policy, not broker delivery. The
  design-inference clause is labelled `[INFERENCE]` in the entry.
- **Prior art:** `queue-and-claim.md` supplies the lane's immutable
  content-derived task key; `at-least-once-dedupe.md` (S106/S107) grounds the
  transport-level duplicate/requeue case this entry bounds;
  `invocation-attestation.md` (S100/S101) supplies invocation-nonce semantics;
  `fail-closed-clock-validation.md` (S102/S103) clocks;
  `receipt-identity-canonicalization.md` (S104/S105) receipt identity. This
  entry connects the dispatcher's own redelivery budgets
  (`MAX_PAUSED_RESUME_ATTEMPTS`, `MAX_LAUNCH_MISSES`, `LAUNCHING_GRACE_MS`,
  `repend`) to the broker-side bound and its terminal state.
- **Spot-check:** pending a non-author review of the S109/S110/S111 admissions
  and the S112 rejection (the round-54 spot-check routed R54-C1, which this
  round repairs; the S108 standing reject was re-read here on committed bytes).

## Notes for the next round

R53-2 seat accounting remains an open convention: a returned payload without a
`Report:` artifact is counted by name as returned-without-report. This round's
64-seat v2 wave is prepared but undispatched; no seat returned a payload, so
there are 0 returned-without-report seats and 0 dead seats. Carried open:
A3e captured-invocation question, R43-1/R43-5, and the R41-2 gate-pins operator
ruling. Tool installs: none.
