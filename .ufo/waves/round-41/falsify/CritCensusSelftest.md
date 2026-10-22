RESULT CritCensusSelftest rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=undertested missed=26/45
Baseline: `node scripts/wave-census.mjs --selftest` in clone /fast/scratch/hyaku/kumitate-r41/seats/CritCensusSelftest/lane at 4e58bb0e → `WAVE_CENSUS_SELFTEST: 12/12 pass`, exit 0.
Method: /fast/scratch/hyaku/kumitate-r41/seats/CritCensusSelftest/mutate.mjs applies one hand edit per mutant (each edit string must occur exactly once in the source) to a copy of scripts/wave-census.mjs, then runs `<copy> --selftest`. Caught means at least one WC case FAILs. Missed means 12/12 pass. No mutant crashed or failed to apply.
Command: `node mutate.mjs lane mut` → `TRIED=45 CAUGHT=19 MISSED=26 OTHER=0` (full output: seats/CritCensusSelftest/mutants.out).
Caught (19): drop labrat, mutation-tester, reviewer or critic from the attack set; add scout to it; invert the stray check; stop sorting roles; reverse the name tie-break; count absent as present (no existsSync); use the report dir instead of the file; drop the registry element compare; absent role reads as the declared count; drop EXPECT_UNKNOWN; reject bare payloads; print only the first absent name; stop summing the ROUND attack total; exit 0 on DRIFT; skip the registry check; expect reads the attack total.
Each missed mutant was checked for equivalence by /fast/scratch/hyaku/kumitate-r41/seats/CritCensusSelftest/witness.mjs. It diffs the original against the mutant (exit, stdout, first stderr line) on real rounds and on small fixtures. All 26 changed the observed output, so none is equivalent. Output: seats/CritCensusSelftest/witness.out.
MISSED, shown by real committed rounds (`--root lane --round 39 --round 40 --round 41`, the original exits 0 and is CLEAN):
M08 roles sorted by name only. M09 count key ascending. The original prints `roles: mutation-tester=11 cri…` and the mutant prints `roles: connector=1 critic=10…`. Cause: every selftest wave has each role exactly once.
M28 role count never increments (each role reads 1). M29 attack counts distinct attack roles, not seats (round 39 build: original `attack=28`, mutant `attack=3`). Same cause: no repeated role in any fixture. The C2 counter's jq recount would catch M28; nothing catches M29.
M14 Report: anchor dropped from RE_REPORT. Round 40 build goes from `reports=31/32` to `32/32` and the exit goes from 0 to 1. Real round-40 task texts name earlier reports before their trailer. For example, ExecTokenKept names .ufo/waves/round-39/falsify/BypassSwapRaws.md, which exists. The selftest task text has no other path.
M21 stray scan reads non-.md files: `FINDING STRAY_REPORT round=39 wave=build .ufo/waves/round-39/build/swarm-registry.json`, exit 0 becomes 1.
M27 ROUND totals not reset between rounds: original `ROUND round=40 … seats=67 attack=45 reports=57/67`, mutant `seats=158 attack=102 reports=73/158`. Every selftest case uses one round.
M40 absent line printed only when 2 or more seats are absent: `  absent: ExecTokenKept` (round 40 build) disappears. WC01 has 2 absent seats, and WC08 has 1 but never checks the line.
M23 one-sided expect (`got < ex.n`): `--round 40 --expect build:mutation-tester=2` (payload 3). The original gives `FINDING EXPECT_MISMATCH … payload=3`, exit 1. The mutant gives CLEAN, exit 0. Every selftest mismatch declares more than the payload.
M25 expect checks only the first matching wave: `--round 39 --round 40 --expect build:critic=10`. The original reports `payload=8` for round 40 and exits 1; the mutant exits 0.
M36 STRAY_REPORT alone exits 0, and M39 verdict ignores STRAY_REPORT. With `--round 35 … --round 41`, the original gives `WAVE_CENSUS: DRIFT (rounds=7 waves=12 findings=6)` and exit 1. M39 gives `CLEAN (… findings=6)` with exit 0. Every STRAY in the selftest sits next to COUNT and REGISTRY findings.
M33 --round integer check dropped: `--round abc` exits 2 (`round-NaN is missing`) instead of 64. M34 unknown argument ignored: `--round 41 --bogus` exits 0 instead of 64. WC11 tests only "no --round" and a malformed --expect.
MISSED, shown by fixtures under seats/CritCensusSelftest/fx (shape mirrors the selftest's mkRound):
M12 a task with no Report trailer counts as present: r59 goes from `reports=0/1` to `1/1`.
M15 COUNT_MISMATCH compares counts.total: r50 (spawn=2, resume=1, total=3, 2 tasks) goes from CLEAN to `FINDING COUNT_MISMATCH`. The selftest always has resume=0 and total=spawn.
M16 COUNT_MISMATCH only when spawn > tasks: r51 (spawn=1, 2 tasks) goes from exit 1 to CLEAN, exit 0.
M17 registry length compare dropped: r52 (members [X], tasks [X,Y]) goes from `REGISTRY_MISMATCH not-in-registry=[Y]` to CLEAN. WC06 uses only equal-size sets.
M37 REGISTRY_MISMATCH alone exits 0 (r52), and M38 COUNT_MISMATCH alone exits 0 (r51). Both go from exit 1 to 0. WC06 does not assert the exit code.
M19 stray names taken from the whole round: r57 falsify/X.md, where X is a build task, goes from `STRAY_REPORT` to CLEAN.
M22 stray scan reads only the first report dir: r58 (one wave writing to a/ and b/, with stray b/Q.md) goes from exit 1 to 0.
M20 missing report dir fail-closes: r63 goes from exit 0 to 2. Every selftest wave has its report dir created.
M30 round dir with no dispatch file fails open: r62 goes from exit 2 to `waves=0`, exit 0. WC09 covers only a missing dir.
M31 no-task-list guard removed: r56 (a v1 envelope without taskCall) goes from fail-closed exit 2 to an uncaught TypeError, exit 1.
M35 dispatch filename regex unanchored: r64 with `a-dispatch.json.orig` goes from exit 0 to 2.
Strongest counterexample: M29 (attack counts distinct roles) and M28 (roles never increment) pass 12/12. They change the instrument's headline numbers (`attack=`, `roles:`) on every real round. Only M28 is caught outside the selftest, by the C2 counter's jq recount (seats and roles); `attack` and `reports` have no independent recount.
Impacted axes: operability. The selftest pins render shape and each finding's presence. It does not pin role or attack arithmetic beyond one seat per role, the Report: anchor, the exit code per finding kind, multi-round behavior, two-sided --expect, or several fail-closed edges.
Smallest safe correction: no code change in the instrument. Add selftest cases only:
(a) A wave with uneven repeated roles (for example 3 critic, 2 reviewer, 1 scout) and exactly 1 absent seat, asserting `roles:` order, `attack=` and the `absent:` line. Kills M08 M09 M28 M29 M40.
(b) A task whose text names an existing earlier .ufo/waves .md before its trailer, plus a trailerless task, both asserted absent. Kills M12 M14.
(c) Solo-finding rounds asserting exit 1 and DRIFT: stray-only, registry-subset-only, and spawn<tasks-only; also a resume=1 envelope that stays CLEAN. Kills M15 M16 M17 M36 M37 M38 M39.
(d) A round with two waves, a cross-wave named report, a second report dir, a .txt file and a wave with no report dir. Kills M19 M20 M21 M22.
(e) A two-round run asserting both ROUND totals plus an over-count and a second-round --expect. Kills M23 M25 M27.
(f) An empty round dir (exit 2), a v1 envelope without taskCall (exit 2), a `-dispatch.json.orig` file (ignored), `--round abc` and an unknown argument (exit 64). Kills M30 M31 M33 M34 M35.
Not done: I made no patch, because the critic role does not edit. The kill claims for (a) through (f) come from the witnesses above and are [INFERENCE] until those cases are written and run. Tools installed: none. Lane writes: this file only.
