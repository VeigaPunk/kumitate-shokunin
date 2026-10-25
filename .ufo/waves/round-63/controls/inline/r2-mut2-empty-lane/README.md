# mut2-empty-lane

Kills gate mutant **E9**. lane regex + -> * accepts the empty lane; empty ready.lane must stay fail-closed ready-lane-invalid.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in E9-empty-lane).
