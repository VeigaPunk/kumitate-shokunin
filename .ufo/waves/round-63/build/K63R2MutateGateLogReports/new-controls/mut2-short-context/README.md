# mut2-short-context

Kills gate mutant **E5**. 63-char dispatch context (below the 64-char floor, still self-consistent) must stay fail-closed dispatch-context-too-short.

Expressible by the frozen I3 runner: **yes** (see run.sh header). Pristine gate passes; the mutant fails this case (verified 2026-10-25, evidence in E5-short-context).
