# Round-60 w1 dead-seat table (R60-V6 repair)

Derived only from committed blobs at `HEAD=be4a820c344d4eb2f94b999c3b5d649e76ab70f1` via `git show HEAD:<path>`; no worktree bytes were read for the table. The worktree is clean for `.ufo/waves/round-60` (`git status --porcelain` empty).

| Input | Blob |
|---|---|
| `.ufo/waves/round-60/w1/launcher-progress.tsv` | `df92492b4a48dfeb39f9e5a3729a2e08ac1b3d66` |
| `.ufo/waves/round-60/w1-launcher.log` | `d014d43024ed437d8f7b6741712f41647b1a9be2` |
| `.ufo/waves/round-60/launcher.py.txt` | `24fea66d3d2dba097c62abc3f49f83b9087660ee` |
| `.ufo/waves/round-60/w1/<Seat>.err`, `.ufo/waves/round-60/w1/<Seat>.stream.jsonl` | 32 + 32 files, one pair per seat |

## Count check

- Seats: **32** (progress rows = launcher `spawn` lines = launcher `settled` lines = 32).
- `exit=0`: **5**. `exit=-9`: **27**. Other exit codes: **0**.
- Every `exit=0` seat has a non-null session that matches the single `session.resume_hint` event in its stream. No `exit=-9` seat has a session id or a `session.resume_hint` event.
- `pid` and `exit`/`session` in every progress row equal the matching `spawn`/`settled` lines in `w1-launcher.log`.
- Window: first start 1792894711 (2026-10-25T02:18:31Z), last end 1792896200 (2026-10-25T02:43:20Z).

## Why exit=-9

`launcher.py.txt` sets `SEAT_TIMEOUT = 420` (line 16) and calls `proc.kill()` when a seat runs past it (lines 65-66). SIGKILL makes `Popen.poll()` return `-9`. Every dead seat ran 420-421 s (`end - start`), so all 27 dead seats were killed by the launcher's timeout. They did not crash on their own. Every stream, live or dead, carries `turn.step.retrying` events with `APIProviderRateLimitError` / HTTP 429. The dead seats spent their 420 s budget in provider rate-limit backoff (`max_attempts=20`, with `delay_ms` between 0.5 and 39.9 s across all 589 retry records).

## All 32 seats

| # | Seat | exit | session | pid | start | end | secs |
|---|---|---|---|---|---|---|---|
| 1 | ExecRows | 0 | `session_9b3e6593-23c2-4015-8f93-bbe4ecca6efa` | 54178 | 1792894711 | 1792894939 | 228 |
| 2 | ExecGates | 0 | `session_3954136f-c596-42bb-96e2-452eca6a312f` | 54173 | 1792894711 | 1792894949 | 238 |
| 3 | ExecCensus | 0 | `session_985f1d42-bc52-4443-b1e2-0eb0ef8f9c9e` | 54175 | 1792894711 | 1792895003 | 292 |
| 4 | RevS190Quote | 0 | `session_1b69d280-68da-4eb8-9147-f2113a964d69` | 54179 | 1792894711 | 1792895127 | 416 |
| 5 | ExecDispatch60 | -9 | null | 54170 | 1792894711 | 1792895131 | 420 |
| 6 | ExecDoctrine60 | -9 | null | 54171 | 1792894711 | 1792895131 | 420 |
| 7 | ExecDispatchGate | -9 | null | 54172 | 1792894711 | 1792895131 | 420 |
| 8 | ExecProxy | -9 | null | 54176 | 1792894711 | 1792895132 | 421 |
| 9 | ExecCapture | -9 | null | 54177 | 1792894711 | 1792895132 | 421 |
| 10 | RevS194Quote | -9 | null | 54180 | 1792894711 | 1792895132 | 421 |
| 11 | RevS133Quote | 0 | `session_f3ea5f29-29bb-48d5-ba98-5c93e56aa2fa` | 101241 | 1792895003 | 1792895136 | 133 |
| 12 | RevS126Quote | -9 | null | 93023 | 1792894939 | 1792895360 | 421 |
| 13 | RevS131Quote | -9 | null | 94626 | 1792894949 | 1792895370 | 421 |
| 14 | RevS134Quote | -9 | null | 111635 | 1792895127 | 1792895548 | 421 |
| 15 | RevS135Quote | -9 | null | 114566 | 1792895132 | 1792895552 | 420 |
| 16 | RevUsedBy | -9 | null | 114567 | 1792895132 | 1792895552 | 420 |
| 17 | CritBaseNotZero | -9 | null | 114614 | 1792895132 | 1792895552 | 420 |
| 18 | CritDropOne | -9 | null | 114615 | 1792895132 | 1792895552 | 420 |
| 19 | CritQuarantine | -9 | null | 114616 | 1792895132 | 1792895552 | 420 |
| 20 | CritTheme | -9 | null | 114617 | 1792895132 | 1792895552 | 420 |
| 21 | MutTemplate | -9 | null | 117947 | 1792895136 | 1792895556 | 420 |
| 22 | MutDeadSeat | -9 | null | 151196 | 1792895360 | 1792895780 | 420 |
| 23 | MutPipeRow | -9 | null | 153003 | 1792895370 | 1792895790 | 420 |
| 24 | MutDupGroup | -9 | null | 168299 | 1792895548 | 1792895968 | 420 |
| 25 | ScoutCollision | -9 | null | 168804 | 1792895552 | 1792895972 | 420 |
| 26 | ScoutFrontier | -9 | null | 168805 | 1792895552 | 1792895972 | 420 |
| 27 | ScoutCost | -9 | null | 168806 | 1792895552 | 1792895972 | 420 |
| 28 | ScoutLaneState | -9 | null | 168807 | 1792895552 | 1792895972 | 420 |
| 29 | ScribeGateRow | -9 | null | 168808 | 1792895552 | 1792895972 | 420 |
| 30 | ConnectorSiblings | -9 | null | 168809 | 1792895552 | 1792895972 | 420 |
| 31 | RevengerFlip | -9 | null | 169160 | 1792895556 | 1792895976 | 420 |
| 32 | SentinelBounds | -9 | null | 179883 | 1792895780 | 1792896200 | 420 |

## Dead seats: last error text

`.err tail` is the last non-empty line of `w1/<Seat>.err` (the seat process's stderr), full, never truncated (`|` inside the text is escaped, not cut). `stream tail` is the last `turn.step.retrying` record in `w1/<Seat>.stream.jsonl`, and `last event` is the final stream record at kill time. `retries` counts all `turn.step.retrying` records in the stream.

| Seat | .err bytes | .err tail | stream tail (last retry error) | retries | last event |
|---|---|---|---|---|---|
| ExecDispatch60 | 104360 | `BASE_EXIT=1` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 6/20)` | 17 | `meta:turn.step.retrying` |
| ExecDoctrine60 | 336 | `EXIT=0` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 9/20)` | 20 | `meta:turn.step.retrying` |
| ExecDispatchGate | 3247 | `FileNotFoundError: [Errno 2] No such file or directory: 'dispatch-actual.json'` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 13/20)` | 13 | `tool` |
| ExecProxy | 294225 | `— gate-pin verify via a strict rerun exit code: 0` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 3/20)` | 5 | `tool` |
| ExecCapture | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 16 | `meta:turn.step.retrying` |
| RevS194Quote | 49882 | `S190 quote tokens: 15` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 2/20)` | 14 | `tool` |
| RevS126Quote | 7579 | `-rw------- 1 vgpnk vgpnk  26579 Oct 24 23:18 swarm-registry.json` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 5/20)` | 35 | `meta:turn.step.retrying` |
| RevS131Quote | 1367 | `16` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 7/20)` | 20 | `meta:turn.step.retrying` |
| RevS134Quote | 1294 | `\| S134 \| Where Does Exactly-Once Live? Model, Harness, and Tool-Contract Effects on Duplicate Side Effects in LLM Agents — arXiv 2609.29095 (Jiapeng Li, Microsoft) \| paper \| A \| where exactly-once must live when an LLM agent's tool call can be duplicated; the registry held no row on duplicate side effects before this one \| § Title page; arXiv abs page read 2026-10-24, HTTP 200, 44818 bytes, sha256 90637c52c11e8c8f1d0264037ca5f4a51d62875f650070c804fed0634b0ad1c3 — scope is the title page only, no measured result is claimed \| the paper attributes duplicate side effects jointly to the model, the harness and the tool contract rather than to the model alone, and names its benchmark Limbo \| mined \| 2026-10-24 \| 180d \| corpus/knowledge/durable-execution-failure-detection.md \|` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 7/20)` | 26 | `meta:turn.step.retrying` |
| RevS135Quote | 32 | `Sat Oct 24 11:25:52 PM -03 2026` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 19 | `meta:turn.step.retrying` |
| RevUsedBy | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 16 | `meta:turn.step.retrying` |
| CritBaseNotZero | 2106 | `commit` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 8/20)` | 20 | `meta:turn.step.retrying` |
| CritDropOne | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 17/20)` | 17 | `meta:turn.step.retrying` |
| CritQuarantine | 9150 | `1 S178 the cited source could not be fetched, so no quote was checked` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 5/20)` | 34 | `tool` |
| CritTheme | 602 | `58b658d round-60: freeze — plan and frozen counters A60/D60 with base receipts` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 10/20)` | 21 | `meta:turn.step.retrying` |
| MutTemplate | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 16 | `meta:turn.step.retrying` |
| MutDeadSeat | 469 | `ANCESTOR_OF_HEAD` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 5/20)` | 24 | `meta:turn.step.retrying` |
| MutPipeRow | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 16 | `meta:turn.step.retrying` |
| MutDupGroup | 2812 | `` 140:\| S126 \| Detecting Activity failures — Temporal documentation — https://docs.temporal.io/encyclopedia/detecting-activity-failures \| docs \| A \| the failure-detection and timeout contract a durable-execution orchestrator must implement; the same page the lane already holds as S117 under the worker-liveness scope (duplicate group pinned in `.ufo/pins/source-dupes.json`, byte-identical capture) \| § Start-To-Close Timeout, § Activity Heartbeat, § Heartbeat Timeout; docs revision read 2026-10-24, HTTP 200, 80679 bytes, body sha256 c7f7c40158340e64132b948f77408aced56a4298093069283a3b5239a1b7db50 \| the server cannot detect a crashed worker, so the Start-To-Close Timeout is what forces a retry; an unset Heartbeat Timeout and an explicit 0s are indistinguishable once the Activity is scheduled; the heartbeat throttle interval is min(heartbeatTimeout times 0.8, maxHeartbeatThrottleInterval), default 30s, max 60s \| mined \| 2026-10-24 \| 90d \| corpus/knowledge/durable-execution-failure-detection.md \| `` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 7/20)` | 27 | `meta:turn.step.retrying` |
| ScoutCollision | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 16 | `meta:turn.step.retrying` |
| ScoutFrontier | 89287 | `` 273:- **Durable-execution and multi-agent failure research:** advanced by `knowledge/at-least-once-dedupe.md` (S106/S107 `` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 4/20)` | 29 | `meta:turn.step.retrying` |
| ScoutCost | 226 | `21` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 13/20)` | 22 | `meta:turn.step.retrying` |
| ScoutLaneState | 37020 | `proxy-check --strict exit=0` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 5/20)` | 24 | `meta:turn.step.retrying` |
| ScribeGateRow | 7693 | `e4a4943 2026-10-24 round-56: freeze + integrate — source-dupes gate (dup-URL ratchet), visibility-lease/ack-deadline frontier entry (S113-S116), plan+counters A56/D56, base receipts, witness, wave spec, routed-defect corrections R55-V1/V2` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 10/20)` | 19 | `tool` |
| ConnectorSiblings | 3316 | `/home/vgpnk/Projects/shokunin/souji-shokunin/corpus` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 10/20)` | 33 | `meta:turn.step.retrying` |
| RevengerFlip | 0 | (empty) | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 16/20)` | 16 | `meta:turn.step.retrying` |
| SentinelBounds | 25317 | `` +**C1 — operability (lowest non-retired axis; capability acquisition `dispatch-evidence`, `` | `APIProviderRateLimitError 429: 429 Rate limit reached for requests (attempt 5/20)` | 18 | `tool` |

## Launcher crash traceback (quoted whole)

The full traceback from `w1-launcher.log` lines 65-68. It is the end of the log, and no `DONE members=` line follows it:

```text
Traceback (most recent call last):
  File "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-60/launcher.py.txt", line 95, in <module>
    parts = dict(p.split("=", 1) for p in line.split("\t")[1:])
ValueError: dictionary update sequence element #6 has length 1; 2 is required
```

Cause: `launcher.py.txt` line 79 builds `err_txt` from the first 400 chars of `.err` and replaces `\n` with ` | `, but leaves `\t` alone. Line 81 then writes the text into a tab-separated row. Line 95 re-splits each row on `\t` and requires every field after the name to contain `=`.

| Progress line | Seat | tab fields | first field without `=` (index in `fields[1:]`) | that field (first 80 chars) |
|---|---|---|---|---|
| 3 | ExecCensus | 13 | #6 | `W04` |
| 26 | ScoutFrontier | 8 | #6 | `corpus/REA` |

The first offender is progress line 3 (ExecCensus): element #6 has no `=`, which matches `dictionary update sequence element #6`. Line 26 (ScoutFrontier) has the same defect and would also fail.

As a result, the launcher never ran its own registry write (line 103) or its `DONE` print. The committed `w1/swarm-registry.json` has schema `ufo-swarm-registry-v1` (createdAt `2026-10-25T02:18:21.213Z`), not the launcher's `{wave, concurrency, seatTimeoutSec, members:[...]}` shape, so it is not the launcher's output.
