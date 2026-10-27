VERDICT: S213 source opened and captured (HTTP 200, 16321 bytes, sha256 ae9bb7be…, byte-stable across two fetches); the 11-cell registry row, 7 norm()-verified located quotes (all ≤25 words) and the spec-vs-OMP client.ts backwards-compatibility comparison are drafted in the build dir.

## Evidence

- Fetch: `curl -fsSL -D headers.txt -o transports-2025-11-25.md https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md` → exit=0; headers: `HTTP/2 200`, `content-type: text/markdown; charset=utf-8`, `last-modified: Tue, 27 Oct 2026 06:28:30 GMT`; `wc -c` = 16321, `wc -l` = 317; `sha256sum` = `ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc`.
- Second live fetch (M5-style stability): sha256 identical (`ae9bb7be…` both).
- Quote verification with the frozen counter's exact `norm()` (`deprec66-probe.mjs:52-59`), capture and live re-fetch: `Q1 words=7 found=true … Q7 words=22 found=true ALL_OK=true` (full output in `build/K66ScoutTransports2024/row.md`).
- Row shape: `awk -F'|' '/^\|[[:space:]]*S213[[:space:]]*\|/{print NF}' row.md` → `13` (11 cells, census-clean); kind `spec`, tier A, status `mined`, opened 2026-10-27, recheck 180d, used-by `corpus/knowledge/mcp-deprecation-registry.md`.
- Spec fallback steps verbatim at capture L293-309 (quoted in `row.md`); key lines: L294 (accept URL), L296-297 (POST InitializeRequest + Accept), L300-301 (400/404/405), L302-303 (GET → SSE `endpoint` event), L304-306 (use old transport subsequently).
- OMP comparison target: `grep -n createTransport .ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts` → `createTransport` :73, `switch (serverType)` :76, `case "sse":` :81, `setProtocolVersion?.()` :120; `createSseTransport` import at :11.

## Findings

- K66ScoutTransports2024-1 (info, coverage): S213 row drafted — spec A-tier for the Streamable HTTP + HTTP+SSE backwards-compatibility contract at revision 2025-11-25. Reproduce: read `row.md` § "Row"; census field count 13.
- K66ScoutTransports2024-2 (info, evidence chain): 7 located quotes, each ≤25 words, each verbatim in the capture with line numbers; all pass `t.includes(norm(q))` against the capture AND a second byte-identical live fetch. One norm() trap recorded: quotes spanning the L56-58 blockquote fail because norm() keeps literal `>` markers — quote 1 was kept intra-line (L58) after a spanning variant returned `found=false`.
- K66ScoutTransports2024-3 (info, registry substance): the spec's client fallback is probe-based auto-negotiation (POST InitializeRequest; on 400/404/405 → GET, first SSE event `endpoint` → old HTTP+SSE for all subsequent traffic). OMP v18.12.6 `client.ts` (S204) does NOT implement it: transport is config-selected (`switch (config.type)`, `stdio|http|sse`, :73-83), no fallback path; legacy `transports/sse.ts` remains a config-selected import (:11). The registry entry's "Bearing on the installed OMP release" can cite S204 + this row for "support code shipped, spec fallback unimplemented". The server's no-version-header assumption (`2025-03-26`, capture L271-273) matches OMP's post-negotiation echo (S206/S204 :120).
- K66ScoutTransports2024-4 (info, integration hand-off): M3 needs this capture committed and bound in `.ufo/pins/source-captures.json` under the final S-id (sha256 ae9bb7be…, 16321 bytes); the capture file sits ready in the build dir. Row id S213 is the seat's prepared id — L1 re-assigns by URL.

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutTransports2024/transports-2025-11-25.md` — exact-byte capture (16321 bytes, sha256 ae9bb7be…).
- `.ufo/waves/round-66/build/K66ScoutTransports2024/row.md` — row draft, capture metadata, 7 quotes + norm() verification output, verbatim fallback steps, S204 comparison, M3 hand-off note.

## Limits

- Page scope read for the row is Streamable HTTP (L52-277) + Backwards Compatibility (L279-309); session-management and version-header details were located but not mined quote-by-quote beyond the version-header sentence.
- M5 live re-fetch was run once by this seat (byte-identical); the counter's own live run at counting time remains the binding check.
- The installed-release claim is static source reading (S204/S206 captures); no runtime probe of the installed binary was run.
- No installs or upgrades were needed; nothing added to PATH.
