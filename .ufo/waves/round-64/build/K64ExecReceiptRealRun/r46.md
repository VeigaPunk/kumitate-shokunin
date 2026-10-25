# kumitate — round 46 report (attempt 1, L1 KumitateR46)

## Work performed

Declared claim (one; plan `.ufo/waves/round-46/plan.md` § A2): **C1 — operability** (the lowest non-retired axis, at 9).
Surface: the `--selftest` paths of `scripts/cite-check.mjs`, `scripts/proxy-check.mjs` and `scripts/round-gate.mjs`,
plus a new runner, `scripts/cap-run.mjs`. C1 has two obligations, and both must hold:

- **O1 `GITENV_CANARY`.** The three selftests no longer follow a caller's `GIT_DIR`, `GIT_WORK_TREE` or `GIT_INDEX_FILE`.
- **O2 `CAPRUN_PROBE`.** The runner applies a cgroup memory and task cap, gives the child an explicit environment and its own PID namespace, enforces a total budget, and cleans up descendants and on signals.

C1 also carries the capability row `cap-run`. The plan first declared C1 and C2 as two claims. They were merged before data because both move operability (CritClaimShape; AXES).

- **Repair first.** The round-45 spot-check routed D1–D4, S073, S076 and the Q32 README row.
  - D1: erratum appended to `.ufo/waves/round-45/plan.md`.
  - D2 and D4: QUALITY Q33 and Q34, each with a command shown to fail (`.ufo/waves/round-46/quality/*.sh`; ExecQualityFailCmds), plus the frozen-checklist erratum rule.
  - D3: the S076 reason is re-worded.
  - S073: its teaches cell is narrowed.
  - Q32: a README row is added for the spot-check.
  - All of these land in `980a16af`.
- **Anti-loop sweep.**
  - Sixteen non-author reviewer seats re-opened all 77 SOURCES rows against their sources (`.ufo/waves/round-46/build/Sweep*.md`).
  - The sweep found 12 defective rows, plus S073 from ScribeRepairs. All 13 were fixed before the freeze, in `980a16af`.
  - A post-measure re-open (ReopenRows) narrowed S047 and S055 further, in `adedf671`.
- **Pre-data control wave.**
  - Nine mutation-tester control seats ran.
  - Three controls met the A1 counters (CtlC1PathKeyed, CtlC1Replay, CtlC2LabelKeyed). The counters were re-designed in A2 (`3b184d3a`), A3 (`cacfab32`) and A4 (`e0c18785`).
  - The L1 re-scored every control commit under the final counters (`probe/receipts/controls-A3.txt`). The replay-with-launches control met A2's O1 and was killed by A4.
  - The registered counters first scored a committed candidate at 08:54Z, after A4.
- **Measured.**
  - At `980a16af`: O1 `held=3/3` and O2 `held=6/6` (`close/o1-c1.txt`, `close/o2-c1.txt`).
  - Re-measured at the record commit `adedf671`, which carries the capability row: 3/3 and 6/6 (`close/o1-final.txt`, `close/o2-final.txt`).
- **Residual falsify call.**
  - ReRunCounters agrees: O2 6/6 three times, O1 0/3 at base.
  - MutC1Scrub: 5/5 mutants killed.
  - ReviewC1Diff: sound (2 low findings).
  - ReopenRows: 2 defects, both fixed.
  - CritAmendments: 3 objections, appended as a plan erratum. One of them is open for the judge: build executors ran development checks on their candidates before A2–A4.
- **Not done: routing the 24 child sites through `cap-run`.** ScoutChildSites found 0 of 24 routable without an interface change, so this is pre-registered for round 47.

## Landed changes

All commits landed on lane branch master via `jj-lane.sh`:

| Commit | What it carries |
|---|---|
| `7cd1fa37` | freeze: plan, counters and do-nothing receipts |
| `516977af` | A1 |
| `3b184d3a` | A2 |
| `cacfab32` | A3 |
| `e0c18785` | A4, control re-score and wave-1 receipts |
| `980a16af` | C1 code, repairs, S078/S079, QUALITY Q33–Q34, lesson |
| `adedf671` | record: capability row, move log, LOG.md entry, verdict, plan erratum |
| `9b33e03e` | final receipts |

The LOG.md entry for round 46 is in `adedf671`. The lane tip is **`9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0`**.

## Before → after measurements

| Obligation | Counter | Before (`2b2bf7bb`) | At `980a16af` | At `adedf671` |
|---|---|---|---|---|
| O1 | `bash .ufo/waves/round-46/probe/gitenv-canary.sh <lane> <rev>` | `held=0/3` | `held=3/3` | `held=3/3` |
| O2 | `node .ufo/waves/round-46/probe/caprun-probe.mjs <lane> <rev>` | `held=0/6` | `held=6/6` | `held=6/6` |

Proxy terms: A 16 → 21, C 21 → 22, C2 102 → 104. `proxy-check --strict` reads MATCH (`close/proxy-strict.txt`).

**Harm check — unresolved.**

- Checklist item `SKILL.md:697` (gate-mutants battery) exited 2 in 3 of 4 `surface-probe --checklists` runs at `980a16af`, under load 19–25 (`close/checklists*.txt`).
- The same command reads `GATE_MUTANTS: CLEAN` when run alone, through the harness alone, or as an item-by-item replay (`close/gate-mutants-direct.txt`).
- Checklist totals: 18/21 at open, 19/22 at close.
- The cause was not found. This is recorded as a possible operability harm.

## Sources & frontier

- **Census.** `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`:
  - Open: `kumitate ok` with W04 S068, exit 0 (`open/census.txt`).
  - Close: exit 0 (`close/census-close.txt`).
- **Rows.** 77 → 79, adding S078 (Node `child_process` env default) and S079 (cgroup v2 `memory.max`). Both are tier A, mined, and opened this round. They are cited in code by C1 (S078 in the three selftests, S079 in `cap-run`).
- **Rows touched.** 15 rows changed old → new; the row log is in `corpus/lessons/round-46.md` § Gate.
- **Mistakes mined.**
  - teaches cells that overstate their locators (Q33, shown to fail on S073).
  - A counter observing the thing under test through that thing's own output (A3 outside observation, shown on `7af3d978`: 6/6 → 0/6).

## Trend verdicts

- **expansion — improved.** +2 rows; one new runner capability. Both obligations moved 0 → full on frozen counters.
- **quality — improved.** All 77 rows were re-opened by non-authors and 15 rows were corrected. Q33 and Q34 were added with fail/pass runs.
- **discernment — unprovable-but-better: requested.** The pre-data control wave caught three shortcuts before data. Two non-author disagreements remain for the judge: the development-check chronology (CritAmendments) and the item-697 flake.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — `SKILL.md` gate registry row `cap-run` and checklist item `SKILL.md:701` (`980a16af`)
- [~] At least one end-to-end domain task executed and logged in LOG.md — LOG.md round-46 entry (`adedf671`); O1 and O2 receipts in `.ufo/waves/round-46/close/`
- [ ] Instructions executable by an agent without oral context
- [ ] No cross-domain bleed (PROVINCE.md still accurate)

## Gate

Real rejects:

- **Counters.** CtlC1PathKeyed, CtlC1Replay and CtlC2LabelKeyed showed the A1 counters could be met without the work, so those counters were rejected and re-designed.
- **SOURCES rows.** S076's reason was rejected as worded and re-worded. Sweep and ReopenRows findings were rejected as written cells and narrowed: S003, S041, S047, S053–S055, S061, S073.

## Round shape and seats

- **Shape.** Default: one v1 wave `build` of 38 seats, plus one residual call of 8 seats. Wave 1 yielded fewer than 32 distinct attack items, so there was no wave 2. The round total is 46.
- **Wave 1 role mix.** Reviewer 17 (16 source sweeps plus ReviewCounters), mutation-tester 9, scribe 5, executor 4, scout 2, connector 1, critic 1.
  - The L1 held the §3 planner seat; the planning data-walk rode the scout item ScoutPlanWalk.
  - The validator's `taskCall` was sent unchanged except for adding the `solutionSpace` field that the tool requires.
- **Residual call.** Reviewer 7, critic 1.
- **Dead seats.** None.
- **Cancelled at close (budget stop).** MutCapRun, ReviewRepairs and HarmChecks were still running; none of their reports is cited.
- **Misroot sweep.** `git status --porcelain` at the fleet root shows no kumitate-written files. ScribeRepairs wrote two `/tmp` files and removed them itself.
- **Stale-lane.** Respawn-per-round driver; no other mission of this lane is open.
- **Tool installs.** None. All pacman transactions are paused host-wide.
- **L0 questions.** None.
