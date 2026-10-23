RESULT CtlMention rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axis: operability. Pre-data string-mention control for frozen C1 / ROUTED_HELD; no routing candidate scored.
Freeze: cac43009b22232c1ae8efdab4f2789516c1fcc6f; control commit: ef098674ce3dab1865885980029410b87533133e; restored commit: 1a30aa77a2c781e01fc5c23ea5d862b3c28d057b.
Mutant: the exact requested '// routed through scripts/cap-run.mjs (kumitate-cap-run-v2) via capSpawnSync' comment at five sites, plus one unused capSpawnSync import atop each of four files; every spawnSync call unchanged.
Expected detector: 0/5; all targeted sites ROUTED_MISS for no_cap_run_ancestor, no_capped_scope_ancestor, no_bwrap_ancestor, and uncapped direct children. Canary leakage may also appear.
Observed: expected MISS at all five sites; all four selftests exited 0 with full frozen case totals. No targeted site was ROUTED_HELD.
Kill-test classification: INCONCLUSIVE, not a killed mutant, because pristine bytes already fail ROUTED_HELD. The requested negative-control classification is MISS.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: empty stdout/stderr; exit=0. Frozen revision verified by git rev-parse HEAD.
Control commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'CtlMention: string-only cap-run mentions'
Control commit output: empty stdout/stderr; exit=0.
Patch export command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD
Patch export output captured byte-for-byte through write into .ufo/waves/round-47/build/CtlMention.patch; git exit=0; bytes=4965; SHA256=1e79cbd75df22a5487eb2765852ddce2cefc968a7628d040555a0b0d6a3e7a0a.
Initial pristine attempt rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f: caller RLIMIT_FSIZE=1 GiB prevented the frozen probe from setting its required 4 GiB bound; inconclusive harness failure.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane HEAD; echo exit=$?
CAPROUTE_PROBE: ERROR no strace log for kimi-census (base); status=1 prlimit: failed to set the FSIZE resource limit: Operation not permitted

exit=2
Correction: caller RLIMIT_FSIZE soft/hard set to 4294967296 bytes, matching the probe. Counter bytes/command unchanged; this bound applied identically to all three completed measurements below. Frozen strace logs are capped at 1 GiB.
PRISTINE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f elapsed_seconds=29.312; stdout below; stderr empty.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
MUTATED rev=ef098674ce3dab1865885980029410b87533133e elapsed_seconds=24.618; stdout below; stderr empty.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=ef098674ce3dab1865885980029410b87533133e base=0bd8be60 held=0/5
exit=1
RESTORED rev=1a30aa77a2c781e01fc5c23ea5d862b3c28d057b elapsed_seconds=35.59; stdout below; stderr empty.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=1a30aa77a2c781e01fc5c23ea5d862b3c28d057b base=0bd8be60 held=0/5
exit=1
Restoration command: remove only the nine inserted lines with edit, then git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlMention/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'Restore exact freeze bytes after CtlMention probe'
Restoration commit output: empty stdout/stderr; exit=0. Exact byte comparison of all four restored files against captured pristine bytes: True.
SHA256 scripts/kimi-census.mjs before=0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075 mutated=d7b0cca7f816c136088caf3933efa48f89f592c67ff9c6b8797efd1d30b3d3ad restored=0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075
SHA256 scripts/sources-check.mjs before=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f mutated=f02dac20fc23e4cdfa2c2e6b2350f38abb26417773e5ff497b3015b27360d28c restored=6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f
SHA256 scripts/claims-check.mjs before=0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487 mutated=990b0183117bf1007e5e47159b3e4af7cbf9c845d516cec977ad174499071e68 restored=0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487
SHA256 scripts/anchor-truth.mjs before=f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c mutated=694465ca011cfe339775a338fa6fff7efcec8ea28a579b73dda5a258191c5805 restored=f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c
After the initial attempt and every completed detector run: pgrep -f '/fast/scratch/hyaku/kumitate-r47/seats/w1-[C]tlMention' returned exit=1, stdout empty, pids=none. No process tree required killing.
Host-space check command: df -h /fast; observed /dev/nvme1n1p2 804G size, 684G used, 120G available, 86% used. No tool installs or updates.
Lane writes restricted to CtlMention.md and CtlMention.patch. Mutation preserved in exported patch; scratch files restored exactly. No lane/fleet git writes.
