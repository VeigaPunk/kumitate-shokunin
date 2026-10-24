# Round 39 — identity floor for the truth gate, and the last round-37 debt anchor

Source: S034 (Stryker's mutant-state definitions), the round-37 and round-38 non-author
closures (`corpus/lessons/round-37-verifier-spotcheck.md`,
`corpus/lessons/round-38-verifier-spotcheck.md`) and the pinned upstream revision
31c465f15669f744848bd9f5d56191c5085670f7.
Round open: lane fac39171ac28c606e90da75fc2ba2ed3df52f4ea (round-38 closure plus an operator
reflection file; same corpus, gate and pin bytes as the round-38 delivery 89ff4a74).

## Claims

1. **coverage:script-layer — repair the open round-37 harm.** The round-37 closure listed 62
   anchors that were true at its round open and false at its close. The round-38 closure
   re-measured them with the original tokens held fixed: 58 of 62 corrected. Of the four left,
   three (S8#112, #324, #410) carry reviewed correct tokens and the closure agreed they are
   pairing artifacts, not lost truths. One, S8#475 (`agentId`, `scripts/ufo-swarm-collect.test.mjs`),
   stayed `debt:false`. Round 39 re-cites it from line 560 to the whole conflicting-agent case,
   line 560-572. Counting command (re-runs the round-38 closure's own Python block, rebinding
   only `src` and `delivered`):
   `python3 .ufo/waves/round-39/probe/measure-c1.py.txt --lane <lane> --rev <rev> --src <pinned clone>`.
   Before at fac39171: `PRIOR62_CORRECTED 58/62`, `OLD_TOKEN_LOSSES 0`. Declared after:
   `PRIOR62_CORRECTED 59/62` with `OLD_TOKEN_LOSSES 0`.
2. **operability — repair R38-1, the floor's key-substitution gap.** `anchor-truth --base` found
   each base-true anchor by its pin key, which is built from the paired token, so a current entry
   whose token and key changed escaped the per-anchor check. Round 39 adds a token-independent
   identity (raw text, resolved path, occurrence index), a per raw-path non-true count, a
   pair-token check and a pin source rule. Counting command:
   `node --input-type=module - --lane <lane> --rev <rev> --src <pinned clone> < .ufo/waves/round-39/probe/floor-probe.mjs.txt`.
   It runs six named hand edits of the committed pin and note (A1 is the closure's own
   counterexample) against the direct entry with the frozen base. Before at fac39171:
   `FLOOR_PROBE accepted=6/6`. Declared after: `FLOOR_PROBE accepted=0/6`. The claim is about
   these six named edits, not about every possible edit; open limits are listed below.

## Measured

Measured production revision: 3908f322c4c473f1a8b45c8d1c14054205eb7647 (code, pin and note;
later round-39 commits carry documents and evidence only). Receipts:
`.ufo/waves/round-39/final/`.

- C1: `PRIOR62_CORRECTED 58/62` at fac39171 → `59/62` at 3908f322; `OLD_TOKEN_LOSSES 0` at
  both; production pin tally 777 true / 21 debt / 13 unchecked → 778 / 20 / 13, zero
  expectation mismatches, `baseline_true_changes []` (`.ufo/waves/round-39/final/measure-c1-open.txt`,
  `.ufo/waves/round-39/final/measure-c1-final.txt`).
- C2: `FLOOR_PROBE accepted=6/6` at fac39171 → `0/6` at 3908f322; control CLEAN at both
  (`.ufo/waves/round-39/final/floor-probe-open.txt`, `.ufo/waves/round-39/final/floor-probe-final.txt`). A1, the round-38 closure's modelled
  counterexample, is now observed on the real gate: CLEAN exit 0 at open, DRIFT exit 1 at
  3908f322.
- Red-before: round-open logic with the new selftest reads 23/30; AT23, AT24, AT26, AT27, AT28,
  AT29, AT30 fail and AT25 (the legitimate re-key) passes (`.ufo/waves/round-39/final/red-before.txt`).
- Mutants: 11 of 11 killed by a named failing selftest case at 3908f322 (`.ufo/waves/round-39/final/mutants.txt`). The
  first L1 run against dfa159d5 found two survivors (null-token forging skipped; review source
  with a null token) and one mutant detected only by the live gate (path dropped from the
  identity). AT28, AT29 and AT30 were added for them before the measured commit.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| A per-anchor floor found the anchor it protects by a key built from a field the protected edit can rewrite (the paired token), so a re-keyed base-true entry escaped and the per-note totals still passed | `corpus/lessons/round-38-verifier-spotcheck.md` §Missing-key counterexample, R38-1; observed on the round-open gate: `.ufo/waves/round-39/final/floor-probe-open.txt` A1 and A2 accepted | none: Q17 required a per-anchor floor but said nothing about how an anchor is identified; the round-38 falsify wave did not try a key edit | Identity by raw text, resolved path and occurrence; per raw-path non-true count; pair-token and source rules (AT23–AT30; AT25 is the legitimate re-key that must stay CLEAN; the others fail on round-open logic, `.ufo/waves/round-39/final/red-before.txt`); new criterion Q19 |
| The first selftest additions left two mutants alive (a null-token forgery and a review source with a null token): a fixture written for the headline attack also tripped the other arm, so neither arm was tested alone | `.ufo/waves/round-39/final/mutants-dfa159d5.txt` (9 killed, 2 survived) | the lane's own mutation run this round (Q17 bullet "each arm has a selftest fixture whose mutant must fail") | AT28 and AT30 test those arms alone; AT29 pins the path; 11/11 killed at 3908f322 |
| The round's 46-seat build wave never ran: the seat gate did not grant it within 3600 s, the second 3500 s request was cancelled at the two-hour freeze | `.ufo/waves/round-39/evidence/seat-gate.txt` | none (a host capacity limit; Main's steer at 11:47Z: waves above about 40 seats wait an hour) | Size waves at 32–40 seats when eight lanes share the 85-seat gate; prepare the falsify wave on a committed candidate before asking for seats |

## Gate — admits and rejects

- **Admit:** S8#475 re-cited to line 560-572. The pinned source has the test declaration
  `test("conflicting_agent_id_rejected"` at line 560, the conflicting registry `agentId:
  "agentOTHER"` at line 569 and `assert.equal(r.error.code, "conflicting_member")` at line 572;
  the sentence says the join arm rejects a conflicting `agentId`, so the range covers the whole
  described case (Q18), not a nearby token.
- **Reject:** re-citing S8#112, #324 and #410 so that the round-37 closure's old tokens
  (MAX_BYTES, validateTaskReceipt, spawnSync) read true. Their sentences name `fixtureDir`, the
  dynamic import and the throw/retry test; the old tokens were pairing artifacts of that closure's
  parser, and the round-38 closure agreed. A 62/62 would have been bought by moving correct
  anchors onto wrong symbols.
- **Reject:** fixing the debt trade (L2 below) inside this round. It is a different defect class
  from R38-1 and would need a rule for new anchors (debt entries must map to base debt by
  identity); one current entry (S8#99, moved in round 38 and still debt) would need its own repair
  first.
- **Admit S034, reject nothing new:** the Stryker page is the project's own definition of its
  mutant states; the round uses only the killed / runtime error distinction.

### S034 — opened this round

URL: https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/
Accessed 2026-10-22 about 09:58Z by the L1 with an ordinary HTTP read (no browser, no challenge).
Section "Mutant states". Quote (15 words): "When at least one test failed while this mutant was
active, the mutant is killed." Second quote, same list (10 words): "It is not represented in your
mutation score." (said of Runtime error). Row status: new, `mined`, recheck 365d, used-by this
lesson and `corpus/QUALITY.md` (Q19).

## Open limits (measured, not fixed)

- **L1 self-declared review.** A pin entry with source `review:<seat>` and a token that occurs in
  its sentence and on its lines pins `true`; the direct entry never reads a review record
  (`run()` reads `--reviews` only with `--write-pin`). The L1's own search tried identifiers of
  four or more characters on the 20 current `debt:false` entries and found none; that search was
  too narrow. The non-author seat CritProbeBias set S8#92 to `review:NoSuchSeat` with the
  stopword token `the` and `expect: true`, and the gate read CLEAN at both fac39171 and 3908f322
  (`.ufo/waves/round-39/falsify/CritProbeBias.md`). So a debt entry can be forged true today
  through this path; it is the first repair candidate for round 40.
- **L2 debt headroom.** Un-anchoring one debt entry and appending one new false anchor at a raw
  text with no base anchor reads `TRUTH: CLEAN` at 3908f322
  (`.ufo/waves/round-39/final/limit-debt-trade.txt`, script beside it). The non-author seat
  CritClaimC2 showed the gap is wider than a one-for-one trade: per-note `DEBT_GREW` compares
  with the frozen base, where S8 held 77 debt entries and the pin now holds 4, so 73 new false
  anchors at a fresh path read CLEAN and the 74th is refused
  (`.ufo/waves/round-39/falsify/CritClaimC2.md`).
- **Environment, not this round's bytes.** The pin's default source clone
  `/fast/scratch/kumitate-r36/src` is gone, so six checklist items exit 2 and
  `CHECKLIST: 8/15 pass` at both fac39171 and 3908f322; the live Kimi census reads `DRIFT
  (UNLISTED skills/)` (a seventh `skills/` child) at both, so the proxy derives
  coverage:kimi-layer 9 against the declared 10. Both are reported for round 40.
- **L3 raw swap inside one path (found by a non-author seat).** BypassSwapRaws swapped the line
  coordinates of S8#451 (`:40`) and S8#456 (`:58`, token `hatch`, true at base) and hand-wrote a
  consistent pin. The `hatch` claim becomes false, yet the identity `:58` occurrence 0 now
  resolves to #451, which is true with another token, so the gate reads CLEAN; the same holds for
  three more pairs with #456. Round-open logic accepts the same four swaps, so this is a gap the
  repair did not close, not a regression it caused. Suggested fix for round 40: a base-true
  identity counts as kept only when the matched entry is true and keeps its base token (or carries
  a bound review). `.ufo/waves/round-39/falsify/BypassSwapRaws.md`.

## Residual check — non-author seats (8 reviewer/critic seats, one call)

Neither wave ran (see `.ufo/waves/round-39/evidence/seat-gate.txt`); one residual call of eight
reviewer/critic seats ran against 3908f322. Reports: `.ufo/waves/round-39/falsify/`.

| seat | verdict | what it found |
|---|---|---|
| C1Remeasure | confirmed | 58/62 → 59/62, losses 0; closure block sha256 f4ecff36… identical; only `src` and `delivered` rebound |
| C1SemanticRange | agree | line 560-572 holds exactly the declaration, the conflicting agentId and the assertion; nothing narrower can hold all three |
| CritClaimC1 | supported | zero genuine round-37 harms remain under either closure's method; 59/62 is this counter's ceiling; #475's round-37 loss was itself a comment-line artifact, so the repair fixes one debt anchor rather than restoring lost knowledge |
| GateDirect | confirmed | selftest 22/22 → 30/30; direct entry CLEAN with true 777 → 778, debt 21 → 20; SRC_MISSING exit 2 without `--src` at both revisions |
| CritClaimC2 | overclaimed (wording) | after-values reproduce; 0/6 does not isolate `BASE_TRUE_LOST` (A3 is refused by `TOKEN_FORGED`, A4 by the schema); its own sweep found 3 of 15 mutants surviving (group check counting only unchecked; dropping the `b.t > 0` guard; deleting the old key loop); the floor protects only base-true anchors, not this round's own repair; no round-39 frozen replay; L2 headroom 73 in S8 |
| CritProbeBias | mixed | each refusal is from a declared mechanism and none is a crash, but the control cannot tell the fix from a tool that refuses every edit, there is no benign-edit control, and the attacks cluster on S8#3; honest narrowing or widening of a base-true range is refused (an operability cost); L1 confirmed with the stopword token `the` on S8#92 |
| BypassSwapRaws | limit | L3 above (4 accepted swaps lose a base-true claim at both revisions); 2 swaps refused only by the old key loop, which therefore is not dead weight |
| BypassRunReorder | limit | five base-true two-anchor runs reversed, four pin styles each: round open accepts 10 of 20, the candidate 5 of 20 (`TOKEN_FORGED` closes the base-tokens-under-`pair` variant); the 5 still accepted keep base tokens under a self-declared `review:probe` source (L1). Its scratch-only fix (flag a base paired-true anchor whose review-sourced note pairing now reads false) took its probe to 0 of 20 with the control CLEAN; not adopted this round |

What the L1 takes from them: the C2 claim stays the six named edits (6/6 → 0/6) and is not a
claim that the floor is complete. The probe needs a benign-edit control and per-attack expected
finding kinds, and the floor needs the token-kept rule (L3), bound review records (L1) and a
new-debt identity rule (L2). These are round-40 candidates; scope was frozen at 11:43Z.
