# CtlMapV1Regression — kumitate round 58

Axes: operability, coverage.

Scoped finding: **R57-V3 red-before corroborated**. The historical v1 gate read the directory-backed covered entry `CLEAN` with exit 0; the R1 v2 gate read the same planted fixture `DRIFT` with `covered-not-file` and exit 1.

Measured revision: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1). The sandbox clone's detached HEAD was R1. Historical gate bytes came from `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37:scripts/readme-map.mjs`.

## Control and fixture

- The unmodified R1 v2 baseline was `README_MAP: CLEAN files=138 rows=138 covered=138`, exit 0 (`05-baseline-v2.*`).
- In the sandbox clone only, `corpus/lessons/ctl-map-v1-regression.md` was created as a **directory**, with exactly one matching `corpus/README.md` row and one `covered` registry entry.
- The v1 run used registry `version: 1`; the v2 run used `version: 2`, as their respective contracts require. Both fixture-state probes otherwise observed the same state: `covered=139`, `coveredOccurrences=1`, `readmeRows=1`, `memberIsDirectory=true` (`11-fixture-v1-state.*` and `16-fixture-v2-state.*`).
- The extracted historical bytes were installed for the v1 run; the saved R1 bytes were restored for v2. Byte comparisons exited 0 (`10-v1-bytes-installed.*`, `15-v2-bytes-restored.*`). SHA-256: v1 `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`; v2 `b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e`.

## Observed gate results

Historical-byte extraction:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapV1Regression/lane show c49f2a8dc1e6e5e4341e15ac279185aab7e0be37:scripts/readme-map.mjs
```

Exit 0; complete bytes are in `06-v1-bytes.stdout`.

Both gate runs executed:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapV1Regression/lane/scripts/readme-map.mjs
```

With the historical v1 gate and v1 registry, observed stdout was:

```text
README_MAP: CLEAN files=139 rows=139 covered=139
```

Observed exit code: **0**. Stderr was empty.

With the R1 v2 gate and v2 registry, observed stdout was:

```text
README_MAP: DRIFT files=139 rows=139 covered=139 bad=1 first=covered-not-file:lessons/ctl-map-v1-regression.md
```

Observed exit code: **1**. Stderr was empty.

The source lane HEAD before and after the run remained `6affb9ebde37b7d663658f1959d64f0f0b68f480`. All fixture mutations were confined to the sandbox clone under this seat's build directory. No commit, push, production edit, or tool installation occurred. This is a scoped gate observation, not an `ATTEST58_HELD` verdict.

## Full evidence

Under `.ufo/waves/round-58/build/CtlMapV1Regression/`:

- `reproduce.sh` — complete reproduction procedure.
- `driver.command`, `driver.stdout`, `driver.stderr`, `driver.exit` — driver invocation and observed expected-result assertion; driver exit 0.
- Every numbered step has its own `.command`, `.stdout`, `.stderr`, and `.exit` files.
- Key logs: `01-clone.*`, `02-checkout-r1.*`, `03-clone-head.*`, `05-baseline-v2.*`, `06-v1-bytes.*`, `07-plant-directory-entry.*`, `11-fixture-v1-state.*`, `12-v1-gate.*`, `16-fixture-v2-state.*`, `17-v2-gate.*`, `18-gate-hashes.*`, `00-source-head-before.*`, and `19-source-head-after.*`.
