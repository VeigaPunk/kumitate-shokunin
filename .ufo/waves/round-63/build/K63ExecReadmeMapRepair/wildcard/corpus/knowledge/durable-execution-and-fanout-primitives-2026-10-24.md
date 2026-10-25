source: S190 — https://research.google/pubs/the-tail-at-scale/ — S194 — https://dl.acm.org/doi/10.1145/38714.38742
verified-at: 2026-10-24
recheck: 180d
coverage-map: durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) (PROVINCE.md §Frontier band 4)
ground: PROVINCE.md §Frontier band 4 — the band held five entries on delivery, retry, lease, liveness and replay, and no entry named the two primitives an orchestrator needs to repair a partial failure forward or to price a slow seat.

# Two primitives an orchestrator needs: compensating action and tail tolerance

Both sources were opened for this entry on 2026-10-24 by the lane, not relayed from the
campaign's staging package.

- receipt:`.ufo/waves/round-60/build/ScoutTailAtScale/body.html`@sha256:399be231120943041eef0f7909a42cffae339f67b8c3aa85d8e0a05b4c8ee63e
- receipt:`.ufo/waves/round-60/build/ScoutSagas/body.md`@sha256:d57846cc153e9e22c89c8af8f0c617b791d8a8afefbdeba715a375a7d0e76942

Located quote, S190 §Abstract (13 words): "large online services need to create a predictably
responsive whole out of less predictable parts".

Located quote, S194 §Abstract (17 words): "a saga if it can be written as a sequence of
transactions that can be interleaved with other transactions".

## Compensating action: partial failure is repaired forward

A long-lived transaction becomes a **saga** when it can be written as a sequence of transactions
that can be interleaved with other transactions, and the system's guarantee is that either the
whole sequence completes or compensating transactions amend the partial execution.

The important word is *compensating*. A saga does not roll back; the application supplies the
inverse action, and the guarantee is about the outcome rather than about the mechanism. For a
multi-seat queue this is the difference between a task that can be safely retried and one that
cannot: a seat that fails halfway through a multi-step deliverable leaves a partial artefact,
and what repairs it is a forward action whose semantics the application defines, not a database
transaction that was never committed. The lane's own content-derived task key and claim/repend
lifecycle (its `at-least-once-dedupe` entry) is an instance of this shape.

**Evidence limit, stated rather than hidden.** The captured full text of the 1987 paper is
OCR-degraded: the retrieval renders "is" as `1s` and "compensating" as `compensatmg`, so the
compensation clause is readable as `or compensatmg transactions are run to amend a partial
execution`. The definition sentence quoted above is a contiguous substring of the captured
bytes and is not degraded; the compensation clause is carried by the row's `teaches` cell, which
names the guarantee in the paper's own terms, and it is re-read before the 180-day recheck.

## Tail tolerance: the slowest seat sets the cost

The authors of *The Tail at Scale* frame the problem as fault tolerance inverted: just as
fault-tolerant computing aims to create a reliable whole out of less reliable parts, large online
services need to create a predictably responsive whole out of less predictable parts. Temporary
high-latency episodes that are unimportant at moderate size come to dominate performance at
scale.

For a 64-seat wave the arithmetic is the same in a different currency: the round's cost is its
slowest seat, and a seat that is slow for a transient reason costs the whole round what a failed
seat would. The paper's own technique for this — the hedged request, a duplicate issued after a
brief delay whose result is taken from whichever replica answers first — is not a retry. A retry
follows a failure; a hedge follows a delay, and both requests may still be in flight.

## What this entry does not claim

It does not claim the lane's harness implements either primitive. It supplies the two named
ground rules the frontier band was missing, each from its own canonical source, and each with the
paper's own framing rather than a paraphrase.
