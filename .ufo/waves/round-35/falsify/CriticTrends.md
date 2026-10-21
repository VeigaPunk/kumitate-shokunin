ATTACK learning-trend-verdicts verdict=partial defects=4

Axes under attack: coverage, operability. Target: the three intended
learning-trend verdicts (expansion/quality/discernment = improved), measured
against `LEARNING.md:26-48`, not against the lane's own gate prose.

## D1 — discernment `improved` is refuted (strongest defect)

`LEARNING.md:42-48`: "Self-assessed taste is not discernment. Each round a
non-author … spot-checks a sample of that round's gate decisions, **at least
one admit and one reject**, and records agree/disagree … in the round's
lesson." `LEARNING.md:69-71`: `round-<N>.md` "carries a `## Gate` section … and
the spot-check result."

Evidence:
- `corpus/lessons/round-35.md:27-72` — the `## Gate` section contains claims,
  riders, source rows, held/rejected items, and **no spot-check record**.
  Command: `grep -n "spot-check\|spotcheck\|spot check" corpus/lessons/round-35.md`
  → empty. `grep -rn "non-author" corpus/lessons/round-35.md` → empty.
- All three cited supports are author-side behavior: "5 queued rows" is
  curation (queueing happens *before* judgment completes, not discernment
  output), "S020 flip re-checked and refused" is a self-gate decision, "held
  items in lesson Gate" is self-disposition. None is an outside check.
- Wave-2 falsify seats (CriticC2Final, CriticC3Final, etc.) are same-round
  lane-dispatched subagents attacking axis claims, not a post-landing
  non-author gate spot-check; `LEARNING.md:46`: "A subagent the lane
  dispatched is still the lane."
- The round-34 external record (`corpus/lessons/round-34-verifier-spotcheck.md`,
  written by integrator kaika) covers round-34 decisions only; it cannot
  carry over — the check is per-round by construction.
- `unprovable-but-better` is also unavailable: it requires "a named non-author
  reviewer judging the change better, with reasons on record" (`LEARNING.md:47-48`).
  No such verdict exists for round 35.

Minimal fix: the only admissible verdict is discernment `unchanged`. If the
L1 wants the stronger verdict, the fix is outside lane control — a named
non-author review covering ≥1 admit (e.g. S021–S023 mined) and ≥1 reject
(S020 re-refusal) recorded in the lesson. Do not report `improved` on the
self-gate evidence.

## D2 — expansion `improved` is refuted as declared

`LEARNING.md:33`: expansion = "net new admitted `knowledge/` entries on
uncovered ground, each citing its coverage-map row", frontier areas entered,
new kinds of source, or a capability admitted to `SCORECARD.md`.

Evidence:
- Zero new `corpus/knowledge/` entries this round.
  `git diff master --stat` → 13 files, all edits to pre-existing entries
  (kimi-mcp-plane, member-claims-gate, remaining-scripts-census,
  runtime-remainder-census, executable-scorecard). No new file.
- The "two new S8 sections" (`omp-route-grammar.mjs`,
  `ufo-swarm-registry.mjs`) sit inside the already-held S8 family "remaining
  scripts" (`corpus/README.md` S8 row: "top-level `*.mjs` + `charter-scribe/` +
  `lean-cargo/` subtrees"). Coverage restored on held ground, not new ground.
- "SOURCES 20 → 28 rows opened" is curation throughput, not an expansion
  observable: S024–S028 are status `queued` (`corpus/SOURCES.md:37-41`),
  which is pre-judgment admission to the *source registry*, not to
  `knowledge/`. The mined rows (S021–S023) cite entries already on the map
  (`SOURCES.md:34-36` → remaining-scripts-census, kimi-mcp-plane, the lesson).
- No new source kinds: row kinds added are `own-work`, `docs`, `spec` — all
  present since S001/S004/S010.
- No capability admitted: `SCORECARD.md` capabilities table untouched;
  `git diff master -- PROVINCE.md` → empty (no frontier → core movement).
  The round-34 row (`SCORECARD.md:402`) is the last capability admission.

Minimal fix: report expansion `unchanged`. If the L1 argues breadth-better,
the correct token is `unprovable-but-better`, which is gated on the same
missing non-author review as D1. Citing raw opened-rows as `improved`
inflates a pipeline metric into a trend verdict.

## D3 — quality `improved` is contestable; residual falsity unmarked in-situ

Positive side (verified, not contested): S8 note genuinely re-verified —
`.ufo/waves/round-35/build/ExecS8Fidelity.md:1`
`regressed_before=41 regressed_after=0 cite_errors_before=59 after=42`,
209 anchors fixed at pin `31c465f1`; R11 dead anchor cleared; Q15
(`corpus/QUALITY.md:78-82`) correctly cites the round-35 mistake row.

Defect under `LEARNING.md:34` harmed clause ("an entry is found false or
stale and left unmarked"):
- The S8 note still carries **42 cite-check errors** post-fix
  (`ExecS8Fidelity.md:15,45`; acceptance was "no increase", not clean).
- 624 non-ok anchors in 11 S1–S7 notes are found-stale but marked only at
  ledger level (`SCORECARD.md` Limits (b), `LOG.md:1630`). In-situ the
  entries still assert stale anchors without warning — e.g.
  `corpus/knowledge/ops-watchers.md:5-6` measures at origin HEAD
  `daa371583` with 416 non-ok anchors and no staleness banner;
  `grep -n "stale\|historical\|not verified" ops-watchers.md` → only
  content uses, no self-marking. Whether ledger-level counting counts as
  "marked" is judge-adjudicable; a reader of the note sees unqualified
  stale anchors.

Minimal fix: either (a) downgrade to `unprovable-but-better` and route the
non-author judgment, or (b) land per-note staleness banners on the 11
debt-carrying notes so "marked" is true at the entry surface — that is the
smallest correction converting the weakest clause into honest text. The S8
work itself supports `better`; the verbatim `improved` is overclaimed but a
judge could sustain it if ledger-marking counts.

## D4 — minor: "S020 flip re-checked and refused" verified; wording is fine but it is not evidence for any trend

`corpus/SOURCES.md:33` keeps S020 `rejected` with its flip condition;
`corpus/lessons/round-35.md:60-62` documents the re-check (the persistence
overview still lacks durability text; S028 now holds the checkpointers page
with the durability-modes text). The re-check is real and correct — but it
is author-side discernment theater, feeding D1's fix requirement, not a
verdict input. No fix needed beyond the verdict downgrade.

## What holds

- R11 dead-anchor fix, Q15 citation, S8 sweep 41→0 / cite 59→42: all
  confirmed against `.ufo/waves/round-35/build/ExecS8Fidelity.md:1,15` and
  `corpus/lessons/round-35.md:20`.
- SOURCES row count 20→28: `SOURCES_CHECK: CLEAN (rows=28)` in LOG:1627;
  row arithmetic S001–S028 with S019/S020 rejected checks out.

## Summary for the canonical judge

- expansion `improved`: refuted → `unchanged` (D2).
- quality `improved`: contested — the strongest reading is
  `unprovable-but-better` pending the missing non-author verdict; a strict
  judge can reach `harmed` via unmarked-in-situ stale anchors (D3).
- discernment `improved`: refuted → `unchanged`; the required instrument
  was never run (D1). This is a compliance defect in the round's close, not
  a fixable artifact edit the lane can self-apply.

[INFERENCE] where noted: the judge's treatment of ledger-level marking as
"marked" is not observable from the lane tree.

Tools installed: none. No lane-tree mutation; report written at the
assigned path only.
