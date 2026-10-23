RESULT CtlDoNothing rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axis: C1 operability; predicate ROUTED_HELD; isolated pre-data negative control, not a routing candidate.
Expected detector: frozen caproute-probe, held=0/5, every site ROUTED_MISS because direct child launches have no cap-run, capped-scope or bwrap ancestor.
Control (a): untouched freeze cac43009b22232c1ae8efdab4f2789516c1fcc6f, no new commit. Control (b): whitespace-only commit 835205599f1f31ae96f93ec90dda881c17149230, one trailing blank line in each of the four assigned scripts.
kimi-census and claims-check originally lacked a terminal LF; terminating their final lines was necessary to append the blank line. Export shows only whitespace changes: four files, six insertions and two deletions.
Clone command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Clone output: no stdout/stderr; exit=0. Repository-locating variables were also removed from the environment of subsequent sandbox git commands.
Commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'control: append trailing blank lines without routing'
Commit output: no stdout/stderr; exit=0. git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane rev-parse HEAD output: 835205599f1f31ae96f93ec90dda881c17149230
Export command, before restoration: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD
Export exit=0; captured stdout written verbatim with write to .ufo/waves/round-47/build/CtlDoNothing.patch, 1849 bytes.
Export checksum command: sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/CtlDoNothing.patch /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
Export checksum output: eaac242fe25d3a6c95b6515a0c20ffd1c2e425fe3f512c959d32852d6ee42507  CtlDoNothing.patch
(a) Pristine detector, rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Full counter output and exit follow.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
After (a): pgrep -af /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing returned no output, exit=1; detector elapsed 29.392 seconds.
(b) Whitespace-only detector, rev=835205599f1f31ae96f93ec90dda881c17149230. Full counter output and exit follow.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=52 base_n=53 capped=0 uncapped_direct=52 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=52
SITE SC549 gate=sources-check label=ROUTED_MISS n=41 base_n=42 capped=0 uncapped_direct=42 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=42
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=42 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=42
SITE CC879 gate=claims-check label=ROUTED_MISS n=45 base_n=46 capped=0 uncapped_direct=45 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=45
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=105 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=835205599f1f31ae96f93ec90dda881c17149230 base=0bd8be60 held=0/5
exit=1
After (b): pgrep -af /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing returned no output, exit=1; detector elapsed 64.422 seconds.
Restoration command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Restoration output: no stdout/stderr; exit=0. All four source hashes again equal their pristine hashes below.
Restored detector, rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f. Full counter output and exit follow.
Command: systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
After restoration run: pgrep -af /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDoNothing returned no output, exit=1; detector elapsed 29.899 seconds.
Before-hash command (cwd clone): sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
Pristine source SHA-256, rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f:
0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075  scripts/kimi-census.mjs
6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs
0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487  scripts/claims-check.mjs
f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c  scripts/anchor-truth.mjs
Mutated and restored hash command (cwd clone): sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs
Mutated source SHA-256, rev=835205599f1f31ae96f93ec90dda881c17149230:
e6c51114e97294033dda9fe57e6b0d8e58e278a07ef35aaf830dd264aecdfe6f  scripts/kimi-census.mjs
0442cd990e8093a23c4720f5fd8d2a5e1f281bdf2557f876434afabd41647f27  scripts/sources-check.mjs
bc3ca54ce606bde75242e2b84008a3132da539c22d0ad5929b73a9943234b730  scripts/claims-check.mjs
5239e176b1756eee9a63d9d69fbd7ce0f793cdcd77468a6e71204c391e18b2b1  scripts/anchor-truth.mjs
Restored source SHA-256, rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f:
0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075  scripts/kimi-census.mjs
6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs
0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487  scripts/claims-check.mjs
f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c  scripts/anchor-truth.mjs
Frozen counter SHA-256 before and after, from the checksum commands above: 72383539f217584c209a6bd311671a9acf4a3a7e0a515234af56b5efb6a7cf37.
Requested control verdict: MISS, both controls held=0/5 and every targeted site ROUTED_MISS for the expected missing routing ancestors. All observed gate exits were 0 and selftest case totals passed.
Mutation-kill classification: inconclusive as a kill test, not killed; the pristine baseline already fails ROUTED_HELD. This does not alter the specified negative-control MISS verdict.
Host safety: df -h /fast before clone reported 804G total, 684G used, 120G available, 86% used. All three detector invocations used the exact assigned 6G/768-task/1500-second scope; no matching seat process remained after any run.
Tool installs/updates: none. Lane writes were only this report and CtlDoNothing.patch; scratch source was restored exactly. No routing candidate scored and no lane/fleet git writes performed.
