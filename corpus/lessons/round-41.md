# Round 41 — cite-check pins its verdict conditions; a census of committed swarm evidence

Source: S038 (the origin wave producer `scripts/ufo-swarm-wave.mjs` at the pin, opened this round),
S035 (re-opened), the round-40 non-author closure (`corpus/lessons/round-40-verifier-spotcheck.md`,
routed defects R40-1 to R40-7) and the pinned upstream revision
31c465f15669f744848bd9f5d56191c5085670f7. Round open: lane a58b7f72afc1eb44b37e438a2f8b212c658874e5.
Plan and frozen counters: `.ufo/waves/round-41/plan.md` (commit 34fccc17).

## Claims

- **C1 operability.** `scripts/cite-check.mjs` now pins the 16 verdict, render and exit conditions
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
- **C2 capability `wave-census`.** `scripts/wave-census.mjs` reads a round's committed
  `*-dispatch.json` payloads and the report files their `Report:` trailers name. Counter
  (committed in 27592977 before the instrument): `.ufo/waves/round-41/probe/wave-recount.sh.txt`.
  Before, at 27592977: `RECOUNT_MISMATCHES=7` (no instrument), `CAPABILITY_ROWS=1`, both `--expect`
  calls exit 1 (module not found). After: `RECOUNT_MISMATCHES=0` over the seven payloads of rounds
  38–40, `CAPABILITY_ROWS=2`, `--expect build:mutation-tester=4` exit 1 and `=3` exit 0.
  Sourced on S038.

## What the census taught (measured on rounds 38–40)

- A payload proves validation, not dispatch. Round 39 committed two validated payloads (46 and 37
  seats) whose waves timed out at the seat gate; the census reads `reports=0/46` for the build
  payload. Round 41's own build payload (34 seats) also never spawned.
- Report presence is shared when a residual call reuses item names: round 39's eight residual
  seats wrote into `falsify/`, so the falsify payload reads `reports=8/37`.
- Round 40's payloads carry 45 attack seats out of 67 (reviewer, critic, mutation-tester); the
  round-40 closure wrote "Attack roles: 37 of 67". The census counts payload seats, not live ones;
  37 matches neither the payload (45) nor payload minus the seven dead mutation-testers (38).
  Recorded as a disagreement, not resolved here.
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
| R40-6 seat-gate count | corrected in `## Mistakes`; the instrument now catches it | above |
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
