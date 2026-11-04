source: S240 /home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs @ fb7157fc (opened 2026-11-04); S241 .../scripts/ufo-swarm-registry.mjs @ fb7157fc (opened 2026-11-04); lane gate /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/ready-handoff.mjs @ eca7debd
verified-at: 2026-11-04 (K83ScribeAdmission; read-only source read at both pins — the dispatcher was not executed)
recheck: on-release

# Dispatcher admission surface — the arithmetic a lane gate has to mirror

Scope: what `ufo-swarm-wave.mjs` (`plan`/`run`) admits or refuses before a lane exists, and how
`ready-handoff.mjs` v3 re-derives those verdicts from this lane's handoff files. The dispatcher
is operator-side and read-only here: this entry records its rule set, it does not run it.

Citation keys: **W** = `scripts/ufo-swarm-wave.mjs`, **R** = `scripts/ufo-swarm-registry.mjs`
(both `fb7157fc`, 2026-10-25); **G** = `scripts/ready-handoff.mjs` (`eca7debd`, 2026-11-04).
Line numbers are the named file at that pin.

## Band: one total, two terms

- One pass validates *and* classifies: `lanes`, `spawns`, `resumes` are filled together by
  `file()` (W922-924: `lane.kind === "resume" ? resumes : spawns`), and `total = lanes.length`
  (W1061) is spawn items **plus** resume items — never spawn items alone.
- Both lists hold the same lane objects in spec order (W915-918), so no later traversal can
  disagree with the total they were counted from.
- Every band arm except the cap is spawn-guarded (`spawns.length > 0`, W1074/W1083/W1089): a
  resume-only wave carries no band obligation. The cap arm is **not** guarded (W1080), so a
  resume-only wave must still fit the cap.

## Cap: three clamps, one direction

1. Policy: `policyMaxLanes = min(policy.maxLanes ?? MAX_SWARM_LANES, MAX_SWARM_LANES)`
   (W835-836); `MAX_SWARM_LANES = 256` (`ufo-mission-result.mjs:2572`, imported at W125).
2. Band: `policyFloor = min(waveMinLanes ?? minLanes ?? MIN_SWARM_LANES, policyMaxLanes)`
   (W837-841); `policyCeiling = min(waveMaxLanes ?? policyMaxLanes, policyMaxLanes)` (W842-846);
   inverted band → `invalid_policy` (W847-849).
3. Spec: a spec may only tighten — `declaredMaxLanes = spec.maxLanes`, then
   `cap = min(cap, spec.maxLanes)` (W898-909); `declaredMaxLanes` and `hardCeiling` ride the
   plan so the clamp stays visible (W1360-1366).

Effective band at check time: `laneFloor = policyFloor` (W1067), `laneCeiling =
min(policyCeiling, cap)` (W1068). The floor is deliberately *not* clamped to the spec cap
(W1064-1066); clamping it would make `impossible_band` unreachable.

## Ordering: feasibility before size

First match wins, in this order (W1074-1094):

| # | guard | refusal | lines |
|---|---|---|---|
| 1 | `spawns > 0 && laneCeiling < laneFloor` | `impossible_band` | W1074-1079 |
| 2 | `total > cap` | `too_many_lanes` | W1080-1082 |
| 3 | `spawns > 0 && total < laneFloor` | `too_few_lanes` | W1083-1088 |
| 4 | `spawns > 0 && total > laneCeiling` | `wave_too_wide` | W1089-1094 |

Arm 1 exists so a cap below the floor reports the fixable cause instead of a size complaint
naming the wrong fix (W1069-1073); arm 2's `cap` may be tighter than `laneCeiling`.

## Roles: a closed set of ten

`SWARM_ROLES` (W265-275) is exactly: scout, reviewer, critic, connector, sentinel, executor,
mutation-tester, revenger, simplifier, scribe. `planner`/`distiller`/`labrat`/`Main` are
frozen-topology seats and can never be swarm lanes (W262-264). A spawn lane with no role is
`role_required` (W985-987); a role outside the set is `unknown_role` (W988-990); a resume that
restates a role is `resume_role_forbidden` (W937-939) — the role minted the identity.

## Dispatch payload

`planToDispatchPayload` (W1441-1479) emits `ufo-swarm-wave-dispatch-v1` (constant W153):

- `policy: plan.policy` (W1454) — the **effective** cap travels in `policy.maxLanes`;
- `counts: plan.counts` (W1455) = `{spawn, resume, total}` (W1370);
- `taskCall: spawns.length > 0 ? {context, tasks} : null` (W1470-1471) — a resume-only wave is
  `null`, never an empty `tasks` array; `resumeSends: resumes` (W1472);
- `dispatch.calls = spawns.length > 0 ? 1 : 0`, `kind: "task"` (W1380-1382): one batched call
  per wave is structural, not prose.

## Registry shape

`SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1"` (R27). `normalizeRegistryDocument` refuses a
document whose `schema` differs (R112-114), then reads `parsed.members` — a **map**
`{name: entry}` (R126-131) unless the caller opts into `map-or-array` (R118-125). Names must
match `MEMBER_NAME_PATTERN` `/^[A-Z][A-Za-z0-9]{1,31}$/` (R33) and be unique (R141); the plan
writes `members: Object.fromEntries(memberEntries)` (W1404). There is no `agents` array in this
file: a reader expecting one judges a document no producer writes.

## The gate's parity arms

`judge()` (G114-345) reproduces the surface instead of importing it:

| gate finding | G lines | mirrors |
|---|---|---|
| `MAXLANES_IMPOSSIBLE` | G237-238 | W1074-1079, same precedence |
| `MAXLANES` | G239-240 | W1080-1082 |
| `BAND` (under / over) | G241-244 | W1083-1094; over-side `min(hi, cap)` |
| `DISPATCH_SCHEMA` | G246-248 | W153 / W1452 |
| `DISPATCH_COUNTS` | G249-254 | W1370 |
| `POLICY_ROLE_UNJUDGEABLE` | G257-258 | W265-275 (policy naming an unspawnable role) |
| `PLANNER_SEAT` | G283 | W262-264 |
| `ROLE_UNKNOWN` | G284 | W988-990 |

Total is `tasks.length + resumeSends.length` (G236); the cap is `min(policy, dispatch, 256)`
(G179-186), read from `dispatch.maxLanes` or `dispatch.policy.maxLanes` (G182-185) — the latter
is what W1454 emits. `--agents` takes `Object.keys(reg.members)` (G201-203) beside this lane's
`{agents:[{id}]}` (G198-200). Attack roles are the reachable subset (reviewer, critic,
mutation-tester, G45); `labrat` is outside `SWARM_ROLES` (G41-44).

## Limits

- **Read-only authority.** The validator lives in `ufo-fsd-alpha` and is not executed by this
  lane; every claim above is a source read at `fb7157fc`. A validator change re-opens this pin
  (`recheck: on-release`). The gate pins its copy of the role set and the schema string in
  comments naming that commit (G48-55), so drift becomes a visible code edit, not a silent
  widening.
- **Two re-derivable divergences.** The gate reads `lo`/`hi` unclamped (G177-178) where the
  dispatcher clamps both to `policyMaxLanes` (W837-846): a policy with `waveMinLanes > maxLanes`
  reads `MAXLANES_IMPOSSIBLE` at the gate while the dispatcher admits with the floor clamped.
  Live `scripts/hyaku/ufo-wave-policy.json` declares `waveMinLanes 8 ≤ maxLanes 256`, so it is
  inert. Second, the gate's registry branch only checks that `members` is a non-empty object
  (G201-203), not its `schema` stamp (R112-114): a foreign `{members:{…}}` file resolves `l1`.
- **Parity is asserted, not proven.** The gate is a second implementation by construction; the
  evidence is its own `v3 cases` selftest block (G690-744) plus the frozen counter
  `probe83-c1.mjs`, not a shared import from W.
