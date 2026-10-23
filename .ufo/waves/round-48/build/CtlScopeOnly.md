RESULT CtlScopeOnly verdict=expected-miss

## Finding — operability, round 48 / attempt 1 / build

All four sites are `ROUTED_MISS`, for the targeted missing-bwrap condition. The frozen counter exited **1**, not 2; no site was `ROUTED_HELD`. This is a pre-data negative-control measurement, not a C1 candidate score.

- Control commit: `916952394140db029e537411c772320c756a7d16`.
- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane`; commit retained by local branch `CtlScopeOnly`.
- Export: `.ufo/waves/round-48/build/CtlScopeOnly.patch` (6510 bytes).
- Receipt: `.ufo/waves/round-48/build/CtlScopeOnly-receipt.txt:1-14`.
- Mutant: at that commit, `scripts/cap-run.mjs:181-185` launches `systemd-run --user --scope --quiet --unit=… -p MemoryMax=<mem>M -p MemorySwapMax=0 -p TasksMax=<n> -- env -i PATH=/usr/bin [explicit env assignments] <resolved cmd> [args]`, deliberately omitting bwrap. Explicit PATH overrides are dropped, keeping PATH `/usr/bin`; unrelated ambient variables are not forwarded.
- Routing setup: `scripts/round-gate.mjs:743-746` and `scripts/surface-probe.mjs:492-499,521-532,1594-1596` at the control commit call the unchanged `capSpawnSync` helper. The sites use its 512 MiB / 64-task defaults and retain their original timeouts. The rev's own runner handles all four sites.

Expected detector: the unedited lane counter `.ufo/waves/round-48/probe/caproute48-probe.mjs`, frozen at `fe3d45bf929246915c8c0de5f7f8682b5015b22c`, predicate `ROUTED_HELD` / rule F48 (plan:53-62; counter:5-19,280-310). Expected rejection: `no_bwrap_ancestor` at every site.

The rejection is **targeted, not incidental**: every measured gate exits 0, with 61/61 round-gate cases and 46/46 surface-probe cases, no FAIL lines, unchanged site exec counts, zero uncapped direct children, and no `canary_in_env` reason. The additional `no_capped_scope_ancestor` and `no_cap_run_ancestor` reasons arise because the counter only searches those earlier links inside a qualifying bwrap ancestry (`caproute48-probe.mjs:290-307`); they are not independent evidence that this control omitted cap-run or systemd-run. No selftest failure masks the missing-bwrap test. If an incidental selftest failure had occurred, the required independent catch would still be `no_bwrap_ancestor`.

Mutation-test classification: **inconclusive as a differential kill**, not killed or survived. The pristine freeze is intentionally unrouted and already exits 1 (`held=0/4`); therefore there is no passing pristine routing invariant to kill. The negative-control result itself is the expected targeted MISS.

## Commands and actual output

Every detector used cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly`, with `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` absent. Each invocation was bounded by `timeout -k 10 1500`. stdout and stderr were captured directly into the named receipt; the exit/load/time trailer was appended after waiting for termination.

### Control

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane 916952394140db029e537411c772320c756a7d16 --set r48
```

Verbatim `.ufo/waves/round-48/build/CtlScopeOnly-receipt.txt:1-14`:

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=30 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=102 resumed=22 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2004 resumed=35 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2004 resumed=35 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2004 resumed=32 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=210 resumed=15 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=210 resumed=19 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=210 resumed=15 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=916952394140db029e537411c772320c756a7d16 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=45.66 end=11:55:40Z
```

### Pristine and restored

The same command ran once before mutation and once after restoring the scratch checkout, substituting the freeze revision:

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Pristine receipt `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/CtlScopeOnly-pristine-receipt.txt:13-14`:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=42.82 end=11:54:06Z
```

Restored receipt `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/CtlScopeOnly-restored-receipt.txt:13-14`:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=55.54 end=11:57:17Z
```

Both receipts have all base/rev gates exiting 0, 61/61 and 46/46 cases, no FAIL lines, and all four SITE labels MISS. Unlike the routed scope-only control, their reasons include `canary_in_env` and uncapped direct children (58 for round-gate; 9 for surface-probe).

### Syntax, commit and export

Each syntax command produced no output and exited 0:

```sh
timeout -k 10 30 node --check /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane/scripts/cap-run.mjs
timeout -k 10 30 node --check /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane/scripts/round-gate.mjs
timeout -k 10 30 node --check /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane/scripts/surface-probe.mjs
```

Commit and patch commands (patch stdout captured directly into the required lane patch file):

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane add -- scripts/cap-run.mjs scripts/round-gate.mjs scripts/surface-probe.mjs
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane -c user.name=ctl -c user.email=ctl@local -c commit.gpgsign=false commit -m 'round-48 control: route four sites through scope-only cap runner'
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..916952394140db029e537411c772320c756a7d16
```

Actual commit output:

```text
[detached HEAD 9169523] round-48 control: route four sites through scope-only cap runner
 3 files changed, 19 insertions(+), 19 deletions(-)
```

## Restoration and integrity evidence

After exporting and scoring, these sandbox-only commands exited 0 with no output:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane branch CtlScopeOnly 916952394140db029e537411c772320c756a7d16
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlScopeOnly/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Every listed restored file was compared directly with its pre-mutation byte buffer: all four exact-byte comparisons returned `True`. SHA-256:

| File | Pristine = restored | Control |
|---|---|---|
| `scripts/cap-run.mjs` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | `c8dc94c53e05be95e739869b624b9dcff3979865580fdcb3fb8f6aff34648c05` |
| `scripts/cap-spawn.mjs` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `c8a0ffd054c581680fffd8e579a2874982c779b5c28eaf68825c5a966eb36f73` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `c9c1bf37bbbf01912ce344a7b6b693315772553cfe786ac6a3f6246fffefdd9c` |

The lane counter was byte-equal to `git show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs`; its before/freeze/after SHA-256 was unchanged:

```text
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2
```

Artifact SHA-256:

```text
026ab3adbfa862169117df7940ae88eed0b25d1599164a9ee768721627a39ba9  CtlScopeOnly-receipt.txt
3fe756db3b540723bda285e328b17529a01b4e9a624ab94dbed535bfca19b417  CtlScopeOnly.patch
```

Cleanup command `ps -eo pid=,ppid=,sid=,args=` was filtered to the three detector sessions and produced:

```text
PROCESS_CLEANUP sessions=3071050,3362660,3580235 live=0
DETECTOR_EXIT_CODES pristine=1 mutated=1 restored=1
```

No owned detector process tree remained. `df -h /fast` before cloning reported 70G available (804G total, 735G used, 92%). No tools were installed or updated. No lane/fleet git writes, sibling edits, counter edits, or C1 candidate scoring were performed; lane writes were limited to this report and the required receipt/patch.
