VERDICT: S207 source opened and captured (HTTP 200, 3839 bytes, sha256 c12c3cb7…8baa); row drafted, 6-row Deprecated table reproduced, all 5 quotes verified against norm(capture); M6 parse on the capture yields 6 data rows.

## Evidence

Fetch (cwd = my scratch dir):
```
$ curl -fsSL -w '\nHTTP_STATUS:%{http_code}\n' https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md -o .../build/K66ScoutDeprecatedPage/deprecated.md
HTTP_STATUS:200
EXIT:0
$ wc -c deprecated.md → 3839 deprecated.md
$ sha256sum deprecated.md → c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa
```

M6 parse replication (exact copy of frozen counter `.ufo/waves/round-66/probe/deprec66-probe.mjs` lines 52–60 norm/delink and 182–191 capture-row loop), run on the capture:
```
Deprecated heading at line index 4 (1-based 5)
M6 capture-table data rows = 6
1: ["Roots","SEP-2577","2026-07-28",...,"First revision released on or after 2027-07-28"]
2: ["Sampling",...] 3: ["Logging",...] 4: ["Dynamic Client Registration","PR #2858",...]
5: ["includeContext: \"thisServer\" / \"allServers\" (Sampling)","SEP-2596","2025-11-25",...,"Follows Sampling (SEP-2577)"]
6: ["HTTP+SSE transport","SEP-2596","2025-03-26","Streamable HTTP","Three months after SEP-2596 reaches Final"]
```

Quote check against norm(capture) (node one-liner using the counter's exact norm):
```
FOUND   words=ok(9)   "No features have been removed under this policy yet."
FOUND   words=ok(7)   "First revision released on or after 2027-07-28"
FOUND   words=ok(6)   "Three months after SEP-2596 reaches Final"
FOUND   words=ok(13)  "A Deprecated feature remains part of the specification but is scheduled for removal"
FOUND   words=ok(21)  "This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records."
ALL_QUOTES_FOUND: true
```

Quote line numbers in capture (grep -n): line 12/19/39 prose anchors; table rows at lines 26–31; `Three months after` at line 31; `2027-07-28` at lines 26–29.

## Findings

1. **K66ScoutDeprecatedPage-1 (info, milestone S207 open)** — Source captured and row-ready. 11-cell row drafted (id S207, kind spec, tier A, status mined, opened 2026-10-27, recheck 180d, used-by corpus/knowledge/mcp-deprecation-registry.md); no `|` in any cell. Repro: open `.ufo/waves/round-66/build/K66ScoutDeprecatedPage/row.md`.
2. **K66ScoutDeprecatedPage-2 (info, M6 ground truth)** — The captured `## Deprecated` table has exactly **6** data rows (>= 5 required by M6); per-row `Deprecated in` and `Earliest removal` cells extracted with the counter's own parse, ready for the entry's `## Registry snapshot`. Repro: `node m6.mjs deprecated.md` (script copied in build dir alongside row.md evidence).
3. **K66ScoutDeprecatedPage-3 (low, counter robustness note — report only, not patched)** — M6's heading regex `^#{1,3}\s+Deprecated\b` first matches the page H1 `# Deprecated Features` (capture line 5) instead of the `## Deprecated` section (line 22). Count is unaffected here (only table rows before `## Removed` are collected), but a page whose H1 differs in text before a stray `## Deprecated`-less table could shift the window. Frozen counter; reported, not edited.

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutDeprecatedPage/deprecated.md` — byte-exact capture (3839 B, sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa)
- `.ufo/waves/round-66/build/K66ScoutDeprecatedPage/row.md` — row draft, 5 located quotes, clean 6-row Deprecated table, Removed-section sentence, M6 parse output, norm quote-check output
- `.ufo/waves/round-66/build/K66ScoutDeprecatedPage/m6.mjs` — verbatim M6 replication script used for the row count

## Limits

Live re-fetch (M5) not run by this seat — single capture only; the L1's counter re-fetches live. Removed section contains only the one sentence quoted (lines 39–41); no removed-feature rows exist. I did not verify the page against the per-feature deprecation notices it calls normative (out of scope for this seat).
