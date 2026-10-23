# ReRunCounter48-2 — C1 kill-rule re-run (2 of 2)

Seat: `kumitate-r48-close-ReRunCounterB`. Independently timed re-run of the frozen C1 kill-rule
command on the C1 candidate commit (no coordination with ReRunCounterA; runs overlapped wall-clock
with sibling re-run/r47-set seats — that concurrency is the counter's own load and leaves this
receipt self-contained).

## Command (verbatim, wrapped `timeout -k 10 1800`, `TMPDIR=/tmp`)

```
node .ufo/waves/round-48/probe/caproute48-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin ce9aee5daf71004a5890134f9526cc6fe424b206 --set r48
```

## held= line verbatim

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
```

**Reading: `held=4/4`, exit 0.** Every site `ROUTED_HELD` in all 3 rev runs — RG742 116/116,
SP491 2/2, SP519 2/2, SP1592 14/14; per-run exec counts equal the base run's; `uncapped_direct=0`;
all traces parsed completely (exit 0, not 2 — this run is a score under the kill rule).

## Provenance

- Counter bytes: sha256 `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`
  — byte-identical to the counter in `r48/L1-score-ce9aee5d.txt` (the post-A48 frozen instrument;
  the pre-A48 stability receipts carry `f24a3af5…` and `rule=F48`).
- Lane `HEAD` at run time: `ce9aee5daf71004a5890134f9526cc6fe424b206` (the C1/C2 candidate, lane tip).
- Timing: start `2026-10-23T19:00:46Z`, end `19:02:42Z` (wall 116 s); load1 27.90 → 47.21.
  The L1 score ran 18:52:59Z → 18:53:56Z; this is an independent later reading, not a replay.
- Full stdout + trailer: `close/ReRunCounter48-2-receipt.txt`.

## Kill-rule standing

C1 requires the L1 score run plus every committed wave re-run (≥2) on the same commit to read
`held=4/4` exit 0. This re-run agrees with 4/4. Count of qualifying committed re-runs is the
closure's tally (ReRunCounterA + this seat, if both land); a disagreeing reading here would have
been reported verbatim — there is none.
