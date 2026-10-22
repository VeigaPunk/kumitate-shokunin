RESULT ExecGateIsolation rev=7c89dd64d8f12e5f9c91ac9281c11ec836c21993 verdict=PASS isolation_killed=4/4 k43_killed=7/7 leak_fixed=yes selftest=41/41 patch_sha256=fb08a037e320e7d89b6679de41ecb3229066eb9915aa1f219615685616e673bd
Axes: operability, mutation coverage, and recovery after forced termination.
Lane base: e5ffcbe7f155b89cb1870f9da7b0d671d092948b.
Changed implementation file: scripts/gate-mutants.mjs in the private scratch clone; the report is the only final lane change.
Scope disclosure: an initial edit was mistakenly applied to the lane script, then restored; its post-restore read returned the original snapshot tag 9C7A. No lane commit was made.
Behavior: temp directories record owner PID and process start time; the next temp allocation sweeps only marked, owner-only gate directories whose owner identity is gone. Each selftest child checks that the gate remains an ancestor and kills its whole process group if not.
Changed functions: processStartTime (new), sweepStaleTempDirs (new), makeTempDir, runSelftestFile, selftestTargetSource, runSelftest.
Frozen K43 functions evaluable, killedOnce, classifyMutant, confirmKill, failNames, and gateExitCode are unchanged. Control re-run loop, MANIFEST, FROZEN_IDS, CONTRACT, and default temp parent are unchanged.
Patch: /fast/scratch/hyaku/kumitate-r43/seats/ExecGateIsolation/ExecGateIsolation.patch
Patch SHA-256: fb08a037e320e7d89b6679de41ecb3229066eb9915aa1f219615685616e673bd.
No tools installed or updated. LSP unavailable: this seat exposes no LSP tool endpoint.
Selftest command used for the pristine run and every single-mutant falsifier:
KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/seats/ExecGateIsolation/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node /fast/scratch/hyaku/kumitate-r43/seats/ExecGateIsolation/lane/scripts/gate-mutants.mjs --selftest
Final pristine output: GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0; VERDICT: PASS; exit=0.
After runs: pgrep found no matching process; the private gm-tmp parent had no entries.
Isolation mutant, process cap >16 changed to >160: FAIL process-cap-kills-overfull-group; 33/34 pass; VERDICT: FAIL; exit=1.
Isolation mutant, RSS cap 512*1024 changed to 512*1024*1024: FAIL rss-cap-kills-overfull-group; 33/34 pass; VERDICT: FAIL; exit=1.
Isolation mutant, --end-of-options removed: FAIL git-revision-end-of-options; 33/34 pass; VERDICT: FAIL; exit=1.
Isolation mutant, leading-dash revision guard removed: FAIL single-dash-revision-rejected; 33/34 pass; VERDICT: FAIL; exit=1.
Leak falsifier, parent guard preload removed: FAIL dead-parent-kills-process-group; 33/34 pass; VERDICT: FAIL; exit=1.
Leak falsifier, stale-owner sweep removed: FAIL dead-owner-temp-dir-reaped; 33/34 pass; VERDICT: FAIL; exit=1.
K43 mutant m01, timeout predicate disabled: FAIL k43-evaluable-rejects-timeout; 40/41 pass; VERDICT: FAIL; exit=1.
K43 mutant m02, overflow predicate disabled: FAIL k43-evaluable-rejects-overflow; 40/41 pass; VERDICT: FAIL; exit=1.
K43 mutant m03, group-clean predicate forced true: FAIL k43-evaluable-rejects-live-group; 40/41 pass; VERDICT: FAIL; exit=1.
K43 mutant m04, control total comparison removed: FAIL k43-evaluable-requires-control-total; 40/41 pass; VERDICT: FAIL; exit=1.
K43 mutant m11, fail-name sort changed to reverse: FAIL k43-fail-names-ignore-output-order; 40/41 pass; VERDICT: FAIL; exit=1.
K43 mutant m12, after.pass changed to after: FAIL failed-control-after-adds-integrity-error; 40/41 pass; VERDICT: FAIL; exit=1.
K43 mutant m13, unstable changed to survived in invalid states: FAIL k43-unstable-is-invalid-before-survivor; 40/41 pass; VERDICT: FAIL; exit=1.
Risks: stale directories are removed on the next temp allocation, not immediately after SIGKILL. Unmarked or malformed directories are deliberately left untouched. The recovery path relies on Linux /proc, already used by this gate.
Blockers: none. The full mutation gate was not run; the parent owns post-integration gates.