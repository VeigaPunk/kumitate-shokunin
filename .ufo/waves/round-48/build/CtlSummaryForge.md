RESULT CtlSummaryForge verdict=expected-rejection

## Finding — operability / C1 / ROUTED_HELD

The forged-summary control was rejected at every site, with the targeted `exec_count_ne_base` reason (also `no_child_exec`). There was no `ROUTED_HELD` site and no counter exit 2. This was not an incidental selftest failure: both owning gates exited 0 in all three mutant runs, retained the base summary totals, had final PASS verdicts, and had zero FAIL lines. Each mutant trace contained only its root Node exec.

Mutation-test classification: **inconclusive as a differential kill**, not a killed-mutant claim, because the pristine frozen tip already returns `ROUTED_MISS` / exit 1. The narrower pre-data negative-control observation is conclusive: this specific summary forgery receives the expected targeted rejection. This report does not score or judge a C1 candidate.

Evidence: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt:3-14`; frozen counter `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs:363-370` checks missing children, base exec counts and suite conditions separately.

## Mutant and retained commit

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane`.
- Starting freeze: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Control commit: **`8397d84b7492b946680cd5986be5ce187e3c81f0`**, author/committer `ctl <ctl@local>`.
- At that commit, `scripts/round-gate.mjs:635-638` replaces the `--selftest` dispatch with an immediate write of `ROUND_GATE_SELFTEST: 61/61 pass\nVERDICT: PASS\n` and return 0.
- At that commit, `scripts/surface-probe.mjs:1831-1834` replaces the `--selftest` dispatch with an immediate write of `46/46 cases passed\nVERDICT: PASS\n` and return 0.
- These two dispatch changes bypass the real suites, including all four claimed launch sites. No launch-site implementation or counter was edited. The actual Node executions in the receipt establish that both files remained syntactically valid and runnable.
- Export: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge.patch` contains only the control commit, not the subsequent restoration.

Clone command (exit 0, no output):

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE && mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Control commit command and verbatim output:

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane -c user.name=ctl -c user.email=ctl@local commit -m 'r48 control: forge selftest summaries without launching children'
```

```text
[detached HEAD 8397d84] r48 control: forge selftest summaries without launching children
 2 files changed, 8 insertions(+), 2 deletions(-)
```

Patch export argv (executed with stdout opened at the stated export path):

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..8397d84b7492b946680cd5986be5ce187e3c81f0
```

## Expected detector and exact invocations

Expected mutant result: all four sites `ROUTED_MISS`, including `exec_count_ne_base`, `held=0/4`, exit 1. The supplied base totals are 116, 2, 2 and 14 child execs; forging the summaries must not satisfy those trace requirements. The additional `no_child_exec` rejection is also direct evidence of the targeted suppressed launches, not an incidental failure. No hypothetical incidental-failure exemption is needed; the independent base-exec-count condition already caught this control.

All three commands below were executed from `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge`, with `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` removed from the subprocess environment. Python `subprocess.Popen` sent stdout and stderr to each receipt and appended the actual `exit`, `load1` and UTC `end` trailer. Each command used the lane's frozen counter directly, with the same 1500-second timeout. The wrapper waited for the command, then attempted SIGKILL of its isolated process group and reaped it before returning.

Pristine:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Mutated:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane 8397d84b7492b946680cd5986be5ce187e3c81f0 --set r48
```

Restored:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane da92cc2d426e7d6ed7eb03ccfdcd2aaaaf937079 --set r48
```

## Mutant receipt — verbatim

Path: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=69 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=14 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=1 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=1 resumed=0 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=1 resumed=0 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_child_exec,exec_count_ne_base
CAPROUTE48 rev=8397d84b7492b946680cd5986be5ce187e3c81f0 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=50.96 end=11:56:08Z
```

## Pristine receipt — verbatim

Path: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/CtlSummaryForge-pristine-receipt.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=25 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=9 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=32 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=27 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=23 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=102 resumed=16 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=102 resumed=9 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=102 resumed=12 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=44.44 end=11:54:38Z
```

## Exact restoration and restored receipt

The original dispatch lines were restored byte-for-byte after the mutant run. A separate local commit preserves both the runnable control as its parent and an archiveable restored tree:

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane -c user.name=ctl -c user.email=ctl@local commit -m 'Restore exact pre-control gate bytes after r48 probe'
```

```text
[detached HEAD da92cc2] Restore exact pre-control gate bytes after r48 probe
 2 files changed, 2 insertions(+), 8 deletions(-)
```

Restoration commit / final sandbox HEAD: `da92cc2d426e7d6ed7eb03ccfdcd2aaaaf937079`.

Command:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane rev-parse fe3d45bf929246915c8c0de5f7f8682b5015b22c^{tree} da92cc2d426e7d6ed7eb03ccfdcd2aaaaf937079^{tree}
```

Verbatim output:

```text
be1455f0631ea8c2b53cb50f5105327c51bb7ab1
be1455f0631ea8c2b53cb50f5105327c51bb7ab1
```

Restored receipt path: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/CtlSummaryForge-restored-receipt.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=32 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=8 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=32 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=29 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=36 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=102 resumed=12 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=102 resumed=17 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=102 resumed=17 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=da92cc2d426e7d6ed7eb03ccfdcd2aaaaf937079 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=58.79 end=11:58:05Z
```

## Before / mutant / restored SHA-256 evidence

Hashes were obtained using `sha256sum` on the absolute paths. The first two rows are files under `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/lane/`.

| File | Pristine | Mutant | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `843843731cada9cdd6cb30ba5ccf9d7aa51167359e225059c740e60ae44bb844` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `161a98917e1ebb19101faf850d5d4b7015242defe44e29a37e8eae942d7afef1` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| Frozen lane counter | `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` | `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` | `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |

The sandbox's freeze-copy counter had the same SHA-256 as the lane counter before and after mutation; it was never the invoked detector. The final lane-counter hash was recorded after the restored run.

Final artifact hashes (verbatim `sha256sum` output):

```text
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs
1e7ece855aec399536224adb12199a0a36f1a603852a57cd149306967f4ae232  /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/CtlSummaryForge-pristine-receipt.txt
de2794ea6d7784cf9718e88630bf47bb8a67765e5330fd3384e215d3c7cb641b  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt
b83d351fdf1e5b2fb8e408a8c040d7c30a008479ad6b3f16702681454add0c0d  /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlSummaryForge/CtlSummaryForge-restored-receipt.txt
bca6f4e0b8d2359855769ac3cbe5ec3845433ab97e802d5c6cf456584ddece51  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge.patch
```

## Bounds and tooling

- `df -h /fast` before cloning reported `/dev/nvme1n1p2 804G 735G 70G 92% /fast`.
- No tools were installed or updated; no pacman transaction was attempted.
- Only this report, its named receipt and its named patch were written in the lane. All git writes were in the isolated sandbox with the three git-routing variables unset.
- No subagents, integration, shipping, candidate scoring, unrelated tests or other runtime were invoked. The assigned pristine/mutant/restored frozen-counter probe is complete.
