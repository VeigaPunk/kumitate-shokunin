# K81ScoutReconC1 — recon of the inline handoff chain (`ready-handoff`)

Read-only seat. No lane file was edited except this report; every fixture lived under
`$HYAKU_SCRATCH/kumitate-r81/K81ScoutReconC1/` and was deleted. No git/jj command was run.
Measured 2026-11-04 06:45–06:56 on the run-15 host.

Inputs read in full:
`kumitate-shokunin/.ufo/waves/round-81/plan.md` (7933 B),
`kumitate-shokunin/scripts/ready-handoff.mjs` (24570 B, sha256
`f8b4a92b58d351615b714bdf03052420aaa79854153c5e23b7c714178fbdf531` = `SCORECARD.md:352 pin.ready-handoff`),
`ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (2071 lines, tip `fb7157fc`),
`ufo-fsd-alpha/scripts/ufo-swarm-registry.mjs`, `scripts/hyaku/ufo-wave-policy.json`,
`scripts/hyaku/lane-addendum.md`, `.ufo/prompts/kumitate-round-81.md`,
the three committed wave pairs (`round-79`, `round-80`, `round-81`).

---

## 1. The chain as built

```
L1 (KumitateR81)                     orchestrator (operator session)
  ├─ writes .ufo/waves/round-81/w1-dispatch.json      (validator's taskCall, unchanged)
  ├─ runs  scripts/ready-handoff.mjs  ← ADVISORY, lane-local
  ├─ writes .ufo/waves/round-81/w1.ready               ──poll──▶ takes it, spawns taskCall unchanged
  │                                                            ├─ writes .ready.partial (name→id, incremental)
  │                                                            └─ writes .ready.dispatched (timestamp + full map)
  └─ waits for WAVE-DONE                                    ◀── all seats settle, writes w1-results.json
```

- The take path is prose only: `.ufo/prompts/kumitate-round-81.md:298-302` ("The orchestrator's
  dispatcher takes it within ~15 s (marker `<wave>.ready.dispatched`), spawns every seat of
  `taskCall` unchanged") and `scripts/hyaku/lane-addendum.md:158-165`.
- No fleet-side script, hook, or dispatcher invokes `ready-handoff.mjs`. A repo-wide grep for
  `ready-handoff` outside the lane hits only prose (`kumitate-shokunin/.ufo/waves/round-81/plan.md`,
  `kumitate-shokunin/SKILL.md:589,618,755`, `kumitate-shokunin/SCORECARD.md:352`,
  `kumitate-shokunin/.ufo/waves/round-81/probe/probe81-c1.mjs`) and one l0 question recording that
  "no AgentSwarm/ready-handoff dispatch surface exists" fleet-side (`shokunin/.ufo/l0-questions.md:231`).

## 2. What `ready-handoff.mjs` checks (line map, contract `kumitate-ready-handoff-v1`)

| check | token | line |
|---|---|---|
| ready readable / JSON object | `READY_ABSENT`, `READY_MALFORMED` | 104-107 |
| `dispatch` absolute | `DISPATCH_PATH` | 109 |
| dispatch lexically inside `<lane>/.ufo/waves/round-N/` | `DISPATCH_OUTSIDE` | 113 |
| dispatch regular file, realpath contained | `DISPATCH_ABSENT`, `PATH_UNSAFE` | 116-124 |
| `taskCall.context` string + non-empty `tasks` | `DISPATCH_MALFORMED` | 126-129 |
| ready key set exactly `{lane,round,wave,dispatch,l1}` | `READY_KEYS` | 38, 136 |
| lane / round / wave agreement | `LANE_MISMATCH`/`ROUND_MISMATCH`/`WAVE_MISMATCH` | 139-141 |
| `l1` non-empty string | `L1_ABSENT` | 142 |
| seat band (default `8:16`, `--band`) | `BAND` | 47, 146 |
| context names lane root / scratch rule | `CONTEXT_LANE_ROOT`, `SCRATCH_ROOT` | 147-148 |
| task keys only `name/agent/task` | `ARTIFACT_KEYS` | 159 |
| name grammar / uniqueness | `SEAT_NAME`, `SEAT_DUPLICATE` | 160-162 |
| role ∈ 12-role set, never `planner` | `ROLE_UNKNOWN`, `PLANNER_SEAT` | 34-35, 164-166 |
| first line exactly `/skill:godspeed` | `GODSPEED` | 172 |
| task text contains the absolute lane root | `TASK_LANE_ROOT` | 173 |
| no lane-relative `.ufo/waves/round-N/` path in body | `RELATIVE_WAVE_PATH` | 174-176 |
| relative `Report:` trailer needs a context sentence | `REPORT_TRAILER` | 177-183 |
| ≥25 % attack seats | `ATTACK_SHARE` | 186 |
| ≤2 connector seats | `CONNECTOR_COUNT` | 187 |

## 3. What the validator already refuses before dispatch

`ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` — the producer of every `w1-dispatch.json` here:

- **Roles**: `SWARM_ROLES` (10) at `ufo-swarm-wave.mjs:265-276`; `planner/distiller/labrat/Main` are
  "frozen-topology seats and can never be swarm lanes" (`:263-264`), refused at `:988-989`.
- **Names**: `MEMBER_NAME_PATTERN = /^[A-Z][A-Za-z0-9]{1,31}$/u` (`ufo-swarm-registry.mjs:33`),
  enforced at `ufo-swarm-wave.mjs:731-734`; duplicate names `:1200`.
- **Spec/item shape**: unknown spec key `:810-812`, unknown item key `:927-930`, `items` array
  `:912`, resume/spawn vocabulary split `:938-1005`, `modelAlias` bare-alias only `:744-754`.
- **Paths**: `reportDir`/`priorRegistry` must be relative, no backslashes, no empty/`.`/`..`
  segments (`validateRelativePath`, `:397-414`); registry reads contained via `resolveBeneathRoot`
  (`:132-135`, `:435`).
- **Bytes**: prompt 64 KiB (`:164`), context 64 KiB (`:165`), spec 1 MiB (`:163`), composed text
  `:252`, wave ≤128 B (`:168-170`).
- **Envelope**: at most one `| godspeed` marker, terminal (`checkEnvelopeMarker`, `:212-219`).
- **Band**: floor/ceiling derived from policy (`:836-848`) then enforced —
  `empty_wave :1063`, `impossible_band :1076`, `too_many_lanes :1081`, `too_few_lanes :1085`.
- **Godspeed is INJECTED, not refused**: `if (!opensWithGodspeedInvocation(text)) text =
  \`${GODSPEED_INVOCATION}\n\n${text}\`` (`:1263-1265`, helper `:183-185`).
- **Report rendering**: `Report: write your scoped findings to ${reportDir}/${name}.md`
  (`reportInstruction`, `:225-227`) — appended at `:1254-1256`.
- **No attack-share, connector-cap, or lane-root check exists anywhere** (`grep -n 'attack'
  ufo-swarm-wave.mjs` → 0 hits; `grep -n 'attack' scripts/hyaku/ufo-wave-policy.json` → 0 hits).

## 4. The three committed pairs under the new gate

Command: `node scripts/ready-handoff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --round N --wave w1`
(from the lane; the gate reads only the ready file and the dispatch it names).

| round | ready | exit | verdict | seats | attack | conn | dispatchSha | findings |
|---|---|---|---|---|---|---|---|---|
| 79 | pretty JSON, `l1=KumitateR79` | **1** | DRIFT | 13 | 4/13 (31 %) | 1 | `88c86520` | 9 |
| 80 | compact, `l1=KumitateR80` | **1** | DRIFT | 13 | 4/13 (31 %) | 1 | `a59a5d02` | 2 |
| 81 | compact, `l1=KumitateR81` | **0** | READY | 14 | 4/14 (29 %) | 1 | `954f2b97` | 0 |

Per-pair detail (all paths lane-relative below; every seat trailer is the validator's
`.ufo/waves/round-N/w1/<name>.md` form):

**round-79** — `READY_HANDOFF: DRIFT RELATIVE_WAVE_PATH,TASK_LANE_ROOT,…` exit 1. Findings:
`RELATIVE_WAVE_PATH` × 5 (`K79ScoutOpen`, `K79ExecRepairs`, `K79ScribeKnowledge`, `K79ScribeDocs`,
`K79SentinelSecrets`), `TASK_LANE_ROOT` × 4 (`K79ExecRepairs`, `K79ScribeDocs`, `K79ConnectSiblings`,
`K79CriticClaims`). Sampled match (`K79ScribeDocs`): `` `node .ufo/waves/round-79/probe/probe79-c1.mjs
--set c1 --lane .` `` — a genuinely cwd-relative invocation. Real defect class, correctly caught.
Was dispatched anyway: `.ufo/waves/round-79/w1.ready.dispatched` (04:46:17) + `w1-results.json` exist.

**round-80** — `DRIFT` exit 1. Findings: `RELATIVE_WAVE_PATH` (`K80ExecRepairs`) and
`TASK_LANE_ROOT` (`K80ConnectSiblings`). The first is a **false positive**: the matched span is
`` git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%an <%ae> %H %s' -- .ufo/waves/round-79/close/c1-probe.txt ``
— a git pathspec resolved against `-C <absolute lane>`, i.e. correct by construction. Dispatched
anyway: `.dispatched` 05:49:44 + `w1-results.json` exist.

**round-81** — `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1
roles=scout=2,connector=1,executor=3,mutation-tester=1,reviewer=2,critic=1,sentinel=1,scribe=2,revenger=1`
exit 0. It passes only because the L1 hand-wrote the trailer-resolution sentence into
`taskCall.context`; the validator emits no such sentence (see F12). Dispatched:
`w1.ready.dispatched` 06:53:17 with all 14 names.

All three payloads' roles ⊂ `SWARM_ROLES`, and 13/13/14 ⊂ 8..16, so the validator's own rules would
admit all three; the gate is the only instrument that refuses 79 and 80 — and neither refusal stopped
a dispatch.

## 5. Findings

| id | sev | finding | evidence |
|---|---|---|---|
| F1 | **H** | The gate is not in the take path. Nothing fleet-side invokes it; the orchestrator polls `<wave>.ready` and spawns `taskCall` unchanged. Both round-79 and round-80 read DRIFT under the gate and were dispatched anyway, so every check in §2 is enforced by L1 discipline alone. | `grep -rn 'ready-handoff'` → no fleet-side hit; `.ufo/l0-questions.md:231`; `.ufo/prompts/kumitate-round-81.md:298-302`; `lane-addendum.md:158-165`; r79/r80 `.dispatched` + `w1-results.json` present |
| F2 | **H** | The frozen C1 counter is **UNMET at the current tree**: `C81_C1: UNMET held=15/16`, exit 1. Arm 1 `clean-fixture-ready` fails because the counter's own fixture writes a relative `Report:` trailer and a context with no resolution sentence, so the gate now answers `DRIFT REPORT_TRAILER` instead of the arm's expected `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10`. The plan's after-state is `HELD held=16/16`. | `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1` → exit 1; arm 1 line quoted below in §6 |
| F3 | **H** | No admission receipt: the ready/dispatch pair carries no gate hash, verdict, or instant; the gate's `dispatchSha` (FNV-8, `:38`) is printed and discarded. `scripts/ready-handoff.mjs` mtime is **06:49:23.17**, the live `w1.ready` **06:49:16.945** and `w1-dispatch.json` **06:49:16.934** — the handoff predates the pinned gate bytes by 6.2 s, and nothing records which revision admitted it (the pinned bytes do agree with READY today). | `stat -c '%y %n'` on the three files; `sha256sum scripts/ready-handoff.mjs` = `f8b4a92b…` |
| F4 | M | No wave↔dispatch binding. `ready.wave` is checked (`:141`) but neither the dispatch filename nor `dispatch.wave` is: a `w1.ready` pointing at `w2-dispatch.json` in the same round dir reads READY, and a payload declaring `wave:"w2"` with `counts.total:3` reads READY. | probe G1, G2 (both exit 0 READY) |
| F5 | M | `l1` is only "non-empty string" (`:142`). `l1:"NobodyR99"` reads READY; no liveness/registration check, although the live id `KumitateR81` is a registered agent. | probe G7; `history://KumitateR81` resolves as *running* |
| F6 | M | Report target is never resolved or contained. `Report: /tmp/K81S01.md` reads READY, and two seats may claim the same report path (reads READY). The gate strips `Report:` lines from the body scan (`:174`) and only asks the context for a sentence (`:183`). | probe G3, G4 (both exit 0) |
| F7 | M | `ARTIFACT_KEYS` (`:159`) is narrower than the harness. Its message asserts "only name/agent/task are dispatch fields", but the fleet's own bridge hands `task` every seat **plus** `solutionSpace` (`lane-addendum.md:234`), and the task tool accepts `model`/`tools`/`solutionSpace`. A payload that pre-declares `solutionSpace` is refused. | probe G6 → `DRIFT ARTIFACT_KEYS` |
| F8 | M | Role taxonomies disagree, and the attack numerator is blind to it. Gate `ROLES` (`:34-35`) admits `labrat` and `distiller`; the validator refuses both (`ufo-swarm-wave.mjs:263-276, 988-989`). `labrat` is in the gate's `ATTACK` set (`:37`) and in the addendum's attack list (`lane-addendum.md:5`). Round-80 therefore dispatched a labrat seat **disguised as `revenger`** — its own header reads `# Seat — K80LabratC2 (role revenger; the validator admits no labrat seat)` — so the gate counts it as non-attack (r80 attack 4/13, not 5/13). | `.ufo/waves/round-80/w1-dispatch.json` seat `K80LabratC2`; `.ufo/waves/round-80/w1-spec.json` item role `revenger`; probe G9b → READY with `distiller=1,labrat=1, attack=4/10` |
| F9 | M | Band authority is duplicated. Gate default `band: '8:16'` (`:47`, `--band`) never reads the machine policy that the validator reads: `scripts/hyaku/ufo-wave-policy.json:89-90` (`waveMinLanes 8`, `waveMaxLanes 16`), enforced at `ufo-swarm-wave.mjs:836-848, 1063-1090`. A policy edit desyncs admission from dispatch with no signal. | gate `:47`; policy `:89-90`; validator `:836-848` |
| F10 | M | The attack-role list has no machine authority, and the gate misattributes it. `:36-37` says "The run-15 policy names these four as the attack roles (ufo-wave-policy.json)"; that file contains no `attack` key (grep, 0 hits), nor does the validator. The rule and the ≤2-connector cap exist only as prose in `lane-addendum.md:5`. | `grep -n attack scripts/hyaku/ufo-wave-policy.json` → ∅; `lane-addendum.md:5` |
| F11 | M | `REPORT_TRAILER` (`:183`) is satisfiable by a bare phrase: a context containing "relative to" but never naming the base reads READY. Together with F6, the trailer rule can be satisfied without saying where the report lands. | probe G11 (exit 0) |
| F12 | M | The validator's native shape needs the gate's escape hatch, and only the L1 supplies it. `reportInstruction` emits a **relative** trailer from a relative `reportDir` (`:225-227`, `:402-414`; canonical `reportDir: ".ufo/waves/round-N/<wave>"`, `lane-addendum.md:245,299`), while no validator path emits "relative to"/"write it at" (grep, 0 hits). Round-81 is READY only because the L1 wrote that sentence into `taskCall.context` by hand. | validator `:225-227`; round-81 `w1-dispatch.json` context |
| F13 | M | No byte bound at admission. One 70 KiB task reads READY, while the validator refuses composed text over 64 KiB (`:164`, `:252`) — the failure would surface after the handoff was taken. | probe G10 (exit 0) |
| F14 | M | Take latency and the take signal disagree with the contract. Ready 06:49:16.945 → `.ready.dispatched` 06:53:17 = **240 s**, not "~15 s". During that window the only signal was the undocumented `.ready.partial` (420 B, 12/14 name→id at 06:52:47); the documented marker (`prompt:300`) appears only once the whole wave is spawned, so "never re-write a taken ready file" (`prompt:305`, `lane-addendum.md:165`) has no observable predicate during the take. Round-81's ready was written 6 s *before* the final gate revision (F3). | `stat`; `ls`+`cat` of `.ufo/waves/round-81/w1.ready.partial` (06:52:47) and `w1.ready.dispatched` (06:53:17) |
| F15 | L | `RELATIVE_WAVE_PATH` (`:174-176`) false-positives on a git pathspec after `--` under `-C <abs lane>`: round-80's only such finding is exactly that, and it forces exit 1 on a legitimate handoff. | round-80 matched span quoted in §4 |
| F16 | L | Seat-name grammar is weaker than the validator's: gate `/^[A-Za-z][A-Za-z0-9]{1,31}$/` (`:161`) admits a lowercase initial that `MEMBER_NAME_PATTERN` (`^[A-Z]…`, `ufo-swarm-registry.mjs:33`) refuses. | probe G8 (exit 0) |
| F17 | L | Neither instrument checks that a file a seat is told to read exists. A seat targeting `corpus/lessons/round-9999-never-written.md` reads READY. | probe G5 (exit 0) |
| F18 | L | Plan text is stale against the tool: plan §C1 arm 16 says `selftest` (30/30); the suite has 31 cases (`…SELFTEST: 31/31 pass`), and `SKILL.md:618` already says 31/31. The counter's arm-16 regex `(\d+)/\1` is count-agnostic, so it hides the drift. | `--selftest` output; `SKILL.md:618`; plan `## C1` arm list |
| F19 | L | Take markers and stale siblings are never inspected: a leftover `.ready.partial` or a re-written `.ready` is invisible to the gate, which cannot distinguish a fresh handoff from one already taken. | gate reads only `readyPath` + `dispatchPath` (`:100-129`) |

## 6. Commands run (exact) and captured outputs

All from `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only); fixtures under
`/fast/scratch/hyaku/kumitate-r81/K81ScoutReconC1/`, removed after use.

1. `node scripts/ready-handoff.mjs --lane "$PWD" --round 79 --wave w1 --json` → exit 1,
   `DRIFT`, sha `88c86520`, seats 13, attack 4, conn 1, 9 findings (ids in §4).
2. `… --round 80 …` → exit 1, `DRIFT`, sha `a59a5d02`, seats 13, attack 4, conn 1, 2 findings.
3. `… --round 81 …` → exit 0, `READY`, sha `954f2b97`, seats 14, attack 4, conn 1, 0 findings.
4. `node scripts/ready-handoff.mjs --selftest --work <scratch>/fixtures` → exit 0,
   `READY_HANDOFF_SELFTEST: 31/31 pass` / `VERDICT: PASS`.
5. `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1 --work <scratch>/c1work2` → **exit 1**;
   first arm and last line:
   ```
   C81_C1 arm clean-fixture-ready FAIL exit=1 out=READY_HANDOFF: DRIFT REPORT_TRAILER (10 seat(s) carry a relative Report: trailer and taskCall.context does not say where it resolves (K81S01))
   C81_C1: UNMET held=15/16 tool=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/ready-handoff.mjs sha=1bed8387
   ```
   (all other 15 arms PASS, including the discriminating `round-81-live-ready`.)
6. Gap probe (hermetic fixture lane reusing the gate via `--lane`), 13 shapes:

   | id | shape | exit | verdict | findings |
   |---|---|---|---|---|
   | G0 | clean control | 0 | READY | — |
   | G1 | `w1.ready` → `w2-dispatch.json` (same round dir) | 0 | READY | — |
   | G2 | `dispatch.wave=w2`, `counts.total=3` | 0 | READY | — |
   | G3 | `Report: /tmp/K81S01.md` | 0 | READY | — |
   | G4 | two seats, one report path | 0 | READY | — |
   | G5 | target `corpus/lessons/round-9999-never-written.md` | 0 | READY | — |
   | G6 | task carries `solutionSpace` | 1 | DRIFT | `ARTIFACT_KEYS` |
   | G7 | `l1 = NobodyR99` | 0 | READY | — |
   | G8 | seat name `k81seat01` | 0 | READY | — |
   | G9 | distiller+labrat replacing attack seats | 1 | DRIFT | `ATTACK_SHARE` (roles admitted) |
   | G10 | one 70 KiB task | 0 | READY | — |
   | G11 | context says "relative to", names no base | 0 | READY | — |
   | G12 | dispatch symlink → outside file | 2 | FAIL-CLOSED | `PATH_UNSAFE` |
7. G9b (roles preserved): READY, `attack=4/10`,
   `roles=reviewer=1,critic=1,mutation-tester=1,executor=2,distiller=1,labrat=1,scribe=2,connector=1`.
8. `sha256sum scripts/ready-handoff.mjs` → `f8b4a92b58d351615b714bdf03052420aaa79854153c5e23b7c714178fbdf531`
   (= `SCORECARD.md:352`).
9. `stat -c '%y %n'` → gate `06:49:23.170625190`, `w1.ready` `06:49:16.945241229`,
   `w1-dispatch.json` `06:49:16.934613107`.
10. `cat .ufo/waves/round-81/w1.ready.dispatched` → `2026-11-04T06:53:17` + 14-name map;
    earlier `cat w1.ready.partial` (06:52:47, 420 B) held 12 names.

## 7. Remaining unknowns

- Which gate revision produced the admission verdict for round-81 (F3): mtimes only, no receipt.
- Whether the orchestrator would honour a gate refusal at all — untested; both DRIFT handoffs were
  dispatched, but that shows non-invocation, not the behaviour under a blocking gate.
- Whether any sibling lane runs a ready gate of its own; out of this lane's scope and not read.
