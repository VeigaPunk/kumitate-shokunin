# Round 43 — one frozen kill predicate, and the mutant battery re-claimed against it

Source: S046 (Shi, Bell, Marinov, ISSTA 2019, opened this round), S047 (Infection guide, opened this
round), S048 (Cosmic Ray concepts, opened this round), S039 (PIT FAQ, re-read), the round-42
non-author closure (`corpus/lessons/round-42-verifier-spotcheck.md`, routed defects D1–D8) and the
pinned upstream revision 31c465f15669f744848bd9f5d56191c5085670f7. Round open: lane
2a7f37d2b0a413db8499b413783c27a0effdc989. Plan and frozen counter: `.ufo/waves/round-43/plan.md`
(commit 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82; `scripts/gate-mutants.mjs` sha256
`e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`, contract
`kumitate-gate-mutants-v2`); do-nothing control receipt commit
e5ffcbe7f155b89cb1870f9da7b0d671d092948b; addendum A1 (two extra failure conditions, nothing
relaxed) commit df1ceaf86c08dce7100da9b7c27f674bbad04f23.

## Claims

- **C1 operability (capability re-claim `gate-mutants`, predicate K43).** One predicate, frozen in the
  plan before any counted run and implemented once in code: a mutant is KILLED iff (a) its run is
  evaluable (no timeout, no overflow, its process group gone, no spawn error, a parseable case
  summary whose total equals the control's), (b) the selftest exits numeric non-zero, (c) stdout
  carries the exact line `VERDICT: FAIL`, and (d) an immediate second run of the same mutated bytes
  meets (a)–(c) with the same sorted list of `FAIL ` case names. (a)–(c) are the round-42 plan's
  pre-data sentence (`b237e3f0:.ufo/waves/round-42/plan.md:21`; seat RevengerKillRuleHistory
  re-derived five rule statements and found K43 (a)–(c) identical to it). Sources: S047 ("If mutated
  program produces failing tests, this is called a killed mutant."), S048 (a timed-out run is
  "incompetent", not killed), S046 ("If a test can have different outcomes when run on the same
  mutant, then it is unclear if the test actually kills the mutant.").
  - **Before (do-nothing control, round-open bytes).** `.ufo/waves/round-43/open/c1-control-base.txt`:
    `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 …)` exit 1; survivors cite-check
    `suite-group-verdict`, `suite-any-fail`, `suite-exit-text` and wave-census
    `survivor/V382-pass-count`, `survivor/V385-verdict-const`, `survivor/V387-exit-const`,
    `exits/M19-selftest-exit-const`. Independently re-derived without the gate (seat
    MutK43Independent: 43/43 lines agree, 0 disagreements).
  - **The work.** Both suites gain an independent second verdict path. cite-check (text mode): a
    witness counts failing non-skipped cases from the recorded results and, when it counts any, ends
    `VERDICT: FAIL` and exits 1 whatever the primary expression said; the self-observation child runs
    with `KUMITATE_CITE_SELFTEST_PRIMARY_ONLY=1` so the parent still observes the primary mapping
    alone (the gate's allowlisted environment never sets it). wave-census: the selftest prints
    `WAVE_CENSUS_SELFTEST_PRIMARY_EXIT`/`_PRIMARY_VERDICT` from the primary expressions, the final
    verdict and exit follow an independent failure count, and WC24's child observation asserts the
    primary lines. Every frozen literal still applies once; case floors unchanged (cite-check 75,
    wave-census 32 ≥ 31). The seat ExecCiteWitness's first cite-check patch read its own source to
    keep the primary mapping observable — a literal detector of the kind addendum A1 rejects; the L1
    replaced it with the primary-only child before any measured run (named in `## Mistakes`).
  - **After (measured).** See `## Measurement` (filled at close).

## Addendum A1 and the counter's limits

Wave-1 seats built two junk commits that the frozen counter scores `CLEAN … frozen=41/41` exit 0
(ExecJunkControls J4, a suite that checks its own source for the frozen literals; CritK43Rule, a
self-digest tripwire); CritC1Target found two more routes (a temp-path tripwire that reads CLEAN, and
an own-bytes hash that reads CLEAN at `--jobs 1`). J1–J3 read ERROR exit 2 as the plan required. A
suite that can inspect itself, or tell a mutant run from the control, kills every source mutation by
construction; the counter cannot tell it from a real verdict path. A1 (`df1ceaf8`, before any
measured run) adds two failure conditions for C1 — D-static (no added read of a target's own source
or a stored copy) and D-null (a comment-only change still passes) — scored first on e5ffcbe7 (PASS),
J4 and the tripwire (both FAIL). The temp-path route evades both; the backstop is a diff review of
the witness code (wave 2). Other limits found and not repaired (the counter is frozen): the
confirming run reuses the first run's temp tree (SentinelTempParent F1); kills are load-sensitive on
a shared host (UNSTABLE seen on `render-env-empty`, `resolved-kind-gate`, F-M03/F-M08/F-M11 and on
three census witness mutants in an L1 trial at load ~50); seven of 13 counter mutants survived the
counter's own selftest (MutK43Counter; the lane copy of the gate now kills all seven, ExecGateIsolation).

## Gate — admits and rejects

- **Admit S046** (https://par.nsf.gov/servlets/purl/10104340; Shi, Bell, Marinov, ISSTA 2019, NSF PAR author manuscript, tier A, `new → mined`,
  used-by `SKILL.md` and this lesson). Opened 2026-10-22 (seat ScoutSrcFlaky; PDF sha256
  `45da8b5f…`). Quote, §1 ¶3 p. 1: "If a test can have different outcomes when run on the same
  mutant, then it is unclear if the test actually kills the mutant." (24 words). Criterion: Q2
  (primary, opened), grounds K43 (d).
- **Admit S047** (https://infection.github.io/guide/; Infection guide at commit `4d7570f5`, tier A docs, `new → mined`). Opened
  2026-10-22T22:26Z (seat ScoutSrcKillDef). Quote, `guide/index.md:13`: "If mutated program produces
  failing tests, this is called a killed mutant." (12 words). Criterion: Q2; grounds K43 (b)–(c).
  Not cited for its MSI aggregate (killed + timed out + errored).
  Erratum (falsify seat ReopenS047): the row's locator says `infection/site`; commit `4d7570f5` is the
  head of `infection/infection.github.io` (file sha256 as recorded); the row's scope parenthetical
  "(not the MSI aggregate)" is contradicted by the same file, lines 94 and 99–101, which sum kills,
  timeouts and errors into "defeated" mutants; and the page names no exit status or verdict line, so
  S047 supports only "a kill is read off failing tests", not K43 (b)–(c) as written. The row stays as
  filed (append-only); this erratum supersedes its locator and parenthetical.
- **Admit S048** (https://cosmic-ray.readthedocs.io/en/latest/concepts.html; Cosmic Ray concepts at commit `f6550adf`, tier A docs, `new → mined`). Opened
  2026-10-22T22:26Z (seat ScoutSrcKillDef). Quote, `concepts.rst:178-179`: "if a test of a mutant
  takes longer than the timeout, the test is killed, and the mutant is marked incompetent"
  (21 words). Criterion: Q2; grounds K43 (a).
- **Re-read S039** (https://pitest.org/faq/; PIT FAQ § "Is it random?" → Timeouts, faq.markdown at `c15b3496`, line 222;
  seat ScoutSrcFlaky): "a mutant may be detected as timed out on one run, but killed or surviving
  on another" (17 words). No new row (S039 already holds the FAQ URL); `used-by` gains this lesson.
- **Reject S049** (https://conf.researchr.org/details/icst-2024/mutation-2024-papers/5/A-Study-of-Flaky-Failure-De-Duplication-to-Identify-Unreliably-Killed-Mutants; Alshammari et al., Mutation 2024, tier B, abstract only). Quote: "19% of mutants
  killed by these flaky tests result from the flakiness introduced by at least one test" (18 words).
  Missed Q3 (a number with no method or sample the lane read) and Q2 (a tier-B abstract cannot be
  sole support). Flip: the full paper opened by ordinary means.
- **Reject S050** (https://softengbook.org/articles/mutation-testing, § 1.2 Mutation Score; softengbook.org overview, tier C). Quote: "A mutant is said to have been killed when
  it is detected by at least one existing test." (18 words). Missed Q2: tertiary and unanchored, and
  its score denominator (all generated mutants) contradicts S034. Flip: none for this scope.
- **Reject S051** (https://circleci.com/blog/what-is-mutation-testing/; CircleCI blog, tier C). Quote: "A floor of 60–80% on high-risk modules is the
  realistic target." (11 words). Missed Q3 (a threshold without a counting command; the S043 class).
  Flip: a measured threshold at a named revision.
- **Reject S052** (https://stackoverflow.com/questions/73439324/, read through the Stack Exchange API; Stack Overflow 73439324, answer 74067880, tier C). Quote: "Such a syntactical change
  to the source code that does not change the semantics is called an equivalent mutant." (19 words).
  Missed Q2 (community is never tier A; its answers disagree). Flip: the PIT mutators page at a
  named release.
- **Reject (not a source) the simplifier patch** `SimplifyGateMutants.patch` (sha256 `3597a775…`):
  eight deletions that touch the frozen K43 functions' shape (`wellFormed`, `failLines`); landing
  any of them changes the counter's neighbourhood mid-claim. Criterion: plan "no amendment of K43 or
  of this counter". Flip: next round, after the claim is judged.

Registry changes logged old → new: S039 `used-by` gains `corpus/lessons/round-43.md`; S046–S048
added `mined`; S049–S052 added `rejected`. Rechecked without change (seat ScoutSourcesRecheck): S010,
S013, S014, S024, S026 (all HTTP 200, quotes verbatim); proposals S013 `on-release → 90d` and S024
`on-release → 30d` are recorded, not applied (the pages carry no release signal; the next recheck
round decides).

## Routed defects (round-42 closure D1–D8) — dispositions

- **D1** — the three late round-42 falsify reports are committed as late evidence at `0f4108bf`
  (sha256 `25937520…`, `3e4ff33a…`, `48c12359…`, byte-identical to what the closure read; seat
  ScoutLateReports). The round-42 report's "cancelled … unperformed" line is corrected in the
  round-43 report; QUALITY Q27 adds the filing-time check.
- **D2** — K43 stated once (plan), implemented once (`scripts/gate-mutants.mjs` functions
  `evaluable`, `killedOnce`, `classifyMutant`, `confirmKill`, `failNames`, `gateExitCode`,
  byte-identical at the measured commit), pinned by `k43-*` selftest cases; appended corrections to
  "written before any counted run" (round-42 lesson, new final section) — the frozen round-42 plan
  stays as filed. QUALITY Q25.
- **D3** — no claim on the terms counter; QUALITY Q26 (an operability claim needs a pass-sensitive
  counter); checklist pass counts measured at open (`CHECKLIST: 16/19`, red 6–7 environment, 18 the
  battery; seat ExecChecklistOpen) and at close (`## Measurement`).
- **D4** — temp parent `$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants` (plan
  commit); the both-target `--rev` run is the control receipt; the lane copy of the gate adds
  red-before cases for the four isolation mutants and the seven counter-suite survivors, an
  owner-marked stale-temp sweep and a parent-death guard (selftest 28 → 41; ExecGateIsolation). The
  counter used for C1 stays the plan-commit bytes.
- **D5** — retracted: the round-42 "errors stay 526, warnings 481 → 484" does not reproduce. Same-sha
  runs against today's tree read dfabe92 553/481, c9a084bf 554/481, e5ffcbe7 558/486 (seat
  ExecCiteBefore); cite-check counts follow the scanned tree as well as the script, so a before-side
  needs a receipt taken at the time.
- **D6** — operator ruling pending (L0 `9a00d09`); pin values in the existing block re-pinned only
  where a pinned file changed; no key, arm or semantics added.
- **D7** — `kimi-census.mjs`: secret directories are owner-pinned and reject permission bits beyond
  their mask (`oauth/` keeps 0755), two red-before cases, selftest 54/54, live census CLEAN before
  and after (ExecKimiLocksFloor). `locks/sessions` stays ungated by design; the unsourced-stub hole is
  QUALITY Q28 (the scan flags `corpus/knowledge/kimi-skills-plugins.md:173`, open).
- **D8** — wave-census WC32 (canonical-path refusal) red-before: fails with the refusal removed,
  passes with it (ExecCensusWitness); S045's decision line gains Q8 (appended correction in the
  round-42 lesson's `## Gate`).
- Carried (round-42 pre-registration (3)): the R11 registry cell reads 47 / "93 − 51 = 42" while the
  pinned tree has 41 members and `claims-check --row R11` 41 sections (ExecR11Recount); recorded in
  SCORECARD, cell text not rewritten.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| a late delivery recorded as a non-delivery | round-42 close `jj-lane.sh state` `untracked=3`; the round-42 report line "cancelled … unperformed" | the non-author closure's `git status`, not the lane | commit as late evidence (`0f4108bf`), correct in the report; Q27 — shown able to fail: a planted untracked `falsify/ProbeUntracked.md` is printed by the check (ScribeQualityCriteria) |
| a counter blind to the substance it claims | a zero-byte `.mjs` reads `operability=9` (round-42 closure); a copy with one checklist command replaced by `false` reads the same terms (ScribeQualityCriteria) | falsify seat CritC1Claim (late) | no terms claim; Q26; the claim's counter is the battery under K43, which reads 34/41 on the open bytes |
| one predicate stated three ways | round-42 plan:21, A1, `c9a084bf:scripts/gate-mutants.mjs:431` | closure re-count; seat CritPlanAmendments | K43 stated once and pinned by selftest cases; Q25 — shown able to fail: dropping any one clause reads 27/28 `VERDICT: FAIL` (ScribeQualityCriteria) |
| a witness that reads its own source | ExecCiteWitness patch `4d06a116…` added `readFileSync(SELF)` to keep the primary mapping observable | addendum A1 D-static (the same pattern flags J4 and the tripwire) | replaced by a primary-only child run before the measured commit; D-static at the measured commit is part of C1 |
| a flaky selftest case under host load | wave-census WC29 used 1 s / 2 s timeouts; UNSTABLE on F-M03/F-M08/F-M11 at load 60–78 (CritC1Target) | K43 (d) itself (the rerun disagreed) | WC29 timeouts 10 s / 20 s (a blocking FIFO read still fails); further load flakes named in `## Open limits` |

## Open limits

- The counter can be gamed by a self-inspecting suite (four routes found); A1's D-static is a
  pattern heuristic and a temp-path tripwire evades A1; the diff review is the backstop.
- K43 (d) reruns in the same temp tree; kills are load-sensitive (process-cap headroom of
  current user tasks + 256, and CPU contention); the confirmation roughly doubles mutant time.
- `gate-mutants` covers two of the ten gates; literal mutants go `nomatch` when their line is
  refactored; MutWitnessScan found 5 of 12 further verdict-path mutants surviving (next-round
  manifest candidates).
- cite-check counts (D5) depend on the scanned tree; the R11 cell is stale; Q28's hole is open.

## Measurement

- **C1 after.** Frozen counter (extracted from `0f4108bf`, sha256 `e24749e4…`) `--rev 84cb1d5d8e703aafd4f73d887ba4237692ff13f9`,
  first run at that commit (22:41:55Z, load ~13–27): `GATE_MUTANTS: CLEAN (mutants=43 killed=43
  frozen=41/41 drift=0 targets=2 …)` exit 0, every kill `confirm=same`, both `CONTROL_AFTER` PASS
  (`.ufo/waves/round-43/final/c1-measured-84cb1d5d.txt`). Re-derived by falsify seats ReRunC1Counter
  (CLEAN, rows identical, load 7→29), CritC1Claim (CLEAN, load 33.5) and CritPrimaryOnlySwitch (CLEAN
  twice). The before-side re-derived by ReRunC1Base (`SURVIVED … frozen=34/41` exit 1, rows identical).
- **Disclosed earlier runs on the same suite bytes** (cite-check `227f5645…`, wave-census `76447250…`):
  an L1 working-copy trial with the frozen counter at load ~48 read `GATE_MUTANTS: ERROR (… killed=40
  frozen=38/41 …) unstable=3` (V382, V385, V387 `confirm=differs`; scratch `trial1.txt`); two later
  working-copy runs with a diagnostic copy of the gate (not the frozen counter; it dumps both outputs of
  an unstable kill) read CLEAN. The bytes did not change between them; K43 (d) refused to count kills
  whose rerun disagreed under host load. Seat CritJunkAtM saw the same class once (a V387 timeout at
  load, ERROR exit 2, then CLEAN). The claim is judged on the measured run; the load sensitivity is an
  open limit, not hidden.
- **A1 at the measured commit.** `C1_DISCRIMINATORS: PASS` (D-static 0 added self-reads; D-null both
  targets exit 0), `final/c1-discriminators-84cb1d5d.txt`; re-run by ReRunDiscriminators (identical).
- **Junk controls.** J1, J2, J3 ERROR exit 2 (ExecJunkControls). Four junk routes read the counter CLEAN
  (J4, the self-digest tripwire, CritC1Target route A, CritA1Addendum J4b); A1 rejects J4 and the
  tripwire; route A, J4b and CritJunkAtM's junk pass A1 and are caught only by a diff review.
  CritA1Addendum's review falsifiers D-equiv and D-path (scratch, not rules) reject all of them and pass
  84cb1d5d.
- **Diff reviews (the backstop).** ReviewCiteWitnessDiff `genuine` (no own-source read, no path, env or
  timing channel; the primary-only child is honest and load-bearing); ReviewCensusWitnessDiff `genuine`
  (every new verdict quantity is a function of `results`).
- **Cost.** cite-check `--selftest` median 1111 ms at e5ffcbe7 and 1111 ms at 84cb1d5d (5 interleaved
  runs each, ReRunCiteSelftestTime; CritNoHarm2 10 pairs, median difference +88 ms in noise): the
  round-41 cost trade is not deepened. wave-census `--selftest` 2756 → 2550 ms (noise). gate-mutants
  `--selftest` 593 → 1019 ms (23 → 41 cases), an unscored cost of the D4 cases.
- **D3 pass-sensitive diagnostic.** `node scripts/surface-probe.mjs --checklists` at the lane checkout of
  84cb1d5d: `CHECKLIST: 19/19 pass` exit 0 (`final/checklist-84cb1d5d.txt`, item 18 PASS). At round open
  a scratch clone read 16/19 (items 6–7 lack the fleet reports directory in a clone; item 18 the
  battery). The environments differ, so this is not a counted before→after.
- **Proxy.** `PROXY: MATCH (A=11 C=19 operability=9; … C2=96/96 coverage=10; …; pins=6 match)` exit 0;
  A 10 → 11 is the committed probe script `.ufo/waves/round-43/probe/c1-discriminators.sh`, not
  claimed; the integer stays 9.

## Falsify wave (35 seats against 84cb1d5d) — dispositions

- **Reproduced:** C1 after and before (three and one re-runs), A1, cite-check timing, R11 recount (41/41
  members and sections), D5 counts, kimi-census D7 (live CLEAN, red 2/2), gate selftest 41/41 with
  11/11 new cases red under their mutants, K43 functions byte-identical, timeline ordered (0 violations),
  wave census of round 43 (69 seats, 38 attack) matching the registries.
- **Fixed after the measured commit (close commit):** the S046 word count (22 → 24) and three more
  counts, Gate URLs added (ReviewSourcesRows), the SCORECARD correction quote (ReviewCorrectionsR42), the
  S047 erratum above (ReopenS047), and the primary-only switch guarded to selftest depth ≥ 1 with
  `INJECT_FAIL=1` (CritPrimaryOnlySwitch's tested guard; the frozen counter read CLEAN twice on it in the
  seat's clone).
- **Open, named (next-round candidates):** (1) the witness takes over the verdict and exit whenever it
  counts a failure, so single-token faults on the new lines survive K43 — WA wave-census
  `if (failures > 0) return 1` → `return 0`, WB its `'FAIL'` → `'PASS'`, WC cite-check witness
  `return 1` → `return 0` (CritC1Claim); the frozen 41 measured the primary lines only, so C1 shows the
  primary faults are now caught, not that the exit path has no single point; (2) a run can print both
  `VERDICT: PASS` and `VERDICT: FAIL` and K43 (c) counts it (CritC1Claim, CritA1Addendum); (3) WC24 no
  longer observes the final verdict line (ReviewCensusWitnessDiff F1); (4) the `primaryExit` arrow
  wrapper exists to keep a frozen literal applying (CritC1Claim, overfitting signal); (5) counter
  gameable by self-inspecting suites and harness-key detectors (four routes; A1 a heuristic); (6)
  gate-mutants new code: four surviving literals (pid floor, walk depth, guard period, sweep owner;
  MutGateIsolationNew); (7) kimi-census `oauth/` has no own mode/owner arm (MutKimiFloor, 5 survivors);
  (8) reject-reason precision (ReopenRejects: S049's "no method" and Q2 clause, S050 "unanchored" and
  S034→S023, S051 "no revision", S052 "answers disagree" are overstated; every reject still stands);
  (9) QUALITY Q25, Q26, Q28 fail on the lane's own round-43 state (ReviewQualityQ25Q28; recorded in
  QUALITY as in force from round 44); (10) calibration: 14 self-assessment mismatches (CritCalibration).
