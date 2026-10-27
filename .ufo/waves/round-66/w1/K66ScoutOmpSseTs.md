VERDICT: S209 source opened and captured live (HTTP 200, 15183 bytes, sha256 0b69229a…7fbb0); row drafted in the 11-cell schema with 6 norm()-verified quotes; the v18.12.6 client selects the legacy HTTP+SSE transport only via explicit config type "sse", never as a fallback.

## Evidence

- Fetch: `curl -fsSL -w 'HTTP_STATUS:%{http_code}\n' -o sse.ts <url>` → `HTTP_STATUS:200`; `wc -c sse.ts` → `15183`; `sha256sum sse.ts` → `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`; 446 lines. Capture: build/K66ScoutOmpSseTs/sse.ts.
- Tag: `git ls-remote https://github.com/can1357/oh-my-pi.git "refs/tags/v18.12.6*"` → `45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6` (equals the freeze's tag commit).
- Pinned S204 client.ts integrity: `wc -c` → `14975`; `sha256sum` → `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9` — both match `.ufo/pins/source-captures.json` S204.
- Selection (pinned client.ts, absolute lines): L74 `const serverType = config.type ?? "stdio";`; L81 `case "sse":`; L82 `return createSseTransport(config as MCPSseServerConfig, signal);`; L84 `default: throw new Error(`Unknown server type: ${serverType}`);`.
- Quote check: `node check-quotes.mjs` → all 9 PASS, exit 0 (output pasted in build/K66ScoutOmpSseTs/row.md).

## Findings

- K66ScoutOmpSseTs-1 (info, milestone "open S209 source"): source opened, captured, hashed; tag v18.12.6 resolves to 45c35e40c46166dc726ccc52f5d27f40f2449f99. Repro: `sha256sum .ufo/waves/round-66/build/K66ScoutOmpSseTs/sse.ts`.
- K66ScoutOmpSseTs-2 (fact, supports C2 M7's sse.ts row): the transport is an explicit config choice, not a client-chosen fallback — `createTransport` defaults to `stdio` and throws on unknown types; sse runs only under `case "sse"`. Repro: `sed -n '73,84p' .ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts`.
- K66ScoutOmpSseTs-3 (fact, the row's "timeout error"): named error is `LegacySseConnectionTimeoutError`, message `Legacy SSE endpoint timeout after ${timeoutMs}ms` (sse.ts:39-44, thrown at sse.ts:137-139 when the endpoint handshake times out); per-request path rejects with `Legacy SSE response timeout after ${timeout}ms` (sse.ts:289) or `Request timeout after ${timeout}ms` (sse.ts:311). Repro: `sed -n '38,44p;285,312p' build/K66ScoutOmpSseTs/sse.ts`.
- K66ScoutOmpSseTs-4 (fact, M4/M5 readiness): 6 located quotes ≤25 words each, all substrings of norm(capture) per the frozen counter's norm(), verified by node one-liner (exit 0); quotes came from the same live bytes, so the M5 live re-fetch requirement is satisfiable against this capture. Repro: `node .ufo/waves/round-66/build/K66ScoutOmpSseTs/check-quotes.mjs`.
- K66ScoutOmpSseTs-5 (note, row hygiene): row draft keyed by URL with prepared id S209, status mined, opened 2026-10-27, recheck 180d, used-by corpus/knowledge/mcp-deprecation-registry.md; no `|` in any cell; tier A scoped to "what installed release v18.12.6 ships". Repro: read build/K66ScoutOmpSseTs/row.md.

## Artifacts

- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpSseTs/sse.ts (capture, 15183 bytes)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpSseTs/row.md (row draft + quotes + norm() output)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpSseTs/check-quotes.mjs (norm() verifier)

## Limits

Did not run the lane census or the frozen counters (not this seat's scope; counters never edited). Did not inspect other transports (http.ts, stdio.ts) beyond client.ts dispatch. Did not re-run the fetch a second time for M5 (one live fetch performed; bytes recorded for byte-identity comparison). No tools installed this wave.
