# Round 71 plan — kumitate (frozen before work lands; Windows host, no AgentSwarm surface)

Base: `e1e8e3047eb4d41c81afa40a43397d3d6b1c619b` (round-70 verifier spot-check commit).
Carry-in first: round-70-verifier-spotcheck routed defects D1–D5 and the counter-side recovery.

## Claim (1) — C1, operability (lowest non-retired axis, 9, integer held): versioned counter
ratchet v3 (`replay71-probe.mjs`, rule R71) fixing the counter-side defects round 70 routed,
with the frozen controls and both prior counters byte-untouched.

Counter-side fixes, each traced to the routed item:
1. V03–V07 exit expectation: accept the controls' real CONTROL-PASS exit (`childExit===0`,
   the tool's own exit-map contract) instead of the base-era hardcoded `=== 1`; add
   inner-verdict consistency (the `control=<mode> … exit=<n>` line must match the inner
   HELD/UNMET verdict) and a `substitutions` deep-equal conjunct.
2. V08 cascade removed: v2's `receipts[0]` is undefined whenever V03 misses, so the
   cross-run arm could never run; v3 keeps the divergence requirements (nonce, stdout
   digest, receipt digest, clean work).
3. V09: local-run exit must equal the receipt-recorded `childExit` (consistency, not a
   hardcoded 1); the ledger probe's seeded L4 battery detail is normalized (fixture tokens,
   per-mutant outcomes and the aggregate `held=` count they feed are seed-derived); the arm's
   detail line reports the true comparison result (v2 printed `DIFFER` whenever the exit
   conjunct failed, regardless of the comparison).
4. V12/V13/fixture budgets: the v2 counter-side timeouts (300 000 ms decoy arm; 600 000 ms
   fixture self-spawn) are replaced with values derived from THIS round's fresh single-run
   measurements (receipts under `measure/`), bounded by the tool's own committed 900 s cap;
   V13's concurrency mode is measured to fit that cap under 2-way contention before it is
   chosen.
5. Frozen set extended: the v2 counter's bytes join the r69 controls/probes, the v1 counter
   and the five receipts as hash-checked frozen history.

Falsifiable before→after:
- before (red): `.ufo/waves/round-70/close/replay70-v2-AT-M-win32.txt` —
  `REPLAY70V2_UNMET held=8/17 checks=17 rev=89cbd998…` with V03–V07 MISS (`exit=0
  digest=ok` — the sole failing conjunct is `rec.childExit === 1`, replay70-probe-v2.mjs:227)
  while the same five controls' committed receipts record `childExit=0` + CONTROL-PASS
  (`close/replay/ctl-*.txt`); V08 MISS is the cascade (`receipts[0]` undefined);
  V09 MISS carries the exit-expectation bug and the misleading detail string;
  V12 `tool-exit=null` at the counter's 300 000 ms kill; V13 `exits=1,1` at the tool's
  900 s cap with mode c1 donothing (measured single-run 643 s standalone).
- after (green): fresh run of `replay71-probe.mjs` at this round's work revision on this
  host → `REPLAY71_HELD held=17/17` exit 0, controls untouched (hash-checked inside the run
  itself), receipts under `close/`.

Do-nothing control: a lane that lands nothing still has v2 at 8/17 — v3-HELD is unreachable
without the counter-side fix (the counter and its registration do not exist).

Sizing: the target is not reachable by a do-nothing control (§9). No exploratory claim.
No wave: this host has no AgentSwarm dispatch surface (L0-noted round 70); work is L1-only.

## Carry-in corrections (maintenance, not claims) — all append-only
- D1: land the round-70 dead pointer `close/replay70-v1-AT-BASE-win32.txt` by re-running the
  frozen v1 counter at base `78b98d76…` on this host under the disclosed adapters (executed
  before this plan was written; the capture is byte-identical to `base/replay70-base.txt`).
- D2: correct the 6/10-vs-5/10 file attribution (6/10 `live=exercised` is
  `close/replay70-v1-AT-M-win32.txt` at rev `3b148380`; the AT-M2 file at rev M reads 5/10
  with an EPERM cleanup-crash tail) — r71 report + SCORECARD correction.
- D3: complete the v2 anatomy — V08's MISS is the V03–V07 cascade (`receipts[0]?.rec`
  undefined), not a resource failure; stated with the byte citation.
- D4: named corrections for the selftest-count drift: SKILL registry row 20/20 → 21/21
  (row correction), knowledge entry quote annotated append-only; the committed receipt
  `close/control-replay-selftest.txt` (21/21) is the authority.
- D5: round-70 report SHONEN box 4 carries `[x]` with no named non-author verifier —
  annotated as `[~]` in this round's report and the SCORECARD correction; filed reports
  are not rewritable by the lane.

## Source work
One new tier-A row (S220) opened this round grounds the budget arm's kill semantics
(spawnSync timeout → child killed → `status: null`), which is exactly the `tool-exit=null`
mechanism v2's V12 exhibited.

## Budget-arm derivation rule (frozen before the v3 run; amended 2026-11-01 after the first
## measurement — the original one-step rule is kept in git history of this file's commit)

The r70 tool commit `89cbd998` set the tool's per-mode cap to 900 000 ms from that night's
measurements (max 787 137 ms). This round's first fresh measurement under that cap:
`measure/m1-c1-donothing.txt` records `childExit=-1 childSignal=SIGTERM durationMs=900046`
— the control did NOT finish inside the committed cap on the host as it stands now, so the
cap is an assumption, not a measurement. The rule is therefore two-step, measurement-only:

1. Scaffold: raise the tool cap to 2 400 000 ms (generous, named, no claim), then measure
   to completion: c1 donothing, c1 autoledger singles, and the 2-way c2 donothing
   concurrent pair. Receipts under `measure/`.
2. Final: `toolBudget = ceil(1.25 × maxSingle / 60 s) × 60 s` where maxSingle = max
   durationMs over the scaffold singles; the pair evidence must satisfy
   `pairWallMs < toolBudget` or the next lighter mode is chosen (recorded). The tool cap
   lands at the final value with a dated comment citing the receipts; `pin.control-replay`
   is re-pinned in the same commit (r70 precedent: `89cbd998`). Counter-side waits =
   `toolBudget + 60 000` ms; the concurrency failsafe = 2 × that. Every constant cites its
   receipts in the counter header. If a control still cannot finish inside the scaffold
   cap, the round reports that honestly and the claim does not verify.
