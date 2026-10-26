VERDICT: S202 is open and ready: the OMP MCP runtime doc at tag v18.12.6 (HTTP 200, 22741 bytes, sha256 362acea5…83dd) is byte-identical to `main` 0b5c27ab and to the staged-entry commit, so every S199 claim holds at this tag except one wording overreach ("negotiates … not 2026-07-28").

## Evidence
- `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` -> `omp/18.12.6`; `git ls-remote … refs/tags/v18.12.6` -> `45c35e40c46166dc726ccc52f5d27f40f2449f99`; `refs/heads/main` -> `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` (main has not moved since the staged read).
- `curl -sSL -A 'Mozilla/5.0 (kumitate-r65)' …/v18.12.6/docs/mcp-runtime-lifecycle.md` -> `HTTP 200 size 22741`; `sha256sum` -> `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d`; 265 lines. Saved at build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md.
- main copy: `HTTP 200 size 22741`, same sha256; `diff tag main | wc -l` -> `0`. The 0b5c27ab raw copy and the release-commit 45c35e40 raw copy hash the same (`cmp` -> IDENTICAL; sha256 362acea5… both). Diff size 0: no changed sentence about versions or replay.
- 8 quotes (S202-quotes.md), each <= 25 words, run through the frozen `norm()` copy (v.mjs logic) against the capture: all 8 `OK` (12, 14, 10, 11, 17, 4, 9, 16 words). Same 8 quotes also hold in the raw tag URL fetched live (sha256 identical). Via the github.com `blob/` page 3 of the 16 candidate quotes MISS (those with backticked code) -> use the raw URL in the row.
- `sources-census.sh validate --file` on a scratch copy of lane SOURCES.md with the S202 row inserted after S200: S202 lines only `E11 S202 missing used-by …` (entry and lesson files do not exist yet; resolves once they land); no E-code other than E11, no W04 on S202. Baseline file shows the same E11 class for S197-S200 in this checkout, so E11 is path-relative noise from running outside a full tree. Non-E11 lines: six pre-existing W04 (S034, S068, S084, S095, S123, S126).
- Lane SOURCES.md registry ends at S200 (no S201 row yet); I followed the S200 row's 11-cell shape (13 `|` splits, status mined, opened, recheck 180d, used-by list). Row draft split check: NF=13.

## Quotes with headings (verbatim, normalised-matched)
1. § Connection establishment and startup timing (connectToServer list): "performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability"
2. § Fast startup gate + deferred fallback: "OMP_MCP_STARTUP_TIMEOUT_MS env override, else mcp.startupTimeoutMs, else 250 ms; 0 waits until initial loads settle"
3. § Fast startup gate + deferred fallback: "use cached tool definitions if available (MCPToolCache.get) to create DeferredMCPTools"
4. § Fast startup gate + deferred fallback: "the background continuation registers their tools via #onToolsChanged once connect/list finishes"
5. § Tool calls: "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"
6. § Tool calls: "Refused connections are retried."
7. § Health, reconnect, and partial failure behavior: "Reconnect retries with backoff (500, 1000, 2000, 4000 ms)"
8. § Failure modes and guarantees (table): "stale tools remain while reconnecting and future calls may retry once or fail with MCP errors"
Spare (also OK): "waits up to 1.5 s for this MCP startup" (§ Entry path from SDK); "The operation may already have run; check its effect before retrying." (§ Tool calls); "a slow server no longer blocks startup" (§ Fast startup gate).

## Staged S199 claims vs this tag (omp-session-sharing-and-mcp-lifecycle.md)
- TRUE: 250 ms gate; fulfilled -> live tools, rejected -> per-server errors, pending + cache -> DeferredMCPTools, else late through #onToolsChanged (doc lines 109-124).
- TRUE: "Connection loss after a request may have reached the server … never replayed automatically" (line 152); stdio frame written / HTTP-SSE reset after established; "Refused connections are retried" (line 152). Recheck `grep -c 'never replayed automatically'` -> 1 at the tag too (ran 2026-10-25).
- TRUE but incomplete: gate is configurable (OMP_MCP_STARTUP_TIMEOUT_MS, mcp.startupTimeoutMs, 0 waits) — staged text omits it; staged omits the retriable-before-dispatch single retry (line 151), the 500/1000/2000/4000 ms ladder and >5-in-30 s breaker (line 198), the 15 s..5 min remote probes (line 199) and the 1.5 s first-turn wait (line 27).
- OVERSTATED: "OMP negotiates MCP protocol version 2025-11-25, not 2026-07-28". The doc says the client performs `initialize` *using* 2025-11-25 and separately "records the server's negotiated protocol revision" (lines 101, 106); the string 2026-07-28 appears nowhere in the doc (`grep -n '2026'` -> no hit). Say "sends 2025-11-25"; the 2026-07-28 absence is a binary-probe fact (lit_2026_07_28), not a doc fact.
- STALE SKEW LINE: "upstream documentation facts read at commit 0b5c27ab — the same main skew". For this doc, skew to the installed tag is zero bytes; the entry should say so and still not claim the binary behaves so (the doc is not a measurement).
- ID COLLISION: staged entry cites S198/S199 for collab/mcp docs, but the lane registry already has S198 (jj Concurrency) and S199 (Firefox jj); the lane copy must re-point to S202 (collab half is a separate row/reject candidate).

## Findings
- K65ScoutRuntimeDoc-1 (medium): the staged entry's protocol sentence overstates the source ("negotiates … not 2026-07-28"); the doc supports only "initialize sends 2025-11-25". Reproduce: `grep -c 2026 build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md` -> 0.
- K65ScoutRuntimeDoc-2 (medium): S198/S199 ids in the staged entry collide with lane rows S198/S199 (`awk '/^\| S19[89] /{print substr($0,1,60)}' corpus/SOURCES.md`).
- K65ScoutRuntimeDoc-3 (low): row URL choice. The `github.com/…/blob/…` page passes only 13 of 16 candidate quotes under norm() (counter O5 would MISS the backticked ones); use the raw.githubusercontent tag URL (all pass, bytes == capture).
- K65ScoutRuntimeDoc-4 (low): O6 needs >= 2 cited rows pinned to /v18.12.6/ or the release commit; S202 uses /v18.12.6/ in its URL; existing S068 (github tree at 45c35e40) is the second candidate, but it has a W04 duplicate-url warning only.
- K65ScoutRuntimeDoc-5 (info): the doc is mutable upstream, so the capture + tag pin is the evidence; the live O5 fetch at the tag URL is stable (tag).

## Ready-to-paste (S202)
Quote list: S202-quotes.md (8 bullets, `- S202 — "…"`). Row: S202-row.md (11 cells; paste into `## Registry` after the last row). Pin: S202-pin.json (append to `.ufo/pins/source-captures.json` `captures`; L1 must commit the capture at that path before the pin check). Row status stays `mined` only after non-author re-open (L1).

## Artifacts
build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md; build/K65ScoutRuntimeDoc/S202-row.md; S202-pin.json; S202-quotes.md; scratch /tmp/kumitate-r65/K65ScoutRuntimeDoc/ (main.md, blob.html, S.md, S2.md, q*.mjs, v.mjs).

## Limits
Did not run the frozen counter (no entry exists); did not open S201 (no row in lane); did not measure the binary (only `--version`); the used-by lesson path `corpus/lessons/round-65.md` is an assumption; the doc-vs-binary behaviour is not tested here.
