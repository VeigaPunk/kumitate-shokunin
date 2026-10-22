# Round 41 — cite-check pins its verdict conditions; a census of committed swarm evidence

Source: S038 (the origin wave producer `scripts/ufo-swarm-wave.mjs` at the pin, opened this round),
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
  failed while the mutant was active. For 13 of the 16 the run also exits non-zero or prints
  `VERDICT: FAIL`. For the three suite-aggregation mutants (suite-group-verdict, suite-any-fail,
  suite-exit-text) the parent run exits 0 and the failure is visible only as `FAIL ` case lines and
  `73/75` or `74/75`; checklist item 2 ("exit 0 + `VERDICT: PASS`") would accept two of them
  (found by the falsify seat CritC1Statement). A suite cannot pin its own aggregator through an exit
  code the same aggregator computes; a reader must check the `FAIL ` lines and the `n/m` count.
- **C2 capability `wave-census`.** `scripts/wave-census.mjs` reads a round's committed
  `*-dispatch.json` payloads and the report files their `Report:` trailers name. Counter
  (committed in 27592977 before the instrument): `.ufo/waves/round-41/probe/wave-recount.sh.txt`.
  Before, at 27592977: `RECOUNT_MISMATCHES=7` (no instrument), `CAPABILITY_ROWS=1`, both `--expect`
  calls exit 1 (module not found). After: `RECOUNT_MISMATCHES=0` over the seven payloads of rounds
  38–40, `CAPABILITY_ROWS=2`, `--expect build:mutation-tester=4` exit 1 and `=3` exit 0.
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
  `<round>/<wave>:<role>=<n>`; selftest 12 → 17 (WC13–WC17). The C2 counter reads the same
  values after the repair.

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
  batched call) was not met: executor 0 of 3 and scribe 0 of 1 for the whole round. This is a
  conformance defect, stated here. The L1 holds the planner seat.
- The L1 built and mutation-probed both claims itself (commits cb2d8d09, 68db3419, 27592977,
  4e58bb0e); no other executor or mutation-tester worked on them. Build items done by the L1:
  ExecCiteMutProbe, ExecCitePins, ExecWaveCensus, ScribeLessonMistakes. Undone: ExecAnchorCaps
  (R40-4), MutCiteOpenAudit (its independent before value is replaced by the falsify seat
  ReProbeC1), MutCiteSeverity, MutProxyStanza, ScribeWaveEntry (no new knowledge file). Six build
  items were re-cut into falsify items of the same purpose (ReviewHonestReMeasure,
  ReviewK2S035, CritClaimSizing, ConnSiblingOverlap, ScoutMAST, CritC2Capability); the rest were
  recon for code the L1 then wrote and were folded into falsify attacks on that code.
- One v1 falsify wave of 34 seats ran (critic 16, reviewer 13, scout 4, connector 1). Round total:
  34 spawned seats. Live counts come from `.ufo/waves/round-41/evidence-seat-gate.txt`, not from
  the census, which counts payload seats.

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
  attack seats that returned reports plus the one sentinel, that is 45 + 1 − 7 dead
  mutation-testers − 2 cancelled reviewers. The census counts payload seats, not returned ones.
- Round 38's falsify directory holds four `*-supplement.md` files no task names (`STRAY_REPORT`).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| calibration — a seat-gate record stated a role count from memory: "four mutation-tester seats returned results" in wave 1, where the payload holds three (R40-6) | `.ufo/waves/round-40/evidence/seat-gate.txt` item 4; `build-dispatch.json` | the round-40 closure, by hand (no instrument) | `wave-census --expect`: `--round 40 --expect build:mutation-tester=4` exits 1 (`EXPECT_MISMATCH … payload=3`), `=3` exits 0 — shown able to fail on the real slip (`.ufo/waves/round-41/final/wave-recount-*.txt`). The correction: wave 1 of round 40 had three mutation-tester seats (MutCiteGuard, MutAnchorSurvivors, MutKimiCensusArms) |
| recurrence — a non-author closure file lands without a `corpus/README.md` row, so the next open reads `C2_TOTAL_DRIFT` and `coverage` 9 against 10; second time (round 39's closure file at round 40, round 40's at round 41) | `.ufo/waves/round-41/open/receipts.txt` (`C2_total declared=90 computed=91`, checklist 14/15) | `proxy-check` (fires correctly) | row added at open in 34fccc17 (R40-7). The mechanism recurs by construction for the round-41 closure file; the next L1 adds the row at open. Teaching the proxy to skip closure files would re-charter the frozen `C2_total` term, so it is not done |
| suite blind spot — a test suite with no case that observes its own verdict machinery: the four suite-verdict mutants survived because the suite was its own observer | `.ufo/waves/round-41/final/cite-mutants-open-a58b7f72.txt` (suite-group-verdict, suite-any-fail, suite-exit-json, suite-exit-text survived) | none until round 40's scout | the injected-failure child run (C1); after: all four killed at 68db3419 |

## Gate — admits and rejects

- **Admit S038** (own-work, tier A): `scripts/ufo-swarm-wave.mjs` in the pinned clone at
  31c465f15669f744848bd9f5d56191c5085670f7, opened read-only 2026-10-22, file sha256
  1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a. Located quote, `:51`:
  "ufo-swarm-wave-dispatch-v1 — the exact single `task` call payload ({context, tasks} — spawn
  lanes only, null when the wave resumes only)". Used by `scripts/wave-census.mjs` and this lesson.
- **New row, logged:** S038 new → `mined` (used-by `scripts/wave-census.mjs`, `corpus/lessons/round-41.md`).
- **Re-open S035** (no status change, `mined` → `mined`): the front matter still reads
  `name: kimi-webbridge` and `version: "2.0.26"` (2026-10-22, read-only). The K2 section of
  `corpus/knowledge/kimi-skills-plugins.md` now names S035 (R40-5).

## Routed defects R40-1 to R40-7

| defect | disposition | evidence |
|---|---|---|
| R40-1 registry row lacks `--open` | fixed: the `anchor-truth` row names `--open REV`, what it adds and its verdict map | `SKILL.md` `## Gate registry` |
| R40-2 honest-edit re-measure at the AT46 gate; in-round review refused under `--open` | the limit is recorded here: under `--open`, a review record committed after the open revision cannot bind, so an honest review written in the round reads `REVIEW_UNBOUND` (round-40 `build/CritC1Design.md` BEN_NEWREVIEW). The 17-recipe re-measure is a falsify-wave item | `## Open limits` below |
| R40-3 cite-check receipt at the tip | receipt committed with its class: errors=545, 33 `REV_UNKNOWN`, of which 1 is a commit inside its own row's URL (S036) and 32 are not | `.ufo/waves/round-41/final/cite-receipt-r40-3.txt` |
| R40-4 anchor-truth resource caps | not done this round: the executor route was down for the leg and the L1 kept scope on C1 and C2 | `## Open limits` |
| R40-5 S035 in K2 | fixed | `corpus/knowledge/kimi-skills-plugins.md` K2 section source note |
| R40-6 seat-gate count | corrected in `## Mistakes`; a declared count can now be checked against the payload with `wave-census --expect` (a person still types the prose number in; the census reads no prose) | above |
| R40-7 README row | fixed at open (34fccc17) | `corpus/README.md` |

## Open limits (measured, not fixed)

- The 14 unpinned severity decisions in `ScoutCiteVerdict.md` section B are outside C1.
- `wave-census` cannot tell a dead-at-spawn seat from a cancelled or never-dispatched one, and
  cannot see a safety-filter hold; it counts payload seats.
- R40-4 stays open: no cap on the number of `anchor-reviews.json` registries read under `--open`,
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
