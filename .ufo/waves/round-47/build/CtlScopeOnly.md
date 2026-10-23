RESULT CtlScopeOnly rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802

Axes: operability and detector specificity; isolated negative control only.
Frozen revision: cac43009b22232c1ae8efdab4f2789516c1fcc6f. Control revision: 4eccc0e09136b883d6cc6a7018ccad549f1e68e7.
Mutant: scripts/cap-run.mjs omits bwrap at its launch argv, preserving the capped systemd scope, MemorySwapMax=0, env -i PATH=/usr/bin, explicit --env pairs and real command/arguments. All five sites use capSpawnSync with explicit environments and bind their selftest temp root.
Expected detector: frozen ROUTED_HELD counter; all five targeted sites must be ROUTED_MISS solely for no_bwrap_ancestor while their selftests pass. Observed exactly that.
Mutation classification: task verdict MISS. A conventional killed/survived verdict is inconclusive because the required pristine baseline itself is ROUTED_MISS; no baseline-positive killed-mutant claim is made.
Command cwd unless specified: /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane.
Clone command (cwd /home/vgpnk/Projects/shokunin): unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: empty; exit=0. All subsequent sandbox git calls also had every git local-environment variable unset.
Command: df -h /fast
Output: /dev/nvme1n1p2 804G 685G 119G 86% /fast
Command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'CtlScopeOnly: route five sites through scope without bwrap'
Output: empty; exit=0.
Command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane rev-parse HEAD
Output: 4eccc0e09136b883d6cc6a7018ccad549f1e68e7; exit=0.
Exact counter command, identical for pristine, mutated and restored runs:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane HEAD; echo exit=$?
Pristine cac43009b22232c1ae8efdab4f2789516c1fcc6f output, wall 28.25 s:
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Mutated 4eccc0e09136b883d6cc6a7018ccad549f1e68e7 full counter output, wall 64.31 s:
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_bwrap_ancestor
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_bwrap_ancestor
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_bwrap_ancestor
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_bwrap_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=105 capped=0 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_bwrap_ancestor
CAPROUTE_PROBE rev=4eccc0e09136b883d6cc6a7018ccad549f1e68e7 base=0bd8be60 held=0/5
exit=1
Restored cac43009b22232c1ae8efdab4f2789516c1fcc6f output, wall 36.65 s:
SITE K488 gate=kimi-census label=ROUTED_MISS n=52 base_n=53 capped=0 uncapped_direct=52 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=52
SITE SC549 gate=sources-check label=ROUTED_MISS n=41 base_n=42 capped=0 uncapped_direct=42 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=42
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=42 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=42
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=104 base_n=106 capped=0 uncapped_direct=104 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=104
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Separate gate selftests ran on precommit working-tree bytes subsequently committed as 4eccc0e09136b883d6cc6a7018ccad549f1e68e7:
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/kimi-census.mjs --selftest
Output: KIMI_CENSUS_SELFTEST: 54/54 pass; VERDICT: PASS; exit=0; wall 4.60 s.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/sources-check.mjs --selftest
Output summary: SOURCES_SELFTEST: 46/46 pass; VERDICT: PASS; exit=0; wall 3.97 s.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/claims-check.mjs --selftest
Output: CLAIMS_SELFTEST: 47/47 pass; VERDICT: PASS; exit=0; wall 4.35 s.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/anchor-truth.mjs --selftest
Output summary: ANCHOR_TRUTH_SELFTEST: 44/44 pass; VERDICT: PASS; exit=0; wall 10.98 s.
Earlier precommit Kimi run of the identical selftest command failed: ReferenceError: spawnSync is not defined at selfTest (.../scripts/kimi-census.mjs:705:20), exit=1, wall 2.06 s. The fixture's mkfifo still needs spawnSync; restored that import before the passing rerun and commit.
Restoration command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Restoration output: empty; exit=0. Control patch was exported before restoration.
Cleanup command: pgrep -af /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly
After pristine counter, selftest batch, corrected Kimi selftest, mutated counter and restored counter: no output, exit=1 each time; no matching processes remained.
Hash command, run pristine/mutated/restored (probe included pristine/restored): sha256sum scripts/cap-run.mjs scripts/cap-spawn.mjs scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
SHA256 evidence (pristine | mutated | restored), paths relative to clone:
scripts/cap-run.mjs | b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8 | 157d2e83aea2b5dd0637089ec71888a96c0637fe5af25be233d792e79fd59078 | b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8
scripts/cap-spawn.mjs | 7cea95c77ed578b4586ab6a18b0dcee38b493fecdbc59320647016b8ed643365 | 7cea95c77ed578b4586ab6a18b0dcee38b493fecdbc59320647016b8ed643365 | 7cea95c77ed578b4586ab6a18b0dcee38b493fecdbc59320647016b8ed643365
scripts/kimi-census.mjs | 0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075 | 99813ef38b176afd0506de80b042642146fccb20c36b3bfeed73656a46f05dfd | 0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075
scripts/sources-check.mjs | 6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f | 0bbd739c9418024811e0b58fbf887bcb1b96dd2014308bd1c60e1b9a28a685ed | 6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f
scripts/claims-check.mjs | 0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487 | 7883d3c67d0568be4519f7c8cee629911233bccceafca03566738194a9594322 | 0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487
scripts/anchor-truth.mjs | f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c | 6ee142104b95a651339156c1403380a22d44adb71ef9f0aafcab45298cfcb5de | f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c
Frozen lane probe SHA256 before/after: 72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37 (identical).
Export command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlScopeOnly/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD
Output: exit=0, 8654 stdout bytes; written verbatim with the write tool to .ufo/waves/round-47/build/CtlScopeOnly.patch (128 KiB bound).
Patch SHA256: e10ec0d9563110d8bff12a435ba6f469247a1cd02f0e949fdfaf8fffce737a97.
Only this report and CtlScopeOnly.patch were written inside the lane; production source and the frozen counter were not edited. Scratch tracked source bytes were restored exactly.
No tools installed or updated. Runner's own --selftest was not run; this control intentionally omits its bwrap protections.
