# Draft: `## Gate` block for corpus/lessons/round-86.md
#
# Paste-ready replacement for the `## Gate` section of
# corpus/lessons/round-86.md.
#
# The two source rows below are S248 and S249 — the rows the round already
# carries for exactly these two sources. This seat opened BOTH sources
# itself on 2026-11-04 and records its own fetch receipts here, so the
# decisions are backed by an independent re-open and not only by the
# integrating seat's fetch.
#
# Row shape: every SOURCES row cited here parses as 11 pipe-separated
# cells (`awk -F'|'` → NF=13) with no literal `|` inside any cell.
#
# NOTE FOR THE INTEGRATOR: do NOT mint new S### rows for these two URLs.
# Measured: adding a second row for https://eecs481.org/readings/testoracles.pdf
# under a different scope, and a second row for
# https://nodejs.org/api/crypto.html#hashdigestencoding under a different
# scope, makes `node scripts/source-dupes.mjs` read
# `SOURCE_DUPES: DRIFT groups=9 known=7 bad=2 first=new-duplicate:eecs481.org/readings/testoracles.pdf ids=S248,S250`
# (exit 1). The same URL under a second scope is a gate red, so this draft
# re-opens S248 and S249 in place rather than replacing them.

## Gate

Sources below were opened by the seat K86Scribe on 2026-11-04; each
quotation is at most 25 words, and each quote was located in the bytes that
seat fetched.

- **Admit — S248, mined, B.** *The Oracle Problem in Software Testing: A
  Survey*, https://eecs481.org/readings/testoracles.pdf, section 1
  Introduction, PDF page 1. Located quote (16 words): “a procedure that
  distinguishes between the correct and incorrect behaviors of the System
  Under Test (SUT)”. Fetched 2026-11-04, HTTP 200, 773275 B, sha256
  `6c5689497594a75f08c1b37b3dd361e11c54946bbbf79f670d660f5d298d3d51` —
  byte-identical to the round's `open/testoracles.pdf` capture, which this
  seat re-fetched independently rather than read from the working tree.
  This is the reachable full text S246's flip named, so the r85 rejection
  "no locatable sentence at the source" no longer holds for the work; the
  survey's own definition of a test oracle is the ground the round's
  consistency-versus-oracle distinction needs, and its soundness and
  completeness definitions are the limit a source digest does not reach.
  The ACM DL listing still returns HTTP 403 (re-probed 2026-11-04, 5559 B),
  so S246's recorded failure stands as history and is not rewritten.
- **Reject — S249, as evidence of semantic correctness, A for the API only.**
  Node.js *Crypto* documentation,
  https://nodejs.org/api/crypto.html#hashdigestencoding, `hash.digest([encoding])`.
  Located quote (12 words): “Calculates the digest of all of the data passed
  to be hashed”. Fetched 2026-11-04, HTTP 200, 1190370 B, sha256
  `1aa0f3ad2e2b04c382cbba5b7ad9b192d35a495e75b42ef934b0d77459395fcc`. An
  API that computes a digest over bytes it was handed says the digest binds
  those bytes; it says nothing about whether those bytes are the expected
  source or who produced them, so it cannot support a correctness or
  authorship claim. Flip: independently specified expected behaviour plus
  provenance evidence for the hashed bytes, not a digest alone.

Registry changes: none from this seat. Both rows already exist; this
section records the seat's independent re-open of them, so no `status`,
`recheck` or `used-by` cell is rewritten.

Assimilation: none. The package at
`/home/vgpnk/Projects/shokuknow/merge/kumitate` is present and read-only;
no package row is adopted. The round re-opens its own instrument sources
instead.
