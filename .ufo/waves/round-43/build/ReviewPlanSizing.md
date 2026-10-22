RESULT ReviewPlanSizing verdict=defects defects=3
Reviewed: .ufo/waves/round-43/plan.md @ 0f4108bf (byte-identical through e5ffcbe) vs round prompt section 6 item 9 and AXES.md. All three defects are low severity; the C1 sizing itself is sound.

## The four checked sizing properties — PASS

1. One concrete after-value, re-derivable by one command over committed bytes.
   plan.md:47-48: after-value is one line `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 …)` plus exit 0, re-derived by the frozen counter block (plan.md:33-38) at `--rev <measured>`. Counter bytes extracted from plan commit hash to the pinned `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a` (verified by running the plan.md:34 extraction against 0f4108bf).
2. No universal clause the command does not enumerate.
   "every control is re-run and must pass again" (plan.md:23) → the command prints exactly 2 CONTROL_AFTER lines (receipt shows cite-check + wave-census) and exits 2 otherwise. "Every frozen literal must still apply exactly once" (plan.md:62-63) → `frozen=41/41` aggregate + exit 2 `nomatch`. "case floors unchanged" (plan.md:63) → `floor=75` / `floor=31` printed. K43 (a)/(d) fields (group_clean, overflow, control=, confirm=same) print per MUTANT line.
3. Do-nothing control scored with the frozen counter and committed before building.
   Receipt `.ufo/waves/round-43/open/c1-control-base.txt` committed at e5ffcbe (19:12:49 -03); the only diff plan-commit→receipt-commit is that receipt (56 lines). Receipt run 22:11:46Z, 11 s after the plan commit (19:11:35 -03), on plan-commit bytes, sha line matches. Wave 1 build dir created 19:20 -03 — after the receipt. Expected value (plan.md:44-46) matches the committed receipt exactly: `SURVIVED (mutants=43 killed=36 frozen=34/41 …)` exit 1 with exactly the 7 named survivors (verified: 43 MUTANT lines, 36 killed, 7 survived, ids match plan.md:45-46 one for one).
4. Kill rules frozen.
   plan.md:50-53 names the four miss conditions; plan.md:26-27 forbids amendment ("a miss is an honest stop"); plan.md and scripts/gate-mutants.mjs are byte-identical across 0f4108bf→e5ffcbe (empty diff). K43 (a)-(c) trace to round-42 pre-data sentence (plan.md:24-25); (d) + control re-run to CritC1Claim objection 2. AXES.md: lowest non-retired axis operability 9 claimed (plan.md:10-11); capability row re-claim per AXES.md Capabilities (demonstration-based entry), not a pre-claim (plan.md:66-68).

## Defects (all LOW)

- D-L1 (cross-document drift, plan.md:37): the frozen counter block uses `timeout -s KILL 1500`, but the L1 round context restates "the frozen C1 counter (never edit it)" with `timeout -s KILL 900`. Plan is the SSOT ("frozen at the commit that adds this file", plan.md:1). Outcome-neutral (observed run 44.6 s ≪ 900), but a closure following the context runs different harness bytes than the plan freezes. Closure and seats must re-derive per plan.md:33-38 (1500); the L1 should note the context typo in the round report.
- D-L2 (enumeration justification misattributed, plan.md:49): "(the gate prints one MUTANT line per id, so '41/41' is enumerated by the command)" — MUTANT lines enumerate the 43 mutants, not the 41 frozen literals; `frozen=41/41` is enumerated by the final `GATE_MUTANTS:` aggregate line (the committed before-receipt shows `frozen=34/41` there) plus the exit-2 `nomatch` path (plan.md:52). The after-value stays one-command re-derivable; only the parenthetical cites the wrong output source.
- D-L3 (prompt §6.9 bullet 6 ordering, in spirit only, plan.md:54-58): cheat controls J1-J3 — the cheapest ways to skip the work — are scored in wave 1, after the freeze, while bullet 6 directs the cheapest skip-work control be scored with the frozen counter and its receipt committed before freezing. Mitigated: the do-nothing control (round-open bytes) was scored and committed before any wave, and the kill rule pre-freezes "any junk control reads CLEAN → C1 misses" (plan.md:51), so a counter defect surfaces as an honest stop, never a post-data amendment. Worst case is a burned round, not a corrupted claim.

## Residual risk

- J1-J3 receipts land mid-wave on scratch-clone commits; a CLEAN there kills C1 by the frozen rule — honest, but the counter defect is then discovered one round later than bullet 6 intended.
- The wall-time median duty (plan.md:63-65) is outside the kill rules and not enumerated by the counter command; it must never be presented as C1 evidence. Plan already marks it "measured, not deepened" — keep it that way in the report.
- `frozen=41/41` bookkeeping (41 frozen literals vs 43 mutants) is [INFERENCE] from arithmetic (34+7=41) and the committed before-receipt; I did not line-read the gate source's frozen-counter implementation.

## Verification gaps

- I ran no gate or selftest (sizing review; the before-control receipt is committed and sha-consistent; wave-1 seats run the after-run under host-safety bounds).
- I did not re-open the round-42 trace targets (`b237e3f0` plan:21, CritC1Claim objection 2); their presence in the plan is verified, their content is not.
