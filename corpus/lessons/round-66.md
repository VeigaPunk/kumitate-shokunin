# Round 66 — lesson (honest stop before integration)

author: kumitate-shokunin
base: `8d557f85312de4fcc82e09ff735d21436bc3746d`
last committed tip at report cutoff: `6c79d68caf956e6c74a0c17c388662f4d1b7dec1`
plan: `.ufo/waves/round-66/plan.md` (frozen before `w1.ready`)
status: claims not verified; the dispatched v2 wave had no `WAVE-DONE` or results receipt at report cutoff, so wave output was not integrated.

## Claims

- C1 operability, capability `routed-ledger` (frozen predicate `LEDGER66_HELD`, L66): base `LEDGER66_UNMET held=0/6`, exit 1; at tip `6c79d68caf956e6c74a0c17c388662f4d1b7dec1`, `LEDGER66_UNMET held=3/6`, exit 1. L1/L4/L5 held; L2/L3/L6 did not. No ledger data, SKILL registry row, QUALITY criterion, or SCORECARD capability row landed by cutoff. Honest result: not verified.
- C2 coverage frontier, MCP deprecation registry entry (frozen predicate `DEPREC66_HELD`, M66): base `DEPREC66_UNMET held=0/8`, exit 1; at the same tip `DEPREC66_UNMET held=0/8`, exit 1. The entry, registry rows and source-capture pins did not land by cutoff. Honest result: not verified.

## Gate

No assimilation entry or new source row was admitted by the report cutoff; consequently there is no admit/reject sample to grade. The package and source rows were read-only inputs. Registry census at base and cutoff remains 145 rows with the six carried W04 duplicate-URL warnings; both census runs exit 0. The frozen source-id collision proof and quarantine slice are under `.ufo/waves/round-66/assimilation/` but were not integrated or treated as an adoption verdict.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `routed-item-loss` — round 65's verifier routed seven distinct D1–D7 items to round 66 (`corpus/lessons/round-65-verifier-spotcheck.md:69-77`), but without a durable per-item ledger each answer would have to be reconstructed from prose | `.ufo/waves/round-66/base/routed-ledger-selftest-freeze.txt`; its dropped-row case reports `UNLEDGERED` and the suite passes 33/33 | none before round 66 | `scripts/routed-ledger.mjs` binds item quotes and answer locations; its committed dropped-row self-test demonstrates the gate can fail. The round's data ledger did not land by cutoff, so the fix is instrumented but not completed/admitted. |

## Round close status

The validator accepted one v2 wave of 66 distinct seats; the dispatcher created `w1.ready.dispatched`. At report cutoff the L1 had not received a `WAVE-DONE` message and, following the handoff contract, had not inspected `w1-results.json`; actual settled/dead seat totals, role-response model identities and seat artifact completion are unknown. No item was respawned. The round is an honest stop, not a verified claim admission.
