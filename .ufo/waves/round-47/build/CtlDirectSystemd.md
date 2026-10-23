RESULT CtlDirectSystemd rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axes: operability, runner-clause discrimination, exact restoration.
Freeze cac43009b22232c1ae8efdab4f2789516c1fcc6f; control 1770be61610f7056bc607e337cc4c54f135f2ea2; restored 716ca5d4c6590220205cc38d4cd16a55024848b6.
Mutant: all five sites spawn /usr/bin/systemd-run directly with inline scope/env/bwrap argv, without cap-run.mjs or capSpawnSync.
Bounds: MemoryMax=512M, MemorySwapMax=0, TasksMax=64; env -i PATH=/usr/bin; bwrap --unshare-pid --die-with-parent --new-session --clearenv --setenv. Only cwd and the selftest fixture root are writable binds.
Expected detector: ROUTED_MISS at all five sites, reason=no_cap_run_ancestor only; all gate cases pass. Observed exactly that.
Mutation classification: inconclusive as a killed-mutant claim because pristine C1 already fails; the requested pre-data control verdict is MISS.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: exit=0, stdout/stderr empty; detached at cac43009b22232c1ae8efdab4f2789516c1fcc6f.
Control commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'CtlDirectSystemd: inline bounded scope and bwrap without cap-run'
Control commit output: exit=0, stdout/stderr empty; rev=1770be61610f7056bc607e337cc4c54f135f2ea2.
Selftest rev=1770be61610f7056bc607e337cc4c54f135f2ea2 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane/scripts/kimi-census.mjs --selftest
Observed summary: "KIMI_CENSUS_SELFTEST: 54/54 pass\nVERDICT: PASS"; exit=0; stderr="".
Selftest rev=1770be61610f7056bc607e337cc4c54f135f2ea2 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane/scripts/sources-check.mjs --selftest
Observed summary: "SOURCES_SELFTEST: 46/46 pass\nVERDICT: PASS"; exit=0; stderr="".
Selftest rev=1770be61610f7056bc607e337cc4c54f135f2ea2 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane/scripts/claims-check.mjs --selftest
Observed summary: "CLAIMS_SELFTEST: 47/47 pass\nVERDICT: PASS"; exit=0; stderr="".
Selftest rev=1770be61610f7056bc607e337cc4c54f135f2ea2 command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane/scripts/anchor-truth.mjs --selftest
Observed summary: "ANCHOR_TRUTH_SELFTEST: 44/44 pass\nVERDICT: PASS"; exit=0; stderr="".
Pristine detector rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Detector stderr=""; shell exit=0 (the echoed exit above is the counter exit).
Mutated detector rev=1770be61610f7056bc607e337cc4c54f135f2ea2 command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=52 capped=0 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=45 capped=0 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor
CAPROUTE_PROBE rev=1770be61610f7056bc607e337cc4c54f135f2ea2 base=0bd8be60 held=0/5
exit=1
Detector stderr=""; shell exit=0 (the echoed exit above is the counter exit).
Restored detector rev=716ca5d4c6590220205cc38d4cd16a55024848b6 command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=716ca5d4c6590220205cc38d4cd16a55024848b6 base=0bd8be60 held=0/5
exit=1
Detector stderr=""; shell exit=0 (the echoed exit above is the counter exit).
Before SHA256 at cac43009b22232c1ae8efdab4f2789516c1fcc6f from hashlib.sha256(originals[path]).hexdigest(), with originals captured before editing:
0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075  scripts/kimi-census.mjs
6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs
0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487  scripts/claims-check.mjs
f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c  scripts/anchor-truth.mjs
Mutated SHA256 at 1770be61610f7056bc607e337cc4c54f135f2ea2; command: sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs
61e6ea93fffa957b44a425f48740fc632f7b5bf44f300d51acf46d771edb60c9  scripts/kimi-census.mjs
6c051e5a79eac4bbaaff7a7e553fcbdc39265c5acba85cf73956158763366f85  scripts/sources-check.mjs
e0fe62a38218765d41e3c665d24baf0fec5f30eee8bf38e04d44761c0baff691  scripts/claims-check.mjs
d028e3905e28e4c65aa4b0db7b6c7a3be384ed4bbd9831ebd575e53842c82cb9  scripts/anchor-truth.mjs
Restore command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'Restore exact freeze bytes after CtlDirectSystemd probe'
Restore output: exit=0, stdout/stderr empty; the surgical reverse edit returned the original four file tags.
Restored SHA256 at 716ca5d4c6590220205cc38d4cd16a55024848b6; command: sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs
0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075  scripts/kimi-census.mjs
6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs
0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487  scripts/claims-check.mjs
f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c  scripts/anchor-truth.mjs
Restoration tree command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane rev-parse 'cac43009b22232c1ae8efdab4f2789516c1fcc6f^{tree}' '716ca5d4c6590220205cc38d4cd16a55024848b6^{tree}'
60fe308a1fb12e4a7888052bd4e36406710a137b
60fe308a1fb12e4a7888052bd4e36406710a137b
Both complete trees and all four SHA256 hashes are identical to pristine; the same detector was run on pristine, control, and restored commits.
Export command (run before restoration, HEAD=1770be61610f7056bc607e337cc4c54f135f2ea2): git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlDirectSystemd.patch
Export output: exit=0; bytes=9592; patch SHA256=072c3cd3a1efb770370480fd5d5f0690508c650909ee1fcfeecec0ce90591170. The output was persisted with the write tool.
After every detector and each standalone selftest: pgrep -f /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDirectSystemd -> exit=1, no PIDs; no process trees left to kill.
Tool installs/updates: none. Only CtlDirectSystemd.patch and this report were written inside the lane; the control commit is scratch-only.
