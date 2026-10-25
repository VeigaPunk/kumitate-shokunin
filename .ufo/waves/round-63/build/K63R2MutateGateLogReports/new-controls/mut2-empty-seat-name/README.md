# mut2-empty-seat-name

Kills gate mutant **E7**. seat name regex + -> * accepts the empty name; an empty seat name must stay fail-closed dispatch-seat-name-invalid.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in E7-empty-seat-name).
