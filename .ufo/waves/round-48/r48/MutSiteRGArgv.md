# MutSiteRGArgv — site attack: altered child argv at RG742

- Round 48 / attempt 2, v2 wave `r48`. Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
  (read-only); freeze tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
- Seat sandbox (only write target besides `r48/` and `/tmp`):
  `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSiteRGArgv/lane`.
- Frozen counter `probe/caproute48-probe.mjs` sha256
  `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (matches the freeze plan).
- Claim under attack: C1 (operability), site **RG742** (`scripts/round-gate.mjs:742` `runGate`).
- **Verdict: mutant SURVIVED** — the counter reads `RG742 … label=ROUTED_HELD capped/n=116/116` in
  all three runs while every child exec carries an extra argv pair absent from the base run. This is
  the predicted reading (argv is not in the predicate); § "Hole or sound" rules it sound for C1 as
  frozen and names the one thing `ROUTED_HELD` does **not** attest.

## Mutant

One mutation, one sandbox commit, `scripts/round-gate.mjs` only (+11/−2):

1. import `capSpawnSync` from `./cap-spawn.mjs` (this is the C1 routing half, same shape as the
   attempt-1 routed comparator in `build/CtlEnvCaps.patch` hunk 1);
2. `runGate` now launches its child through `capSpawnSync` **and appends an extra `--lane <value>`
   pair to every child argv**, where `<value>` is what the child would have resolved anyway
   (`args`' own `--lane`, else `extraEnv.KUMITATE_LANE`, else the default `kumitate`).

```js
const runGate = (args, extraEnv = {}) => {
  // MutSiteRGArgv: route RG742 through capSpawnSync and pass the child's lane explicitly
  // (an extra `--lane <value>` pair on every child argv; the value equals what the child
  // would resolve anyway, so the child's behaviour is unchanged).
  const laneAt = args.indexOf('--lane');
  const lane = laneAt >= 0 ? args[laneAt + 1] : (extraEnv.KUMITATE_LANE ?? 'kumitate');
  return capSpawnSync(process.execPath, [SELF, ...args, '--lane', lane],
    { encoding: 'utf8', timeout: 120_000, maxBuffer: 16 * 1024 * 1024, bind: [tmp],
      env: { HOME: process.env.HOME, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', ...extraEnv } });
};
```

- Sandbox commit (exists **only** in the sandbox clone; `git cat-file -t` in the lane repo fails):
  `fdce1527585c61a33e54c8a825dd258d8cbcf3c3`, parent `fe3d45bf…`.
- Exported patch: `r48/MutSiteRGArgv.patch` (sha256 `c9940895e43613b693f7574abfc9843b1ccc9add5c4d8608211e620afa7fe053`).
- Design point: the extra pair is *semantics-preserving by construction* — it pins the lane the child
  already resolved (default `kumitate`; `other` for the `KUMITATE_LANE` env fixture; the literal
  `bad lane!` for the usage fixture), so the mutation can only be seen through argv, not through a
  changed suite outcome. The owning suite stays green (mutant `ROUND_GATE_SELFTEST: 61/61 pass`,
  `VERDICT: PASS`, exit 0) and the counter's own rev runs are `cases=61/61` with `fail_lines=0`.

## Expected detector and the exact commands

Frozen predicate (plan § C1 / probe header `:3-19`): a site is `ROUTED_HELD` when, in each of three
`--selftest` runs of the owning gate from `git archive <rev>` under `strace -f` with a planted canary,
… the site's child is exec'd exactly as many times as in the base run (at least once), and every such
exec is preceded in its own ancestry by `cap-run.mjs` (node) → `systemd-run --scope` (caps) →
`bwrap` (`--unshare-pid --clearenv --die-with-parent`), with no canary in the child's environment.

Expected reading for an intact chain with a diverging argv: **ROUTED_HELD** (argv content is not a
predicate clause; only the launch count is compared — `probe:364 exec_count_ne_base`). Full set `r48`
also contains SP491/SP519/SP1592, which this seat does not route, so the set line is `held=1/4` and
the process exits 1 by construction; the site line is the measurement.

```text
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs \
  /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSiteRGArgv/lane <rev> --set r48
```

`<rev>` = `fe3d45bf…` (pristine), `fdce1527…` (mutant), `fe3d45bf…` (restored).

## Readings (verbatim, receipts in this directory)

### Pristine — `MutSiteRGArgv-pristine-receipt.txt` (rev `fe3d45bf`, blob sha256 `52eb183e…`, load1 57.52)

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=35 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=47 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=53 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=62 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
SITE SP491 … label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 … uncapped_direct=9,9,9 reason=… (unchanged)
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1
```

(The receipt's `sha256_roundgate=` line records the *worktree* at run time — the mutant, because the
mutation was committed before this run; the counter measures `git archive <rev>` (`probe:318`), and
the annotated line at the end of the receipt states the measured blob hash `52eb183e…`. The restored
receipt, taken with the pristine worktree, shows the same reading and the same hash.)

### Mutant — `MutSiteRGArgv-mutant-receipt.txt` (rev `fdce1527`, blob sha256 `ed53d645…`, load1 51.84)

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=19 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=0 cases=61/61 execs=2120 resumed=47 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=2120 resumed=47 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=2120 resumed=67 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=0/2,0/2,0/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=0/14,0/14,0/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=9,9,9 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=9
CAPROUTE48 rev=fdce1527585c61a33e54c8a825dd258d8cbcf3c3 base=f00cf278 set=r48 held=1/4 runs=3 rule=F48
exit=1
```

No `exit=2` occurred; all eight RUN lines per invocation parsed completely in all three invocations.
The `execs=2120` vs `1308` line is `g.execs.length` (`probe:334`), i.e. every parsed exec in the log,
so it also counts the routing wrapper's own execs (`cap-run.mjs`, `systemd-run`, `env`, `bwrap` per
launch). It is not a change of the site count: `capped/n=116/116` equals `base_n=116`.

### argv evidence — `MutSiteRGArgv-argv-trace.txt`

A separate `strace -f -e trace=execve` of the mutant `--selftest` (exit 0, `ROUND_GATE_SELFTEST:
61/61 pass`) shows the divergent argv really reached the wire:

- 116 `node scripts/cap-run.mjs …` execs (the probe excludes these by `e.argv[1] !== runnerFile`,
  `probe:282`) and 116 `node …/scripts/round-gate.mjs` site-child execs;
- **116 of 116** site-child execs carry an extra `--lane <value>` pair; the values are
  `kumitate` ×112, `other` ×2 (the `KUMITATE_LANE` env fixture), `bad lane!` ×2 (the usage-64
  fixture, whose duplicated pair stays after the first, failing `--lane`), so the flag is an argv
  change for the error-path children too;
- sample: `execve("/…/bin/node", ["/…/bin/node", "…/scripts/round-gate.mjs", "--round", "5", "--repo", "/tmp/…", … , "--lane", "kumitate"], …)`.
- the only other round-gate exec in the log is the nested `--selftest` allowance
  (`round-gate.mjs:1410`, a raw spawn that never goes through `runGate`); the site match excludes it
  by the `--selftest` token (`probe:66`), exactly as the plan's RG1409 allowance assumes.

### Restored — `MutSiteRGArgv-restored-receipt.txt` (rev `fe3d45bf`, blob sha256 `52eb183e…`, load1 39.20)

```text
RUN round-gate rev0 exit=0 cases=61/61 execs=1308 resumed=22 verdict_pass=true fail_lines=0
RUN round-gate rev1 exit=0 cases=61/61 execs=1308 resumed=43 verdict_pass=true fail_lines=0
RUN round-gate rev2 exit=0 cases=61/61 execs=1308 resumed=35 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=0/116,0/116,0/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=58,58,58 reason=no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1
post_run HEAD=fe3d45bf929246915c8c0de5f7f8682b5015b22c status=[] sha256_roundgate=52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e load1=39.20
```

## Restoration evidence

| point | HEAD | worktree `scripts/round-gate.mjs` sha256 |
|---|---|---|
| before mutation (pristine) | `fe3d45bf…` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |
| mutant | `fdce1527…` | `ed53d64538f5a44b0c0b4a5f0d0430edfd258e2f457ef9ea611b9fddc18b15f6` |
| restored | `fe3d45bf…` | `52eb183e95488f7e1901a8c41159ad5a7d3f5d5b7a98f4335b62c02972c9296e` |

Restore was `git checkout -q --detach fe3d45bf…` in the sandbox clone; `git status --porcelain` is
empty, `git diff --quiet fe3d45bf… HEAD` is clean, and `scripts/cap-spawn.mjs`
(`3a06e8a2…`) / `scripts/cap-run.mjs` (`d8acc6de…`) were never touched. Post-run re-check in the
restored receipt shows HEAD, status and hash unchanged. The mutant commit remains reachable only
inside the sandbox clone; nothing was written to the lane repo outside `r48/`.

## Hole or sound

**Sound for C1 as frozen; a named blind spot for anything wider.**

What the predicate actually quantifies over (`probe:66`, `:280-310`, `:360-374`):

- site identity is argv-*pattern* based: `argv[1].endsWith('/scripts/round-gate.mjs')` and the exact
  token `--selftest` absent (`:66`); it is not an argv-equality test against the base run;
- the numeric guard is launch-count parity with the base run (`:364 exec_count_ne_base`, base n=116
  here) and a floor of one (`:363`) — not argv content;
- the wrapper chain is checked **per matched exec** (`:286-308`), and the canary is checked per exec
  (`:303`), so an extra argv pair cannot smuggle an unrouted launch: all 116 execs are judged
  individually, and `capped === n` was required (`:365`).

Therefore the mutation exercises exactly one degree of freedom the predicate deliberately leaves
open. The chain was genuinely intact (every exec's ancestry ran through `cap-run.mjs` → capped
`systemd-run --scope` → `bwrap`), the launch count matched the base exactly, and `ROUTED_HELD` was
returned. That is the correct label for the claim "this site launches its child through
`cap-run.mjs`" — the claim never says "with the base argv".

The blind spot, stated exactly: **`ROUTED_HELD` does not attest that the child's argv is unchanged
from the base run.** A same-script invocation with a different flag set is indistinguishable whenever
(a) the owning suite still exits 0 with n = m ≥ base and no `FAIL` line, and (b) the launch count is
unchanged. A flag that alters the child's *launch count* (or makes it fail its own suite) is caught
(`exec_count_ne_base` / `selftest_cases_below_base`); a flag that alters only the child's semantics
while the suite stays green is not. The frozen counter has no base-argv comparison and no clause
permitting one, so this is a property of the contract, not a counter defect. It becomes a real hole
only if a later round reads `ROUTED_HELD` as evidence that the routed child is base-identical; the
contract should then add an argv-parity clause (and re-freeze), which C1 does not claim.

Coverage finding for the wave: attempt 1's 17 control mutants target chain and count (`no_capped_scope_ancestor`,
`no_child_exec`, `exec_count_ne_base`, …); no attempt-1 control exercises the argv axis. This seat's
mutant survives for the expected reason and should be recorded as an axis the frozen predicate does
not cover, not as a C1 miss.

## Notes

- Load recorded per receipt (`load1` 57.52 / 51.84 / 39.20 at run end); no exit-2 run occurred.
- No tools installed or upgraded. No git write outside the sandbox clone; lane writes are limited to
  this directory and all filenames carry the seat prefix: `MutSiteRGArgv.md`,
  `MutSiteRGArgv.patch`, `MutSiteRGArgv-argv-trace.txt`, `MutSiteRGArgv-{pristine,mutant,restored}-receipt.txt`.
- Reproduce: the command in § "Expected detector", `<rev>` = `fdce1527…` for the mutant;
  the patch applies to `fe3d45bf…` with `git am`/`git apply`.
