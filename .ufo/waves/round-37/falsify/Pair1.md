PAIR1 killed=yes case=fidelity-shift verdict=holds

Axes: operability (runnable detector), coverage (pair-precedence sensitivity), calibration (named killing case and exact restoration).
Scope: round-37 Pair1 only; one mutation in an isolated scratch checker. No production edits.
Tool: Node v24.21.0 (existing installation); no tool installs or updates.

## Mutant and expected detector
Scratch root/cwd for every probe: `/fast/scratch/kumitate-r37/Pair1`.
Copied `scripts/claims-check.mjs` from the repair tree; mutated only line 303:
`const pair = prev ?? next ?? null;` → `const pair = next ?? prev ?? null;`.
Expected: selftest fails the named left-first case; the valid sentence-first fixture changes from CLEAN to DRIFT.
Killing selftest label: `FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)` (fixture directory `fidelity-shift`).

## Commands and actual outputs
The unchanged bounded runner (`node detect.mjs <stage> <selftest|fixture>`) captures stdout, stderr, exit status and SHA-256; child timeout 90s.
Each phase runs the same two child commands, concurrently:
```sh
TMPDIR=/fast/scratch/kumitate-r37/Pair1/tmp node scripts/claims-check.mjs --selftest
TMPDIR=/fast/scratch/kumitate-r37/Pair1/tmp node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
```
Both commands use explicit scratch fixtures or the hermetic selftest; no live origin tree is passed.

Pristine — `node detect.mjs pristine selftest`:
```text
EXIT=0 SIGNAL=none
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
```
Pristine — `node detect.mjs pristine fixture`:
```text
EXIT=0 SIGNAL=none
FIDELITY note=corpus/knowledge/pair1-left-sentence.md anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
```

Mutated — `node detect.mjs mutated selftest`:
```text
EXIT=1 SIGNAL=none
FAIL FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)
     exit=0 FIDELITY: CLEAN (notes=1 anchors=2)
CLAIMS_SELFTEST: 46/47 pass
VERDICT: FAIL
```
Mutated — `node detect.mjs mutated fixture`:
```text
EXIT=1 SIGNAL=none
FIDELITY note=corpus/knowledge/pair1-left-sentence.md anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
```

Restored — `node detect.mjs restored selftest`:
```text
EXIT=0 SIGNAL=none
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
```
Restored — `node detect.mjs restored fixture`:
```text
EXIT=0 SIGNAL=none
FIDELITY note=corpus/knowledge/pair1-left-sentence.md anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
```
All six detector runs had empty stderr and no signal.

## Independent sentence-first fixture
`fixture/self/corpus/knowledge/pair1-left-sentence.md`:
```markdown
## `scripts/a.mjs`

`LEFT_MARK` (`scripts/a.mjs:2`), `RIGHT_MARK` at `scripts/a.mjs:3`.
```
`fixture/src/scripts/a.mjs` has `const LEFT_MARK = 1;` on line 2 and `const RIGHT_MARK = 2;` on line 3. The first anchor has both neighboring symbols in pairing range; right-first selects the wrong one.
`fixture/self/SCORECARD.md` registers this note as covered row S1 for `scripts/a.mjs`.

## Hashes and exact restoration
Pristine SHA-256: `511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9`.
Mutated SHA-256: `2ea56d6461dc5ebfc75347e74d0ec6c8f44e32677c9ae1cd91b1d0142794b153`.
Restored SHA-256: `511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9`.
Restoration command (same scratch cwd):
```sh
sha256sum scripts/claims-check.mjs pristine-claims-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs && cmp -- scripts/claims-check.mjs pristine-claims-check.mjs && printf 'RESTORE_CMP=identical exit=0\n'
```
Actual output:
```text
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  pristine-claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
RESTORE_CMP=identical exit=0
```
Raw detector records: scratch `{pristine,mutated,restored}-{selftest,fixture}.out`; fixtures and runner retained beside them.
Verdict: killed, not inconclusive. Healthy pristine/restored runs bracket the same one-line mutant; the named fidelity-shift case detects its false CLEAN. No surviving mutant or unnamed gap in this assigned probe.
Report: `.ufo/waves/round-37/falsify/Pair1.md`.
