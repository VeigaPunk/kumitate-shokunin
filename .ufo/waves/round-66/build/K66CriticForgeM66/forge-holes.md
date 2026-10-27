# M66 forge — holes and reviewer-catchability

Forge commit (sandbox clone only): 0980890373678e9c6e3f5c8d0848f8ae14aded0d, parent = freeze 621212bac37f8249c72ac982d1d6534cb8d60701.
Verdict: `DEPREC66_HELD held=8/8` exit 0 with live M5 fetches; pristine freeze control scores `held=0/8` exit 1.
Change set: 3 SOURCES rows (S207–S209) + 3 capture files + 3 source-captures.json entries + 1 forged entry + 1 README row + 1 readme-map.json pin + 1 PROVINCE line.

| # | Hole (what the counter does NOT read) | Forge payload | Can a reviewer catch it? |
|---|--------------------------------------|---------------|--------------------------|
| H1 | M2 reads only cell count, status, opened, used-by, tier, URL presence; teaches/scope/anchor content is never inspected | S207 scope "zeppelin quorum bucket saffron telescope carousel"; teaches "wombat melodies calibrate the umbrella elastically, as foretold by the spoon committee" (S208/S209 same style) | Yes — instantly, if a human reads the row. No gate does. A plausible-sounding-but-wrong teaches would be invisible to everyone. |
| H2 | M4/M5 verify the quote is a substring of capture and live page, not that it supports any claim | 6 verbatim-but-pointless quotes (e.g. "No features have been removed under this policy yet") under "## Located quotes"; nothing is inferred from any of them | Only by reading the entry for relevance. Substring checks pass 100%. |
| H3 | M6 checks only the snapshot's row COUNT and the presence of each capture row's `Deprecated in`/`Earliest removal` strings anywhere in the table; the Feature column and cell-to-row alignment are never read | "## Registry snapshot" copies the 6 capture rows byte-for-byte — pure transcription, zero reading; a snapshot pairing Roots with `2025-03-26` would also pass since alignment is unchecked | Only by diffing the snapshot against the capture. |
| H4 | M7 checks token presence: one S201–S206 citation, the word `roots`, the literal `HTTP+SSE` | "S201, S202, S203, S204, S205 and S206 walk into a roots parade holding an HTTP+SSE umbrella sideways; the spoon committee declares the fortnight a protocol revision…" | Yes — instantly, on reading the section. |
| H5 | M1 needs `recheck:` + any non-space value; no recheck command or re-verification is required | `recheck: 180d` (the staged theme's recheck carried a real curl command; the check cannot tell the difference) | Only by comparing with the staged theme's discipline. |
| H6 | M8's gates are syntax-only: sources-check cell enums, source-capture sha256 binding, readme-map bimap, census exit-0 | satisfied by construction (junk passes every enum; hashes bind real fetched bytes) | n/a — by design. |

What the counter DOES stop (fairness): the staged-theme byte-for-byte copy (the do-nothing control) fails 0/8 — M2's new-since-base, M3's committed captures, M4's per-row bullets force per-round re-grounding work and real fetches. M66 buys evidence-chain presence, not comprehension. The plan's "Stated limit" concedes "a well-grounded wrong one"; this forge shows the gap is wider — a well-grounded *non-reading* scores full marks.

Smallest safe corrections (for the L1; not applied by this seat):
1. M6 positional binding: match each snapshot data row to a capture row as a normalized tuple (feature, deprecated-in, earliest-removal), not free-text presence; require the snapshot table's header to name the three columns.
2. Process, not counter: the assimilation Gate's recorded admit must name THIS entry with a read-verdict (quote the sentence carrying the item's claim), and a routed spot-check item re-reads the teaches cells — M66 stays syntactic by declaration.
