# mut2-ready-json-broken

Kills gate mutant **E2**. broken ready JSON must fail closed as ready-unreadable (DISPATCH_UNREADABLE), not degrade to READY_MISMATCH.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in E2-ready-json-broken).
