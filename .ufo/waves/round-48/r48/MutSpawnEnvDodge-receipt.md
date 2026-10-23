RESULT MutSpawnEnvDodge verdict=KILLED kill_class=no_capped_scope_ancestor

Control for C1 / F48 (label ROUTED_HELD), round 48 attempt 2, single v2 wave `r48`, item MutSpawnEnvDodge. Axis: operability. The assigned defect: cap-run places the three scope caps as **environment assignments after systemd-run's `--`** instead of as `-p` scope properties — the killed round-47 class, re-derived independently in this seat's sandbox.

## Mutant and expected detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnEnvDodge/lane`, `git clone --no-hardlinks`, detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` unset before every git call. No git write occurred outside this clone.
- Pristine comparator `fc90b99a798e16e5a206d4beb3dd62cfcd40cc37`: this seat's own four-site routing setup (RG742 `capSpawnSync` in `runGate`; SP491/SP519/SP1592 `capSpawnSync` in the surface readers and `spawnSelf`), built on the freeze. It is control scaffolding, **not the C1 candidate**; its 4/4 reading is a detector-sensitivity baseline, exactly as the attempt-2 addendum rules for a control's own legitimate comparator.
- Mutant `bd30d664475020765cc9c1a2e06844146552eec4`: one file, two runner lines, `scripts/cap-run.mjs:185-186`:

```diff
-    '-p', `MemoryMax=${o.mem}M`, '-p', 'MemorySwapMax=0', '-p', `TasksMax=${o.tasks}`, '--',
-    'env', '-i', 'PATH=/usr/bin', 'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc',
+    '--', 'env', '-i', `MemoryMax=${o.mem}M`, 'MemorySwapMax=0', `TasksMax=${o.tasks}`, 'PATH=/usr/bin', 'bwrap', '--ro-bind', '/', '/', '--dev', '/dev', '--proc', '/proc',
```

  The values stay the caller's (`o.mem`, `o.tasks`), so the only behaviour change is that systemd-run receives no resource properties; `env -i` eats the three strings as variable assignments for bwrap, and bwrap's `--clearenv` then drops them from the child. The child is still sandboxed and still runs, which is why the gates keep passing.
- Expected detector: the frozen counter's `scopeProps()` scans only arguments **before** systemd-run's `--` (`caproute48-probe.mjs:239-260`); `isScope()` requires `-p MemorySwapMax=0`, `-p MemoryMax=<n>M` (n ≤ 1024) and `-p TasksMax=<n>` (n ≤ 256). Environment assignments after the separator cannot satisfy `isScope`, so no capped-scope ancestor exists for any site's exec → all four sites `ROUTED_MISS` with `no_capped_scope_ancestor`, counter exit 1 (not 2).

## Measured output

Frozen counter: `node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> <rev> --set r48`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and after all runs, unchanged.

Pristine comparator (`fc90b99`, load1 47.83, 18:25:52Z) — receipt `MutSpawnEnvDodge-pristine-receipt.txt`:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=fc90b99a798e16e5a206d4beb3dd62cfcd40cc37 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0
```

Mutant (`bd30d66`, load1 53.08, 18:28:53Z) — receipt `MutSpawnEnvDodge-receipt.txt`, verbatim:

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec
CAPROUTE48 rev=bd30d664475020765cc9c1a2e06844146552eec4 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=53.08 end=18:28:53Z
```

Restored bytes (`5e61aae`, load1 49.04, 18:31:25Z) — receipt `MutSpawnEnvDodge-restored-receipt.txt`:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=5e61aae4844cb0bdd4a1a9300b98697620b15350 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0
```

## Verdict

KILLED, targeted. All four sites lost the capped-scope ancestor while every gate selftest still exited 0 with its full own summary (round-gate 61/61, surface-probe 46/46), `verdict_pass=true`, `fail_lines=0`, exec counts exactly equal to the base run (116/2/2/14) and `uncapped_direct=0`. So the kill is not an incidental selftest failure, a count mismatch, a direct-child dodge or an `execveat`; it is the assigned defect. Exit 1, never 2 — the probe could evaluate.

`no_cap_run_ancestor` and `uncapped_exec` accompany the target as consequences, not independent findings: the counter sets `haveR` only while walking a qualifying capped-scope chain, and `uncapped_exec` is `capped != n`. No `canary_in_env`, no `no_bwrap_ancestor` (the bwrap sandbox is untouched by this mutation).

## Restoration and hashes

Restoration was a byte checkout of `scripts/cap-run.mjs` from the pristine comparator commit, then a sandbox commit `5e61aae4844cb0bdd4a1a9300b98697620b15350`; `git diff fe3d45bf -- scripts/cap-run.mjs` is empty after restoration, and the counter was re-run on the restoration commit (not on uncommitted bytes). The mutant commit stays reachable as its parent.

| File | Pristine | Mutant | Restored |
|---|---|---|---|
| scripts/cap-run.mjs | d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758 | 0bfeb74456c61dd90b908fd2ed9a344632bc952ec31df4ee1d4d5321da94b03f | d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758 |
| scripts/round-gate.mjs | 6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b | same | same |
| scripts/surface-probe.mjs | 77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c | same | same |

- Patch (comparator + mutant commits, restoration excluded): `MutSpawnEnvDodge.patch`, sha256 `8b23b214aed8703e48f1394d09ad5aa7334cbba7b62380ff08bbf8c4b08e7bc2`.
- Receipts: mutant `MutSpawnEnvDodge-receipt.txt` sha256 `8c6b805d8f94cbf3930803cbe616162a4d5b9e87b318c0f4ee61577289f67dca`; pristine `MutSpawnEnvDodge-pristine-receipt.txt` sha256 `14101a33ae4f33d4af67fd784b315cf867e65af886ef7b2922e32320c5211915`; restored `MutSpawnEnvDodge-restored-receipt.txt` sha256 `ab3b69e89b2bbb86141202751c68248b77d35388b232d21a5abee4bd675956a9`. The mutant file's counter body is verbatim; its header carries the RESULT line, commits and hashes required by the item.
- Runtime: `node v24.21.0` (fnm shim resolved via `command -v node`, realpath used by cap-run). No tools installed or upgraded; no pacman transaction; no host service touched; no lane/fleet/sibling write outside this item's files.

## Bounds

Writes were confined to the sandbox clone, `/tmp`, and this item's files under `.ufo/waves/round-48/r48/`. The lane repo, lane `.jj`, `.ufo/state`, watchdog log and `scripts/` were never written. No delegation, no background jobs beyond the tool's own long-command handling, no model routing.

## Coverage finding

The frozen counter rejects this class for the right reason and the mutant is dead. The residual exposure is what the mutation leaves intact: the gates cannot observe that their children ran **uncapped** — the selftests pass 61/61 and 46/46 with zero caps in the scope. The counter is the only detector that distinguishes the two, and it does so by parsing systemd-run's pre-separator options. A future routed site or runner refactor that keeps the strings anywhere else on the command line would still be MISS; F48 is not widened by this probe.
