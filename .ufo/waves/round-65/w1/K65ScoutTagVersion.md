VERDICT: The tag v18.12.6 declares version 18.12.6 (equal to the installed `omp.real --version`), and its client.ts sends and adopts the protocol version, but the literal `2025-11-25` is NOT in client.ts — it lives only in src/mcp/types.ts, so S205 alone cannot satisfy O4's "a bullet carries 2025-11-25"; a third row (types.ts, proposed S206) is needed, S205 is the one the negotiation claim needs, and S204 is the version pin (needed for O6, redundant for the negotiation content).

## Evidence
Fetch (curl -sSL -A 'Mozilla/5.0 (kumitate-r65)', 2026-10-25), saved under `.ufo/waves/round-65/build/K65ScoutTagVersion/capture/`:
```
package.json status=200 size=16030 sha256 83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b
client.ts    status=200 size=14975 sha256 479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9
types.ts     status=200 size=16167 sha256 caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d   (extra: MCP_PROTOCOL_VERSION definition)
```
URLs: https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/{package.json,src/mcp/client.ts,src/mcp/types.ts}
Commit-pinned URLs (/45c35e40c46166dc726ccc52f5d27f40f2449f99/ same paths) return byte-identical sha256 for all three. `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` → `45c35e40c46166dc726ccc52f5d27f40f2449f99` (lightweight tag; equals the counter's RELEASE_COMMIT, omp65-probe.mjs:46). Raw response: content-type text/plain, cache-control max-age=300.
Installed binary: `OMP_NO_RESTART=1 /home/vgpnk/.local/bin/omp.real --version` → `omp/18.12.6` exit=0. package.json:3 `"version": "18.12.6",` → equal.
Wrapper `/home/vgpnk/.local/bin/omp` (bash script) line 14: `BIN="${OMP_REAL:-$HOME/.local/bin/omp.real}"`; header comment lines 2-5 say v18.12.6 segfaults in pi_natives (crash-restart wrapper installed 2026-10-23); one-shot args (incl. --version) and OMP_NO_RESTART=1 exec BIN directly.
Quote check with the counter's own norm() (extracted from probe/omp65-probe.mjs:57-65 and eval'd; script /tmp/kumitate-r65/K65ScoutTagVersion/q.mjs): all 7 candidate quotes below printed `true` against the saved bytes.
`grep -c 2025-11-25`: package.json 0, client.ts 0, types.ts 6.

Verbatim facts (normalised form; line numbers are of the captured file):
1. package.json:3 — `"version": "18.12.6",`
2. client.ts:100 (inside initializeConnection, client.ts:89-91 declaration, params built at 99-105) — `protocolVersion: MCP_PROTOCOL_VERSION,`; the import is client.ts:41 `import { MCP_PROTOCOL_VERSION } from "./types";`
3. client.ts:120 — `transport.setProtocolVersion?.(result.protocolVersion);` (comment 117-119: "Echo the negotiated protocol version on every subsequent request."). The server's reply is `result = await transport.request<MCPInitializeResult>("initialize", …)` at 107-111. There is NO client-side compare/reject: the client adopts whatever the server returns.
4. client.ts:125 — `await transport.notify("notifications/initialized");` (comment 122-124: sent before the optional GET SSE stream; followed by `onInitialized` at 127).
5. types.ts:181 — `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (doc 170-180: "Latest MCP protocol revision this client negotiates." Sent as `protocolVersion` in the `initialize` request; echoed in the `MCP-Protocol-Version` header; must not go below 2025-11-25 because AWS Bedrock AgentCore Gateway refuses).

## Findings
- K65ScoutTagVersion-1 (high, attacks C2/O4 + row plan): O4 needs >=1 bullet with the literal `2025-11-25` found in a cited row's capture; client.ts and package.json do not contain it. Repro: `grep -c 2025-11-25 .ufo/waves/round-65/build/K65ScoutTagVersion/capture/{package.json,client.ts,types.ts}` → 0,0,6. Fix: cite types.ts as a third row (S206), or a different row already in the plan.
- K65ScoutTagVersion-2 (medium): O1 needs >=3 distinct S ids; S204+S205 give 2. S206 (types.ts) supplies the third and the literal; O6 "real_version pinned by >=2 rows" is met by any two of the three (all URLs carry `/v18.12.6/`).
- K65ScoutTagVersion-3 (low): row URLs using the tag path can move if the tag is re-pointed; the commit URL gives identical bytes today (verified), so the row's anchor cell should record commit 45c35e40c46166dc726ccc52f5d27f40f2449f99 as a recheck anchor while the URL keeps `/v18.12.6/` (O6 accepts either).
- K65ScoutTagVersion-4 (info): the wrapper text itself says v18.12.6 segfaults in a native frame; the probe runs only `omp.real --version` (safe, exit 0).
- K65ScoutTagVersion-5 (info, inference): "the installed release negotiates 2025-11-25" is source-level at the tag; this scout did not read the compiled binary, so binary==source is established only by the version string match (omp/18.12.6) not by byte equivalence. [INFERENCE]

## Recommendation
For an entry about "what the installed release negotiates": S205 (client.ts: sends, adopts, notifies) is required; the constant's value is in types.ts so add S206; S204 is only the version pin — redundant for the negotiation content but cheap and needed to reach 3 rows and a 2-row version pin if S206 is not used. The 3 rows together satisfy O1/O4/O6. S204 and S205 alone leave the literal unquotable (O4 MISS).

Ready-to-paste quote lists (each <= 25 words, normalised-matching):
- S204 — "\"version\": \"18.12.6\","
- S205 — "protocolVersion: MCP_PROTOCOL_VERSION,"
- S205 — "transport.setProtocolVersion?.(result.protocolVersion);"
- S205 — "await transport.notify(\"notifications/initialized\");"
- S206 — "export const MCP_PROTOCOL_VERSION = \"2025-11-25\";"
- S206 — "Latest MCP protocol revision this client negotiates."   (types.ts:170-171; verify before pasting — not run through norm())

Candidate 11-cell rows (cells: id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by; ids/entry path per the counter default `corpus/knowledge/omp-installed-release-mcp-runtime.md`; lane tier code=A):
```
| S204 | oh-my-pi coding-agent package.json at v18.12.6 — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/package.json | code | A | the version the tag declares for the coding-agent package; equals the host's `omp.real --version` (omp/18.12.6) | line 3, quote: "\"version\": \"18.12.6\","; raw file opened 2026-10-25, HTTP 200, 16030 bytes, sha256 83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b; tag v18.12.6 = commit 45c35e40c46166dc726ccc52f5d27f40f2449f99 (git ls-remote, 2026-10-25) | the installed release is pinned to a tag whose source is readable: the version string read from the binary and from the tag agree | mined | 2026-10-25 | 180d | corpus/knowledge/omp-installed-release-mcp-runtime.md |
| S205 | oh-my-pi MCP client at v18.12.6 (initializeConnection) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts | code | A | how the installed release performs the MCP handshake: sends MCP_PROTOCOL_VERSION as protocolVersion, adopts the server's returned version for later requests with no client-side comparison, then sends notifications/initialized | initializeConnection lines 89-130; quotes: "protocolVersion: MCP_PROTOCOL_VERSION," (l.100), "transport.setProtocolVersion?.(result.protocolVersion);" (l.120), "await transport.notify(\"notifications/initialized\");" (l.125); raw file opened 2026-10-25, HTTP 200, 14975 bytes, sha256 479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9 | the host accepts whichever protocol version a server answers and echoes it on every subsequent request; the version it asks for is the constant in types.ts | mined | 2026-10-25 | 180d | corpus/knowledge/omp-installed-release-mcp-runtime.md |
| S206 | oh-my-pi MCP types at v18.12.6 (MCP_PROTOCOL_VERSION) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/types.ts | code | A | the protocol revision the installed release requests: "2025-11-25", with the stated reason (a gateway refuses older versions) | line 181, quote: "export const MCP_PROTOCOL_VERSION = \"2025-11-25\";"; doc comment lines 170-180; raw file opened 2026-10-25, HTTP 200, 16167 bytes, sha256 caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d | the installed release asks for MCP 2025-11-25 and the source says it must track the current stable revision | mined | 2026-10-25 | 180d | corpus/knowledge/omp-installed-release-mcp-runtime.md |
```
Pin entries for `.ufo/pins/source-captures.json` (L1 appends): sourceId/path/sha256/bytes as above with captured 2026-10-25; capture paths currently `.ufo/waves/round-65/build/K65ScoutTagVersion/capture/{package.json,client.ts,types.ts}` (the counter reads each by `git archive`, so the L1 must commit them at the pinned path). The S-ids are placeholders for the L1's assignment (registry continues at S201).

## Artifacts
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ScoutTagVersion/capture/package.json, client.ts, types.ts
- /tmp/kumitate-r65/K65ScoutTagVersion/q.mjs (quote checker, uses the frozen norm()), types.ts copy

## Limits
Did not edit the registry or pins; did not run the full probe; did not check S206's second quote with norm(); did not read the compiled binary beyond `--version`; did not verify `used-by` entry/`## Located quotes` shape beyond the counter's text; S-ids are proposals, not allocated; raw.githubusercontent fetched once per URL plus one commit-path re-fetch (no live O5 run from the counter).
