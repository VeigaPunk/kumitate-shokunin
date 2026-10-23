RESULT MutRunnerDropTasks verdict=killed (control) target=TasksMax above 256 (cap-run with TasksMax=1024)

Axis: operability. Round 48, attempt 2, v2 wave `r48`, item "control: TasksMax above 256".
Frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; counter `probe/caproute48-probe.mjs`
sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (matches the freeze).

## Control outcome

Expected detector and observed detector agree, and the control is discriminating:

| measurement | rev | counter line | exit |
|---|---|---|---|
| baseline (routed comparator, pristine `cap-run`) | `5678ffee` | `held=4/4 runs=3 rule=F48` | 0 |
| mutant (`TasksMax=1024`) | `3c224789` | `held=0/4 runs=3 rule=F48` | 1 |
| restored (exact pristine bytes) | `a0b441ff` | `held=4/4 runs=3 rule=F48` | 0 |

Every site misses with `no_capped_scope_ancestor`, the arm of F48 that requires the scope's own options to set
`-p TasksMax=<= 256`. The two co-reported reasons (`no_cap_run_ancestor`, `uncapped_exec`) are consequences of the
same ordered-chain test — the counter only sets `haveR` inside a qualifying scope (counter:290-308) — not an
independent failure. No run exited 2. **No site read `ROUTED_HELD` under the mutant, so the pre-data control forces
no `A<n>` amendment and F48 stands unamended.** This seat scored no C1 candidate: the comparator is a control
fixture, and the L1 alone scores C1.

## Why a comparator was needed, and what it is

At the frozen tip none of the four sites is routed, so the counter reads `held=0/4` for base reasons and a runner-only
mutation would be non-discriminating. The control therefore rides on a routing-only comparator, rebuilt in this
seat's own sandbox from the attempt-1 `CtlEnvCaps` patch 1 (README of the control in
`.ufo/waves/round-48/build/CtlEnvCaps.md`), with **default caps** (`capSpawnSync` defaults `mem: 512`, `tasks: 64`, both
inside the predicate's bounds):

- RG742 `scripts/round-gate.mjs:743-745` `runGate` → `capSpawnSync(process.execPath, [SELF, ...args], …)` (bind `tmp`).
- SP491 `scripts/surface-probe.mjs:492-499` surface shim → `capSpawnSync('bash', [host, 'surface', '--json'], …)`.
- SP519 `scripts/surface-probe.mjs:521-533` dispatcher status → `capSpawnSync(process.execPath, [host, 'status'], …)`.
- SP1592 `scripts/surface-probe.mjs:1595-1598` `spawnSelf` → `capSpawnSync(process.execPath, [selfPath, ...args], …)`.

Comparator commit `5678ffee28b82f037a35d5f0f24bdd7b6708a2d7`; export
`MutRunnerDropTasks-comparator.patch` (sha256 `577a088b0f75ced105e524e5432bb0bfc0c092e8ab5221c0a1b9417c9203f853`).
`cap-run.mjs` and `cap-spawn.mjs` are byte-identical to the frozen tip in this commit.

## The mutant

One literal at the runner's argv construction — `scripts/cap-run.mjs:186`:

```diff
-    '-p', `MemoryMax=${o.mem}M`, '-p', 'MemorySwapMax=0', '-p', `TasksMax=${o.tasks}`, '--',
+    '-p', `MemoryMax=${o.mem}M`, '-p', 'MemorySwapMax=0', '-p', 'TasksMax=1024', '--',
```

`--tasks` stays required and validated (`cap-run.mjs:138,140`), so the defect is exactly the one under test: the
runner accepts the caller's cap and silently emits a scope with `TasksMax=1024`. Nothing else changes — memory cap,
bwrap flags, environment clearing, PID namespace, budget and the verdict line are untouched, and `cap-run --selftest`
is not what the counter runs.

Mutant commit `3c2247892e795d5950e96bb7400888dcb8999111`; export `MutRunnerDropTasks-mutant.patch`
(sha256 `d7e111e2702222686a3230b2bfd4bce5336c763224796d08d204c149abc84760`).

This complements the attempt-1 `CtlLooseCaps` control, which put `tasks: 1024` in the callers' `capSpawnSync` options:
that one proves the counter reads the option the caller asks for; this one proves the counter reads the option the
runner actually emits, so a runner that ignores or rewrites its `--tasks` argument cannot pass unnoticed.

## Exact detector commands

Working directory `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutRunnerDropTasks`, `GIT_DIR`,
`GIT_WORK_TREE` and `GIT_INDEX_FILE` unset, `timeout -k 10 1200` bound:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs \
  /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutRunnerDropTasks/lane <rev> --set r48
```

`<rev>` = `5678ffee…` (baseline, `exit=0`), `3c224789…` (mutant, `exit=1`), `a0b441ff…` (restored, `exit=0`). Raw
outputs, verbatim, are in `MutRunnerDropTasks-receipt.txt` § [1]-[3]; each carries the run's `load1` and UTC end time
(29.86 / 59.45 / 49.51). Wall times 84 s / 178 s / 149 s.

## Targetedness — no incidental masking

Under the mutant the owning gates still pass completely in all three revision runs (`61/61` and `46/46` cases,
`verdict_pass=true`, `fail_lines=0`), no `execveat` occurs, `uncapped_direct=0,0,0`, and each site's child is exec'd
exactly as often as in the base run (`c/n = 0/116, 0/2, 0/2, 0/14` against `base_n = 116, 2, 2, 14`). The
exec-count-equality arm of F48 therefore passed and cannot be the reason for the miss; the sole failing arm is the
scope's `TasksMax`. Base runs are identical across all three invocations (`round-gate` 61/61, 1308 execs;
`surface-probe` 46/46, 54 execs), so the differential is against a stable base.

## Exact-byte restoration evidence

Restoration was an inverse surgical edit, then a sandbox-only commit.

```
sha256 scripts/cap-run.mjs  pristine  d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758
                            mutant    e31e58c9f57a5a9be4dc1c397ee7f5a0142a50b59e48ea78d744224b32de79fc
                            restored  d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758
cmp scripts/cap-run.mjs /tmp/mutrun-droptasks/cap-run.pristine.mjs   → CAPRUN_BYTES_IDENTICAL
git rev-parse a0b441ff^{tree} 5678ffee^{tree}                        → 1c695d1417772a5c1f9f2695b3484c8511369d4c (both)
```

The restored tree hash equals the comparator tree hash, i.e. the only delta the mutant ever introduced is gone, and
the restored counter run independently re-reads 4/4 exit 0; the sandbox worktree at `a0b441ff` is clean. (Sandbox clone commits used `-c user.name=seat`; the lane repo and its `.jj` were
never written.)

## Caveats for the L1

- This is **not** a C1 score. `held=4/4` at `5678ffee` is a control fixture under the attempt-1 `CtlEnvCaps`
  shape and was measured at `load1≈30` in this seat; C1's kill rule still requires the L1's own score run plus the
  committed wave re-runs on the C1 commit.
- The counter's frozen code hard-codes its run scratch at `/fast/scratch/hyaku/kumitate-r48/probe-runs/`; the
  counter created and removed its per-run trees there. This seat wrote no file at that path directly.
- No tool was installed or updated for this item, so there is no install record to carry.
- Timing: baseline 18:24:57Z, mutant 18:28:04Z, restored 18:30:43Z (UTC); item finished well inside the ~25 min
  bound.
