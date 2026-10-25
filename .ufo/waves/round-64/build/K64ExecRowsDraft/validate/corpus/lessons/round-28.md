# Round 28 — the «» grammar lands; the record it was commissioned from was wrong (2026-10-14)

Free-craft round; the named queue item from round 26: restore the multi-line
`«…»` coverage loss. Fix lane + verify lane. The round delivered something
better than its commission: a corrected record.

## What landed

- **`«…»` span extraction** in `cite-check` (after fence masking, before
  line-local backtick pairing): a paired quote is one span, cross-line by
  design; a lone `«` stays prose; the no-double-count invariant partitions
  every byte (an enclosing backtick span drops quote bytes from its raw; a
  quote drops a nested backtick span); `spanIndexAt` prefers the innermost
  containing span. Selftest 50 → **58/58** (+8 cases; the mutation control
  with quote extraction disabled scores 55/58 with exactly the quote cases
  failing). **Zero vanished findings at any severity** — the verify lane's
  key-set diff is 981=981.
- pin.cite-check re-pinned.

## The verify lane's DEFECT is the lesson

The round's expectation — the round-26 losses (~+30/+12) returning — was
**refuted by measurement**, and the refutation corrects the round-26 record:

1. `round-6-aggregator-audit.md` contains **zero `«`** — its loss is
   multi-line *backtick* spans (19 odd-backtick lines), a different,
   still-open defect class, now precisely named with its 5 real lost
   citations (`AXES.md`, `SKILL.md`, `corpus/`, `loop-driver.md`,
   `fleet-dispatcher.mjs:36`). A «»-only change cannot and did not touch it.
2. `kimi-binary-secrets.md`'s round-26 −30 was **mostly emphasis noise**
   (`**OBSERVATION**`, `**600**`) that only ever landed in spans because
   whole-doc pairing drifted across lines — the round-26 parity fix
   correctly removed it; restoring it would re-add noise.
3. Actual restoration: +2 findings (`<token`, `cache?.latest`) + structural
   span invariants; 7 in-quote prose tokens moved from the prose census
   into spans (measured, accepted consequence).

The multi-line-backtick class is queued with its tradeoff stated: allowing
continuation is ambiguous with stray backticks (the round-26 parity class
itself); any future rule must distinguish citation-shaped continuations
from emphasis runs — deliberately not attempted inside this round.

## Godspeed verdicts

- **operability — improved**: 58/58 with mutation control; sound nesting.
- **calibration — improved**: the round-26 record corrected by measurement;
  the verify lane's DEFECT kept rather than smoothed.
- **quality — improved**: zero-permissiveness proven twice (fix + verify).
- **coverage — unchanged** (the actual loss class is named, not fixed —
  honest).

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 58/58;
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (errors 543,
    warnings 438, both unchanged); `node scripts/proxy-check.mjs` bare →
    six carried OMP terms only; `kimi-census.mjs` CLEAN 49.
  - Next queue, named: the multi-line-backtick class (5 lost citations,
    tradeoff stated); the span-scanner off-by-one root cause; the stale
    `--integrations` sample list (4/9, pre-existing).
