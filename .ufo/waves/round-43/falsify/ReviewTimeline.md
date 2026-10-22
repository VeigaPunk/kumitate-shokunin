RESULT ReviewTimeline verdict=ordered violations=0 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 counter=0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82:scripts/gate-mutants.mjs sha256=e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a

Timeline audit from committed bytes, round 43. Ordered; 0 violations.

1. Plan and counter frozen after the plan commit.
   git show 0f4108bf:scripts/gate-mutants.mjs | sha256sum -> e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a (matches the plan's frozen value and SCORECARD pin).
   plan.md blob b8887ad9ec538c69ffad87e4608579372c97064b5496a684e42d274d2a310276 at ALL of 0f4108bf, e5ffcbe7, df1ceaf86, fb3eab40, 84cb1d5d, 003dd285; git log shows plan.md touched only at 0f4108bf. K43 text never changed.
   Counter-printed shas: open/c1-control-base.txt line 3 -> e24749e4 (run 2026-10-22T22:11:46Z); final/c1-measured-84cb1d5d.txt line 3 -> e24749e4 (run T22:41:55Z). Wave-1 reports extracting the counter (ExecJunkControls, MutK43Counter, CritK43Rule, SentinelTempParent) all record e24749e4. No receipt prints any other sha.
   Lane script blob is e24749e4 at 0f4108bf, e5ffcbe7, df1ceaf86; it changes to 177f6cbb only at the measured commit 84cb1d5d (D4 gate-mutants lane-copy isolation and counter-suite cases). That is planned work at the target, not an amendment of the counter: every counted run extracts from the plan commit.

2. A1 precedes the measured run.
   df1ceaf86 (A1 addendum, "written ~22:30Z ... BEFORE any counter run at an integrated (measured) commit"; writes 2026-10-22 19:30:45 -0300 = T22:30:45Z) is an ancestor of 84cb1d5d (19:41:45 -0300 = T22:41:45Z) via fb3eab40 (wave-1 evidence, 19:41:06 -0300). Parent chain verified: 2a7f37d2 -> 0f4108bf -> e5ffcbe7 -> df1ceaf86 -> fb3eab40 -> 84cb1d5d -> 003dd285.
   Discriminator controls (probe/c1-discriminators-controls.txt) ran T22:30:08Z, before the measured run. Probe script blob at df1ceaf86 hashes to 7e2d4f34bba3e11f721a9d53569244a097bc0d4757616d7220a6f4025df593ed, matching both discriminator receipts' stated sha.

3. Measured receipt is the first run at 84cb1d5d.
   Receipt header: "first run at this commit; 2026-10-22T22:41:55Z". The commit was created T22:41:45Z, so no earlier run at that rev could exist; wave-1 evidence predates the measured commit. Grep for GATE_MUTANTS runs across the round-43 wave finds only rev=2a7f37d2 (control, x2 with dry-run), wave-1 scratch commits, and rev=84cb1d5d in final/c1-measured; no other run at the measured rev anywhere. The later 84cb1d5d receipts are the discriminators (T22:42:56Z) and checklist (T22:43:06Z), committed with the receipt at 003dd285 (19:44:53 -0300).
   Measured run content: 43 MUTANT lines, all killed, all confirm=same, 0 survived/unstable; CONTROL cite-check 75/75 floor=75 PASS and wave-census 32/32 floor=31 PASS; CONTROL_AFTER both PASS; GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=84cb1d5d manifest=8486506f... leftovers=0) exit=0; gm-tmp empty. Matches the plan target exactly, exercising K43 (a)-(d) and the after-mutant control re-runs.

Residual risk / gaps.
- The pre-commit dry-run transcript (open/c1-control-base-dryrun-precommit.txt) prints no counter sha and no command; it is disclosed in the plan, not a counted receipt, and its output is byte-identical to the committed control receipt (verified by wave-1 CritDisclosure).
- The discriminator D-static check is a declared pattern heuristic (self-read aliases could evade it); the wave-2 diff reviews are the named backstop, not this seat.

No tools installed or updated.
