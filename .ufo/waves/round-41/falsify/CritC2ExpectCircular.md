RESULT CritC2ExpectCircular rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=partial fair=yes second_slips=1

All commands ran in my clone /fast/scratch/hyaku/kumitate-r41/seats/CritC2ExpectCircular/lane at 4e58bb0e (`git rev-parse HEAD` printed 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3). No tools installed.

Fairness. The number 4 is not the L1's choice. It is in committed round-40 prose, `.ufo/waves/round-40/evidence/seat-gate.txt` item 4 ("four mutation-tester seats returned results"), last changed in 69ceb52 (round 40). The non-author verifier flagged it at round open (`corpus/lessons/round-40-verifier-spotcheck.md` defect (b), commit a58b7f7). The test discriminates on the same payload:
  `node scripts/wave-census.mjs --round 40 --expect build:mutation-tester=4` -> `FINDING EXPECT_MISMATCH round=40 wave=build build:mutation-tester=4 payload=3`, exit=1
  `... --expect build:mutation-tester=3` -> `WAVE_CENSUS: CLEAN`, exit=0
  `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` -> RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0 (matches the claim)
So "shown able to fail" holds in the narrow sense. It is a known-answer test, though. The counter (2759297) was committed after a58b7f7, which already lists the three names (`git merge-base --is-ancestor a58b7f7 27592977` -> ancestor). Every n other than 3 fails the same way (n=0,1,2,5,11 -> exit=1 each). So the pair shows that `--expect` compares against the payload. It does not show that the instrument finds a slip: the census never reads prose.
Too wide: the R40-6 disposition row in `corpus/lessons/round-41.md` says "the instrument now catches it". It catches the slip only after a human reads the prose and types its number into `--expect`.

Second slip (1 found, not new). `/home/vgpnk/Projects/shokunin/.ufo/reports/round-40/kumitate.md:151` (the L1's own round report) says "attack roles 37/67 = 55%". `corpus/lessons/round-40-verifier-spotcheck.md:46` says "Attack roles: 37 of 67". The payload has 45 (census: build attack=14, falsify attack=31). The round-41 lesson records this, but credits it only to "the round-40 closure"; the L1's report repeats it.
`--expect` cannot assert it. The role regex accepts `attack`, which it then treats as a role name:
  `--round 40 --expect falsify:attack=31` -> `EXPECT_MISMATCH ... falsify:attack=31 payload=0`, exit=1 (false mismatch on a true count that the census itself prints)
  `--round 40 --expect build:attack=0` -> CLEAN, exit=0 (vacuous pass)
  `--round 40 --expect build:mutation-testers=0` -> CLEAN, exit=0 (a misspelled role passes vacuously)
Testing it role by role works only with hand arithmetic: `--expect build:critic=8 build:reviewer=3 build:mutation-tester=3 falsify:critic=12 falsify:reviewer=12 falsify:mutation-tester=7` (each passed as its own `--expect` flag) -> CLEAN exit=0, sum 45, not 37. [INFERENCE] 37 = 45 minus the 8 wave-1 critics (`--expect build:critic=0` -> payload=8).

No other slip. Every role mix stated in rounds 35-40 matches the payload: reports round-35 :76-77, round-36 :51, round-38 :69-70, round-39 :74, round-40 :144-147; lessons round-38 :89 and :138; spot-checks round-39 :26 and round-40 :44-45; round-36 `accounting.md` against `falsify-spec.json` (48/18/9/3/3). Round 35 "two mutation seats" for C3 = MutKimiCensusMcp and MutProxyKRule. Round 40 "four wave-2 critic seats" = AtkReviewForge, AtkRecordForge, AtkNovelPin and AtkNovelRecords, all critics. Round 38's "39 such seats failed" = 39 of the 79 Check seats absent.

Exit-code limits on using `--expect` as a test:
  `--round 39 --round 40 --expect build:mutation-tester=3` -> `EXPECT_MISMATCH round=39 ... payload=11`, exit=1 (`--expect` is not scoped to a round)
  `--round 35 --expect falsify:mutation-tester=4` -> exit=1 from two `STRAY_REPORT` findings (ExecS8Fidelity, ExecS8Fix) although the expectation holds. The lesson names stray reports only for round 38.
  `--round 36 --expect falsify:reviewer=48` -> `EXPECT_UNKNOWN`, exit=1. Round 36's falsify wave was never dispatched, so it has only a spec and the census cannot check its count.

Impacted axes: operability (gate false and vacuous results), calibration (disposition wording).
Smallest safe correction:
- Reword R40-6 to "a declared count can now be checked against the payload with `--expect`".
- In `parseArgs`, reject any role not found in any payload (or report it as `EXPECT_UNKNOWN`), or add `attack` as an aggregate key.
- Allow the form `--expect <round>/<wave>:<role>=<n>`.
