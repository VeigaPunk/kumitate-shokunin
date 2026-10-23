RESULT CtlNestedAllowance verdict=targeted-control-rejected

## Finding

The runnable negative control was rejected at all four sites for the targeted conditions: RG742 and SP1592 have `exec_count_ne_base`; SP491 and SP519 have `uncapped_exec`. No site read ROUTED_HELD, and no completed counter invocation exited 2. This is not an incidental selftest failure: all three mutant round-gate runs exited 0 with 61/61 cases, and all three mutant surface-probe runs exited 0 with 46/46 cases; all had final PASS and zero FAIL lines. Evidence: `.ufo/waves/round-48/build/CtlNestedAllowance-receipt.txt:1-14`.

Mutation-kill accounting: **inconclusive as a conventional pristine-to-mutant kill** because the required pristine routing detector already exits 1 with held=0/4. No killed-mutant credit is claimed. The pre-data negative-control question itself has a conclusive targeted rejection; the pristine and restored gate suites are valid, not infrastructure failures. No C1 routing candidate was scored.

## Mutant and runnable artifact

- Commit: `3c1a9b0568a6c4e327fd6072f7a9b61167494001` (parent `fe3d45bf929246915c8c0de5f7f8682b5015b22c`).
- Clone: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane`; retained branch `ctl/r48-nested-allowance`.
- Patch: `.ufo/waves/round-48/build/CtlNestedAllowance.patch` (SHA-256 `51720b1b5ba4f21ebb875b6725091cbfc567c114eb9f68c29e86118a5295839d`).
- RG742/SP1592 append a literal `--selftest` to every actual gate-child argv. A control-only child-entry marker consumes only that appended argument, preserving the original CLI behavior rather than recursively running or suppressing its tests. Patch evidence: `CtlNestedAllowance.patch:47-50,71,116` (all patch pointers in this report are under `.ufo/waves/round-48/build/`).
- All four sites use a raw direct `node <owning-gate> --selftest`-shaped wrapper. That wrapper forwards the original raw launch, output, cwd, environment and exit status; neither launch is routed through cap-run. Patch evidence: `CtlNestedAllowance.patch:26-45,98,107`. The canary remains inherited.
- The named direct-child allowance is exercised successfully: every mutant site reports `uncapped_direct=0,0,0`, versus pristine 58 for round-gate and 9 for surface-probe. It does not waive the site-count/ancestry checks. The extra literal flag removes RG742/SP1592 from the child matcher, giving 0 versus base 116/14; the two surface-reader sites remain matched 2/2 but lack every required cap ancestor and retain the canary. Frozen counter evidence: `.ufo/waves/round-48/probe/caproute48-probe.mjs:66-74,263-277,303-308,363-365`.

## Exact commands and output

Git identity variables GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE were unset for every git operation. The clone was created by the following command (all writes are confined to this seat):

```sh
mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Mutant commit command:

```sh
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false commit -m 'round-48 control: abuse nested selftest allowances'
```

The same unedited lane counter and the same timeout bound were used on pristine, mutated and restored revisions, cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance`. Stdout and stderr were captured together into the named receipts; the actual exit status, /proc/loadavg load1 and UTC end time were appended after each process completed. Each receipt was capped at 1 MiB (actual receipts are much smaller).

### Pristine

```sh
/usr/bin/timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Receipt: `.ufo/waves/round-48/build/CtlNestedAllowance-pristine-receipt.txt:1-14`.

Verbatim summary (the complete SITE/RUN output is in the receipt):

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=41.36 end=11:55:15Z
```

### Mutated

```sh
/usr/bin/timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane 3c1a9b0568a6c4e327fd6072f7a9b61167494001 --set r48
```

Receipt: `.ufo/waves/round-48/build/CtlNestedAllowance-receipt.txt:1-14`.

Verbatim full receipt (including every SITE and CAPROUTE48 line):

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=38 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=10 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1424 resumed=32 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1424 resumed=47 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1424 resumed=48 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=120 resumed=4 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=120 resumed=8 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=120 resumed=12 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base
CAPROUTE48 rev=3c1a9b0568a6c4e327fd6072f7a9b61167494001 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=53.79 end=11:58:45Z
```

### Restored

```sh
/usr/bin/timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Receipt: `.ufo/waves/round-48/build/CtlNestedAllowance-restored-receipt.txt:1-14`.

Verbatim summary (the complete SITE/RUN output is in the receipt):

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=41.15 end=12:00:00Z
```

Patch export command (stdout captured byte-for-byte into the patch):

```sh
/usr/bin/git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..3c1a9b0568a6c4e327fd6072f7a9b61167494001
```

## Restoration and frozen-byte evidence

After the mutant run, a finally block executed:

```sh
/usr/bin/git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Observed: `RESTORE_CHECKOUT exit=0 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c`. SHA-256 values:

| File | Pristine | Mutated | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `b030d4445d24228e7fadc6725913794348f7d9fac9446036fec5ba9dc3bccfc5` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `fb8bca2fe0ddb8cfd83f464efef203a2bbae831ec8ecc2336c10fff22ee04ddd` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| `scripts/r48-nested-raw-control.mjs` | absent | `f8b8833485ec5d43b828e6cd3033a0f8933734f5d2fbdb117a35b668a70c36e8` | absent |

Exact-byte equality was checked before the restored detector run; both original files match pristine, and the added helper is absent. The mutant commit remains available on its retained branch and in the patch.

The invoked lane counter SHA-256 before mutation and after restoration was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`. The same hash was obtained from `git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlNestedAllowance/lane show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs`; therefore the invoked bytes match the frozen commit, not an edited counter.

All started detector process groups were checked after completion; none remained:

```text
PROCESS_GROUP pristine pgid=3358107 absent
PROCESS_GROUP mutated pgid=3740917 absent
PROCESS_GROUP restored pgid=4040289 absent
```

## Invocation correction, resources and tooling

An initial pristine invocation incorrectly named `/usr/bin/node`, which is absent. It did not execute the counter and is not a score. Exact evidence is preserved in `.ufo/waves/round-48/build/CtlNestedAllowance-pristine-attempt0-receipt.txt:1-3`:

```text
timeout: failed to run command ‘/usr/bin/node’: No such file or directory
exit=127 load1=40.16 end=11:53:55Z
```

The command was corrected to the assigned PATH-resolved `node`; the real pristine, mutant and restored counter invocations all completed with exit 1. `command -v node && node --version` observed `/run/user/1000/fnm_multishells/3080862_1792736886849/bin/node` and `v24.21.0`. `df -h /fast` before cloning reported 69G available. No tools were installed or updated, no package transactions were run, no lane/fleet git writes occurred, and no sibling source was changed.
