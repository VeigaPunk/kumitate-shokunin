RESULT ReRunCensusSelftestTime verdict=PASS census_ms_E=2756 census_ms_M=2550 gate_ms_E=593 gate_ms_M=1019

Item: measure `node scripts/wave-census.mjs --selftest` and `node scripts/gate-mutants.mjs --selftest` wall time, 5 interleaved runs each, at base e5ffcbe7f155b89cb1870f9da7b0d671d092948b and measured 84cb1d5d8e703aafd4f73d887ba4237692ff13f9.

Clones (scratch, GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE unset): `git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/lane` then `git -C lane checkout -q --detach 84cb1d5d…` (measured) and `git -C lane worktree add -q --detach <scratch>/lane-e e5ffcbe7…` (base). Verified heads: measured `84cb1d5d8e703aafd4f73d887ba4237692ff13f9`, base `e5ffcbe7f155b89cb1870f9da7b0d671d092948b`.

Each of the 20 runs: `( cd <clone> && TMPDIR=<scratch>/tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node scripts/<script> --selftest )`, wall ms from `date +%s%N` before/after. Order per iteration i=1..5: censusE, censusM, gateE, gateM. All 20 runs exit 0 (selftest passes at both revs).

Observed ms (rc=0 all):
censusE: 2756 2607 2407 2839 3486 -> median 2756, min 2407, max 3486
censusM: 2550 2393 2456 2927 3558 -> median 2550, min 2393, max 3558
gateE:   543 512 593 656 650 -> median 593, min 512, max 656
gateM:   891 862 1019 1290 1041 -> median 1019, min 862, max 1290

Readings: wave-census selftest median is comparable at the two revs (2756 ms vs 2550 ms; spread 2407-3486 vs 2393-3558). Gate-mutants selftest median is higher at the measured rev (1019 ms vs 593 ms; spread 862-1290 vs 512-656), consistent with the measured rev adding the second-verdict-path fixtures and the control re-run (diff stat: gate-mutants.mjs +162/-10, wave-census.mjs +31/-9). Both changes are sub-2s medians; no timeout/overflow, all runs clean exit 0.

Host safety: every run bounded by systemd-run 4G/128/t600; after the loop `pgrep -af <scratch>` found no leftover processes; `TMPDIR` temp dir was empty and removed. No tools installed (node v24.21.0 already present; no pacman/npm/uv actions).
