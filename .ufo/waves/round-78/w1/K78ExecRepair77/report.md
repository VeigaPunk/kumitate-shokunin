# K78ExecRepair77 — routed round-77 repairs

Axes: operability + coverage (orchestration/tooling evidence fidelity).

## Delivered

Exclusive build directory: `.ufo/waves/round-78/build/K78ExecRepair77/`.
- `c77-c1-base-final.txt`, `c77-c2-base-final.txt`: final-byte rescoring with exact per-arm stdout, stderr, exit, commands, base revision and SHA equality.
- `d1.txt`–`d6.txt`: exact source quotes and file:line evidence.
- `loader-final.txt`: exact named loader replay with full stdout/stderr/exit and Node version.
- `corrections.md`: six paste-ready append-only errata, with destination documents named.
- This report is retained at both task-named report locations (`w1/K78ExecRepair77.md` and `w1/K78ExecRepair77/report.md`).

## Exercised measurements

Archived base: `a321ed8006083be1086a3b991a78d3b4c26f0be9`.
Final probe: `e47266ae093e6f4ba6b30507606c6b7f2b70903f:.ufo/waves/round-77/probe/probe77.mjs`.
SHA-256: `d48390c3e2490f2363e31bec6085ca21b5b31cb7bec99b2295580c7a873c4604`; equals lane-tip file's SHA-256.

- C1: `C77_C1: UNMET held=1/12`, exit 1; stderr empty.
- C2: `C77_C2: UNMET held=2/13`, exit 1; stderr empty.
- Loader command from `open/r76-freeze-fix-6-disposition.txt:9`: actual exit 1, `ERR_MODULE_NOT_FOUND`, not historical annotation 0; `v26.12.0`.
- SQLite §4.2 / §4.4 / §9.5 whitespace counts: 23 / 20 / 25 versus annotations 23 / 21 / 24.
- D1 quoted lesson close 856 versus receipt computed A 857.
- D3 quoted report's `executor=2/3 ... verdict=met` versus template's three-executor minimum; append records unmet under that floor and preserves L1-planner disclosure.
- D6 quotes r76 routed item 3 and draft why-not line 25; append carries operator-owned/outside-lane rationale into durable lesson.

## Boundaries, risks and handoff

No implementation or historical lane bytes were edited; no commit/stage/push, fleet writes, tool installs, background jobs or dispatch. Only assigned build/report files were written outside seat scratch. Scratch `/fast/scratch/hyaku/kumitate-r78/K78ExecRepair77/` was deleted after retaining receipts. No LSP symbol operations were required (evidence-only work; no supported symbol refactor).

The loader replay uses the exact supplemental `spotcheck-adopt-absent.mjs` URL, not the original r76 module path, and does not establish a fresh r76 round-gate result. D1 open-cell numbers were intentionally not re-measured. Historical floor discrepancy is disclosed, not retroactively repaired. The L1 must append the supplied errata to the named durable documents; no additional control execution is needed for these measured findings. No blockers.

Only the explicitly assigned probes and loader were executed; no round-78 gates/build/lint/format run. Probe-internal selftest arms are part of the assigned historical control measurement.

## Self-evaluation

Accuracy 4/5: exact receipts and source quotes retained; D1 open-cell claim intentionally excluded rather than inferred. Completeness 5/5: both final-byte controls, six evidence files, corrections and both named reports delivered. Clarity 4/5: explicit destination sections, but two report locations reflect conflicting task naming. Actionability 5/5: paste-ready append-only text and full evidence paths. Conciseness 4/5: evidence repeats some receipt headers for independent citation. Overall 4.4/5. Improvement priority: L1 should preserve explicit fleet-root versus lane-relative destinations when applying D3/D5. User agreement expected: complete scoped evidence, no historical rewrite.
