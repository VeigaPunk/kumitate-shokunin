RESULT MutGateIsolationNew rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=gaps mutants=12 survived=4

Scope: new isolation/sweep/guard code in `scripts/gate-mutants.mjs` at 84cb1d5 (diff vs e5ffcbe7:
`OWNER_MARKER`, `processStartTime`, `sweepStaleTempDirs`, the `makeTempDir` owner marker, the
`runSelftestFile` parent-guard block, the `process-overflow`/`rss-overflow` fixtures). K43
functions (`evaluable`, `confirmKill`, `failNames`, `gateExitCode`) not mutated. Detector: the
gate's own `--selftest` (41 cases). KILLED = mutated selftest exits non-zero or prints
`VERDICT: FAIL`; SURVIVED = still 41/41 and `VERDICT: PASS`.
Scratch: `/fast/scratch/hyaku/kumitate-r43/seats/MutGateIsolationNew/lane` (detached 84cb1d5).
Pristine bytes sha256 `177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717` (equal
to the lane file at 84cb1d5); each mutant applied to a copy, exact pristine bytes restored after
every run (12/12 restores hashed equal to pristine; per-mutant outputs in seat dir `runs/*.txt`).
Run command (each): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout
-s KILL 600 node <mutant> --selftest` with `KUMITATE_GATE_MUTANTS_TMP` = seat `gm-tmp` (0700,
owner vgpnk). No tool installs. No leftover processes; `gm-tmp` empty at end.

Baseline (pristine 84cb1d5 `--selftest`): `GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0`,
`VERDICT: PASS`, exit 0, 1.2 s.

| id | literal changed | selftest | verdict |
|---|---|---|---|
| m01 | sweep prefix `'kumitate-gate-'`->`'kumitate-gateX-'` | 40/41 FAIL `dead-owner-temp-dir-reaped` | KILLED |
| m02 | sweep dir mode `0o700`->`0o750` | 40/41 FAIL `dead-owner-temp-dir-reaped` | KILLED |
| m03 | sweep marker mode `0o600`->`0o644` | 40/41 FAIL `dead-owner-temp-dir-reaped` | KILLED |
| m04 | marker regex `\n$` dropped | 40/41 FAIL `dead-owner-temp-dir-reaped` | KILLED |
| m05 | sweep pid floor `pid < 1`->`pid < 2` | 41/41 PASS | **SURVIVED** |
| m06 | `processStartTime` `fields[19]`->`fields[18]` | 30/41 FAIL (11 cases) | KILLED |
| m07 | guard walk `depth < 32`->`depth < 1` | 41/41 PASS | **SURVIVED** |
| m08 | guard interval `50`->`5000` ms | 41/41 PASS | **SURVIVED** |
| m09 | guard signal `SIGKILL`->`SIGTERM` | 40/41 FAIL `dead-parent-kills-process-group` | KILLED |
| m10 | overflow fixture children `24`->`4` | 40/41 FAIL `process-cap-kills-overfull-group` | KILLED |
| m11 | rss fixture `560`->`64` MB | 40/41 FAIL `rss-cap-kills-overfull-group` | KILLED |
| m12 | `OWNER_MARKER` `...-owner`->`...-ownerx` | 41/41 PASS | **SURVIVED** |

Survivors. m12 is an equivalent mutant, not a gap: the marker name is one constant shared by the
writer, the sweeper and the selftest's dead-owner probe, so a consistent rename preserves
behaviour and no test can distinguish it. m05 is a real untested literal: the dead-owner probe
writes `pid = pid_max + 1`, so the floor boundary is never probed; a marker `pid=1 start=999999`
has live init start `8`, so the pristine floor reaps that directory while the mutant floor
(`pid < 2`) keeps it forever (probe `pid1-probe.mjs`). m07 is a real untested literal: the guard
walks up to 32 ancestors for the owner pid, but under the current topology the owner is the
guard node's direct parent, so depth 1 suffices and the selftest cannot see the difference; the
mutant guard breaks once the owner is a grandparent, and no case has the owner above the direct
parent. m08 is a real untested literal, masked by a redundant second trigger: the guard fires
both synchronously at load and on a 50 ms interval. Supplementary probes on the same harness:
interval `50`->`600000` ms SURVIVED; deleting the synchronous call SURVIVED; deleting BOTH
KILLED (40/41, `dead-parent-kills-process-group`); walk `depth += 1`->`depth += 2` SURVIVED;
sweep live-check inverted (`===`->`!==`) KILLED but via `selftest-harness-exception` rather than
a clean case failure; sweep directory owner check dropped SURVIVED (41/41), so no case covers a
directory owned by another user.

Coverage gaps found (no contract change proposed; the gate's own selftest is the detector):
(1) the sweep pid floor is never probed at its boundary (m05) - a selftest case with marker
`pid=1` would kill it; (2) the guard ancestor-walk depth is never exercised beyond the direct
parent (m07); (3) the guard reaper period is unpinned and the two triggers are redundant (m08):
the dead-parent case passes with a 600 s interval and passes with only the interval trigger;
(4) the sweep directory owner check is not covered.

Per the round contract K43 and the frozen counter are untouched: no lane source file was
modified, and the frozen counter bytes
`e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a` were not run or edited here.
