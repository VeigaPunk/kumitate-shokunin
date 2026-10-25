# Audit04 — Schema-ArrayObject (kumitate round 62, wave 2)

Seat: `L1Kumitate62.Audit04` (critic, read-only falsification wave).
Assignment: **Schema-ArrayObject — Verify members-as-object is rejected by dispatch-evidence and the converter preserves the rejection.**

Axes named: **operability** (does the `dispatch-evidence` gate admit an object-shaped `members`?) and **coverage / schema fidelity** (Q54 schema half: `members` must be an array with non-null `agentId`; does `make-dispatch-actual.mjs` launder a gate-rejected shape into a CLEAN record?). No repo edits, no commits, no external sources; fixtures live only under scratch `/tmp/audit04-schema-arrayobj-dwjehg5g/`.

Subjects (lane tip `0cbe0d7`; both scripts byte-identical to the round-61 measured rev `019a844c` — `git diff 019a844c..HEAD --stat` empty):
- `scripts/dispatch-evidence.mjs` (gate, contract `kumitate-dispatch-evidence-v1`)
- `scripts/make-dispatch-actual.mjs` (converter, contract `kumitate-dispatch-evidence-v1`, record schema `kumitate-dispatch-actual`)

## 1. dispatch-evidence rejects members-as-object — confirmed

Gate logic: `const members = Array.isArray(registry.members) ? registry.members : null` (`scripts/dispatch-evidence.mjs:132`); non-array → `findings.push('REGISTRY_UNREADABLE:members-absent')` (`:144-146`) → DRIFT exit 1; CLEAN impossible.

Fixture: `.ufo/waves/round-1/w1/` with 3-seat `launcher-progress.tsv` (sessions + exit=0 + reports), `dispatch-actual.json` varied only in `members` shape. Commands and results:

| case | `members` value | command | verdict / exit |
|---|---|---|---|
| G0 control | array of 3 member objects | `node scripts/dispatch-evidence.mjs --root <T>/g0-clean --round 1 --wave w1` | `DISPATCH_EVIDENCE: CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)` exit 0 |
| G1 | object keyed by seat name (`{ExecAlpha:{…},…}`) | same, `g1-map` | `DRIFT (seats=3 sessions=3 exit0=3 reports=3 dead=0)` + `FINDING REGISTRY_UNREADABLE:members-absent` exit 1 |
| G2 | lone member object (`{name,agentId,exit,…}`) | same, `g2-lone` | `DRIFT` + `FINDING REGISTRY_UNREADABLE:members-absent` exit 1 |
| G3 | key absent | same, `g3-missing` | `DRIFT` + `FINDING REGISTRY_UNREADABLE:members-absent` exit 1 |
| G4 | `null` | same, `g4-null` | `DRIFT` + `FINDING REGISTRY_UNREADABLE:members-absent` exit 1 |

There is no path from a non-array `members` to CLEAN: the `members` arm is the only place `planned/sessionIds/exit0/reports/dead` are compared, and it is skipped when not an array — the finding is unconditional. Rejection (not-clean) holds for every object variant; the clean control (G0) proves the rejection is caused by the shape, not by the fixture.

## 2. The converter preserves the rejection — confirmed, with the one designed exception

Converter input contract (R60-V5, `make-dispatch-actual.mjs:17-19`): `members` may be a **name-keyed object** or an array — that is the *input* translation surface. The **output** record it writes always carries `members` as an array (`buildRecord`, `:355` `members: rows.map(…)`), and the tool re-runs the gate on exactly what it wrote (`main`, `:446`). What I verified:

| case | input `members` | tool result | output written? |
|---|---|---|---|
| C0 | name-keyed map, 3 valid members (legit R60-V5 shape) | exit 0, `MAKE_DISPATCH_ACTUAL: CLEAN … members=3 gate=0` + `DISPATCH_EVIDENCE: CLEAN (seats=3 …)` | yes; `dispatch-actual.json` `members` is `list` (len 3), non-null `agentId` |
| C1 | lone member object | exit 2, `FAIL-CLOSED reason=REGISTRY_UNREADABLE detail=member-not-an-object name=name` | **no** (`dispatch-actual.json` and `launcher-progress.tsv` absent) |
| C2 | array containing a non-object element | exit 2, `FAIL-CLOSED reason=REGISTRY_UNREADABLE detail=member-not-an-object name=null` | no |
| C3 | registry-shaped metadata, no `members` | exit 2, `FAIL-CLOSED reason=REGISTRY_UNREADABLE detail=members-absent` | no |
| C4a | gate-rejected `dispatch-actual.json` fed back as `--registry` with lone-object `members` | exit 2, `FAIL-CLOSED reason=REGISTRY_UNREADABLE detail=member-not-an-object name=name` | **no** — the rejected artifact stays rejected, never repaired |
| C4b | same feedback but name-keyed map | exit 0 CLEAN, output `members` array | yes (documented translation surface) |

So the converter cannot launder the gate-forbidden lone-object/`-shape into a CLEAN record: it fail-closes (exit 2) and writes nothing. The only object shape it accepts is the name-keyed member map, which is exactly the documented R60-V5 validator shape; conversion is visible (`members=N` in its own summary), and every conversion is re-verified by the gate itself — a conversion the gate would reject exits 1 and prints the gate's `FINDING` lines (e.g. null-agentId → `NOT_A_DISPATCH`, selftest case `null-agentId-rejected`). The gate's own array-only rejection of `dispatch-actual.json` is untouched (gate script byte-identical since `019a844c`).

## 3. Counterexample attempts (all failed)

- **Object-map members with plausible fields** (G1) → DRIFT `REGISTRY_UNREADABLE:members-absent`. Not admitted.
- **Object-map plus matching `planned/sessionIds/…` counts** (G1) → still DRIFT; the count comparisons live inside the array-only branch, so clever counts cannot distract the gate.
- **Lone member object** (G2/G4a) → gate DRIFT; converter fail-closes, writes nothing.
- **`members: null`** (G4) → DRIFT.
- **Converter laundering** (C1/C2/C4a) → fail-closed exit 2, no record emitted; nothing exists for the gate to mis-CLEAN.
- **Feeding the gate-rejected record back through the converter** (C4a) → still rejected.

No counterexample found: the named rejection holds on both sides.

## 4. Boundary note (reading hazard, not a defect)

"Members-as-object is rejected by dispatch-evidence" concerns the **record** (`dispatch-actual.json`). A **name-keyed object** is a legal *input* to the converter (R60-V5; `make-dispatch-actual.mjs:17-19`, selftest case `known-good-roundtrip`); the converter's output is always an array, so the gate's rejection is preserved at the boundary it guards. Misreading the converter's input contract as a gate contract would over-claim — no correction to the gate or converter is warranted.

## 5. Committed self-tests (re-run at tip, both exit 0)

- `node scripts/dispatch-evidence.mjs --selftest` → `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)`, `VERDICT: PASS` (includes `template-registry` → `NOT_A_DISPATCH`).
- `node scripts/make-dispatch-actual.mjs --selftest` → `MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (11/11)`, `VERDICT: PASS` — includes `PASS object-members-rejected — gate=1 DISPATCH_EVIDENCE: DRIFT (seats=3 sessions=3 exit0=3 reports=3 dead=0)`, i.e. the converter's own committed selftest pins the gate's rejection of object-keyed members.

Informational only: `w1/ExecDispatchSchemaTool.md` quotes `PASS (8/8)` for this converter; the committed tool at the *same* rev (`019a844c`) carries 11 cases (`git show 019a844c:scripts/make-dispatch-actual.mjs | grep -c "add("` → 12 = 11 cases + the closure). That is stale transcription in a wave-1 build report, not a gate/converter defect; out of scope for this item but recorded for the L1.

## Verdict

**No falsification.** `dispatch-evidence` rejects every object-shaped `members` (map, lone object, null, absent) with `REGISTRY_UNREADABLE:members-absent` → DRIFT (exit 1), never CLEAN; the converter preserves the rejection by fail-closing (exit 2) and writing nothing on every non-map object shape, and by always emitting array `members` (re-verified against the gate) on the one documented name-keyed-map input. Impacted axes: none requires correction; Q54 schema half holds. Smallest safe correction: none for the gate/converter; optionally fix the stale 8/8 quote in `w1/ExecDispatchSchemaTool.md`.
