WAVE4 items=68 dup=3 registry=yes verdict=refuted

# Wave4: round-37 wave/seat record (operability)

Scope: `.ufo/waves/round-37/` spec, dispatch, registry, `final/`, `repairs.md`; LOG.md round-37 entry; pinned planner `/fast/scratch/kumitate-r36/src/scripts/ufo-swarm-wave.mjs` run read-only (`plan` only, never `run`/`record`). Scratch: `/fast/scratch/kumitate-r37/Wave4/`. No installs, no spawns, no lane writes except this file.

## Verdict basis
- Failing condition "duplicated prompt": MET (F1, 3 redundant seats).
- Failing condition "accounting claim the artifacts do not support": MET (F2, F3).
- Failing condition "missing registry": NOT met. Registry present and loader-valid (H5).

## Holds (checked)
- H1 Items: 68 spec entries, 68 unique names, each `# Item <name>` header equals `name`. Roles: reviewer 40, mutation-tester 8, critic 8, scout 8, sentinel 4; all five are in the pinned `SWARM_ROLES` (ufo-swarm-wave.mjs:248-259). Item keys {axes,name,prompt,role} and top keys are within `ITEM_KEYS`/`SPEC_KEYS` (:261-262).
- H2 Dispatch: 68 tasks; names equal spec names; `agent == role` 68/68; `counts` spawn 68 / resume 0 / total 68; `resumeSends: []`; `compaction.applied: false`.
- H3 Report trailer: every task ends `Report: write your scoped findings to .ufo/waves/round-37/falsify/<Name>.md` (lane-relative), 68/68 correct, no path collisions. "Lane bounds: leaf member", "Judged on: operability" and "Milestone:" present 68/68. The planner appends these, not the spec.
- H4 Reproduction: the pinned planner, given the dispatch's stated policy (scratch config, F3), emits 68 tasks identical to `falsify-dispatch.json` taskCall (68/68 task+agent), trailer 68/68, exit 0. The first 32 items under the pinned config: identical 32/32.
- H5 Registry: `falsify/swarm-registry.json` exists; 68 members; keys equal spec names; kind spawn 68; role matches 68/68; `agentId == KumitateR36.<name>` 68/68. Pinned `loadRegistryDocument` returns `{"ok":true,"rows":68,"wave":"kumitate-r37-falsify","reportDir":".ufo/waves/round-37/falsify"}`. The dispatch-embedded copy also loads (68 rows).
- H6 Base/pin: `91da27c6ac17712aa53ea0adb27d89b133d60081` resolves to a commit; `0614092` resolves; pin `/fast/scratch/kumitate-r36/src` HEAD = `31c465f15669f744848bd9f5d56191c5085670f7`, dir mode `dr-xr-xr-x`; `fidelity.txt` `src-rev=31c465f15669` matches. `/home/vgpnk/Projects/ufo-fsd-alpha` appears only as the prohibition in the context; no prompt uses it.
- H7 Verify referents: D1-D8 are each defined in LOG.md:1715-1725; Verify k attacks Dk 8/8; D4 `Q16` exists at `corpus/QUALITY.md:126`.

## Findings
- F1 (dup=3, FAIL) Wave1-Wave4 are one task. With each seat's own label normalized (`Wave<k>`, `WAVE<k>`, `record <k>`), all four bodies are identical. The only differences are label digits, and no artifact (spec, dispatch, registry, LOG, SCORECARD, lessons, reports, repairs) defines "record 1..4". The planner's `duplicate_expansion` guard is byte-level, so it accepts all four (exit 0). Result: 65 distinct task bodies of 68; 3 redundant seats. This Wave4 seat is one of the redundant copies.
- F2 (accounting, FAIL) LOG.md:1726-1729 claims at close `CHECKLIST: 14/14 pass` and `PROXY: MATCH (C=14 C2=84/84 ...)`. The retained `final/` artifacts say otherwise: `checklists.txt:16-17` `CHECKLIST: 13/14 pass` / `VERDICT: FAIL` (SKILL.md:634 Proxy recompute, exit=1); `proxy.txt:4` `PROXY: DRIFT (C2_TOTAL_DRIFT declared=83 computed=84; AXES_DRIFT coverage 10 vs 9; PIN_UNPINNED ...)`. LOG.md:1724-1725 attributes `final/proxy.txt` to intermediate commit `5ceb8cd`, so the close-gate PROXY output is not retained. CLAIMS (`claims.txt:26` MATCH adv=4), SOURCES (`sources.txt:2` CLEAN rows=32) and FIDELITY (`fidelity.txt:22` CLEAN, 1551 anchors, nonok 186) do match.
- F3 (accounting, FAIL) (a) LOG.md:1721 says "D5 falsify wave validated at 68 seats". No round-37 validation record exists; the only `wave-plan-validation.json` on disk is `.ufo/rounds/round-33/`. The pinned planner refuses this spec: exit 1, `wave_too_wide`, "a wave carries at most 32 lanes (got 68)", because the pinned `config/ufo.json` sets `waveMinLanes 16, waveMaxLanes 32`. (b) The fleet config `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json` has the same wave band (16/32). I read only its swarm keys, read-only, and did not pass it as a pin. (c) The dispatch `policy` says `source: "config"`, `waveMinLanes 64`, `waveMaxLanes 100`. Neither readable config contains 64 or 100 for the wave band. The other policy values do match (maxLanes 100, minLanes 16, ramp 5/700, globalRunnerCeiling 1056; hardCeiling 100 = MAX_SWARM_LANES at ufo-mission-result.mjs:2462). The config path/digest is not recorded, so the band that admitted 68 lanes cannot be reproduced from any artifact here. SKILL.md:18 ("spawn waves 16-100") also disagrees with the 16-32 configs.
- F4 (residual, not failing) Registry `item` is null for 68/68, in both the file and the dispatch copy. The planner persists `item` only when a spec item supplies it (ufo-swarm-wave.mjs:939-949), and the falsify spec supplies only name/role/axes/prompt. Round-35 (75 and 95 members) and round-36 (96) registries are also 0 non-null: a pre-existing convention, so seats cannot be bound to atoms by the registry.
- F5 (info) The dispatch-embedded registry has `agentId: null` for 68/68; the file has agentIds set. SKILL.md:44-45 says `record --registry --assignments` fills agentIds after the task call, so the dispatch copy is pre-record. Correct by design, but two copies of "the registry" disagree.
- F6 (minor) 12 of the 32 Audit-family prompts say "take the 1th/2th/3th eighth" (ordinal typo, 4 each).

## Commands and output
1. Spec/dispatch cross-check (python over the JSON files): `spec entries 68 unique names 68`; `roles {reviewer 40, mutation-tester 8, critic 8, scout 8, sentinel 4}`; `dispatch tasks 68 ... agent!=role []`; `report trailer mismatches []`; `distinct task bodies (own-label normalized) 65`; `duplicate groups [[Wave1, Wave2, Wave3, Wave4]]`; `redundant copies 3`.
2. Pinned plan, spec as dispatched: `cd kumitate-shokunin && node /fast/scratch/kumitate-r36/src/scripts/ufo-swarm-wave.mjs plan --spec .ufo/waves/round-37/falsify-spec.json --emit-tasks` -> exit 1, `{"schema":"ufo-swarm-wave-error-v1","code":"wave_too_wide","message":"a wave carries at most 32 lanes (got 68); ..."}`.
3. Pinned plan, first 32 items: exit 0, 32 tasks, identical to dispatch 32/32.
4. Pinned plan, 68 items, scratch config carrying the dispatch's stated policy (`UFO_CONFIG_PATH=/fast/scratch/kumitate-r37/Wave4/ufo-dispatch-policy.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`): exit 0, 68 tasks, identical 68/68, trailer 68/68.
5. Registry: `node /fast/scratch/kumitate-r37/Wave4/validate-registry.mjs .ufo/waves/round-37/falsify/swarm-registry.json` -> `{"ok":true,"rows":68,"wave":"kumitate-r37-falsify","reportDir":".ufo/waves/round-37/falsify","itemNonNull":0}`, exit 0.
6. Bands: `jq -c '.sighting.dispatch.swarm | del(.note)'` on pinned `config/ufo.json` and fleet `config/ufo.json` -> `{"maxLanes":100,"minLanes":16,"rampBatchSize":5,"rampIntervalMs":700,"waveMaxLanes":32,"waveMinLanes":16}` (both). `.sighting.dispatch.globalRunnerCeiling` (fleet) -> `1056`. `jq -c .policy falsify-dispatch.json` -> `{"source":"config","maxLanes":100,"minLanes":16,"waveMinLanes":64,"waveMaxLanes":100,...,"hardCeiling":100,...,"globalRunnerCeiling":1056}`.
7. Base/pin: `git rev-parse --verify -q '91da27c6ac17712aa53ea0adb27d89b133d60081^{commit}'` -> the same hash; `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` -> `31c465f15669f744848bd9f5d56191c5085670f7`; `stat -c '%A %U %n'` -> `dr-xr-xr-x vgpnk /fast/scratch/kumitate-r36/src`.
8. Record-number referent: grep `seat record|wave/seat|record [1-4]` over LOG.md, SCORECARD.md, corpus/lessons, .ufo/reports, repairs.md -> `No matches found`.
9. Validation record: `find .ufo -name wave-plan-validation.json` -> `.ufo/rounds/round-33/wave-plan-validation.json` only.
10. Gate artifacts: `final/` holds checklists.txt, claims.txt, fidelity.txt, proxy.txt, sources.txt. checklists.txt was read twice (both `13/14`, FAIL); proxy.txt, claims.txt, sources.txt and fidelity.txt were each read once. `final/` gained claims.txt, proxy.txt and sources.txt during this review (the first listing held only checklists.txt and fidelity.txt), so every reading is a snapshot at the moment it was read.

## Residual risk and gaps
- The live hub config path is not recoverable from the lane. If the live tool used a config outside the lane, F3 means "recorded nowhere", not necessarily "wrong".
- Seat reports are still landing (17 `.md` files in `falsify/` at read time); not evaluated here.
- No round-37 report file is on disk (`.ufo/reports` holds round-33 only), so "the report's seat accounting" was checked against LOG.md and `final/` only.
- I did not rerun the gates; F2 rests on the retained files and the LOG text.
- Installs: none. Tools used: node v24.21.0 (already on PATH), jq, git, python.
