RESULT CtlFakeRunner rev=cac43009 verdict=MISS held=0/5 targeted=K488,SC549,SC859,CC879,AT802

# CtlFakeRunner — C1 pre-data control: a fake runner with the runner's file name

Clone `/fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFakeRunner/lane` at `cac43009b22232c1ae8efdab4f2789516c1fcc6f`;
scored commit `73de114e9b0c67829570141ffa1b5d75bd8fae25`. `scripts/cap-run.mjs` REPLACED by a same-name shim that
parses `--mem --tasks --budget --env --bind --verdict-file -- <cmd> [args...]`, runs the child directly with
`spawnSync(cmd, args, { stdio: 'inherit', env: Object.fromEntries(envPairs) })`, writes
`CAP_RUN: EXIT code=<n> unit=fake` to the verdict file and exits with the child's code — no systemd-run, no bwrap.
All five sites route through `capSpawnSync` (`scripts/cap-spawn.mjs`) with explicit envs and the selftest's own
`mkdtemp` root as `--bind`: K488 `runGate` `{PATH:'/usr/bin',HOME}`; SC549 `runTool` and SC859 parity `sh -c`
`{PATH:'/usr/bin'}`; CC879 `runClaims` `gitEnv(env)`; AT802 selftest `tool()` `gitEnv()`. The canary never enters a
child env by construction; no `process.env` passthrough remains at these sites.

Files changed in the clone (only lane files written: this report and the patch):

    scripts/cap-run.mjs        485 +++------------------------------------------
    scripts/anchor-truth.mjs     9 +-
    scripts/claims-check.mjs    10 +-
    scripts/kimi-census.mjs     11 +-
    scripts/sources-check.mjs   15 +-
    5 files changed, 77 insertions(+), 453 deletions(-)

## Commands and observed outputs

```
$ unset $(git rev-parse --local-env-vars) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
$ git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin .../w1-CtlFakeRunner/lane
$ git -C .../lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
$ git -C .../lane log --oneline -1
cac4300 round-47: freeze — plan (C1 ROUTED_HELD, five sites), frozen counter caproute-probe.mjs, ...
```

Shim round-trip through the unmodified helper (development check):
```
$ node -e "import('./scripts/cap-spawn.mjs').then(m=>{const r=m.capSpawnSync(process.execPath,['-e','process.stdout.write(\"child-ok\")'],{env:{PATH:'/usr/bin'},bind:['/tmp']});console.log(JSON.stringify({status:r.status,signal:r.signal,stdout:r.stdout,capVerdict:r.capVerdict}))})"
{"status":0,"signal":null,"stdout":"child-ok","capVerdict":"CAP_RUN: EXIT code=0 unit=fake"}
```

Gate selftests (each through `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`):
```
kimi-census   exit=0  KIMI_CENSUS_SELFTEST: 54/54 pass    VERDICT: PASS
sources-check exit=0  SOURCES_SELFTEST: 46/46 pass        VERDICT: PASS
claims-check  exit=0  CLAIMS_SELFTEST: 47/47 pass         VERDICT: PASS
anchor-truth  exit=0  ANCHOR_TRUTH_SELFTEST: 44/44 pass    VERDICT: PASS
```
These equal the base case totals in `probe/receipts/c1-base.txt` (54/46/46/47/44), so the counter's case floor
cannot be the reason for a miss.

```
$ git -C .../lane add -A && git -C .../lane -c user.name=ctl -c user.email=ctl@ctl commit -qam \
  "control: fake cap-run shim (same name/contract, no systemd-run/bwrap) + five C1 sites routed through capSpawnSync"
73de114 control: fake cap-run shim (same name/contract, no systemd-run/bwrap) + five C1 sites routed through capSpawnSync
$ git -C .../lane format-patch --stdout cac43009..HEAD > .ufo/waves/round-47/build/CtlFakeRunner.patch
36400 bytes  sha256=ce25579d850741a00b2c780d6e03108bc4d014854957eec123f636fc9f6216fd
```

Frozen counter (exactly the item's command):
```
$ systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=768 timeout -s KILL 1500 \
    node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs \
    /fast/scratch/hyaku/kumitate-r47/seats/w1-CtlFakeRunner/lane HEAD; echo exit=$?
SITE K488 gate=kimi-census label=ROUTED_MISS n=53 base_n=53 capped=0 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0 reason=no_capped_scope_ancestor,no_bwrap_ancestor
SITE SC549 gate=sources-check label=ROUTED_MISS n=42 base_n=42 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_capped_scope_ancestor,no_bwrap_ancestor
SITE SC859 gate=sources-check label=ROUTED_MISS n=1 base_n=1 capped=0 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_capped_scope_ancestor,no_bwrap_ancestor
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=0 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_capped_scope_ancestor,no_bwrap_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=106 base_n=106 capped=0 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_capped_scope_ancestor,no_bwrap_ancestor
CAPROUTE_PROBE rev=73de114e9b0c67829570141ffa1b5d75bd8fae25 base=0bd8be60 held=0/5
exit=1
```

## Verdict

MISS, as specified. `held=0/5`; every targeted site reads `ROUTED_MISS` with exactly the two expected reasons
`no_capped_scope_ancestor,no_bwrap_ancestor` — no other reason fires (`uncapped_direct=0`, `n == base_n`,
`cases == base_cases`, `gate_exit=0`). The counter separates "child descends from a cap-run-named process" from
"child descends from a real capped systemd-run+bwrap pair" at all five sites; the child-count and case floors are
not doing the work.

## Risks / limits

- The shim dodges by file name and semantics only: it ignores `--mem`, `--tasks`, `--budget` (no budget kill) and
  `--bind`; receipts are marked `unit=fake`. Never usable outside this control clone; the lane's real runner is untouched.
- The five-site `capSpawnSync` routing in the clone is control scaffolding, not a C1 candidate; the patch is evidence only.
- First shim draft stored `--verdict-file` under key `verdict-file`, so every child read `status=null`/ECAPRUN
  (7/54, 2/46, 4/47, 6/44 pass). Fixed before the commit; scored rev `73de114` never contained it.
- `cap-run.mjs --selftest` in the control exits 64 by design (the shim is not the runner); no gate --selftest calls it.
- No processes left under `w1-CtlFakeRunner`; clone clean (`git status --porcelain` empty). The counter removed its own
  archive under `probe-runs` (6 other entries there untouched). No tool installs; pacman untouched.
