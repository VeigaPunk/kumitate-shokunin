# MutSpawnEnvDodge — control receipt (r48, attempt 2)

**RESULT MutSpawnEnvDodge verdict=KILLED kill_class=no_capped_scope_ancestor**

Assigned control for C1 / F48 (`ROUTED_HELD`): make `scripts/cap-run.mjs` place `MemoryMax`, `MemorySwapMax` and `TasksMax` as environment assignments after systemd-run's `--`, the killed round-47 class, re-derived here. Axis: operability. One mesh, one detector, three runs (pristine, mutant, restored).

## Mutant

- Sandbox `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnEnvDodge/lane`, clone `--no-hardlinks`, detached `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset before every git call.
- Pristine comparator `fc90b99a798e16e5a206d4beb3dd62cfcd40cc37`: this seat's own four-site routing setup on the freeze (RG742 = `capSpawnSync` in `round-gate` `runGate`; SP491/SP519 = `capSpawnSync` in the surface readers; SP1592 = `capSpawnSync` in `spawnSelf`). It is control scaffolding, **not the C1 candidate**; per the attempt-2 addendum, a control's own legitimate comparator reading 4/4 is not a control reading and forces no amendment.
- Mutant `bd30d664475020765cc9c1a2e06844146552eec4`, `scripts/cap-run.mjs:185-186`, two lines:

```diff
-    '-p', `MemoryMax=${o.mem}M`, '-p', 'MemorySwapMax=0', '-p', `TasksMax=${o.tasks}`, '--',
-    'env', '-i', 'PATH=/usr/bin', 'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc',
+    '--', 'env', '-i', `MemoryMax=${o.mem}M`, 'MemorySwapMax=0', `TasksMax=${o.tasks}`, 'PATH=/usr/bin', 'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc',
```

  Values remain the caller's (`o.mem`, `o.tasks`), so this is the smallest behaviour-bearing change: systemd-run receives no resource properties, `env -i` takes the three strings as assignments for bwrap, and bwrap's `--clearenv` drops them from the child. The child still runs inside bwrap, which is why every gate still passes its own suite.

## Expected detector

Frozen counter `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, `--set r48`. Its `scopeProps()` (lines 239-260) reads only arguments **before** systemd-run's `--`; `isScope()` requires `-p MemorySwapMax=0`, `-p MemoryMax=<n>M` (n ≤ 1024) and `-p TasksMax=<n>` (n ≤ 256). Environment assignments after the separator can never satisfy it, so each site's exec chain lacks a capped scope: `ROUTED_MISS` with `no_capped_scope_ancestor`, exit 1 (evaluable; not 2).

## Output

Pristine `fc90b99` (`MutSpawnEnvDodge-pristine-receipt.txt`), load1 47.83, 18:25:52Z, exit 0:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=fc90b99a798e16e5a206d4beb3dd62cfcd40cc37 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
```

Mutant `bd30d66` (`MutSpawnEnvDodge-receipt.txt`), load1 53.08, 18:28:53Z, exit 1 — every site lost the target ancestor while its gate stayed green:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=bd30d664475020765cc9c1a2e06844146552eec4 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
```

Restored `5e61aae` (`MutSpawnEnvDodge-restored-receipt.txt`), load1 49.04, 18:31:25Z, exit 0:

```text
CAPROUTE48 rev=5e61aae4844cb0bdd4a1a9300b98697620b15350 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
```

(The three SITE lines are byte-identical in shape to the pristine run: 116/116, 2/2, 2/2, 14/14.)

## Verdict

KILLED, and targeted. In all three mutant runs each gate exited 0 with its own full summary (`round-gate 61/61`, `surface-probe 46/46`), `verdict_pass=true`, `fail_lines=0`, exec counts exactly at base (116/2/2/14), `uncapped_direct=0` and no `execveat`. The only loss is the capped-scope ancestor, which is the assigned defect; the counter exited 1, never 2, so the reading is a score. `no_cap_run_ancestor` and `uncapped_exec` are consequences of the counter's chaining (`haveR` is set only while walking a qualifying capped-scope chain; `uncapped_exec` is `capped != n`), not independent findings. The pristine comparator read 4/4 before and the restored bytes read 4/4 after, so detector sensitivity and restoration both hold.

## Restoration evidence

`scripts/cap-run.mjs` was restored by checking out the pristine comparator blob, confirming `git diff fe3d45bf -- scripts/cap-run.mjs` is empty and the sha256 is again `d8acc6de...`, then committing as `5e61aae4844cb0bdd4a1a9300b98697620b15350`. The detector ran on that commit, not on working-tree bytes. The mutant commit remains reachable as its parent.

| File | Pristine | Mutant | Restored |
|---|---|---|---|
| scripts/cap-run.mjs | d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758 | 0bfeb74456c61dd90b908fd2ed9a344632bc952ec31df4ee1d4d5321da94b03f | d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758 |
| scripts/round-gate.mjs | 6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b | unchanged | unchanged |
| scripts/surface-probe.mjs | 77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c | unchanged | unchanged |

Patch `MutSpawnEnvDodge.patch` (comparator + mutant; restoration excluded) sha256 `8b23b214aed8703e48f1394d09ad5aa7334cbba7b62380ff08bbf8c4b08e7bc2`. Counter sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and after. Runtime `node v24.21.0`; no tools installed, no pacman transaction, no service restart.

## Bounds and coverage note

Writes: sandbox clone, `/tmp`, and this item's four files under `.ufo/waves/round-48/r48/` (receipt txt, two auxiliary receipts, patch; plus this report). Lane repo, `.jj`, `.ufo/state`, `watchdog.log` and lane `scripts/` untouched; no git write outside the sandbox; no delegation or background jobs.

Coverage finding: the gates are blind to their children running uncapped — 61/61 and 46/46 with zero caps in the scope. The frozen counter is the only detector that separates the two, and it does so by parsing systemd-run's pre-separator options. A later refactor that keeps the cap strings elsewhere on the command line is still MISS under F48; this probe does not widen the rule.
