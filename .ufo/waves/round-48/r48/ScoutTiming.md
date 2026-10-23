# ScoutTiming — routed-cost risk for H1

Seat `ScoutTiming`. Unrouted tree only: sandbox clone `/fast/scratch/hyaku/kumitate-r48a/seats/ScoutTiming/lane` detached at `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (confirmed `git rev-parse HEAD`). Node v24.21.0, nproc 32. No tools installed. Raw log: `.ufo/waves/round-48/r48/ScoutTiming-raw.txt`.

## Measured (this seat)

Wall is `date +%s%N` around the process. `load1` is `/proc/loadavg` field 1 at start and end. Host load before the batch: `14.42 4.53 1.91`. After: `57.42 29.62 12.20` (the climb is during the checklist, not during the two selftests).

| run | command | exit | wall_s | load1 start → end | suite |
|---|---|---:|---:|---|---|
| round-gate-1 | `node scripts/round-gate.mjs --selftest` | 0 | 6.336 | 14.42 → 17.71 | `ROUND_GATE_SELFTEST: 61/61 pass` / `VERDICT: PASS` |
| round-gate-2 | same | 0 | 5.409 | 17.71 → 17.98 | same 61/61 |
| surface-probe-1 | `node scripts/surface-probe.mjs --selftest` | 0 | 0.816 | 17.98 → 17.98 | `46/46 cases passed` / `VERDICT: PASS` |
| surface-probe-2 | same | 0 | 0.841 | 17.98 → 17.98 | same 46/46 |
| checklists-1 | `node scripts/surface-probe.mjs --checklists` | 1 | 179.353 | 17.98 → 57.42 | `CHECKLIST: 18/22 pass` / `VERDICT: FAIL` |

UTC window: 2026-10-23T18:24:19Z → 18:27:32Z. The checklist's own copies of the two selftests (items below) match the dedicated runs, so the numbers are three samples, not one.

## Budget the items are judged against

`SKILL.md` `## Verifiable checklist` items are the 22 `- [ ]` lines at `SKILL.md:680-701`. The file does not write "120s". The 120s/item budget is the harness constant `CHECKLIST_TIMEOUT_MS = 120_000` at `scripts/surface-probe.mjs:249`, applied per item at `:1049-1050` (`spawnSync('bash', ['-c', item.command], { timeout })`). A kill leaves `exit=null` and `substring=miss` (observed on item 697).

Child timeouts, separate from the item budget: `runGate` `scripts/round-gate.mjs:742-743` is 120s per child; `readSightingSurface` / `readDispatcherStatus` use `SPAWN_TIMEOUT_MS = 20_000` (`surface-probe.mjs:248,491-494,519-522`); `spawnSelf` is 120s (`surface-probe.mjs:1592-1593`).

## Checklist items (one run)

`load1` on these lines is `os.loadavg()[0]` at item start (`surface-probe.mjs:1048`).

| SKILL.md | wall_s | load1 | result | absorbs C1 routing? |
|---:|---:|---:|---|---|
| 680 cite-check | 1.935 | 17.98 | PASS exit 1 | no |
| 681 cite-check --selftest | 1.272 | 18.94 | PASS | no (not claimed) |
| 682 live surface `--known` | 0.116 | 18.94 | PASS | yes, 2 live spawns (below) |
| 683 surface-probe --selftest | 0.882 | 18.94 | PASS | yes, the surface-probe selftest |
| 684 round-gate --selftest | 6.578 | 18.94 | PASS | yes, the round-gate selftest |
| 685 round-gate (bare) | 0.033 | 22.07 | FAIL exit 2 | no — `runGate` is only the selftest helper |
| 686 round-gate --tracked | 0.026 | 22.07 | FAIL exit 2 | no, same |
| 687 proxy-check --strict | 0.204 | 22.07 | FAIL exit 1 | no |
| 688 proxy-check --selftest | 11.901 | 22.07 | PASS | no (not claimed) |
| 689 claims-check | 0.112 | 29.86 | PASS | already routed in round 47, not a new C1 site |
| 690 kimi-census | 0.043 | 29.86 | PASS | same |
| 691 sources-check | 0.048 | 29.86 | PASS | same |
| 692 sources-check --selftest | 5.448 | 29.86 | PASS | same — this wall is already the routed cost |
| 693 anchor-truth | 1.293 | 33.07 | PASS | same |
| 694 anchor-truth --selftest | 14.296 | 33.07 | PASS | same — slowest PASS, already routed |
| 695 wave-census --round 40 | 0.065 | 35.42 | PASS | no |
| 696 wave-census --selftest | 4.782 | 35.42 | PASS | no |
| 697 gate-mutants | 120.093 | 37.15 | FAIL exit=null | no — harness timeout, outside the C1 set |
| 698 gate-mutants --selftest | 1.135 | 56.53 | PASS | no |
| 699 omp-census | 0.030 | 56.53 | PASS | no |
| 700 omp-census --selftest | 0.083 | 56.53 | PASS | no |
| 701 cap-run --selftest | 8.949 | 56.53 | PASS | no — the runner's own suite, already scoped |

685/686 are `REPORTS_DIR_MISSING` in 30ms (sandbox has no `.ufo/reports`; same class as `build/checklist-base-1.txt`). 687 is the pre-existing proxy drift (`A_DRIFT +1`, `C2_TOTAL_DRIFT +1`, `AXES_DRIFT` coverage 10→9), not a timeout. 697 is the item already sitting on the 120s budget.

## What C1 actually multiplies

Frozen plan table (not re-straced here): per owning `--selftest`, RG742 `runGate` 116 execs, SP491 2, SP519 2, SP1592 14. Cost class, quoted, `SCORECARD.md:2091`: "selftests of the four routed gates take about 2–4× longer (one scope per child)." That sentence is round 47's five sites. At this tip those sites are already routed, so 689–694 and 701 are not multiplied again. C1 adds scopes only on the four sites above.

Observed call shape (`surface-probe.mjs`): `probeConformance` calls `readers.sighting` once (`:555`) and `readers.dispatcher` once (`:601`). Item 682 therefore gains 2 scopes (SP491 + SP519), each under the 20s spawn timeout, not 18. `spawnSelf` (SP1592) and `runGate` (RG742) are selftest-only, so they land on items 683 and 684. Bare `round-gate` / `--tracked` do not call `runGate`.

## Projection vs 120s

2× and 4× of the measured walls (the SCORECARD class, applied to this seat's numbers):

| item | measured | ×2 | ×4 | ×4 / 120s | × to hit 120s |
|---|---:|---:|---:|---:|---:|
| 684 round-gate --selftest | 5.409–6.578 (dedicated 6.336 / 5.409; checklist 6.578) | 10.8–13.2 | 21.6–26.3 | 0.22 | 18.2× on 6.578 |
| 683 surface-probe --selftest | 0.816–0.882 | 1.6–1.8 | 3.3–3.5 | 0.03 | 136× |
| 682 live surface | 0.116 | 0.23 | 0.46 | 0.004 | ~1000× |

No newly routed item reaches the 120s item budget at the top of the 2–4× class. The worst projected wall is item 684 at about 26s, leaving ~94s. The 120s `runGate` / `spawnSelf` child timeouts are not approached either: 116 children finish in ~6s (mean well under 100ms if they are sequential), so even a child that were half the suite would be ~12s at 4×, against a 120s child cap. SP491/SP519's cap is 20s; item 682 is 0.116s today.

Per-scope cross-check, **[INFERENCE]**, not a new measurement. Round 47 `ExecRouteSources.md` sources-check `--selftest`: 0.975/0.969/1.003s before routing, 4.373/4.358/4.457s after (means 0.982s → 4.396s, +3.414s) with plan/probe child counts SC549 n=42 and SC859 n=1 in that same selftest → ~79ms/scope. Applied additively here: 116×79ms ≈ +9.2s → item 684 ≈ 6.6+9.2 = **15.8s (2.4×)**; 18×79ms ≈ +1.4s → item 683 ≈ **2.3s (2.6×)**. Both sit inside the 2–4× band and far under 120s. Reaching 120s on item 684 would need ~0.98s of extra cost per new scope, about 12× that round-47 observation.

## Items most at risk

1. **SKILL.md:684 Round-gate hermetic suite** — the only C1 item with a double-digit base (6.6s) and the only one with a large new scope count (116). Still the one to watch under H1, and still not close: projected 11–26s (class) or ~16s (per-scope inference) against 120s. An H1 timing miss (base PASS, C1 fail) would require the harness to kill it at 120s. These numbers do not indicate that.
2. **SKILL.md:683 Surface-probe hermetic suite** — 18 new scopes, base 0.8–0.9s, projected under 4s. Not at risk of either the 120s item budget or the 20s live-reader timeout.
3. **SKILL.md:682 Live sighting** — 2 new scopes, base 0.116s, projected under 0.5s. Not at risk.

**Not a C1 routed-cost risk:** SKILL.md:697 gate-mutants, wall 120.093s, `exit=null`. It is already over the item budget at this unrouted tip (same shape as `build/checklist-base-1.txt` 120.168s). The plan does not route gate-mutants, cite-check, proxy-check, or wave-census. A C1-run fail of 697 is not "passed at base, failed after routing." Among PASS items, the slowest is 694 anchor-truth --selftest at 14.296s, and that suite is already on cap-run from round 47; 4× of it would still be ~57s, and that multiplier does not apply again.

## Confidence and gaps

- High on the five walls, exits, suite lines, and the checklist table (this run, raw log above).
- High that 684 is the most exposed new item and that 4× of today's walls stays under 120s.
- Medium on the ~79ms/scope figure: prior receipt plus frozen child counts, uniform and additive, not re-measured, and not taken at load1 50+.
- Not shown: the post-route wall itself (this seat did not apply the routing patch and did not run the counter). Not shown: per-child distribution inside the 6s, or scope-startup cost on this host while load1 is above ~50 (the selftests ran at 14–19; load1 57 was the checklist's end, after item 697).
