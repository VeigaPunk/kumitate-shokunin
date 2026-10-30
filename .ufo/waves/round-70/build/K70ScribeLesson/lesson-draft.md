# Round 70 — replay-control isolation (DRAFT for L1 integration; not production)

## Gate

Opened own-work source `.ufo/waves/round-69/probe/c2-controls.sh` at base 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 on 2026-10-30. Located the fixed-output assignment at line 24 (`W="$LANE/.ufo/waves/round-69/controls"`), the unused hardcoded temporary write at line 80 (`printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt`, inside the `forgecapture)` arm only), and the fixed receipt writes at lines 102-108 (`mkdir -p "$W"`; `> "$W/c2-$MODE.txt"`). The matching fixed receipt writes in `c1-controls.sh` are lines 74-77 (`> "$W/c1-$MODE.txt"`). Neither frozen file contains any other `/tmp` write (grep, 2026-10-30). S217 binds this opened source to the bounded replay repair; no external source authority is inferred.

Admit: a versioned, private-output replay of the five frozen round-69 controls (c1 donothing/autoledger; c2 donothing/autoorigin/forgecapture), generated as private script copies with private W and S and a unique work directory. Frozen counters and frozen control bytes are not amended.

Reject: re-running the original fixed-output controls in the production checkout. Flip condition: a private-output successor that preserves the frozen bytes.

Evidence required before the repair is credited:
- Red before: a committed receipt that shows the offending behavior is detectable. The frozen base receipt `base/replay70-base.txt` (do-nothing control, absent tool) must read `REPLAY70_UNMET held=2/10` with exit 1 at base B. An existing-output case (R9) must be shown failing against a replay that overwrites a pre-existing receipt, with digests before and after recorded.
- Green after: the committed probe run at the measured revision, `node .ufo/waves/round-70/probe/replay70-probe.mjs <lane> <rev> REV`, must read `REPLAY70_HELD held=10/10` with exit 0, and the receipt must record the revision it measured. Until that receipt exists, no held claim is made.
- Limits: the predicate verifies replay isolation only. It does not establish semantic remediation or universal forgery resistance. The live c2 forgecapture arm is network-dependent; a failure there is reported, never waived. The two attack controls (print-PASS stub, implementation forgery) are disclosed limits, not changes to the predicate after scoring.

Assimilation: none. Mine considerthese/2026-10-26.md proposal 4 (round-size accounting) into a lesson-backed criterion after observed wave reconciliation. No other proposal is mined.

Outside non-author spot-check pending closure; this lane's seats do not count as non-author verifiers.

## Mistakes

- landing · round-69-verifier-spotcheck.md routed item 3 and round-69.md freeze errata: replays of the frozen c1/c2 scripts wrote into the fixed lane path `.ufo/waves/round-69/controls` (c1-controls.sh lines 74-77; c2-controls.sh lines 102-108) and temporarily overwrote two frozen receipts, restored byte-exact from the freeze · captured-by scratch discipline only, not an enforced gate · the versioned replay must use a unique mkdtemp work directory under the supplied root, copy receipts out before cleanup, create output exclusively, and refuse an existing output path with the existing bytes unchanged. The R9 negative arm must demonstrate that refusal (red) before the repair is credited.
- scope · round-69-verifier-spotcheck.md routed item 2 and round-69.md scratch-policy erratum: frozen `c2-controls.sh` line 80 writes an unused hardcoded `/tmp/forge-sed.txt` regardless of TMPDIR, violating the no-hardcoded-/tmp rule · captured-by campaign scratch rule 7.4, which is not enforced for committed tools · the private copy removes that unused write; the frozen source bytes are preserved unchanged and the historical bytes remain evidence, never edited.

Round-69 routed items 1/4/5/6 are not repaired here: historical map-at-freeze failure remains disclosed; missing seat reports cannot be retroactively created; host plugin drift is operator-owned and left untouched; promotion verification is non-author/operator-owned. No repair or clean-host assertion is claimed for those four notes.

## Notes for L1 (drafting only)

- The existing `corpus/lessons/round-70.md` Mistakes line 13 says the replays "overwrote two frozen receipts". The round-69 closure says "temporarily overwrote ... restored byte-exact". The draft uses the closure wording; L1 should choose one and keep it consistent with the receipt.
- Existing line 13 says the counter's existing-output arm "must demonstrate failure". The plan's R9 says existing output is "unchanged after refusal". The draft states the observable as refusal with unchanged bytes; no exit code is asserted because the plan does not name one for R9.
- Nothing above asserts an executed outcome. Every green/red result is a requirement to be observed in a committed receipt.
