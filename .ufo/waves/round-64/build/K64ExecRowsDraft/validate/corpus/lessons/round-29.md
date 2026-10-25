# Round 29 — the off-by-one, root-caused; integrations refreshed honestly (2026-10-14)

Free-craft round; two queued cite-check items, one lane (same file), plus a
verify lane.

## What landed

- **The off-by-one, root-caused and fixed.** The rounds 27-28 measurement
  said `off` was token-start −1; the root cause was worse: `off` was
  `span.start` for EVERY span token — −1 for a first token, but the whole
  span start for later tokens in multi-token spans (latent, unmeasured).
  Fix: tokens are consumed as regex runs over the unwrapped span view, with
  offsets mapped through the view-index → docText-byte table. Verify-lane
  probe (instrumented copy): **4128/4128** span-tokens satisfy
  `doc.slice(off, off+token.length)===token`; the marker window tightened
  3 → 2 chars.
- **The gate's semantics did not move**: the error set is byte-identical
  (703→703 symbols, 543→543 plain; zero vanished errors/warnings). Two
  note-level corrections: a lost citation the round-28 record named as real
  (`aggregator-audit:118` `:36`) now rebinds to its true owner
  (`fleet-dispatcher.mjs:36`), and a spurious duplicate AMBIG vanished.
- **`--integrations` refreshed 4/9 → 6/9**: the sample list updated to the
  current tree (`queue.mjs` → `surface.mjs`; `main.rs:906` → `L95`;
  indexSize computed live = 1743, not the frozen 8124). The 3 residual reds
  are **doc-repair items, not tooling** (F1 the historical GateDecision
  pointer, F3 the stale `44a3c781` content pin, F4 fifteen primeagent line
  refs) — queued for a doc-repair lane, deliberately not weakened.
- Selftest 58 → **62/62** (+4 cases pinning the slice invariant, with
  before/after proofs: the old code fails exactly the new cases).

## Godspeed verdicts

- **operability — improved**: the scanner is exact at the root; the
  integration group's tooling half is green.
- **calibration — improved**: a latent misalignment (whole-span offsets)
  removed; one real citation recovered.
- **quality — improved**: verify-lane probe + no-permissiveness audit both
  clean; the 6/9 shortfall is named scope, not hidden.
- **coverage / freshness — unchanged.**

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 62/62;
    `--selftest --integrations` → 6/9 (the 3 named doc-repair reds);
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (errors 543,
    unchanged); `node scripts/proxy-check.mjs` bare → six carried OMP terms
    only; `kimi-census.mjs` CLEAN 49.
  - Next queue, named: the doc-repair trio (F1/F3/F4); the multi-line
    backtick class (round 28's queue); the contract-bump judgment
    (header still reads v1.5).
