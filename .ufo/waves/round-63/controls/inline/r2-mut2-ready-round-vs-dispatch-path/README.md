# mut2-ready-round-vs-dispatch-path

Kills gate mutant **A1**. READY_MISMATCH no longer checks ready.round; ready says round 9 while the dispatch path names round-7 — pristine must DRIFT READY_MISMATCH, mutant reads CLEAN.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in A1-ready-round-path).
