# ReviewS118Admission — S118 re-open verdict

Seat: reviewer · item: re-open S118 `https://kafka.apache.org/43/configuration/consumer-configs`; verify the `session.timeout.ms` quote verbatim + located, and tier A for group-liveness scope.

**Verdict: ADMISSION UPHELD — corroborated by independent re-fetch.**

## Evidence (full artifacts: `.ufo/waves/round-57/build/ReviewS118Admission/`)

- URL: `https://kafka.apache.org/43/configuration/consumer-configs` (bare form 301→ trailing-slash; effective `…/consumer-configs/`). Access date 2026-10-24T12:52:58Z, HTTP 200, 145,719 bytes, body sha256 `abf4310fd8bec0df3f1ddcae3a115faa509d98c5d5d8266e721db2965189cb17` — **byte-identical to the pinned ScoutKafka capture** and to the `source-captures.json` S118 pin.
- Located quote (≤25 words): "The timeout used to detect client failures when using Kafka's group management facility. The client sends periodic heartbeats to indicate its liveness to the broker." — verbatim under anchor `id=session.timeout.ms` (byte 60689); continuation "…then the broker will remove this client from the group and initiate a rebalance" also verbatim. Default 45000 ms, importance high.
- `heartbeat.interval.ms` section (anchor at byte 58655) corroborates the entry: 3 s default, "typically should be set no higher than 1/3" of session timeout.
- All four ScoutKafka receipt files hash to the sha256s bound in `corpus/knowledge/worker-heartbeat-liveness.md`.
- SOURCES.md:131 row internally consistent (status `mined`, used-by the entry, matching D57 E3 assertions).

## Tier judgment: **A** — confirmed

Official Apache Kafka 4.3 documentation is the primary source for its own config semantics; scope cell claims only group-liveness facts the page states verbatim (broker-side failure detection, heartbeat cadence bound, member expulsion + partition reclaim by rebalance). Correctly distinguished from S120's transport keepalive — this is member liveness driving work reclaim, in-scope for worker-heartbeat-liveness.

## Observations (residual risk — low; no defect against the item)

1. Entry line 22 attributes the 45000 ms default to `group.consumer.session.timeout.ms`; on this page that default sits in the `session.timeout.ms` table — value correct, attribution loose. The entry also omits the page's `group.protocol` classic-vs-consumer gating for both knobs.
2. Recorded URL lacks the trailing slash the server redirects to (content identical; recorded pin is the served body, so no drift).

Residual risk: page is unversioned-per-release-line (`/43/` docs move with 4.3.x); `recheck: on-release` covers it. Verification gap: none for this item — quote, location, pin, tier, and entry receipts all independently corroborated.
