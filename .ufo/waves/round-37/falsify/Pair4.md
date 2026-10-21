PAIR4 killed=yes case=LEFT_GAP_15_RIGHT_FALLBACK verdict=holds

Axes: operability; detector boundary coverage; exact-byte restoration.

Mutant 4: in an isolated copy of `scripts/claims-check.mjs:298-299`, change both adjacent-span offset limits from `<= 14` to `<= 15`. Leave `prev ?? next ?? null` unchanged. Production files were not mutated.

Expected detector: the existing selftest plus `LEFT_GAP_15_RIGHT_FALLBACK` must retain their pristine results. The fixture note includes a sentence symbol immediately preceding its anchor, with a conflicting right-hand symbol, and a second anchor with a left symbol exactly 15 spaces away. The latter must exclude that left candidate and fall back right under the pristine 14-character limit.

Fixture: `/fast/scratch/kumitate-r37/Pair4/fixture/self/corpus/knowledge/left-gap-15-right-fallback.md`:
```text
## `scripts/a.mjs`

`ALPHA_MARK` (`scripts/a.mjs:3`), `BETA_MARK`.

`BETA_MARK`               `scripts/a.mjs:3`, `ALPHA_MARK`.
```
The detector asserts that the second line's left gap is exactly 15 spaces. Fixture source line 3 defines `ALPHA_MARK`; line 4 defines `BETA_MARK`. Pristine pairs both anchors with `ALPHA_MARK`. The mutant incorrectly admits the distant `BETA_MARK`, producing one `elsewhere` result.

Commands below ran with outer cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. The detector runs its two child commands concurrently with cwd `/fast/scratch/kumitate-r37/Pair4`, a 90-second timeout per child, and TMPDIR under that scratch directory. Each phase uses the identical detector and fixture bytes. Explicit fixture `--src` prevents consulting the production origin tree.

## Pristine
```text
$ node /fast/scratch/kumitate-r37/Pair4/detect.mjs pristine
PHASE pristine sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9 fixture_left_gap=15
$ node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE CLAIMS_SELFTEST PASS exit=0 signal=null
$ node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
FIDELITY note=corpus/knowledge/left-gap-15-right-fallback.md anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
CASE LEFT_GAP_15_RIGHT_FALLBACK PASS exit=0 signal=null
DETECTOR pristine exit=0
```

## Mutated
```text
$ node /fast/scratch/kumitate-r37/Pair4/detect.mjs mutated
PHASE mutated sha256=4bcb5ff4128bf2c3f989456055e3ab98925c76fe0b3093f4315dc930a15046ad fixture_left_gap=15
$ node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE CLAIMS_SELFTEST PASS exit=0 signal=null
$ node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
FIDELITY note=corpus/knowledge/left-gap-15-right-fallback.md anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=2 ok=1 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
CASE LEFT_GAP_15_RIGHT_FALLBACK FAIL exit=1 signal=null
DETECTOR mutated exit=1
RESTORE exact=true sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
```
The command exited 1 as expected. Its `finally` block restored the exact saved pristine bytes before returning.

## Restored
```text
$ node /fast/scratch/kumitate-r37/Pair4/detect.mjs restored
PHASE restored sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9 fixture_left_gap=15
$ node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE CLAIMS_SELFTEST PASS exit=0 signal=null
$ node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
FIDELITY note=corpus/knowledge/left-gap-15-right-fallback.md anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=2)
CASE LEFT_GAP_15_RIGHT_FALLBACK PASS exit=0 signal=null
DETECTOR restored exit=0
```

## Verdict and restoration evidence
Combined detector: **killed**, case `LEFT_GAP_15_RIGHT_FALLBACK`; pristine/restored exit 0, mutant exit 1. No baseline failure.

Existing `--selftest` alone: **survived**, 47/47 in all three phases. Named coverage gap: `GAP14_15_BOUNDARY` — the shipped suite does not reject this widened pairing window. The scratch fixture detects that gap; this report makes no production test changes or broader sufficiency claim.

After the restored detector, this command ran:
```text
$ sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair4/scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair4/claims-check.pristine.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair4/scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair4/claims-check.pristine.mjs
```
These also equal the initial pre-mutation hashes. Machine-readable raw outputs, statuses, and hashes: `/fast/scratch/kumitate-r37/Pair4/{pristine,mutated,restored}.json`. Detector: `/fast/scratch/kumitate-r37/Pair4/detect.mjs`.

Runtime command/output: `node --version` → `v24.21.0`. Existing runtime; no tools installed or updated.

Report: `.ufo/waves/round-37/falsify/Pair4.md`
