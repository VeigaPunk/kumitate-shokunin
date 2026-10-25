# Seat K63R2ConnCrossClaim

VERDICT: The wave-1 record shows the round organised as Independent deployment (40 flat seats, no cross-validation) plus Centralized verification (one L1 re-running every counter), and that split is observable in the data — centralised verification caught nothing the independent seats had not already found, while the seats independently found the same frozen-control defect 6 times (the prompt says 5; K63ScribeScorecard-1 is a sixth); both frozen counters share one structural forgery/verification pattern (lane-authored anchors + a single external oracle), which I state as a general rule for future counters.

## Evidence

- Integration revision measured: `git rev-parse HEAD` → `a9531c8e617338fd16cb69c61344ef8f17711117` (branch master; commits 05b3176 "wave 1 landed — gate ratchet (shape arms, regex/name/context guards), 45 controls, S196/S197 + coordinator-topology entry …" and a9531c8e "round-63: drop rev-mode-only control, control counts").
- Frozen counters re-run at M (read-only; verdict lines verbatim):
```
$ node .ufo/waves/round-63/probe/inline63-probe.mjs <lane> a9531c8e617338fd16cb69c61344ef8f17711117
INLINE63_UNMET held=3/6 checks=6 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=I63 | I2 MISS total-seats=40 | I5 MISS row-absent | I6 MISS tip-receipt-absent
exit=1
$ node .ufo/waves/round-63/probe/topology63-probe.mjs <lane> a9531c8e617338fd16cb69c61344ef8f17711117
TOPOLOGY63_HELD held=7/7 checks=7 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=T63
exit=0
```
- I3 now passes at M: `git ls-tree -r --name-only a9531c8e — …/controls/inline/forged-no-sessions/` lists `…/sessions/orch/.keep` (committed; absent at freeze b38a206 — the L1 integrated the seat-proposed `.keep` fix). Pre-fix the same probe read `I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH` (K63ExecCounterReplay.md:13).
- Independent founders of the empty-dir archive-loss defect (each a numbered finding, own repro): `K63CriticC1Predicate.md` -4 (high, line 77), `K63CriticFreezeIntegrity.md` -1 (BLOCKER, line 28), `K63ExecCounterReplay.md` -1 (high, line 44), `K63MutateProbes.md` -1 (high, line 75), `K63ReviewProbeC1.md` -2 (critical, line 61), `K63ScribeScorecard.md` -1 (high, line 33). All six agree on mechanism (git archive drops the empty `sessions/orch/`; gate fail-closes exit 2 `SESSIONS_ROOT_ABSENT` vs `expect` exit 1 `NOT_A_DISPATCH`).
- Wave-1 output volume: `grep -rhEo 'K63[[:alnum:]]+-[0-9]+' w1/*.md | sort -u | wc -l` → `272` distinct numbered findings across 40 reports (plan's wave-2 gate is ≥32 distinct attack items; w2 exists).
- Counter-machinery attacks by seats (central verifier auditing itself): `K63ReviewGateCode.md` -1..-9, `K63ReviewProbeC1.md` -1..-5, `K63ExecWaveCensus.md` -1..-10, `K63CriticC1Predicate.md` -1..-7, `K63MutateProbes.md` -1..-4, `K63ExecSelftestMutants.md` -1..-12, `K63ExecGateForgery.md` -1..-6, `K63RevengerDispatcher.md` -1..-7. No wave-1 report credits the L1's counter re-run with catching a seat error.

## Findings

1. **K63R2ConnCrossClaim-1 (observation; attacks "centralised verification catches errors independent seats missed")** — The direction is reversed in this round: the L1's central counter re-runs produced no catch that a seat had not already reported; instead, independent seats found defects *in* the centralised machinery itself (gate, probes, census, receipts — 8 reports above, ~60 findings). The one centralised "catch" at M (I3 now passes) is the L1 adopting the seat-found `.keep` fix, i.e. integration of a seat result, not detection. Reproduce: run the frozen inline probe at b38a206 (`I3 MISS … exit=2`) vs a9531c8e (I3 pass) — the delta is the seats' finding.

2. **K63R2ConnCrossClaim-2 (observation; redundancy vs error amplification)** — The same true defect was found independently 6 times with identical mechanism and no contradictory claim; that is redundancy without amplification (6 detections of 1 fault), consistent with the corpus entry's "Independent — ensemble of independent attempts with no cross-validation" row. The entry's error-amplification ranking (SAS 1.0 / Centralized 4.4 / Independent 17.2, S197 §4.3) is neither confirmed nor contradicted by this single-fault sample; nothing in w1 shows an errant seat claim propagating unchecked through synthesis.

3. **K63R2ConnCrossClaim-3 (observation; the entry's rule is checkable on this round)** — The round hybridises two entry rows: deployment is Independent (40 parallel flat seats, no inter-seat validation), verification is Centralized (one L1 integrator re-runs every counter — the entry's own quote "Centralized introduces hierarchical verification and bottleneck control"). The bottleneck is observable at M: C1's `I2 MISS total-seats=40` (w2 not yet closed), `I5 MISS row-absent`, `I6 MISS tip-receipt-absent` are single-integrator arms not yet closed, while C2 reads `HELD 7/7`.

4. **K63R2ConnCrossClaim-4 (general rule for future lane counters)** — Both frozen counters share one forgery/verification pattern: **lane-authored anchors + exactly one external oracle** (C1: anchors = wave results/reports/controls/SCORECARD/tip + the gate code itself; external = host session store + dispatcher log — outside the repo but same UID, hence lane-writable. C2: anchors = entry, registry rows, pins, captures — all lane-written; external = live fetch of the lane-chosen URL). Both probes also execute/parse the measured revision's own artifacts (stub gate → `INLINE63_HELD held=6/6`, K63CriticC1Predicate-1; attacker-chosen row URL defeats T5, K63CriticC2Predicate-2). Rule: a future counter MUST (i) enumerate its anchors and declare how many lie outside the lane's write+ — if that count is 1, the verdict's strength equals that single oracle; (ii) never let the measured artifact emit the measured value (compute the asserted number independently, not by parsing the tool's stdout); (iii) require a second uncorrelated non-lane anchor (e.g. other-lane committed bytes, or host records written by a different principal) before HELD is relied on.

## Artifacts

- `build/K63R2ConnCrossClaim/probe-verdicts.txt` (both probe runs at a9531c8e, verbatim verdict lines + exit codes).

## Limits

- Did not run the probes at any revision other than a9531c8e; did not open every one of the 272 findings (counted by header regex only); did not verify the L1's SCORECARD/province edits beyond what the probes read.
- The 6-vs-5 founder count depends on treating `K63ScribeScorecard-1` as an independent finding (it is a numbered, separately-reproduced finding in its own report).
