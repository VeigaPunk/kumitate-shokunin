# ReviewSpotcheckRouting — R43 routed-defect dispositions vs plan.md, and D1–D8 closure check

Rev `292d92668ff80973547a8b10d12ffb5a48f2d7d8` (lane HEAD; worktree byte-identical to the revision:
plan.md `166ae644…`, round-43-verifier-spotcheck.md `f67bd476…`, round-43.md `33fa3938…`).
Sources opened: `.ufo/waves/round-44/plan.md`, `corpus/lessons/round-43-verifier-spotcheck.md`,
`corpus/lessons/round-43.md`, `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/lessons/round-42.md`
(at `6cda8c35`), fleet `.ufo/reports/round-43/kumitate.md`, `probe/p44b-count.mjs` (sha256
`6e2c22a3…` ✓ matches contract), `probe/p44-shape.tsv` (`fcf9fcb6…` ✓),
`open/p44b-before-6cda8c35.txt`. All opens were `git show` at `292d9266` unless noted.

## Verdict: routed (with 3 gaps)

Every routed defect R43-1..R43-6 and every item of the spotcheck's conformance-defect paragraph has
a written disposition in plan.md § Round-43 routed defects — none omitted. Two dispositions are
dodges or partially landed against the plan's own standard (see 4, 7), and the file-repairs they
name have not landed at `292d9266` (expected mid-wave; each must land by round close).

## R43-1..R43-6 disposition table

1. **R43-1 (gate-mutants counter gameable before data)** — disposed, not a dodge. Plan: not
   re-claimed (anti-loop); capability row records the miss via R43-4; remedy relocated into the
   P44 sandbox; counter stays open. Byte check: `probe/p44b-count.mjs:229-246` gives a unique run
   prefix (`run-${pid}-${randHex(8)}`) under a 0700 parent (recursive mkdir applies 0700 to the
   new run and `c` dirs), and the bwrap line shows `--unshare-all --clearenv` with only `/c/omp-census.mjs`
   and `/r` bound plus a fresh tmpfs `/tmp`, fixed argv, 20 s wall — the six harness-key channels
   SentinelWitnessGaming listed (run-dir prefix, listable scratch, pristine twin, mtime, own
   bytes, parallelism) are all invisible or constant to the census. A route-A/J4b-style path- or
   self-keyed census sees the same bytes at the same path in every case, so it can only emit a
   constant verdict and fails half the case set. Residual (honest, designed for): the P44 counter
   has not yet been scored against built junk controls — no census exists, and wave 1 is
   controls-only by the plan's own order; that verification is owed, not missing. The
   "open in `## Limits`" half lives in `corpus/lessons/round-43.md` `## Open limits` bullet 1
   (self-inspecting-suite gaming) via the SCORECARD round-43 section's pointer — substance
   present, pointer style.
2. **R43-2 (A1 timing; "four routes → A1" attribution)** — disposed as a commitment, NOT yet
   landed. Plan: "appended correction to `corpus/lessons/round-43.md`; this round's report
   corrects the attribution." Byte check: `round-43.md` at `292d9266` carries no round-44-era
   append (its latest sections are the round-43 Measurement and Late falsify findings; grep for
   an attribution correction reads nothing); the round-44 report does not exist yet. The defect
   background is confirmed in the fleet report: `kumitate.md` "## Landed changes" area says four
   junk routes (J4, self-digest tripwire, route A, J4b) with an arrow into addendum A1, while
   A1 (`df1ceaf8`) scores only J4 and the tripwire; route A ran before A1 but A1 does not name
   it, and J4b came after the measured run. **Must land as files this round:** the append in
   `corpus/lessons/round-43.md` and the attribution correction paragraph in the round-44 report
   at close.
3. **R43-3 (measured ≠ shipped)** — disposed as a commitment, NOT yet landed. Plan: a
   frozen-counter receipt over shipped tip `b01ded32` committed as round-44 evidence; capability
   row records the gap either way. Byte check: the round-44 tree at `292d9266` holds only the two
   p44-before receipts, plan and probes — no `b01ded32` receipt; the gate-mutants capability row
   (SCORECARD.md:1711) cites the 84cb1d5d receipt but does not name the shipped-tip byte gap
   (cite-check `227f5645…` at the measurement vs `115bfde4…` at `b01ded32`). **Must land as
   files this round:** the receipt file (seat ExecR43ShippedReceipt in flight) and the
   one-line gap record wherever the capability row or round-44 section cites it.
4. **R43-4 (capability row `gate-mutants`)** — **dodge risk: the landed row edit overstates.**
   The plan's own sentence requires the row to record "that the claim did not verify in rounds
   42 **and 43**." The row at `292d9266` (SCORECARD.md:1711) records the round-42 miss explicitly
   ("the round-42 pointer above was not reproducible under the round-42 pre-data kill rule") but
   frames round 43 as "**Round 43 (re-evidenced under K43)**" with the 84cb1d5d CLEAN receipt as
   evidence — it nowhere records that the round-43 closure ruled C1 not verified
   (rejected-honest-stop, junk controls met the target). A reader of the row today sees restored
   evidence, which is exactly the framing the spotcheck rejected ("the row still stands on
   unverified evidence"). The pre-registered correction's letter ("only a measured commit that
   prints CLEAN … restores the row's evidence") was met by 84cb1d5d, but the plan's R43-4
   disposition sets the stricter two-round standard, and the row falls short of it. **Must land
   as a file this round:** a second row amendment recording the round-43 non-verification.
5. **R43-5 (witness single points WA/WB/WC; both-verdict lines; owed seats)** — disposed,
   substantially landed. Recording: SCORECARD round-43 section + `round-43.md` `## Open limits`
   name the WA/WB/WC class and MutWitnessScan survivors as next-round manifest candidates —
   the plan's phrase "recorded open in SCORECARD `## Limits`" is loose (it is the round-43
   section and the lesson's limits, not the `## Limits` body), but the substance is open and
   findable. P44 clause byte-verified: `casePasses` (`p44b-count.mjs:229-233`) requires exactly
   one CLEAN and zero DRIFT lines (or the mirror image), so a run printing both verdict lines
   fails both branches — the R43-5 hole is structurally closed in the new counter. The owed
   seats MutCiteWitness and SentinelReaper running "this round" with findings recorded: not yet
   verifiable at `292d9266` (no wave report files exist); **must land as files this round:** the
   two finding reports (or their honest absence-of-verdict record at close).
6. **R43-6 (receipts name earlier runs; report minors)** — disposed as commitments, NOT yet
   landed. Plan: appended note to the round-43 receipts record; the round-44 report notes the
   duplicate `b01ded32` line and the dangling sentence, filed report not rewritten. Byte check:
   `round-43.md` at `292d9266` has no such append. The two report minors are confirmed in the
   fleet report: `kumitate.md` lists `b01ded32` twice back-to-back in `## Landed changes`, and
   the dangling "The operator and the closure rule." sits at the end of the Per-axis verdicts
   section. **Must land as files this round:** the lesson append and the round-44 report's
   minors paragraph.

## Conformance-defect paragraph (spotcheck) — all three dispositioned

7. Duplicate `b01ded32` lines and the dangling sentence → R43-6 (confirmed present in fleet
   `kumitate.md` as above). The "four junk routes → A1" attribution → R43-2 (confirmed: the
   report's prose makes four routes the antecedent of A1, and A1's own addendum scores only two).
   Coverage is complete; nothing from that paragraph is undispotioned.

## Round-42 D1–D8 check in `round-43.md` — all dispositioned, one honestly open

8. **D1** landed: three late reports committed at `0f4108bf`; the round-43 report carries the
   correction of round-42's "cancelled … unperformed" line (fleet `kumitate.md:46-50`, "committed
   as late evidence; only the other nine attacks are unperformed"); Q27 exists
   (`corpus/QUALITY.md:327` region, Q25–Q28 added round 43).
9. **D2** landed: K43 stated once and implemented once; the appended correction section
   `## Correction (appended round 43…)` exists in `corpus/lessons/round-42.md` at `6cda8c35`
   (line 188).
10. **D3** landed: no terms claim; Q26 exists (`corpus/QUALITY.md:372`, "an operability claim
    needs a pass-sensitive counter"); Q26's own register records that it fails on the round-43
    receipt naming ("in force from the round-44 plan").
11. **D4** landed: temp parent `$KUMITATE_GATE_MUTANTS_TMP` else `~/.cache/kumitate-gate-mutants`;
    receipt = the both-target `--rev` control run.
12. **D5** landed: retracted with cause (ExecCiteBefore; before-sides need receipts taken at the
    time).
13. **D6** — **left open by design:** "operator ruling pending (L0 `9a00d09`)"; only pins
    re-pinned where pinned files changed. Flag: still pending at `292d9266`; this is an honest
    open, not a hidden one, but it is the one D-item with no closure this round and its ruling is
    not in the round-44 plan either.
14. **D7** landed: kimi-census owner-pinned secret dirs + two red-before cases + live CLEAN; the
    unsourced-stub hole is named open as Q28 (flagged here as an open sub-item, correctly
    recorded, and Q28 is in force from round 44 per QUALITY.md:323-328).
15. **D8** landed: WC32 canonical-path refusal red-before; S045's Q8 appended correction in the
    round-42 lesson (`## Gate`, line 86 at `6cda8c35`).
16. Carried (round-42 pre-registration (3)): the R11 registry cell (47 vs 41) is recorded in the
    SCORECARD round-43 section, "cell text not rewritten", and its rewrite is a round-44
    candidate, not a commitment, and is not dispositioned in the round-44 plan. Flag: open,
    carried with a name.

## Named file repairs this round (owed at close of this wave/round; none landed at 292d9266)

- `corpus/lessons/round-43.md`: appended corrections for R43-2 (attribution) and R43-6
  (receipts-record note naming trial1 + the two diagnostic runs).
- `SCORECARD.md`: gate-mutants capability row amended again to record the round-43
  non-verification (R43-4, and R43-1's "the capability row records the miss"); the shipped-tip
  `b01ded32` gap recorded either way (R43-3).
- `.ufo/waves/round-44/…`: the frozen-counter receipt over shipped tip `b01ded32` (R43-3; seat
  in flight).
- Wave finding reports for MutCiteWitness and SentinelReaper (R43-5).
- The round-44 report (close): the A1-attribution correction (R43-2) and the two report minors
  (R43-6).

## Residual risk and verification gaps

- The routed-vs-disposed mapping above is judged on written dispositions and byte evidence at
  `292d9266`; whether the owed file repairs actually land is unobservable before close. The
  dispositions themselves are judged sound in design; two (R43-4's row wording, R43-3's
  either-way record) currently fail their own stated standard in the committed bytes.
- Q25–Q28 content was read from `corpus/QUALITY.md` (added at `84cb1d5d`); the QUALITY register
  itself records that Q25, Q26 and Q28 fail against the round-43 state and are in force from
  round 44 — consistent with this review's gap findings.
