VERDICT: Across rounds 40–63 and 7 aggregator audits, 11 of 12 routed defect classes recurred >= 3 times (up to 16 rounds for map drift and 13 for prose counts), 7 remain purely prose-only, and the R56-V3 map drift recurred a verified 10 times because readme-map ran only in-round while report-receipt-diff has zero map awareness.

## Evidence
- Base state readme-map drift on round-63 spotcheck (10th recurrence of R56-V3):
```
$ node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
EXIT=1
```
- Report-receipt-diff selftest (contract kumitate-report-receipt-diff-v1):
```
$ node scripts/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (20/20)
EXIT=0
```
- Real data test: round-60 report as filed (fleet 7b0581ed) vs round-63 report as filed (fleet 8fd46e61):
```
$ node scripts/report-receipt-diff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 60 --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-60/kumitate.md --rev HEAD --fleet /home/vgpnk/Projects/shokunin
REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=13611)
PLACEHOLDER __TIP__
PLACEHOLDER __MEASURED__
PLACEHOLDER __COMMITS__
PLACEHOLDER __MEASURED__
PLACEHOLDER __MEASURED__
PLACEHOLDER __MEASURED__
TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10
EXIT=1

$ node scripts/report-receipt-diff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 63 --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-63/kumitate.md --rev HEAD --fleet /home/vgpnk/Projects/shokunin
REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)
EXIT=0
```

## Findings

### K64ConnRecurrenceCount-1 (High — Structural Recurrence Failure)
Across 130 defect items extracted from rounds 40–63 spot-checks and 7 aggregator audits, 11 of 12 identified classes recurred >= 3 times:
1. Map drift: 16 rounds (Agg-r4..r6, R40, R44, R52..r58, R60, R61, R63, R64-base). Mechanical gate `readme-map.mjs` added R57.
2. Count in prose without receipt: 13 rounds (Agg-r1,5,6,8, R40, R42, R47, R48, R49, R51, R54, R60, R63). Prose-only until R64 C1.
3. Number drift between report and receipt: 11 rounds (Agg-r1,6,8, R46, R47, R50, R52, R55, R58, R60, R63). Prose-only until R64 C1.
4. Counter forgeable: 9 rounds (R41..R44, R47, R57, R61..R63). Partial (round negative controls).
5. Duplicate-URL warnings (W04): 8 rounds (R56, R57, R59..R64-base). Non-blocking warning exit 0 (prose-only enforcement).
6. Dead seats unreported / unreplaced: 7 rounds (R41, R44, R59..R63). Prose-only (Q58).
7. Seat-mix below line: 6 rounds (R40, R41, R56, R58, R60, R63). Prose-only.
8. Registry gap / unpinned gate: 6 rounds (Agg-r6, R40, R41, R48, R58, R61). Partial (`proxy-check.mjs`).
9. Filed-bytes edited in place: 4 rounds (Agg-r6, R46, R57, R61). Prose-only.
10. Uncommitted round work at close: 4 rounds (R42, R48, R50, R60). Prose-only.
11. Unresolvable hash: 4 rounds (Agg-r4, R46, R61, R63). Prose-only until R64 C1.
12. Placeholder in filed report: 2 rounds (R60, R61) (< 3 occurrences; mechanical gate in R64 C1).
Seven recurring classes remain purely prose-only. Prose-only routing fails to halt recurrence without mechanical gate enforcement.
Repro: inspect `build/K64ConnRecurrenceCount/recurrence.md` Section 2.

### K64ConnRecurrenceCount-2 (High — Tool Domain Contrast on R56-V3)
The R56-V3 map drift recurred a verified 10 times (r52, r53, r54, r55, r56, r57, r58, r60, r61, r63) due to an architectural lifecycle mismatch:
- `readme-map.mjs` checks corpus files against `corpus/README.md` and `.ufo/pins/readme-map.json`. It catches every occurrence (`DRIFT exit=1`), but ran only in-round or at close; spot-checks land post-close via non-author verifiers.
- `report-receipt-diff.mjs` checks reports against `.ufo/waves/round-N/{base,close}/*` receipts. It has zero knowledge of `corpus/README.md` or `corpus/lessons/` and would never catch map drift.
- Q60 in Round 64 fixes the lifecycle gap by running `readme-map.mjs` before plan freeze.
Repro: compare `node scripts/readme-map.mjs` (exit 1) with `node scripts/report-receipt-diff.mjs` (CLEAN on unmapped files).

### K64ConnRecurrenceCount-3 (Medium — Connector Move: Recurrence Lockout Gate)
Synthesizing Considerthese Idea 4 with C1 and Q60: formalize an automated pre-freeze gate (`scripts/recurrence-guard.mjs`) backed by `.ufo/pins/defect-recurrences.json`. Any routed defect class reaching >= 3 occurrences cannot be planned with a prose-only fix; it mechanically requires an executable gate or an orchestrator waiver. This closes the chronic debt in classes 5, 6, 7, 9, and 10, improving operability and quality without harming coverage.
Repro: see `build/K64ConnRecurrenceCount/recurrence.md` Section 6.

## Artifacts
- Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/w1/K64ConnRecurrenceCount.md`
- Recurrence Matrix & Analysis: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ConnRecurrenceCount/recurrence.md`

## Limits
- Recurrence counts cover rounds 40–63 verifier spot-checks and rounds 1–9 aggregator audits; rounds 10–39 spot-checks were sampled for precedents (e.g. r35/r36) but not fully re-tallied.
- Did not mutate or patch frozen round 64 files.
