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
