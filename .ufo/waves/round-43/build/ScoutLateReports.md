RESULT ScoutLateReports rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=verified sha_match=3/3 open_objections=6

## D1 evidence (lane HEAD e5ffcbe7, plan commit 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82)
`sha256sum .ufo/waves/round-42/falsify/{CritC1Claim,CritSeparabilityTip,CritTradesTip}.md` (closure lines 34-37 hold 8-hex prefixes only; full digests recorded here): 3/3 match.
25937520398a9f234a7dd0e6c4b0d53c54787fcb33d1a42bc395c7c669205af3  CritC1Claim.md  (closure 25937520…)
3e4ff33adb5b2886dae19f88f9f74bd1d805948e79db1d27c34091568dd42889  CritSeparabilityTip.md  (closure 3e4ff33a…)
48c12359ab69ebb50d586fc46e7cd90d51393dd292b4897e811883d19a35ae32  CritTradesTip.md  (closure 48c12359…)
mtimes vs close: `git show -s --format=%ci 4e1f3a79` = `2026-10-22 18:13:30 -0300`; `stat -c '%n %y'` = CritC1Claim `2026-10-22 18:16:29.374927964`, CritSeparabilityTip `2026-10-22 18:18:04.704299675`, CritTradesTip `2026-10-22 18:16:29.858929845` (-0300). Deltas +2m59.4s, +4m34.7s, +2m59.9s: all three are late past the close commit and past the report landing (fleet e46327c, 18:14:44).
committed: `git log --format='%h %ci %s' -- <three paths>` = `0f4108b 2026-10-22 19:11:35 -0300 round-43: plan … D1 three late round-42 falsify reports committed as late evidence`; HEAD blob == worktree blob for all three (`3c9ecb64…`, `9e61ac11…`, `cd1e7657…`), `git diff -- .ufo/waves/round-42/falsify/` empty: committed bytes equal what the closure read.
fleet quote is committed text: HEAD blob == worktree blob `5df8df73d0897d74033b56837f8a10c9c0c348e8`, report commit e46327c `2026-10-22 18:14:44 -0300`.

## Reports and routing (all three measure rev=c9a084bf03fb043d3cce5da102fffbc023552a45)
CritC1Claim — `verdict=weaker objections=4`.
 O1 integer overdetermined / counter blind (zero-byte .mjs reads operability=9): routed — the plan drops the integer (stays 9) under D3 and makes C1's falsifier the receipt's `frozen=41/41`, as O1 asked; but D3's pass-sensitive criterion is absent at 0f4108bf (`git grep pass-sensitive` hits only plan.md:83 and the closure lesson:202) — routed, artifact pending.
 O2 false kill under host pressure: routed and implemented — K43(d) `confirmKill` with sorted `failNames` on a second run (`scripts/gate-mutants.mjs:461-464,626-631`) and CONTROL_AFTER re-run (:1088); receipt: 36/36 kills `confirm=same`, 7 survivors, 2 CONTROL_AFTER PASS, no unstable/timeout/crash state.
 O3 seat-private scratch path: routed and fixed — D4 `$KUMITATE_GATE_MUTANTS_TMP` else `~/.cache/kumitate-gate-mutants` (:37-38), owner/mode checks (:44-52), doc (:111).
 O4 external SIGKILL leaks process groups/temp dirs: routed as a test only (D4 "red-before … external-kill leak"); the bytes still clean up solely on exit/SIGINT/SIGTERM/SIGHUP (:78-81, :90-96), no reaper and no PDEATHSIG — OPEN.
 Nit (JS rounding reaches 10 at 10^17) is not an objection and is not routed.
CritSeparabilityTip — `verdict=separable risks=8`.
 R1 wave-census floor 31: closed by base — receipt `CONTROL wave-census PASS … cases=31/31 floor=31` (SURVIVED, not the ERROR exit 2 the seat saw on round-42 partial trees).
 R2 cite-check guard bytes: closed by base — `guard-outer-ne-1` and `guard-outer-eq-undefined` killed `confirm=same`, summary `drift=0`.
 R3 shared lesson / sources used-by: closed at open (`SOURCES_CHECK: CLEAN (rows=45)`); the plan's Sourced bullet adds the round-43 row for the K43 knowledge text.
 R4 `--strict` exit 0 is not C1's: routed D6; measured at 0f4108bf: `PROXY: MATCH (A=10 C=19 operability=9; … pins=6 match; src-rev=31c465f15669)`, exit 0 (the open receipt's C2_TOTAL_DRIFT, AXES_DRIFT and GATE_PIN_DRIFT are repaired).
 R5 one shared `pin.proxy-check`: routed D6 ("pin values … re-pinned when a pinned file changes").
 R6 round-42 plan:64 separability sentence false for C2: no round-43 text repeats it (one claim); the round-42 plan text stands uncorrected — moot this round, not edited.
 R7 host pressure looks like verdicts: routed — K43(a) evaluable definition plus (d) plus control re-runs, and the plan's host-safety bounds.
 R8 `--rev` cannot measure pre-round-42 revisions: routed — D4 both-target `--rev` control receipt (`targets=2 drift=0`); the old-revision limit stands but is not needed this round.
CritTradesTip — `verdict=notdeepened warnings=3->0 cite_ms=851->856`.
 Trade 1 (lane-owned pin block acceptable): routed to the operator (D6, L0 9a00d09). Trade 2 (cite-check 851→856 ms, not deepened): carried — the plan re-measures the median of 3 runs before and after.
 Residual weaknesses, none routed: W1 depth-stop mutants still recurse and the manifest carries none — OPEN; W2 `S-skip-both-always` survives (gate reads it as drift, suite still passes) — OPEN; W3 `D-hard-stop-3` survives — OPEN; W4 `X-guard-outer-truthy` near-equivalent — OPEN; W5 DEPTH inheritance in the checklist item — OPEN.
 New costs: checklist 19→44 s and wave-census selftest +410 ms are not named for re-measurement (only cite-check wall time is) — unmeasured, open.

## Correction
Line in the round-42 report (fleet `.ufo/reports/round-42/kumitate.md`, blob 5df8df73, lines 137-140), quoted exactly:
"- Deviation: 12 falsify seats were **cancelled by the L1** (not dead) to close the round at the request budget: ReRunC1Gate, CritC1Claim, CritSeparabilityTip, CritTradesTip, MutCiteGuardTip, MutProxyGatePins, MutAnchorCaps, ReviewGateCode, ReviewLessonR42, ReviewScorecardR42, ReviewLogR42, SentinelGateTip — their attacks are unperformed, not passed."
One sentence for the round-43 report:
"Correction (D1): the round-42 line '12 falsify seats were cancelled … their attacks are unperformed, not passed' is wrong for three of the twelve — CritC1Claim (verdict weaker, 4 objections), CritSeparabilityTip (separable, 8 risks) and CritTradesTip (notdeepened, warnings 3→0) delivered after the close (mtimes 18:16:29–18:18:04 -03 against close 4e1f3a79 at 18:13:30 -0300), the closure read and weighed them (CritC1Claim objection 2 became D2/K43), and they are committed as late evidence at 0f4108bf (sha256 25937520…, 3e4ff33a…, 48c12359…), so those three attacks are performed late and only the other nine are unperformed, not passed."

## Scope and hygiene
`open_objections=6` counts unclosed substance: CritC1Claim O4 and CritTradesTip W1-W5; O1 is routed with a pending artifact (D3), R6 is moot. D3's checklist pass-count receipt at round open is absent from `.ufo/waves/round-43/open/receipts.txt` (no checklist line; SKILL.md has 19 checklist items at 0f4108bf) — wave-1 gap, not D1.
No patch (verification only). Scratch clone /fast/scratch/hyaku/kumitate-r43/seats/ScoutLateReports/lane at 0f4108bf, removed after use; no leftover processes; tool installs/updates: none.
