RESULT ReviewCiteReceiptCand rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=harm errors_open=510 errors_cand=511 new_by_round40=3

1. Scope: R39-7 at the measured candidate 1530a75, plus lane master 0004ae3, which holds the round-40 lesson and the SKILL error pattern (absent at 1530a75). new_by_round40=3 is 1 at 1530a75 and 2 more at master (master errors=513).
2. Scratch only: /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceiptCand/ with clones lane (1530a75), open-clone (f69817e), master-clone (0004ae3). All three are clean after the runs.
3. Command, run in each clone root: node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --fleet /home/vgpnk/Projects/shokunin (pin HEAD 31c465f15669f744848bd9f5d56191c5085670f7; node v24.21.0 as found).
4. Same window, fleet index 320457 in all three. Open f69817e: CITE_CHECK: DRIFT (files=93 tokens=9090 errors=510 warnings=465).
5. Candidate 1530a75: CITE_CHECK: DRIFT (files=93 tokens=9150 errors=511 warnings=465).
6. Master 0004ae3: CITE_CHECK: DRIFT (files=94 tokens=9216 errors=513 warnings=465).
7. Committed receipt cite-check-open-f69817ed-realfleet.txt states errors=510 warnings=465 (fleet index 319570 when made). My open rerun has the same 510 rows: zero added, zero removed, despite fleet growth. Fleet drift moved no rows.
8. Control: the candidate cite-check.mjs run on the open documents gives 510 rows with zero difference, so the +40-line script change adds no errors.
9. Candidate rerun at 15:22 versus 15:21 (fleet 320438 to 320457): identical 511 rows. Warnings are 465 in every run and no warning row changed.
10. Attribution, open to candidate (--json findings, all severities, compared by file, severity, kind, token): +66 findings, none removed. Error +1 in corpus/SOURCES.md. Notes: QUALITY.md +5 OK; README.md +2 OK, +1 PIN_UNTYPED; SOURCES.md +5 OK, +1 PIN_UNTYPED; kimi-residue-files.md +8 OK; kimi-skills-plugins.md +42 OK, +1 PIN_UNTYPED.
11. Attribution, candidate to master: +83 findings, none removed. Errors +2, both in corpus/lessons/round-40.md. Notes: SKILL.md +4 OK; README.md +3 OK; round-40.md +5 FRAGMENT, +63 OK, +6 PIN_UNTYPED.
12. The new kimi section (kimi-skills-plugins.md, 124 added lines, no removed lines) adds 0 errors and 0 warnings; its only effect is 43 note findings.
13. New error 1 (candidate): corpus/SOURCES.md:49, row S036, REV_UNKNOWN 140f211984e8a0c926ec305a550da425f9bb8d69. The commit lives in the external repo stryker-mutator/mutation-testing-elements (named in the row's own URL). It does not rev-parse in the lane clone or the pin clone.
14. New error 2 (master): corpus/lessons/round-40.md:107, REV_UNKNOWN 140f2119, the same external commit in short form after the word "commit".
15. New error 3 (master): corpus/lessons/round-40.md:112, UNRESOLVED package/src/mutation-testing-report-schema.json. It is a path inside the npm tarball of row S037 (mutation-testing-report-schema@3.9.0) and is not under the pin src.
16. Arithmetic: 510 + 1 (error 1) = 511 at the candidate; + 2 (errors 2 and 3) = 513 at master. Round 40 removes no error row.
17. Baseline context: the open receipt already holds 32 REV_UNKNOWN errors for commits that rev-parse nowhere (ee907f1cf x9, b18e0274d x7, daa371583 x5, and eight other tokens). Errors 1 and 2 are the same class. In the clones, ee907f1cf and 140f2119 do not resolve, while f69817e and 637d181 do.
18. Discarded artifact: my first open and master runs used git archive extracts with no .git. They gave 555 and 564 errors, because lane-history commits such as f69817e and 637d181 became unresolvable. Only clone runs are used above.
19. Gap: SCORECARD.md and LOG.md are outside the scan set (listDocs, cite-check.mjs lines 311-319 cover SKILL.md and corpus/**/*.md). Round-40 SCORECARD and LOG citations have no cite-check result.
20. Gap: the 64-hex sha256 digest in S036 (404575e9...) appears in corpus/SOURCES.md and produces no finding, because the pin pattern accepts only 7 to 40 hex digits.
21. Gap: no round-40 candidate or master realfleet receipt is committed in cite-receipts/. The outputs above are scratch files only: /fast/scratch/hyaku/kumitate-r40/seats/ReviewCiteReceiptCand/ (open2.txt, cand2.txt, master2.txt and the matching -json.json files).
22. Operability: the gate reads DRIFT at open, candidate, and master (never CLEAN), and reruns reproduce row for row. Every error-count change is explained by a named document; none is unexplained.
23. Verdict basis: harm, because round-40 documents add three errors and all three are references the local verifier cannot open (an external commit and a tarball-internal path).
24. Integrator options (not applied by me): accept errors 1 to 3 as the external-commit class and record the new counts (511 at the candidate, 513 at master); or rewrite the three references so that their external parts are stated as external. Either way, state the chosen count.
25. Tools: none installed or updated. Read-only git in the clones (clone, checkout, archive, rev-parse, cat-file, status) and read-only cite-check runs. No jj command was run. The fleet directory was only read, by cite-check itself.
