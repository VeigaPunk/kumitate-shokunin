RESULT CritA1Addendum rev=df1ceaf86c08dce7100da9b7c27f674bbad04f23 verdict=strengthening objections=5 (measured 84cb1d5d8e703aafd4f73d887ba4237692ff13f9; probe c1-discriminators.sh sha256 7e2d4f34…93ed; counter 0f4108bf sha256 e24749e4…152a)

Relaxes nothing. A1 only adds failure conditions; plan.md and scripts/ are byte-identical between the plan and A1:
- `git diff --stat 0f4108bf df1ceaf8` lists only addendum-A1.md, open/c1-control-base.txt and the probe files (no plan.md, no scripts/).
- A1 also bound the L1's own design: D-static flags the wave-1 cite witness (ExecCiteWitness.patch sha256 4d06a116…, line 13 `+ const source = readFileSync(SELF, 'utf8');`, pattern count 1). The lesson (84cb1d5d:corpus/lessons/round-43.md:149) records that witness being replaced.
Timing is clean (lane reflog, all times -0300): A1 df1ceaf 19:30:45, then fb3eab4 at 19:41:06, the measured commit 84cb1d5 at 19:41:45, and the measured run from 22:41:55Z to 22:42:48Z. The L1's working-copy runs of the measured bytes (below) all fall after A1, and so does CritC1Target.md (mtime 19:31:55).

Objections (counterexample, evidence, axes, smallest safe correction):
1. A one-line alias evades D-static, and the counter still reads CLEAN. My junk J4b is ExecJunkControls J4 (431d3b63) with the self-read split across two lines (`const witnessPath = SELF;` and `readFileSync(witnessPath, 'utf8')`). It is commit da1ebe10e4de557c2551049f30ff57e90f875652 in seats/CritA1Addendum/lane; patch CritA1Addendum-J4b.patch, sha256 ee6744c0…8391.
   $ C1_DISC_TMP=<seat>/disc .ufo/waves/round-43/probe/c1-discriminators.sh <seat>/lane e5ffcbe7… da1ebe10…
   D-static added_self_reads=0 · D-null cite-check exit=0 75/75 · D-null wave-census exit=0 31/31 · C1_DISCRIMINATORS: PASS · exit=0
   $ KUMITATE_GATE_MUTANTS_TMP=<seat>/gm-tmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 900 node $G/gate-mutants.mjs --repo <seat>/lane --rev da1ebe10…
   All seven survivors read `killed … verdict=FAIL confirm=same`, then `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=da1ebe10… leftovers=0)`, exit=0, wall time 95.75 s (log j4b-counter.txt).
   A1 names this hole in words; this shows it costs one line. Axis: operability (C1 evidence).
2. The temp-path tripwire (CritC1Target route A, f9ac7532) passes A1 in full. It has no readFileSync, hash or pin file, and D-null runs from `disc.XXXXXX`, never from a `kumitate-gate-mutant-*` directory.
   $ c1-discriminators.sh <CritC1Target>/lane e5ffcbe7… f9ac7532… → D-static added_self_reads=0 · D-null both exit=0 · C1_DISCRIMINATORS: PASS · exit=0
   The lesson concedes this (round-43.md:154-155). A1 predates the route. Axis: operability.
3. D-null tests only a comment appended at end of file, so it catches whole-file byte digests and nothing else. J4 and J4b (literal-presence detectors) pass D-null (probe/c1-discriminators-controls.txt, and objection 1). Only D-static separates them from the real witness, and objection 1 defeats D-static.
4. A1 adds no condition on mutant runs that print two verdict lines (CritC1Target route 8). In the measured receipt, c1-measured-84cb1d5d.txt:20 and :22 read `cite-check:suite-group-verdict killed … exit=1 verdict=PASS` and `suite-any-fail killed … exit=1 verdict=PASS`.
   The witness pushes `VERDICT: FAIL` only when the primary exit is 0 (84cb1d5d cite-check.mjs:2662-2665). [INFERENCE] those mutant outputs carry both `VERDICT: PASS` and `VERDICT: FAIL`, and K43 (c) accepts this. Not a defect of the real witness, but A1 leaves this route open.
5. Provenance of the after-run. A1's wording "before any counter run at an integrated commit" is true for the commit, but the measured bytes were counted four times between A1 and the receipt that says "first run at this commit":
   - /fast/scratch/hyaku/kumitate-r43/trial1.txt (19:37:36, rev=working-copy) has the same digests, cite-check=227f5645… and wave-census=76447250…, and reads `GATE_MUTANTS: ERROR (… killed=40 frozen=38/41 …) unstable=3` (V382, V385, V387 `confirm=differs`).
   - diag/diag.txt (19:39:29) is a wave-census-only run; diag-full1 (19:40:42) and diag-full2 (19:41:33) read CLEAN. diag/scripts/gate-mutants.mjs has sha256 a723beed…, which is neither the frozen e24749e4 nor 84cb1d5d's 177f6cbb. Which counter produced trial1 is [INFERENCE] not established.
   - The bytes did not change between the ERROR and the CLEAN; only reruns happened. The lesson discloses this partly (round-43.md:60, "three census witness mutants in an L1 trial at load ~50"), but c1-measured-84cb1d5d.txt does not.
   Axes: provenance, no-harm (best-of-N under load). For the judge to weigh; not an A1 relaxation.

Smallest safe correction (review falsifiers only; K43, the counter and A1 stay unamended):
- D-equiv: add parentheses at every frozen survivor site (seats/CritA1Addendum/d-equiv.sh, sha256 34206c15…e867; 4 cite-check and 3 wave-census sites rewritten). A suite with a real verdict path still passes.
  84cb1d5d → D_EQUIV: PASS (75/75, 32/32); e5ffcbe7 → PASS; J4b da1ebe10 → FAIL (cite-check 74/75 exit=1, wave-census 30/31 exit=1); route A f9ac7532 → PASS.
- D-path: run the unmutated selftests from a `kumitate-gate-mutant-probe.*` directory in the counter's environment.
  84cb1d5d → both exit=0 with VERDICT: PASS (75/75, 32/32); route A f9ac7532 → cite-check exit=1 74/75, wave-census exit=1 with both VERDICT lines.
- Together, D-equiv and D-path reject J4, J4b, route A and the self-digest tripwire, and the measured commit passes both. The receipt should also name the trial1 and diag runs.

Hygiene: the only lane write is this report. No installs or updates. Scratch is under seats/CritA1Addendum (lane clone, J4b patch, j4b-counter.txt, d-equiv.sh). The counter copy, gm-tmp and disc dirs were removed, and `pgrep -af <seat>` returned 0 after every run. Load average was 24.79 when the counter run started and 43.64 when it finished.
