# mut2-lane-dir-mismatch

Kills gate mutant **E10**. dir-vs-ready.lane cross-check disabled; fixture lane dir is demo-shokunin while ready.lane=other and everything else is consistent — pristine DRIFT READY_MISMATCH, mutant CLEAN. Frozen I3 runner cannot express it (root is always <case>/lane, so the cross-check is inert there); needs a runner that passes a *-shokunin root.

Expressible by the frozen I3 runner: **no** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in E10-lane-dir-mismatch).
