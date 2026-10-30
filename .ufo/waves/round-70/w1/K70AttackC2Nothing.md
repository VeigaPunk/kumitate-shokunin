# Seat K70AttackC2Nothing — Attack report: c2 donothing `--no-live` cannot prove live origin

- Milestone: AttackC2Nothing · Wave: round-70 w1 · Axis judged: operability (C1 replay isolation)
- Frozen plan: `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; counter code normative; predicate NOT amended after scoring.
- Candidate status: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/build/K70ExecRunner/control-replay.mjs` **absent at inspection** → contract/counter attacked directly.
- Lane rule compliance: no originals executed (`c1-controls.sh`/`c2-controls.sh` never run, not even copies); no probe executed; no lane/fleet writes outside this report and my unique build dir; no git mutation; no delegation; scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackC2Nothing/` created explicitly and removed before yield.
- Tools: no installs/updates needed (node only, system-provided). RULES.md read; nothing to record.

## Commands run and observed outcomes

1. Read-only inspection (frozen bytes, never modified):
   - `.ufo/waves/round-70/probe/replay70-probe.mjs` lines 15, 31, 32, 34; `base/replay70-base.txt`; `.ufo/waves/round-69/probe/c2-controls.sh` (LIVEFLAG assignment: forgecapture → live, donothing/autoorigin → `--no-live`); `.ufo/waves/round-69/probe/deprec69-probe.mjs` lines 81, 283, 522, 550 (`LIVE_STATE = NO_LIVE ? 'no-live(vacuous-declared)' : 'exercised'`); committed receipt `.ufo/waves/round-69/controls/c2-donothing.txt` whose line 1 reads `DEPREC69_UNMET held=8/11 … live=no-live(vacuous-declared) | M5 MISS no-live | … | M11 MISS origin-section-absent`; `corpus/lessons/round-70.md`; `base/freeze-map.txt` (CLEAN, exit=0).
2. `node r5-forgery-demo.mjs` (isolated counterexample, private scratch; replica of the frozen R3–R7 predicate fed fabricated receipts; no control/probe executed). Observed output (saved to `build/K70AttackC2Nothing/run-output.txt`):
   - `R3 PASS … R7 PASS` for all five modes with `probeRan=false` (receipts 322–328 B).
   - `R5-minimal-forgery predicate-satisfied=true receipt=87B probeRan=false` — a receipt containing only the two required substrings satisfies the R5 predicate.
   - `AGGREGATE fabricated held=5/10 summary-live-marker-if-forgecapture-tampered=exercised`.
3. Artifacts copied to unique build dir, then scratch removed:
   - `build/K70AttackC2Nothing/r5-forgery-demo.mjs` sha256 `31ca9d11b508dfc8081fa4388367a02dffc6c6f5ec70379e1607874cf3bac2ee`
   - `build/K70AttackC2Nothing/run-output.txt` sha256 `5f7246b0a5a1e17180989d8c8375648ce6ffcdce58a4265eb80c19dda8589323`

## Findings (actual defects)

### D1 — Vacuity (assigned edge; tradeoff the canonical judge must accept, disclosed)
`c2 donothing` is bound to run `deprec69-probe.mjs --no-live` (frozen `c2-controls.sh` LIVEFLAG logic). In `--no-live` the probe records M5/M11 provenance misses as `no-live` and stamps the receipt header `live=no-live(vacuous-declared)` (frozen probe line 550; committed r69 receipt confirms). Consequently R5 passing — and any final `REPLAY70_HELD 10/10` — carries **zero live-origin evidence by construction**: it proves only that the counter rejects an origin-less tree while live checks are disabled. A counter with a broken or stubbed live-origin arm passes R5 identically. Four of the five replay modes are no-live by design; only `forgecapture` (R7) exercises live origin, and the plan freezes that arm as network-dependent ("failure is reported, never waived"). The frozen counter's own summary defaults to `live=no-live(vacuous-declared)` (line 15), so a 10/10 HELD print is observationally indistinguishable from the base UNMET print on the live-origin axis.

### D2 — Receipt-content forgery is invisible in the no-live arms (fixable defect, frozen)
Frozen line 34 checks only `r.status===0 && text.includes(label) && text.includes('CONTROL-PASS '+mode) && preserved && workdir empty`. Demonstrated (observed above): fabricated receipts pass R3–R7 with no probe ever executed; an 87-byte receipt passes R5. Because D1 makes the donothing receipt deterministically vacuous, there is no live network artifact a genuine run produces that a fabricated receipt lacks — forgery is undetectable for this arm by the frozen predicate. The plan anticipates this class ("seats attack this and implementation-forgery controls, with limits disclosed"); the binding is the candidate contract (versioned private copy actually executed), which the counter cannot verify.

### D3 — Summary live marker derives from receipt text (small fixable defect, frozen; compounding)
Frozen line 31 sets `live='exercised'` iff the forgecapture **receipt text** contains `live=exercised` — no independent observation. Demonstrated: injecting that string into a fabricated R7 receipt promotes the aggregate summary to `live=exercised` (observed above). The one marker meant to disclose vacuity is itself receipt-controlled; a forged R7 receipt could claim exercised provenance.

## Impacted axes
- **Operability (C1)**: direct. R5 is the c2-donothing obligation; D1–D3 all live on it and on the summary line of every replay run.
- Claim-sizing / honesty: HELD 10/10 must not be read as live-origin verification; only R7 could evidence that, and only when its live fetch genuinely runs.

## Freeze consequence and smallest safe correction
The predicate, counter, plan, and r69 frozen bytes are frozen (plan `3dbe7e6e…`; "never amend predicate after scoring"), so no counter repair is available or proposed. Smallest safe correction, all at contract/disclosure level:
1. Candidate MUST execute the versioned private script copy for every mode (already in the implementation contract) and stream the probe's real stdout into `--out`; keep receipts (`build/…/run-output.txt` here) as evidence of the attack harness itself.
2. Integrator/SCORECARD disclosure: record that R5 and R6 (and the c1 arms) are `no-live`-vacuous, that live origin is exercised solely by R7, and that R7 is network-dependent — if R7 cannot run live, HELD honestly stays UNMET and the miss is preserved (never waived, never amended).
3. Treat the final summary `live=` value as trustworthy **only** when R7's receipt is probe-issued; D3 means the marker alone is not proof. Compare the R7 receipt against a genuine probe run before reporting `live=exercised`.
4. D2's residual risk is bounded by disclosure, not detection: state explicitly that replay-receipt authenticity for the four no-live arms rests on the executed-private-copy contract, which the frozen counter does not verify.

Verdict: D1 is an inherent tradeoff of the bounded predicate — disclose, accept. D2/D3 are fixable defects but frozen — mitigate by (1)–(4). No counter change; no score predicate change; honest-miss posture preserved.
