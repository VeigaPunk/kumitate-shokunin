VERDICT: S207 opened live — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md fetched HTTP 200 (text/markdown, 3839 B), captured, table transcribed verbatim, 6 located quotes verified verbatim, and a candidate 11-cell `spec`/`A`/`mined` row drafted.

## Evidence

Fetch (exact command, run once, cwd /fast/scratch/hyaku/kumitate-r68/K68ScoutS207):
```
curl -sS -L -o raw-body.md -w 'HTTP_STATUS:%{http_code}\nFINAL_URL:%{url_effective}\nCONTENT_TYPE:%{content_type}\nSIZE:%{size_download}\n' https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md
```
Output: `HTTP_STATUS:200` `FINAL_URL:https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md` `CONTENT_TYPE:text/markdown; charset=utf-8` `SIZE:3839` exit=0. Timestamp of fetch: 2026-10-27T14:54:18Z.

Integrity:
```
sha256sum raw-body.md captures/deprecated-2026-07-28.md
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  raw-body.md   (3839 B, page bytes exactly as fetched)
227bfbad12418d3575fe0a8449d29dc12f01e3848518a8c1d8943f86ba065d46  captures/deprecated-2026-07-28.md  (3950 B = fetched-comment line + exact page bytes)
```

Transcription check: `sed -n '25,32p' capture | diff - sed -n '5,12p' deprecated-table.txt` → `TABLE_ROWS_IDENTICAL` (all 8 lines: header, separator, 6 data rows byte-identical; a hand-transcription typo in the HTTP+SSE row link was caught by this diff and corrected).

Quote check: flattened the capture (`tr '\n' ' '`) and `grep -qF` per quote — all 6 FOUND, word counts `wc -w`: 7, 6, 21, 17, 9, 6 (all <= 25).

Deprecated table (6 data rows, verbatim in deprecated-table.txt):
- Roots | SEP-2577 | `2026-07-28` | tool params/URIs/config | First revision released on or after 2027-07-28
- Sampling | SEP-2577 | `2026-07-28` | Integrate directly with LLM provider APIs | First revision released on or after 2027-07-28
- Logging | SEP-2577 | `2026-07-28` | `stderr` for stdio transports; OpenTelemetry | First revision released on or after 2027-07-28
- Dynamic Client Registration | PR #2858 | `2026-07-28` | Client ID Metadata Documents | First revision released on or after 2027-07-28
- `includeContext: "thisServer"/"allServers"` | SEP-2596 | `2025-11-25` | omit or `"none"` | Follows Sampling (SEP-2577)
- HTTP+SSE transport | SEP-2596 | `2025-03-26` | Streamable HTTP | Three months after SEP-2596 reaches Final

## Findings

- K68ScoutS207-1 (info; binds M6 row count): the live Deprecated table carries exactly **6 data rows** (>= 5 satisfied). The entry's `## Registry snapshot` must carry exactly 6 rows, paired Feature/`Deprecated in`/`Earliest removal` = (Roots,`2026-07-28`,`…2027-07-28`), (Sampling,`2026-07-28`,`…2027-07-28`), (Logging,`2026-07-28`,`…2027-07-28`), (Dynamic Client Registration,`2026-07-28`,`…2027-07-28`), (includeContext thisServer/allServers,`2025-11-25`,`Follows Sampling (SEP-2577)`), (HTTP+SSE transport,`2025-03-26`,`Three months after SEP-2596 reaches Final`). Repro: `grep -c '^| ' <capture>` on lines 27-32.
- K68ScoutS207-2 (info; corroborates the live-clock reading): the HTTP+SSE row's removal cell is a *duration rule*, not a date — "Three months after SEP-2596 reaches Final" (capture:32). The plan's clock (SEP-2596 Final 2026-06-03 + 3 months → elapsed 2026-09-03) resolves through S210/S213, not this page; this page supplies only the rule and the `2025-03-26` deprecation date. The distinct `2027-07-28` date belongs to the SEP-2577/PR-2858 rows and must not be read as the HTTP+SSE removal.
- K68ScoutS207-3 (info; page scope note): the page ends with `## Removed` — "No features have been removed under this policy yet." (capture:41), and the intro states the registry "is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records" (capture:20-21) — entry prose may cite both.
- K68ScoutS207-4 (info; row metadata): `recheck: on-release` proposed to match the lane's other modelcontextprotocol.io spec rows (S010, S011, S026 all `on-release`); kind `spec`, tier `A`, status `mined`, opened `2026-10-27`, used-by `corpus/knowledge/mcp-deprecation-registry.md` per seat spec.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutS207/captures/deprecated-2026-07-28.md` — capture (fetched-comment line + exact page bytes; sha256 227bfbad…, 3950 B).
- `.ufo/waves/round-68/build/K68ScoutS207/quotes.txt` — 6 located quotes with capture line numbers; Q1 contains `2027-07-28` (line 27), Q2 is the HTTP+SSE row's removal cell (line 32).
- `.ufo/waves/round-68/build/K68ScoutS207/deprecated-table.txt` — the `## Deprecated` table (header + 6 data rows) verbatim; diff-verified against the capture.
- `.ufo/waves/round-68/build/K68ScoutS207/row-S207.md` — candidate 11-cell SOURCES row (13 `|`-fields = 11 cells), keyed by URL for L1 re-assignment.
- `.ufo/waves/round-68/w1/K68ScoutS207.md` — this report.

## Limits

- Did not follow any link off the page (SEP-2577/SEP-2596/PR #2858 detail pages are S208–S213 scope); the "Three months after … Final" rule was transcribed, not resolved — its Final date is S213's evidence.
- Single fetch at 2026-10-27T14:54:18Z; no ETag/Last-Modified captured, no second fetch for byte-stability. `deprecated.md` is the raw Mintlify markdown endpoint (not the rendered HTML page).
- No tools installed; curl used as installed.
