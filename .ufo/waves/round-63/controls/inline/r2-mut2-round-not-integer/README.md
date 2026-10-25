# mut2-round-not-integer

Kills gate mutant **G10**. round integer validation dropped; --round 7x must stay usage exit 64, mutant degrades to FAIL-CLOSED wave-absent exit 2. Needs a runner passing an invalid round.

Expressible by the frozen I3 runner: **no** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in G10-round-not-integer).
