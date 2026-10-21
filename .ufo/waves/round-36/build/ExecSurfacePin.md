EXEC surface-pin done cases=8 selftest=50/50 verdict="SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)"

# ExecSurfacePin — PIN v1 in scripts/surface-probe.mjs

Deliverable: `/fast/scratch/kumitate-r36/w/ExecSurfacePin.patch` (sha256 `84e6b7dbd45f…`),
applied to base `0614092e0804aaca06642cb3a263a05c1cacc98e` in
`/fast/scratch/kumitate-r36/w/ExecSurfacePin/lane` (branch `r36-execsurfacepin`).
One file: `scripts/surface-probe.mjs` (+352/−16). Patched file sha256 `1194d828814e…`.
Re-verified from a clean base clone: `git apply <patch>` reproduces `1194d828814e…`,
`node --check` clean, `--selftest` 50/50 PASS.

## Behavior (contract `kumitate-origin-pin-v1`)

- `--pin FILE` (`:179-181`, `:333`, `:342`, `:1771`); default
  `<self>/.ufo/pins/origin.json` when it exists (`:1798`). `--selftest` and
  `--checklists` return before any pin read (`:1792-1793`).
- Pin shape validated before use: contract, `repo`, `clone`, `revision`
  (must be 40 lowercase hex). Anything else → `PIN_MALFORMED`, exit 2 (`:342-373`).
- src precedence (`:1808-1810`): explicit `--src` wins (and is then asserted),
  else `pin.clone`, else today's `$UFO_SRC`/candidate default. A missing pin
  clone is `SRC_REV_UNVERIFIABLE` (exit 2), not a bare `--src` error (`:1812-1822`).
- Assertion (`:376-404`): `git -C <src> rev-parse HEAD`; `GIT_DIR`/`GIT_WORK_TREE`/
  `GIT_INDEX_FILE`/`GIT_OBJECT_DIRECTORY`/`GIT_ALTERNATE_OBJECT_DIRECTORIES` are
  scrubbed so the assertion is about the tree on disk. Mismatch →
  `SRC_REV_MISMATCH`; spawn error (no git) or non-repo exit → `SRC_REV_UNVERIFIABLE`.
  Both exit 2 and are printed before any surface read (`:1798-1831`).
- Verdict (`:902-926`): ` src-rev=<first 12 hex>` is appended inside the
  `SURFACE_PROBE:` parenthetical; also emitted head-line `src=/pin=/src-rev=`.
  No pin → segment absent (old verdict unchanged). `--json` gains `srcRev`,
  `pin {file,repo,revision,clone}`, `options.pin`; null when unpinned.

## Exact verdict lines

- With a pin (this patch alone, live at 31c465f1):
  `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1 src-rev=31c465f15669)`
- Without a pin (unchanged form):
  `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)`
- Refusals:
  `SURFACE_PROBE: FAIL-CLOSED (SRC_REV_MISMATCH: src HEAD <40hex> != pin revision <40hex>)`
  `SURFACE_PROBE: FAIL-CLOSED (SRC_REV_UNVERIFIABLE: src <dir> is not a verifiable git checkout)`
  `SURFACE_PROBE: FAIL-CLOSED (PIN_MALFORMED: <reason>: <file>)`
- Composed with ExecSurfaceKnown + ExecSurfaceDigestOrder + ExecSurfaceDispatcherState
  + ExecPinFiles (scratch-only merge demo, see Integration):
  `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)`
  i.e. `known=<n>` sits before ` src-rev=…`; both are inside the same parens.
  (`warnings=1` is the always-reported non-gating `ERROR_CODE_OFF_MANIFEST`.)

## Hermetic cases added (8; suite 42 → 50, all PASS)

Each is CLI-level and self-contained under `mkdtemp`; the fixture origin tree is a
real git repo whose synthetic `scripts/ufo-sighting.mjs` prints a manifest derived
from its own bytes and whose dispatcher prints the frozen status shape, so a pinned
run reaches a genuine CLEAN with exit 0.

- `pin: matching fixture pin on a temp git repo → CLEAN with src-rev=<12> inside the verdict`
- `pin: --json reports srcRev and the pin identity`
- `pin: pinned revision mismatch → exit 2 SRC_REV_MISMATCH (before any surface is read)`
- `pin: clone that is not a git repo → exit 2 SRC_REV_UNVERIFIABLE`
- `pin: git unavailable → exit 2 SRC_REV_UNVERIFIABLE (never a scored run)` (PATH='')
- `pin: no pin file (absent default + no --pin) → byte-identical old verdict, no src-rev`
- `pin: default <self>/.ufo/pins/origin.json resolves src from pin.clone`
- `pin: missing --pin file and a foreign contract both → exit 2 PIN_MALFORMED`

Also touched (hermeticity, no semantic change): the four bare-`--src`-default cases and
`--src /nonexistent` now spawn with `--self <tmp>/self-no-pin`, so the suite never reads
a pin out of the live repo it lives in. Code-coverage meta-check covers the three new
refusal codes and tolerates them only when `git` is absent (`:1735-1741`).

## Commands run and outputs

```
$ node scripts/surface-probe.mjs --selftest        # 50/50 cases passed; VERDICT: PASS; exit 0
$ node scripts/surface-probe.mjs --pin <pin>       # exit 1
  SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1 src-rev=31c465f15669)
$ node scripts/surface-probe.mjs --self <no-pin> --src /fast/scratch/kumitate-r36/src   # exit 1
  SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)     # 0 occurrences of src-rev=
$ node scripts/surface-probe.mjs --json --pin <pin>  # exit 1
  srcRev=31c465f15669f744848bd9f5d56191c5085670f7  pin.revision=<same>  verdict=DRIFT
$ node scripts/surface-probe.mjs --pin wrong.json    # exit 2
  SURFACE_PROBE: FAIL-CLOSED (SRC_REV_MISMATCH: src HEAD 31c465f1… != pin revision 0000…)
$ node scripts/surface-probe.mjs --pin nonrepo.json  # exit 2
  SURFACE_PROBE: FAIL-CLOSED (SRC_REV_UNVERIFIABLE: src /tmp/.../not-a-repo is not a verifiable git checkout)
$ node scripts/surface-probe.mjs --pin bad.json      # exit 2
  SURFACE_PROBE: FAIL-CLOSED (PIN_MALFORMED: pin contract is "bogus-pin-v9", expected "kumitate-origin-pin-v1": …)
$ node scripts/surface-probe.mjs --pin /nope.json    # exit 2
  SURFACE_PROBE: FAIL-CLOSED (PIN_MALFORMED: pin file is missing: /nope.json)
```

Live default-pin path proved by copying ExecPinFiles' `.ufo/pins/origin.json` into the
scratch clone, running bare, then removing it (not part of the patch):
`SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1 src-rev=31c465f15669)`.

Read-only tree untouched: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` =
`31c465f1…`; `git status --porcelain` = 0 lines; no non-.git file under the clone has an
mtime in the run window. Artifacts: `/fast/scratch/kumitate-r36/w/ExecSurfacePin/`
(`selftest-final.txt`, `live-pinned.txt`, `live-pinned.json`, `live-unpinned.txt`,
`live-default-pin.txt`, `refuse-*.txt`).

## Integration notes for the L1 (important)

1. `.ufo/pins/origin.json` comes from `ExecPinFiles.patch` and matches my loader exactly
   (contract/repo/revision/clone/recreate/verified_at). Once merged, a bare
   `node scripts/surface-probe.mjs` is pinned automatically.
2. `corpus/knowledge/executable-scorecard.md:98` declares `pin.surface-probe=86bdcd9a…`
   (`scripts/proxy-check.mjs:296` compares it). Any edit here invalidates it — refresh
   `pin.*` hashes AFTER the whole merge, not from this patch's `1194d828…`/`84e6b7db…`
   (all four surface-probe patches change the same file).
3. Merge shapes with the sibling surface patches (tested with `git apply --3way` on this
   base; composed tree passes 61/61 and yields the CLEAN line above):
   - ExecSurfaceKnown: keep both new helper blocks; its `PIN_FILE`/`readActivePin` is
     duplicate-but-compatible with `PIN_DEFAULT_PATH`/`loadOriginPin` (dedupe either);
     in `main` keep `knownInput` first, then my pin block, and DELETE its duplicate
     `if (opts.src === null) opts.src = resolveSrcDefault();` — my pin-aware precedence
     subsumes it (leaving it makes a bare `--pin` resolve src from `$HOME`/candidates
     instead of `pin.clone`; this was the only semantic conflict observed);
     `probeConformance({…, known: knownInput.known })` and `${knownSegment}${rev}` in one
     verdict line.
   - ExecSurfaceDigestOrder: its `checkDigests` rewrite and my code do not overlap; the
     only three-way conflict was the rewording of the `SCRIPT_DIGEST_MISMATCH` message,
     where the KNOWN patch's extra `['scriptDigest']` subject arg must be kept.
   - ExecSurfaceDispatcherState: doc-block conflict only (keep my pin paragraph, then its
     expanded `status` paragraph); code regions are disjoint.
4. `validate` every checklist item's expected substring stays `SURFACE_PROBE: CLEAN`
   (still matches the composed line).

## Risks / limits

- An active default pin also asserts an explicit `--src` (by design: every verdict names
  the revision it scored). Escape hatches: `--self <dir without .ufo/pins>` or a `--pin`
  for the tree being probed.
- `git -C <src>` follows parent directories, so a subdirectory of a checkout reports that
  checkout's HEAD; `--src` must name the tree root for the assertion to mean what it says.
- Uppercase hex in `revision` is `PIN_MALFORMED` (git prints lowercase; contract shows
  lowercase). Short shas are refused for the same reason.
- `--pin` is deliberately ignored by `--selftest`/`--checklists` (checklist items pin
  themselves); a pin that cannot be honoured never reaches a scored run.

Tool installs/upgrades: none. No package transactions, services, or host state touched.
