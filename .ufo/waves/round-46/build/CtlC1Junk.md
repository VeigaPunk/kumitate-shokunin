RESULT CtlC1Junk rev=516977af verdict=misses junk=0/3 allfalse=0/3
Axis: operability. Only the assigned pre-data controls were scored; no candidate C1 implementation was scored.
Frozen revision: 516977af2216b1cc426ee970d260dee53714bf4f. Scratch clone: /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane.
Clone command (bash -c, cwd=/home/vgpnk/Projects/shokunin): unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane && git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f
Clone output: stdout empty; stderr empty; exit=0.
For all subsequent git and detector commands, repository-locating variables listed by git rev-parse --local-env-vars, plus GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE, were removed from the subprocess environment.
Detector environment: SCRATCH_ROOT=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/runs TMPDIR=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/tmp. Each run had the requested 8G/256-task/900s wrapper plus a 67108864-byte per-file limit.
Frozen counter SHA256: 3376c96fb6aeeb05d9ce812df2c1bfa37413c0f0d9fdb924ed446c1d774f7002; live counter bytes equaled git show 516977af2216b1cc426ee970d260dee53714bf4f:.ufo/waves/round-46/probe/gitenv-canary.sh before scoring.
Junk mutant 2dafa042ef953f676712c4f0019199671874928b: appended // CtlC1Junk control: non-behavioral comment only. to each assigned script; README changed "one domain" to "a single domain". No environment handling changed.
All-false mutant 4b550a28843972c14328095ba5ba89ea4d7f1cea: each --selftest dispatch writes only VERDICT: FAIL followed by newline and returns 1. Other dispatches remain unchanged; README remains pristine.
Expected detector: both controls miss held=3/3. Junk preserves the inherited-Git defect; all-false violates success, case preservation and Git-launch requirements.
Junk build command: git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane -c user.name=ctl -c user.email=ctl@ctl add scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs README.md; exit=0, no output.
Junk commit command: git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane -c user.name=ctl -c user.email=ctl@ctl commit -qm 'C1 control: comments and README sentence only'; exit=0, no output.
All-false build command: git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane -c user.name=ctl -c user.email=ctl@ctl add scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs; exit=0, no output.
All-false commit command: git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane -c user.name=ctl -c user.email=ctl@ctl commit -qm 'C1 control: all selftests print FAIL and exit one'; exit=0, no output.
Restoration command after each control: git -C /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane -c user.name=ctl -c user.email=ctl@ctl checkout -q --detach 516977af2216b1cc426ee970d260dee53714bf4f; both exits=0, no output. Both controls were independently based on the frozen revision.
Hash observations: pristine via hashlib.sha256(Path.read_bytes()); mutant and restored states via sha256sum scripts/cite-check.mjs scripts/proxy-check.mjs scripts/round-gate.mjs README.md in the clone.
SHA256 scripts/cite-check.mjs pristine=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 junk=239bf44626496dd4d45d45e41b67be4cbd0d6211ac05ef4ab7930aead4785dac allfalse=d77c777020ce09ac43e3bc3a6689cbd692142e598056adf9f61f7b5987fa7320 restored-after-junk=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8 restored-after-allfalse=115bfde46d6a24ce2216dd21fff8234f09468f94924ecd7c8ef17276a9c8a4d8
SHA256 scripts/proxy-check.mjs pristine=da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826 junk=dbb8fdeafbf83526b0eee53851d83de9d002179af78540b5191c709623aff6fe allfalse=b065b96bc36d6a42909995748f1202fbddadcea60c71f52c2d9f7db8a6a787a9 restored-after-junk=da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826 restored-after-allfalse=da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826
SHA256 scripts/round-gate.mjs pristine=f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9 junk=05f9b971733c88ce095a6c881a6b43efa04f93e2db0770f73db5adf1d3008d2e allfalse=d9b42aaac019c90b5762081a9353a9aac8b761bdef1d2b31d4be2e9dc433a5a6 restored-after-junk=f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9 restored-after-allfalse=f890e277af83a78f2dd265e442c8c5912dc3975a36b18ae1be927022a834d3e9
SHA256 README.md pristine=8e56aa3eb6fb59dac8c7d006b628c6a84c2a8bbcedfd4ab10f0faf1ccb127a64 junk=1357fb9221efc02a55cb8b9e9beadbf317af62516339d6b689a836dcfed3346a allfalse=8e56aa3eb6fb59dac8c7d006b628c6a84c2a8bbcedfd4ab10f0faf1ccb127a64 restored-after-junk=8e56aa3eb6fb59dac8c7d006b628c6a84c2a8bbcedfd4ab10f0faf1ccb127a64 restored-after-allfalse=8e56aa3eb6fb59dac8c7d006b628c6a84c2a8bbcedfd4ab10f0faf1ccb127a64
Run pristine rev=516977af2216b1cc426ee970d260dee53714bf4f:
Command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane): prlimit --fsize=67108864:67108864 -- systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit=1; stderr empty.
Run junk rev=2dafa042ef953f676712c4f0019199671874928b:
Command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane): prlimit --fsize=67108864:67108864 -- systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane 2dafa042ef953f676712c4f0019199671874928b
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=2dafa042ef953f676712c4f0019199671874928b held=0/3
Exit=1; stderr empty.
Run restored-junk rev=516977af2216b1cc426ee970d260dee53714bf4f:
Command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane): prlimit --fsize=67108864:67108864 -- systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit=1; stderr empty.
Run allfalse rev=4b550a28843972c14328095ba5ba89ea4d7f1cea:
Command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane): prlimit --fsize=67108864:67108864 -- systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane 4b550a28843972c14328095ba5ba89ea4d7f1cea
TOOL cite-check NOT_HELD(hostile_exit=1,clean_exit=1,base_cases_lost=75,git_launches=0/0) cases clean=0 hostile=0 base=75 git=0/0
TOOL proxy-check NOT_HELD(hostile_exit=1,clean_exit=1,base_cases_lost=121,git_launches=0/0) cases clean=0 hostile=0 base=121 git=0/0
TOOL round-gate NOT_HELD(hostile_exit=1,clean_exit=1,base_cases_lost=60,git_launches=0/0) cases clean=0 hostile=0 base=60 git=0/0
GITENV_CANARY rev=4b550a28843972c14328095ba5ba89ea4d7f1cea held=0/3
Exit=1; stderr empty.
Run restored-allfalse rev=516977af2216b1cc426ee970d260dee53714bf4f:
Command (cwd=/fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane): prlimit --fsize=67108864:67108864 -- systemd-run --user --scope --quiet -p MemoryMax=8G -p TasksMax=256 timeout -s KILL 900 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/probe/gitenv-canary.sh /fast/scratch/hyaku/kumitate-r46/seats/w1-CtlC1Junk/lane 516977af2216b1cc426ee970d260dee53714bf4f
TOOL cite-check NOT_HELD(canary_changed=4,git_launches=108/111,git_saw_canary=108) cases clean=75 hostile=75 base=75 git=108/111
TOOL proxy-check NOT_HELD(hostile_exit=1,canary_changed=22,caseset_differs=4,git_saw_canary=12) cases clean=121 hostile=117 base=121 git=12/12
TOOL round-gate NOT_HELD(hostile_exit=1,canary_changed=4,caseset_differs=60,git_launches=3/886,git_saw_canary=3) cases clean=60 hostile=0 base=60 git=3/886
GITENV_CANARY rev=516977af2216b1cc426ee970d260dee53714bf4f held=0/3
Exit=1; stderr empty.
After each of the five runs: pgrep -af '/fast/scratch/hyaku/kumitate-r46/seats/[w]1-CtlC1Junk' => exit=1, stdout empty, stderr empty; no matching processes remained.
Control verdicts: junk=misses; allfalse=misses. Both were rejected with held=0/3.
Mutation kill classification: inconclusive, not killed or survived; the pristine detector already failed at held=0/3. No passing-baseline kill is claimed.
Restoration evidence: every affected file hash exactly matched pristine after each control, and both restored detector outputs matched pristine. Clone left detached at 516977af2216b1cc426ee970d260dee53714bf4f.
Tools installed or updated: none.
