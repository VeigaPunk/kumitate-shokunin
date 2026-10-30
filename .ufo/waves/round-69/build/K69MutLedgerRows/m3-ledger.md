# Routed ledger — every non-author routed defect, bound

One row per routed item of `corpus/lessons/round-N-verifier-spotcheck.md` for N in [55..66]
(12 spot-checks, 61 routed items; round 59's routed section is prose and carries 0 items).
A row binds to its item by a located quote (3..25 words, unique within the section); a
`closed`/`wontfix` row binds its answer to an exact line of a lane file that is neither the
ledger nor a spot-check; round-66 answers are new since the round-66 base `8d557f85`.
Landed round 69 (claim C1, rule L69); statuses are honest — `open` means no committed lane
file answers the item yet. Append-only: corrections are new rows, never edits.

## Ledger

| id | round | item | quote | class | status | answer |
|---|---|---|---|---|---|---|
| R55-V1 | 55 | 1 | "omitted the two trailing bookkeeping" | report-accuracy | open | - |
| R55-V2 | 55 | 2 | "Append-only correction entries owed" | append-only | closed | `corpus/lessons/round-56.md:25` — "line is closed next round by an append-only correction)." |
| R55-C1 | 55 | 3 | "R41-2 gate-pins ruling" | carryover | open | - |
| R56-V1 | 56 | 1 | "L2 floor unmet this round" | wave-floor | closed | `LOG.md:2309` — "41 seats (landed d92cf1ff3026087a0e21a3183b97de169c6f22c), w2 39 seats (landed f874353902d05cee762da2e831f714b8d897604c); integration commit 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 between them. Findings that changed the work: the" |
| R56-V2 | 56 | 2 | "stale frozen rules A54/A55" | rule-obsolescence | closed | `corpus/knowledge/counter-amendment-discipline.md:5` — "# Counter and amendment discipline - how a frozen measurement stays honest" |
| R56-V3 | 56 | 3 | "lands without a corpus/README.md map row" | readme-map | closed | `LOG.md:2199` — "round-56-verifier-spotcheck README map row is restored (the R56-V3 routed" |
| R56-C1 | 56 | 4 | "Carryovers unchanged: R41-2 gate-pins ruling" | carryover | open | - |
| R57-V1 | 57 | 1 | "two live L1s dispatched" | orchestration | open | - |
| R57-V2 | 57 | 2 | "rewrote paragraphs of the earlier" | append-only | open | - |
| R57-V3 | 57 | 3 | "B8 dead nonce-grep pathspec" | gate-hardening | open | - |
| R57-C1 | 57 | 4 | "Carried L0 items unchanged" | carryover | open | - |
| R58-V1 | 58 | 1 | "the C2 base counter is misreported" | report-accuracy | closed | `corpus/lessons/round-64.md:4` — "receipts, scripts/report-receipt-diff.mjs, scripts/jj-seat-demo.sh)" |
| R58-V2 | 58 | 2 | "overstates the dispatch" | report-accuracy | closed | `SCORECARD.md:1801` — "node scripts/dispatch-evidence.mjs --selftest → DISPATCHEVIDENCESELFTEST: PASS (8/8) + VERDICT: PASS; live over the round-60 committed record → DISPATCHEVIDENCE: CLEAN (seats=32" |
| R58-V3 | 58 | 3 | "is not a row in" | citation-integrity | closed | `SCORECARD.md:1800` — "ghosts=1 first=S121 exit 1; pin.cite-sources in kumitate-gate-pins-v1; SKILL checklist item 29 | 59 |" |
| R58-V4 | 58 | 4 | "the tier counts are wrong" | report-accuracy | open | - |
| R58-V5 | 58 | 5 | "Seventeen are gates" | registry-home | open | - |
| R58-V6 | 58 | 6 | "capabilities table gained no" | registry-home | closed | `LOG.md:2220` — "v2 (routed defects R57-V1/V2/V3/V4), C2" |
| R58-V7 | 58 | 7 | "without a README row or" | readme-map | closed | `corpus/README.md:175` — "R58-V1..V8; row added in round 59 so the file does not open the next round in DRIFT | .ufo/reports/round-58/kumitate.md; lane" |
| R58-V8 | 58 | 8 | "REJECT 3 reason calls S126" | wording | open | - |
| R60-V1 | 60 | 1 | "uncommitted round work" | landing | open | - |
| R60-V2 | 60 | 2 | "placeholders filed in the fleet report" | report-accuracy | closed | `LOG.md:2295` — "MEASURED placeholders at lines 2833/2847, withdraws the R60 C1 10/10" |
| R60-V3 | 60 | 3 | "contradicts its own receipt" | report-accuracy | closed | `LOG.md:2296` — "overclaim (receipt 8/10), and supersedes the stale proxy stanza in prose" |
| R60-V4 | 60 | 4 | "nonexistent evidence files cited" | citation-integrity | open | - |
| R60-V5 | 60 | 5 | "not in the gate" | schema | open | - |
| R60-V6 | 60 | 6 | "dead seats unreported" | report-accuracy | closed | `LOG.md:2013` — "seats (CritRepairsForClaims, CritReporting - absent artifacts only, no error text recorded)." |
| R60-V7 | 60 | 7 | "LOG tie is unsupported" | report-accuracy | open | - |
| R60-V8 | 60 | 8 | "map drift, integrator-caused" | readme-map | closed | `LOG.md:2301` — "lesson, corrected the README/covered map including the missing round-61 spot-check row, refreshed proxy terms to A=117/C2=150 and pinned make-dispatch-actual.mjs, and" |
| R60-V9 | 60 | 9 | "reject reason cites the wrong snapshot id" | citation-integrity | open | - |
| R61-V1 | 61 | 1 | "falsifier fixtures live only in tmpfs" | scratch | open | - |
| R61-V2 | 61 | 2 | "frozen counters admit fabrication" | counter-forgery | open | - |
| R61-V3 | 61 | 3 | "in-place edits to filed bytes" | append-only | closed | `LOG.md:2301` — "and appended R61-V3 corrections. R61-V1 C2 bundle verified (c5c01540…, .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle); C1 scratch fixture absent, not recreated. R61-V4 six report placeholders" |
| R61-V4 | 61 | 4 | "R60 fleet-report placeholders" | report-accuracy | closed | `LOG.md:2301` — "report placeholders mapped in .ufo/waves/round-62/w2/R60Erratum.md; the lane cannot edit the filed fleet report. R61-V6 Audit19 re-queued; its 32/5/27 audit and" |
| R61-V5 | 61 | 5 | "proxy DRIFT and an unpinned tool" | proxy-stanza | closed | `LOG.md:2301` — "and pinned make-dispatch-actual.mjs, and appended R61-V3 corrections. R61-V1 C2 bundle verified (c5c01540…, .ufo/waves/round-61/controls/r61-c2-full-forgery.bundle); C1 scratch fixture absent, not recreated. R61-V4" |
| R61-V6 | 61 | 6 | "Its attack item stayed unattacked" | dead-seat | open | - |
| R62-I1 | 62 | 1 | "Declare 1-3 claims before any evidence seats run" | claims | closed | `LOG.md:2304` — "(attempt 1): claims frozen before dispatch (.ufo/waves/round-63/plan.md at b38a2065ab8ac5b198f6569b9013d04411c3d40d). C1 capability inline-dispatch-evidence (scripts/inline-dispatch-evidence.mjs, 69-case selftest, 75 controls, gate for run-7" |
| R62-I2 | 62 | 2 | "Run waves through the validator" | dispatch | closed | `LOG.md:2322` — "39f61816d4ee7a8d401df42c1818c91a9c537bce; the validated v2 wave settled 66/66 seats. Integration commit 76bdda4bde02522829598c1c81f1836ffbea8d34 lands the re-grounded MCP deprecation entry, S207-S213 rows and" |
| R62-I3 | 62 | 3 | "fourth consecutive round noted" | counter-forgery | open | - |
| R62-I4 | 62 | 4 | "own report lists the exhaustive" | carryover | open | - |
| R62-I5 | 62 | 5 | "duplicate-URL registry warnings" | sources-registry | open | - |
| R63-D1 | 63 | 1 | "recurrence, tenth time" | readme-map | open | - |
| R63-D2 | 63 | 2 | "Commit a transcript of" | selftest-transcript | open | - |
| R63-D3 | 63 | 3 | "w2 name collisions" | report-accuracy | open | - |
| R63-D4 | 63 | 4 | "masks four missing kimi-root members" | kimi-layer | open | - |
| R63-D5 | 63 | 5 | "the Q51 hash" | carryover | open | - |
| R63-D6 | 63 | 6 | "is below the ≥50% line and" | wave-shape | closed | `LOG.md:2309` — "41 seats (landed d92cf1ff3026087a0e21a3183b97de169c6f22c), w2 39 seats (landed f874353902d05cee762da2e831f714b8d897604c); integration commit 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 between them. Findings that changed the work: the" |
| R64-D1 | 64 | 1 | "unreceipted selftest tally" | selftest-transcript | open | - |
| R64-D2 | 64 | 2 | "README row for this file" | readme-map | closed | `corpus/lessons/round-65.md:5` — "README row/pin for the round-64 spot-check)" |
| R64-D3 | 64 | 3 | "real outputs under" | citation-integrity | open | - |
| R64-D4 | 64 | 4 | "Kimi layer DEGRADED" | kimi-layer | open | - |
| R64-D5 | 64 | 5 | "are listed as open items" | carryover | open | - |
| R65-D1 | 65 | 1 | "Gate row table contradicts the registry" | citation-integrity | open | - |
| R65-D2 | 65 | 2 | "capability row missing" | registry-home | open | - |
| R65-D3 | 65 | 3 | "has no rows for" | registry-home | open | - |
| R65-D4 | 65 | 4 | "proxy stanza stale" | proxy-stanza | closed | `LOG.md:2296` — "and supersedes the stale proxy stanza in prose" |
| R65-D5 | 65 | 5 | "across two new files" | carryover | open | - |
| R65-D6 | 65 | 6 | "round size / wave 2" | wave-shape | open | - |
| R65-D7 | 65 | 7 | "README row for this file" | readme-map | closed | `corpus/README.md:196` — "row added at the round-66 open (D7) so the file does not leave the round in DRIFT | .ufo/reports/round-65/kumitate.md; lane" |
| R66-D1 | 66 | 1 | "settle the wave leftovers" | landing | closed | `LOG.md:2322` — "v2 wave settled 66/66 seats. Integration commit 76bdda4bde02522829598c1c81f1836ffbea8d34 lands the re-grounded MCP deprecation entry, S207-S213 rows and captures/pins, README map" |
| R66-D2 | 66 | 2 | "only committed receipt names" | receipt-precision | closed | `LOG.md:2324` — "counters were run at M=42b04dac0620b51a5ca4f09510e1b65cbd7e7fd1. C1 frozen ledger68-probe.mjs → LEDGER68UNMET held=1/7, exit 1 (.ufo/waves/round-68/close/ledger68-final.txt); base was 1/7. The v2 draft/selftest/acceptance" |
| R66-D3 | 66 | 3 | "no sourced claim and no SOURCES advance" | frontier | closed | `LOG.md:2322` — "lands the re-grounded MCP deprecation entry, S207-S213 rows and captures/pins, README map row/pin, and the corrected PROVINCE frontier (including the" |
| R66-N4 | 66 | 4 | "SHONEN boxes remain lane-asserted" | scope | wontfix | - |
