RESULT CtlBwrapOnly rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axis: operability. Assigned pre-data negative control only; no routing candidate or C1 after-state scored.
Mutant: cap-run spawns env -i PATH=/usr/bin bwrap with the existing bwrap argv, removing the systemd-run scope launch. All five sites use capSpawnSync, explicit child environments, and bind their selftest temporary root.
Expected detector: frozen ROUTED_HELD counter rejects all five with no_capped_scope_ancestor while each owning gate still passes every selftest case.
Observed: 0/5 held, every targeted site ROUTED_MISS with no_capped_scope_ancestor; all owning gates exit 0 with unchanged case totals and uncapped_direct=0.
AT802 also reported no_cap_run_ancestor. This additional observed reason is retained verbatim below; no diagnostic rerun was performed.
Mutation-delta verdict: INCONCLUSIVE, not a killed-mutant claim, because pristine and restored counters already exit 1. Assigned negative-control verdict: MISS.
Revisions: pristine=cac43009b22232c1ae8efdab4f2789516c1fcc6f control=b07e364ef6e48f6cee3fdbdf86860c0ca47dd384 restored=6ea27830b8f0ea96d60478a3d097d6cd2d6ac489.
COMMAND unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f ; observed exit=0 (no output).
COMMAND git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'control B: route five sites through bwrap without a scope' ; observed exit=0 (no output).
Control selftest summaries at rev=b07e364ef6e48f6cee3fdbdf86860c0ca47dd384 (commands and final stdout lines):
COMMAND systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane/scripts/kimi-census.mjs --selftest
KIMI_CENSUS_SELFTEST: 54/54 pass
VERDICT: PASS
exit=0; stderr=empty
COMMAND systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane/scripts/sources-check.mjs --selftest
SOURCES_SELFTEST: 46/46 pass
VERDICT: PASS
exit=0; stderr=empty
COMMAND systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane/scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
exit=0; stderr=empty
COMMAND systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane/scripts/anchor-truth.mjs --selftest
ANCHOR_TRUTH_SELFTEST: 44/44 pass
VERDICT: PASS
exit=0; stderr=empty
Also observed: PASS frozen awk census parity: rows, malformed, duplicate ids: node=4/1/1 awk=4/1/1
PRISTINE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f (full counter output follows):
COMMAND systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
CONTROL rev=b07e364ef6e48f6cee3fdbdf86860c0ca47dd384 (full counter output follows):
COMMAND systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=51 base_n=52 capped=0 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_capped_scope_ancestor
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_capped_scope_ancestor
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_capped_scope_ancestor
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_capped_scope_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=105 base_n=103 capped=0 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_capped_scope_ancestor,no_cap_run_ancestor
CAPROUTE_PROBE rev=b07e364ef6e48f6cee3fdbdf86860c0ca47dd384 base=0bd8be60 held=0/5
exit=1
RESTORED rev=6ea27830b8f0ea96d60478a3d097d6cd2d6ac489 (full counter output follows):
COMMAND systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=6ea27830b8f0ea96d60478a3d097d6cd2d6ac489 base=0bd8be60 held=0/5
exit=1
Source SHA-256, measured before mutation / after mutation / after exact-byte restoration:
scripts/cap-run.mjs before=b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8 mutant=27c6679022050c8e1a546115b6fcfb91a3502e71431ea8222e6ca3b8d14bea4d restored=b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8
scripts/kimi-census.mjs before=0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075 mutant=a6d16893a5a6a2e844401b615d8f9ae43bd70dbfb10a1434f8e225c6f48e3fc7 restored=0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075
scripts/sources-check.mjs before=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f mutant=63e381e1a7f763825d2100e599f1ae3a0d2e007797dd32c7f7c784a547e6c5c0 restored=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f
scripts/claims-check.mjs before=0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487 mutant=608035715495fd0b0b0a57f8d07675911530405377f8717de007de5b214b7e57 restored=0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487
scripts/anchor-truth.mjs before=f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c mutant=5adb12501df08c6cec829d304e60cf43e91f2c9e9cdb5b0a9c147fdae72f2837 restored=f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c
Restoration: wrote the saved pristine UTF-8 bytes back to all five modified source files; equality against every saved original was true. The exported patch retains only the control commit.
COMMAND git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'restore frozen source bytes after control B' ; observed exit=0 (no output).
COMMAND git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlBwrapOnly/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD ; observed exit=0, stdout=10553 bytes, saved to .ufo/waves/round-47/build/CtlBwrapOnly.patch before restoration.
COMMAND sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlBwrapOnly.patch
72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
52b863c6c53acab9ae286de8a2d892d3ce743160f15a53aacbe87e607f631c38  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlBwrapOnly.patch
Cleanup after each of four selftests and each of three counter runs: pgrep -af '[w]1-CtlBwrapOnly' ; observed no output, exit=1 on all seven checks. No own process remained; no kill was needed.
COMMAND df -h /fast ; observed /dev/nvme1n1p2 804G 684G 120G 86% /fast before clone/runs. Patch bounded below 256 KiB; selftest captured outputs bounded below 4 MiB each.
Tool installs/updates: none. Lane writes: only this report and CtlBwrapOnly.patch; all source changes and commits were confined to the assigned scratch clone.
