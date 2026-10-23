# MutRunnerLooseMem — pre-data control: `cap-run` launched with `MemoryMax=4G`

RESULT verdict=**KILLED (targeted)**. Pristine comparator `held=4/4` exit 0; mutant `held=0/4` exit 1 with
`no_capped_scope_ancestor` at all four sites and no incidental failure; restored bytes are identical to pristine
and read `held=4/4` exit 0 again. Claim C1, rule F48, round 48 attempt 2 wave `r48`.

## Frozen artifacts used

- Counter: `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256
  `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (matches the plan's freeze hash; the hash was
  re-read immediately before the three runs).
- Predicate sentence: plan § C1, `ROUTED_HELD`; the scope clause requires the `systemd-run --scope` ancestor's own
  options to set `-p MemorySwapMax=0`, `-p MemoryMax=<= 1024M` and `-p TasksMax=<= 256` (probe `isScope`,
  `caproute48-probe.mjs:254-260`).
- Base rev of the counter's own base measurement: `f00cf278a5ab57e87b18418fc972be9f893f65da`.
- Sandbox lane: `/fast/scratch/hyaku/kumitate-r48a/seats/MutRunnerLooseMem/lane`, cloned `--no-hardlinks` from the
  lane repo and detached at the freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. No git write touched a real
  checkout; no git command was run against the real lane repo and its tracked files are untouched.

## Mutant (one behavior-bearing line)

The pristine comparator routes the four C1 sites through `scripts/cap-spawn.mjs` `capSpawnSync` using the module's
defaults (`mem = 512`, `tasks = 64`), which the probe's scope clause accepts. The mutant changes exactly one
constant — the `capSpawnSync` memory default:

```diff
-  env = {}, bind = [], timeout = 60_000, mem = 512, tasks = 64, cwd, encoding = 'utf8', maxBuffer, input,
+  env = {}, bind = [], timeout = 60_000, mem = 4096, tasks = 64, cwd, encoding = 'utf8', maxBuffer, input,
```

so every routed child is launched under `MemoryMax=4096M` (4G) while `MemorySwapMax=0` and `TasksMax=64` stay legal.
The module's own doc comment still says “`mem` (MiB, default 512)”, so the defect is a plausible code/doc drift,
not a synthetic marker. Always-on caps at 512 MiB/64 tasks are a documented choice (gates' child spawns are small);
raising the default to 4G is exactly the “cap exists but does not bind” failure F48 was written to reject.

- Pristine commit `14cdbbba4894b4673a4cc836baea4568d5e3e149` — comparator only
  (`MutRunnerLooseMem-pristine.patch`; `round-gate.mjs` +6, `surface-probe.mjs` +16/−8; the same comparator patch
  attempt 1 scored 4/4 at `f55bf22e`, `build/CtlEnvCaps-pristine-receipt.txt`).
- Mutant commit `d5680efc265afcc0b286b1870d8a2ac898dff995` — `MutRunnerLooseMem-mutant.patch` (1 insertion,
  1 deletion).
- Restored commit `56d04cf4c4cd7d2cf80c3ddbbcfa90c3ea20b5e0` — `git checkout 14cdbbba -- scripts/cap-spawn.mjs`,
  then `git diff --quiet 14cdbbba 56d04cf4 -- scripts` exits 0 (`TREE_BYTES_IDENTICAL`).

File sha256 by rev (only `cap-spawn.mjs` differs; `round-gate.mjs 6ffd3ab0…`, `surface-probe.mjs 77367904…`,
`cap-run.mjs d8acc6de…` are identical in all three):

| rev | `scripts/cap-spawn.mjs` sha256 |
|---|---|
| pristine `14cdbbba` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |
| mutant `d5680efc` | `eb7929a4159c4b52cfe80a19fbb233a9b239471f746d7191ac9ef85ccdee01fc` |
| restored `56d04cf4` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |

## Expected detector

`node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> <rev> --set r48` — 1 base run at `f00cf278` and 3 rev
runs per owning gate (`round-gate --selftest`, `surface-probe --selftest`) under `strace -f` with a planted canary.
For a 4G scope the predicate's `isScope` is false, so `haveS`/`haveR` stay false and every site must read
`ROUTED_MISS reason=…no_capped_scope_ancestor…`; the counter must exit 1. Exit 2 would be inconclusive.

## Outputs (verbatim final lines)

Pristine — `MutRunnerLooseMem-pristine-receipt.txt`:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=14cdbbba4894b4673a4cc836baea4568d5e3e149 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=59.45 end=18:28:06Z
```

Mutant — `MutRunnerLooseMem-receipt.txt` (see note on the first mutant run below):

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=d5680efc265afcc0b286b1870d8a2ac898dff995 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 signal=none load1=40.00 end=2026-10-23T18:33:58Z
```

Restored — `MutRunnerLooseMem-restored-receipt.txt`:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=56d04cf4c4cd7d2cf80c3ddbbcfa90c3ea20b5e0 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=59.45 end=18:28:06Z
```

Invocation note: the mutant was scored three times. The first (in the same batch as pristine/restored) is preserved
as `MutRunnerLooseMem-mutant-receipt.txt`; that shell did not append its `exit=` trailer when the probe returned
non-zero, and a plain re-run behaved the same way. `MutRunnerLooseMem-receipt.txt` is therefore the third
invocation, run under a supervisor wrapper that executes the probe as a child and writes its status itself:
`exit=1 signal=none load1=40.00 end=2026-10-23T18:33:58Z`. All three invocations produced the same four SITE lines
and the same `held=0/4` summary; no invocation printed `CAPROUTE48: ERROR` or exited 2.

## Target isolation (why the miss is the MemoryMax clause)

- **The routing is still present.** All three mutant rev runs report `execs=2120` for `round-gate` and `execs=180`
  for `surface-probe`, exactly the pristine routing counts (base `1308`/`54`; the +812/+126 are the
  cap-run → systemd-run → env → bwrap chain, 7 execs per routed child). Only the cap value changed.
- **The chain ran and completed.** Every gate exited 0 with its complete suite (`61/61`, `46/46` in all runs), no
  `FAIL` line, `uncapped_direct=0,0,0` at all four sites, and each site's child executed the base count
  (116 / 2 / 2 / 14). `no_cap_run_ancestor` and `uncapped_exec` are downstream of the same false `isScope`
  (`haveR` is only set inside a qualifying scope ancestor); they are not extra defects.
- **Direct launch evidence** — `MutRunnerLooseMem-scope-trace.txt`, strace of one `capSpawnSync` child per default:
  pristine `["-p","MemoryMax=512M","-p","MemorySwapMax=0","-p","TasksMax=64"]`, mutant
  `["-p","MemoryMax=4096M","-p","MemorySwapMax=0","-p","TasksMax=64"]`, both under the same
  `bwrap … --unshare-pid --die-with-parent … --clearenv` argv and both `CAP_RUN: EXIT code=0`. So the mutant is
  rejected solely because 4096 > 1024, not because the runner, the PID namespace or the environment handling broke.

## Verdict

- Detector behaved as specified: pristine `4/4 exit 0` → mutant `0/4 exit 1`, targeted at all four sites →
  restored `4/4 exit 0`. This is a **killed** control, not a surviving one: F48 catches a 4G `MemoryMax` even when
  `TasksMax` and `MemorySwapMax` are legal.
- Scope of the claim: this is a pre-data negative control on a seat-built comparator, not a candidate score of C1.
  The comparator is not the L1's integration; it is the same patch attempt 1 used to establish that the four sites
  can be held at all.
- The mutant isolates the `MemoryMax` clause alone (TasksMax left at 64, MemorySwapMax at 0). The attempt-1 control
  `CtlLooseCaps` moved both `mem` and `tasks` together; this one pins the single clause.

## Restoration evidence

Pristine and restored `scripts/cap-spawn.mjs` are byte-identical (`3a06e8a2…`), and every other measured file hash
is unchanged across the three revs. `git diff --quiet 14cdbbba 56d04cf4 -- scripts` exits 0. The restored probe
was run against the restored commit archive, not the working tree, and read `held=4/4 exit 0`.

## Bounds / tooling

Writes: sandbox clone under `/fast/scratch/hyaku/kumitate-r48a/seats/MutRunnerLooseMem/`, this seat's files under
`.ufo/waves/round-48/r48/MutRunnerLooseMem*`, and `/tmp/MutRunnerLooseMem-*`. No lane-repo write, no `.jj`, no
`.ufo/state`, no sibling repo, no pacman, no installs, no subagents, no background jobs left running.
