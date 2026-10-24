# ScoutDispatcherLiveness — round 57 w1 report

Seat: ScoutDispatcherLiveness (scout, leaf). Scope: verify that the lane-mapping
clauses of `corpus/knowledge/worker-heartbeat-liveness.md` (C2 / DOCTRINE57) cite the
dispatcher heartbeat/liveness/grace surfaces accurately — `LAUNCHING_GRACE_MS`,
`MAX_LAUNCH_MISSES`, `MAX_PAUSED_RESUME_ATTEMPTS`, `repend`,
`registered_mission_missing` — against the read-only origin tree
`/home/vgpnk/Projects/ufo-fsd-alpha`.

Evidence captured under `.ufo/waves/round-57/build/ScoutDispatcherLiveness/`:
`revisions.txt`, `dispatcher-surface-grep-head.txt`,
`dispatcher-surface-grep-pin.txt`, `surface-grep-diff.txt`, `entry-vs-lane.txt`.

## Observed facts (origin tree)

- Pin `31c465f1` (entry §Lane mapping header) resolves to
  `31c465f15669f744848bd9f5d56191c5085670f7` (2026-10-20) and is an ancestor of
  origin HEAD `093edb979559443bca65245fbdd94ac3621446fb` (2026-10-22).
- `git diff 31c465f1..HEAD -- scripts/fleet-dispatcher.mjs`: 5 insertions / 5
  deletions, all inside `buildDispatchBindingBlock` prompt strings (wave-band
  numbers). Zero diff lines touch any of the five surface names — the surface
  grep output is byte-identical at pin and HEAD
  (`surface-grep-diff.txt` empty; `diff` exit 0). The pin is stale-but-exact.
- `fleet-dispatcher.mjs` (9224 lines) surface inventory, identical at pin and HEAD:
  - `LAUNCHING_GRACE_MS = 120_000` (line 123): reconcile treats a `launching`
    row with no mission and `|now - claimedAt| >= LAUNCHING_GRACE_MS` as a burned
    claim → `recordLaunchMiss` (lines 6765–6780). Younger rows are left
    untouched — pull-based inspection of queue state, not a worker ping.
  - `MAX_LAUNCH_MISSES = 8` (line 117): `recordLaunchMiss` (6288–6308) re-pends
    the task to `pending` with `launch_not_registered` while
    `misses <= 8`; at 9 it blocks `launch_registration_exhausted`. The comment
    (114–116) says the bound exists because an unbounded re-pend loop "burns one
    dispatch per cycle forever".
  - `registered_mission_missing`: set at line 6791 when a `running` task's
    mission row vanishes (`!mission && state === "running"`,
    `runningWithoutDispatch !== true`); `retryable: false`.
  - Repend predicate `blocker.code === "registered_mission_missing" &&
    isSafeInteger(lastDispatch.launcherExit) && launcherExit !== 0` appears
    verbatim three times: reconcile (6829–6839 → `recordLaunchMiss`),
    `liveChainIndex` (3573–3575), dependency-satisfiability (7071–7073,
    repeated 7756–7758). Comments: "the only blocked row reconcile can still
    re-pend is a registered_mission_missing with a nonzero launcher exit".
  - `rependTask(runId)` (6316–6397): operator/watchdog-initiated manual re-pend;
    refuses on terminal state, missing task, unreadable/invalid manifest,
    `mission_live`, `mission_stale_registered`; on success resets
    `launchMisses = 0` and `resumeAttempts = 0`. Exposed as CLI verb
    `repend --run <gq…>` (8987–8994).
  - `MAX_PAUSED_RESUME_ATTEMPTS = 8` (line 113): consumed at 7632–7641 —
    a resumable task's `resumeAttempts` exceeding 8 blocks it
    `resume_budget_exhausted`. Part of the same pull-based liveness family;
    `rependTask` explicitly resets this budget (6387–6391 comment: the
    paused-resume budget "must not carry over").
  - `isLiveMission` (1460–1462) is pure manifest-status inspection
    (`starting|running`) — confirms the pull model end to end; there is no
    pushed worker heartbeat anywhere in the dispatcher.

## Verdict on the lane-mapping clause (entry lines 28–31)

- Clause line 30 — "repend fires only on `registered_mission_missing` with a
  nonzero launcher exit, and `MAX_LAUNCH_MISSES` bounds false-positive
  reclaims" — **corroborated** for the dispatcher's automatic repend path
  (reconcile 6829–6839 + identical predicates in `liveChainIndex` and dep
  satisfaction). Precision caveat (minor, not a falsification): the clause
  conflates "repend" with the auto path; the `repend` CLI verb /
  `ufo-watchdog-repend.mjs` repends any eligible non-terminal blocked row, and
  `MAX_LAUNCH_MISSES` bounds the re-pend loop itself (dispatch churn), not the
  downstream reclaim — "bounds false-positive reclaims" is a fair gloss, not a
  literal code comment.
- Clause line 31 — "the 120 s `LAUNCHING_GRACE_MS` window plus repend misses is
  the pull-based analog of Kafka's session expiry" — **corroborated**. 120 s =
  `120_000` ms exactly; within-grace `launching` rows are skipped, post-grace
  they burn a launch miss that re-pends. The clause is correctly labelled
  `[INFERENCE]` (it is a design analogy, not a source claim).
- **Coverage gap (uncited surface)**: `MAX_PAUSED_RESUME_ATTEMPTS` exists in the
  same liveness family and is directly coupled to `rependTask` (which resets
  `resumeAttempts`), but neither lane-mapping clause cites it. The clause is
  accurate but incomplete against this seat's assigned surface list — coverage
  could add one phrase; absence does not falsify any stated claim.
- `repend` / `registered_mission_missing` naming: all names spelled exactly as
  in source; no invented surfaces.

## E2-adjacent corroboration (bonus, not this seat's verdict)

- 15 distinct `receipt:` bindings in the entry; all resolve to git-tracked
  files in the lane with matching sha256 (`entry-vs-lane.txt`). The two cited
  for the lane-mapping clauses (`ScoutQueue/repend-signals.txt`,
  `ScoutQueue/grace-window.txt`) match `a9374a…` / `df6754…` respectively and
  their bodies describe the same surfaces verified above.

## Confidence and remaining unknowns

- Confidence: HIGH on accuracy of cited surfaces (verified at pin rev and HEAD,
  byte-identical greps, three-site predicate consistency). MEDIUM on the
  "repend fires only" phrasing being read as covering the manual CLI path —
  the watchdog seam's trigger side (`attemptRepend` in
  `ufo-stale-watchdog.mjs`) has no in-tree production caller found by grep;
  `ufo-watchdog-repend.mjs` decides rows on blocked-state+age+cap, not on the
  nonzero-exit predicate.
- Unresolved: whether a future lane-mapping edit should cite
  `MAX_PAUSED_RESUME_ATTEMPTS` (judgment for the entry's owner; flagged only).

No lane production files, SCORECARD, LOG, SKILL, PROVINCE, corpus, or git/jj
state were modified. No installs performed (none needed; pacman pause honored).
