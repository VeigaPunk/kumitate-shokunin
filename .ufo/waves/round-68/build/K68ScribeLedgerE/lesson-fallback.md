# Fallback landings — only if the L1 refuses the QUALITY Q63/Q64 pins

Each block is ONE line; paste as one line, then pin the row's answer to the line number after integration.
All three quotes are 5–8 words, word-boundary-safe, and free of `|`.

## F1 — D1 fallback, `corpus/lessons/round-68.md`

    D1 closed: the round-66 wave leftovers landed in the wrap-up, `timeline.json` at `d23892ad` and a re-run `results-INCONCLUSIVE-attempt.tsv` with its README at `e9ff2719`.

Answer quote: `the round-66 wave leftovers landed in the wrap-up` (8 w).
Caveat: the file does not exist at `8d557f85`, so L3's "not in that file at base" arm is vacuous here
(finding 3); use only if QUALITY Q63 is not landed.

## F2 — D2 fallback, `corpus/lessons/round-68.md`

    D2 closed: every receipt names the revision it measured, and a frozen counter's base receipt ships in the same commit as the counter (Q64).

Answer quote: `every receipt names the revision it measured` (7 w). Same caveat.

## F3 — D3 wontfix variant (C2 reads UNMET at close), `corpus/lessons/round-68.md`

    D3 (r66): the MCP deprecation registry did not land this round; C2 is re-declared under a fresh freeze for the next round.

Answer quote: `C2 is re-declared under a fresh freeze` (7 w). Row status must then be `wontfix` (L3 accepts
`closed` or `wontfix`; `open` would fail the round-66 clause).
