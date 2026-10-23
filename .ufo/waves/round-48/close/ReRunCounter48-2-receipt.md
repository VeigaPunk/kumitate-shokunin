# ReRunCounter48-2 — C1 kill-rule re-run, run 2 of 2 (seat kumitate-r48-close-ReRunCounterB-2)

Item: ReRunCounterB — identical procedure to ReRunCounterA, independently timed; single invocation, reading taken as measured, no re-run, no amendment.

## Identity

- Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, HEAD at run time `ce9aee5daf71004a5890134f9526cc6fe424b206` (C1+C2 candidate, lane tip; verified `git rev-parse HEAD` immediately before the run). All git read-only (`--no-optional-locks`); no jj commands; no sandbox clone needed (the counter archives the rev itself).
- Command: `TMPDIR=/tmp node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> ce9aee5daf71004a5890134f9526cc6fe424b206 --set r48` — the frozen kill-rule command, unmodified.
- Counter provenance: working-tree counter sha256 `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59` = the A48 pre-data amendment committed in `ce9aee5` (`rule=F48+A48`, summary-corroboration clause). Freeze counter at `fe3d45b` verified `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, matching plan.md. A48 is pre-data per the attempt-2 addendum; no post-score amendment occurred.
- Base: `f00cf278a5ab57e87b18418fc972be9f893f65da` (counter-internal, echoed in the summary line).

## Reading (as measured)

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48+A48
exit=0
```

| site | gate | label | capped/n (3 runs) | base_n | cases | uncapped_direct |
|---|---|---|---|---|---|---|
| RG742 | round-gate | ROUTED_HELD | 116/116 ×3 | 116 | 61/61 ×3 (base 61/61) | 0,0,0 |
| SP491 | surface-probe | ROUTED_HELD | 2/2 ×3 | 2 | 46/46 ×3 (base 46/46) | 0,0,0 |
| SP519 | surface-probe | ROUTED_HELD | 2/2 ×3 | 2 | 46/46 ×3 (base 46/46) | 0,0,0 |
| SP1592 | surface-probe | ROUTED_HELD | 14/14 ×3 | 14 | 46/46 ×3 (base 46/46) | 0,0,0 |

Predicate conjuncts, as observable from the counter's output: all 8 gate runs exit 0, `verdict_pass=true`, `fail_lines=0`; no `CAPROUTE48: ERROR` line and no exit 2 (trace parsed completely, no unparsed/unresumed records, no PID reuse); every SITE line is `ROUTED_HELD` with `capped/n = n/n` per run (site child exec counts equal the base run's, chain cap-run → systemd-run --scope with MemorySwapMax=0/MemoryMax≤1024M/TasksMax≤256 → bwrap --unshare-pid --clearenv --die-with-parent present, no canary in the child env — the counter emits the corresponding `reason=` tokens when any of these fail, and none appear); `uncapped_direct=0` everywhere; no `execveat` token (any successful execveat forces exit 2/a reason); A48 corroboration holds (no `summary_uncorroborated` token).

## Timing (independence record)

- This run: start 2026-10-23T18:59:23Z (15:59:23 -03), end 19:00:37Z, load1 23.52 → 26.60, wall 74.4 s.
- L1 authoritative score (`r48/L1-score-ce9aee5d.txt`): start 18:52:59Z, load1_start 38.08, `held=4/4` exit 0, same counter sha — ~6.5 min earlier, heavier load.
- ReRunCounterA run 1 of 2 (`close/ReRunCounter48-1-receipt.txt`): start 2026-10-23T15:59:23.442168 -03 — the same second as this run, load1_start identical (23.52). The two re-runs were dispatched concurrently, not staggered; they are separate counter invocations (independent `git archive` trees, independent random canary/session ids, no shared state). Recorded verbatim; not re-run.

## Kill-rule status

L1 score 4/4 exit 0 + run 1/2 4/4 exit 0 + run 2/2 (this receipt) 4/4 exit 0, all at `ce9aee5daf71004a5890134f9526cc6fe424b206`, all with counter sha `3ed305f2…`, rule `F48+A48`. No run read exit 1; no exit 2 occurred. My reading agrees with 4/4 — no disagreement finding to report. C1 kill-rule aggregation is the L1's call.

## Notes / bounds

- Scratch: the frozen counter hardcodes `SCRATCH=/fast/scratch/hyaku/kumitate-r48/probe-runs` (wave-a path); it creates and removes its per-run `git archive` trees there itself. That transient instrument-internal scratch is the only path touched outside this seat's declared write bounds; the counter was not amended to redirect it.
- No pacman transactions, no services restarted, no tool installs (none needed).
- Observation, not gated by the predicate: RUN-line total exec counts vary across invocations (surface-probe base execs 54 here and in `stab-r48-*`, 102 in run 1/2; rev 180 here and in the L1 score, 228 in run 1/2 — fixture/system-tool traffic, e.g. git/mkfifo/systemctl, which the judge excludes from site counts). The predicate requires within-run site-exec-count equality against the same invocation's base, which held in all three receipts.
