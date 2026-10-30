VERDICT: M6 fixes the real six-row snapshot count, but still accepts absent or structurally invalid Markdown delimiters; no real-data breakage reproduced.

## Evidence
Axes: real-data correctness; adversarial parser discrimination; frozen-rule fidelity; reproducibility without lane mutation.
All evidence/artifact paths below are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Frozen review revision: `9401d8655970d542b81d318bdad558d6dea39397`.
LSP prerequisite: `read xd://lsp` returned `No such tool: xd://lsp`; semantic references/definitions/diagnostics unavailable. Text inspection is fallback, not semantic proof.

Read frozen plan first: `.ufo/waves/round-69/plan.md:132-136` defines the cell regex, exact `Feature` header and requirement to retain a proper Markdown table.
Actual scoped code comparison: r68 `deprec68-probe.mjs:294` uses line-level delimiter filtering; r69 `.ufo/waves/round-69/probe/deprec69-probe.mjs:334-343` replaces it with trimmed cell filtering. Capture parser is hoisted to `:305-322`, reused by M11 at `:502-507`.
`git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 9401d8655970d542b81d318bdad558d6dea39397 -- .ufo/waves/round-69/probe/deprec69-probe.mjs corpus/knowledge/mcp-deprecation-registry.md` exited 0: counter unchanged; entry changes only append `## Capture origin`, not the snapshot.

Extracted the frozen counter, previous counter, real entry and S207 capture with `git archive ... | tar -x -C <seat-scratch>/base` (exit 0). No clone, git writes or integration edits.
Ran exact executable slices (not a reimplemented parser):
```sh
TMPDIR=/fast/scratch/hyaku/kumitate-r69/K69ReviewM6Fix node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ReviewM6Fix/attack.mjs /fast/scratch/hyaku/kumitate-r69/K69ReviewM6Fix/base /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ReviewM6Fix
```
Exit 0; verbatim output (also durable `build/K69ReviewM6Fix/results.txt`, under this round's wave directory):
```text
FREEZE 9401d8655970d542b81d318bdad558d6dea39397
EXACT_SLICES delink=161 section=178..185 tableOf=306..322 M6=325..359
CAPTURE rows=6 widths=5,5,5,5,5,5
SINGLE_DASH_REGEX true
real-base: M6 PASS ok
delimiter-trailing-spaces: M6 PASS ok
two-column-aligned-delimiter: M6 PASS ok
insert-single-dash-data-row: M6 PASS ok
lowercase-header: M6 MISS rows=7!=6
eleven-column-data-five-column-header: M6 PASS ok
eleven-column-table: M6 PASS ok
missing-delimiter: M6 PASS ok
four-column-data: M6 MISS earliest-removal:Roots,earliest-removal:Sampling,earliest-removal:Logging,earliest-removal:Dynamic Client Regis,earliest-removal:`includeContext: "th
```
M6 outcomes above are isolated check outcomes, not full `DEPREC69_HELD` verdicts or per-variant process exit codes.

## Findings
1. **K69ReviewM6Fix-1 — MEDIUM, frozen counter acceptance gap, not a new real-entry regression.** M6 does not enforce the plan's requirement that a proper Markdown table remain. Removing the delimiter entirely still passes. Replacing the real five-cell delimiter with `| --- | :---: |` also passes although header and delimiter widths disagree. `.ufo/waves/round-69/probe/deprec69-probe.mjs:334-343` discards delimiter-shaped rows without requiring one or validating its width; `:346-354` only compares data-row counts and cells 0/2/4. This allows the explicitly forbidden unrenderable-table workaround (`plan.md:135-136`) and malformed substitutes. Reproduce using the command above; durable evidence `.ufo/waves/round-69/build/K69ReviewM6Fix/results.txt:7,12` and fixtures `two-column-aligned-delimiter.md`, `missing-delimiter.md`. Recommendation: mine for a later counter ratchet, requiring a header-associated delimiter of matching width; do not change the frozen M69 predicate mid-round.

Requested edge-case interpretation:
- Trailing delimiter spaces: trimmed before splitting (`:336`), correctly ignored; real snapshot remains six rows.
- Single-dash cells: `^:?-+:?$` matches `-`, so an appended `| - | - |` is discarded. This cannot serve as distinguishable data under the explicitly frozen all-dash-row rule (`plan.md:134`), so it is not separately a rule violation. Importantly, the REAL S207 capture itself uses five single-dash separator cells (`base-S207-capture.md:25`); rejecting single dashes globally would break that carrier's existing parsing convention.
- Eleven columns vs five: both expanded data rows and an entirely expanded eleven-column table pass if cells 0/2/4 remain equal. No exact width comparison exists in M6; four-column rows fail only because cell 4 becomes `undefined` and mismatches. Extra ignored columns alone are not called a separate defect: the declared comparison names three fields, not all five. M11's cross-carrier comparison DOES require width equality (`:506-507`), but it compares captures, not the entry snapshot, and cannot repair M6's structural gap.
- Lowercase `feature`: not recognized as a header; it becomes a seventh data row, producing `rows=7!=6`. Consistent with frozen exact `Feature` wording, not real-data breakage.
- Actual entry `corpus/knowledge/mcp-deprecation-registry.md:45-52` has the expected header, five-cell delimiter and six five-cell data rows; unchanged snapshot passes against the six-row S207 capture. No proposed entry edit is needed for this attack.

## Artifacts
All under `.ufo/waves/round-69/build/K69ReviewM6Fix/`:
- `attack.mjs`: reproducible exact-slice harness.
- `results.txt`, `frozen-M6-executable.txt`, `base-S207-capture.md`: durable receipts/source slices.
- `real-base.md` plus eight named variant `.md` files, matching output case names.
- Report: `.ufo/waves/round-69/w1/K69ReviewM6Fix.md`.
Reproduce with `bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ReviewM6Fix/reproduce.sh`: supplied self-cleaning archive/execution driver (not separately executed). No scratch path is evidence.

## Limits
No full live counter, network checks, M11 execution, canonical runtime admission or unrelated claims checked. The exact M6 and shared capture-parser slices were exercised against a frozen scratch extraction; no claim of whole-counter success. No tools installed/updated. No forbidden files edited. Scratch removed before terminal submission.
Self-evaluation: accuracy 4/5 (isolated M6, not whole-counter execution); completeness 5/5 (all requested cases plus real data); clarity 4/5 (slice-vs-full distinction requires care); actionability 4/5 (frozen rule must wait for later ratchet); conciseness 4/5 (fixture provenance adds necessary length). Overall 4.2/5; no score <=3.
