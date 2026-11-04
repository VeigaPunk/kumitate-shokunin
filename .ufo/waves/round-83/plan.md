# kumitate round 83 — plan (frozen before any data seat scores)

Base: lane tip `eb8e00956e7a282cb2b53a5bc53e1afa1d0e7fcf` (round-82 verifier spot-check; the remote tip at
open). Contract half of this round: two claims, frozen counters, pre-data controls, one v1 wave of 15
seats. Round shape: ONE v1 wave (policy band 8–16) under
`/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`; the canonical planner seat is held by
the L1 (`KumitateR83`), which the validator refuses as a swarm role.

Scratch: every fixture, clone and mirror of this round lives under
`${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r83/<seat>/`. Nothing in `/tmp`.

## Claims

| claim | axis | instrument |
|---|---|---|
| C1 | operability (lowest non-retired axis, integer 9 terminal — capability deepening `ready-handoff`) | `scripts/ready-handoff.mjs` → `kumitate-ready-handoff-v3`; frozen counter `probe83-c1.mjs` (27 arms) |
| C2 | coverage:omp (integer 10 held; the omp-census compare evidence surface gains the receipt-clock guard) | `scripts/omp-census.mjs` compare path; frozen counter `probe83-c2.mjs` (16 arms) |

### C1 — operability: the gate judges the admission the dispatcher performs

Predicate (frozen): `node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane .` prints
`C83_C1: HELD held=27/27` and exits 0 at the measured revision M.

Why the prior state lacked it (all measured at the base tree in the control run): v2 counts the band over
`taskCall.tasks` only, while the validator's band counts `spawns + resumes` (`total`, `ufo-swarm-wave.mjs`
at `fb7157fc`, `plan.counts.total`); v2 never reads the dispatcher's `maxLanes` cap, `schema` or `counts`;
v2 resolves `--agents` only in a shape no caller writes (`{agents:[{id}]}`, while the validator's registry
is `{schema:"ufo-swarm-registry-v1", members:{…}}`); v2 names `labrat` as an attack role although
`SWARM_ROLES` cannot spawn it; and v2 accepts a policy whose `proposalRoles` names a role the validator
would refuse.

v3 changes, each an arm of the frozen counter:
1. band total = `taskCall.tasks.length + resumeSends.length`; a resume-only payload (`tasks.length === 0`)
   is band-exempt, as the validator's `spawns.length > 0` guard makes it.
2. cap = min(policy `sighting.dispatch.swarm.maxLanes`, dispatch `maxLanes`, 256 hard ceiling);
   `total > cap` → `MAXLANES`; a spawn wave whose effective cap is below the policy floor →
   `MAXLANES_IMPOSSIBLE`.
3. `dispatch.schema` must be the dispatcher's `ufo-swarm-wave-dispatch-v1` → `DISPATCH_SCHEMA`.
4. a declared `dispatch.counts.{spawn,resume,total}` must agree with the payload → `DISPATCH_COUNTS`.
5. the policy's `proposalRoles` must be a subset of the validator's pinned `SWARM_ROLES` set →
   `POLICY_ROLE_UNJUDGEABLE` (the validator is the authority; a policy it cannot honour is refused).
6. the attack set is the reachable subset (`reviewer`, `critic`, `mutation-tester`); `labrat` is refused
   as `ROLE_UNKNOWN` because the validator cannot spawn it.
7. `--agents` accepts the validator registry shape (`members` map keys are ids) beside `{agents:[{id}]}`.
8. every v2 arm is carried (READY_KEYS, LANE/ROUND/WAVE mismatch, WAVE_BINDING, DISPATCH_WAVE,
   L1_SEAT_COLLISION/L1_UNRESOLVED, BAND, ATTACK_SHARE, CONNECTOR_COUNT, SEAT_*, GODSPEED,
   ARTIFACT_KEYS, TASK_LANE_ROOT, RELATIVE_WAVE_PATH, REPORT_TRAILER, REPORT_DEST_*, PLANNER_SEAT,
   ROLE_UNKNOWN, fail-closed dispatch/policy/agents arms).

The READY line gains `resumes=` and `total=` and keeps `seats=` (= spawn tasks). `attack` is now
`attack=<n>/<total>`.

### C2 — coverage:omp: a self-asserted instant is judged, not trusted

Predicate (frozen): `node .ufo/waves/round-83/probe/probe83-c2.mjs --set c2 --lane .` prints
`C83_C2: HELD held=16/16` and exits 0 at M.

Why the prior state lacked it: v2 judges a compare receipt's clock only inside the `--max-age` branch
(`omp-census.mjs` `compareShape`: `if (maxAge !== null) { … if (ageDays < 0) SHAPE_CLOCK … }`), so a
future-dated receipt reads `IN_SYNC age_days=-N` without a bound and a malformed `captured_at` is never
refused on the compare path; `--shape` already refuses the same instant unconditionally.

v3 changes: one clock predicate shared by `--shape` and `--compare` — a future instant or an unparseable
instant reads `SHAPE_CLOCK` exit 2 on both paths, with or without `--max-age`; a legacy v1 receipt keeps
`captured=absent age_days=absent` (no invented instant) and `SHAPE_AGE_UNKNOWN` only when a bound is
named; the age never scores (`coverage:omp` stays 10).

## Frozen counters

- `probe/probe83-c1.mjs` — 27 arms, hermetic fixture lanes under `--work`, shells
  `scripts/ready-handoff.mjs`. Prints one `C83_C1 arm <name> ok|FAIL` line per arm and the verdict line.
- `probe/probe83-c2.mjs` — 16 arms, hermetic shape receipts + a materialised root, shells
  `scripts/omp-census.mjs`.

Both counters are frozen at the freeze commit; no arm is added, removed or retargeted after a data seat
has scored. A counter defect found by a seat is disclosed, not edited; a new counter version is a later
round's claim.

## Pre-data controls (committed before the wave scores)

- **Base**: `git archive eb8e0095` of the lane into scratch, the frozen counters run against it
  (`controls/c1-base.txt`, `controls/c2-base.txt`). Before-values for the report.
- **Stub C1**: a constant-`READY` printer at `scripts/ready-handoff.mjs` (`controls/c1-stub.txt`).
- **Stub C2**: a constant-`IN_SYNC` printer at `scripts/omp-census.mjs` (`controls/c2-stub.txt`).
- **Kill rules** (fixed before data):
  - K1 — if the base reaches the target (`27/27`, `16/16`), the counter or target is wrong: stop, do not
    land the claim.
  - K2 — if either constant-printer stub reaches half the target (`≥14/27`, `≥8/16`), the counter is
    under-bound: stop.
  - K3 — a do-nothing change (comment-only touch) must not raise either count.
  - K4 — an arm declared new that already passes at the base tree is not new: it is re-labelled carried in
    the close receipt and the claim rests on the arms that move.

## Wave (one v1 wave, 15 seats)

Roles: scout ×2 (per-surface recon, `m_antigravity`), executor ×3, scribe ×3, connector ×1, reviewer ×2,
critic ×1, mutation-tester ×1, sentinel ×1, revenger ×1. Attack share by the policy's four attack roles:
4/15 = 26.7 % (sentinel and revenger are a fifth and sixth adversarial seat by the looser reading). Seats
are leaves; no seat commits, pushes, or runs a mutating git/jj command; no seat dispatches.

## Commits

1. freeze (this plan, both counters, both control receipts, open receipts);
2. work (the two tools, suites, knowledge entries, lesson, SCORECARD/LOG, pins) — M;
3. close receipts stamped at M;
4. report on the fleet repo last.
