RESULT CtlLooseCaps rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axes: operability, negative-control specificity, containment, exact restoration.
Mutant: all five child sites use capSpawnSync with bind:[tmp], explicit HOME:tmp (claims preserves explicit fixture overrides), mem:4096 and tasks:4096; cap-run/cap-spawn unchanged.
Expected detector: frozen ROUTED_HELD counter rejects every site solely as no_capped_scope_ancestor (MemoryMax=4096M >1024M and TasksMax=4096 >256), while all gate cases pass.
Observed control verdict: MISS, exactly the expected reason at all five sites; no targeted ROUTED_HELD. Kill classification: INCONCLUSIVE, not killed, because the pristine routing predicate already fails.
Scope: only this report and CtlLooseCaps.patch written in lane; source changes and git writes confined to the assigned scratch clone. Tool installs/updates: none.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: exit=0; detached revision cac43009b22232c1ae8efdab4f2789516c1fcc6f.
Commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam "control: route five sites with loose 4096 MiB and 4096 task caps"
Commit output: exit=0; control revision d7ed3c9f3091301017838178ed6a9d1a67f77802.
Selftests: tested the mutated working-tree bytes at base cac43009b22232c1ae8efdab4f2789516c1fcc6f before commit; the hashes below are the exact bytes subsequently committed as d7ed3c9f3091301017838178ed6a9d1a67f77802.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 prlimit --fsize=134217728 -- node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane/scripts/kimi-census.mjs --selftest
Output: KIMI_CENSUS_SELFTEST: 54/54 pass; VERDICT: PASS; exit=0; wall_seconds=4.232; stderr empty.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 prlimit --fsize=134217728 -- node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane/scripts/sources-check.mjs --selftest
Output: SOURCES_SELFTEST: 46/46 pass; VERDICT: PASS; exit=0; wall_seconds=3.576; stderr empty.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 prlimit --fsize=134217728 -- node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane/scripts/claims-check.mjs --selftest
Output: CLAIMS_SELFTEST: 47/47 pass; VERDICT: PASS; exit=0; wall_seconds=4.129; stderr empty.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 prlimit --fsize=134217728 -- node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane/scripts/anchor-truth.mjs --selftest
Output: ANCHOR_TRUTH_SELFTEST: 44/44 pass; VERDICT: PASS; exit=0; wall_seconds=12.102; stderr empty.
Pristine detector revision=cac43009b22232c1ae8efdab4f2789516c1fcc6f; command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Pristine detector wall time: 29.56 seconds.
Mutated detector revision=d7ed3c9f3091301017838178ed6a9d1a67f77802; command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=51 base_n=52 capped=0 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_capped_scope_ancestor
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_capped_scope_ancestor
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_capped_scope_ancestor
SITE CC879 gate=claims-check label=ROUTED_MISS n=45 base_n=46 capped=0 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_capped_scope_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_capped_scope_ancestor
CAPROUTE_PROBE rev=d7ed3c9f3091301017838178ed6a9d1a67f77802 base=0bd8be60 held=0/5
exit=1
Mutated detector wall time: 175.44 seconds.
Patch export command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlLooseCaps.patch (stdout captured and written byte-for-byte using write).
Patch output: 7279 bytes; SHA256=ab6b55e56537665da6f81880dd8317115905c20441bb2e8650b01691cc4f117a.
Restore command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Restore output: exit=0; exact byte comparison=True for all four modified files; scratch HEAD detached at cac43009b22232c1ae8efdab4f2789516c1fcc6f.
Hash computation (Python eval): hashlib.sha256(open(clone+'/'+f,'rb').read()).hexdigest(); clone=/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane.
SHA256 scripts/kimi-census.mjs pristine=0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075 mutant=9a9dde3ea4ceb7a3f694ffae02ebd1b1fb0d25589566519ee0362ef6ce3923c5 restored=0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075
SHA256 scripts/sources-check.mjs pristine=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f mutant=9d5babffcf796a5a7ee2dea269892501faa73c2f64ae388e92fd07d60f00787f restored=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f
SHA256 scripts/claims-check.mjs pristine=0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487 mutant=7959e80fd013ea7f57a2571bddee6b27bf74f26b7504e1d46d2f722d3e4a4d09 restored=0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487
SHA256 scripts/anchor-truth.mjs pristine=f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c mutant=2e54e9b33842f8d16f47eae1e225960f495f1da3f991632a1ca7fc7119df1e7b restored=f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c
Frozen counter SHA256=72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37; unchanged=True after scoring/restoration.
Restored detector revision=cac43009b22232c1ae8efdab4f2789516c1fcc6f; command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Restored detector wall time: 33.78 seconds. Pristine and restored complete detector outputs match.
Cleanup command after each of seven runs (pristine counter, four selftests, mutated counter, restored counter): pgrep -af /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlLooseCaps
Cleanup output: exit=1 and empty stdout on all seven checks; no leftover process tree to kill.
Host safety: df -h /fast showed 119G available before work; selftest file-size cap 134217728 bytes; counter retains its frozen file-size guard; no gate-mutants run; no orchestration or judging runtime invoked.
