FIDELITY scripts/run-omp-native-trial.mjs anchors=12 ok=0 moved=11 changed=1 gone=0

# C2 anchor re-verification — `scripts/run-omp-native-trial.mjs`

Source pin `/fast/scratch/kumitate-r35/src`, HEAD `31c465f15669f744848bd9f5d56191c5085670f7`
(verified with `git rev-parse HEAD`). Base `964f443e`. Size 4304 L -> 4321 L (+17); diff
+136/-119 across 28 `unified=0` hunks: imports, the route-grammar block, `resolveRoleChain`,
the `assertProjectionAgrees` signature, the new `assertSeatMirrorFresh`, `resolveNativeDispatchPolicy`,
`providerDomain` deletion, `resolveDomainProbePlan`, and `main()`.

Anchor inventory (ticket forms only): 1 member-section heading (`native-trial-launch.md:340`),
2 file-qualified anchors (`:319` -> `scripts/run-omp-native-trial.mjs:831`; `:343` ->
`scripts/run-omp-native-trial.mjs:3229`), 9 bare `:N` continuation anchors in that section
(`:344`-`:350`). No `scripts/run-omp-native-trial.mjs:N-M` file-qualified range anchor exists.
All eight symbols named in the section's verification line (`main`, `parseArgs`,
`planLaunchMode`, `resolveNativeDispatchPolicy`, `handOffToSightingWall`, `PROFILE`,
`PROPOSAL_WAVE_CEILING`, `die`) still exist at the pin.
All 12 land exactly on the claimed symbol at 964f443e; none lands on it at 31c465f1.
`dispatch-shapes.md:10`, `remaining-scripts-census.md:50`, `route-resolution.md:101,109`
cite the member without a line number; all still true at the pin (see below).

## Rows (one per non-ok anchor)

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 (file:line) | proposed replacement wording
--- | --- | --- | --- | --- | ---
native-trial-launch.md:319 | `scripts/run-omp-native-trial.mjs:831` | `die` emits `BLOCKED:` + exit 2 | moved (+7) | `scripts/run-omp-native-trial.mjs:838` | `All surface as \`BLOCKED: <msg>\` via \`die\` (\`scripts/run-omp-native-trial.mjs:838\`; 964f443e \`:831\`) + exit 2 — re-anchored at 31c465f1`
native-trial-launch.md:340 | heading `(4304 L)` | member size 4304 L | changed (4321 L at pin) | `scripts/run-omp-native-trial.mjs:1-4321` | `## \`scripts/run-omp-native-trial.mjs\` (4321 L; 4304 L at 964f443e) — judged-round launcher spine — re-anchored at 31c465f1`
native-trial-launch.md:343 | `scripts/run-omp-native-trial.mjs:3229` | `main` entry walks preflight -> wall handoff -> spawn -> collect/judge/seal | moved (+5) | `scripts/run-omp-native-trial.mjs:3234` | `Entry \`main\` (\`scripts/run-omp-native-trial.mjs:3234\`; 964f443e \`:3229\`) walks preflight → wall handoff → spawn → collect/judge/seal — re-anchored at 31c465f1`
native-trial-launch.md:344 | `:50` | `PROFILE` = `omp-native-v2` | moved (+6) | `scripts/run-omp-native-trial.mjs:56` | `Profile constants: \`PROFILE\` (\`:56\`; 964f443e \`:50\`) = \`omp-native-v2\` — re-anchored at 31c465f1`
native-trial-launch.md:345 | `:59` | `ADMITTED_PROFILES` | moved (+6) | `scripts/run-omp-native-trial.mjs:65` | `\`ADMITTED_PROFILES\` (\`:65\`; 964f443e \`:59\`) — re-anchored at 31c465f1`
native-trial-launch.md:345 | `:109` | `PROPOSAL_WAVE_CEILING` | moved (+6) | `scripts/run-omp-native-trial.mjs:115` | `\`PROPOSAL_WAVE_CEILING\` (\`:115\`; 964f443e \`:109\`) — re-anchored at 31c465f1`
native-trial-launch.md:346 | `:844` | `parseArgs` | moved (+7) | `scripts/run-omp-native-trial.mjs:851` | `Argv: \`parseArgs\` (\`:851\`; 964f443e \`:844\`) — re-anchored at 31c465f1`
native-trial-launch.md:346 | `:958` | `planLaunchMode` | moved (+7) | `scripts/run-omp-native-trial.mjs:965` | `launch mode: \`planLaunchMode\` (\`:965\`; 964f443e \`:958\`) from interactive/headless/wall flags — re-anchored at 31c465f1`
native-trial-launch.md:348 | `:171` | `snapshotDispatchInputs` | moved (+5) | `scripts/run-omp-native-trial.mjs:176` | `Frozen dispatch: \`snapshotDispatchInputs\` (\`:176\`; 964f443e \`:171\`) → — re-anchored at 31c465f1`
native-trial-launch.md:348 | `:646` | `resolveNativeDispatchPolicy` | moved (−7) **and behavior changed** | `scripts/run-omp-native-trial.mjs:639` | `\`resolveNativeDispatchPolicy\` (\`:639\`; 964f443e \`:646\`), now fed one preloaded \`{globalRouting}\` snapshot and one parsed seat map — re-anchored at 31c465f1`
native-trial-launch.md:349 | `:1282` | `handOffToSightingWall` | moved (+7) | `scripts/run-omp-native-trial.mjs:1289` | `Wall path: \`handOffToSightingWall\` (\`:1289\`; 964f443e \`:1282\`) — re-anchored at 31c465f1`
native-trial-launch.md:350 | `:831` | `die` (duplicate occurrence of `:319`) | moved (+7) | `scripts/run-omp-native-trial.mjs:838` | `Failures exit through local \`die\` (\`:838\`; 964f443e \`:831\`) as \`BLOCKED: …\` + process exit 2 — re-anchored at 31c465f1`

Counter note: `resolveNativeDispatchPolicy` is both moved and behaviorally changed; it is
counted under `moved` (12 = 0 ok + 11 moved + 1 changed + 0 gone), matching the sibling
`policy.mjs` report convention. The lone `changed` is the heading size.

## Behavior change carried by the diff (holds even after re-anchoring)

- **Route grammar extracted (pin 238-245, 272-297).** Launcher `parseRequestedRoute` now
  delegates to `parseRoute` from `scripts/omp-route-grammar.mjs` (module export at :88);
  the launcher-local `EFFORTS` set and the hand-written provider/model split are gone.
  `resolveRoleChain` now calls `validateChain([primary, ...fallbacks])`; an effort-less hop
  is admitted ANYWHERE (`allowEffortless: true`), not only as a terminal primary;
  `self-route`/`mixed-effort` -> `inactive`, `duplicate` -> `ambiguous`, else `malformed`.
  `bareSelector`/`requestedSelector`/probe-chain parsing all route through the same helper.
- **`resolveNativeDispatchPolicy` refactor (pin 639-824).** New optional `{globalRouting}`
  argument (pin 640); `main` preloads `loadGlobalRoutingAuthority()` once (pin 3260) and passes
  it (pin 3261). One `readGlobalSeatRouting` parse supplies `seats`/`modelRoles`/`fallbackChains`
  maps (pin 703-726); `resolveAliasRouting` -> `resolveAliasFromMaps` (pin 730);
  `resolveSeatRouting` -> `routing.seats.get` (pin 749); unknown seat now refuses
  `global-seat-missing` (pin 752). `assertProjectionAgrees(snapshot, policy, _profile)` became
  `(snapshot, policy)` (pin 438); body unchanged (retry pins still verified at pin 478-513).
- **New pre-spawn mirror gate (pin 613-636, call at 3272).** `assertSeatMirrorFresh` renders the
  seat mirror from the same fd-bound global snapshot (`renderSeatRoutingMirror`, `MIRROR_PATH`
  imported at pin 30) and refuses `mirror-drift` before wall handoff, run-dir reset, or any spawn.
  The note's ordered pipeline (steps 4->5) and failure vocabulary do NOT mention this step or
  `mirror-drift`; both need a line added if the note is re-pinned.
- **`providerDomain` relocated** to `omp-route-grammar.mjs:205` (import at pin 24-29); the local
  override map at base 2819-2831 is deleted. Mapping rule (dash -> underscore, devin ->
  devin_oauth) is unchanged; `routeTiers` hops are now parsed strictly
  (`allowEffortless: false`, pin 2910).
- No other described behavior changed: wall handoff, retirement, phase-0 probes, membrane seal,
  heartbeat, and collection/judge code are untouched by the diff (hunk set above).

## Topic-section anchors outside the counted set — PRE-EXISTING staleness (not diff-induced)

Screened all 176 bare member-file anchors in the note. 21 cite line numbers > 4304, i.e. past
the base file's EOF and past the pin's 4321 L, so they were already wrong at 964f443e:
`:4317-4349`, `:4363-4372`, `:4377`, `:4393`, `:4382-4389`, `:4400-4405`, `:4412`,
`:4419-4440`, `:4441-4460`, `:4472-4492`, `:4496-4521`, `:4523-4527`, `:4536`,
`:4529-4533`, `:4565-4578`, `:4594`, `:4614-4621`, `:4623-4645`, `:4649`, `:4673`, `:4680-4692`.

Four symbols named by the note do not exist in either revision, nor anywhere in the pinned
`scripts/` + `tests/` tree (`git grep` at 31c465f1 -> 0 hits; same at base):
`writeEpochReceipt` (`:2215-2268`), `readPredecessorDigest` (`:2279-2289`),
`sealBoundaryViaRuntime` (`:4536`, `:1904-1961`), `writeCrashStack` (`:4680-4692`).
At base the seal branch is inline in `main` (base 4151-4175 -> pin 4168-4192) calling
`writeMembraneSeal` (pin 1838, call 4170); the catch-all is base 4295-4303 -> pin 4311-4318
with `die(\`unexpected launcher failure: …\`)`, never `unexpected_error`/`writeCrashStack`.
So the note's steps 7, 27-30, the `sealBoundaryViaRuntime` section and the `writeCrashStack`
clause describe a code generation absent at both revisions.

Other topic-section anchors that were already stale at base (correct pin anchor):
`handOffToSightingWall :1357-1387` (base 1282-1312, pin 1289-1319); `called :3707`
(actual base 3377, pin 3394); `autoOpenL1Enabled :1348-1355` (base 1273-1281, pin 1280-1288);
spawn argv `:1361-1374` (base 1286-1299, pin 1293-1306); `retireWallMission :2590-2633`
(base 2367, pin 2374); `assertProjectionAgrees :506-584` (base 481-568, pin 438-525).
The ordered-pipeline call-site anchors are likewise from another generation: base call sites for
`parseArgs`/`snapshotDispatchInputs`/`resolveNativeDispatchPolicy` are 3230/3251/3252, not the
cited 3540/3564/3565. The note header (line 4) also states "4304 lines ... `main()` at :3229": both correct at
964f443e, stale at the pin (4321 L; `main` :3234). [INFERENCE] the topic sections were written
against a ~4692-line revision; no such revision was searched in the clone. This is a note defect
independent of 964f443e..31c465f1 — the parent needs a full-note re-anchor, not just the member section.

## Non-anchor citations checked (still correct at 31c465f1)

- `dispatch-shapes.md:10` — native judged round = launcher + collector, judged by
  `ufo judge-handoff --input`; both files exist at the pin.
- `remaining-scripts-census.md:50` — `scripts/run-omp-native-trial.mjs` is a live member at the pin.
- `route-resolution.md:101` — `requireBinding` with fail `missing` still present (pin 459, calls
  465/488/495/502/509); `.omp/config.yml` must carry `modelFallback:true`,
  `waitForUsageReset:false`, `usageAwareFallback:false`, `fallbackRevertPolicy:never` (pin 478-513).
- `route-resolution.md:109` — "retry projection block" still the same check; no line anchors.

## Observed vs inference

Observed: HEAD, sizes, 28-hunk set, exact symbol lines at both revisions (grep/sed), all 12 cited
lines landing on the claimed symbol at base and on unrelated lines at pin, symbol absence via
`git grep` over `scripts/` and `tests/`. [INFERENCE]: runtime effect of the mirror gate and
shared grammar (static reading only; no builds/tests per lane bounds).

## Commands run (key output)

```
git -C /fast/scratch/kumitate-r35/src rev-parse HEAD            -> 31c465f15669f744848bd9f5d56191c5085670f7
git show 964f443e:...run-omp-native-trial.mjs | wc -l           -> 4304
git show 31c465f1:...run-omp-native-trial.mjs | wc -l           -> 4321
git diff --stat 964f443e 31c465f1 -- <member>                   -> 136 insertions(+), 119 deletions(-)
git diff --unified=0 ... | grep -c '^@@'                        -> 28
grep -nE '^(export )?(function|const) ...' on both revisions    -> 50/59/109/171/646/831/844/958/1282/3229
                                                                   base; 56/65/115/176/639/838/851/965/1289/3234 pin
sed -n '<cited>p' at pin                                        -> :831 "routeFamily: ...", :3229 "};", :50 comment,
                                                                   :59 comment, :109 for-loop, :646 fail(...), :844 VALUE_FLAGS,
                                                                   :958 comment, :1282 config read, :171 text: bytes...
git grep -n 'writeEpochReceipt|readPredecessorDigest|sealBoundaryViaRuntime|writeCrashStack' 31c465f1 -- scripts tests -> 0 hits
```

## Remaining unknowns

- Which upstream revision the note's topic sections were written against (their numbers exceed
  both the base and the pin); only the member section is trustworthy at 964f443e.
- Whether `writeEpochReceipt`/`sealBoundaryViaRuntime` name a planned surface rather than a past
  one — no occurrence anywhere in the pinned tree.
- Runtime consequences of `mirror-drift` refusal and the shared route grammar: not executed.

Tooling: none installed or upgraded. Read-only: no notes, lane files, or repo state modified;
the only write is this report.
