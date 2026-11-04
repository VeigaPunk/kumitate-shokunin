# K78MutC2 — C2 literal mutation battery

Axes: operability + coverage. Verdict: **10/10 killed on executor stand-in**, not a final-lane admission.

## Deliverables

- `build/K78MutC2/mutants-c2.mjs` — entry point, `--lane DIR`.
- `build/K78MutC2/mutations-c2.mjs` — required companion; ten single exact-literal replacements, ambiguous/missing anchors produce `nomatch`.
- `build/K78MutC2/battery-standin.txt` — complete bounded detector outputs and per-mutant hashes.

All paths above are relative to `.ufo/waves/round-78/`.

Stand-in: lane detector-input files copied into seat-private scratch, replacing only `scripts/omp-census.mjs` with executor artifact `build/K78ExecCompare/omp-census.mjs`. Tested source SHA-256: `cb0ea5d67d347f0cb4c6c85f4985e8f8f044201ec0ddb674ed94068586910bff`.
Frozen counter SHA-256: `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` (runner checks it before copying).

## Measured results

Detector on pristine bytes: exit 0, `C78_C2: HELD held=11/11`. Each mutant detector exited 1; every restoration detector exited 0 and held 11/11.

| Single-literal mutant | Expected detector | Actual failing arms | Held | Verdict |
|---|---|---|---|---|
| added always 0 | added | added, selftests | 9/11 | killed |
| added/removed swapped | added + removed | added, removed, selftests | 8/11 | killed |
| changed ignores mode | changed | changed, selftests | 9/11 | killed |
| label always IN_SYNC | added | added | 10/11 | killed |
| drift exits 0 | added + removed + changed | added, removed, changed, selftests | 7/11 | killed |
| first receipt name | added | added, selftests | 9/11 | killed |
| entry key-set unchecked | selftests | selftests | 10/11 | killed |
| sorted-order unchecked | selftests | selftests | 10/11 | killed |
| top-level key-set unchecked | selftests | selftests | 10/11 | killed |
| file content contributes to changed | content-blind | content-blind, selftests | 9/11 | killed |

The required sorted/key-set category is split into three smaller independent mutations rather than weakening three checks at once. The content mutant opens ordinary member files and treats nonempty bytes as changed; the frozen content-blind arm measured `leaked=false exit=1 ... changed=1 first=RULES.md`, killing it without needing disclosure.

Final actual output: `MUTANTS78_C2: ALL-KILLED killed=10/10`, runner exit 0. No survivors, nomatches, or crashes.

## Restoration and bounds

`battery-standin.txt` records before/mutated/restored SHA-256 for every mutant. All ten restored hashes equal the pristine source hash above. It also records `SOURCE_UNCHANGED` with that same hash. Each mutant uses the same detector and exact restoration in `finally`; baseline failure is INCONCLUSIVE, not a kill. Work roots and copied fixtures remained under `/fast/scratch/hyaku/kumitate-r78/K78MutC2/`; the entire seat scratch directory was removed after receipts were copied. No lane source, frozen probe, sibling artifact, git state, or operator config was edited. No tools installed/updated.

An initial wrapper invocation incorrectly used the Eval host's `process.execPath`, which invoked the host CLI rather than Node; it performed no mutation and is preserved separately as `build/K78MutC2/invocation-error.txt`. The successful battery explicitly launched `node`.

## Handoff

L1 must rerun the runner against final bytes using Node; retain the companion module beside it. Only detector-input files are copied (the two scripts, pinned receipt, and binding note), avoiding unrelated worktrees and caches. This seat makes no integration or shipping judgment.

Self-evaluation: accuracy 5 (actual counter outputs and hashes); completeness 5 (all eight requested categories, with validation split three ways); clarity 4 (full evidence is necessarily separate from summary); actionability 5 (one-command entry point and explicit companion); conciseness 4 (restoration detail retained for audit). Overall 4.6/5. Improvement: L1's required final-byte rerun closes the remaining stand-in/final distinction.
