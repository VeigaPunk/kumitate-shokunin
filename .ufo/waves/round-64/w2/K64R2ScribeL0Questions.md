VERDICT: Drafted four L0 questions with A/B costs, each grounded in a measurement this seat re-ran at lane tip `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` — the freeze's P2 floor (8 ids) exceeds the frozen tool's own vocabulary (7 ids) and reads `held=3/5 … P2 MISS ids=6` at `dd1a3e6f`, the Q60 epoch makes the map arm judge zero rounds by default while `PBR_MAP_FROM=0` reproduces the five DRIFT rounds, both frozen counters carry named forge holes beside an existing cap-run runner, and the R61 retirement is prose-only (SCORECARD "retired" vs two lessons "open" vs both probes still on disk) — and dropped the kimi-retirement candidate as an exact duplicate of the still-open round-63 question.

## Evidence

All commands run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; the freeze archive extracted to `/tmp/kumitate-r64/K64R2ScribeL0Questions/freeze` so the probe bytes are the frozen ones. No lane file was modified (`git status` shows only pre-existing untracked build/wave paths).

1. Duplicate guard over the queue — `grep -n '^kumitate' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` → `10` open lines (rounds 10, 11, 17, 40, 42, 43, 58×2, 63×2); `awk 'NR>160 && /L0 ANSWER/'` → empty, so none is answered.
2. Frozen floor vs vocabulary — `git show dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef:.ufo/waves/round-64/probe/receipt64-probe.mjs | grep -n distinct` → `>= 8 distinct finding ids` (doc `:16`), code `if (seen.size < 8)` (`:61`); `sed -n '12,18p' <freeze>/scripts/report-receipt-diff.mjs` → exactly 7 ids (`PLACEHOLDER`, `TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`, `SHONEN_COUNT`); `git ls-tree --name-only dd1a3e6f… .ufo/waves/round-64/controls/receipt/ | wc -l` → `16`.
3. Frozen probe over the freeze revision — `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` exit 1 →
   `RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS report-not-given`
4. Same frozen probe at the tip — exit 1 → `RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64 | P5 MISS report-not-given`; `ls .ufo/waves/round-64/controls/receipt/ | wc -l` → `37`. The floor became satisfiable only after the post-freeze ratchet.
5. Landed J64 counter at the tip — `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f8…` exit 0 → `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8… rule=J64`; `node scripts/counter-pins.mjs` → `COUNTER_PINS: CLEAN pins=25`.
6. Q60 default sweep at the tip — `bash scripts/plan-before-ready.sh --all` exit 1 →
   `PLAN_BEFORE_READY_SUMMARY: pass=13 fail=7 na=10 rounds=all(30) rev=2ed8a5f8… exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60 map_red=`
   with `round=58 … NA reason=NO_MARKER … map=SKIP reason=MAP_PRE_EPOCH_ROUND`, `round=60 … NA reason=NO_MARKER`, `round=61|63|64 … PASS … map=SKIP reason=MAP_PRE_EPOCH_ROUND`.
7. Q60 epoch-0 sweep at the tip — `PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --all` exit 1 →
   `PLAN_BEFORE_READY_SUMMARY: pass=10 fail=12 na=8 rounds=all(30) rev=2ed8a5f8… exit=1 failed=35,36,37,38,39,40,58,60,61,62,63,64 na_rounds=49,52,53,54,55,56,57,59 map_red=58,60,61,63,64`
8. Epoch default — `grep -n PBR_MAP_FROM scripts/plan-before-ready.sh` → `147:MAP_FROM="${PBR_MAP_FROM:-65}"`; the map arm returns FAIL before the marker arms (`:256-262`), which is why 58/60 read FAIL under the override and NA by default.
9. R61 retirement — `grep -n 'Round 63 correction' SCORECARD.md` → `2957:## Round 63 correction — retires the inherited dispatch61/doctrine61 predicates (R61-V2; append-only, 2026-10-25)` ("retired, not repaired: no later claim cites them"); `ls .ufo/waves/round-61/probe/{dispatch61,doctrine61}-probe.mjs` → both present; `grep -rn R61-V2 corpus/lessons/` → `round-62-verifier-spotcheck.md:59` "R61-V2 remains open (fourth consecutive round noted) … Land the repaired counters or retire the predicates", `round-64.md:117` "R61-V2, unaddressed again".
10. J64 holes and the existing runner — `sed -n '1p' .ufo/waves/round-64/w1/K64CriticC2Predicate.md` → "HELD-FORGED — the frozen C2 counter returns `JJ64_HELD held=8/8` for four independent forgeries …"; `grep -n 'porous archive\|operator privileges' .ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md` → `:27-29`; `grep -n "CONTRACT = " scripts/cap-run.mjs` → `100:const CONTRACT = 'kumitate-cap-run-v2'`, wired at `scripts/round-gate.mjs:755-761`.
11. Kimi candidate — `node scripts/kimi-census.mjs` exit 1 → `TOTALS: members=49 checked=49 errors=4 info=4 chain=10` / `KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)`; `SCORECARD.md:302` → `K_members=49`; `sed -n '168p' .ufo/l0-questions.md` → round 63's open question on the same four members and same K=49.
12. D4 status — `plan.md:119` says "D4 (kimi layer recorded degraded, K=49 not cited as clean)"; at the tip `grep -ic degraded LOG.md SCORECARD.md` → `LOG.md:0`, `SCORECARD.md:1` and that hit is `2871: … S194's full text is OCR-degraded`. The record exists only in `build/K64ScribeLogSkill/log-entry.md:46` (not installed).

## Findings

**K64R2ScribeL0Questions-1 — HIGH — the frozen C1 floor is unsatisfiable by construction, and the ratchet is what makes it pass.**
Attacks the freeze's binding power over the control set (C1 P2, plan.md C1 ratchet clause). At the freeze revision the frozen rule reads `P2 MISS ids=6` with a vocabulary of 7 ids against a floor of 8, so no control set could have satisfied it; at the tip the identical frozen bytes read `held=4/5` because controls grew 16→37 and the tool to v2 with two new ids. Repro: `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` → `RECEIPT64_UNMET held=3/5 … P2 MISS ids=6`. Filed as L0 line 1.

**K64R2ScribeL0Questions-2 — MEDIUM — the R61 retirement exists only as prose, and the prose disagrees with itself.**
Attacks `SCORECARD.md:2957`'s "retired, not repaired" claim. Both probes remain executable, and two lessons still call R61-V2 open on a fourth consecutive round; a verifier reading `corpus/lessons/round-64.md:117` cannot tell the retirement happened, and a seat can still run the probes against the committed forgery bundle. Repro: `grep -rn R61-V2 corpus/lessons/ | head` and `ls .ufo/waves/round-61/probe/`. Wave-2 peer `K64R2ConnCrossClaim-4` (`.ufo/waves/round-64/w2/K64R2ConnCrossClaim.md:47-50`) observed the same; the filed L0 line 4 carries the decision instead. Filed as L0 line 4.

**K64R2ScribeL0Questions-3 — MEDIUM — under the landed Q60 default the map arm judges zero rounds, and QUALITY's NA set is reproducible only with the override.**
Attacks `corpus/QUALITY.md:1044-1045` ("rounds 49, 52–57 and 59 read `NA` … so the map arm is judged on seven rounds only — 57 and 59 CLEAN, 58, 60, 61, 63, 64 DRIFT"). At the tip the default sweep reads `na_rounds=49,52,53,54,55,56,57,58,59,60` and `map_red=` (empty) — 58 and 60 are NA, not DRIFT, because the epoch skips the map arm before the marker test; only `PBR_MAP_FROM=0` yields the quoted set. Repro: run both sweeps in Evidence 6 and 7 and diff `na_rounds=`. Filed as L0 line 2 (the epoch choice), where the cost of each answer depends on this.

**K64R2ScribeL0Questions-4 — LOW — candidate 3 (kimi: retire the four members or keep DEGRADED) is an exact duplicate of an open question and was not filed.**
Attacks this seat's filing discipline, not the lane. `.ufo/l0-questions.md:168` already asks the same decision for the same four missing members and the same `K_members=49`, and it has no `L0 ANSWER`; round 64 answered the lane-side half in-lane (`plan.md:119` D4), and that record is still only a build draft (Evidence 12). Filing it would put two open questions on one decision. Repro: `sed -n '168p' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md`; `node scripts/kimi-census.mjs`.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2ScribeL0Questions/l0.txt` — the four `kumitate | round-64 | …` lines, ready to append to `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` (the integrator commits; the fleet file was not touched).
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64R2ScribeL0Questions/verification-note.md` — per-candidate verification with the commands and verbatim outputs, plus the duplicate-guard reasoning.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/w2/K64R2ScribeL0Questions.md` — this report.
- Scratch receipts (deleted before close): `/tmp/kumitate-r64/K64R2ScribeL0Questions/` held the freeze archive extraction, `pbr-all.txt`, `pbr-all-epoch0.txt` and the frozen-probe outputs.
- Tooling: nothing installed or upgraded; no pacman transaction, no network fetch.

## Limits

- P5 was not exercised: the round-64 report does not exist yet, so the tip run's `P5 MISS report-not-given` is the expected state, not a defect (Evidence 4).
- I did not test whether `cap-run` can actually enclose the J64 demo re-run or the P2/P3 harness; L0 line 3 prices that as "no new rule work" on the strength of the round-gate wiring only.
- I did not reproduce the sibling's extra claim of shell-injection and host-environment vulnerabilities in the frozen probes; line 3 rests on the holes the lane itself names (`CHANGES-AFTER-FREEZE.md:27-29`) and the four-forgery verdict.
- The kimi host root was read only through `kimi-census`; I did not attempt any repair, retirement or census-rule change, and the D4 degraded record is not installed at the tip, so L0 line 1–4 do not depend on it.
- No frozen artifact was edited; all reads of `dd1a3e6f` came from `git archive` into scratch.
