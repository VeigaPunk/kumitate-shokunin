# Round 54 — lesson

Lane: kumitate. Round 54 (hyaku run 5, watchdog attempt 1). Base
`383ad787ac3a9301b25422e50ebfef256d534924`. Plan
`.ufo/waves/round-54/plan.md`; frozen counters A54 and D54, base receipts and
scratch-HELD witness under `.ufo/waves/round-54/` (Q43 / M5 discipline).

Two claims. **C1 — operability, capability acquisition:** `counter-pins`,
contract `kumitate-counter-pins-v1`, the B5d source-pin arm beyond round-53 H6.
Predicate `ATTEST54_HELD`, rule A54 v1, 10 checks. **C2 — frontier coverage,
sourced:** `corpus/knowledge/at-least-once-dedupe.md`, the durable-execution
frontier's delivery/idempotency connection, grounded in S106 (MQTT v5.0) and S107
(RabbitMQ 4.4). Predicate `DOCTRINE54_HELD`, rule D54 v1, five checks.

## Mistakes

- **M1 — R54-1: a pending source spot-check stayed unresolved in its own lesson
  after the non-author check landed separately.** Class: `reference-drift` /
  `landing`. Evidence: at base `383ad787`, the round-53 lesson had its literal
  `<pending>` line but no pointer to the already committed
  `corpus/lessons/round-53-verifier-spotcheck.md` §3; captured by the verifier
  spot-check, but no lane criterion required the next round to close that pointer.
  The red-before and fixed readings are committed in
  `.ufo/waves/round-54/build/MistakeR54-1-before.txt` (the pointer query exits 1)
  and `.ufo/waves/round-54/build/MistakeR54-1-after.txt` (the append-only AGREE pointer exits 0). Captured-by:
  `none` at the failure; this round adds QUALITY Q45. Fix: append `## Gate
  correction (round 54; R54-1)` to the round-53 lesson, retain its original
  pending line, and cite the committed non-author result.

- **M2 — the committed round-53 verifier spot-check had no README map row.** Class: `landing`. The file already existed at base, but `corpus/README.md` omitted it, so after this round's two new notes the strict proxy read `C2=125`, `C2_total=126`, and the retired coverage aggregate computed 9 against the declared 10. Evidence: `.ufo/waves/round-54/build/MistakeR54-2-before.txt`; the repair adds the `lessons/round-53-verifier-spotcheck.md` row, and `.ufo/waves/round-54/build/MistakeR54-2-after.txt` reads `PROXY: MATCH (C2=126/126 coverage=10)`. Captured-by: fleet `CORPUS.md` §Rules, “An index row is a claim”; the rule existed, but its required map sweep was missed. Fix: add the missing README row and re-derive C2/C2_total; no knowledge file was removed or hidden.

## Gate

Candidates considered: S106 (OASIS MQTT v5.0), S107 (RabbitMQ official consumer
acknowledgement documentation), and S108 (Microservices.io Idempotent Consumer
pattern). Rows before: 105; after: 108 (tier A 89→91, B 8→9, C 8 unchanged).

- **S106 — ADMITTED, tier A.** URL
  `https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html`; opened
  2026-10-24T06:34:14Z; HTTP 200; 1,435,680 bytes; body sha256
  `16f24e2b021d86b3bbb2b39c8b5ee134b3d39f69320ba61d3c07a38af74e696c`.
  Quote (13 words), Abstract, saved HTML lines 1919-1920: “At least once”, where
  messages are assured to arrive but duplicates can occur. §4.3.2 also binds the
  QoS 1 PUBLISH Packet Identifier and PUBACK. Used by
  `corpus/knowledge/at-least-once-dedupe.md`.
- **S107 — ADMITTED, tier A.** URL
  `https://www.rabbitmq.com/docs/confirms`; opened 2026-10-24T06:35:03Z;
  HTTP 200; RabbitMQ docs version 4.4; 121,232 bytes; body sha256
  `abf54dae23a2e6f0df6d9446d992e16c410414e0933d917538148901515b7523`.
  Quote (13 words), §Negative Acknowledgement and Requeuing of Deliveries, saved
  HTML lines 163-164: “When the field is set to true, the broker will requeue
  the delivery.” Tier A applies only to RabbitMQ's own acknowledgement/requeue
  behavior, not other brokers. Used by the same entry.
- **S108 — REJECTED, tier B.** URL
  `https://microservices.io/patterns/communication-style/idempotent-consumer.html`;
  opened 2026-10-24 through the static web reader; page undated. Quote (18 words),
  §Context: “At-least once delivery guarantees that a message broker will deliver
  a message to a consumer even if errors occur.” The source's SQL
  `PROCESSED_MESSAGE` table/transaction recipe does not map to this lane's
  file-backed queue and nonce-ledger surfaces; S106/S107 already ground the
  scoped transport facts. Flip: a lane-owned, tested mapping that preserves task
  identity across repend. Row retained as rejected; `used-by` stays `—`.
- **Tier and scope withheld:** S106 proves MQTT QoS 1 duplicate possibility and
  its protocol Packet Identifier, not an application idempotency key. S107 proves
  RabbitMQ behavior, not a universal queue contract. The stable operation-key
  rule is labelled `[INFERENCE]` in the entry; it does not claim exactly-once
  effects.
- **Prior art:** `queue-and-claim.md` supplies the immutable content-derived
  task key and the distinct retry counters; `invocation-attestation.md`
  (S100/S101) supplies invocation-nonce semantics; `fail-closed-clock-validation.md`
  (S102/S103) is about clocks; `receipt-identity-canonicalization.md`
  (S104/S105) is about receipt record identity. This entry connects those
  concepts to the transport-level duplicate/requeue case without replacing them.
- **Spot-check:** pending a non-author review of the S106/S107 admissions and
  S108 rejection. The round-53 source re-open is recorded separately by the
  R54-1 correction above; it is not this round's spot-check.

## Notes for the next round

R53-2 seat accounting remains an open convention: a returned payload without a
`Report:` artifact is counted by name as returned-without-report. This round's
64-seat v2 wave is prepared but undispatched; no seat returned a payload, so
there are 0 returned-without-report seats and 0 dead seats. Carried open:
A3e captured-invocation question, R43-1/R43-5, and the R41-2 gate-pins operator
ruling. Tool installs: none.
