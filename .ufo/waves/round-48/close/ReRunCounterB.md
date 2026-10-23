# ReRunCounterB — seat report (C1 kill-rule re-run 2 of 2)

## Result

**`held=4/4` runs=3 rule=F48+A48, exit 0** on `ce9aee5daf71004a5890134f9526cc6fe424b206` —
agrees with the L1 score (`r48/L1-score-ce9aee5d.txt`, same line, same sha256-tagged counter).
No disagreement with 4/4; nothing adverse to report verbatim.

Score line verbatim:

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
```

## Method

- Ran the frozen counter in place, exactly the kill-rule command
  (`node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> ce9aee5… --set r48`,
  `timeout -k 10 1800`, `TMPDIR=/tmp`), one invocation, 19:00:46Z–19:02:42Z UTC, load1 27.90→47.21.
- Counter sha256 `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59`, matching the
  L1 score receipt — instrument unmodified; `rule=F48+A48` confirms the post-A48 amended header.
- Exit 0 ⇒ this run is a qualifying score under the C1 kill rule (exit-2 runs are recorded, never
  scored; this was not one — every trace parsed, all 8 RUN lines `exit=0 verdict_pass=true fail_lines=0`).
- Writes: the counter's own ephemeral scratch under `/fast/scratch/hyaku/kumitate-r48/probe-runs`
  (hardcoded inside the frozen instrument, randomized per run, `rmSync`ed on exit — shared
  instrument space used identically by the L1 score and sibling re-runs); my deliverables are only
  the three `close/` files listed below. No clone was needed; no repo writes anywhere.

## Files

- `close/ReRunCounter48-2-receipt.txt` — counter stdout verbatim + exit/start/end/load/sha trailer.
- `close/ReRunCounter48-2.md` — held= line verbatim + provenance (the ReRunCounterA-pattern report).
- `close/ReRunCounterB.md` — this report.

## Note for closure

Cross-run consistency check (mine vs L1 score): identical `capped/n` tuples per site
(116/116, 2/2, 2/2, 14/14), identical rev exec totals (2120 round-gate, 180 surface-probe),
`uncapped_direct=0` everywhere; only `resumed=` counts differ (67/58/55 vs 26/23/24) — the
load-dependent record mix the counter is designed around, and both parse fail-closed clean.
