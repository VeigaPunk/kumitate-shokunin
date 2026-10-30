# K70ScoutConsider4 — considerthese idea 4 (2026-10-26) grounded on round 65

Seat: K70ScoutConsider4 · lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin` · 2026-10-30
Scope: read-only scout. Frozen plan read: `.ufo/waves/round-70/plan.md` (`3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`). No production file edited; no scratch created (nothing to clean); no installs (RULES.md read; none needed; pacman paused). One criterion only, per assignment — no second proposal.

## Mined proposal (observed bytes)

`considerthese/2026-10-26.md`, latest file, idea 4:

> **Track round size against the band.** Record seats dispatched versus the bound band and the m_flash share each round, so a shrinking round shows up as a trend instead of a one-off note.

Its own trigger line in the same file: "**Round size slipped:** 79 seats against 80–100 in r63, 45 against 64–100 in r65."

Scope note for the round-70 mining: the m_flash-share half of idea 4 is dead — `.ufo/prompts/kumitate-round-70.md` (fleet root) :214 says the run-7/8 rule "m_flash roles carry ≥50 % of every wave" **no longer binds** (operator moved volume off m_flash). The criterion below therefore grounds on the size-vs-band half only.

## The one criterion

**Round-size-vs-band line: every round's close record states seats dispatched against the prompt-bound band, with the dispatched count taken from committed wave results (`<wave>-results.json` `.results | length`), so a below-band round is a recorded number at close time — a comparable series, not a prose disclosure found only by spot-check or by an outside pass.**

This is idea 4 restated with a source of truth; it changes no formula, no claim predicate, no frozen bytes.

## Red evidence — observed round-65 failure (commands I ran, outcomes observed)

Band binding (fleet root, read-only): `.ufo/prompts/kumitate-round-65.md`
- :143 `Run 7 (2026-10-25, binding; supersedes run-6 band and routing lines below)`
- :152 `Round size: 64–100 seats in total, every round (floor 64 is the directive, ceiling 100)`

Dispatched count:
- `jq '.results | length' .ufo/waves/round-65/w1-results.json` → `45`
- `ls .ufo/waves/round-65/w1/K65*.md | wc -l` → `45`

Wave-2 gap:
- `ls .ufo/waves/round-65/` → shows `w1-results.json w1.ready.dispatched w2 …` but **no** `w2-spec.json` / `w2-results.json` / `w2.ready.dispatched`
- `find .ufo/waves/round-65/w2 -type f | wc -l` → `0` — the designed 40-seat falsify wave left an **empty** `w2/` directory; the design survives only as prose.

Lane's own record of the failure:
- `corpus/lessons/round-65.md:156` — "One v1 wave of 45 seats … no wave 2, no residual call. The round total is 45 seats, below the run-7 band of 64–100; the operator's per-round budget notice ended the L1's turn after the wave-1 integration."
- `corpus/lessons/round-65-verifier-spotcheck.md:20-22` (C-a) — "round total 45 seats, below the run-7 band of 64–100 the prompt binds (§6 …); wave 2 (40 seats) designed and not dispatched — disclosed by the report."
- same file :76 (D6) — the 40-seat falsify wave "is open work".
- Fleet-root report `.ufo/reports/round-65/kumitate.md`:3 — "This round is incomplete against the run-7 contract: one wave of 45 seats ran, no wave 2, round total 45 (band 64–100) — the L1 ended its turn at the operator's per-round request budget notice."

**Why this grounds the criterion:** the failure was disclosed honestly in three prose places (report, lesson, spot-check), yet no lane instrument recorded `dispatched vs band` as data; detecting the *trend* required the outside considerthese pass diffing r63 against r65 by hand. `45 < 64` is a single arithmetic check over committed bytes that the lane never ran at close.

## Honesty correction on the r63 data point

Considerthese says "79 seats against 80–100 in r63". My re-derivation: `jq '.results | length'` on `.ufo/waves/round-63/w1-results.json` → `40`, on `w2-results.json` → `39` (total 79 — the count matches), and r63 has the full two-wave shape (`w2-spec.json`, `w2.ready.dispatched` present). But the committed `.ufo/prompts/kumitate-round-63.md`:152 binds the same Run-7 band **64–100**, under which 79 is *in-band*. I found no lane file binding 80–100 for r63. [INFERENCE] considerthese likely quoted a superseded run-6 band; **the verified red failure is r65 (45 < 64 floor), and the trend argument should rest on r65 alone unless the r63 band is re-grounded.** Unresolved: historical prompt state at r63 dispatch time (I can only read the committed file).

## Collision note for the L1

`corpus/lessons/round-65.md:157` says "considerthese **idea 4 (recurrence counts)** did not land" — that is the **2026-10-25** file's idea 4 (recurrence counting / `class-recurrences.sh`). The proposal round 70 mines is the **2026-10-26** file's idea 4 (round-size tracking). Same label, different days, different content — do not conflate when integrating; the r65 non-landing of the 10-25 idea does not cover this one.

## Forward relevance (observed, not proposed)

Frozen `.ufo/waves/round-70/plan.md` ("One v2 wave, 64 distinct build/audit/attack seats") sits exactly at the floor: `.ufo/prompts/kumitate-round-70.md`:217-219 binds "Round size: 64–128 seats in total, every round … **64 is the floor** … never pad". The r65 failure shape (budget notice ends the L1 turn after wave-1 integration; designed wave never dispatched; empty wave dir) is precisely the mechanism by which a floor-sized r70 would land below band without any counter noticing. The criterion's check would be: per wave `<w>-results.json`, sum `.results | length`, print `seats=<N> band=<lo>-<hi>` in the close record.

## Limits

- Did not measure m_flash share (rule no longer binds for r70, see above).
- Did not re-open r63 dispatch-time history; committed prompt bytes only.
- Did not verify considerthese's claim that r65's report was filed before WAVE-DONE beyond reading the appended erratum (fleet report :68); status-neutral to this criterion.
- No execution of any control script; no clone; scratch `/fast/scratch/hyaku/kumitate-r70/K70ScoutConsider4/` never created.
