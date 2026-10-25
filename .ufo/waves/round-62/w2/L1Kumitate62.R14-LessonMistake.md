# Q57 lesson / red-before finding

## Finding

**Present: Q57 is grounded in a concrete round-61 mistake and demonstrates both sides of the failure, but round 62 does not contain a corpus lesson with mistake rows or a demonstrated red-before fix.** The round-62 attempt therefore has evidence of the criterion and proposed repairs, not evidence satisfying the lesson/red-before obligation.

## Evidence

- Q57 is explicitly grounded in `corpus/lessons/round-61.md` §Mistakes and specifies a positive plus do-nothing/adversarial control, same frozen counter, and separate committed receipts (`corpus/QUALITY.md:945-950`). Its stated failure conditions are concrete: do-nothing reaches HELD or honest input cannot reach HELD.
- The cited round-61 demonstration is present: `corpus/lessons/round-61-verifier-spotcheck.md:77-89` reports C1's fabricated zero-seat fixture reaching `HELD 4/4`; lines 120-127 report C2 honest work at 3/6 versus forged capture 6/6. The same source routes R61-V2 to Q57 and lists intended v2 repairs/controls at lines 218-223.
- Round-62's prompt requires a mistake in `corpus/lessons/round-62.md` under `## Mistakes`, with class, evidence pointer, captured-by rule, and fix; it expressly says the fix only counts once shown able to fail (`.ufo/prompts/kumitate-round-62.md:68-72`).
- The lane lesson directory contains `round-61.md` and the verifier spotcheck, but no `round-62.md` (`corpus/lessons/` listing). `w2/LessonGate.md:68-87` independently records the absence and states there is no v2 counter, committed red-before state, or observed failure text for proposed repairs. `w1/ScribeRouted.md:7-13` is only a drafted mistake matrix, not the required corpus lesson.
- Round-62 artifacts do show attacks and fixture receipts, e.g. `w2/CritControlC1Nonempty.md:39-41` (frozen P61 probe on fabricated wave) and lines 88-92 (proposed correction), but these are counterexample evidence against the old counter, not a demonstrated red-before failure of a corrected counter. `w2/LessonGate.md:82-87` specifically confirms no such corrected counter/control evidence.

## Why this reaches the target

Q57's round-61 motivation is real and falsifiable, not merely a statement of a desired policy. However, the requested round-62 check asks whether a lesson with mistake rows and a fix demonstrated red-before is present. The extant round-62 matrix is a wave report, and the round-62 corpus lesson is absent; proposed fixes and old-counter failures cannot substitute for a red-before receipt showing the same counting command fail on the named defect with the fix as the only delta.

## Axes and smallest safe correction

Impacted axes: discernment/lesson frontier conformance; counter-control evidence also bears on operability. Smallest safe correction: add the required round-62 corpus lesson with properly classified mistake rows and evidence pointers, and only call a counter fix demonstrated after committing paired evidence for the identical frozen command: a red-before failing control and its corrected-state result, with the fix as the sole relevant delta. Do not infer a round-62 claim or verdict from these artifacts.
