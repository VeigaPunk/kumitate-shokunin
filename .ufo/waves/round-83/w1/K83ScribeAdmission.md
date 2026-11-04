# K83ScribeAdmission — report (one knowledge entry: dispatcher admission surface)

Seat: leaf, writes only `corpus/knowledge/dispatcher-admission-surface.md` plus this report.
Scratch: not used — every operation was a read of an existing file; no temp file, no clone, no
`/tmp` write. No tool installed or upgraded (nothing was missing).

## What I ran (exact commands, in order)

1. `cd /home/vgpnk/Projects/ufo-fsd-alpha && git log -1 --format='%H %s'` →
   `fb7157fcf14625be9d0b91bdd425a4b3212e4194 integration: drop the dead probe-verdict fixture copy M18's deletion orphaned`
2. `git log -1 --format='%H%n%ci%n%s' fb7157fc` → `2026-10-25 03:01:24 -0300`
3. `grep -n '^| S24[01] ' corpus/SOURCES.md` (lane) → rows at lines 194 (S240) and 195 (S241)
4. `git rev-parse HEAD; git log -1 --format='%H %ci %s'` (lane) →
   `eca7debd9aa6184a81f7e4abb43d507299a31f31 2026-11-04 09:02:57 -0300 round-83 scaffolding: ready-handoff v3 (27/27) and omp-census compare clock (16/16), suites 68 and 108, S240-S242 rows, wave payload … handoff READY`
5. `grep -n` line-pinning passes over `scripts/ufo-swarm-wave.mjs`, `scripts/ufo-swarm-registry.mjs`,
   `scripts/ready-handoff.mjs`; `sed -n` range reads of the same.
6. `python3 -c` read of `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json` (read-only)
   → `band 8 16 maxLanes 256`, `minLanes 8`, `proposalRoles` = the ten-role list.
7. `wc -l corpus/knowledge/dispatcher-admission-surface.md` → 119 (limit 120).

No build, no test, no gate run, no counter run, no git/jj mutation.

## What I observed (exact output lines)

- Dispatcher pin: `fb7157fcf14625be9d0b91bdd425a4b3212e4194`, committed `2026-10-25 03:01:24 -0300`.
- Lane pin read: `eca7debd9aa6184a81f7e4abb43d507299a31f31`, `2026-11-04 09:02:57 -0300`.
- `SWARM_ROLES` = 10 entries, `W265-275`; comment `W263-264` names planner/distiller/labrat/Main
  as non-swarm. `MAX_SWARM_LANES = 256` at `ufo-mission-result.mjs:2572` (imported `W125`).
- Band: `total = lanes.length` (`W1061`); `laneFloor = policyFloor` (`W1067`);
  `laneCeiling = min(policyCeiling, cap)` (`W1068`); order `impossible_band` (`W1074-1079`) →
  `too_many_lanes` (`W1080-1082`) → `too_few_lanes` (`W1083-1088`) → `wave_too_wide` (`W1089-1094`).
- Cap: `policyMaxLanes` (`W835-836`), `policyFloor` (`W837-841`), `policyCeiling` (`W842-846`),
  inverted → `invalid_policy` (`W847-849`), spec tighten (`W898-909`), recorded (`W1360-1366`).
- Roles refusal: `role_required` `W985-987`, `unknown_role` `W988-990`, `resume_role_forbidden` `W937-939`.
- Payload: schema const `W153`, `policy` `W1454`, `counts` `W1455` (`{spawn,resume,total}` at `W1370`),
  `taskCall` `W1470-1471`, `resumeSends` `W1472`, `dispatch.calls/kind` `W1380-1382`.
- Registry: `SWARM_REGISTRY_SCHEMA` `R27`, schema gate `R112-114`, map branch `R126-131`,
  array opt-in `R118-125`, name pattern `R33`, uniqueness `R141`, plan emission `W1404`.
- Gate: `CONTRACT='kumitate-ready-handoff-v3'` `G38`; total `G236`; maxlanes chain `G237-244`;
  schema `G246-248`; counts `G249-254`; role-unjudgeable `G257-258`; planner `G283`;
  role-unknown `G284`; agents shapes `G198-203`; v3 selftest block `G690-744`.
- Live policy: `waveMinLanes 8`, `waveMaxLanes 16`, `maxLanes 256`, ten `proposalRoles`.

## Conclusions

Entry written at `corpus/knowledge/dispatcher-admission-surface.md`, 119 lines, trio first
(`source:` S240+S241+gate path, `verified-at:`, `recheck: on-release`), then band, cap ordering,
role set, dispatch payload, registry shape, gate parity table, limits. Every sentence carries a
`W#`/`R#`/`G#` line citation against the recorded pins; no claim rests on the plan prose alone.

## Findings (disclosed, not fixed — outside a scribe's write scope)

1. **Gate floor is unclamped where the dispatcher clamps.** `G177-178` reads `waveMinLanes`
   raw; `W837-841` takes `min(waveMinLanes, policyMaxLanes)`. A policy declaring
   `waveMinLanes > maxLanes` would read `MAXLANES_IMPOSSIBLE` at the gate for a wave the
   dispatcher admits (`impossible_band` cannot fire there: floor == ceiling after clamping).
   Inert on the live policy (`8 ≤ 256`). Recorded in the entry's Limits.
2. **Gate registry branch does not check the schema stamp.** `G201-203` accepts any non-empty
   `members` object; `R112-114` requires `schema === "ufo-swarm-registry-v1"`. A foreign
   `{members:{…}}` document therefore resolves `l1` at the gate. Recorded in the entry's Limits.
3. Neither is a defect to patch from this seat: the gate is frozen at `M` by the round's claim,
   and the counter is frozen too. Both are re-derivable in one grep from the cited lines.

## What I could not verify

- That the dispatcher actually admits what the source says: the dispatcher was **not run**
  (operator-side, out of lane; no execution attempted). All dispatcher claims are source reads
  at `fb7157fc`.
- The gate's parity in operation: no run of `scripts/ready-handoff.mjs --selftest` and no run of
  `.ufo/waves/round-83/probe/probe83-c1.mjs` from this seat. The 68-case and 27/27 figures in
  the commit message are the executor's claims, not observed here; the entry does not assert
  them as measurements.
- `S240`/`S241` `status` fields were left untouched (append-only except `status`/`recheck`/
  `used-by`; the row owner is another seat).

## Touched surfaces

- Written: `corpus/knowledge/dispatcher-admission-surface.md` (new), this report (new).
- Not touched: `corpus/SOURCES.md`, `corpus/README.md`, `corpus/lessons/*`, any script, probe,
  control receipt, `.ufo/state`, `.scratch`, `MANIFEST.json`, the fleet repo, the dispatcher repo.
- `git status` in the lane also shows `M SKILL.md`, `M .ufo/waves/round-83/open/prereqs.txt`,
  `?? .ufo/waves/round-83/w1.ready.dispatched`, `?? corpus/knowledge/self-asserted-instants.md`
  — none of those are mine.

## Out of scope / deferred to the wave

- The `README.md` map row (K83ScribeSources), the round lesson, SCORECARD/LOG, and the
  verification runs belong to their owners. Peer `K83ScribeSources` was messaged twice: path
  confirmed before writing, and "ENTRY: admitted" after the file landed.
