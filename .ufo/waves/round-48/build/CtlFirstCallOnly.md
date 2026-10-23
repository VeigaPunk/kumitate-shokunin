RESULT CtlFirstCallOnly verdict=killed

## Finding — rejected control, but two sites miss only on the gate-wide condition

The frozen F48 counter rejected this control: all four sites are `ROUTED_MISS`, `held=0/4`, exit 1. No site read `ROUTED_HELD`; no counter invocation exited 2. This is a pre-data negative-control result, not a score of the C1 candidate.

- **Targeted detection:** RG742 and SP1592 each have `uncapped_exec` in all three runs, with respectively 2/116 and 2/14 executions capped. Evidence: `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt:9,12`.
- **Incidental to the individual reader mutation:** SP491 and SP519 each have **2/2 executions capped** in every run and miss **only** for `uncapped_direct_children=6`, the owning surface gate's raw direct children. They do not report `uncapped_exec`. Evidence: `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt:10-11`; frozen counter `.ufo/waves/round-48/probe/caproute48-probe.mjs:263-277,365-366`.
- **Not an incidental selftest failure:** all three mutated round-gate suites passed 61/61; all three mutated surface-probe suites passed 46/46. Every suite exited 0, retained its final PASS verdict, and emitted zero FAIL lines; execution counts match the base. Evidence: `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt:1-12`.
- **Coverage qualification:** the frozen surface suite invokes each live reader once per module instance, then starts a fresh nested selftest whose module flags reset. Thus both reader executions are first calls. The restored freeze's `scripts/surface-probe.mjs:1537,1573,1762-1767` in the sandbox identifies those reader calls and the nested process. If the gate-wide uncapped-direct-child failure were absent, **no remaining measured condition would reject these two reader-site mutants in this workload**. To detect their later raw calls specifically, the workload would need a second invocation of each reader in the same module instance; that execution would have to fail the existing `t.capped !== t.n` / `uncapped_exec` condition at counter line 365. No contract or counter was changed.

## Mutant and artifacts

- Axis: operability only; C1 / ROUTED_HELD, round 48 attempt 1, wave build.
- Sandbox: `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/lane`.
- Parent: `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Runnable control commit: **`1e6130acaca1ef32fe2658030586edbcec7bebb5`**, retained on sandbox branch `CtlFirstCallOnly-control`.
- Mutant: one module-level first-call flag for each of RG742, SP491, SP519 and SP1592. The first actual launch at that site uses `capSpawnSync`; subsequent launches use the original raw `spawnSync`. First-call options explicitly expose the fixture/cache/state directories and only the required child environment. Later raw calls keep their original environment behavior. Nested processes initialize their own flags. The four selectors are at control-commit `scripts/round-gate.mjs:140,745-752` and `scripts/surface-probe.mjs:148-150,496-505,527-541,1603-1611`.
- Patch: `.ufo/waves/round-48/build/CtlFirstCallOnly.patch`.
- Patch SHA-256: `a09377e40d4a26da461cf3ae8895a3186f854147af23cfd168eda5f368fe08de`.
- Scored receipt: `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt`.

## Frozen detector and exact commands

The executable counter was the lane's unedited absolute-path copy on every invocation:

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs`

Its SHA-256 before the first run and after all three runs was:

`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`

Expected control detector outcome: every site ROUTED_MISS; the requested targeted reason was `uncapped_exec`. The actual per-site reason qualification is above.

All three commands ran with cwd `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly` and `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` unset. Stdout and stderr were captured together in the named receipt, followed by the actual exit/load/end trailer. Each invocation used the same 1500-second timeout with a 10-second kill grace.

Pristine command (receipt `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/CtlFirstCallOnly-pristine-receipt.txt`):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

Mutated command (receipt `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt`):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/lane 1e6130acaca1ef32fe2658030586edbcec7bebb5 --set r48
```

Restored command (receipt `/fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/CtlFirstCallOnly-restored-receipt.txt`):

```sh
timeout -k 10 1500 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/lane fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r48
```

| Bytes | Start UTC | Start load1 | Result | Owning selftests in all three rev runs |
|---|---|---:|---|---|
| Pristine freeze | 11:53:20.766718 | 30.54 | held=0/4, exit 1 | round 61/61, surface 46/46; exits 0 |
| First-call-only control | 11:55:52.759338 | 47.67 | held=0/4, exit 1 | round 61/61, surface 46/46; exits 0 |
| Restored freeze | 11:57:19.532807 | 54.85 | held=0/4, exit 1 | round 61/61, surface 46/46; exits 0 |

The pristine/restored exit 1 is the freeze's expected unrouted negative result, not a selftest/base-run failure. Their baseline measurements were valid; no positive C1 invariant is claimed for the pristine freeze. The complete raw outputs remain in their receipts (RUN lines 1-8, SITE lines 9-12, summary/trailer lines 13-14).

## Scored SITE and CAPROUTE48 lines, verbatim

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=2/116,2/116,2/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=57,57,57 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=57
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=6,6,6 reason=uncapped_direct_children=6
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=6,6,6 reason=uncapped_direct_children=6
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=2/14,2/14,2/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=6,6,6 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=6
CAPROUTE48 rev=1e6130acaca1ef32fe2658030586edbcec7bebb5 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=54.85 end=11:57:19Z
```

Pristine summary/trailer, verbatim:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=45.09 end=11:54:30Z
```

Restored summary/trailer, verbatim:

```text
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=54.29 end=11:58:43Z
```

## Restoration and containment evidence

Restoration ran in a `finally` block, after scoring and exporting the control:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/lane switch -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Both source files were compared byte-for-byte to their captured pristine contents before the restored detector ran (`restored_exact_bytes=True`). Their hashes after the restored run still matched the pristine hashes:

| File | Pristine / restored SHA-256 | Mutated SHA-256 |
|---|---|---|
| `scripts/round-gate.mjs` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` | `65b692420196760c6ca6238721dbb8db2227c521c0fdff24fb70de7445a812e6` |
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `21a2125380d51953e265e8e6a337be120731678a6cbdf28fa1dc9703cda85214` |

The control was committed using `git -c user.name=ctl -c user.email=ctl@local commit -m 'round-48 control: cap only the first call at each C1 site'` inside the sandbox clone. The patch was exported with:

```sh
git -C /fast/scratch/hyaku/kumitate-r48/seats/w1-CtlFirstCallOnly/lane format-patch --stdout fe3d45bf929246915c8c0de5f7f8682b5015b22c..1e6130acaca1ef32fe2658030586edbcec7bebb5
```

Its stdout was written to the permitted lane `CtlFirstCallOnly.patch` path. No git writes occurred in the lane or fleet repo. Lane writes were restricted to this report, the requested receipt and the requested patch. No sibling sources, counter bytes, state or manifests were edited.

Before cloning, `df -h /fast` reported `/dev/nvme1n1p2 804G 734G 70G 92% /fast`. No large build ran. The initial asynchronous pristine launch was refused by the tool's 100-background-job limit and did not run; the recorded pristine detector ran synchronously through the timeout command. Every launched detector completed; its process group was subjected to cleanup in the execution wrapper after completion. No long-lived service was started. No tools were installed or updated. No checks beyond the three assigned frozen-counter invocations were run.
