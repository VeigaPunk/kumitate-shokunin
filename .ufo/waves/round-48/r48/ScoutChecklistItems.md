# ScoutChecklistItems — H1 checklist budget table

Rev `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. `SKILL.md` blob `c8970f5b03e0b783c6a18de0e8951ea669f42584`. `scripts/surface-probe.mjs` blob `d5c43048c36051dadcbffcb1dbf698adebc8320c`. Worktree matches that commit for both files (`git diff --numstat HEAD` empty). `git diff f00cf278a5ab57e87b18418fc972be9f893f65da fe3d45bf -- SKILL.md scripts/` is empty, so this table is the plan's H1 base (`f00cf278`) and the freeze tip. A C1 commit that does not edit `SKILL.md` keeps these line numbers; if it does, join on `command`, not on line.

Extraction: `git grep -n -E '^\s*- \[' fe3d45bf -- SKILL.md` returns 22 lines, all 680-701, all unchecked `- [ ]`. Zero checked `- [x]`. Zero other checklist lines in that file. Each line matches frozen grammar `CHECKLIST_RE` (`scripts/surface-probe.mjs:277`); a Python transcription of that regex accepted 22/22 and rejected 0. The JS engine was not executed.

## Budget

There is no per-item budget in the GFM line. Every ran item gets the same wall budget:

- `CHECKLIST_TIMEOUT_MS = 120_000` at `scripts/surface-probe.mjs:249`.
- Applied once, at `runChecklistsMode` lines 1049-1050: `spawnSync('bash', ['-c', item.command], { cwd: opts.self, timeout: CHECKLIST_TIMEOUT_MS, maxBuffer: 8 MiB })`. Header line 128 states the same 120 s.
- A hit leaves `status === null` (Node `ETIMEDOUT`, default `SIGTERM`). Line 1054 requires `typeof run.status === 'number'` and membership in the item's exit set, so a budget hit is FAIL even if the expected substring was already printed. `maxBuffer` overflow is the same shape (`status` null) and is not a separate declared budget.
- Skips (command contains `--checklists`, or a checked box) spawn nothing and have no budget. None of these 22 skip. `CHECKLIST_SKIPPED` on the base receipts is 0.

Pass predicate (same function): exit status is in the declared set AND combined stdout+stderr contains the expected substring. Exit 2 is outside every set below, so a fail-closed tool fault is a checklist FAIL (`SKILL.md:703` calls exit 2 an environment fault; the harness still counts it).

`scripts/cap-spawn.mjs:28-39` (present at this rev, not yet used by the four sites) turns a passed `timeout` milliseconds into cap-run `--budget` of `timeout/1000` seconds and wraps the runner in `spawnSync` at `timeout + 10_000`. Omitted `timeout` defaults to `60_000` (`--budget 60`). `120_000` and `20_000` divide evenly. A route that forwards the existing timeout option keeps the inner ceilings below; a route that omits it tightens RG742 and SP1592 from 120 s to 60 s per child and loosens SP491/SP519 from 20 s to 60 s. The checklist item ceiling stays 120 s either way. BUDGET is returned as `status: null`, `signal: 'SIGTERM'`, `error.code: 'ETIMEDOUT'` (`cap-spawn.mjs:54-55`), which this harness already scores as FAIL.

## Table

Ordinal = line minus 679. The `## Verifiable checklist` prose at line 664 still says "Nineteen items (round 42)" and stops at items 18-19; the executable list is 22. Budget column is the harness budget. Inner ceiling is a child timeout inside that command that can fire first; a dash means no tighter single-child ceiling was found on that command's entry path. C1 sites are the four named in the plan (RG742, SP491, SP519, SP1592). RG742 is declared inside `selfTest` (`round-gate.mjs:705-743`), so items 685 and 686 do not call it.

| line | ord | command | exits | expect | budget | inner ceiling | C1 sites |
|---|---|---|---|---|---|---|---|
| 680 | 1 | `node scripts/cite-check.mjs` | {0, 1} | `CITE_CHECK:` | 120 s | — | none |
| 681 | 2 | `node scripts/cite-check.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 682 | 3 | `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json` | {0} | `SURFACE_PROBE: CLEAN` | 120 s | SP491 line 494 and SP519 line 522 each `SPAWN_TIMEOUT_MS` 20 s (line 248) | SP491, SP519 |
| 683 | 4 | `node scripts/surface-probe.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | SP491/SP519 20 s; each SP1592 `spawnSelf` 120 s (lines 1592-1593); nested direct `--selftest` (not a C1 site, SP1766) 180 s (lines 1766-1767), which cannot elapse under the 120 s item budget | SP491, SP519, SP1592 |
| 684 | 5 | `node scripts/round-gate.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | each RG742 `runGate` 120 s (lines 742-743); nested direct `--selftest` (not a C1 site, RG1409) 120 s (line 1412) | RG742 |
| 685 | 6 | `node scripts/round-gate.mjs` | {0} | `ROUND_GATE: CLEAN` | 120 s | git calls `GIT_TIMEOUT_MS` 20 s (lines 169, 213); not a C1 child | none |
| 686 | 7 | `node scripts/round-gate.mjs --tracked` | {0} | `ROUND_GATE: CLEAN` | 120 s | same 20 s git calls | none |
| 687 | 8 | `node scripts/proxy-check.mjs --strict` | {0} | `PROXY: MATCH` | 120 s | — | none |
| 688 | 9 | `node scripts/proxy-check.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 689 | 10 | `node scripts/claims-check.mjs` | {0} | `CLAIMS: MATCH` | 120 s | — | none |
| 690 | 11 | `node scripts/kimi-census.mjs` | {0} | `KIMI_CENSUS: CLEAN` | 120 s | — | none |
| 691 | 12 | `node scripts/sources-check.mjs` | {0} | `SOURCES_CHECK: CLEAN` | 120 s | — | none |
| 692 | 13 | `node scripts/sources-check.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 693 | 14 | `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` | {0} | `TRUTH: CLEAN` | 120 s | — | none |
| 694 | 15 | `node scripts/anchor-truth.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 695 | 16 | `node scripts/wave-census.mjs --round 40` | {0} | `WAVE_CENSUS: CLEAN` | 120 s | — | none |
| 696 | 17 | `node scripts/wave-census.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 697 | 18 | `node scripts/gate-mutants.mjs` | {0} | `frozen=41/41` | 120 s | per-mutant `TIMEOUT_MS = 60_000` (`gate-mutants.mjs:30`); the item budget fires first (below) | none (targets cite-check, wave-census) |
| 698 | 19 | `node scripts/gate-mutants.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 699 | 20 | `node scripts/omp-census.mjs` | {0} | `OMP_CENSUS: CLEAN` | 120 s | — | none |
| 700 | 21 | `node scripts/omp-census.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | — | none |
| 701 | 22 | `node scripts/cap-run.mjs --selftest` | {0} | `VERDICT: PASS` | 120 s | suite-internal spawns use 60 s (`cap-run.mjs:295`); not the item budget | none |

Only item 680 accepts an exit other than 0. Its set is {0, 1}, so `CITE_CHECK: DRIFT` with exit 1 still passes.

## H1 base side (read, not re-run)

Receipts `.ufo/waves/round-48/build/checklist-base-1.txt` and `checklist-base-2.txt`, both `CHECKLIST: 18/22 pass`, `VERDICT: FAIL`, exit 1, `CHECKLIST_SKIPPED: 0`. Run 1 `11:54:24Z-11:57:20Z` end load1 54.85. Run 2 `11:57:49Z-12:00:59Z` end load1 26.89. `ExecChecklistBase.md:1` attributes them to a detached clone of `fe3d45bf`. This seat did not re-execute `--checklists`.

H1 harm is an item that passes both base runs and fails in any C1 run (`plan.md` harm rule H1). Both-pass (the only rows that can be harm): 680, 681, 682, 683, 684, 688, 689, 690, 691, 692, 693, 694, 695, 696, 698, 699, 700, 701. Both-fail, flap 0: 685, 686, 687, 697. The attempt-2 addendum's "two FAILs" undercounts these receipts; there are four FAIL lines.

| line | run1 | wall1 | load1_1 | run2 | wall2 | load1_2 | slack to 120 s (slower run) |
|---|---|---|---|---|---|---|---|
| 680 | PASS exit 1 | 2.850 | 44.49 | PASS exit 1 | 4.583 | 57.21 | 115.4 s |
| 681 | PASS | 2.016 | 44.49 | PASS | 3.582 | 58.39 | 116.4 s |
| 682 | PASS | 0.199 | 45.09 | PASS | 0.410 | 58.39 | 119.6 s (inner 20 s slack about 19.6 s) |
| 683 | PASS | 1.279 | 45.09 | PASS | 2.021 | 58.39 | 118.0 s |
| 684 | PASS | 6.221 | 45.09 | PASS | 11.661 | 58.68 | 108.3 s |
| 685 | FAIL exit 2 | 0.032 | 44.44 | FAIL exit 2 | 0.088 | 59.04 | n/a — REPORTS_DIR_MISSING, substring miss |
| 686 | FAIL exit 2 | 0.025 | 44.44 | FAIL exit 2 | 0.055 | 59.04 | n/a — same |
| 687 | FAIL exit 1 | 0.153 | 44.44 | FAIL exit 1 | 0.238 | 59.04 | n/a — PROXY: DRIFT, substring miss |
| 688 | PASS | 8.756 | 44.44 | PASS | 14.310 | 59.04 | 105.7 s |
| 689 | PASS | 0.272 | 41.68 | PASS | 0.135 | 57.81 | 119.7 s |
| 690 | PASS | 0.025 | 41.68 | PASS | 0.031 | 57.81 | 120.0 s |
| 691 | PASS | 0.036 | 41.68 | PASS | 0.058 | 57.81 | 119.9 s |
| 692 | PASS | 3.810 | 41.68 | PASS | 4.710 | 57.81 | 115.3 s |
| 693 | PASS | 1.309 | 41.46 | PASS | 1.295 | 56.79 | 118.7 s |
| 694 | PASS | 13.693 | 41.46 | PASS | 14.089 | 56.79 | 105.9 s |
| 695 | PASS | 0.069 | 40.89 | PASS | 0.038 | 53.79 | 119.9 s |
| 696 | PASS | 4.343 | 40.89 | PASS | 3.127 | 53.79 | 115.7 s |
| 697 | FAIL exit null | 120.168 | 41.22 | FAIL exit null | 120.040 | 51.64 | 0 — harness kill, substring miss; not a battery verdict |
| 698 | PASS | 1.425 | 55.76 | PASS | 0.853 | 27.41 | 118.6 s |
| 699 | PASS | 0.040 | 55.76 | PASS | 0.025 | 27.41 | 120.0 s |
| 700 | PASS | 0.080 | 55.76 | PASS | 0.035 | 27.41 | 119.9 s |
| 701 | PASS | 9.136 | 55.76 | PASS | 7.778 | 27.41 | 110.9 s |

Items 683 and 684 are the routed selftests. Their slower base walls (2.021 s, 11.661 s) leave 118 s and 108 s under the item budget. Item 682's binding inner ceiling is 20 s per reader, not 120 s; its slower base wall is 0.410 s. Item 697 is already on the 120 s ceiling at load1 41-52, so a C1-run FAIL there is not new harm. Routing does not target it.

## Confidence and unknowns

- High: line set, commands, exit sets, substrings, the single 120 s harness budget, the timeout-to-status-null-to-FAIL rule, SKILL.md identical from `f00cf278` to `fe3d45bf`.
- High on the receipt walls and the 18/22 split, as file contents. Not re-measured this seat.
- Not measured here: C1-commit checklist walls, whether the landed route forwards `timeout` into `capSpawnSync` or drops it (the 60 s default), and whether item 697 still dies at 120 s on the tip. Those are the H1 tip runs.
- No tools installed.
