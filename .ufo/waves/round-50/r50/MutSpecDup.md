# MutSpecDup — wave-spec / taskCall mutation probe

Seat: MutSpecDup (mutation-tester), kumitate r50. Probe date 2026-10-23.
Axes touched: operability (validator invocation reproducibility), coverage (which schema checks kill vs survive).

Attacked: the wave validator `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`
(commit `093edb979559443bca65245fbdd94ac3621446fb`, sha256 `1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a`)
run against the committed r49 spec, the committed r50 spec, and six mutations of the r50 spec.
Environment: node v24.21.0. No tools installed. Scratch dir `/tmp/mutspecdup.7ySj3w/`
(mutant specs in `mut/`), lane repo read-only, only `plan` was invoked (never `run`: `run`
persists a member registry).

Round-band invocation (used for every run below unless stated):

```
export UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json
export UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1
cd /home/vgpnk/Projects/ufo-fsd-alpha
node scripts/ufo-swarm-wave.mjs plan --spec <spec>
```

Loaded policy snapshot (`policy` in the emitted plan):
`{"source":"config","maxLanes":256,"minLanes":16,"waveMinLanes":64,"waveMaxLanes":128,"declaredMaxLanes":null,"hardCeiling":256,"rampBatchSize":5,"rampIntervalMs":700,"globalRunnerCeiling":1056}`
— identical to the `policy` block inside the committed `.ufo/waves/round-50/r50-plan.json`.
(The validator's default `ufo-fsd-alpha/config/ufo.json` is `minLanes=32, waveMin=32, waveMax=256`;
both specs still exit 0 there, differing only in the `policy` bytes.)

## 1. Validator on the two committed specs — exit 0, r50 reproduced byte-for-byte

```
$ node scripts/ufo-swarm-wave.mjs plan --spec .../round-49/r49-spec.json  > r49-plan-v2policy.json
exit=0
$ node scripts/ufo-swarm-wave.mjs plan --spec .../round-50/r50-spec.json  > r50-plan-v2policy.json
exit=0
$ sha256sum r50-plan-v2policy.json  .../round-50/r50-plan.json
0113c5439d3c3a078d851a59cac1873d5d4ffdb7ff57c1337525a1665a01f593  r50-plan-v2policy.json
0113c5439d3c3a078d851a59cac1873d5d4ffdb7ff57c1337525a1665a01f593  .../round-50/r50-plan.json
$ sha256sum r49-plan-v2policy.json
f824a92b0a4f22dec3460c016bcbc86b3cdf110600fa1d3c1d9c0973cb608b9a  r49-plan-v2policy.json
```

The committed `r50-plan.json` is the validator's own output for the committed spec under the
round's policy (byte-identical, not merely canonical-equal). r49 emitted `schema=ufo-swarm-wave-v1`,
`counts={spawn:64,resume:0,total:64}`, exit 0; r50 the same. No stderr on either.

Detector re-run on the "restored" (untouched lane) bytes after the mutation battery:
exit 0, output sha `0113c543…` again (identical).

## 2. Emitted taskCall shape diff

`planToDispatchPayload(plan).taskCall` (the exact field `run` emits; imported in-process, no registry write):

| artifact | top-level | keys | context | tasks | task keys |
|---|---|---|---|---|---|
| r49 spec → validator | object | `context`,`tasks` | 2 660 B, sha `b7a1f91745ac577d1f573ce5c290c8f44225db0953460e46f5ef6904d0ff4c15` | 64 | `name`,`agent`,`task` |
| r49 committed `r49-taskcall.json` | **array** | — | **absent** | 64 | `name`,`agent`,`task` |
| r50 spec → validator | object | `context`,`tasks` | 30 662 B, sha `f979666ae1ad0f201e9ef74e01a652dff0190b3a88df62670d7e57a76b6c314b` | 64 | `name`,`agent`,`task` |
| r50 committed `r50-taskcall.json` | object | `context`,`tasks` | same sha `f979666a…` | 64 | `name`,`agent`,`task` |

Byte receipts:

```
$ sha256sum r49-emitted-taskcall.json          # stringify(indent 1)+"\n"
252c7f8df105805889b761fa31111ed8626ef904e788c035b148d86f5df524c9
$ sha256sum .../round-49/r49-taskcall.json
f32fa392f4ffec26b4856abfd97c1b3dae4a580d76b63622503ff31c5ed9d2b3
$ node scripts/ufo-swarm-wave.mjs plan --emit-tasks --spec .../r49-spec.json | sha256sum
f32fa392f4ffec26b4856abfd97c1b3dae4a580d76b63622503ff31c5ed9d2b3   # committed == --emit-tasks output
$ cmp -s <(jq -S . r49-committed.json) <(jq -S '.tasks' r49-emitted-taskcall.json) && echo R49_TASKS_EQUAL
R49_TASKS_EQUAL
$ sha256sum r50-emitted-taskcall.json .../round-50/r50-taskcall.json
19b0381bbbd7dad6428c9b825b60ef5e98c3f6588e2e5d65235d84c6e0ee7815  r50-emitted-taskcall.json
19b0381bbbd7dad6428c9b825b60ef5e98c3f6588e2e5d65235d84c6e0ee7815  .../round-50/r50-taskcall.json
$ cmp -s <(jq -S '.taskCall' .../r50-dispatch.json) <(jq -S . .../r50-taskcall.json) && echo DISPATCH_TASKCALL_EQUAL
DISPATCH_TASKCALL_EQUAL
```

Both plans carry `compaction={"applied":false,"reason":"template_invocation",...}`, which is why
`plan --emit-tasks` returns a bare array for both. Root cause of R50-8 confirmed: the r49 file is
*exactly* the bare `--emit-tasks` emission, so the 2 660-byte shared context stayed in the spec
file; the `{context,tasks}` wrapper only comes from `run`/`planToDispatchPayload` (or a hoisted plan).
The r50 file is *exactly* that wrapper: byte-equal to the validator emission, and to `dispatch.taskCall`.

Neither committed artifact can be fed back to the validator as a spec:

```
$ node scripts/ufo-swarm-wave.mjs plan --spec .../round-49/r49-taskcall.json
exit=1  {"schema":"ufo-swarm-wave-error-v1","code":"invalid_spec","message":"spec must be a JSON object"}
$ node scripts/ufo-swarm-wave.mjs plan --spec .../round-50/r50-taskcall.json
exit=1  {"schema":"ufo-swarm-wave-error-v1","code":"invalid_spec","message":"unknown spec key \"tasks\""}
```

The validator consumes *specs*; it never validates a committed taskCall file. "The r50 file is
validated" therefore means: its bytes are the validator's own taskCall bytes for the committed
r50 spec under the round policy. That is proven above (`19b0381b…`).

## 3. r50 spec mutations (all under the v2 policy, 64 lanes stay in band)

| # | mutation | mutant sha256 | exit | error line | verdict |
|---|---|---|---|---|---|
| m1 | `del .items[0].axes` | `a24ec8f29550c6a0b60c45d8b75cc5687fcbe447e8865a71ccc8cce9db796edb` | **0** | — | **SURVIVED** |
| m2 | `del .context` | `b6fa32481ddc88676fc5ea9acc9daf02b4bb603f89b2fc60613acc6d6e764064` | **0** | — | **SURVIVED** |
| m3 | `.items[0].name = "scoutGuardSweep"` | `a6302026b6ea30bdb060820db969cd54592c8fe200027a33b645674654080b3c` | **1** | `{"schema":"ufo-swarm-wave-error-v1","code":"invalid_name","message":"items[0].name must be CamelCase, 2-32 chars (/^[A-Z][A-Za-z0-9]{1,31}$/u)"}` | **KILLED** |
| m4 | `.items[0].axes = []` (extra) | `e430093847bde82133509827acf5a354fa85075e1f1046111025c2f7b5c76e1e` | **1** | `{"code":"invalid_spec","message":"items[0].axes must be an array of 1..8 axis names"}` | **KILLED** |
| m5 | `del .axes` + `del .items[].axes` (extra) | `77de50fd0ab7b01c42d841ac4645b5bd04367173bbbe7df6c5b05d1b28f61a2e` | **0** | — | **SURVIVED** |
| m6 | `del .items[0].role` (extra) | `caa1ea719d65e3a5546bdf38cf2bbec0deebb3d479b70d65584e6e66df8e19bc` | **1** | `{"code":"role_required","message":"items[0] is a spawn lane and requires an explicit taxonomy role"}` | **KILLED** |

Observed semantics behind the survivors:

- **m1** exits 0 and the emitted plan is **byte-identical to pristine** (`0113c543…`). All 64 items
  declare `axes:["operability","coverage"]`, exactly the spec default (`0` items differ), so deleting
  one item's axes merely falls back to the default (`meta.axes ?? specMeta.axes`). `Judged on:
  operability, coverage` remains on every task. The assigned expectation "the validator refuses"
  is **false** here, but the mutation is semantically null for this spec — not a validator defect.
  What the validator does *not* enforce is the presence of per-item axes (they are documented
  optional overrides).
- **m2** exits 0; the emitted `context` becomes `DEFAULT_WAVE_CONTEXT` (299 B,
  `"# Goal\nWave member: execute your lane task..."`, zero occurrences of `Seat assignment catalogue`),
  while all 64 task texts stay byte-identical to pristine. This is the real coverage finding: the
  r50 seat prompts say "read … the block headed … in the shared context", so a context-less spec
  validates into a silently unusable wave. The validator's documented contract allows it
  (contextless specs default to the transport skeleton, nc5-swarm r06). The committed r50 file is
  safe only because its context sha `f979666a…` equals the spec's context.
- **m5** (extra, the sharpest hole) exits 0 with **zero** `Judged on:` lines across all 64 tasks —
  a wave can be emitted with no axis/milestone binding at all. The committed r50 taskcall does carry
  the binding on 64/64 tasks (verified), but nothing committed checks that property; the validator
  cannot be used as the do-nothing control for "lanes are judged on the round axes".
- **m3/m4/m6** are killed loudly and specifically; the name regex, empty-axes and role checks are
  real, not vacuous.

## 4. Verdict

- Assigned trio: **1 killed / 3 (m3), 2 survived / 3 (m1, m2)**. The validator refuses only the
  lowerCamel name mutation; the other two are schema-legal deletions, so "confirm the validator
  refuses each" cannot be asserted.
- R50-8 evidence: the committed r50 taskCall is the validator's own `{context,tasks}` emission
  byte-for-byte (`19b0381b…`) and its plan is the validator's own plan (`0113c543…`) — far stronger
  than "shape looks right". The r49 committed file was the `--emit-tasks` bare array (`f32fa392…`,
  no context), which is exactly the defect the round repairs.
- Residual gaps to record, not to fix here: (i) no committed check enforces per-item `axes`
  presence or any axis binding at all (m1/m5); (ii) a spec without `context` is accepted and its
  taskCall's context is a generic 299-byte skeleton (m2); (iii) no CLI validates an existing
  taskCall file — only byte-identity to the emitted taskCall proves it.
- Do-nothing control: the same validator on the same specs at the same policy produced exit 0 and
  the committed bytes; the mutants were the only changed input, and each mutant's output was
  inspected (not merely its exit code) where the mutation survived.

## 5. Restoration / cleanliness

- Lane files were never written by this probe (all mutant files under `/tmp/mutspecdup.7ySj3w/`;
  the only lane write is this report). Hashes before and after the probe are identical:
  `r50-spec.json ef10830b…`, `r50-plan.json 0113c543…`, `r50-taskcall.json 19b0381b…`,
  `r49-spec.json 6ead6c1a…`, `r49-taskcall.json f32fa392…`.
- No git/jj mutation, no `run` subcommand (no registry persisted), no subagents, no installs.
- Scratch receipts retained at `/tmp/mutspecdup.7ySj3w/` (`r49-plan-v2policy.json`,
  `r50-plan-v2policy.json`, `r50-emitted-taskcall.json`, `r49-emitted-taskcall.json`, `mut/*`).
