RESULT CtlFirstCallOnly rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axes: operability and detector specificity. This is a scratch-only pre-data control, not a C1 candidate.
Mutant: each of the five sites has its own module-level invocation counter; invocation 1 uses capSpawnSync with explicit env and a bind of the selftest temporary root; every later invocation uses the original raw spawnSync options. No cases were removed; cap-run.mjs and cap-spawn.mjs were unchanged.
Control commit: f860fc8956902c0f83d4a863250ff2ce7391962d, based on cac43009b22232c1ae8efdab4f2789516c1fcc6f.
Expected detector: held=0/5; all targeted sites ROUTED_MISS for uncapped direct children; the four repeated-node sites additionally have uncapped candidates. SC859 runs once, so its candidate is capped but its gate still has uncapped direct children.
Mutation interpretation: the ordinary selftests SURVIVED this defect (all pass in all three states). The routing control is MISS as expected. Differential routing-kill attribution is INCONCLUSIVE, not a claimed killed mutant: pristine already has held=0/5 and exit 1.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Observed: exit 0, no stdout/stderr; sandbox HEAD cac43009b22232c1ae8efdab4f2789516c1fcc6f. Repository-locating git environment variables were also removed from every subsequent subprocess environment.
Capacity command: df -h /fast. Observed: /dev/nvme1n1p2 804G total, 685G used, 119G available, 86% used.
Frozen probe body SHA256: 72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37 (computed with hashlib.sha256(pathlib.Path(probe).read_bytes()).hexdigest()).
Identical bounded selftest commands were run separately on pristine, mutated and restored bytes, from the sandbox clone:
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane/scripts/kimi-census.mjs --selftest
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane/scripts/sources-check.mjs --selftest
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane/scripts/claims-check.mjs --selftest
systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane/scripts/anchor-truth.mjs --selftest
Pristine rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f outputs, in command order:
KIMI_CENSUS_SELFTEST: 54/54 pass | VERDICT: PASS; exit=0; wall=1.237s
SOURCES_SELFTEST: 46/46 pass | VERDICT: PASS; exit=0; wall=1.056s
CLAIMS_SELFTEST: 47/47 pass | VERDICT: PASS; exit=0; wall=1.143s
ANCHOR_TRUTH_SELFTEST: 44/44 pass | VERDICT: PASS; exit=0; wall=4.386s
Mutated bytes, rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f plus the four mutations (subsequently committed unchanged as f860fc8956902c0f83d4a863250ff2ce7391962d):
KIMI_CENSUS_SELFTEST: 54/54 pass | VERDICT: PASS; exit=0; wall=1.204s
SOURCES_SELFTEST: 46/46 pass | VERDICT: PASS; exit=0; wall=1.222s
CLAIMS_SELFTEST: 47/47 pass | VERDICT: PASS; exit=0; wall=1.189s
ANCHOR_TRUTH_SELFTEST: 44/44 pass | VERDICT: PASS; exit=0; wall=4.672s
Restored rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f outputs:
KIMI_CENSUS_SELFTEST: 54/54 pass | VERDICT: PASS; exit=0; wall=1.937s
SOURCES_SELFTEST: 46/46 pass | VERDICT: PASS; exit=0; wall=1.484s
CLAIMS_SELFTEST: 47/47 pass | VERDICT: PASS; exit=0; wall=1.443s
ANCHOR_TRUTH_SELFTEST: 44/44 pass | VERDICT: PASS; exit=0; wall=5.964s
Commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'control: route only first invocation at five C1 child sites'; observed exit=0, no stdout/stderr.
Same exact counter command for each of the following three HEAD states:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane HEAD; echo exit=$?
Pristine rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f; wall=24.672s; full output (stderr empty):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Mutated rev=f860fc8956902c0f83d4a863250ff2ce7391962d; wall=37.965s; full output (stderr empty):
SITE K488 gate=kimi-census label=ROUTED_MISS n=52 base_n=53 capped=1 uncapped_direct=51 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=51
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=41 capped=1 uncapped_direct=41 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=41
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=1 uncapped_direct=41 cases=46/46 base_cases=46/46 gate_exit=0 reason=uncapped_direct_children=41
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=1 uncapped_direct=45 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=45
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=1 uncapped_direct=105 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=105
CAPROUTE_PROBE rev=f860fc8956902c0f83d4a863250ff2ce7391962d base=0bd8be60 held=0/5
exit=1
Restored rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f; wall=40.095s; full output (stderr empty):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=105 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
All five sites have capped=1 in the mutant, all gate_exit=0, and unchanged passing case totals. Every target is ROUTED_MISS for the predicted reason; SC859 is rejected solely by uncapped_direct_children=41. Exec counts varied between runs; they are recorded without substituting case totals.
SHA256 command in the Eval subprocess controller: {p: hashlib.sha256((clone/p).read_bytes()).hexdigest() for p in files}; observed before / mutated / restored hashes:
scripts/kimi-census.mjs 0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075 / d1d708b040afcd43a98cd041723038128e15efa0cbdf3708af576ee21d72f82c / 0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075
scripts/sources-check.mjs 6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f / ab344b06a62186838e0a3db99620786c2d8acb4037837503fde4527fd29a6c1d / 6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f
scripts/claims-check.mjs 0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487 / 7b831a2f322100283329ea2e9aefff575bfb60fe978cdc615f63cb893a12345b / 0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487
scripts/anchor-truth.mjs f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c / 00f8a671566f8d9857641ba1c4c91ae6a53c0bfef4ec1394552428a5012092be / f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c
Restoration command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f; observed exit=0, no stdout/stderr. assert restored_hashes == before_hashes and direct comparison against original byte snapshots both succeeded for 4/4 files.
Export command (before restoration): git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlFirstCallOnly.patch
Observed export exit=0; 7237 bytes; SHA256 35fca2c220a6702e6f489cb2a66ce599a46e29154dc0f75db81bd1d6b9ee1ee6. Export had RLIMIT_FSIZE=1048576; each captured log was checked below 4 MiB.
After each of the 15 bounded runs: pgrep -af /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly returned exit=1 with empty output; no process tree needed killing and no background jobs were started.
Full selftest stdout/stderr and exact argument arrays are retained under /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFirstCallOnly/<pristine|mutated|restored>-<gate>.json; full counter records are <stage>-counter.json in the same directory.
Only this report and CtlFirstCallOnly.patch were written in the lane. No lane/fleet git writes, sibling edits, operator-content reads beyond RULES.md, tool installs, or host configuration changes.
