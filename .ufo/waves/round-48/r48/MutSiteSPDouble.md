RESULT MutSiteSPDouble verdict=killed-targeted (strict 3-phase control classification inconclusive: pristine baseline is 0/4 held)

## Outcome

The assigned defect — SP519's routed child launched a second time per dispatch — is rejected by the frozen F48
exec-count check in all 3 runs: `SITE SP519 … capped/n=4/4,4/4,4/4 base_n=2 … reason=exec_count_ne_base,…`.
Every one of the four counted execs carries the complete cap chain (capped = n), the canary is absent, the gate
still exits 0 with `46/46 cases passed` and `VERDICT: PASS`; the *only* mutation-attributable difference from the
site's pristine reading (`0/2`, no count reason) is the count. The check at
`.ufo/waves/round-48/probe/caproute48-probe.mjs:364` (`if (t.n !== b.n) why.add('exec_count_ne_base')`) fires.

Strict pristine/mutated/restored kill classification stays **inconclusive** in the control sense: at the frozen tip
no C1 routing exists, so pristine itself reads `held=0/4` (same caveat the inherited CtlCountPad control recorded).
The targeted attack is confirmed: the count check is the detector, and it fires exactly where the duplicate lives.

## Mutant and expected detector

- Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSiteSPDouble/lane` (clone of the lane repo,
  detached at frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`).
- Mutant commit `e452ab69c132f0e0d10f072e8998a823327818f6` (retained by sandbox branch `MutSiteSPDouble`).
- Patch export: `.ufo/waves/round-48/r48/MutSiteSPDouble.patch`, sha256
  `60d0ff9b59eaad00d9ca41680a15f7883bd10c507e3338fb0c6b7e0de89527d0`; one file changed, +17/−2.
- Change: `scripts/surface-probe.mjs` — `readDispatcherStatus` (SP519) now launches
  `node <src>/scripts/fleet-dispatcher.mjs status` through `capSpawnSync` (contract runner
  `scripts/cap-run.mjs`), and launches the same child a second time per call, discarding its output (a plausible
  duplicated cross-check). `bind: [src, stateRoot]`, complete child env = `UFO_STATE_DIR`,
  `UFO_PENDING_WORK_PATH`, `UFO_PROJECT_ROOT` (no `process.env`, so no canary can leak).
- Base count: each `surface-probe.mjs --selftest` process calls `readDispatcherStatus` once (state-redirect
  fixture) and the suite spawns itself once (`SP1766` nested selftest, the named allowance), so the base run
  executes the dispatcher child twice: `base_n=2` (measured, unchanged from the inheritance receipts).
- Doubling each call therefore yields 2 execs per selftest process × 2 processes = 4, i.e. `n=4` vs `base_n=2`.
- Expected detector: `SITE SP519 … capped/n=4/4 … reason=exec_count_ne_base` (and no `no_cap_run_ancestor`,
  `no_capped_scope_ancestor`, `no_bwrap_ancestor`, `canary_in_env` or `uncapped_exec`).

## Frozen-counter score (verbatim)

Source: `.ufo/waves/round-48/r48/MutSiteSPDouble-receipt.txt` (mutated phase; counter sha256
`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, unmodified lane copy).

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=46 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=0 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=42 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=49 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=33 verdict_pass=true fail_lines=0
RUN surface-probe rev0 exit=0 cases=46/46 execs=84 resumed=3 verdict_pass=true fail_lines=0
RUN surface-probe rev1 exit=0 cases=46/46 execs=84 resumed=1 verdict_pass=true fail_lines=0
RUN surface-probe rev2 exit=0 cases=46/46 execs=84 resumed=2 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=8,8,8 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=8
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=4/4,4/4,4/4 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=8,8,8 reason=exec_count_ne_base,uncapped_direct_children=8
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=8,8,8 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=8
CAPROUTE48 rev=e452ab69c132f0e0d10f072e8998a823327818f6 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=56.97 end=18:27:11Z
```

Reading: SP519 is the only site whose execs are fully capped (`4/4` in all three runs) and the only site carrying
`exec_count_ne_base`. The sibling sites fail for the inherited no-routing reasons; the mutant's own effect is
isolated to the count. `uncapped_direct_children` is a pre-existing surface-probe condition (pristine reads 9, the
mutant 8, the inherited receipts read 6/9 under other shapes); it is shared by every site in a phase and is not
attributable to this mutant — the unambiguous delta between mutated SP519 and pristine SP519 is `n` (4 vs 2) and
the `exec_count_ne_base` reason. Total surface-probe execs rose 54 → 84 for four extra routed launches (30 execs
of runner/bwrap machinery), outside the count check's scope, which counts only the site's child.

## Pristine and restored phases (same detector, same rev)

Pristine phase — `.ufo/waves/round-48/r48/MutSiteSPDouble-pristine-receipt.txt`:

```text
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=56.53 end=18:27:09Z
```

Restored phase — `.ufo/waves/round-48/r48/MutSiteSPDouble-restored-receipt.txt`:

```text
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=53.08 end=18:28:53Z
```

Pristine and restored readings are identical in every field that matters (`0/2`, `base_n=2`, no count reason).

## Commands

Sandbox setup (GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE unset):

```sh
git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSiteSPDouble/lane
git -C …/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Mutation smoke test before scoring (suite stays green under the mutant):

```sh
cd …/lane && node scripts/surface-probe.mjs --selftest   # 46/46 cases passed, VERDICT: PASS, exit 0
```

Commit (sandbox only):

```sh
git -C …/lane -c user.name=kumitate-r48-MutSiteSPDouble -c user.email=seat@local -c commit.gpgsign=false \
  commit -qam "round-48 mutant MutSiteSPDouble: SP519 routed via capSpawnSync, child launched twice per call"
# [detached HEAD e452ab6] … 1 file changed, 17 insertions(+), 2 deletions(-)
```

Detector (one invocation per phase; 1200 s outer bound, 10 s kill grace, cwd `/tmp`):

```sh
timeout -k 10 1200 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs \
  …/lane <rev> --set r48
# <rev> = e452ab69c132f0e0d10f072e8998a823327818f6 (mutated), fe3d45bf… (pristine, restored)
```

Trailer after each run, `rc=$?` saved first: `echo "exit=$rc load1=$(cut -d\  -f1 /proc/loadavg) end=$(date -u +%TZ)"`.

## Exact restoration and hashes

```sh
git -C …/lane branch -f MutSiteSPDouble e452ab69c132f0e0d10f072e8998a823327818f6
git -C …/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

| File | Pristine (fe3d45bf) | Mutated (e452ab6) | Restored |
|---|---|---|---|
| `scripts/surface-probe.mjs` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` | `075a055b196b438cf023c1c72978df41781eeaa5f280a19b6d2e5f7781c056c9` | `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb` |
| `scripts/cap-spawn.mjs` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | unchanged | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |
| `scripts/cap-run.mjs` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | unchanged | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` |

`git status --porcelain` after restoration: empty. `HEAD` = `fe3d45bf…`; the mutant is retained by branch
`MutSiteSPDouble` = `e452ab6…`. The frozen counter was never edited (`f24a3af5…` before and after).

## Scope notes

- Lane repo untouched: no writes outside the sandbox, the three `MutSiteSPDouble-*` receipts/`.patch` and this
  report under `.ufo/waves/round-48/r48/`. No git/jj mutation in any real checkout.
- No tools installed or upgraded (nothing was needed).
- This is a site attack, not a C1 candidate score: no C1 routing was integrated, and nothing here amends F48,
  the predicate, the site list or the allowances.
