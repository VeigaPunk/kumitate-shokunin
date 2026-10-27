# Round 68 — source gate and mistakes

## Gate

**Admit (theme: MCP deprecation registry, re-grounded; S207–S213).** The staged entry was not admitted as-is. This lane's entry is re-grounded against newly opened sources and the installed release. The content is admitted to corpus memory; claim C2 still fails its frozen counter's M6 delimiter-row check at the proper Markdown table form, so this is not a claim-admission verdict.

- S207 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md; opened 2026-10-27. Quote: “First revision released on or after 2027-07-28”.
- S208 — https://modelcontextprotocol.io/community/feature-lifecycle.md; opened 2026-10-27. Quote: “at least twelve months, that the feature must remain Deprecated”.
- S209 — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts; opened 2026-10-27. Quote: “Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05”.
- S210 — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/183238ddacd0118a22399cd4743a5b5eaa43dbdd/seps/2596-spec-feature-lifecycle-and-deprecation.md; opened 2026-10-27. Quote: “three-month grace period from the date this SEP reaches Final”.
- S211 — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md; opened 2026-10-27. Quote: “Clients and servers can maintain backwards compatibility with the deprecated”.
- S212 — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts; opened 2026-10-27. Quote: “Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05”.
- S213 — https://github.com/modelcontextprotocol/modelcontextprotocol/commit/183238ddacd0118a22399cd4743a5b5eaa43dbdd.patch; opened 2026-10-27. Quote: “Subject: [PATCH] Mark SEPs as final”.

**Reject as staged:** merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md. Its Created-date reading is inconsistent with the source's Status transition; citations/recheck shape were not independently valid. Flip condition: re-ground its claims on opened, committed sources and a working live recheck. This round's independently sourced entry uses the corrected Final date but does not erase the staged rejection.

## Mistakes

- unexercised-counter — .ufo/waves/round-67/probe/ledger67-probe.mjs crashes on first run (EEXIST creating archive) and round 67's freeze carried no exercised receipt. Captured by QUALITY Q64; fix demonstrated by committing and exercising both round-68 counters at base before dispatch (39f61816).
- plan-quotes-receipt — round-68 plan says C1 base held=0/7; its committed receipt says held=1/7. Captured by Q65; preserve frozen plan and report the receipt's actual verdict.
- unsatisfiable-frozen-counter — C1 L4 A5's good fixture binds item 5 to a quote absent from that item; correct implementations fail good and no-section. Captured by wave reviewers; do not amend after scoring; versioned ratchet in round 69.
- unrenderable-table-workaround — C2 M6 counts a multi-column Markdown delimiter as a data row. Omitting the delimiter to satisfy the frozen counter makes the snapshot not render as a table; keep correct table and record M6 MISS; versioned ratchet in round 69.
- counter-forgery — C1 L4 reveals mutant names through fixture paths, allowing a pathname-dispatch stub to report HELD without ledger semantics. Captured by K68CriticForgeryC1; next freeze must hide the answer key and score an implementation-level falsifier.
- self-asserted-source-capture — C2 M3/M4 accept fabricated capture bytes with recomputed pins; only M5 refutes this fabricated sample against its live URLs. Captured by K68CriticForgeryC2; future provenance checks need an independently trusted source identity.
- fixture-revision-unresolvable — control receipts carry throwaway revs with no fixture recipe/tool digest. Captured by Q63; record fixture creation and tool hash for future controls.

## Census

Before: .ufo/waves/round-68/base/census-before.txt — 6 carried W04 warnings, exit 0. After: recorded in the round report; warnings remain carried, no new duplicate URL was introduced.
