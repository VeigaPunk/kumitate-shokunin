DIGEST-CONTRACT declared-order=scripts/ufo-sighting,scripts/ufo-sighting.mjs,scripts/ufo-sighting-lib/base.mjs,scripts/ufo-sighting-lib/argv.mjs,scripts/ufo-sighting-lib/observe.mjs,scripts/ufo-sighting-lib/surface.mjs declared-eq=yes probe-eq=no

# ScoutSurfaceDigest — digest contract re-derived at pin 31c465f15669

Read-only. No tool installs. No writes outside this report and /tmp scratch
(`/tmp/surface-manifest-r36.json`, `/tmp/surface-err.txt`). Pin tree untouched:
every digest-covered file still reads `2026-10-21 00:57:06` (checkout time) after my
`surface --json` run.

## 1. Upstream lines that define the order (observed)

`/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/base.mjs:17-21`
```
17 export const ROOT = realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".."));
19 export const SHIM_PATH = path.join(ROOT, "scripts", "ufo-sighting");
21 export const MODULE_PATH = path.join(ROOT, "scripts", "ufo-sighting.mjs");
```

`/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs:13-18` — the lib list is a
**hand-written, non-alphabetical literal**: `base.mjs` is third overall and precedes `argv.mjs`.
```
13 const SURFACE_MODULE_PATHS = [
14   path.join(ROOT, "scripts", "ufo-sighting-lib", "base.mjs"),
15   path.join(ROOT, "scripts", "ufo-sighting-lib", "argv.mjs"),
16   path.join(ROOT, "scripts", "ufo-sighting-lib", "observe.mjs"),
17   path.join(ROOT, "scripts", "ufo-sighting-lib", "surface.mjs"),
18 ];
```

`/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs:31-46` — the concat is over
`inputs` in that array order, i.e. declared order == ingested order:
```
36   const inputs = [SHIM_PATH, MODULE_PATH, ...SURFACE_MODULE_PATHS].map((file) => ({
37     path: path.relative(ROOT, file),
38     ...fileSha256(file),
39   }));
40   const combined = createHash("sha256");
41   for (const input of inputs) combined.update(input.bytes);
43     digest: `sha256:${combined.digest("hex")}`,
44     inputs: inputs.map(({ path: file, sha256 }) => ({ path: file, sha256 })),
```
So `manifest.scriptDigest` is sha256 over the bytes of `digestInputs` **in manifest order**. The
manifest's own order is therefore the only definition of the contract; it is not derived by sorting.

## 2. Manifest observed at the pin

`cd /fast/scratch/kumitate-r36/src && bash ./scripts/ufo-sighting surface --json` → exit 0, 13141
bytes, empty stderr, `kind=sighting-surface-v1`.

```
scriptDigest=sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4
0 scripts/ufo-sighting                     a9511ef5b56b711ad29ce10928583b9d1a0603f7d67f3bc4bc538cd2be104caa
1 scripts/ufo-sighting.mjs                 ce625a0b19c7fc46a8e7bf3d17cf3ccf369ed57175b86ab0bec0bdb26e2cb4c8
2 scripts/ufo-sighting-lib/base.mjs        8f4bc1e1a32cd4afdd343131fc7fdacc29f679c42653c42db0e233b3c89b2263
3 scripts/ufo-sighting-lib/argv.mjs        7ca628c150fb49adec44832316022454c2f417176b27d522f92e7ab3850a8966
4 scripts/ufo-sighting-lib/observe.mjs     43e9cf0d1c7bfaba3805c8d95e104af57aede91252ea4f4d43d5b5876a5c6d8f
5 scripts/ufo-sighting-lib/surface.mjs     838f28a64996d5c8befb2a64478c35fa2700f7fdc72756b493179cc61b6a5000
```
Six inputs: shim + module + 4 lib modules. Set == {shim, module} ∪ `lib/*.mjs` (4 files, nothing
else on disk) — matches `DIGEST_INPUT_SET ok` in the recorded baseline.

## 3. Independent digests (`sha256sum`, not the probe)

```
cd /fast/scratch/kumitate-r36/src && sha256sum scripts/ufo-sighting scripts/ufo-sighting.mjs \
  scripts/ufo-sighting-lib/{base,argv,observe,surface}.mjs      # → the 6 values above, all = declared

cat scripts/ufo-sighting scripts/ufo-sighting.mjs scripts/ufo-sighting-lib/base.mjs \
    scripts/ufo-sighting-lib/argv.mjs scripts/ufo-sighting-lib/observe.mjs \
    scripts/ufo-sighting-lib/surface.mjs | sha256sum
b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4  -        # == manifest.scriptDigest

cat scripts/ufo-sighting scripts/ufo-sighting.mjs scripts/ufo-sighting-lib/argv.mjs \
    scripts/ufo-sighting-lib/base.mjs scripts/ufo-sighting-lib/observe.mjs \
    scripts/ufo-sighting-lib/surface.mjs | sha256sum
f17d1547901ad6ebb50ab7f705e9d50770b4ab19ddcdc8927a97958d74068da9  -        # probe's sorted order
```
Same result via `node` `Buffer.concat` over the manifest's own entries:
`sha256:b36559d0…` (declared), and over `[shim, module, ...libs.sort()]`: `sha256:f17d1547…`.
`ls scripts/ufo-sighting-lib/*.mjs | sort` → argv, base, observe, surface — only `argv`/`base`
transpose; the other four positions agree.

## 4. Probe side: where sorted order comes from

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/surface-probe.mjs:289-301`
```
289 /** The digest-covered byte set, derived from disk: shim, module, sorted libs. */
294   libs = readdirSync(libDir) ... .sort();
300   const paths = [join(src, SIGHTING_SHIM), join(src, SIGHTING_MODULE), ...libs];
```
`…:583-593` concatenates exactly those `paths` and compares to `manifest.scriptDigest`:
```
585 try { digest = `sha256:${sha256Hex(Buffer.concat(paths.map((p) => readFileSync(p))))}`; } ...
593 note('error', 'SCRIPT_DIGEST_MISMATCH', 'sighting', 'DIGEST_CONCAT', concatDetail, ...)
```
Baseline `.ufo/waves/round-36/baseline/surface-pin.txt` records the probe's own computed value
`sha256:f17d1547901ad6ebb50ab7f705e9d50770b4ab19ddcdc8927a97958d74068da9` against
`"sha256:b36559d0…"`. Both of my independent computations reproduce those two strings exactly, so
the probe's `SCRIPT_DIGEST_MISMATCH` is **false**: same bytes, same set (set and per-file checks
read `ok`), only the concatenation order differs. `probe-eq=no` is the bug, `declared-eq=yes` is
the truth.

## 5. Consequences for the fix (observed in lane code)
- `DIGEST_ORDER` is a note, not an error (`surface-probe.mjs:203`, `:559`), and it fires permanently
  at this pin (baseline `byKind` has `DIGEST_ORDER:1`) because declared order ≠
  shim→module→sorted-libs. That is exactly the contract's stated remainder — keep it, do not gate it.
- **Fixture hazard (must-fix, else selftest breaks):** `surface-probe.mjs:1095-1104` permutes
  `digestInputs` and asserts `DIGEST_ORDER` + exit 0 + zero errors. Once the concat follows declared
  order, that permuted manifest's `scriptDigest` (built from the unpermuted order at `:968`) no
  longer matches → `SCRIPT_DIGEST_MISMATCH` fires → assertion fails. Recompute
  `reorderedManifest.scriptDigest` over the permuted order (the `DIGEST_ORDER` note survives, since it
  is decided by the set/order comparison at `:557-560`, independent of the digest).
- **Coverage gap in the hermetic suite:** `buildFixture` derives both `digestInputs` and
  `scriptDigest` from the same `paths` (`:960-968`), and `FIXTURE_LIB` keys are already sorted
  (`alpha.mjs`, `beta.mjs`, `:927-930`), so no fixture today can express "declared order differs
  from sorted order" — i.e. the suite cannot fail on the origin's real defect. Add one fixture whose
  manifest declares a lib order that is not sorted (base before argv, mirroring upstream) with
  `scriptDigest` over that order; it must read `DIGEST_CONCAT ok` + `DIGEST_ORDER` note.
- **Doc/comment text asserting sort order** (will contradict the fixed code):
  `scripts/surface-probe.mjs:37` ("sorted", "in that order") and `:39-40`;
  `corpus/knowledge/live-surface-probe.md:65-70` and `:127` ("shim + module + sorted
  `scripts/ufo-sighting-lib/*.mjs`"). Those are the only in-lane assertions of sorted order
  (grep over `*.mjs/*.md/*.json/*.txt`, excluding `.ufo/waves`). Note the doc's citation
  `surface.mjs:43-58` is stale — the digest lives at `:31-46` in this revision — and its measured
  `0e98c908…` is a 2026-09-28 snapshot of a different revision, historical not current.
- Path hygiene [INFERENCE, cheap]: per-file and concat resolution use `join(src, entry)` with no
  containment check; the set comparison stops `..`-escapes from passing unnoticed only indirectly.
  Resolving declared paths with an absolute/`..` rejection keeps the concat reading strictly the
  declared set.

## 6. Confidence

High on the arithmetic and the order (two independent tools, and the probe's own field value
matches my reproduction). High on the two fixture findings (read directly from the lane file, no
inference). Remaining unknowns: none material for the digest contract; the canonical
`config/ufo.json` `sighting.surfaceDigest` relation is another scout's item — baseline records
`PIN_DIGEST ok`, which I observed but did not re-derive.

## Commands run
```
ls -la /fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/ ; git -C <src> rev-parse HEAD
bash ./scripts/ufo-sighting surface --json > /tmp/surface-manifest-r36.json      # exit 0
nl -ba surface.mjs:12-18,15-46 ; nl -ba base.mjs:17-22
nl -ba surface-probe.mjs:30-52,280-302,537-595,955-972,1030-1115
sha256sum <6 files> ; cat <declared order> | sha256sum ; cat <sorted order> | sha256sum
node -e '<per-file + both concat digests + manifest comparison>'                  # twice
ls scripts/ufo-sighting-lib/*.mjs | sort | xargs -n1 basename
grep -rn 'digestInputs|scriptDigest|DIGEST_ORDER' --include=*.mjs --include=*.md --include=*.json .
stat -c '%y %n' <6 covered files>                                                # 2026-10-21 00:57:06, unchanged
```
