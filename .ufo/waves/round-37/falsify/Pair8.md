PAIR8 killed=yes case=range-end-plus-one-left-symbol verdict=holds

Axes: operability (bounded runnable detector), coverage (inclusive upper endpoint), calibration (selftest survivor named explicitly).
Scope: one mutant, isolated at /fast/scratch/kumitate-r37/Pair8; no production checker or origin-pin bytes modified.
Runtime: existing Node v24.21.0; no tools installed or updated.

Mutant 8: scripts/claims-check.mjs:309, `lines.slice(n - 1, m)` → `lines.slice(n - 1, m + 1)`.
This widens the source window one line past the inclusive anchor endpoint; `prev ?? next` remains unchanged.
Expected detector: selftest must pass; fixture must report exactly two anchors, one ok, one elsewhere, nonok=1, DRIFT, exit 1.
A baseline fixture DRIFT is the expected successful negative assertion, not a baseline detector failure.

Fixture origin scripts/boundary.mjs (lines 1–4):
```js
// Pair8 inclusive endpoint fixture
const START_MARK = 1;
const END_MARK = 2;
const AFTER_MARK = 3;
```
Fixture note corpus/knowledge/range-end.md:
```markdown
# Range endpoint boundary probe

## `scripts/boundary.mjs`

`END_MARK` at `scripts/boundary.mjs:2-3`.
`AFTER_MARK` (`scripts/boundary.mjs:2-3`), `END_MARK` follows in prose.
```
The second sentence's left symbol exists only on line 4, outside 2–3; the right symbol exists inside the range.
The first sentence is the inclusive-endpoint positive control.

Commands below used cwd=/home/vgpnk/Projects/shokunin/kumitate-shokunin.
The unchanged detector runs these commands concurrently with cwd=/fast/scratch/kumitate-r37/Pair8:
```sh
node scripts/claims-check.mjs --selftest
node scripts/claims-check.mjs --self /fast/scratch/kumitate-r37/Pair8/fixture --src /fast/scratch/kumitate-r37/Pair8/origin --fidelity
```
Each child has a 120-second timeout; HOME/TMPDIR and all fixtures stay in Pair8 scratch; UFO_SRC=/nonexistent.

Pristine command: `node /fast/scratch/kumitate-r37/Pair8/run-detector.mjs pristine`
Actual output (command-label lines omitted):
```text
STAGE=pristine sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9 bytes_unchanged=true
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
EXIT=0 SIGNAL=null ERROR=null EXPECTED=match
FIDELITY note=corpus/knowledge/range-end.md anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
EXIT=1 SIGNAL=null ERROR=null EXPECTED=match
DETECTOR=PASS
```
Driver exit 0.

Mutated command: `node /fast/scratch/kumitate-r37/Pair8/run-detector.mjs mutated`
Actual output (command-label lines omitted):
```text
STAGE=mutated sha256=c2ae27cc85c7455a390024b3f040e547a4fe1fd15ab7296b7b7c691732357ad5 bytes_unchanged=true
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
EXIT=0 SIGNAL=null ERROR=null EXPECTED=match
FIDELITY note=corpus/knowledge/range-end.md anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
EXIT=0 SIGNAL=null ERROR=null EXPECTED=mismatch
DETECTOR=FAIL
```
Driver exit 1: killed by `range-end-plus-one-left-symbol`.
Selftest alone SURVIVED. Named coverage gap: `selftest-fidelity-inclusive-upper-bound` — the 47-case suite does not reject accepting a left symbol exactly one line beyond a range endpoint. The external fixture kills that survivor; this does not claim the built-in selftest is sufficient.

Restored command: `node /fast/scratch/kumitate-r37/Pair8/run-detector.mjs restored`
Actual output (command-label lines omitted):
```text
STAGE=restored sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9 bytes_unchanged=true
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
EXIT=0 SIGNAL=null ERROR=null EXPECTED=match
FIDELITY note=corpus/knowledge/range-end.md anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
EXIT=1 SIGNAL=null ERROR=null EXPECTED=match
DETECTOR=PASS
```
Driver exit 0. All three stages had empty stderr and no signal/error.

Restoration command:
```sh
sha256sum scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair8/pristine.mjs /fast/scratch/kumitate-r37/Pair8/scripts/claims-check.mjs && cmp /fast/scratch/kumitate-r37/Pair8/pristine.mjs /fast/scratch/kumitate-r37/Pair8/scripts/claims-check.mjs
```
Actual output:
```text
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair8/pristine.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair8/scripts/claims-check.mjs
```
Exit 0; cmp emitted no differences. The production hash also matches its pre-probe hash.
Complete raw command outputs and statuses: /fast/scratch/kumitate-r37/Pair8/{pristine,mutated,restored}.json; reusable detector and fixtures retained beside them.
Report: .ufo/waves/round-37/falsify/Pair8.md
