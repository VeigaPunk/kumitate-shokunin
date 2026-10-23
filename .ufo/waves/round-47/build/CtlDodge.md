RESULT CtlDodge rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802
Axes: C1 operability and negative-control discrimination. No routing candidate was scored.
Mutant: copy each of the four gates with copyFileSync(TOOL_FILE, join(tmp, 'g.mjs')) at selftest start and spawn that copy raw; rename the parity shell's $0 to scp-parity. Helpers moved inside selfTest only to capture the temporary path. No runner, scope, sandbox, fake child, or case deletion added.
Expected detector: every targeted site ROUTED_MISS, held=0/5, with no_child_exec and uncapped_direct_children despite passing selftests.
Control commit: c3323cb51e63bdfe665c31fe75bdf3f379278dd6. Frozen/pristine/restored revision: cac43009b22232c1ae8efdab4f2789516c1fcc6f.
Setup command: unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
Storage command: df -h /fast; observed /dev/nvme1n1p2 804G total, 685G used, 119G available, 86% used.
After the initial pristine run: export TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/tmp; mkdir -p "$TMPDIR". All subsequent runs inherited or explicitly set this TMPDIR.
Exact counter command, run for pristine, committed mutant, and restored HEAD:
systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane HEAD; echo exit=$?
Pristine rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f, observed output (initial and TMPDIR-confined repeat identical; wall times 28.35s and 26.21s):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Selftest commands below ran from the scratch clone on the exact working bytes subsequently committed as c3323cb51e63bdfe665c31fe75bdf3f379278dd6; every command exited 0. Quoted outputs are final summaries.
env TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/kimi-census.mjs --selftest
Output: KIMI_CENSUS_SELFTEST: 54/54 pass; VERDICT: PASS (1.30s).
env TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/sources-check.mjs --selftest
Output: SOURCES_SELFTEST: 46/46 pass; VERDICT: PASS; parity node=4/1/1 awk=4/1/1 (1.05s).
env TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/claims-check.mjs --selftest
Output: CLAIMS_SELFTEST: 47/47 pass; VERDICT: PASS (1.21s).
env TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/tmp systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 node scripts/anchor-truth.mjs --selftest
Output: ANCHOR_TRUTH_SELFTEST: 44/44 pass; VERDICT: PASS (4.66s).
Commit command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane -c user.name=ctl -c user.email=ctl@ctl commit -qam 'control: dodge child signatures with copied gates and parity label' && git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane rev-parse HEAD
Output: c3323cb51e63bdfe665c31fe75bdf3f379278dd6
Mutant rev=c3323cb51e63bdfe665c31fe75bdf3f379278dd6; exact counter command above; full observed output (56.18s):
SITE K488 gate=kimi-census label=ROUTED_MISS n=0 base_n=53 capped=0 uncapped_direct=52 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_child_exec,uncapped_direct_children=52
SITE SC549 gate=sources-check label=ROUTED_MISS n=0 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_child_exec,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=0 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_child_exec,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=0 base_n=46 capped=0 uncapped_direct=45 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_child_exec,uncapped_direct_children=45
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=0 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_child_exec,uncapped_direct_children=106
CAPROUTE_PROBE rev=c3323cb51e63bdfe665c31fe75bdf3f379278dd6 base=0bd8be60 held=0/5
exit=1
Export command before restoration: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane format-patch --stdout cac43009b22232c1ae8efdab4f2789516c1fcc6f..HEAD
Its bounded stdout was written verbatim with the write tool to .ufo/waves/round-47/build/CtlDodge.patch: 8119 bytes, SHA256 ed734932a52ef1dda243cd59e979effe55e429e13284f70dbc30712dede4e1b5.
Restoration command: git -C /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f && sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs
Hash command at each state: sha256sum scripts/kimi-census.mjs scripts/sources-check.mjs scripts/claims-check.mjs scripts/anchor-truth.mjs
Pristine and restored SHA256 outputs were identical:
0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075  scripts/kimi-census.mjs
6a293a72800123a2a78184e4e67b34a8eeab2e35e15cc0bc353029c9f37e258f  scripts/sources-check.mjs
0b2d0d24e4ee83c8934a9e9390aeee9105a8e3f9b203997c7a68b7b5b74de487  scripts/claims-check.mjs
f31ce40f91548d5b2c318584c7f7b3f1cc43bad2bdd814e956f45d1cf520055c  scripts/anchor-truth.mjs
Mutant SHA256 outputs:
17dca32f0c66ea653ee2b480e4b85949341c34504ad518b979f000206ca1a948  scripts/kimi-census.mjs
68b1512f6be5f6abb95fcc9c1e2ac08daca1959517b7a52c994727b7f0669d41  scripts/sources-check.mjs
1094fca7840cfcd04d410ae03bc3833a61b083ce5fa7345fd6ea7411b4e09ce9  scripts/claims-check.mjs
d327d036b1357e035371a4fba1704ecdb6de8038dc64faea0b07db4d34d1d946  scripts/anchor-truth.mjs
Restored rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f; exact counter command above; full observed output (29.38s):
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=53 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=53
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=43 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,canary_in_env,uncapped_direct_children=43
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=46 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=46
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=106 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor,no_bwrap_ancestor,uncapped_direct_children=106
CAPROUTE_PROBE rev=cac43009b22232c1ae8efdab4f2789516c1fcc6f base=0bd8be60 held=0/5
exit=1
Cleanup command after both pristine runs, the four selftests, the mutant counter, and the restored counter: pgrep -af '^([^ ]*/)?(node|sh|bash|timeout|strace|prlimit|bwrap|systemd-run)( |$).*/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlDodge/'
Each cleanup check observed no output, exit 1 (no matching processes); none required killing.
Verdict: specified negative control MISS on all five sites with both expected reasons and unchanged passing case totals. Mutation kill attribution is inconclusive, not killed: the pristine counter already exits 1. No coverage survival claimed.
Restoration evidence: scratch HEAD returned to the frozen revision and all four file hashes exactly matched pristine; control survives as the exported patch and scratch commit, not as working-tree changes.
Tools installed or updated: none. Only CtlDodge.md and CtlDodge.patch were written inside the lane; no lane/fleet git writes, operator configuration reads beyond RULES.md, gate-mutants runs, or subagent dispatches.
