#!/usr/bin/env bash
# run-frozen-counter.sh — run a FROZEN round-64 counter (receipt64-probe.mjs / jj64-probe.mjs) without handing it
# the host environment or the host filesystem beyond what the contract names.
#
# Why: the counters interpolate a caller path into `bash -c`, exec archive bytes with operator privileges, and pass
# the whole environment to every child (BASH_ENV, TAR_OPTIONS, NODE_OPTIONS, GIT_DIR, GIT_CONFIG_*, CURL_HOME).
# The probe bytes are frozen, so the bound is applied here, at the call site.
#
# Usage: run-frozen-counter.sh <lane-dir> <rev> <receipt64|jj64> [counter args...]
#   --sandbox  also wrap in bwrap: host read-only, writes only to the throwaway root, no net unless live (J5).
set -u
if [ $# -lt 3 ]; then
  echo "usage: run-frozen-counter.sh <lane-dir> <rev> <receipt64|jj64> [counter args...]" >&2
  exit 64
fi
LANE=$1; REV=$2; WHICH=$3; shift 3
HERE=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROBES=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/probe
case "$WHICH" in
  receipt64) PROBE="$PROBES/receipt64-probe.mjs" ;;
  jj64)      PROBE="$PROBES/jj64-probe.mjs" ;;
  *) echo "run-frozen-counter: unknown counter '$WHICH'" >&2; exit 64 ;;
esac
[ -f "$PROBE" ] || { echo "run-frozen-counter: probe absent: $PROBE" >&2; exit 64; }

SANDBOX=0; ARGS=()
for a in "$@"; do
  if [ "$a" = --sandbox ]; then SANDBOX=1; else ARGS+=("$a"); fi
done

ROOT=$(mktemp -d) || { echo "run-frozen-counter: mktemp failed" >&2; exit 2; }
trap 'rm -rf -- "${ROOT:-}"' EXIT
mkdir -p "$ROOT/tmp" "$ROOT/home" || exit 2

# The scrubbed environment: nothing the host shell exported reaches the counter or its children.
SCRUB=(env -i
  PATH="${PATH:-/usr/local/bin:/usr/bin:/bin}" LANG="${LANG:-C}" LC_ALL="${LC_ALL:-}" LC_CTYPE="${LC_CTYPE:-}"
  TMPDIR="$ROOT/tmp" HOME="$ROOT/home"
  GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_NOSYSTEM=1 JJ_CONFIG=/dev/null)

CMD=("${SCRUB[@]}" node "$PROBE" "$LANE" "$REV" "${ARGS[@]}")

if [ "$SANDBOX" = 1 ]; then
  command -v bwrap >/dev/null 2>&1 || { echo "run-frozen-counter: bwrap absent" >&2; exit 2; }
  # host read-only; only the run root is writable; network only when the counter may go live (J5).
  NET=(--unshare-net)
  for a in "${ARGS[@]}"; do [ "$a" = --no-live ] || NET=(); done
  exec bwrap --die-with-parent --unshare-pid --unshare-ipc --unshare-uts "${NET[@]}" \
    --ro-bind / / --dev /dev --proc /proc \
    --bind "$ROOT" "$ROOT" --chdir "$PWD" \
    "${CMD[@]}"
fi

"${CMD[@]}"
