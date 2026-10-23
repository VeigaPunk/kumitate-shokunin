# Round-50 residual closure — RevCloseHarm (harm seat)

- Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
- Measured rev (HEAD): `ab3c64e9aaaff80faf3a2c93743287e44def4084` (verified)
- Freeze baseline: `.ufo/waves/round-50/controls/H1-freeze-5b0de268.txt` → `CHECKLIST: 20/22`, `VERDICT: FAIL`, exit 1; FAILs at SKILL.md:693 and SKILL.md:697.
- All harnesses executed read-only in the lane checkout; tree left clean except the designated report dir (`?? .ufo/waves/round-50/close/`).

## Harness table

| Probe | Command | Final verdict line | Exit | Declared rule | Result |
|---|---|---|---|---|---|
| H1 | `node scripts/surface-probe.mjs --checklists` | `CHECKLIST: 22/22 pass` · `VERDICT: PASS` | 0 | Freeze receipt 20/22 with FAILs {693, 697}; closure requires no regression vs baseline | PASS (22/22, zero FAILs) |
| H2 | `node scripts/cap-run.mjs --selftest` | `CAP_RUN_SELFTEST: 12/12 pass` · `VERDICT: PASS` | 0 | exit 0 + `VERDICT: PASS` | PASS |
| H2 | `node scripts/bind-oracle.mjs --selftest` | `BIND_ORACLE_SELFTEST: 7/7 pass` · `VERDICT: PASS` | 0 | exit 0 + `VERDICT: PASS` | PASS |
| H2 | `node scripts/counter-rerun.mjs --selftest` | `COUNTER_RERUN_SELFTEST: PASS` | 0 | exit 0 + selftest PASS | PASS |
| H3 | `node scripts/proxy-check.mjs --strict` | `PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=114/114 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` | 0 | strict recompute `MATCH`, exit 0 | PASS |
| H4 | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | `kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` | 0 | exit 0 + `ok` row | PASS (4 non-fatal `W04` warnings, see notes) |
| H5 | `node scripts/round-gate.mjs --selftest` | `ROUND_GATE_SELFTEST: 61/61 pass` · `VERDICT: PASS` | 0 | exit 0 + `VERDICT: PASS` | PASS |

## H1 item-by-item vs freeze receipt

Canonical serial run at the measured rev: **`CHECKLIST: 22/22 pass`, `VERDICT: PASS`, exit 0. FAIL items: none.**

| Item | Freeze | Now | Delta |
|---|---|---|---|
| 686–692 | PASS | PASS | unchanged |
| 693 Proxy recompute (`--strict`) | **FAIL** exit=1 (`A_DRIFT` declared=38 computed=43; `C2_DRIFT` +2; `C2_TOTAL_DRIFT` +4; `AXES_DRIFT` 10→9; `PIN_UNPINNED scripts/bind-oracle.mjs`) | **PASS** exit=0 | repaired — corroborated by H3 `MATCH`, `pins=6 match` |
| 694–696 | PASS | PASS | unchanged |
| 697 Sources-registry gate | **FAIL** exit=1 (`ENTRY_HEADER_REQUIRED corpus/knowledge/counter-amendment-discipline.md:1`; `LEGACY_NO_HEADER count=38`) | **PASS** exit=0 | repaired |
| 698–702 | PASS | PASS | unchanged |
| 703 Gate-mutants battery | PASS (wall=45.195) | **PASS** exit=0 serially; `frozen=41/41` | unchanged — see transient note |
| 704–707 | PASS | PASS | unchanged |

Net vs freeze: +2 (both frozen FAILs repaired, no regressed items in the canonical serial measurement).

## Transient observation (not a lane defect)

The first `--checklists` run was launched inside a 7-process parallel batch (cap-run OOM/budget arms, round-gate 61-fixture suite, etc.; observed `load1` ≈10). In that run item 703 reported `exit=2` with `GATE_MUTANTS: ERROR (mutants=43 killed=39 frozen=37/41 … unstable=4 …)`. Every printed `MUTANT` line showed `killed`/`confirm=same`, both `CONTROL_AFTER` passed, and `leftovers=0`. Rerunning the battery standalone and then the full checklist serially each produced `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 … rev=working-copy)` and `CHECKLIST: 22/22`. The K43 confirm-rerun is load-sensitive: under heavy concurrent pressure a killed-in-one-pass mutant can classify `unstable`. Residual risk for future parallel wave execution; the receipt tail (`CHECKLIST_TAIL_LINES=8`) did not preserve the 4 unstable mutant names.

## Notes

- H4 emitted four `W04 duplicate url … across scopes` warnings (`S034` stryker-mutator.io, `S068` github.com/can1357/oh-my-pi, `S084` infection.github.io, `S095` raw.githubusercontent.com/containers/bubblewrap) but still `ok` + exit 0 — warning-level drift only, declared rule satisfied.
- H1 item 686 stays `exit=1 expected=0|1` — an allowed verdict arm, unchanged from freeze.
- Tooling: no installs performed; host `pacman` remains paused per the operator gate.

VERDICT: HOLD
