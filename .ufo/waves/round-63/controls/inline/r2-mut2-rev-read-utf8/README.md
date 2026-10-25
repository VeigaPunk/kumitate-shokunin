# mut2-rev-read-utf8

Kills gate mutant **F1**. rev-mode read returning strings not Buffers makes b.length count chars; a 66-byte CJK report (22 chars) must stay a report. Pristine CLEAN, mutant REPORT_TINY. Needs a runner that commits the fixture and passes --rev.

Expressible by the frozen I3 runner: **no** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in F1-rev-read-utf8).
