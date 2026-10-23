# MutRunnerDropSwap — control `drop MemorySwapMax` (round 48, wave r48)

Seat: `kumitate-r48-MutRunnerDropSwap` (mutation tester, journal mode). One probe, no delegation.

## Assignment

Route one child-process site of the C1 surface through `scripts/cap-run.mjs` (contract
`kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs` `capSpawnSync`, while the runner's own
`systemd-run --scope` argv omits `-p MemorySwapMax=0`. Expected detector reading:
`no_capped_scope_ancestor` on the routed site from the frozen counter
`probe/caproute48-probe.mjs` (sha256 `f24a3af5…`), `--set r48`, rule `F48`.

## Mutant

Sandbox clone (no write to the lane repo): `/fast/scratch/hyaku/kumitate-r48a/seats/MutRunnerDropSwap/lane`,
detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
Patch: `r48/MutRunnerDropSwap.patch` (sha256 `4f10169a51b6d5cc6bb11ffd287655db063f9984c689680d8b0f9a53edb94280`),
commit `173a84cd3856f97e62d75f2f88418cf6eea57a44` (`-c user.name=seat`).

Two edits, 5 insertions / 3 deletions:

1. `scripts/cap-run.mjs:186` — the smallest behaviour-bearing point for the defect:

   ```
   -    '-p', `MemoryMax=${o.mem}M`, '-p', 'MemorySwapMax=0', '-p', `TasksMax=${o.tasks}`, '--',
   +    '-p', `MemoryMax=${o.mem}M`, '-p', `TasksMax=${o.tasks}`, '--',
   ```

   MemoryMax and TasksMax stay inside the predicate's bounds (`<= 1024M`, `<= 256`); every other
   link of the chain is untouched (node `cap-run.mjs` → `systemd-run --scope` → `bwrap
   --unshare-pid --clearenv --die-with-parent` → child).

2. `scripts/surface-probe.mjs` — route exactly one site, SP491 (`readSightingSurface`), through
   `capSpawnSync('bash', [host, 'surface', '--json'], { …, bind: [cacheRoot], env: { HOME,
   NODE_COMPILE_CACHE } })` with the `capSpawnSync` defaults (`mem=512`, `tasks=64`). The other
   three sites (RG742, SP519, SP1592) are left unrouted, so the wave's declared surface is not
   implemented — the mutant is only meant to make the swap clause the sole failing link on SP491.

Behaviour neutrality check (not the score): the mutant tree's
`node scripts/surface-probe.mjs --selftest` reads `46/46 cases passed`, `VERDICT: PASS`, exit 0 —
the routing does not perturb the suite it is measured from.

Hashes: pristine `cap-run.mjs d8acc6de…`, `surface-probe.mjs 0cd94432…`; mutant
`cap-run.mjs f9d297c2a8f5d5395100efb7c7f967a28c29c02170adfe969b669c92ca0197d3`,
`surface-probe.mjs 9078d304fce579b2b78d5fa65eff5afe104f9955f472827e92cc2ca7b983f213`.

## Detector and expected output

```
node .ufo/waves/round-48/probe/caproute48-probe.mjs <sandbox-lane> <rev> --set r48
```

Per the frozen predicate, SP491's exec under the mutant is preceded by the runner and by bwrap,
carries no canary, and matches the base exec count (2), but its `systemd-run --scope` fails the
conjunct `-p MemorySwapMax=0`. Expected: the SP491 `SITE` line reads `ROUTED_MISS` with
`reason=no_capped_scope_ancestor`, aggregate `held=0/4`, exit 1.

## Observed

Three invocations of the same frozen counter, same sandbox lane, same `--set r48` (full text in
`r48/MutRunnerDropSwap-receipt.txt`):

| run | rev | aggregate | SP491 line |
|---|---|---|---|
| pristine | `fe3d45bf` | `held=0/4` exit 1 | `capped/n=0/2,0/2,0/2 … uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9` |
| mutant | `173a84cd` | `held=0/4` exit 1 | `capped/n=0/2,0/2,0/2 … uncapped_direct=8,8,8 reason=no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=8` |
| restored | `fe3d45bf` | `held=0/4` exit 1 | identical to the pristine SP491 line (`uncapped_direct=9,9,9`) |

Mutant-side corroboration that the routing, and only the routing, took effect in the surface-probe
runs: `execs` 54 → 68 in all three rev runs (the cap-run/systemd-run/bwrap/systemctl machinery for
two routed calls), `uncapped_direct` 9 → 8 on the surface-probe sites (the routed `bash` is no
longer a direct child of the gate), while every round-gate run stays at `execs=1308`, `61/61`, and
the base runs are unchanged. `gates exit 0`, `fail_lines=0`, `VERDICT: PASS` in every run, so the
kill is not an artefact of a broken gate.

Interpretation: the routed SP491 exec loses `no_bwrap_ancestor` (bwrap ancestor found) and
`canary_in_env` (cap-spawn's complete-env semantics work), keeps `capped/n=0/2`, and the scope
clause fires — the detector's `MemorySwapMax=0` conjunct is load-bearing.

### Reading note (do not over-read `no_cap_run_ancestor`)

`no_cap_run_ancestor` also appears on the mutant's SP491 line, but it is not independent evidence
that the runner link is missing. The judge nests the runner search inside the scope match
(`caproute48-probe.mjs`, `judge`):

```js
for (const S of before(sp, B.seq).filter(isScope)) {
  haveS = true;
  for (const rq of ancestorsOrSelf(p, S.pid)) {
    if (before(rq, S.seq).some((R) => isNode(R) && R.argv[1] === runnerFile)) haveR = true;
```

`isScope` already requires `MemorySwapMax=0`, so when that property is dropped no `S` is ever
iterated and `haveR` is never computed. The same nesting produces the same paired reason in
attempt 1's `build/CtlLooseCaps-receipt.txt` (loose caps, all four sites). The informative token is
therefore the first failing link, `no_capped_scope_ancestor`; the missing-runner token is derivative.
No amendment to F48 is implied or needed.

### `held=0/4` is not the discriminator here

Any mutant that routes fewer than all four sites, or routes them defectively, reads `held=0/4`.
The control's kill is carried by the per-site reason on the routed site, exactly as the plan's
attempt-1 controls were scored ("all 17 killed control mutants read `held=0/4`; targeted kills").
A counter that ignored the swap property would have read the same `held=0/4` here — its SP491 line
would have carried `capped/n=2/2` — so the SP491 `capped/n=0/2` + `no_capped_scope_ancestor` pair
is the observable that separates this kill from a counter blind to the clause.

## Verdict

**killed** — targeted and expected: the routed site is rejected with
`reason=no_capped_scope_ancestor` in all 3 mutant runs, `held=0/4` exit 1, gate output clean.
The mutant survives nothing: it is indistinguishable from an unrouted base at the aggregate, and
per-site it is distinguished by the swap clause. No `A<n>` amendment is forced.

## Restoration evidence

After the score, `git checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c` in the
sandbox clone; `git status --porcelain` = 0 entries; `scripts/cap-run.mjs` = `d8acc6de…` and
`scripts/surface-probe.mjs` = `0cd94432…`, byte-equal to the pristine blobs
(`git show fe3d45bf:<path> | sha256sum`). The restored counter invocation reproduces every
pristine `SITE` line exactly (only the load-dependent `resumed` counts differ).

## Bounds and provenance

- Wrote only the sandbox clone and these three files under `.ufo/waves/round-48/r48/`
  (`MutRunnerDropSwap-receipt.txt`, `MutRunnerDropSwap.md`, `MutRunnerDropSwap.patch`) and `/tmp`.
  The lane repo was read only (`git log/show/status`, no writes, no jj/git mutation).
- Tooling: nothing installed or upgraded (node, strace, systemd-run, bwrap, prlimit already
  present; no pacman transaction).
- Timings/load: pristine 18:24:09–18:25:00Z (load1 12.37→33.07), mutant 18:25:02–18:26:25Z
  (33.07→52.83), restored 18:26:59–18:28:20Z (54.77→56.97).
- Limits of this probe: one site, sandbox clone, F48 counter unchanged; this control says nothing
  about whether a live scope would actually exhaust swap (the predicate inspects the `systemd-run`
  option list, not swap accounting), and it does not score C1.
