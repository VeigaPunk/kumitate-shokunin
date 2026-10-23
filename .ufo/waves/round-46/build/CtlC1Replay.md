RESULT CtlC1Replay rev=516977af verdict=meets replay=0/3 replay_with_launches=3/3
Axis: operability. Pre-data control only; no C1 candidate implementation or C2 counter scored.
Frozen starting revision: 516977af2216b1cc426ee970d260dee53714bf4f. Scratch clone: /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f
Clone exit: 0. Every Git write was inside this isolated clone; the required report is the only lane write.
Environment for all runs: repository-locating names from git rev-parse --local-env-vars, plus GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE, unset; SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/runs.
Frozen detector: /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh; SHA256 before=after=3376c96fb6aeeb05d9ce812df2c1bfa37413c0f0d9fdb924ed446c1d774f7002.
Expected detector: the unmodified frozen counter, with held=3/3 and exit 0 as the target. Pure replay is expected to fail its git-launch requirement; the activity-padding variant tests whether launch counts distinguish real fixture work.
Clean capture cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane, rev=516977af2216b1cc426ee970d260dee53714bf4f; PATH prepends /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/measure-shim; CTL_C1_GIT_LOG selects the corresponding bounded launch-<tool>.txt file.
Measurement shim: append one line per PATH git launch (log-size guard 65536 bytes), then exec /usr/bin/git unchanged.
Clean command: PATH=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/measure-shim:$PATH CTL_C1_GIT_LOG=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/launch-cite-check.txt systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node scripts/cite-check.mjs --selftest
Clean output: cite-check PASS lines=75, git launches=111, final line VERDICT: PASS, exit=0; full stdout/stderr=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/clean-cite-check.out.
Stored transcript: scripts/ctl-c1-replay/cite-check.pass.txt; 9595 bytes; SHA256=325803cf76d9d81ad09aa5dd5c42a689854723faab4f5d7aa722e70754086f49; exact clean PASS lines followed by VERDICT: PASS.
Clean command: PATH=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/measure-shim:$PATH CTL_C1_GIT_LOG=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/launch-proxy-check.txt systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node scripts/proxy-check.mjs --selftest
Clean output: proxy-check PASS lines=121, git launches=12, final line VERDICT: PASS, exit=0; full stdout/stderr=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/clean-proxy-check.out.
Stored transcript: scripts/ctl-c1-replay/proxy-check.pass.txt; 21964 bytes; SHA256=f08de50a2e5ae5c6441ff27e395aa06d81f0015fa9b10c8e30e5ddfb0405d614; exact clean PASS lines followed by VERDICT: PASS.
Clean command: PATH=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/measure-shim:$PATH CTL_C1_GIT_LOG=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/launch-round-gate.txt systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=256 timeout -s KILL 900 node scripts/round-gate.mjs --selftest
Clean output: round-gate PASS lines=60, git launches=886, final line VERDICT: PASS, exit=0; full stdout/stderr=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/clean-round-gate.out.
Stored transcript: scripts/ctl-c1-replay/round-gate.pass.txt; 9574 bytes; SHA256=5b0a69a20df2eb4ef415433c5e7db6487135f40be7e38a72f5c825f84b5c8eee; exact clean PASS lines followed by VERDICT: PASS.
Replay mutant commit: 63a9665c63e206cd0ca3c80e79aa4829c143e468 (scratch branch CtlC1Replay-replay). At entry to each selfTest(), if process.env.GIT_DIR is truthy, read its stored transcript, print it, return 0 before creating any fixture or running any test.
Replay-with-launches commit: 9800b17ffc8fb70c4581c34c70ac21dd0cfa43a7 (scratch branch CtlC1Replay-with-launches). Same early return; first copy process.env, delete GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE, and spawnSync git --version with stdio ignored N times: cite-check=111, proxy-check=12, round-gate=886, exactly the measured clean launch counts.
pristine command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane): SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/runs systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
pristine exit=1; raw receipt=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/counter-pristine.out.
replay command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane): SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/runs systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane 63a9665c63e206cd0ca3c80e79aa4829c143e468
TOOL cite-check NOT_HELD(git_launches=0/111) cases clean=75 hostile=75 base=75 git=0/111
TOOL proxy-check NOT_HELD(git_launches=0/12) cases clean=121 hostile=121 base=121 git=0/12
TOOL round-gate NOT_HELD(git_launches=0/886) cases clean=60 hostile=60 base=60 git=0/886
GITENV_CANARY rev=63a9665c63e206cd0ca3c80e79aa4829c143e468 held=0/3
replay exit=1; raw receipt=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/counter-replay.out.
replay_with_launches command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane): SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/runs systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane 9800b17ffc8fb70c4581c34c70ac21dd0cfa43a7
TOOL cite-check CANARY_HELD cases clean=75 hostile=75 base=75 git=111/111
TOOL proxy-check CANARY_HELD cases clean=121 hostile=121 base=121 git=12/12
TOOL round-gate CANARY_HELD cases clean=60 hostile=60 base=60 git=886/886
GITENV_CANARY rev=9800b17ffc8fb70c4581c34c70ac21dd0cfa43a7 held=3/3
replay_with_launches exit=0; raw receipt=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/counter-replay_with_launches.out.
restored command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane): SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/runs systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
restored exit=1; raw receipt=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/counter-restored.out.
Control verdicts: replay=misses; replay_with_launches=meets. Overall meets means at least one assigned shortcut reached the frozen target, not that C1 was repaired.
Mutation finding: pure replay was rejected solely for missing git launches; it is not credited as killed because pristine failed. Padded replay survived the frozen detector while executing no selftest fixtures. Baseline-relative kill assessment is inconclusive (pristine and restored held=0/3).
SHA256 command at each state: sha256sum /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane/scripts/cite-check.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane/scripts/proxy-check.mjs /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane/scripts/round-gate.mjs (detector path additionally hashed before and after).
Pristine=restored SHA256 scripts/cite-check.mjs 115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8
Pristine=restored SHA256 scripts/proxy-check.mjs da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826
Pristine=restored SHA256 scripts/round-gate.mjs f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9
Replay SHA256 scripts/cite-check.mjs a26bd1e081e1325937311bcec00c19f8bf2d0340fa19061fa744c32682cf5715
Replay SHA256 scripts/proxy-check.mjs 8431881838fdb3936ad40d9ac7fdb0a2a83241c791dbf867820f3efbfb55d4f7
Replay SHA256 scripts/round-gate.mjs 69d9393dc118347563c8140aaf2972bd17b8dd1c5faf76c628dfe8acef729d81
Replay-with-launches SHA256 scripts/cite-check.mjs 9dd72138276cea4ac2306cadf4599760a74e5220628efa53c9e3ca2e03df4808
Replay-with-launches SHA256 scripts/proxy-check.mjs 38505004e9c96c1f8247666e648365fb8a63d3c912416bd9e5825abb5a5e8d5d
Replay-with-launches SHA256 scripts/round-gate.mjs 60f3706591ab22e06ee095a331e9538a9825366690aa3491d155b9507d8346c1
Restoration command (repository variables scrubbed): git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay/lane -c user.name=CtlC1Replay -c user.email=ctl-c1-replay@shokunin.local -c commit.gpgsign=false -c core.hooksPath=/dev/null checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f; exit=0. All three source SHA256 values match the pre-mutation bytes exactly.
Cleanup after every run: pgrep -af /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Replay returned exit 1, empty output; no process remained to kill. No background jobs started.
Safety: df -h /fast showed 204G available (75% used) before work; every clean selftest used the required 4G/256-task/900s wrapper and each counter the requested 8G/256-task/900s wrapper. Captured stdout/stderr each stayed below 1 MiB; largest stored transcript=21964 bytes.
Tools installed or updated: none. Frozen predicate/counter and lane implementation unchanged; only scoped report written in lane.
