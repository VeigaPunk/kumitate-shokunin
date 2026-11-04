# K83Revenger — does the gate reproduce the dispatcher's verdict?

Seat: revenger (leaf). Write scope: this report only; every fixture lived under
`/fast/scratch/hyaku/kumitate-r83/K83Revenger/` (deleted before yield).
Measured revisions: lane `eca7debd9aa6184a81f7e4abb43d507299a31f31`, validator
`/home/vgpnk/Projects/ufo-fsd-alpha` at `fb7157fcf14625be9d0b91bdd425a4b3212e4194`
(`git diff fb7157fc -- scripts/ufo-swarm-wave.mjs scripts/ufo-mission-result.mjs
scripts/ufo-swarm-registry.mjs` is empty: the working tree IS the pinned bytes).
Node v24.21.0. No tool installed or upgraded.

## PARITY: 8 differences (4 defect, 4 truthful divergence)

| # | difference | direction | class |
|---|---|---|---|
| D1 | resume ownership (`resume_unknown_member`) is never judged | gate READY / validator refuse | **gate defect** |
| D2 | resume-lane shape (`invalid_resume_id`, `duplicate_resume_id`, per-item resume keys) never judged | gate READY / validator refuse | **gate defect** |
| D3 | duplicate expanded prompts (`duplicate_expansion`) never judged | gate READY / validator refuse | **gate defect** |
| D4 | policy band floor is not clamped to `maxLanes` (`impossible_band` reachable-by-clamp) | gate refuse / validator accept | **gate defect** (edge policy) |
| D5 | a policy without `waveMinLanes`/`waveMaxLanes` is refused, while the dispatcher falls back to its swarm band | gate fail-closed / validator accept | truthful (fail-closed tighten) |
| D6 | role vocabulary is the policy's `proposalRoles`, narrower than `SWARM_ROLES` | gate refuse / validator accept | truthful (policy authority) |
| D7 | lane-admission contract the dispatcher does not have (attack share, connector cap, godspeed line, lane-root mention, report destinations/trailers, seat names, ready↔dispatch binding, L1 rules) | gate can refuse / validator accept | truthful (gate-only contract) |
| D8 | `dispatch.schema`/`dispatch.counts` are asserted, but the dispatcher never consumes a dispatch document | gate-only | truthful (no reachable false refusal from `planSwarmWave` emission) |

## Four payload rows

| row | payload | validator (`planSwarmWave` at fb7157fc) | gate v3 (`scripts/ready-handoff.mjs`) | verdict parity |
|---|---|---|---|---|
| a | the round's own dispatch (`.ufo/waves/round-83/w1-dispatch.json`, 15 spawns / 0 resumes, policy cap 256, spec `maxLanes:16`) | ACCEPT `counts {spawn:15,resume:0,total:15}`, effective cap 16 | `READY` exit 0, `seats 15 resumes 0 total 15 cap 16`, `findings []` | **match** |
| b | 6 spawns + 6 resumes (12 lanes, band 8–16) | ACCEPT `counts {spawn:6,resume:6,total:12}`, cap 16 — **when the resume ids are owned** by this wave's registry or a declared `priorRegistry` | `READY` exit 0, `seats 6 resumes 6 total 12 cap 16` | **match** on band/cap counting; **D1/D2 open** for ownership and resume shape |
| c | resume-only wave (`taskCall:null`, 3 resumes) | ACCEPT `counts {spawn:0,resume:3,total:3}`, cap 256 (band-exempt: `spawns.length>0` guard) | `READY` exit 0, `seats 0 resumes 3 total 3 cap 256` | **match** on band exemption + cap; **D1/D2** on ownership/shape |
| d | 270-lane wave, policy `maxLanes:512` | REFUSE `too_many_lanes` — `cap = min(512, 256) = 256`, `270 > 256` | `DRIFT` exit 1, `MAXLANES` — `270 lanes exceed the effective cap 256 (policy maxLanes 512, dispatch maxLanes 256, hard ceiling 256)` | **match** (same ceiling, same verdict, different token) |

Diverging variants measured beside the rows (same fixtures, one dimension changed):

- row b, resume ids unknown to any registry → validator `resume_unknown_member`
  (`items[6].resume agent-b1 is not a member of this wave's registry or any declared priorRegistry`),
  gate `READY` exit 0 (D1).
- row c, `resume: "!!!bad id!!!"` → validator `invalid_resume_id`, gate `READY` (D2).
- row c, two resume rows naming one id → validator `duplicate_resume_id`, gate `READY` (D2).
- row c with 300 resumes (cap 256) → validator `too_many_lanes` (cap check precedes
  ownership), gate `DRIFT MAXLANES` — match.
- 8 spawns whose prompts are byte-identical (no `Report:` trailer) → validator
  `duplicate_expansion` (`items[0] and items[1] expand to identical prompts`), gate `READY` (D3).
- 256 spawns under policy `{maxLanes:256, minLanes:256, waveMinLanes:300, waveMaxLanes:300}`
  → validator ACCEPT (floor and ceiling clamp to 256, band 256..256), gate
  `DRIFT MAXLANES_IMPOSSIBLE` (D4).
- 15 spawns under a policy carrying only `maxLanes:256, minLanes:8` → validator ACCEPT
  (floor 8, ceiling 256), gate exit 2 `POLICY_MALFORMED` (D5).
- 15 spawns including `revenger` under a policy whose `proposalRoles` drops `revenger`
  → validator ACCEPT (`SWARM_ROLES` has it), gate `DRIFT ROLE_UNKNOWN` (D6).

## What the validator actually decides (reconstructed contract)

From `scripts/ufo-swarm-wave.mjs` at fb7157fc, admission order (each refusal throws
`SwarmWaveError` with the typed code):

1. spec object/keys → `invalid_spec`; injected policy typing → `invalid_policy`.
2. `policyMaxLanes = min(policy.maxLanes ?? 256, MAX_SWARM_LANES=256)`;
   `policyFloor = min(waveMinLanes ?? minLanes ?? 2, policyMaxLanes)`;
   `policyCeiling = min(waveMaxLanes ?? policyMaxLanes, policyMaxLanes)`;
   inverted → `invalid_policy` (`ufo-mission-result.mjs` clamps the same way before
   `planSwarmWave` ever sees a config policy).
3. per-item: spawn needs a role in `SWARM_ROLES` (`role_required`/`unknown_role`);
   resume forbids role/item/axes/milestone/modelAlias and message+prompt together.
4. `total = spawns + resumes`; `total === 0` → `empty_wave`;
   `cap = min(policyMaxLanes, spec.maxLanes)`; `laneCeiling = min(policyCeiling, cap)`.
5. `spawns>0 && laneCeiling < laneFloor` → `impossible_band`;
   `total > cap` → `too_many_lanes`; `spawns>0 && total < laneFloor` → `too_few_lanes`;
   `spawns>0 && total > laneCeiling` → `wave_too_wide`.
6. `duplicate_expansion`, `duplicate_resume_id`, then resume ownership against this
   wave's registry / `spec.priorRegistry` → `resume_unknown_member`.

Emission (`planToDispatchPayload`): `schema:"ufo-swarm-wave-dispatch-v1"`,
`policy.maxLanes = cap`, `counts {spawn,resume,total}`,
`taskCall: spawns>0 ? {context,tasks} : null`, `resumeSends`. The gate's dispatcher
predicates (band total, cap, impossible-before-too-wide order, resume-only exemption,
`ufo-swarm-wave-dispatch-v1`, counts agreement) reproduce steps 4–5 and the emitted
envelope. Everything in step 6 is absent from the gate.

## Evidence — commands and exact output

Counters (frozen, unedited, scratch `--work`):

```
$ TMPDIR=…/tmp node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane <lane> --work …/c1work
C83_C1: HELD held=27/27          # exit 0
$ TMPDIR=…/tmp node .ufo/waves/round-83/probe/probe83-c2.mjs --set c2 --lane <lane> --work …/c2work
C83_C2: HELD held=16/16          # exit 0
```

Row a, the lane's real files (read-only):

```
$ node scripts/ready-handoff.mjs --lane <lane> --round 83 --wave w1 \
    --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json --json
… "verdict": "READY", "agents": "none", "seats": 15, "resumes": 0, "total": 15,
  "cap": 16, "findings": []                                   # exit 0
```

The same run with `--agents .ufo/waves/round-83/w1/swarm-registry.json` (the
validator registry shape — accepted, `"agents": 15`) returns
`DRIFT` exit 1 with `L1_UNRESOLVED: ready.l1="KumitateR83" is not in …/w1/swarm-registry.json`.
That is D7: the wave registry registers the 15 seats; the L1 is not a member, and the
dispatcher has no L1 concept at all. The round's handoff is READY iff `--agents` is not
passed (or is passed with a registry that names the L1).

Row a validator reconstruction (imported `planSwarmWave`/`planToDispatchPayload`,
plan mode only — no registry write):

```
$ UFO_PROJECT_ROOT=…/vroot node validator-probe.mjs
a            ACCEPT counts {"spawn":15,"resume":0,"total":15} cap 16 declared 16 tasks 15 resumes 0
b            ACCEPT counts {"spawn":6,"resume":6,"total":12}  cap 16 declared 16 tasks 6  resumes 6
b-unowned    REFUSE resume_unknown_member | items[6].resume agent-b1 is not a member …
c            ACCEPT counts {"spawn":0,"resume":3,"total":3}    cap 256 declared None tasks None resumes 3
c-unowned    REFUSE resume_unknown_member | items[0].resume agent-c1 is not a member …
c-badid      REFUSE invalid_resume_id | items[0].resume must be an agent id (…)
d            REFUSE too_many_lanes | wave has 270 lanes; the cap is 256 (hard ceiling 256)
d2           ACCEPT counts {"spawn":256,"resume":0,"total":256} cap 256
e            ACCEPT counts {"spawn":15,"resume":0,"total":15}  cap 16 declared 16
```

Gate fixtures (hermetic lanes under scratch `<box>/kumitate-shokunin`, real gate
script invoked with `--lane <fixture>`; the lane contract — godspeed line, lane root,
scratch rule, per-seat report destinations — is satisfied in every fixture so the only
findings are the ones under test):

```
b-owned           exit 0 READY  seats 6 resumes 6 total 12 cap 16
b-unowned         exit 0 READY  seats 6 resumes 6 total 12 cap 16
c-owned           exit 0 READY  seats 0 resumes 3 total 3  cap 256
c-badid           exit 0 READY  seats 0 resumes 1 total 1  cap 256
c-dup             exit 0 READY  seats 0 resumes 2 total 2  cap 256
dupe-prompts      exit 0 READY  total 8 cap 16
empty             exit 2 FAIL-CLOSED DISPATCH_MALFORMED ("dispatch must carry taskCall.tasks or resumeSends")
d-270-policy512   exit 1 DRIFT  MAXLANES              seats 270 total 270 cap 256
d2-floor300       exit 1 DRIFT  MAXLANES_IMPOSSIBLE   seats 256 total 256 cap 256
e-no-wave-band    exit 2 FAIL-CLOSED POLICY_MALFORMED (… waveMinLanes/waveMaxLanes …)
f-policy-subset   exit 1 DRIFT  ROLE_UNKNOWN          seats 15 total 15 cap 16
c-300             exit 1 DRIFT  MAXLANES              total 300 cap 256
```

`empty` is the one case where the gate's fail-closed token replaces the dispatcher's
`empty_wave`; both refuse, so the verdict agrees.

## Where the gate's algorithm matches, line for line

- band total = `taskCall.tasks.length + resumeSends.length` (validator `counts.total`
  = spawns + resumes) — proven by rows b and c.
- `cap = min(policy swarm.maxLanes ?? 256, dispatch maxLanes / dispatch.policy.maxLanes,
  256)` — the validator's `min(policy.maxLanes, spec.maxLanes)` then the 256 constant;
  the dispatch's `policy.maxLanes` is the emitted effective cap, so the double-min is
  idempotent. Row d: both land on 256.
- impossible-before-too-wide: gate `tasks>0 && cap<lo` precedes `total>cap`; validator
  `impossible_band` precedes `too_many_lanes`. The two conditions coincide because
  `policyCeiling >= policyFloor` is enforced, so `min(policyCeiling,cap) < policyFloor`
  ⇔ `cap < policyFloor` — true for every policy whose band is declared inside the cap.
- resume-only band exemption (`spawns.length>0` guard) — rows c and c-300.
- `cap` still applies to resume-only waves — row c-300 (both refuse).

## What I could not verify

- The validator's `run` mode was never executed (forbidden: it persists a registry).
  Every validator verdict above is the plan function's own decision under an injected
  policy; `planToDispatchPayload` is the exported emitter, not `run`.
- D1/D2 were proved with a `priorRegistry` written under a scratch `UFO_PROJECT_ROOT`
  (`vroot/.ufo/scopes/prior/swarm-registry.json`); the real fleet registry was not read
  or written. The claim "the gate cannot judge ownership" is code-evident
  (`judge()` never loads a registry for resumes) and fixture-proven; the claim "the
  validator refuses unowned ids" was proven against the scratch registry only.
- D8's only false-refusal path — an entry carrying both `agent` and `resume`, which
  `planToDispatchPayload` pushes into both lists while `plan.counts` stays split — is
  reachable only through the exported payload boundary, never through `planSwarmWave`;
  I did not build a fake plan to exercise it. Marked inference.
- The lane contract (D7) was exercised only as far as needed to keep fixtures clean;
  the frozen counter covers its arms (27/27 HELD at this revision).

## Conclusion

For the four payloads named in the seat: the gate reproduces the dispatcher's verdict
on all four (accept/accept, accept/accept, accept/accept, refuse/refuse). It does not
reproduce the dispatcher's *admission* in general: three resume/duplicate predicates
that decide real refusals are unjudged (D1–D3), and one policy-clamp edge makes the
gate stricter than the dispatcher (D4). Those four are gate defects against the claim
"the gate judges the admission the dispatcher performs"; D5–D8 are deliberate
tightenings/gate-only rules and should be documented as such, not read as parity.
