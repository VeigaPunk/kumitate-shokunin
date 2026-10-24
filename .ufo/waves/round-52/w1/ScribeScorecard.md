# ScribeScorecard — round-52 SCORECARD section draft

**Behavior.** Wrote the round-52 section as a drop-in draft at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/ScribeScorecard/scorecard-round-52.md`
(240 L, 36 `<<FILL: …>>` slots, 4 balanced fenced blocks). Shape follows the live
`## Round 51 — claims, freeze repairs, limits (2026-10-24)` section: C1 row (frozen
`ATTEST52_HELD` sentence in a verbatim fence, counting command, before 5/13 at `02c01258`,
after=slot at R1, evidence slots), C2 row (frozen `DOCTRINE52_HELD` sentence, before 0/5,
after=slot, S102/S103 sourcing slots, E1–E5 + census slots), freeze-repairs subsection
("none unless addendum", with the addendum wording spelled out), terms subsection
(declared-vs-computed slots with tree+rev naming), harm H1–H5 slots, carried-limits
subsection, round-53 planned paragraph, `receipt-attest` v2 capability-row note, and an
"Integration fill list" appendix enumerating all twelve fill groups.
This is a **draft, not the landed section**: no product file was edited.

**Commands run (all read-only; exact outcomes).**
- `git log --oneline -3` → `ac56743 round-52: wave validation + taskCall evidence …`,
  `66766f7 round-52: v2 wave spec — 64 seats … 37.5% attack`, `f539a71 round-52: freeze …`.
- `git status --porcelain` → `?? .ufo/waves/round-52/build/`, `?? …/w1-assignments.json`,
  `?? …/w1-registry.json` (wave artifacts and the registry are **untracked** at this tip).
- `sha256sum scripts/receipt-attest.mjs` → `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
  and `grep -n "CONTRACT" scripts/receipt-attest.mjs` → `const CONTRACT = 'kumitate-receipt-attest-v1';`
  — the v2 instrument does **not** exist at the draft tip.
- `ls .ufo/waves/round-52/` → `base build plan.md probe w1 …`; **no `receipts/`, no `close/`**.
- `cat base/attest52-base.txt` → `ATTEST52: ATTEST52_UNMET held=5/13 checks=13
  rev=02c01258… rule=A52 version=v1`; passing arms at base: B2c, B3c, B4c, B4d, B6.
- `cat base/doctrine52-base.txt` → `DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5
  rev=02c01258… rule=D52 | E1 MISS entry-absent`.
- `cat base/baseline-gates.txt` → `PROXY: DRIFT (A_DRIFT term=A declared=71 computed=73 delta=+2;
  C2_TOTAL_DRIFT declared=117 computed=118 delta=+1; AXES_DRIFT coverage declared=10 computed=9)`;
  `BINDGUARD50: GUARD_UNMET held=7/8`; `ATTEST51: ATTEST_UNMET held=8/9`; `DOCTRINE51: … held=5/5`;
  census exit 0 with four W04s (S034/S068/S084/S095).
- Role census from `w1-registry.json` (64 members): executor 19, reviewer 13, scribe 8, scout 7,
  critic 6, mutation-tester 5, simplifier 2, sentinel 2, connector 1, revenger 1.
- `grep -c "^| S[0-9]" corpus/SOURCES.md` → `101`; S102/S103 absent;
  `corpus/knowledge/fail-closed-clock-validation.md` absent.
- `cat .ufo/waves/round-51/close/FINAL-57333ead….txt` → A51 line, and line 5
  `PROXY: MATCH (A=81 C=23 … pins=6 match; src-rev=31c465f15669)`
  (D51 read `DOCTRINE_HELD held=5/5`).

**Gates.** This seat ran no frozen counter and claims no reading of its own; every quoted
counter value comes from the committed base receipts (`base/attest52-base.txt`,
`base/doctrine52-base.txt`, `base/baseline-gates.txt`, executed at freeze under Q43) or from
`.ufo/waves/round-51/close/`. After-values for A52/D52, H1–H5 and the terms stanza are
integration slots by construction (the instrument, the receipts and the close dirs do not
exist yet). No tool was installed or upgraded.

**Touched surfaces (2 writes, both inside this seat's permits).**
`build/ScribeScorecard/scorecard-round-52.md` (draft) and this report.

**Out of scope / integration duties named in the draft.**
1. Replace all 36 slots: R1 (and R2/R3) revs and verbatim close lines; the three receipt runs
   + sidecars and the doctored control; the counter-mutant transcript; K2/K4 readings;
   the R52-4 repair commit + re-run; S103's landed row; E2 clause count/file list; E3/E4/E5
   lines; census after; freeze-repair verdict; re-derived stanza (A, C2 117→118, S/R/K) and the
   close `--strict` MATCH line; operability integer; `pin.receipt-attest` = sha256(v2);
   the six selftests; G50/R50/A51/D51; the v2 sha256 and SKILL.md row/item-23 lines; the mined
   mistake; Q44's landed text.
2. Q44 does not exist yet (`QUALITY.md` is at `corpus/QUALITY.md`; no Q44 row found) — the plan
   routes it to integration.
3. The `kumitate-gate-pins-v1` block (SCORECARD line 312) must gain the re-derived
   `pin.receipt-attest`; probe B5 reads exactly that block.

**Findings (verbatim conflicts, for the canonical judge).**
1. **Attack-seat count: three readings.** Plan §Wave: "≥25% attack roles (25 of 64)"; spec
   commit `66766f7`: "37.5% attack" (= 24); registry census union incl. sentinel+simplifier = 29
   (45.3%). Derived sets: reviewer+critic+mutation-tester+revenger = 25; reviewer+critic+
   mutation-tester = 24. All clear the policy floor (≥16); the judge should name its set.
2. **Plan base paragraph is narrower than its own base receipt.** Plan quotes only
   `C2_TOTAL_DRIFT` and `AXES_DRIFT`; `base/baseline-gates.txt` also carries
   `A_DRIFT term=A declared=71 computed=73 delta=+2` (the two frozen round-52 probe `.mjs`
   files in the tree at freeze). Draft records all three and names Q26.
3. **Before-value is 5/13, not 0/13.** Five v1-instrument arms already pass at base
   (B2c/B3c/B4c/B4d/B6); the eight misses are the v2 arms. K1 still holds ("cannot reach 13/13"),
   but the residual must not be read as eight newly-changed arms.
4. **After-state absent at `ac56743`**: `scripts/receipt-attest.mjs` still v1
   (`CONTRACT = 'kumitate-receipt-attest-v1'`, sha256 `44919763…`), `.ufo/waves/round-52/receipts/`
   and `close/` absent, registry/build untracked. Any draft value for after-state would be fabrication.
5. **Same rev, two A readings inside one committed r51 receipt.**
   `FINAL-57333ead….txt:1` carries `A51 … A5 MISS … PROXY: DRIFT (A_DRIFT term=A declared=81
   computed=71` while line 5 of the same file carries `PROXY: MATCH (A=81 …`. The draft requires
   every round-52 computed value to name its tree (archive/committed vs working) and rev.
6. **A51 label mismatch, non-substantive.** `ATTEST51` prints `version=v3`; the round-51
   SCORECARD text names "rule A51 v3r6" (repair-iteration count, not the emitted version string).
   Recorded so integration does not "fix" the probe's version token.

**Peer-artifact hints used (provisional, unverified by this seat).**
`w1/ScoutCompanion.md:20` (S103 = MDN `Date.parse()`, tier B, mined, body sha256 `9c120292…`)
and `w1/ScoutCensus.md` (wave-time snapshot 101 rows A:87/B:6/C:8, four W04s,
`SOURCES_CHECK: CLEAN (rows=101 …)`, "no source-row or tier change had landed", final numbers
left to L1) are marked as seat-asserted hints inside the relevant fill markers, never as
evidence.

**Limits.** Time-boxed leaf: no counter was executed, no peer artifact validated, no
integration measurement attempted; the draft is a template whose authoritative values depend on
the close sequence (R52-11 / Q44). Artifact: `.ufo/waves/round-52/build/ScribeScorecard/scorecard-round-52.md`.
