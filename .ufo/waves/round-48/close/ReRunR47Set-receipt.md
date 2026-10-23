# ReRunR47Set — receipt (H2 harm rule)

- Round: kumitate 48; item ReRunR47Set; seat `kumitate-r48-close-ReRunR47Set-2`
- Date: 2026-10-23 (~19:01Z / 16:01 -03)
- Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; rev = C1 commit `ce9aee5daf71004a5890134f9526cc6fe424b206` (lane tip, verified `git rev-parse HEAD` = same)
- Counter: `.ufo/waves/round-48/probe/caproute48-probe.mjs` — sha256 `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59` (frozen, rule F48+A48)
- Command: `TMPDIR=/tmp timeout -k 10 2400 node …/caproute48-probe.mjs <lane> ce9aee5daf71004a5890134f9526cc6fe424b206 --set r47`

## Result

```
CAPROUTE48 rev=ce9aee5daf71004a5890134f9526cc6fe424b206 base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48+A48
```

Exit code **0** (captured `EXIT_CODE=0`). All five r47 sites read `ROUTED_HELD`:

| Site | Gate | capped/n (3 runs) | cases |
|---|---|---|---|
| K488 | kimi-census | 53/53 ×3 | 54/54 ×3 |
| SC549 | sources-check | 42/42 ×3 | 46/46 ×3 |
| SC859 | sources-check | 1/1 ×3 | 46/46 ×3 |
| CC879 | claims-check | 46/46 ×3 | 47/47 ×3 |
| AT802 | anchor-truth | 106/106 ×3 | 44/44 ×3 |

## H2 comparison

- Base stability at `f00cf278`: `held=5/5` ×3 (`probe/receipts/stab-r47-f00cf278-{1,2,3}.txt`; A48 re-score `r48/A48-stab-r47-f00cf278.txt` also 5/5).
- This run at the C1 commit `ce9aee5d`: `held=5/5` — matches. No site regressed; H2 holds.

## Freshness / integrity notes

- The probe performs `git archive` of `rev` into three per-run unique scratch trees (`/fast/scratch/hyaku/kumitate-r48/probe-runs/<rev12>-rev{k}-<rand4>`), runs each gate's `--selftest` under `strace -f` three times, then deletes the dirs.
- Per-gate resumed counts differ across the three runs (kimi 6/3/1, sources 5/3/4, claims 5/1/4, anchor 6/10/4) → three genuinely distinct traces, not a replay.
- Exec counts in rev runs equal base counts (427/352/393/1795) — no `exec_count_ne_base`, no `uncapped_direct`, no `fail_lines`, no `execveat`; all runs `verdict_pass=true`.
- Exit 2 (cannot evaluate) never scores; this run is exit 0, so it scores.

## Environment

- Wall ~107 s; load1 ≈ 22.9 → 29.4 (host `/proc/loadavg` samples; the current counter does not print its own load trailer).
- Command ran foreground; no background jobs spawned; no writes outside bounds (scratch is the probe's own frozen path).
