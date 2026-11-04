# K83ScoutAdmission — gate admission vs the campaign validator's admission (round 83, C1)

Read-only recon seat. **No lane file, probe, control or fleet file was edited.** Scratch
(`/fast/scratch/hyaku/kumitate-r83/K83ScoutAdmission/`) was created, used and deleted.

## Pins

| artifact | revision / path | note |
|---|---|---|
| lane | `kumitate-shokunin` HEAD `eca7debd9aa6184a81f7e4abb43d507299a31f31` | `git status` shows `scripts/ready-handoff.mjs` unmodified |
| gate | `kumitate-shokunin/scripts/ready-handoff.mjs`, `CONTRACT = 'kumitate-ready-handoff-v3'` (G:30) | contract header, `judge()` whole, `render()`, CLI exit map (G:740-782) read verbatim; selftest only at its boundaries |
| validator | `ufo-fsd-alpha` @ `fb7157fcf14625be9d0b91bdd425a4b3212e4194` (clean tree) | `scripts/ufo-swarm-wave.mjs` (V), `scripts/ufo-mission-result.mjs` (H), `scripts/ufo-swarm-registry.mjs` (R), `scripts/ufo-swarm-agent-cards.mjs` (C) |
| frozen counter | `.ufo/waves/round-83/probe/probe83-c1.mjs` (P) | run, never edited; defect disclosed in §6 |

Abbreviations used in the tables: **G** = `kumitate-shokunin/scripts/ready-handoff.mjs`,
**V** = `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`, **H** = `ufo-fsd-alpha/scripts/ufo-mission-result.mjs`,
**R** = `ufo-fsd-alpha/scripts/ufo-swarm-registry.mjs`, **C** = `ufo-fsd-alpha/scripts/ufo-swarm-agent-cards.mjs`,
**P** = `kumitate-shokunin/.ufo/waves/round-83/probe/probe83-c1.mjs`.

---

## 1. What I ran

```
# frozen counter, hermetic fixtures under --work
mkdir -p /fast/scratch/hyaku/kumitate-r83/K83ScoutAdmission
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/probe/probe83-c1.mjs \
     --set c1 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
     --work /fast/scratch/hyaku/kumitate-r83/K83ScoutAdmission/c1

# gate-side divergence probes (fixtures under scratch, gate shelled as a subprocess)
node /fast/scratch/hyaku/kumitate-r83/K83ScoutAdmission/divergence.mjs

# validator-side probes: the real planSwarmWave + the real loadSwarmPolicy, ROOT repointed
# at scratch via UFO_PROJECT_ROOT; pure planning, no writes outside scratch
node /fast/scratch/hyaku/kumitate-r83/K83ScoutAdmission/validator.mjs
```

Observed (verbatim lines; full counter output is 29 lines, abridged to the two that matter):

```
C83_C1 arm band-total-resumes FAIL exit=1 want="READY_HANDOFF: READY wave=w1 seats=6 resumes=6 total=12" out=READY_HANDOFF: DRIFT ATTACK_SHARE (2/12 attack seats below 25%)
C83_C1: HELD held=27/27
EXIT=0
```

All 27 other arms printed `ok`. Probe runs are reproduced in §7.

---

## 2. The gate's admission surface (v3) — line map

| line | what it admits |
|---|---|
| G:123-140 | ready file present, regular file, realpath inside lane, JSON object |
| G:142-157 | `ready.dispatch` absolute, inside `<lane>/.ufo/waves/round-<N>/`, regular file, realpath inside |
| G:159-170 | dispatch parses; `taskCall.tasks` **or** `resumeSends` non-empty; context string when tasks exist |
| G:174-191 | policy read; `waveMinLanes`/`waveMaxLanes` integers, `lo>=1`, `hi>=lo`, `proposalRoles` non-empty string list |
| G:177-186 | `policyMaxLanes` (integer or 256), `dispatchMaxLanes` (payload `maxLanes`, else `payload.policy.maxLanes`), `cap = min(policyMaxLanes, dispatchMaxLanes ?? Inf, 256)` |
| G:196-206 | `--agents` accepts `{agents:[{id}]}` **or** `{members:{…}}` (keys are ids) |
| G:213-230 | READY_KEYS, LANE/ROUND/WAVE mismatch, L1_ABSENT, WAVE_BINDING stem, DISPATCH_WAVE, L1_UNRESOLVED |
| G:236-244 | `total = tasks.length + resumeSends.length`; `MAXLANES_IMPOSSIBLE` (tasks>0 ∧ cap<lo) → `MAXLANES` (total>cap) → `BAND` below (tasks>0 ∧ total<lo) → `BAND` above (tasks>0 ∧ total>min(hi,cap)) |
| G:245-253 | `DISPATCH_SCHEMA`, `DISPATCH_COUNTS` (`{spawn,resume,total}` must agree) |
| G:257-258 | `POLICY_ROLE_UNJUDGEABLE` (`proposalRoles ⊄ SWARM_ROLES`, set at G:51-53) |
| G:259-261 | `CONTEXT_LANE_ROOT`, `SCRATCH_ROOT` |
| G:271-323 | per seat: SEAT_SHAPE, ARTIFACT_KEYS (`name/agent/task` only), SEAT_NAME (`^[A-Za-z][A-Za-z0-9]{1,31}$`), SEAT_DUPLICATE (case-insensitive), ROLE_UNKNOWN, L1_SEAT_COLLISION, PLANNER_SEAT, GODSPEED, TASK_LANE_ROOT, REPORT_DEST_OUTSIDE/DUPLICATE, RELATIVE_WAVE_PATH, REPORT_TRAILER; then ATTACK_SHARE (G:322, attack set G:45) and CONNECTOR_COUNT (G:323) |

## 3. The validator's admission surface at `fb7157fc`

Policy (`loadSwarmPolicy`, H:2588-2686; injected-policy parity V:821-852):
H:2604-2619 object typing · H:2621-2626 `maxLanes` typing + 256 clamp · H:2628-2633 `rampBatchSize` ·
H:2635-2640 `rampIntervalMs` · H:2648-2654 `minLanes` (clamped to maxLanes) ·
H:2661-2668 `waveMinLanes` (**clamped to maxLanes**) · H:2666-2672 `waveMaxLanes` (clamped) ·
H:2673-2675 inversion · H:2677-2683 `globalRunnerCeiling`.

Spec (`planSwarmWave`, V:809-1300): spec object/unknown keys V:810-812 · `wave` ≤128 B V:855/257 ·
`context` ≤64 KiB V:864/165 · template placeholder V:870 · hoist boolean V:881 · reportDir relative
rules V:885→397-413 · registry path root containment V:431-441 · spec axes/modelAlias V:892-896 ·
`spec.maxLanes` typing + tightening V:898-908 · items array V:911-912 · item object/unknown key
V:927-931 · name grammar V:933/731-737 (R:33) · resume prohibitions V:936-956 · resume
message/prompt V:960-980 · spawn message V:982-983 · role required V:985-986 · role ∈ `SWARM_ROLES`
V:988-989/265-275 · lane meta V:991/761-784 · prompt/item presence and 64 KiB bounds V:999-1030 ·
modelAlias grammar + live-table resolution V:996-1060 · `agent = lane.card ?? lane.role` V:1288 →
card names C:57,135-137 · `empty_wave` V:1063 · `impossible_band` V:1074-1080 → `too_many_lanes`
V:1081 → `too_few_lanes` V:1084-1087 → `wave_too_wide` V:1090-1093 · `duplicate_expansion`
V:1097-1103 · `duplicate_resume_id` V:1104-1110 · `resume_unknown_member` V:1145-1151 · prior-registry
path/claim rules V:446-492/594 · `duplicate_name` V:1200 · registry document typing V:521-600 + R:112-160 ·
envelope marker V:212-220 (called at V:1254, V:1268, V:1279).

---

## 4. Table A — every validator admission check vs the gate

`arm` = the frozen arm in P that exercises the gate's counterpart. Coverage: **full** = an arm fails if the
gate's predicate is removed; **partial** = the gate performs an analogous check but no arm exercises it, or
the subject/semantics differ; **none** = the gate does not perform it (or performs it silently wrong).
`n/a` = not judgeable from the gate's four inputs (`ready`, `dispatch`, `policy`, `agents`).

| # | validator check | gate counterpart | arm | coverage |
|---|---|---|---|---|
| V1 | policy `sighting`/`dispatch`/`swarm` object typing — H:2606-2619 | POLICY_MALFORMED G:188-191 (undefined `lo/hi` fall through to the same refusal) | — | partial |
| V2 | `swarm.maxLanes` positive integer — H:2621-2624 (V:822-824) | none: non-integer falls back to 256 — G:179 | — | **none** (D4) |
| V3 | `maxLanes` clamped to 256 — H:2626, V:832-836 | `Math.min(…, MAX_SWARM_LANES)` G:185 | `maxlanes-ceiling` (P:172) | full |
| V4 | `swarm.rampBatchSize` positive integer — H:2628-2633 | none | — | **none** |
| V5 | `swarm.rampIntervalMs` positive integer — H:2635-2640 | none | — | **none** |
| V6 | `swarm.minLanes` positive integer — H:2648-2654 | none (never read) | — | **none** |
| V7 | `swarm.waveMinLanes` typing + **clamp to maxLanes** — H:2661-2668 | floor = raw `swarm.waveMinLanes` — G:177, used G:238/242 | `band-small` (P:209) covers the floor only | partial (D9) |
| V8 | `swarm.waveMaxLanes` typing + clamp, ceiling = min(hi, cap) — H:2666-2672, V:1068 | `Math.min(hi, cap)` G:244 | `band-wide` (P:211) | full |
| V9 | band inversion `waveMax < waveMin` — H:2673-2675, V:848 | `hi < lo` → POLICY_MALFORMED G:188-190 | — | partial |
| V10 | `dispatch.globalRunnerCeiling` positive integer — H:2677-2683, V:850-852 | none | — | **none** |
| V11 | spec object / `items` array shape — V:810, V:911-912 | DISPATCH_MALFORMED G:161-170 (payload shape only) | — | partial |
| V12 | unknown spec / item keys — V:811-812, V:927-931 | ARTIFACT_KEYS G:273-274 (task keys only) | — | partial |
| V13 | member name grammar `^[A-Z][A-Za-z0-9]{1,31}$` — V:731-737, R:33/138 | SEAT_NAME `^[A-Za-z][A-Za-z0-9]{1,31}$` G:275-276 | — | partial — **divergent** (D1) |
| V14 | duplicate member name, case-sensitive — V:1200, R:148 | SEAT_DUPLICATE, case-insensitive G:277-278 | — | partial (gate stricter) |
| V15 | resume entry prohibitions (role/item/axes/milestone/modelAlias) — V:936-956 | none: `resumeSends` is never inspected beyond `.length` — G:161,236 | — | **none** (D5) |
| V16 | resume `message`/`prompt` exclusivity + 64 KiB — V:960-980 | none | — | **none** (D5) |
| V17 | `message` forbidden on a spawn lane — V:982-983 | ARTIFACT_KEYS G:274 (any extra task field) | — | partial |
| V18 | spawn lane requires `role` — V:985-986 | ROLE_UNKNOWN when `agent` missing — G:279 | — | partial |
| V19 | role ∈ `SWARM_ROLES` — V:988-989/265-275 (set byte-equal to G:51-53) | ROLE_UNKNOWN + POLICY_ROLE_UNJUDGEABLE G:257-258/283-284 | `labrat-seat-refused` (P:199), `policy-role-unjudgeable` (P:190) | full |
| V20 | lane `axes`/`milestone` bounds — V:991/761-784 | n/a (not present in the payload; rendered into text) | — | n/a |
| V21 | prompt/item required — V:1021-1025 | SEAT_SHAPE "no task text" G:288 | — | partial |
| V22 | prompt ≤ `MAX_PROMPT_BYTES` (64 KiB) — V:164/251-252, V:1021-1022, V:1011-1012 | none | — | **none** (D8) |
| V23 | modelAlias grammar + live resolution; **task `agent` may be a generated card** — V:996-1060, V:1288, C:57/135-137 | ROLE_UNKNOWN: the card name is not a proposal role — G:284 | — | **none** — **divergent** (D10) |
| V24 | `empty_wave` — V:1063 | DISPATCH_MALFORMED G:165-167 | — | partial |
| V25 | `impossible_band` (spawns>0 ∧ ceiling<floor) — V:1074-1080 | MAXLANES_IMPOSSIBLE G:236-238, **same ordering before MAXLANES** | `maxlanes-impossible` (P:170) | full |
| V26 | `too_many_lanes` total>cap — V:1081 | MAXLANES G:239-240 | `maxlanes-policy` (P:166), `maxlanes-dispatch` (P:168) | full |
| V27 | `too_few_lanes` spawns>0 ∧ total<floor — V:1084-1087 | BAND below G:241-242 | `band-small` (P:209) | full |
| V28 | `wave_too_wide` spawns>0 ∧ total>ceiling — V:1090-1093 | BAND above G:243-244 | `band-wide` (P:211) | full |
| V29 | band total counts **spawns + resumes** — V:1061, used V:1074/1081/1084/1090 | `total = tasks.length + resumeSends.length` G:236 | `band-total-resumes` (P:161) **FAILS**; `resume-only-exempt` covers only the exemption | **none** (§6.2) |
| V30 | resume-only wave band-exempt — V:1074/1084/1090 (`spawns.length > 0` guards) | `tasks.length > 0` guards G:237/241/243 | `resume-only-exempt` (P:163) | full |
| V31 | `duplicate_expansion` (pairwise-distinct prompts) — V:1097-1103 | none (task texts are never compared) | — | **none** (D6) |
| V32 | `duplicate_resume_id` — V:1104-1110 | none | — | **none** (D5) |
| V33 | `resume_unknown_member` (registry ownership) — V:1145-1151; record-time V:1763 | none; L1_UNRESOLVED G:229-230 is a different subject (the L1 id, not a resume id) | `agents-members-nol1` (P:193) exercises the L1 subject | **none** (D5) |
| V34 | `reportDir` relative-path rules + root containment — V:397-413, V:431-441, V:885 | REPORT_DEST_OUTSIDE G:303-307 (per-seat trailer destination inside the lane) | `report-dest-outside` (P:230) | full (analogue) |
| V35 | registry document: schema, member names, agentId, duplicate names, 1 MiB — R:27/30/33/112/138/148, V:515-600 | `--agents` G:198-205: reads `members` keys, **no schema/name/agentId checks** | `agents-members` (P:192), `agents-malformed` (P:195) | partial — **divergent** (D2) |
| V36 | Godspeed envelope: ≤1 marker, terminal — V:212-220 | GODSPEED: first line must be exactly `/skill:godspeed` G:289-290; no marker count | `godspeed-missing` (P:234) | partial — **divergent** (D7) |

Tally counted from the rows above: **full 9** (V3, V8, V19, V25, V26, V27, V28, V30, V34) · **partial 13**
(V1, V7, V9, V11, V12, V13, V14, V17, V18, V21, V24, V35, V36) · **none 13** (V2, V4, V5, V6, V10, V15, V16,
V22, V23, V29, V31, V32, V33) · **n/a 1** (V20) → 36 rows. Judgeable denominator = 36 − 1 (`V20` is not in the
payload) = **35**.

---

## 5. Table B — gate checks with no validator counterpart

### B1 — lane-owned handoff contract (the validator has no such concept)

`READY_KEYS` G:213 · `LANE_MISMATCH` G:216 · `ROUND_MISMATCH` G:217 · `WAVE_MISMATCH` G:218 ·
`L1_ABSENT` G:219 · `WAVE_BINDING` G:221-222 · `DISPATCH_WAVE` G:225-227 · `L1_UNRESOLVED` G:229-230 ·
`CONTEXT_LANE_ROOT`/`SCRATCH_ROOT` G:259-261 · `SEAT_SHAPE` G:272/288 · `SEAT_NAME` G:275-276 ·
`SEAT_DUPLICATE` G:277-278 · `L1_SEAT_COLLISION` G:280-281 · `PLANNER_SEAT` G:283 ·
`TASK_LANE_ROOT` G:291 · `RELATIVE_WAVE_PATH` G:311-313 · `REPORT_TRAILER` G:315-320 ·
`REPORT_DEST_DUPLICATE` G:308 · `ATTACK_SHARE` G:322 · `CONNECTOR_COUNT` G:323 ·
fail-closed `READY_ABSENT/UNSAFE/MALFORMED`, `DISPATCH_PATH/ABSENT/PATH_UNSAFE`, `POLICY_ABSENT`,
`AGENTS_ABSENT` G:123-157/175/198.

These over-judgments are deliberate (the `.ready` contract is lane-owned) and three of them are *stricter than
the validator*: the attack share, the connector cap, and requiring the leading `/skill:godspeed` (the validator
injects it at V:1263-1265 instead of requiring it). `PLANNER_SEAT` (G:283) is the same refusal the validator
reaches through `unknown_role` (V:989) — different token, same outcome.

### B2 — cross-checks over producer output (the validator is the producer, not a consumer)

`DISPATCH_SCHEMA` G:245-247 vs V:153/1452 · `DISPATCH_COUNTS` G:249-253 vs V:1441 ·
`POLICY_ROLE_UNJUDGEABLE` G:257-258 — the validator never reads `proposalRoles` (grep: no
`proposalRoles` in V) and never validates an inbound dispatch payload at all.

Arms with no validator predicate behind them: `tool-v3-contract`, `clean-ready` (baseline),
`dispatch-schema`, `dispatch-counts`, `policy-role-unjudgeable`, `agents-array-shape`, `attack-reachable`,
`attack-share-low`, `connector-cap`, `wave-binding-stem`, `dispatch-wave-mismatch`, `l1-seat-collision`,
`maxlanes-dispatch` (the payload field `maxLanes` is never emitted by V; V emits `policy.maxLanes`, V:1360).

---

## 6. Counter disclosures (defects disclosed, not edited)

### 6.1 The counter declares 27 arms and contains 28

`P:21` `const ARMS = 27;` but there are 28 `arm(...)` call sites (P:154, 158, 161, 163, 166, 168, 170, 172, 180,
183, 190, 192, 193, 194, 195, 199, 202, 204, 206, 209, 211, 218, 220, 223, 227, 230, 234, 240). At the
measured revision exactly one arm fails, so `held = 27` and the verdict line prints `HELD held=27/27` with a
`FAIL` arm line in the same output. **The predicate is satisfied by arithmetic coincidence**: if the failing
arm were repaired, `held` would be 28, `held === ARMS` false, the verdict would print `UNMET held=28/27` and the
counter would exit 1 — the frozen predicate would become unreachable. The plan's kill rules (K1-K4) do not
cover this shape.

### 6.2 The one failing arm is the C1 claim's central arm

`band-total-resumes` (P:161) builds `seats=6, attack=2, resumes=6` → total 12, attack 2/12 = 16.7 % < 25 %, so
the gate refuses `ATTACK_SHARE` before the band is ever judged. The fixture does not isolate the predicate it
was written for (a resume-inclusive total *inside* `8:16` reading READY). Consequence: no passing arm
demonstrates plan §C1 item 1's inclusive total; only the exemption half (`resume-only-exempt`) is evidenced.

### 6.3 Gate outcomes no frozen arm exercises

Findings: `READY_KEYS`, `LANE_MISMATCH`, `ROUND_MISMATCH`, `WAVE_MISMATCH`, `L1_ABSENT`,
`CONTEXT_LANE_ROOT`, `SCRATCH_ROOT`, `SEAT_SHAPE`, `ARTIFACT_KEYS`, `SEAT_NAME`, `SEAT_DUPLICATE`,
`PLANNER_SEAT`, `TASK_LANE_ROOT`, `RELATIVE_WAVE_PATH`, `REPORT_TRAILER` (15).
Refusals: `READY_ABSENT`, `READY_UNSAFE`, `READY_MALFORMED`, `DISPATCH_PATH`, `DISPATCH_ABSENT`,
`PATH_UNSAFE`, `DISPATCH_MALFORMED`, `POLICY_ABSENT`, `POLICY_MALFORMED`, `AGENTS_ABSENT` (10).

Plan §C1 item 8 claims every v2 arm is carried; the *code* carries them, the *frozen counter* does not exercise
25 of the gate's outcomes.

---

## 7. Empirical divergence probes (gate vs validator, same fixture semantics)

Gate commands: `node <lane>/scripts/ready-handoff.mjs --lane <fixture> --round 83 --wave w1 --policy <fixture>/policy.json`
(plus `--agents` where named) via `divergence.mjs`. Validator commands: `planSwarmWave(spec, {policy})` with
`policy = loadSwarmPolicy(<fixture policy file>)`, `UFO_PROJECT_ROOT` = scratch, via `validator.mjs`.

| # | fixture | gate | validator | direction |
|---|---|---|---|---|
| D1 | seat name `k83S01` (lowercase-leading) | `exit=0 READY … seats=14` | `REFUSED code=invalid_name items[0].name must be CamelCase, 2-32 chars (/^[A-Z][A-Za-z0-9]{1,31}$/u)` | gate admits what V refuses |
| D2 | `--agents {"schema":"something-else","members":{"k83 main":{…},"KumitateR83":{…}}}` | `exit=0 READY … agents=2` | `REFUSED code=invalid_registry not a registry document` / `… member name k83 main invalid` | gate admits what V refuses |
| D3 | policy with `maxLanes`+`minLanes`, **no** `waveMinLanes/waveMaxLanes` | `exit=2 FAIL-CLOSED POLICY_MALFORMED` | `ADMITTED floor=8 ceiling=256 counts={"spawn":14,…}` | gate refuses what V admits |
| D4 | `swarm.maxLanes = "64"` | `exit=0 READY` (cap fell back to 256, G:179) | `REFUSED code=invalid_policy sighting.dispatch.swarm.maxLanes must be a positive integer` | gate admits what V refuses |
| D5 | `resumeSends`: one without `resume`, two resuming `SameId`, an unknown key | `exit=0 READY … resumes=3 total=13` | `REFUSED code=duplicate_resume_id items[14] and items[15] resume the same agent agent-1`; `REFUSED code=resume_unknown_member items[14].resume SameId is not a member …` | gate admits what V refuses |
| D6 | two seats, byte-identical prompt, distinct names | `exit=0 READY` | `REFUSED code=duplicate_expansion items[0] and items[13] expand to identical prompts` | gate admits what V refuses |
| D7 | one prompt with two nonterminal `| godspeed` markers | `exit=0 READY` | `REFUSED code=invalid_spec items[0] prompt carries 2 "| godspeed" markers` | gate admits what V refuses |
| D8 | one prompt 70 KiB (over `MAX_PROMPT_BYTES` 64 KiB) | `exit=0 READY` | `REFUSED code=invalid_spec items[0].prompt exceeds 65536 bytes` | gate admits what V refuses |
| D9 | policy `maxLanes=12`, band `16..20`, 12 spawn lanes | `exit=1 DRIFT MAXLANES_IMPOSSIBLE (effective cap 12 is below the wave floor 16 …)` | `ADMITTED floor=12 ceiling=12 cap=12 counts={"spawn":12,…}` (H:2665/2672 clamp) | gate refuses what V admits |
| D10 | 14 tasks whose `agent` is a generated card `ufo-<role>-m_flash` | `exit=1 DRIFT ROLE_UNKNOWN ×14 … role "ufo-reviewer-m_flash" is not a policy proposal role` | `V:1288` emits `agent: lane.card ?? lane.role`; `C:135-137` mints `ufo-<role>-<alias>` — a legal V dispatch | gate refuses a shape V itself emits (source-derived, not executed: V needs the live `modelRoles` table) |

Nine of ten are executed on both sides; D10 is executed on the gate side and read from source on the validator
side (marked above). Net: the gate is **weaker than the validator on payload content** (D1, D2, D4-D8) and
**stricter/unsound on policy arithmetic and alias routing** (D3, D9, D10).

---

## 8. Verdict

**PARITY: 9/35** — nine of the validator's thirty-five judgeable admission checks are exercised by a frozen arm
(V3, V8, V19, V25, V26, V27, V28, V30, V34); 13 more are mirrored but unexercised or semantic-only (V1, V7, V9,
V11-V14, V17, V18, V21, V24, V35, V36), and 13 have no gate check at all or a silently wrong one (V2, V4, V5,
V6, V10, V15, V16, V22, V23, V29, V31, V32, V33). With partial credit the same table reads **PARITY: 22/35**.

The band/cap/role core is a genuine parity: `total = spawns + resumes` (G:236 vs V:1061), the cap chain
`min(policy.maxLanes, spec.maxLanes, 256)` (G:186 vs V:898-908 + H:2626), `impossible_band` ordering before
`too_many_lanes` (G:236-240 vs V:1074-1081), `SWARM_ROLES` (byte-equal sets, verified programmatically), and the
dispatch schema string (byte-equal). The admission gaps are all on the *payload* side the validator renders:
resume entries, prompt bounds, duplicate expansion, duplicate resume ids, registry fidelity, envelope markers,
and the alias-card `agent` field.

---

## 9. What I could not verify

- D10's validator half was not executed: producing a card-named `agent` needs the live global `modelRoles`
  table (`readGlobalRoutingMaps`, V:1040-1060) and a declared alias; not reachable from this seat without
  touching the operator's global config.
- The campaign's actual dispatch is produced by the fleet dispatcher, not by `planSwarmWave`; whether the real
  `w1-dispatch.json` carries `maxLanes`, `counts` or card agents depends on that producer, which I did not read
  (out of this seat's scope).
- C2 (`omp-census.mjs`) was not examined: out of this seat's target.
- The gate's `--agents` was exercised only with the two shapes documented in G:196-205; other registry
  containers (array form is explicitly refused by the gate; the validator's wave-side reader also refuses it,
  R:118-127) were not probed further.
- No claim about other lane copies of `ready-handoff.mjs`; only this lane's `scripts/` was read.
