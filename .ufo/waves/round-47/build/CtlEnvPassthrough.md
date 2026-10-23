RESULT CtlEnvPassthrough rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axis: operability. One defect class: capSpawnSync receives the complete parent environment at every targeted site, plus the site's existing overrides.
Freeze: cac43009b22232c1ae8efdab4f2789516c1fcc6f. Scratch: /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane. No lane source was edited.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: none; exit 0. df -h /fast before clone: /dev/nvme1n1p2 804G 685G 119G 86% /fast.
All five sites call the unchanged cap-spawn.mjs helper and bind their owning selftest's temp root. Existing budgets remain K488 30000ms (10000ms overrides), SC549 15000ms, SC859 10000ms, CC879 60000ms. AT802 previously had no explicit timeout; it uses the helper's 60000ms default value explicitly.
K488/SC549/SC859 pass env: { ...process.env }; CC879 passes { ...process.env, ...gitEnv(env) }; AT802 passes { ...process.env, ...gitEnv() }. Default runner caps remain 512MiB/64 tasks.
Control commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'control(r47): route all five children with full parent environment' && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane rev-parse HEAD
Observed control revision: 8c3c3fe9582201433d4e6d2a1726b199cb8141e7; exit 0.
Selftests below ran on the exact control bytes immediately before that commit; observed summary lines are quoted, not the individual PASS cases.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane/scripts/kimi-census.mjs --selftest; echo exit=$?
Output: KIMI_CENSUS_SELFTEST: 54/54 pass; VERDICT: PASS; exit=0 (4.26s).
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane/scripts/sources-check.mjs --selftest; echo exit=$?
Output: SOURCES_SELFTEST: 46/46 pass; VERDICT: PASS; exit=0 (3.77s); parity case reported node=4/1/1 awk=4/1/1.
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane/scripts/claims-check.mjs --selftest; echo exit=$?
Output: CLAIMS_SELFTEST: 47/47 pass; VERDICT: PASS; exit=0 (3.90s).
Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane/scripts/anchor-truth.mjs --selftest; echo exit=$?
Output: ANCHOR_TRUTH_SELFTEST: 44/44 pass; VERDICT: PASS; exit=0 (12.59s).
Expected detector: frozen ROUTED_HELD counter must report held=0/5 and ROUTED_MISS with canary_in_env at all five targeted sites.
The exact same bounded detector command was run three times, with HEAD at the pristine, control, and restored revisions named below:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane HEAD; echo exit=$?
Pristine rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f, full output (29.92s):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Control rev=8c3c3fe9582201433d4e6d2a1726b199cb8141e7, full output (174.14s):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=52 capped=0 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0 reason=canary_in_env
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=canary_in_env
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=canary_in_env
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=canary_in_env
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=105 capped=0 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=canary_in_env,no_cap_run_ancestor
CAPROUTE_PROBE rev=8c3c3fe9582201433d4e6d2a1726b199cb8141e7 base=0bd8be60 held=0/5
exit=1
Restored rev=a72ad95037ea892cf1ce1bbc19ce93e3f072fed4, full output (23.84s):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=52 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=a72ad95037ea892cf1ce1bbc19ce93e3f072fed4 base=0bd8be60 held=0/5
exit=1
Control verdict MISS: all five targeted sites reported the expected canary_in_env reason; none reported ROUTED_HELD. AT802 additionally reported no_cap_run_ancestor; retained without attributing its cause.
Mutation kill classification: inconclusive as a pristine-to-mutant kill experiment because the frozen pristine predicate already failed; this is the assigned negative-control receipt, not a claim that a previously green baseline was killed.
Content-hash command at each state: sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs (cwd=scratch clone).
Pristine cac43009 and restored a72ad950 outputs were identical:
0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075  scripts/kimi-census.mjs
6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs
0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487  scripts/claims-check.mjs
f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c  scripts/anchor-truth.mjs
Control 8c3c3fe9 outputs:
8ac872dd8b2d45cf6a5431bbd9dd3c8836e81910727d88d796ddff62ca448998  scripts/kimi-census.mjs
3a14dfdc92396279a8c29cc8f2ca9514bb01ea4aa2237c5e591a25e6f3d89864  scripts/sources-check.mjs
47294b46e0cf1f8ba109e99085afcd63168c51647d3e4f1099c116b27ef8c363  scripts/claims-check.mjs
9290c0b394d1bdc7f5d3a2c5b8baf868e36a11ac1a3293378d19534330904d38  scripts/anchor-truth.mjs
After exporting the control patch, surgical inverse edits restored exact bytes; restoration commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'control(r47): restore exact frozen bytes after environment probe' && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane rev-parse HEAD 'HEAD^{tree}' 'cac43009b22232c1ae8efdab4f2789516c1fcc6f^{tree}'
Output: a72ad95037ea892cf1ce1bbc19ce93e3f072fed4; 60fe308a1fb12e4a7888052bd4e36406710a137b; 60fe308a1fb12e4a7888052bd4e36406710a137b; exit 0. Entire restored tracked tree equals freeze.
Export command, while HEAD was control 8c3c3fe9: ulimit -f 2048; git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlEnvPassthrough/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlEnvPassthrough.patch
Export output: none; exit 0. Patch contains the control commit only, not restoration.
Command: sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlEnvPassthrough.patch
Output: 2eb1b59e28a9f58d058cb114d079e2444e47596deedd7ea5becd766d147f51a5  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlEnvPassthrough.patch
Command (control bytes, cwd=scratch clone): sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
Observed frozen counter hash: 72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37.
After each of the seven detector/selftest runs: pgrep -af '/fast/scratch/hyaku/kumitate-r47/seats/w1-[C]tlEnvPassthrough'; echo pgrep_exit=$? produced no process lines and pgrep_exit=1. No started process tree remained.
Tool installations/updates: none. Only this report and CtlEnvPassthrough.patch were written in the lane; sandbox source is restored, and the committed mutant remains reproducible through the exported patch.
