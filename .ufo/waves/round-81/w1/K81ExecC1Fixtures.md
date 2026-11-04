# K81ExecC1Fixtures — adversarial fixture matrix for `ready-handoff.mjs`

- Seat: `K81ExecC1Fixtures` — round 81, wave `w1`, lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
- Target: `scripts/ready-handoff.mjs` (contract `kumitate-ready-handoff-v1`), 440 lines,
  sha256 `f8b4a92b58d351615b714bdf03052420aaa79854153c5e23b7c714178fbdf531`.
- Measured tree: lane HEAD `d140f2883170cc1b0859ba5359bcdac3123a676e` (the frozen plan names base tip
  `77c7a8b3fe7f3cebe681065da283de0ae38ddb5b`). This seat made no commit and no mutating git call.
- Host: Linux run-15, `node v24.21.0`.
- Baseline: `node scripts/ready-handoff.mjs --selftest` → `READY_HANDOFF_SELFTEST: 31/31 pass`,
  `VERDICT: PASS`, exit 0 (F00 below).

## Fixture construction

13 fixture lanes, each a directory `fixtures/<Fxx>/kumitate-shokunin/` whose round-81 waves directory
is `.ufo/waves/round-81/` holding `w1.ready` beside `w1-dispatch.json`. Built by a scratch-only driver
(`$HYAKU_SCRATCH/kumitate-r81/K81ExecC1Fixtures/run.mjs`, deleted after this report; no fixture needed
git — the gate reads files only, and no git command was ever run against a fixture).

The 10-seat clean template mirrors the tool's own selftest lane: 3 attack (`reviewer`, `critic`,
`mutation-tester`) + 1 `connector` + 6 workers (`executor`/`scribe`); context states `Every path under
<realpath(lane)>`, states the Report-trailer resolution rule, and names the `HYAKU_SCRATCH` scratch
root; every task leads `/skill:godspeed`, names `<realpath(lane)>`, and carries
`Report: .ufo/waves/round-81/w1/<seat>.md (relative to <lane> — write it at <lane>/…)`.
Special fixtures mutate exactly one dimension each.

Command form per fixture (lane absolute):
`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/ready-handoff.mjs --lane <lane> --round 81 --wave w1 [--band 10:12 | --json]`
stdout+stderr+exit captured per fixture.

## Matrix

| # | fixture (targeted rule) | command tail | exit | verdict line | correct for its rule? |
|---|---|---|---|---|---|
| F00 | selftest baseline | `--selftest` | 0 | `READY_HANDOFF_SELFTEST: 31/31 pass` / `VERDICT: PASS` | yes |
| F01 | 16-seat clean wave | (defaults) | 0 | `READY_HANDOFF: READY wave=w1 seats=16 attack=4/16 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,labrat=1,connector=1,executor=6,scribe=5` | yes |
| F02 | 8-seat clean wave | (defaults) | 0 | `READY_HANDOFF: READY wave=w1 seats=8 attack=2/8 connector=1 roles=reviewer=1,critic=1,connector=1,executor=3,scribe=2` | yes |
| F03 | `--band 10:12` override (16 seats) | `--band 10:12` | 1 | `READY_HANDOFF: DRIFT BAND (16 seats outside 10:12)` | yes — same shape at default band is READY (F01), so the override discriminates |
| F04 | duplicate names differing only by case (`K81S01` / `k81s01`) | (defaults) | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,connector=1,executor=3,scribe=3` | **no — SEAT_DUPLICATE not raised** |
| F05 | extra task key (`model`) | (defaults) | 1 | `READY_HANDOFF: DRIFT ARTIFACT_KEYS (task[0] carries model (only name/agent/task are dispatch fields))` | yes |
| F06 | empty `ready.l1` | (defaults) | 1 | `READY_HANDOFF: DRIFT L1_ABSENT (ready.l1 must name the L1 agent id)` | yes |
| F07 | context contradicts the tasks (names another root) | (defaults) | 1 | `READY_HANDOFF: DRIFT CONTEXT_LANE_ROOT (taskCall.context does not name the lane root)` | yes |
| F08 | dispatch is a symlink inside the wave dir → file outside the lane | (defaults) | 2 | `READY_HANDOFF: FAIL-CLOSED DISPATCH_ABSENT (dispatch is not a regular file: …/round-81/w1-dispatch.json)` | yes fail-closed, with a token misnomer (below) |
| F09 | dispatch reached through a symlinked parent resolving INSIDE | (defaults) | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=…` | yes — no false refusal |
| F09b | dispatch through a symlinked parent escaping the lane | (defaults) | 2 | `READY_HANDOFF: FAIL-CLOSED PATH_UNSAFE (dispatch realpath escapes …/.ufo/waves/round-81)` | yes |
| F10 | `w1.ready` is a symlink escaping the lane (target is a VALID ready) | (defaults) | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=…` | **no — ready file's realpath is never constrained** |
| F11 | task names the lane root AND `/etc/passwd` | (defaults) | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=…` | **no — outside absolute paths in seat text are unchecked** |
| F12 | `--json` body key set | `--json` | 0 | keys `attack,connectors,contract,dispatch,dispatchSha,findings,lane,ready,roles,round,seats,verdict,wave` (13, exactly the `judge()` return set) | yes |

Tally: **10/13 fixtures correct for the rule they target; 3 named misses (F04, F10, F11).**
F08 is a correct fail-closed outcome carrying an imprecise token. All tallies above name the
per-fixture transcripts pasted below.

## Fixtures the gate gets wrong

1. **F04 — case-variant duplicate seat accepted.** Fixture bytes (verified from the built dispatch):
   `taskCall.tasks[0..1].name = ["K81S01","k81s01"]`. Outcome: `READY`, exit 0.
   Mechanism: `scripts/ready-handoff.mjs:162-163` dedupes through a case-sensitive `Set`
   (`if (names.has(task.name))`), and the name regex at `:161` admits both spellings. On a
   case-insensitive seat-id matcher (and for any human reading the wave) these are the same seat;
   the gate reports 10 seats where 9 distinct identities exist.
2. **F10 — `.ready` symlink escaping the lane is followed and accepted.** Fixture:
   `w1.ready` is a symlink → `fixtures/F10/outside/w1.ready.json` (verified with `ls -l`), the target
   being a syntactically valid ready naming the in-lane dispatch. Outcome: `READY`, exit 0.
   Mechanism: the ready file is consumed with plain `readFileSync(readyPath, 'utf8')` at
   `scripts/ready-handoff.mjs:103-104`; no `lstat`/`realpath` containment is applied to it anywhere,
   while the dispatch gets lexical containment at `:112` and realpath containment at `:119`. The
   handoff gate therefore reads its admission data from outside the lane it is supposed to keep in
   its province — the same class of escape it refuses for the dispatch.
3. **F11 — seat text naming `/etc/passwd` accepted.** Fixture: `task[0].task` carries the lane root (so
   `TASK_LANE_ROOT` passes) plus the appended line
   `Also consult /etc/passwd for the roster convention.` (verified in the built dispatch). Outcome:
   `READY`, exit 0. Mechanism: `scripts/ready-handoff.mjs:173` only asserts
   `task.task.includes(laneRoot)`; there is no refusal of other absolute paths in seat text, so a
   dispatch can direct a seat outside the lane while satisfying the check.

## Other observations

- **F08 token misnomer (fail-closed outcome is correct).** The dispatch symlink exists, but
  `lstatSync` at `:116` plus `isFile()` at `:117` refuse it before the realpath check at `:119`;
  the token is `DISPATCH_ABSENT` and the detail reads `dispatch is not a regular file: …`. The file is
  present, so the token overstates absence; the detail text is accurate and the exit is 2 (fail-closed).
  Consequence: even a symlink pointing INSIDE the lane is refused with the same token — conservative,
  but it makes the token unusable for triage without reading the detail.
- F09/F09b together show the dispatch realpath containment is symmetric in the right way: an
  inside-resolving symlinked parent is accepted (no false positive), an escaping one yields
  `PATH_UNSAFE` exit 2.

## Transcript excerpts (captured, verbatim)

F00 — selftest baseline:
```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/ready-handoff.mjs --selftest
READY_HANDOFF_SELFTEST: 31/31 pass
VERDICT: PASS
--- exit 0 ---
```

F01 — 16-seat clean wave:
```
$ node …/scripts/ready-handoff.mjs --lane …/fixtures/F01/kumitate-shokunin --round 81 --wave w1
READY_HANDOFF: READY wave=w1 seats=16 attack=4/16 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,labrat=1,connector=1,executor=6,scribe=5
--- exit 0 ---
```

F02 — 8-seat clean wave:
```
$ node …/scripts/ready-handoff.mjs --lane …/fixtures/F02/kumitate-shokunin --round 81 --wave w1
READY_HANDOFF: READY wave=w1 seats=8 attack=2/8 connector=1 roles=reviewer=1,critic=1,connector=1,executor=3,scribe=2
--- exit 0 ---
```

F03 — `--band 10:12` on the 16-seat shape:
```
$ node …/scripts/ready-handoff.mjs --lane …/fixtures/F03/kumitate-shokunin --round 81 --wave w1 --band 10:12
READY_HANDOFF: DRIFT BAND (16 seats outside 10:12)
--- exit 1 ---
```

F04 — duplicate names differing only by case:
```
$ node …/scripts/ready-handoff.mjs --lane …/fixtures/F04/kumitate-shokunin --round 81 --wave w1
READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,connector=1,executor=3,scribe=3
--- exit 0 ---
$ node -e '…tasks.slice(0,2).map(t=>t.name)' → ["K81S01","k81s01"]
```

F05 — extra task key:
```
READY_HANDOFF: DRIFT ARTIFACT_KEYS (task[0] carries model (only name/agent/task are dispatch fields))
--- exit 1 ---
```

F06 — empty `ready.l1`:
```
READY_HANDOFF: DRIFT L1_ABSENT (ready.l1 must name the L1 agent id)
--- exit 1 ---
```

F07 — contradicting context:
```
READY_HANDOFF: DRIFT CONTEXT_LANE_ROOT (taskCall.context does not name the lane root)
--- exit 1 ---
```

F08 — dispatch symlink to a file outside the lane (`ls -l`: `w1-dispatch.json -> …/fixtures/F08/outside/w1-dispatch.json`):
```
READY_HANDOFF: FAIL-CLOSED DISPATCH_ABSENT (dispatch is not a regular file: /fast/scratch/hyaku/kumitate-r81/K81ExecC1Fixtures/fixtures/F08/kumitate-shokunin/.ufo/waves/round-81/w1-dispatch.json)
--- exit 2 ---
```

F09 — dispatch via symlinked parent resolving inside (`ls -l`: `alias -> …/round-81/real`):
```
READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,connector=1,executor=3,scribe=3
--- exit 0 ---
```

F09b — dispatch via symlinked parent escaping (`ls -l`: `escape -> …/fixtures/F09b/outside`):
```
READY_HANDOFF: FAIL-CLOSED PATH_UNSAFE (dispatch realpath escapes /fast/scratch/hyaku/kumitate-r81/K81ExecC1Fixtures/fixtures/F09b/kumitate-shokunin/.ufo/waves/round-81)
--- exit 2 ---
```

F10 — ready file is an escaping symlink (`ls -l`: `w1.ready -> …/fixtures/F10/outside/w1.ready.json`):
```
READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,connector=1,executor=3,scribe=3
--- exit 0 ---
```

F11 — task names lane root AND `/etc/passwd` (verified tail of `tasks[0].task`:
`["Scratch: $HYAKU_SCRATCH/kumitate-r81/<seat>/","Also consult /etc/passwd for the roster convention."]`):
```
READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=reviewer=1,critic=1,mutation-tester=1,connector=1,executor=3,scribe=3
--- exit 0 ---
```

F12 — `--json` body (full stdout):
```json
{
  "contract": "kumitate-ready-handoff-v1",
  "verdict": "READY",
  "lane": "/fast/scratch/hyaku/kumitate-r81/K81ExecC1Fixtures/fixtures/F12/kumitate-shokunin",
  "round": 81,
  "wave": "w1",
  "ready": "/fast/scratch/hyaku/kumitate-r81/K81ExecC1Fixtures/fixtures/F12/kumitate-shokunin/.ufo/waves/round-81/w1.ready",
  "dispatch": "/fast/scratch/hyaku/kumitate-r81/K81ExecC1Fixtures/fixtures/F12/kumitate-shokunin/.ufo/waves/round-81/w1-dispatch.json",
  "dispatchSha": "170d3f38",
  "seats": 10,
  "roles": { "reviewer": 1, "critic": 1, "mutation-tester": 1, "connector": 1, "executor": 3, "scribe": 3 },
  "attack": 3,
  "connectors": 1,
  "findings": []
}
--- exit 0 ---
```
Key set is exactly the 13 keys returned by `judge()` (`contract, verdict, lane, round, wave, ready,
dispatch, dispatchSha, seats, roles, attack, connectors, findings`); no extra key, none missing.

## Cleanup and tooling

- All fixtures and the driver lived under `/fast/scratch/hyaku/kumitate-r81/K81ExecC1Fixtures/` and were
  deleted after this report was written; the pasted transcripts above are the retained evidence.
- No tool install or upgrade was performed (system `node v24.21.0` was used); no pacman/uv/npx channel touched.
- No git/jj mutation anywhere; the only git call was read-only `git rev-parse HEAD` against the lane to pin
  the measured tree. No file outside the lane report dir and this seat's scratch was written.
