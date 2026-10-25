# Seat K63R2CriticC1Stub

VERDICT: CONFIRMED at the integrated revision a9531c8e617338fd16cb69c61344ef8f17711117 — a 25-line stub tool plus hand-written waves, controls, SCORECARD row and tip receipt reads `INLINE63_HELD held=6/6` exit 0 through the frozen counter, and a supplementary cross-check (`i63-crosscheck.mjs`) closes the I1/I2 self-certification for this stub class (UNMET on the stub fixture, HELD on a9531c8) without touching the frozen probe.

## Evidence

All work in `/tmp/kumitate-r63/K63R2CriticC1Stub/` + a fixture repo built from `git archive a9531c8` (fixture rules: mktemp dir, throwaway identity, `rev-parse --show-toplevel` == dir before first commit, commits only inside the fixture). No frozen file edited; no host write; no tool installs.

**E1 — frozen probe on the stub fixture (M=6ee5f406…, T=455b1956…):**
```
$ node .ufo/waves/round-63/probe/inline63-probe.mjs /tmp/kumitate-r63/K63R2CriticC1Stub/fixture 6ee5f406c8df0758d194396d73b2e6b4ac34ccb1 455b1956e660c50d2f46671e0200c0c6b3b9c852
INLINE63_HELD held=6/6 checks=6 rev=6ee5f406c8df0758d194396d73b2e6b4ac34ccb1 rule=I63
exit=0
```
Fixture contents: `scripts/inline-dispatch-evidence.mjs` replaced by the 25-line stub (21 lines, blob `4bff14da…` in M; prints `INLINE_DISPATCH_SELFTEST: PASS (25/25)`, `INLINE_DISPATCH: CLEAN (seats=32 …)`, and the two DRIFT lines when `--sessions-root` is empty / `--dispatcher-log` is empty, exit 0/1 as the probe expects); hand-written `w1/w2-results.json`, `w1/w2-dispatch.json`, `w1/w2.ready`, `w1/w2.ready.dispatched` (32 seats each); 12 hand-written self-satisfying `controls/inline/` cases (honest×4, no-sessions×3, empty-log×3, both-empty×2); SCORECARD row `| `inline-dispatch-evidence` | … | 63 |`; `close/inline63-tip.txt` with `rev=6ee5f406…` + both CLEAN lines. Zero interaction with `~/.omp/agent/sessions` or `/fast/scratch/hyaku-run7/dispatcher.log`.

**E2 — frozen probe on the honest integrated revision (baseline):**
```
$ node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin a9531c8e617338fd16cb69c61344ef8f17711117
INLINE63_UNMET held=3/6 checks=6 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=I63 | I2 MISS total-seats=40 | I5 MISS row-absent | I6 MISS tip-receipt-absent
exit=1
```

**E3 — supplementary cross-check (install: `.ufo/waves/round-63/build/K63R2CriticC1Stub/i63-crosscheck.mjs`):**
```
$ node …/build/K63R2CriticC1Stub/i63-crosscheck.mjs /tmp/kumitate-r63/K63R2CriticC1Stub/fixture 6ee5f406c8df0758d194396d73b2e6b4ac34ccb1
I63_CROSSCHECK UNMET held=1/4 rev=6ee5f406… | I1-source lines=22<100 | I2-source spawnSync=false FINDING=true --rev=false known-ids=2/9 | I2-behavior exit=0 first-line=INLINE_DISPATCH: CLEAN (seats=32 …)
exit=1
$ node …/build/K63R2CriticC1Stub/i63-crosscheck.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin a9531c8e617338fd16cb69c61344ef8f17711117
I63_CROSSCHECK HELD held=4/4 rev=a9531c8e617338fd16cb69c61344ef8f17711117
exit=0
```

**E4 — tool facts at a9531c8:** committed gate is 572 lines, sha256 `290baa65611a6a935f463b46aeccc0c0bd5940f0329264955fd448c3e62660af` (stub: 21 lines). `SCORECARD.md` at a9531c8 has a `kumitate-gate-pins-v1` block with 18 pins; **none** is a pin for `inline-dispatch-evidence.mjs` (so the sha256-pin cross-check suggested in the brief is currently impossible). WAVE_ABSENT is fail-closed exit 2 before any host read (`scripts/inline-dispatch-evidence.mjs:255-256`).

## Findings

- **K63R2CriticC1Stub-1 (critical) — the stub counter is still satisfiable at the integrated revision.** `INLINE63_HELD held=6/6`, exit 0, with a 25-line tool that reads nothing real; I1/I2/I4 believe the tool's stdout (`inline63-probe.mjs:56-58,69-77,82-85`), I3/I5/I6 believe lane-authored text. Attacks all of C1 ("nothing in the lane verifies that a round's seats ran" is replaced by the stub's own print). Repro: E1 (fixture M/T above).
- **K63R2CriticC1Stub-2 (high) — I3 is a regression suite for the honest gate, not an anti-stub control.** Run before replacing the controls, the archived committed controls (`cheap-40-seats`, `cheap-padded-bytes`, `done-line-absent`, …) all read `exit=0 want=1` under the stub (`I3 MISS …` → held=5/6): the forger must ship its own 10+ cases whose expects match the stub (12 cases in the fixture). Confirms K63ReviewProbeC1-5 at the integrated revision.
- **K63R2CriticC1Stub-3 (high) — which checks an independent cross-check can close without changing the frozen probe.** I1 (selftest N) and I2 (CLEAN trust) are closable for this stub class: source-shape arms (≥100 lines, `spawnSync`+`FINDING`+`--rev`+≥4/9 known finding ids) plus the fail-closed negative arm the probe never runs (`--wave no-such-wave` must be WAVE_ABSENT, never CLEAN). I3 only via provenance regeneration (re-run `make-inline-controls.mjs`, diff). I5/I6 cannot be closed by any independent receipt: they are lane-authored text (row, receipt) with no external anchor — a cross-check for them passes on the forged fixture too. Durable fix remains an external anchor (tool sha256 pin in the gate-pins block, or running a reviewed tool copy).
- **K63R2CriticC1Stub-4 (medium) — the honest revision currently reads 3/6, not 6/6.** I2 is waiting on a second committed wave (one 40-seat wave → total-seats=40 < 64), I5's capabilities row is not committed, and I6's tip receipt is not committed. Expected for a round whose w2 is still in flight; it means C1 is not yet honestly held at a9531c8, and no honest 6/6 measurement exists to compare the stub against.
- **K63R2CriticC1Stub-5 (low) — the gate-pins block has no pin for the new tool.** The suggested sha256-pin cross-check cannot run today; propose adding `pin.inline-dispatch-evidence=<sha256>` when the L1 next updates the pins (the gate itself and the controls are not pinned).

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-63/build/K63R2CriticC1Stub/i63-crosscheck.mjs` — the supplementary receipt (runnable; UNMET on stub fixture, HELD on a9531c8).
- Scratch: `/tmp/kumitate-r63/K63R2CriticC1Stub/{stub.mjs, make-stub-fixture.mjs, i63-crosscheck.mjs, fixture/}` — fixture repo (M=`6ee5f406c8df0758d194396d73b2e6b4ac34ccb1`, T=`455b1956e660c50d2f46671e0200c0c6b3b9c852`), rebuilt by `make-stub-fixture.mjs`.

## Limits

- Did not run the probe against a future honest tip (w2 not yet committed); did not run the gate against real host transcripts beyond the probe's own I2 run at a9531c8; did not write any host store.
- The cross-check is validated only against this stub class and a9531c8; an adaptive stub that re-implements fail-closed behavior for unknown waves would still pass it (the durable fix is the external anchor).
- C2/T63 and the other wave-1 reports are out of scope; frozen files were read/copied only.
