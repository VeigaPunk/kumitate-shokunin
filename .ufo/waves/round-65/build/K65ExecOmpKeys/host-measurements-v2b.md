## Host measurements (probe v2b draft — 22 keys, PREFERRED variant)

Measured with `bash scripts/omp-binary-probe.sh` on this host (draft:
`.ufo/waves/round-65/build/K65ExecOmpKeys/probe-v2b.sh`). Every line is a byte sweep (`grep -a -o -F`, `LC_ALL=C`) or a
fixed digest; none reads clock, network or mutable host state. Three consecutive runs printed these identical lines
(sha256 of the whole output `446609c600ed17ab2ba279ce839bb12391e1fd2f0f26b06e10414a017db7e72a`, 1.04–1.15 s wall).
v2b differs from v2 (`host-measurements-v2.md`) by exactly one slot: `docs_heading_lifecycle` is replaced by
`decl_2025_03_26`, so `lit_2025_03_26=2` becomes attributable (1 pooled copy + 1 provider declaration) and the entry can
say "the release ships two MCP clients on two revisions" from key values alone instead of citing a byte slice.

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
- real_sha256=85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4
- lit_2025_06_18=0
- decl_2025_11_25=1
- changelog_versions=43
- changelog_installed=1
- docs_heading_collab=0
- decl_2025_03_26=1
