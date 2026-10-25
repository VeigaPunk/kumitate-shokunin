# kumitate — round 41 attempt 2 (2026-10-22)

Lane open (base, unchanged from attempt 1) `a58b7f72afc1eb44b37e438a2f8b212c658874e5`; C1 measured
`68db3419` and `4e58bb0e`; C2 measured `4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3`; attempt-2
inheritance commit `fae386aa9e0542710b7a893d84c8e92e86fc079b`; pushed lane tip `fb7046ca862e0d92f76c2a718a24807433c603ff`
(`jj-lane.sh state`: local=remote=fb7046ca, ahead=0, behind=0, tracked=0, untracked=0). Source pin `31c465f15669f744848bd9f5d56191c5085670f7`, read-only
clone `/fast/scratch/hyaku/kumitate-pin/src`. Domain source not edited or pushed.
Tool installs or updates by the L1: none. No seat reported an install or update (pacman paused host-wide; seats used node, jq, curl, git, python already present). L0 questions: none.
Stale-lane: respawn-per-round driver; this assignment is exactly round 41 attempt 2; no other
kumitate mission is open and this run does not start round 42.

Inherited state (attempt 1 died in the omp process restart at 17:26Z; `.ufo/watchdog.log` is the
driver's). Attempt 1 pushed `34fccc17`, `cb2d8d09`, `68db3419`, `27592977`, `4e58bb0e`,
`02fef27a`, `5320e0da` (lane tip at attempt-2 open, ahead=0). It left 13 uncommitted paths; all
13 were re-verified and **committed** in `fae386aa`, none reverted:
- 5 tracked: `SKILL.md` (cite-check row and checklist item 16 wording narrowed to the round-40
  scout's 16 and to payload counts), `corpus/README.md` (round-41 row wording), `corpus/SOURCES.md`
  (S018 `queued → mined`, used-by the lesson), `corpus/lessons/round-41.md` (S018 gate entry,
  ScoutOmpSpawnFailure fact, CritC1SetWidth and ReRecountC2 limits), `scripts/wave-census.mjs`
  (three repairs: a `..` report path is absent; a task without a string name and agent fails closed;
  any read error exits 2, not 1). Re-verification: the three repairs had no pinning case (selftest
  20/20 with or without them); attempt 2 added WC21–WC23, 23/23, and each is killed by reverting its
  repair (`.ufo/waves/round-41/final/a2-census-repair-mutants.txt`, 3/3).
- 8 untracked falsify reports: `CritC1SetWidth.md`, `ReProbeC1.md`, `ReRecountC2.md`,
  `ReviewCitePin.md`, `ReviewR403Receipt.md`, `ReviewRegistryRow.md`, `ReviewS038.md`,
  `ScoutOmpSpawnFailure.md` (each opens with its `RESULT` line; committed as wave evidence).
- Misroot: `/home/vgpnk/Projects/shokunin/.ufo/waves/round-41/falsify/ReviewCensusCode.md` (an
  attempt-1 kumitate falsify seat; first line `RESULT ReviewCensusCode rev=4e58bb0e…`) copied
  byte-exact into the lane (sha256 `778a35eec329296893fc9ed5ac6be0c9dbe40df3901132607bbfb93e1b2f3983`,
  `cmp` equal) at 17:45Z, fleet copy and its two empty directories deleted, committed in `fae386aa`,
  recorded under `## Mistakes`.
Not authored by this lane and untouched: `corpus/lessons/round-3[4-9]-verifier-spotcheck.md`,
`corpus/lessons/round-40-verifier-spotcheck.md`. No `corpus/lessons/operator-*.md` exists.
Holds (never recreated, rephrased or rerouted): the round-40 items `AtkNovelIdentity` and
`AtkNovelRecords` (provider safety filter with an automatic model switch).

## Work performed

Declared claims (two; under AXES.md's distinct-axis rule they count as one operability move plus
one capability row, because C2's per-axis verdict also lands on operability — lesson
`corpus/lessons/round-41.md` `## Claims`, verify seat CritAxisAccounting):

1. **C1 operability (lowest non-retired axis, integer held 8)** — `scripts/cite-check.mjs` has a
   failing case for each of the 16 verdict, render and exit conditions the round-40 scout named
   `unpinned=16` (`.ufo/waves/round-40/build/ScoutCiteVerdict.md:1`).
2. **C2 capability `wave-census`** — `scripts/wave-census.mjs` reads a round's committed
   `*-dispatch.json` payloads and the reports their `Report:` trailers name; `--expect` checks a
   declared count. Sourced on S038 (opened this round); S018 re-opened.

Work items (attempt 1 commits were re-verified by attempt-2 verify seats; attempt-2 items marked a2):

- Plan and frozen counters, open receipts, R40-7 README row — `34fccc17`
  (`.ufo/waves/round-41/plan.md`, `.ufo/waves/round-41/open/receipts.txt`).
- C1 counter committed before its first run — `cb2d8d09`
  (`.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`); 11 hermetic cases (64 → 75) —
  `68db3419`; self-observation guard (a changed literal no longer recurses) — `5320e0da`.
- C2 counter committed before the instrument — `27592977`
  (`.ufo/waves/round-41/probe/wave-recount.sh.txt`); instrument, gate row `SKILL.md:607`, checklist
  items 16–17, capability row `SCORECARD.md:1681`, S038 `corpus/SOURCES.md:51` — `4e58bb0e`;
  falsify repairs (resume lanes, regular-file reports, `--expect` unknown role, `attack`, round
  scope; selftest 12 → 20) — `02fef27a`.
- a2: inherited leftovers committed and the three untested late repairs pinned (WC21–WC23, each
  killed by reverting its repair, `.ufo/waves/round-41/final/a2-census-repair-mutants.txt` 3/3) —
  `fae386aa`.
- a2: verify wave of 38 seats (below) attacked the tip `fae386aa`; its findings were integrated in
  `57269a55` and `fb7046ca`:
  - wave-census: WC24 (the suite observes its own verdict through a child run with one injected
    failure; records its result outside `check()`), WC25 (six `--expect` edges), WC26 (ten
    finding-logic edges); selftest 23 → 26; the 20 survivors named by MutCensusExpect,
    MutCensusFindings and CritMistakeClasses are killed (`final/a2-census-survivor-mutants.txt`
    10/10, `final/a2-census-findings-mutants.txt` 10/10).
  - C1 wording: 14 of 16 (not 13) show the failure in the exit code or verdict line; two
    (suite-group-verdict, suite-any-fail) only as `FAIL ` case lines (CritC1Final) — lesson,
    `SKILL.md:599`, `SCORECARD.md:399`; the environment dependence of the injection variable
    recorded (`survived=4/16` with an inherited value).
  - S018 locator: the "appear frequently even in successful runs" quote is in MAST Appendix J, not
    §5.1 (ReviewS018Reopen re-opened v3).
  - R40-2: its re-measure seat died in the attempt-1 restart; LOG and lesson no longer say it was
    re-measured (CritRoundShape, CritAxisAccounting, ScribeWorkPerformed).
  - R40-3: live cite-check errors had grown 545 → 551, all six in the round-41 lesson; rewritten,
    back to 545 (CritNoHarmTip; `final/a2-cite-check-tip.txt`).
  - Mistakes rows re-classed (CritMistakeClasses): instance-only fix of row 1 named, row 2 "fourth
    time", row 3 extended to wave-census, row 5 captured-by corrected; misroot sweep receipt
    `final/a2-misroot-sweep.txt`.
  - Tip receipts committed: `final/cite-mutants-final-fae386aa.txt`, `final/wave-recount-final.txt`
    (CritC2Final, ReviewScorecardCalib).
  - Open limits added from MutCensusReports (5 latent report-presence gaps),
    ReviewCensusCodeLedger (12 of 20 attempt-1 census findings neither fixed nor recorded until
    now), CritNoHarmTip (proxy `--strict` warnings, selftest cost).
- Routed R40-1 to R40-7 (lesson `## Routed defects`): R40-1, R40-3, R40-5, R40-6, R40-7 fixed;
  R40-2 limit recorded, re-measure not done (seat died, not replaced); R40-4 not done (open limit).

## Landed changes

LOG.md round-41 entry (`LOG.md:1817`) plus the attempt-2 bullet; commits (all pushed, lane branch
`master`):

| commit | change |
|---|---|
| `34fccc17` | plan, frozen counters, open receipts, R40-7 README row |
| `cb2d8d09` | C1 counter (before its first run) |
| `68db3419` | C1: 11 hermetic cases, 75/75 |
| `27592977` | C2 counter (before the instrument) |
| `4e58bb0e` | C2 `wave-census` capability; R40-1, R40-3, R40-5, R40-6; S038 |
| `02fef27a` | falsify repairs to C2, lesson, LOG, SCORECARD round-41 section |
| `5320e0da` | cite-check self-observation guard; wording fixes |
| `fae386aa` | a2: inherited leftovers (13 paths) + WC21–WC23; misroot moved in; Mistakes rows |
| `57269a55` | a2: verify-wave evidence so far; WC24–WC26; tip receipts; corrections |
| `fb7046ca` | a2: remaining verify reports; LOG attempt-2 bullet; round-shape record |

## Before → after measurements

- **C1** — `node --input-type=module - --lane <clone> --rev <rev> < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`
  (run with `KUMITATE_CITE_SELFTEST_INJECT_FAIL` unset): a58b7f72 `CITE_MUTANTS survived=15/16
  nomatch=0 crash=0 control=PASS` (`final/cite-mutants-open-a58b7f72.txt`) → 68db3419
  `survived=0/16 nomatch=0 crash=0 control=PASS` (`final/cite-mutants-measured-68db3419.txt`),
  same at 4e58bb0e and fae386aa (`final/cite-mutants-final-fae386aa.txt`). Re-run independently at
  fae386aa by verify seats ExecC1CounterTip, ScribeWorkPerformed, ReviewScorecardCalib, CritC1Final.
- **C2** — `bash .ufo/waves/round-41/probe/wave-recount.sh.txt` from a clone root: 27592977
  `RECOUNT_MISMATCHES=7 CAPABILITY_ROWS=1 EXPECT_4_EXIT=1 EXPECT_3_EXIT=1`
  (`final/wave-recount-before-27592977.txt`) → 4e58bb0e `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2
  EXPECT_4_EXIT=1 EXPECT_3_EXIT=0` (`final/wave-recount-measured-4e58bb0e.txt`), byte-identical
  values at fae386aa with 7 rows per listing (`final/wave-recount-final.txt`). Re-run by
  ExecC2CounterTip, CritC2Final, ScribeWorkPerformed; per-field recount of rounds 38–41 by
  ExecCensusRecount41: 9 waves, 0 disagreements.
- No-harm checks at fae386aa against a58b7f72: proxy `DRIFT` (2 errors) → `MATCH (A=9 C=17
  operability=8; C1=19/19 C2=92/92 coverage=10; S=88/88; R=92/92; K=52/52; pins=6 match)`, 0 terms
  decreased (ExecProxyNoHarm); 9 hermetic suites, 0 worse (ExecSuitesNoHarm); in-lane checklist
  16/17 (only the host's Kimi `locks` drift; 13/15 at open under the same host state,
  ExecChecklistTip, CritNoHarmTip).

## Sources & frontier

Census at round start (`.ufo/waves/round-41/open/receipts.txt`, 16:00:11Z) and at round end:

    $ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
    kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
    kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
    exit=0   (identical output at start and end)

- Rows 37 → 38 (`node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=38 tiers=A:37,B:1,C:0
  status=queued:14,mined:22,rejected:2 …)`; open `rows=37 … queued:15,mined:20`). Added by tier:
  A=1 (S038, own-work: the origin wave producer `scripts/ufo-swarm-wave.mjs` at the pin 31c465f1,
  new → mined). Touched: S018 `queued → mined`, used-by `— → corpus/lessons/round-41.md`; S035
  re-opened, unchanged. All logged old→new in the lesson `## Gate` (ExecSourcesCensus:
  `unlogged=0`).
- Sourced claim: C2 rests on S038 (`scripts/wave-census.mjs` header and the lesson cite it); S018
  (MAST FM-3.2) frames the R40-6 mistake. S018's quote re-verified verbatim by ReviewS018Reopen;
  its second locator corrected to Appendix J.
- Frontier: orchestration evidence — the lane can now count its own swarm evidence from committed
  bytes, and the census's limits are measured (payload ≠ dispatch; absent ≠ dead).
- Mistakes mined (`corpus/lessons/round-41.md` `## Mistakes`, five rows): calibration (R40-6),
  recurrence (closure README row, fourth time), suite blind spot (cite-check and, found this
  attempt, wave-census), misroot (ReviewCensusCode at the fleet root), untested repair.
- Misroot sweep: one kumitate file at the fleet root (above), moved; ScoutFleetMisroot found 0
  others; receipt `final/a2-misroot-sweep.txt`.

## Trend verdicts

- **expansion — improved.** A new capability (`wave-census`, capability rows 1 → 2) and one new
  tier-A source (S038); the lane can read its own committed swarm evidence.
- **quality — improved, with recorded trades.** C1 mutant survivors 15/16 → 0/16; wave-census
  survivors found this attempt (20 named) killed; live cite-check errors held at 545 after the
  lesson's own six were removed. Trades recorded, not hidden: proxy `--strict` reads 3 unpinned
  warnings (2 at open); cite-check `--selftest` 0.17 s → about 0.85 s; 12 attempt-1 census
  findings and 5 latent report-presence gaps remain open limits.
- **discernment — improved.** The verify wave refuted several of the round's own statements
  (13-of-16 split, R40-2 "re-measured", §5.1 locator, "no axis harmed" on unscored measures, two
  untracked receipts) and each was corrected or recorded with the seat named; no finding was argued
  away.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources —
  `SKILL.md:12-21`, `SKILL.md:599-607`, checklist `SKILL.md:658-691` (CritShonenBoxes); no
  non-author verifier on record.
- [~] At least one end-to-end domain task executed and logged in LOG.md — `LOG.md:1817` round-41
  entry and attempt-2 bullet; `.ufo/waves/round-41/final/`.
- [ ] Instructions executable by an agent without oral context — a bare clone reads 14/17 (two
  round-gate items need the fleet layout, one is host Kimi drift); SKILL does not say so
  (CritShonenBoxes); five SKILL citations do not resolve at the pin.
- [~] No cross-domain bleed (PROVINCE.md still accurate) — PROVINCE unchanged since round 34; the
  one write outside the lane was the addendum's misroot deletion (lesson `## Mistakes`).

## Round shape

Default two v1 waves, plus a third v1 payload forced by the restart (a deviation from the
addendum's shapes, named for the judge; verify seat CritRoundShape). The L1 holds the §3 planner
seat in both attempts (the validator rejects `planner`).

- **Build (attempt 1), 34-seat payload** (reviewer 9, scout 8, critic 7, executor 4,
  mutation-tester 3, scribe 2, connector 1): validated, never dispatched — the seat gate did not
  grant it in 3600 s. 0 spawned, 0 dead.
- **Falsify (attempt 1), 34 seats** (critic 16, reviewer 13, scout 4, connector 1), granted
  17:13:34Z, one task call: 27 returned (one misrooted, moved in); 7 died in the omp restart at
  17:26Z with no report (ReviewC1Hermetic, CritCensusAdversarial, ReviewR40Dispositions,
  ReviewHonestReMeasure, CritAnchorCapsOpen, ReviewLesson, ReviewSeatGateRecord); not replaced, not
  resumed.
- **Verify (attempt 2), 38 seats** (reviewer 11, executor 7, critic 7, mutation-tester 6, scribe 3,
  scout 2, connector 1, sentinel 1; attack roles 24/38 = 63%), `.ufo/waves/round-41/verify-spec.json`
  validated exit 0 under policy v1; `wave-slot.sh acquire kumitate kumitate-r41-a2-verify 38 3600`
  granted (`live=46 cap=85`), dispatched 18:12:38Z as ONE task call carrying the validator's
  taskCall unchanged plus one `solutionSpace` per task; 38/38 returned, 0 dead, 0 safety-filter
  holds; released 18:55:02Z. It carried every §3 floor role in one batched call, but it is not wave
  1, so the §3 floor stays **unmet** for round 41 (attempt 1 had executor 0 and scribe 0).
- No residual call. **Round total: 72 spawned seats** (0 + 34 + 38), ≤ 100. `wave-census --round 41`
  reads `seats=106` because it counts payload seats, including the 34 that never spawned.
- Routing: no `model` passed; roles routed by the host table (m_mim route restored 17:43Z, used for
  executor, scribe, mutation-tester and sentinel seats). Gate record
  `.ufo/waves/round-41/evidence-seat-gate.txt`.

## Verdicts on the claims (for the closure)

- **C1** — measured: `survived=15/16` → `0/16` at the named revisions and at the tip, re-derived by
  four verify seats. Wording corrected (14 of 16 visible in exit code or verdict line).
  Disclosed limits: an inherited `KUMITATE_CITE_SELFTEST_INJECT_FAIL` turns it to `4/16`; the
  counter's kill rule can be fooled by a two-part skip mutant (none of the 16 relies on that);
  the 5320e0da guard still recurses under an outer-marker literal change and two skip-bypass
  mutants killed at 4e58bb0e survive after it (MutCiteGuardTip) — a trade on an unscored measure.
- **C2** — measured: capability rows 1 → 2, recount mismatches 7 → 0 (7 rows per listing), R40-6
  caught by `--expect` (exit 1 at 4, 0 at 3); values byte-identical at 4e58bb0e, 5320e0da, fae386aa
  and unchanged at fb7046ca (selftest-only changes since). Instrument hardened by the verify wave
  (selftest 26/26; 21 named survivors killed); sentinel findings (no realpath confinement, FIFO,
  no size caps, trailer anchoring) recorded open.
- **Admission caveat (honest):** "no axis harmed" holds for every scored axis (proxy 0 terms
  decreased); unscored trades are recorded: proxy `--strict` 3 warnings (2 at open), cite-check
  selftest slower, guard mutants above. The operator rules.

Holds: none new this round. Carried from round 40, never recreated: `AtkNovelIdentity`,
`AtkNovelRecords`. Open L0 questions: none.
