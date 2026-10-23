# ScoutRetry — r49 bare taskCall vs r50 shape, and jj-lane push state

Read-only. No lane edits. No `run` (it calls `persistWaveRegistry` and writes). No tools installed. Reproduction workspace: `/tmp/scoutretry.5ja9`. Validator: `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`. Policy env: `UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json`, `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`, `UFO_PROJECT_ROOT=/home/vgpnk/Projects/ufo-fsd-alpha`.

Confidence: high on the emit branch, the byte match, and the `state` formula. One limit below.

## Why r49's committed file is a bare array

`r49-spec.json` keys are `wave, milestone, axes, reportDir, context, items`. It has `context` (2660 bytes) and 64 items. It has no `template` and no `hoist`.

`planSwarmWave` only hoists when `template !== null` (`ufo-swarm-wave.mjs:1172`). With no template the compaction object stays the initializer `{applied:false, mechanism:null, reason:null, savedBytes:0, ...}` (`:1171`). Reproduced plan: `counts={spawn:64,resume:0,total:64}`, `policy.source=config`, `waveMin=64`, `waveMax=128`, `plan.context === spec.context`.

`plan --emit-tasks` does not emit `planToDispatchPayload`'s `taskCall`. The header says plan emits "only plan.tasks with --emit-tasks" (`:49-50`). The branch (`:1820-1827`) wraps `{context, tasks}` only when `plan.compaction.applied === true`; otherwise it emits `plan.tasks`, which the comment calls "the historical bare-tasks array". That wrap exists so a hoisted template is not stripped out of every lane. r49 never hoisted, so the flag drops `context` and prints the 64 task objects.

Reproduced command (stdout was the scratch file, not the lane):

```
node ~/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs plan \
  --spec .ufo/waves/round-49/r49-spec.json --emit-tasks
```

| document | shape | sha256 |
|---|---|---|
| `plan --emit-tasks` | `array[64]` of `{name,agent,task}` | `f32fa392f4ffec26b4856abfd97c1b3dae4a580d76b63622503ff31c5ed9d2b3` |
| committed `.ufo/waves/round-49/r49-taskcall.json` | `array[64]`, deep-equal to `plan.tasks` | same `f32fa392…d2b3` (194029 bytes) |
| `planToDispatchPayload(plan).taskCall` | `{context, tasks}` 64 tasks, context = spec context | different (197378 bytes of 2-space JSON) |

So the committed file is exactly today's `--emit-tasks` / `JSON.stringify(plan.tasks, null, 2)+\n` bytes, not the dispatch `taskCall`. Those two producers are the same bytes; the file does not show which one was saved. It is not a hand-shortened array: index 0 is `ScoutMountinfoFields` and all 64 entries deep-equal `plan.tasks`.

The report/spot-check mismatch is that split. `corpus/lessons/round-49-verifier-spotcheck.md:146-149` says the wave was dispatched inline and the report described a `context`+`tasks` taskCall while the committed file is a bare 64-array and the context lives in `r49-spec.json`. `planToDispatchPayload` (`:1282-1308`) always sets `taskCall` to `{ context: plan.context, tasks: spawns }` when there is at least one spawn, compaction or not. `run` emits that object nested inside the dispatch envelope (`schema, wave, policy, counts, registry, compaction, taskCall, resumeSends, note`), not as the whole stdout. Lane addendum (`scripts/hyaku/lane-addendum.md:59-60`) says to dispatch that `taskCall` (`context` + `tasks`) unchanged. R50-8 (`plan.md:28-29`) is this gap.

## Correct shape for r50's committed taskCall

Commit the object `planToDispatchPayload(plan).taskCall`, not the dispatch envelope and not `--emit-tasks`:

```json
{
  "context": "<plan.context, byte-identical to r50-spec.json context>",
  "tasks": [ { "name": "...", "agent": "...", "task": "..." } ]
}
```

64 spawn entries, keys only `name|agent|task`, `resumeSends` empty so every plan task is in `taskCall.tasks`.

r50 does **not** get this object from `--emit-tasks`. `r50-spec.json` has a `template` (starts `/skill:godspeed`, contains `{{item}}`), but hoist refuses a template that already opens with the invocation (`opensWithGodspeedInvocation`, `:166-168`; reason `template_invocation` at `:1174-1175`). Reproduced compaction: `{"applied":false,"mechanism":null,"reason":"template_invocation",...}`. Therefore `plan --emit-tasks` on the r50 spec is again a bare `array[64]`, sha256 `ede9939f697cb25f2c87636fd01a2ac598a54fba5f839b535307a40121cbdec5` (89499 bytes). Committing that file repeats R50-8. The dropped context is the 30662-byte catalogue the task texts tell the seat to read.

The working copy `.ufo/waves/round-50/r50-taskcall.json` is already the right object: keys `context,tasks`, `context` equals `plan.context`, `tasks` deep-equal `plan.tasks` / `taskCall.tasks`. It is 1-space JSON: byte-identical to `JSON.stringify(taskCall, null, 1)+"\n"` (120299 bytes, sha256 `19b0381bbbd7dad6428c9b825b60ef5e98c3f6588e2e5d65235d84c6e0ee7815`). The validator's `emitJson` (`ufo-mission-result.mjs:2034-2035`) is 2-space, 121134 bytes. Same values, different indent. A byte compare against `emitJson(taskCall)` fails; a parse compare does not.

## How `jj-lane.sh state` says a commit is pushed

`state` is pure git (`jj-lane.sh:156-182`). It does not call jj, fetch, or `git ls-remote`. It prints:

```
state branch=<b> local=<heads/b> remote=<remotes/origin/b> ahead=<n> behind=<n> head=<attached|detached> tracked=<n> untracked=<n>
```

`ahead` = `git rev-list --count refs/remotes/origin/<b>..refs/heads/<b>` (commits on the local branch that the cached remote-tracking ref does not have). `behind` is the opposite range (`:176-177`).

- The branch tip is pushed, relative to that cached ref, iff `ahead=0` (local tip is an ancestor of, or equal to, `remote=`). `ahead=0` and `behind=0` means the two hashes are equal.
- A named commit `H` is pushed, relative to that cached ref, iff `git merge-base --is-ancestor H <remote=>` succeeds. The unpushed set is exactly `git rev-list <remote=>..<local=>`.
- `ahead>0` means those commits are not on the cached origin tip. Exit 3 from `commit` / `push` is "committed but push failed (commit kept)" (`:9`, `:60`); `state` then shows them in `ahead`.
- This is not the helper's citable proof. The only citable line is `landed <hash>`, printed by `report_landed` (`:235-261`) after `git ls-remote origin refs/heads/<b>` equals the local tip (`:22-23`). `state` can lag a remote move until the tracking ref moves, and it can say `ahead=0` while a later remote rewind would only show up after fetch. The helper refuses a non-fast-forward push (`:213-216`); `state` does not re-check that live.

Observed now (illustration, not a substitute for `landed`):

```
$ scripts/hyaku/jj-lane.sh state kumitate-shokunin
state branch=master local=6927903f99bbc26e397aa47387aa76950f42b3a5 remote=6927903f99bbc26e397aa47387aa76950f42b3a5 ahead=0 behind=0 head=detached tracked=0 untracked=17
$ git merge-base --is-ancestor 6927903f99bbc26e397aa47387aa76950f42b3a5 refs/remotes/origin/master
exit 0
$ git ls-remote origin refs/heads/master
6927903f99bbc26e397aa47387aa76950f42b3a5	refs/heads/master
```

`untracked=17` is the worktree, not push state. Cached tip and live `ls-remote` match at this reading, so `ahead=0` currently agrees with the remote. `state` did not establish that; `ls-remote` did.

## Limit

Bytes cannot tell `--emit-tasks` from saving `plan.tasks` with the same `JSON.stringify(_, null, 2)+"\n"`. Both are the bare array. Neither is `taskCall`. `run` was not executed, so the dispatch envelope's other fields (registry path, `handlesReset`) were not compared to a live `run` stdout; `taskCall` itself does not depend on that write.
