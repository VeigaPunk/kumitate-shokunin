# kumitate round 48 — plan (L1 KumitateR48, frozen before any data seat)

Base `f00cf278a5ab57e87b18418fc972be9f893f65da` (round-47 verifier spot-check; round 47 rejected as an honest stop).
Dispatched 11:04Z; scope freeze 13:04Z; hard stop 14:04Z. The L1 holds the §3 planner seat.

## Repair first (round-47 spot-check § 7)

- **R47-5 (counter observation gap) — root cause found before this plan.** The round-47 A2 counter matched a record's
  return with `\) = `. strace aligns a short record's return value to a column (`-a`, default 40), so a resumed
  execve reads `<... execve resumed>)           = 0` and was skipped silently. Resumed records appear when another
  tracee's event interleaves, so the loss grew with load. Receipt `probe/receipts/rc-at802-parser.txt`: three
  concurrent strace runs of the anchor-truth selftest at `f00cf278` (load1 ≈ 63); the A2 parser and judge read AT802
  capped 106/106, 105/106 and 103/106 (n=106), the round-48 parser reads 106/106 on the same three logs (log sha256 in
  `probe/rc/strace-logs.sha256`; analysis scripts `probe/rc/*.mjs.txt`). The fix: return matched as `\)\s+= `; any
  traced record whose return does not parse, any resumed record with no pending entry and any entry never resumed is
  exit 2 (cannot evaluate); a site whose exec count differs from the base run's is a miss; the label needs 3 runs.
  **Second cause, found by the first pre-freeze stability runs** (`probe/receipts/prefix-bug-stab-*.txt`: with only
  the return fix, the r47 set read AT802 `exec_count_ne_base` / `no_cap_run_ancestor` in all three invocations, n
  104–105 of 106). strace pads the PID prefix to five columns; the host PID counter wrapped during those runs
  (pid_max 4194304; a log spans PIDs 4745…4193178), so records of PIDs below 10000 read `9879  clone(…)` and A2's
  `^(\d+) (.*)$` skipped them (a runner's execve lost, its child's chain broken, a child's exec uncounted). Receipt
  `probe/receipts/rc-at802-pidwrap.txt`: three kept logs read AT802 n=104/103/104 under A2 and 106/106 under the fixed
  parser. Fix: prefix `^(\d+) +`; any non-empty line that does not parse is exit 2; a PID created twice in one log
  (reuse, or an untranslated PID-namespace return) is exit 2. Both causes are load-dependent only through *which*
  records occur (interleaving, PID wrap). Not yet shown: that strace never drops a traced record under load (ptrace
  stops each tracee at every traced syscall; inference) — wave-1 ExecRootCause attacks this.
- **R47-1** — the round-47 re-runs are committed this round as receipts (ExecA2Reruns: the A2 counter itself, three
  runs at `f00cf278`, whose scripts equal `269dadb6`'s); the F48 r47-set runs are `probe/receipts/stab-r47-*.txt`.
- **R47-2, R47-3** — appended corrections (SCORECARD `## Round 47 correction`, plan of round 47 untouched; the round-47
  report is filed and not rewritten); re-open reports for S084, S091, S092 and a ruling on `falsify/ReopenS088.md`.
- **R47-4** — the checklist harness at base and at the C1 commit under recorded load (harm rule H1 below).

## C1 — operability (the lowest non-retired axis, at 9; integer terminal under `f_O`)

**Surface.** Four child-process sites in two lane gates, none routed at the base, now to launch their child through
`scripts/cap-run.mjs` (contract `kumitate-cap-run-v2`) via `scripts/cap-spawn.mjs` `capSpawnSync`:

| id | site (at base) | child | base execs per selftest |
|---|---|---|---|
| RG742 | `scripts/round-gate.mjs:742` `runGate` | `node round-gate.mjs <args>` (not `--selftest`) | 116 |
| SP491 | `scripts/surface-probe.mjs:491` surface shim | `bash <src>/scripts/ufo-sighting surface --json` | 2 |
| SP519 | `scripts/surface-probe.mjs:519` dispatcher status | `node <src>/scripts/fleet-dispatcher.mjs status` | 2 |
| SP1592 | `scripts/surface-probe.mjs:1592` `spawnSelf` | `node surface-probe.mjs <args>` (not `--selftest`) | 14 |

**Not routed (named; the counter allows these as raw direct children):** RG1409 and SP1766, each gate's nested
`--selftest` (a routed nested suite would call systemd-run inside bwrap, where `/run` is a fresh tmpfs; its own
children are the routed sites above, so they still need the chain); SP1049, the checklist runner `bash -c <command>`
(the command is data). Also not claimed: cite-check, gate-mutants, proxy-check and wave-census sites (round-47 plan
(1): only after item 697's battery is load-independent).

**Counter (frozen).** `node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> <rev> --set r48` (rule `F48`).

**Predicate, label `ROUTED_HELD`** (the same sentence as the counter's header):
Site s is ROUTED_HELD at rev r when, in each of 3 runs of the owning gate's `--selftest` from its own `git archive`
of r under `strace -f` with a planted canary variable, the trace parses completely, the gate exits 0, the line before
its final `VERDICT: PASS` is that gate's own suite summary with n = m and m no lower than the base run's, no FAIL line
and no successful execveat occur, no direct child of the gate is an uncapped launch outside the set's named
allowances, the site's child is exec'd exactly as many times as in the base run (at least once), and every such exec
is preceded, in its own ancestry, by the ordered chain r's `scripts/cap-run.mjs` (node) → `/usr/bin/systemd-run
--scope` whose own options set `-p MemorySwapMax=0`, `-p MemoryMax=<= 1024M` and `-p TasksMax=<= 256` →
`/usr/bin/bwrap` carrying --unshare-pid, --clearenv and --die-with-parent, with no canary variable in the child's
environment.

**Before → target.** `CAPROUTE48 … set=r48 held=0/4 runs=3 rule=F48` exit 1 at base (`probe/receipts/stab-r48-*.txt`)
→ `held=4/4` exit 0 at the C1 commit.

**Kill rule.** C1 verifies iff the L1's score run on the C1 commit and every committed wave-2 re-run of the same
command on the same commit (at least two) read `held=4/4` exit 0. Any run reading exit 1 is a miss of C1, reported as
measured. An exit-2 run is recorded and is never a score. The counter, predicate, site list, allowances and target
are never amended after the first candidate score. A pre-data control that reads `ROUTED_HELD` on any site forces an
amendment (named `A<n>`, before data, every control re-scored) or C1 becomes exploratory.

**Harm rules (declared before data).**
- H1 (R47-4): `node scripts/surface-probe.mjs --checklists` from a clone at `f00cf278` and at the C1 commit, two runs
  each, `load1` recorded per item. An item that passes in both base runs and fails in any C1 run is harm.
- H2: `caproute48-probe.mjs … --set r47` at the C1 commit reads `held=5/5` if it read 5/5 in every base stability run.
- H3: `node scripts/proxy-check.mjs --strict` MATCH at the close commit; H4: the fleet sources census exits 0.

**Counter stability (before freeze).** `probe/receipts/stab-r47-f00cf278-{1,2,3}.txt` (three concurrent invocations,
each 3 rev runs, set r47 at `f00cf278`) and `stab-r48-f00cf278-{1,2,3}.txt` (set r48 at `f00cf278`).

**Sourced on** S098 (strace manual, return-value column alignment — the reason for `\)\s+=`; opened this round by a
wave-1 scribe and re-opened in wave 2), with S093 (`--decode-pids=pidns`), S069, S072, S095.

## Waves

- Wave 1 `build` (v1): pre-data controls (mutation-tester/executor; each builds a scratch-clone patch from the freeze
  commit and scores it with the frozen counter), the two routing builds (executors; they never run the counter),
  R47 repairs, frontier rows, counter review and shape critique, root-cause re-derivation.
- Wave 2 `falsify` (v1) if ≥32 attack items exist, otherwise one residual call of ≤8 reviewer/critic seats.

---

# Attempt 2 addendum (L1 KumitateR48, 2026-10-23 ~15:30 -03)

Attempt 1 died with the orchestrator at ~09:30 -03 after landing freeze `fe3d45bf` and running wave `build` (44 seats); its uncommitted outputs (`.ufo/waves/round-48/build/`) are inherited. Re-verified by the L1 before this addendum:

- **Freeze intact.** Counter `probe/caproute48-probe.mjs` sha256 `f24a3af5…` matches the committed stability receipts; no candidate score exists anywhere (no ExecRoute* landed; the only 4/4 reading is `build/CtlEnvCaps-pristine-receipt.txt`, which scored the seat's own legitimate four-site comparator at `f55bf22e` under load1=58 — not a control, not a candidate). All 17 control mutants read `held=0/4` (targeted kills, e.g. `no_capped_scope_ancestor`); **no amendment to F48 is forced before data**.
- **R47-1 evidence exists**: `build/a2-rerun-{1,2,3}.txt` reproduce the r47 falsify readings (`held=3/5,3/5,4/5`) at `f00cf278` under load1 22→54.
- **R47-4 base side exists**: `build/checklist-base-{1,2}.txt` (load1≈44; the two FAILs are sandbox `REPORTS_DIR_MISSING` artifacts and the known pre-existing proxy drift — not harm).
- **R47-2/R47-3 drafts exist**: `build/ScribeErrata.md`, `build/ReopenS084.md` (S084 HOLDS), `build/ReopenS091.md`, `build/ReopenS092.md`, `build/ReconcileS088.md` (seat completed; S088 HOLDS).
- **S098 drafted**: `build/ScribeStraceManual.md` (fetch + sha256 + ≤25-word quotes), `status=queued`.
- **C1 unchanged** (same predicate sentence as the freeze header): four sites RG742/SP491/SP519/SP1592; counter `caproute48-probe.mjs --set r48`; after-state `CAPROUTE48 … set=r48 held=4/4 runs=3 rule=F48` exit 0 at the C1 commit; kill rule unchanged (L1 run + every committed wave re-run on the same commit, ≥2, must read 4/4; exit 2 recorded never scored; no post-score amendment; a pre-data control reading ROUTED_HELD forces an `A<n>` amendment or C1 becomes exploratory).

## C2 — capability acquisition `counter-rerun` (operability; frozen before data)

R47-1 routed: "Adopt Mistake 3's repeat-run and exec-count-equality rule before the next freeze." C2 mechanizes it. Surface: new `scripts/counter-rerun.mjs` in the lane repo.

**Predicate, label `COUNTER_RERUN`** (the same sentence in this plan, the instrument's header and the receipt): `counter-rerun` holds at rev r when `node scripts/counter-rerun.mjs --selftest` prints a line beginning `COUNTER_RERUN_SELFTEST: PASS` with exit 0 at r, and `node scripts/counter-rerun.mjs --probe <abs-probe> --lane <abs-lane> --rev <rev> --runs K -- <probe args>` runs the probe K times, printing `COUNTER_RERUN: AGREE (runs=K)` with exit 0 iff every run exits 0 and every run's final summary line is byte-identical, else `COUNTER_RERUN: DISAGREE` exit 1; exit 2 fail-closed on unreadable probe/lane/rev or unparsable output; usage 64.

**Before → target.** `scripts/counter-rerun.mjs` absent at base `fe3d45bf` (`git cat-file -e fe3d45bf:scripts/counter-rerun.mjs` → fails) → the two commands above read `PASS`/`AGREE` exit 0 at the C2 commit.

**Kill rule.** C2 verifies iff the selftest passes at the C2 commit and at least one committed receipt shows a real `AGREE` run over the frozen F48 probe. The selftest must contain a flake-injection case that a print-PASS stub fails (mutation control); CritC2Shape attacks the padding question.

**Harm rules.** H3: `node scripts/proxy-check.mjs --strict` MATCH at the close commit (stanza re-pinned for A/C2 at close — the pre-existing A_DRIFT +25→actual and C2_total +1 are the round's re-pin, not drift harm); H4: the fleet sources census exits 0 at close.

## Wave shape (shared contract, this leg)

One v2 wave `r48` of **64 seats** under `scripts/hyaku/ufo-wave-policy-v2.json` (band 64–128), attack seats = reviewer+critic+mutation-tester+labrat = 30 (47%); the §3 planner seat is held by the L1 (orchestrator ruling 2026-10-19 — the validator rejects `planner`; bounded data-walks ride ConnSiblings/Scout seats). Seats write sandbox clones under `/fast/scratch/hyaku/kumitate-r48a/seats/<name>/` and deliver patches/receipts/drafts as distinct files under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/`; the L1 is the only lane integrator. Leftovers after the wave (the C1-commit re-runs, the H1 tip runs, the integration review — fewer than 32 attack items) go into one residual call of ≤8 reviewer/critic seats via the orchestrator, counted in the round total (≤128). Orchestrator directive (mid-flight, this leg): the L1 validates and acquires the wave slot, then returns the `taskCall` to Main for inline dispatch.

## Frontier

S098 opened this round (draft from attempt 1, re-opened by ReopenS098 before landing) — C1 rests on it with S093/S069/S072/S095. Census before: run at attempt-2 open; after: at close, exit 0 required. Mistakes: `build/ScribeMistake.md` drafts two (trace-counter silent skip; cancelled-seat readings as conclusions) — ScribeLesson lands `corpus/lessons/round-48.md`.

## A48 (pre-data amendment, 2026-10-23 ~15:45 -03; before any candidate score)

Forced by the frozen kill rule: wave control **MutSummaryForge M2** (mutant `9e11273`, sandbox disposable) read `ROUTED_HELD` at RG742 3/3 — a round-gate selftest that genuinely fails one case, suppresses the FAIL line, and prints a self-consistent `ROUND_GATE_SELFTEST: 62/62 pass` + `VERDICT: PASS` with exit 0. The predicate cites the suite summary and the no-FAIL line as evidence; a consistently forged summary is indistinguishable from a truthful one under F48. Per the kill rule ("a pre-data control that reads ROUTED_HELD on any site forces an amendment, before data, or C1 becomes exploratory") the counter is amended, stricter only:

**Predicate, label `ROUTED_HELD`, rule `F48+A48`** (the same sentence in this addendum, the counter header, and the receipts' `rule=` label): Site s is ROUTED_HELD at rev r when, in each of 3 runs of the owning gate's `--selftest` from its own `git archive` of r under `strace -f` with a planted canary variable, the trace parses completely, the gate exits 0, the line before its final `VERDICT: PASS` is that gate's own suite summary with n = m and m no lower than the base run's, where for gates whose selftest prints per-case lines the per-case line count equals m and the passing per-case line count equals n, no FAIL line and no successful execveat occur, no direct child of the gate is an uncapped launch outside the set's named allowances, the site's child is exec'd exactly as many times as in the base run (at least once), and every such exec is preceded, in its own ancestry, by the ordered chain r's `scripts/cap-run.mjs` (node) → `/usr/bin/systemd-run --scope` whose own options set `-p MemorySwapMax=0`, `-p MemoryMax=<= 1024M` and `-p TasksMax=<= 256` → `/usr/bin/bwrap` carrying --unshare-pid, --clearenv and --die-with-parent, with no canary variable in the child's environment.

The corroboration clause applies to `round-gate`, `surface-probe`, `sources-check` and `anchor-truth`, whose selftests print per-case `PASS/FAIL/SKIP` lines (61, 46, 46, 44 — measured 2026-10-23, matching each summary); `kimi-census` and `claims-check` print no per-case lines, so for them the clause is vacuous (recorded, not hidden). A48 re-scores (receipts `r48/A48-*.txt`): r48-set stability at the freeze (expect 0/4), r47-set stability at `f00cf278` (expect 5/5 — H2 evidence), the reconstructed forgery M2′ (comparator `af03fad` + bumped summary printer, commit `905f848`; expect MISS `summary_uncorroborated` at RG742), and the attempt-1 CtlEnvCaps mutant `d4423b2c` (expect 0/4). Every pre-A48 control receipt stands; A48 can only turn HELD-shaped readings into MISS, never the reverse.

**Named limit (recorded, not amended): the bind view.** Control MutSpawnDropBind's full mutant (all `--bind` mounts dropped) was KILLED by the gate-health conjuncts (`r48/MutSpawnDropBind-*`), and L1 probe `905f848`'s sibling `51f7d07` (only the SP491 `cacheRoot` and SP519 `stateRoot` binds dropped) reads `held=4/4 exit 0` (`r48/L1BindProbe-receipt.txt`): the suites stay green because the shim silently skips cache/state writes when the mounts are absent. ROUTED_HELD cites no filesystem-view evidence — a counter-side bind oracle is not constructible, because the expected bind paths are per-run `mkdtemp` random directories inside the gate — so fs-view fidelity is defended outside the counter: integration source review verifies each patch binds exactly the throwaway roots the base code creates (RG742 `tmp`, SP491 `cacheRoot`, SP519 `stateRoot`, SP1592 `tmp`), and H1 compares the suite behavior base-vs-tip. Recorded so the closure can rule.
