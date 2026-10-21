PAIR6 killed=yes case=anchor-span-is-not-a-symbol verdict=holds

Axes: operability (runnable detector), coverage (anchor-token exclusion), calibration (named selftest gap).
Scope: one mutation in `/fast/scratch/kumitate-r37/Pair6/scripts/claims-check.mjs`; production source unchanged.
Runtime: existing Node v24.21.0; no installs or package transactions. No live origin tree used.

## Mutant and expected detector

At `scripts/claims-check.mjs:304`, remove only `!isAnchorSpan(pair.text) &&`.
Before: `const symbol = pair !== null && !isAnchorSpan(pair.text) && !isPathLikeSpan(pair.text)`
Mutant: `const symbol = pair !== null && !isPathLikeSpan(pair.text)`
The canonical `prev ?? next ?? null` pairing is unchanged.

Fixture `fixture/corpus/knowledge/fx-a.md` in the scratch root:
```markdown
## `scripts/a.mjs`

`ALPHA_MARK` at `a.mjs:3`, `a.mjs:4`.
```
Fixture source has `const ALPHA_MARK = 1;` on line 3 and `export default ALPHA_MARK;` on line 4.
The sentence symbol precedes its anchor. For the second anchor, the closest left span is another anchor.
The basename anchor resolves to the section's own file but does not trigger the path-like-span filter.
Expected case `anchor-span-is-not-a-symbol`: exit 0, anchors=2, ok=1, noid=1, nonok=0, CLEAN.
Treating the previous anchor as a symbol instead produces absent=1, nonok=1, DRIFT: detector failure kills the mutant.

## Commands and actual output

All top-level commands below ran with cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
`probe.mjs` runs these independent children concurrently, with a 90-second bound each and scratch-only TMPDIR:
- `node scripts/claims-check.mjs --selftest`
- `node scripts/claims-check.mjs --self fixture --src fixture-src --fidelity`
Child cwd is `/fast/scratch/kumitate-r37/Pair6`; fixture paths are passed as absolute paths.
The identical probe and fixture bytes were used in all three phases.

```text
$ node /fast/scratch/kumitate-r37/Pair6/probe.mjs pristine
PHASE pristine sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
COMMAND node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE selftest detector=PASS exit=0 signal=null
COMMAND node scripts/claims-check.mjs --self fixture --src fixture-src --fidelity
FIDELITY note=corpus/knowledge/fx-a.md anchors=2 ok=1 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
CASE anchor-span-is-not-a-symbol detector=PASS exit=0 signal=null
DETECTOR PASS
[exit 0]

$ node /fast/scratch/kumitate-r37/Pair6/probe.mjs mutated
PHASE mutated sha256=766a6b730cc87dc5828de93381b48ebe65d04202520f0a6a7a62ae90b99c22b3
COMMAND node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE selftest detector=PASS exit=0 signal=null
COMMAND node scripts/claims-check.mjs --self fixture --src fixture-src --fidelity
FIDELITY note=corpus/knowledge/fx-a.md anchors=2 ok=1 elsewhere=0 absent=1 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=0 absent=1 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
CASE anchor-span-is-not-a-symbol detector=FAIL exit=1 signal=null
DETECTOR FAIL
[exit 1]

$ node /fast/scratch/kumitate-r37/Pair6/probe.mjs restored
PHASE restored sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
COMMAND node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE selftest detector=PASS exit=0 signal=null
COMMAND node scripts/claims-check.mjs --self fixture --src fixture-src --fidelity
FIDELITY note=corpus/knowledge/fx-a.md anchors=2 ok=1 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
CASE anchor-span-is-not-a-symbol detector=PASS exit=0 signal=null
DETECTOR PASS
[exit 0]
```

## Verdict, named gap, restoration

Combined detector: **killed**, case `anchor-span-is-not-a-symbol`; pristine and restored both pass.
Embedded selftest alone: **survived**, 47/47. Named gap `SELFTEST_ANCHOR_SPAN_EXCLUSION`: the suite lacks an assertion that a neighboring basename anchor is not classified as a symbol. The external case above exercises that gap; it is not installed in production.

```text
$ sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair6/scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair6/scripts/claims-check.mjs
$ cmp -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair6/scripts/claims-check.mjs && printf 'RESTORE cmp=identical\n'
RESTORE cmp=identical
[exit 0]
```
Exact source bytes restored after the intentional detector failure. Raw phase records remain at `/fast/scratch/kumitate-r37/Pair6/results/{pristine,mutated,restored}.json`.
Report: `.ufo/waves/round-37/falsify/Pair6.md`
