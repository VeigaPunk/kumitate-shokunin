# Draft: the two SOURCES.md registry rows behind the `## Gate` bullets
#
# Paste-ready rows for `corpus/SOURCES.md`, one for each source the seat
# K86Scribe opened itself on 2026-11-04.
#
# Shape: 11 pipe-separated cells (`awk -F'|'` → NF=13), no literal `|`
# inside any cell — the corpus census shape CORPUS.md fixes
# ("malformed rows — 11 columns means NF=13").
#
# Ids: S248 and S249, the ids the round already carries for exactly these
# two sources. These rows therefore REPLACE the landed rows of the same id
# rather than adding rows; they refine the `anchor` and `teaches` cells
# with the located line, the fetch digest and the access date this seat
# measured, and they leave `status`, `opened`, `recheck` and `used-by` as
# the round set them.
#
# Do NOT mint new ids for these two URLs: measured, a second row for
# https://eecs481.org/readings/testoracles.pdf under a different scope, and
# a second row for https://nodejs.org/api/crypto.html#hashdigestencoding
# under a different scope, makes `node scripts/source-dupes.mjs` read
# `SOURCE_DUPES: DRIFT groups=9 known=7 bad=2 first=new-duplicate:eecs481.org/readings/testoracles.pdf ids=S248,S250`
# (exit 1). Same URL under a second scope is a gate red.
#
# Row 1 — the survey's reachable full text (the admit):
#
#   | S248 | The Oracle Problem in Software Testing: A Survey — https://eecs481.org/readings/testoracles.pdf | paper | B | Distinguishing expected and incorrect behaviour, rather than trusting a headline | Section 1 Introduction, PDF page 1; DOI 10.1109/TSE.2014.2372785; fetched 2026-11-04, HTTP 200, 773275 B, sha256 6c5689497594a75f08c1b37b3dd361e11c54946bbbf79f670d660f5d298d3d51, capture .ufo/waves/round-86/open/testoracles.pdf; located quote "a procedure that distinguishes between the correct and incorrect behaviors of the System Under Test (SUT)" | supersedes S246 — reachable full text satisfies the old flip; independently derive expected results for generated inputs | mined | 2026-11-04 | 365d | corpus/knowledge/counter-receipt-source-binding.md, corpus/lessons/round-86.md |
#
# Row 2 — the hash API as evidence of semantic correctness (the reject):
#
#   | S249 | Node.js Crypto documentation — https://nodejs.org/api/crypto.html#hashdigestencoding | docs | A | Hash API considered as proof of semantic correctness | hash.digest([encoding]) section, Node.js v26.13.0 page; fetched 2026-11-04, HTTP 200, 1190370 B, sha256 1aa0f3ad2e2b04c382cbba5b7ad9b192d35a495e75b42ef934b0d77459395fcc; located quote "Calculates the digest of all of the data passed to be hashed" | REJECTED: computing a digest binds bytes but proves neither correct behaviour nor authorship; flip: independently specified expected behaviour and provenance evidence, not a digest alone | rejected | 2026-11-04 | on-release | corpus/lessons/round-86.md |
#
# Capture bindings this seat measured for the two rows (for the
# `source-capture` gate, which reads DRIFT bad=3 first=S247:uncaptured
# while S247/S248/S249 have no capture entry):
#
#   S248 → .ufo/waves/round-86/open/testoracles.pdf
#          sha256 6c5689497594a75f08c1b37b3dd361e11c54946bbbf79f670d660f5d298d3d51, 773275 B
#   S249 → needs a capture file of the Node.js Crypto page this seat
#          fetched (1190370 B, sha256 1aa0f3ad2e2b04c382cbba5b7ad9b192d35a495e75b42ef934b0d77459395fcc),
#          or an exemption entry if the row stays a rejection without bytes.
