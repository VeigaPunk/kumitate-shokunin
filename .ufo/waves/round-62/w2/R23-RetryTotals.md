# R23 — Retry totals and dead-seat association

## Finding

The global **589** retry count and **0.5–39.9 s** delay range rederive from all committed stream files at `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`; they are not a dead-seat-only total. All 32 stream files produce 589 `turn.step.retrying` events, `max_attempts` is uniquely 20, and observed `delay_ms` extrema are 500.3534827702788 and 39852.93466202331 (displayed as 0.5–39.9 s). The retry sum for the 27 rows whose committed progress exit is not `exit=0` is **553**; the five live-seat streams account for the remaining **36**. Thus the source text is accurate when read as “across all 589 retry records”; it does not establish 589 retries associated only with dead seats.

Commands run (all inputs explicitly read using `git -C "$D" show "$REV:<path>"`; `D=/home/vgpnk/Projects/shokunin/kumitate-shokunin`, `REV=be4a820c344d4eb2f94b999c3b5d649e76ab70f1`):

```sh
# all committed w1 streams: jq -s '[.[]|select(.type=="turn.step.retrying")] | {count:length,min:(map(.delay_ms)|min),max:(map(.delay_ms)|max),attempts:(map(.max_attempts)|unique)}'
{"count":589,"min":500.3534827702788,"max":39852.93466202331,"attempts":[20]}

# For each progress row whose exit is not exit=0, count retry events in that seat's committed stream; sum counts
# Output:
dead-seat retry sum=553
```

The association is reproduced by pairing the progress `Seat` and named `exit=` fields with same-name `.stream.jsonl` paths. The five live-seat retry counts are ExecRows 6, ExecGates 4, ExecCensus 7, RevS190Quote 13, and RevS133Quote 6, totaling 36. Their complement is 553 retries across the 27 dead-seat streams. This makes the dead-seat association explicit rather than leaving 589 ambiguously attached to the paragraph about the dead seats.

## Exhaustiveness / residual gap

Round-62 `w1/Audit19.md` §4 explicitly preserves the full 64-file `.err`/`.stream.jsonl` no-truncation scan as unrun, and §4 also lists all-row spawn/settled/session pairing as unrun. Its §3 reports 589/extrema without a reproducible command or per-seat breakdown. Therefore the broader R62 Audit19 deliverable is not exhaustive on its own evidence: the totals are reproducible, but its stated audit did not execute the exhaustive file checks. This finding only addresses retry totals, seat association, and that retry-related audit coverage; it makes no round verdict.

Evidence pointers: R60 dead-seat table `.ufo/waves/round-60/close/dead-seats-r60.md:22,63-93`; R62 re-queue `.ufo/waves/round-62/w1/Audit19.md:44-60` (the check list explicitly leaves exhaustive scan and per-row pairing unrun).