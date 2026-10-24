# Invocation attestation — why receipts are built the way they are

source: S100 https://man7.org/linux/man-pages/man2/clock_gettime.2.html (DESCRIPTION,
CLOCK_MONOTONIC paragraph; man-pages 6.19, page 2026-03-07; fetched 2026-10-24T01:59:31Z;
body sha256 7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69);
S101 https://man7.org/linux/man-pages/man2/getrandom.2.html (DESCRIPTION paragraph 2;
man-pages 6.19, page 2026-02-08; fetched 2026-10-24T01:59:28Z; body sha256
366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d)
verified-at: 2026-10-23
recheck: 180d

Round 50 repaired three byte-identical receipts (lesson M2, `.ufo/waves/round-50/ReRunB49-1..3`)
by re-issuing them, but the *detection* gap stayed open: nothing could machine-distinguish a
genuine invocation record from a copied body with a rewritten `run-at:` prelude — frozen R4
scored exactly that forgery `PASS … body_distinct=1`. This entry records the design that
closes the detection gap and the ceiling that stays open.

## Design

- A receipt is a display `run-at:` prelude plus ONE canonical-JSON line; a GNU `sha256sum`
  text-mode sidecar covers the whole file, prelude included. Rewriting only the prelude
  (the lesson-M2 move) breaks the sidecar → `RECEIPT: TAMPERED`. Evidence: the round-51
  selftest prelude-only arm and frozen arm A3 (`receipt:.ufo/waves/round-50/ReRunB49-2.txt@sha256:96a01c840f91df0bcef0a065137aa9ace8067d832808fe67b6c1b2c34fb136ee` is one of the three M2 replacements; `.ufo/waves/round-50/close/G50-ab3c64e9.txt@sha256:7bba23f13f6afa4d1381c753ecc593e2ff99925ecb3d0f4cc8e8d26c8bd413c9` is the round-50 guard receipt whose ledger class this round re-instruments).
- The inner `digest` field binds every semantic field (argv, exit, stdout/stderr sha256,
  wall ISO start/end, monotonic span, nonce) as sha256 over the canonical JSON with the
  `digest` field removed (parse, drop, sort keys recursively, one line — semantic
  re-canonicalization, not textual excision). Corrupting any field, or the digest itself,
  reads `RECEIPT: REPLAY`. Evidence: frozen arm A3d and the instrument's selftest case 08.
- CLOCK_MONOTONIC is "not affected by discontinuous jumps in the system time" (S100,
  22-word quote), so the monotonic span (`mono_span_ms` from `process.hrtime.bigint()`)
  stays ordered when an operator steps the wall clock; the prelude is separately checked
  against the body's own wall window, so a re-dated prelude fails even if the sidecar were
  recomputed. Frequency adjustments still apply to CLOCK_MONOTONIC — which is why the span
  is an ordering witness, never a temporal proof.
- The nonce is 128 bits from `crypto.randomBytes(16)`; Node's bytes come from the kernel
  random interface `getrandom()` draws "from the urandom source" (S101, 17-word quote).
  Ledger freshness: `--ledger` flags a nonce only when another receipt binds the SAME nonce
  to a DIFFERENT record digest; byte-identical duplicates are exempt (addendum item 4 —
  the literal reading made frozen A4 unpassable, found by RevInstrumentContract F1).
- Worked M2 forgery end-to-end: `receipt:.ufo/waves/round-51/receipts/attest-run-1.txt@sha256:7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd`
  is the first instrument-produced receipt, wrapping `bind-oracle --selftest`.
- The instrument is the judged object: `receipt:scripts/receipt-attest.mjs@sha256:44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
  ships 27 selftest cases (flake-injection → REPLAY; sidecar mismatch → TAMPERED; ledger
  exemption; missing sidecar never VALID), 15/15 seat-run literal mutants killed.
- Frozen predicate: `receipt:.ufo/waves/round-51/probe/attest51-probe.mjs@sha256:73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`
  (rule A51, v3r6) scores nine checks including probe-issued challenge arms (A2c argv +
  stdout-hash binding, A3c live prelude-tamper, A4c same-nonce/different-digest ledger
  REPLAY) that no verdict-printing stub can pass — the falsified v2 kill rule repaired
  per CritC1.
- Frontier companion: `receipt:.ufo/waves/round-51/probe/doctrine51-probe.mjs@sha256:f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0`
  (rule D51) binds this entry's clauses to committed bytes.
- Before-state, measured: `receipt:.ufo/waves/round-51/base/attest-base-v3r6.txt@sha256:b0fb355869d27549fa1e4601d3ef7dfff638878f380639c9732d38decb162adf`
  records `ATTEST_UNMET held=0/9` at base `c90b9de9` exit 1.
- Receipt count and span are counted, not asserted: 3 round-51 receipts, distinct nonces,
  sha256 pairwise distinct, span ≥ 300 s (frozen arm A2) — the same author-scheduled
  invocation-independence class the lane has used since R50-4, honestly labelled.
- Secret hygiene: receipts record argv verbatim and never the environment; wrap only lane
  gates whose argv is public (the sentinel's F4 finding) — a receipt must be publishable
  by construction.
- Zero-run minting stays possible by any author of the tree (RevengerGap F3): attestation
  proves record integrity and ledger nonce freshness, NOT temporal truth. Q39's ceiling
  stands verbatim: receipts are author-attested invocation records, not cryptographic
  temporal proof.
