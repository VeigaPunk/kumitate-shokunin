RESULT GateDirect rev=3908f322c4c473f1a8b45c8d1c14054205eb7647 verdict=confirmed selftest=30/30 truth=CLEAN

Seat: GateDirect (direct-gate re-run, kumitate round 39). Scratch clone:
/fast/scratch/hyaku/kumitate-r39/seats/GateDirect/lane, cloned with
`git clone -q --no-hardlinks` and checked out detached at each rev below.
Node: v24.21.0 (pre-existing system node; no tools installed, no pacman
transactions run, per the host-wide pacman pause).

Measured rev 3908f322c4c473f1a8b45c8d1c14054205eb7647 (all four commands run
with cwd = the scratch clone):

1) `node scripts/anchor-truth.mjs --selftest`
   -> `ANCHOR_TRUTH_SELFTEST: 30/30 pass` / `VERDICT: PASS` / EXIT=0
2) `node scripts/anchor-truth.mjs --src /fast/scratch/hyaku/kumitate-r39/src --base e18ff1af3392e3823227644c977c237737fe65c9`
   -> `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)` / EXIT=0
3) `node scripts/anchor-truth.mjs --src /fast/scratch/hyaku/kumitate-r39/src` (no --base)
   -> `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)` / EXIT=0
4) `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` (no --src)
   -> `TRUTH: FAIL-CLOSED (SRC_MISSING /fast/scratch/kumitate-r36/src)` / EXIT=2

Round-open rev fac39171ac28c606e90da75fc2ba2ed3df52f4ea (same four, same cwd):

5) `node scripts/anchor-truth.mjs --selftest`
   -> `ANCHOR_TRUTH_SELFTEST: 22/22 pass` / `VERDICT: PASS` / EXIT=0
6) `node scripts/anchor-truth.mjs --src /fast/scratch/hyaku/kumitate-r39/src --base e18ff1af3392e3823227644c977c237737fe65c9`
   -> `TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)` / EXIT=0
7) `node scripts/anchor-truth.mjs --src /fast/scratch/hyaku/kumitate-r39/src` (no --base)
   -> `TRUTH: CLEAN (notes=4 anchors=811 true=777 debt=21 unchecked=13 src-rev=31c465f15669)` / EXIT=0
8) `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9` (no --src)
   -> `TRUTH: FAIL-CLOSED (SRC_MISSING /fast/scratch/kumitate-r36/src)` / EXIT=2

Findings:
- Expected behavior reproduces exactly at the measured rev: selftest PASS
  30/30, truth CLEAN with and without --base, and fail-closed SRC_MISSING
  (exit 2) when --src is omitted, because the pinned default clone path
  /fast/scratch/kumitate-r36/src no longer exists. The fail-closed path is
  live at both revisions, so the gate never silently falls back to a missing
  default clone.
- The C2 candidate's new floor is present only at the measured rev: the
  selftest grew 22/22 (fac39171) -> 30/30 (3908f322) with AT23-AT30 new
  (BASE_TRUE_LOST / TOKEN_FORGED / pin-source rules), matching the claim.
- Cross-rev delta in the truth run at fixed --src/--base: true 777 -> 778 and
  debt 21 -> 20, all other counts unchanged (anchors=811, unchecked=13,
  notes=4). Exactly one debt anchor flipped to true, consistent with the C1
  re-cite of S8#475 (:560 -> :560-572) being the only note change between
  round-open and the measured rev observable through this gate.
- No anomalies: no run produced DRIFT, no unexpected exit codes, no output
  other than the documented verdict lines.

Residual risk / verification gaps:
- This seat re-runs the gate as-is; it does not mutation-test the floor
  (other seats own the probe and mutant work). The two self-declared open
  limits (unbound review:<seat> source; false anchor at a raw with no
  base-true anchor tradable against repaired debt) are out of my item's
  scope and remain for their assigned critics.
- src-rev reported as 31c465f15669 (short form) matches the pinned upstream
  31c465f15669f744848bd9f5d56191c5085670f7 in prefix.
