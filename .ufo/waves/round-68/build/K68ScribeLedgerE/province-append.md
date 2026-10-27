Landing: replace on PROVINCE.md:21 the tail `; other MCP revision families remain queued.` with the
clause below, keeping the line single (the answer row pins line 21):

    ; second entry `corpus/knowledge/mcp-deprecation-registry.md` (round 68, S207-S213) re-grounds the HTTP+SSE deprecation clock at `omp/18.13.1`, the entry's snapshot, located quotes and live-clock section bound by rule M68; other MCP revision families remain queued.

Answer quote for R66-D3 (word-boundary, exact-line, ASCII hyphens as `norm()` folds the en dash):
`second entry corpus/knowledge/mcp-deprecation-registry.md (round 68, S207-S213)`
Printed line after the edit (norm folds backticks), so the quote must survive `norm()` — it does:
`second entry corpus/knowledge/mcp-deprecation-registry.md (round 68, S207-S213)`.

Base negative (must hold): `git -C <lane> show 8d557f85:PROVINCE.md | grep -c 'mcp-deprecation-registry'` → 0.
