# K64R2ScribeL0Questions — what was verified per candidate

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin at tip `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`.
All commands below were run by this seat; outputs quoted verbatim. Nothing in the lane was modified.

## Existing kumitate L0 lines read first (duplicate guard)

`grep -n '^kumitate' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` → `10` lines: rounds 10, 11, 17, 40, 42, 43, 58 (x2), 63 (x2). None carries an `L0 ANSWER` (`awk 'NR>160 && /L0 ANSWER/'` → empty), so every one is still open.

## Candidate 1 — post-freeze control growth under an unreachable floor → FILED (line 1)

- `git show dd1a3e6f…:.ufo/waves/round-64/probe/receipt64-probe.mjs | grep -n 'distinct'` → `>= 8 distinct finding ids` (doc :16), code `if (seen.size < 8)` (:61).
- v1 tool's finding vocabulary: `sed -n '12,18p' <freeze>/scripts/report-receipt-diff.mjs` → exactly 7 ids (`PLACEHOLDER`, `TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`, `SHONEN_COUNT`). Floor 8 > vocabulary 7.
- `git ls-tree --name-only dd1a3e6f… .ufo/waves/round-64/controls/receipt/ | wc -l` → `16` (frozen control set).
- Frozen probe run over the freeze revision (probe extracted from the freeze archive so its bytes are the frozen ones):
  `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` →
  `RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS report-not-given` (exit 1).
- Same frozen probe at the integrated tip → `RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8… rule=R64 | P5 MISS report-not-given` — the only MISS left is P5 (the report does not exist yet). So the frozen floor is satisfiable at the tip only because the ratchet grew controls 16→37 and the tool to v2 (2 new ids): `ls .ufo/waves/round-64/controls/receipt/ | wc -l` → `37`.
- Non-duplication: `sed -n '167p' .ufo/l0-questions.md` asks whether enlarging the control set after a HELD claim voids C1; the filed question asks what to do when the frozen floor is unsatisfiable at the freeze revision.

## Candidate 2 — Q60 epoch vs retroactive FAIL → FILED (line 2)

- `grep -n 'PBR_MAP_FROM' scripts/plan-before-ready.sh` → `MAP_FROM="${PBR_MAP_FROM:-65}"` (:147).
- `bash scripts/plan-before-ready.sh --all` (default) at tip →
  `PLAN_BEFORE_READY_SUMMARY: pass=13 fail=7 na=10 rounds=all(30) rev=2ed8a5f8… exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60 map_red=`
  with `round=58 … NA reason=NO_MARKER … map=SKIP reason=MAP_PRE_EPOCH_ROUND`, `round=60 … NA reason=NO_MARKER`, `round=61|63|64 … PASS … map=SKIP reason=MAP_PRE_EPOCH_ROUND`.
- `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --all` at tip →
  `PLAN_BEFORE_READY_SUMMARY: pass=10 fail=12 na=8 rounds=all(30) rev=2ed8a5f8… exit=1 failed=35,36,37,38,39,40,58,60,61,62,63,64 na_rounds=49,52,53,54,55,56,57,59 map_red=58,60,61,63,64`.
- Cost figures in the filed line are those two summaries: retroactive FAIL flips 3 PASS rounds (61/63/64) and 2 NA rounds (58/60).
- Reading of the script: the map arm fires before the marker arms and returns FAIL (`:256-262`), which is why 58/60 read FAIL under the override but NA by default (no marker) — not a marker-detection inconsistency.

## Candidate 3 — kimi layer: retire the four members or keep DEGRADED → DROPPED as a duplicate

- `node scripts/kimi-census.mjs` → `TOTALS: members=49 checked=49 errors=4 info=4 chain=10` / `KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)` exit 1.
- `grep -n 'K_members' SCORECARD.md` → `302:K_members=49`; `SCORECARD.md:2969` already records "K reflects four host Kimi-root members gone … a host-state defect carried, not repaired".
- `sed -n '168p' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` → round 63 already asks exactly this decision for the same four members and the same K=49 ("Intentional host cleanup, or should the lane keep reading DRIFT until the members return?"), and it is unanswered. Round 64's plan answers the lane-side half in-lane: `plan.md:119` "D4 (kimi layer recorded degraded, K=49 not cited as clean)", drafted only in `build/K64ScribeLogSkill/log-entry.md:46` (not installed yet). Filing it again would put two open questions on one decision, so it is not filed; the residual is r63:168.

## Candidate 4 — replace J64/R64 or add a bwrap-bounded runner → FILED (line 3)

- `sed -n '1p' .ufo/waves/round-64/w1/K64CriticC2Predicate.md` → "HELD-FORGED — the frozen C2 counter returns `JJ64_HELD held=8/8` for four independent forgeries …".
- `grep -n 'porous archive\|operator privileges' .ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md` → `:27-29` (J64's four forgeries, porous archive boundary, operator privileges; "reported as limits").
- `grep -n "CONTRACT = " scripts/cap-run.mjs` → `100:const CONTRACT = 'kumitate-cap-run-v2'`; `grep -n 'cap-run' scripts/round-gate.mjs` → `:755-761` routes one gate child through `capSpawnSync`.
- `node scripts/counter-pins.mjs` → `COUNTER_PINS: CLEAN pins=25` (the frozen counters are pinned; replacement is an L1/operator act, not a seat act).

## Candidate 5 — R61 probes unretired in prose elsewhere → FILED (line 4), premise CONFIRMED with a correction

- `grep -n 'Round 63 correction' SCORECARD.md` → `2957:## Round 63 correction — retires the inherited dispatch61/doctrine61 predicates (R61-V2; append-only, 2026-10-25)` with the body "They are **retired, not repaired**: no later claim cites them."
- `ls .ufo/waves/round-61/probe/dispatch61-probe.mjs .ufo/waves/round-61/probe/doctrine61-probe.mjs` → both present.
- `grep -rn 'R61-V2' corpus/lessons/` → `round-62-verifier-spotcheck.md:59` "R61-V2 remains open (fourth consecutive round noted) … Land the repaired counters or retire the predicates"; `round-64.md:117` "R61-V2, unaddressed again".
- So the premise is stronger than "unretired in prose": prose is *contradictory* (SCORECARD says retired, the lessons say open), and the artifacts are still on disk. Wave-2 peer `K64R2ConnCrossClaim-4` (`.ufo/waves/round-64/w2/K64R2ConnCrossClaim.md:47-50`) filed the same observation independently; the filed L0 line carries the decision, not the observation.
