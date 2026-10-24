# Round 26 — line-local pairing: the parity class dies, the debt shows its full size (2026-10-13)

Free-craft round; the named candidate from round 23's accepted-residual
record. One fix lane + one verify lane, same shape as round 25.

## What landed

- **Line-local span pairing** in `findSpans`: backticks pair left-to-right
  within a line; an odd line leaves its last backtick unpaired; no span
  crosses a newline; escaped backticks (`\``) are literals, not delimiters.
  Selftest 34 → **41/41** (+7 cases; the restored whole-doc grammar scores
  36/41 with exactly the new cases failing — load-bearing).
- **The parity class is gone**: replaying r22→r23→new against the round-23
  tree shows **36** lost citations restored (the recorded 13 was a floor);
  concrete rescues include executable-scorecard's `SCORECARD.md` /
  `corpus/README.md` citations.

## The measured blast radius — bigger than the forecast, and honest about it

Errors 420 → **554**. The verify lane's adjudication:

- **True positives, dominant**: remaining-scripts-census +88 and
  route-probe-cluster +32 are citations to files the upstream restructure
  DELETED (`atomic-write.mjs`, the probe test suite, `ufo-sighting-lib/queue.mjs`)
  — the carried OMP debt is now *fully* visible, not partially hidden by
  geometry. This is the same named debt class, at its true size.
- **False positives, named**: `.mjs/.rs/.sh/.js` extension lists (2 sites),
  runtime-artifact tokens (`.session-retention.lock`), binary-internal paths
  — a classification follow-up, queued.
- **Named coverage loss**: multi-line inline spans — the house `«…»`
  verbatim-quote style wraps across lines — now read as prose (~5 warnings +
  ~30 notes unreported). Disclosed in the tool docstring; the re-anchoring
  decision (teach the grammar paired `«»` blocks, or reformat the corpus) is
  queued, not silent.
- **The gate never got permissive**: the verify lane's explicit audit found
  **zero vanished errors**; every file's error count moved up or not at all.

## Godspeed verdicts

- **calibration — improved**: the parity class removed at the mechanism
  level; TP/FP separated with names; the debt's true size measured.
- **operability — improved**: 41/41 with mutation control; stricter in the
  honest direction.
- **quality — improved** (verify lane): the no-permissiveness audit and the
  13-was-a-floor replay are the deliverables.
- **coverage / freshness — unchanged** (the corpus coverage loss is a named
  queue item, not a silent regression).

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 41/41;
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (errors 554,
    composition above); `node scripts/proxy-check.mjs` bare → six carried
    OMP layer terms only; `kimi-census.mjs` CLEAN 49.
  - Next queue, named: the FP classification pass (extension lists, runtime
    artifacts); the `«»` multi-line decision; the now-full-size OMP citation
    debt (census 144, route-probe 57 — with the parked re-census); the stale
    `--integrations` sample list.
