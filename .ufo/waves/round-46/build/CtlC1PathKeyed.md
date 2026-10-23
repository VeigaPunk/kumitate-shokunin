RESULT CtlC1PathKeyed rev=516977af verdict=meets noreader=0/3 pathkeyed_default=3/3 pathkeyed_altroot=0/3
Axes: operability; pre-data control sensitivity. Frozen tip: 516977af2216b1cc426ee970d260dee53714bf4f.
Finding: the path-keyed shortcut meets the frozen default-root counter; moving SCRATCH_ROOT exposes it. This is a coverage finding, not a C1 repair.
Expected detector: reject absent readers and any Git launch inheriting the canary; path-keyed scrubbing should meet only at the default root.
No-reader mutant: delete the three scripts. Path-keyed mutant: add one three-line conditional at each selfTest entry, deleting GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE only when GIT_DIR starts with /fast/scratch/hyaku/kumitate-r46/runs; cite-check also requires opts.selfTest.
Build clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f
No-reader build: git rm -- scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs; git -c commit.gpgsign=false commit -qm 'Control C1: remove all three canary selftest readers'. Both exit 0; commit=6cb13bccabde816d718ebadfab160cba47663a51.
Path-keyed build after restoring base: git add -- scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs; git -c commit.gpgsign=false commit -qm 'Control C1: scrub Git locators only for default counter scratch path'. Both exit 0; commit=27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c.
Build commands run in /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane with repository-locating variable names returned by git rev-parse --local-env-vars cleared; local temporary Git identity set via GIT_CONFIG_COUNT.
Frozen counter SHA256 in lane and frozen clone: 3376c96fb6aeeb05d9ce812df2c1bfa37413c0f0d9fdb924ed446c1d774f7002 (identical). Counter was not edited.
Host preflight: df -h /fast -> /dev/nvme1n1p2 804G total, 600G used, 204G available, 75%. Every counter used the 8G/256-task/900s wrapper below; per-file RLIMIT_FSIZE=268435456 bytes.
Run: pristine; revision=516977af2216b1cc426ee970d260dee53714bf4f
$ systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit 1; elapsed 31.992 s.
Run: no-reader; revision=6cb13bccabde816d718ebadfab160cba47663a51
$ systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane 6cb13bccabde816d718ebadfab160cba47663a51
TOOL cite-check NOT_HELD(missing)
TOOL proxy-check NOT_HELD(missing)
TOOL round-gate NOT_HELD(missing)
GITENV_CANARY rev=6cb13bccabde816d718ebadfab160cba47663a51 held=0/3
Exit 1; elapsed 0.59 s.
Run: restored after no-reader; revision=516977af2216b1cc426ee970d260dee53714bf4f
$ systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit 1; elapsed 31.749 s.
Run: path-keyed default root; revision=27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c
$ systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane 27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c
TOOL cite-check CANARY_HELD cases clean=75 hostile=75 base=75 git=111/111
TOOL proxy-check CANARY_HELD cases clean=121 hostile=121 base=121 git=12/12
TOOL round-gate CANARY_HELD cases clean=60 hostile=60 base=60 git=886/886
GITENV_CANARY rev=27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c held=3/3
Exit 0; elapsed 36.676 s.
Run: path-keyed alternate root; revision=27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c
$ SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/alt systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane 27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=27099ddd7c4cc5bfdc6ec78812115fd2a6ab1c9c held=0/3
Exit 1; elapsed 33.761 s.
Run: restored after path-keyed; revision=516977af2216b1cc426ee970d260dee53714bf4f
$ systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit 1; elapsed 31.739 s.
Control verdicts: no-reader misses (0/3); path-keyed default meets/survives (3/3); path-keyed alternate root misses (0/3).
Mutation-regression verdict: inconclusive, not killed: pristine and both restored runs already miss at 0/3. The affirmative result is the directly observed default-root coverage hole and its alternate-root exposure.
Restoration command after each mutant: git checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f (exit 0 both times). Final HEAD restored to frozen tip; control commits retained under scratch-only control-no-reader and control-path-keyed refs.
Hashes from sha256sum before mutation, after path-keyed mutation and after both restorations:
scripts/cite-check.mjs: before=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8; path-keyed=74dc8b43ff76ad267323506324c49b091c9d8913a28e461021463627d25c637e; after each restore=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8; no-reader=missing.
scripts/proxy-check.mjs: before=da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826; path-keyed=4680830b522f673e57ecef2b39ed87b0cb5a12f70a8803f06c081306a3ca248d; after each restore=da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826; no-reader=missing.
scripts/round-gate.mjs: before=f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9; path-keyed=b29175a979e8c4c96a1b7e30d3025f34c55928551a49348b5db5809c8dad0b28; after each restore=f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9; no-reader=missing.
After every one of the six counter runs: pgrep -af /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1PathKeyed -> no output, exit 1. No process tree remained to kill.
Only this report was written inside the lane; all Git mutations were confined to the assigned scratch clone. No tool installs or updates. No candidate implementation scored.
