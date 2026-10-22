RESULT ReviewLesson43 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=defects defects=6

Review of corpus/lessons/round-43.md at 84cb1d5d8e703aafd4f73d887ba4237692ff13f9 (the measured
commit). All line numbers below are that revision. Note: the close commit 7f899ea landed during
this review and already repairs F2 and F3; F1 is partially repaired there; F4–F6 are still open at
7f899ea. Findings are pinned to 84cb1d5 as assigned.

F1 HIGH (tracing/overstatement) — line 60: "UNSTABLE seen on render-env-empty, resolved-kind-gate,
F-M03/F-M08/F-M11 and on three census witness mutants in an L1 trial at load ~50". The first four
trace to committed seats (ExecChecklistOpen, SimplifyGateMutants, CritC1Target). The L1 trial does
not: its receipt /fast/scratch/hyaku/kumitate-r43/trial1.txt is uncommitted scratch (header reads
rev=working-copy, target digests equal the measured bytes; no load reading anywhere in it), so
"load ~50" traces to nothing committed, and the counter that produced trial1 is unestablished —
committed wave-2 seat CritA1Addendum (objection 5) shows the diag counter sha256 a723beed matches
neither the frozen e24749e4 nor the lane copy 177f6cbb and marks the counter identity
"[INFERENCE] not established". The lesson also discloses the trial's ERROR but not the two later
pre-commit runs of the same bytes that read CLEAN (diag-full1/diag-full2), which bear on the
receipt's "first run at this commit" framing. At 7f899ea the Measurement section discloses the
trial ("load ~48", scratch trial1.txt named, CLEAN reruns named) — but Addendum line 60 still says
~50 (now inconsistent with ~48), the tip asserts the trial ran "with the frozen counter" against
CritA1Addendum's explicit "not established", and trial1.txt remains uncommitted.

F2 MEDIUM (placeholder at the reviewed rev; fixed at tip) — lines 44, 119, 163–165: the After
value, the close checklist count (D3's close half), the measured commit id, and the round-41
cost-trade disposition are all deferred to "## Measurement (filled at close)", which at 84cb1d5
reads only "Filled at close." No final/ receipt is in history at this rev (committed at 003dd28),
so at the reviewed revision the lesson's central After claim traces to nothing committed. The cost
trade additionally has contested committed evidence: ExecCiteWitness medians 2404/2466 ms at load
~52 with overlapping ranges, while CritNoHarm rules the trade unresolvable at that load and says to
report it as unmeasured. 7f899ea fills Measurement (CLEAN line, 19/19, trial disclosure); I did not
verify its cost-trade wording against the receipts.

F3 MEDIUM (wrong/untraced numbers; fixed at tip) — three Gate word counts:
- line 68, S046 "(22 words)": the quote counts 24 words and the committed seat ScoutSrcFlaky says
  "Quote A (24 words)".
- line 82, S049 "(16 words)": counts 18; ScoutSrcFlaky says 18.
- line 86, S050 "(17 words)": counts 18; no committed receipt states any count for this quote.
All four counts (incl. S051) are corrected at 7f899ea to 24/12/21/17/18/18/11/19, which match
whitespace counts.

F4 MEDIUM (overstatement by one-sided citation) — line 23: "(a)–(c) are the round-42 plan's
pre-data sentence …; seat RevengerKillRuleHistory re-derived five rule statements and found K43
(a)–(c) identical to it". A committed wave-1 falsifier disputes identity: CritK43Rule objection 3
shows K43 (a) adds a parseable case summary and control-total equality — a run with non-zero exit
and `VERDICT: FAIL` but a different total is a KILL under the b237e3f0 sentence and drift/ERROR
under K43. The lesson cites only the agreeing seat and nowhere discloses the objection. Still open
at 7f899ea (line 23 unchanged). Smallest fix: qualify with the CritK43Rule reading ("plus a
case-total equality") or name the dispute.

F5 LOW (mischaracterized reject rationale; no Q<n>) — line 96: "eight deletions that touch the
frozen K43 functions' shape (`wellFormed`, `failLines`)". Per SimplifyGateMutants' own table only
applied proposals 4 (wellFormed) and 5 (failLines) touch those shapes; proposals 1–3, 7, 8 are
report-text/JSON hoists, an unused size field and a `/41` constant. The reject itself is sound
under the plan's freeze rule. It is also the only Gate decision carrying no Q<n>; Q25 (frozen
predicate, no post-data change) exists and matches — Q21 permits "a named gate term", so this is
not a Q21 violation, but citing Q25 would satisfy the lane's own convention. Still open at 7f899ea.

F6 LOW (wording overstatements) — D5 bullet: "Same-sha runs … read dfabe92 553/481, c9a084bf
554/481, e5ffcbe7 558/486": the three runs do not share one script sha (dfabe92 896f0720…,
c9a084bf = e5ffcbe7 1915e5b9…); "same-sha" holds only for the last pair (which is the seat's
actual point). D3 bullet: "checklist pass counts measured at open (… seat ExecChecklistOpen)" —
that seat measured at e5ffcbe7, one commit after round-open 2a7f37d2 (its own header states the
rev), so "at open" is loose. Q26's named receipt path (open/checklist-pass.txt) also does not
exist; the open-side evidence is the seat report only.

Checked and tracing correctly (no finding): K43 wording matches the plan's frozen predicate and
the gate's clause structure; do-nothing control receipt (SURVIVED mutants=43 killed=36 frozen=34/41
exit 1, the seven named survivors) verbatim; measured CLEAN mutants=43 killed=43 frozen=41/41 exit
0 (committed at 003dd28); discriminators PASS with controls e5ffcbe7 PASS / J4 and tripwire FAIL;
J1–J3 ERROR exit 2 (ExecJunkControls); K43 functions byte-identical between 0f4108bf and 84cb1d5
(direct line-range diff, verified by me); "selftest 28 -> 41" and "lane copy kills all seven"
(ExecGateIsolation 41/41, k43_killed=7/7); MutK43Independent 43/43 agree 0 disagreements;
RevengerKillRuleHistory five rules; MutK43Counter seven of 13; MutWitnessScan 5 of 12 (1
inconclusive, unmentioned — literal claim true); SentinelTempParent F1; CritC1Target routes A/B
(CLEAN; CLEAN at --jobs 1; F-M03/F-M08/F-M11 UNSTABLE at load 60–78); WC29 timeouts 10 s / 20 s in
wave-census.mjs at this rev; WC32 red-before (ExecCensusWitness); cite-check witness description
and the primary-only child env var in scripts/cite-check.mjs; the gate's five-variable sandboxEnv
allowlist never sets it; D1 digests 25937520/3e4ff33a/48c12359 byte-verified in history; D5
retraction numbers 553/481, 554/481, 558/486; D7 oauth 0755 / two red-before / 54/54 / census CLEAN
before and after; R11 carried row recorded in SCORECARD with the cell not rewritten; registry
changes (S039 used-by, S046–S048 mined, S049–S052 rejected) and the ScoutSourcesRecheck proposals
recorded not applied; QUALITY Q25–Q28 present; round-42 appended corrections (36 added lines: the
S045 Q8 correction in ## Gate and the final Correction section; round-42 plan stays as filed, as
the lesson says). Each Mistakes fix is shown able to fail: Q27 planted ProbeUntracked.md prints one
?? line and the counter-blindness probes read identical terms (ScribeQualityCriteria); Q25
single-clause drops read 27/28 VERDICT: FAIL (same seat); the rejected witness patch 4d06a116
really adds `readFileSync(SELF, 'utf8')` at its line 13 (bytes sha-verified in scratch; quoted in
committed CritA1Addendum); the WC29 fix's red-before is the committed UNSTABLE captures and the
measured run is clean.

Residual risk and verification gaps: I reran no gate, selftest or checker — every pass/fail above
rests on the committed receipts and seat reports named; the LSP device was not available to this
seat, so all caller/definition checks were literal reads of pinned bytes (recorded as fallback).
trial1.txt's counter identity remains unestablished on the committed record; the tip's "with the
frozen counter" assertion needs a receipt or softer wording. The ExecCiteWitness rejected patch
bytes live only in scratch (sha-named). The tip's cost-trade wording was not checked against
ExecCiteWitness/CritNoHarm by me. S051's "12 words" at this rev traces to the seat (both said 12)
though whitespace count is 11; tip corrected to 11. No tools were installed or updated. No
processes or temp dirs left; the only lane write is this report.

## Evidence (command → observed)

1. `git show 84cb1d5:corpus/lessons/round-43.md | sed -n '68p;82p;86p'` → "(22 words)" (S046), "(16 words)" (S049), "(17 words)" (S050).
2. `printf '%s' "<quote>" | wc -w` → S046 quote 24; S049 quote 18; S050 quote 18.
3. build/ScoutSrcFlaky.md → "Quote A (24 words)" (Shi); Alshammari "Quote (18 words)".
4. lesson:60 → "… three census witness mutants in an L1 trial at load ~50); seven of 13 counter mutants survived …".
5. `ls -l /fast/scratch/hyaku/kumitate-r43/trial1.txt; grep -c loadavg trial1.txt; sed -n '1p;49p' trial1.txt` → 7833 B Oct 22 19:37; 0 loadavg lines; header `rev=working-copy cite-check=227f5645… wave-census=76447250…`; `GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 …) unstable=3`.
6. falsify/CritA1Addendum.md → "diag/scripts/gate-mutants.mjs has sha256 a723beed…, which is neither the frozen e24749e4 nor 84cb1d5d's 177f6cbb. Which counter produced trial1 is [INFERENCE] not established."; "diag-full1 (19:40:42) and diag-full2 (19:41:33) read CLEAN".
7. `git show 84cb1d5:corpus/lessons/round-43.md | sed -n '163,165p'` → "## Measurement / Filled at close."; `git ls-tree -r --name-only 84cb1d5 -- .ufo/waves/round-43 | grep final/` → no output; 003dd28 subject → "C1 after receipt at measured 84cb1d5d … checklist 19/19 at 84cb1d5d".
8. build/CritNoHarm.md → "The round-41 cost trade cannot be resolved at this load … report the trade as unmeasured"; build/ExecCiteWitness.md → "median_ms_before=2404 median_ms_after=2466 … Load context: /proc/loadavg first field ranged 52.05–53.21".
9. build/CritK43Rule.md objection 3 → "A non-zero `VERDICT: FAIL` run with a different total is a kill under the round-42 sentence. Under K43 it is `drift`".
10. lesson:23 → "… found K43 (a)–(c) identical to it)"; CritK43Rule header → "k43_equals=round-42-pre-data-sentence" — two committed seats disagree; the lesson names one.
11. build/SimplifyGateMutants.md proposals 1–3, 7, 8 (reportText/mutantText/STATES hoist, size field, `/41` constant) vs 4 (wellFormed) and 5 (failLines); lesson:96 says "eight deletions that touch the frozen K43 functions' shape".
12. `git show 0f4108b:scripts/gate-mutants.mjs | sed -n '428,491p'` vs `git show 84cb1d5:… | sed -n '493,556p'` → diff empty (K43 functions byte-identical).
13. `git show 84cb1d5:.ufo/waves/round-42/falsify/Crit{C1Claim,SeparabilityTip,TradesTip}.md | sha256sum` → 25937520398a9f23…, 3e4ff33adb5b2886…, 48c12359ab69ebb5….
14. `git diff 2a7f37d 84cb1d5 -- SCORECARD.md | grep "^[+-].*pin\."` → exactly four pins moved (cite-check, kimi-census, wave-census, gate-mutants); values only, no new keys.
15. `git show 84cb1d5:scripts/gate-mutants.mjs | sed -n '108,116p'` → sandboxEnv returns PATH/HOME/TMPDIR/LANG/TZ only.
16. .ufo/waves/round-43/open/c1-control-base.txt → `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 …)`, `exit=1`, seven survivors as listed.
17. .ufo/waves/round-43/final/c1-measured-84cb1d5d.txt (committed at 003dd28) → `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)`, `exit=0`.
18. probe/c1-discriminators-controls.txt → e5ffcbe7 PASS; J4 `C1_DISCRIMINATORS: FAIL` (D-static 2); tripwire FAIL (D-static 2, D-null both targets).
19. build/ExecJunkControls.md → J1, J2 `control-fail=2` exit=2; J3 `nomatch=7` exit=2; J4 `CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit=0.
20. build/ExecChecklistOpen.md → `CHECKLIST: 16/19 pass`, red 6,7,18, `rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b`.
21. build/ExecCiteBefore.md → dfabe92 errors=553 warnings=481 (script sha 896f0720…), c9a084bf 554/481 (1915e5b9…), e5ffcbe7 558/486 (1915e5b9…).
22. `git show 84cb1d5:scripts/wave-census.mjs | sed -n '533,534p'` → `timeout: 10_000` (mkfifo) and `20_000` (run) in WC29.
23. `git diff --stat 2a7f37d 84cb1d5 -- corpus/lessons/round-42.md` → 36 insertions; added lines contain "must name is **Q8**" (S045, inside ## Gate) and "## Correction (appended round 43 … `.ufo/waves/round-42/plan.md:81` stay as filed)".
24. `git show 84cb1d5:corpus/QUALITY.md | grep -n "Q2[5-8] —"` → lines 323, 366, 400, 433.
25. `sha256sum /fast/scratch/…/ExecCiteWitness.patch` → 4d06a116d93ebede…; patch line 13 → `+ const source = readFileSync(SELF, 'utf8');` (also quoted in committed CritA1Addendum).
26. `git log --oneline -1` → `7f899ea round-43: close …`; lesson at 7f899ea → counts 24/12/21/17/18/18/11/19, Measurement filled (CLEAN line, `CHECKLIST: 19/19`, trial at "load ~48", trial1.txt named); line 23 and line 102 unchanged.
