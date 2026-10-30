# L6 registry-home additions (draft only; integration owner applies)

Axis: operability; preserve coverage and frozen L69/M69 predicates. All additions name round 69.

## SKILL.md — append inside the existing Gate registry table, after the jj-seat-demo row and before its trailing blank lines

| routed-ledger | gate | `node scripts/routed-ledger.mjs --root <lane> --from 55 --to 66 --classes` → `ROUTED_LEDGER: CLEAN\|DRIFT\|FAIL-CLOSED` (0 clean · 1 drift · 2 fail-closed · 64 usage), contract `kumitate-routed-ledger-v2` (round 69) | `--selftest` | `corpus/routed-ledger.md`; routed spot-check sections; exact answer lines; round-69 frozen L69 counter |

## corpus/QUALITY.md — append as a Q62 application criterion

- **Q62 application — routed-ledger registry home (round 69): the SKILL.md gate-registry command names scripts/routed-ledger.mjs, this criterion names routed-ledger, and the SCORECARD.md Capabilities table first cell is `routed-ledger` with first-working round 69; missing or mismatched homes fail this criterion.**

## SCORECARD.md — insert inside the Capabilities table, immediately before its Round-48 note (currently line 1804), not in a later round section

| `routed-ledger` | Bind each routed item to a unique located quote and classification; reject missing rows, contradictory closures and dead exact-line answer bindings; expose class recurrence without judging answer adequacy (contract `kumitate-routed-ledger-v2`) | `node scripts/routed-ledger.mjs --root <lane> --from 55 --to 66 --classes`; `node scripts/routed-ledger.mjs --selftest`; frozen round-69 L69 counter (these commands are evidence procedures, not an asserted passing receipt) | 69 |

## Integration obligations beyond those three additions

Adding one kind=gate row changes the gate registry's prose counts at SKILL.md:589 and :597: twenty-four rows → twenty-five rows; twenty-three files → twenty-four files; “all twenty-four” → “all twenty-five”. Preserve Q41 by updating those assertions in the same integration. Append late in the registry to preserve the :605 table-header anchor in QUALITY.md:1083. Later SKILL lines still shift by one. The frozen round-69 counters contain no hard-coded SKILL line-number lookup; ledger answer bindings to SKILL.md remain exact-line-sensitive if used, and must be authored against the integrated revision.
