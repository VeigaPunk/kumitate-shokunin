# mut2-reports-count-line

Kills gate mutant **C5**. reports counter doubled: verdict stays CLEAN but the line lies (reports=6 vs reports=3). run.sh asserts the count; the frozen expect predicate (exit+id) cannot see it — adopting this against the frozen runner documents but does not kill; a runner that asserts CLEAN-line counts kills it.

Expressible by the frozen I3 runner: **no** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in C5-reports-count-x2).
