#!/usr/bin/env bash
# omp-binary-probe.sh — read-only measurement of the installed OMP harness on this host.
# Contract: kumitate-omp-binary-probe-v2 (round 65; v1 was the freeze commit 2ca91a0c). Hardened in wave 1 by K65ExecOmpRobust
# (27 failure arms, .ufo/waves/round-65/build/K65ExecOmpRobust/arms.sh) and extended by K65ExecOmpKeys (seven more keys).
#
# Contract, exactly one of these and nothing else on stdout:
#   exit 0 — the complete `OMP_BIN: <key>=<value>` key set (22 keys), last line `OMP_BIN_PROBE: DONE omp=<version>`;
#   exit 2 — the single line `OMP_BIN_PROBE: FAIL-CLOSED <reason>`.
# Keys are buffered and printed only once every step has succeeded, so a reader can never mistake a partial key set
# for a complete measurement. `set -u` is satisfied without a caller-supplied HOME. `<binary> --version` runs under
# `timeout` (OMP_BIN_TIMEOUT, default 60s) and only when the file is ELF, so a hang or a script masquerading as the
# release binary fails closed instead of hanging or producing a fake real_version.
# Safety: never executes anything but `<binary> --version`; never writes anywhere; reads the wrapper and the release
# binary as bytes. Why: the lane's OMP entries read upstream `main` docs and say "the host runs the installed binary"
# without measuring it (`corpus/knowledge/omp-task-contract.md` § Version skew: "its implementation was not
# inspected"). These keys measure the installed release: the wrapper, the release version, and which protocol
# literals and symbols its bytes carry.
set -u
set -o pipefail
export LC_ALL=C

fail() { echo "OMP_BIN_PROBE: FAIL-CLOSED $1"; exit 2; }

# 1. Utilities. `timeout` is mandatory so a hanging `--version` fails closed instead of hanging the probe.
for u in grep wc tr awk head timeout command; do
  command -v "$u" >/dev/null 2>&1 || fail "util-absent-$u"
done

# 2. Locate the wrapper and prove it is a readable regular file.
W="${OMP_BIN_WRAPPER:-$(command -v omp 2>/dev/null || true)}"
[ -n "$W" ] || fail wrapper-absent
[ -L "$W" ] && [ ! -e "$W" ] && fail wrapper-symlink-loop
[ -d "$W" ] && fail wrapper-is-dir
[ -f "$W" ] || fail wrapper-absent
[ -r "$W" ] || fail wrapper-unreadable

buf=()
kv() { buf+=("OMP_BIN: $1"); }

if [ "$(head -c 2 "$W" 2>/dev/null)" = '#!' ]; then kv wrapper_is_script=1; else kv wrapper_is_script=0; fi
DEF="$(grep -m1 -E '^BIN=' "$W" 2>/dev/null || true)"
DEF="${DEF#BIN=}"
case "$DEF" in
  *omp.real*) DEF_named=1 ;;
  *) DEF_named=0 ;;
esac
if [ "$DEF_named" = 1 ]; then kv wrapper_names_real=omp.real; else kv wrapper_names_real=none; fi

codes="$(grep -m1 -oE '132\|133\|134\|135\|136\|137\|138\|139' "$W" 2>/dev/null | tr -d '\n' | awk '{print ($0=="132|133|134|135|136|137|138|139") ? "132-139" : "other"}')"
[ "$?" -le 1 ] || fail wrapper-codes-unreadable
kv "wrapper_restart_codes=$codes"
maxr="$(grep -m1 -oE 'crashes[^0-9]*-gt [0-9]+' "$W" 2>/dev/null | grep -oE '[0-9]+$')"
[ "$?" -le 1 ] || fail wrapper-max-restarts-unreadable
kv "wrapper_max_restarts=$maxr"

# 3. The release binary: explicit override, else the default only when the wrapper itself names omp.real; otherwise
#    the measured file is not identified by anything on this host and the probe refuses to guess.
if [ -n "${OMP_BIN_REAL:-}" ]; then
  R="$OMP_BIN_REAL"
elif [ "$DEF_named" = 1 ] && [ -n "${HOME:-}" ]; then
  R="$HOME/.local/bin/omp.real"
else
  fail real-unidentified
fi
[ -L "$R" ] && [ ! -e "$R" ] && fail real-symlink-loop
[ -d "$R" ] && fail real-is-dir
[ -f "$R" ] || fail real-absent
[ -x "$R" ] || fail real-not-executable
[ -r "$R" ] || fail real-unreadable

if [ "$(head -c 4 "$R" 2>/dev/null | tr -d '\0')" = "$(printf '\177ELF')" ]; then
  kv real_is_elf=1
else
  fail real-not-elf
fi
kv "real_bytes=$(wc -c < "$R" | tr -d ' ')"

# 4. Version: bounded by `timeout`, exit status checked, first stdout line shape-checked.
TO="${OMP_BIN_TIMEOUT:-60}"
case "$TO" in
  ''|*[!0-9]*) fail timeout-invalid ;;
esac
[ "$TO" -ge 1 ] || fail timeout-invalid
# The frozen C2 counter runs this probe under spawnSync timeout=180s; a longer OMP_BIN_TIMEOUT would get the probe
# killed mid-write instead of failing closed, so cap it.
[ "$TO" -le 150 ] || fail timeout-too-large
out=''
out="$(OMP_NO_RESTART=1 timeout -k 5 "$TO" "$R" --version 2>/dev/null | head -c 4096)"
rc=$?
if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then fail version-timeout; fi
[ "$rc" -eq 0 ] || fail "version-exit-$rc"
V="${out%%$'\n'*}"
[ -n "$V" ] || fail version-unreadable
if ! [[ "$V" =~ ^omp/[0-9]+\.[0-9]+\.[0-9]+([-+.][A-Za-z0-9.]+)?$ ]]; then fail version-shape; fi
kv "real_version=${V#omp/}"

# 5. Byte sweeps of the release binary. Each count is validated: a grep error (rc > 1) fails closed instead of
#    reporting a zero that reads like "absent".
n=''
count() { # $1 = literal, $2 = key (reason tag); sets n
  local rc
  n="$(grep -a -o -F -- "$1" "$R" 2>/dev/null | wc -l | tr -d ' ')"
  rc=$?
  [ "$rc" -le 1 ] || fail "count-$2"
  case "$n" in ''|*[!0-9]*) fail "count-$2" ;; esac
}
count '2025-11-25' lit_2025_11_25; kv "lit_2025_11_25=$n"
count '2026-07-28' lit_2026_07_28; kv "lit_2026_07_28=$n"
count '2025-03-26' lit_2025_03_26; kv "lit_2025_03_26=$n"
count 'MCP_PROTOCOL_VERSION' sym_MCP_PROTOCOL_VERSION; kv "sym_MCP_PROTOCOL_VERSION=$n"
count 'MCP-Protocol-Version' header_MCP-Protocol-Version; kv "header_MCP-Protocol-Version=$n"
count 'DeferredMCPTool' sym_DeferredMCPTool; kv "sym_DeferredMCPTool=$n"
count 'collab-hosts' collab_hosts_literal; kv "collab_hosts_literal=$n"
count 'never replayed automatically' docs_phrase_never_replayed; kv "docs_phrase_never_replayed=$n"
count '2025-06-18' lit_2025_06_18; kv "lit_2025_06_18=$n"
count '= "2025-11-25"' decl_2025_11_25; kv "decl_2025_11_25=$n"
count "## [${V#omp/}] - " changelog_installed; kv "changelog_installed=$n"
count 'Collab: Live Session Sharing' docs_heading_collab; kv "docs_heading_collab=$n"
count 'MCP runtime lifecycle' docs_heading_lifecycle; kv "docs_heading_lifecycle=$n"
nver="$(grep -a -o -E '^## \[[0-9]+\.[0-9]+\.[0-9]+\] - [0-9]{4}-[0-9]{2}-[0-9]{2}$' "$R" 2>/dev/null | wc -l | tr -d ' ')"
case "$nver" in ''|*[!0-9]*) fail count-changelog_versions ;; esac
kv "changelog_versions=$nver"
command -v sha256sum >/dev/null 2>&1 || fail util-absent-sha256sum
sha="$(sha256sum "$R" 2>/dev/null | cut -d' ' -f1)"
case "$sha" in *[!0-9a-f]*|'') fail sha256-shape ;; esac
[ "${#sha}" -eq 64 ] || fail sha256-shape
kv "real_sha256=$sha"

# 6. All steps passed: the complete key set, then the verdict line.
if [ "${#buf[@]}" -gt 0 ]; then printf '%s\n' "${buf[@]}"; fi
echo "OMP_BIN_PROBE: DONE omp=${V#omp/}"
exit 0
