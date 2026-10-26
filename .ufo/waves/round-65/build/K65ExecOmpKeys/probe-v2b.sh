#!/usr/bin/env bash
# omp-binary-probe.sh — read-only measurement of the installed OMP harness on this host.
# Contract: kumitate-omp-binary-probe-v2b (round 65, seat K65ExecOmpKeys; preferred variant over v2). v1 = kumitate-omp-binary-probe-v1
# (15 keys, frozen base receipt .ufo/waves/round-65/base/omp-binary-probe-freeze.txt); v2b keeps all 15 v1 keys
# byte-identically and adds 7, for 22 keys (same cap and same slot count as v2).
# Never executes anything but `<binary> --version`; never writes outside a mktemp scratch; reads the wrapper and the
# release binary as bytes.
# Output: `OMP_BIN: <key>=<value>` lines, then `OMP_BIN_PROBE: DONE omp=<version>` exit 0;
#         `OMP_BIN_PROBE: FAIL-CLOSED <reason>` exit 2 when the wrapper or the release binary is absent or a step fails.
# Why (v2): v1 proves the release bytes carry the 2025-11-25 constant and lack the docs prose. v2 adds (a) the byte
# identity of the measured binary (real_sha256), (b) the MCP spec revision the release does NOT carry (2025-06-18 = 0),
# (c) that 2025-11-25 occurs as a module-scope declaration (`= "2025-11-25"`), not as a member of a version list,
# (d) that the binary embeds the CHANGELOG (43 version headings, the installed heading exactly once, binding
# version 18.12.6 to release date 2026-10-21 from bytes rather than from `--version`), and (e) the heading of
# docs/collab.md that is absent (prose does not ship, identifiers do) plus the attributable second version pin:
# `= "2025-03-26"` occurs exactly once and is the Z.AI web-search provider's own revision, so `lit_2025_03_26=2`
# (= 1 pooled copy + 1 declaration) can be attributed from key values alone — the release ships two MCP clients on
# two revisions, and `decl_2025_11_25` vs `decl_2025_03_26` separates the core client from the provider.
# Every key is a byte sweep (grep -a -o -F, LC_ALL=C) or a fixed digest; none reads clock, network or host state, so
# three consecutive runs print identical keys and values. Whole-probe wall time on this host: see the report.
set -u
export LC_ALL=C
fail() { echo "OMP_BIN_PROBE: FAIL-CLOSED $1"; exit 2; }
for u in grep wc tr awk head sed sha256sum command; do command -v "$u" >/dev/null 2>&1 || fail util-absent; done
W="${OMP_BIN_WRAPPER:-$(command -v omp 2>/dev/null)}"
[ -n "$W" ] && [ -f "$W" ] || fail wrapper-absent
if [ "$(head -c 2 "$W")" = '#!' ]; then echo 'OMP_BIN: wrapper_is_script=1'; else echo 'OMP_BIN: wrapper_is_script=0'; fi
DEF="$(grep -m1 -E '^BIN=' "$W" 2>/dev/null | sed -e 's/^BIN=//')"
case "$DEF" in
  *omp.real*) echo 'OMP_BIN: wrapper_names_real=omp.real' ;;
  *) echo 'OMP_BIN: wrapper_names_real=none' ;;
esac
R="${OMP_BIN_REAL:-$HOME/.local/bin/omp.real}"
[ -f "$R" ] && [ -x "$R" ] || fail real-absent
echo "OMP_BIN: wrapper_restart_codes=$(grep -m1 -oE '132\|133\|134\|135\|136\|137\|138\|139' "$W" | tr -d '\n' | awk '{print ($0=="132|133|134|135|136|137|138|139") ? "132-139" : "other"}')"
echo "OMP_BIN: wrapper_max_restarts=$(grep -m1 -oE 'crashes[^0-9]*-gt [0-9]+' "$W" | grep -oE '[0-9]+$')"
if [ "$(head -c 4 "$R" | tr -d '\0')" = "$(printf '\177ELF')" ]; then echo 'OMP_BIN: real_is_elf=1'; else echo 'OMP_BIN: real_is_elf=0'; fi
echo "OMP_BIN: real_bytes=$(wc -c < "$R" | tr -d ' ')"
V="$(OMP_NO_RESTART=1 "$R" --version 2>/dev/null | head -n 1)"
[ -n "$V" ] || fail version-unreadable
echo "OMP_BIN: real_version=${V#omp/}"
cnt() { grep -a -o -F -- "$1" "$R" | wc -l | tr -d ' '; }
# ---- v1 keys, unchanged ----
echo "OMP_BIN: lit_2025_11_25=$(cnt '2025-11-25')"
echo "OMP_BIN: lit_2026_07_28=$(cnt '2026-07-28')"
echo "OMP_BIN: lit_2025_03_26=$(cnt '2025-03-26')"
echo "OMP_BIN: sym_MCP_PROTOCOL_VERSION=$(cnt 'MCP_PROTOCOL_VERSION')"
echo "OMP_BIN: header_MCP-Protocol-Version=$(cnt 'MCP-Protocol-Version')"
echo "OMP_BIN: sym_DeferredMCPTool=$(cnt 'DeferredMCPTool')"
echo "OMP_BIN: collab_hosts_literal=$(cnt 'collab-hosts')"
echo "OMP_BIN: docs_phrase_never_replayed=$(cnt 'never replayed automatically')"
# ---- v2 keys (7) ----
echo "OMP_BIN: real_sha256=$(sha256sum "$R" | cut -d' ' -f1)"
echo "OMP_BIN: lit_2025_06_18=$(cnt '2025-06-18')"
echo "OMP_BIN: decl_2025_11_25=$(cnt '= "2025-11-25"')"
echo "OMP_BIN: changelog_versions=$(grep -a -o -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$' "$R" | wc -l | tr -d ' ')"
echo "OMP_BIN: changelog_installed=$(cnt "## [${V#omp/}] - ")"
echo "OMP_BIN: docs_heading_collab=$(cnt 'Collab: Live Session Sharing')"
echo "OMP_BIN: decl_2025_03_26=$(cnt '= "2025-03-26"')"
echo "OMP_BIN_PROBE: DONE omp=${V#omp/}"
