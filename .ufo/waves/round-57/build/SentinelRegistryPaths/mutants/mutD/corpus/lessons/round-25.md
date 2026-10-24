# Round 25 — alias poisoning removed, and the value of a verify lane (2026-10-13)

Free-craft round; the named candidate from round 24's queue: the
cite-check alias-poisoning defect. One fix lane (hyper) + one independent
verify lane (hyper, read-only) — the verify lane caught a mid-edit broken
cut (31/34) and held its verdicts until the tool settled.

## What landed

- **Alias expansion requires citation shape** (`aliasCited(word, hasRef)`):
  a backticked alias word with no attached `:N` ref is prose and never
  mints a citation; `base:1233` shorthand still expands. Selftest 29 →
  **34/34** (+5 alias cases; a reverted-gate control scores 32/34 with
  exactly the negative cases failing — the cases bite).
- **~230 refs rebound to their correct owners** across the OMP notes
  (ops-watchers alone: 149 refs → `ufo-stale-watchdog.mjs`, 168 →
  `ufo-l0-monitor.mjs`, where the old bare-`dispatcher` alias had captured
  them all).
- The 7 pins from round 24 stay honest `PIN_UNTYPED` (verified true against
  live sha256 in round 24; unchanged kinds after the fix).

## The accepted deviation — honest surfacing, not a regression

Errors 415 → **417**. Both new errors are `remaining-scripts-census.md:429`
refs (`:3983`/`:4094`) that only ever "passed" because the prose word
"dispatcher" poisoned the owner stack into rescuing them; they are stale
OMP line numbers, genuinely out of range against the current tree. The
verify lane characterized them as true positives; suppressing them would
mean keeping the poison. The file is carried OMP debt (the parked
re-census owns the proper repair).

Also recorded: the round-24 baseline was 415, not 414 — the difference is
this round's own lesson quote; and the fix generalized to `cli`/`dispatcher`
per the round-24 spec, which is what produced the wide rebound.

## Godspeed verdicts

- **calibration — improved**: false PIN_MISMATCHs eliminated at the
  mechanism level; ~230 citations now bind their real owners; true
  positives surfaced, not hidden.
- **operability — improved**: 34/34 selftest with mutation control; the
  gate got stricter and noisier in the honest direction.
- **quality — improved** (via the verify lane): a broken mid-edit cut
  caught before integration; deviations flagged, not glossed.
- **coverage / freshness — unchanged.**

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 34/34;
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (errors 417, the
    +2 named above); `node scripts/proxy-check.mjs` (bare) → the six
    carried OMP layer terms only; `kimi-census.mjs` CLEAN 49.
  - Next queue, named: the remaining-scripts-census stale refs (with the
    parked re-census); the SKILL/README OMP-citation triage; the
    quote-floor decision.
