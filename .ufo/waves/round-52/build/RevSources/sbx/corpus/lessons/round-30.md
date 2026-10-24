# Round 30 — the doc-repair trio, and the boundary between doc repair and check repair (2026-10-14)

Free-craft round; the three residuals round 29 deliberately left named.
Two repair lanes (disjoint files) + a verify lane + parent-side integration.

## What landed

- **F1 repaired** (round-6-aggregator-audit): the `GateDecision` citations
  now carry the measured anchor (`gate.rs:15`, verbatim `pub enum
  GateDecision`) with the falsified historical pointer (`gate.rs:11`) kept
  as prose — because both cited lines were *quotations of the failed
  pointer*, and rewriting them would have falsified the audit's own
  Claim-vs-Observed record. The repair lane's deviation was the honest call.
- **F4 repaired** (queue-summary): the 15 `primeagent-assimilation.json`
  findings were never config refs — a bare path token had captured
  following `fleet-dispatcher.mjs` refs (owner-ambiguity class). Explicit
  owner statements re-owned all 24 refs (15 + 9 sibling refs the lane found
  and also fixed — strict-scope honesty recorded). File error count
  unchanged (69 → 69, all now correctly owned).
- **F3 repaired honestly — and exposed a check-repair boundary**: the two
  notes mapped the **superseded** 14,769-line revision (14 functions absent
  from today's 9,829-line file), so the repair marked them "Superseded
  revision (historical)": git pin `b18e0274d` kept (it resolves), content
  hash described not pinned (the repo's own rule: superseded revisions are
  described, never pinned — SKILL.md:616-620), current bytes pinned
  (`ba5e02be…`). The F3 *integration case* then blocked 9/9: it hardcoded
  token `44a3c781`, which no live file hashes to — **no doc-only route
  existed**. Parent integration re-tokened the case to `ba5e02be` (the
  same expectation-refresh class as round 29's samples, intent preserved).
  **`--integrations`: 6/9 → 9/9.**
- Parent-side consistency: round-7.md's live `44a3c781` pin de-pinned to
  the historical treatment; the unmeasured "296 commits behind" anchor
  corrected to the measured 850.

## Verify-lane residuals, all adjudicated

Zero dropped claims (full-text diff); all 6 spot-checked anchors measured
correct; errors 704 → 700 (the two de-pins flagged and signed off — claims
preserved verbatim, supersession documented, live pins gained). Named for
the record: ~41 LINE_OOR anchors in the two F3 notes and ~13 dead-feature
claims remain — honestly errata'd as superseded-revision citations; full
re-derivation against the current tree is the parked OMP re-census's work,
not this round's.

## Godspeed verdicts

- **quality — improved**: three doc defects repaired to measured anchors;
  one falsification avoided by keeping the historical pointer as prose.
- **calibration — improved**: the doc-repair/check-repair boundary named
  (a check that hardcodes a dead token can never go green by doc honesty);
  `--integrations` fully green for the first time since the restructure.
- **operability — improved**: 9/9 integration cases; selftest 62/62 held.
- **coverage / freshness — unchanged.**

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest --integrations --src
    ~/Projects/ufo-fsd-alpha` → **62/62 hermetic + 9/9 integration**;
    `cite-check --src …` → DRIFT (errors 700, the named de-pins);
    `node scripts/proxy-check.mjs` bare → six carried OMP terms only;
    `kimi-census.mjs` CLEAN 49.
  - Next queue, named: the parked OMP re-census (the ~41+69 stale anchors
    in the superseded-revision notes); the multi-line backtick class; the
    contract-bump judgment.
