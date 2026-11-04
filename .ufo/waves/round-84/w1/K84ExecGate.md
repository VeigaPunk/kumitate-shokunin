# K84ExecGate — round 84 candidate advice

Axes: operability (terminal 9, capability acquisition) and coverage. No score or independent closure asserted.

## Deliverables

Owned output root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/build/K84ExecGate/`.

- `counter-receipt.mjs`: zero-dependency Node ESM candidate for `scripts/counter-receipt.mjs`; final sha256 `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0`.
- `selftest.txt`: own CLI invoked on hermetic fixtures; exit 0, `COUNTER_RECEIPT_SELFTEST: PASS held=50/50`.
- `probe.txt`: unchanged frozen probe against isolated candidate lane; exit 0, `C84_C1: HELD held=16/16`.
- `initial-selftest.txt` and `initial-probe.txt`: retained initial 48/48 and 16/16 observations for superseded digest `80332ee9bcf1c64de5b3d14f151b9edffc4ddf991fec9300532a2702c00e2523`.

Receipts bind candidate digest, freeze revision `3794b903324e7eb4aec6d92539f2ca4e2c0b6727`, exact command, start time and exit. Revision identifies frozen contract, not an integration commit containing the uncommitted candidate. Base is `a648a6f8f3028fc4f72d27470b4673fe8e3e5866`.

## Observed commands

Working directory `/fast/scratch/hyaku/kumitate-r84/K84ExecGate`; both commands used `TMPDIR=/fast/scratch/hyaku/kumitate-r84/K84ExecGate/tmp`.

1. `node /fast/scratch/hyaku/kumitate-r84/K84ExecGate/scripts/counter-receipt.mjs --selftest --work /fast/scratch/hyaku/kumitate-r84/K84ExecGate/work/selftest` — exit 0, 50/50.
2. `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-84/probe/probe84-c1.mjs --lane /fast/scratch/hyaku/kumitate-r84/K84ExecGate --work /fast/scratch/hyaku/kumitate-r84/K84ExecGate/work/probe` — exit 0, 16/16.

## Behavior and evidence

One-pass transcript collection, ordered malformed findings, then ordered drift findings. CRLF and unrelated metadata accepted; receipt text is only read, never executed. CLI rejects missing, repeated, mixed and unknown options with exit 64 and stable USAGE token. Selftests assert exact output and exit, not substring alone.

Selftest covers every frozen arm, malformed/unsafe numeric summary fields, malformed status/name/prefix, duplicate/foreign prefixes, metadata, unreadable directory, missing file, CLI refusal and pairwise finding precedence. `real-hidden-red-class` constructs 28 arm rows with one FAIL and 27/27 headline and observes exit 1 `COUNTER_RECEIPT: DRIFT ARMS_TOTAL`. This is a hermetic class reproduction, not a claim to have run committed historical receipts; K84ExecHistory owns those measured reads.

Sentinel observed an initial false rejection: `command=X arm red FAIL` was mistaken for an invalid arm prefix (exit 2 ARM_MALFORMED). Fixed by skipping key=value metadata and command/rev/exit colon headers before transcript parsing. Added `metadata-arm-shape` and `metadata-summary-shape`; both now observed CLEAN exit 0. L1 also requested the registry-compatible selftest PASS label. Frozen plan/probe unchanged; final scratch receipts supersede initial receipts. Runtime observed: Node v24.21.0; no installations or updates.

## Limits and integration ownership

- Malformed summary syntax and unsafe numeric values map to `SUMMARY_COUNT`; the frozen contract provides no separate numeric token. Horizontal spacing is literal in valid arm/summary grammar except optional detail separator.
- No legacy PASS support, ANSI normalization, transcript authenticity, symlink refusal, FIFO/device protection or resource bounds are claimed. Receipt file reads follow normal Node filesystem semantics.
- No production/history/probe/plan changes, installs, git/jj mutations, source registry edits or shared checks. LSP definition/reference tools are unavailable in this seat's mounted tool inventory; implementation is a new isolated standalone module.
- Read PROVINCE own-instrument scope and QUALITY Q20/Q24/Q26/Q29/Q37: counter is pass-sensitive; receipts carry byte identity; final integration, control ordering, LOG/changelog, historical evidence, and post-integration checks remain L1-owned. The owned report supplies candidate documentation without changing protected production docs.
- Parent should integrate candidate, rerun selftest and frozen C1 after integration, reconcile independent boundary/mutation findings and score committed historical receipts. These scratch receipts are lane-author advice only, not non-author closure.

Self-evaluation (1–5): accuracy 4 (scratch evidence only, not integrated revision); completeness 4 (historical runs separately owned); clarity 4 (numeric malformed token needs explicit interpretation above); actionability 5 (single candidate plus exact receipts); conciseness 4 (report includes required evidence/limits). Overall 4.2. Improvements at integration: bind receipts to integrated revision and attach historical measurements. Initial metadata defect is disclosed and corrected with regressions; no failure observed in final assigned scratch runs.
