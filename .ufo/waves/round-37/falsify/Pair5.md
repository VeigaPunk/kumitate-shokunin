PAIR5 killed=yes case=left-first-gap14-boundary verdict=holds

Axes: canonical pairing correctness; detector sensitivity; isolated writes and exact restoration.

Mutant 5: in the isolated `scripts/claims-check.mjs`, change both proximity limits on lines 298–299 from `<= 14` to `<= 13`; leave `prev ?? next ?? null` unchanged.
Scratch/cwd for every detector command: `/fast/scratch/kumitate-r37/Pair5`.
Runtime: Node v24.21.0. No tools installed or updated.

Expected detector: `node detect-pair5.mjs` runs the same selftest and boundary fixture concurrently, with a 120-second bound per child. The fixture must exit 1 with `elsewhere=1 nonok=1`, not reinterpret the right-hand symbol as the sentence's symbol.
Child commands (identical in all three phases):
```sh
TMPDIR=/fast/scratch/kumitate-r37/Pair5/tmp UFO_SRC=/fast/scratch/kumitate-r37/Pair5/never-live-src node scripts/claims-check.mjs --selftest
TMPDIR=/fast/scratch/kumitate-r37/Pair5/tmp UFO_SRC=/fast/scratch/kumitate-r37/Pair5/never-live-src node scripts/claims-check.mjs --self fixture --src fixture-src --fidelity
```

Fixture `fixture/corpus/knowledge/pair5.md`:
```md
## `scripts/a.mjs`

`BETA_MARK` is stated at `scripts/a.mjs:3`, `ALPHA_MARK` follows.
```
There are exactly 14 characters (` is stated at `) between the left symbol's closing backtick and the anchor's opening backtick. Fixture source `fixture-src/scripts/a.mjs`:
```js
#!/usr/bin/env node
const BETA_MARK = 2;
const ALPHA_MARK = 1;
export default ALPHA_MARK;
```
The fixture scorecard covers this member and note as row S1. `BETA_MARK` is deliberately anchored to ALPHA's line: left-first pairing must retain the drift, even with a nearby correct right-hand decoy.

Pristine command: `node detect-pair5.mjs` (exit 0). Output, with the two child COMMAND lines shown above omitted:
```text
CASE claims-selftest: PASS exit=0
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE left-first-gap14-boundary: PASS exit=1
FIDELITY note=corpus/knowledge/pair5.md anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
PAIR5_DETECTOR: PASS
```

Mutated command: `node detect-pair5.mjs` (exit 1). Output, omitting the same child COMMAND lines:
```text
CASE claims-selftest: PASS exit=0
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE left-first-gap14-boundary: FAIL exit=0
FIDELITY note=corpus/knowledge/pair5.md anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
PAIR5_DETECTOR: FAIL
```

Restored command: `node detect-pair5.mjs` (exit 0). Output, omitting the same child COMMAND lines:
```text
CASE claims-selftest: PASS exit=0
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
CASE left-first-gap14-boundary: PASS exit=1
FIDELITY note=corpus/knowledge/pair5.md anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=1 absent=0 dead=0 noid=0 nonok=1
FIDELITY: DRIFT (nonok=1)
PAIR5_DETECTOR: PASS
```

Verdict: killed by `left-first-gap14-boundary`; neither baseline nor restoration was inconclusive. The built-in 47/47 selftest alone SURVIVED. Named coverage gap: `left-first-gap14-boundary` — no built-in case detects a 14-to-13 proximity contraction allowing right fallback to erase left-symbol drift. The external fixture supplies that detector; the production selftest was not changed.

SHA-256 evidence:
- Before (lane original and scratch/pristine copy): `511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9`.
- Mutated scratch: `aeabdaea83ab73db0234d4fa692aed419265679b0aa2f419ecec96d77497fad4`.
- Restored scratch, saved pristine copy, and lane original: `511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9`.

Restoration command:
```sh
cmp -s scripts/claims-check.mjs pristine-claims-check.mjs && printf 'RESTORED_BYTES: exact\n' && sha256sum scripts/claims-check.mjs pristine-claims-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
```
Actual output (exit 0):
```text
RESTORED_BYTES: exact
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  pristine-claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs
```
Only this report was written in the lane. All probe files and selftest temporary directories were confined to the Pair5 scratch tree. The read-only pinned source and fleet repository were not used.
