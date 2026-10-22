RESULT ScoutCensusOlderRounds rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=operable rounds=3 miscounts=0 strays=2 coverage_gap=1

Scope: rounds 35, 36 and 37 of `scripts/wave-census.mjs` at 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3, run in my own clone `/fast/scratch/hyaku/kumitate-r41/seats/ScoutCensusOlderRounds/lane` (clean tree, `git status --porcelain` empty). Recount tools: node v24.21.0, `jq` = jaq 3.1.1 (jq-compatible), git 2.56.0. No tool was installed or updated. No mutation outcomes are claimed. I wrote no lane file except this one.

1. The assigned command, run as given:
   `$ node scripts/wave-census.mjs --round 35 --round 36 --round 37` → exit 1
   `WAVE round=35 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=95 attack=36 reports=95/95 roles: scout=41 reviewer=33 scribe=9 executor=5 critic=3 connector=2 revenger=1 sentinel=1`
   `WAVE round=35 wave=falsify schema=ufo-swarm-wave-dispatch-v1 seats=75 attack=41 reports=75/75 roles: reviewer=33 scout=33 critic=4 mutation-tester=4 sentinel=1`
   `ROUND round=35 waves=2 seats=170 attack=77 reports=170/170`
   `WAVE round=36 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=96 attack=28 reports=96/96 roles: scout=23 executor=17 reviewer=16 scribe=10 connector=8 critic=8 mutation-tester=4 revenger=4 sentinel=3 simplifier=3`
   `ROUND round=36 waves=1 seats=96 attack=28 reports=96/96`
   `WAVE round=37 wave=falsify schema=ufo-swarm-wave-dispatch-v1 seats=68 attack=56 reports=68/68 roles: reviewer=40 critic=8 mutation-tester=8 scout=8 sentinel=4`
   `ROUND round=37 waves=1 seats=68 attack=56 reports=68/68`
   `FINDING STRAY_REPORT round=35 wave=build .ufo/waves/round-35/build/ExecS8Fidelity.md`
   `FINDING STRAY_REPORT round=35 wave=build .ufo/waves/round-35/build/ExecS8Fix.md`
   `WAVE_CENSUS: DRIFT (rounds=3 waves=4 findings=2)`
   No crash. Exit 1 is the documented findings exit; a second identical run diffed IDENTICAL.

2. Hand recount, independent of the instrument: a separate script (`/tmp/handcheck2.mjs`) parsed each payload with a different rule (last line starting `Report:`, its first `.ufo/waves/*.md` path), counted `.agent`, and diffed the printed numbers with `spawnSync` (so the expected exit 1 would not abort it):
   `$ node /tmp/handcheck2.mjs`
   `instrument_exit=1`
   `35/build: hand_seats=95 hand_attack=36 hand_present=95 hand_absent=0 -> MATCH`
   `36/build: hand_seats=96 hand_attack=28 hand_present=96 hand_absent=0 -> MATCH`
   `37/falsify: hand_seats=68 hand_attack=56 hand_present=68 hand_absent=0 -> MATCH`
   `35/falsify: hand_seats=75 hand_attack=41 hand_present=75 hand_absent=0 -> MATCH`
   `HANDCHECK mismatched_waves=0/4`

3. Payload-side invariants, checked separately with jq (jaq 3.1.1), command as run:
   `jq -r '"tasks=\(.taskCall.tasks|length) counts.total=\(.counts.total) counts.spawn=\(.counts.spawn) uniqueNames=\(.taskCall.tasks|map(.name)|unique|length) registryMembers=\(.registry.members|keys|length)"'` gives 95/95/95/95/95 for 35 build, 75/75/75/75/75 for 35 falsify, 96/96/96/96/96 for 36 build, 68/68/68/68/68 for 37 falsify. No duplicate task name, no missing `name` or `agent` (0 in all four), so no double count or undefined role.

4. Registry key equality checked by diff, not by count: for all four payloads the sorted `registry.members` keys diffed against the sorted task names (two process substitutions, no count shortcut) → IDENTICAL. `counts.spawn`, `counts.total` and `counts.resume` agree with the task count and 0 in all four; `resumeSends` is an empty array in all four, so no resumed seat escapes the count here.

5. Absent names: 0 in all four payloads. In a first pass every task in all four matched the instrument's trailer rule (`notrailer=0`, `absent=0`), and in the independent pass every task resolved to an existing `.ufo/waves/*.md` file (`hand_absent=0`). A stricter count of tasks with a malformed trailer (`bad_trailer`) is 0 for all four payloads (35 build 95, 35 falsify 75, 36 build 96, 37 falsify 68 tasks). Directory file counts agree except round-35 build: `round-35/build md=97`, `round-35/falsify md=75`, `round-36/build md=96`, `round-37/falsify md=68`.

6. The two STRAY_REPORT findings are real undeclared outputs, not a layout artefact. Round-35 build dispatches one seat `ExecS8Writer | executor`, and its trailer names `.ufo/waves/round-35/build/ExecS8Writer.md`, which exists (4674 bytes). The two flagged files exist beside it (3925 and 6710 bytes), their headers read `S8FIDELITY …` and `S8FIX …`, and `git log` puts all three in one commit `4c9e407`. Falsify reports cite the flagged file as evidence by line, e.g. `.ufo/waves/round-35/falsify/CriticTrends.md:75` `.ufo/waves/round-35/build/ExecS8Fidelity.md:1`. So the seat delivered three files and declared one; the instrument classifies that correctly under its own definition (`scripts/wave-census.mjs:31,124`), and the DRIFT line is definitional, not evidence the wave failed.

7. Older-layout artefact `round-36/build-assignments.json`: it is a 96-entry object mapping item name to agent id string, e.g. `ScoutProxyPin = KumitateR36.ScoutProxyPin`. Its key set is identical to the payload's task names (`comm` diff empty both ways, 96 = 96), and the payload registry already carries the role per member (`registry.members.ScoutProxyPin.role` = `scout`). The file-name filter (`/-dispatch\.json$/`, `scripts/wave-census.mjs` censusRound) ignores it, and nothing needed for seats or roles is lost. Not a miscount.

8. Older-layout artefact `round-36/falsify-spec.json`: it holds 81 items, computed roles `reviewer=48 mutation-tester=18 critic=9 sentinel=3 connector=3`, exactly the breakdown in `.ufo/waves/round-36/accounting.md:4` ("Falsify wave: 81 seats"). There is no `falsify-dispatch.json` and no `round-36/falsify/` directory, and `accounting.md:5` records "Round total planned: 177 seats". The census therefore reports round 36 as 1 wave and 96 seats against the round's own recorded plan of 177. This is a coverage limit of reading payloads only (stated in the instrument header), not a miscount of anything committed; a reader who takes the census as the round's whole record would be wrong.

9. Older-layout artefact `round-37` (falsify only): one payload, 68 seats, and three independent records agree — `falsify-spec.json.items` = 68; `wave-plan-validation.json` (schema `ufo-swarm-wave-v1`, not the dispatch schema) has `tasks` = 68 and `counts.spawn` = 68; the payload has 68. Asking for a wave the round does not have stays honest: `$ node scripts/wave-census.mjs --round 37 --expect build:reviewer=1` → `FINDING EXPECT_UNKNOWN round=- wave=build build:reviewer=1`, exit 1.

10. Coverage floor: `.ufo/waves/` holds only rounds 35 to 41; there is no `round-33/` or `round-34/` directory, so `$ node scripts/wave-census.mjs --round 34` → `wave-census: fail-closed — round dir …/round-34 is missing`, exit 2. The instrument's usable history begins at round 35 and fails closed, not silently, before that.

11. Hermetic suite at this revision: `$ node scripts/wave-census.mjs --selftest` → `WAVE_CENSUS_SELFTEST: 12/12 pass`, `VERDICT: PASS`, exit 0. Case WC07 is the STRAY_REPORT path that fires in item 6.

12. Disagreement recorded, not resolved: the attack set is `reviewer, critic, mutation-tester, labrat` (`scripts/wave-census.mjs:50`), the same list as `.ufo/waves/round-41/plan.md:34`. Round 35's `revenger` and `sentinel` seats are not counted as attack under that definition. I found no lane document that defines attack seats differently for rounds 35 to 37, so I did not treat it as a miscount; the round-40 prose disagreement already recorded in `corpus/lessons/round-41.md:39-40` is outside this check.

Unknowns and limits: I did not run rounds 38 to 40 (sibling seat covers that range) and did not test whether any round-35 to 37 wave actually spawned; the census counts payload seats only, and 100 percent report presence only shows the named files exist. I did not exercise the documented shared-report-dir case (round 39) in these three rounds. I did not mutate the instrument, so no killed or survived result is claimed.
