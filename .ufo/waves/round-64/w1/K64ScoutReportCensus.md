VERDICT: 31 rounds (32, 34-63) have a kumitate report; 5 have a labelled tally with no identical line in round-N/{base,close} receipts (49, 53, 58, 60, 62) — and round 60's last blob still carries a `__MEASURED__`-wrapped HELD 10/10 tally that the receipts contradict (tip reads UNMET 8/10).

## Evidence
Method: `/tmp/kumitate-r64/K64ScoutReportCensus/census.py` (copy: build dir) — git log/show only, no receipt tool. Regexes exactly as assigned. Receipt match = tally string as substring of any file under waves/round-N/{base,close}/ (recursive).
- Reports exist for rounds 32,34..63 (30,31,33 have no history). Census (`awk` over the TSV): n=31 reports, 15 carry labelled tallies (rounds 49-63, none earlier), first!=last blob=5, template tokens>0 = 1 (round 60).
- Stray-commit hazard: every report in rounds 32-61 has history `f47ad6ba` (restore, newest) / `35b91714` (stray delete, author "t", removes the whole fleet tree) / real commits. A naive `git log -- path | tail -1` is fine for FIRST (oldest) but a naive "last = newest commit" is f47ad6ba (restore) and a naive diff of consecutive commits sees a delete. I excluded 35b91714 (no blob at it). Last blob == blob at newest pre-stray commit for all 31 rounds (column `last_vs_prestray_differ` = no everywhere). Rounds 62/63 have a single commit each (198f40ed, 8fd46e61).
- first!=last differ: 36 (7 commits, 12300→15911 B), 37 (18 commits, 6437→15408 B), 49 (9886→10774), 51 (14225→15171), 57 (12622→14985). All others byte-identical first=last.
- `## SHONEN` heading count is exactly 1 in every blob (first and last).
- Template tokens: 0 everywhere except round 60 (first and last both 6): `__TIP__` l.4, `__MEASURED__` l.5/88/96/190, `__COMMITS__` l.73 (git show HEAD:.ufo/reports/round-60/kumitate.md).
- Receipt dirs present: base/close counts are 0/0 for 32-44, 49, 62 (62's dirs exist but are empty); round 45-48 close-only.

## Findings (hand-derived flag list; full table census.tsv, flags.txt)
K64ScoutReportCensus-1 (HIGH, must-reproduce): round 60 report l.88 `DISPATCH60: DISPATCH60_HELD held=10/10 …` sits under placeholder `__MEASURED__`; receipts round-60/close/dispatch60-tip.txt:1 and dispatch60-work.txt:1 read `DISPATCH60_UNMET held=8/10`. Tool must flag round 60 (tally unmatched + token count 6). Repro: `git -C /home/vgpnk/Projects/shokunin show HEAD:.ufo/reports/round-60/kumitate.md | grep -n 'DISPATCH60_HELD'; grep -rn 'DISPATCH60_' .ufo/waves/round-60/close`.
K64ScoutReportCensus-2 (MEDIUM): round 49 flagged only by layout: ORACLE_HELD held=6/6 / ORACLE_UNMET held=0/6 exist in round-49/r49/L1-score-0526f898.txt and round-49/controls/CtlNothing-base-b7b040b5.txt, not base/ or close/. A tool scanning only {base,close} must reproduce the flag (and should distinguish "receipts elsewhere").
K64ScoutReportCensus-3 (MEDIUM): round 62 report quotes round-61 tallies (DISPATCH61_UNMET held=2/4, DOCTRINE61_UNMET held=3/6); labels carry the number 61, not 62; round-62 base/close are empty dirs; matching lines live in round-61/close/a2-tip-dispatch61.txt. Flag expected; label round number ≠ report round.
K64ScoutReportCensus-4 (LOW): rounds 53 (`ATTEST53_UNMET held=0/0`, report l.103) and 58 (`ATTEST58_UNMET held=9/9`, l.31) are prose quotes of counter/mutant readings absent from base/close (round 53: only held=9/17 at base; 58: held=9/10 in close/IDEM-attest58-R3.txt). The tool will flag them; they are not forged claims. Frozen strings appear only under round-N/build|probe.
K64ScoutReportCensus-5 (INFO): the same label can appear repeatedly in one report (e.g. round 49: ORACLE_HELD twice; 50: GUARD_UNMET twice); I counted every occurrence, in order, without dedup. Rounds 49-61 tallies are all matched except as flagged; 50,51,52,54,55,56,57,59,61,63 are fully matched.

## Artifacts
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ScoutReportCensus/census.tsv (31 rows + header)
- .../build/K64ScoutReportCensus/flags.txt, census.py

## Limits
Round-N ↔ receipt dir mapping uses the report's round directory only; I did not parse which receipt each tally was derived from, nor check rev hashes. Matching is substring over all receipt files (recursive), not whole-line equality. Tallies counted from the last blob only for flags (first-blob unmatched list is in the TSV col 17). Did not run the receipt tool.
