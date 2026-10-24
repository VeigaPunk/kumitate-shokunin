# ReviewS120Rejection — evidence log (kumitate round 57)

All commands read-only against the lane; zero mutations to production, pins, jj/git state.
Lane rev at review time: git HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89` (jj @ = `nuxonxrukusk 2909579f06af`);
`git status --porcelain` over `corpus/knowledge/worker-heartbeat-liveness.md`, `corpus/SOURCES.md`,
`corpus/lessons/round-57.md`, `.ufo/pins/source-captures.json` → 0 lines (judged bytes are committed).
Plan base named `7178bfd3643c…`; the round-57 bytes under review are committed at the rev above.
No tool installed or updated this seat (pacman host-wide pause honored; nothing needed).

## 1. Live re-open of S120 (three independent retrievals, access date 2026-10-24)

URL: https://www.rabbitmq.com/docs/heartbeats — RabbitMQ 4.4 docs, "Detecting Dead TCP Connections
with Heartbeats and TCP Keepalives", Docusaurus v3.10.2.

1a. Reader tool (native fetch) → HTTP 200, rendered content retrieved 2026-10-24; title and full
    body match the capture (§Overview, §Heartbeat Frames, §TCP Keepalives, §Heartbeats and TCP
    Proxies all present, same wording).

1b. Bare-UA curl (bot-blocked, kept as evidence):
```
$ curl -sS -D headers-fresh.txt -o rabbitmq-heartbeats-fresh.html \
    -w 'HTTP=%{http_code} bytes=%{size_download}\n' https://www.rabbitmq.com/docs/heartbeats
HTTP=403 bytes=5470        (block page; body sha256 49dddbd8e5e04075c3bbae775b781d92df9f2303944f001dd6c3addbf3a0e245)
curl_exit=0                2026-10-24T12:54:27Z
```

1c. Browser-UA curl refetch (byte-level corroboration):
```
$ curl -sS -A 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0' \
    -H 'Accept: text/html,application/xhtml+xml' -D headers-ua.txt \
    -o rabbitmq-heartbeats-ua.html -w 'HTTP=%{http_code} bytes=%{size_download}\n' \
    https://www.rabbitmq.com/docs/heartbeats
HTTP=200 bytes=51578       curl_exit=0    2026-10-24T12:55:33Z
sha256(rabbitmq-heartbeats-ua.html) = 8370687da1c8b67387951eaeab2c7658e0abc1564e40607cb190bfdca7228779
```
→ byte-IDENTICAL to (a) the scout capture `.ufo/waves/round-57/build/ScoutRabbitmqHb/rabbitmq-heartbeats.html`
  (sha256sum: same hash, 51,578 bytes), (b) the sha recorded in the S120 row of `corpus/SOURCES.md`
  (line 133), and (c) the pin in `.ufo/pins/source-captures.json` (sourceId S120, same path, same
  sha256, bytes 51578). Capture integrity verified end-to-end.

## 2. Pinned-page content scans

```
$ for w in worker 'unit of work' consumer unacked acknowledgement 'liveness' probe \
      orchestrator requeue progress stall hung; do \
    printf '%-16s %s\n' "$w" "$(grep -oiF -- "$w" rabbitmq-heartbeats.html | wc -l)"; done
worker           0
unit of work     0
consumer         2
unacked          0
acknowledgement  2
liveness         0
probe            0
orchestrator     0
requeue          0
progress         0
stall            2
hung             0
```
All three non-zero hits are sidebar/nav chrome, not page content: `href=/docs/consumers`
"Consuming Messages", `href=/docs/confirms` "Consumer Acknowledgements and Publisher Confirms",
`Install and Upgrade` (the "stall" substring). Zero worker-liveness vocabulary in page content.
`grep -c 'consumer_timeout\|acknowledgement timeout'` → 0.

## 3. Exact source sentences (newlines flattened, pinned bytes)

- `AMQP 0-9-1 offers a <i>heartbeat</i> feature to ensure that the application layer promptly
  finds out about disrupted connections (and also completely unresponsive peers). Heartbeats
  also defend against certain network equipment which may terminate "idle" TCP connections…`
- `Any traffic (e.g. protocol operations, published messages, acknowledgements) counts for a
  valid heartbeat. Clients may choose to send heartbeat frames regardless of whether there was
  any other traffic on the connection…`
- `After two missed heartbeats, the peer is considered to be unreachable. … the TCP connection
  will be closed. When a client detects that RabbitMQ node is unreachable due to a heartbeat,
  it needs to re-connect.`
- §Overview also: disrupted TCP connections take "about 11 minutes with default configuration on
  Linux" for the OS to detect — the page's stated reason heartbeats exist.

## 4. Full S120 row (extracted verbatim, 884 bytes → S120-row-full.txt)

`| S120 | Detecting Dead TCP Connections with Heartbeats and TCP Keepalives — RabbitMQ
documentation — https://www.rabbitmq.com/docs/heartbeats | docs | B | RabbitMQ heartbeats:
periodic AMQP heartbeat frames detect dead TCP connections between client and broker at
connection scope — transport liveness, not worker/task liveness | §Overview, saved HTML;
fetched 2026-10-24, HTTP 200, 51,578 bytes, body sha256 8370687d…228779 | REJECTED: AMQP
heartbeats answer "is this TCP peer alive" at connection scope — the worker's connection lives
or dies as one unit, not its outstanding units of work; the name collides with this entry's
worker-liveness scope but the mechanism is transport keepalive; flip: a lane-owned mapping of
connection-level liveness onto the dispatcher's transport tier | rejected | 2026-10-24 | 180d | — |`

## 5. Entry receipts verified (knowledge entry Rejected row)

```
$ sha256sum tcp-liveness.txt source-metadata.txt   (in build/ScoutRabbitmqHb/)
11d8112d78e17f12a8a977172267b5b51d001ba1ece261dd15223cdae8316216  tcp-liveness.txt      == entry receipt ✓
8a31c1a11fdcd99d862c2e22c4a97b547f9c3b961c30fbcf4560fe62fd7e9781  source-metadata.txt   == entry receipt ✓
```

## 6. Quote-accuracy diff (finding F2)

Source (verbatim, pinned bytes): "…promptly finds out about disrupted connections
**(and also completely unresponsive peers)**."
Quoted in `worker-heartbeat-liveness.md` Rejected row AND in scout `tcp-liveness.txt`:
"…promptly finds out about disrupted connections **(and peers)**…" — words altered inside the
quotation marks, no ellipsis at the elision. The lesson `round-57.md` Gate quote stops before the
parenthetical ("…finds out about disrupted connections", 19 words) and is verbatim-accurate.
The SOURCES row `teaches` cell is an accurate paraphrase (no quote marks).

## 7. Tier contract (fleet-level, read-only)

`/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`: "tier — scoped to
`scope`, never global. **A**: primary or authoritative for that scope (spec, official docs,
source code, original paper, maintainer statement, the lane's own re-runnable gate output).
**B**: strong secondary (expert write-up with reproducible detail, survey, textbook). …
Tier is curation, not truth." Corpus precedent for rejected docs rows exists both ways:
S019 docs/A rejected, S020 docs/A rejected; S112 docs/B rejected; S108 community/B screened-rejected.

## 8. Corroborating corpus row (reclaim path rides on ack semantics, not heartbeats)

S107 (RabbitMQ 4.4 confirms, tier A, mined): "consumer acknowledgement, delivery-tag scope, and
requeue semantics" — the corpus's own admitted source for redelivery-on-disconnect.
