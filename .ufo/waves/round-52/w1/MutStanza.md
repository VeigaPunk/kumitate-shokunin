# MutStanza — SCORECARD-only (Q26-class) mutants against the round-52 freeze tree

**Assignment:** on a scratch copy of the freeze tree apply ONLY a `SCORECARD.md` edit —
variant A: declare stanza values to match the computed tree with no real change (does B5's
proxy conjunct catch the lie when the tree doesn't match?); variant B: fudge `C2_total`
declared to 118 while rows stay 117 (proxy must read DRIFT). Run the frozen A52 probe (or
proxy-check inside the scratch) and report exact verdict lines. Conclusion: can
declared-only edits move any frozen arm?

**Freeze tree:** lane git rev `02c01258464cac3804faf177d0cfbf113cd59706`, exported by
`git clone --shared` into `.ufo/waves/round-52/build/MutStanza/repo` (detached); each mutant
committed there. `diff -rq` against the pristine export shows **only `SCORECARD.md`
differs** for both variants; the corpus census is **118 `*.md` files in every variant**
(unchanged). No lane, fleet, jj or sibling bytes were written.

## Mutants and expected detectors

| Variant | SCORECARD.md edit (only file changed) | sha256 | Expected detector |
|---|---|---|---|
| pristine | none | `e16f1e44…a924e` | B5 MISS (`PROXY: DRIFT`), A52 `held=5/13` |
| **A** | `C2_total=117→118`; `## Axes` `coverage` `10→9` | `fd1b7c62…4c86e` | B5's proxy conjunct should catch a declaration-only "repair" |
| **B1** | `C2_total=117→118` (axes untouched) | `2c86f2ad…8be18` | item expects `C2_TOTAL_DRIFT` (declared 118 vs rows 117) |
| **B2** | `C2_total=118→119`; `## Axes` `coverage` `10→9` | `b9716df7…a4a8ebe` | `C2_TOTAL_DRIFT` (genuine +1 overstatement) |
| restored | pristine bytes restored | `e16f1e44…a924e` | identical to pristine |

Scratch commits: base `02c01258`, A `c5486c5431c68926ff79a48dcb02c51c6011a56d`,
B1 `e3d00760cbbeba0bc2898a1c86aaf353c4c9e01d`, B2 `77cb454f1a0738eb65bd340e5dab2eaf436f627c`,
restored `323bca2b5044df7ded4849daf332d651b9f2bbbe`. Detector: frozen
`probe/attest52-probe.mjs` (rule A52 v1, 13 checks) run as
`node …/attest52-probe.mjs build/MutStanza/repo <rev>`, plus the probe's own
`node scripts/proxy-check.mjs --strict` (UFO_SRC = live origin checkout).

## Baseline (pristine, no mutation)

```
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | B1 MISS exit=0 cases=0 last="ATTEST_SELFTEST: PASS" | B1c MISS exit=0 last="RECEIPT: VALID" | B2 MISS attest52-run-1.txt:absent;attest52-run-2.txt:absent;attest52-run-3.txt:absent | B2c PASS | B2e MISS run exit=64 last="receipt-attest: USAGE unexpected argument \"--stdin\" in run m | B3 MISS attest52-run-2-replayed.txt absent | B3c PASS | B4 MISS tool or receipts dir absent | B4c PASS | B4d PASS | B5 MISS pin match;proxy exit=1 PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=117 c | B5c MISS mutantReceipt=absent-or-malformed selfGuard=present | B6 PASS
```
exit 1. This reproduces the committed freeze receipt `base/attest52-base.txt` exactly
(`held=5/13`, same B5 detail), so the detector is working; the full arm is *expected* to be
UNMET at base, and the mutation detector is the per-check term B5 (and its proxy line).

Pristine proxy verdict (exit 1), identical with live origin and a frozen `31c465f1`
origin snapshot:
```
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=117 computed=118 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=117 computed=118 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
```

## Variant A output (declared-only, tree unchanged)

```
PROXY: MATCH (A=71 C=23 operability=9; C1=19/19 C2=117/118 coverage=9; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
```
exit 0. Frozen A52 probe at `c5486c5`:
```
ATTEST52: ATTEST52_UNMET held=6/13 checks=13 rev=c5486c5431c68926ff79a48dcb02c51c6011a56d rule=A52 version=v1 | B1 MISS exit=0 cases=0 last="ATTEST_SELFTEST: PASS" | B1c MISS exit=0 last="RECEIPT: VALID" | B2 MISS attest52-run-1.txt:absent;attest52-run-2.txt:absent;attest52-run-3.txt:absent | B2c PASS | B2e MISS run exit=64 last="receipt-attest: USAGE unexpected argument \"--stdin\" in run m | B3 MISS attest52-run-2-replayed.txt absent | B3c PASS | B4 MISS tool or receipts dir absent | B4c PASS | B4d PASS | B5 PASS | B5c MISS mutantReceipt=absent-or-malformed selfGuard=present | B6 PASS
```
exit 1. **B5 flipped MISS→PASS**; held 5/13→6/13. Two SCORECARD lines did it: `C2_total`
was raised to the computed census (118, truthful) and the `coverage` axis integer was
*lowered* 10→9 to the newly derived value. The proxy has no `C2 == C2_total` invariant, so
the still-unrowed note `corpus/lessons/round-51-verifier-spotcheck.md` (README map rows =
117, census = 118) is invisible: the state is self-consistent at a lower declared score.
B5's pin conjunct is content-addressed and untouched.

## Variant B output

**B1 (declared 118, axes untouched)** — exit 1:
```
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
```
Probe at `e3d0076`: `ATTEST52_UNMET held=5/13`, `B5 MISS pin match;proxy exit=1 PROXY: DRIFT (AXES_DRIFT term=coverage declared=10 comput`.
`C2_TOTAL_DRIFT` is **gone**: the freeze tree census is 118, so declaring 118 is truthful.
The item's premise "rows stay 117" is false for `C2_total` — 117 is the *README map-row*
count `C2` (measured: 117 mapped rows, 118 files; unrowed note as above). The stated
"proxy must read DRIFT" is therefore not reproducible as a `C2_TOTAL_DRIFT`: with the axes
row also re-declared (variant A) the same edit reads **MATCH**, i.e. the declaration-only
edit is accepted even though the README row was never added.

**B2 (the measurable analogue: overstate by one, declared 119, axes 9)** — exit 1:
```
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=119 computed=118 delta=-1
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=119 computed=118 delta=-1; src-rev=31c465f15669)
```
Probe at `77cb454`: `ATTEST52_UNMET held=5/13`, `B5 MISS … C2_TOTAL_DRIFT term=C2_total declared=119 c`.
So the declared-vs-computed arm does catch a genuine count lie; what it cannot catch is a
declaration moved *to* the computed truth.

## Verdicts

- **Variant A: SURVIVED at the B5-term level** (declared-only edit flips B5 MISS→PASS and
  silences both proxy findings) but **KILLED at the claim-arm level** — 7 real checks
  (`B1, B1c, B2, B2e, B3, B4, B5c`) still MISS; max reachable is 6/13, never
  `ATTEST52_HELD held=13/13`.
- **Variant B as stated: not constructible / premise false** on this freeze tree (census
  118, not 117). Nearest constructions: B1 → `AXES_DRIFT` only (no `C2_TOTAL_DRIFT`);
  B2 (declared 119) → `C2_TOTAL_DRIFT declared=119 computed=118 delta=-1` → **KILLED**.
- **D52 control:** SCORECARD-only edits do not move the second arm —
  `DOCTRINE52_UNMET held=0/5 … E1 MISS entry-absent` exit 1 on pristine *and* variant A.

**Conclusion — can declared-only edits move any frozen arm?** They can move one *term*
(B5's proxy conjunct, via re-declaring to the computed values, at the cost of lowering the
declared `coverage` axis 10→9) but **cannot move either frozen claim arm**: `ATTEST52_HELD`
requires v2 self-test/receipts/stdin/ledger bytes (12 other checks) and `DOCTRINE52_HELD`
requires the corpus entry and SOURCES rows. Coverage finding for the close sequence: B5
cannot distinguish the intended repair (add the README map row → `C2=118`, `coverage=10`)
from a declared-only re-derivation (no row → `C2=117`, `coverage=9`), because
`coverage` is re-declared in the same `SCORECARD.md`. The close must land the real README
row; otherwise B5 passes at a silently reduced frontier. No contract change is implied by
this finding.

## Restoration evidence

Pristine `SCORECARD.md` bytes re-committed as `323bca2b5044df7ded4849daf332d651b9f2bbbe`:
`sha256(SCORECARD.md) = e16f1e44c97070806c120db7a28fd7d70a281ad0620e976f54fd58b1b09a924e` =
pristine hash; `git diff --name-only 02c01258 HEAD` is empty; worktree clean; corpus census
118. Restored probe line:
```
ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=323bca2b5044df7ded4849daf332d651b9f2bbbe rule=A52 version=v1 | B5 MISS pin match;proxy exit=1 PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=117 c
```
identical to baseline (B5 detail included). All logs and hashes in
`build/MutStanza/` (`FINDINGS.txt`, `log-*.txt`, `probe-exits.txt`, `revs.txt`).

_No tool installs or upgrades were needed (node/git/diff only); pacman untouched; no host
service restarted._
