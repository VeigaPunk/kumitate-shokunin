# K78ExecCompare — C2 implementation

Axes: operability + coverage (orchestration/tooling).

## Deliverable

Based on `ad2630d0566a561ee078f47fade5644a22c10621`. Integration changes only `scripts/omp-census.mjs`; patch and complete replacement are retained under `.ufo/waves/round-78/build/K78ExecCompare/` as `patch.diff` and `omp-census.mjs`.

Adds `--compare FILE` / `--compare=FILE`, exclusive modes and binding-option refusals, shared receipt validation and depth-1 live enumeration. Added/removed/changed counts compare kind and permission bits; first drift name uses UTF-8 byte ordering (C locale). Errors return 2 with `SHAPE_INVALID`, `SHAPE_NOT_FOUND`, or `ROOT_NOT_A_DIR`. Successful comparison returns exactly one count-only line and exit 0/1. No proxy, score term, receipt schema, snapshot or shape behavior changes. CLI documentation is updated in the script header and usage.

## Retained evidence

- `build/K78ExecCompare/selftest.txt`: `VERDICT: PASS (79 cases)`, exit 0. Includes added, removed, mode/kind changes, content blindness, invalid/absent receipts, non-directory/missing roots, option exclusions and equals syntax; receipt validation also checks unsorted entries and extra keys.
- `build/K78ExecCompare/counter-c2.txt`: frozen counter `C78_C2: HELD held=11/11`, exit 0; every named arm passes. Counter unchanged.
- `build/K78ExecCompare/non-scoring.txt`: original strict proxy invocation returns only `GATE_PIN_DRIFT pin.omp-census`, exit 1. A scratch scorecard copy changing only that digest yields `PROXY: MATCH`, exit 0: operability=9, all coverage axes=10, O_members=64, O_findings=0, O_bound=35. Proxy `--compare` occurrences=0. Live snapshot/shape roundtrip returns `OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)`, exit 0.

Candidate script SHA256: `cb0ea5d67d347f0cb4c6c85f4985e8f8f044201ec0ddb674ed94068586910bff`.

## Integration dependency / risks

L1 must refresh `pin.omp-census` during integration; the frozen declared digest is `14fea9c1e0dd8272494038bc21dc6e81f319841a7acba9a3560508a8f74d5384`. The unqualified strict command cannot MATCH with changed script bytes and an unchanged gate pin. This is retained honestly, not suppressed. The pin-only scorecard copy was a disposable evidence fixture, not part of the patch. L1 should run the integrated frozen C2 counter and strict proxy after its pin refresh.

No tools installed or updated. No LSP definition/reference/refactor tool is mounted in this seat; symbol work used explicit file sections instead. No credential/session/member content was read; only receipt JSON and root metadata. No commits, staging, pushes, global changes or frozen-counter edits. Scratch is deleted before terminal handoff; only build evidence and the named reports remain.

## Self-evaluation

Accuracy 4/5: counter and selftest pass; original strict receipt correctly records the pin mismatch. Completeness 4/5: implementation complete; integrated pin refresh is owned by L1. Clarity 4/5: distinguishes raw DRIFT from pin-qualified MATCH. Actionability 4/5: standard git diff and full file supplied; integration needs the named digest update. Conciseness 4/5: two report locations are retained because both were explicitly requested. Overall 4.0/5. Improvement: refresh the pin in L1's integrated tree and run its final gates. User agreement expected because the sole remaining dependency is explicit and evidenced.
