RESULT CtlC1DropCases rev=516977af verdict=misses drop=0/3 earlypass=0/3
Axes: frozen-counter fidelity, retained non-Git coverage, canary cleanliness, exact source restoration.
Scope: two pre-data shortcut controls only; no C1 candidate or C2 implementation scored.
Scratch repository: /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane. No lane writes except this report; no tools installed or updated.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f ; observed exit=0, no stdout/stderr.
Counter bytes: git show 516977af2216b1cc426ee970d260dee53714bf4f:.ufo/waves/round-46/probe/gitenv-canary.sh; SHA256=3376c96fb6aeeb05d9ce812df2c1bfa37413c0f0d9fdb924ed446c1d774f7002.
Drop mutation: when GIT_DIR is set, omit cite revision fixture inputs and two Git assertions; skip three proxy PIN Git cases plus their dependent fail-closed census; skip 54 round Git-dependent cases but execute all six usage cases.
Shared setup launches are bypassed rather than scrubbed: cite skips Git fixture creation/head lookup, proxy skips PIN Git setup/CLI calls, round returns inert fixture results and bypasses Git-using child calls. Other case bodies remain.
Earlypass mutation: same removed Git work, but the case harness records PASS with detail "Git case early return" and returns without invoking each affected case. All original case bodies remain for clean runs.
Expected detector: drop fails case-name equality and Git-launch counts; earlypass preserves every PASS name but fails Git-launch counts. Both should miss held=3/3.
Counter concurrency: the assigned lane counter changed during the first restored-drop run; live SHA256 observed 70eb3d83083a885ca2eb4e4593fbdd427fd477e86ee3e312c4dd949d160f4716. That interrupted run is inconclusive, not scored.
L1 authorized completing with the original committed counter copied byte-exact to /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/frozen-gitenv-canary.sh (same SHA256); L1 will independently rescore both control commits under its pre-data A2 amendment.
All runs inherited an RLIMIT_FSIZE of 134217728 bytes; SCRATCH_ROOT and TMPDIR stayed under this seat. Initial df -h /fast: 804G total, 600G used, 204G available (75%).
pristine rev=516977af2216b1cc426ee970d260dee53714bf4f:
Command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/tmp systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit code: 1
drop rev=e0691e5a65e85ac9f6a15923521333662bf88cd7:
Scratch commit command: git add -- scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs && git -c user.name=CtlC1DropCases -c user.email=control@example.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -qm 'control C1 drop Git-backed cases under GIT_DIR' ; both exits=0, no stdout/stderr.
Command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/tmp systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane e0691e5a65e85ac9f6a15923521333662bf88cd7
TOOL cite-check NOT_HELD(caseset_differs=2,git_launches=0/111) cases clean=75 hostile=73 base=75 git=0/111
TOOL proxy-check NOT_HELD(caseset_differs=4,git_launches=0/12) cases clean=121 hostile=117 base=121 git=0/12
TOOL round-gate NOT_HELD(caseset_differs=54,git_launches=0/886) cases clean=60 hostile=6 base=60 git=0/886
GITENV_CANARY rev=e0691e5a65e85ac9f6a15923521333662bf88cd7 held=0/3
Exit code: 1
restored-drop-interrupted rev=7077337bef79ee19c06090f4f58376a282f516b5:
Command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/tmp systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane 7077337bef79ee19c06090f4f58376a282f516b5
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh: line 89: syntax error near unexpected token `)'
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh: line 89: ` < "$W/gl-clean-$t")'
Exit code: 2
restored-drop rev=7077337bef79ee19c06090f4f58376a282f516b5:
Scratch commit command: git add -- scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs && git -c user.name=CtlC1DropCases -c user.email=control@example.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -qm 'control restore exact frozen bytes after drop' ; both exits=0, no stdout/stderr.
Command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/tmp systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/frozen-gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane 7077337bef79ee19c06090f4f58376a282f516b5
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=7077337bef79ee19c06090f4f58376a282f516b5 held=0/3
Exit code: 1
earlypass rev=6f95385a23bea75bf08713e8ffe924de8d9a8b6c:
Scratch commit command: git add -- scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs && git -c user.name=CtlC1DropCases -c user.email=control@example.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -qm 'control C1 early-PASS Git-backed cases under GIT_DIR' ; both exits=0, no stdout/stderr.
Command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/tmp systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/frozen-gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane 6f95385a23bea75bf08713e8ffe924de8d9a8b6c
TOOL cite-check NOT_HELD(git_launches=0/111) cases clean=75 hostile=75 base=75 git=0/111
TOOL proxy-check NOT_HELD(git_launches=0/12) cases clean=121 hostile=121 base=121 git=0/12
TOOL round-gate NOT_HELD(git_launches=0/886) cases clean=60 hostile=60 base=60 git=0/886
GITENV_CANARY rev=6f95385a23bea75bf08713e8ffe924de8d9a8b6c held=0/3
Exit code: 1
restored-earlypass rev=e9ff6521213f4a5655b985b870a4c28ba86c1039:
Scratch commit command: git add -- scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs && git -c user.name=CtlC1DropCases -c user.email=control@example.invalid -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -qm 'control restore exact frozen bytes after earlypass' ; both exits=0, no stdout/stderr.
Command: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/tmp systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/frozen-gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases/lane e9ff6521213f4a5655b985b870a4c28ba86c1039
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=e9ff6521213f4a5655b985b870a4c28ba86c1039 held=0/3
Exit code: 1
Before/after SHA256 (both restored runs exactly match the pristine column):
File | pristine = restored-drop = restored-earlypass | drop | earlypass
scripts/cite-check.mjs | 115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 | e02919aba4554660bad4e12cd8cb590577d164fe4a59a1e0785da67a297b886a | aeac0e78f9de6e7600586b3861ebcf474b4012dacb4d318c623f8e715e8d0074
scripts/proxy-check.mjs | da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826 | f331573d686260f9f1c4a6ad81a592c8bed647b7d176857efa48fdaf674a088c | d58b5dc37ad826fe896b579699a452e084a5fdf5d533ba316614d7970af26f2b
scripts/round-gate.mjs | f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9 | 4c71abd67d7a9faff1e2e955b946e6f28f359255ca2446a831b2abd7eb668d0c | bab9086169aef4497b061da77c6ad8c7f4b5fd0e38724f04c47be87d2c50e42c
Restoration evidence: exact original UTF-8 bytes restored via write; 137560/152230/80415 bytes for cite/proxy/round. Hash comparisons after each restoration were True; restoration commits are 7077337bef79ee19c06090f4f58376a282f516b5 and e9ff6521213f4a5655b985b870a4c28ba86c1039.
After EACH of the six runs: pgrep -af /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1DropCases ; observed exit=1, empty output (no matching processes). No process tree remained to kill.
Verdict: both negative controls miss (0/3). Drop leaves canaries unchanged but loses 2/4/54 PASS names; earlypass leaves them unchanged with full 75/121/60 sets. Both launch zero Git processes in hostile mode versus 111/12/886 clean.
Mutation-test status: inconclusive as an invariant kill because pristine already fails (0/3); these are observed rejected negative controls, not claimed killed mutants. A2 counter results are unverified by this seat.
