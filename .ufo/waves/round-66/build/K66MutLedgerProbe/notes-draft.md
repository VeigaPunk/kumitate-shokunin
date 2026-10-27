# K66MutLedgerProbe — working notes (final report assembled from this after the matrix lands)

## Static evidence (already measured)

- Node v24.21.0. No tools installed (none needed); pacman untouched.
- Frozen counter sha256 (before): 453bd64cedce6bea3413de4e3ede8be8a620d3408f13f4f0c3982b3e8d231e64
- Lane worktree scripts/routed-ledger.mjs sha256 = f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5
  = `git show 621212b:scripts/routed-ledger.mjs` blob = `control-tool-sha256` in BOTH committed control receipts
  → the two controls exercise exactly the freeze tool.
- `git merge-base --is-ancestor 8d557f85 621212b` → ok. Lane HEAD at measurement time: 6c79d68caf956e6c74a0c17c388662f4d1b7dec1 (recorded only; all runs pin revs).
- Direct pristine run (base rev), verbatim:
  LEDGER66_UNMET held=0/6 checks=6 rev=8d557f85312de4fcc82e09ff735d21436bc3746d rule=L66 seed=4da08865618f3866 | L1 MISS tool-absent | L2 MISS tool-absent | L3 MISS 67 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L4 MISS tool-absent | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift | L6 MISS skill-row=false quality=false capability-row=false
  EXIT=1 → byte-for-byte the committed base/ledger66-base.txt modulo seed. Baseline conclusive.
- First matrix attempt (bg_8872) was INCONCLUSIVE: every child spawn returned status=null instantly
  (host load, ~90 live peers); no detector output. Driver hardened with spawn retries + incremental TSV;
  pristine re-verified inside the final run before any mutant verdict.

## Detector definitions

- B (base receipt): node <counter-copy> <lane> 8d557f85… — expect UNMET held=0/6, misses L1..L6 (receipts/ledger66-base.txt).
- D (donothing): SCRATCH=<scratch> bash <copy of c1-controls.sh pointing at the counter-copy> donothing — expect UNMET held=4/6, misses L2,L3.
- A (autoledger): same, variant autoledger — expect UNMET held=4/6, misses L2,L3 (L2 first=QUOTE_ABSENT:R61.6@line40).
- Kill iff (verdict, held, miss-set) differs on any detector; reason-string-only deltas recorded, not verdicts.

## Mutant roster (22; byte copies under mutants/<id>.mjs, sha256 in results.tsv)

Anchors (must be killed — prove the committed detectors bite):
- A1 L1 force-fail → expect D/A held 4→3.
- A2 L4 force-fail → expect D/A held 4→3.
- A3 L6 force-pass → expect B held 0→1.
- A4 L2 accepts DRIFT + ignores exit code → expect A (autoledger) held 4→5 (rows=57>=ownItems=57, items 57===57, spotchecks 11===11 all hold there; donothing stays MISS on rows=0>=57).

Weakeners (coverage study):
- W01 L1 selftest floor 30→1.
- W02 L2 ignores tool exit (CLEAN regex still gates).
- W03 L2 items===ownItems → items>=ownItems (task example).
- W04 L2 rows>=items → rows>=0.
- W05 L2 spotchecks===11 → ===12.
- W06 L3 answered-this-round clause (r65.forEach) deleted (task example).
- W07 L3 classes<5 → <0.
- W08 L3 class-span >=4 → >=0.
- W09 L3 row-quote located-in-item check off.
- W10 L3 full-coverage (unledgered) loop off.
- W11 L3 answer-path forbidden set (ledger/spot-check/../abs) off.
- W12 L3 answer ±2-line window → whole file.
- W13 L4 harness ignores finding ids (task example).
- W14 L4 harness items=exact → items=\d+ (task example).
- W15 L5 realL4 (anti-vacuity) guard dropped → expect B held 0→1 (stubs still caught at base: stubs-caught=always-clean+always-drift).
- W16 L5 both-stubs → one-stub-enough.
- W17 L3 item-ordinal range guard off.
- W18 HELD threshold held===6 → held>=5.

## Verdict table

PENDING (results.tsv).
