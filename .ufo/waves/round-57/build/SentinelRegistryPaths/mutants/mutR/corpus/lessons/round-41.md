# Round 41 — cite-check pins the 16 unpinned verdict conditions; a census of committed swarm evidence

Source: S018 (MAST, re-opened), S038 (the origin wave producer `scripts/ufo-swarm-wave.mjs` at the pin, opened this round),
S035 (re-opened), the round-40 non-author closure (`corpus/lessons/round-40-verifier-spotcheck.md`,
routed defects R40-1 to R40-7) and the pinned upstream revision
31c465f15669f744848bd9f5d56191c5085670f7. Round open: lane a58b7f72afc1eb44b37e438a2f8b212c658874e5.
Plan and frozen counters: `.ufo/waves/round-41/plan.md` (commit 34fccc17).

## Claims

- **C1 operability.** `scripts/cite-check.mjs` now has a failing case for each of the 16 named
  single-condition (drop-to-constant) mutants of the verdict, render and exit conditions
  that round 40's scout found unpinned (`.ufo/waves/round-40/build/ScoutCiteVerdict.md`,
  `unpinned=16`). Eleven hermetic cases were added (64 → 75): a warn-only fixture in default and
  `--strict` mode, the `citeCheck` map on a failing fixture, both text environment labels, the
  process exit contract through a child of the same file (0, 1, 2 for an empty scan set, 2 for zero
  resolved citations, 64 for an unknown argument), and two cases where the suite observes itself:
  a child `--selftest` with one injected failing case must print the failure, end `VERDICT: FAIL`
  and exit 1, in text and in `--json`. The injection variable is read only inside `selfTest()`;
  the child skips the two self-observation cases, so it cannot recurse.
  Counter (committed in cb2d8d09 before its first run): `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`.
  Before, at a58b7f72: `CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS`
  (only `resolved>0`, pinned in round 40, was killed). After, at 68db3419:
  `survived=0/16 nomatch=0 crash=0 control=PASS`.
  Scope of "killed" (the plan's frozen definition, the per-case reading of S034): at least one case
  failed while the mutant was active. For 13 of the 16 the run exits non-zero with
  `VERDICT: FAIL`; `suite-exit-text` exits 0 but prints `VERDICT: FAIL` (14 of 16 show a failure
  in the exit code or the verdict line; corrected in attempt 2 from "13", verify seat CritC1Final).
  For the two others (suite-group-verdict, suite-any-fail) the parent run exits 0 with
  `VERDICT: PASS`, and the failure is visible only as `FAIL ` case lines and `73/75`; checklist
  item 2 ("exit 0 + `VERDICT: PASS`") would accept those two
  (found by the falsify seat CritC1Statement). A suite cannot pin its own aggregator through an exit
  code the same aggregator computes; a reader must check the `FAIL ` lines and the `n/m` count.
- **C2 capability `wave-census`.** `scripts/wave-census.mjs` reads a round's committed
  `*-dispatch.json` payloads and the report files their `Report:` trailers name. Counter
  (committed in 27592977 before the instrument): `.ufo/waves/round-41/probe/wave-recount.sh.txt`.
  Before, at 27592977: `RECOUNT_MISMATCHES=7` (no instrument), `CAPABILITY_ROWS=1`, both `--expect`
  calls exit 1 (module not found). After: `RECOUNT_MISMATCHES=0` over the seven payloads of rounds
  38–40, `CAPABILITY_ROWS=2`, `--expect build:mutation-tester=4` exit 1 and `=3` exit 0, at 4e58bb0e
  (`.ufo/waves/round-41/final/wave-recount-measured-4e58bb0e.txt`) and at the final tip
  (`.ufo/waves/round-41/final/wave-recount-final.txt`, at fae386aa, committed in attempt 2).
  Sourced on S038.
- **Axis accounting (falsify seat CritSeparability).** The two counters verify separately (C1 alone
  at 68db3419: `survived=0/16` with the C2 counter at its before values; C2 alone on a scratch
  revision: `RECOUNT_MISMATCHES=0` with the C1 probe at `15/16`). But C2's per-axis verdict also
  lands on operability (A 8 → 9, C 15 → 17), so under AXES.md's distinct-axis rule the round is one
  operability move plus one capability row, the shape round 34 recorded for `sources-registry`.
- **Falsify repairs to C2 (after 4e58bb0e).** The falsify wave found that a resume-only payload
  (`taskCall` null, which S038 documents) failed closed, a mixed spawn and resume payload read
  `REGISTRY_MISMATCH`, a directory or symlink named `<Name>.md` counted as a report, an
  under-declared or misspelled `--expect` was not pinned, and `--expect` was not round-scoped.
  The instrument now reads `resumeSends` (`resumed=`), counts only regular files, treats an
  unknown role as `EXPECT_UNKNOWN`, accepts `attack` as the attack total and
  `<round>/<wave>:<role>=<n>`; selftest 12 → 20 (WC13–WC20). The C2 counter reads the same
  values after the repair. Attempt 1 then left three more repairs uncommitted and untested (a
  `Report:` path with a `..` segment no longer resolves outside the round, a task without a string
  name and agent fails closed, any read error exits 2 instead of 1); attempt 2 pinned each with one
  case (WC21–WC23, selftest 23/23), and each case fails when its repair is reverted
  (`.ufo/waves/round-41/final/a2-census-repair-mutants.txt`: 3/3 killed).
- **Verify-wave repairs to C2 (attempt 2, after fae386aa).** Three verify mutation seats found
  surviving mutants in this round's own instrument: 7 of 21 on `--expect` (MutCensusExpect), 10
  of 23 on the finding logic (MutCensusFindings), and four on the suite's own verdict lines
  (CritMistakeClasses: the census suite had the blind spot C1 fixed in cite-check). Three cases
  were added: WC24 runs a child selftest with one injected failure and records its own result
  outside `check()`; WC25 pins six `--expect` edges; WC26 pins ten finding-logic edges. Selftest
  23 → 26; the 20 named survivors (M14 not re-measured) are all killed
  (`.ufo/waves/round-41/final/a2-census-survivor-mutants.txt` 10/10,
  `.ufo/waves/round-41/final/a2-census-findings-mutants.txt` 10/10). No measured C2 value moves:
  the cases touch only the selftest.

## Round shape and the §3 floor

- The validated 34-seat build payload (`.ufo/waves/round-41/build-dispatch.json`: reviewer 9,
  scout 8, critic 7, executor 4, mutation-tester 3, scribe 2, connector 1) was never dispatched:
  the seat gate did not grant it in 3600 s (`live_estimate=85 cap=85` at 17:01:58Z). Never
  dispatched is not dead: 0 seats spawned, 0 dead.
- Orchestrator notes (17:02Z, 17:10Z): the route for executor, scribe, mutation-tester, labrat,
  simplifier and distiller seats was down for the leg (seats die at spawn); the gate had counted
  phantom seats and its cap was compensated; no more seats in those roles this leg; live roles are
  reviewer, critic, scout and connector.
- So the §3 L2 floor (3 executor, 1 scribe, 1 scout, 1 connector, 1 reviewer, 1 critic in one
  batched call) was not met inside wave 1: executor 0 of 3 and scribe 0 of 1 in attempt 1. This is
  a conformance defect, stated here. The attempt-2 verify wave carries every floor role in one
  batched call, but it is not wave 1, so it does not repair the floor (verify seat CritRoundShape).
  The L1 holds the planner seat in both attempts.
- The L1 built and mutation-probed both claims itself (commits cb2d8d09, 68db3419, 27592977,
  4e58bb0e); no other executor or mutation-tester worked on them. Build items done by the L1:
  ExecCiteMutProbe, ExecCitePins, ExecWaveCensus, ScribeLessonMistakes. Undone: ExecAnchorCaps
  (R40-4), MutCiteOpenAudit (its independent before value is replaced by the falsify seat
  ReProbeC1), MutCiteSeverity, MutProxyStanza, ScribeWaveEntry (no new knowledge file). Six build
  items were re-cut into falsify items of the same purpose (ReviewHonestReMeasure,
  ReviewK2S035, CritClaimSizing, ConnSiblingOverlap, ScoutMAST, CritC2Capability); the rest were
  recon for code the L1 then wrote and were folded into falsify attacks on that code.
- One v1 falsify wave of 34 seats ran (critic 16, reviewer 13, scout 4, connector 1); 27 returned
  a report (one of them misrooted, moved in), 7 died in the attempt-1 restart with none.
- **Attempt 2.** Attempt 1 ended in an omp process restart at 17:26Z. The 7 falsify seats with no
  report (ReviewC1Hermetic, CritCensusAdversarial, ReviewR40Dispositions, ReviewHonestReMeasure,
  CritAnchorCapsOpen, ReviewLesson, ReviewSeatGateRecord) are dead and not replaced. The attempt-2
  L1 committed the 13 leftover paths in fae386aa and dispatched a third v1 payload, the verify wave
  (`.ufo/waves/round-41/verify-dispatch.json`: reviewer 11, executor 7, critic 7, mutation-tester
  6, scribe 3, scout 2, connector 1, sentinel 1), granted and dispatched at 18:12:38Z as one task
  call; all 38 returned a report (`wave-census --round 41`: verify `reports=38/38`), 0 dead, 0
  safety-filter holds, gate released 18:55:02Z. A third v1 wave is none of the addendum's shapes (two v1 waves, one
  v2 wave, or a residual call of at most 8 reviewer or critic seats): it is a deviation caused by
  the restart, named here for the judge (CritRoundShape).
- Round total: 72 spawned seats (build 0 + falsify 34 + verify 38), within the bound of 100. The
  census counts payload seats and reads `seats=106` for round 41, because it also counts the 34
  build seats that never spawned. Live counts come from `.ufo/waves/round-41/evidence-seat-gate.txt`.

## What the census taught (rounds 38–41, measured at 4e58bb0e)

- A payload proves validation, not dispatch. Round 39 committed two validated payloads (46 and 37
  seats): the 46-seat build request was cancelled at the seat gate when the freeze message
  arrived, and the 37-seat falsify request timed out (`exit 3`), so the census reads
  `reports=0/46` for the build payload. Round 41's own 34-seat build payload never spawned either
  (`reports=0/34`).
- Report presence is shared when a residual call reuses item names: round 39's eight residual
  seats reused eight falsify trailers and wrote into `falsify/`, so the falsify payload reads
  `reports=8/37` and the round line `reports=16/91` counts those eight files twice.
- Round 40's payloads carry 45 attack seats out of 67 (reviewer, critic, mutation-tester). The
  round-40 report reads "attack roles 37/67 = 55%". A count that fits the committed files (an
  inference by the falsify seat CritCensusLessonFacts; the report states no formula): the 36
  attack seats that returned reports plus the one sentinel, that is 45 + 1 − 7 dead (per the round-40 seat-gate record, not the census)
  mutation-testers − 2 cancelled reviewers. The census counts payload seats, not returned ones.
- Round 38's falsify directory holds four `*-supplement.md` files no task names (`STRAY_REPORT`).
- Why an absent report cannot say why (falsify scout ScoutOmpSpawnFailure, read from the installed
  omp 18.12.6 binary, own work, no source row): "Background job limit reached" is thrown in job
  registration before any job record exists, and "No model selected" is thrown at the start of the
  seat's prompt path; the task tool returns only tool-result text. Neither failure writes a file a
  census of committed evidence could read; only the L1's seat-gate prose records them.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| calibration — a seat-gate record stated a role count from memory: "four mutation-tester seats returned results" in wave 1, where the payload holds three (R40-6) | `.ufo/waves/round-40/evidence/seat-gate.txt` item 4; `.ufo/waves/round-40/build-dispatch.json` | the round-40 closure, by hand (no instrument) | `wave-census --expect`: `--round 40 --expect build:mutation-tester=4` exits 1 (`EXPECT_MISMATCH … payload=3`), `=3` exits 0 — shown able to fail on the real slip (`.ufo/waves/round-41/final/wave-recount-measured-4e58bb0e.txt`: `EXPECT_4_EXIT=1 EXPECT_3_EXIT=0`). The correction: wave 1 of round 40 had three mutation-tester seats (MutCiteGuard, MutAnchorSurvivors, MutKimiCensusArms). Instance fix only (verify seat CritMistakeClasses): `--expect` counts payload seats, not returned ones, so `--round 40 --expect falsify:mutation-tester=7` reads `CLEAN` although all 7 of those reports are absent; a count of returned seats is still typed by hand |
| recurrence — a non-author closure file lands without a `corpus/README.md` row, so the next open reads `C2_TOTAL_DRIFT` and `coverage` 9 against 10; at least the fourth time (rounds 35 and 36 read `declared=77 computed=78` and `79/80`, then round 40 and round 41; corrected in attempt 2 from "second time", verify seat CritMistakeClasses) | `.ufo/waves/round-41/open/receipts.txt` (`C2_total declared=90 computed=91`, checklist 14/15) | `proxy-check` (fires correctly) | row added at open in 34fccc17 (R40-7). The mechanism recurs by construction for the round-41 closure file; no written rule makes the next L1 add the row at open. Teaching the proxy to skip closure files would re-charter the frozen `C2_total` term, so it is not done |
| suite blind spot — a test suite with no case that observes its own verdict machinery: the four suite-verdict mutants survived because the suite was its own observer | `.ufo/waves/round-41/final/cite-mutants-open-a58b7f72.txt` (suite-group-verdict, suite-any-fail, suite-exit-json, suite-exit-text survived); the same class in this round's own `scripts/wave-census.mjs` at fae386aa: four verdict-line mutants survived at 23/23 (verify seat CritMistakeClasses) | none until round 40's scout (cite-check); the attempt-2 verify wave (wave-census) | cite-check: the injected-failure child run (C1), all four killed at 68db3419. wave-census: WC24, a child selftest with one injected failure whose result WC24 records outside `check()`; the four verdict-line mutants are killed (`.ufo/waves/round-41/final/a2-census-survivor-mutants.txt`, V194, V382, V385, V387; V382 and V387 leave the parent exit 0 and show as a `FAIL  WC24` line) |
| misroot — a falsify seat of attempt 1 wrote its report at the fleet root (`/home/vgpnk/Projects/shokunin/.ufo/waves/round-41/falsify/ReviewCensusCode.md`) instead of the lane, so the census read it absent | fleet `git status --porcelain` at attempt-2 open (`?? .ufo/waves/round-41/`); `wave-census --round 41` → `absent: … ReviewCensusCode …`; sweep receipt `.ufo/waves/round-41/final/a2-misroot-sweep.txt` | the addendum's misroot sweep (fires correctly; the wave context already carried the absolute-path sentence, so the context alone does not catch it) | moved byte-exact into the lane at 17:45Z (`.ufo/waves/round-41/falsify/ReviewCensusCode.md` sha256 `778a35eec329296893fc9ed5ac6be0c9dbe40df3901132607bbfb93e1b2f3983`, `cmp` equal), fleet copy and its empty directories deleted; the census now reads it present; verify seat ScoutFleetMisroot found 0 other kumitate misroots. The class recurs: this lane's round 35, and phase 1 at kama r11, tsukuroi r12, tabi r15, mado r16 |
| untested repair — attempt 1 changed `scripts/wave-census.mjs` after the falsify wave (three repairs) with no case that fails without them (a separate class rode with it: work left uncommitted across a process restart; not fixed here) | `git diff` at attempt-2 open (5 tracked paths); selftest still 20/20 | no rule; the attempt-2 L1 by hand (`git diff` at open, then reverting each repair) | WC21–WC23, each shown able to fail: reverting its repair turns the suite to 22/23 `VERDICT: FAIL` (`.ufo/waves/round-41/final/a2-census-repair-mutants.txt`, measured on the working copy that became fae386aa) |

## Gate — admits and rejects

- **Admit S038** (own-work, tier A): `scripts/ufo-swarm-wave.mjs` in the pinned clone at
  31c465f15669f744848bd9f5d56191c5085670f7, opened read-only 2026-10-22, file sha256
  1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a. Located quote, `:51`:
  "ufo-swarm-wave-dispatch-v1 — the exact single `task` call payload ({context, tasks} — spawn
  lanes only, null when the wave resumes only)". Used by `scripts/wave-census.mjs` and this lesson.
- **New row, logged:** S038 new → `mined` (used-by `scripts/wave-census.mjs`, `corpus/lessons/round-41.md`).
- **Re-open S018** (MAST, Cemri et al., arXiv 2503.13657 v3; status `queued` → `mined`, used-by
  `—` → `corpus/lessons/round-41.md`): opened 2026-10-22T17:14Z by the falsify scout ScoutMAST at
  https://arxiv.org/html/2503.13657v3 (HTTP 200). Located quote, FM-3.2 "No or incomplete
  verification": "(partial) omission of proper checking or confirmation of task outcomes or system
  outputs". Used here: the R40-6 slip (a seat count written from memory) is an FM-3.2 instance,
  and `wave-census --expect` is the check that was omitted; MAST Appendix J (bullet "Some failures
  are non-fatal") says such verification failures "appear frequently even in successful runs", so
  the slip did not make round 40 fail. Locator corrected in attempt 2 from "§5.1": verify seat
  ReviewS018Reopen re-opened v3 by curl (HTTP 200, the same bytes as ScoutMAST; hash in `.ufo/waves/round-41/verify/ReviewS018Reopen.md`) and
  found the sentence once, in Appendix J, and not in §5.1; the FM-3.2 quote is verbatim.
- **Re-open S035** (no status change, `mined` → `mined`): the front matter still reads
  `name: kimi-webbridge` and `version: "2.0.26"` (2026-10-22, read-only). The K2 section of
  `corpus/knowledge/kimi-skills-plugins.md` now names S035 (R40-5).

## Routed defects R40-1 to R40-7

| defect | disposition | evidence |
|---|---|---|
| R40-1 registry row lacks `--open` | fixed: the `anchor-truth` row names `--open REV`, what it adds and its verdict map | `SKILL.md` `## Gate registry` |
| R40-2 honest-edit re-measure at the AT46 gate; in-round review refused under `--open` | the limit is recorded here: under `--open`, a review record committed after the open revision cannot bind, so an honest review written in the round reads `REVIEW_UNBOUND` (`.ufo/waves/round-40/build/CritC1Design.md` BEN_NEWREVIEW). The 17-recipe re-measure was the falsify item ReviewHonestReMeasure; that seat died in the attempt-1 restart with no report and is not replaced, so the re-measure is **not done** this round | `## Open limits` below |
| R40-3 cite-check receipt at the tip | receipt committed with its class: errors=545, 33 `REV_UNKNOWN`, of which 1 is a commit inside its own row's URL (S036) and 32 are not. That receipt was taken before the measured commit; the live count then grew 545 → 549 (4e58bb0e) → 551 (fae386aa), all six new errors in this lesson (five bare file names, one hash read as a content pin; verify seat CritNoHarmTip); attempt 2 rewrote them and the count is back to 545 at the attempt-2 tip | `.ufo/waves/round-41/final/cite-receipt-r40-3.txt`; `.ufo/waves/round-41/final/a2-cite-check-tip.txt` |
| R40-4 anchor-truth resource caps | not done this round: the executor route was down for the leg and the L1 kept scope on C1 and C2 | `## Open limits` |
| R40-5 S035 in K2 | fixed | `corpus/knowledge/kimi-skills-plugins.md` K2 section source note |
| R40-6 seat-gate count | corrected in `## Mistakes`; a declared count can now be checked against the payload with `wave-census --expect` (a person still types the prose number in; the census reads no prose) | above |
| R40-7 README row | fixed at open (34fccc17) | `corpus/README.md` |

## Open limits (measured, not fixed)

- The 14 unpinned severity decisions in `.ufo/waves/round-40/build/ScoutCiteVerdict.md` section B are outside C1.
- `wave-census` cannot tell a dead-at-spawn seat from a cancelled or never-dispatched one, and
  cannot see a safety-filter hold; it counts payload seats.
- R40-4 stays open: no cap on the number of `.ufo/waves/round-*/anchor-reviews.json` registries read under `--open`,
  and no size check of the open pin before `git show`.
- Under `--open`, an honest review recorded in the round reads `REVIEW_UNBOUND` (R40-2).
- Live Kimi drift found this round, not caused by the lane: `~/.kimi-code/locks` (a directory,
  mode 700, created 2026-10-22 13:53:33 -0300, one child) appeared after the round-open census
  read CLEAN at 16:00Z; `node scripts/kimi-census.mjs` now reads `KIMI_CENSUS: DRIFT (UNLISTED
  locks)` and the checklist reads 16/17 for that item alone. The proxy still reads `K=52/52`.
  Declaring the member is a K1 registry change for round 42.
- Width beyond the counter (falsify seat CritC1AltOperators): with a second operator on each of the
  16 conditions, one survives (`suite-any-fail` with `some` → `every`: a failing second group is
  hidden under `--selftest --integrations`); five further width mutants survive (`kind === 'OK'`
  → `severity === 'note'`, `warn > 0` → `warn >= 0` under `--strict`, `resolved > 0` →
  `resolved > 1`, and two first/last-group variants). The warn-only case's comment says one
  resolved citation; it measures `resolved=2` (two OK findings per cited path and line).
- Two older survivors outside the 16 (sibling lane tameshi's round-26 mutation case, re-run by the
  falsify connector at 4e58bb0e, 75/75 under each): the out-of-range line check (`> n` → `> n + 1`)
  and the content-pin compare (`startsWith` → `includes`).
- `scripts/wave-census.mjs` has no `kumitate-proxy-v1` pin (a third `PIN_UNPINNED` warning, like
  `anchor-truth` and `sources-check`; the parent-frozen v1 key set is not widened here).
- The census counts a report as present when it is a non-empty regular file; it does not detect a
  `STATUS: started` stub (sibling lane mori's settlement scan does). On rounds 38–41 the eight
  payload report counts agree with mori's scan (falsify connector).
- Provenance of `~/.kimi-code/locks` (falsify scout ScoutKimiLocks, shape only): Kimi 2.3.0
  self-updated at 16:48:04Z; its session lock service creates `locks/sessions` (mode 0700) on first
  run; born 16:53:33Z. Upstream feature, not a stray.
- Self-observation guard (falsify seat CritInjectionBypass): at 4e58bb0e a changed literal in the
  `=== '1'` guard made the child recurse without limit (about 29 nested processes, 2 GB in 8 s).
  After the falsify wave the child marker is any value of the variable, and only `1` injects the
  failure, so a changed injection literal no longer recurses (`KUMITATE_CITE_SELFTEST_INJECT_FAIL=2` →
  `73/73`, two SKIP). Corrected in attempt 2 (verify seat MutCiteGuardTip, 21 guard mutants, 6
  killed, 12 survived, 3 recursed): a change to the outer marker test (`!== undefined` →
  `=== '2'`, one site) still recurses without limit (9 processes and 626 MB in 2 s; orphans kept
  multiplying after the direct child was killed), so the code comment's "a changed literal cannot
  recurse" holds for the inner literal only; and two skip-bypass mutants that were killed at
  4e58bb0e (`73/74`, `VERDICT: FAIL`) survive at 5320e0da and later (`73/73`, `VERDICT: PASS`), a
  trade made by the guard change. The frozen C1 counter has no anchor in the guard block, so C1's
  16 values are unaffected; the guard is round-42 work (own process group, a marker the caller cannot inherit).
  Still open: a mutant that skips both self-observation cases unconditionally
  reads `73/73 VERDICT: PASS` and survives, because skipped cases leave the ran count and the frozen
  counter does not treat a `SKIP` line as a kill. Children are not spawned in their own process
  group, so a hang is killed only at the direct child.
- Set width (falsify seat CritC1SetWidth, mutants at 4e58bb0e): beyond the 16 there are 23 more
  verdict, exit or suite conditions; 11 are killed, 3 are equivalent, and 7 survive: the `--help`
  exit code, the flag-followed-by-a-flag check, `record()` counting a throwing check as PASS, the
  two integration-group gates (an `--integrations` run with 0 cases reads `VERDICT: PASS`), the
  hermetic group selection (`--selftest` with no cases reads `VERDICT: PASS`), and the
  unreadable-document skip (label only). These are outside C1 and stay open. The other 2 of the 23
  crashed or timed out, which is not a kill (verify seat ReviewA2Commit). Also from that seat:
  `wave-census` labels every non-FailClosed exception `read error:`; the exit code 2 is right, the
  label over-names internal errors.
- C2 counter weakness (falsify seat ReRecountC2): the frozen recount script prints
  `RECOUNT_MISMATCHES=0` even when both listings are empty (jq missing, no round folders); it does
  not check that each side has 7 rows. At the measured and final revisions both listings hold 7
  rows (visible in the committed receipts), so the zero is real there; the counter itself is not
  changed after its data. The seat's own python recount agrees on seats, attack seats, per-role
  counts and report presence for all 336 payload seats of rounds 38–40.
- Environment dependence (verify seat CritC1Final): with `KUMITATE_CITE_SELFTEST_INJECT_FAIL` set
  to any value other than `1` in the calling shell, the unmodified tip skips both
  self-observation cases, reads `73/73 VERDICT: PASS`, and the frozen C1 counter reads
  `survived=4/16`. The C1 values hold with the variable unset (the SKILL row now says so); a code fix
  (a marker the caller cannot inherit) is round-42 work. `wave-census` WC24 has the same shape with
  `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL`.
- `proxy-check --strict` exits 1 on warnings alone at the tip: three `PIN_UNPINNED` warnings
  (`wave-census` is the third; two at open). The parent-frozen v1 key set is not widened here, so
  this is a recorded trade for the judge, not a repair (verify seats CritNoHarmTip, ExecProxyNoHarm).
- Cost (verify seat CritNoHarmTip, three runs each): `cite-check --selftest` 0.17 s → about 0.85 s
  (the child runs of C1); `surface-probe --checklists` 14.7 s → 15.8 s in a single run.
- `--expect` survivors after WC25 (verify seat MutCensusExpect, 14/21 killed at fae386aa): WC25
  kills M02, M03, M04, M10, M12 and M13 (`.ufo/waves/round-41/final/a2-census-survivor-mutants.txt`);
  M14 (role knowledge judged on matching waves only) is not re-measured and stays open.
- Report-presence survivors (verify seat MutCensusReports, 13/20 killed at fae386aa, 2
  equivalent): five latent gaps with a fixture witness each and byte-identical output on rounds
  38–41 — a greedy `Report:` capture with two paths on one line, a whole-string `..` test that
  would also reject `x..y.md`, `lstat` → `stat` (a symlinked report would count), an object-valued
  `resumeSends` (crash, exit 2), a numeric resume name. Not pinned this round.
- ReviewCensusCode ledger (verify seat ReviewCensusCodeLedger, all 20 attempt-1 findings re-run at
  fae386aa): fixed 7 (H1, H2, M1, M3, M4, M7, L4), recorded 1 (H3, payload not dispatch), and 12
  neither fixed nor recorded until now, recorded here: M2 (a v1 envelope without counts or registry
  reads CLEAN), M5 (report paths outside `.ufo/waves` count absent silently), M6 (an unscoped
  `--expect` stays silent when one requested round lacks the wave), D1, D3 and D4 (docstring:
  "merged registry", three of five exit-2 triggers, limits unstated), L1 (a dispatch file whose
  name ends in upper-case `.JSON` is dropped silently), L2 (duplicate `--round` counted twice), L3 (duplicate seat names counted
  twice), L5 (`Reviewer` is not an attack seat), L6 (upper-case wave unreadable to `--expect`, exit
  64), L7 (EACCES labelled "does not parse").
- C1 counter kill rule (verify seat MutCiteCounterSkip, fooled 1/3): the frozen rule counts a kill
  on `exit != 0`, a `FAIL ` line, `VERDICT: FAIL` or `p < n`, and never asks why. A two-part mutant
  (skip the `resolved>0` case and widen the `n/m` denominator to all cases) reads
  `survived=0/16`, byte-identical to the honest run, with `fail_lines=0`. At fae386aa every one of
  the 16 kills rests on at least one real `FAIL ` line, so C1 stands; a round-42 counter should
  require `fail_lines > 0`.
- Path safety (verify seat SentinelCensusPaths, verdict unsafe, at fae386aa): the census has no
  `realpath` confinement, so a symlinked report directory, dispatch file or round directory reads
  outside `--root` (an outside file counts as a present report; its `.md` names leak as
  `STRAY_REPORT`); a FIFO named `*-dispatch.json` hangs it; no size caps (a 256 MB payload peaks
  near 800 MB RSS); `RE_REPORT` is not anchored to the trailer (the first `.ufo/waves/*.md` after
  the first `Report:` word wins; 15 real tasks in rounds 38–40 mention another path first, safe
  today by data accident); a task name with a newline can forge output lines; `--round 7 --round
  007` double-counts. The census reads committed lane bytes written by the lane's own seats, so
  these are hardening items for round 42 (reuse `anchor-truth.mjs` `realpathSync` confinement and
  `readCapped`), not fixed here.
- MutCensusExits (20/22 killed at fae386aa): its two survivors, M19 (selftest exit constant) and
  M22 (the name half of the string name/agent check), are killed at the attempt-2 tip by WC24 and
  the widened WC22 (`.ufo/waves/round-41/final/a2-census-exits-mutants.txt`, 2/2).
- Attempt-1 falsify findings neither fixed nor recorded at fae386aa (verify ledgers, full tables in
  `.ufo/waves/round-41/verify/`): C1 reports 32 findings, 11 dropped (ReviewLedgerC1Reports; the
  seven ReviewR403Receipt items are now answered by the R40-3 row above); C2 reports 45 findings, 15
  dropped and 4 partial (ReviewLedgerC2Reports: nine ReviewRegistryRow registry-row details for
  anchor-truth, wave-census and cite-check, older-round stray notes, 11 CritCensusSelftest mutants
  still surviving at fae386aa before WC24–WC26); round-level reports 69 findings, 12 dropped
  (ReviewLedgerRoundReports: sibling should-cites, kimi #4328 takeover note, three ScoutMAST
  census notes). R40-3 and the row-400 selftest wording, named by several ledgers, are answered
  above. The rest are recorded here by pointer, not fixed.
