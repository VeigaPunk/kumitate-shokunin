# Controls changed after the freeze commit b38a2065 (disclosed, ratchet under plan.md C1)

Wave-1 seats scored the frozen controls and found defects (reports in `.ufo/waves/round-63/w1/`):

1. `controls/inline/forged-no-sessions` lost its empty `sessions/` directory in `git archive`, so frozen check I3 could not pass at any revision
   (K63CriticFreezeIntegrity, K63ExecCounterReplay, K63ReviewProbeC1, K63MutateProbes, K63ScribeScorecard). Repair: a tracked `sessions/orch/.keep` in every case.
2. The committed `honest` case was a five-row stub transcript — the cheapest forgery (K63ExecGateForgery-1/-2). The gate gained five shape arms and the honest case
   is now a harness-shaped transcript; `probe/make-inline-controls.mjs` was patched accordingly (`make-inline-controls.patch`).
3. Added cases (monotone, per the plan's ratchet clause): 5 from K63ReviewGateCode (lane-regex, wildcard lane, empty context, copied transcripts of another lane,
   seat-name traversal), 13 forgery/boundary cases from K63ExecGateForgery, 12 from K63MutateInlineGate (`mut-*`; its 3 honest-shape cases and the rev-mode case were not taken). Case count 14 -> 75 (wave 2 added 31: 18 from K63R2MutateGateLogReports, 13 from K63R2MutateGateBinding; one needing a lane directory name was not taken); the I3 floor (10) and the
   rule text are unchanged.
4. `probe/inline63-probe.mjs`, `probe/topology63-probe.mjs` and the C2 controls are NOT changed. Known counter holes found by wave 1 are reported, not patched
   (K63CriticC1Predicate: a stub tool reads HELD; K63ReviewProbeC2: loopback-hosted rows pass T5).

## Post-freeze gate changes that are NOT pure strengthening (declared; K63R2ReviewFreezeDelta, K63R2ReviewGateFinal)

- `finished()`: a seat that yielded and has no `session_exit` row is finished (the first draft counted it dead; wave 1 had 6 of 40 such seats because the orchestrator settled the wave before the harness wrote their exit rows — `w2/K63R2ExecDeadSeatReport.md`). This relaxes one arm; selftest case `yielded-without-exit-row-is-finished` locks it and `aborted-session-exit-not-finished` keeps the abnormal-exit case.
- Task binding is `endsWith(tail 120 of the task)` + context head + seat marker (the harness rewrites paths and expands skill lines inside a task, so full-task equality read honest kengaku r35 as foreign).
- The fourteen frozen control fixtures were regenerated (harness-shaped honest transcripts, lane name `kumitate`, `.keep`); the `honest` case is no longer the five-row stub.
- Strengthenings: five shape arms, lane/name/context validation, lane-vs-directory and context-names-lane/round checks, rev resolved once, corrupt-transcript id, CRLF log, done-twice, exact-stem-first candidates, two finished writers = AMBIGUOUS.
