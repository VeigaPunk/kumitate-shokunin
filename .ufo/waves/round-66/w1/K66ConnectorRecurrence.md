VERDICT: The 57 routed items reveal recurrent map, gate-integrity, dispatch, and record-consistency failures; one bounded prevention move is atomic README-map closure.

## Evidence
- `node scripts/routed-ledger.mjs --selftest` → verbatim final line: `ROUTED_LEDGER_SELFTEST: PASS (33/33)`; command exit 0.
- Ran `routedItems()` from `scripts/routed-ledger.mjs` over `corpus/lessons/round-55..65-verifier-spotcheck.md`: counts by round were 3, 4, 4, 8, 0, 9, 6, 5, 6, 5, 7; `TOTAL ITEMS: 57`. Round 59 section was found but prose-only, 0 items.
- `corpus/lessons/round-63-verifier-spotcheck.md:87`: D1 identifies missing README-map row as R56-V3 recurrence, “tenth time”; mechanism `readme-map-close.mjs` remains unlanded.
- `corpus/lessons/round-65-verifier-spotcheck.md:76-77`: D6 states the 40-seat falsify wave remains open and both frozen counters are forgeable by the lane's own finding; `:71` D1 documents Gate/SOURCES ID mapping disagreement.
- `corpus/QUALITY.md:882-885` (Q48) gates map row/pin presence at close; `:999-1047` (Q60) checks map at plan commit and explicitly leaves later corpus files to Q48; `:1050-1053` (Q61) reconciles report receipts but is not a general Gate-table/registry reconciler.
- `considerthese/2026-10-25.md:64-69`: ideas 3–5 are seat-death audit, recurrence counts, and a deferral ledger. Q59 was grounded in idea 3 (`QUALITY.md:992-997`); the round-66 plan ties routed-ledger to ideas 4/5 (`.ufo/waves/round-66/plan.md:21-29,96-100`).

## Findings
1. **K66ConnectorRecurrence-1 — High, prevention gap:** README-map drift recurs across rounds 55, 56, 58, 60, 63, 64, 65. Existing Q48 detects missing mapping after file arrival; Q60 prevents a red map at plan freeze only. Neither atomically couples a later closure-authored corpus file to row+pin. Reproduce via `node scripts/readme-map.mjs` on a revision where a spotcheck has landed without its row/pin; see Q60 historical evidence at `QUALITY.md:1024-1045`.
2. **K66ConnectorRecurrence-2 — High, counter trust boundary:** fabricated/skipped/forged evidence recurs from r57/r61 into r62/r63 and remains explicit at r65 D6. Q20/Q29/Q30/Q36/Q43/Q57/Q59 progressively add mutation and controls; remaining gap is an independently sourced adversarial test of every data boundary (revision bytes, host evidence, dispatch/result/session joins). Reproduce with the r61 fabricated/forged counter bundle described in `round-62-verifier-spotcheck.md:59` against those inherited probes; this assignment did not execute that attack.
3. **K66ConnectorRecurrence-3 — High, reporting integration:** source counts, held tallies, dispatch totals, IDs and receipt pointers repeatedly diverge (r55 V2; r58 V1–V6; r60 V1–V7; r63 D3; r64 D1/D3; r65 D1/D2/D5). Gates are incremental and scoped: Q50 tier-only, Q53/Q55/Q61 receipt/report subset; no single gate covers all Gate rows, IDs, counters and counts. Reproduce by comparing round-65 `## Gate` S204–S206 mappings with `corpus/SOURCES.md` as specified at `round-65-verifier-spotcheck.md:71`.
4. **K66ConnectorRecurrence-4 — High, incomplete runtime evidence:** dispatch/dead-seat variance appears in r56–r62; Q59 adds transcript/dispatcher evidence but its limits are recorded at `QUALITY.md:997` (lane-authored faithful records, substring report check, yielded-without-exit status). Reproduce by applying Q59 to its documented limits; not independently executed here.

## Artifacts
- `.ufo/waves/round-66/build/K66ConnectorRecurrence/patterns.md` — recurrence table (class, rounds, existing gate, miss reason, structural fix), considerthese cross-check, one bounded proposal and verification plan.

## Limits
- Did not run the frozen round-66 probes/counters or test counter attacks; the attack descriptions are grounded in the cited spotchecks/QUALITY text.
- The recurring-round assignments are qualitative class groupings of the 57 items, not exhaustive machine-classified labels; report source mapping exceptions rather than collapsing distinct mechanisms.
- No tools installed. No tests beyond the routed-ledger selftest cited above.
