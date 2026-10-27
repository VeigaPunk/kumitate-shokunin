# K68ScoutConsiderthese — considerthese → round-68 C1 mapping

Scope: `considerthese/` newest file, ideas 4 and 5, vs the frozen round-68 plan's C1
(`.ufo/waves/round-68/plan.md`). Read-only scout pass; nothing in the lane was edited.

## Source lines (verbatim)

`considerthese/2026-10-25.md` ("Self-improvement ideas (proposals only, not acted on)"):

- **Idea 4:** "**Count recurrences.** Keep a running count of each routed defect class (the
  R56-V3 map drift is at seven). When a class passes three, propose a structural fix instead
  of another routed item."
- **Idea 5:** "**Keep a deferral ledger.** Track every rejected merge candidate, its flip
  condition, and the round where the flip fired or is still pending, so deferred work stays
  visible across passes."

Frozen plan's considerthese line (`plan.md`, "Frontier step" block):

- "considerthese: `2026-10-25.md` ideas 4 and 5 are the substance of C1 (landed as the
  round-66 tool; this round lands the data and registry home); no new proposal is mined this
  round beyond that file."

## Idea 4 → C1 surfaces (direct, verbatim-level match)

| Idea-4 phrase | Frozen-plan / base surface |
|---|---|
| "a running count of each routed defect class" | Ledger 7-cell schema carries a `class` cell ("`class [a-z][a-z0-9-]*` (recurrence key)", `scripts/routed-ledger.mjs:33`); `--classes` aggregates rows per class. |
| "when a class passes three" | Tool prints `RECURRENT` at ≥4 distinct spot-check rounds — "passes three" read as "≥4" (selftest cases "`--classes` prints CLASS lines; RECURRENT needs >= 4 rounds", "`RECURRENT` fires at 4 distinct rounds"; run at base: `ROUTED_LEDGER_SELFTEST: PASS (33/33)`). |
| frozen counter must demand the count | L3: "`>= 5 distinct classes; >= 1 class spans >= 4 distinct spot-check rounds`" (`plan.md` C1 L3). |
| "propose a structural fix instead of another routed item" | Ledger forces every closed/wontfix row to a located answer line in a non-ledger, non-spot-check file (L3; tool `ANSWER_DEAD` family) — an item cannot stay a bare recurrence; motivation line in r66 plan: "nothing counts them, so one class (README map drift, R56-V3 family) recurred eleven times". |

Verdict on idea 4: substance of C1, confirmed at the level of mechanism, data, and frozen
predicate.

## Idea 5 → C1 surfaces (substantive match under the lane's reading; literal reading bounded)

| Idea-5 phrase | Frozen-plan / base surface |
|---|---|
| "keep a deferral ledger" | `corpus/routed-ledger.md` is exactly a persistent deferral ledger over routed items: "61 items in 12 sections" (counter's own count over rounds 55..66). |
| "the round where the flip fired or is still pending" | Row fields `round`, `status` (`open` = still pending; `closed`/`wontfix` = resolved, bound to a located answer `path:line`); L3's round-66 clause requires D1–D3 rows "answered this round" — i.e. it records the round a pending item fired. |
| "deferred work stays visible across passes" | UNLEDGERED check: every routed item must have a row — an item can no longer silently drop between rounds (r66 plan's mined mistake: "routed items lost between rounds"). |

Boundary (calibration note): as literally written, idea 5 targets *rejected merge candidates
and their flip conditions* — a merge-package tracking ledger. The landed ledger tracks
spot-check routed *defects/carryovers*; its schema has no flip-condition cell. Round-66's own
wave drew this line (`build/K66ConnectorRecurrence/patterns.md:20`): "these are
defect/carryover records, not necessarily a normalized merge-candidate ledger with
flip-condition state. A separate deferral ledger is complementary; it should not be conflated
with routed defect recurrence." The plan's "idea 5 is the substance" is therefore accurate at
the "pending deferred work stays visible across rounds" level, not at the literal
flip-condition level.

## One-proposal bookkeeping (contract: at most one still-unimplemented proposal per round)

- Round-65 plan:110–112 already took idea 4 ("a counted recurrence table … fix for the class
  'a landing moved a gate the lane did not run'. Ideas 1 and 2 were taken in round 64"), but
  its script `class-recurrences.sh` exists only as
  `.ufo/waves/round-65/build/K65ScribeQuality/class-recurrences.sh` (header: "DRAFT for
  QUALITY Q62") — never landed in `scripts/` (no such file; no SKILL/QUALITY/SCORECARD
  reference).
- Round-66 plan:96–97 resolved the cap: "one proposal per round → idea 5 is the one taken
  (idea 4 was taken in round 65 but its script never landed; C1 lands the counting)."
- Round-67 plan:147 and round-68 plan repeat "ideas 4 and 5 are the substance of C1" —
  defensible because round 68 is a re-declaration of the same claim (routed R66-D3
  land-or-redeclare), not a fresh mining; C1's tool header itself cites both ideas
  (`routed-ledger.mjs:4-5`).

## Newer-file check (must-mine-instead test)

`considerthese/` contents (8 files, 2026-10-19 → 2026-10-26). Newest: `2026-10-26.md`
(written before the Oct-27 freeze; its own window note says it covered rounds 62–65).

`2026-10-26.md` proposes six ideas (transcript-per-tally; gate-table↔registry cross-check;
new-tool registration check; round-size-vs-band tracking; machine-readable `status:` line per
spot-check; noisy-counter time series). None is a better C1 candidate:

1. All six are observational passes the daily-considerthese author could perform itself, not
   lane capability acquisitions on the operability axis (the axis nudge requires C1 to be a
   capability acquisition on operability).
2. The closest — idea 3, "check that new tools get registered" — is already embodied inside
   C1's L6 surface (SKILL gate-registry row, QUALITY Q62, SCORECARD capabilities row for
   `routed-ledger`) and is separately ledger-bound via r65 D2/D3 routed items.
3. Round 68's claims were fixed before `2026-10-26.md` existed: it "re-declares round 67's
   two claims under fresh freezes" (routed R66-D3 land-or-redeclare). Swapping in a different
   proposal would abandon the re-declaration, and adding one would put two unimplemented
   proposals in the round → over the one-per-round cap.

Conclusion: **no newer considerthese file should be mined instead**; the frozen plan's
"no new proposal is mined this round beyond that file" is the contractually required reading.

## Registry-home absence at base (L6 "unmoved" check)

- `grep routed-ledger SKILL.md` → no rows (only SCORECARD's round-66 record line 3003, a
  "not verified" note, not a `## Capabilities` table row).
- `grep routed-ledger corpus/QUALITY.md` → none; last Q is Q61 (+ Q51-C1 correction), so the
  plan's "QUALITY Q62" is the row number to be assigned — consistent. Side note: the unlanded
  r65 `class-recurrences.sh` draft also earmarked "QUALITY Q62"; since it never landed, the
  number is free, but the integrator should not reuse the r65 draft's title text blindly.
- `test -e corpus/routed-ledger.md` → absent; `node scripts/routed-ledger.mjs --selftest` →
  `ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit 0 — matches the plan's unmoved-at-base claims.

## Residual unknowns

- Whether round-68's `corpus/routed-ledger.md` data will encode idea 5's flip-condition
  semantics in `class`/`status` cells (e.g. `wontfix` carrying a flip rationale) — data-side
  choice, not knowable from the freeze.
- Whether any seat will mint the complementary merge-candidate deferral ledger (K66Connector
  flagged it "complementary"); out of this round's declared scope.
