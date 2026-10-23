RESULT CtlFakeRunner verdict=TARGETED_MISS

## Finding

Both runnable negative controls were rejected as expected: every site is `ROUTED_MISS`, both control scores are `held=0/4`, both counter exits are 1. No site read `ROUTED_HELD`; no actual counter invocation exited 2. No incidental selftest failures occurred.

Axis: operability; C1 / ROUTED_HELD only, round 48 attempt 1 wave 1. No C1 candidate was scored, judged, integrated or changed.

Mutation classification: **inconclusive as a differential killed/survived test**, because the required pristine frozen tip is itself unrouted (`held=0/4`, exit 1). No killed-mutant claim is made. The assigned pre-data control outcome is nevertheless an observed targeted rejection of both controls.

## Mutants and expected detector

- **Variant a**, commit `d767fcf7431fc4aa23d00c3fce1b0758dba3ae57`: exact byte copy of `scripts/cap-run.mjs` at `scripts/caprun-copy.mjs`; `scripts/cap-spawn.mjs:26` selects the copy with cap-spawn's complete argv and verdict handling unchanged. All four sites call `capSpawnSync`: `scripts/round-gate.mjs:743`; `scripts/surface-probe.mjs:492`, `:521`, `:1595` (anchors at this commit). Expected: all sites MISS with `no_cap_run_ancestor` because the required runner is the revision's exact canonical path, not an equivalent file.
- **Variant b**, commit `9c613bc32e865c83e14412e87c8ff7aed0c11c24`, parent a: selects canonical `cap-run.mjs`, deletes the copy, and replaces `scripts/cap-run.mjs:177-205` with direct `spawnSync` execution and the same CAP_RUN verdict/file protocol. No systemd-run or bwrap launches occur in that path. All four sites retain `capSpawnSync`, now using the unchanged original helper. Expected: all sites MISS with `no_capped_scope_ancestor` / `no_bwrap_ancestor` despite canonical name and protocol.

Both variants use explicit child environments and fixture binds. A missing canary filter or invisible fixture does not mask the target defect. Owning suites pass in all three runs: round-gate 61/61, surface-probe 46/46; site exec counts equal base throughout.

The frozen definition is `.ufo/waves/round-48/plan.md:53-71`; counter predicate `.ufo/waves/round-48/probe/caproute48-probe.mjs:5-19`, direct-child identity `:263-277`, ordered ancestry `:280-310`.

## Variant a output — verbatim

Receipt `.ufo/waves/round-48/build/CtlFakeRunner-a-receipt.txt:9-14`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=d767fcf7431fc4aa23d00c3fce1b0758dba3ae57 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=51.64 end=11:58:52Z
```

The MISS reason is the targeted `no_cap_run_ancestor`, not incidental. Neither missing-scope nor missing-bwrap reason appears. Additional `uncapped_exec` and `uncapped_direct_children` follow from the canonical-runner identity requirement. Even without the direct-child guard, the ordered-chain canonical-runner check (`caproute48-probe.mjs:297`) must reject the copy, and does.

## Variant b output — verbatim

Receipt `.ufo/waves/round-48/build/CtlFakeRunner-b-receipt.txt:9-14`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=9c613bc32e865c83e14412e87c8ff7aed0c11c24 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=24.17 end=12:01:25Z
```

The MISS reasons are the targeted `no_bwrap_ancestor` and `no_capped_scope_ancestor`, not incidental. `uncapped_direct=0,0,0` shows the canonical runner passes the direct-child identity guard. The extra `no_cap_run_ancestor` label arises because the judge recognizes the runner only within an ordered valid scope/bwrap chain (`caproute48-probe.mjs:290-302`); it does not mean the canonical file was absent. With selftests and exec counts valid, scope/bwrap ancestry is the condition that must catch this control, and did.

## Exact commands and complete receipts

All probe commands ran from `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner`. The absolute lane counter was used every time, never an edited or sandbox counter. Its SHA-256 before and after all probes was:
`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

Actual commands in execution order:

### pristine

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Verbatim footer: `exit=1 load1=43.04 end=11:54:40Z`

Full output: `.ufo/waves/round-48/build/CtlFakeRunner-pristine-receipt.txt:1-14`.

### variant-a-copy

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane d767fcf7431fc4aa23d00c3fce1b0758dba3ae57 --set r48
```

Verbatim footer: `exit=1 load1=51.64 end=11:58:52Z`

Full output: `.ufo/waves/round-48/build/CtlFakeRunner-a-receipt.txt:1-14`.

### restored-after-a

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Verbatim footer: `exit=1 load1=41.15 end=11:59:59Z`

Full output: `.ufo/waves/round-48/build/CtlFakeRunner-a-restored-receipt.txt:1-14`.

### variant-b-direct

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane 9c613bc32e865c83e14412e87c8ff7aed0c11c24 --set r48
```

Verbatim footer: `exit=1 load1=24.17 end=12:01:25Z`

Full output: `.ufo/waves/round-48/build/CtlFakeRunner-b-receipt.txt:1-14`.

### restored-after-b

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Verbatim footer: `exit=1 load1=19.07 end=12:02:07Z`

Full output: `.ufo/waves/round-48/build/CtlFakeRunner-b-restored-receipt.txt:1-14`.

The first attempted asynchronous bash probe did not start: `Background job limit reached (100). Wait for running jobs to finish or cancel one.` The five actual invocations above ran synchronously through Python subprocess argument arrays, with GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE removed, stdout/stderr merged, and captured output persisted via the write tool. Each also had a 1520 s subprocess deadline. None timed out. The timeout command and tested Node detector were unchanged.

Pristine and both restorations each returned `held=0/4`, exit 1, with passing owning selftests; those expected baseline misses are why no differential kill is claimed.

## Exact restoration and hashes

Restored after each mutation, including before the final detector run, using only the sandbox:

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

The following SHA-256 command ran pristine, after each mutation, and after each restoration (copy hash was additionally measured for a):

```sh
sha256sum /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane/scripts/cap-run.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane/scripts/cap-spawn.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane/scripts/round-gate.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane/scripts/surface-probe.mjs
```

Every pristine hash below equals both observed restored hashes byte-for-byte:

| File | Pristine = after-a restoration = after-b restoration | Variant a | Variant b |
|---|---|---|---|
| `scripts/cap-run.mjs` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | `7faf7b5f3d0abb3e2a49e92437bcac8932b18542f20e502272af6987115a39a9` |
| `scripts/cap-spawn.mjs` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | `8202236e1f0244e63f70189d3aaf2cfc41ac4950618bd33e40d1c07c561d6ddb` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `fe131918eef96008c6aacaf986087851c595e50aa64ccb99e99da27d9a337b76` | `fe131918eef96008c6aacaf986087851c595e50aa64ccb99e99da27d9a337b76` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `1767361551719fee156309a2c67f4c4d42b6b9f67f1288d36b3f3ff5fca016f7` | `1767361551719fee156309a2c67f4c4d42b6b9f67f1288d36b3f3ff5fca016f7` |

The copied runner in a had SHA-256 `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`, identical to pristine `cap-run.mjs`. The copy is deleted in b and absent in the final restored tree: glob `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane/scripts/caprun-cop?.mjs` returned `No files found matching pattern`. An earlier exact nonexistent-path glob raised `Path not found`; reported through `xd://report_issue` and retried with this wildcard.

Final scratch HEAD is the freeze commit. Both control commits remain in the clone object database and the exported patch. All five counter processes returned. After the last run, `ps -eo pid=,ppid=,args=` exited 0; filtering for this seat's absolute directory and either mutated revision's unique archive prefix printed `OWNED_PROCESS_SNAPSHOT exit=0 matches=0`. No matching process tree remained to kill; no long-lived service was started.

## Artifacts and containment

- Combined receipt: `.ufo/waves/round-48/build/CtlFakeRunner-receipt.txt:1-31`, a then b; SITE/CAPROUTE48 lines preserved verbatim.
- Patch: `.ufo/waves/round-48/build/CtlFakeRunner.patch`, two commits in order. Exact export command:
  ```sh
  git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFakeRunner/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..9c613bc32e865c83e14412e87c8ff7aed0c11c24
  ```
  Exit 0; stdout persisted unchanged via write; 64184 bytes. Both exported stdout and the saved file have SHA-256 `18dba3c62b82cb0e0c5a2a0a8f0f8de0c02ef215c4da6c63be4e83a3594a28c1`.
- Clone creation used the assigned `--no-hardlinks` command and detached freeze checkout. Commits used `git -c user.name=ctl -c user.email=ctl@local commit` inside this sandbox only, with the three Git repository-selection variables unset. No lane/fleet Git writes; no sibling source, MANIFEST, templates, fleet scripts or state changed. Lane writes are limited to this item's report, receipts and patch.
- `df -h /fast` before cloning/probes: `/dev/nvme1n1p2 804G 735G 69G 92% /fast`. No large build was run.
- No tools installed or updated. No other gate tests, counters, integration or shipping actions performed; no subagents or other agent runtime invoked. Production docs/tests intentionally unchanged: these are isolated negative controls, not a permanent implementation.
