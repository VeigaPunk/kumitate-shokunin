source: S201 — OMP v18.12.6 source, packages/coding-agent/src/mcp/types.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/coding-agent/src/mcp/types.ts — § MCP Protocol Types: `MCP_PROTOCOL_VERSION` (:181) and the optional `MCPTransport.setProtocolVersion` (:320-326)
source: S202 — OMP v18.12.6 documentation, MCP runtime lifecycle — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md — § Lifecycle at a glance, § Fast startup gate and deferred fallback, § Tool calls, § Health, reconnect, and partial failure behavior
source: S203 — OMP commit 10bce6900b5bdcf7479ed718f52902feeab9ed00, "fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25" — https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch — the patch that moved the constant off 2025-03-26 and added the header echo
verified-at: 2026-10-25 (host `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → `omp/18.12.6`; `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` → 45c35e40c46166dc726ccc52f5d27f40f2449f99; the three captures hashed byte-identical to their live URLs; `bash scripts/omp-binary-probe.sh` exit 0 with 15 keys)
recheck: 90d — `bash scripts/omp-binary-probe.sh` (the two keys that decide this entry are `real_version` and `lit_2026_07_28`) and `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` → 45c35e40…; if `real_version` moves, re-open S201/S202/S203 at the new tag before reusing any sentence below
coverage-map: frontier band "OMP harness contract (task batch, agent hub, agent discovery)" (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — the installed-release half of the OMP harness contract: the lane's OMP entries read upstream `main`; this entry measures the binary that is on the host and states where the documentation at `main` is, and is not, the documentation of the installed release

# The installed OMP release negotiates MCP 2025-11-25 — per client, and the docs are not the measurement

`corpus/knowledge/omp-task-contract.md` § Version skew admits the gap this entry closes in its own
words: the documentation is upstream `main`, and "the binary's version was observed, but its
implementation was not inspected". The staged text on this theme answered with documentation and
prose. This entry answers with three rows opened at the **tag of the installed release**
(`v18.12.6` = `45c35e40c46166dc726ccc52f5d27f40f2449f99`, the commit `git ls-remote` returns and
`base/omp-release-tag.txt` froze) plus a read-only byte sweep of the release binary
(`scripts/omp-binary-probe.sh`, 15 keys, no execution beyond `<binary> --version`).

The shape of the finding is not "OMP is on 2025-11-25". It is three narrower sentences: the
coding-agent MCP client sends `2025-11-25` at `initialize` and then echoes **the server's answer**
in a header; the same release bundles a **second** MCP client, for Z.AI web search, pinned to
`2025-03-26`; and for the two pages inspected, the documentation at `main` is byte-identical to the
tag, so the skew the lane has been naming is not documentation drift but the documentation's own
distance from the binary. Each claim below carries the key or the byte context that would kill it.

## Decision table — question, answer, evidence, falsifier

| # | question | answer | evidence | what would falsify it |
| --- | --- | --- | --- | --- |
| D1 | Which MCP protocol revision does the installed OMP negotiate? | The **coding-agent** MCP client sends `2025-11-25` in `initialize`, then records the server's returned revision and puts **that** in the `MCP-Protocol-Version` header of subsequent HTTP requests; the header is absent until then (`#protocolVersion: string | null = null`, `http.ts:104,127`). The release installed here reports `18.12.6`. | S201 (:181 constant, :173 "Sent as `protocolVersion` in the `initialize` request"); S203 (`transport.setProtocolVersion?.(result.protocolVersion)`); keys `lit_2025_11_25=2`, `sym_MCP_PROTOCOL_VERSION=3`, `header_MCP-Protocol-Version=3`; the binary is `85d9daf3…`, 256,702,432 bytes; the tag's `http.ts` (33,157 bytes, sha256 `41ad7d5b…`) and the compiled chunk at byte 156,898,767 agree (`this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }`) | an `initialize` capture from the installed binary showing a different `protocolVersion`, or a rebuild whose constant is not `2025-11-25` |
| D2 | Does the installed binary carry the 2026-07-28 revision? | **No literal**: `2026-07-28` occurs 0 times in 256,702,432 bytes, and neither does the neighbouring `2025-06-18` (both direct sweeps); the doc page never names either. This is not "cannot send 2026-07-28": the header carries whatever revision the server returned, so a server-chosen `2026-07-28` can reach the wire without the string existing in the binary. | key `lit_2026_07_28=0`; direct sweep `grep -a -o -F '2025-06-18' ~/.local/bin/omp.real \| wc -l` → 0; S201 `setProtocolVersion?(version: string): void` takes an arbitrary string | a sweep counting `>0`, or a header capture carrying `2026-07-28` — the latter would not falsify the literal-absence claim, only the "never sent" reading |
| D3 | Is the documentation at `main` the documentation of the installed release? | **For the two pages inspected, byte for byte yes**: `docs/mcp-runtime-lifecycle.md` and `src/mcp/transports/http.ts` at `v18.12.6` are each identical to their `main` copies (22,741 bytes sha256 `362acea5…`; 33,157 bytes sha256 `41ad7d5b…`). Skew is not documentation drift here; it is doc-versus-binary (D4) and the two-client split (below). | S202 capture; live `main` fetches `cmp`-identical to the tag fetches | a non-empty diff between the tag and `main` copies of either page |
| D4 | Does the binary embed its docs? | **Not the sentences measured.** The runtime doc's "never replayed automatically" occurs 0 times in the release bytes while S202 §Tool calls carries it, and the doc's own H1 (`# MCP runtime lifecycle`) and the collab doc's heading occur 0 times too (direct sweeps). Three probes, not a sweep of the doc tree. | key `docs_phrase_never_replayed=0`; the two heading sweeps; S202 §Tool calls quote | a count `>0` for that phrase or either heading, or any doc sentence found verbatim in the bytes |
| D5 | Is the version pin deliberate (commit 10bce690)? | **Yes as a dated, described, tested change — and no more.** The commit moved off "the stale 2025-03-26 revision" to "the current stable 2025-11-25", names the AWS Bedrock failure it fixes, adds a test and a changelog row, and closes #8264. It never says why it stopped at `2025-11-25` rather than a later revision; that part stays open. | S203 subject, body and `Fixes #8264`; the removed `const PROTOCOL_VERSION = "2025-03-26";` hunk; `sym_MCP_PROTOCOL_VERSION=3`; an in-binary `## [18.12.6]` heading among 43 changelog headings binds the measured version to a release date | a later commit or changelog announcing a move past `2025-11-25`, or the commit unreachable at the tag |
| D6 | What does the wrapper change? | `omp` on `PATH` is a **1,680-byte bash script** that `exec`s `~/.local/bin/omp.real`; one-shot flags (`-p`, `--print`, `--mode=*`, `--version`, …) pass through once; interactive sessions **restart on exit 132–139**, 3 s backoff, **max 5**, appending `-c`. Every `omp --version` the lane has ever recorded is wrapper-mediated; the release's crash behaviour is hidden behind restarts. | keys `wrapper_is_script=1`, `wrapper_names_real=omp.real`, `wrapper_restart_codes=132-139`, `wrapper_max_restarts=5`; the wrapper's own header comment | `head -c 2 "$(command -v omp)"` not `#!`, a different code set or restart cap, or `omp` resolving to the ELF |

## What the release does with the revision

The path is short and the release's bytes follow the tag's source through it. `initialize` is sent
with `protocolVersion: MCP_PROTOCOL_VERSION` (S201:173-181; `client.ts:100` at the tag). Immediately
after the response, the client hands the **server's** `result.protocolVersion` to the transport
(`client.ts:120`, S203's added line). The HTTP transport keeps it in a field that starts `null` and
spreads it into the generated headers only when set (`http.ts:104,127,131`), so the header rides
GET, POST and DELETE alike *after* the handshake and is not sent on `initialize` itself. The stdio
transport simply omits the optional `setProtocolVersion?` (S201:322-326). The compiled release
matches this shape, not the earlier unconditional form the 10bce690 patch first wrote. Read at byte
offsets on this binary (2026-10-25, read-only): `#d = null` (156,898,627) is the field init,
`this.#d === null ? p : { "MCP-Protocol-Version": this.#d, ...p }` (156,898,767) is the guard,
`setProtocolVersion(u) { this.#d = u; }` (156,899,600) is the setter, `protocolVersion: itt` with
`itt = "2025-11-25"` (156,938,965) is what `initialize` sends, and
`u.setProtocolVersion?.(T.protocolVersion)` immediately before `notifications/initialized`
(156,939,265) is the adoption of the server's answer. That is the first evidence in the lane that a
source page and the shipped binary agree at the level of a specific branch, rather than at the level
of a version string.

The failure mode the pin fixes is worth keeping: before 10bce690 the client pinned `2025-03-26` and
never emitted the header, and spec-current servers denied every `tools/call` with a generic internal
error (S203 body). The symptom is at tool-call time, on a connection that looks healthy — the same
shape as the runtime failures S202 describes, which is why the two rows belong together.

## Two MCP clients, two revisions, one binary

The sweep's `lit_2025_11_25=2` and `lit_2025_03_26=2` are a coincidence, not a staleness reading.
Read at byte offsets (2026-10-25, read-only `dd` around each hit):

- 156,887,745 — `var itt = "2025-11-25";` in the compiled coding-agent chunk, right after the
  embedded `mcp-schema.json` URL: the live constant.
- 96,215,872 — the same string inside the embedded `mcp-schema.json` text: an asset, not code.
- 168,226,055 — `var Z = "2025-03-26";` in the Z.AI web-search provider, whose `initialize` sends
  `protocolVersion: Z` and whose transport sets `Mcp-Session-Id` by hand; the tag's
  `packages/coding-agent/src/web/search/providers/zai.ts:80` carries the same literal as
  `ZAI_MCP_PROTOCOL_VERSION` (https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts,
  12,774 bytes, sha256 `0598c9f2…`, fetched 2026-10-25).
- 99,174,972 — the same literal in that chunk's strings table.

So the installed harness runs two MCP clients on two revisions. A sweep count cannot tell them
apart, and neither can a single "OMP negotiates X" sentence; the sentence has to name the client.
The Z.AI one is a private client for one search provider, not the general MCP server path. Both
source reads in this section and in § What the release does (this file and `mcp/transports/http.ts`,
https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts,
sha256 `41ad7d5b…`) are cited here with URL and digest because the lane has no row for them yet; if
a cited path must be a row, they become two rows and the two sentences re-point, nothing else.

## What the runtime does around the version (S202)

A revision mismatch never surfaces in a vacuum; it surfaces inside this lifecycle. Startup opens
the transport and performs `initialize` with `2025-11-25`; a 250 ms fast-startup gate (overridable
by `OMP_MCP_STARTUP_TIMEOUT_MS`, `mcp.startupTimeoutMs`, or `0` to wait) decides whether a slow
server blocks or is deferred, and the deferred path builds `DeferredMCPTools` from
`MCPToolCache.get` and registers the real tools later via `#onToolsChanged`. Once connected, a
connection loss after a request may have reached the server is non-retryable and "never replayed
automatically" — the client will not double-execute a tool call; refused connections are retried;
reconnects back off at 500/1000/2000/4000 ms. The practical consequence: if a server rejects
`tools/call` because of the revision (D5's failure), the transport still reads connected, the tools
still list, and the error arrives per call — the shape a version fault takes from the outside.

## Located quotes

- S201 — "export const MCP_PROTOCOL_VERSION = "2025-11-25";"
- S201 — "Latest MCP protocol revision this client negotiates."
- S201 — "Based on MCP specification 2025-11-25:"
- S201 — "Streamable HTTP transports echo it in the MCP-Protocol-Version header on"
- S202 — "performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability"
- S202 — "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"
- S202 — "use cached tool definitions if available (MCPToolCache.get) to create DeferredMCPTools"
- S202 — "Reconnect retries with backoff (500, 1000, 2000, 4000 ms)"
- S203 — "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision."
- S203 — "Bump the negotiated version to the current stable 2025-11-25 (MCP_PROTOCOL_VERSION)"
- S203 — "const PROTOCOL_VERSION = "2025-03-26";"
- S203 — "transport.setProtocolVersion?.(result.protocolVersion);"

## Host measurements

- wrapper_is_script=1
- wrapper_names_real=omp.real
- wrapper_restart_codes=132-139
- wrapper_max_restarts=5
- real_is_elf=1
- real_bytes=256702432
- real_version=18.12.6
- lit_2025_11_25=2
- lit_2026_07_28=0
- lit_2025_03_26=2
- sym_MCP_PROTOCOL_VERSION=3
- header_MCP-Protocol-Version=3
- sym_DeferredMCPTool=3
- collab_hosts_literal=2
- docs_phrase_never_replayed=0

Provenance: `bash scripts/omp-binary-probe.sh` exits 0 and prints exactly these 15 keys
(`OMP_BIN_PROBE: DONE omp=18.12.6`); two independent runs print byte-identical output. `real_version`
is `18.12.6`, which is the tag both pinned rows carry in their URL (`/v18.12.6/`,
`/45c35e40c46166dc726ccc52f5d27f40f2449f99/`). The counts are a byte sweep of a 256,702,432-byte
ELF: they prove presence, not use, and `lit_2025_03_26=2` is the Z.AI client, not the coding-agent
client (§ Two MCP clients). Wrapper bytes: `~/.local/bin/omp` is 1,680 bytes, sha256 `ed62a41e…`.
Three facts used above are direct reads rather than probe keys, and were measured the same day:
`sha256sum ~/.local/bin/omp.real` → `85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`
(the binary this entry describes); `= "2025-11-25"` occurs once and `2025-06-18` zero times in those
bytes (module-scope declaration, no neighbouring revision); an in-binary `## [18.12.6] - <date>`
heading sits among 43 changelog version headings, binding the measured version to a release date read
from bytes. This block and the probe are one artifact: O6 compares their key sets in both
directions, so a probe that prints a key this block omits — or a block that states a key the probe
does not print — reads `stated-not-live`; if a hardened probe lands, the block is swapped with it
(`build/K65ScribeEntryB/host-measurements-blocks.md`).

## What the staged text said, and what survives

Three corrections, each already reflected above. (1) "OMP negotiates 2025-11-25, not 2026-07-28"
is stronger than the documents support: the doc says the client performs `initialize` *using*
`2025-11-25` and separately records the server's negotiated revision, and the absence of
`2026-07-28` is a binary fact, not a doc fact. (2) "the documentation is upstream `main`, so it is
not the installed release" is true of the corpus's original reading but not of these bytes: the two
pages measured are identical at the tag and at `main`; what differs is the binary (D4) and the
release's second client. (3) The staged entry's ids `S198`/`S199` collide with lane rows already
used by the jj entry; the lane rows for this theme are `S201`–`S203`.

## Limits

- **Presence is not use.** The sweep proves the strings exist in the ELF. The attribution of the two
  `2025-03-26` hits to the Z.AI provider is a byte-context reading (offset arithmetic on this one
  binary), not a runtime trace, and a differently built binary could lay the chunks out
  differently.
- **No `initialize` was captured from the running release.** The revision it puts on the wire is
  established from source that the release demonstrably compiles in, plus the tag's transport
  shape; a server-side log would be the direct measurement and was not taken.
- **Two documentation pages, not the tree.** "`main` is the tag" is measured for
  `docs/mcp-runtime-lifecycle.md` and `src/mcp/transports/http.ts`; other pages may differ.
- **The Z.AI client's revision is a source literal.** Whether the old revision still works against
  `api.z.ai`, or is refused, was not tested.
- **The wrapper's behaviour is read, not induced.** Restart codes, backoff and cap come from its
  bytes; no crash was manufactured, and `OMP_NO_RESTART=1` was used for every invocation here.
- **Two cited paths are not registry rows.** `web/search/providers/zai.ts` and
  `mcp/transports/http.ts` at the tag are cited with full URL and sha256 (§ Two MCP clients,
  § What the release does); the entry's `source:` lines stay S201–S203 because O2 rejects an id that
  is not yet in `## Registry`, so if a cited path must be a row these two become rows and the two
  sentences re-point in the same change.
- **What a counter cannot tell.** The frozen counter measures an evidence chain and a probe re-run;
  a well-grounded wrong entry would pass it (round-65 plan, stated limit).

## Where this entry would be wrong

- **A new release ships.** `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → `omp/18.12.6` and
  `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` → `45c35e40…`; if either
  changes, every sentence about the negotiated revision, the header path and the two-client split
  must be re-opened at the new tag before reuse.
- **The binary is replaced without a version change.** `sha256sum ~/.local/bin/omp.real` →
  `85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`, and
  `bash scripts/omp-binary-probe.sh` → `real_bytes=256702432` with the 15 keys unchanged; a
  different digest means this entry's measurements describe a binary that is no longer installed.
- **The tag moves or the commit is rewritten.** `git ls-remote … refs/tags/v18.12.6` → still
  `45c35e40…`, and `curl -fsSL https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch | sha256sum`
  → `eedfbbc4…`; any other value invalidates every quote in § Located quotes and the D5 reading.
