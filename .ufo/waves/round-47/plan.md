# kumitate round 47 — plan (L1 KumitateR47, frozen before any data seat)

Base `0bd8be60d9150030a2eee8344a2e70b65f6eb4f4` (round-46 spot-check commit). Dispatched 09:28Z; scope freeze
11:28Z; hard stop 12:28Z. The L1 holds the §3 planner seat.

## C1 — operability (the lowest non-retired axis, at 9; integer terminal under `f_O`)

**Surface.** Five child-process sites in four lane gates, routed through the runner `scripts/cap-run.mjs`:

| id | site (at base) | child |
|---|---|---|
| K488 | `scripts/kimi-census.mjs:488` `runGate` | `node kimi-census.mjs …` |
| SC549 | `scripts/sources-check.mjs:549` `runTool` | `node sources-check.mjs …` |
| SC859 | `scripts/sources-check.mjs:859` awk-census parity | `sh -c <script> sources-check-parity <fixture>` |
| CC879 | `scripts/claims-check.mjs:879` `runClaims` | `node claims-check.mjs …` |
| AT802 | `scripts/anchor-truth.mjs:802` selftest `tool()` | `node anchor-truth.mjs --self …` |

The interface change the round-46 scout asked for (ScoutChildSites: 0/24 routable as-is) lands in the freeze commit
as the shared prerequisite, not as the claimed move: runner contract `kumitate-cap-run-v2` (`--bind <dir>`,
`--verdict-file <path>`, synchronous verdict write, decimal budget rule; R46-5) and the helper
`scripts/cap-spawn.mjs` (`capSpawnSync`, spawnSync-shaped, child stderr byte-exact, BUDGET → ETIMEDOUT shape).
The do-nothing control is scored at the freeze commit too, with the prerequisite present.

**Counter (frozen).** `node .ufo/waves/round-47/probe/caproute-probe.mjs <lane> <rev>`.

**Predicate, label `ROUTED_HELD`** (the same sentence as the counter's header):
Site s is ROUTED_HELD at rev r when the owning gate's `--selftest`, run from a `git archive` of r under `strace -f`
with a planted canary variable, exits 0 with every case passing and no fewer cases than the same run at the frozen
base 0bd8be60; execs the site's child at least once; launches no node or shell direct child other than r's own
`scripts/cap-run.mjs`; and every exec of the site's child descends from r's `scripts/cap-run.mjs`, from a
`/usr/bin/systemd-run --scope` carrying MemorySwapMax=0, MemoryMax <= 1024M and TasksMax <= 256, and from a
`/usr/bin/bwrap` carrying --unshare-pid, --clearenv and --die-with-parent, with no canary variable in the child's
environment.

**Before → target.** `CAPROUTE_PROBE … held=0/5` exit 1 at base (`probe/receipts/c1-base.txt`) → `held=5/5` exit 0
at the C1 commit. **Kill rule:** any site `ROUTED_MISS` at the C1 commit is a miss of C1, reported as measured;
the counter, predicate, site list and target are never amended after the first candidate score.

**Not claimed.** The other 19 of the 24 round-46 sites: cite-check `:2311`, `:2338`, `:2431`; gate-mutants `:413`,
`:876`; proxy-check `:1543`; round-gate `:725`, `:1392`; surface-probe `:476`, `:504`, `:1007`, `:1541`, `:1682`;
wave-census `:302`, `:368`, `:369`, `:438`, `:439`, `:585`. wave-census and cite-check stay out because the
gate-mutants battery mutates and re-runs exactly those two suites (item 697's load sensitivity is open).

**Calibration before freeze (no candidate existed).** A scratch K488-only route (`probe/receipts/calib-k488-only.patch`,
scratch commit `d066e8cc`, scratch-only — the patch is the lane evidence) first read K488 MISS: the counter did not
translate PIDs returned by a clone inside bwrap's PID namespace. Fixed with `--decode-pids=pidns`; it then read K488
`ROUTED_HELD`, the four others MISS (`calib-k488-only.txt`, held=1/5). One calibration run counted 91 AT802 execs
against 106 in every other run on identical anchor-truth bytes, so an exec-count floor would make a false miss
possible; the floor was replaced, before freeze, by the selftest case-total floor and the uncapped-direct-child rule.

**Data rule.** No seat runs the frozen counter on a routing candidate. Control seats score only their controls.
Routing executors run only their own development checks (selftests, never the counter). The L1 scores the integrated
C1 commit once, after every control receipt is committed.

**Pre-data controls (wave 1; each built in a scratch clone of the freeze commit, scored with the frozen counter,
its patch committed as lane evidence — R46-4):** do-nothing re-score; comment/string mention of cap-run at each site;
a fake runner (a `cap-run.mjs`-named shim that runs the child directly); systemd-run without bwrap; bwrap without
systemd-run; first call routed, rest raw; label/path dodge (renamed parity label, copied gate file); routed with the
full parent environment (canary passes); loose caps (MemoryMax 4096M, TasksMax 4096); stub child (spawn skipped,
fake result, cases deleted); junk commit. Each must read `held` < 5/5, and the site the control targets must read
`ROUTED_MISS`. A control that meets the counter stops C1 for re-design before data, or C1 is declared exploratory.

**Harm checks (after the C1 commit).** `--selftest` PASS for every touched gate and for `cap-run.mjs`;
`proxy-check --strict` MATCH after re-pins; `sources-census validate` exit 0; `surface-probe --checklists` with no
item failing that passed at open; `gate-mutants` CLEAN (its two targets are untouched).

## Repairs routed by the round-46 spot-check

- R46-1: the 13 in-place SOURCES corrections (S003, S004, S013, S041, S047, S051–S055, S061, S073, S076) — restore
  each row's `2b2bf7bb` bytes and append one `supersedes S0NN —` row per correction, each re-opened this round
  (CORPUS.md:116-118).
- R46-2: report miscounts (13 rows, not 15; item 697 failed 4 of 4, not 3 of 4; open census carried W04 S034 too)
  — appended correction in SCORECARD and this round's report; the filed round-46 report is never rewritten.
- R46-3: checklist receipts keep the battery's own output, load and wall time; item 697 root-cause test at base
  and at the C1 commit under the same synthetic load.
- R46-4: the four scratch-only control commits (`7af3d978`, `9800b17f`, `3f5dd9f6`, `76df5c28`) — land their
  patches from the surviving scratch clones, or mark them scratch-only in an appended receipt note.
- R46-5: `cap-run.mjs:182-183` verdict flush and `:119` budget rule — fixed in v2 (freeze commit).

## Frontier step

New SOURCES rows opened this round (tier A, primary manuals) for the counter and the runner: strace(1) (`-f`,
`--decode-pids=pidns`), Node.js process I/O (synchronous pipes and `process.exit()`), bwrap `--bind`. C1 cites
them (sourced claim). One mistake mined into `corpus/lessons/round-47.md` `## Mistakes`.
