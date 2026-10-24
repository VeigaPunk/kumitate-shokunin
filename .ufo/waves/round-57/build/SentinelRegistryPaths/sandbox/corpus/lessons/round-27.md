# Round 27 — FP classification, and why shape beats window (2026-10-13)

Free-craft round; the named queue item from round 26: ~5 false-positive
UNRESOLVEDs. One fix lane + one verify lane.

## What landed

- **`FP_EXEMPT` exact-shape exemptions** in `cite-check` (before the
  UNRESOLVED arm, each its own class, graded note — never error, never
  dropped): extension-list (`.mjs/.rs/.sh/.js` enumerations), runtime-artifact
  (dot-file run-state names + the round-27 adjudicated set), binary-internal
  (`src/…` strings-region citations). Selftest 41 → **50/50** (+9).
- **Conservation proof**: 15 UNRESOLVED/errors replaced 1:1 by FP_EXEMPT
  notes at the same file:line; a full-finding-set diff shows zero other
  movement; the verify lane independently confirmed **0 vanished real
  citations** and that the negative guards still bite (dead paths and slash
  lookalikes still error — the exemptions are not a backdoor).
- **Scope honesty**: 15 findings exempted against ~5 named — the extra 9
  (`audit-env.sh` ×7 stray-scratch, `summary.txt` harness output,
  `l0-watch-state.json` run-state) each adjudicated with evidence this round.

## The repair saga — the actual lesson

The verify lane found the binary-internal 200-char context window was a
**latent permissiveness hole** (a real dead `src/…` path could be exempted
because a strings mention preceded it within the window, even across lines).
The first repair — scope the window to the token's own line — **broke the
one genuine token** (its strings mention sits on a wrapped paragraph's first
line; the token's line has no context). The durable fix is **shape, not
window**: a byte-offset marker immediately after the token (`at byte N` /
`(byte N)`) — the corpus's strings-citation convention, which proximity
cannot mimic. Window-based classification failed in both directions (too
wide → false exemptions; too narrow → false errors); a structural marker
fails in neither.

Also recorded: a systematic off-by-one in span `off` (token-start −1,
measured by debug harness) worked around inside the marker window; its
root cause in the span scanner is queued.

## Godspeed verdicts

- **calibration — improved**: 15 false errors gone with exact conservation;
  FPs and TPs cleanly separated by shape, not judgment.
- **quality — improved**: the verify lane's latent-hole catch changed the
  design (window → marker); the overcorrection was caught by the gate within
  one run (the genuine token's error came back immediately).
- **operability — unchanged to improved**: 50/50 selftest; guards proven.
- **coverage / freshness — unchanged.**

## Gate

- ## Gate
  - Re-run: `node scripts/cite-check.mjs --selftest` → 50/50;
    `cite-check --src ~/Projects/ufo-fsd-alpha` → DRIFT (errors 543, was
    558); `node scripts/proxy-check.mjs` bare → six carried OMP terms only;
    `kimi-census.mjs` CLEAN 49.
  - Next queue, named: the span-scanner off-by-one root cause; the stale
    `--integrations` sample list (4/9, pre-existing); the parked OMP
    re-census (the remaining debt: census 144, route-probe 57, gate-verdict,
    native-judge-pipeline, runtime-remainder-census — all citing the
    restructured tree).
