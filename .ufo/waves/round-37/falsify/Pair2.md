PAIR2 killed=yes case=fidelity-shift verdict=holds

Axis: operability. Probe dimensions: pairing sensitivity, fixture identification, exact restoration.
Scope: one mutation in `/fast/scratch/kumitate-r37/Pair2/scripts/claims-check.mjs:303`.
Mutant 2 removes the left candidate: `const pair = prev ?? next ?? null;` → `const pair = next ?? null;`.
No production script, lane git/jj state, sibling, host configuration, or pinned source was changed.
Runtime: Node v24.21.0 (existing); tools installed/updated: none.

## Detector and fixture
All probe commands below used cwd `/fast/scratch/kumitate-r37/Pair2`.
`probe.mjs` runs these two child commands concurrently, each bounded to 60 seconds:
```sh
node scripts/claims-check.mjs --selftest
node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
```
The harness sets TMPDIR to this scratch directory's `tmp/` and UFO_SRC to its fixture source.
Expected: selftest exits 0 with 47/47; the fixture exits 0 and reports exactly
`FIDELITY_TOTAL anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0`.
Fixture case: `sentence-symbol-precedes-anchor`; its note is:
```md
## `scripts/a.mjs`

The symbol `ALPHA_MARK` at `scripts/a.mjs:3`.
```
The fixture source has `const ALPHA_MARK = 1;` on line 3. The scorecard claims this note.
The built-in killing case is named `FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)` (fixture `fidelity-shift`).

## Pristine command and output
```text
$ node probe.mjs pristine
PHASE pristine sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
COMMAND node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
DETECTOR case=selftest status=0 signal=null pass=true
COMMAND node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
FIDELITY note=corpus/knowledge/fx-left.md anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
DETECTOR case=sentence-symbol-precedes-anchor status=0 signal=null pass=true
DETECTOR PASS
```
Harness exit: 0.

## Mutated command and output
```text
$ node probe.mjs mutated
PHASE mutated sha256=0c14a115c33f6ae244f7218728b96ff65bf223addfe6444ff80ecffeeb7a4594
COMMAND node scripts/claims-check.mjs --selftest
FAIL FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)
     exit=0 FIDELITY: CLEAN (notes=1 anchors=2)
CLAIMS_SELFTEST: 46/47 pass
VERDICT: FAIL
DETECTOR case=selftest status=1 signal=null pass=false
COMMAND node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
FIDELITY note=corpus/knowledge/fx-left.md anchors=1 ok=0 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
DETECTOR case=sentence-symbol-precedes-anchor status=0 signal=null pass=false
DETECTOR FAIL
```
Harness exit: 1. The selftest kills this mutant by its named left-first case.
The standalone fixture's CLI status alone does NOT kill it: it stays CLEAN/0.
Its exact-count assertion does kill it (`ok=1,noid=0` becomes `ok=0,noid=1`).
This is not a surviving mutant; no unnamed survivor gap is claimed.

## Restored command and output
```text
$ node probe.mjs restored
PHASE restored sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
COMMAND node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
DETECTOR case=selftest status=0 signal=null pass=true
COMMAND node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
FIDELITY note=corpus/knowledge/fx-left.md anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
DETECTOR case=sentence-symbol-precedes-anchor status=0 signal=null pass=true
DETECTOR PASS
```
Harness exit: 0. Restored the one changed line before this run.

## Byte-exact restoration evidence
Executed from lane cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:
```text
$ sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair2/scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair2/scripts/claims-check.mjs
$ cmp -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair2/scripts/claims-check.mjs && printf 'RESTORE_BYTE_COMPARE=identical\n'
RESTORE_BYTE_COMPARE=identical
```
Both commands exited 0; the same hash was recorded for lane and scratch before mutation.
Evidence artifacts: `/fast/scratch/kumitate-r37/Pair2/{probe.mjs,pristine.json,mutated.json,restored.json,fixture/}`.
Report: `.ufo/waves/round-37/falsify/Pair2.md`.
