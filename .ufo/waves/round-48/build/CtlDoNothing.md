RESULT CtlDoNothing verdict=expected_miss

## Finding

Both assigned negative controls were correctly rejected: every site is `ROUTED_MISS`, `held=0/4`, exit 1. No site read `ROUTED_HELD`; no counter invocation exited 2. The restored-byte replay returned the same result. MISS reasons are the targeted missing routing chain (`no_cap_run_ancestor`, `uncapped_exec`), not incidental selftest failures. All owning-gate runs exited 0, with `61/61` round-gate cases and `46/46` surface-probe cases, `verdict_pass=true`, and `fail_lines=0`.

Mutation-test classification: **inconclusive as a killed-mutant test**, because the pristine control already fails ROUTED_HELD by design. This is evidence that the frozen counter rejects these no-op negative controls, not evidence that a defect was killed against a held baseline. No C1 candidate was scored.

## Control and frozen detector

- Axis: operability / ROUTED_HELD discrimination; byte identity and containment preserved.
- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane`.
- (a) Original freeze, no new commit: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- (b) Runnable comment-only commit: `7331b1407ba9d2a9d1cb5e47a8137f9688dd2706`; parent is the freeze. Adds `// CtlDoNothing: trailing-comment-only pre-data control.` at `scripts/round-gate.mjs:1548` and `scripts/surface-probe.mjs:1881`. The latter file originally lacks a final newline; the patch preserves that EOF property while separating the comment from the prior line.
- Detector: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs`, directly invoked for every run. Its SHA-256 before and after scoring is `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, equal to the clone's frozen copy. No counter edits.
- Predicate: `.ufo/waves/round-48/plan.md:53-62`; rejection checks: `.ufo/waves/round-48/probe/caproute48-probe.mjs:304-308,361-370`.
- Export: `.ufo/waves/round-48/build/CtlDoNothing.patch`, SHA-256 `dfa970e116180772197e24a5789b559860dd0947f22c0d81fa6c2c277aee3f94`.

## Exact score commands and output

Every command ran with cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing` and `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` absent. Stdout and stderr were captured together into the named receipts; trailers record the actual exit status, host load1, and UTC end time. All runs used the same 1500-second timeout with a 10-second kill grace.

### (a) Pristine freeze

Command:
```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Evidence: `.ufo/waves/round-48/build/CtlDoNothing-receipt-a.txt:1-14`; SITE and CAPROUTE48 lines verbatim:
```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=44.36 end=11:54:20Z
```

### (b) Trailing-comment control

Command:
```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane 7331b1407ba9d2a9d1cb5e47a8137f9688dd2706 --set r48
```

Evidence: `.ufo/waves/round-48/build/CtlDoNothing-receipt-b.txt:1-14`; SITE and CAPROUTE48 lines verbatim:
```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=7331b1407ba9d2a9d1cb5e47a8137f9688dd2706 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=51.04 end=11:56:03Z
```

### Exact-byte restoration replay

Removed only the two added comment lines after exporting (b). No additional commit was needed: the restored source bytes equal the original freeze, so the replay archives the original frozen revision, not the comment commit. The runnable (b) commit remains available; the clone worktree intentionally contains the pristine bytes rather than HEAD's comments.

Command:
```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Evidence: appended `RESTORED_REPLAY` section in `.ufo/waves/round-48/build/CtlDoNothing-receipt-a.txt:16-30`; output verbatim:
```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=59.20 end=11:58:15Z
```

## Restoration evidence

Actual `sha256sum` results, before mutation / committed control / after restoration:

| File | Before | Comment control | Restored |
|---|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `6db177895fc1d9783f84aaf809db21f9701fa64a6801e1e204e30f2ad5105645` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `5c94a0430cae8afd86f841602e9c090c9c56943b67b8174498f7b248ba8890c0` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |

Hash command after restoration:
```sh
sha256sum /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane/scripts/round-gate.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane/scripts/surface-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDoNothing.patch
```

Patch export command (stdout saved unchanged to the patch path):
```sh
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlDoNothing/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..7331b1407ba9d2a9d1cb5e47a8137f9688dd2706
```

No incidental condition masks the targeted rejection: all suites passed, exec counts match base, and all four SITE lines explicitly include both `no_cap_run_ancestor` and `uncapped_exec`, plus missing bwrap/scope ancestors, canary leakage, and uncapped direct children. Thus the ancestry / uncapped-exec requirements themselves reject these controls.

## Containment and tooling

`df -h /fast` before cloning showed 69G available. Git writes occurred only in the assigned sandbox clone, using cleared Git override variables and the required `ctl <ctl@local>` commit identity. Lane writes are limited to this report, the two named receipts, and the named patch. No subagents, installs, updates, services, or other runtime sessions were started. All synchronous detector commands completed; the restored invocation's isolated process group (PID 3693670) was also cleaned in a finally block. No extra checks were run beyond the assigned detector, hashes, and prerequisite queries.
