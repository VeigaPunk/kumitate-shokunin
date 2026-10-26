source: S201 — oh-my-pi v18.12.6, `packages/coding-agent/src/mcp/types.ts` (the MCP revision constant and its doc comment) — https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/coding-agent/src/mcp/types.ts — `MCP_PROTOCOL_VERSION` at :181 under the doc comment :170-180 ; source: S202 — oh-my-pi v18.12.6, `docs/mcp-runtime-lifecycle.md` (handshake, startup gate, replay rule) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md — § Lifecycle at a glance (:97-107), § Fast startup gate + deferred fallback (:109-124)
source: S203 — oh-my-pi commit 10bce690, the decision that set the revision — https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch — the commit body and the client.ts hunk ; source: S204 — oh-my-pi v18.12.6, `packages/coding-agent/src/mcp/client.ts` (what the release's client sends in `initialize` and echoes afterwards) — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts — `initializeConnection` (:91-125), the echo (:117-123)
verified-at: 2026-10-25 (host `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → `omp/18.12.6`; `bash scripts/omp-binary-probe.sh` printed 15 `OMP_BIN:` keys, exit 0)
recheck: 90d — re-run `bash scripts/omp-binary-probe.sh` and compare its 15 `OMP_BIN:` keys with § Host measurements
ground: PROVINCE.md §Frontier — the first entry that measures the **installed** release at the MCP layer

# The installed OMP release at the MCP layer: 18.12.6

The installed release is `omp/18.12.6`. Its MCP revision is the constant `"2025-11-25"` (S201:181, sent at S204:100),
the client adopts whatever revision the server answers with (S204:120), and the release bytes carry `2025-11-25` twice,
the header name three times, `2025-03-26` twice and `2026-07-28` not at all (`lit_2026_07_28=0`; the key
`real_version` above reads `18.12.6`). The revision was chosen, not inherited: a commit bumped the client off the stale
`2025-03-26` and says why (S203). What the release does with a slow or a lost server is a documentation fact at the same
tag — a 250 ms startup gate and a no-replay rule (S202) — and no byte sweep can confirm either.

## Located quotes

- S201 — "export const MCP_PROTOCOL_VERSION = "2025-11-25";"
- S201 — "Latest MCP protocol revision this client negotiates."
- S202 — "performs MCP `initialize` using protocol version `2025-11-25` and advertises the `roots` capability"
- S202 — "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"
- S203 — "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision."
- S203 — "echo the negotiated version in the MCP-Protocol-Version header at the transport's single #fetch choke point"
- S204 — "Streamable HTTP spec requires the MCP-Protocol-Version header after"

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

These are the 15 `OMP_BIN:` keys `bash scripts/omp-binary-probe.sh` prints on this host on 2026-10-25, read from the
release bytes only; the probe executes nothing but `<binary> --version`.

## Limits

Byte counts prove presence, not use; no MCP session was started; the 18.12.3 → 18.12.6 delta is not measured.
