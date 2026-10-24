# Round 53 — lesson

Lane: kumitate. Round 53 (hyaku run 5, watchdog attempt 1). Base
`d124a775ee46902f588ac730ff97f4d8864e4692` (the round-52 close tip). Plan
`.ufo/waves/round-53/plan.md`; frozen counters
`.ufo/waves/round-53/probe/attest53-probe.mjs` (rule A53 v1, seventeen checks B1..B7d) and
`probe/doctrine53-probe.mjs` (rule D53 v1, checks E1–E5), both executed at the base before
data (`base/attest53-base.txt` held=9/17 — B7a/B7b reproduce the R52-9 defect live;
`base/doctrine53-base.txt` held=0/1 entry-absent).

Two claims. **C1 — operability (capability deepening): `receipt-attest` v3**, contract
`kumitate-receipt-attest-v3` (the ledger-evidence extension: whole-directory evidence set,
routed defects R52-9 + R52-10), predicate `ATTEST53_HELD` (rule A53, seventeen checks).
**C2 — frontier coverage (learning, sourced):**
`corpus/knowledge/receipt-identity-canonicalization.md` resting on rows opened this round
(S104 = RFC 8785 JCS, tier A; S105 = sha256sum(1), tier B), predicate `DOCTRINE53_HELD`
(rule D53, five checks). Freeze discipline this round (lesson M5 / QUALITY Q43): the freeze
commit carries not only the base receipts but a scratch-HELD witness of both counters
against a synthetic conformant post-state (`witness/`).

## Mistakes

- **M1 — R53-1: a SCORECARD prose line contradicted its own committed census.** Class:
  close-prose divergence from freeze evidence (the M1/M2 lineage, one level softer — no
  fabricated citation, a stale sentence). Evidence: the round-52 SCORECARD section's H5
  line says "D51 5/5 at R2", but the committed `close/FINAL-harm-census.txt` and the
  round-52 report's named limit both read `DOCTRINE51 held=4/5 at R2` (D2 hash-miss on the
  v1 instrument bytes the v2 cutover replaced). The non-author verifier spot-check
  (`corpus/lessons/round-52-verifier-spotcheck.md` §5.1) filed it as R53-1. Captured by:
  the non-author closure (the prose was never re-executed against the census it cites).
  Fix (APPLIED): an append-only named correction in SCORECARD (`## Round 52 correction`,
  round 53) plus new harm-rule H6 — the plan §Counters source pins are re-verified at
  close, so a prose/pin divergence now fails close instead of riding a round.

## Gate

Candidates: S104 (RFC 8785, rfc-editor.org) and S105 (sha256sum(1), the Debian bookworm
man page of GNU coreutils), both opened this round. Rows before: 103; after: 105
(tiers A 88→89, B 7→8, C 8 unchanged).

- **S104 — ADMITTED, tier A.** URL `https://www.rfc-editor.org/rfc/rfc8785.txt`; opened
  2026-10-24T05:37:58Z (UTC stamps from `date -u` around a
  `curl --location --fail --max-time 120`); HTTP 200; 41,879 bytes; sha256
  `63d52294eb0e3f0014174288186d388b4ddbf2c67d1ce8af1d9726eb0c3ab240`; saved bytes
  `.ufo/waves/round-53/build/ScoutRfc8785/rfc8785.txt`. Quote (10 words), §1 Introduction,
  saved lines 95-97: "create a canonical representation of JSON [RFC8259] data". Tier A
  scoped to the canonicalization identity concept; status `mined`; used-by
  `corpus/knowledge/receipt-identity-canonicalization.md`.
- **S105 — ADMITTED, tier B.** URL
  `https://manpages.debian.org/bookworm/coreutils/sha256sum.1.en.html`; opened
  2026-10-24T05:40Z after the gnu.org manual node timed out twice from this host
  (05:37:58Z and ~05:39:20Z, curl exit 28) — the Debian packaging of the same GNU man page
  is the official-channel fallback, and the row records that honestly; HTTP 200; 24,379
  bytes; body sha256 `9ed3269c9e3694a6b7f845a48dcf83e151df53db585c3dceb68bf17f472ddb6d`;
  saved bytes `.ufo/waves/round-53/build/ScoutCoreutils/coreutils-sha2.html`. Quote
  (13 words), DESCRIPTION output-format paragraph: "print a line with: checksum, a space,
  a character indicating input mode". Tier B (a man page grounds the format the lane
  writes, not interoperability guarantees); status `mined`; used-by the same entry.
- **Tier scoping recorded:** S104 does not establish sorted-key one-line JSON as canonical
  for arbitrary JSON (JCS primitive rules outside the lane's ASCII-safe field set are
  withheld in the entry). S105 grounds the sidecar line format only; it is not normative
  for nonce policy, replay windows or ledger scoping.
- **Prior-art requirement recorded:** kake S032 (RFC 3339, 2026-10-21) and the round-52
  entry `fail-closed-clock-validation.md` (S102/S103) are named in the entry's prior-art
  paragraph; S104/S105 are distinct kumitate obligations (digest identity + sidecar
  format), not renumbers.
- **Rejected:** none this round.
- **Spot-check:** `<pending — a non-author wave seat re-opens S104/S105 from a fresh fetch
  and compares saved-byte hashes and quote locations>`.

## Notes for the next round

R53-2 (seat accounting, from the round-52 closure): a seat that delivers its payload
without a w1/ report is counted "returned-without-report" by name in the report — the
round-52 ScribeReadme case sets the convention. Carried open: A3e captured-invocation
question, the ±60 s prelude tolerance (Q39 ceiling), the tree-author forgery boundary,
R43-1/R43-5, R41-2 L0 pending.
