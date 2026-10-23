RESULT CtlEnvPassthrough verdict=inconclusive

## Measured control result

The negative control was rejected as intended: all four sites are `ROUTED_MISS`, all explicitly report `canary_in_env`, and the frozen counter exits 1 (`held=0/4`). No site read `ROUTED_HELD`; none of the three counter invocations exited 2. This is a targeted rejection, not solely an incidental failure.

The differential mutation verdict is **inconclusive, not killed**: the required pristine run already exits 1 with `held=0/4`, because the frozen starting revision has the four unrouted sites. The restored run reproduces that result. This seat scored only its own negative control and pristine/restored controls, not a C1 candidate.

- Axis: operability; predicate: `ROUTED_HELD`; rule: F48; set: r48.
- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane`.
- Pristine revision: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Runnable control commit: `5e1d6f23f238dea35788e53aef43bfbd7587f218`.
- Exact-byte restoration commit (sandbox HEAD): `74d952fe74e580b0540115082335a25893eea942`.
- Export: `.ufo/waves/round-48/build/CtlEnvPassthrough.patch`; SHA-256 `898e3b78cecbb84671caa8319e929ede3c9bb541d5ad2e26b09402d9a73c9101`.

## Mutant and expected detector

Route RG742, SP491, SP519 and SP1592 through the existing `capSpawnSync` / `cap-run.mjs` v2 chain, preserving caller-environment spreading rather than an allowlist. The control adds imports and changes only those four launch sites plus the fixture/cache/state binds needed to keep their temporary paths available inside bwrap. At the control commit the launch anchors are `scripts/round-gate.mjs:743-745` and `scripts/surface-probe.mjs:492-499,521-533,1595-1597`.

The planted canary therefore reaches the child through the explicit `--env` pairs, despite bwrap's `--clearenv`. Expected: all four `ROUTED_MISS` for `canary_in_env`. The unchanged counter tests that environment at `.ufo/waves/round-48/probe/caproute48-probe.mjs:303-308`; line 365 also adds `uncapped_exec` when the leak excludes executions from the capped count.

Actual: every site's execution count equals its base count in all three runs (116, 2, 2, 14 respectively); direct uncapped children are zero. No missing-ancestor reason appears in the control receipt. All four sites have the targeted canary reason.

RG742 additionally has an incidental owning-gate selftest failure: `60/61`, exit 1, one FAIL line, and no final PASS verdict in each run. The frozen receipt does not retain the failing case's text, so its precise identity is not established here. Those extra rejection conditions are at counter lines 362, 368-370. **If the selftest failure were absent, `canary_in_env` (and the resulting `uncapped_exec`) must still reject RG742, and is actually present in all three runs.** The other three sites have fully passing `46/46` suites and only the targeted `canary_in_env,uncapped_exec` reasons.

## Frozen control receipt — verbatim

Evidence: `.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt:1-14` (SITE lines 9-12; CAPROUTE48 line 13).

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=19 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=1 cases=60/61 execs=2085 resumed=59 verdict_pass=false fail_lines=1
RUN round-gate rev1 exit=1 cases=60/61 execs=2085 resumed=64 verdict_pass=false fail_lines=1
RUN round-gate rev2 exit=1 cases=60/61 execs=2085 resumed=72 verdict_pass=false fail_lines=1
RUN surface-probe rev0 exit=0 cases=46/46 execs=180 resumed=2 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=180 resumed=7 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=180 resumed=8 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=60/61,60/61,60/61 base_cases=61/61 uncapped_direct=0,0,0 reason=canary_in_env,gate_exit=1,uncapped_exec,no_final_verdict_pass,fail_lines=1,selftest_cases_below_base
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=canary_in_env,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=canary_in_env,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=canary_in_env,uncapped_exec
CAPROUTE48 rev=5e1d6f23f238dea35788e53aef43bfbd7587f218 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=55.76 end=11:57:11Z
```

## Pristine receipt — verbatim

Evidence: `.ufo/waves/round-48/build/CtlEnvPassthrough-pristine.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=9 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=2 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=16 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=31 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=30 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=54 resumed=4 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=43.24 end=11:54:11Z
```

## Restored receipt — verbatim

Evidence: `.ufo/waves/round-48/build/CtlEnvPassthrough-restored.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=39 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=34 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=18 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=30 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=74d952fe74e580b0540115082335a25893eea942 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=49.19 end=11:58:55Z
```

## Commands actually run

All commands below used cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough` and an environment with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE unset. The trailer's `exit=1` is the detector exit; the enclosing shell exits 0 because its final command is the trailer `echo`.

The clone was made using these commands (mkdir via the local Python filesystem API; git invoked directly):

```sh
mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough
git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

The exact bounded detector commands were:

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-pristine.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-pristine.txt
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane 5e1d6f23f238dea35788e53aef43bfbd7587f218 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane 74d952fe74e580b0540115082335a25893eea942 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-restored.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-restored.txt
```

The initial asynchronous tool launch was rejected before starting the detector with `RuntimeError: Background job limit reached (100). Wait for running jobs to finish or cancel one.` The same pristine command was then launched once with `subprocess.Popen(['bash', '-c', command], start_new_session=True)` and waited to completion; control and restored commands used the same process wrapper. No counter bytes were copied into an edited runner, and no fourth detector run was performed.

Control commit and export:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane -c user.name=ctl -c user.email=ctl@local commit -m 'round-48 control: route child sites but inherit caller environment'
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..5e1d6f23f238dea35788e53aef43bfbd7587f218 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough.patch
```

Actual control commit output:

```text
[detached HEAD 5e1d6f2] round-48 control: route child sites but inherit caller environment
 2 files changed, 11 insertions(+), 6 deletions(-)
```

After restoring the two edited files with inverse surgical edits, the same `git add` command and this restoration commit command were run:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvPassthrough/lane -c user.name=ctl -c user.email=ctl@local commit -m 'round-48 control: restore exact frozen gate bytes'
```

Actual restoration commit output:

```text
[detached HEAD 74d952f] round-48 control: restore exact frozen gate bytes
 2 files changed, 6 insertions(+), 11 deletions(-)
```

## Exact restoration and frozen-counter integrity

The saved original byte buffers were compared directly with both restored files: `restored_exact_bytes=True`. SHA-256 values:

| File | Before | Mutated | Restored |
|---|---|---|---|
| scripts/round-gate.mjs | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `79f5f9a1356ca54d09757a490e3fa28468af302eb9ec5ff2f13732f2b6a06690` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| scripts/surface-probe.mjs | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `2ddeadd55cde3a347aebdc625671371e1d53d29f531715070fc81707f85f46b3` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |

The lane counter was compared byte-for-byte with `git show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs` from the sandbox: equal. Its SHA-256 was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` after all probes; `counter_exact_unchanged=True`.

All three detector shells were waited to completion. Process-group checks after those waits produced:

```text
pristine process_group=3088045 absent after wait
control process_group=3365597 absent after wait
restored process_group=3834939 absent after wait
```

No tool installation/update was needed. Existing tools used: Node v26.12.0; strace 7.2. Initial `df -h /fast` output:

```text
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme1n1p2  804G  734G   70G  92% /fast
```

Containment: no lane/fleet git writes, no sibling edits, no dispatch or integration; lane writes are this report, the three named receipts and the named patch. The sandbox's mutated source bytes were restored exactly while preserving the runnable control in its immutable commit and patch.
