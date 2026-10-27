VERDICT: Baseline selftest passes 33/33; among 35 attempted one-point edits, 15 valid mutants survived (one further attempt was a no-op), exposing untested edges.
## Evidence
- `node /fast/scratch/hyaku/kumitate-r66/K66MutRoutedLedger/tool.mjs --selftest` (pristine): `ROUTED_LEDGER_SELFTEST: PASS (33/33)`, exit 0.
- Mutation suite: 35 attempted variants. Failures included separator (25/33), prose-break (31/33), 25-word quote limit (32/33), duplicate ids (32/33), and finding accumulator (15/33). Survivors and changed expressions: `build/K66MutRoutedLedger/survivors.md`.
- Frozen L4 counter run against scratch clone commit `6ace1db2dc73cb3ae3ab921dbbf8dc944968533a`: output `LEDGER66_UNMET held=3/6 checks=6 rev=6ace1db2dc73cb3ae3ab921dbbf8dc944968533a rule=L66 seed=66c1 | L2 MISS exit=2 verdict=ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md own-items=57 own-spotchecks=11 | L3 MISS 67 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L6 MISS skill-row=false quality=false capability-row=false`, exit 1. This representative recurrent-threshold survivor is not reported as L4-missed; L4 check is among held three.
- Original SHA-256: `build/K66MutRoutedLedger/original.sha256`; per-mutant exit/verdict: `build/K66MutRoutedLedger/mutation-results.json`.
## Findings
1. K66MutRoutedLedger-1 — severity: coverage. Selftest survivors cover heading/list boundary syntax, allowed answer paths/lines, digit constraints, off-range ordinals, normalization, and recurrence threshold. Reproduce with `node scripts/routed-ledger.mjs --selftest` after any respective one-token change; complete variant list in build survivor artifact.
2. K66MutRoutedLedger-2 — severity: coverage. Frozen counter result cannot attribute each fixture independently in its summary; only the representative threshold mutant was run through L4. Reproduce via `node .ufo/waves/round-66/probe/ledger66-probe.mjs <scratch-clone> <mutant-rev> --seed 66c1`.
## Artifacts
- `.ufo/waves/round-66/build/K66MutRoutedLedger/mutation-results.json`
- `.ufo/waves/round-66/build/K66MutRoutedLedger/survivors.md`
- `.ufo/waves/round-66/build/K66MutRoutedLedger/original.sha256`
## Limits
- Did not add per-survivor `add(...)` cases: task remains incomplete for this requirement. L4 status was inferred from held-check count, not individually printed. No tool install.

- Killer cases: attempted generation failed with a syntax error, so per-survivor kill/pass evidence is unavailable.
