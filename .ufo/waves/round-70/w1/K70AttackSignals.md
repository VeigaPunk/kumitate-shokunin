# K70AttackSignals — round 70, C1 replay isolation (operability)

Scope: attack the contract edge "SIGTERM during replay cleanup → orphan children and receipt atomicity". Attack only; no production file, no other seat's artifact, no commit, no push, no git mutation. Originals `c1-controls.sh`/`c2-controls.sh` never executed (read-only + hash-pinned by the candidate's own private copy, which is what ran — under private work/out in my scratch only).

## Verdict

The edge is real, worse than the brief implies, and sits on the **measured** path, not just hygiene:

1. **The frozen r69 probes self-recurse unboundedly** (`ledger69-probe.mjs:442/461/476`, `deprec69-probe.mjs:405/419/434`: `spawnSync(SELF, <inner-fixture>)` inside check L7). Each nested invocation runs the *full* check suite and reaches L7 again, so depth grows linearly with wall time and each level carries a 900 s `spawnSync` timeout. Observed live: 804 concurrent `ledger69-probe` processes across 5 sibling process groups, ppid chains ~30 deep, growing.
2. The r70 probe bounds each replay at `timeout: 300000` (`replay70-probe.mjs` `run()`), and the observed candidate bounds bash at `RUN_TIMEOUT_MS = 280000` — but a single control's probe phase cannot complete under ~900 s (one L7 child's timeout is the minimum wait). **Every R3–R7 invocation is therefore terminated before a `CONTROL-PASS` receipt can exist.** Termination kills only the direct child; the whole nested probe chain is orphaned (observed `ppid→1` reparenting), each orphan writing into the dead parent's unreclaimed mkdtemp child.
3. Node's default SIGTERM disposition kills the process without running `try/finally` (micro-demo below). The candidate's *only* cleanup path is `finally { fs.rmSync(child) }` at line 253 → **cleanup is exactly the code that never runs under a signal**, which is when it matters most.

Predicate integrity: no false-PASS path found. A signal-killed run honestly MISSes (absent/empty `--out` → no labels; non-empty `work/` → `readdirSync(work).length===0` false; `r.status!==0`). The defect is reachability of the claimed pass plus an orphan/leak blast radius, not predicate weakness.

## Findings

### F1 — Timeout ladder makes R3–R7 structurally unreachable (counter-vs-probe mismatch; freeze consequence)

- `replay70-probe.mjs` (frozen): `run()` uses `timeout: 300000`. R3–R7 require `r.status===0 && text.includes('…UNMET') && text.includes('CONTROL-PASS …')`.
- The control runs `node "$PROBE" $S/fx $REV`; the probe's L7 spawns `SELF` on an inner fixture which re-runs the entire suite and reaches L7 again (lines above). Depth is time-bounded only: the innermost child runs until its own `timeout: 900000` fires, then L7 MISSes and the level unwinds. One probe ≈ 15+ min wall time under load (observed: >4 min and still descending at kill time; the r69 receipts prove a complete run *does* eventually land, so termination exists — just not under 300 s).
- Consequence: at ~280 s the candidate SIGTERMs bash (`spawnSync` default `killSignal: SIGTERM` — verified below); bash dies; the probe chain is orphaned; `spawnSync` reports `status: null` → R3–R7 MISS. If that 280 s bound were raised to let the control finish, the r70 probe's 300 s bound would deliver the kill instead. **REPLAY70_HELD (10/10) is unreachable through this ladder while probe recursion takes ≥ one L7 child's 900 s timeout.** Max achievable held ≈ 5/10 (R1, R2-if-selftest-fast-enough, R8, R9, R10).
- Note: the r70 counter and r69 probes are all frozen — the miss is honest, never waived. But the *target* HELD-10/10 cannot be produced by any implementation meeting the other clauses; the ladder, not the tool, decides the score.

### F2 — Orphan chain + unreclaimed work dir on SIGTERM during probe/cleanup (candidate defect, demonstrated)

- `control-replay.mjs` (observed candidate `build/K70ExecRunner/scripts/`, sha-pinned transforms, selftest ST01–ST09) installs **no signal handlers**. Its cleanup is solely `finally { fs.rmSync(child, {recursive:true, force:true}) }` (line 253). Micro-demo (Node v24.21.0): `try { spawnSync(sleep 60) } finally { write marker }` + external SIGTERM → parent dead, marker absent, `sleep 60` reparented to pid 1 and alive. `finally` does not run on signal death — same for the `spawnSync` timeout's SIGTERM to bash.
- Demonstrated on the literal-contract implementation (`impl-literal.mjs`, mock control `standin-c1.sh`): SIGTERM during probe phase → bash/sleep orphaned (`ppid=1`), mock probe finished 60 s later and wrote a **complete `CONTROL-PASS donothing` receipt into the dead parent's work child** (`replay-B7oxhR/receipt-donothing.txt`, 213 B) that nobody copied; `--out` never created; work child leaked forever. Under the frozen probe this maps to R3–R7 MISS *plus* a leaking orphan chain — and on the `forgecapture` arm the orphan is a **live network-active probe** still fetching `raw.githubusercontent.com` after the run was "cleaned up".
- Demonstrated on the **real candidate**: `timeout 240 node …/K70ExecRunner/scripts/control-replay.mjs --lane <lane> --family c1 --mode donothing --out …/real/out/happy-c1-donothing.txt --work …/real/work` → exit 124; `--out` left **0 bytes**; `control-replay-vCqkEd/` left unreclaimed (private copy + 0-byte receipt + `tmp/ledger69.7ztHQG` probe temp + `scratch/c1-donothing/fx` fixture). Evidence in `build/K70AttackSignals/real-run/`.

### F3 — SIGTERM inside the copy→rm window leaves a false "clean-looking" partial state

- On the fat-receipt mock (256 MB), SIGTERM delivered the instant `copyFileSync` completed landed **mid-`rmSync`**: `--out` fully written (268 435 669 B, all labels present) while `work/replay-BMIVBg` survived as an emptied husk → `readdirSync(work).length===0` false → honest MISS despite a complete receipt. The two-step `copy; rm` sequence is a signal-interruptible window the contract never addresses ("receipts copied out before cleanup" is silent on atomicity/deferral).

### F4 — `--out` is a retry poison-pill: created before `mkdtemp`, written non-atomically

- Candidate line 215: `fs.openSync(out,'wx')` **before** mkdtemp; receipt written via `writeSync`+`fsyncSync`+`close` mid-run (lines 242–244). Any kill during the run leaves an existing file, so a later retry of the same `--out` is refused (exit 73) forever until manually unlinked — and a kill between `writeSync` and `closeSync` can persist a *truncated* receipt (label tail cut → honest MISS, but the poisoned file also blocks the retry that would fix it). No write-temp-then-rename; the contract's "output creation exclusive" is met literally while atomicity is unspecified.

### F5 — Selftest hermeticity gap: no signal/timeout finding-id

- ST01–ST09 cover usage, tamper refusal, transform-once, exclusivity, one happy-path replay (ST08), static transforms. Nothing exercises SIGTERM/SIGINT or spawn-timeout, so "the child is reclaimed (work root left empty)" (header line 11) is verified only on the uninterrupted path. Also note ST08 itself runs a full c1 replay under `timeout: RUN_TIMEOUT_MS` → same ladder risk as F1 for R2 under load.

## Impacted axes

- **operability** (claimed axis): the bounded obligations are only exercisable happy-path; under interruption the tool leaves orphan process forests (each r69-probe level carries a 900 s timeout → orphans self-propagate for ~15 min), unreclaimed mkdtemp children, and a poisoned `--out`. REPLAY70_HELD 10/10 is at best flake-dependent, at worst structurally unreachable (F1).
- No other axis touched.

## Counter vs defect split (fixable vs judge-rejectable)

- **Counter/predicate: robust on this edge.** I found no signal-induced false-PASS: every interrupted path yields a missing/empty/label-less `--out` or non-empty `work/` → honest MISS; R9's existing file stays byte-identical (`'wx'` refusal observed, `do-not-overwrite\n` preserved in both mock and candidate ST07).
- **Fixable defect (candidate/contract):** missing signal safety — no handlers, direct-child-only termination, non-atomic `--out`, cleanup only in `finally`.
- **Contract-vs-frozen-probe ladder (F1):** the 300 s r70 bound vs ≥900 s r69-probe recursion is a *tradeoff the canonical judge must score*, not something an implementation can fix within "bound only to the five frozen controls". If 10/10 is measured, receipts must show completed controls (probe output + `CONTROL-PASS`), i.e., recursion actually terminated inside the bound; under observed wave load it does not.

## Smallest safe correction (advisory; predicate and frozen bytes unchanged)

1. Candidate: spawn bash with `detached:true`; install SIGTERM/SIGINT handlers that `process.kill(-childPid,'SIGTERM')` (whole process group → the entire nested probe chain dies, no orphans); write `--out` as `tmpfile`+`fsync`+`rename` (atomic publish, no 0-B poison); keep `rmSync(child)` also in the handler path (synchronous — safe in a signal handler) so the work child is reclaimed on the die path; add selftest ids `SIGTERM-ORPHAN` / `SIGTERM-ATOMIC` asserting group kill + work-empty + out-absent-or-complete.
2. Wave/close (non-predicate): record that REPLAY70's R3–R7 are timeout-ladder-bound; if measured UNMET, the reason is the ladder (probe recursion vs 300 s bound), not necessarily the implementation's isolation. Never amend the predicate; preserve the misses honestly per the plan.
3. Do not touch `replay70-probe.mjs`, r69 probes, c1/c2 controls, or plan bytes — all frozen.

## Reproduction artifacts (`.ufo/waves/round-70/build/K70AttackSignals/`)

- `impl-literal.mjs` — literal minimal contract implementation under attack (no signal handling, by design).
- `standin-c1.sh` — shape-faithful stand-in for the frozen control (W/S env substitution, `SLEEP`/`PAYLOAD_MB` knobs); originals never run.
- `driver.mjs`, `driver-b.mjs`, `micro.mjs`, `driver-output.txt`, `driver-b-output.txt` — scenarios: micro (finally skipped + orphan), happy-path baseline (exit 0, work empty), scenario A (SIGTERM in probe phase → orphan + complete orphan-written receipt + unreclaimed child), scenario B (SIGTERM mid copy→rm → complete out + husk).
- `mock-run/orphan-wrote-full-receipt.txt` — full `CONTROL-PASS donothing` receipt written by the orphan **after** parent death.
- `real-run/` — real-candidate SIGTERM leftovers: 0-byte `--out`, 0-byte receipt, `leftover-tree.txt` (private copy, probe `tmp/ledger69.*`, fixture `scratch/`).

## Commands and outcomes observed

- `read` `~/.omp/agent/RULES.md`, `round-70/plan.md`, `probe/replay70-probe.mjs`, `base/*` (`freeze-map: CLEAN`, `band-control`, `source-counts`), `round-69/probe/c1-controls.sh`, `c2-controls.sh`, `ledger69-probe.mjs` (lines 40–123, 430–488), `deprec69-probe.mjs` (spawn sites only) — read-only; originals never executed.
- `git status --short` (lane) → only untracked wave files; `git rev-parse --show-toplevel` not needed — no fixture commits made (mock control does no git work).
- `node --version` → v24.21.0 (system, no install).
- `node driver.mjs` → micro: marker absent, orphan `sleep 60` reparented alive; happy: `exit=0 outHasPass=true workEntries=[]`; scenario A: fired at probe-phase, orphan observed, `work/replay-B7oxhR/` contained full 213-B `CONTROL-PASS donothing` receipt post-mortem, `out.txt` absent. (Driver killed at 3.5 s by harness transient-shell teardown — the kill itself completed the demonstration; state captured afterwards.)
- `node driver-b.mjs` → `fired=true exit=null signal=SIGTERM outSize=268435669 workEntries=["replay-BMIVBg"] leftover replay-BMIVBg: []`.
- `timeout 240 node …/K70ExecRunner/scripts/control-replay.mjs --lane <lane> --family c1 --mode donothing --out … --work …` → `CANDIDATE-EXIT=124`, 0-B out, `control-replay-vCqkEd` unreclaimed; its `receipts/c1-donothing.txt` 0 B (probe died mid-run).
- `ps -eo pid,ppid,pgid,stat,etime,comm,args` (×3) → 512→804 concurrent `ledger69-probe.mjs` processes; pgids per sibling seat (204/180/157/125/95 …); ppid chains ~30 deep of `spawnSync(SELF,…)`; my scenario-A orphans `ppid=1494` (reparented) after parent death.
- `grep -n 'SELF\|spawnSync\|timeout:'` on both r69 probes → self-recursion at ledger69:442/461/476 (L7), deprec69:405/419/434; timeouts 900 s inner / 300 s deprec69 cmd; r70 probe `timeout:300000`; candidate `RUN_TIMEOUT_MS=280000`, no `detached`, no `SIGTERM` listener, `openSync(out,'wx')` line 215, `rmSync` only in `finally` line 253.
- `find`/`stat` on leftovers → sizes/times recorded above.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackSignals/` created explicitly (HYAKU_SCRATCH unset → default); cleaned before yield (all artifacts copied to build dir first).
- Not run: original controls; the frozen r70 probe against the lane (would consume a scoring path + 300 s×7 of nested probes); `--selftest` of the candidate (same recursion hazard via ST08).

## Install record

None. Node v24.21.0 / git / coreutils already present; no `pacman`/`uv`/`npm -g`/`cargo`/binary installs.
