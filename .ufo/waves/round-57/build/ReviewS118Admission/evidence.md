# ReviewS118Admission — evidence

Seat: reviewer, kumitate round 57. Item: re-open S118
`https://kafka.apache.org/43/configuration/consumer-configs`; verify the
`session.timeout.ms` quote verbatim + located, and tier A for the
group-liveness scope.

## 1. Re-open (independent fetch, 2026-10-24T12:52:58Z)

```
$ curl -sSL -D fetch-headers.txt -o kafka-consumer-configs.html -w '...' \
    'https://kafka.apache.org/43/configuration/consumer-configs'
http_code=200 size=145719 url_effective=https://kafka.apache.org/43/configuration/consumer-configs/ redirects=1
curl_exit=0
sha256 = abf4310fd8bec0df3f1ddcae3a115faa509d98c5d5d8266e721db2965189cb17
bytes  = 145719
```

- Bare URL 301-redirects to the trailing-slash URL; final body is byte-identical
  to the pinned capture `.ufo/waves/round-57/build/ScoutKafka/kafka-consumer-configs.html`
  (same sha256, same size), matching `.ufo/pins/source-captures.json` S118 entry
  (sha256 abf4310f…, bytes 145719, captured 2026-10-24) and the SOURCES row's
  anchor cell (HTTP 200, 145,719 bytes, same sha256).
- Artifacts: `kafka-consumer-configs.html`, `fetch-headers.txt`, `fetch-log.txt`.

## 2. Verbatim + located (verbatim-check.txt, quote-context.txt)

All quoted strings located in the live page under the dedicated anchors:

- `id=session.timeout.ms` anchor at byte 60689 (h4 `>session.timeout.ms</a>` at 60700+).
  Page sentence, verbatim:
  "The timeout used to detect client failures when using Kafka's group
  management facility. The client sends periodic heartbeats to indicate its
  liveness to the broker. If no heartbeats are received by the broker before the
  expiration of this session timeout, then the broker will remove this client
  from the group and initiate a rebalance."
  Type: int; Default: 45000 (45 seconds); Importance: high.
- `id=heartbeat.interval.ms` anchor at byte 58655.
  Page sentence, verbatim: "The expected time between heartbeats to the consumer
  coordinator when using Kafka's group management facilities. Heartbeats are
  used to ensure that the consumer's session stays active and to facilitate
  rebalancing when new consumers join or leave the group."
  Type: int; Default: 3000 (3 seconds); Importance: high.
- The 1/3 clause exists verbatim — "the value must be set lower than
  `session.timeout.ms`, but typically should be set no higher than 1/3 of that
  value" — but is scoped by the page to `group.protocol` = "classic"; under
  "consumer" the broker config `group.consumer.heartbeat.interval.ms` controls
  cadence and `group.consumer.session.timeout.ms` controls the timeout
  (both stated in the same two paragraphs).
- `session.timeout.txt` / `heartbeat-interval.txt` / `rebalance-reclaim.txt` /
  `source-metadata.txt` receipt bytes hashed: all four sha256s match the
  knowledge entry's `receipt:` bindings (receipt-hashes.txt).

## 3. SOURCES row (corpus/SOURCES.md:131)

- Row: `| S118 | Consumer configs — Apache Kafka 4.3 documentation | docs | A | …`
- anchor cell: "§session.timeout.ms + §heartbeat.interval.ms, saved HTML;
  fetched 2026-10-24, HTTP 200, 145,719 bytes, body sha256 abf4310f…" — consistent
  with re-fetch.
- teaches quote = the first two page sentences verbatim (FOUND).
- status `mined`, opened 2026-10-24, recheck on-release,
  used-by `corpus/knowledge/worker-heartbeat-liveness.md` — matches D57 E3
  assertions (status mined + used-by naming the entry + capture-registry pin).

## 4. Tier judgment — A, confirmed for the stated scope

- Source class: official Apache Kafka project documentation for release line
  4.3 — primary vendor doc for the config semantics it cites; `kind: docs`.
- Scope cell claims only group liveness: session timeout as broker-side
  client-failure detection fed by periodic heartbeats, heartbeat cadence bound
  (3 s default, ≤ ~1/3), silent member expelled + partitions re-assigned by
  rebalance. Every element is carried by the two page sections verbatim; nothing
  in the scope cell overstates the page.
- Distinction from S120 is correct: this is application-level member liveness
  with work reclaim (group membership → partition assignment), not TCP
  keepalive — inside the entry's worker-liveness scope.

## 5. Observations (not defects for this item)

- The knowledge entry line 22 cites "group.consumer.session.timeout.ms default
  45000 ms". On this consumer-configs page the 45000 default belongs to the
  `session.timeout.ms` table; the page only *names*
  `group.consumer.session.timeout.ms` as the broker-side replacement under
  group.protocol="consumer". Value is correct; table attribution is loose.
  The entry also does not mention the classic/consumer protocol gating that the
  page states for both knobs.
- Recorded URL is the non-slash form; effective fetch URL gains a trailing
  slash after one 301 (content identical).

## Verdict

ADMISSION UPHELD. Quote verbatim and located (anchors at bytes 60689/58655),
pinned capture byte-identical to a fresh fetch, tier A appropriate for the
group-liveness scope. Two loose-attribution observations logged above; neither
weakens the cited quote or the tier.
