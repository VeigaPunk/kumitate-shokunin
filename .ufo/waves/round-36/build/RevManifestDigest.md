REV manifest-digest order=shim,module,base.mjs,argv.mjs,observe.mjs,surface.mjs source=/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs:36

# RevManifestDigest — upstream `scriptDigest` definition (read-only)

Source pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7 (chmod a-w; no writes performed — proof below).

## 1. Exact upstream code

`/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs:13-18` — the literal module list
(not a directory scan, not sorted at runtime):

```js
const SURFACE_MODULE_PATHS = [
  path.join(ROOT, "scripts", "ufo-sighting-lib", "base.mjs"),
  path.join(ROOT, "scripts", "ufo-sighting-lib", "argv.mjs"),
  path.join(ROOT, "scripts", "ufo-sighting-lib", "observe.mjs"),
  path.join(ROOT, "scripts", "ufo-sighting-lib", "surface.mjs"),
];
```

`surface.mjs:26-29` — raw bytes, per file:

```js
export function fileSha256(file) {
  const bytes = readFileSync(file);
  return { bytes, sha256: createHash("sha256").update(bytes).digest("hex") };
}
```

`surface.mjs:36-45` — the concatenation and the digest (the whole definition):

```js
  const inputs = [SHIM_PATH, MODULE_PATH, ...SURFACE_MODULE_PATHS].map((file) => ({
    path: path.relative(ROOT, file),
    ...fileSha256(file),
  }));
  const combined = createHash("sha256");
  for (const input of inputs) combined.update(input.bytes);
  return {
    digest: `sha256:${combined.digest("hex")}`,
    inputs: inputs.map(({ path: file, sha256 }) => ({ path: file, sha256 })),
  };
```

`surface.mjs:62,68-69` — the manifest writer emits the SAME array it hashed, verbatim:

```js
  const { digest, inputs } = surfaceScriptDigest();      // line 62
...
    scriptDigest: digest,                                // line 68
    digestInputs: inputs,                                // line 69
```

`SHIM_PATH`/`MODULE_PATH`/`ROOT`: `base.mjs:17,19,21` — `ROOT` = realpath of the repo root two levels up
from `scripts/ufo-sighting-lib/`; `SHIM_PATH = ROOT/scripts/ufo-sighting`, `MODULE_PATH = ROOT/scripts/ufo-sighting.mjs`.

## 2. Arithmetic that maps `digestInputs` to `scriptDigest`

`createHash("sha256")` + repeated `update()` is a streaming hash: feeding `input.bytes` in array order is
byte-identical to hashing one buffer formed by `Buffer.concat([...])` (no separators, no lengths, no
per-file hashes — the `sha256` fields in `digestInputs` are never fed to the hash):

```
digest = "sha256:" + hex( SHA256(
    B(scripts/ufo-sighting)             # SHIM_PATH
  ‖ B(scripts/ufo-sighting.mjs)         # MODULE_PATH
  ‖ B(scripts/ufo-sighting-lib/base.mjs)     # SURFACE_MODULE_PATHS[0]
  ‖ B(scripts/ufo-sighting-lib/argv.mjs)     # SURFACE_MODULE_PATHS[1]
  ‖ B(scripts/ufo-sighting-lib/observe.mjs)  # SURFACE_MODULE_PATHS[2]
  ‖ B(scripts/ufo-sighting-lib/surface.mjs)  # SURFACE_MODULE_PATHS[3]
) )
```

`digestInputs` is an ordered 1:1 index of that byte stream: entry i is the file whose bytes are fed at step i.
The array is emitted, not re-derived, so **the manifest's array order IS the hashing order** — there is no
other ordering rule to infer.

Verified against the live pin (both orders computed from the pinned bytes on disk; manifest read from the
pinned CLI itself):

```
declared-order sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4   == manifest.scriptDigest
sorted-order   sha256:f17d1547901ad6ebb50ab7f705e9d50770b4ab19ddcdc8927a97958d74068da9   == lane probe's computed value
```

Manifest `digestInputs` as emitted at the pin (order + per-file sha256):

```
scripts/ufo-sighting                    a9511ef5b56b711ad29ce10928583b9d1a0603f7d67f3bc4bc538cd2be104caa
scripts/ufo-sighting.mjs                ce625a0b19c7fc46a8e7bf3d17cf3ccf369ed57175b86ab0bec0bdb26e2cb4c8
scripts/ufo-sighting-lib/base.mjs        8f4bc1e1a32cd4afdd343131fc7fdacc29f679c42653c42db0e233b3c89b2263
scripts/ufo-sighting-lib/argv.mjs        7ca628c150fb49adec44832316022454c2f417176b27d522f92e7ab3850a8966a
scripts/ufo-sighting-lib/observe.mjs     43e9cf0d1c7bfaba3805c8d95e104af57aede91252ea4f4d43d5b5876a5c6d8f
scripts/ufo-sighting-lib/surface.mjs     838f28a64996d5c8befb2a64478c35fa2700f7fdc72756b493179cc61b6a5000
```

The per-file `sha256sum` values agree with the manifest's `digestInputs[].sha256` exactly (same six lines),
so the set and the bytes are not in question; only the order differs.

## 3. Invariant the lane probe must preserve

1. The concat input sequence must be **exactly the manifest's `digestInputs` array, in array order**, each
   entry resolved to `<src>/<path>` and read as raw file bytes. Mirror upstream's own iteration
   (`for (const input of inputs) combined.update(input.bytes)`): the probe hashes the declaration, it does
   not re-derive the declaration.
2. `DIGEST_INPUT_SET` remains a pure **set** comparison: `{scripts/ufo-sighting, scripts/ufo-sighting.mjs}`
   ∪ `lib/*.mjs` on disk, compared to the listed paths as a set (upstream's declared set happens to equal
   the on-disk set at this pin).
3. `DIGEST_ORDER` stays a **note**, and legitimately keeps firing at this pin: the declared order
   (base before argv) differs from `shim → module → sorted libs`. That note is the correct statement of a
   true fact; it is not an error and must not be gated away. Do not "fix" it by re-sorting.
4. `digestInputs[].sha256` are bare hex of each file individually; `scriptDigest` carries a `sha256:`
   prefix and is never equal to any single file's hash (upstream comment, surface.mjs:32-35).

## 4. The two ways a probe can be wrong

- **Order wrong (the live defect).** Same six files, re-sorted before concatenation.
  Probe: `scripts/surface-probe.mjs:300` builds `[shim, module, ...libs]` where `libs` comes from
  `readdirSync(...).sort()` (`surface-probe.mjs:293-299`), and `surface-probe.mjs:585` hashes
  `Buffer.concat(paths.map(readFileSync))` in that derived order. `readdir+sort` yields
  `argv.mjs < base.mjs`, i.e. `[shim, module, argv, base, observe, surface]`; upstream declares
  `[shim, module, base, argv, observe, surface]`. One adjacent transposition of equal-length streams
  changes every byte after argv's header, so the digest is unrelated — and the probe reports
  `SCRIPT_DIGEST_MISMATCH` on a fully conformant tree. Observed: baseline
  `.ufo/waves/round-36/baseline/surface-pin.txt:6` computed `f17d1547…` vs declared `b36559d0…`
  (same pair in `surface-default.txt:6`).
- **Set wrong.** Hashing a different member set than `digestInputs` declares: omitting a lib, adding a
  stray `*.mjs`, or (the "digest trap", surface.mjs:32-35 / surface-probe.mjs:1109-1114) hashing the
  per-file hashes, their JSON, or one file alone instead of the raw concatenated bytes. A set error
  changes the byte stream even when the order is right; the probe's own fixtures cover the set side
  (`DIGEST_SET_INCOMPLETE`, `DIGEST_INPUT_MISSING`, `DIGEST_MISMATCH`), but the concat path
  (`surface-probe.mjs:584-596`) must also take its members from the declaration, not from
  `sightingBytePaths(src)`, once the order is switched to the manifest's.

Sequencing note for the C1(a) fix: fixing order without fixing the member source leaves the two roles
entangled — `paths` (disk-derived) currently serves both `DIGEST_INPUT_SET/PER_FILE` and the concat.
Conformant shape: set/per-file checks keep using the disk derivation; the concat check iterates
`manifest.digestInputs` in declared order (skipping/reporting entries whose file is absent, which
`DIGEST_INPUT_MISSING` already covers) and reads their bytes.

## 5. Evidence: commands run and output

1. Pinned manifest, read-only (shim is a bash script — `node` on it is a syntax error, must use `bash`):

```
$ T=$(mktemp -d); (cd /fast/scratch/kumitate-r36/src && find . -printf '%p %s %T@\n' | sort) > $T/before.txt
$ UFO_STATE_DIR=$T/ufo UFO_PENDING_WORK_PATH=$T/ufo/pending-work.json \
    bash /fast/scratch/kumitate-r36/src/scripts/ufo-sighting surface --json > $T/m.json
exit=0
$ (cd /fast/scratch/kumitate-r36/src && find . -printf '%p %s %T@\n' | sort) > $T/after.txt
tree-diff-lines=0            # surface --json creates/modifies nothing under the pinned tree
scriptDigest=sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4
<digestInputs listed above>
stderr: empty
```

2. Independent recomputation of both orders from the pinned bytes:

```
$ cd /fast/scratch/kumitate-r36/src && sha256sum scripts/ufo-sighting scripts/ufo-sighting.mjs scripts/ufo-sighting-lib/*.mjs
a9511ef5…  scripts/ufo-sighting
ce625a0b…  scripts/ufo-sighting.mjs
7ca628c1…  scripts/ufo-sighting-lib/argv.mjs
8f4bc1e1…  scripts/ufo-sighting-lib/base.mjs
43e9cf0d…  scripts/ufo-sighting-lib/observe.mjs
838f28a6…  scripts/ufo-sighting-lib/surface.mjs
$ node -e '<sha256 of Buffer.concat in declared vs sorted order>'
declared-order sha256:b36559d027c8f3b9c7fcaa1b919c03e3888c5df99b8dce5056c20aae39be30c4
sorted-order   sha256:f17d1547901ad6ebb50ab7f705e9d50770b4ab19ddcdc8927a97958d74068da9
```

3. Lane reader under test: `scripts/surface-probe.mjs:291-301` (byte set), `:538-560` (set diff + DIGEST_ORDER
   note), `:584-596` (concat), `:388-403` (manifest fetch via `bash <shim> surface --json`, cwd=src).

No tool installs or upgrades were needed. No writes outside this report; the pinned tree was only read
(0-line before/after listing diff).

## 6. Confidence

- Digest definition, order literal, and the b36559d0/f17d1547 pair: **observed**, byte-exact, reproduced
  from disk and from the pinned CLI's own manifest. High confidence.
- "The lane's sorted-order concat is the sole cause of the pinned SCRIPT_DIGEST_MISMATCH": observed — the
  probe's exact computed string in `surface-pin.txt:7` equals the independently computed sorted-order hash.
- Effect of fixing order while keeping the disk-derived `paths` as the concat source is only equivalent
  while `DIGEST_INPUT_SET` passes; that dependency is [INFERENCE] about intended fix shape, stated as a
  sequencing note, not as observed behavior.
- Whether `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH` are required for `surface --json` is unobserved (I set
  them defensively); the run wrote nothing under the tree with them set.
