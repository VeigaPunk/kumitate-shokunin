# MutMapUncovered — round-57 mutation probe (C1 `readme-map`)

Seat: `MutMapUncovered` (leaf, one-shot). Lane: `kumitate-shokunin`.
Judged axes: operability, coverage. Assigned probe: delete **only** the
`round-57.md` README row in a scratch lane copy; run `readme-map`; verify
`DRIFT` names `uncovered:lessons/round-57.md`.

## Verdict

**KILLED.** The mutated byte set produced
`README_MAP: DRIFT files=135 rows=134 covered=135 bad=1 first=uncovered:lessons/round-57.md`
with exit 1; the pristine byte set produced
`README_MAP: CLEAN files=135 rows=135 covered=135` exit 0; the restored byte set
reproduced the pristine result exactly. The detector names the exact missing
path, not merely a count or a generic drift flag.

## Revision and instrument

- `git -C kumitate-shokunin rev-parse HEAD` → `8c6f5b017d149b18134917378cdbed3b492d8e89`
  (idempotence-at-bookkeeping-tip commit). HEAD was not moved; no mutating
  git/jj command ran.
- Scratch extraction: `git archive 8c6f5b01… | tar -x -C build/MutMapUncovered/scratch`
  (committed bytes only; lane working tree not used as the mutation substrate).
- Detector: `scripts/readme-map.mjs`
  sha256 `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`
  — equal to pin `.ufo/pins/counter-pins.json` round 57 `readme-map`
  `058e5033…2c7727` (checked, no regression).
- Registry `.ufo/pins/readme-map.json` sha256
  `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c`
  (`version: 1`, 135 covered entries, `lessons/round-57.md` among them).

## Mutant

Smallest behavior-bearing deletion: the single README table row
``| `lessons/round-57.md` | Round-57: … |`` (line 170 of `corpus/README.md`).
The filter asserted exactly one line matched before rewriting; 481 bytes
(one row plus its newline) removed, `266` lines left of `267`.
`diff -u` shows **1 removed line / 0 added lines**, so no other row, no
lesson file, and no registry entry was touched.

| artifact | sha256 |
|---|---|
| pristine / restored `corpus/README.md` | `7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d` |
| mutated `corpus/README.md` | `5f935ccaa1ee6d0c88880d96b75beef4057b861feba9a5bdd3647968eedf952b` |
| `corpus/lessons/round-57.md` (untouched, still present) | `b3cbf9741d21421e74d321afba9749cd34e917c6909dba37da6eabe4ae6f5566` |
| `scripts/readme-map.mjs` (untouched) | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` |

The lesson file remains at rev and in the extracted tree, so the only defect is
the missing row — the mutant isolates row coverage, not file existence.

## Observed runs (same detector, three byte sets, verbatim stdout)

1. **Pristine** — `node scripts/readme-map.mjs`
   `README_MAP: CLEAN files=135 rows=135 covered=135` — **exit 0**.
2. **Mutated** — `node scripts/readme-map.mjs`
   `README_MAP: DRIFT files=135 rows=134 covered=135 bad=1 first=uncovered:lessons/round-57.md`
   — **exit 1**, stderr empty. `rows` fell by exactly 1; `bad=1`; the first
   (and only) bad item is the named path.
3. **Restored** — `node scripts/readme-map.mjs`
   `README_MAP: CLEAN files=135 rows=135 covered=135` — **exit 0**.

Detector calibration run in the same extraction:
`node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (14/14)`,
14 `case` lines, 0 `FAIL`, exit 0 — above the contract's ≥ 12 cases.

## Restoration evidence

`cp original-README.md scratch/corpus/README.md` restored the pre-mutation
bytes; sha256 returned to `7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d`
(identical to the `git archive`-extracted pristine value), and the restored run
returned `CLEAN` exit 0. The lane's own production files were hashed after the
probe and are identical to the extraction-time values:
`corpus/README.md 75756148…7205d`, `scripts/readme-map.mjs 058e5033…c7727`,
`corpus/lessons/round-57.md b3cbf974…f5566`,
`.ufo/pins/readme-map.json 9ef0cf6e…85c729c`.

## Coverage findings

- **The claim's naming obligation is real, not count-only.** The mutant leaves
  `covered=135` while `rows=134`; a count-comparison gate could only report the
  numeric gap, whereas `readme-map` emits the exact `uncovered:<path>`. That is
  precisely the R56-V3 defect class (file landed without its row), so the
  round-57 C1 capability is exercised by a real corpus row, not a fixture.
- **Frozen-counter arm granularity (coverage gap, not a contract breach).**
  `attest57-probe.mjs` B3 arm (a) deletes the *first* table row and matches the
  generic substring `'uncovered'`; arm (d) deletes the row of the *first* pinned
  covered entry, also matching generic `'uncovered'` (probe lines 177–244). Neither
  arm pins a specific path or this round's real `lessons/round-57.md` row, so the
  frozen counter alone would pass even if the gate named the wrong path. The
  gate's own naming is what makes this mutant killable; this probe supplies the
  real-data, path-specific evidence the arm does not.
- **Emit shape.** Because `bad.length === 1`, the named item appears in
  `first=`; `emit` prints every additional bad item as
  `README_MAP: note <item>` (line 207). Hence the uncovered path is emitted under
  multi-defect drift too — *[INFERENCE]* from
  `scripts/readme-map.mjs:203-209`, not observed in this single-defect probe.

## Limits

- One mutation only (assigned): no second defect was introduced, so the note-vs-first
  multi-bad path is code-read, not executed here.
- The probe ran against committed bytes at `8c6f5b0`, the current full revision;
  HEAD was not moved and no receipt/score is claimed beyond this gate behavior.
- No web source was assessed in this slice (claim C1 is a local gate); no source
  URL/quote is therefore carried here. SOURCES.md and knowledge entries untouched.
- No tool installs, no pacman, no service changes.

## Evidence index (all under `build/MutMapUncovered/`)

`commands.log` (exact argv + exits), `pristine-hashes.txt`,
`original-README.md`, `mutate.log`, `mutated-README-hash.txt`, `mutant.diff`,
`baseline.out|.err`, `mutant.out|.err`, `restored.out|.err`,
`restored-README-hash.txt`, `selftest.out|.err`, `lane-untouched-hashes.txt`,
`scratch/` (extracted and restored tree).
