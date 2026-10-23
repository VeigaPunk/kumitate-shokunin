RESULT CtlEnvCaps verdict=KILLED

The mutated control is ROUTED_MISS at all four sites for the targeted `no_capped_scope_ancestor` condition, not an incidental selftest failure. No mutated site is ROUTED_HELD; the control counter exited 1, not 2. Axis: operability, C1 / ROUTED_HELD / F48; round 48, attempt 1, wave build only.

## Mutant and expected detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane`, cloned with `--no-hardlinks` and detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE removed from the command environment.
- Control commit: `d4423b2c553229e83674719aa67aefc0bf5955c3`.
- Pristine comparator: `f55bf22e9e6d719045a46a8bd3419485a09eceb5`. This is this seat's own four-site routing setup, not the C1 candidate: RG742 uses `capSpawnSync` at `scripts/round-gate.mjs:743-745`; SP491, SP519 and SP1592 use it at `scripts/surface-probe.mjs:492-499,521-533,1595-1598`. Fixture directories are bound explicitly and child environments are explicit; named raw nested-selftest/checklist allowances remain unchanged.
- Small behavior-bearing mutation: the control's own `scripts/cap-run.mjs:185-187` retains systemd-run `--scope` but removes all `-p` arguments and places `env -i MemoryMax=512M MemorySwapMax=0 TasksMax=64 PATH=/usr/bin` after systemd-run's `--`. The bwrap arguments at `scripts/cap-run.mjs:187-190` are unchanged. Only two runner lines differ from the pristine comparator.
- Expected: the frozen counter rejects every mutated site with `no_capped_scope_ancestor`. Its `scopeProps` scans only options before systemd-run's separator (`.ufo/waves/round-48/probe/caproute48-probe.mjs:239-260`); environment assignments cannot satisfy the cap properties.
- The accompanying `no_cap_run_ancestor` reason is derivative: the counter sets `haveR` only while traversing a qualifying capped-scope chain (`caproute48-probe.mjs:289-308`), not independent evidence that the runner was absent. `uncapped_exec` is also consequent. No `no_bwrap_ancestor`, count mismatch, direct-child dodge or selftest failure was reported.

## Frozen detector commands and bounds

All three measured runs used the unchanged lane counter directly, with the same Node executable, timeout and `--set r48`; stdout/stderr were redirected to the receipt using subprocess file handles. Working directory was `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps`. The exit/load/time trailer was appended after each process completed.

```sh
/usr/bin/timeout -k 10 1500 /home/vgpnk/.local/share/mise/installs/node/latest/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane f55bf22e9e6d719045a46a8bd3419485a09eceb5 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-pristine-receipt.txt 2>&1
/usr/bin/timeout -k 10 1500 /home/vgpnk/.local/share/mise/installs/node/latest/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane d4423b2c553229e83674719aa67aefc0bf5955c3 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-receipt.txt 2>&1
/usr/bin/timeout -k 10 1500 /home/vgpnk/.local/share/mise/installs/node/latest/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane 61f1c703154fa8c869741281a1d82860fed4f149 --set r48 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-restored-receipt.txt 2>&1
```

Measured elapsed times: pristine 190.284 s; mutant 114.386 s; restored 46.544 s. The counter itself bounds each traced selftest with `timeout -k 10 1200`, limits captured output and bounds trace file size (`caproute48-probe.mjs:45-46,200-220`). No standalone or recursive extra suite was run.

## Mutated output, verbatim

Evidence: `.ufo/waves/round-48/build/CtlEnvCaps-receipt.txt:9-14`.

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=d4423b2c553229e83674719aa67aefc0bf5955c3 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=39.29 end=12:00:09Z
```

Receipt lines 1-8 show both base selftests and all six mutated-revision selftests exited 0, with their own full summaries (round-gate 61/61; surface-probe 46/46), `verdict_pass=true` and `fail_lines=0`. Therefore the MISS is targeted rather than incidental; no hypothetical removal of a failing selftest is needed to expose it.

## Pristine and restored output, verbatim

Evidence: `.ufo/waves/round-48/build/CtlEnvCaps-pristine-receipt.txt:9-14`.

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=f55bf22e9e6d719045a46a8bd3419485a09eceb5 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=58.39 end=11:57:57Z
```

Evidence: `.ufo/waves/round-48/build/CtlEnvCaps-restored-receipt.txt:9-14`.

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=61f1c703154fa8c869741281a1d82860fed4f149 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=24.88 end=12:01:22Z
```

## Restoration and hashes

The mutation was reversed immediately after its detector run, then committed in the sandbox as `61f1c703154fa8c869741281a1d82860fed4f149`. Before this restoration commit, direct byte comparisons against the saved pristine routed comparator returned true for all three source files. The restored counter run reads that restoration commit, not an uncommitted working-tree approximation. The sandbox retains the routed comparator setup; restoration reverses the assigned runner mutation exactly. The control commit remains reachable as the restoration commit's parent.

SHA-256:

| File | Pristine | Mutated | Restored |
|---|---|---|---|
| scripts/cap-run.mjs | d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758 | 6bbc2825a5d9e69bd9cd8105fc671c29e895a1e2d877aa4a7465eac11735ef98 | d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758 |
| scripts/round-gate.mjs | 6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b | 6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b | 6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b |
| scripts/surface-probe.mjs | 77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c | 77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c | 77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c |

The unchanged frozen counter's SHA-256 before and after all runs was `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`.

Export command, executed before restoration:

```sh
/usr/bin/git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..d4423b2c553229e83674719aa67aefc0bf5955c3 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps.patch
```

The patch is a two-commit series (routing comparator, then the targeted mutation); the restoration commit is deliberately excluded. Patch SHA-256: `a3a3aed2577be2f1d74a68dc79d0a01c80621e02455a0c35965dd6b2dde76d1c`.

Receipt SHA-256 values:
- Pristine: `b0942e5d5aafb07f5953fddc61e00708e6304450002ca9d260e543ab733d7167`.
- Mutant: `78e789adae64f576b741233f894e76f8c52ba858e852944ee298b4bcec63e61e`.
- Restored: `6688d4f5d45783e2f3011cbd65ea17f1292b64bbb645d2b4610b884462c73892`.

## Execution notes

- An initial pristine launch used the unavailable `/usr/bin/node`; it did not execute the probe. Its actual output was `timeout: failed to run command ‘/usr/bin/node’: No such file or directory`, followed by `exit=127 load1=43.78 end=11:54:16Z`. This was a runtime-path prerequisite error, not a baseline score. The receipt was then replaced by the successful pristine run using the resolved existing runtime; all three measured runs used that same absolute executable. Runtime version command `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node --version` returned `v26.12.0`.
- `/usr/bin/df -h /fast` reported 69G available before clone/probe work; no large build was run.
- Each detector ran in its own process session; the wrapper sent SIGKILL to the session's original process group after completion if it still existed. A final `/usr/bin/ps -eo pid,ppid,pgid,sid,args` inspection found no processes matching this seat directory or the three tested revision prefixes (`remaining_owned_processes=[]`).
- No tools were installed or updated. No pacman transaction, lane/fleet git write, sibling edit, counter edit, integration, or shipping operation was performed. Lane writes were limited to this report, this item's three receipts and its patch.
