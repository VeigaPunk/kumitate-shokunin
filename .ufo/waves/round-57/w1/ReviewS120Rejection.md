# ReviewS120Rejection — S120 rejection judgment (kumitate round 57, w1)

Seat: reviewer (leaf, one-shot). Item: re-open S120 https://www.rabbitmq.com/docs/heartbeats and
judge the round's reject — *connection liveness ≠ worker liveness* — agree/disagree.
Judged bytes: committed at HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89` (jj `2909579f06af`,
`nuxonxrukusk`); no production writes, no commits, no installs (pacman pause honored; none needed).
Full command log + captures: `.ufo/waves/round-57/build/ReviewS120Rejection/EVIDENCE.md`.

## Source record

- URL: https://www.rabbitmq.com/docs/heartbeats (RabbitMQ 4.4 docs, "Detecting Dead TCP
  Connections with Heartbeats and TCP Keepalives")
- Accessed: 2026-10-24 (this seat). Three retrievals: reader-tool native fetch (HTTP 200,
  content-matching), bare-UA curl (403 bot-block, kept as evidence), browser-UA curl
  (HTTP 200, **51,578 bytes, sha256 `8370687d…228779` — byte-identical to the scout capture,
  the S120 row's recorded sha, and the `.ufo/pins/source-captures.json` pin**).
- Located quote (19 words, §Overview, verbatim in pinned + live bytes): "AMQP 0-9-1 offers a
  heartbeat feature to ensure that the application layer promptly finds out about disrupted
  connections"
- Tier judgment: **B — acceptable, no defect.** Official docs would read tier A for their own
  transport scope under a literal SOURCES-CONTRACT-v1 reading, but the contract also says
  "tier is curation, not truth", the row's scope cell fences S120 to transport liveness, and
  the corpus already holds lane-peripheral docs rows at B (S111, S112). B follows precedent.

## Verdict: AGREE with the rejection

The reject is correct and correctly grounded. Four independent grounds, all from the re-opened
source's own bytes (pinned capture = live bytes, verified byte-for-byte):

1. **The page declares connection scope itself.** Title and §Overview: heartbeats exist so the
   application layer "promptly finds out about disrupted connections (and also completely
   unresponsive peers)" and to defend idle TCP connections from proxy/LB termination. §Heartbeat
   Frames: "After two missed heartbeats, the peer is considered to be unreachable … the TCP
   connection will be closed"; remedy is "it needs to re-connect." One verdict per TCP
   connection; the remedy is transport recovery.
2. **No progress semantics.** "Any traffic (e.g. protocol operations, published messages,
   acknowledgements) counts for a valid heartbeat" — heartbeat success evidences only that the
   socket endpoint is servicing the connection; it cannot distinguish a worker progressing on
   its unit of work from one wedged on it. Vocabulary scan of the pinned bytes: worker=0,
   liveness=0, probe=0, requeue=0, unacked=0, progress=0, "unit of work"=0; the only
   consumer/acknowledgement hits are sidebar nav chrome. `consumer_timeout` — RabbitMQ's actual
   task-stuck guard, which lives on the confirms page — has 0 mentions here.
3. **Scope granularity mismatch with every admitted source.** S117 heartbeats are emitted by
   activity code for a specific Activity Execution and can carry progress detail; their timeout
   fails *that activity*. S118's session heartbeat evicts the consumer from the group and
   rebalance reassigns *its partitions*. S119's probe is an application-defined check of the
   workload with the platform remedy (restart). S120's verdict is per-connection, and one
   connection can host many channels/consumers — it cannot attribute or bound any particular
   outstanding unit of work.
4. **Remedy attribution.** Reclaiming a dead consumer's outstanding work in RabbitMQ is real,
   but it is the consumer-acknowledgement/requeue contract (unacked deliveries requeue on
   channel/connection close — corpus S107, tier A, already holds this), not the heartbeat
   signal. Citing the heartbeats page as a worker-liveness source would misattribute the
   mechanism; the heartbeat contributes only *timely transport detection* (vs ~11-minute kernel
   TCP keepalive defaults, per the page's own §Overview).

The name collision — RabbitMQ "heartbeats" vs S117/S118 "heartbeats" — is the whole trap, and
the row and the entry's Rejected row both name it explicitly. The rejection rationale recorded
in the plan ("TCP connection keepalive != worker/task liveness"), the SOURCES row, the lesson
row, and the knowledge entry are mutually consistent (status `rejected`, recheck 180d, used-by
`—`, entry cites S120 only in its Rejected row; capture pinned).

## Findings by severity

- **F2 (LOW) — quote altered inside quotation marks.** Source: "disrupted connections **(and
  also completely unresponsive peers)**". Quoted in `corpus/knowledge/worker-heartbeat-liveness.md`
  (Rejected row) and in the receipt-bound scout evidence `build/ScoutRabbitmqHb/tcp-liveness.txt`
  as "disrupted connections **(and peers)**…" — words changed inside the quote, no ellipsis at
  the elision. Meaning preserved, no verdict depends on it; the lesson Gate quote (verbatim-
  accurate 19-word prefix) and the SOURCES row (paraphrase, unquoted) are clean. Disposition per
  lane convention: append-only correction next round; do not rewrite history.
- **OBS-1 (INFO) — tier reading.** A literal SOURCES-CONTRACT-v1 reading ("official docs" ⇒ A
  for the declared scope) would permit A; corpus precedent for peripheral/rejected docs rows
  (S111, S112) supports the assigned B. Recorded, no action.

No MEDIUM/HIGH findings. The rejection decision, its scope statement, capture integrity, pin,
row status, and entry receipts all check out.

## Residual risk

- Dead-consumer work recovery in RabbitMQ does exist (connection death → requeue of unacked →
  redelivery). This seat agrees the *heartbeat page* is not the source for it; if the durable-
  execution line ever wants a RabbitMQ-side task-liveness source, the candidate is the consumer
  acknowledgement timeout (`consumer_timeout`, /docs/confirms territory) — 0 mentions on this
  page. Recorded as flip guidance only; absorbing it is not this seat's call.
- The 403-on-bare-UA bot block means future re-opens of rabbitmq.com via plain curl may fail;
  browser-UA or reader-tool fetch works (all three capture paths recorded in EVIDENCE.md).

## Verification gaps

- S117/S118/S119 admission correctness was not re-derived (out of this seat's scope; other
  seats own those rows).
- This review judged committed bytes at `8c6f5b01`; the round-57 close rev R1 (and the D57
  counter run against it) did not exist yet. The lesson's `Spot-check result: <pending>` line
  remains for the round close to fill — this report is the S120 input to it. Production files
  are read-only to this seat, so nothing was edited there.
