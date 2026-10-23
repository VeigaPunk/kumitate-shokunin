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
