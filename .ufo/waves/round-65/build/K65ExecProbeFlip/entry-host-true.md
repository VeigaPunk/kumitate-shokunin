# OMP installed release - MCP runtime (scratch O6 variant: true host values)

source: S900 S901 S902
verified-at: 2026-10-25
recheck: bash scripts/omp-binary-probe.sh

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

The body names lit_2026_07_28 and real_version (18.12.6) so O6 body checks are satisfiable.
