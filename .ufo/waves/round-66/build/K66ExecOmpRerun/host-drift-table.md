# Host drift table — `corpus/knowledge/omp-installed-release-mcp-runtime.md` § Host measurements

stated = the entry's 22 bullets at lane HEAD (`git rev-parse HEAD` = 6c79d68caf956e6c74a0c17c388662f4d1b7dec1)
live   = `scripts/omp-binary-probe.sh` run on this host 2026-10-27 with `OMP_BIN_REAL=/home/vgpnk/.local/bin/omp` (the frozen probe fails closed on this host without the override: `OMP_BIN_PROBE: FAIL-CLOSED real-unidentified`, exit 2)

| key | stated (2026-10-25, 18.12.6) | live (2026-10-27, 18.13.1) | verdict |
| --- | --- | --- | --- |
| `wrapper_is_script` | `1` | `0` | **DRIFT** |
| `wrapper_names_real` | `omp.real` | `none` | **DRIFT** |
| `wrapper_restart_codes` | `132-139` | `none` | **DRIFT** |
| `wrapper_max_restarts` | `5` | `none` | **DRIFT** |
| `real_is_elf` | `1` | `1` | same |
| `real_bytes` | `256702432` | `275986608` | **DRIFT** |
| `real_version` | `18.12.6` | `18.13.1` | **DRIFT** |
| `lit_2025_11_25` | `2` | `2` | same |
| `lit_2026_07_28` | `0` | `0` | same |
| `lit_2025_03_26` | `2` | `2` | same |
| `sym_MCP_PROTOCOL_VERSION` | `3` | `3` | same |
| `header_MCP-Protocol-Version` | `3` | `3` | same |
| `sym_DeferredMCPTool` | `3` | `3` | same |
| `collab_hosts_literal` | `2` | `2` | same |
| `docs_phrase_never_replayed` | `0` | `0` | same |
| `lit_2025_06_18` | `0` | `0` | same |
| `decl_2025_11_25` | `1` | `1` | same |
| `changelog_installed` | `1` | `1` | same |
| `docs_heading_collab` | `0` | `0` | same |
| `docs_heading_lifecycle` | `0` | `0` | same |
| `changelog_versions` | `43` | `36` | **DRIFT** |
| `real_sha256` | `85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4` | `ee2961c7da02e514a2475ee958c2fd85dbabf4d0907949ba5022edb2951f84b5` | **DRIFT** |

drift: **8 of 22 keys**; unchanged: 14.

## Why each drifted key drifted

- `wrapper_is_script` 1→0, `wrapper_names_real` omp.real→none, `wrapper_restart_codes` 132-139→none, `wrapper_max_restarts` 5→none:
  the 1680-byte bash crash-restart wrapper no longer exists on this host. `~/.local/bin/omp` IS the release binary now (ELF, 275986608 bytes, mtime 2026-10-27 00:02); `~/.local/bin/omp.real` does not exist (`ls` → No such file or directory).
- `real_version` 18.12.6→18.13.1, `real_bytes` 256702432→275986608, `real_sha256` 85d9daf3…→ee2961c7…: the installed release was upgraded on 2026-10-27 00:02 (upstream tag `v18.13.1` = 0838d2ab4407b74e870de07e1a6780a13c7d542c, published 2026-10-27T00:56:37Z).
- `changelog_versions` 43→36: NOT a regression and NOT monotone with the version. Upstream `packages/coding-agent/CHANGELOG.md` at v18.13.1 (258254 bytes) has 36 version headings; at v18.12.6 (254614 bytes) it has 43. Upstream dropped 9 old headings (18.4.4, 18.4.5, 18.4.6, 18.4.9, 18.4.10, 18.4.11, 18.4.12, 18.5.0, 18.5.1) and added 18.13.0 and 18.13.1 (43 − 9 + 2 = 36). The key measures changelog breadth, not release identity.

## Unchanged (14) — the MCP-layer facts survive the upgrade

- `real_is_elf=1`
- `lit_2025_11_25=2`
- `lit_2026_07_28=0`
- `lit_2025_03_26=2`
- `sym_MCP_PROTOCOL_VERSION=3`
- `header_MCP-Protocol-Version=3`
- `sym_DeferredMCPTool=3`
- `collab_hosts_literal=2`
- `docs_phrase_never_replayed=0`
- `lit_2025_06_18=0`
- `decl_2025_11_25=1`
- `changelog_installed=1`
- `docs_heading_collab=0`
- `docs_heading_lifecycle=0`

`lit_2025_11_25=2`, `lit_2025_03_26=2`, `lit_2026_07_28=0`, `decl_2025_11_25=1`, `sym_MCP_PROTOCOL_VERSION=3`, `header_MCP-Protocol-Version=3`, `sym_DeferredMCPTool=3`, `docs_phrase_never_replayed=0`, `docs_heading_collab=0`, `docs_heading_lifecycle=0`, `lit_2025_06_18=0`, `collab_hosts_literal=2`, `changelog_installed=1` are all identical on the new release — and so are the six upstream files (sha256, byte-identical between v18.12.6 and v18.13.1):

| file | sha256 | bytes | identical across tags |
| --- | --- | --- | --- |
| `packages/coding-agent/src/mcp/types.ts` | `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d` | 16167 | yes |
| `packages/coding-agent/src/mcp/client.ts` | `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9` | 14975 | yes |
| `docs/mcp-runtime-lifecycle.md` | `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d` | 22741 | yes |
| `packages/coding-agent/src/mcp/transports/http.ts` | `41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033` | 33157 | yes |
| `packages/coding-agent/src/web/search/providers/zai.ts` | `0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb` | 12774 | yes |
| `packages/coding-agent/src/mcp/transports/sse.ts` | `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0` | 15183 | yes |

(sha256 of the live fetch of each file at BOTH tags, computed 2026-10-27; the `docs/mcp-runtime-lifecycle.md` digest is `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d` — first 16 hex `362acea5d3d0eca0`, equal to the round-65 pinned capture `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435db…`.)
