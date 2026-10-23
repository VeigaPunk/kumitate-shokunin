RESULT CtlLooseCaps verdict=inconclusive

## Control outcome

**Expected targeted rejection observed:** all four sites are `ROUTED_MISS`, `held=0/4`, counter exit 1. Every site reports `no_capped_scope_ancestor`; none reports `ROUTED_HELD`. No counter invocation exited 2. Both owning gates passed their complete selftests in all three control runs, so the rejection is **targeted, not incidental**.

The formal differential mutation verdict is **inconclusive, not killed**: the required pristine freeze already returns exit 1 / `held=0/4`, and restoring its exact bytes returns the same result. This is a valid observed negative-control rejection, not a demonstration of breaking a previously held C1 invariant. No C1 candidate was scored.

Axis: operability. Scope: round 48, attempt 1, wave `build` / wave 1 only.

## Mutant and expected detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane`.
- Frozen parent: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Runnable control commit: `59b646f8a55a660e2a13607acd8dc824caa0a63c`.
- Export: `.ufo/waves/round-48/build/CtlLooseCaps.patch` (only the control commit, not the restoration commit).
- At the control commit, RG742 uses `capSpawnSync` at `scripts/round-gate.mjs:743-747`; SP491, SP519 and SP1592 use it at `scripts/surface-probe.mjs:492-499`, `:521-533`, and `:1595-1598`. Each supplies `mem: 4096, tasks: 1024`. Existing fixture/cache/state directories are bound explicitly and child environments use explicit entries instead of forwarding the caller's complete environment. `cap-spawn.mjs` and `cap-run.mjs` are unchanged.
- Expected detector: the lane's frozen `.ufo/waves/round-48/probe/caproute48-probe.mjs`, `--set r48`, three owning-gate runs. The predicate requires `MemoryMax <= 1024M` and `TasksMax <= 256` (plan:53-62; counter:254-260). The configured `4096M` / `1024` values fail that scope check.
- The additional `no_cap_run_ancestor` and `uncapped_exec` reasons are consequences of the same ordered-chain test: `haveR` is set only inside a qualifying `isScope` ancestor (counter:290-308). They are not a selftest failure or evidence that the adapter was bypassed.

## Control receipt — verbatim

Evidence: `.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt:1-14`.

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=53 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=3 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=75 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=61 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=69 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=180 resumed=3 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=180 resumed=8 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=180 resumed=3 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=59b646f8a55a660e2a13607acd8dc824caa0a63c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=53.79 end=11:58:45Z
```

Child counts remain exactly 116 / 2 / 2 / 14 per run, case counts remain 61/61 and 46/46, all owning gates exit 0, no FAIL lines occur, and `uncapped_direct=0,0,0`. No incidental condition needs to mask the oversized-cap check: the targeted condition is present at every site.

## Pristine and restored measurements

The same frozen counter and 1500-second bound were used for all three measurements; only the archived revision and receipt filename change.

Pristine receipt: `.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt:1-14`. All base/revision gate runs exit 0 with 61/61 or 46/46 cases and zero FAIL lines. Its four SITE lines all read `ROUTED_MISS`, with original raw-launch/environment reasons.

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=45.09 end=11:54:31Z
```

Restoration commit: `da30fd3b24350b1e6b67e02e0af5278954689ac3`. Restored receipt: `.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt:1-14`. All base/revision gate runs again exit 0 with 61/61 or 46/46 cases and zero FAIL lines. Its four SITE lines reproduce the pristine SITE lines exactly.

```text
CAPROUTE48 rev=da30fd3b24350b1e6b67e02e0af5278954689ac3 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=59.10 end=11:58:23Z
```

The control counter reads its immutable commit archive; restoration therefore did not change the control under measurement. The restored counter ran independently against the restored commit archive.

## Exact detector commands

Working directory for each: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps`. Each command printed the stated tool-output line after recording the counter exit in its receipt.

Pristine:

```sh
eval 'unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt 2>&1; rc=$?; echo "exit=$rc load1=$(cut -d" " -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt; printf "pristine_exit=%s\n" "$rc"'
```

```text
pristine_exit=1
```

Control:

```sh
eval 'unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane 59b646f8a55a660e2a13607acd8dc824caa0a63c --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt 2>&1; rc=$?; echo "exit=$rc load1=$(cut -d" " -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt; printf "control_exit=%s\n" "$rc"'
```

```text
control_exit=1
```

Restored:

```sh
eval 'unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane da30fd3b24350b1e6b67e02e0af5278954689ac3 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt 2>&1; rc=$?; echo "exit=$rc load1=$(cut -d" " -f1 /proc/loadavg) end=$(date -u +%TZ)" >> /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt; printf "restored_exit=%s\n" "$rc"'
```

```text
restored_exit=1
```

An earlier asynchronous pristine launch was refused before execution with `Background job limit reached (100). Wait for running jobs to finish or cancel one.` It is not counted as a run. The subsequent bounded pristine command above executed successfully as a counter measurement.

Patch export command (exit 0, no output):

```sh
eval 'unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..59b646f8a55a660e2a13607acd8dc824caa0a63c > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps.patch'
```

## Exact-byte restoration evidence

The two edited files were restored with inverse surgical edits, then committed only in the sandbox. Git reported the restoration commit and identical frozen/restored tree hashes:

```sh
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane rev-parse HEAD 'fe3d45bf929246915c8c0de5f7f8682b5015b22c^{tree}' 'HEAD^{tree}'
```

```text
da30fd3b24350b1e6b67e02e0af5278954689ac3
be1455f0631ea8c2b53cb50f5105327c51bb7ab1
be1455f0631ea8c2b53cb50f5105327c51bb7ab1
```

`sha256sum` was run on the four absolute sandbox script paths before mutation, after mutation, and after restoration. Recorded SHA-256 values:

| File | Pristine | Control | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `32c60070edbb83847220ae17dfeb873b8a5f1598c11fb483c0644029d1836e1b` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `757131b14616d8f3fd6414d89380d090cd165abd63b9b5f2c253163a4725a0ce` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| `scripts/cap-spawn.mjs` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |
| `scripts/cap-run.mjs` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` |

The frozen lane counter's before/after-restoration SHA-256 is `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`. A byte comparison against the sandbox's frozen copy exited 0 with no differences:

```sh
cmp /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane/.ufo/waves/round-48/probe/caproute48-probe.mjs && sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane/.ufo/waves/round-48/probe/caproute48-probe.mjs
```

```text
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs
f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2  /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane/.ufo/waves/round-48/probe/caproute48-probe.mjs
```

Exported patch SHA-256: `4f65feca0c1a49c1d609f7a644f9cff06a6dc5f007cf383963d383fd77610460`.

## Containment and cleanup

All Git writes were confined to this sandbox, with `GIT_DIR`, `GIT_WORK_TREE`, and `GIT_INDEX_FILE` unset. Lane writes are only this report and `CtlLooseCaps`-named receipts/patch. No sibling files, fleet source, manifest, state, or counter were edited. No tools were installed or updated. `df -h /fast` reported 69G available before cloning; no large build was run.

All three bounded detector jobs completed. Final process check (exit 1, no output; no matching processes to kill):

```sh
pgrep -af '(^| )/fast/scratch/hyaku/kumitate-r48/probe-runs/(59b646f8a55a|da30fd3b2435)-|^node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlLooseCaps/lane '
```

No services were started. No checks beyond the three assigned pristine/control/restored detector invocations were run.
