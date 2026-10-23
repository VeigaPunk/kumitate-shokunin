# kumitate round 46 — plan (attempt 1; frozen before data)

Dispatched 2026-10-23 07:59Z by the hyaku orchestrator (freeze 09:59Z, hard stop 10:59Z). Lane base
`2b2bf7bbdedaff3f0c749a8703002bebb104d15c` (round-45 verifier spot-check). Repair-first round after four rejections
(r42–r45); r45 was rejected on K3′ (S073's `teaches` overstated its locators). This round makes **no prose claim**:
both claims are judged by a committed counter over committed code, and every counter, predicate and do-nothing
receipt below is committed before any data seat scores.

## Axes and claims

Lane axes: operability (9, lowest non-retired; every coverage successor is 10) and the capabilities table
(`AXES.md` § Capabilities). Two claims, on two surfaces, each verifiable at its own commit without the other.

### C1 — operability: the three selftest Git writers no longer follow the caller's repository variables

- **Surface changed.** The `--selftest` paths of `scripts/cite-check.mjs`, `scripts/proxy-check.mjs` and
  `scripts/round-gate.mjs` (routed R45 plan item 1; AuditLaneGitWriters, `round-45/a3-falsify/AuditLaneGitWriters.md`:
  `cite-check.mjs:1674`, `proxy-check.mjs:2695`, `round-gate.mjs:717,719` write with inherited `GIT_DIR` /
  `GIT_WORK_TREE` / `GIT_INDEX_FILE`). Sources: S065 (git(1): the variables select the repository) and the row opened
  this round for Node's `child_process` `env` default (`process.env`).
- **Frozen predicate, label `CANARY_HELD`.** Tool t is CANARY_HELD at revision R when `node scripts/t.mjs --selftest`,
  run from a fresh clone of R with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE naming a fresh canary repository,
  (a) exits 0 and prints `VERDICT: PASS`, (b) leaves the canary's full file manifest identical to its pre-run
  manifest, (c) prints a PASS case-name set equal to the set the same selftest prints at R under a scrubbed
  environment, (d) that set contains every PASS case name printed at base 2b2bf7bb under a scrubbed environment, and
  (e) the hostile run launched `git` through PATH at least once, as many times as the scrubbed run at R, and never
  with any of the three variables set.
- **Counter.** `.ufo/waves/round-46/probe/gitenv-canary.sh <lane> <rev>` → `GITENV_CANARY rev=<full> held=<k>/3`.
- **Before → after.** Before: `held=0/3` at `2b2bf7bb` (do-nothing receipt `probe/receipts/c1-base.txt`).
  After (target, one value): `held=3/3` at the C1 commit.
- **Kill rule.** Anything other than `held=3/3` at the C1 commit is a miss, reported as such; the counter, the
  predicate and the target are not amended after this file is committed.

### C2 — capability acquisition `cap-run`: a child-process runner with a native-memory cgroup cap, explicit environment, total budget, descendant and signal cleanup, and its own PID namespace

- **Surface changed.** New `scripts/cap-run.mjs` (no lane runner implements QUALITY Q31 at base: Q31 "Measured in
  round 45" and AuditLaneSandboxes, `round-45/a3-falsify/AuditLaneSandboxes.md`: 24 child sites, no `MemoryMax`).
  Sources: S072 (systemd.resource-control / systemd-run), S069 (bwrap), S077 (Buffer memory outside the V8 heap) and the
  row opened this round for the kernel's cgroup-v2 memory controller.
- **Frozen runner interface.** `node scripts/cap-run.mjs --mem <MiB> --tasks <n> --budget <s> [--env K=V]... -- <cmd>
  [args...]`; child stdout passes through; the runner's working directory is writable to the child.
- **Frozen predicate, label `CAP_HELD`** (cases K1–K6, the same sentences as the counter's header):
  K1 under `--mem M` (M drawn per run from 112..176) a child allocating sixty-four 16 MiB Buffers records at most
  ceil(M/16) allocations, never reaches DONE, and the runner exits non-zero, while a 2-allocation child reaches DONE
  with exit 0; K2 a detached new-session grandchild is gone 1 s after the runner returns 0 (within 30 s); K3 under
  `--budget B` (B drawn from 2..4) a 300 s child: the runner returns within B+7 s, non-zero, with a stderr line
  starting `CAP_RUN: BUDGET`, and the child is gone 1 s later; K4 with GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE and a
  random secret key in the runner's environment and `--env <P>=<V>` (random), the runner exits 0 and the child's
  environment has P=V and none of the four keys; K5 SIGTERM to the runner 1.5 s into a 300 s child: the runner exits
  within 10 s and the child is gone 1 s later; K6 with a random marker key in the runner's environment the runner
  exits 0 and the child reads `/proc/1/environ` successfully and finds neither the marker nor GIT_DIR in it.
  Fixture names, keys, values, M and B are random per run so a runner cannot key on fixed probe labels.
- **Before → after.** Before: `held=0/6` at `2b2bf7bb` (no runner; receipt `probe/receipts/c2-base.txt`). After
  (target, one value): `held=6/6` at the C2 commit, and the `## Capabilities` row `cap-run` lands in the same commit.
- **Kill rule.** As C1.
- **Not claimed.** Routing the 24 child sites through the runner (pre-registered for round 47 with the runner in
  place; reason: four of the files are pinned by `kumitate-gate-pins-v1` and two are mutated by the frozen
  `gate-mutants` manifest, so 24 re-routed suites cannot be landed and re-verified with their pins in one round).

## Harm checks (operability must not drop; run at open and at close, same commands)

`node scripts/proxy-check.mjs --strict`; `node scripts/surface-probe.mjs --checklists` (pass count must not fall:
18/21 at open in a scratch clone, `open/checklists.txt`); the three touched selftests' PASS counts (75, 121, 60 at
open); `gate-mutants` battery item; sources census exit 0.

## Controls (adversarial wave before data; receipts committed before the C1/C2 after-measurements)

Do-nothing at base scored by the L1 before this commit (receipts in `probe/receipts/`). Fresh mutation-tester seats
build and score with the frozen counters: C1 junk commit, no-reader (scripts removed), shortcut dropping the Git
cases, shortcut replaying a stored transcript when GIT_DIR is set, shortcut keyed on the canary path; C2 passthrough,
timeout-only, V8 flag, prlimit address-space, process-group kill, fake verdict line, cgroup without namespace,
namespace without cgroup, no-reader. A control that meets a target means the claim is re-designed before data or
declared exploratory.

## Repairs routed from `corpus/lessons/round-45-verifier-spotcheck.md` (not claims)

D1 `plan.md:93` dead pointer (append-only erratum in round-45 plan + lesson; leftover count 46, not 45); D2 QUALITY
criterion: a row's `teaches` checked against every locator before the entry commit, and frozen checklists state per
item whether an erratum cures a failure; D3 S076 reason re-worded "redirect wrapper, no manual text"; D4 QUALITY
criterion: guards copied byte-exact from the tested receipt, with a command shown able to fail; S073 teaches cell
re-checked against both locators; `C2_TOTAL_DRIFT` from the spot-check file (README row, Q32).
Anti-loop: every SOURCES row's quote and `teaches` cell is re-opened by a non-author seat before the freeze.

## Shape

Default, two v1 waves: wave 1 `build` (controls, executors, scribes, the SOURCES re-open sweep, scouts, connector,
reviewer, critic); wave 2 `falsify` only with ≥32 distinct attack items, else one residual call of ≤8 reviewer/critic
seats. Settle deadline 45 min after each dispatch. The L1 holds the §3 planner seat; the planning data-walk rides a
scout item.

## Amendment before any seat (L1, 08:13Z)

A1. The C2 counter as committed at `7cd1fa37` used fixed fixture labels (`k1.prog`, `CAPRUN_SECRET`, `--mem 128`,
`--budget 3`), which a runner could key on (§9 shortcut). Before any seat ran, the probe draws M, B, file names, key
names and values at random per run and prints them on a `PARAMS` line; the C2 predicate above is re-worded to match.
The do-nothing control was re-scored (`receipts/c2-base.txt`, second block: `held=0/6`) and calibration re-run three
times (`receipts/calibration.txt`: `held=6/6` each). The C2 counter of record is the one in the commit carrying this
note; C1 is unchanged.

## Amendment A2 before data (L1, ~08:45Z) — supersedes the C1/C2 sections above where they differ

No candidate fix has been scored by any counter (the build executors did not run the frozen counters; the L1 has
not measured). Three pre-data findings forced a re-design, which §9 permits before data:

- **Control CtlC1PathKeyed met the C1 counter** (`build/CtlC1PathKeyed.md`: a scrub keyed on the counter's default
  scratch root scored `held=3/3`; moving `SCRATCH_ROOT` exposed it, 0/3).
- **Control CtlC1Replay met the C1 counter** (`build/CtlC1Replay.md`: replaying stored PASS lines plus dummy `git`
  launches scored `held=3/3`).
- **CritClaimShape** (`build/CritClaimShape.md`): (1) C1 and C2 both change operability, so they are ONE axis-move,
  not two claims (AXES.md; the round-41 precedent at SCORECARD.md:1886-1888); (2) the plan's "never with any of the
  three variables set" was stronger than the code's canary-path grep; (3) an unconditional replay shortcut; (4) K1/K6
  did not identify the cgroup and the PID namespace.

**Re-designed claim (one claim, operability, the lowest non-retired axis).**
**C1 — the lane's selftest Git writers and its child processes get enforced bounds.** Surface: the `--selftest`
paths of `scripts/cite-check.mjs`, `scripts/proxy-check.mjs`, `scripts/round-gate.mjs`, and the new
`scripts/cap-run.mjs`. Two obligations, BOTH required; either miss is a miss of C1:
- **O1 `CANARY_HELD` 3/3** under counter `probe/gitenv-canary.sh` as committed with this note. Each tool, run from a
  fresh clone of R, must hold (a)–(e) in two hostile runs — A with the three variables naming a fresh canary repo at
  a random path under `${TMPDIR:-/tmp}`, B with them naming the clone of R itself (the caller's-lane hazard): (a)
  exit 0 + `VERDICT: PASS`; (b) the named repository's full file manifest unchanged; (c) PASS case-name set equal to
  the same selftest's scrubbed-environment set at R; (d) that set contains every base-2b2bf7bb PASS name; (e) `git`
  launched through PATH at least once and at least as often as the scrubbed run, and **no launch with any of
  GIT_DIR, GIT_WORK_TREE or GIT_INDEX_FILE set**; and (f) under a scrubbed environment with a PATH `git` that fails
  every launch, the selftest does not report a clean pass (exits non-zero or prints a `FAIL` line).
- **O2 `CAP_HELD` 6/6** under counter `probe/caprun-probe.mjs` as committed with this note: K1–K6 as worded above
  (A1, randomized) plus two mechanism-identity clauses: K1's 2-allocation child reads its own cgroup's `memory.max`
  as exactly M MiB; K6's child has a `/proc/self/ns/pid` different from the probe's.
- **Capability row `cap-run`** enters `## Capabilities` in the C1 commit only if O2 is 6/6.
- **Kill rule.** C1 verifies only if O1 = 3/3 AND O2 = 6/6 at the C1 commit; anything else is a miss, reported as
  such. Counters, predicates and targets are not amended after this note is committed.

**Residuals named before data.** O1: a scrub keyed on a set of path prefixes covering both hostile runs, or a
replayer that probes `git` before deciding, is not distinguishable from a full scrub by the counter; the C1 diff is
read by a non-author. O2: the six cases sample behaviour; they are not an enumeration of every descendant, signal or
task-limit path.

**Controls re-scored under A2 before data** (L1, receipts `probe/receipts/controls-A2.txt`): every control commit
the wave-1 control seats built is re-scored with the A2 counters, plus the do-nothing base.

## Amendment A3 before data (L1, ~08:45Z) — O2's counter observes from outside the runner

Control **CtlC2LabelKeyed met the A1 probe** (`build/CtlC2LabelKeyed.md`, commit `7af3d978` in its scratch clone:
6/6 three times) by never launching the child and fabricating the child's stdout, progress file and verdict lines;
the A2 identity clauses read child stdout too, so they were fakeable the same way. No candidate has been scored.
O2's counter `probe/caprun-probe.mjs` (as committed with this note) now judges each case from what the probe itself
observes outside the runner: the live child process found in `/proc` by a random marker (`<node> -e <script>
<marker>`), its `/proc/<pid>/ns/pid`, its cgroup's `memory.max`, its `/proc/<pid>/environ`, the environ of its PID
namespace's init (NSpid last field 1), plus files the child writes and the runner's exit and stderr. Each case
requires the child (or K2's grandchild) to be seen alive. The case sentences are in the probe header and are the O2
predicate; K1(i) now also requires at least one recorded allocation. Calibration (`receipts/calibration.txt`):
reference runner 6/6 twice; do-nothing base 0/6; CtlC2LabelKeyed's commit `7af3d978` 0/6. O1 is unchanged from A2.
The kill rule of A2 stands; no further amendment will be made after this commit.
