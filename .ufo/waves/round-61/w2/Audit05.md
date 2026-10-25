# Audit05 — Schema-UnplannedSeat (kumitate round 61 wave 2)

Seat: `Audit05` · role: reviewer · axes: operability, coverage.

**Assignment.** Schema-UnplannedSeat — verify a settled result name absent from the validated registry fails closed and no record is written.

## Axes

- **operability** — does each input path that assembles/validates a settled-seat record actually refuse an unplanned seat name before any write?
- **coverage** — is that fail-closed property true across all converter/validator entry points, and does downstream gating catch an unplanned seat that does get written?

## Scope and artifacts

The round-61 wave-1 dispatch record is assembled by two distinct artifacts:

1. `scripts/make-dispatch-actual.mjs` — canonical converter (wrote the committed `w1/dispatch-actual.json`, schema `kumitate-dispatch-actual` + `contract`/`settled`/`status`; recipe `integration-recipe.md` §3/§8).
2. `.ufo/waves/round-61/build/ExecRecordDoc/make-r61-dispatch-record.mjs` — wave-1 recipe assembler (schema `kumitate-r61-dispatch-actual`, no `contract`/`status`).

Validators exercising the same "settled name vs registry" contract: `ufo-swarm-collect.mjs` (`unexpected_member`), `ufo-swarm-wave.mjs record` (`unknown_member`), and the gate `scripts/dispatch-evidence.mjs` (never reads `swarm-registry.json`).

Scratch: `/tmp/kumitate-r61/Audit05/` only. No lane files touched; no installs (no tools needed beyond node 24 already present).

## Evidence (exact commands, verdicts, exits)

### A — collector `ufo-swarm-collect.mjs` (registry = 1 member `ExecAlpha`; results = `ExecAlpha` + `ExecGhost`)

```
$ node .../ufo-swarm-collect.mjs collect --wave wave.json --results results.json --registry registry.json --out -
{"schema":"ufo-swarm-collect-error-v1","code":"unexpected_member","message":"results row ExecGhost has no dispatch member","details":{"member":"ExecGhost"}}
A1_exit=1
```
Control (only `ExecAlpha`): exit 0, emits envelope. **Fail-closed ✓ (no envelope written).**

### B — `ufo-swarm-wave.mjs record` (scratch `UFO_PROJECT_ROOT`)

```
$ UFO_PROJECT_ROOT=$S/record-b1 node .../ufo-swarm-wave.mjs record --registry .ufo/waves/round-61/w1/swarm-registry.json --assignments '{"ExecGhost":"L1Kumitate61.ExecGhost"}'
{"schema":"ufo-swarm-wave-error-v1","code":"unknown_member","message":"--assignments names ExecGhost, which is not a member of .ufo/waves/round-61/w1/swarm-registry.json"}
B1_exit=1
```
Registry after: `grep -c ExecGhost` → 0. **Fail-closed ✓ (no assignment written).**

### C — canonical `scripts/make-dispatch-actual.mjs` (registry = 1 member `ExecAlpha`; results = `ExecAlpha` + `ExecGhost`)

```
$ node scripts/make-dispatch-actual.mjs --registry .../swarm-registry.json --results results.json --reports ... --out ... --root $S/canon --round 61 --wave w1
MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=UNPLANNED_SEAT name=ExecGhost detail=settled-but-not-in-registry
C1_exit=2
```
- C2 `--no-verify`: same exit 2, same reason (no bypass).
- C3 pre-existing `dispatch-actual.json`/`launcher-progress.tsv` sentinels at outDir: byte-identical after refusal (`stale-record-sentinel` / `stale-progress-sentinel`), no new files written.
- C4 registry with `members` as an array (schema-violating shape): still `UNPLANNED_SEAT`, exit 2, no write.
- E2 unplanned prototype-named result (`constructor`): `UNPLANNED_SEAT name=constructor`, exit 2.
- C0 control (only `ExecAlpha`): `MAKE_DISPATCH_ACTUAL: CLEAN ... seats=1 sessions=1 exit0=1 reports=1 dead=0`, gate `CLEAN`, exit 0.

**Fail-closed ✓ in every variant — refuses before any write (check is `mergeRows` → `failClosed` before `mkdirSync`/`writeAtomic`).**

### D — recipe assembler `.ufo/waves/round-61/build/ExecRecordDoc/make-r61-dispatch-record.mjs` (real 32-member `swarm-registry.json`)

| case | input | result |
|---|---|---|
| D1 | 32 planned + extra `ExecGhost` | refusal `seat set != dispatch plan: missing=- extra=ExecGhost`, exit 1, **no record written** |
| D3 | 31 of 32 planned (missing `ScribeLessonPrep`) | refusal `missing=ScribeLessonPrep`, exit 1 |
| D2 control | exact 32 names | `WROTE planned=32 ...`, exit 0 |
| D7 | 32 planned + extra `constructor` (report present) | `WROTE planned=33 sessionIds=33 exit0=33 reports=1 dead=none`, **exit 0, record written** |
| D8 | 32 planned + extra `__proto__` (report present) | `WROTE planned=33 ...`, **exit 0, record written** |
| D9 | same as D1 but **no `swarm-registry.json`** on disk | `WROTE planned=33 ...`, **exit 0, record written** |

Mechanism: the bail-out is `planned = registry && registry.members && !Array.isArray(registry.members) ? registry.members : null`; extra-name rejection runs only `if (planned)`, and the membership test is `!(n in planned)`. With no registry (D9), `members` as an array, or a name that is an inherited `Object.prototype` property (`constructor`, `__proto__` — always `in` the plan object), an unplanned seat is accepted and a record is written. Code inspection (not run): members-as-array registry → `planned = null` → same skip.

### E — downstream gate over the record the recipe assembler wrote (unplanned `__proto__` seat included)

```
$ node scripts/dispatch-evidence.mjs --root $S/gate-demo2 --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=33 sessions=33 exit0=33 reports=33 dead=0)
E1_gate_exit=0
```
The gate's own checks (`planned` vs rows, session/exit/report counters, dead set) all agree because the record is self-consistent; nothing cross-checks seat names against `swarm-registry.json` (the gate never reads it).

## Findings (by severity)

1. **High — recipe assembler fails open on an absent or array-form registry (D9, C4-shape).** `.ufo/waves/round-61/build/ExecRecordDoc/make-r61-dispatch-record.mjs` writes `launcher-progress.tsv` + `dispatch-actual.json` for a settled result name absent from the validated registry whenever the registry file is missing or its `members` is an array. "Fails closed" holds only when `swarm-registry.json` exists with object-form members. This contradicts `integration-recipe.md` §1 ("no extras") for the assembler path.
2. **High — prototype-inherited names bypass the extra-seat check even with a valid registry (D7/D8).** The membership test uses `n in planned` (own + inherited), so `constructor` and `__proto__` are never "extra". Record written with a 33rd seat that was never planned.
3. **Medium — no downstream guard.** `scripts/dispatch-evidence.mjs` reads only `launcher-progress.tsv` + `dispatch-actual.json` (never `swarm-registry.json`); a record with an unplanned seat that is internally consistent (reports present, counters correct) reads `CLEAN`, exit 0 (E1). Nothing in dispatch-evidence, the recipe, or the P2 line catches the unplanned seat.
4. **Informational — the claim holds for the actual wave-1 record path.** The committed `w1/dispatch-actual.json` (schema `kumitate-dispatch-actual`, 32 members) was produced by `scripts/make-dispatch-actual.mjs`, which is fail-closed in every tested variant (A/C above including `--no-verify`, pre-existing files, and prototype-named results). The validator `record` CLI and the collector also fail closed (A/B). So the settled wave-1 record itself was generated by a tool that meets the claim; the gap is the unshipped recipe assembler and the gate's blindness.

## Residual risk / verification gaps

- `ufo-swarm-wave.mjs record` exercised against a scratch `UFO_PROJECT_ROOT` registry; not against a live fleet-root registry (would touch fleet repo — out of lane scope).
- Registry-pruned mid-wave state (registry written, then removed before assembly) is exactly D9; registry with array members is verified by code path only, not a live run (C4 live-tested the canonical converter instead).
- No test asserts "the record must never contain a name absent from `swarm-registry.json`" — there is no such check anywhere in the pipeline; adding one at `dispatch-evidence.mjs` is a round-62 gate change, out of scope here.
