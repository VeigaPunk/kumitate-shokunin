RESULT CtlJunk rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axis: operability; predicate ROUTED_HELD. Junk negative control only, not a routing candidate.
Mutant/control commit: 1a922e2a55eac547048606a027c1a963f64d5c22, parent cac43009b22232c1ae8efdab4f2789516c1fcc6f.
Mutation: append exactly 40 random-hex comment lines to scripts/cap-spawn.mjs; change only `cannot spawn systemd-run` to `cannot start systemd-run` in scripts/cap-run.mjs:231. No routing behavior changed.
Expected detector: held=0/5, all targeted sites ROUTED_MISS for no_cap_run_ancestor, no_capped_scope_ancestor, no_bwrap_ancestor and uncapped direct children; existing canary leaks remain visible for K488/SC549/SC859.
Observed control verdict: MISS, matching every expected targeted reason. Mutation-kill verdict: inconclusive, not killed; pristine already fails the routing predicate. All gate selftest cases pass in all three runs.
Restoration: scratch HEAD returned to cac43009b22232c1ae8efdab4f2789516c1fcc6f; both modified files' SHA256 values exactly match pristine; restored counter output matches pristine.
Tool installs/updates: none. No lane source edits or lane git writes; only CtlJunk.patch and this report written in the lane. No other runtime, gate-mutants, or routing candidate scored.
Commands below used cwd /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane except clone/disk commands, which used /home/vgpnk/Projects/shokunin.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: no output; completed successfully.
Disk command: df -h /fast
Disk output: /dev/nvme1n1p2 804G 685G 119G 86% /fast
Pristine rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Exact bounded detector command:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Pristine hash command: sha256sum scripts/cap-spawn.mjs scripts/cap-run.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
7cea95c77ed578b4586ab6a18b0dcee38b493fecdbc59320647016b8ed643365  scripts/cap-spawn.mjs
b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8  scripts/cap-run.mjs
72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
After pristine command: pgrep -af '/fast/scratch/hyaku/kumitate-r47/seats/[w]1-CtlJunk/'; echo pgrep_exit=$?
pgrep_exit=1
Commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'CtlJunk: inert hex comments and runner log wording' && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane rev-parse HEAD
1a922e2a55eac547048606a027c1a963f64d5c22
Mutated hash command: sha256sum scripts/cap-spawn.mjs scripts/cap-run.mjs
9ce1c5c8a162fa18417c17ee7be63b88e50995a6bdd388ddcf7c75ac81e9992e  scripts/cap-spawn.mjs
9e8b31a2abc016806106b798837fbc24f4dbec05584dcc67fe6b77adb6863d91  scripts/cap-run.mjs
Mutated rev=1a922e2a55eac547048606a027c1a963f64d5c22. Exact bounded detector command:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=1a922e2a55eac547048606a027c1a963f64d5c22 base=0bd8be60 held=0/5
exit=1
After mutated command: pgrep -af '/fast/scratch/hyaku/kumitate-r47/seats/[w]1-CtlJunk/'; echo pgrep_exit=$?
pgrep_exit=1
Export command at control HEAD: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD
Export stdout saved verbatim with write tool as .ufo/waves/round-47/build/CtlJunk.patch (2650 bytes); full diff is in that file: 2 files changed, 41 insertions(+), 1 deletion(-).
Restoration command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f && sha256sum scripts/cap-spawn.mjs scripts/cap-run.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlJunk.patch
7cea95c77ed578b4586ab6a18b0dcee38b493fecdbc59320647016b8ed643365  scripts/cap-spawn.mjs
b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8  scripts/cap-run.mjs
3af18b2c0c9dad9654bdac6226c591577da2f90f47bb14aca0b42677efad7bb7  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlJunk.patch
Restored rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Exact bounded detector command:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlJunk/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
After restored command: pgrep -af '/fast/scratch/hyaku/kumitate-r47/seats/[w]1-CtlJunk/'; echo pgrep_exit=$?; pgrep -af '/fast/scratch/hyaku/kumitate-r47/probe-runs/[1]a922e2a55ea-'; echo mutant_children_pgrep_exit=$?
pgrep_exit=1
mutant_children_pgrep_exit=1
