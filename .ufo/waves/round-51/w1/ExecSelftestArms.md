# ExecSelftestArms — receipt-attest selftest case list (kumitate round 51, wave 1)

**Seat:** `kumitate-r51.PhysicalGamefowl` · **Item:** ExecSelftestArms
**Lane:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only except this report and
`.ufo/waves/round-51/build/ExecSelftestArms/`)
**Date:** 2026-10-23

## What I built

1. **`build/ExecSelftestArms/selftest-plan.md`** — the deliverable: an independent **28-case**
   list (≥12 asked, ≥10 required by the contract), each case named, with its input-fixture
   description and expected verdict. Contract arms marked `CONTRACT ARM`:
   flake-injection→`RECEIPT: REPLAY` (C05), sidecar-mismatch→`RECEIPT: TAMPERED` (C06),
   nonce-reuse→`RECEIPT: REPLAY` (C08/C08b/C27), plus the frozen A3 prelude forgery (C07).
2. **`build/ExecSelftestArms/run-cases.mjs`** — the case list made **executable**: a black-box
   harness that drives *any* implementation of `kumitate-receipt-attest-v1` through all 28 cases
   using only the documented CLI (`run`, `verify`, `--selftest`). It never imports the candidate.
3. **`build/ExecSelftestArms/mutants.mjs`** — the discrimination battery: 16 literal single-site
   mutants plus the round's declared static-forger stub, each re-run through the full list.
4. **`build/ExecSelftestArms/scratch/receipt-attest.mjs`** — a scratch reference implementation
   written by this seat, used as the oracle because ExecInstrument's file did not exist.
5. **Transcripts** — `scratch/cases-vs-scratch.txt`, `scratch/mutants-vs-scratch.txt`,
   `scratch/selftest-own.txt`.

Nothing under `scripts/`, `corpus/`, `SCORECARD.md`, `SKILL.md` or any counter was touched. No
git/jj mutation was run. The frozen counters and `plan.md` were read only.

## Does ExecInstrument's delivered script exist?

**No.** Checked twice during this seat:

```
$ ls -la .ufo/waves/round-51/build/ExecInstrument/
ls: cannot access '.../build/ExecInstrument/': No such file or directory
```

(checked at ~23:01 UTC and again at ~23:09 UTC; the `build/` directory existed with
`ExecBaseCounter/`, `ExecSelftestArms/`, `LabratClocks/`, `LabratM2Replay/`,
`ScoutBaselineHar/`, `ScoutClockSource/`, `ScoutRandomSource/`, `ScoutReceiptCorpora/` — but no
`ExecInstrument/`.) So, per the item's instruction, I ran my cases against **my own scratch
implementation** and report which cases fail.

## Results against the scratch reference implementation

```
$ node .ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs \
    .ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs
CASES: 28/28 .ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs
exit 0
```

**Cases that failed: none (28/28 PASS).** Full per-case transcript in
`build/ExecSelftestArms/scratch/cases-vs-scratch.txt`.

One case, **C19**, failed on the first attempt. The fault was in **my harness**, not in the
contract or the implementation: C19 recomputes the expected stderr hash but captured the shell's
stdout instead of its stderr (`err.stdout` where `err.stderr` was required). Fixed in the
harness; **no contract expectation was weakened to make it pass** — the case still asserts that
the recorded `stderr_sha256` equals the sha256 of the bytes the command really wrote.

The scratch reference's own `--selftest` (12 cases, contract-shaped) also passes:

```
ATTEST_CASE: healthy-run-valid PASS
ATTEST_CASE: sidecar-gnu-format PASS
ATTEST_CASE: distinct-nonces PASS
ATTEST_CASE: flake-injection-replay PASS
ATTEST_CASE: sidecar-mismatch-tampered PASS
ATTEST_CASE: prelude-rewrite-tampered PASS
ATTEST_CASE: ledger-nonce-reuse-replay PASS
ATTEST_CASE: ledger-distinct-valid PASS
ATTEST_CASE: usage-exit-64 PASS
ATTEST_CASE: unreadable-exit-2 PASS
ATTEST_CASE: no-env-leak PASS
ATTEST_CASE: canonical-json-sorted PASS
ATTEST_SELFTEST: PASS
exit 0
```

## The part that decides whether the list is worth anything: does it discriminate?

A list that passes every broken implementation is decoration. `mutants.mjs` applies 16 literal
single-site mutants to the scratch reference and re-runs the whole list over each:

```
M01 KILLED: inner-digest check disabled (accept any digest) [C05,C16,C20]
M02 KILLED: sidecar comparison disabled (accept any sidecar) [C06,C07,C20]
M03 KILLED: missing sidecar accepted as VALID [C17]
M04 KILLED: ledger nonce check disabled [C08,C08b,C20,C27]
M05 KILLED: verdict literal swapped: TAMPERED -> REPLAY [C17]
M06 KILLED: clock-order check disabled [C22]
M07 KILLED: digest computed over the body WITH the digest field [C01,C06,C07,C09,C10,C17,C18,C20,C23]
M08 KILLED: canonical JSON no longer key-sorted [C05,C15,C16,C20,C21]
M09 KILLED: nonce drawn from a constant (not random) [C03,C09,C20]
M10 KILLED: nonce truncated to 8 hex chars (32 bits) [C04]
M11 KILLED: exit code not recorded (always 0) [C18]
M12 KILLED: stdout/stderr hashes replaced by a constant [C19]
M13 KILLED: usage error exits 0 instead of 64 [C11,C20]
M14 KILLED: unreadable receipt exits 1 instead of 2 [C12,C20]
M15 KILLED: environment leaked into the receipt body [C14,C20,C24]
M16 KILLED: ledger skips the subject file by CONTENT [C08,C08b,C09,C20,C27]
MUTANTS: 16/16 killed; survivors=none
STATIC_FORGER: REJECTED (27 cases fail)
exit 0
```

**16/16 mutants killed, zero survivors.** Each mutant is caught by the case its own defect
implies — no case is decorative.

The round's declared **do-nothing control** (a stub that only prints the verdict strings, no
logic) is rejected by **27 of 28** cases. The single case it survives is **C20**, the
selftest-shape arm — which is precisely the arm a stub is built to satisfy. That is the honest
limit of the list stated up front, and it is why the frozen counter does not rely on the
selftest alone: **A1** requires real execution and **A3** requires genuine digest binding.
The list closes that gap *for the shipped file* (C07/C16/C25 are genuine-binding cases a stub
cannot satisfy).

## Divergences to watch when ExecInstrument's script lands

My list is the reference; a divergence is a question for the L1, not a defect claim. Four places
where the contract leaves the implementation free, and how my cases read them:

* **AMBIGUITY-1 — check order when both layers mismatch.** The contract fixes the verdict *per
  failure kind* but not the *order of evaluation*: a receipt with a broken inner digest **and** a
  stale sidecar reads `REPLAY` under inner-first and `TAMPERED` under sidecar-first. The frozen
  probe does not decide it (A3 rewrites only the prelude, leaving the inner digest valid, so A3
  reads `TAMPERED` under either order). **My reading: inner-digest first** — it is the semantic
  binding and the more specific verdict. C05 is order-independent by construction (its sidecar is
  recomputed, so only the inner binding is broken); C21 requires a rejection but accepts either
  literal.
* **AMBIGUITY-2 — no verdict literal for a clock contradiction.** The contract assigns `REPLAY` to
  "inner-digest mismatch or nonce reuse" and `TAMPERED` to "sidecar mismatch"; a
  `wall_end < wall_start` receipt whose digest *and* sidecar were both recomputed matches
  neither. **My reading: `RECEIPT: REPLAY`** (same class as the digest mismatch). C22 requires
  only "rejected, exit 1", so it passes under either literal — the case pins the behaviour without
  over-constraining the wording.
* **AMBIGUITY-3 — the monotonic-span field name.** The contract names the concept ("a monotonic
  span (`process.hrtime.bigint()`)") but not the JSON key. C26 accepts any of `mono_ns`,
  `mono_span_ns`, `monotonic_ns`, `mono`, `span_ns`, `monotonic_span_ns` and requires one to
  exist. **Recommendation: the L1 should pin one name** — the round-51 receipts are committed
  artefacts that later rounds will parse.
* **Field names the frozen probe reads by name.** A2 reads `j.nonce` and `j.wall_start`; C26
  requires those exact names plus `argv`, `digest`, `exit`, `stdout_sha256`, `stderr_sha256`,
  `wall_end`.

Two more behaviours my list pins that a plausible implementation would get wrong and the probe
would **not** catch:

* **C23 — the verdict must be the *last* output line.** The frozen probe takes
  `.split('\n').pop()` of stdout+stderr; an extra trailing line after the verdict breaks A2/A3.
* **C17 — a missing sidecar must not read `VALID`.** A missing attestation is a tamper.

## Recommendation to ExecInstrument and to the L1

The shipped `--selftest` needs ≥10 cases. Recommended **core 12** (each contract-named behaviour
plus the three probe-scored shapes): C01 · C05 · C06 · C07 · C08 · C09 · C10 · C11 · C12 · C16 ·
C17 · C20.

The other 16 cases are the **falsifier's battery** — cheap, hermetic, black-box — and are better
run as `node run-cases.mjs <shipped-file>` against the shipped instrument than re-implemented
inside it. Either reading is acceptable; what matters is that the full 28 are run against the
shipped file before the close commit. `run-cases.mjs` and `mutants.mjs` are ready to use as-is.

## Reproduce

```
node .ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs <path>/receipt-attest.mjs
node .ufo/waves/round-51/build/ExecSelftestArms/mutants.mjs <path>/receipt-attest.mjs \
     .ufo/waves/round-51/build/ExecSelftestArms/run-cases.mjs
```

Both are hermetic: `mktemp` directories only, no network, no dependency on the lane checkout or
on any corpus file.

## Deliverable hashes

```
59a1f8975db22712602422401d51d1e5a9c074e27b72147f9978641a48882cf0  build/ExecSelftestArms/selftest-plan.md
f3818daff54243e43edd67d643153a97736bdcb5d423ca7ad1ca1d1ae0388da5  build/ExecSelftestArms/run-cases.mjs
14fb4ae61d27c8447265a095ecd04e77951f6bc7c8f00be807eb24aae69d8390  build/ExecSelftestArms/mutants.mjs
f39c6b51f137ac8cdd94eda439a82bb4cbab8c53a719cc1282f73ea179677ff4  build/ExecSelftestArms/scratch/receipt-attest.mjs
5329199ba77a9888a616135ebd48feaf527af1a7555a12a7654787ff73993539  build/ExecSelftestArms/scratch/cases-vs-scratch.txt
f076573dcedf34039a5d010c8bfd18b6431aafcb66583b637a1e7f16a8f35076  build/ExecSelftestArms/scratch/mutants-vs-scratch.txt
```

## Boundaries and residual risk

* **No shipped artefact was produced.** My scratch implementation is a *reference oracle*, not
  the instrument; ExecInstrument's file is the deliverable and the L1's integration target. If
  the L1 ships the scratch file instead, it must first be re-scored with `run-cases.mjs` and
  `mutants.mjs` (both commands above) — and it would then need `pin.receipt-attest` to be the
  sha256 of the *shipped* bytes, not of my scratch copy.
* **The divergence report requested by the item is not yet possible** — ExecInstrument's script
  did not exist. This report therefore gives the scratch-reference result plus the exact
  divergence criteria; re-running `run-cases.mjs` against the delivered file produces the
  divergence list mechanically, with no re-design needed.
* **Nothing was verified against the frozen A51 counter**, because the counter scores *committed
  bytes at a rev* and this seat has no commit (`git`/`jj` mutations are out of bounds for a leaf
  seat). The counter-relevant shapes are covered by C05/C06/C07/C08/C11/C12/C13/C23.
* **The 300 s span requirement of A2 is not exercised here** — it is an author-scheduled property
  of the committed receipts, not a property of the instrument, and no case can produce it
  hermetically. Flagged for the L1 as a limit of the plan, not of this list.
* **No tooling was installed or upgraded** by this seat; `node v24.21.0` and `sha256sum 0.8.0`
  (coreutils) were already present and were the only dependencies used.
