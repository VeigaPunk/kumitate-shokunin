PAIR3 killed=yes case=sentence-symbol-before-anchor-both-eligible verdict=holds

Axes: detector sensitivity; sentence/anchor fidelity; scratch isolation and exact restoration.
Scope: one mutant of `scripts/claims-check.mjs:309`, only in `/fast/scratch/kumitate-r37/Pair3/`.
Runtime: existing Node v24.21.0; no tools installed or updated.

## Mutant and expected detector

Mutant 3: when both adjacent spans satisfy the existing symbol-eligibility rules, count the anchor as `ok` without checking whether the canonical left symbol occurs on its cited line. All other behavior remains unchanged. The single changed condition was:
```js
if ([prev, next].every((s) => s != null && !isAnchorSpan(s.text) && !isPathLikeSpan(s.text) && s.text.trim().length >= 3 && /[A-Za-z_]/u.test(s.text)) || lines.slice(n - 1, m).some((l) => l.includes(symbol))) { bucket.ok += 1; continue; }
```
Expected built-in detector: `FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)`.
Expected fixture detector: `sentence-symbol-before-anchor-both-eligible` must observe checker exit 1, `elsewhere=1`, `nonok=1`, and `FIDELITY: DRIFT (nonok=1)`. Checker exit 1 is the expected baseline, not a detector failure.

Fixture source `origin/scripts/pair3.mjs`:
```js
const LEFT_SENTENCE = 1;
const RIGHT_NEXT = 2;
```
Fixture note `fixture/corpus/knowledge/pair3.md`:
```markdown
## `scripts/pair3.mjs`

`LEFT_SENTENCE` at `scripts/pair3.mjs:2`, `RIGHT_NEXT`.
```
The sentence symbol precedes the anchor. Both neighbors are eligible; only the right-hand symbol occurs on line 2. A covered S1 row in `fixture/SCORECARD.md` resolves this note.

## Commands and actual outputs

All detector commands used cwd `/fast/scratch/kumitate-r37/Pair3`; identical commands were run against pristine, mutated, and restored bytes. The two independent detectors ran concurrently for the mutated and restored phases.

Selftest command (120-second bound):
```sh
timeout 120s env TMPDIR=/fast/scratch/kumitate-r37/Pair3/tmp UFO_SRC=/fast/scratch/kumitate-r36/src node scripts/claims-check.mjs --selftest
```
Pristine, exit 0:
```text
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
```
Mutated, exit 1:
```text
FAIL FIDELITY: a shift onto the next symbol reads non-ok (canonical left-first pairing)
     exit=0 FIDELITY: CLEAN (notes=1 anchors=2)
CLAIMS_SELFTEST: 46/47 pass
VERDICT: FAIL
```
Restored, exit 0:
```text
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
```

Fixture detector command (30-second outer bound; child timeout 20 seconds):
```sh
timeout 30s env TMPDIR=/fast/scratch/kumitate-r37/Pair3/tmp UFO_SRC=/fast/scratch/kumitate-r36/src node fixture-detector.mjs
```
The detector invokes `node scripts/claims-check.mjs --self fixture --src origin --fidelity` and asserts the expected exit and fidelity totals.
Pristine detector exit 0:
```text
fixture checker exit=1 signal=none
FIDELITY note=corpus/knowledge/pair3.md anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
PAIR3_FIXTURE sentence-symbol-before-anchor-both-eligible: PASS
```
Mutated detector exit 1:
```text
fixture checker exit=0 signal=none
FIDELITY note=corpus/knowledge/pair3.md anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
PAIR3_FIXTURE sentence-symbol-before-anchor-both-eligible: FAIL
```
Restored detector exit 0:
```text
fixture checker exit=1 signal=none
FIDELITY note=corpus/knowledge/pair3.md anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
PAIR3_FIXTURE sentence-symbol-before-anchor-both-eligible: PASS
```

## Hashes and restoration evidence

SHA-256 before mutation (lane source and scratch copy): `511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9`.
SHA-256 mutated scratch: `3e341e5f996de2048f4576516f941ecc91a885f035039f9a5c60a300139c3f8c`.
After reverting the single changed condition, command:
```sh
sha256sum scripts/claims-check.mjs claims-check.pristine.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs && cmp scripts/claims-check.mjs claims-check.pristine.mjs
```
Actual output, exit 0 (`cmp` emitted nothing):
```text
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  claims-check.pristine.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
```
Verdict: killed by both named detectors; neither baseline was inconclusive. Exact scratch bytes restored and lane script unchanged. No survivor or unnamed gap for this assigned mutant; no broader coverage claim.
