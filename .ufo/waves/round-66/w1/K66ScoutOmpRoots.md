VERDICT: OMP v18.12.6 — pinned capture S204 and live tag byte-identical — declares the MCP `roots` client capability (line 102) and answers `roots/list` (lines 59–64), still routes `type: "sse"` to the legacy SSE transport, and the installed binary `~/.local/bin/omp` contains all of it compiled in; upstream `main` is byte-identical to v18.12.6 on client.ts and still ships transports/sse.ts, so no deprecation removal has landed upstream.

## Evidence

1. S204 path from `.ufo/pins/source-captures.json`: `.ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts`, bytes 14975, sha256 `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9`.
2. Live fetch of the tag file: `curl -sS https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts` → 14975 bytes, sha256 `479aef6d…d3fe9` — **byte-identical to S204** (build/.../evidence/hashes.txt).
3. `grep -n -i 'root' <capture>` verbatim hits:
   - `51: * Handles \`ping\` and \`roots/list\`; rejects unknown methods with -32601.`
   - `59: 		case "roots/list": {` / `62: 				roots: [{ uri: url.pathToFileURL(cwd).href, name: path.basename(cwd) }],`
   - `102: 			roots: { listChanged: false },` (inside `capabilities: {` at line 101)
   - `171: // Always handle standard MCP server-to-client requests (ping, roots/list).` / `172: // The initialize request declares roots capability, so we must respond to` / `173: // roots/list — even for short-lived test connections.`
   - sse routing: `11: import { LegacySseConnectionTimeoutError, createSseTransport } from "./transports/sse";` / `81: case "sse":` / `82: return createSseTransport(config as MCPSseServerConfig, signal);`
4. Upstream main: `curl -sS https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/mcp/client.ts` → 14975 bytes, sha256 `479aef6d…d3fe9` — byte-identical to v18.12.6. GitHub API listings of `packages/coding-agent/src/mcp/transports` for `main` and `?ref=v18.12.6` both contain `sse.ts 15183` (with header-policy.ts 5294, http.ts 33157, index.ts 107, stdio.ts 35957 — whole dir identical). Fetched main and v18 sse.ts both sha256 `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`; inside: `39: export class LegacySseConnectionTimeoutError extends Error {`, `47: export class LegacySseTransport implements MCPTransport {`, `138: throw new LegacySseConnectionTimeoutError(timeout);`.
5. Installed binary (read bytes only): `~/.local/bin/omp` is an ELF 64-bit x86-64 executable, 275986608 bytes. Seat spec named `~/.local/bin/omp.real`; that path does not exist (only `omp` and `omp-swarm` in ~/.local/bin) — checks run against `omp`:
   - `grep -a -c -F 'roots/list' ~/.local/bin/omp` → `3`; contexts: bare `roots/list`, `    case "roots/list": {`, `      case "roots/list":`
   - `grep -a -c -F 'LegacySseConnectionTimeoutError' ~/.local/bin/omp` → `4`; contexts include `    this.name = "LegacySseConnectionTimeoutError";`
   - `grep -a -c -F 'sse.ts' ~/.local/bin/omp` → `2`; contexts: `// packages/coding-agent/src/mcp/transports/sse.ts`, `// packages/tui/src/apps/debug/raw-sse.ts`
   - `grep -a -c -F 'listChanged' ~/.local/bin/omp` → `5`, including `      roots: { listChanged: false }`; `getProjectDir` → 3; `omp-coding-agent` → 4.

## Findings

1. **K66ScoutOmpRoots-1** (info; supports C2 M7 located quotes, S204 citation). The exact capability declaration is capture line 102 `roots: { listChanged: false },` and the `roots/list` answer is lines 59–64 (`case "roots/list": { const cwd = getProjectDir(); return { roots: [{ uri: url.pathToFileURL(cwd).href, name: path.basename(cwd) }] }; }`). S204 is byte-identical to the live v18.12.6 file (sha256 match), so the capture can be quoted by line number as a faithful stand-in for the URL. Repro: `sha256sum .ufo/waves/round-65/build/Capture/omp-v18.12.6-mcp-client.ts` vs `curl -sS https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts | sha256sum`.
2. **K66ScoutOmpRoots-2** (info; coverage of "still present upstream"). `main`'s client.ts is byte-identical to v18.12.6 and `transports/sse.ts` exists in both refs at the same hash `0b69229a…` — the `roots/list` handler, the roots capability declaration, and the legacy SSE transport are all still present in upstream main as of 2026-10-27; neither the Roots removal ("First revision released on or after 2027-07-28") nor the HTTP+SSE clock ("Three months after SEP-2596 reaches Final") has any upstream removal commit behind it yet. Repro: `curl -sS https://raw.githubusercontent.com/can1357/oh-my-pi/main/packages/coding-agent/src/mcp/client.ts | sha256sum` and `curl -sS 'https://api.github.com/repos/can1357/oh-my-pi/contents/packages/coding-agent/src/mcp/transports'`.
3. **K66ScoutOmpRoots-3** (info; bearing on the installed release). The installed release embeds both deprecated features compiled in: the roots/list handler (`case "roots/list": {` ×2 in the bundle), the capability declaration (`roots: { listChanged: false }`), and the legacy SSE transport (`LegacySseConnectionTimeoutError` class body + sourcemap path `// packages/coding-agent/src/mcp/transports/sse.ts`). Presence only — not proof the host exercises either path at run time (matches C2's stated limit). Repro: the grep commands in Evidence item 5.
4. **K66ScoutOmpRoots-4** (minor; host/spec discrepancy, reported not patched). The frozen-adjacent seat spec and C2 framing reference `~/.local/bin/omp.real`; on this host only `~/.local/bin/omp` (ELF, not stripped, 275986608 bytes) exists. The authorized `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` could not be run (file absent) and executing `omp` itself was not authorized, so "installed release = v18.12.6" rests on the round context's stipulation plus the binary's embedded v18.12.6 source strings, not on a `--version` run. Repro: `ls -la ~/.local/bin/ | grep omp`.

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpRoots/bearing-section.md` — ready-to-integrate `## Bearing on the installed OMP release` draft (9 lines, ≤25), citing S204 by path+sha256, naming `roots` and `HTTP+SSE`, and citing the sse.ts row by URL `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts`.
- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpRoots/evidence/hashes.txt` — all byte counts and sha256 sums, incl. capture↔tag↔main comparisons and binary grep counts.
- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpRoots/evidence/s204-roots-lines.txt` — verbatim numbered lines (S204/main client.ts roots + sse.ts).
- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpRoots/evidence/binary-grep.txt` — installed-binary match counts and contexts.
- `kumitate-shokunin/.ufo/waves/round-66/build/K66ScoutOmpRoots/evidence/{live-v18.12.6-client.ts,main-client.ts,v18-sse.ts,main-sse.ts}` — fetched source receipts.

## Limits

- Byte checks are presence-only; no runtime tracing of whether `roots/list` or the SSE transport is exercised (stated limit of C2, respected).
- `omp --version` was not run (not authorized; `omp.real` absent) — release identity taken from round context and embedded source strings.
- The two `case "roots/list":` sites in the bundle were not attributed to their respective chunks/packages beyond the sourcemap sse.ts paths.
- Registry rows (Deprecated Features page, feature-lifecycle policy) were not re-verified here; that grounding belongs to the C2 entry seats (S207+).
