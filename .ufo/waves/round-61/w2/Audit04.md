# Audit04 — Schema-ArrayObject: members-as-object rejection

Seat: `L1Kumitate61.Audit04` (leaf critic, axes `operability`, `coverage`).
Scope: verify `members`-as-object is rejected by `dispatch-evidence` and that
`make-dispatch-actual` preserves (does not launder) the rejection.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Scratch: `/tmp/kumitate-r61/Audit04/`.

## Verdict

**CONFIRMED on both halves.** The gate rejects every non-array `members` shape with
`REGISTRY_UNREADABLE:members-absent`, exit 1; the converter reads the real object-keyed
`ufo-swarm-registry-v1` input and always writes `members` as an array, so the gate's own
rejection class is preserved end-to-end rather than copied through.

## Mechanism (code evidence)

- **Gate** `scripts/dispatch-evidence.mjs:132` — `const members = Array.isArray(registry.members) ? registry.members : null;`
  Any non-array (object, `null`, `{}`, numeric-keyed object, absent key) lands in the
  `else` at line 145 → `findings.push('REGISTRY_UNREADABLE:members-absent')` →
  `DISPATCH_EVIDENCE: DRIFT`, exit **1** (a real defect finding, not the fail-closed 2 —
  correct: the file parsed, its shape is wrong).
- **Converter input** `scripts/make-dispatch-actual.mjs:143-144` — `entriesOf` accepts
  `raw[w]` when it is an object (`Object.entries(raw[w])`), so the validator's
  name-keyed `members` object is consumed; line 152 fail-closes on non-object registries.
- **Converter output** `make-dispatch-actual.mjs:322-333` — `members: rows.map(r => ({name, agentId, exit, settled, status, pid, start, end, role, kind}))`.
  The emitted record is unconditionally array-shaped; the tool never writes the input
  shape through. Rejection is preserved by *translation*, not by relaxing the gate
  (gate file is byte-unchanged, per `w1/ExecDispatchSchemaTool.md:16`).

## Live reproduction (scratch, node v26.x builtins)

### A. Gate rejects members-as-object

Fixture: `/tmp/kumitate-r61/Audit04/.ufo/waves/round-1/w1/` — valid
`launcher-progress.tsv` (2 seats, exit=0, sessions), two non-empty seat reports, and a
`dispatch-actual.json` whose `members` is a name-keyed object.

```
node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r61/Audit04 --round 1 --wave w1
→ DISPATCH_EVIDENCE: DRIFT (seats=2 sessions=2 exit0=2 reports=2 dead=0)
  FINDING REGISTRY_UNREADABLE:members-absent
  EXIT=1
```

Shape sweep (same fixture, `members` mutated in place) — all rejected identically:

| `members` value              | finding                          | exit |
|------------------------------|----------------------------------|------|
| `{SeatA:{…}, SeatB:{…}}`     | REGISTRY_UNREADABLE:members-absent | 1 |
| `{}`                         | REGISTRY_UNREADABLE:members-absent | 1 |
| `null`                       | REGISTRY_UNREADABLE:members-absent | 1 |
| `{"0":{…}}` (numeric-keyed)  | REGISTRY_UNREADABLE:members-absent | 1 |
| key absent                   | REGISTRY_UNREADABLE:members-absent | 1 |

No counterexample found: an array is the only accepted shape; a JSON object that
merely *looks* sequential (`{"0":…}`) is still rejected — no array-like bypass.

### B. Converter preserves the rejection

Registry input (`ufo-swarm-registry-v1`, `members` as object) + gate-grammar TSV
settle output:

```
node scripts/make-dispatch-actual.mjs \
  --registry …/conv/.ufo/waves/round-7/w2/swarm-registry.json \
  --results  …/conv/.ufo/waves/round-7/w2/results.tsv \
  --reports  …/conv/.ufo/waves/round-7/w2 --gate scripts/dispatch-evidence.mjs
→ MAKE_DISPATCH_ACTUAL: CLEAN … seats=3 sessions=3 exit0=2 reports=2 dead=1 members=3 gate=0
  DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=2 reports=2 dead=1)   EXIT=0
```

Emitted `dispatch-actual.json`: `members` is a **list** of 3; `dead:["SeatC"]`,
`exit0=2`, `sessionIds=3` — the failed seat keeps `exit=1`, is named in `dead`, and is
not credited.

Negative control: with a `SeatC.md` report present, the same run produced
`DRIFT FINDING DEAD_SEAT_UNCREDITED:SeatC`, EXIT=1 — i.e. the post-conversion gate
still catches a credited dead seat; conversion does not launder.

Selftest (`node scripts/make-dispatch-actual.mjs --selftest`): **PASS (9/9)**,
including `object-members-rejected — gate=1 DRIFT` and
`metadata-only-registry-fail-closed — tool=2 REGISTRY_UNREADABLE`.

### C. Real round-61 evidence

- `w1/swarm-registry.json` → `members`: **dict**, 32 entries (validator's native shape).
- `w1/dispatch-actual.json` → `members`: **list**, 32 entries;
  `planned=32 sessionIds=32 exit0=32 reports=32 dead=[]`.
- `node scripts/dispatch-evidence.mjs --root <lane> --round 61 --wave w1`
  → `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)`, **exit 0**.
- So the object→array conversion already ran on real data and the gate accepts the
  product it produces — the pipeline works in situ, not only in fixtures.

## Findings / nits (not falsifying)

1. **Doc gap, `--results` shape.** Header (`make-dispatch-actual.mjs:20-22`) and the w1
   report (`ExecDispatchSchemaTool.md:32`) claim `--results` accepts "an array". A bare
   top-level JSON array is in fact fail-closed `RESULTS_UNREADABLE detail=not-an-object`
   (containerOf:152 rejects `Array.isArray(raw)` before entriesOf can unwrap it) —
   observed live, EXIT=2. Wrapped `{members|results|seats|settled:[…]}`, name-keyed
   objects and TSV all work. Either the doc over-promises or the code under-delivers;
   the selftest never covers a bare array. Audit02 territory for status/exit, flagged
   here because it contradicts the same artifact my item attacks.
2. **Stale selftest quote.** `ExecDispatchSchemaTool.md:75` quotes
   `MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (8/8)`; the committed script now runs 9 cases
   (`contradictory-status-exit-rejected` added, line 558) and prints PASS (9/9).
   Cosmetic drift in wave-1 evidence; behavior claim stands.
3. **Rejection granularity.** `members` as object/empty/null/absent collapse into the
   single finding `REGISTRY_UNREADABLE:members-absent`, and the check is skipped when
   the file is not valid JSON (line 104-107's earlier exit 2). That is adequate for the
   contract but means "object where array required" is reported with the same id as
   "key missing" — a reader cannot distinguish shape-defect from absence without the
   file. Optional improvement, not a hole: every case still exits non-zero.

## Impacted axes

- `operability`: gate rejects, converter converts, real w1 record reads CLEAN — sound.
- `coverage`: object/empty/null/numeric/absent shapes all probed live; no accepted
  members-as-object counterexample exists. The only uncovered path is the documented
  but nonfunctional bare-array `--results` input (finding 1).

## Smallest safe correction

None required for the named claim. If the doc/code mismatch matters, either drop
"an array" from the `--results` contract line or delete the `Array.isArray` guard in
`containerOf` for results only — one-line change, but it is a contract decision for
the canonical judge, not a defect in the members path.

## Tooling

None installed or updated; node builtins only. Pacman pause respected.
