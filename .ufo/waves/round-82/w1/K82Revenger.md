# K82Revenger — validator seat/trailer/band behaviour, re-derived from its own bytes

Seat: revenger (attack). Scope: read-only. Domain tree `/home/vgpnk/Projects/ufo-fsd-alpha`
(never written); lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. No wave was dispatched,
no counter was run, no git/jj command was issued. Every number below carries the command that
produced it; every claim carries `file:line` and a quote.

Validator under inspection: `ufo-swarm-wave.mjs` (2071 lines) + the two modules it imports for
this surface — `ufo-mission-result.mjs` (policy loader, exit map) and `ufo-swarm-agent-cards.mjs`
(card names). Gate: lane `scripts/ready-handoff.mjs` (`kumitate-ready-handoff-v2`, 613 lines).

## 0. Short answer

The validator is a **closed** spec→dispatch compiler: ten hard-coded roles, a closed spec-key set,
a policy band read from `UFO_CONFIG_PATH` (never from the campaign policy by name), and a dispatch
that is **emitted to stdout** — it has no filename, no `.ready` concept, no `l1`, and no agent
registry of the gate's shape. Six of the gate's seven new C1 judgments therefore have **no
validator counterpart at all**; the two that do (`BAND`, and the role half of `ROLE_UNKNOWN`)
duplicate a validator rule only while the two authorities happen to hold the same numbers, and
both diverge silently the moment the policy file and the validator constant disagree — which the
gate cannot detect.

## 1. Behavour table (question → source → answer → gate redundancy)

| # | Question | Source (quote, `file:line`) | Answer (measured unless marked *source*) | Gate duplicates it? |
|---|---|---|---|---|
| V1 | Which roles may a spec declare today? | `ufo-swarm-wave.mjs:265-276` `export const SWARM_ROLES = new Set(["scout","reviewer","critic","connector","sentinel","executor","mutation-tester","revenger","simplifier","scribe"]);` — with `:263-264` "planner/distiller/labrat/Main are frozen-topology seats and can never be swarm lanes." | Exactly those ten. Probe `role-connector-ok` → `ok:true`. | **Yes (content), no (authority).** Gate `:223` reads the same ten from `--policy`'s `nativeProfiles["omp-native-v1"].proposalRoles`; the validator never reads that key (§V4). |
| V2 | What does an unknown role do — refuse, or pass through? | `ufo-swarm-wave.mjs:988-989` `if (typeof raw.role !== "string" \|\| !SWARM_ROLES.has(raw.role)) { fail("unknown_role", …) }`; missing role `:986` `fail("role_required", …)` | **Hard refusal before any lane is minted.** Measured: `labrat` → `unknown_role`, `planner` → `unknown_role`, `main` → `unknown_role` (§4 probes 1-3). No pass-through, no warn. | Gate `:222` `PLANNER_SEAT` and `:223` `ROLE_UNKNOWN` re-state the same refusal as a *finding* (DRIFT, exit 1) where the validator gives a typed error (exit 1, no payload). Same verdict, different vocabulary; a planner seat can never reach a validator-emitted dispatch. |
| V3 | Does the validator read `ufo-wave-policy.json`? | `ufo-swarm-wave.mjs:135-137` `return gatedConfigPath(ROOT, process.env.UFO_CONFIG_PATH, join(ROOT,"config","ufo.json"), "UFO_CONFIG_PATH")`; `ufo-mission-result.mjs:2272-2287`; `:2255` `ALLOW_EXTERNAL_TOOLS = process.env.UFO_FLEET_ALLOW_EXTERNAL_TOOLS === "1"` | **Not by name** — `grep -rn "ufo-wave-policy"` over the domain tree: 0 hits. It reads whatever `UFO_CONFIG_PATH` names, and only when that path is inside the project root **or** the external-tools flag is set. Measured (§4 probes 4-6): default → floor 32 (the domain `config/ufo.json` block); `UFO_CONFIG_PATH=<campaign policy>` alone → `EXEC_PATH_OUTSIDE_ROOT`; both set → band `8..16`. | **Yes, conditionally.** Gate `:152-163` reads the same `sighting.dispatch.swarm` block from `--policy`. Same numbers only because this wave's dispatcher pointed `UFO_CONFIG_PATH` at the same file — the dispatch proves it: `dispatch.policy = {source:"config", minLanes:8, waveMinLanes:8, waveMaxLanes:16, declaredMaxLanes:14}` vs the domain config's `32/32/256`. |
| V4 | Does it read the campaign's role vocabulary? | `grep -n nativeProfiles scripts/ufo-swarm-wave.mjs` → **no matches** | No. Roles are the `SWARM_ROLES` constant; `proposalRoles` is read only by `run-omp-native-trial.mjs:3392` and `project-devin-subagents.mjs:150`, not by the wave validator. | **No — this is a second authority, not a duplicate.** A policy edit to `proposalRoles` moves the gate and leaves the validator on the old ten; the gate then admits roles the validator refuses (`unknown_role`) and refuses roles it still accepts. |
| V5 | What does the validator do with a `wave` field in the dispatch it writes? | `ufo-swarm-wave.mjs:1453` `wave: plan.wave,` (in `planToDispatchPayload`); value from `:856` `optionalText(spec.wave, "wave", MAX_WAVE_BYTES)` (`:257` `MAX_WAVE_BYTES = 128`); segment rule `:421-423` `fail("invalid_spec", "wave must be a single path segment when it names the registry scope")` | **Copies it verbatim as a free label.** No binding to a filename (it writes none), no binding to a wave slot, no binding to a round. Absent → `"wave": null` is serialised (measured: `serialized contains wave key: true`). Measured: `"recon-1"` accepted; `"a/b"` → `invalid_spec`. | **No — gate-only.** Gate `:190-192` `DISPATCH_WAVE` accepts only `wave` or `*-<wave>`. Measured (§4 probe 12-14): `null` → DRIFT, `"recon-1"` → DRIFT, `"kumitate-r82-w1"` → READY. A validator-legal dispatch that omits `spec.wave` **always** DRIFTs. |
| V6 | Does it validate the dispatch filename, the `<wave>.ready`, or the round dir? | `ufo-swarm-wave.mjs:2056` `emitJson(output);` — the only dispatch "write"; `grep -n "writeFileAtomic"` → `:655` registry only. `grep -n "\.ready"` → no hits. | **No.** `run` prints the payload to stdout and persists only the member registry; the operator writes `w1-dispatch.json`. | **No — gate-only** (`WAVE_BINDING :187`). But note the lane already owns this rule: `scripts/inline-dispatch-evidence.mjs:278` `\|\| !String(ready.dispatch).endsWith(\`/round-${round}/${wave}-dispatch.json\`)` → `READY_MISMATCH`. That tool is not in this round's call path (`grep -rn "inline-dispatch" scripts/plan-before-ready.sh .omp` → 0 hits), so the gate's arm is the only live one this round. |
| V7 | Band check | `ufo-swarm-wave.mjs:1067-1068` `const laneFloor = policyFloor; const laneCeiling = Math.min(policyCeiling, cap);`; `:1074` `impossible_band`; `:1080` `if (total > cap) fail("too_many_lanes"…)`; `:1083` `if (spawns.length > 0 && total < laneFloor) fail("too_few_lanes"…)`; `:1089` `if (spawns.length > 0 && total > laneCeiling) fail("wave_too_wide"…)`; loader clamp `ufo-mission-result.mjs:2666-2678` | Enforced at **plan time**, on `total = spawns + resumes`, against `min(policyCeiling, cap)` where `cap = min(policyMaxLanes, spec.maxLanes)`. Resume-only waves are exempt. Measured: 7 → `too_few_lanes`, 8 → ok, 17 → `wave_too_wide`, 15 with `spec.maxLanes:14` → `too_many_lanes`. | **Partly — and the residual is a hole.** Gate `:199` `if (tc.tasks.length < lo \|\| tc.tasks.length > hi)` uses the **policy** band and ignores `spec.maxLanes`/`dispatch.policy.maxLanes`. Measured (§4 probe 15): 15 seats with `declaredMaxLanes:14` → gate **READY**, validator `too_many_lanes`. |
| V8 | Spec-key validation | `:278` `const SPEC_KEYS = new Set(["wave","context","template","reportDir","maxLanes","items","priorRegistry","axes","milestone","hoist","modelAlias"]);` `:812` `fail("invalid_spec", \`unknown spec key …\`)`; items `:279`/`:930` | **Closed set, both levels.** Measured: `seats:14` → `invalid_spec unknown spec key "seats"`. | **No — gate-only** (there is nothing to duplicate: the validator never sees the gate's inputs). |
| V9 | Duplicate lane names / duplicate report destinations | `:1200` `if (usedNames.has(name)) fail("duplicate_name", …)` — exact-string `Set`; trailer `:225-227` `function reportInstruction(reportDir, name) { return \`Report: write your scoped findings to ${reportDir}/${name}.md\`; }` appended only when `reportDir !== null` (`:1254-1256`) | Names unique per wave ⇒ **validator-rendered destinations are unique by construction** (dest is a pure function of the unique name). Measured: 8-lane `reportDir` plan → `reportDests: 8`; round-82 dispatch → `distinctFirst: 14` of 14. | **Yes for validator-rendered trailers, no for operator prose.** Gate `:233-247` takes the **first** `Report:` line with a path-shaped token, so for round 82 it reads the validator's own trailer (14/14 seats carry exactly one `Report:` line — `withOperatorReportLine: 0`), i.e. `REPORT_DEST_DUPLICATE :244` cannot fire on this wave. It becomes live only against a hand-edited dispatch or an operator prompt that itself opens a `^Report:` line. |
| V10 | `/skill:godspeed` injection | `:170` `const GODSPEED_INVOCATION = "/skill:godspeed";` `:183-185` `return /^\s*\/skill:godspeed(?:\s\|$)/u.test(text);` `:1263-1265` `if (!opensWithGodspeedInvocation(text)) { text = \`${GODSPEED_INVOCATION}\n\n${text}\`; }` (hoisted path `:1279`) | Injected at the head, idempotent, never stacked; skipped for resume messages (`:1231` comment "The leading invocation is NOT injected"). | **No, and the gate is stricter.** Gate `:228-229` `if (firstLine !== '/skill:godspeed')` — an operator prompt opening `/skill:godspeed — note` passes the validator (regex allows a trailing space then anything) and DRIFTs the gate. Not reachable on a generated trailer; reachable on operator text. |
| V11 | Dispatch symlink / path escape | Gate `:135-136` `lstatSync` + `if (!lst.isFile()) throw new Refusal('DISPATCH_ABSENT', "dispatch is not a regular file: …")`; `:132` `DISPATCH_OUTSIDE`; `:139` `PATH_UNSAFE` | Validator writes no dispatch ⇒ no counterpart. (Amendment A1.2's measured refusal is reproduced by the gate's own selftest `dispatch-symlink-refused`, `:586-591`.) | **No — gate-only.** |

## 2. The seven new C1 judgments, classified

| Judgment (gate line) | Duplicates a validator rule? | Evidence |
|---|---|---|
| `WAVE_BINDING` `:187` | **No** — validator emits to stdout, never names a file. | V6. Duplicates the *lane's own* `inline-dispatch-evidence.mjs:278`, which this round does not call. |
| `DISPATCH_WAVE` `:190-192` | **No** — validator copies `plan.wave` and binds it to nothing. | V5; measured `null`/`recon-1`/`kumitate-r82-w1`. |
| `REPORT_DEST_DUPLICATE` `:244` | **Yes on validator-rendered trailers** (⇒ unreachable for a validator-emitted trailer, because `duplicate_name :1200` already makes the name unique); **no on operator `Report:` prose**. | V9; 14/14 seats carry only the rendered trailer. |
| `L1_SEAT_COLLISION` `:220` | **No** — the validator has no `l1` concept anywhere (`grep -n "\bl1\b" ufo-swarm-wave.mjs` → 0). | V6. |
| `L1_UNRESOLVED` / `AGENTS_ABSENT` / `AGENTS_MALFORMED` `:166-170,195` | **No**, and the shapes are incompatible: the validator's registry is `{schema,wave,createdAt,updatedAt,reportDir,members:{name:{agentId,role,item}}}` (`ufo-swarm-registry.mjs:27` `export const SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1";`), the gate wants `{agents:[{id}]}`. | Measured: `--agents .ufo/waves/round-82/w1/swarm-registry.json` → `FAIL-CLOSED AGENTS_MALFORMED`, exit 2. |
| `POLICY_ABSENT` / `POLICY_MALFORMED` + band/roles from `--policy` `:152-163` | **Partly.** Same block, same numbers *when the dispatcher points the validator at the same file*; different failure semantics. | Validator **defaults and clamps** a missing band (`ufo-mission-result.mjs:2648-2678`); the gate **requires** both integers. Measured: policy `{"swarm":{"minLanes":8,"maxLanes":64}}` → validator `plan ok seats=8 band=[8,64]`, exit 0; gate → `POLICY_MALFORMED`, exit 2. Roles: V4 — two authorities, silent desync. |
| dispatch-symlink arm `:135-136` | **No** — validator has no dispatch file. | V11. |

## 3. Divergences worth routing (gate claims vs validator behaviour)

1. **`BAND` ignores the effective cap** (`ready-handoff.mjs:199` vs `ufo-swarm-wave.mjs:1068,1080`). Measured: a 15-seat dispatch declaring `policy.maxLanes:14` is **READY** to the gate and **`too_many_lanes`** to the validator. The gate also never reads `dispatch.policy`, `dispatch.counts` or `dispatch.registry` (`grep "dispatch\.counts\|dispatch\.policy"` → 0 hits), so a dispatch whose `counts.total` disagrees with `tasks.length` is invisible.
2. **`BAND` counts spawn lanes, the validator counts spawn+resume** (`tc.tasks.length` vs `total`, `ufo-swarm-wave.mjs:1080,1083,1089`). A 7-spawn + 1-resume wave is legal to the validator (`total = 8`) and BAND-fails the gate (7 < 8). *Source-derived; not measured (a legal mixed wave needs a populated owner registry).*
3. **Resume-only waves**: the validator admits them and emits `taskCall: null` (`ufo-swarm-wave.mjs:1470-1471`; measured `resume-only-dispatch → taskCall:null`), the gate fails closed `DISPATCH_MALFORMED` (`:147-148`) because it demands `taskCall.tasks` non-empty. The gate therefore refuses a validator-legal payload class.
4. **Aliased seats**: the validator dispatches `agent: lane.card ?? lane.role` (`:1288`) where the card is `ufo-<role>-<alias>` (`ufo-swarm-agent-cards.mjs:136`, measured `ufo-scout-m_flash`). The gate's role check is `seatRoles.has(task.agent)` (`:223`), so **every aliased seat DRIFTs** — measured. Round 82 carries no aliases, so the wave passed; the campaign note (`ufo-wave-policy.json` swarm.note) names `m_flash`/`m_zfl`/`m_antigravity`, so the channel is expected.
5. **`ATTACK` contains `labrat`** (`ready-handoff.mjs:41`) — a role the validator refuses at `:988`; the arm is dead (and the gate returns before counting when the role is not a proposal role, `:223`). `PLANNER_SEAT :222` likewise re-states `unknown_role`.
6. **`GODSPEED` exactness** (§V10): gate exact-match `firstLine`, validator regex with `(?:\s|$)`.

## 4. Minimum probes (each run; none dispatches a wave)

Domain-tree reads are pure-function calls; the gate is run against a hand-built fixture under
scratch. Scratch: `/fast/scratch/hyaku/kumitate-r82/K82Revenger/`.

```sh
# P0 usage surface — there is no --help; the verb list is the usage JSON, exit 64
node /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs --help
# → {"schema":"ufo-swarm-wave-error-v1","code":"usage","message":"Usage: … plan|run|record …"}  EXIT=64

# P1-P3 role allow-list (pure function, injected policy — no config read)
node probe.mjs   # calls planSwarmWave(spec,{policy}) from ufo-swarm-wave.mjs
#   role-labrat  → unknown_role "items[0].role \"labrat\" is not a swarm role"
#   role-planner → unknown_role
#   role-main    → unknown_role
#   SWARM_ROLES  → connector,critic,executor,mutation-tester,revenger,reviewer,scout,scribe,sentinel,simplifier

# P4-P6 policy source (the three-way proof that ufo-wave-policy.json is reached only via UFO_CONFIG_PATH)
SPEC='{"items":[{"prompt":"lane 0","role":"scout"}, … 8 lanes …]}'
node  …/ufo-swarm-wave.mjs plan --spec-json "$SPEC"
# → too_few_lanes "needs at least 32 lanes (got 8)"        (domain config/ufo.json)
UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json node … plan --spec-json "$SPEC"
# → EXEC_PATH_OUTSIDE_ROOT
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 UFO_CONFIG_PATH=…/ufo-wave-policy.json node … plan --spec-json "$SPEC"
# → plan.policy {source:"config",minLanes:8,waveMinLanes:8,waveMaxLanes:16}  EXIT=0

# P7 spec-key closure
node probe.mjs   #   spec-key-unknown → invalid_spec "unknown spec key \"seats\""

# P8 band (plan-time)
node probe.mjs   #   band-7 → too_few_lanes; band-8-ok → ok; band-17 → wave_too_wide;
                 #   cap-14-with-15 → too_many_lanes "cap is 14"; cap-14-with-14-ok → ok

# P9 wave field is copied, not bound
node probe.mjs   #   wave-label-recon1 → ok, dispatch.wave "recon-1"; wave-label-slash → invalid_spec

# P10 duplicate names / report destinations
node probe.mjs   #   duplicate-name → duplicate_name "lane name Dup is not unique"; report-dir → reportDests 8

# P11 resume-only payload
node probe.mjs   #   resume-only-dispatch → taskCall null, wave "w1"

# P12-P15 gate, hand-built lane tree (scratch only)
node fixture.mjs "$PWD/fx" && node …/ready-handoff.mjs --lane $PWD/fx/kumitate-shokunin --round 82 --wave w1 \
  --policy …/ufo-wave-policy.json --ready …/w1.ready
#   wave-null      exit=1 DRIFT DISPATCH_WAVE (dispatch.wave=null …)
#   wave-label     exit=1 DRIFT DISPATCH_WAVE (dispatch.wave="recon-1" …)
#   wave-good      exit=0 READY wave=w1 seats=8 attack=3/8 connector=1 …
#   fifteen-seats  exit=0 READY wave=w1 seats=15 …   (declared maxLanes 14 — validator: too_many_lanes)

# P16-P17 gate against the real wave (read-only)
node scripts/ready-handoff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 82 --wave w1 \
  --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json --ready .ufo/waves/round-82/w1.ready
# → READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 roles=… policy=ufo-wave-policy.json agents=none   exit=0
node scripts/ready-handoff.mjs … --agents .ufo/waves/round-82/w1/swarm-registry.json
# → FAIL-CLOSED AGENTS_MALFORMED (agents registry must be {agents:[{id}]})   exit=2

# P18 gate otherwise-sane arms still pass
node scripts/ready-handoff.mjs --selftest --work "$PWD/st"
# → READY_HANDOFF_SELFTEST: 52/52 pass / VERDICT: PASS   exit=0
```

## 5. Findings for the round's "one authority" test

- The gate's **policy read is the right authority move** for the band — it is the same block the
  validator reads, from the same file, when the dispatcher wires `UFO_CONFIG_PATH` to it (proved by
  `dispatch.policy.source = "config"` and `minLanes 8` in the wave's own dispatch). The residual
  defect is only that the gate checks `waveMinLanes..waveMaxLanes` and not the effective
  `min(ceiling, spec.maxLanes)` the validator actually enforces (§3.1).
- The gate's **role read is a second authority, not a shared one**: the validator's allow-list is a
  constant in `ufo-swarm-wave.mjs:265`, the gate's is `policy.nativeProfiles["omp-native-v1"].proposalRoles`.
  They agree today (ten-ten, measured). Any policy edit desyncs them with no detection path.
- `REPORT_DEST_DUPLICATE` is the one new judgment that **claims a guarantee the validator already
  supplies** for validator-rendered trailers (`duplicate_name :1200`); it is only additional evidence
  against operator-authored `Report:` prose, which is what this wave's 14 seats do not contain.
- The gate cannot judge three classes of validator-legal payload: resume-only (`taskCall:null`),
  aliased seats (`agent: ufo-<role>-<alias>`), and policy files that rely on the band fallback.
  It fails closed on the first two and on the third.

## 6. Confidence

| Claim | Confidence | Why |
|---|---|---|
| Role allow-list, unknown-role refusal, spec-key closure | **High** | read + executed (`unknown_role`, `invalid_spec`) |
| Policy source / `UFO_CONFIG_PATH` / outside-root gate | **High** | three executed runs, three distinct outcomes |
| `wave` copied, not bound; `null` serialised | **High** | read `:1453` + executed serialisation and gate fixtures |
| Validator writes no dispatch file / reads no `.ready` | **High** | `writeFileAtomic` only at `:655`; `grep "\.ready"` 0 hits; `emitJson` at `:2056` |
| Duplicate-name ⇒ unique validator-rendered destinations | **High** | `:1200` + `reportDests 8/8` and `distinctFirst 14/14` |
| Gate admits 15 seats at `maxLanes 14` | **High** | executed (gate READY / validator `too_many_lanes`) |
| Mixed-wave band counting diverges (spawn vs total) | **Medium** | both predicates read literally (`:199` vs `:1080/1083/1089`); not executed (needs an owner registry) |
| Aliased seats DRIFT | **High** | executed (`ROLE_UNKNOWN` on `ufo-scout-m_flash`) + `:1288`/card name |
| `--agents` cannot read the validator's registry | **High** | executed (`AGENTS_MALFORMED`) |

No credential material was read. No file in the domain tree, the lane's frozen receipts, `.ufo/state`,
or the fleet repo was modified.
