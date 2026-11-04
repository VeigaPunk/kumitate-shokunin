# K82ScoutReconC1 — the campaign validator vs the lane gate: role and band authority

Read-only recon (no lane edit, no commit). Round 82, lane `kumitate`.
Lane revision under observation: `c4396021c31e5d631c3ec498b4fa81cef1b98b46`.
Validator revision: `fb7157fcf14625be9d0b91bdd425a4b3212e4194` (`ufo-fsd-alpha`).
Node `v24.21.0`.

Files read in full or in the cited ranges:

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/ready-handoff.mjs` (v2, 613 lines)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/plan.md` (§C1, Amendment 1)
- `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (2071 lines)
- `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-mission-result.mjs` (`loadSwarmPolicy`, 2599–2690)
- `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-registry.mjs` (name grammar), `ufo-swarm-agent-cards.mjs` (card names)
- `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`
- `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json` (the validator's default config)
- this wave's spec, dispatch, ready and registry under `.ufo/waves/round-82/`

No LSP device is mounted in this session (`xd://` exposes no `lsp` path), so symbol
locations below are from direct reads of the named files, not semantic queries; every
line number was re-read from the file. All other evidence is a command in §3.

## 1. Findings

Severity: **H** = the two tools return opposite verdicts on the same wave today;
**M** = a validator-valid handoff can fail admission, or the gate can admit what the
validator refuses (the trigger may be a policy edit, a resume wave, or a hand-built
dispatch rather than this round's own handoff); **L** = latent / portability /
unreachable-through-validator.

| ID | Sev | File:line | The disagreement | What it costs |
|----|-----|-----------|------------------|---------------|
| F1 | **H** | validator `ufo-swarm-wave.mjs:1061`, `:1083-1094` vs gate `ready-handoff.mjs:199` (+ payload `ufo-swarm-wave.mjs:1470-1471`) | The validator judges the band on **all lanes** (`total = lanes.length` includes resume lanes); the gate judges it on `tc.tasks.length`, and `taskCall` is **spawns only** (`taskCall: spawns.length > 0 ? {context, tasks: spawns} : null`). | Measured: a wave of 10 spawn + 6 resume at band `12:16` is **accepted** by the validator and its own dispatch is then **refused** `BAND: 10 seats outside 12:16`. The reverse also exists: 10 spawn + 8 resume is refused `wave_too_wide` although its dispatch would carry 10 tasks (inside `8:16`). The gate never reads `resumeSends`, so resume-lane instructions are unjudged entirely. |
| F2 | M | validator `ufo-swarm-wave.mjs:1080-1081`, hub `ufo-mission-result.mjs:2572`, `:2621-2626` vs gate `ready-handoff.mjs:156-157` | The validator caps lanes at policy `maxLanes` and the hard `MAX_SWARM_LANES = 256`; the gate reads only `waveMinLanes`/`waveMaxLanes` and has **no ceiling** and no `maxLanes` read. | Measured: 257 tasks under a policy with `waveMaxLanes: 300` → gate `READY`, while the validator answers `too_many_lanes: wave has 257 lanes; the cap is 256`. Admission can pass a payload no validator run would emit (hand-edited/merged dispatch, or a policy edit above 256). |
| F3 | M | validator `ufo-swarm-wave.mjs:265-276` (`SWARM_ROLES`), `:988`; gate `ready-handoff.mjs:152-163` | The **role vocabulary is still duplicated**. The gate reads `nativeProfiles['omp-native-v1'].proposalRoles`; the validator matches `raw.role` against a hard-coded ten-role `Set` and never reads `nativeProfiles` (grep: zero `nativeProfiles` hits in `ufo-swarm-wave.mjs`). | Measured: the sets are identical today (policy v1, `devin-native-v1`, `SWARM_ROLES`, `collect-omp-native-handoff-lib/base.mjs` `PROPOSAL_ROLES` — all ten, same order). But no test ties them: a policy edit to `proposalRoles` moves only the gate; a code edit to `SWARM_ROLES` moves only the validator. C1's "one authority" holds gate↔policy, not validator↔policy, so the claim's sentence that labrat/distiller admissions "stop duplicating the campaign's authority" is true only of the lane tool. |
| F4 | M | gate `ready-handoff.mjs:41`, `:222-225`; prompt `.ufo/prompts/kumitate-round-82.md:145`; plan `plan.md:66`, A1.6 `:133-136` | **Three attack vocabularies.** Prompt: reviewer, critic, mutation-tester, **labrat**. Gate `ATTACK`: reviewer, critic, mutation-tester, labrat. The plan's round shape counts **sentinel**: "attack 5/14 = 36 %". The validator has no attack concept at all (grep `attack` → 0 hits). | Measured on this wave: gate reports `attack=4/14` (28.6 %), plan says 5/14 (36 %). A1.6 discloses the sentinel exclusion, so the count is now recorded, but the plan's headline number still overstates the admitted share. `labrat` in `ATTACK` is **dead**: line 223 returns for any role outside `proposalRoles` before line 225 can count it, so the campaign's own attack list names a role neither tool admits. A thinner wave (3 gate-attack + 1 sentinel at 14 seats = 21 %) would fail `ATTACK_SHARE` while the plan says it passes. |
| F5 | M | validator `ufo-swarm-wave.mjs:183-185`, `:1263-1265` vs gate `ready-handoff.mjs:228-229` | `/skill:godspeed`: the validator's `opensWithGodspeedInvocation` is `/^\s*\/skill:godspeed(?:\s|$)/u` and it **prepends** the line only when absent; the gate requires `task.task.split('\n')[0].trim() === '/skill:godspeed'`. | Measured: a prompt opening `/skill:godspeed extra` passes validation untouched and is refused `GODSPEED` by the gate; a prompt opening with a blank line then the invocation likewise. A validator-valid, validator-composed dispatch can fail admission, and the fix (edit item prose) is invisible to the validator. |
| F6 | M | validator `ufo-swarm-wave.mjs:225-227`, `:1255`; gate `ready-handoff.mjs:255-256` | Every validator-composed wave with `reportDir` gets a **relative** `Report:` trailer; the gate additionally demands the `taskCall.context` carry `/relative to\|write it at/i`. The validator never checks the context wording. | Measured: a validator-accepted spec whose context lacks the phrase composes 12 relative trailers and the gate refuses `REPORT_TRAILER`. This round is safe only because the campaign prompt (`kumitate-round-82.md:302`, `:442`) mandates the wording — the requirement is prompt-enforced, not validator-enforced. |
| F7 | M | gate `ready-handoff.mjs:233-246` vs gate's own `inside()` use at `:117`, `:131`, `:138`; validator `ufo-swarm-wave.mjs:409-413` | The gate bounds-checks `ready` and `dispatch` with `inside()` but **not the Report destination**: an absolute `Report:` path is accepted as-is. The validator refuses an absolute `reportDir` (`invalid_report_dir`). | Measured: a dispatch whose 12 seats carry `Report: … /var/tmp/abs-N.md` is `READY`. Admission can direct seats to write outside the lane — the containment rule the validator applies to its own report dir is not mirrored on the way in. |
| F8 | M | validator `ufo-swarm-wave.mjs:129-131`, `:142-144`; `config/ufo.json:86,90-91`; gate `ready-handoff.mjs:152-157` | **Band source.** The validator reads its policy from `UFO_CONFIG_PATH`, defaulting to `<ufo-fsd-alpha>/config/ufo.json` (band **32–256**); the gate reads the file named by `--policy` (campaign **8–16**). Neither tool knows the other's file. | Measured: hub loader over the campaign policy → `waveMinLanes 8 / waveMaxLanes 16`; over the repo default → `32 / 256`. A validator run with the env var unset plans 32–256 and the gate then refuses a 20-seat wave as `BAND`. The live round is aligned only because the prompt (`kumitate-round-82.md:381`) sets both `UFO_CONFIG_PATH` and `UFO_PROJECT_ROOT`; that coupling is prompt-enforced, not tool-enforced. |
| F9 | L | hub `ufo-mission-result.mjs:2648-2676` vs gate `ready-handoff.mjs:158-161` | A policy with `minLanes`/`maxLanes` but **no wave band**: the validator derives `waveMinLanes = minLanes` and `waveMaxLanes = min(maxLanes, 256)` and enforces it; the gate fails closed `POLICY_MALFORMED`. | Measured: validator accepts an 8-lane wave on `{minLanes: 8, maxLanes: 256}`; the gate answers `POLICY_MALFORMED` on the same file. The validator's own report is unreliable here — `plan.policy.waveMinLanes/waveMaxLanes` are read from the raw policy (`ufo-swarm-wave.mjs:1362-1363`), so the measured dispatch policy block reads `[null, null]` for a band the validator is in fact enforcing. |
| F10 | L | validator `ufo-swarm-registry.mjs:33`, applied at `ufo-swarm-wave.mjs:731-734`; gate `ready-handoff.mjs:215-217` | **Seat-name grammar.** Validator: `/^[A-Z][A-Za-z0-9]{1,31}$/` (uppercase initial, case-sensitive duplicate check at `:1200`). Gate: `/^[A-Za-z][A-Za-z0-9]{1,31}$/` and a lowercased duplicate set. | Measured both ways: the gate is `READY` for twelve lowercase-initial names the validator refuses (`invalid_name`); the gate flags `SEAT_DUPLICATE` for `ProbeA`/`Probea`, which the validator accepts as distinct. The `SEAT_DUPLICATE` detail ("seat Probea appears twice") misdescribes two different names, pointing an operator at a literal duplicate that does not exist. |
| F11 | L | gate `ready-handoff.mjs:147`, `:190-192` | The gate validates only `taskCall.context` + non-empty `tasks`. `DISPATCH_WAVE` is conditional on the field being present, and the dispatch `schema`, `counts`, `policy` and `registry` fields are never read or cross-checked. | Measured: a dispatch with `wave` deleted is `READY`; a hand-written `{taskCall:{context,tasks}}` with none of the validator's evidence fields passes. The artifact the gate judges cannot prove a validator run happened. |
| F12 | L | gate `ready-handoff.mjs:244`; validator `ufo-swarm-wave.mjs:1200`, `:225-227` | `REPORT_DEST_DUPLICATE` is **unreachable through validator output**: lane names are unique (`duplicate_name`) and every destination is `reportDir/<name>.md`, so destinations are unique by construction. | The rule only catches hand-edited dispatches. Stated so the arm is not read as evidence that the validator can emit colliding destinations. |
| F13 | L | gate `ready-handoff.mjs:247-250`; validator (no counterpart) | `RELATIVE_WAVE_PATH` refuses any non-`Report:` mention of `.ufo/waves/round-N/…` in a task. The validator freely composes item prose containing such paths. | Measured: an item saying "Read .ufo/waves/round-82/plan.md first" is accepted by the validator and refused by the gate. Item prose must use lane-absolute paths — a prose convention the validator does not know. |
| F14 | L | gate `ready-handoff.mjs:222` vs validator `ufo-swarm-wave.mjs:988`; policy `ufo-wave-policy.json:99-103` (planner is outside `proposalRoles:104-115`) | `planner` is refused by **both** (gate `PLANNER_SEAT`, validator `unknown_role`) — double judgment, consistent. But the gate's refusal is a **hard-coded override of the policy**: it fires before `seatRoles.has(...)`, so a policy that added `planner` to `proposalRoles` would still be refused. | No current cost (the policy's `planner` is a separate block, outside `proposalRoles`). It does mean the gate's "role vocabulary from `--policy`" is not the whole authority. |
| F15 | M\* | validator `ufo-swarm-wave.mjs:1058`, `:1288`; `ufo-swarm-agent-cards.mjs:46,136`; gate `ready-handoff.mjs:223` | A lane carrying `modelAlias` emits `agent: lane.card` = `ufo-<role>-<alias>`, not a taxonomy role; the gate admits only `proposalRoles` names. | **\*[INFERENCE — not executed]** Exercising the alias path reads the operator's live global routing config, which the round's PROVINCE rule forbids a lane instrument to read, so this is code-reading only. If it holds, any `modelAlias` wave is refused `ROLE_UNKNOWN` at admission while the validator accepts it. This round passes `model` nowhere, so no current trigger. |

## 1b. The fourth question: double judgment vs gate-only rule

**Both tools refuse (double judgment)** — the gate's token ← the validator's refusal:

| Gate token | Validator counterpart | Agreement |
|---|---|---|
| `PLANNER_SEAT` (`:222`) | `unknown_role` (`:988`, `planner` not in `SWARM_ROLES`) | consistent, but the gate's refusal is unconditional (F14) |
| `ROLE_UNKNOWN` (`:223`) | `unknown_role` (`:988`) | consistent while the two vocabularies match (F3) |
| `BAND` (`:199`) | `too_few_lanes` / `wave_too_wide` (`:1083`, `:1091`) | **not** consistent: different populations (F1) |
| `SEAT_DUPLICATE` (`:216`) | `duplicate_name` (`:1200`) | **not** consistent: case-insensitive vs case-sensitive, and different name grammars (F10) |

**Gate-only rules** (the validator never sees the `.ready`, the `l1`, the attack/connector
metrics, or the context prose): `READY_KEYS`, `LANE_MISMATCH`, `ROUND_MISMATCH`,
`WAVE_MISMATCH`, `L1_ABSENT`, `L1_SEAT_COLLISION`, `L1_UNRESOLVED`, `AGENTS_ABSENT`,
`AGENTS_MALFORMED`, `POLICY_ABSENT`, `POLICY_MALFORMED`, `WAVE_BINDING`,
`DISPATCH_WAVE`, `REPORT_DEST_DUPLICATE`, `CONTEXT_LANE_ROOT`, `SCRATCH_ROOT`,
`TASK_LANE_ROOT`, `RELATIVE_WAVE_PATH`, `REPORT_TRAILER`, `ATTACK_SHARE`,
`CONNECTOR_COUNT`, and — in the strict form — `GODSPEED` (the validator *repairs*
absence instead of refusing it, `:1263-1265`).

**Verdict asymmetries measured here:**

- gate accepts / validator refuses: lowercase-initial seat names (F10); >256 lanes (F2);
  `modelAlias` card agents (F15, inference); a dispatch with no `wave`/`schema` (F11).
- gate refuses / validator accepts: resume-heavy waves at a band edge (F1);
  `/skill:godspeed` with a suffix or a leading blank line (F5); a relative `Report:`
  trailer without the context phrase (F6); an item prose path under
  `.ufo/waves/round-N/` (F13); `ProbeA`/`Probea` (F10); a policy with no wave band (F9,
  where the gate is the stricter one).

## 2. What actually agrees (measured, so the table is not read as wholesale drift)

- **Role sets:** policy `omp-native-v1.proposalRoles` (`ufo-wave-policy.json:104`), policy
  `devin-native-v1` (`:217`), validator `SWARM_ROLES` (`:265`), and
  `collect-omp-native-handoff-lib/base.mjs` `MANDATORY+OPTIONAL_PROPOSAL_ROLES` are
  **identical as sets and in order** — ten roles. No role is accepted by one tool and
  refused by the other *today*.
- **Band values:** with `UFO_CONFIG_PATH` pointing at the campaign policy, the hub loader
  and the gate read the same `8 : 16` (policy `:89-90`). The live handoff reads
  `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1`.
- **Refusals both tools share:** `planner`, `distiller`, `labrat`, `main` are refused by
  the validator (`unknown_role`) and by the gate (`PLANNER_SEAT` / `ROLE_UNKNOWN`);
  `sentinel` is admitted by both.
- **The frozen C1 predicate holds on this tree:** `C82_C1: HELD held=22/22`, exit 0, and
  its own selftest arm is `cases=50` pass. The live gate run is `READY`.

## 3. Commands run (every number and verdict above)

1. Frozen counter (read-only):

   ```
   cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
   node .ufo/waves/round-82/probe/probe82-c1.mjs --set c1 \
     --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin
   ```
   → `C82_C1: HELD held=22/22`, exit 0; `selftest ok exit=0 cases=50`.

2. The gate on this wave's own handoff:

   ```
   node scripts/ready-handoff.mjs --round 82 --wave w1 \
     --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json \
     --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --json
   ```
   → `verdict: READY`, `seats: 14`, `attack: 4`, `connectors: 1`, `findings: []`, exit 0.

3. Band-population probe (scratch; validator module called in-process with an injected
   policy and `UFO_PROJECT_ROOT` pointed at the scratch fixture; the emitted payload is
   then handed to `judge()` imported from the lane tool):

   ```
   cd /fast/scratch/hyaku/kumitate-r82/K82ScoutReconC1
   UFO_PROJECT_ROOT=$PWD/fixture node band-probe.mjs
   ```
   Selected output:
   - A: validator `counts {spawn:10, resume:6, total:16}`, band `[12,16]`, **accepted**;
     dispatch `taskCallTasks: 10`; gate `DRIFT` — `BAND: 10 seats outside 12:16 (policy)`.
   - B: `{spawn:10, resume:8}` under band `8:16` → validator `wave_too_wide: a wave
     carries at most 16 lanes (got 18)`.
   - C: policy without a wave band → validator **accepted**, reported band `[null, null]`.
   - D: policy `waveMaxLanes: 300` → validator reports `300`, hard ceiling `256`.
   - E: first line `/skill:godspeed extra` → validator accepted, gate `GODSPEED`.
   - F: 257 tasks at band `8:300` → gate `READY`, `seats: 257`.
   - G: first line `""` (blank line before the invocation) → validator accepted, gate
     `GODSPEED`.

4. Policy load, role, and hard-ceiling probe:

   ```
   node extra-probe.mjs        # hub loadSwarmPolicy + planSwarmWave, no writes
   ```
   → campaign policy as the validator reads it: `waveMinLanes 8, waveMaxLanes 16,
   maxLanes 256`; repo default `config/ufo.json`: `minLanes 32, waveMinLanes 32,
   waveMaxLanes 256, maxLanes 256`;
   `role_labrat|planner|distiller|main` → `unknown_role`; `role_sentinel` → `accepted`;
   `wide257` → `too_many_lanes: wave has 257 lanes; the cap is 256`.

5. Gate on a band-less policy:

   ```
   UFO_PROJECT_ROOT=$PWD/fixture node policy-gap.mjs
   ```
   → `fail-closed POLICY_MALFORMED` for both a policy with no wave keys and one with a
   lone `waveMinLanes` (logical axis: the validator derives, the gate refuses).

6. Name grammar and trailer wording:

   ```
   UFO_PROJECT_ROOT=$PWD/fixture2 node name-probe.mjs
   ```
   → `ProbeA`/`Probea` accepted by the validator, gate `SEAT_DUPLICATE`;
   `lowercase01` → validator `invalid_name`; context without the phrase → gate
   `REPORT_TRAILER: 12 seat(s) …`.

7. Gate-only laxity:

   ```
   UFO_PROJECT_ROOT=$PWD/fixture3 node laxity-probe.mjs
   ```
   → lowercase-initial names → gate `READY`; absolute `Report: /var/tmp/abs-N.md` →
   gate `READY`; item prose naming `.ufo/waves/round-82/plan.md` → validator accepted,
   gate `RELATIVE_WAVE_PATH`; dispatch with `wave` removed → gate `READY`.

8. Role-vocabulary comparison (exact sets and order, four sources):

   ```
   python3 - <<'EOF' … EOF   # parses policy json + both validator sources
   ```
   → `v1 == SWARM_ROLES as sets: True | same order: True`; same for `devin-native-v1`
   and `base.mjs`.

9. Line-number collection (read-only): `grep -n` and ranged `sed -n` over
   `ready-handoff.mjs`, `ufo-swarm-wave.mjs`, `ufo-mission-result.mjs`,
   `ufo-swarm-registry.mjs`, `ufo-swarm-agent-cards.mjs`, `config/ufo.json`,
   `ufo-wave-policy.json`, `plan.md`, `.ufo/prompts/kumitate-round-82.md`.

## 4. Unresolved / not chased (outside this seat's question)

- Other fleet consumers (`fleet-dispatcher.mjs`, `run-omp-native-trial.mjs`'s own
  ten-role check at `:3392`) were not traced for a third band/role judgment; only the
  two tools named in the seat were compared.
- The alias/card path (F15) was not executed, by PROVINCE rule.
- Whether the operator intends `sentinel` to count as an attack role is a policy
  decision, not a source fact; the three vocabularies simply disagree.
- Policy-edit timing (dispatch records the loader's clamped band, the gate re-reads the
  file at admission; nothing compares the two) was reasoned from the code, not measured.

Scratch used `/fast/scratch/hyaku/kumitate-r82/K82ScoutReconC1/` and was removed after
the run; no lane file was modified.
