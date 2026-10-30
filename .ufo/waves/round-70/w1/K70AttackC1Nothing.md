# K70AttackC1Nothing — Attack findings: c1 donothing expected predicate vs. stale "v1" source comment

Seat: K70AttackC1Nothing (attack, leaf). Scope: one contract edge — the frozen `c1-controls.sh`
`donothing` expectation narrative ("the CURRENT tool (v1 at the round-69 base: a 33-case selftest,
no v2 hardenings)") vs. the tool that actually exists at base B and every scoring REV (v2).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Plan frozen at
`3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; counter/replay base B = `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`.

## Verdict up front

The stale comment is real and double-barrelled, but it is a **provenance defect in frozen bytes,
not a predicate defect**. The expected predicate — `LEDGER69_UNMET` first line, control exit 1,
`CONTROL-PASS donothing` — **holds under the v2 tool**, observed by isolated replay. REPLAY70 R3
remains honestly reachable; the freeze consequence is that the comment bytes must stay wrong
(frozen), and the correction is interpretive, not textual.

## Observed commands and outcomes

1. Topology: `git log --oneline --graph -12 78b98d76` → B's ancestry contains `69d3c774 round-69:
   integrate ledger v2 and source-origin carriers`; `git merge-base --is-ancestor 69d3c774 B` →
   ancestor. `git show B:scripts/routed-ledger.mjs | diff - scripts/routed-ledger.mjs` →
   **IDENTICAL: live == B**. Header of that file: `contract kumitate-routed-ledger-v2 (round 68)`;
   `v2 hardenings over v1 (round-66 wave…)`; 56 `add('…')` selftest cases. So at the round-69
   base B the "CURRENT tool" was **already v2**, contradicting the frozen comment's "v1 at the
   round-69 base: a 33-case selftest".
2. Private isolated counterexample (originals never executed; frozen paths never written):
   `sed` copy of `.ufo/waves/round-69/probe/c1-controls.sh` substituting exactly the W, S and
   probe-TMPDIR assignments to private paths under
   `/fast/scratch/hyaku/kumitate-r70/K70AttackC1Nothing/` (LANE/PROBE left read-only against the
   lane; diff confirmed only 3 lines changed). Ran `./c1-controls-private.sh donothing`
   (node v24.21.0). Observed stdout:
   - `LEDGER69_UNMET held=5/7 checks=7 rev=f4056f20… rule=L69 …` with detail `L2 MISS … rows=0 …`
     and `L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,…` (PASS checks print no
     detail; 5/7 held with only L2, L3 missing ⇒ **L1, L4, L5, L6, L7 all PASS under v2**).
   - `control=donothing exit=1 rev=f4056f20…`
   - `CONTROL-PASS donothing`; wrapper process exit 0 (`PRIVATE-CONTROL-EXIT=0`).
3. Frozen-receipt comparison (v1 era, `.ufo/waves/round-69/controls/c1-donothing.txt`):
   `LEDGER69_UNMET held=2/7 … L1 MISS … (33/33) | L2 MISS | L3 MISS | L4 MISS 7/20 mutants wrong
   | L5 MISS real-tool-passes-L4=false …` ⇒ v1-era misses were **L1–L5**; L6 and L7 passed then.
4. Mutation check after the run: `git show B:<path> | sha256sum` vs on-disk for both frozen
   controls → equal (`01efd6dd…` c1, `679b7d96…` c2). Frozen bytes untouched.
5. Mechanics note observed from the script: `CONTROL-PASS $MODE` is echoed to **stdout only**; the
   receipt file `$W/c1-donothing.txt` is 2 lines (verdict + `control=`). R3 greps the wrapper's
   `--out` file for both `LEDGER69_UNMET` and `CONTROL-PASS donothing`, so the wrapper's out file
   must be the **stdout capture** of the private control run — a candidate that only tees `$W`
   misses `CONTROL-PASS` and fails R3.

## The defect (two stale claims in frozen comment, c1-controls.sh lines 12–19)

- **Claim:** fixture uses "the CURRENT tool (v1 at the round-69 base: a 33-case selftest, no v2
  hardenings)". **False at B and at every descendant:** the tool is contract
  `kumitate-routed-ledger-v2`, 56 selftest cases, live byte-identical to B. The 33-case tool only
  existed in the v1 era (round-66 lineage) when the control was authored.
- **Claim:** "L1 (selftest n>=44), L2/L3 (no data rows), L4 (v1 tool semantics), L6 (stub rows…)
  all MISS". **Wrong in both eras.** v1-era receipt: L1, L2, L3, L4, **L5** MISS (L6, L7 pass) —
  the comment misnames L5 as L6 even for its own era. v2 replay (this attack): only **L2, L3**
  MISS; L1 (56 ≥ 44), L4 (0/20 mutants wrong), L5, L6, L7 all PASS.

## Why the predicate still holds (strongest local counterexample tested)

The donothing fixture never writes ledger rows (`rows=0`, `ledger-empty-or-absent`), so L2 DRIFT
and L3 fail from **fixture content**, independent of tool version or selftest count; L69 HELD
requires all 7 checks, hence `LEDGER69_UNMET` exit 1 is structurally stable across tool versions.
Observed: v1 era held=2/7 → UNMET exit 1; v2 replay held=5/7 → UNMET exit 1; both emit
CONTROL-PASS. R3's expectation ("the old UNMET predicate plus CONTROL-PASS") is satisfied
honestly by the v2 tool — "old" attaches to the predicate, not to the v1-era receipt numbers.

## Impacted axes

- **Operability (C1 replay isolation)** — the attacked axis. Impact: none on reachability of
  REPLAY70_HELD 10/10; positive constraint on implementation correctness (below).
- Secondary: none. No coverage/knowledge claim touched.

## Fixable defect or must-reject tradeoff?

Fixable-in-spirit, **not** fixable in bytes: R1 requires the frozen scripts byte-equal at B, so
the comment cannot be corrected in-lane; any candidate that "fixes" the comment breaks R1.

Smallest safe correction (interpretive, zero frozen-byte change):

1. `control-replay.mjs` must key R3 solely on the frozen counter's verdict line
   (`LEDGER69_UNMET`) + `CONTROL-PASS donothing` + exit codes from the **stdout capture**, and
   must refuse to pattern-match any v1-era quantities (33/33, held=2/7, per-check MISS sets, the
   comment's L1/L4/L6 claims). Over-fitting to the stale comment is itself the
   implementation-forgery mode R3 exists to catch; the honest v2 replay (held=5/7) is the
   expected outcome and must PASS.
2. Do **not** vendor a v1 tool copy into the fixture to reconcile with the comment — the frozen
   script copies `$LANE/scripts/routed-ledger.mjs`; substituting LANE → the REV-archived tree
   (per contract) exercises the pinned v2 tool, and that is correct. A vendored v1 tool would be
   fixture forgery.
3. Disclose the comment's double staleness in the round-70 report/lessons (frozen-byte
   provenance note) so the divergence between the frozen r69 receipt (33/33, held=2/7) and the new
   private replay output (56/56, held=5/7) is read as expected tool evolution, not as a
   forgery signal.
4. Freeze consequence: none on the predicate; the comment's bytes stay frozen-wrong, and the
   expected private output content for R3 is stdout-based (see mechanics note 5).

## Evidence artifacts (private build dir, unique to this seat)

- `.ufo/waves/round-70/build/K70AttackC1Nothing/c1-controls-private.sh.txt` — private copy, 3-line
  substitution diff visible.
- `.ufo/waves/round-70/build/K70AttackC1Nothing/c1-donothing-private-replay.txt` — receipt from
  the isolated v2 replay (2 lines; CONTROL-PASS was stdout-only, captured in the transcript).
- `.ufo/waves/round-70/build/K70AttackC1Nothing/frozen-sha-after.txt`, `lane-head.txt`,
  `evidence-summary.txt`.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackC1Nothing/` created explicitly, receipts
  copied to build dir first, **removed before yield** (verified absent).

## Tooling record (no installs; pacman untouched)

node v24.21.0 (preinstalled, ran frozen probe + private control), git 2.56.0 (read-only archive/
show/rev-parse), sed 0.1.1 + sha256sum 0.8.0 (copy substitution, digest checks). No installs or
updates performed; nothing written outside this seat's build dir, its scratch, and the two
required report/artifact paths. No git/jj mutations anywhere. No delegation, no background jobs
(the one private control run was the required observation). Originals `c1-controls.sh` /
`c2-controls.sh` never executed; the candidate at
`.ufo/waves/round-70/build/K70ExecRunner/control-replay.mjs` did not exist at inspection time, so
the contract/counter was attacked directly.
