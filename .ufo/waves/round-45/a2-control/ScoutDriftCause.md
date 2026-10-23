RESULT ScoutDriftCause rev=a2e5b54c verdict=recurring rounds=35,36,40,41,42,43,44,45

Cause at round 45 open, re-counted from committed bytes. Receipt
`.ufo/waves/round-45/open/proxy-strict-3632602c.txt:2` (commit a2e5b54c) reads
`C2_TOTAL_DRIFT term=C2_total declared=99 computed=100 delta=+1`, plus coverage row 10 derived 9.
The tree scored is 3632602c. `scripts/proxy-check.mjs` is identical from 3632602c to a2e5b54c.
C2 counts README lines matching `/^\| `(knowledge|lessons)\//` (`RE_README_ROW` line 495,
`deriveTerms` line 933). C2_total counts regular `*.md` files under `corpus/knowledge` and
`corpus/lessons` (`listCorpusNotes` lines 690-696; line 934). `.git` is skipped; symlinks are not files.

`git ls-tree -r 3632602c -- corpus/knowledge corpus/lessons` and the README regex:
notes=100, README rows=99, row paths=99, duplicate rows=0, rows with no file=0.
`SCORECARD.md` at that commit: `C2=99`, `C2_total=99`. The one unrowed file is
`corpus/lessons/round-44-verifier-spotcheck.md`. C2 matches, so only the total drifts.
`floor(10 × 99/100) = 9` is the coverage drift on the same line. Commit 3632602c added that
file ("round-44 verifier spot-check (integrator, hyaku): non-author admit/reject") and did not
change `corpus/README.md` or `SCORECARD.md`.

Same class earlier. Each closure commit below added one `*-verifier-spotcheck.md` and touched
neither the README nor the stanza. At that commit, notes = declared + 1 and that file is the
only gap. `git log -S'C2_TOTAL_DRIFT' -- .ufo corpus` plus the lessons name the receipts.

| round | file | receipt line |
|---|---|---|
| 35 | `corpus/lessons/round-34-verifier-spotcheck.md` | `.ufo/waves/round-35/baseline/proxy.txt:3` `C2_total: declared=77 computed=78 delta=+1` (lane 1770305fa: 78 notes, 77 rows). Lesson `round-35.md:17`. |
| 36 | `corpus/lessons/round-35-verifier-spotcheck.md` | `.ufo/waves/round-36/baseline/proxy-default.txt:1` `declared=79 computed=80` (base 0614092: 80 notes, 79 rows). Lesson `round-36.md:21`. |
| 40 | `corpus/lessons/round-39-verifier-spotcheck.md` | `.ufo/waves/round-40/open/receipts.txt:9` `declared=88 computed=89` (f69817e: 89 notes, 88 rows). Lesson `round-40.md:33-34`. |
| 41 | `corpus/lessons/round-40-verifier-spotcheck.md` | `.ufo/waves/round-41/open/receipts.txt:7` `declared=90 computed=91` (a58b7f7: 91 notes, 90 rows). Lesson `round-41.md:137`. |
| 42 | `corpus/lessons/round-41-verifier-spotcheck.md` | `.ufo/waves/round-42/open/receipts.txt:5` `declared=92 computed=93` (dfabe92: 93 notes, 92 rows). Plan `.ufo/waves/round-42/plan.md:105-108`. |
| 43 | `corpus/lessons/round-42-verifier-spotcheck.md` | `.ufo/waves/round-43/open/receipts.txt:9` `declared=94 computed=95` (2a7f37d: 95 notes, 94 rows). Plan `.ufo/waves/round-43/plan.md:95-96`. |
| 44 | `corpus/lessons/round-43-verifier-spotcheck.md` | `round-44-verifier-spotcheck.md:115` computed 97 against declared 96 (6cda8c35: 97 notes, 96 rows). Lesson `round-44.md:117-118`. Control `.ufo/waves/round-44/controls/ExecGateBaseline.md:86` states the same pair. No proxy file under `round-44/open/`. |
| 45 | `corpus/lessons/round-44-verifier-spotcheck.md` | `.ufo/waves/round-45/open/proxy-strict-3632602c.txt:2` `declared=99 computed=100` (3632602c: 100 notes, 99 rows). |

Not this recorded class: rounds 37, 38 and 39. The closure trees had the same unrowed file
(5833351 round-36 file, 82 vs 83; 753446a round-37 file, 84 vs 85; 2fa28e5 and round-39 open
fac39171 round-38 file, 86 vs 87), but `git grep` of those three declared/computed pairs at
a2e5b54c under `corpus`, `.ufo/waves/round-37`, `round-38`, `round-39`, `LOG.md` and `SCORECARD.md`
is empty. No open receipt and no lesson records them. Round 37 did record
`C2_TOTAL_DRIFT declared=83 computed=84` (`round-37.md:44-45`, commit 5ceb8cd) but the missing
file there is `corpus/lessons/round-37.md`, the lane lesson, not a non-author file. Round 16's
`C2_TOTAL_DRIFT` is that author-lesson class too.

No tools installed. Confidence high for the eight receipt rows. Unknown: whether rounds 37-39
ran the proxy at open and never committed the output.
