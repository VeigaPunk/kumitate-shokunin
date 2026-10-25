# mut2-results-json-broken

Kills gate mutant **E3**. broken results JSON must fail closed RESULTS_UNREADABLE, not degrade to RESULTS_MISMATCH DRIFT.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in E3-results-json-broken).
