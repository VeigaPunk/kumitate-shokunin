# K84Sentinel — receipt input boundary

rev=3794b903324e7eb4aec6d92539f2ca4e2c0b6727
Candidate: working artifact, SHA-256 `80332ee9bcf1c64de5b3d14f151b9edffc4ddf991fec9300532a2702c00e2523`; not asserted committed at freeze.
Axes: operability (correct admission), coverage (boundary cases), safety (data-only receipt parsing; bounded isolated execution).

Read frozen plan/probe, tooling rules, PROVINCE, QUALITY Q24/Q26/Q63. No production, frozen-plan/probe, git/jj, sibling, or fleet edits. No installs; existing Node v24.21.0. This is lane-author advice, not non-author closure.

## Required contract finding

**Medium — metadata falsely recognized as malformed arm. Admission affected: yes, false rejection under full frozen contract; no demonstrated change to the frozen 16-case predicate.**

Input:
```text
command=X arm red FAIL
X arm a ok
X: HELD held=1/1
```
Observed exit **2**, `COUNTER_RECEIPT: FAIL-CLOSED ARM_MALFORMED`; expected exit 0 CLEAN because the first line is command metadata, which frozen plan line 31 says to ignore. Reviewed candidate lines 33–36 use broad arm-candidate recognition `^\S+[ \t]+arm`, so `command=X` is mistaken for a transcript prefix. Hostile metadata can therefore deny admission of an otherwise coherent receipt. Smallest remediation: exclude explicitly metadata-keyed records before arm/summary recognition without relaxing rejection of transcript-shaped invalid names/statuses. Add this exact regression case. Owner and L1 were notified; this seat did not modify the candidate. Snapshot findings apply only to the hash above.

## Extra limits, not frozen-contract admission blockers

- **Low availability limit — arbitrary file types and whole-file reads.** Reviewed candidate lines 132–134 call `readFileSync(path, 'utf8')` with no regular-file or size check. A regular symlink to the controlled clean fixture returned exit 0 CLEAN; a broken link and a directory returned exit 2 RECEIPT_UNREADABLE. `/dev/null` returned exit 2 SUMMARY_COUNT, showing a character device is read, not rejected by type. A controlled FIFO was created (`mkfifo`, exit 0) and identified with lstat, **never opened or passed to the checker**. [INFERENCE] a writerless FIFO can block; an endless device or sufficiently large file can consume unbounded resources. The 4 MiB metadata fixture completed CLEAN within the 1.5-second child deadline; this proves only that bounded size, not a general huge-file guarantee. Smallest future remediation if scope expands: open nonblocking, fstat the opened descriptor as regular, and enforce an explicitly versioned byte limit. Simple pre-open lstat is insufficient against replacement races. Do not silently add this as a new frozen admission criterion.
- **Informational provenance boundary.** Coherent forged rows can still be CLEAN: this reconciles text, not origin, author, revision truth, or execution. Metadata is intentionally not authenticated. Smallest remediation: preserve this limit in capability wording; provenance requires a separately scoped contract.

## Observed safe behavior

23 bounded CLI invocations; no timeouts. Literal shell/JavaScript-looking metadata and detail strings returned exactly CLEAN, with no payload output; static read confirms no receipt evaluation or execution path. Unsafe integers, negatives, fractions, exponent syntax, and an unsafe second summary were rejected with exit 2 SUMMARY_COUNT. Maximum safe integer was parsed then rejected for HELD_COUNT (exit 1); leading-zero integer spelling was accepted. Invalid status/name, NUL-containing name, ANSI-colored prefix, and carriage-return/display-overwrite detail all returned exit 2 ARM_MALFORMED. Raw controls were not echoed in diagnostics. These observations do not claim universal terminal normalization.

## Durable evidence and command

All evidence is under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84Sentinel/`:
- `run.txt`: actual command, cwd, exit 0, revision context, candidate digest, reproduction instructions.
- `boundary-results.json`: each exact CLI command, exit, output, expectation and file type; one required-contract mismatch (`forged-command-prefix`).
- `boundary-driver.mjs`: deterministic fixture creation and bounded invocations.
- `candidate-reviewed.mjs`: exact reviewed bytes.

Executed command: `env TMPDIR=/fast/scratch/hyaku/kumitate-r84/K84Sentinel/tmp HYAKU_SCRATCH=/fast/scratch/hyaku/kumitate-r84/K84Sentinel/work node /fast/scratch/hyaku/kumitate-r84/K84Sentinel/boundary.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs` — exit 0 means capture completed, not all expectations passed. No shared-tree tests/build/lint, frozen counter rerun, hostile infinite device read, or offensive automation. Scratch removed after durable capture.

Self-evaluation: accuracy 4/5 (FIFO/resource exhaustion static inference only); completeness 4/5 (bounded size, not a hostile-filesystem guarantee); clarity 4/5 (contract/extra-limit split explicit); actionability 4/5 (exact regression plus minimal repair, remediation belongs to owner); conciseness 4/5 (detailed evidence retained for reproducibility). Overall 4.0/5. Highest-value improvement is owner repair and a fresh digest-bound regression receipt; this report does not attest that later repair.

Report: .ufo/waves/round-84/w1/K84Sentinel.md
