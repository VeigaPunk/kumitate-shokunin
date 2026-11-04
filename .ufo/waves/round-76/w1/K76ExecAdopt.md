# K76ExecAdopt — scoped C2 implementation

Axes: operability + coverage (orchestration/tooling). Frozen plan read unchanged. Implementation base: `cabc7aefd5f1562299f757e23207710c12e4ed58`.

## Deliverable

Full replacement: `.ufo/waves/round-76/build/K76ExecAdopt/files/spotcheck-adopt.mjs`, to install as `scripts/spotcheck-adopt.mjs`.

Implements `kumitate-spotcheck-adopt-v1`: `--lane`, `--check`, `--adopt`, `--predict`, strict usage, refusal tokens, append-only row/pin insertion, pre-image rollback on a non-CLEAN child oracle. Reads the unchanged oracle's emitted findings instead of duplicating its coverage rules. Adds no dependencies. Existing rows and pin entries are not reserialized. Includes hermetic fixture selftests and per-CLI output/status receipts in the selftest output.

Expected, NOT exercised: row-present/pin-missing gives `wrote=pin`; pin-present/row-missing gives `wrote=row`; both absent gives `wrote=both`. The fixture driver asserts exact stdout/exit, includes red-before checks, and checks idempotence/refusal/rollback with SHA-256.

## Retained evidence and verification limit

Observed shell output: shared clone succeeded; `git -C /fast/scratch/hyaku/kumitate-r76/K76ExecAdopt/lane rev-parse --show-toplevel` printed `/fast/scratch/hyaku/kumitate-r76/K76ExecAdopt/lane`; explicit frozen-base checkout returned successfully. Source write/edit tool receipts retain the implementation. No live implementation file or oracle was edited.

Selftest tally/exit: **unrun**. Every CLI arm's measured stdout/exit: **unrun**. Real round-75 adoption and second-run zero-byte evidence: **unrun**. The leaf executor role prohibits build/lint/tests/formatters during the editing wave and reserves verification to parent; do not interpret the expected strings in source as measurements. `selftest-transcript.txt` and `cli-receipts.txt` explicitly retain this status, not synthetic PASS output. Parent must run the selftest, real-copy adoption, hash comparison, and mutation gate after integration. C2 is not admitted by this delivery alone.

LSP: unavailable in this seat's mounted tool inventory; no empty symbol response was treated as absence. Existing code was inspected with read/grep. Tools installed/updated: none.

## Atomicity and interface caveats

Implemented complete-file temp-write + same-directory rename, mode preservation, UUID/exclusive temp creation, temp cleanup, and full original-byte restoration after a caught write/post-oracle failure. Individual files never expose partially written JSON/README bytes. **Two separate renames cannot provide a cross-file transaction under SIGKILL/power loss.** A kill between them can leave a valid half-state that a later adoption repairs; no stronger two-file guarantee is claimed. If “kill mid-run” requires both files to remain jointly at the same generation, the requested alternative of independent temp-file/rename writes is insufficient; that stricter criterion is not met.

The plan's sample ADOPTED line omits `wrote=`, while this seat explicitly requires it; implementation follows the seat's additive `wrote=both|row|pin` suffix.

`--check` refuses malformed map inputs; unrelated oracle drift is never reported CLEAN (when no spotcheck itself is missing, it reports `uncovered=0 first=oracle`). No unrelated file is repaired. Already-covered adoption writes nothing even when unrelated ordinary map drift exists. Ambiguous/noncanonical `covered` property spellings refuse rather than guess an insertion point.

## Self-evaluation

Accuracy 4: no unrun result presented as PASS; execution evidence absent. Completeness 3: implementation delivered, but acceptance measurements deferred by executor policy and cross-file kill atomicity explicitly limited. Clarity 4: expected and observed evidence separated; report is longer because caveats affect admission. Actionability 4: one file installs, parent commands listed in receipts. Conciseness 4: source embeds all fixtures instead of adding test files. Overall 3.8/5. Highest-impact next actions are parent's permitted gate execution and an explicit decision on the cross-file kill requirement; no acceptance claim should precede these.
