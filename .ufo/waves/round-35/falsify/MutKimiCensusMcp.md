ATTACK C3 verdict=holds defects=0

## Scope and controls
- Axes: coverage:kimi-layer (assigned); operability + coverage (lane context). This is mutation evidence, not round admission or a score judgment.
- Target: `scripts/kimi-census.mjs:108,150,355`; six independent, single-point mutants, never combined.
- Scratch `S=/fast/scratch/kumitate-r35/w/MutKimiCensusMcp`; populated by `cp -a /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/kumitate-r35/w/MutKimiCensusMcp`.
- Runtime: existing Node `v24.21.0`; no installs/updates. Only the scratch target was mutated; the only lane write is this report.
- Detector commands, cwd `$S`: `node scripts/kimi-census.mjs --selftest` and `node scripts/kimi-census.mjs`.
- `node probe.mjs <phase>` runs those two commands concurrently, with 120s/30s bounds, captures exact stdout/stderr/exits, and hashes the target before/after. `TMPDIR=$S/tmp` confines selftest fixture writes to scratch; HOME stays unchanged for the live census.
- These assigned census commands have no `--src` option and consume no upstream source. No other lane gates were run.
- Raw evidence: `$S/evidence/<phase>.json`; reproducible runner: `$S/probe.mjs`. Each mutant was restored before the next mutant was applied.

## Pristine and restored detector outputs
Pristine phase `pristine`, and EVERY restored phase `m1-restored` through `m6-restored`, produced:
```text
node scripts/kimi-census.mjs --selftest: exit=0
KIMI_CENSUS_SELFTEST: 48/48 pass
VERDICT: PASS
node scripts/kimi-census.mjs: exit=0
FAMILY K1  members=4  checked=4  frozen=4
TOTALS: members=51 checked=51 errors=0 info=4 chain=7
KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)
```
All these runs had empty stderr, no signal, and no timeout. Thus no baseline failure made a kill inconclusive.

## Mutants, expected detectors, actual outputs
The commands above were run for every row. Five mutants were killed by selftest; one survived. No inconclusive runs.

| ID / evidence phase | Exact original location and mutation | Expected detector | Actual selftest | Actual live census | Verdict |
|---|---|---|---|---|---|
| M1 `m1-delete-member` | `scripts/kimi-census.mjs:108`: delete the entire mcp.json member | Frozen counts/missing-member selftest; root UNLISTED live | exit 1; uncaught ENOENT during fixture setup, no summary | exit 1; `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)`; members=50 checked=50 | KILLED by both |
| M2 `m2-kind-dir` | `scripts/kimi-census.mjs:108`: `kind: 'file'` → `'dir'` | Leaf/kind selftest; SHAPE_DRIFT live | exit 1; uncaught ERR_FS_EISDIR during fixture setup, no summary | exit 1; `KIMI_CENSUS: DRIFT (SHAPE_DRIFT mcp.json)`; members=50 checked=50 | KILLED by both |
| M3 `m3-drop-secret` | `scripts/kimi-census.mjs:108`: remove `secret: true` | Shape-row, FIFO, and directory-error assertions | exit 1; `KIMI_CENSUS_SELFTEST: 45/48 pass`; `VERDICT: FAIL` | exit 0; CLEAN, members=51 checked=51 chain=7 info=4 | KILLED by selftest; live survivor |
| M4 `m4-floor-zero` | `scripts/kimi-census.mjs:108`: `modeFloor: 0o400` → `0` | Exact 0400 shape-floor assertion | exit 1; `KIMI_CENSUS_SELFTEST: 47/48 pass`; `VERDICT: FAIL` | exit 0; CLEAN, members=51 checked=51 chain=7 info=4 | KILLED by selftest; live survivor |
| M5 `m5-frozen-three` | `scripts/kimi-census.mjs:150`: FROZEN K1 4 → 3 | JSON frozen-K1 assertion | exit 1; `KIMI_CENSUS_SELFTEST: 47/48 pass`; `VERDICT: FAIL` | exit 0; `FAMILY K1  members=4  checked=4  frozen=3`; CLEAN, members=51 checked=51 chain=7 info=4 | KILLED by selftest; live survivor |
| M6 `m6-unlisted-exemption` | `scripts/kimi-census.mjs:355`: add `n !== 'mcp.json' &&` to the root-strays filter | Root enumeration suite/live; no observable change expected while mcp.json is declared | exit 0; `KIMI_CENSUS_SELFTEST: 48/48 pass`; `VERDICT: PASS` | exit 0; CLEAN, members=51 checked=51 chain=7 info=4 | SURVIVED both |

Relevant actual diagnostic excerpts (complete streams are in the phase JSON):
```text
M1: Error: ENOENT: no such file or directory, lstat '.../root-mcp-json-absent/mcp.json'
M2: SystemError [ERR_FS_EISDIR]: Path is a directory: rm returned EISDIR (is a directory) .../root-mcp-json-absent/mcp.json
M3: FAIL K1 mcp.json present => CLEAN, shape-only member (mode floor 0400)
    FAIL K1 mcp.json FIFO => CLEAN without opening it (a read would block)
    FAIL SHAPE_DRIFT: root mcp.json replaced by a directory (non-directory leaf pin)
M4: FAIL K1 mcp.json present => CLEAN, shape-only member (mode floor 0400)
    ..."modeFloor":"0000","mode":"0000","state":"ok"...
M5: FAIL --json families read 4/26/9/9/3 and members=51
    members=51 K1=4 K2=26 K3=9 K4=9 K5=3 rows=29 strays=0
```
M1/M2 are process-exit kills, not completed assertion reports; their live DRIFT independently detects the mutation.

## Survivor and minimal disposition
- Coverage finding: the live census alone leaves M3/M4/M5/M6 CLEAN; the hermetic selftest is necessary to detect the first three. A CLEAN live observation does not establish that the implementation still enforces every declared pin.
- M6 at `scripts/kimi-census.mjs:355` is redundant with `declaredRootNames()` at `:219-225`: the still-present `:108` member already puts mcp.json in `declared`. Adding its explicit stray exemption cannot change this six-mutant probe's behavior. It is a survivor, not a demonstrated C3 contract defect.
- Minimal disposition: retain the original member, secret marker, 0400 floor, K1=4, and generic strays filter. If M6 were introduced, remove its redundant exemption; do not change the contract to accommodate a survivor. All six scratch mutations were reverted; no production fix is justified by these probes.

## Hash and restoration evidence
SHA-256 of the target before the first mutation, after EVERY restoration, and before/after every pristine/restored detector pair:
`H0=7818970b80d4951b8edf15dcc8c5a16efe57f457f956a5ce019f049068538156`.
The original lane file, copied target, and saved `$S/evidence/pristine-kimi-census.mjs` all initially had H0.

| Mutant | Mutated hash before AND after detector pair | Restored hash before AND after detector pair |
|---|---|---|
| M1 | `0ed6de42c1100669b8eb2d30811107528d9e45d1a9ccea719757eea2c1e3cda7` | H0 |
| M2 | `829857105786f68817fb10abb3e4ed2d486b3696355b37276bbd39f69c2f0d18` | H0 |
| M3 | `8343d4ef305a9097d270a163a72ff93ac3133c9a41cb0fc77e318436006a3978` | H0 |
| M4 | `2a91dc35622aafd00e38125f63fdd54988afeff1a8d9edb8f838440edf370e81` | H0 |
| M5 | `1b7f1766d8a7d3998660fe12fd08806d7dd363236af7f0376665e123e354e6d3` | H0 |
| M6 | `55c0396b4738d94e06833c03ad11e9dd306187ba7479846cda9d2b1c5c125cfd` | H0 |

Final command: `node probe.mjs m6-restored && cmp -s evidence/pristine-kimi-census.mjs scripts/kimi-census.mjs && sha256sum evidence/pristine-kimi-census.mjs scripts/kimi-census.mjs` exited 0; both printed hashes were H0. Exact original target bytes are restored, including after detector failures. No protected content was read and no host shape/config was changed.
