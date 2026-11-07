# K95ExecTool — round-95 candidate builder

Candidate: `.ufo/waves/round-95/K95ExecTool/round-gate.mjs` (sha256 in READY/sha256.txt)
Change: `declaredPins(sourcesText, malformed=[])` — registry rows declare pins only when `line.split('|')` has exactly 13 fields; otherwise id (field 1 trimmed) pushed in file order to `citations.malformedRows` (always present, incl. fail-closed path). Contract `kumitate-round-gate-v1` retained. Header doc updated (rule sentence verbatim, `citations.malformedRows`). Text mode: `info COMMIT_CITED_DECLARED` now `declared=<n> malformed=<n>` (no new finding). Selftest: 79 -> 86 arms (7 new (xv)-(xx) + fail-closed malformedRows arm).

Receipts (seat dir): `selftest.txt` (86/86 PASS), `score1.txt`, `score2.txt`, `sha256.txt`, `diff.txt`, `arm-teeth.txt`, `READY`.
Counter: `C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1` in both score1.txt and score2.txt.
Arm teeth: escapeonly 80/86, gt13 82/86, lenient12 82/86, anyrej 80/86 (rebuilt true variant), nodisclose 79/86, dropall 84/86 — all six killed.
Blockers: none.
