S8FIDELITY sections_touched=36 anchors_fixed=209 claims_reworded=35 clauses_removed=41 regressed_before=41 regressed_after=0 cite_errors_before=59 after=42
Metric scope: `anchors_fixed` counts re-anchored non-ok S8 member-section references, including 11 direct pinned corrections in `ufo-watchdog-repend.test.mjs` whose FID report marked them ok; `claims_reworded` counts changed claim wording, excluding line-count updates; `clauses_removed` counts report `gone` findings resolved by removing or replacing the stale claim/anchor.

## Files and scope

- Clone implementation: `/fast/scratch/kumitate-r35/w/ExecS8Fidelity/lane/corpus/knowledge/remaining-scripts-census.md` only. The population table's stale cells were corrected (`render-seat-tables.mjs` 123→121; `ufo-drills.mjs` 1726→1734); section size claims retain their original `964f443e` values as `was N @ 964f443e`.
- Patch: `/fast/scratch/kumitate-r35/w/ExecS8Fidelity.patch` (generated with `git -C .../lane diff 8a0246f9 -- corpus/knowledge/remaining-scripts-census.md`). It contains only the assigned note.
- Fidelity-runner copy: `/fast/scratch/kumitate-r35/w/ExecS8Fidelity/fidelity.mjs`. Its note root is the clone; its TSV sink is `/dev/null` so the supplied `ExecFidelitySweep/anchors.tsv` was not overwritten. Analysis logic and pinned source revisions are unchanged.
- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-35/build/ExecS8Fidelity.md`.

## Evidence and verification

- Source pin: `/fast/scratch/kumitate-r35/src` HEAD was `31c465f15669f744848bd9f5d56191c5085670f7`.
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8 --json`: `sections=60`; the only S8 finding is the expected `MEMBER_COUNT_DRIFT` (`declared 63 members, found 60 distinct sections`). The L1 owns the registry cell correction.
- `node scripts/cite-check.mjs --json`: `remaining-scripts-census.md` errors fell from 59 at commit `8a0246f9` to 42 after this change (17 fewer; acceptance is no increase).
- Fidelity sweep: the supplied pre-integration `anchors.tsv` has 41 `remaining-scripts-census.md` S-layer regressions (`hit964=1`, `hit31c=0`); the copied runner on the edited clone reports 0 regressions for that note. It reports 1 R-layer regression for `loop-driver.md`, outside this assignment.
- Pinned line-count comparison: all 60 population-table rows and all section size claims match `wc -l` at `31c465f1` (`stale=0`).
- Direct source re-reads covered proposed replacement lines and removed symbols. A mechanical cross-check also found the `render-seat-tables.mjs` `TARGETS` declaration at `:27` (not `:26` as the fidelity report states); the note now cites `:27`.
- LSP was unavailable: `read xd://lsp` returned `No such tool`; source evidence was checked with the pinned clone's file reads and `git show`-based sweep instead.
- No tools were installed. No build, lint, formatter, or test suite was run.

## S1–S7 note debt (non-ok anchor totals from the fidelity reports)

| Note | Non-ok anchors |
|---|---:|
| `failure-telemetry.md` | 11 |
| `live-surface-probe.md` | 18 |
| `native-trial-launch.md` | 40 |
| `ops-watchers.md` | 416 |
| `queue-and-claim.md` | 9 |
| `route-probe-cluster.md` | 65 |
| `route-resolution.md` | 9 |
| `sighting-wall.md` | 22 |
| `singleton-and-queue-ownership.md` | 9 |
| `successor-chain.md` | 1 |
| `swarm-wave-lifecycle.md` | 24 |
| `dispatch-shapes.md` | 0 |
| `kimi-modes-machinery.md` | 0 |
| `remaining-scripts-census.md` (S1–S7 member anchors) | 0 |
| **Total** | **624** |

## Risks and blockers

- The expected registry count remains 63 in this clone; L1 owns updating it to 60.
- The citation check still reports 42 per-file errors for this note, but that is below the baseline 59 and meets the no-increase criterion.
- No other blocker. The live lane and external substrates were not edited; the only advisory report write is the authorized report path above.
