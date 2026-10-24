# CtlNoNonceCorpus — round 58

- Claim / rule: C1, A58 B5 (`kumitate-receipt-evidence-v1`)
- Axes: operability; sweep coverage
- Control result: **CORROBORATED** — the requested no-nonce corpus produced `RECEIPT_EVIDENCE: FAIL-CLOSED reason=SWEEP_NO_NONCES`, exit 2.
- Measured R1: `6affb9ebde37b7d663658f1959d64f0f0b68f480`
- Sandbox mutant: `74b23bcb4a3f6c74256e9dba23635cf18e43b708`; its sole parent is R1 (`16-commit-meta.log`).

## Setup and unmodified control

Cloned with `git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin <build>/lane`, detached the sandbox at R1, and observed an empty `git status --short` (`01-clone.log` through `04-status-before.log`). No production checkout or index was mutated.

The same verifier invocation before mutation observed:

```text
RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 sweep_files=5580 sweep_nonces=63 span_ms=346314
exit=0
```

Full command and output: `.ufo/waves/round-58/build/CtlNoNonceCorpus/05-baseline-verify.log`.

## Mutation and scratch commit

`strip-nonces.py` replaced exact byte matches of `"nonce":\s*"[0-9a-f]{32}"` with empty bytes beneath `.ufo/waves/round-48` through `round-57`. It pruned every directory named `probe`, used `lstat`-equivalent no-follow traversal, and skipped every non-regular file.

Observed mutation summary (`06-strip.log`):

- 134 regular files changed; 319 exact matches removed.
- Matches by round: 51=11, 52=70, 53=4, 54=4, 55=4, 56=4, 57=222; rounds 48–50 had no matching bytes.
- All ten round-root `probe/` directories were skipped; seven non-regular entries were skipped.
- No round directory was missing.

The pathspec-limited scratch commit succeeded: 134 files changed, 319 insertions and 319 deletions (`10-commit.log`). The post-commit sandbox status was empty (`12-status-after.log`). The complete diff and changed-path list are in `09-diff.log` and `08-diff-names.log`; no changed path is under `probe/`.

## Coverage and fail-closed reading

The mutant revision still resolved **5,580 files** under rounds 48–57 (`13-ls-tree.log`: 5,580 path rows plus two command-header rows and one exit row; `17-ls-tree-log-lines.log`). Thus this control retained sweep coverage while removing the nonce matches.

The exact post-commit sweep produced no stdout and exited 1 (no matches), not 2:

```bash
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlNoNonceCorpus/lane grep -ohE '"nonce":\s*"[0-9a-f]{32}"' 74b23bcb4a3f6c74256e9dba23635cf18e43b708 -- ':(glob).ufo/waves/round-4[89]/**' ':(glob).ufo/waves/round-5[0-7]/**'
```

Evidence: `14-sweep.log`.

The required verifier run was:

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlNoNonceCorpus/lane/scripts/receipt-evidence.mjs verify --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlNoNonceCorpus/lane --rev 74b23bcb4a3f6c74256e9dba23635cf18e43b708 --receipts /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlNoNonceCorpus/lane/.ufo/waves/round-58/receipts --min-span-ms 300000
```

Observed stdout and exit:

```text
RECEIPT_EVIDENCE: FAIL-CLOSED reason=SWEEP_NO_NONCES
exit=2
```

Evidence: `.ufo/waves/round-58/build/CtlNoNonceCorpus/15-mutant-verify.log`. Aggregate observed statuses are in `observed-status.txt`; the driver is `run-control.sh`.

This is a scratch-only control result for the no-nonces arm, not an overall ATTEST58 or DOCTRINE58 verdict. No tools were installed and no production files, fleet files, or sibling repositories were changed.

Report: .ufo/waves/round-58/w1/CtlNoNonceCorpus.md
