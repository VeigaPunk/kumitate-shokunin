# ExecLoadProbe — F48 behavior under induced load (round 48, attempt 2, wave `r48`)

Axis: operability · C1 / `ROUTED_HELD` / rule F48 · frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`.
Seat: `ExecLoadProbe` (executor, leaf). Scope: **read-only measurement of the frozen counter's
behavior under induced host load**; no change to the lane repo, no change to the counter, no
counter amendment proposed by this seat (that is the L1's seat).

Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/ExecLoadProbe/` — `lane` (clone of the lane repo
at `fe3d45bf`, `--no-hardlinks`, detached; `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` unset) and
`c1` (a second clone at `fe3d45bf` carrying the four sibling route patches, committed in the
sandbox only as `ecc6e7999224ddac094f0665bb3eb2831591ad63` with `-c user.name=seat`). No `git`/`jj`
write was made in the lane repo; the lane's `scripts/` were never touched.

Load induction: `yes > /dev/null &` workers started per run (6 for the batches, 24 for the
high-load run), killed after each run; `load1` read from `/proc/loadavg` immediately before and
after every invocation. `nproc` = 32; host `pid_max` = 4194304. **No tool was installed** — the
harness needed only `node`, `strace` 7.2, `timeout`, `prlimit`, `tar` and `git`, all present.

## Headline

1. **The frozen counter is load-stable for C1.** Across 34 invocations that produced a reading at
   load1 17 → 78 (35 launched; one aborted with no reading — see the table), the counter never
   returned exit 2, never produced a trace-parse failure, and never disagreed with itself about a
   site's label. Zero `CAPROUTE48: ERROR` lines exist in any run.
2. **A C1 candidate (the four sibling route patches applied at the freeze) reads `held=4/4`
   exit 0 under load in 6/6 runs** (5 at load1 17–26, 1 at load1 18–32 with 24 load workers).
3. **One observed label flip was NOT load — it was a counter-version artifact.** The lane's
   counter file was amended twice *while my batch was running* (15:38:52 and 15:45:14). The
   version in the 15:38:52–15:45:14 window carries an A48 amendment whose `caseLines`/`passLines`
   are computed but **never propagated into the per-site record**, so every CASELINES-gate site
   reads `summary_uncorroborated` and is scored `ROUTED_MISS` regardless of its actual routing.
   That is what produced the `held=2/5` and the `held=0/4 … summary_uncorroborated` readings
   below. I reproduced it deterministically (see "Flip attribution"), and the current file
   (`3ed305f2…`) reads `5/5` on the same set, the same commit, the same load.
4. **Kill-rule hazard, measured, not conjectured:** the buggy bytes score the **fully routed C1
   candidate** as `held=0/4` exit 1, with `capped/n == base_n` and `uncapped_direct=0` on every
   site. It needs no load to fire. If the L1's score run or any committed wave re-run executes
   those bytes, C1 records a **miss that is an artifact of the counter, not of the routing**.

**Consequence for the re-run strategy:** the close needs **no extra re-runs for load**. The
counter's exit-2 / parse / thread-leader failure modes were not observed at any load I could
induce. What the close *does* need is a **counter-version pin**: a score run and its re-runs must
all execute the *same* counter bytes, and the `counter_sha256` recorded must be the one actually
executed (not one computed after the run — see "Counter-version churn").

## Per-run table — the assigned measurement

### A. `--set r48` at the freeze tip `fe3d45bf` (5 runs, induced load)

All five runs read **`held=0/4`, exit 1** — the correct reading for the freeze (no site routed
yet). No disagreement between runs; no exit 2.

| run | exit | held | rule | workers | load1 start→end | elapsed | counter sha256 (post-run) | verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 0/4 | F48 | 6 | 22.07 → 50.40 | 79 s | `f24a3af5…` | stable |
| 2 | 1 | 0/4 | F48 | 6 | 50.40 → 57.42 | 88 s | `f24a3af5…` | stable |
| 3 | 1 | 0/4 | F48 | 6 | 57.14 → 53.08 | 75 s | `f24a3af5…` | stable |
| 4 | 1 | 0/4 | F48 | 6 | 53.08 → 53.39 | 70 s | `f24a3af5…` | stable |
| 5 | 1 | 0/4 | F48 | 6 | 52.71 → 50.38 | 67 s | `f24a3af5…` | stable |

Per-site detail was byte-identical across all five runs: `RG742` `capped/n=0/116,0/116,0/116
base_n=116 cases=61/61 ×3 uncapped_direct=58,58,58`; `SP491` `0/2 ×3 base_n=2`; `SP519`
`0/2 ×3 base_n=2`; `SP1592` `0/14 ×3 base_n=14`; reason on every site
`no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec`.
Per-gate run lines were stable in every field except `resumed` (round-gate 19→69 across the
15 gate-runs) — i.e. the interleaving that broke round 47's counter is *present and varies* here,
and the round-48 parser absorbs it. **`execs` was 1308 (round-gate) and 54 (surface-probe) in
every single run**, so no record was dropped.

### B. `--set r47` at the freeze tip (5 runs, induced load) — positive-label control

The r47 set *is* routed at the freeze, so this measures whether a **held** label can flip under
load. This is the decisive test for the kill rule, and it is where the anomaly appeared.

| run | exit | held | rule | workers | load1 start→end | elapsed | counter version in effect | verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 5/5 | F48 | 6 | 36.37 → 28.68 | 158 s | `f24a3af5…` frozen | clean |
| 2 | 0 | 5/5 | F48 | 6 | 28.14 → 22.99 | 122 s | `f24a3af5…` frozen | clean |
| 3 | 0 | 5/5 | F48 | 6 | 22.99 → 20.32 | 140 s | `f24a3af5…` frozen | clean |
| 4 | 1 | **2/5** | **F48+A48** | 6 | 19.65 → 31.21 | 174 s | **`df42ab6b…` (A48 v1)** | **flip: `summary_uncorroborated` on SC549, SC859, AT802** |
| 5 | 143 | — | — | 6 | 30.31 → 28.64 | 9 s | `df42ab6b…` (A48 v1) | **aborted, no reading** (see below) |

Run 5 exited 143 (SIGTERM) after 9 s with only three `RUN` lines emitted: my `yes` load workers'
`kill` in the *previous* iteration's cleanup raced the next invocation's process group. It is an
**aborted run with no reading**, not a counter result, and it is excluded from the classification.
No other invocation in this seat's whole measurement was aborted this way.

Runs 1–3 and 5 of the *second* r47 batch read `5/5` cleanly at load1 19–69 with the current
counter (`3ed305f2…`): runs 11/12/13/14 → `5/5` exit 0 at load1 69.18→51.78, 50.20→27.10,
26.13→20.12, 20.12→26.59.

### C. `--set r48` at the C1 candidate `ecc6e79` (the kill-rule measurement)

`c1` = `fe3d45bf` + the four sibling route patches `ExecRouteRG742.patch`,
`ExecRouteSP491.patch`, `ExecRouteSP519.patch`, `ExecRouteSP1592.patch` (all four applied
cleanly with `git apply --3way`; sandbox commit only). This is the closest available stand-in for
the L1's C1 commit.

| run | exit | held | per-site labels | workers | load1 start→end | elapsed | counter sha256 |
|---|---|---|---|---|---|---|---|
| 1 | **0** | **4/4** | RG742 116/116 ×3, SP491 2/2 ×3, SP519 2/2 ×3, SP1592 14/14 ×3; `uncapped_direct=0,0,0` | 6 | 17.62 → 23.58 | 81 s | `3ed305f2…` |
| 2 | **0** | **4/4** | same | 6 | 23.58 → 26.01 | 88 s | `3ed305f2…` |
| 3 | **0** | **4/4** | same | 6 | 26.01 → 26.39 | 83 s | `3ed305f2…` |
| 4 | **0** | **4/4** | same | 6 | 25.24 → 21.44 | 70 s | `3ed305f2…` |
| 5 | **0** | **4/4** | same | 6 | 21.25 → 17.50 | 65 s | `3ed305f2…` |
| high | **0** | **4/4** | same | 24 | 18.03 → 32.59 | 109 s | `3ed305f2…` |

6/6 runs read `held=4/4` exit 0. `cases=61/61 ×3` (round-gate) and `46/46 ×3` (surface-probe) in
every run; `base_cases` equal; `capped/n` equal to `base_n` on all four sites in all three
per-gate runs of all six invocations. **No DISAGREE between runs; no exit 2.**

### D. Concurrent-invocation stress (3 pairs of simultaneous counter runs)

Two invocations of `--set r48` at the freeze, started together, under load, 3 times:
`p1-a/p1-b`, `p2-a/p2-b`, `p3-a/p3-b` — **6/6 read `held=0/4` exit 1**, no disagreement between
the two members of any pair, no exit 2, elapsed 27–31 s each. The counter's scratch is
`/fast/scratch/hyaku/kumitate-r48/probe-runs` and each invocation uses a random-suffixed
directory, so parallel invocations do not collide.

## Classification (what the item asked for)

| class | observed? | detail |
|---|---|---|
| 4/4 (held, exit 0) | **yes, 6/6** at the C1 candidate; `5/5` on the r47 positive control | stable under load1 17–32 |
| 0/4 (held=0/4, exit 1) | **yes, 5/5** at the freeze tip (correct pre-routing reading) + 6/6 under concurrency | stable, byte-identical across runs |
| exit 2 (parse / thread-leader) | **never** | 0 `CAPROUTE48: ERROR` lines in 34 readings; no unparsed record, no never-resumed record, no PID-reuse, no `<pid changed to` cluster |
| DISAGREE between runs | **never for a given counter version** | every disagreement correlates 1:1 with a change of the counter *file*, not with load |
| aborted / no reading | 1 | r47 run 5 (SIGTERM from my own load-worker cleanup race), excluded |

Neither load nor concurrency produced a single exit 2, a single parse failure, or a single
cross-run disagreement. The `resumed` counter on the round-gate gate ranged 19→69 over the
measurement — the interleaving that made round 47's counter silently drop records **is** happening
here, and the round-48 parser handled every occurrence.

## Flip attribution — why the one flip was not load

The lane's counter file `…/round-48/probe/caproute48-probe.mjs` was edited **twice while my
batch was in flight** (mtime 15:38:52 → `df42ab6b…`, mtime 15:45:14 → `3ed305f2…`; the frozen
`f24a3af5…` was committed at `fe3d45bf`). Both edits are the **A48** amendment (pre-data, forced
by control `MutSummaryForge` M2 reading `ROUTED_HELD` on a forged self-consistent summary).

The 15:38:52 version computes `caseLines`/`passLines` inside `runGate` but **does not copy them
into the per-site record** (`out[k][s.id] = { …, failLines: g.failLines }` — no `caseLines`), while
the judging loop reads `t.caseLines`/`t.passLines`. Those are therefore `undefined`, and
`undefined !== t.total` is true for every site, so every CASELINES-gate site
(`round-gate`, `surface-probe`, `sources-check`, `anchor-truth`) is scored `ROUTED_MISS` with
reason `summary_uncorroborated` — **unconditionally, regardless of the actual routing**. The
15:45:14 version adds the propagation (`caseLines: g.caseLines, passLines: g.passLines`) and the
false miss disappears.

Deterministic A/B on the same commit, the same set, the same load, minutes apart:

| counter bytes | `--set r47` result |
|---|---|
| `df42ab6b…` semantics (A48 v1, no propagation) | `held=2/5` exit 1 — SC549, SC859, AT802 `ROUTED_MISS reason=summary_uncorroborated`; K488, CC879 `ROUTED_HELD` |
| `3ed305f2…` (A48 v2, propagation present) | `held=5/5` exit 0 — all five `ROUTED_HELD` |

The K488/CC879 split matches the mechanism exactly: `kimi-census` and `claims-check` are **not** in
`CASELINES` (their selftest prints no per-case lines), so they are unaffected; the three sites
that flipped are the three on CASELINES gates.

**Decisive measurement (the C1 candidate scored by the buggy bytes):** the same `df42ab6b…`
semantics applied to the **C1 candidate `ecc6e79`** — the commit that reads `held=4/4` exit 0
under the current counter — reads:

```
SITE RG742  label=ROUTED_MISS capped/n=116/116,116/116,116/116 base_n=116 uncapped_direct=0,0,0 reason=summary_uncorroborated
SITE SP491  label=ROUTED_MISS capped/n=2/2,2/2,2/2   base_n=2   uncapped_direct=0,0,0 reason=summary_uncorroborated
SITE SP519  label=ROUTED_MISS capped/n=2/2,2/2,2/2   base_n=2   uncapped_direct=0,0,0 reason=summary_uncorroborated
SITE SP1592 label=ROUTED_MISS capped/n=14/14,14/14,14/14 base_n=14 uncapped_direct=0,0,0 reason=summary_uncorroborated
CAPROUTE48 … set=r48 held=0/4 runs=3 rule=F48+A48      (exit 1)
```

Note the tell: **`capped/n` equals `base_n` and `uncapped_direct=0` on every site** — the
routing is *perfect* — yet the label is `ROUTED_MISS` with no routing reason at all, only
`summary_uncorroborated`. That run needed **no induced load** to occur. This is the shape a
kill-rule mis-score would take.

**Why this matters to the L1, and why it is not a load finding.** The window 15:38:52–15:45:14
was, counter-version-wise, a state in which **a perfectly routed C1 commit reads `held=0/4`
exit 1**. Under the kill rule ("every committed wave re-run on the same commit reads 4/4; any
exit 1 is a miss of C1, recorded as measured"), a score run or a re-run that happened to execute
those bytes would be recorded as a **miss of C1 that is an artifact of the counter, not of the
routing**. My r48 batch's one `summary_uncorroborated` run and the r47 batch's one `2/5` run are
both inside that window; every run outside it is clean.

Note the two readings also **disagree with each other about the same commit under the same
load**, which is the only cross-run disagreement I observed — and it disappears when the counter
bytes are held constant.

## Counter-version churn (an operational hazard for the close)

The lane counter file changed **twice during a 25-minute measurement window**, and the sha256
recorded in a receipt is normally computed **after** the run finishes, so it can name a version
the run did *not* execute. In my own batches this produced exactly that mismatch: the recorded
sha for the r48 batch was `3ed305f2…` for all five runs, but run 10 had started at 15:44:36 and
executed `df42ab6b…`. **Recommendation to the L1 (a receipt-hygiene rule, not a counter
amendment):** record the counter sha256 **before** the invocation (or copy the counter into the
run's scratch tree and hash that copy), so a score run and its re-runs can be proven to have
executed the same bytes. This is a change to *how receipts are written*, not to the predicate,
the counter, or F48.

## Recommendations (re-run strategy)

- **Do not budget extra re-runs for load.** Measured: 0 exit-2 in 34 readings at load1 17–78,
  and 6/6 `4/4` exit 0 at the C1 candidate including a 24-worker run. The close's mandated "L1
  score run + ≥2 committed wave re-runs on the same commit" is sufficient at the load levels
  tested.
- **Do budget for counter-version pinning.** Before the close, freeze the counter bytes (copy
  into a per-run scratch dir, hash the copy, record that hash) and confirm the score run and
  every re-run read the same sha256. If the counter file is still being amended, re-runs must
  wait.
- **Run the score and re-runs sequentially or in clearly separated invocations** if a re-run count
  of exactly 2 is planned: concurrency was harmless here (6/6 stable), but sequential runs give
  a cleaner attribution if a reading ever differs.
- **Treat any `summary_uncorroborated` reason as a counter-version smell first**, not as a routing
  defect: under `df42ab6b…` it appears on *every* CASELINES-gate site at once, including sites
  whose `capped/n` equals `base_n` (i.e. perfectly routed). A genuine routing defect shows up
  as `no_bwrap_ancestor` / `no_capped_scope_ancestor` / `no_cap_run_ancestor` /
  `uncapped_direct_children>0` on the specific site, not as a blanket corroboration reason.
- **An exit 2 remains possible in principle** (per `build/ReviewCounter48.md` D1, a thread-leader
  exec makes the invocation exit 2) — I did not observe it, and I did not try to provoke it; it
  would be recorded and never scored, so it costs a re-run but never a false score.

## L1 disposition (received after this report was written)

The L1 confirmed both findings and closed the loop:

- The intermediate `df42ab6b` bytes' readings are **discarded as never-scores** (recorded as
  `corpus/lessons/round-48.md` § Mistakes 4 and in the round-48 SCORECARD section); the tell
  (`capped/n == base_n` with only `summary_uncorroborated`) is written into the lesson as
  **Mistake 4**.
- The **sha-binding recommendation was applied**: the L1 score receipt `r48/L1-score-ce9aee5d.txt`
  records `counter_sha256 3ed305f2…` in its header **before** the run, and all three committed
  kill-rule readings (L1 18:52Z, ReRunCounterA 18:59Z, ReRunCounterB 19:00Z) name the same sha
  on the same commit `ce9aee5d`, all reading `held=4/4 rule=F48+A48`.
- The final counter bytes were frozen at 18:46–49Z (A48 re-scores), **before any candidate
  score** — so the kill rule's "no post-score amendment" is intact.
- My report and receipts are in the committed record at `4e4f4713`.

This seat's own 6/6 `held=4/4` exit-0 readings on the route-patch union tree (`ecc6e79`) are
independent corroboration of those readings, taken at load1 17–32 against the same counter bytes.

## Files (all under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/`)

| file | what |
|---|---|
| `ExecLoadProbe.md` | this report |
| `ExecLoadProbe-runs.txt` | the full per-run table with every `RUN`/`SITE`/`CAPROUTE48` line, exit codes, load1 readings and counter sha256 for all 34 readings |

Sandbox evidence (not in the lane repo): `/fast/scratch/hyaku/kumitate-r48a/seats/ExecLoadProbe/`
— `lane/` (clone at `fe3d45bf`), `c1/` (C1 candidate `ecc6e79`), `summary.txt`, `r47-summary.txt`,
`r48-batch.txt`, `r47-batch.txt`, `c1-summary.txt`, `c1-high.txt`, `run-*.txt`, `r47-run-*.txt`,
`r48-run-*.txt`, `c1-run-*.txt`, `frozen-f48.mjs`, `counter-df42ab6b.mjs` (reconstructed A48 v1),
`counter-3ed305f2.mjs`, `probe-instr.mjs` (counter + stdout dump), `a48probe.mjs` /
`a48-*.txt` (A48-clause corroboration measurement), `batch.sh`, `run1.sh`, `runr47.sh`,
`c1load.sh`, `highload.sh`, `conc.sh`, `instr.sh`, `a48load.sh`, `a48conc.sh`.

## Honest limits

- The C1 candidate `ecc6e79` is **my sandbox union of the four sibling patches**, not the L1's
  C1 commit. If the L1's integrated commit differs, my 6/6 `4/4` applies to my candidate, not to
  the close commit. It is evidence that the four route patches are jointly sufficient under
  load, nothing more.
- I ran the counter against the lane's **working-tree** file, which the L1 amends; I never
  modified it and never proposed an amendment. The two counter versions I A/B'd are the frozen
  `f24a3af5…` (committed at `fe3d45bf`), `df42ab6b…` and `3ed305f2…` (working-tree states).
  My reconstruction of `df42ab6b…` is byte-reconstruction of its semantics, not a byte-exact
  recovery (my reconstruction hashes `007e1cdd…`); the *behaviour* is what I measured, and it
  reproduces the observed `2/5` + `summary_uncorroborated` split exactly.
- Load was induced with `yes` workers on a 32-core host that other seats were also using; the
  load1 figures are therefore a floor, not a controlled ceiling. I did not attempt to drive the
  host to a PID-counter wrap (`pid_max` 4194304), which is the other load-dependent input the
  round-48 parser guards against.
- I did not score C1 and do not claim C1: scoring is the L1's seat.
- No tooling was installed (nothing was needed); no `pacman`/`uv`/`npm` transaction was made.
