# mut2-ready-l1-absent

Kills gate mutant **A3**. READY_MISMATCH no longer requires ready.l1; marker without an L1 name must still DRIFT.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in A3-ready-l1-absent).
