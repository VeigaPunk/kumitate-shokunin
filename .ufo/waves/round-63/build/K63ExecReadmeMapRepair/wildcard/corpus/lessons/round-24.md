# Round 24 — the triage round: 105 of 106 repaired, and what the queue taught (2026-10-13)

The round-23 census named this queue: 123 errors surfaced by the honest
gate, of which 106 sat in the lane's seven kimi-* notes + member-claims-gate.
Five lanes (3 hyper, 2 zai) worked it; every lane iterated its files to zero
under both the working-tree and the HEAD-frozen tool.

## Result

105 repaired, **0 left in scope** — session-state 38→0, skills-plugins
17→0, binary-secrets 14→0, config-plane 13→0, residue-files 3→0,
member-claims-gate 1→0. Modes-machinery reads 20→**1**: the last error is
`swarm/SKILL.md` inside a verbatim skill-doc quote, and repairing it means
altering quoted bytes — the documented floor of the repairable, not an
oversight. All 105 were citation-form; two content-level discoveries were
recorded as errata, not silent fixes.

## What the queue taught (defects in the GATES, found by triaging the notes)

- **Alias poisoning** (`cite-check` ALIASES binds the bare word `base` → the
  origin tree's `base.mjs`): two innocent prose uses of "base" became that
  citation and its sticky-owner fallback then hashed **all seven** `@sha256`
  pins in binary-secrets against the unrelated file. The pins themselves are
  TRUE — `sha256sum` against the live binaries reproduced them exactly. The
  pins now read honest `PIN_UNTYPED` (HOME paths cannot be hashed from the
  source tree), and the alias-poisoning fix is queued for a tool round.
- **Directory-context cascade**: a full path written adjacent to a bare
  basename makes the tool resolve the basename *under that directory*,
  cascading 32 LINE_OORs from one prose site. Repaired by rewording the
  mention; the verbatim quote stays byte-identical.
- **A real claim error caught by form**: modes-machinery §4.1 called
  `swarm`/`tower` "real dirs under `~/.agents/skills`" — they are symlinks
  into `~/Projects/ompskills/.omp/skills/`. Corrected by erratum (append-only
  discipline), body untouched.

## Also landed (FIX E)

The last two stale `--src` literals (cite-check, round-gate) now carry the
round-23 derivation: selftests **29/29** and **60/60**, bare invocations
reach the tree, fail-closed preserved. Every gate in the lane now derives its
origin default.

## Godspeed verdicts

- **quality — improved**: 105 real citation defects gone; every fix
  verified against a frozen tool as well as the live one.
- **calibration — improved**: two gate-internal defects (alias poisoning,
  directory-context cascade) named with mechanisms; a false claim corrected
  by erratum.
- **operability — improved**: all six gates runnable bare; two more pins
  honest.
- **coverage / freshness — unchanged.**

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --src ~/Projects/ufo-fsd-alpha
    --json` → repo errors **414** (was 519); every `kimi-*` note 0 except
    modes-machinery's 1 documented quote-floor; residual = SKILL.md 9 +
    README 24 + remaining-scripts-census (carried OMP-move citations, the
    re-census debt). Selftests: cite-check 29/29, round-gate 60/60.
  - Next queue, named: the alias-poisoning fix; the SKILL/README OMP
    citation triage (with the parked re-census); the quote-floor decision
    (leave vs. reformat the quote with an ellipsis).
  - Carried debt unchanged: OMP re-census parked with S2.
