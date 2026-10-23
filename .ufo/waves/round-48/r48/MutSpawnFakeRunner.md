RESULT MutSpawnFakeRunner verdict=KILLED (differential)

## Finding

The frozen counter rejects a source-level four-site route whose runner is a direct-exec wrapper instead of
`scripts/cap-run.mjs`. Every site reads `ROUTED_MISS` with the expected ancestry reasons
`no_bwrap_ancestor, no_capped_scope_ancestor, no_cap_run_ancestor`; the score is `held=0/4` exit 1. The unmutated
route-only parent, whose only difference is that `cap-spawn` resolves the canonical runner, reads `held=4/4` exit 0
with `capped/n=116/116, 2/2, 2/2, 14/14` and `uncapped_direct=0`. One behavior-bearing point, one flip.

Axis: operability; claim C1 / label `ROUTED_HELD` / rule F48, round 48 attempt 2 wave `r48`. No C1 candidate was
scored, judged, integrated or changed; the frozen counter was read, never edited (sha256 identical before and after).

## Mutant and plausible defect

- Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/MutSpawnFakeRunner/lane`, detached from
  `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- `ad16018` (parent, route-only): the four claim sites call `capSpawnSync` — `scripts/round-gate.mjs:743` `runGate`;
  `scripts/surface-probe.mjs` `readSightingSurface` (`:492`), `readDispatcherStatus` (`:521`), `spawnSelf` (`:1595`).
  `scripts/cap-spawn.mjs` is untouched, so `CAP_RUN` is the canonical `scripts/cap-run.mjs`. This is the
  positive comparator, not a control mutant and not the C1 commit.
- `e023a5b` (mutant): `scripts/cap-spawn.mjs:26` resolves `scripts/cap-run-shim.mjs`; the shim keeps cap-run's
  argument grammar (`--mem/--tasks/--budget/--env/--bind/--verdict-file/-- cmd…`), the explicit child environment
  (PATH from the resolved command, PWD, the `--env` pairs, nothing else) and the
  `CAP_RUN: EXIT|BUDGET code=<n> unit=<unit>` verdict-file protocol, but spawns the child as a plain process: no
  `systemd-run --scope`, no `bwrap`, no cgroup cap, no PID namespace, `--bind` accepted and ignored. Diffstat against
  the freeze: `cap-run-shim.mjs +63`, `cap-spawn.mjs 2 ±1`, `round-gate.mjs 6 ±`, `surface-probe.mjs 15 ±`.
  The plausible defect shape is a "portability fallback" runner made the default inside a helper that the C1 diff
  itself does not touch — a reviewer who trusts the round-47-reviewed `cap-spawn.mjs` and checks only that the four
  call sites import `capSpawnSync` sees a fully routed build.

Patch artifact: `.ufo/waves/round-48/r48/MutSpawnFakeRunner.patch`
(sha256 `858ede08bc7371ecb28ec5cd16fcd4bc7008a8ace028723a718f0c49eae0bd03`, 196 lines, two commits).

The routing hunks are the attempt-1 artifact `build/CtlFakeRunner.patch` **limited with
`git apply --include='scripts/round-gate.mjs' --include='scripts/surface-probe.mjs'`**, i.e. attempt-1's route with
its runner-name mutation and its `caprun-copy.mjs` dropped. Inherited bytes were re-applied and re-measured here, not
trusted: the route's behavioural parity is asserted only by this seat's own four counter runs.

## Expected detector vs observed

Expected: the counter must not read `ROUTED_HELD` for a site whose child has no ordered
`cap-run.mjs (node) → systemd-run --scope → bwrap` chain; the labelled reason should be
`no_capped_scope_ancestor` and/or `no_cap_run_ancestor`.

Observed at `e023a5b`, all three rev runs (verbatim, one site shown; all four identical in shape):

```text
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=58
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 ... reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 ... reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 ... reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=e023a5b91f26fb34a0981981c98cebfc87212033 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
```

Differential (same sandbox, same counter bytes, same base `f00cf278`, sequential):

| rev | tree | held | exit | sites |
|---|---|---|---|---|
| `fe3d45bf` pristine | unrouted freeze | 0/4 | 1 | all MISS |
| `ad16018` comparator | route + canonical runner | **4/4** | **0** | all HELD, `capped/n` = base n, `uncapped_direct=0` |
| `e023a5b` mutant | route + shim runner | **0/4** | **1** | all MISS, ancestry reasons |
| `fe3d45bf` restored | unrouted freeze | 0/4 | 1 | all MISS |

## Why the kill is the ancestry check, not an incidental failure

- Owning selftests pass in every run of the mutant: `round-gate` 61/61 with `VERDICT: PASS`, `surface-probe` 46/46
  with `VERDICT: PASS`; `fail_lines=0`; no `execveat`; `cases` equal the base run in all three rev runs.
- Site exec counts equal the base run exactly: `base_n` 116 / 2 / 2 / 14, mutant `capped/n` denominators 116 / 2 / 2 /
  14. The mutant therefore does not lose, duplicate or bypass any child exec.
- The extra execs corroborate the shim insertion arithmetic: round-gate rev execs `1424` vs pristine `1308`
  (+116 = one node shim per `runGate` call), surface-probe `72` vs `54` (+18 = 2 + 2 + 14). The shim is exactly one
  process per routed site call and the child stays its descendant.
- `canary_in_env` is **absent** in the mutant and present in pristine/restored. The shim passes only the explicit
  environment, so the planted canary does not reach the child; the rejection cannot be attributed to a canary leak.
- `uncapped_direct_children` (58 / 9) fires because the direct child is `node <tree>/scripts/cap-run-shim.mjs`,
  not the revision's canonical `cap-run.mjs`. That guard and the ordered-chain guard both reject; the chain guard is
  the one the assignment names, and its three labels are present on every site.

## Outcome for the round

- Assigned control reading: `0/4`, exit 1, no site `ROUTED_HELD` → **no F48 amendment is forced by this control**.
- The comparator's `4/4` is a legitimate four-site route (the mutant's own parent), which is the same object class the
  L1 ruled on in the attempt-2 addendum ("the seat's own legitimate four-site comparator … not a control, not a
  candidate"). It is recorded here only to make the mutant kill differential; it is not a C1 score and names no C1
  commit. If the L1 prefers the conservative reading, the mutant alone is still a targeted rejection
  (`ROUTED_MISS` with the expected ancestry reasons), just not a differential one.
- Coverage finding: a source-level import of `capSpawnSync` is not sufficient evidence of routing; the runner's
  identity is load-bearing and is checked both at the direct child and through the child's ancestry. A fake runner
  that faithfully reproduces the child's behaviour and verdict protocol is still caught.

## Evidence and restoration

Receipt with all four verbatim runs, commands, footer lines (`exit`, wall, `load1`, UTC end) and hashes:
`.ufo/waves/round-48/r48/MutSpawnFakeRunner-receipt.txt`.

Restoration: `git -C <sandbox> checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c`; `HEAD=fe3d45bf…`,
`git status --porcelain` empty, `scripts/cap-run-shim.mjs` absent, and the four tracked files hash identically to the
pre-mutation sample:

| file | pristine = restored | mutant |
|---|---|---|
| `scripts/cap-run.mjs` | `d8acc6de…5d5758` | `d8acc6de…5d5758` (unmodified) |
| `scripts/cap-spawn.mjs` | `3a06e8a2…38a3e` | `bf805bfa…1648d` |
| `scripts/round-gate.mjs` | `52eb183e…c9296e` | `fe131918…a337b76` |
| `scripts/surface-probe.mjs` | `0cd94432…d3e83eb` | `17673615…fca016f7` |
| `scripts/cap-run-shim.mjs` | absent | `1944645f…21230ece` |

Counter sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and after every run.

## Containment

Writes only in the sandbox clone and in `.ufo/waves/round-48/r48/` (this file, the receipt, the patch); no write in the
lane repo outside `r48/`, none in the fleet repo, no lane `.jj`/`.ufo/state`/`watchdog.log`/`scripts/` touch; no git
mutation in any real checkout (sandbox commits with `-c user.name=seat` only); no subagents, no background services;
no tools installed or upgraded; no judge, integration or shipping action.
