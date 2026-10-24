# round-15 — the last uncovered registry family, and the axis it saturates

## What the round did

`R11` — the runtime remainder (`crates/ufo-core-runtime/src/*.rs` minus the 51
files named by `R1`–`R10`, 42) plus the CLI crate (5) — was named at internals
level: **47 of 47 members, 24,874 L**, one `## ` section per member in
`corpus/knowledge/runtime-remainder-census.md`, each with a live own-file anchor
and a verbatim symbol. `C1` moved **18/19 → 19/19** and `C2` **48/48 → 50/50**,
so the frozen aggregate went **9 → 10** — its terminal value — and `coverage` was
**retired as saturated** with two successors declared.

Measured before → after (same tools both sides):

```
before  PROXY: MATCH (A=5 C=10 operability=8; C1=18/19 C2=48/48 coverage=9; pins=5 match)
after   PROXY: MATCH (A=5 C=10 operability=8; C1=19/19 C2=50/50 coverage=10; pins=5 match)
before  CLAIMS: MATCH (rows=19 yes=18 notes=26 sections=90 adv=16)
after   CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=137 adv=16)
gate    --row R11 → CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=47 adv=0)
```

`adv=16` before **and** after is the point: the round closed the last `no` cell
without adding an advisory, because the new row is the only 47-member row written
entirely in section form. The 9 topic-form rows (S1–S5, R1, R2, R5, R7) are still
note-existence-only, which is why the successors' honesty term exists.

## Why the split did *not* land in the same round

The round-14 pre-registration said the split `must` follow `R11` and fixed the
partition — but not the terms ("each keeping its own C1/C2 pair"). Measured
against the tree, that form is terminal: `C2_layer` is 1.0 by construction
(every note a layer's rows reference already has a README row), so both
successors would have read `floor(10 × 1.0 × 1.0)` = 10 under two new names. A
split that reproduces the number it replaces is the failure the lane's own
`## Limits` names, so the pre-registration's fallback was taken: `R11` landed
alone, `coverage` retired, successors declared with their terms written down in
`## Planned` for round 16 to measure. Kasegi's stated test
(`kasegi-shokunin/SCORECARD.md:69-78`) is the one applied: a split must expose a
worse number, not conceal it. The forecasts (6 and 6 against the retired 10) are
labelled arithmetic, not measurements.

## What the round found beyond the census

1. **`R1`'s members were unenumerated.** The cell read ``8 `native*.rs` core
   modules`` — a glob matching 26 files in the crate — so `R11` could not be
   subtracted from the registry at all. The 8 are *forced* (93 − 43 (`R2`–`R10`)
   − 42 = 8, and the same set is exactly the `native*.rs` files the judge-pipeline
   note mentions ≥2×; both sorted lists hash identically), and the cell now names
   them. Registry text only: no scored term moved (`R1` stays one `yes` cell).
2. **`comm` is not a comparison across collations.** The member list is
   `en_US.UTF-8`-ordered, which is not C order: the same `comm -3` printed empty
   on one run and a bogus `round.rs` line plus `comm: input is not in sorted
   order` on the next. Both sides must be `LC_ALL=C sort`ed; the C-collated diff
   is empty and the sorted copies hash identically. Recorded in the note's probe
   section so the next re-census does not rediscover it.
3. **The gate's sensitivity, measured rather than assumed.** Eight doctored
   fixtures against the real tool: absent note → `NOTE_MISSING`; a note naming
   1 of 3 declared members → `MEMBER_COUNT_DRIFT`; anchor past EOF and a blank
   anchor endpoint → `SECTION_DEAD_ANCHOR`; no verbatim symbol →
   `SECTION_NO_SYMBOL`; a section outside the cell's declared patterns → warn
   (`--strict` promotes); an ambiguous basename → `SECTION_FILE_AMBIGUOUS`; a
   non-path-like heading → silently skipped. 8/8 behaved as the tool's header
   claims, and a missing `--src` failed closed (exit 2).

## L2 fleet (10 lanes, one batched dispatch)

Routing per the fleet map: `planner` + `connector` (`@m_lunamax`),
`kx-executor` ×3 + `kx-scout-flash` (`@m_flash`), `kx-reviewer` + `critic` +
`kx-labrat` + `kx-distiller` (`@m_zfl`). The census was split three ways into
scratch, then assembled by L1 and verified by the gate; the boundary was
reconstructed independently and diffed (`comm -3` empty); the gate was armed on
doctored fixtures; a cross-lane scan found no contested scope and no R11
basename overlap.

## Gaps this round leaves open

- The successors are **unscored**: between rounds 15 and 16 the scorecard carries
  one live integer (`operability` 8) and one retired terminal value.
- The census prose is not gated — shape, never sentence truth — and 9 rows remain
  note-existence-only.
- The file-level residue moved **196/211 ≈ 0.929 → 201/211 ≈ 0.952** in this
  round: the census names 5 basenames no earlier note carried
  (`bounded_fixture.rs`, `bounded_fixture_tests.rs`, `proposal_tests.rs`,
  `provenance.rs`, `provenance_tests.rs`) and the uncited remainder is now 10.
  The diagnostic is not scored, so no proxy term moved. Re-measuring it also
  found rounds 13–14's recorded `195/211` to be the round-13 corpus: the same
  walk over the pre-round-15 corpus reads `196`, and `195` only with
  `lessons/round-14.md` and the third-party
  `lessons/round-9-aggregator-corpus-verdict.md` excluded.
- The origin tree keeps moving under the citations: 36 dirty paths at the round's
  opening read, 37 at the note's, HEAD unchanged at `93798be12` — the census
  records the reading and must be re-probed, not trusted, on a future re-census.