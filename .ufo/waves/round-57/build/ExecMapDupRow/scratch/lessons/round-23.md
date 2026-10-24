# Round 23 — gate repairs: the honest gate costs a red checklist item (2026-10-13)

Free-craft round; the measured state argued for the two queued operability
defects — the `cite-check` fence misalignment (round 16, reproduced twice)
and the dead `--src` default across the gates (the origin tree moved
2026-10-12; every bare invocation failed closed).

## What landed

- **Fence fix** (`cite-check.mjs`, +146/−7): marker-symmetric fence
  detection (``` closes ```, ~~~ closes ~~~, no cross-closing) and
  mask-before-scan (fence byte-ranges blanked to spaces, offsets preserved).
  Selftest 20 → **26/26** (+6: the round-16 repros verbatim, cross-closing
  both directions, unclosed-EOF, alignment self-heal); 3/3 mutation arms
  prove both halves load-bearing.
- **`--src` derivation** in `proxy-check` / `claims-check` / `surface-probe`
  (round-17 precedent: `$UFO_SRC` → first existing candidate; fail-closed
  preserved, never a scored zero): selftests +4 each (**102/102, 39/39,
  42/42**), lazy resolution (hermetic suites stat no live path), precedence
  verified flag > env > candidates. Bare invocations now reach the tree —
  the checklist's three origin items are runnable without flags again.
- **Four pins re-pinned.**

## The census — what the honest gate sees

Repo-wide, old vs new on the same tree (reproduced twice): 67 docs, newly
surfaced **123 errors + 59 warnings** (top: session-state 38, modes
20, skills-plugins 17, remaining-scripts-census 17, binary-secrets 14,
config-plane 13, residue 3, member-claims-gate 1; kinds: UNRESOLVED 114,
PIN_MISMATCH 7). Concrete rescue: a bin/kimi pin the misalignment had left
`PIN_UNTYPED`-unchecked now reads PIN_MISMATCH against its true owner —
**dead citations and false pins were being smuggled past the gate by its
own geometry**. Residual: 13 previously-OK citations now unreported
(pairing parity flip in docs with escaped backticks) — the gate got
stricter and slightly blinder in the same files; line-local pairing is the
follow-up candidate.

## Godspeed verdicts

- **calibration — improved**: 123 hidden findings surfaced, a false-pass
  geometry removed, mutation-proven.
- **operability — improved, with one named regression**: bare gate runs
  work; the `citation gate verdict` checklist item reads DRIFT (errors 396 →
  519) **until the triage round** — a checklist item went red because the
  gate became honest, and that is recorded rather than smoothed over.
- **coverage / freshness — unchanged.**

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 26/26;
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (519, census above);
    `node scripts/proxy-check.mjs` (bare) → DRIFT = six carried OMP layer
    terms only; `--selftest` 102/102; `claims-check` bare → its carried
    DRIFT; `kimi-census.mjs` CLEAN 49.
  - Next round's queue, named: triage the 123 surfaced errors (the kimi-*
    share is this lane's; remaining-scripts-census is carried OMP debt);
    the pairing-parity residual; the stale `--src` literals at
    cite-check:78 and round-gate:142.
  - Carried debt unchanged: OMP re-census parked with S2.
