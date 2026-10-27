VERDICT: Honest-stop (operator wrap-up) — the frozen L66 counter's bytes and baseline are verified (pristine run reproduces base/ledger66-base.txt byte-for-byte, exit 1) and a 22-mutant matrix is designed, generated and staged for one-command rerun, but NO mutant verdicts were measured before the stop, so no killed/survived claim is made; committed-artifact inspection findings are recorded explicitly as predictions.

## Evidence

Integrity (measured):
- Frozen counter sha256 before all work and after every run (measured twice):
  `453bd64cedce6bea3413de4e3ede8be8a620d3408f13f4f0c3982b3e8d231e64  .ufo/waves/round-66/probe/ledger66-probe.mjs` — unchanged.
- `c1-controls.sh` sha256 `a78ea814683ea0baa15e906d231091ea0c98d256d65f1e4b08a7a0c19b1102e7`; `git status --porcelain` on probe/ and base/ = 0 lines (frozen tree untouched by this seat).
- Lane worktree `scripts/routed-ledger.mjs` sha256 `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5` = `git show 621212b:scripts/routed-ledger.mjs` blob = `control-tool-sha256` in BOTH committed control receipts → the committed controls exercise exactly the freeze tool.
- `git merge-base --is-ancestor 8d557f85 621212b` → ok. Lane HEAD at measurement: `6c79d68caf956e6c74a0c17c388662f4d1b7dec1` (all runs pin revs explicitly; no git writes by this seat anywhere).

Baseline detector (measured, conclusive):
- Direct run (bypasses spawn): `TMPDIR=<scratch>/tmp node <build>/pristine-counter.mjs <lane> 8d557f85312de4fcc82e09ff735d21436bc3746d` →
  `LEDGER66_UNMET held=0/6 checks=6 rev=8d557f85312de4fcc82e09ff735d21436bc3746d rule=L66 seed=4da08865618f3866 | L1 MISS tool-absent | L2 MISS tool-absent | L3 MISS 67 problems: ledger-empty-or-absent,unledgered:55#1,unledgered:55#2,unledgered:55#3,unledgered:56#1,unledgered:56#2 | L4 MISS tool-absent | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift | L6 MISS skill-row=false quality=false capability-row=false` , `EXIT=1`
  → identical to `base/ledger66-base.txt` modulo seed. The counter itself runs clean in this environment.

Matrix attempts (measured, inconclusive — honest record):
- Attempt 1 (job bg_8872, 61s): all 63 detector runs returned `status=null` instantly; all 22 rows INCONCLUSIVE. Kept as `results-INCONCLUSIVE-attempt.tsv` (+ .README).
- Attempt 2 (service mutmatrix, killed at 33m56s on wrap-up): same failure class; sample line:
  `PRISTINE base: exit=null (no probe line; status=null sig=SIGTERM err=Error: spawnSync node ETIMEDOUT attempts=4 stderr=)`.
- Root cause found and fixed (my bug, not the host): Node `spawnSync` `timeout` is MILLISECONDS; the driver passed 600/900, SIGTERM'ing every child sub-second. Fixed at `mutation-driver.mjs:107` (600000) and `:112` (900000); retry+backoff and incremental TSV added. The corrected driver has NOT been run (wrap-up).

Design (staged, unexecuted): 22 byte-copy mutants of the counter in `mutants/`, each a minimal single-clause edit (generation verified: every edit pattern matched exactly once; `node --check` clean). Detectors per mutant: (B) probe at base rev vs `base/ledger66-base.txt` [expect UNMET 0/6, L1–L6]; (D) `donothing` control via a scratch copy of `c1-controls.sh` pointed at the mutant [expect UNMET 4/6, misses L2,L3]; (A) `autoledger` variant [expect UNMET 4/6, misses L2,L3]. Kill = (verdict, held, miss-set) differs on any detector; reason-string-only deltas recorded but not verdicts.

Anchors (designed to prove the committed detectors bite): A1 L1 force-fail→D/A held 3/6; A2 L4 force-fail→D/A held 3/6; A3 L6 force-pass→B held 1/6; A4 L2 accepts DRIFT+ignores exit→A held 5/6 (autoledger has rows=57>=items=57, items 57===57, spotchecks 11===11; donothing stays MISS on rows=0>=57).

Weakeners (the coverage study): W01 selftest floor 30→1; W02 L2 exit ignored; W03 items===→>=; W04 rows>=items→rows>=0; W05 spotchecks 11→12; W06 L3 answered-this-round clause deleted; W07 classes<5→<0; W08 class-span>=4→>=0; W09 row-quote located check off; W10 unledgered-coverage loop off; W11 answer-path forbidden set off; W12 answer ±2-line window→whole file; W13 L4 finding ids ignored; W14 L4 items=exact→any; W15 L5 realL4 guard dropped; W16 L5 both-stubs→one; W17 L3 ordinal guard off; W18 HELD threshold 6/6→>=5/6.

## Findings

1. K66MutLedgerProbe-1 (moderate; inspection of committed bytes, not a mutant run): no committed control contains a closed/wontfix ledger row — `c1-controls.sh` writes status `open` in both variants and `base/ledger66-autoledger.txt` shows `rows=57 open=57 closed=0 wontfix=0` — so L3's entire closed-answer branch (answer format, forbidden-path set, ±2 line window, quote-at-line, answered-now) is verdict-unexercised by any committed artifact. Repro: `grep -n "status: open\|| open |" .ufo/waves/round-66/probe/c1-controls.sh; grep -o "closed=[0-9]*" .ufo/waves/round-66/base/ledger66-autoledger.txt`.
2. K66MutLedgerProbe-2 (moderate; inspection): L3 cannot PASS under either control by construction (donothing: empty ledger → 67 problems; autoledger: 12 problems incl. 7 r65-unanswered and classes=1<5) → every pure-L3 weakening mutant (W06–W12, W17) is PREDICTED to survive verdict-level on committed detectors; those clauses are pinned only by MISS-reason strings, not verdicts. They become killable only once the L1's integrated data yields a measured HELD state. Unverified — matrix not run.
3. K66MutLedgerProbe-3 (minor; inspection): the base receipt DOES pin two things mutation-wise: L5's realL4 anti-vacuity guard (stubs-caught=always-clean+always-drift even with the tool absent, so W15 would flip held 0→1) and L6 (A3 likewise). Unverified — matrix not run.
4. K66MutLedgerProbe-4 (info; inspection): L2's positive CLEAN path and its constants (spotchecks=11, rows>=items, exit 0) are exercised by no committed artifact (the tool prints DRIFT/exit 1 in both controls) — W02–W05 PREDICTED survivors; the counter's HELD side is first exercised at integration.
5. K66MutLedgerProbe-5 (minor; measured process defect, fixed): two matrix attempts lost to a driver timeout-unit bug (spawnSync ms given as s); documented with verbatim ETIMEDOUT evidence above; driver corrected and left rerunnable. No lane or frozen bytes affected (hashes above).

## Artifacts

- `.ufo/waves/round-66/w1/K66MutLedgerProbe.md` (this report)
- `.ufo/waves/round-66/build/K66MutLedgerProbe/mutation-driver.mjs` — corrected, self-contained rerun: `node <lane>/.ufo/waves/round-66/build/K66MutLedgerProbe/mutation-driver.mjs` (recreates its own scratch; ~60–90 min; writes incremental `results.tsv`)
- `.../build/K66MutLedgerProbe/mutants/A1..W18.mjs` (22 counter mutants, sha256 inside `results-INCONCLUSIVE-attempt.tsv` last column)
- `.../build/K66MutLedgerProbe/pristine-counter.mjs` (byte copy, sha256 453bd64c…), `notes-draft.md` (detector definitions + roster), `receipts/` (committed ledger66-{base,donothing,autoledger}.txt + committed c1-controls.sh copy)
- `.../build/K66MutLedgerProbe/results-INCONCLUSIVE-attempt.tsv` + `.README` (honest record of the failed attempts)

## Limits

- NO mutant verdicts measured: no killed/survived result exists; Findings 1–4 are inspection-based predictions, explicitly not runs. The staged driver is the fastest path to the real matrix.
- The informational freeze-rev run (probe at 621212b) never completed; current held-state at freeze unmeasured.
- Controls were exercised only through attempt output that was inconclusive; D/A receipt expectations (4/6) were taken from the committed receipts, not re-derived by this seat.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66MutLedgerProbe/` deleted (verified absent); every cited receipt/control copy lives in the build dir.
- No tools installed; pacman untouched; no subagents, no lane writes outside build/w1 paths; no git/jj mutations anywhere.
