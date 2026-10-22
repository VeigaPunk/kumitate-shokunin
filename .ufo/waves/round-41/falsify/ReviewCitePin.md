RESULT ReviewCitePin rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=pass proxy=MATCH axes_changed=0

Scope: the three checks asked for, plus a harm review of every axis, at revision 4e58bb0e. Verdict pass means all three checks hold and no Axes integer changed. Findings 1 and 2 concern what the newly counted items measure, not the integers. Nothing in the lane was edited. No patch: no code changed.

## Answers

- pin.cite-check equals sha256sum of scripts/cite-check.mjs: yes. Both are b6c578482e2b9f53a2bac4e3908b2844212ae31681a2330352279cf8de882788 (E2). The file is the same blob at 68db3419 and 4e58bb0e (E3), so the cite-check probe's after-run at 68db3419 measured these bytes.
- proxy-check reads MATCH with A=9 C=17 C2=92/92: yes, exit 0 (E4). Here A is the count of runnable script files in the tree, C is the count of checklist lines in SKILL.md, and C2 is the count of note rows in corpus/README.md.
- Axes integers unchanged from a58b7f72: yes. The Axes section is identical at both revisions (E7). Integers: operability 8, coverage 10, coverage:script-layer 10, coverage:runtime-layer 10, coverage:kimi-layer 10. axes_changed=0.

## Harm to axes

- No integer harm. Coverage was repaired: at a58b7f72 the proxy derived coverage 9 (AXES_DRIFT), because one note lacked a README row (E6). At 4e58bb0e it derives 10 (E4).
- Operability inputs grew: A went from 8 to 9 (wave-census.mjs added) and C from 15 to 17 (two checklist lines). The operability fraction (A+C)/(A+C+3) went from 23/26 = 0.885 to 26/29 = 0.897. The integer stayed 8.
- C1, S, R and K values are the same at both revisions. The stanza diff changes only A, C, C2, C2_total and pin.cite-check (E8).

## Findings by severity

1. MEDIUM. The new checklist item "Wave census of a landed round" (SKILL.md:690) cannot fail when a wave never spawned. The census reads the round-39 build wave as reports=0/46 and the round-41 build wave as reports=0/34, and still prints WAVE_CENSUS: CLEAN with exit 0 (E13). Round 40 reads reports=57/67 and is also CLEAN (E12). The registry row (SKILL.md:607) says "a payload proves validation, not dispatch", and its finding list has no absence finding. So the label claims a landed round, but the check only tests that the payload is internally consistent. The item counts toward C. For the L1 to decide: make absent reports a finding for a landed round, or rename the item.
2. MEDIUM (documentation; no gate reads it). The operability row in the Axes section (SCORECARD.md:313) says "A=7 ... C=13 ... 9 needs A+C ≥ 27 (7 more honest items)" (E18). Live values are A=9 and C=17, so A+C=26. One more counted item reaches 27, which the row's own rule maps to 9. The row names seven scripts, but A counts nine (E20), including anchor-truth.mjs and wave-census.mjs. AXES_DRIFT compares only the integer, so no gate reads this prose. The staleness predates round 41 (at open the live values were A=8, C=15); round 41 widened the gap.
3. LOW. wave-census.mjs has no pin.wave-census key. The default gate is MATCH, exit 0. With --strict the proxy reads DRIFT, exit 1, because of three PIN_UNPINNED warnings (E5). SCORECARD.md:271 and :334 document this posture for non-v1 scripts. Strict was already DRIFT, exit 1, at a58b7f72 (E6), so strict status did not regress. The round-41 lesson does not say wave-census is unpinned. An edit to wave-census.mjs is invisible to the proxy.
4. LOW. SKILL.md:662 describes items 16 and 17 as checking "the last landed round", but line 690 hard-codes --round 40. When round 41 lands, the item still checks round 40 unless someone edits it.
5. RESIDUAL. The proxy counts checklist lines and script files; it cannot tell whether an item was run. I ran both new items at 4e58bb0e and they pass as written (E12, E14). A future counted item that is never run would move the integer the same way.

## Residual risk and verification gaps

- Not run here: cite-check's own selftest and the 16-mutant probe. Those belong to the C1 items. I checked only that the bytes match the measured commit.
- Every proxy run here used source revision 31c465f15669. I did not test a different pin.
- Finding 1 is read from the registry text and the census output, not from a written spec for the verdict.

## Tools

None installed or updated. Used git, sha256sum, awk, grep, sort, comm, uniq, find, and node v24.21.0 (the version the proxy selftest printed). Scratch: /fast/scratch/hyaku/kumitate-r41/seats/ReviewCitePin/ (lane clone at 4e58bb0e, base clone at a58b7f72, derived text files). No write to the lane, its git index or its jj state. The only lane-side write is this file.

## Evidence (commands and outputs)

- E1 `git clone -q --no-hardlinks <lane> .../ReviewCitePin/lane`, then `git checkout -q --detach 4e58bb0e…`; `git rev-parse HEAD` gives 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3; `git status --porcelain | wc -l` gives 0.
- E2 `sha256sum scripts/cite-check.mjs` gives b6c578482e2b9f53a2bac4e3908b2844212ae31681a2330352279cf8de882788; `grep -n 'pin\.cite-check=' SCORECARD.md` gives 301:pin.cite-check=b6c578482e2b9f53a2bac4e3908b2844212ae31681a2330352279cf8de882788; shell string comparison prints PIN_EQUAL.
- E3 `git log -1 --format=%H -- scripts/cite-check.mjs` gives 68db3419676bb91a4912b0357b72abcc436996da; `git rev-parse 68db3419:scripts/cite-check.mjs 4e58bb0e:scripts/cite-check.mjs` gives 9503be8b98382bf296ad4744491955c1fa4f03d6 twice.
- E4 `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` prints three PROXY warn PIN_UNPINNED lines (anchor-truth, sources-check, wave-census), then `PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=92/92 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`; DEFAULT_EXIT=0.
- E5 Same command with --strict prints `PROXY: DRIFT (PIN_UNPINNED term=scripts/anchor-truth.mjs; PIN_UNPINNED term=scripts/sources-check.mjs; PIN_UNPINNED term=scripts/wave-census.mjs; src-rev=31c465f15669)`; STRICT_EXIT=1.
- E6 Clone at a58b7f72 ("base"), default run prints `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=90 computed=91 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED …anchor-truth…; PIN_UNPINNED …sources-check…)`, exit 1; the --strict run also exits 1.
- E7 `diff <(git show a58b7f72:SCORECARD.md | awk '/^## Axes/{f=1;print;next} /^## /{f=0} f') <(git show 4e58bb0e:SCORECARD.md | awk …)` prints nothing; the Axes section is identical.
- E8 Claim block (25 lines at each revision) differs only at: A=8 to A=9; C=15 to C=17; C2=90 to C2=92; C2_total=90 to C2_total=92; pin.cite-check changed to b6c57848…
- E9 `git diff --name-status a58b7f72 4e58bb0e` lists 20 paths: M SCORECARD.md, SKILL.md, corpus/README.md, corpus/SOURCES.md, corpus/knowledge/kimi-skills-plugins.md, scripts/cite-check.mjs; A scripts/wave-census.mjs, corpus/lessons/round-41.md, and round-41 plan, receipt, probe and final files. `git diff --numstat a58b7f72 4e58bb0e -- scripts/cite-check.mjs` gives 93 0.
- E10 `git diff a58b7f72 4e58bb0e -- SKILL.md` adds `- [ ] Wave census of a landed round — … --round 40 → exit 0 + WAVE_CENSUS: CLEAN` and `- [ ] Wave-census hermetic suite — … --selftest → exit 0 + VERDICT: PASS`; `grep -c '^\s*- \[' SKILL.md` gives 17.
- E11 Note files: `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` gives 92; README rows matching `^| \`(knowledge|lessons)/…\`` give 92; `comm -3` of the two sorted path lists is empty; `uniq -d` of the row list is empty. So C2 92/92 is one-to-one.
- E12 `node scripts/wave-census.mjs --round 40` prints `ROUND round=40 waves=2 seats=67 attack=45 reports=57/67` and `WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)`; exit 0.
- E13 `node scripts/wave-census.mjs --round 39 --round 41` prints round-39 build `seats=46 … reports=0/46`, round-39 falsify `reports=8/37`, round-41 build `seats=34 … reports=0/34`, then `WAVE_CENSUS: CLEAN (rounds=2 waves=4 findings=0)`; exit 0.
- E14 `node scripts/wave-census.mjs --selftest` prints `WAVE_CENSUS_SELFTEST: 12/12 pass` and `VERDICT: PASS`; exit 0.
- E15 `node scripts/proxy-check.mjs --selftest` prints `PROXY_SELFTEST: 116/116 pass` and `VERDICT: PASS`; exit 0 (node v24.21.0, 5.74 s).
- E16 SKILL.md:607 registry row: wave-census is a gate with verdict CLEAN|DRIFT; findings EXPECT_MISMATCH, EXPECT_UNKNOWN, COUNT_MISMATCH, REGISTRY_MISMATCH, STRAY_REPORT; "a payload proves validation, not dispatch".
- E17 SKILL.md:662 says items 16 and 17 cover "the last landed round's committed swarm evidence"; line 690 is the item quoted in finding 1 and hard-codes --round 40.
- E18 SCORECARD.md:313 operability row: "A=7 (…) and C=13 (…) ⇒ 20/23 ≈ 0.870 ⇒ 8 … 9 needs A+C ≥ 27 (7 more honest items)".
- E19 SCORECARD.md:271: "Other scripts/*.mjs files are not v1 keys and produce PIN_UNPINNED"; SCORECARD.md:334–335 keep the advisory and say --strict promotes it to drift.
- E20 `find . -path ./.git -prune -o -type f ( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' ) -print | sort` lists scripts/anchor-truth.mjs, cite-check.mjs, claims-check.mjs, kimi-census.mjs, proxy-check.mjs, round-gate.mjs, sources-check.mjs, surface-probe.mjs, wave-census.mjs; COUNT=9.
