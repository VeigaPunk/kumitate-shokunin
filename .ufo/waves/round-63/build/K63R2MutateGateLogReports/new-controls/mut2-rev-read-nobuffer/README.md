# mut2-rev-read-nobuffer

Kills gate mutant **F2**. rev-mode read without maxBuffer fails on >1MiB committed results (1.2MiB fixture); pristine CLEAN, mutant FAIL-CLOSED results-unreadable. Needs a --rev runner.

Expressible by the frozen I3 runner: **no** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in F2-rev-read-nobuffer).
