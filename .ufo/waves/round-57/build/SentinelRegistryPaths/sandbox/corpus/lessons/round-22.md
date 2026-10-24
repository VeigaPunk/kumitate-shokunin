# Round 22 — the distinct-member tightening; the drop that didn't come (2026-10-13)

Free-craft round under the godspeed directive; the measured state argued for
the standing plan: the occurrence-based `K_sections` (52) was known to
over-credit (duplicate-one/drop-one hole), and the distinct-member tightening
was pre-registered in round 21.

## What landed

- **`K_sections` = distinct members named in sections** (`proxy-check.mjs`,
  +247/−54): canonical 49-member identities (same identity space as
  `kimi-census.mjs`), full-path binding wins, ambiguous basenames bind to none
  and warn (`K_SECTION_AMBIGUOUS`, new kind — 0 live); selftest 92 → **98/98**
  (+6, incl. the duplicate-one/drop-one mutation that must lower the
  numerator). `pin.proxy-check` re-pinned.
- **The anticipated honest drop was refuted by measurement.** The
  pre-registration expected ~30 distinct members ⇒ score 6. Measured: **49/49
  members are named** — the round-21 sectionization wave had already put a
  heading on every member. The round-21 "~30 distinct members" limit line was
  a mis-estimate (it counted sections-per-note loosely); corrected here and
  flagged to the round-21 lesson's wake. Score holds at **10**;
  `floor(10 × 49/49)` = 10 is now arithmetically saturated at the member
  ceiling — further movement needs `C1k` honesty or more members, not more
  sections.

## Godspeed verdicts (this round)

- **operability — improved**: the term's known hole is closed by machine
  check (mutation-tested), 6 new hermetic cases, a new warn arm. No axis
  integer moves (the proxy's `A`/`C` unchanged).
- **calibration — improved**: the score now means what it says (distinct
  members), and a false limit ("~30 distinct") was removed from the record.
- **coverage:kimi-layer — unchanged (10)**: not a failed move — a refuted
  forecast, which the scorecard prefers to a silent fit.

## Gate

- ## Gate
  - What would falsify this lesson: a K member with no naming heading (the
    implementer's sweep says 0 unnamed), an ambiguous basename not warned,
    or the mutation cases passing on the old occurrence logic.
  - Re-run: `node scripts/proxy-check.mjs --src ~/Projects/ufo-fsd-alpha
    --selftest` → 98/98; live → K 49/49, coverage_kimi 10, only the six
    carried OMP layer DRIFTs; `kimi-census.mjs` CLEAN 49.
  - Carried debt unchanged: OMP re-census parked with S2.
