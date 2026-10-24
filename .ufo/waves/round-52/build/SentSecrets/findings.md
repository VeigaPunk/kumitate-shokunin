# SentSecrets — round 52 security review

## Axes
- **Confidentiality:** secret/environment reach into receipt bytes.
- **Collision safety:** nonce birthday risk at planned ledger volume.
- **Receipt authenticity:** what a receipt-directory writer can forge.

## Findings

### HIGH — Raw command arguments can put secrets in cleartext receipts
- **Exploit path:** invoke `receipt-attest run --out … -- tool --token "$TOKEN"`; `doRun` stores the complete `cmd` array as `argv`, so the expanded value is serialized verbatim. This can also happen when a secret is embedded in a shell `-c` argument. Receipts committed or shared outside the caller's trust boundary disclose it.
- **Evidence:** `scripts/receipt-attest.mjs:183-184,192,215-224` parses and runs the command, inheriting the caller environment by default, and records `argv: cmd`; `:47-49` says no secret material is written, but that blanket statement is not true for arbitrary arguments. The selftest at `:704-716` checks one environment sentinel and `PATH=` only; it does not exercise a secret argument. `plan.md:157-165` does specify public gate argv for the three planned runs, but those round-52 receipt files were absent at inspection.
- **Impact:** a raw credential passed on argv is disclosed, independently of the environment not being serialized as a separate field. Captured stdout/stderr are SHA-256 hashes, not raw output; a hash of a low-entropy secret output can still be tested offline against guesses.
- **Smallest remediation:** for the round-52 close, enforce the exact public argv allowlist in the sweep below and never pass secrets in argv. For a global “never secret material” guarantee, do not persist unrestricted raw argv (or limit the instrument to a fixed public-command policy); a generic regex cannot reliably redact arbitrary secrets.

### MEDIUM — v1 verifier accepts extra record fields, including secret-bearing fields
- **Exploit path:** a producer or writer adds e.g. an `env`/credential field to the JSON record, recalculates the unkeyed `digest` and receipt sidecar, and supplies otherwise valid required fields and clocks. v1 `shapeError` checks required field types but does not reject unknown keys; `verify` can consequently accept a self-consistent receipt carrying that extra data.
- **Evidence:** v1 `SEMANTIC_FIELDS` is listed at `scripts/receipt-attest.mjs:134`, but `shapeError` at `:136-147` has no exact-key check. `digestOf` hashes the whole record except `digest` (`:105-110`), while the sidecar is an ordinary SHA-256 (`:150-160`); neither is a secret-key authenticator. The frozen v2 contract explicitly requires the whitelist and says unknown fields are UNREADABLE (`plan.md:71-78`).
- **Impact:** accidental or malicious extra fields can carry plaintext environment/secret material and still read VALID under v1 after both hashes are recomputed.
- **Smallest remediation:** verify the delivered v2 implementation actually enforces the frozen exact-key whitelist before accepting the digest; do not rely on the v1 selftest's sentinel case for this.

### MEDIUM — Receipt hashes do not authenticate against a writer of receipts/
- **Exploit path:** a writer able to modify receipt `.txt` files and sidecars can replace permitted fields with fabricated argv/exit/timestamps/output hashes, choose a fresh nonce, recompute the canonical inner SHA-256 and the sidecar SHA-256, and leave a structurally valid pair. A verifier reading those bytes has no key or external trust anchor with which to distinguish the forgery. The frozen A52 B2 check verifies each pair, distinct nonce/file hashes, and ≥300 s body-clock span, but does not bind `argv` to the three expected gate commands (`attest52-probe.mjs:181-210`). If the attacker can only alter a post-commit working copy while checks use the frozen Git revision, archive-based checks are protected from that working-tree-only edit; influencing the committed/selected revision or a live filesystem verifier is the required path.
- **Evidence:** the v1 format uses unkeyed `digestOf` plus an unkeyed sidecar (`receipt-attest.mjs:105-110,150-160`); the plan states the receipt form/digest/sidecar are unchanged in v2 (`plan.md:67-68`). The v1 header explicitly limits receipts to author-attested records, not cryptographic proof of time (`receipt-attest.mjs:42-45`).
- **Impact:** receipt verification proves internal consistency and detects stale/accidental edits or nonce reuse, not that a command ran. A sufficiently privileged writer can forge a receipt accepted by the same verifier; v2 has the same threat model as v1 unless a signature or external trust anchor is added.
- **Smallest remediation:** keep receipt and sidecar write access exclusive to the trusted receipt producer until commit, and state the author-attestation boundary. If receipts must resist their directory's writer, add a signature whose key is not writable/readable by that attacker and verify it from a trusted key source.

### REVIEW BLOCKER — Delivered v2 and round-52 receipts were not present
- **Exploit path:** not a demonstrated exploit; this is an evidence gap. At inspection, the only `scripts/receipt-attest*` file was `receipt-attest.mjs`, whose header/`CONTRACT` still say v1, and `.ufo/waves/round-52/receipts/` did not exist.
- **Impact:** the v2 whitelist, argv/secret handling, stdin-hash path, and actual committed receipt contents cannot be confirmed here. No claim that the round-52 sweep passes is made.
- **Smallest remediation:** rerun this review and the sweep against the delivered v2 source and committed receipts before closing.

## Nonce assessment — adequate for the stated lane volume

v1 uses `randomBytes(16)` (128 random bits), hex-encoded as 32 characters (`receipt-attest.mjs:74,112,219`). Round 52 plans three generated official receipts; the doctored control is a copy of run-2 with only its prelude rewritten, not a fourth random draw (`plan.md:157-165`). For 3 draws in one round, the birthday bound is `C(3,2)/2^128 = 3/2^128 ≈ 8.82×10^-39`. If the same three-draw protocol ran for 52 rounds (156 independent draws), the bound is `C(156,2)/2^128 = 12,090/2^128 ≈ 3.55×10^-35`. The copied control adds no independent nonce draw (and its modified prelude leaves its sidecar stale). Even conservatively treating four files as independent would be only `6/2^128 ≈ 1.76×10^-38` per round. No entropy increase is indicated for this workload. The v2 source itself was unavailable, so its actual nonce generation was not inspected.

## Close-time bounded secret-pattern sweep

Run from the lane root after the three receipts and doctored control are committed. This scans all four `.txt` receipt byte strings; enforces the exact planned public argv and the no-unknown-fields v2 shape for these non-stdin runs; and checks common secret markers/formats. It deliberately does **not** validate the doctored control's sidecar, which is expected to be stale; A52's tamper arm covers that. This is a bounded pattern sweep, not proof against arbitrary encoding or unknown secret formats. The command was not run because the receipt directory was absent.

```sh
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { join } from "node:path";
const dir = ".ufo/waves/round-52/receipts";
const files = [
  ["attest52-run-1.txt", ["node", "scripts/bind-oracle.mjs", "--selftest"]],
  ["attest52-run-2.txt", ["node", "scripts/sources-check.mjs"]],
  ["attest52-run-3.txt", ["node", "scripts/round-gate.mjs", "--selftest"]],
  ["attest52-run-2-replayed.txt", ["node", "scripts/sources-check.mjs"]],
];
const schema = ["argv", "digest", "exit", "mono_span_ms", "nonce", "stderr_sha256", "stdout_sha256", "wall_end", "wall_start"].sort().join("|");
const patterns = [
  /\b(?:password|passwd|secret|token|api[_-]?key|access[_-]?key|client[_-]?secret|private[_-]?key|credential|authorization|bearer|cookie|session)\b/i,
  /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
  /\b(?:sk|rk)-[A-Za-z0-9]{20,}\b/,
  /\bhttps?:\/\/[^\/\s:@]+:[^\/\s@]+@/i,
  /\b[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL|AUTH|COOKIE)[A-Z0-9_]*\s*=\s*[^\s,;"}]+/,
];
let failed = false;
for (const [name, expectedArgv] of files) {
  try {
    const text = readFileSync(join(dir, name), "utf8");
    const lines = text.split("\n");
    if (lines.length !== 3 || lines[2] !== "" || !/^run-at: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(lines[0])) throw new Error("unexpected receipt shape");
    const record = JSON.parse(lines[1]);
    if (Object.keys(record).sort().join("|") !== schema) throw new Error("unexpected fields (including environment fields) or missing field");
    if (JSON.stringify(record.argv) !== JSON.stringify(expectedArgv)) throw new Error("argv differs from the public gate allowlist");
    if (!Number.isInteger(record.exit) || !Number.isInteger(record.mono_span_ms)) throw new Error("non-integer exit/span");
    if (typeof record.nonce !== "string" || !/^[0-9a-f]{32}$/.test(record.nonce)) throw new Error("invalid nonce field");
    if (!["digest", "stderr_sha256", "stdout_sha256"].every((key) => typeof record[key] === "string" && /^[0-9a-f]{64}$/.test(record[key]))) throw new Error("invalid digest field");
    if (!["wall_start", "wall_end"].every((key) => typeof record[key] === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record[key]))) throw new Error("invalid clock field");
    const hit = patterns.find((re) => re.test(text));
    if (hit) throw new Error(`secret-pattern match: ${hit}`);
    console.log(`${name}: PASS`);
  } catch (error) {
    failed = true;
    console.error(`${name}: FAIL: ${error.message}`);
  }
}
if (failed) process.exitCode = 1;
else console.log("R52_SECRET_SWEEP: PASS (4 receipts; public argv allowlist; bounded patterns)");
'
```

**Install/update record:** none.