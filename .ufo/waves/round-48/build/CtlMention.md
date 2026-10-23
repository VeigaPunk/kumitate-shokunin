RESULT CtlMention verdict=targeted-rejection

All four sites are ROUTED_MISS for the targeted `uncapped_exec` reason; control counter exit 1, held=0/4. No ROUTED_HELD site and no exit 2. This is an expected negative-control rejection, not an incidental selftest failure. Mutation-test classification: **inconclusive as a kill experiment**, because pristine and restored also exit 1 with held=0/4; no killed-mutant claim is made.

Axes: operability (assigned axis), containment, reproducible evidence and exact restoration.

## Control and expected detector

- Frozen tip: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Control commit: `d5a2ab68b6ede88def4b15469bc410f3750c51eb`.
- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane`.
- Patch: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention.patch` (raw `git format-patch --stdout` output).
- Two modules, six insertions: one actual top-level `import { capSpawnSync } from './cap-spawn.mjs';` per module, plus one adjacent comment naming cap-run.mjs/cap-spawn.mjs at each of RG742, SP491, SP519 and SP1592. One import per module avoids duplicate ESM bindings; none of the four existing `spawnSync` calls is replaced or wrapped.
- Control revision source anchors: `d5a2ab68b6ede88def4b15469bc410f3750c51eb:scripts/round-gate.mjs:131,743-745` and `d5a2ab68b6ede88def4b15469bc410f3750c51eb:scripts/surface-probe.mjs:139,492-493,521-522,1595-1598`.
- Expected: every site ROUTED_MISS, with `uncapped_exec`; merely importing or mentioning the capsule cannot create the traced ancestry required by ROUTED_HELD.
- Frozen predicate: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/plan.md:53-62`; counter header and rejection condition: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs:5-19,280-310,365-370`.

## Commands exercised

Clone and freeze (exit 0):

```sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE && mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane && git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

After the six-line scratch-only edit, commit (exit 0):

```sh
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane add -- scripts/round-gate.mjs scripts/surface-probe.mjs && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane -c user.name=ctl -c user.email=ctl@local commit -m 'control(r48): mention cap routing without using it'
```

```text
[detached HEAD d5a2ab6] control(r48): mention cap routing without using it
 2 files changed, 6 insertions(+)
```

Each detector command ran with cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention`, using the lane's frozen counter directly, never a modified copy:

```sh
# Pristine — exit 1, wall 74.32 s
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
# Control — exit 1, wall 58.10 s
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane d5a2ab68b6ede88def4b15469bc410f3750c51eb --set r48
# Restored — exit 1, wall 74.40 s
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Pristine and control invocations overlapped; restored began after pristine completed. Every invocation measures its specified immutable git archive, not the sandbox worktree. Restoration therefore did not change the control's archived bytes. All three detector invocations completed; all owning-gate RUN lines report exit=0, verdict_pass=true and fail_lines=0. No timeout fired and no long-lived service was started.

Output was captured by the tool and written verbatim to the named receipts. Receipt trailers combine the observed exit code with a post-delivery load/time sample, not an inline sample at the exact instant the counter exited. Sampling command: `cut -d ' ' -f1 /proc/loadavg && date -u +%TZ`.

## Control output (verbatim)

Evidence: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-receipt.txt:9-14`.

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=d5a2ab68b6ede88def4b15469bc410f3750c51eb base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=42.45 end=11:55:20Z
```

The rejection is targeted: all three round-gate revision runs pass 61/61 cases and all three surface-probe revision runs pass 46/46, matching their base cases; all recorded child counts match base. No `gate_exit`, `exec_count_ne_base`, `no_final_verdict_pass`, `fail_lines` or `selftest_cases_below_base` reason appears. These RUN lines establish that the control remains runnable, rather than being rejected for invalid syntax. `uncapped_exec` at counter line 365 is the intended condition; missing capsule/scope/bwrap ancestry, leaked canary and uncapped direct children are additional routing-specific evidence, not incidental selftest failures.

## Pristine and restored evidence

Both receipts have the same four SITE lines as above; their summary/trailer lines are:

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-pristine-receipt.txt:13-14`:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=41.68 end=11:54:45Z
```

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-restored-receipt.txt:13-14`:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=51.96 end=11:56:17Z
```

Thus the known-unrouted pristine revision prevents a differential killed-mutant conclusion. The requested pre-data control nevertheless shows no false ROUTED_HELD caused by imports/comments. No C1 candidate was scored, and no contract change is proposed.

## Hashes and restoration

SHA-256 commands were run on the two absolute sandbox file paths before editing, after editing, immediately after restoration and after the restored detector completed:

```sh
sha256sum /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane/scripts/round-gate.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane/scripts/surface-probe.mjs
```

| File | Pristine SHA-256 | Mutated SHA-256 | Restored SHA-256 (both observations) |
|---|---|---|---|
| scripts/round-gate.mjs | 52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e | 0de881fbfea3910c208dbe50a9fdb774eb1ff91965aeb77f3b7c7663ba9afe22 | 52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e |
| scripts/surface-probe.mjs | 0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb | 53318c2a6a2b8c3c8c7172c3eb6f3b12ca25941cd089253dff971f0540313c26 | 0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb |

Restoration command (exit 0), followed by the matching hashes above:

```sh
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Export command (exit 0; stdout persisted as the named patch):

```sh
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlMention/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..d5a2ab68b6ede88def4b15469bc410f3750c51eb
```

Frozen counter SHA-256 was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` both before and after the three invocations, and matched the bytes at the freeze commit. Commands:

```sh
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show fe3d45bf929246915c8c0de5f7f8682b5015b22c:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum
```

## Containment and tooling

`df -h /fast` before clone returned `/dev/nvme1n1p2 804G 734G 70G 92% /fast`. All git writes occurred only in the named sandbox with GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE unset. Lane writes are limited to this report, the CtlMention patch and the three CtlMention receipts. No source in the lane or a sibling was edited, no subagents were dispatched, and no other mission runtime was invoked. No tools were installed or updated. Async delivery gaps for two completed tool jobs were reported through `xd://report_issue`; their actual output and exit 1 were recovered by `wait`, not inferred.
