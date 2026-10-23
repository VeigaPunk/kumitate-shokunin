# MutAllowanceProbe — allowance boundary probe (round 48, attempt 2, wave r48)

RESULT: both directions confirmed on the frozen counter. Outside the named allowances, one raw `bash -c`
direct child in `round-gate --selftest` reads `ROUTED_MISS … reason=uncapped_direct_children=1`
(`held=3/4`, exit 1) while its site child stays `116/116` capped — a targeted kill of the outside-allowance
direction. Inside the named allowances, a raw `bash -c` (SP1049 checklist-runner class) plus a raw
`node surface-probe.mjs --selftest --bogus` (SP1766 nested-selftest class) read `ROUTED_HELD` at all four
sites (`held=4/4`, exit 0, `uncapped_direct=0,0,0`) — no false positive. Pristine comparator and restored
bytes both read `held=4/4` exit 0. Counter sha256 unchanged: `f24a3af5…`.

Axis: operability, C1 / ROUTED_HELD / rule F48. **No C1 candidate was scored by this seat**: the 4/4
baseline is this seat's own routed comparator at `fe5e09aa`, which is the freeze plus the routing half of
attempt 1's `build/CtlEnvCaps.patch`; the kill rule's candidate runs are the L1's and the committed waves'.

## Mutants, expected detector, verdicts

Sandbox `/fast/scratch/hyaku/kumitate-r48a/seats/MutAllowanceProbe/lane`, cloned `--no-hardlinks` and
detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c` with `GIT_DIR`, `GIT_WORK_TREE`,
`GIT_INDEX_FILE` unset. All git writes are in that clone only.

| rev | commit | content | expected | measured |
|---|---|---|---|---|
| P | `fe5e09aaa04705d41a929082f89403a59cd1f2a4` | routed comparator: freeze + `build/CtlEnvCaps.patch` patch 1/2 (four sites through `capSpawnSync`) | `held=4/4` exit 0 | `held=4/4` exit 0 |
| A | `7fe6a16e52ca67185b88d1cd2c31e1ade9aab442` | P + one raw `bash -c 'exit 0'` direct child in `round-gate --selftest`, **outside** the named allowances | `uncapped_direct` → miss | `held=3/4` exit 1; RG742 `ROUTED_MISS reason=uncapped_direct_children=1` |
| B | `85134ddbd4d9c586651477b92726944bfb915dd2` | P + raw `bash -c 'exit 0'` (SP1049 class) and raw `node <self> --selftest --bogus` (SP1766 class) direct children in `surface-probe --selftest`, **inside** the named allowances | allowed (no miss) | `held=4/4` exit 0, `uncapped_direct=0,0,0` |
| R | `fe5e09aaa04705d41a929082f89403a59cd1f2a4` | P bytes restored (same commit; worktree hash-checked) | `held=4/4` exit 0 | `held=4/4` exit 0 |

Mutant A was **killed** by the frozen counter for exactly the assigned reason. Mutant B is the
inside-allowance **control**: it is not a defect and is not expected to be killed; a miss would have been a
false positive of `uncappedDirect`. It was accepted.

Attribution: P is not a new route design. Patch 1/2 of `.ufo/waves/round-48/build/CtlEnvCaps.patch`
(attempt 1, seat `w1-CtlEnvCaps`) applies cleanly to the freeze (`git apply --check` exit 0) and reproduces
the attempt-1 pristine reading (`build/CtlEnvCaps-pristine-receipt.txt`, `held=4/4`). Patch 2/2 of that file
masks `cap-run.mjs` caps and was reverted (`git checkout -- scripts/cap-run.mjs`) before commit, so P's
runner is the frozen `cap-run.mjs`.

## Exact mutations

Mutant A (`git diff pristine mutA`), inserted after the routed `runGate` definition in `selfTest`:

```diff
@@ -744,6 +744,10 @@ function selfTest() {
     { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, bind: [tmp],
       env: { HOME: process.env.HOME, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', ...extraEnv } });
 
+  // MutAllowanceProbe A (outside the named allowances): one raw, uncapped direct child.
+  const probeRaw = spawnSync('bash', ['-c', 'exit 0'], { encoding: 'utf8', timeout: 10_000 });
+  if (probeRaw.status !== 0) throw new Error(`probe raw child failed: exit ${probeRaw.status}`);
+
```

Mutant B (`git diff pristine mutB`), inserted after the routed `spawnSelf` definition in `selfTest`:

```diff
@@ -1596,6 +1596,13 @@ function selfTest() {
       encoding: 'utf8', timeout: 120_000, bind: [tmp],
       env: { HOME: process.env.HOME, UFO_SRC: process.env.UFO_SRC, ...env },
     });
+
+    // MutAllowanceProbe B (inside the named allowances): two raw direct children — the
+    // SP1049 checklist-runner class and the SP1766 nested-selftest class.
+    const probeRunner = spawnSync('bash', ['-c', 'exit 0'], { encoding: 'utf8', timeout: 10_000 });
+    if (probeRunner.status !== 0) throw new Error(`probe checklist-class child failed: exit ${probeRunner.status}`);
+    const probeNested = spawnSync(process.execPath, [selfPath, '--selftest', '--bogus'], { encoding: 'utf8', timeout: 60_000 });
+    if (probeNested.status !== 64) throw new Error(`probe nested-selftest-class child exit ${probeNested.status}`);
```

Both additions are asserted: A and B fail the owning gate's selftest unless the raw child actually runs and
returns its expected status (`0` for `bash -c`, `64` for the usage-only nested invocation), so a PASS summary
is evidence that the launches happened and were traced.

Detector anchors in the frozen counter: allowance predicate `.ufo/waves/round-48/probe/caproute48-probe.mjs:73-74`
(`allowDirect`, SP1049 `bash -c` and the gate's own `--selftest` node), direct-child classification
`:265-277` (`uncappedDirect`, consumed as `dodge` at `:336`), the miss reason `:366`, and the SITE line
`:375`. `bash -c` is admitted only when `gate === 'surface-probe'`, which is what A exercises in the negative
direction on `round-gate`.

## Frozen detector commands

Counter file, unchanged, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and
after all four runs. Node: pre-existing `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`
(v26.12.0). No package was installed (pacman paused host-wide; nothing needed).

```sh
S=/fast/scratch/hyaku/kumitate-r48a/seats/MutAllowanceProbe
NODE=/home/vgpnk/.local/share/mise/installs/node/latest/bin/node
PROBE=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs
/usr/bin/timeout -k 10 1500 $NODE $PROBE $S/lane fe5e09aaa04705d41a929082f89403a59cd1f2a4 --set r48 > $S/pristine-receipt.txt 2>&1
/usr/bin/timeout -k 10 1500 $NODE $PROBE $S/lane 7fe6a16e52ca67185b88d1cd2c31e1ade9aab442 --set r48 > $S/mutA-receipt.txt 2>&1
/usr/bin/timeout -k 10 1500 $NODE $PROBE $S/lane 85134ddbd4d9c586651477b92726944bfb915dd2 --set r48 > $S/mutB-receipt.txt 2>&1
git -C $S/lane checkout -q --detach pristine   # worktree restored to P bytes, hash-checked
/usr/bin/timeout -k 10 1500 $NODE $PROBE $S/lane fe5e09aaa04705d41a929082f89403a59cd1f2a4 --set r48 > $S/restored-receipt.txt 2>&1
```

Raw outputs: `MutAllowanceProbe-{pristine,mutA,mutB,restored}-receipt.txt`; combined evidence in
`MutAllowanceProbe-receipt.txt`.

## Measured output, verbatim

Pristine (P), `exit=0 elapsed=168s load1=56.53 end=2026-10-23T18:27:23Z`:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=fe5e09aaa04705d41a929082f89403a59cd1f2a4 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
```

Mutant A, `exit=1 elapsed=158s load1=53.39 end=2026-10-23T18:30:04Z`:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=1,1,1 reason=uncapped_direct_children=1
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=7fe6a16e52ca67185b88d1cd2c31e1ade9aab442 base=f00cf278 set=r48 held=3/4 runs=3 rule=F48
```

Every mutated owning-gate run exited 0 with `61/61` (round-gate) and `46/46` (surface-probe),
`verdict_pass=true`, `fail_lines=0`; the miss is the direct-child classification alone, not a selftest
failure, and the RG742 site child itself stayed `116/116` capped in all three runs.

Mutant B, `exit=0 elapsed=123s load1=39.45 end=2026-10-23T18:32:10Z`:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=85134ddbd4d9c586651477b92726944bfb915dd2 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
```

Surface-probe rev exec totals rose `180 → 184` per run versus P, consistent with the two added launches
being traced; the gate's own assertions prove both children ran (status 0 and 64 respectively) and the
selftest stayed `46/46`.

Restored, `exit=0 elapsed=119s load1=36.59 end=2026-10-23T18:34:19Z`: identical to the pristine block
(`held=4/4`, all four sites `ROUTED_HELD`, `uncapped_direct=0,0,0`).

## Restoration evidence

`git checkout -q --detach pristine` leaves `git status --porcelain` empty at
`fe5e09aaa04705d41a929082f89403a59cd1f2a4`, and `sha256sum -c` reports OK for every touched file:

```text
6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b  scripts/round-gate.mjs
77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c  scripts/surface-probe.mjs
d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758  scripts/cap-run.mjs
3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e  scripts/cap-spawn.mjs
```

Mutant-only hashes: A `scripts/round-gate.mjs 35cd416bfed889c37abfc1a3d331b5904f23c66aa8a52960d1a1d939b0bd09ad`;
B `scripts/surface-probe.mjs 7fd6b8d2975a2d895e6a641f1dc7fd86f8f512b1fb2fe7022fc4550c7539b027`.

## Notes for the L1 (measured, not a contract change)

1. The allowance is per gate and per class. The identical raw `bash -c 'exit 0'` was rejected in
   `round-gate` (A) and accepted in `surface-probe` (B). That matches the frozen predicate (`:73-74`) and the
   plan's naming of SP1049; it is not drift.
2. The nested-selftest allowance also requires the *owning* gate's path (`selfOf(gate)`) and `--selftest` in
   argv. B's nested child was launched with the gate's own `selfPath` and exited 64 before running the suite,
   so the allowance was exercised without duplicating the four sites. A full nested suite under this
   allowance would also duplicate site execs and would be rejected as `exec_count_ne_base` (independently
   correct, and out of scope per plan § C1); that combination was not measured here.
3. `uncappedDirect` reports an integer count and, when positive, the reason `uncapped_direct_children=<n>`;
   both A's `uncapped_direct=1,1,1` and B's `0,0,0` come from the same frozen binary, so the two directions
   are directly comparable.
4. Coverage consequence: had the counter dropped the `uncapped_direct` reason entirely, A would have read
   `held=4/4` at `fe5e09aa` (its sites stay fully capped). The A run is therefore a live detector for that
   branch, and B guards the opposite failure (over-broad rejection).
