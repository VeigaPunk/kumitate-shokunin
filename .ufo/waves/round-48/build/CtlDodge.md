RESULT CtlDodge verdict=targeted_miss

Both controls were rejected at all four sites for their targeted reasons: (a) `exec_count_ne_base`; (b) `uncapped_exec`. No site was ROUTED_HELD and no counter invocation exited 2. Neither rejection depends on a selftest failure. Axis: operability; round 48, attempt 1, wave build only. No C1 candidate was scored.

Mutation-kill classification: **inconclusive, not killed**, because the pristine frozen revision already fails ROUTED_HELD (expected held=0/4). These measurements establish rejection of the assigned negative controls, not a positive-baseline mutation kill. All pristine, mutant and restored owning-gate selftests passed.

## Mutants and expected detector

Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane`.
Freeze: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.

- **(a), copied paths:** `5501e77ad1eeac863df420a64924cea8f5900a50`. At RG742 and SP1592, copy the gate's exact source bytes into its existing selftest temporary directory and launch that copy raw. At SP491/SP519, copy the host into the existing throwaway cache/state directory, using alternate filenames, and launch the copy raw. Nested --selftest launches remain unchanged. Source anchors at this commit: `scripts/round-gate.mjs:720-721,744`; `scripts/surface-probe.mjs:491-493,521-523,1596-1598`. Expected: the filename-based child matchers no longer recognize the executed copies, so `exec_count_ne_base` rejects every site, even though the underlying suites still execute.
- **(b), bash -c:** `6d0d13261c74433cbe130dc171aa5e433cf3c811`, parent (a). Removes the copy-path mutation and changes only the four original launch sites to `bash -c 'exec "$@"' ctl-dodge <original command and arguments>`. Source anchors at this commit: `scripts/round-gate.mjs:742`; `scripts/surface-probe.mjs:491,519,1592`. The positional-argument wrapper preserves arguments and exit status. Expected: original target exec counts match the base but `uncapped_exec` rejects every site. Surface-probe's bash -c allowance does not confer a cap-run/systemd/bwrap ancestry; round-gate has no such allowance.

Frozen detector: `.ufo/waves/round-48/probe/caproute48-probe.mjs`, rule F48. Relevant detector anchors: filename matchers `:52,66-69`; raw-direct allowances `:73-74`; direct-child evaluation `:263-277`; ancestry/canary evaluation `:280-310`; count/uncapped/selftest conditions `:347-375`. The lane counter and the clone's freeze-commit counter had identical SHA-256 before and after all runs:

```text
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2
```

Every score executed the lane's unchanged counter directly, never an edited copy.

## Exact construction and export commands

Git environment variables GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE were absent from the environment of every git and detector command. All git writes were in the sandbox clone only.

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Exit 0, no stdout/stderr. After the respective surgical edits:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false commit -m 'round 48 control (a): launch copied targets raw at alternate paths'
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane rev-parse HEAD
```

Each exited 0; commit/revision output:

```text
[detached HEAD 5501e77] round 48 control (a): launch copied targets raw at alternate paths
 2 files changed, 12 insertions(+), 4 deletions(-)
5501e77ad1eeac863df420a64924cea8f5900a50
```

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false commit -m 'round 48 control (b): launch original targets raw through bash -c'
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane rev-parse HEAD
```

Each exited 0; commit/revision output:

```text
[detached HEAD 6d0d132] round 48 control (b): launch original targets raw through bash -c
 2 files changed, 4 insertions(+), 12 deletions(-)
6d0d13261c74433cbe130dc171aa5e433cf3c811
```

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..6d0d13261c74433cbe130dc171aa5e433cf3c811 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge.patch
```

Exit 0, no stdout/stderr outside the patch file. The patch exports both commits; the second replaces, rather than compounds, the first control.

## Exact bounded detector commands

All four commands below ran with cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge`. The first control overwrote the named receipt as requested; the second and restoration runs appended to retain all evidence. The shell itself exited 0 each time; the appended `exit=1` is the actual timeout-wrapped detector status, not the echo status.

### Pristine

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 > /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/pristine-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/pristine-receipt.txt
```

Elapsed 67.165 seconds. Verbatim complete output from `pristine-receipt.txt:1-14`:

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=19 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=3 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=26 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=25 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=28 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=54 resumed=3 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=54 resumed=2 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=54 resumed=1 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=42.82 end=11:54:08Z
```

### (a) Copied paths

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane 5501e77ad1eeac863df420a64924cea8f5900a50 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt
```

Elapsed 82.106 seconds. `.ufo/waves/round-48/build/CtlDodge-receipt.txt:1-8` records all gate runs exiting 0 with 61/61 and 46/46 cases, final PASS, no FAIL lines. Verbatim SITE/CAPROUTE48/status lines at `:9-14`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_child_exec,exec_count_ne_base,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_child_exec,exec_count_ne_base,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_child_exec,exec_count_ne_base,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/0,0/0,0/0 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_child_exec,exec_count_ne_base,uncapped_direct_children=9
CAPROUTE48 rev=5501e77ad1eeac863df420a64924cea8f5900a50 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=54.97 end=11:56:27Z
```

**Targeted, not incidental:** every site has `exec_count_ne_base`. All recognized child counts become zero, while full-gate exec counts stay 1308 (round-gate) and 54 (surface-probe), identical to pristine. There is also `no_child_exec` and the raw-direct-child guard. No gate-exit, case-count, FAIL-line or final-verdict failure occurs. Without those additional guards, the frozen count-equality condition at counter `:364` still rejects the copied-path dodge.

### (b) Raw bash -c wrappers

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane 6d0d13261c74433cbe130dc171aa5e433cf3c811 --set r48 >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt
```

Elapsed 82.717 seconds. Receipt `:15-22` records all gate runs exiting 0 with 61/61 and 46/46 cases, final PASS, no FAIL lines. Verbatim SITE/CAPROUTE48/status lines at `:23-28`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec
CAPROUTE48 rev=6d0d13261c74433cbe130dc171aa5e433cf3c811 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=56.79 end=11:58:33Z
```

**Targeted, not incidental:** every site has `uncapped_exec`, all target counts equal their base counts, and every suite passes. The surface-probe sites specifically show `uncapped_direct=0,0,0`, demonstrating the allowed bash -c direct child does not evade the ancestry check. Round-gate additionally reports 58 uncapped direct children. There is no selftest failure masking the intended detector. The required ordered ancestry/canary check and capped-count condition at counter `:280-310,365` catch this control even when the direct-child allowance applies.

### Restored bytes

After exporting both commits, surgical reversal restored exactly the two originally mutated source files. The clone's HEAD remains the second control commit for reproducibility; its working source files intentionally contain the pristine bytes. The counter archives the explicitly named frozen revision, independently of HEAD/worktree state; matching source hashes below tie that archive revision to the restored bytes.

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt 2>&1; echo "exit=$? load1=$(cut -d' ' -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt
```

Elapsed 51.180 seconds. Receipt `:29-36` records all gate runs exiting 0 with 61/61 and 46/46 cases, final PASS, no FAIL lines. Verbatim SITE/CAPROUTE48/status lines at `:37-42`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=41.15 end=12:00:00Z
```

## Byte restoration evidence

Actual SHA-256 from `sha256sum` on the two sandbox source paths, before mutation, at each committed control, and after restoration:

| State | scripts/round-gate.mjs | scripts/surface-probe.mjs |
|---|---|---|
| Pristine | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| Control (a) | `cc245bae08d84e4222f37d27af3b12ebe4b4d3697af25f791638ba623063d9fc` | `ba817f2f0eeb361eeb7e959a325c40dada0edfdf1dd7b8af65bb15f4c055d7c3` |
| Control (b) | `248c30fe5486f9188183c6dd7fb303f84806bdc76277b87c4b102348cf01f0c0` | `e6f70f1a7884a082eccfc855860e4e51f57687bc8f54d65078e67063eb26af30` |
| Restored | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |

The source-hash command was:

```sh
sha256sum /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane/scripts/round-gate.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane/scripts/surface-probe.mjs
```

Before/after invocations also hashed the lane and clone counter paths; the restored invocation additionally hashed the exported patch. All hash commands exited 0. Final artifact hashes:

```text
7a2a1f458a138e3e7023c7a1a595d5640fa85c3e547e00f9443bacd5f1db280c  .ufo/waves/round-48/build/CtlDodge.patch
ebc5a70cbcda0b2ad7be9338c43ef028a3f8cbe088b27c6c05bf273d029efb50  .ufo/waves/round-48/build/CtlDodge-receipt.txt
```

## Bounds and cleanup

- Initial `df -h /fast` exited 0 and printed `/dev/nvme1n1p2  804G  734G   70G  92% /fast`; no large build was performed.
- Only the four assigned bounded counter invocations ran; no extra build/lint/test suite and no other runtime or subagent was invoked.
- All detector invocations completed normally within their 1500-second timeout. Final process check:

```sh
pgrep -af '[c]aproute48-probe[.]mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDodge/lane|/fast/scratch/hyaku/kumitate-r48/probe-runs/(5501e77ad1ee|6d0d13261c74)-'
```

No output; exit 1 (no matching control counter/process remains). No kill was necessary. The counter's successful completion also ran its own temporary-tree cleanup (`:342-344`).
- No tool install/update was needed. No lane/fleet git writes, sibling source edits, state/MANIFEST/template edits, or integration/shipping action occurred. Lane writes are limited to this report, its named receipt and its patch.
