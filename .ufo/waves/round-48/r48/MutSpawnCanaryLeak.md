RESULT MutSpawnCanaryLeak verdict=KILLED

Control: a fully routed four-site tree in which one site's child can see the planted canary variable. Expected detector behavior: `ROUTED_MISS` on that site with `canary_in_env`, every other site still `ROUTED_HELD`. Measured: exactly that — SP491 `ROUTED_MISS capped/n=0/2,0/2,0/2 reason=canary_in_env,uncapped_exec`, the other three sites `ROUTED_HELD`, `CAPROUTE48 … held=3/4 runs=3 rule=F48` exit 1. Pristine and restored bytes read `held=4/4` exit 0.

Axis: operability, claim C1 / predicate ROUTED_HELD / rule F48. Round 48, attempt 2, wave r48. This seat produced no candidate score: the frozen counter's own base rev is `f00cf278`, and no C1-commit tree was touched.

## Mutant

- Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnCanaryLeak/lane`, `git clone -q --no-hardlinks` of the lane repo, detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` unset for every command in this seat.
- Routed pristine comparator (`27890bc188ce5f872023b1097f9c33ebdb1dddcf`, tree `1c695d1417772a5c1f9f2695b3484c8511369d4c`): patch 1 of the attempts-1 control `.ufo/waves/round-48/build/CtlEnvCaps.patch` applied to the freeze tip and committed with `-c user.name=seat`. Patch 2 of that file (the scope-cap misplacement) was not applied. The resulting tree hash is byte-identical to attempt-1's `f55bf22e^{tree}` (verified read-only from `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlEnvCaps/lane`), so this seat's baseline is the same legitimate four-site routing, not a re-derivation. All four sites call `capSpawnSync`: RG742 `scripts/round-gate.mjs:743-745`; SP491 `scripts/surface-probe.mjs:492-501`; SP519 `:521-533`; SP1592 `:1595-1598`.
- Mutant (`349752a8456c21030846e9fe25253e490b47b716`, tree `89d3ff4c7a880eacec0fa213d5902b3b3926357f`): two lines added and one changed in `readSightingSurface`, the SP491 site. The routed child's explicit environment gains a `KUMITATE_*` passthrough:

```diff
   const cacheRoot = mkdtempSync(join(tmpdir(), 'kumitate-surface-cache-'));
+  // KUMITATE_* knobs are the lane's own switchboard; carry them into the shim.
+  const knobs = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('KUMITATE_')));
   try {
     const result = capSpawnSync('bash', [host, 'surface', '--json'], {
       …
-      env: gitEnv({ NODE_COMPILE_CACHE: cacheRoot }),
+      env: { ...gitEnv({ NODE_COMPILE_CACHE: cacheRoot }), ...knobs },
```

  This is the plausible defect: an incomplete env scrub at a routed site. `capSpawnSync` forwards every entry of `env` as `--env K=V` (`scripts/cap-spawn.mjs:36`), `cap-run.mjs:184` turns each into bwrap `--setenv`, and bwrap's `--clearenv` (`cap-run.mjs:183-189`) removes only the ambient environment — it cannot remove a pair the runner re-adds. The full chain (cap-run → systemd-run scope with `-p` props → bwrap) stays intact, so the mutation isolates the env channel the canary guards.
- `node --check` on the mutated file passed before scoring (the failure must be the detector's, not a parse error).

## Expected detector and evidence it was targeted

- Counter: `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (the freeze value), invoked unchanged as `node caproute48-probe.mjs <sandbox>/lane <rev> --set r48` under `/usr/bin/timeout -k 10 1500`.
- Expected and observed: `judge()` (probe lines 280-310) marks `canary_in_env` when a site exec's `envp` carries `<canaryKey>=`, and counts that exec as not capped, so the site reads `ROUTED_MISS`. Because the leak is the only injected change, no cap-chain reason (`no_bwrap_ancestor`, `no_capped_scope_ancestor`, `no_cap_run_ancestor`) appears, and no gate-level reason (`gate_exit`, `fail_lines`, `selftest_cases_below_base`, `exec_count_ne_base`, `uncapped_direct_children`, `execveat`, `no_final_verdict_pass`) appears either.
- `uncapped_exec` accompanies the targeted reason by construction (probe lines 303-308: `capped` increments only for `haveR && !leak`), so it is derivative, not a second finding.

## Measured output, verbatim

Mutant `349752a8` (receipt RUN 2, lines 9-15 of the run block):

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=canary_in_env,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=349752a8456c21030846e9fe25253e490b47b716 base=f00cf278 set=r48 held=3/4 runs=3 rule=F48
exit=1 elapsed_s=163 load1_after=50.72
```

All eight `RUN` lines of that invocation read `exit=0`, `cases=61/61` (round-gate) or `46/46` (surface-probe), `verdict_pass=true`, `fail_lines=0`, so the miss is not an incidental suite failure.

Pristine `27890bc1` and restored `79d5c7d6` both read the four `SITE … label=ROUTED_HELD` lines and `CAPROUTE48 … held=4/4 runs=3 rule=F48`, `exit=0` (load1 50.40 and 46.60; elapsed 127 s and 142 s).

## Verdict

KILLED. The frozen counter is sensitive to the env channel the predicate names: a routed site that re-adds an ambient `KUMITATE_*` pair to its child is rejected as `ROUTED_MISS` on exactly that site while the other three stay `ROUTED_HELD`, and the run exits 1 (a score), never 2. This control does not force an `A<n>` amendment to F48 and is not a candidate score. A survivor here would have been a coverage finding about the canary clause; none occurred.

## Restoration evidence

- Restored commit `79d5c7d678c5c53654a24191d0b5863a8801f26e`, tree `1c695d1417772a5c1f9f2695b3484c8511369d4c` — identical to the pristine comparator's tree (verified with `git rev-parse HEAD^{tree}` vs `27890bc1^{tree}`; `git status --porcelain` empty).
- `scripts/surface-probe.mjs` blob: pristine `1a3c6145fb8369d85e4d4823ce65e910adb584e7` → mutant `207e28a744c905afcb747e6143c191a5a9ac9b5d` → restored `1a3c6145fb8369d85e4d4823ce65e910adb584e7`.
- Worktree sha256 after restore: `scripts/surface-probe.mjs 77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c`, `scripts/round-gate.mjs 6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b`, `scripts/cap-run.mjs d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`, `scripts/cap-spawn.mjs 3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` (the last two untouched by this probe).
- Restoration was verified by re-running the same detector on the restored commit (held=4/4 exit 0), not by inspection alone.

## Bounds

Writes: this seat's sandbox clone (`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnCanaryLeak/`), `/tmp/canary-*`, and the two files `MutSpawnCanaryLeak-receipt.txt` / `MutSpawnCanaryLeak.md` in this directory. No write to the lane repo, its `.jj`, `.ufo/state`, `scripts/`, or any sibling checkout; sandbox commits only, `-c user.name=seat`. The counter's own scratch root `/fast/scratch/hyaku/kumitate-r48/probe-runs` is created and removed by the frozen probe itself. Tooling: none installed (pacman paused; nothing needed beyond the host's node and the existing probe).

Receipt: `.ufo/waves/round-48/r48/MutSpawnCanaryLeak-receipt.txt` (three verbatim run blocks; capture sha256 `94a53f1e…`, `a1b98986…`, `1dde4435…`).
