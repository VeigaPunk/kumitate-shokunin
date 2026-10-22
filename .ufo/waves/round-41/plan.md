# Round 41 plan (kumitate L1; written before any wave; counters frozen at this commit)

Round open: lane `master` = `a58b7f72afc1eb44b37e438a2f8b212c658874e5`, pushed, clean
(`jj-lane.sh state`: `ahead=0 behind=0 tracked=0 untracked=0`). Origin pin
`31c465f15669f744848bd9f5d56191c5085670f7`, clone `/fast/scratch/hyaku/kumitate-pin/src`.
Open receipts: `.ufo/waves/round-41/open/receipts.txt` (16:00:11Z).

Lowest non-retired axis: operability 8 (saturation line 9; the nudge is not active). Drift watch:
rounds 39 and 40 both worked the anchor-truth gate, so neither claim below is on anchor-truth.

## C1 — operability: cite-check pins its verdict and exit conditions

- Set: the 16 conditions named `unpinned=16` in the first line of
  `.ufo/waves/round-40/build/ScoutCiteVerdict.md` (warn-total, resolved-kind-gate,
  strict-conjunct, strict-warn-arm, resolved>0, citeCheck-map, render-env-empty,
  render-env-zero, exit2-empty, exit2-zerores, exit0/1-map, parse-64, suite-group-verdict,
  suite-any-fail, suite-exit-json, suite-exit-text). Only these 16; the 14 unpinned severity
  decisions in the same file are outside the claim and stay a recorded limit.
- Counter: one committed probe, `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt`. For a
  given lane revision it applies each of the 16 single-condition mutants to that revision's
  `scripts/cite-check.mjs` (one mutant at a time, in a temporary copy), runs that copy's
  `--selftest`, and prints one `MUTANT <id> killed|survived|nomatch` line per condition plus a
  footer `CITE_MUTANTS survived=<n>/16 nomatch=<m> control=<PASS|FAIL>`. Killed means at least
  one case failed while the mutant was active; a crash is not a kill. The probe is committed
  before its first counted run.
- Before: the probe's output at `a58b7f72` (round open). After: `survived=0/16 nomatch=0
  control=PASS` at the measured commit. A miss is an honest stop.

## C2 — capability `wave-census`: read a round's committed swarm evidence

- New lane instrument `scripts/wave-census.mjs` reads a round's committed
  `.ufo/waves/round-<N>/*-dispatch.json` (`ufo-swarm-wave-dispatch-v1`), the matching
  `swarm-registry.json` and report directories, and prints per wave: seats dispatched, seats per
  role, attack seats (reviewer, critic, mutation-tester, labrat), reports present and absent.
  `--expect <wave>:<role>=<n>` asserts a declared count and exits 1 on a mismatch.
- Before: `## Capabilities` holds 1 row, counted by
  ``awk '/^## Capabilities/{f=1;next} /^## /{f=0} f && /^\| `/' SCORECARD.md | wc -l``;
  the instrument does not exist.
- After (all three, over committed bytes):
  1. `## Capabilities` holds 2 rows (same command), the new one `wave-census`.
  2. For rounds 38, 39 and 40, the instrument's per-wave seat and role counts equal an
     independent recount of `.taskCall.tasks | length` and `.taskCall.tasks[].agent` in each
     committed `*-dispatch.json` (jq): 0 mismatches.
  3. Shown able to fail on the round-40 slip R40-6:
     `node scripts/wave-census.mjs --round 40 --expect build:mutation-tester=4` exits 1 and
     `--expect build:mutation-tester=3` exits 0.
- Sourced: the capability's evidence cites a `corpus/SOURCES.md` row opened this round (the
  origin swarm producer's dispatch and registry schema at the pin).

## Routed defects (fix or explain; not claims)

R40-1 registry row `--open`; R40-2 honest-edit re-measure at the AT46 gate and the in-round review
limit; R40-3 cite-check receipt at the tip with its class; R40-4 anchor-truth resource caps;
R40-5 S035 named in the K2 section; R40-6 seat-gate count correction in the round-41 lesson;
R40-7 README row for `lessons/round-40-verifier-spotcheck.md` (landed with this plan; stanza
`C2=91/91`).
