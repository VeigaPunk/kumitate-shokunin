# Round-78 routed-repair drafts (L1 scratch, applied at integration)

## A. Append-only erratum block for `corpus/lessons/round-77.md` (r77 closure D1/D4/D5/D6)

> ## Erratum (round 78, 2026-11-04; append-only; supersedes only the lines it names)
>
> - **D1 — the `## Counters` row's `A`.** The row reads `847 / 35 / 183 / 184 → 856 / 37 / 186 / 186`.
>   The cited `close/proxy-json.txt` reads `"A": 857` at `rev=e47266ae…` (its own header line), and
>   the report, the SCORECARD stanza and the pin block all read 857. The close cell's A is **857**;
>   `C / C2 / C2_total` (37 / 186 / 186) stand.
> - **D4 — quote word counts in `## Gate`.** Quote 2 (§4.4) is annotated "(21)"; the verbatim quote
>   is **20** whitespace words. Quote 3 (§9.5) is annotated "(24)"; the verbatim quote is **25**
>   (still inside the ≤25 bound). Quote 1's annotation (23) is correct.
> - **D5 — the FREEZE-FIX 6 disposition receipt.** `open/r76-freeze-fix-6-disposition.txt` prints a
>   loader `ERR_MODULE_NOT_FOUND` trace followed by `exit=0`; the exit line belongs to the *trace
>   display*, not to a successful import — a re-run of the named import exits 1. The underlying
>   absence (`git cat-file -e ebfcedfa:scripts/spotcheck-adopt.mjs` → exit 128) is independently
>   true; the receipt's annotation, not its evidence, is corrected here.
> - **D6 — the carried r76 routed item 3 why-not.** The why-not ("`round-gate --close` reports
>   `UPSTREAM_MISSING` on jj detached HEAD; operator-owned instrument, outside lane repair
>   authority") exists only in `build/K77ScribeDocs/round-77-lesson.md` (the `close-upstream-
>   instrument-refusal (r75 D4 carried)` row). It is recorded here so the committed lesson carries
>   it: the gate is not weakened from this lane, and the refusal is disclosed each round it fires.

## B. D3 — wave-floor definition used in round 77 and round 78

The template's minimum split is *1 planner, 1 connector, 3 executors, 1 scribe, 1 scout,
1 reviewer, 1 critic*; the planner seat is held by the L1 (the validator rejects `planner` as a
swarm role). Round 77's `FLOOR … executor=2/3 … verdict=met` line is therefore **not met against
the template's split** — it met a three-executor floor only if the connector's sibling scan is
counted as an executor, which the template does not allow. Round 78 meets the split on the
template's own terms: **3 executors** (`K78ExecKDerive`, `K78ExecCompare`, `K78ExecRepair77`),
1 scribe ×2, scout ×2, connector 1, reviewer ×2, critic 1, mutation-tester ×2, sentinel 1 — 14
seats, planner = L1.

## C. D2 — corrected round-77 base controls

Landed as new receipts (never a rewrite of the r77 controls): `K78ExecRepair77` re-runs the round-77
counter at its **final** bytes (`e47266ae:.ufo/waves/round-77/probe/probe77.mjs`) against a
`git archive a321ed80` base tree and records `probe-sha256=` in each receipt. The r77 originals stay
as filed evidence with the disclosed instrument-byte mismatch.
