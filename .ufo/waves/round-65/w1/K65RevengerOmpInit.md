VERDICT: The installed `omp/18.12.6` bundle hard-codes one MCP constant `var itt = "2025-11-25"` (types module), sends it as `protocolVersion` in the single `initialize` call, and sets the `MCP-Protocol-Version` header only from the *server-echoed* version after negotiation — the readable bytes match the v18.12.6 tag logic line-for-line, and `2026-07-28` / `server/discover` / stateless `_meta` are absent (0 each).

## Evidence

Subject: `/home/vgpnk/.local/bin/omp.real`, 256,702,432 B, ELF x86-64 "not stripped", Bun bundle,
`sha256=85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`. Wrapper
`/home/vgpnk/.local/bin/omp` is bash (`BIN="${OMP_REAL:-$HOME/.local/bin/omp.real}"`). Only execution:
`OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → `omp/18.12.6`, exit 0.

Literal counts (one `grep -a -o -F … | wc -l` per row, `LC_ALL=C`):
```
2025-11-25 2   2026-07-28 0   2025-03-26 2   2024-11-05 0   2025-06-18 0   server/discover 0
MCP-Protocol-Version 3   MCP_PROTOCOL_VERSION 3   protocolVersion 16   Mcp-Session-Id 10
_meta 50   _meta. 2   io.modelcontextprotocol 0   18.12.6 9   '@bun @bytecode' 3043
```

**(1) definition.** `LC_ALL=C grep -a -b -o -F 'itt = "2025-11-25"' omp.real` → `156887738:itt = "2025-11-25"`;
module marker `src/mcp/types.ts` at 156887599. `dd skip=156887045 count=1400`:
```
// packages/coding-agent/src/mcp/types.ts var rtt = "https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/config/mcp-schema.json"; var itt = "2025-11-25"; var JB = { PROGRESS: "notifications/progress", TOOLS_LIST_CHANGED: "notifications/tools/list_changed", …
```
`MCP_PROTOCOL_VERSION` occurs only as an export alias of `itt` (`itt as MCP_PROTOCOL_VERSION` at 172988081, 174940921).

**(2) initialize sender.** `grep -a -o 'request("initialize"' | wc -l` → `1`; `protocolVersion: itt` → `1`.
`async function tTe(` @156938924, `src/mcp/client.ts` marker @156938247:
```
Qke = { name: "omp-coding-agent", version: "1.0.0" }; … async function tTe(u, p) { const R = { protocolVersion: itt, capabilities: { roots: { listChanged: false } }, clientInfo: Qke }; const T = await u.request("initialize", R, { signal: p?.signal }); … u.setProtocolVersion?.(T.protocolVersion); await u.notify("notifications/initialized"); await p?.onInitialized?.(); return T; }
```

**(3) header.** `class Y1e` @156898407 (`src/mcp/transports/http.ts` marker @156897833), `dd skip=156896000 count=14000`:
```
#d = null; … #p(u, p) { const R = txt(this.config.headers, "MCP-Protocol-Version"); const T = this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }; const M = X1e(this.config.url, u, { generated: T, configured: R }, …);
setProtocolVersion(u) { this.#d = u; }
```
`#d` is written only by `setProtocolVersion` (@156899637), called with the server's echoed
`T.protocolVersion`; the `MCP-Protocol-Version` literal appears nowhere else (no stdio/SSE header).

**(4) absent draft surface.** 0 hits each for `2026-07-28`, `server/discover`, `io.modelcontextprotocol`,
`2024-11-05`, `2025-06-18`. The two `_meta.` hits are the ACP extension in the embedded changelog
(252999512/252999670: `_meta.steering.supported`). No stateless `_meta` field; session model present
(`Mcp-Session-Id` ×10, `notifications/initialized` ×3).

**(5) `18.12.6` sites (9).** 96005424 (const pool/help text) · 147615522 `@oh-my-pi/pi-natives` pkg.json ·
147618607 `embedded-addon.js { platformTag: "linux-x64", version: "18.12.6", … pi_natives.linux-x64-modern.node, size: 116389144 }` ·
147633011 `// packages/utils/package.json var p0 = "18.12.6"` · 148842174 `@oh-my-pi/pi-ai` · 151991040
`@oh-my-pi/pi-coding-agent` · 152114306 `@oh-my-pi/pi-mnemopi` · 252999416 embedded `## [18.12.6] - 2026-10-21` changelog ·
256648610 docs `--user-agent=omp/18.12.6`.

**(6) tag comparison** (fetch exit 0; `sha256 tag_client.ts 479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9`,
`tag_types.ts caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d`,
`tag_transports_http.ts 41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033`,
`tag_transports_header-policy.ts 121feae956ba626280a0cec115a2a8257a1f2e1dee9066ef0b6aa12ea4860194`):
`types.ts:181 export const MCP_PROTOCOL_VERSION = "2025-11-25";` · `client.ts:100 protocolVersion: MCP_PROTOCOL_VERSION` ·
`client.ts:120 transport.setProtocolVersion?.(result.protocolVersion)` · `client.ts:125 await transport.notify("notifications/initialized")` ·
`http.ts:104 #protocolVersion: string | null = null` · `http.ts:124-127` strip-then-merge · `header-policy.ts:28-37` `mergeMCPHeaders` (generated wins) ·
`header-policy.ts:58 withoutHeader`. No version validation on the echoed value in either form.

## Findings

**K65RevengerOmpInit-1 — info (confirms, does not attack).** The claim surface "which protocol literals
and symbols the release bytes carry" is substantiated with the value expression, not just presence:
`itt = "2025-11-25"` at 156887738 is the only definition, and it is the only value reaching
`initialize`. Repro: `LC_ALL=C grep -a -b -o -F 'itt = "2025-11-25"' ~/.local/bin/omp.real`.

**K65RevengerOmpInit-2 — medium. The frozen C2 probe measures presence, not the value or the use.**
`lit_2025_11_25=2` and `sym_MCP_PROTOCOL_VERSION=3` would read the same for a bundle that carried only
a doc string and an unrelated alias; nothing in `scripts/omp-binary-probe.sh` binds the literal to the
constant or the constant to the `initialize` params. Repro: `grep -n 'lit_2025_11_25\|sym_MCP_PROTOCOL_VERSION' scripts/omp-binary-probe.sh`
shows only `cnt` calls. Proposed additive keys (patch text in `build/K65RevengerOmpInit/findings.md`
§ Proposed strengthenings; the 15 frozen keys keep their values because the change is additive):
`def_MCP_PROTOCOL_VERSION=2025-11-25` (`cnt 'itt = "2025-11-25"'` ≥ 1), `uses_initialize_constant=1`
(`cnt 'protocolVersion: itt'`), `lit_io_modelcontextprotocol=0`.

**K65RevengerOmpInit-3 — low. `lit_2025_03_26=2` is not a harness-client version.** Both hits are the
zai web-search provider's private MCP client (`var Z = "2025-03-26"` at 168226055,
`src/web/search/providers/zai.ts`), so the key must not be read as evidence about omp's own MCP client.
Attacks the entry text that will cite O6's keys, not the count. Repro:
`dd if=~/.local/bin/omp.real bs=1 skip=168225795 count=560 status=none | tr -c '[:print:]' ' '`.

**K65RevengerOmpInit-4 — low. `sym_MCP_PROTOCOL_VERSION=3` over-reads as "three definitions".** It is
one binding (`itt`, types module) plus two re-export shims (`itt as MCP_PROTOCOL_VERSION` at
172988081, 174940921, both `// @bun @bytecode` import blocks). A reader counting symbols as definitions
would be wrong by 2. Repro: `LC_ALL=C grep -a -b -o 'MCP_PROTOCOL_VERSION' ~/.local/bin/omp.real`.

**K65RevengerOmpInit-5 — info (negative evidence, load-bearing for the entry).** The installed release
carries none of the 2026-07-28 draft surface (0 for `2026-07-28`, `server/discover`,
`io.modelcontextprotocol`; no stateless `_meta` field; `_meta.progressToken`/`mcp/www_authenticate`
only). It is the session-based 2025-11-25 client: `initialize` (constant) → `notifications/initialized`
→ `Mcp-Session-Id` on every request → `MCP-Protocol-Version` from the server-echoed value. Repro in
Evidence (4).

**K65RevengerOmpInit-6 — info (epistemic limit to state in the entry).** The bundle carries a readable
JS copy *and* 3,043 `@bun @bytecode` modules; the MCP modules' bytecode shims import/export the same
minified names (`itt`), so the readable copy is almost certainly the live module, but byte inspection
cannot prove which copy executes, nor which header a given server receives.

## Artifacts
- `kumitate-shokunin/.ufo/waves/round-65/build/K65RevengerOmpInit/findings.md` (full per-question write-up, tag hashes, proposed probe patch)
- scratch: `/tmp/kumitate-r65/K65RevengerOmpInit/{counts.txt,ctx_mcpver.txt,http_transport.txt,tag_client.ts,tag_types.ts,tag_transports_http.ts,tag_transports_header-policy.ts}`

## Limits
No dynamic behaviour exercised (only `--version`): which branch runs, what a real server echoes, and
whether a configured `mcp.json` header can reach the wire by another path are unobserved. Tag sources
were fetched from `raw.githubusercontent.com` at `v18.12.6` only (no `main` diff, no repo-wide check
that no *other* file defines a second MCP client constant). Natives addon (116 MB embedded) was not
decompressed. `scripts/` untouched; probe patch is proposal text only.
