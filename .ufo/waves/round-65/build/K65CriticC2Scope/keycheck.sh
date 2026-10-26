#!/usr/bin/env bash
S=/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge
F="$S/omp-host-harness-protocol-skew-2026-10-27.md"
printf '%-28s %-10s %s\n' key staged-values present
chk(){ printf '%-28s %-10s %s\n' "$1" "$2" "$3"; }
chk wrapper_is_script=1 "" "$(grep -c 'bash crash-restart wrapper' "$F")"
chk wrapper_names_real "" "$(grep -c 'omp.real' "$F")"
chk wrapper_restart_codes=132-139 "" "$(grep -c '132' "$F")"
chk wrapper_max_restarts=5 "" "$(grep -c 'five restarts' "$F")"
chk real_is_elf=1 "" "$(grep -c 'ELF release binary' "$F")"
chk real_bytes=256702432 "" "$(grep -c '256702432' "$F")"
chk real_version=18.12.6 "" "$(grep -c '18\.12\.6' "$F")"
chk lit_2025_11_25=2 "" "$(grep -c '`2025-11-25` → 2' "$F")"
chk lit_2026_07_28=0 "" "$(grep -c '2026-07-28` → \*\*0\*\*' "$F")"
chk lit_2025_03_26=2 "" "$(grep -c '2025-03-26` → 2' "$F")"
chk header_MCP-Protocol-Version=3 "" "$(grep -c '3' "$F")"
chk sym_MCP_PROTOCOL_VERSION=3 "" "$(grep -c 'MCP_PROTOCOL_VERSION' "$F")"
chk sym_DeferredMCPTool=3 "" "$(grep -c 'DeferredMCPTool' "$F")"
chk collab_hosts_literal=2 "" "$(grep -c 'collab-hosts' "$F")"
chk docs_phrase_never_replayed=0 "" "$(grep -c 'never replayed automatically' "$F")"
