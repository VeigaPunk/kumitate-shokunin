MUT digest kills=4/4 survivors=none

# MutDigest — digest-order fix mutation probe (round 36, attempt 1)

Axes: operability (the digest-order repair must not regress to the sorted-order
false mismatch) + coverage (does the hermetic suite actually defend it).

## Setup (read-only outside scratch)

- Scratch clone: `/fast/scratch/kumitate-r36/w/MutDigest/lane`, branch `r36-mutdigest`,
  HEAD `0614092e0804aaca06642cb3a263a05c1cacc98e` (lane master, unmodified lane).
- Candidate patch (stand-in for ExecSurfaceDigestOrder, whose scratch was still at
  base/empty when this arm ran): `scripts/surface-probe.mjs` — concat over the
  manifest-declared `digestInputs` order, gated on the existing set check; digest
  input list nulled when the declared set is incomplete/extra so the partial-set
  fixture keeps its pre-existing "no SCRIPT_DIGEST_MISMATCH" assertion. Suite
  additions per the executor spec: (a) reordered fixture recomputes `scriptDigest`
  over its declared order and must read `DIGEST_ORDER` + no error; (b) sorted-order
  digest vs permuted declaration is the false-negative control (`SCRIPT_DIGEST_MISMATCH`);
  plus an extra lib-level base→argv case mirroring the origin manifest.
- Candidate file sha256 (pristine, restored after every mutant):
  `7a08295d81f8046f2c97b5fd24c0ecc4ef21f8bc0b21d2cf9caa39742c9bee26`
- Patch file: `/fast/scratch/kumitate-r36/w/MutDigest.patch` (69 diff lines).
- Full fixed snapshot: `/fast/scratch/kumitate-r36/w/MutDigest/surface-probe.fixed.mjs`.

## Premise check at the pin (read-only)

`node --input-type=module -e '… import { surfaceManifest } from
"/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs" …'` (reads only;
no command run inside the pinned tree, no writes):

```
declared: scripts/ufo-sighting, scripts/ufo-sighting.mjs,
          scripts/ufo-sighting-lib/base.mjs, …lib/argv.mjs, …lib/observe.mjs, …lib/surface.mjs
sorted  : scripts/ufo-sighting, …lib/argv.mjs, …lib/base.mjs, …lib/observe.mjs,
          …lib/surface.mjs, scripts/ufo-sighting.mjs
declared-sha: sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4
sorted-sha  : sha256:62d57ebe4eb48183db2173fd90b66e86dd3cf4173b69b0659eaccf7e120a642b
manifest.scriptDigest: sha256:b36559d027c8f3b9c7c… (same as declared)
declared==scriptDigest: true ; sorted==scriptDigest: false
```

=> the pre-fix sorted concatenation is the false `SCRIPT_DIGEST_MISMATCH`; the
declared-order concat is the origin contract. [Verified by the arithmetic above.]

## Baselines

- Lane HEAD script, before any edit: `node scripts/surface-probe.mjs --selftest`
  → `42/42 cases passed` / `VERDICT: PASS`.
- Candidate fix (spec cases a+b + lib-order case): `44/44 cases passed` /
  `VERDICT: PASS` (sha above).

## Mutants (each applied alone to the candidate; selftest is the detector)

| # | mutation | file sha256 (mutant) | selftest | killed by (failing checks) | verdict |
|---|----------|----------------------|----------|----------------------------|---------|
| 1 | concat sorted order again: `Buffer.concat(paths.map(...))` (probe's canonically sorted list) | `0023387514f5ea9b0fdbdf36ce8be03d09681bbe6cab4f6b2d91740b18d3901c` | `40/44`, FAIL, exit 1 | reordered (a) `codes=[…SCRIPT_DIGEST_MISMATCH]`; lib-order case; **false-negative control (b)** `exit=0 codes=[DIGEST_ORDER,…]` — expected mismatch did not fire | **killed** |
| 2 | declared order but skip set check: `const setOk = true` | `490dbe61ca808394a72f4d495f3e5f2abac045a3037ff9be994c43f42d5c0e88` | `40/44`, FAIL, exit 1 | ghost fixture (no `DIGEST_SET_INCOMPLETE`); partial fixture (no `DIGEST_SET_INCOMPLETE`, spurious `SCRIPT_DIGEST_MISMATCH`); code-coverage check "never fired: DIGEST_SET_INCOMPLETE" | **killed** |
| 3 | compare only first declared input: `Buffer.concat(concatPaths.slice(0,1).map(...))` | `c510b98e2b001a1c481e13933db356dfd82fb5499cf92de3ebfa770ac9a8b0be` | `36/44`, FAIL, exit 1 | clean fixture (`verdict=DRIFT exit=1 … SCRIPT_DIGEST_MISMATCH`), reordered, lib-order, pintrap, strict pin, code:-literal, status-key cases | **killed** |
| 4 | drop DIGEST_ORDER note (delete the `else if (order differs)` note) | `979fedb987ede43461ea8834082a04c98ac80a2328cc48c4479a95cc051481a3` | `40/44`, FAIL, exit 1 | reordered (a) missing `DIGEST_ORDER`; lib-order case; code-coverage "never fired: DIGEST_ORDER" | **killed** |

Mutant 2 interpretation: the frozen contract requires the declared set to be
"verified against {shim, module} ∪ sorted lib/*.mjs as a set"; the mutant removes
that verification, and the existing ghost/partial fixtures catch it. (A variant
that still gates the set but concatenates over the declared subset is not a defect
under this contract.)

Robustness of kills: every kill has a victim among the pre-existing 42 cases or the
executor-spec-mandated additions (a)/(b) — M1 via (b), M2 via ghost/partial, M3 via
the clean fixture, M4 via the pre-existing reordered expectation. The extra
lib-order case only strengthens, it is not load-bearing.

## Restoration evidence

- After each mutant: `cp surface-probe.fixed.mjs lane/scripts/surface-probe.mjs`;
  `sha256sum lane/scripts/surface-probe.mjs` =
  `7a08295d81f8046f2c97b5fd24c0ecc4ef21f8bc0b21d2cf9caa39742c9bee26` (identical to
  snapshot) in all four restores.
- Final state: same sha; `node scripts/surface-probe.mjs --selftest` →
  `44/44 cases passed`, `VERDICT: PASS`.
- `git -C lane diff --stat` only touches `scripts/surface-probe.mjs` (41 insertions,
  4 deletions). No writes outside `/fast/scratch/kumitate-r36/w/MutDigest/`; the
  pinned tree was read only (its `surface.mjs` imported, no command run there).

## Notes / limits

- Live `--src /fast/scratch/kumitate-r36/src` probe run was NOT executed: the
  dispatcher-state repair (`UFO_STATE_DIR` mkdtemp) is a different arm, and today's
  `readDispatcherStatus` spawns the dispatcher with `cwd=<src>` and no state
  override, which is the write hazard the pin contract forbids. Selftest is the
  assigned detector; the digest arithmetic above is the live-pin evidence. [INFERENCE]
  that ExecSurfaceDigestOrder/ExecSurfaceDispatcherState will run the full pinned
  probe.
- No tools installed; no pacman transaction; no build/lint/formatter run.
