# selftest-plan.md — receipt-attest hermetic case list (contract `kumitate-receipt-attest-v1`)

Seat **ExecSelftestArms**, kumitate round 51 wave 1. Deliverable for the item
*"Independently design the selftest case list for receipt-attest"*.

This is an **independent** case list: it was written from `plan.md` §C1 and the frozen counter
`.ufo/waves/round-51/probe/attest51-probe.mjs` only, before and independently of
`build/ExecInstrument/receipt-attest.mjs` (which did not exist when this list was written).

## What this seat delivers

| Artefact | Path (relative to the lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin`) | Purpose |
|---|---|---|
| This case list | `.ufo/waves/round-51/build/ExecSelftestArms/selftest-plan.md` | the 28 named cases, fixture + expected verdict each |
| Executable harness | `.ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs` | drives **any** implementation of the contract through this list, black-box over the documented CLI only |
| Discrimination battery | `.ufo/waves/round-51/build/ExecSelftestArms/mutants.mjs` | proves the list has discriminating power (16 literal mutants + the static-forger stub) |
| Scratch reference impl | `.ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs` | the oracle the list was exercised against before the shipped instrument existed — **not** the shipped instrument |
| Transcripts | `.ufo/waves/round-51/build/ExecSelftestArms/scratch/cases-vs-scratch.txt`, `.../scratch/mutants-vs-scratch.txt` | verbatim run outputs |

`run-cases.mjs` is the reusable part: `node run-cases.mjs <path-to-receipt-attest.mjs>` scores
any candidate, including ExecInstrument's shipped file, with the same 28 cases. It never imports
the candidate — every case goes through `run` / `verify` / `--selftest` as a child process, so a
candidate cannot satisfy a case by exposing internals.

## Contract arms this list must cover

`plan.md` §C1 requires the `--selftest` suite to contain **≥10 hermetic cases, each printing
PASS/FAIL**, and to include specifically:

* a **flake-injection** case whose doctored receipt must read **`RECEIPT: REPLAY`** → case **C05**
* a **sidecar-mismatch** case that must read **`RECEIPT: TAMPERED`** → case **C06**

Both are marked `CONTRACT ARM` below. The frozen probe's A3 arm (prelude-only rewrite) is
additionally pinned by **C07**, because A3 is scored against a *committed* file, not the
selftest.

Verdict vocabulary from the contract: `RECEIPT: VALID` exit 0 · `RECEIPT: REPLAY` exit 1
(inner-digest mismatch or nonce reuse) · `RECEIPT: TAMPERED` exit 1 (sidecar mismatch) ·
usage exit 64 · unreadable exit 2.

## The case list — 28 named cases

Fixture column: *"fixture"* = the on-disk input state a case constructs before invoking the
implementation. "genuine receipt" always means a receipt produced by the implementation's **own**
`run` subcommand (never a hand-written file), so each case exercises the real producer.

### A. The happy path and the producer

| # | Name | Fixture | Expected verdict |
|---|---|---|---|
| **C01** | `healthy-run-verifies-valid` | genuine receipt from `run --out B -- /bin/sh -c "printf hello"`; then `verify B.txt` | `RECEIPT: VALID`, exit 0 |
| **C02** | `sidecar-is-gnu-sha256sum-format` | genuine receipt; sidecar `B.txt.sha256` on disk | sidecar matches `/^[0-9a-f]{64} [ *]\S+$/` **and** `sha256sum -c B.txt.sha256` (run in the receipt's directory) exits 0 |
| **C03** | `two-runs-distinct-nonces` | two independent genuine receipts | their `nonce` values differ |
| **C04** | `nonce-is-128-bit-hex` | one genuine receipt | `nonce` matches `/^[0-9a-f]{32}$/` (16 bytes of `crypto.randomBytes`) |
| **C15** | `json-line-keys-sorted-canonical` | one genuine receipt | the JSON line's keys are in ascending order (canonical JSON) |
| **C18** | `nonzero-command-exit-recorded-and-still-valid` | genuine receipt from `run --out B -- /bin/sh -c "exit 7"` | `exit` field == 7 **and** `verify` still reads `RECEIPT: VALID` exit 0 (the receipt attests the *invocation*, not its success) |
| **C19** | `stdout-stderr-hashes-match-actual-bytes` | genuine receipt from a command writing to both streams | `stdout_sha256` / `stderr_sha256` equal the sha256 of the bytes the command actually produced |
| **C24** | `receipt-has-no-secret-or-env-field` | one genuine receipt | no JSON key matching `/env|secret|token|password|key$/i`; exactly two non-empty lines; line 1 starts with `run-at:` |
| **C14** | `no-environment-material-in-receipt` | genuine receipt produced with `KUMITATE_SENTINEL_SECRET=zSENTINEL42` set in the child's environment | the sentinel string does **not** appear anywhere in the receipt bytes (Q42 class: no env is recorded) |
| **C26** | `field-names-match-the-frozen-probe-contract` | one genuine receipt | the body exposes `argv`, `digest`, `exit`, `nonce`, `stderr_sha256`, `stdout_sha256`, `wall_end`, `wall_start`; `wall_start` is ISO-parseable; a monotonic-span field exists |
| **C25** | `digest-field-equals-sha256-of-canonical-json-minus-digest` | one genuine receipt | `digest` == sha256 over the canonical (recursively key-sorted) JSON of the body with `digest` removed — the exact computation `plan.md` §C1 names |

### B. The two contract arms (flake injection and sidecar mismatch)

| # | Name | Fixture | Expected verdict |
|---|---|---|---|
| **C05** | `flake-injection-inner-digest-replay` | genuine receipt whose `nonce` last byte is flipped; **the sidecar is recomputed over the doctored bytes**, so the outer layer still matches and only the inner binding is broken | `RECEIPT: REPLAY`, exit 1 — **CONTRACT ARM (flake injection)** |
| **C06** | `sidecar-mismatch-tampered` | genuine receipt with **receipt bytes untouched**; one hex nibble of the sidecar hash flipped | `RECEIPT: TAMPERED`, exit 1 — **CONTRACT ARM (sidecar mismatch)** |
| **C07** | `prelude-only-rewrite-tampered` | genuine receipt with **only** the `run-at:` prelude line rewritten; JSON line and **original** sidecar kept — the exact lesson-M2 forgery | `RECEIPT: TAMPERED`, exit 1 (this is the shape frozen probe A3 scores) |

C05 deliberately recomputes the sidecar. Without that, C05 would degenerate into C07 and would
not isolate the inner-digest arm at all — the recomputation is what makes the *only* failing
signal the inner binding.

### C. The nonce ledger

| # | Name | Fixture | Expected verdict |
|---|---|---|---|
| **C08** | `ledger-rejects-nonce-reuse-on-a-byte-identical-copy` | a genuine receipt copied byte-for-byte to a second filename **in the same directory** (so inner digest VALID, sidecar VALID, clocks fine) | `RECEIPT: REPLAY`, exit 1 — **CONTRACT ARM (nonce reuse)**; the ledger arm is *isolated* here, because nothing else is wrong |
| **C08b** | `ledger-rejects-nonce-reuse-in-a-forged-body` | a forged receipt carrying the first receipt's nonce but a different `argv`, with digest and sidecar recomputed so it is internally consistent | `RECEIPT: REPLAY`, exit 1 |
| **C27** | `ledger-rejects-a-reused-nonce-from-a-different-receipt` | as C08b but the forged receipt also carries a different wall clock (2024-05-05) — the nonce alone must be the trigger | `RECEIPT: REPLAY`, exit 1 |
| **C09** | `ledger-accepts-distinct-nonces` | two genuine receipts with distinct nonces in one directory; `verify --ledger <dir>` on each | `RECEIPT: VALID`, exit 0 for both |
| **C10** | `ledger-does-not-flag-the-file-itself` | one genuine receipt living inside the directory passed to `--ledger` | `RECEIPT: VALID`, exit 0 (the ledger must skip the subject file, else A4 could never pass) |

### D. Binding completeness

| # | Name | Fixture | Expected verdict |
|---|---|---|---|
| **C16** | `inner-digest-binds-every-semantic-field` | 8 mutants of one genuine receipt — one per semantic field (`nonce`, `argv`, `exit`, `stdout_sha256`, `stderr_sha256`, `wall_start`, `wall_end`, `mono_ns`), each mutated **alone** with the sidecar recomputed | `RECEIPT: REPLAY`, exit 1 for **all 8**; any field escaping the binding is a FAIL |
| **C21** | `stale-sidecar-plus-doctored-body-is-rejected` | genuine receipt with `exit` bumped and the sidecar left stale (both layers mismatch) | a rejection, exit 1, **not** `VALID` — the literal may be `REPLAY` or `TAMPERED` depending on check order (see AMBIGUITY-1) |

### E. Error paths and exit-code hygiene

| # | Name | Fixture | Expected verdict |
|---|---|---|---|
| **C11** | `usage-error-exit-64` | invocation with no subcommand | exit 64, usage text present |
| **C12** | `unreadable-file-exit-2` | `verify` on a path that does not exist | exit 2, **no** verdict line (unreadable is never a score) |
| **C13** | `malformed-receipt-exit-2` | `verify` on a file whose content is not a receipt (no JSON line) | exit 2, no verdict line |
| **C17** | `missing-sidecar-tampered` | genuine receipt with its sidecar **deleted** | `RECEIPT: TAMPERED`, exit 1 (a missing attestation is a tamper, not a pass) |
| **C22** | `clock-contradiction-rejected` | a forged receipt with `wall_end` < `wall_start`, digest **and** sidecar recomputed (internally consistent, temporally contradictory) | a rejection, exit 1 (the contract assigns no literal verdict here — see AMBIGUITY-2) |
| **C23** | `verify-uses-last-line-verdict` | one genuine receipt | the **last** line of output is exactly `RECEIPT: VALID` — the frozen probe reads the last line of stdout+stderr, so an extra trailing line would break A2/A3 |
| **C20** | `selftest-arm-shape` | `--selftest` | exit 0; ≥10 distinct per-case lines each carrying PASS or FAIL; final line exactly `ATTEST_SELFTEST: PASS` |

### Summary

**28 cases** (C01…C27 plus C08b) — 8 above the ≥12 this seat was asked for, and 28 above the
contract's ≥10. Contract arms covered: flake-injection REPLAY (C05), sidecar-mismatch TAMPERED
(C06), nonce-reuse REPLAY (C08/C08b/C27), plus the A3 prelude forgery (C07).

## Ambiguities in the contract these cases surfaced

The contract does not fully determine the behaviour in three places. The list states the
expectation explicitly so the outcome is at least *decided*, and the L1 can accept the stated
reading or amend it.

* **AMBIGUITY-1 — check order when both layers mismatch.** The contract fixes the verdict
  *per failure kind* but not the *order of evaluation*. When a receipt has both a broken inner
  digest and a stale sidecar, the verdict is `REPLAY` under inner-digest-first and `TAMPERED`
  under sidecar-first. The frozen probe does not decide it: A3's doctored control rewrites
  **only** the prelude, which leaves the inner digest valid, so A3 reads `TAMPERED` under either
  order. **This seat's reading: inner-digest first** — the inner digest is the semantic binding
  and the more specific verdict; C05 (sidecar recomputed) is order-independent either way, and
  C21 accepts either literal but requires a rejection.
* **AMBIGUITY-2 — no verdict literal for a clock contradiction.** The contract enumerates
  `VALID` / `REPLAY` / `TAMPERED` and assigns `REPLAY` to "inner-digest mismatch or nonce
  reuse" and `TAMPERED` to "sidecar mismatch"; a `wall_end < wall_start` receipt whose digest
  and sidecar were both recomputed matches neither. **This seat's reading: `RECEIPT: REPLAY`**
  (it is a semantic-field contradiction, the same class as the digest mismatch). C22 requires only
  "rejected, exit 1" so it passes under either literal — the case pins the *behaviour* without
  over-constraining the wording.
* **AMBIGUITY-3 — the monotonic-span field name.** The contract names the *concept*
  ("a monotonic span (`process.hrtime.bigint()`)") but not the JSON key, while the frozen probe
  reads `j.nonce` and `j.wall_start` by name and A2 does not read the span at all. C26 accepts
  any of `mono_ns` / `mono_span_ns` / `monotonic_ns` / `mono` / `span_ns` /
  `monotonic_span_ns` and requires one to exist. **Recommendation to the L1: pick one and pin it
  in the entry's clause list** — the shipped instrument's key should be stable across the round,
  since the round-51 receipts are committed artifacts that later rounds will parse.

Two further contract points the list pins, because a plausible implementation would get them
wrong and the probe would not catch them: the **verdict must be the last output line** (C23 — the
probe takes `.split('\n').pop()`), and a **missing sidecar must not read `VALID`** (C17).

## Evidence — the list was executed, not just written

`build/ExecInstrument/receipt-attest.mjs` **did not exist** when this seat ran (checked at
2026-10-23 ~23:0x UTC: `ls .ufo/waves/round-51/build/ExecInstrument/` → "No such file or
directory"). Per the item's instruction, the cases were therefore run against a **scratch
reference implementation written by this seat**:
`.ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs`.

### Run 1 — the case list against the scratch reference

```
$ node .ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs \
      .ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs
CASE C01 healthy-run-verifies-valid: PASS
CASE C02 sidecar-is-gnu-sha256sum-format: PASS
CASE C03 two-runs-distinct-nonces: PASS
CASE C04 nonce-is-128-bit-hex: PASS
CASE C05 flake-injection-inner-digest-replay: PASS
CASE C06 sidecar-mismatch-tampered: PASS
CASE C07 prelude-only-rewrite-tampered: PASS
CASE C08 ledger-rejects-nonce-reuse-on-a-byte-identical-copy: PASS
CASE C08b ledger-rejects-nonce-reuse-in-a-forged-body: PASS
CASE C25 digest-field-equals-sha256-of-canonical-json-minus-digest: PASS
CASE C09 ledger-accepts-distinct-nonces: PASS
CASE C10 ledger-does-not-flag-the-file-itself: PASS
CASE C11 usage-error-exit-64: PASS
CASE C12 unreadable-file-exit-2: PASS
CASE C13 malformed-receipt-exit-2: PASS
CASE C14 no-environment-material-in-receipt: PASS
CASE C15 json-line-keys-sorted-canonical: PASS
CASE C16 inner-digest-binds-every-semantic-field: PASS
CASE C17 missing-sidecar-tampered: PASS
CASE C18 nonzero-command-exit-recorded-and-still-valid: PASS
CASE C19 stdout-stderr-hashes-match-actual-bytes: PASS
CASE C20 selftest-arm-shape: PASS
CASE C21 stale-sidecar-plus-doctored-body-is-rejected: PASS
CASE C22 clock-contradiction-rejected: PASS
CASE C23 verify-uses-last-line-verdict: PASS
CASE C24 receipt-has-no-secret-or-env-field: PASS
CASE C26 field-names-match-the-frozen-probe-contract: PASS
CASE C27 ledger-rejects-a-reused-nonce-from-a-different-receipt: PASS
CASES: 28/28 .ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs
exit 0
```

**Cases that failed against the scratch reference: none (28/28 PASS).** One case (C19) failed
on the first attempt and the fault was in the *harness*, not the contract: the harness had
captured the shell's stdout instead of its stderr when recomputing the expected stderr hash.
Fixed; no contract expectation was weakened to make it pass.

### Run 2 — does the list discriminate? (the part that matters)

A list that passes every broken implementation is decoration. `mutants.mjs` applies 16 literal
single-site mutants to the scratch reference and re-runs the whole list over each:

```
M01 KILLED: inner-digest check disabled (accept any digest) [killed by C05,C16,C20]
M02 KILLED: sidecar comparison disabled (accept any sidecar) [killed by C06,C07,C20]
M03 KILLED: missing sidecar accepted as VALID [killed by C17]
M04 KILLED: ledger nonce check disabled [killed by C08,C08b,C20,C27]
M05 KILLED: verdict literal swapped: TAMPERED -> REPLAY [killed by C17]
M06 KILLED: clock-order check disabled [killed by C22]
M07 KILLED: digest computed over the body WITH the digest field (self-referential) [killed by C01,C06,C07,C09,C10,C17,C18,C20,C23]
M08 KILLED: canonical JSON no longer key-sorted [killed by C05,C15,C16,C20,C21]
M09 KILLED: nonce drawn from a constant (not random) [killed by C03,C09,C20]
M10 KILLED: nonce truncated to 8 hex chars (32 bits) [killed by C04]
M11 KILLED: exit code not recorded (always 0) [killed by C18]
M12 KILLED: stdout/stderr hashes replaced by a constant [killed by C19]
M13 KILLED: usage error exits 0 instead of 64 [killed by C11,C20]
M14 KILLED: unreadable receipt exits 1 instead of 2 [killed by C12,C20]
M15 KILLED: environment leaked into the receipt body [killed by C14,C20,C24]
M16 KILLED: ledger skips the subject file by CONTENT (ignores other files with same nonce) [killed by C08,C08b,C09,C20,C27]
MUTANTS: 16/16 killed; survivors=none
STATIC_FORGER: REJECTED (27 cases fail: C01,C02,C03,C04,C05,C06,C07,C08,C08b,C25,C09,C10,C11,C12,C13,C14,C15,C16,C17,C18,C19,C21,C22,C23,C24,C26,C27)
exit 0
```

**16/16 mutants killed, zero survivors.** Every mutant is caught by the case its own defect
implies, and the round's declared do-nothing control — a stub that only prints the verdict
strings — is rejected by 27 of the 28 cases (the one it survives is C20, the selftest-shape arm,
which is exactly the arm a stub is designed to satisfy; that is why A1 requires *real execution*
and A3 requires *genuine digest binding*).

## What the shipped instrument's `--selftest` should contain

The contract asks the shipped `--selftest` for ≥10 cases. The recommendation to ExecInstrument
is that it adopt this list's **core 12**, which cover every contract-named behaviour and the
three probe-scored shapes:

C01 · C05 (flake→REPLAY) · C06 (sidecar→TAMPERED) · C07 (prelude→TAMPERED) · C08 (nonce
reuse→REPLAY) · C09 · C10 · C11 · C12 · C16 · C17 · C20.

The remaining 16 cases above are the *falsifier's* battery: they are cheap, hermetic and
black-box, so they are better run by `run-cases.mjs` against the shipped file than re-implemented
inside it. Both readings are legitimate; what matters is that the shipped `--selftest` covers the
contract arms and that the full list is run against the shipped file before the close commit.

## Reproduce

```
# score any implementation against this list
node .ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs <path>/receipt-attest.mjs

# prove the list still discriminates
node .ufo/waves/round-51/build/ExecSelftestArms/mutants.mjs <path>/receipt-attest.mjs \
     .ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs
```

Both are hermetic: temporary directories only, no network, no writes outside `mktemp` paths, no
dependency on the lane checkout or on any corpus file.
