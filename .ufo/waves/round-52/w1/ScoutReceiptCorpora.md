# ScoutReceiptCorpora — B4 prior-corpus census

## Result

**176 files; 0 contain a parseable 32-hex nonce field.** High confidence: every selected worktree path and SHA-256 matches both its base `02c01258464cac3804faf177d0cfbf113cd59706` blob and the actual base Git archive. Complete list, SHA-256 values, commands, classifier, and boundary evidence: `.ufo/waves/round-52/build/ScoutReceiptCorpora/corpora.md`; machine inventory beside it.

Axes: complete coverage; exact-byte evidence; B4 contract alignment/read-only safety.

## Evidence gap (not a count mismatch)

Predicted internal `prior-files=176`. Frozen `.ufo/waves/round-52/base/attest52-base.txt:1` instead contains **`B4 MISS tool or receipts dir absent`**, with **no `prior-files=` field**. Its SHA-256 is `57355f3d6a1cc669e39993513e4fd9433a2a8c9d9c6cd9363d0fb468f1b0167d`. The requested equality against a printed base count is therefore unavailable, not verified.

Source `.ufo/waves/round-52/probe/attest52-probe.mjs:304-334` runs the sweep only when the round-52 receipts directory exists. Additionally `:473` prints PASS without detail and truncates MISS detail to 80 characters; a successful B4 does not actually print its appended count.

## Corpus boundary

B4 matches basenames (`:321`), not directories: actual round-51 `receipts/attest-run-*.txt` bodies are excluded. Run-1/run-2 nonce strings occur in selected prose; run-3 nonce `176f623b130377f56ae80532b9f9b8c3` occurs in no selected file. The zero-field finding is not a zero-substring claim. No replay or candidate receipt was generated.

LSP device unavailable (`read xd://lsp` reported only ast_edit/debug mounted); definitions and inline callers were traced literally, not semantically. No tests/probes run. No tools installed/updated. Only this seat's allowed artifacts were written. Remaining unknown: a printed count comparison cannot be supplied by the frozen base receipt.

Report: .ufo/waves/round-52/w1/ScoutReceiptCorpora.md
