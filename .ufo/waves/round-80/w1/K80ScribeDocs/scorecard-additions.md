# SCORECARD.md additions — round 80 (draft against `6d03402fddf44cc9797ec590f0f888e933db4677`)

Text only. Insertion points: the two Move-log rows go after `| 79 |` (last row of the Move log,
`SCORECARD.md:558`); the round-81 pre-registration goes immediately after the `## Planned` heading
(`SCORECARD.md:561`), above the round-80 block, newest-first as the file's convention has it.
Numbers are re-derived at the scaffold: `w1/K80ScribeDocs/scaffold-readings.txt` (my run) and
`w1/K80ScribeDocs/base-readings.txt` (a `git archive 1968689f` extract, read-only).

## Move-log row — C1 (operability)

```
| 80 | operability (integer held 9 — terminal under `f_O`; capability deepening `spotcheck-adopt` v3 — the spotcheck set and the README map are two readings, `--adopt` validates its own delta) | `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1` at a `git archive 1968689f` tree → `C80_C1: HELD held=6/13` (`.ufo/waves/round-80/open/c1-base.txt`); the constant printer reads `held=3/13` (`controls/c1-stub.txt`); at open a green spotcheck set on a red map reads one conflated `SPOTCHECK_MAP: DRIFT spotchecks=1 uncovered=0 first=oracle` exit 1 (`open/conflation.txt`; the lane itself reads `spotchecks=46 uncovered=1`, `open/base-receipts.txt`) and `--adopt` on a red map reads `REFUSED_ORACLE` exit 2 (base arm 08) | same command at `6d03402f` → `C80_C1: HELD held=13/13` exit 0 (`w1/K80ScribeDocs/c1-at-6d03402f.txt`): arm 03 reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0` + `MAP: DRIFT first=uncovered:knowledge/late.md` exit 0, arm 04 `MAP: DRIFT first=orphan-row:knowledge/ghost.md` exit 0, arm 05 both lines with exit 1, arm 08 `ADOPTED … wrote=both` on a red map with the unrelated finding surviving, arms 09–11 refuse or roll back byte-exactly; the lane reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN` exit 0; `--selftest` `SPOTCHECK_ADOPT_SELFTEST: PASS (28/28)`; stanza A 884 → 886 (the two round-80 probes), C 39 held, C2/C2_total 194 → 195 (the adopted `lessons/round-79-verifier-spotcheck.md` row), `pin.spotcheck-adopt` `b84343a0…` → `0d9c56dc…`; `PROXY: MATCH` | `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1`; `.ufo/waves/round-80/{plan.md,open/,controls/,probe/}`; `scripts/spotcheck-adopt.mjs` (`kumitate-spotcheck-adopt-v3`); `corpus/README.md`; `w1/K80ScribeDocs/scaffold-readings.txt` |
```

## Move-log row — C2 (coverage:omp)

```
| 80 | coverage:omp (integer held 10 — the axis's own derivation surface: the O terms default to the committed receipt with `source=snapshot`, the live root is the explicit `--omp-live` opt-in) | at open `node scripts/proxy-check.mjs` → `PROXY: DRIFT (C2_TOTAL_DRIFT declared=194 computed=195; O_MEMBERS_DRIFT declared=64 computed=65; AXES_DRIFT coverage row=10 derived=9)` exit 1 (`open/proxy.txt`); offline (`HOME` empty) → `PROXY: FAIL-CLOSED (KIMI_ROOT_NOT_A_DIR)` exit 2; `probe80-c2 --set c2` at a `git archive 1968689f` tree → `held=4/12` (`open/c2-base.txt`), the constant-JSON stub `held=1/12` (`controls/c2-stub.txt`) | same command at `6d03402f` → `C80_C2: HELD held=12/12` exit 0 (`w1/K80ScribeDocs/c2-at-6d03402f.txt`): arm 01 `OMP_AGENT_ROOT` = a 68-member fixture → MATCH `source=snapshot O_members=65`; arm 02 `--omp-live` on the same root → `source=live O_members=68` + `O_MEMBERS_DRIFT`; arm 03 offline MATCH; arm 05 receipt absent → `OMP_SHAPE_NOT_FOUND` exit 2 (no silent live fallback); arm 08 a wrong-mode receipt member → `O_findings=1 coverage_omp=9`; arm 10 `--compare` DRIFTs on the 68-member root while the proxy default stays MATCH; `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs` → `PROXY: MATCH (… O_members=65 O_findings=0 O_bound=35 coverage:omp=10; …; source=snapshot)` exit 0; receipt re-captured at 65 entries, sha256 `84e41b9f…` = `pin.omp-shape`; `omp-census --shape` → `CLEAN (source=snapshot entries=65 findings=0 bound=35/35)`, `--compare` live → `IN_SYNC entries=65 receipt=65 transient=0`; stanza `O_members` 64 → 65, `pin.proxy-check` `ab304f97…` → `59dfeb64…`, `pin.omp-shape` `5980a0c8…` → `84e41b9f…` | `node .ufo/waves/round-80/probe/probe80-c2.mjs --set c2`; `.ufo/waves/round-80/{plan.md,open/,controls/,probe/}`; `scripts/proxy-check.mjs` (snapshot default + `--omp-live`), `scripts/omp-census.mjs`, `.ufo/pins/omp-shape.json`; `w1/K80ScribeDocs/scaffold-readings.txt` |
```

## Same-commit re-measure line (draft; closure values to be confirmed by the L1)

- Same-commit re-measure at the scaffold: A 884 → 886 (the two frozen round-80 probes), C 39 held
  (both checklist items replaced in place, none added), C2/C2_total 194 → 195 (the adopted
  `lessons/round-79-verifier-spotcheck.md` README row), re-pins `pin.proxy-check` `ab304f97…` →
  `59dfeb64…`, `pin.omp-shape` `5980a0c8…` → `84e41b9f…`, `pin.spotcheck-adopt` `b84343a0…` →
  `0d9c56dc…`; `O_members` 64 → 65 with `source=snapshot`; `operability` 9, `coverage:omp` 10.
  At closure the round's own lesson + its README row are expected to move C2/C2_total 195 → 196 and
  A by the wave's committed harnesses — measure, do not copy this line.

## Proposed `## Axes` sentence (coverage:omp row; needed for truthfulness, not a Move-log row)

The row still reads as if the live root were the source (it ends "…Round 77 makes the same integer
re-derivable offline from the pinned k…", `Last change` = round 77). Proposed append, one sentence,
`Last change` → round 80:

> Round 80 makes the committed receipt the **default** O source (`source=snapshot` in the verdict line
> and the `--json` body), keeps the live read behind the explicit `--omp-live`, and re-captures the
> receipt at 65 members (`84e41b9f…`): `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs` reads
> `MATCH … O_members=65 … source=snapshot`, and the live root keeps its watch through the non-scoring
> `omp-census --compare` item.

## Round-81 pre-registration (insert after `## Planned`, above the round-80 block)

```
**Round 81 — pre-registration (2026-11-04, written by round 80).** Candidates, not commitments:
(1) **The live O root is now a non-scoring watch:** since round 80 the proxy's O terms default to the
committed receipt, so a host whose live root moved reads `PROXY: MATCH` and the drift is visible only
through the non-scoring `omp-census --compare` checklist item (measured this round: a 68-member fixture
reads `OMP_SHAPE_COMPARE: DRIFT` while the proxy default stays MATCH). Decide whether the closure scores
the live-vs-receipt delta under an explicit flag or records why the watch stays non-scoring.
(2) **The receipt is a capture with no age:** `.ufo/pins/omp-shape.json` carries only `contract` and
`entries` — no capture time, host or count — so a closure cannot tell whether the pinned shape is stale
or how far the live root may move before the watch is meaningless. Add a capture-time/`transient`
disclosure or a re-capture cadence.
(3) **The `A` term counts every runnable file under the lane root:** 22 fixture `.mjs` files left under
an extracted copy moved `A` 886 → 908 and turned the proxy into `A_DRIFT` (measured this round on a
scratch copy; the checklist's proxy item read exit 1). Either exclude a named scratch path or make
`A_DRIFT` name the offending files.
(4) **The adopt delta compares findings, not bytes:** `otherFindings(after,key)` is a JSON comparison of
the oracle's finding list, and a refusal restores the whole pre-image, so a concurrent edit to an
unrelated README row that adds no finding is invisible and a concurrent write inside the window is
clobbered. Hash both destinations into the journal and compare-and-swap on commit and rollback.
```
