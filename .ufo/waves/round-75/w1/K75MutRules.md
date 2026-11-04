# K75MutRules — C1 mutation battery

Axes: operability + coverage; attacked coverage:omp. Read frozen plan §C1 and base tool at `c38382d547a1ec21bb7f51b4c08ef08053e7abae`. No lane source edits, commits, installs or origin writes.

Receipt: `.ufo/waves/round-75/build/K75MutRules/mutation-receipt.txt` (commands, exact verdicts/exits, fixture bytes, sorted failing case names). Full outputs and before/mutated/restored SHA256: `independent-matrix.json`, `real-matrix.json`, `restoration-matrix.json` in that build directory. Executor patch and all 16 mutation deltas retained there.

Both pristine tools read `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)` exit 0. Independent selftest: `VERDICT: PASS (34 cases)` exit 0. Executor patched selftest: `VERDICT: PASS (47 cases)` exit 0.

| Battery | M1–M6 | M7/M8 |
|---|---|---|
| Independent minimal note arm | KILLED: concrete UNLISTED/MODE, exit 1; selftests fail twice | SURVIVOR: missing-note CLEAN, exit 0; selftests pass |
| Real executor patch | KILLED: concrete UNLISTED/MODE, exit 1; selftests fail twice | Live-only SURVIVOR, but overall KILLED: selftest `NOTE_UNBOUND-models-corrupt`, exit 1, confirmed immediate rerun |

The pristine missing-note controls report `NOTE_UNBOUND models-corrupt`, DRIFT exit 1. Real M7/M8 accept the missing token at the live gate; its negative selftest catches that defect. Independent minimal suite cannot make those arms fail: coverage finding, not contract relaxation.

Corrections: exact M5 `20\d{6}` → `20\d{4}` rejects **29/29**, not 2/29 live names. M6 uses ceiling **0400**, producing `MODE lsp.json want<=0400 got=0600`; widening to 0644 was separately measured CLEAN exit 0, as expected for a ceiling.

Every mutant file was restored to exact pristine bytes; the same live/selftest detectors were repeated, returning CLEAN/PASS, and missing-note controls again returned DRIFT. Scratch under `$HYAKU_SCRATCH/kumitate-r75/K75MutRules` was removed after copying evidence. Both matrices are scoped mutation evidence, not an integration/admission judgment.
