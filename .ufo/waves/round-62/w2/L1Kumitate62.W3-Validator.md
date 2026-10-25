# W3 Validator — round-62 w2 dispatch payload

## Finding

The available evidence supports that the 40-task payload was prepared through the wave validator's dispatch-plan contract, and that `taskCall` was passed unchanged in the bridge's relevant fields. It does **not** independently prove that this particular payload was spec-validated: `w2-dispatch.json` contains only `context` and `tasks`, not a validator run receipt, spec digest, or validation output. No round-62 plan was frozen, per the dispatch file's own context and the round-61/62 premise documented in `w2/CriticC1.md:9-23`; therefore this is not a claim-verification judgment.

## Evidence

- Exact payload: `.ufo/waves/round-62/w2-dispatch.json`. `jq '{taskCount:(.tasks|length),names:[.tasks[].name]}'` reports `taskCount: 40` and names `CritControlC1Nonempty` through `Audit24`; the file has top-level `context` plus `tasks` (not a `taskCall` property).
- Round prompt protocol: `/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-62.md:201-207` requires validating each wave under policy, then dispatching one `task` call carrying validator `taskCall` (`context` + `tasks`) unchanged. Its run-6 bridge example loads JSON and sends `tc['context']` and `tc['tasks']` directly to `tool.task`, except that it constructs task dicts with an added/replaced `solutionSpace` field.
- Validator implementation: `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs:798-802` describes `planSwarmWave` as pure spec validation and one batch; `:1441-1471` shows `planToDispatchPayload` producing `taskCall` as `{context: plan.context, tasks: spawns}` (or `null`). This establishes the expected mechanism, not that it ran for this payload.
- Bridge transformation: the R62 prompt example adds `solutionSpace:'one wave item, spec in task text'` to each task via `{...t,...}`. Thus task objects were not byte-for-byte unchanged if that bridge was used; `context` and task list are passed as the bridge constructs them, but `tasks` values may be modified. The dispatch JSON itself cannot establish what was ultimately supplied to `task`.
- No validation artifact is included in the dispatch JSON: inspection of its complete JSON shape shows only `context` and `tasks`; there is no `spec`, `plan`, validation result, or digest. The protocol-required validator log/spec file was not found in the inspected round-62 artifact listing.

## Determination

Do not state as established that the 40-task dispatch was spec-validated or that `taskCall` was passed unchanged. The protocol and source show how validation and payload emission should work; the stored 40-item dispatch payload is consistent with that shape, but lacks provenance linking it to a validator output or the actual `tool.task` invocation. Exact evidence pointer: `.ufo/waves/round-62/w2-dispatch.json`; protocol pointer above.