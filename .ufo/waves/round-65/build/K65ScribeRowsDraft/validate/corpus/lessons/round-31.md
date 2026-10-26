# Round 31 — the multi-line-backtick class, resolved doc-side; the goal's final round (2026-10-14)

Free-craft round; the last named candidate. One repair lane + one verify
lane, then the close-out.

## What landed

- **The 5 named citations restored, doc-side**: the round-28 tradeoff
  (pairing-grammar continuation vs the parity class) was resolved without
  touching the grammar — each citation site reformatted so the citation
  sits in a single-line backtick span. Root cause confirmed en route:
  prose tokens never emit findings in `cite-check` (`:1412-1426`), so a
  citation that leaves its span silently leaves the census — the doc-side
  fix is the only honest one that does not reopen the parity class.
- **Findings delta: +5 notes, zero vanished** (pre/post key-set diff ∅;
  error/warn byte-stable at 3/3). All 5 targets now report: `AXES.md`,
  `SKILL.md` ×2, `corpus/`, `loop-driver.md`; `fleet-dispatcher.mjs:36`
  was already recovered by round 29's off-by-one fix (the round-28 record
  named 5 losses; only 3 were still missing at the round-30 baseline —
  recorded). One site (`:118`) was left byte-exact: making it contiguous
  would have altered quoted bytes, and it was never a multi-line loss.
- **Verify lane: no DEFECT** — 5/5 citations report, zero vanished,
  quoted bytes byte-identical modulo whitespace, prose meaning preserved.
  Caveat recorded: ~7 further recoverable citations at other multi-line
  sites in the same file (named, outside the round's scope — the parked
  re-census or a future round owns them).

## Godspeed verdicts (the round)

- **quality — improved**: the named class resolved without grammar risk;
  zero collateral.
- **calibration — improved**: the "5 losses" record corrected (3 were
  already recovered); the prose-token census hole (`:1412-1426`) named.
- **coverage — improved**: +5 findings, the class's named sites closed.
- **freshness / operability — unchanged** (tool untouched, 62/62 held).

## The goal's close — kumitate at 10 of 10 (strict count)

Rounds 22–31, ten verified rounds under this goal: the K-registry from
zero to 49 members machine-censused (`coverage:kimi-layer` 4 → 10,
saturated honestly); six gate tools hardened (fence masking, alias
citation-shape gating, line-local pairing, «» quote grammar, the
off-by-one root fix, FP exact-shape exemptions — selftest 20 → 62/62);
the citation surface triaged from 519 to a measured, adjudicated set;
`--integrations` 4/9 → **9/9** for the first time since the restructure.
Carried debt, unchanged and named: the OMP-side re-census (six layer
terms + the superseded-revision notes) — parked by operator directive
from the first goal, owned by no round since.

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 62/62;
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (errors 542);
    `--selftest --integrations` → 62/62 + 9/9; `node scripts/proxy-check.mjs`
    bare → six carried OMP terms only; `kimi-census.mjs` CLEAN 49.
