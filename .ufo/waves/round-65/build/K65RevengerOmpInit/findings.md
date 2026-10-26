# K65RevengerOmpInit — how the installed OMP release uses its MCP protocol constant

Subject: `/home/vgpnk/.local/bin/omp.real` (256,702,432 bytes, ELF x86-64, Bun-compiled bundle,
`sha256=85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`), wrapper
`/home/vgpnk/.local/bin/omp` (bash restart wrapper, `BIN=…/omp.real`), installed version
`omp/18.12.6` (`OMP_NO_RESTART=1 ~/.local/bin/omp.real --version`, exit 0). Method: read-only byte
inspection with `LC_ALL=C grep -a -b -o` and `dd` windows; the binary was never executed except
`--version`.

Serialised emitted lines (single run, cached once):
`counts.txt` → `2025-11-25 2`, `2026-07-28 0`, `2025-03-26 2`, `2024-11-05 0`, `2025-06-18 0`,
`server/discover 0`, `MCP-Protocol-Version 3`, `MCP_PROTOCOL_VERSION 3`, `protocolVersion 16`,
`Mcp-Session-Id 10`, `_meta 50`, `io.modelcontextprotocol 0`, `18.12.6 9`.

## (1) Where the constant is defined, value expression

Byte offset 156,887,599 carries the module marker `// packages/coding-agent/src/mcp/types.ts`; at
156,887,738 the readable JS reads (window `dd skip=156887045 count=1400`, non-printables → spaces):

```
// packages/coding-agent/src/mcp/types.ts var rtt = "https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/config/mcp-schema.json"; var itt = "2025-11-25"; var JB = { PROGRESS: "notifications/progress", TOOLS_LIST_CHANGED: "notifications/tools/list_changed", ...
```

So the bundle's local name is `itt`, a `var` bound to the string literal `"2025-11-25"`; the next
`var` (`JB`) is the notification-method table of the same module. `MCP_PROTOCOL_VERSION` appears
only as an *export alias* of `itt` (see (5)-adjacent export shims at 172,988,081 and 174,940,921:
`itt as MCP_PROTOCOL_VERSION`).

Command:
`LC_ALL=C grep -a -b -o -F 'itt = "2025-11-25"' /home/vgpnk/.local/bin/omp.real` → `156887738:itt = "2025-11-25"`.

## (2) Which function sends `initialize`, and is `protocolVersion` the constant

Yes — `protocolVersion: itt`. Exactly one request site exists
(`LC_ALL=C grep -a -o 'request("initialize"' … | wc -l` → `1`). Offsets: `async function tTe(` at
156,938,924; `request("initialize", R,` at 156,939,099. Window `dd skip=156938269 count=1600`:

```
Qke = { name: "omp-coding-agent", version: "1.0.0" }; async function Zke(u, p) { switch (u) { case "ping": return {}; case "roots/list": { ... } default: throw Object.assign(new Error(`Unsupported server request: ${u}`), { code: -32601 }); } } async function eTe(u, p) { const R = u.type ?? "stdio"; switch (R) { case "stdio": return Q1e(u); case "http": return K1e(u); case "sse": return att(u, p); default: throw new Error(`Unknown server type: ${R}`); } } async function tTe(u, p) { const R = { protocolVersion: itt, capabilities: { roots: { listChanged: false } }, clientInfo: Qke }; const T = await u.request("initialize", R, { signal: p?.signal }); if (p?.signal?.aborted) { throw p.signal.reason instanceof Error ? p.signal.reason : new Error("Aborted"); } u.setProtocolVersion?.(T.protocolVersion); await u.notify("notifications/initialized"); await p?.onInitialized?.(); return T; }
```

Tag counterpart `packages/coding-agent/src/mcp/client.ts:91-133` (`initializeConnection`, declared at line 91):
`protocolVersion: MCP_PROTOCOL_VERSION` (line 100), `transport.request<MCPInitializeResult>("initialize", …)`,
then `transport.setProtocolVersion?.(result.protocolVersion)` (line 120) with the comment
"Echo the negotiated protocol version on every subsequent request". Same constant, same clientInfo
(`CLIENT_INFO = { name: "omp-coding-agent", version: "1.0.0" }`, `client.ts:44`), same
`capabilities: { roots: { listChanged: false } }`, same `notifications/initialized` after the
response and before `onInitialized`. `protocolVersion: itt` occurs exactly once
(`grep -a -o 'protocolVersion: itt' | wc -l` → `1`).

Two *other* MCP-shaped clients exist in the same bundle and are not the harness client:
`protocolVersion: Z` where `var Z = "2025-03-26"` in the zai web-search provider
(`src/web/search/providers/zai.ts`, offset 168,226,055) and `protocolVersion: Agt` for ACP
(offset 169,602,313). Remaining `protocolVersion` literals are RPC v1/v2 negotiation
(`protocolVersion !== 2`, `protocolVersion: 1`, `supportedProtocolVersions: [1, 2]`) and type/doc
strings (`protocolVersion?`, `"protocolVersion": "number.integer"`, `protocolVersion: "1.3"`).

## (3) Is `MCP-Protocol-Version` set from negotiated or constant?

From the **negotiated** value, and only after `initialize` returns. `MCP-Protocol-Version` occurs 3
times total: the string pool (97,765,996), and the two `#fetch` sites (156,898,767 / 156,898,831).
Class `Y1e` at 156,898,407 (module marker `// packages/coding-agent/src/mcp/transports/http.ts` at
156,897,833):

```
class Y1e { config; #e = false; #t = null; #n = null; #r = new sj; #o = new Map; #i = new AbortController; #s = new Set; #a = new Set; #l = new Set; #c = null; #d = null; ... #p(u, p) { const R = txt(this.config.headers, "MCP-Protocol-Version"); const T = this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }; const M = X1e(this.config.url, u, { generated: T, configured: R }, this.config.headerPolicy === "origin-locked");
…
setProtocolVersion(u) { this.#d = u; }
```

`#d` is the private negotiated-version slot, written only by `setProtocolVersion` (offset
156,899,637), which the client calls with the *server's* echoed `result.protocolVersion`. Before
negotiation `#d === null` → no header from the transport. The literal `MCP-Protocol-Version`
appears nowhere else, so stdio and legacy-SSE transports never send it. `txt()` is
`withoutHeader` (strips any user-configured copy) and `Zvt` is `mergeMCPHeaders`
(`{ ...configured, ...generated }`, generated wins). Tag `transports/http.ts:98-127` (`#fetch` at line 124) is
line-for-line the same logic, including the comment "`null` until the `initialize` response is
negotiated" and "no protocol-version header is sent from either source" before negotiation; tag
`transports/header-policy.ts:28-37,58-73` gives the same strip/merge precedence.

Additional negotiation-adjacent state: `#t` carries the `Mcp-Session-Id` response header back on
every request (bundle has 10 `Mcp-Session-Id` sites).

## (4) 2026-07-28 / stateless `_meta` / `server/discover`

All zero, i.e. absent:

| literal | count |
|---|---|
| `2026-07-28` | 0 |
| `server/discover` | 0 |
| `io.modelcontextprotocol` | 0 |
| `2024-11-05` | 0 |
| `2025-06-18` | 0 |
| `_meta.` | 2 (both `_meta.steering.supported` / `_meta.steering.queue` — ACP extension, in the embedded 18.12.6 CHANGELOG text at 252,999,512 / 252,999,670) |

The 50 `_meta` hits are substring noise or non-MCP: Bun internals (`_import_meta`, `__metadata`,
`cpu_profiler_metadata_size`), Tracy `"__metadata"` thread frames, `session_meta`,
`resource_metadata`, `internal_chat_message_metadata_passthrough`, and one ACP `_meta` in the ACP
capability table (94,615,604). Tag source agrees: the only `_meta` members are the ordinary MCP
ones (`types.ts:261,292` generic `_meta?`, 278 `mcp/www_authenticate`, 303
`_meta.progressToken`). No stateless-transport `_meta` field and no discover method exist in the
installed release: it is the session-based 2025-11-25 model (`initialize` →
`notifications/initialized` → `Mcp-Session-Id`).

## (5) Package version `18.12.6` in the bundle — 9 sites

| offset | context (window ±120 B) |
|---|---|
| 96,005,424 | string/const pool: `… k 18.12.6 J Coding agent CLI with read, bash, edit, write tools and session management n coding-agent … e https://omp.sh` |
| 147,615,522 | `// packages/natives/package.json var V = { name: "@oh-my-pi/pi-natives", version: "18.12.6", … }` |
| 147,618,607 | `packages/natives/native/embedded-addon.js var l = { platformTag: "linux-x64", version: "18.12.6", files: [ { variant: "modern", filename: "pi_natives.linux-x64-modern.node", size: 116389144, … }` |
| 147,633,011 | `// packages/utils/package.json var p0 = "18.12.6";` |
| 148,842,174 | `// packages/ai/package.json var c = { name: "@oh-my-pi/pi-ai", version: "18.12.6", … }` |
| 151,991,040 | `// packages/coding-agent/package.json var mx = { name: "@oh-my-pi/pi-coding-agent", version: "18.12.6", … }` |
| 152,114,306 | `// packages/mnemopi/package.json var Pr = { … "version": "18.12.6", … }` |
| 252,999,416 | embedded `# Changelog … ## [18.12.6] - 2026-10-21 ### Added - Added the \`_session/steering\` ACP extension …` |
| 256,648,610 | docs snippet `--user-agent=omp/18.12.6 \ ---- Bun! ----` |

Six of nine are per-package `package.json` embeds; the version emitted by `--version` is
`omp/18.12.6`, consistent with the `coding-agent/package.json` embed at 151,991,040.

## (6) Do the embedded snippets match the v18.12.6 tag source logic

Fetched (curl, exit 0) into scratch; `sha256` of the fetched bytes:
`tag_client.ts 479aef6d…`, `tag_types.ts caa3eade…`, `tag_transports_http.ts 41ad7d5b…`,
`tag_transports_header-policy.ts 121feae9…` (full hashes in the report).

| concern | tag source | bundle (minified) | verdict |
|---|---|---|---|
| constant | `types.ts:181 export const MCP_PROTOCOL_VERSION = "2025-11-25";` | `var itt = "2025-11-25";` @156887738 in `types.ts` section | identical value, different binding form (`const` → `var` is the bundler's normalisation) |
| initialize params | `client.ts:100 protocolVersion: MCP_PROTOCOL_VERSION`, `capabilities.roots.listChanged=false`, `clientInfo: CLIENT_INFO` | `tTe`: `protocolVersion: itt, capabilities: { roots: { listChanged: false } }, clientInfo: Qke` | identical |
| post-initialize echo | `client.ts:120 transport.setProtocolVersion?.(result.protocolVersion)` | `u.setProtocolVersion?.(T.protocolVersion)` | identical, optional-call preserved |
| initialized notification order | `client.ts:126 await transport.notify("notifications/initialized")` then `onInitialized` | same two statements, same order | identical |
| header source | `http.ts:125-127 withoutHeader(config.headers, …)`, `#protocolVersion === null ? generated : { "MCP-Protocol-Version": this.#protocolVersion, ...generated }` | `#p`: `txt(this.config.headers, "MCP-Protocol-Version")`, `this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }` | identical shape and operator precedence |
| header precedence | `mergeMCPHeaders`: configured entries whose lowercased name collides are dropped, then `{ ...merged, ...generated }` | `Zvt`: same set-based drop then `{ ...T, ...u }` (u = generated) | identical |
| negotiated-version init | `http.ts:104 #protocolVersion: string \| null = null` | `#d = null` in the class field block | identical |
| version validation | none in tag source (echoes whatever the server returns) | none in bundle (`T.protocolVersion` used verbatim) | identical — and matches the tag comment "a server that supports only an older revision may reject a header carrying a newer version" |

Divergence found: none in logic. The bundle also contains things the tag files I fetched do not
(the `2025-03-26` zai client is a different module), which is expected.

## What byte inspection can show, and what it cannot

Can show: presence and count of literal bytes; the definition site and its exact value expression;
the identifier graph of the readable JS copies (which slot the header reads, which constant the
initialize params use); module provenance comments (`// packages/coding-agent/src/mcp/types.ts`)
that let a snippet be matched to a tag path; and that the bundle embeds the release's own
CHANGELOG for 18.12.6.

Cannot show: which of the two copies executes — the bundle contains a readable JS copy (around
156.8–156.9 MB) *and* `// @bun @bytecode` export shims (3,043 `@bun @bytecode` markers; e.g. at
172,988,081 `import { rtt, itt, JB, ij } … export { … itt as MCP_PROTOCOL_VERSION … }`), and the
bytecode chunks themselves are opaque to text grep. The `itt` identifier is identical in both, which
is strong but not conclusive evidence that the readable copy is the live module. Nothing here shows
which header a given server actually receives (that depends on the server's echoed
`protocolVersion`), whether a configured `mcp.json` header could still reach the wire through a
different path, or any runtime branch/error path. No dynamic behaviour was exercised.

## Proposed strengthenings (patch text only — this seat does not edit `scripts/`)

The frozen C2 probe measures `lit_2025_11_25=2` — the *presence* of the literal. The value
expression itself is measurable and currently unmeasured, so a bundle that carried only a doc
comment would still read 2. Proposed added keys for `scripts/omp-binary-probe.sh` (additive; the
15 frozen keys keep their values):

```sh
rustc_def() { grep -a -o -F -- "$1" "$R" | wc -l | tr -d ' '; }
echo "OMP_BIN: def_MCP_PROTOCOL_VERSION=$( [ "$(rustc_def 'itt = "2025-11-25"')" -ge 1 ] && echo 2025-11-25 || echo unknown )"
echo "OMP_BIN: uses_initialize_constant=$(rustc_def 'protocolVersion: itt')"
echo "OMP_BIN: lit_io_modelcontextprotocol=$(cnt 'io.modelcontextprotocol')"
```

Observed values on this host: `def_MCP_PROTOCOL_VERSION=2025-11-25`, `uses_initialize_constant=1`,
`lit_io_modelcontextprotocol=0`. Also worth a comment next to `lit_2025_03_26`: its 2 hits are the
zai web-search provider's private client constant (`src/web/search/providers/zai.ts`), not the
harness client, so the key must not be read as a harness-client version.
