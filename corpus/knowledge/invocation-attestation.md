source: S100 https://man7.org/linux/man-pages/man2/clock_gettime.2.html; S101 https://man7.org/linux/man-pages/man2/getrandom.2.html
verified-at: 2026-10-24 (wave-1 fetch 01:59Z; wave-2 re-open AGREE on both body hashes)
recheck: 180d

# Invocation attestation — why receipts are built the way they are

Admitted round 51 (C2). Scope: invocation receipts for lane gate counters — what a receipt
must bind so that a copied body with a rewritten display prelude is machine-detectable, and
which ceiling stays open. S100 (man-pages 6.19, page 2026-03-07; body sha256
`7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`) and S101 (man-pages
6.19, page 2026-02-08; body sha256
`366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`).

Round 50 repaired three byte-identical receipts (lesson M2) by re-issuing them
(`receipt:.ufo/waves/round-50/ReRunB49-1.txt@sha256:aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6`,
`receipt:.ufo/waves/round-50/ReRunB49-2.txt@sha256:96a01c840f91df0bcef0a065137aa9ace8067d832808fe67b6c1b2c34fb136ee`), but the *detection* gap stayed open: nothing machine-distinguished a genuine invocation record from a copied body with a rewritten `run-at:` prelude — frozen R4 scored exactly that forgery `PASS … body_distinct=1`. This entry records the design that closes the detection gap and the ceiling that stays open.

## Design

- A receipt is a display `run-at:` prelude plus ONE canonical-JSON line; a GNU `sha256sum`
  text-mode sidecar covers the whole file, prelude included
  (`receipt:.ufo/waves/round-51/receipts/attest-run-1.txt@sha256:7b87133ae29dbc9245c71689d05428886bea934cd487ceaa0954a8ede3b2fafd`
  is the first instrument-produced receipt). Rewriting only the prelude while the sidecar
  stays stale fails verification (`RECEIPT: TAMPERED`) — measured against the shipped tool
  by `receipt:.ufo/waves/round-51/w1/LabratM2Replay.md@sha256:ad45ebe7d1eb973c2a2e9b041f962632dc31d26edee4fc5f66d0c910692c7dbe`
  rung 1.
- The inner `digest` field binds every semantic field (argv, exit, stdout/stderr sha256,
  wall ISO start/end, monotonic span, nonce) as sha256 over the canonical JSON with the
  `digest` field removed (parse, drop, sort keys recursively, one line — semantic
  re-canonicalization, not textual excision). Corrupting any field, or the digest itself,
  reads `RECEIPT: REPLAY`; the instrument's selftest case 08 pins this
  (`receipt:.ufo/waves/round-51/build/ExecInstrument/selftest.txt@sha256:ae530b7d7c61b01b1c4b0ebdcba8db1bf9f5d2ce2bcc85551f79a7343c36556d`).
- CLOCK_MONOTONIC "is not affected by discontinuous jumps in the system time" (S100,
  22-word quote), so the monotonic span (`mono_span_ms` from `process.hrtime.bigint()`)
  stays ordered when an operator steps the wall clock. The prelude is separately checked
  against the body's own wall window: a re-dated prelude more than ~60 s outside that
  window fails even with a recomputed sidecar (measured −300/+300/+600 s by
  `receipt:.ufo/waves/round-51/w2/CritA3eGap.md@sha256:pending-close`); a drift inside the
  window is indistinguishable from clock jitter — that boundary is the Q39 ceiling, not a
  defect. Frequency adjustments still apply to CLOCK_MONOTONIC, which is why the span is
  an ordering witness, never a temporal proof.
- The nonce is 128 bits from `crypto.randomBytes(16)`. S101 grounds the OS interface a
  process actually draws such bytes from on Linux: `getrandom()` "draws entropy from the
  urandom source" (17-word quote) — the page says nothing about Node specifically, and
  this entry does not claim it does (`receipt:.ufo/waves/round-51/w2/ScoutReopenS101.md@sha256:pending-close`
  re-opened the row AGREE).
- Ledger freshness: `--ledger` flags a nonce only when another receipt binds the SAME
  nonce to a DIFFERENT record digest; byte-identical duplicates are exempt (addendum
  item 4 — the literal "rejects a nonce already present" reading made frozen A4
  unpassable, found by
  `receipt:.ufo/waves/round-51/w1/RevInstrumentContract.md@sha256:d146f3327577a61d843222f4384966bf5322a674044b9d9afac5d6b418bd0265`
  F1). Reuse across distinct records answers `RECEIPT: REPLAY` in both directions
  (measured by `.ufo/waves/round-51/w2/CritLedger.md`).
- The frozen predicate now asserts the forgery classes behaviorally: rule A51 v3r6
  (nine checks) includes probe-issued challenge arms — A2c binds a fresh receipt to a
  probe-issued command's argv and output hash; A3c rewrites a live receipt's prelude;
  A4c reuses a nonce across different bodies; A3d corrupts the stored digest
  (`receipt:.ufo/waves/round-51/probe/attest51-probe.mjs@sha256:73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`).
  A verdict-printing stub cleared the v2 counter's static arms at held=5/5; against v3r6
  the same forger reads held=5/8
  (`receipt:.ufo/waves/round-51/w1/RevCounterA.md@sha256:7510dbd61584a54ae57c7bea5086e7a38d620c69c38c293242cf4398512ce3fa`).
- The instrument is the judged object: `receipt:scripts/receipt-attest.mjs@sha256:44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9`
  ships a 27-case selftest (flake-injection → REPLAY; sidecar mismatch → TAMPERED; ledger
  exemption; missing sidecar never VALID) verified independently in a fresh directory
  (`receipt:.ufo/waves/round-51/w1/ExecSelftestExec.md@sha256:pending-close`).
- Before-state, measured: `receipt:.ufo/waves/round-51/base/attest-base-v3r6.txt@sha256:b0fb355869d27549fa1e4601d3ef7dfff638878f380639c9732d38decb162adf`
  records `ATTEST_UNMET held=0/9` at base `c90b9de9` exit 1; the D51 sibling reads
  `DOCTRINE_UNMET held=0/5`. This entry itself is scored by
  `receipt:.ufo/waves/round-51/probe/doctrine51-probe.mjs@sha256:f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0`
  (rule D51).
- Receipt count, distinctness and span are counted, not asserted: three receipts, distinct
  nonces, pairwise-distinct sha256, span ≥ 300 s between earliest and latest `run-at`
  (frozen arm A2) — the same author-scheduled invocation-independence class the lane has
  used since R50-4, honestly labelled; run 2 wraps a live `proxy-check --strict`
  (`receipt:.ufo/waves/round-51/receipts/attest-run-2.txt@sha256:7d0f3e075b8bb9c87d67318ca3f96e17b81a1b4a8a4478ea492d50cd59a9cc85`).
- Freeze integrity is itself a recorded lesson: the round's first counters were frozen
  unrun (one unparseable, one unsatisfiable) and its declared kill rule fell to a stub;
  all six-plus repairs are named in the plan's addendum with re-measured base receipts
  (`receipt:.ufo/waves/round-51/w1/CritC1.md@sha256:ba815f68433f2c2f25953f8760b3f8cb48c05383cb20c02e96d6cca93a773ea9`,
  `receipt:.ufo/waves/round-51/w1/RevPlan.md@sha256:449eaa758a21687a8a9afccea3bf16b37e45db8183173e73d74b3d0e262966b8`).
- Secret hygiene: receipts record argv verbatim and never the environment; wrap only lane
  gates whose argv is public — a receipt must be publishable by construction (the round-51
  sentinel sweep over the committed receipts found no secret-pattern matches).
- Zero-run minting stays possible by any author of the tree (RevengerGap F3): attestation
  proves record integrity and ledger nonce freshness, NOT temporal truth. Q39's ceiling
  stands verbatim: receipts are author-attested invocation records, not cryptographic
  temporal proof.
