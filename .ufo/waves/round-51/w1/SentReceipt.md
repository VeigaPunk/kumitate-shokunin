# SentReceipt — C1 security review

**Axes:** receipt confidentiality; nonce collision resistance; receipt authenticity/trust boundary.

## Findings

### 1. Raw argv can disclose secrets — MEDIUM (conditional, contract-level)

**Exploit path:** C1 explicitly captures `argv` (plan.md §C1, lines 26–32) while allowing arbitrary `<cmd...>`. An invocation such as `tool --token=...`, a password argument, or a URL containing userinfo puts the literal credential in the canonical JSON receipt. Shell-expanded environment values passed as arguments are also captured even though the environment itself is not recorded. Hashing the receipt does not conceal its contents; committed/readable receipts expose the value to every reader. The plan's “No env is recorded; receipts carry no secret material” statement (line 38) is not guaranteed by the specified raw-argv behavior.

The delivered implementation was **not present** at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs` or in the round-51 `build/` directory when checked. This finding is therefore against the frozen contract; implementation-level redaction could not be assessed.

**Smallest remediation:** Do not persist raw argument values that may contain credentials. Redact/reject credential-bearing arguments before serialization, or persist an argv digest plus a documented, sanitized argv representation. Add a selftest injecting a known token in argv and assert it is absent from receipt bytes.

**Close-time sweep (proposed; not run):** from any shell, this checks each receipts directory with Gitleaks and separately fails on environment/credential fields and common token/key forms in receipt text:

```sh
set -euo pipefail
ROOT=/home/vgpnk/Projects/shokunin/kumitate-shokunin
find "$ROOT/.ufo/waves" -type d -name receipts -print0 |
  xargs -0 -r -n1 gitleaks dir --no-banner --redact --exit-code 1
PATTERN='"(env|environment|authorization|access[_-]?token|refresh[_-]?token|token|password|passwd|secret|api[_-]?key)"[[:space:]]*:|bearer[[:space:]]+[A-Za-z0-9._~+/=-]{12,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
if rg --hidden --no-ignore -l -i --glob '**/receipts/*.txt' "$PATTERN" "$ROOT/.ufo/waves"; then
  printf '%s\n' 'receipt secret sweep: FAIL' >&2
  exit 1
else
  rc=$?
  test "$rc" -eq 1 || exit "$rc"
fi
```

This is an auditable known-pattern sweep, **not a proof that arbitrary secret-looking argv values are absent**. No generic scanner can prove that for unconstrained strings. The hard guarantee requires producer-side argv sanitization/allowlisting; then this sweep detects regressions and common credential formats. The Gitleaks CLI was available locally as version `8.30.1`; the proposed sweep itself was not executed.

### 2. 128-bit nonce collision risk is negligible at lane volume — INFO / no finding

The birthday approximation is `P(collision) ≈ n(n−1)/(2·2^128)`. The local lane currently has 32 files matching `*/receipts/*.txt`; plan.md §C1 A2 (lines 54–57) calls for three more, so use `n=35`: `P ≈ 1.7485478468481527e−36` (about 1 in `5.72e35`). For scale, the bound is `1.4693664691599209e−27` at one million receipts and `1.4693679370584914e−21` at one billion. This is adequate for the stated lane volume, assuming the specified `crypto.randomBytes(16)` produces independent CSPRNG bytes. The source code was unavailable, so the implementation of that assumption was not inspected.

### 3. Sidecar does not authenticate a receipt against a directory writer — MEDIUM if hostile writers are in scope; otherwise an explicit trust assumption

**Exploit path:** an attacker with write access to `receipts/` can edit the receipt JSON, recompute its public inner SHA-256 digest, and rewrite the adjacent `.sha256` file. Verification then has no independent secret/key to distinguish the forged pair from a genuine pair. A writer can also delete/replace ledger files, defeating nonce-reuse checks over the remaining visible corpus. The sidecar detects accidental/single-file changes only while the trusted sidecar remains unchanged.

**Scope:** plan.md §C1 lines 45–48 calls receipts “author-attested” and disclaims temporal proof; it does not explicitly state that malicious writers to the receipt directory are trusted. So protection against such a writer is not established by this design. If receipts are only checksums for trusted authors and accidental damage, this is consistent with the stated ceiling. If a `VALID` result is intended to withstand an adversarial contributor who can write `receipts/`, it is a trust-boundary gap.

**Smallest remediation:** explicitly document/enforce trusted-writer-only permissions for the receipt and ledger directory, or authenticate each receipt with a signature/MAC whose key is unavailable to directory writers (and preserve the ledger in append-only or separately protected storage). An unkeyed sidecar beside the receipt is not that control.

## Evidence / commands

- Read frozen contract: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md`, §C1 lines 26–48 and A2 lines 54–57.
- Expected artifact check: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs` — not found; round-51 `build/` directory — not found.
- Command run: `find /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves -type f -path '*/receipts/*.txt' -print | wc -l` → `32`.
- Command run: `node -e 'for (const n of [35,1e6,1e9,1e12]) console.log(`${n}: p≈${n*(n-1)/(2*2**128)}`)'` → `35: p≈1.7485478468481527e-36`; `1000000: p≈1.4693664691599209e-27`; `1000000000: p≈1.4693679370584914e-21`; `1000000000000: p≈1.4693679385263901e-15`.
- Tool availability: `gitleaks version` → `8.30.1`; no scanner run and no receipt-clean claim is made.
- No artifact SHA-256 is available: the specified delivered code file was absent at review time.
