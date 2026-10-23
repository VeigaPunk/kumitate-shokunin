RESULT ExecChecklistBase verdict=READY rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c runs=2 both=18/22 fail_both=4 flap=0

# H1 harm baseline — `node scripts/surface-probe.mjs --checklists` at the round-48 freeze tip

Measurement seat. No lane code changed. Two sequential baseline runs, per-item wall/load1, the
fail-in-both/flap split, the two selftest items' wall times and the C1 projection, plus four measured
H1 harm risks found while probing how a C1 routing of RG742/SP491/SP519/SP1592 behaves.

## Scope, clone, commit

```
$ unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
$ mkdir -p /fast/scratch/hyaku/kumitate-r48/seats/w1-ExecChecklistBase
$ git clone -q --no-hardlinks <lane> /fast/scratch/hyaku/kumitate-r48/seats/w1-ExecChecklistBase/lane
$ git -C lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c
$ git -C lane rev-parse HEAD
fe3d45bf929246915c8c0de5f7f8682b5015b22c
```

Both measured runs executed on that pristine tree (`git status --porcelain` empty before run 1).
Afterwards the seat's own artifacts were committed **in the clone only** (the artifact commit cannot
cite its own sha; it is HEAD of the seat clone, one commit on top of `fe3d45bf`):

```
$ git -C lane log --oneline -1 --format='%h %s'
<seat-clone HEAD> r48 ExecChecklistBase: H1 harm baseline at fe3d45b (two checklist runs) + routing-risk probes and report
```

Clone-relative path: `.ufo/waves/round-48/build/ExecChecklistBase/` (receipts, probe sources and this
report; probe sources are kept as `.mjs.txt` so the tree's runnable-file count stays at the measured
26 — see § Attribution 687).

Note vs plan § Harm rules H1: the plan names `f00cf278` as the base rev; this item's dispatch names
`fe3d45bf` (the freeze commit, i.e. the tip a C1 candidate branches from). I ran `fe3d45bf` as
dispatched and recorded the one material difference at `f00cf278` in § Attribution 687.

## Environment (recorded, not assumed)

- No `UFO_SRC`, `KUMITATE_*`, `KIMI_ROOT` set in the shell (`env | grep -iE 'UFO|KUMITATE|KIMI'` empty).
- Pin-aware items (3, 8, 10, 14) resolve `--src` through the clone's tracked `.ufo/pins/origin.json`
  → `/fast/scratch/hyaku/kumitate-pin/src`, HEAD `31c465f15669f744848bd9f5d56191c5085670f7`
  (matches the pin); the probe printed `src-rev=31c465f15669`.
- Item 1 (cite-check) is not pin-aware, so it resolved its documented default candidate
  `~/Projects/ufo-fsd-alpha` (live tree, HEAD `093edb979559443bca65245fbdd94ac3621446fb`). Its
  verdict was `CITE_CHECK: DRIFT (files=111 tokens=10302 errors=1013 warnings=709)`, exit 1 — the
  grammar accepts `exit 0|1`, so the item passes either way.
- `~/.kimi-code` present; `systemd-run` and `bwrap` present; `/fast` had 57–70 GB free.

## Both runs, per item

```
run 1: exit=1 start=11:54:24Z end=11:57:20Z  CHECKLIST: 18/22 pass  VERDICT: FAIL  load1(end)=54.85
run 2: exit=1 start=11:57:49Z end=12:00:59Z  CHECKLIST: 18/22 pass  VERDICT: FAIL  load1(end)=26.89
```

| SKILL.md line | item | run1 | wall1 | load1₁ | run2 | wall2 | load1₂ |
|---|---|---|---|---|---|---|---|
| 680 | Citation gate verdict | PASS | 2.850 | 44.49 | PASS | 4.583 | 57.21 |
| 681 | Citation gate hermetic suite | PASS | 2.016 | 44.49 | PASS | 3.582 | 58.39 |
| 682 | Live sighting-surface conformance | PASS | 0.199 | 45.09 | PASS | 0.410 | 58.39 |
| 683 | **Surface-probe hermetic suite** | PASS | **1.279** | 45.09 | PASS | **2.021** | 58.39 |
| 684 | **Round-gate hermetic suite** | PASS | **6.221** | 45.09 | PASS | **11.661** | 58.68 |
| 685 | Round-close artifact audit | FAIL | 0.032 | 44.44 | FAIL | 0.088 | 59.04 |
| 686 | Filed-report tracking | FAIL | 0.025 | 44.44 | FAIL | 0.055 | 59.04 |
| 687 | Proxy recompute (`--strict`) | FAIL | 0.153 | 44.44 | FAIL | 0.238 | 59.04 |
| 688 | Proxy-check hermetic suite | PASS | 8.756 | 44.44 | PASS | 14.310 | 59.04 |
| 689 | Member-claims gate | PASS | 0.272 | 41.68 | PASS | 0.135 | 57.81 |
| 690 | Kimi-substrate census | PASS | 0.025 | 41.68 | PASS | 0.031 | 57.81 |
| 691 | Sources-registry gate | PASS | 0.036 | 41.68 | PASS | 0.058 | 57.81 |
| 692 | Sources-check hermetic suite | PASS | 3.810 | 41.68 | PASS | 4.710 | 57.81 |
| 693 | Per-anchor truth burn-down | PASS | 1.309 | 41.46 | PASS | 1.295 | 56.79 |
| 694 | Anchor-truth hermetic suite | PASS | 13.693 | 41.46 | PASS | 14.089 | 56.79 |
| 695 | Wave census (round 40) | PASS | 0.069 | 40.89 | PASS | 0.038 | 53.79 |
| 696 | Wave-census hermetic suite | PASS | 4.343 | 40.89 | PASS | 3.127 | 53.79 |
| 697 | Gate-mutants battery | FAIL | 120.168 | 41.22 | FAIL | 120.040 | 51.64 |
| 698 | Gate-mutants hermetic suite | PASS | 1.425 | 55.76 | PASS | 0.853 | 27.41 |
| 699 | OMP agent-root census | PASS | 0.040 | 55.76 | PASS | 0.025 | 27.41 |
| 700 | OMP-census hermetic suite | PASS | 0.080 | 55.76 | PASS | 0.035 | 27.41 |
| 701 | Cap-run hermetic suite | PASS | 9.136 | 55.76 | PASS | 7.778 | 27.41 |

Receipts (verbatim output incl. FAIL tails): `.ufo/waves/round-48/build/checklist-base-{1,2}.txt`.

**Fails in both runs (4):** 685, 686, 687, 697.
**Flaps (verdict changes between the two runs): none** — all 22 items held their verdict; both runs
are 18/22, `VERDICT: FAIL`, exit 1.

## The two selftest items H1 turns on, and the C1 projection

Base wall times (this host, my runs' load1 45–59):

- `SKILL.md:684` Round-gate hermetic suite (`node scripts/round-gate.mjs --selftest`): **6.221 s** (run 1, load1 45.09) / **11.661 s** (run 2, load1 58.68).
- `SKILL.md:683` Surface-probe hermetic suite (`node scripts/surface-probe.mjs --selftest`): **1.279 s** (run 1) / **2.021 s** (run 2).

Independent exec counts, from `strace -f -e trace=execve` of each selftest at `fe3d45b` (these
reproduce the plan's frozen numbers exactly; top-level and the two named nested `--selftest`
spawns subtracted):

| site | child | measured execs / selftest | plan figure |
|---|---|---|---|
| RG742 `runGate` | `node round-gate.mjs <args>` | 116 | 116 |
| SP491 surface shim | `bash <src>/scripts/ufo-sighting surface --json` | 2 | 2 |
| SP519 dispatcher status | `node <src>/scripts/fleet-dispatcher.mjs status` | 2 | 2 |
| SP1592 `spawnSelf` | `node surface-probe.mjs <args>` | 14 | 14 |

So C1 adds 116 runner launches to item 684 and 18 (2+2+14) to item 683.

Cost per launch, measured here (not taken from the L1's figure):

```
$ node measure-routing.mjs 10        # capSpawnSync(node -e 0) vs plain spawnSync(node -e 0)
N=10 load1=19.81
plain_node_mean=0.019  routed_node_mean=0.076  marginal_routing_cost_per_launch=0.057
$ node measure-caprun.mjs 12         # full cap-run launch of /bin/true
N=12 mean=0.055 min=0.049 max=0.062 load1=18.84
```

End-to-end routed-vs-unrouted selftest deltas (probe copies, see § Risks):

```
unrouted-rg: rc=0 walls=[3.139, 3.158]   routed-rg: rc=0 walls=[5.375, 5.384]   delta=+2.236 s / 44 routed runGate launches = 0.051 s/launch
unrouted-sp: rc=0 walls=[0.642, 0.648]   routed-sp: rc=0 walls=[1.447, 1.433]   delta=+0.791 s / 18 routed spawnSelf launches = 0.044 s/launch
(load1 15.6)
```

**Projection for the C1 commit**

| item | base wall (run1/run2) | +L1 figure 0.12 s/launch | +my figure ≈0.05 s/launch |
|---|---|---|---|
| 684 round-gate selftest | 6.221 / 11.661 s | +13.9 s → ≈20.1 / 25.6 s | +5.8 s → ≈12.0 / 17.5 s |
| 683 surface-probe selftest | 1.279 / 2.021 s | +2.2 s → ≈3.5 / 4.2 s | +0.8 s → ≈2.1 / 2.8 s |

Both projected outcomes are far below the harness's per-item budget (`CHECKLIST_TIMEOUT_MS` = 120 s),
so **C1's wall-time harm risk for items 683/684 is low**. Item 697 is the only item already at that
ceiling (see § Attribution 697) and C1 does not route it (its targets are cite-check and wave-census).

## Risks for the C1 build — measured, not inferred

I emulated the four routings in scratch copies (`round-gate-routed.mjs`, `surface-probe-routed.mjs`,
`surface-probe-routed-nopath.mjs`; sources committed in the clone as `.txt`). Each emulation routes
the real child call through `capSpawnSync` and runs the owning gate's `--selftest`. **All three
items these sites live in (682, 683, 684) pass in both base runs, so any of the failures below is
H1 harm by the plan's rule.**

**R-A (SP491): cap-run's `--clearenv` + default PATH breaks the sighting shim.** `cap-run` sets
`PATH = dirname(resolved cmd):/usr/bin`; for the shim the command is `bash` → `/usr/bin`, and node is
not in `/usr/bin` on this host (node lives under `fnm`). The shim does `exec node "$ROOT/scripts/ufo-sighting.mjs"`:

```
1_sighting_routed: status=127  stderr_tail=".../scripts/ufo-sighting: line 95: exec: node: not found"
2_sighting_unrouted: status=0  stdout_len=13141
```

With the routed reader in place this turns item 682 from PASS into FAIL:

```
SURFACE_PROBE: FAIL-CLOSED (sighting surface unreachable (surface --json exited 127: ... exec: node: not found) src-rev=31c465f15669)
exit=2
```

Fix verified: pass `PATH` (and `HOME`) in the `capSpawnSync` env. Then the routed reader is
byte-equivalent to the unrouted one:

```
2_sighting_with_PATH_env: status=0 stdout_len=13141
routed  : SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)
unrouted: SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)
```

**R-B (RG742): cap-run's sandbox has a fresh tmpfs `/tmp`; only cwd and `--bind` dirs are visible.**
round-gate's selftest fixtures are `mkdtemp` trees under `/tmp`, passed as absolute `--repo/--reports-dir/
--main-repo/--origin` args. Routed without binds:

```
46/61 pass   FAIL ×15, e.g. "--repo /tmp/kumitate-round-gate-selftest-…/repo is not a git work tree"
             (a routed child that writes to a host /tmp path silently writes into the sandbox tmpfs:
              host view after the child — sibling dir absent, childmade exists on host: false)
```

Routed with `bind` for every `/tmp` path named by args **and** by env (`KUMITATE_REPORTS_DIR`,
`KUMITATE_MAIN_REPO`, `HOME`) plus `HOME`/`PATH` in env:

```
ROUND_GATE_SELFTEST: 61/61 pass
VERDICT: PASS
```

So item 684 survives C1 only if the routing binds the fixture roots and passes `HOME`.

**R-C (SP1592): same tmpfs/HOME issue inside surface-probe's own selftest.** Routed without binds,
the fixture `HOME` trees under `/tmp` vanish → 3 `bare run (no --src)` cases fail plus the nested
hermeticity case:

```
42/46 cases passed  (FAIL: bare run resolves to ~/Projects/ufo-fsd-alpha / legacy candidate /
                     both-candidates order; hermeticity: --selftest passes with a bogus --src)
```

With binds (args + env) and `HOME`/`PATH`: `46/46 cases passed`, `VERDICT: PASS`.

**R-D (SP519): the dispatcher's throwaway state root must be bound.** Routed without a bind, the
dispatcher created its state inside the sandbox tmpfs, not on the host:

```
3_dispatcher_routed: status=0  "path": "../../../../../tmp/kumitate-surface-state-…/ufo/pending-work.json"
  host_state_dir_created=false
```

With `bind: [stateRoot]` the conformance run's dispatcher checks (`STATUS_REACH`, `STATUS_SHAPE`,
`STATUS_QUEUE_SCHEMA`) match the unrouted run exactly.

Positive control: `cap-run`'s read-only root still exposes the pin clone, so the pin-aware reads work
under routing; and `--bind cwd cwd` makes a host-`/tmp` cwd visible read-write (verified: marker read,
write-back seen on host).

## Attribution of the four base failures (none is C1's, but only one is a real tree finding)

- **685 / 686** — `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir
  /fast/scratch/hyaku/kumitate-r48/seats/w1-ExecChecklistBase/.ufo/reports is absent`. `round-gate`
  derives `DEFAULT_MAIN_REPO = resolve(HERE,'..','..')` (`scripts/round-gate.mjs:142`), which from a
  seat clone lands on the seat dir, not the lane. Pure clone-layout artifact — it reproduces at
  `f00cf278` and in every seat clone (same conclusion as round-47 seat ExecChecklistTail,
  `.ufo/waves/round-47/build/ExecChecklistTail.md` § Attribution). Both items are
  measurable only when pointed at a real main repo:
  ```
  $ KUMITATE_REPORTS_DIR=<clone>/.ufo/reports node scripts/round-gate.mjs
  ROUND_GATE: CLEAN (round=33 lane=kumitate checks=10 errors=0 warnings=0)
  $ KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin node scripts/round-gate.mjs
  ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 47
  ROUND_GATE: CLEAN (round=47 lane=kumitate checks=10 errors=0 warnings=1)
  ```
- **687** — `PROXY: DRIFT (A_DRIFT term=A declared=25 computed=26 delta=+1; C2_TOTAL_DRIFT
  term=C2_total declared=106 computed=107 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9;
  src-rev=31c465f15669)`, exit 1. `A_DRIFT` is **introduced by the round-48 freeze commit itself**:
  at a clone of `f00cf278` the same command prints only
  `C2_TOTAL_DRIFT … C2_total declared=106 computed=107` and `AXES_DRIFT … coverage row=10 derived=9`
  (A matches at 25). The +1 runnable file is `.ufo/waves/round-48/probe/caproute48-probe.mjs`
  (25 → 26 tracked `.mjs|.js|.sh|.py`). `C2_total` and `AXES_DRIFT` are pre-existing at `f00cf278`.
  Caveat for H1 comparability: `A` is tree-derived **including untracked files** — the live lane
  worktree currently reads `computed=27` (delta +2) because of untracked `.mjs` under
  `.ufo/waves/round-48/build/ExecRootCause/`. Base and C1 must both be measured from clones.
  C1 additionally changes `scripts/round-gate.mjs` and `scripts/surface-probe.mjs`, so `pin.round-gate`
  and `pin.surface-probe` (SCORECARD `kumitate-gate-pins-v1`/`kumitate-proxy-v1`) will drift unless
  the C1 commit re-pins — item 687 already fails at base, so this is not new harm under H1, but the
  finding set grows from 3 to at least 5.
- **697** — `exit=null`, wall **120.168 s / 120.040 s**: the checklist harness killed the battery at
  its own 120 s per-item budget (`CHECKLIST_TIMEOUT_MS = 120_000`), i.e. no battery verdict was ever
  produced at base. Round-47 seat ExecChecklistTail's receipt
  (`.ufo/waves/round-47/build/ExecChecklistTail.md`) had the same item complete in 92.1 s at
  load1 20.72 (its own exit 2). Load-sensitive, pre-existing, and not routed by C1 (battery targets:
  cite-check, wave-census).

## Risks / blockers

1. **The C1 routing must pass `HOME` and a node-bearing `PATH`, and bind every host `/tmp` fixture
   path (args *and* env) plus the dispatcher's state root.** Without them, items 682/683/684 flip
   PASS→FAIL — H1 harm by the plan's own rule. Recipe verified green in all three emulations
   (682 CLEAN identical to base; 683 46/46; 684 61/61).
2. Items 685/686 cannot be scored from any seat clone; a C1-vs-base comparison of those two is
   structurally uninformative unless both sides set `KUMITATE_REPORTS_DIR`/`KUMITATE_MAIN_REPO`
   identically. Recommend excluding them from H1's harm set by name.
3. Item 697 sits exactly at the 120 s harness ceiling at load1 ≥ 41; it will read FAIL at C1 for the
   same reason. Its failure class is "harness timeout", not the battery's verdict.
4. Comparison hygiene: measured at `fe3d45bf` per dispatch; the plan's § H1 wording names `f00cf278`.
   The only checklist-visible difference I measured between them is item 687's `A_DRIFT` (+1 from the
   freeze commit's own probe file). Scripts and SKILL.md are identical
   (`git diff --stat f00cf278 fe3d45bf -- SKILL.md scripts/` is empty).

## Bounds / cleanup

Every run wrapped in `timeout -k 10`. No subagents dispatched (single-labrat allowance unused). No
lane repo, fleet repo or `MANIFEST.json` write; no git write outside the sandbox clone. Seat scratch
270 MB; `/fast` 57 GB free. No process of this seat left running (the one `cap-run-*.scope` still
listed belongs to sibling seat ExecRootCause). No tool installed or updated.

Files written in the lane (the receipts this item names, plus this report):
`.ufo/waves/round-48/build/checklist-base-1.txt`, `.ufo/waves/round-48/build/checklist-base-2.txt`,
`.ufo/waves/round-48/build/ExecChecklistBase.md` (this file).
