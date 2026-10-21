PAIR7 killed=yes case=FIDELITY_SHORT_SYMBOL_LEFT_IGNORED verdict=holds

Axes: operability (mutation discrimination); isolation and exact-byte restoration.
Mutant 7: remove only `pair.text.trim().length >= 3 &&` from the fidelity symbol predicate at `scripts/claims-check.mjs:305` in `/fast/scratch/kumitate-r37/Pair7/`.
Expected detector: `FIDELITY_SHORT_SYMBOL_LEFT_IGNORED` requires a two-character left-hand token to remain unidentified (`ok=0`, `noid=1`). It asserts exact fidelity totals, not just the CLI exit status.

Fixture source `fixture/src/scripts/a.mjs`:
```js
const AB_SENTINEL = 1;
```
Fixture note `fixture/self/corpus/knowledge/short-left-symbol.md`:
```markdown
## `scripts/a.mjs`

`AB` at `scripts/a.mjs:1`.
```
The source contains `AB`, so deleting the floor can falsely promote the preceding short token to an identified symbol.

Commands: from the lane cwd, invoke `node /fast/scratch/kumitate-r37/Pair7/probe.mjs <phase>`.
Each phase runs these same bounded child commands concurrently, cwd `/fast/scratch/kumitate-r37/Pair7`, with a 120-second deadline per child and TMPDIR scoped under that directory:
```sh
node scripts/claims-check.mjs --selftest
node scripts/claims-check.mjs --self fixture/self --src fixture/src --fidelity
```
Actual command/output excerpts:
```text
$ node /fast/scratch/kumitate-r37/Pair7/probe.mjs pristine
phase=pristine sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
exit=0 timeout=false oracle=PASS
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
exit=0 timeout=false case=FIDELITY_SHORT_SYMBOL_LEFT_IGNORED oracle=PASS
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
DETECTOR phase=pristine PASS

$ node /fast/scratch/kumitate-r37/Pair7/probe.mjs mutated
phase=mutated sha256=d4e9851d4e20d8bbcbea3413a64adb26ef4a87d0ff0a5674bb3f6f052606bf25
exit=0 timeout=false oracle=PASS
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
exit=0 timeout=false case=FIDELITY_SHORT_SYMBOL_LEFT_IGNORED oracle=FAIL
FIDELITY_TOTAL anchors=1 ok=1 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
DETECTOR phase=mutated FAIL
RESTORE sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9 byte_equal=true
Command exited with code 1

$ node /fast/scratch/kumitate-r37/Pair7/probe.mjs restored
phase=restored sha256=511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9
exit=0 timeout=false oracle=PASS
CLAIMS_SELFTEST: 47/47 pass
VERDICT: PASS
exit=0 timeout=false case=FIDELITY_SHORT_SYMBOL_LEFT_IGNORED oracle=PASS
FIDELITY_TOTAL anchors=1 ok=0 elsewhere=0 absent=0 dead=0 noid=1 nonok=0
FIDELITY: CLEAN (notes=1 anchors=1)
DETECTOR phase=restored PASS
```

Verdict: the combined bounded detector KILLED the mutant through the named fixture counter assertion; pristine and restored both passed. This is NOT a claim that the repository selftest killed it.
Named survivor gap: `FIDELITY_SHORT_SYMBOL_FLOOR_SELFTEST` — repository `--selftest` SURVIVED (47/47). Its existing `symbol threshold: a 2-char backticked token does not count as a symbol` case invokes ordinary claims checking, not `--fidelity`; the new left-first case uses long symbols. CLI-exit-only detection also survives: both versions return CLEAN/0, while `noid=1` becomes `ok=1`.

Restoration: the mutant runner restores from the saved original in `finally`, including on detector failure; it checked exact Buffer equality. Afterward this command, run from the lane cwd, returned the same SHA-256 for all three files:
```sh
sha256sum scripts/claims-check.mjs /fast/scratch/kumitate-r37/Pair7/claims-check.pristine.mjs /fast/scratch/kumitate-r37/Pair7/scripts/claims-check.mjs
```
```text
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  scripts/claims-check.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair7/claims-check.pristine.mjs
511d15563f83ad819a5d68af48e8a3928b13af60eee6491110514909c5daf2d9  /fast/scratch/kumitate-r37/Pair7/scripts/claims-check.mjs
```
Raw outputs and phase JSON: `/fast/scratch/kumitate-r37/Pair7/{pristine,mutated,restored}.{selftest,fixture}.{stdout,stderr}` and `{pristine,mutated,restored}.json`.
Runtime: `node --version` returned `v24.21.0`; no installs or updates. Only the report and assigned scratch directory were written; no production script, pin, fleet, or repository state was modified.
Report: `.ufo/waves/round-37/falsify/Pair7.md`
