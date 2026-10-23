# Round 46 — repairs first, one operability claim judged only by counters

Lane base `2b2bf7bb` (round-45 non-author spot-check; round 45 `unprovable` on K3′, S073). L1 `KumitateR46`,
dispatched 2026-10-23 07:59Z, attempt 1. Plan and its three pre-data amendments: `.ufo/waves/round-46/plan.md`
(freeze `7cd1fa37`, A1 `516977af`, A2 `3b184d3a`, A3 `cacfab32`). Wave receipts: `.ufo/waves/round-46/build/`.

## Claim

**C1 — operability (lowest non-retired axis, 9): the lane's selftest Git writers and its child processes get
enforced bounds.** Surface: the `--selftest` paths of `scripts/cite-check.mjs`, `scripts/proxy-check.mjs`,
`scripts/round-gate.mjs`, and the new runner `scripts/cap-run.mjs`. Two obligations, both required (plan § A2):
O1 `GITENV_CANARY held=3/3` (counter `probe/gitenv-canary.sh`), O2 `CAPRUN_PROBE held=6/6` (counter
`probe/caprun-probe.mjs`, A3). Before: O1 0/3, O2 0/6 at `2b2bf7bb` (`probe/receipts/c1-base.txt`, `c2-base.txt`).
Capability row `cap-run` enters `## Capabilities` only if O2 is 6/6. Sourced on S078 (opened this round: the Node
`child_process` `env` default) and S079 (opened this round: cgroup v2 `memory.max`), with S065, S069, S072, S077.
The claim makes no prose claim: no knowledge entry is judged.

## Gate

New rows, each opened this round by a seat and re-checked by the L1 against the seat's fetched bytes:

| id | URL | accessed | quote (≤25 words) and locator | decision |
|---|---|---|---|---|
| S078 | https://nodejs.org/docs/v24.21.0/api/child_process.html | 2026-10-23 | "Environment key-value pairs. Default: process.env." (§ child_process.spawn(), HTML line 983; also § spawnSync() line 1598; 5 words; second channel `doc/api/child_process.md` at tag v24.21.0 lines 680 and 1368) | admit A, mined (ScribeS078Node) |
| S079 | https://raw.githubusercontent.com/torvalds/linux/v7.2/Documentation/admin-guide/cgroup-v2.rst | 2026-10-23 | "If a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup." (`memory.max`, lines 1381-1383, 20 words) | admit A, mined (ScribeS079Cgroup) |

**Anti-loop sweep (orchestrator order).** Sixteen non-author reviewer seats (`build/Sweep*.md`) re-opened all 77 rows
S001–S077 at `516977af` against their sources: quotes, pins, `teaches` against the anchor locators, reject reasons.
Rows found clean: 66. Defects: S003, S041, S047, S053, S054, S055, S061 (`teaches` or scope beyond the locators),
S004, S013, S051 (pin or capture drift), S052, S076 (reject reason wrong); ScribeRepairs adds S073 (`only` not in the
located bytes; SweepS071S077 ruled S073 holds — the disagreement is resolved toward the narrower cell).

### Row log (old → new)

- S003 teaches: "…, first-wins by exact name, and recursive filesystem roots" → clause removed (no antecedent).
- S004 anchor: + round-46 re-run `omp/18.12.6`; teaches dated "on 2026-10-19". Status unchanged (`mined`).
- S013 anchor: + round-46 re-open (Last-Modified 2026-10-23 08:04:12 GMT, sha256 `05a1e7d1…`). Status unchanged.
- S041 anchor: lines 55 and 196 → 55, 196 and 201.
- S047 scope: "(not the MSI aggregate)" removed; anchor repo `infection/site` → `infection/infection.github.io`.
- S051 anchor: + round-46 sha256 `814548b7…086f2`; "bullet" → "sentence". Status unchanged (`rejected`).
- S052 reason: "its two answers disagree on the remedy" → "its two answers differ on the diagnosis".
- S053 anchor: 952-991 → 952-1006.
- S054 teaches: "grounds the history.db/agent.db corrupt chains at 0600" → "the quarantine helper for any dbPath;
  which stores call it is not in this file".
- S055 anchor: 590-601 → 580-601; teaches: "agent.db ceiling 0600 and the agent.db.corrupt-* family" → the
  credential store's dbPath (default getAgentDbPath()) is set to 0600 and opened with corruption recovery.
- S061 teaches: "an operator pre-edit copy" → "an orchestrator pre-edit copy, operator-authorized".
- S073 teaches: "sets the size of V8's old memory section only" → "sets the max memory size of V8's old memory section".
- S076 reason: "the versioned 2.56.0 URL is a redirect to 2.49.0 text, not manual text for the host version" →
  "redirect wrapper, no manual text" (routed D3); used-by + `corpus/lessons/round-46.md`.
- S078, S079: new rows (`mined`; used-by the three selftest scripts / `scripts/cap-run.mjs` and this lesson).

## Controls (adversarial wave before data)

Nine mutation-tester seats built controls and scored them with the counters as frozen at `516977af`
(`build/Ctl*.md`). Three met a target, so the counters were re-designed before data (plan § A2, § A3):
CtlC1PathKeyed (a scrub keyed on the counter's scratch root, 3/3), CtlC1Replay (stored PASS lines plus dummy `git`
launches, 3/3), CtlC2LabelKeyed (a runner that never launches the child and fabricates its outputs, 6/6 three times).
CritClaimShape's objections were taken: C1 and C2 became one operability claim with two obligations; the plan's
"no variable set" sentence became the counter's condition; K1/K6 gained mechanism identity, then (A3) every case is
observed from outside the runner. Every control commit was re-scored by the L1 under the A2/A3 counters before any
candidate was measured (`probe/receipts/controls-A3.txt`).

## Routed repairs (round-45 spot-check § 5)

- **D1** — erratum appended to `.ufo/waves/round-45/plan.md` (E1–E6 rest on an unresolvable receipt; 46 files).
- **D2** — QUALITY Q33 (teaches vs every locator; `quality/q33-locator-coverage.sh`, shown to fail on S073 at
  `6b2a4517`) and the frozen-checklist erratum rule.
- **D3** — S076 reason re-worded.
- **D4** — QUALITY Q34 (guard byte-identical to its tested receipt; `quality/q34-guard-bytecmp.sh`, shown to fail on X4).
- **S073** — cell narrowed (row log). **Q32** — README row for `lessons/round-45-verifier-spotcheck.md`.
- **Pre-registered r46 items** — selftest Git writers scrub their repository variables (O1); a runner with memory
  caps (O2). Routing the 24 child sites through it is **not** done this round: ScoutChildSites
  (`build/ScoutChildSites.md`) found 0 of 24 routable without a behaviour change (each parent asserts an exit code,
  stderr or spawn error the runner's interface does not promise), and every such file is pinned. Pre-registered for
  round 47 with the runner in place.

## Mistakes

1. **class:** a `teaches` cell that says more than its locators, checked only on the rows a claim listed.
   **evidence:** round 45 rejected on S073 (`lessons/round-45-verifier-spotcheck.md:61-73`); this round's sweep found
   the same class in seven more committed rows (S003, S041, S047, S053, S054, S055, S061; `build/Sweep*.md`).
   **captured-by:** none — K3′ was a per-claim literal check and no registry-wide criterion existed.
   **fix:** Q33 plus the all-row non-author re-open. Shown able to fail: `q33-locator-coverage.sh <lane> 6b2a4517
   corpus/lessons/round-45.md` → `Q33 UNCOVERED S073 anchor-locators-checked=1/4`, exit 1 (ExecQualityFailCmds).
2. **class:** a counter that observes the thing under test through that thing's own outputs. **evidence:** this
   round's A1 counters were met by three controls (CtlC1PathKeyed, CtlC1Replay, CtlC2LabelKeyed). **captured-by:**
   the §9 pre-data control wave — it worked: the shortcuts were found before data. **fix:** A2/A3 — two hostile runs
   and a fault run for O1; for O2, observation of the live child from `/proc` outside the runner. Shown able to fail:
   CtlC2LabelKeyed's commit `7af3d978` reads 6/6 under A1 and 0/6 under A3 (`probe/receipts/calibration.txt`).

## Verdict at close (author reading; the non-author closure rules)

- **O1** `GITENV_CANARY held=3/3` and **O2** `CAPRUN_PROBE held=6/6` at `980a16af` (`close/o1-c1.txt`, `o2-c1.txt`);
  ReRunCounters re-derived both (O2 three times, random M/B) and base O1 0/3. MutC1Scrub: 5/5 weakened scrubs killed
  (N5 path-keyed caught by run B). ReviewC1Diff: sound (two low findings). ReopenRows: 13/15 rows hold; S047 and S055
  narrowed after it. CritAmendments: three objections, appended as a plan erratum.
- **Harm check open.** `proxy-check --strict` MATCH; census exit 0; selftests 76/122/61 and cap-run 10/10 PASS. But
  checklist item `SKILL.md:697` (gate-mutants battery) read exit 2 in 3 of 4 `surface-probe --checklists` runs at
  `980a16af` (load 19–25; `close/checklists*.txt`), while the same command run directly, through the same harness
  alone, and in an item-by-item replay read `GATE_MUTANTS: CLEAN … killed=43` (`close/gate-mutants-direct.txt`). At
  open it passed once at lower load. Cause not found; it is recorded as a possible operability harm, so the author
  reading is **not admitted as harm-free**: C1 `improved` on its counters, harm unresolved.
- Seats MutCapRun, ReviewRepairs and HarmChecks were cancelled at close (budget stop); no report is cited from them.
