# Source capture receipt — S124 (Flink checkpointing)

- source: S124 — https://nightlies.apache.org/flink/flink-docs-master/docs/dev/datastream/fault-tolerance/checkpointing/ (§Enabling and Configuring Checkpointing)
- opened: 2026-10-24T14:21:56Z (HTTP 200; Last-Modified Sat, 24 Oct 2026 00:01:41 GMT; etag "248e2-65e8acd33d571")
- capture: `.ufo/waves/round-58/build/ScoutFlink/body.html` sha256 1aafd5e2a7242ef7fbe1b8ce8945fa64f98e332c30af6b876e02a5189533f7d4
- located quote (lead): "In order to make state fault tolerant, Flink needs to checkpoint the state."
- located quote (§Enabling and Configuring Checkpointing): "checkpoint timeout : The time after which a checkpoint-in-progress is aborted, if it did not complete by then."
- gate decision: ADMITTED tier A, status `queued` — engine-internal checkpoint knobs (interval/timeout/storage) for an embedded streaming engine; outside this entry's orchestration-side mapping, kept for the frontier band's durable-state thread.
