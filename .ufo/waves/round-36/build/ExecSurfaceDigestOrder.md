EXEC digest-order done selftest=43/43 pin-errors=2

# ExecSurfaceDigestOrder — surface-probe digest order fix

Scope: `scripts/surface-probe.mjs` `checkDigests()` concatenates bytes in the
manifest-declared `digestInputs` order instead of the probe's own sorted disk
order; plus the hermetic cases the item named and the now-stale prose in
`corpus/knowledge/live-surface-probe.md`. Base: lane master
`0614092e0804aaca06642cb3a263a05c1cacc98e`; work in scratch clone
`/fast/scratch/kumitate-r36/w/ExecSurfaceDigestOrder/lane` (branch
`r36-execsurfacedigestorder`). Pin clone `/fast/scratch/kumitate-r36/src`
(@ `31c465f1`) is `chmod a-w` and was only read (`surface --json`, `rev-parse`).

Patch: `/fast/scratch/kumitate-r36/w/ExecSurfaceDigestOrder.patch`
(147 lines, sha256 `73c66f9ac6b5298dabb4e73023b614cc159531de0aa9f0036731dd22f91b0afe`).
`git apply --check` against the lane base: **APPLIES_CLEAN**.

## Diff (53 insertions, 19 deletions, 2 files)

`scripts/surface-probe.mjs`
- `:36-42` header contract: digestInputs SET from disk, ORDER from the manifest
  (`base.mjs` precedes `argv.mjs`; sorted-by-path concat = false mismatch).
- `:549-613` `checkDigests()`:
  - set verification hardened: named paths, duplicates and non-string entries
    now break `setOk` (detail gains `duplicate=` / `null-entry`); still reported
    as the existing `DIGEST_SET_INCOMPLETE`, no new finding kind.
  - `DIGEST_ORDER` note unchanged (`listedPaths` vs shim→module→sorted libs).
  - concat now `Buffer.concat(listedPaths.map(p => readFileSync(join(src,p))))`,
    computed only when `setOk` (complete, duplicate-free, readable) — a broken
    set stays `DIGEST_SET_INCOMPLETE` with no double-counted
    `SCRIPT_DIGEST_MISMATCH` (the partial/ghost fixtures keep their contract).
  - mismatch detail reworded `declared-order digest … != manifest.scriptDigest`.
- `:1112-1138` selftest: case (a) `reordered` fixture now recomputes
  `scriptDigest` over the permuted declared order (it previously relied on the
  bug: permuting the list while keeping the sorted digest still passed);
  new case (b) `ordertrap`: declared order permuted, `scriptDigest` left over
  sorted bytes → must fire `SCRIPT_DIGEST_MISMATCH` + `DIGEST_ORDER`, exit 1.

`corpus/knowledge/live-surface-probe.md` (adjacent-doc consistency, 9 lines):
`:65-69` "sorted lib modules — in that fixed order" → manifest-declared
`digestInputs` order; `:128` table row likewise; `:167` finding row says
"declared-order concatenated-byte digest". Historical 2026-09-28 measurements
left untouched.

## Evidence (commands run in the scratch lane, cwd = lane root)

1) Baseline before patch:
`node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r36/src`
→ `errors=3`, `byKind` included `SCRIPT_DIGEST_MISMATCH:1`,
`DIGEST_CONCAT — concatenated-byte digest sha256:f17d1547…68da9 !=
manifest.scriptDigest "sha256:b36559d0…be30c4"`.

2) Independent digest math at the pin (node one-liner, declared vs sorted):
```
declared-order: sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4
sorted-order  : sha256:f17d1547901ad6ebb50ab7f705e9d50770b4ab19ddcdc8927a97958d74068da9
```
Manifest `digestInputs` order at the pin is
`ufo-sighting, ufo-sighting.mjs, lib/base.mjs, lib/argv.mjs, lib/observe.mjs,
lib/surface.mjs`; the manifest's own `scriptDigest` equals the declared-order
concat, so the pre-patch mismatch was false in exactly the declared way.

3) `node --check scripts/surface-probe.mjs` → `SYNTAX_OK`.

4) `node scripts/surface-probe.mjs --selftest` (exit 0):
`43/43 cases passed`, `VERDICT: PASS`. New/updated cases:
```
PASS  digestInputs order permuted (declared-order digest) → DIGEST_ORDER note, no error — exit=0 codes=[DIGEST_ORDER,PIN_DRIFT,STATUS_SHAPE_DERIVED]
PASS  declared order permuted but scriptDigest over sorted bytes → SCRIPT_DIGEST_MISMATCH — exit=1 codes=[DIGEST_ORDER,PIN_DRIFT,SCRIPT_DIGEST_MISMATCH,STATUS_SHAPE_DERIVED]
```
(The suite grew 42/42 → 43/43: one case reworded, one added.)

5) `node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r36/src --json`
(exit 1, `verdict DRIFT`, `errors 2`):
```
DIGEST_INPUT_SET:ok DIGEST_PER_FILE:ok DIGEST_CONCAT:ok
kinds {"DIGEST_ORDER":1,"ERROR_CODE_OFF_MANIFEST":1,"PIN_MATCH":1,"SURFACE_UNREACHABLE":1,"VERB_UNDECLARED":1}
```
`SCRIPT_DIGEST_MISMATCH` is gone at the pin (3 → 2 errors). The two remaining
errors are out of this item's scope and are the other round-36 moves:
`VERB_UNDECLARED surface` (the upstream defect the `--known` pin will absorb)
and `SURFACE_UNREACHABLE [dispatcher/STATUS_REACH] status exited 1` (the
read-only pinned tree; `readDispatcherStatus` fix belongs to
ExecSurfaceDispatcherState — my hunks are at `:37-42`, `:550-613`,
`:1112-1138` and do not overlap its region at `:402-414`; messaged that peer).

No `pin-errors` beyond the two above were introduced: `DIGEST_ORDER` is a note,
`ERROR_CODE_OFF_MANIFEST` and `PIN_DRIFT` are non-gating.

## Risks / notes for the L1

- [INFERENCE] Text `concatDetail` changed from `concatenated-byte digest …` to
  `declared-order digest …`; no consumer greps that string (checked lane-wide:
  only SCORECARD prose mentions `DIGEST_CONCAT`, and that is the round-36
  pre-registration, not a parser). Finding kind/code unchanged.
- `SCORECARD.md:461-466` still describes the defect as open (pre-registration
  text); left untouched as L1-owned.
- Sibling may land a `--known`/`--pin` change in the same file; patch is
  disjoint from `readDispatcherStatus` and the pin/known selftest region
  (`:1440+`), and `git apply --check` is clean at base. ExecSurfaceDispatcherState
  confirmed by message its hunks are the import at `~125`, `readDispatcherStatus`
  `~402-433`, a `listTree` helper `~1028-1043` and one case at `~1318-1360` —
  zero overlap with mine (`37-42`, `550-613`, `1112-1138`).
- No tool installs; no package manager invoked; no writes to the pin clone or
  the production lane (only this report).
