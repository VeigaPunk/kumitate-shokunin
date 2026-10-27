## Round-65 D1 — Gate row correction (append-only)

The filed `corpus/lessons/round-65.md` Gate table's S204–S206 mapping and its no-S206 sentence contradict the registry. Correct rows:

| row | URL | access date | located quote (≤25 words) | location / capture |
|---|---|---|---|---|
| S204 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts | 2026-10-25 | `protocolVersion: MCP_PROTOCOL_VERSION,` | capture `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts:100`; pin SHA-256 `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9`, 14975 bytes |
| S205 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts | 2026-10-25 | `const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` | capture `.ufo/waves/round-65/build/Capture/omp-v18.12.6-zai.ts:80`; pin SHA-256 `0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb`, 12774 bytes |
| S206 | https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts | 2026-10-25 | `no protocol-version header is sent from either source.` | capture `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-transports-http.ts:122`; pin SHA-256 `41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033`, 33157 bytes |

These rows are copied from `corpus/SOURCES.md` S204–S206; the pinned capture identities are in `.ufo/pins/source-captures.json`. This correction is appended in round 66 and does not edit the round-65 lesson.
