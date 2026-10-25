# mut2-wave-required

Kills gate mutant **G14**. --wave requirement dropped; missing --wave must stay usage exit 64, mutant degrades to FAIL-CLOSED wave-absent exit 2. Needs a runner omitting --wave.

Expressible by the frozen I3 runner: **no** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in G14-wave-required).
