# Routed ledger (UNION DRAFT — fixture for the K68MutLedgerRows mutation suite)

## Ledger

| id | round | item | quote | class | status | answer |
|---|---|---|---|---|---|---|
| R55-1 | 55 | 1 | "omitted the two trailing bookkeeping commits" | report-fidelity | closed | `corpus/lessons/round-56.md:31` — "this round's report lists every lane commit authored under round 56 including bookkeeping" |
| R55-2 | 55 | 2 | "Append-only correction entries owed in LOG.md and corpus/lessons/round-56.md" | tally-drift | closed | `LOG.md:2161` — "filed as B 9→10 measures B 9→11 over committed bytes" |
| R55-3 | 55 | 3 | "Carried (not this round's): R41-2 gate-pins ruling" | carried-unaddressed | open | - |
| R56-1 | 56 | 1 | "L2 floor unmet this round" | wave-shape | closed | `corpus/lessons/round-57.md:33` — "the L2 floor note records the orchestrator dispatches waves between rounds" |
| R56-2 | 56 | 2 | "stale frozen rules A54/A55" | frozen-predicate-defect | closed | `corpus/lessons/round-57.md:32` — "the A57 B7 arm freezes the amended convention" |
| R56-3 | 56 | 3 | "lands without a corpus/README.md map row" | reference-drift | closed | `corpus/README.md:168` — "repaired in round 57 by the readme-map gate" |
| R56-4 | 56 | 4 | "Carryovers unchanged: R41-2 gate-pins ruling" | carried-unaddressed | open | - |
| R57-1 | 57 | 1 | "two live L1s dispatched for one round" | dispatch-accounting | open | - |
| R57-2 | 57 | 2 | "append-only filed-bytes rule was not followed" | append-only-violation | closed | `corpus/lessons/round-58.md:56` — "filed under .ufo/reports/round-57/ was touched this round" |
| R57-3 | 57 | 3 | "B8 dead nonce-grep pathspec + absent argv assert" | frozen-predicate-defect | closed | `corpus/lessons/round-58.md:45` — "Routed-defect answers (round-57 → round-58, all four landed)" |
| R57-4 | 57 | 4 | "Carried L0 items unchanged" | carried-unaddressed | open | - |
| R58-1 | 58 | 1 | "the C2 base counter is misreported" | tally-drift | open | - |
| R58-2 | 58 | 2 | "35 reports, 29 never spawned" | dispatch-accounting | open | - |
| R58-3 | 58 | 3 | "cites S121 for the new entry" | citation-integrity | open | - |
| R58-4 | 58 | 4 | "the tier counts are wrong" | tally-drift | open | - |
| R58-5 | 58 | 5 | "its own registry table carries 18 kind=gate rows" | tally-drift | open | - |
| R58-6 | 58 | 6 | "gained no receipt-evidence row" | registry-home | open | - |
| R58-7 | 58 | 7 | "without a README row or a readme-map pin" | reference-drift | open | - |
| R58-8 | 58 | 8 | "REJECT 3 reason calls S126" | report-fidelity | open | - |
| R60-1 | 60 | 1 | "Six modified files and seven untracked" | uncommitted-work | open | - |
| R60-2 | 60 | 2 | "TIP, MEASURED, COMMITS are unfilled" | dangling-pointer | open | - |
| R60-3 | 60 | 3 | "9/10 contradicts its own receipt" | tally-drift | open | - |
| R60-4 | 60 | 4 | "nonexistent evidence files cited" | dangling-pointer | open | - |
| R60-5 | 60 | 5 | "not in the gate's schema" | dispatch-accounting | open | - |
| R60-6 | 60 | 6 | "dead seats unreported" | report-fidelity | open | - |
| R60-7 | 60 | 7 | "LOG tie is unsupported at the tip" | uncommitted-work | open | - |
| R60-8 | 60 | 8 | "sixth recurrence of the R56-V3" | reference-drift | open | - |
| R60-9 | 60 | 9 | "cites the wrong snapshot id" | citation-integrity | open | - |
| R61-1 | 61 | 1 | "falsifier fixtures live only in tmpfs" | uncommitted-work | open | - |
| R61-2 | 61 | 2 | "frozen counters admit fabrication and reject honest work" | frozen-predicate-defect | open | - |
| R61-3 | 61 | 3 | "in-place edits to filed bytes" | append-only-violation | open | - |
| R61-4 | 61 | 4 | "still carries 6 MEASURED/TIP/COMMITS tokens" | dangling-pointer | open | - |
| R61-5 | 61 | 5 | "proxy DRIFT and an unpinned tool" | reference-drift | open | - |
| R61-6 | 61 | 6 | "dead seat Audit19" | dispatch-accounting | open | - |
| R62-1 | 62 | 1 | "claims before any evidence seats" | wave-shape | open | - |
| R62-2 | 62 | 2 | "Run waves through the validator" | dispatch-accounting | open | - |
| R62-3 | 62 | 3 | "fourth consecutive round noted" | carried-unaddressed | open | - |
| R62-4 | 62 | 4 | "the re-queue's own report lists the exhaustive" | verification-gap | open | - |
| R62-5 | 62 | 5 | "Six pre-existing W04 duplicate-URL registry warnings" | citation-integrity | open | - |
| R63-1 | 63 | 1 | "lands without a corpus/README.md map row" | reference-drift | open | - |
| R63-2 | 63 | 2 | "69/69 is currently prose in SCORECARD/SKILL only" | verification-gap | open | - |
| R63-3 | 63 | 3 | "three -2 stems, not one" | tally-drift | open | - |
| R63-4 | 63 | 4 | "masks four missing kimi-root members" | tally-drift | open | - |
| R63-5 | 63 | 5 | "the Q51 hash 9237a72 that resolves nowhere" | carried-unaddressed | open | - |
| R63-6 | 63 | 6 | "seat band missed by one" | wave-shape | open | - |
| R64-D1 | 64 | 1 | "unreceipted selftest tally" | verification-gap | closed | `.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3` — "REPORT_RECEIPT_SELFTEST: PASS (125/125)" |
| R64-D2 | 64 | 2 | "README row for this file" | reference-drift | closed | `corpus/README.md:192` — "row added in round 65 (D2) so the file does not open the round in DRIFT" |
| R64-D3 | 64 | 3 | "D3 — dangling pointers" | dangling-pointer | open | - |
| R64-D4 | 64 | 4 | "Kimi layer DEGRADED K=49/53" | carried-unaddressed | open | - |
| R64-D5 | 64 | 5 | "R61-V2 and the Audit19 residuals are listed as open items" | carried-unaddressed | open | - |
| R65-D1 | 65 | 1 | "Gate row table contradicts the registry" | citation-integrity | closed | `.ufo/waves/round-66/d1-gate-correction.md:11` — "These rows are copied from corpus/SOURCES.md S204–S206" |
| R65-D2 | 65 | 2 | "capability row missing" | registry-home | open | - |
| R65-D3 | 65 | 3 | "SKILL.md has no rows for harm-matrix / omp-binary-probe" | registry-home | open | - |
| R65-D4 | 65 | 4 | "proxy stanza stale" | reference-drift | wontfix | `corpus/lessons/round-65.md:158` — "carried, not harmed" |
| R65-D5 | 65 | 5 | "errors 1545 → 1637 (+92) across two new files" | report-fidelity | closed | `.ufo/waves/round-66/w1/K66ExecCiteCheckD5.md:19` — "base 0 M 59 freeze 58 delta_M +59" |
| R65-D6 | 65 | 6 | "round size / wave 2" | wave-shape | open | - |
| R65-D7 | 65 | 7 | "README row for this file" | reference-drift | closed | `corpus/README.md:195` — "row added at the round-66 open (D7) so the file does not leave the round in DRIFT" |
| R66-D1 | 66 | 1 | "settle the wave leftovers" | uncommitted-work | closed | `.ufo/waves/round-68/plan.md:17` — "settled by the wrap-up commits (D1 debt closed)" |
| R66-D2 | 66 | 2 | "after cites held=3/6" | report-fidelity | closed | `corpus/lessons/round-66.md:11` — "at tip `6c79d68caf956e6c74a0c17c388662f4d1b7dec1`, `LEDGER66_UNMET held=3/6`, exit 1" |
| R66-D3 | 66 | 3 | "no sourced claim and no SOURCES advance landed" | citation-integrity | closed | `.ufo/waves/round-68/plan.md:105` — "Rows: S207 (deprecated.md 2026-07-28), S208" |
| R66-4 | 66 | 4 | "all four SHONEN boxes remain lane-asserted" | wave-shape | wontfix | `corpus/lessons/round-66.md:7` — "claims not verified; the dispatched v2 wave had no `WAVE-DONE` or results receipt at report cutoff, so wave output was not integrated" |
