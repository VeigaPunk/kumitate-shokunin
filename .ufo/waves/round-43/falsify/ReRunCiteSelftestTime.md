RESULT ReRunCiteSelftestTime verdict=within-noise median_ms_E=1111 median_ms_M=1111

Item: measure `node scripts/cite-check.mjs --selftest` wall time, 5 runs interleaved, at
e5ffcbe7f155b89cb1870f9da7b0d671d092948b (E, round-41 base) and
84cb1d5d8e703aafd4f73d887ba4237692ff13f9 (M, measured). Scratch clones at
/fast/scratch/hyaku/kumitate-r43/seats/ReRunCiteSelftestTime/lane-E and lane-M, detached HEAD
verified with git rev-parse (both output the full target sha). Node v24.21.0.

Method (interleaved E M E M E M E M E M): for each run: `cd <clone>`;
`start=$(date +%s%N)`; `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128
timeout -s KILL 600 node scripts/cite-check.mjs --selftest > run.out 2>&1`; `rc=$?`;
`end=$(date +%s%N)`; `ms=$(( (end-start)/1000000 ))`; /proc/loadavg recorded before and after
every run. Same host, same wall-clock window, so both commits saw identical load conditions.

Observed wall ms (E): 1111, 1082, 1130, 1110, 1127 -> sorted [1082,1110,1111,1127,1130]:
median 1111, min 1082, max 1130, range 48.
Observed wall ms (M): 1138, 1108, 1134, 1061, 1111 -> sorted [1061,1108,1111,1134,1138]:
median 1111, min 1061, max 1138, range 77.
All 10 runs exited 0; every output ends `75/75 cases passed (hermetic)` and `VERDICT: PASS`.
Loadavg (1/5/15 min) during measurement: 7.68-8.86 / 17.82-17.90 / 28.43-28.57 on 32 cores
(host busy with concurrent round-43 seats; spread is host jitter).

Verdict: medians identical (1111 ms both), so within-noise, not slower. The round-41 cost trade
is measured on the same host and NOT deepened: same median; the M spread (77 ms) is slightly wider
than E (48 ms) but within the observed load noise across all 10 runs (max-min 77 ms, ~7% of
median).

Hygiene: pgrep -f ReRunCiteSelftestTime after the runs matched nothing; no processes left. No
tools installed (node was already present). Scratch temp only; report is the sole lane write.
