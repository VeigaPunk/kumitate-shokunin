# round 38 — anchor-truth gate design (L1, pre-wave; attack surface for wave 1)

Problem (round-37 closure `corpus/lessons/round-37-verifier-spotcheck.md`, routed R1–R3):
`claims-check --fidelity --fidelity-ratchet` cannot go red at landing. Its per-note ceilings
in `.ufo/pins/fidelity-ratchet.json` equal the current `nonok`, so they sum to the current
debt (200). It pairs by a 14-character adjacency heuristic, so multi-anchor runs such as
`` `a` / `b` (`:1`, `:2`) `` fall to `noid` and are never checked. Its CLEAN line is not anchor
truth: 144 gate `nonok` against 202 closure-false anchors in the four notes below.

## Scope

The registered notes (`corpus/knowledge/`): `remaining-scripts-census.md` (S8),
`route-probe-cluster.md` (S7), `sighting-wall.md` (S4), `native-trial-launch.md`. Together
they hold 811 anchors.

## Gate: `scripts/anchor-truth.mjs`, contract `kumitate-anchor-truth-v1`

Anchors. Every backticked `path:N`, `path:N-M`, `:N` or `:N-M` span outside fenced code. A
bare `:N` resolves to the most recent repo-relative path (contains `/`, does not start with
`.`), set by headings and by path spans. Escaped backticks are honoured, and spans may wrap
lines.

Pairing (proposal only, never the verdict's authority). Within a sentence, the symbols seen
since the last anchor run pair **positionally** with that run: the last k symbols go to the k
anchors of the run, left first. With no preceding symbol, the next symbol in the sentence is
used. A next-symbol shift therefore reads false.

Expectations are pinned per anchor in `.ufo/pins/anchor-truth.json`. Each entry carries the
note, the anchor ordinal, the raw span, the resolved path, the check token, the token source
and the expected status:

- `token` is the heuristic pairing, or a reviewed override.
- `source` is `pair` or `review:<seat>`.
- `expect` is `true` or `debt:<reason>`.

An override token must occur word-bounded on the cited line(s) **and** in the note's own
sentence text, so a review cannot attach an arbitrary word. The pin also records the
`kumitate-origin-pin-v1` revision.

Verdict rules (exit 1 = `TRUTH: DRIFT`):

- `REGRESSED`: an anchor expected `true` whose token is not on its cited line(s).
- `ANCHOR_SET_CHANGED`: a note's anchor count or raw span sequence differs from the pin.
  Re-pin required.
- `DEBT_STALE`: an anchor recorded as debt that now reads true. The pin must shrink, so
  burn-down is recorded, never silent.
- `DEBT_GREW` (with `--base <rev>`): the pin at `<rev>` (read via `git show`) has a smaller
  debt count for any note, or a key expected true there is debt now. This is the monotonic
  arm a hand-edited pin cannot pass.
- `OVERRIDE_INVALID`: an override token missing from the sentence or the line.

Exit 2 (could-not-evaluate) covers a missing pin, a missing source clone, or a source
revision ≠ the pinned revision.

`--write-pin` regenerates the pin and refuses (exit 1) when any key expected true in the
existing pin would become debt.

Self-test (`--selftest`, mkdtemp fixtures only, expected ids committed in the script): CLEAN
true fixture; next-symbol shift → `REGRESSED`; a positional run, then the same run swapped →
`REGRESSED`; debt grown vs base → `DEBT_GREW`; fixed debt left in the pin → `DEBT_STALE`;
override token absent from the sentence → `OVERRIDE_INVALID`; dead line → debt-only; pin
revision mismatch → exit 2. Mutation targets: right-first pairing, a disabled `DEBT_GREW`
arm, a disabled sentence check for overrides — each must turn the self-test red.

Known limits, stated before the wave: symbol-on-line truth is lexical, not semantic. A token
on the line does not prove the sentence's prose is right. The semantic check is the wave-1
review of every moved anchor, and the wave-2 attack.
