# Round 69 — versioned counter repairs

## Gate

Admit: S214–S216, commit-pinned upstream carriers supporting the MCP entry's new Capture origin section. Opened 2026-10-30; captured under `.ufo/waves/round-69/build/L1Capture/mirrors/`.

- S214: https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/82d60be17d75e69b350c9fe77df2e8cac202ac11/docs/specification/2026-07-28/deprecated.mdx — Deprecated table lines 26–31: “Three months after SEP-2596 reaches Final”.
- S215: https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/82d60be17d75e69b350c9fe77df2e8cac202ac11/docs/community/feature-lifecycle.mdx — Deprecating a Feature step 4, lines 65–67: “the number of months, at least twelve, that the feature must remain Deprecated”.
- S216: https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/82d60be17d75e69b350c9fe77df2e8cac202ac11/docs/specification/2025-11-25/basic/transports.mdx — Backwards Compatibility: “Clients and servers can maintain backwards compatibility with the deprecated”.

Reject: self-asserted capture integrity as sufficient evidence of origin. Recomputed pins accept tampered S210 bytes under M3, but the live M11 digest rejects them (`controls/c2-forgecapture.txt`, S210:origin-sha-mismatch). Flip: bytes independently fetched from their cited origin agree.

Existing SOURCES rows: no status/recheck/used-by changes. Added rows are tier A, mined, used by the existing MCP entry. Assimilation: none; instead mine considerthese/2026-10-26.md idea 3 (tool registration triad) into Q68. This is one proposal, not a new claim.

Outside spot-check: pending the non-author closure; this lane's seats do not count as non-author verifiers.

## Mistakes

- reference-drift · round-68-verifier-spotcheck.md routed item 1: SCORECARD commands cited 76bdda4b while close receipts recorded 42b04dac · captured-by Q65 adjacent, not sufficient · this round binds measured revisions to actual receipt lines; historical round-68 text remains unchanged.
- stale-premise · same spot-check routed item 4: live checks change after a frozen base run · captured-by none · Q66 records live state; round-68 base lacks live=, round-69 base explicitly says live=exercised (red/green evidence in base receipts).
- survivor · same spot-check routed item 3: K68ReviewC1Predicate had final output but no report file · captured-by none · Q67 requires result/report census and names exceptions, rather than treating WAVE-DONE as proof of files.
- reference-drift · round-69 base deprec69-base.txt M9 readme-map-exit=1 · captured-by readme-map gate · add round-68 verifier map row and pin; base red demonstrates the repair can fail.
- vacuous · round-68 L4 leaks mutant names in paths and A5 quotes another item · captured-by wave critics · new L69 fixes A5 and blinds directories; frozen r68 bytes retained. Blinding addresses the demonstrated pathname class, not all adversarial implementations.

Round-66 routed operator note N4 is promotion-owned: the lane cannot grant itself non-author SHONEN verification; record wontfix locally and retain the external promotion gate.
