#!/usr/bin/env bash
# kumitate round 61 frozen-counter pack.
#
#   counters.sh <rev>
#
# Runs the five frozen counters in order, quoting each command, its full
# combined stdout+stderr, and its exit code, then a summary of verdict lines.
# Writes nothing outside this probe directory: the only writers among the
# counters are hermetic selftests using mkdtemp(tmpdir()), so TMPDIR is pointed
# at a scratch dir under probe/ that is removed on exit. Output goes to stdout.
#
# exit: 0 every counter exited 0 · 1 at least one counter non-zero
#       · 64 usage · 2 environment (missing tool, unresolvable rev)
set -u -o pipefail

FLEET=/home/vgpnk/Projects/shokunin
LANE=$FLEET/kumitate-shokunin
PROBE=$LANE/.ufo/waves/round-61/probe

if [ $# -ne 1 ] || [ -z "$1" ]; then
  echo "usage: counters.sh <rev>" >&2
  exit 64
fi
REV=$1

for bin in node git sha256sum; do
  command -v "$bin" >/dev/null 2>&1 || { echo "COUNTERS61: ENV missing $bin" >&2; exit 2; }
done
if ! SHA=$(git -C "$LANE" rev-parse --verify --quiet "$REV^{commit}"); then
  echo "COUNTERS61: ENV rev $REV does not resolve to a commit in $LANE" >&2
  exit 2
fi

scratch=$(mktemp -d "$PROBE/.tmp.XXXXXX") || { echo "COUNTERS61: ENV cannot create scratch in $PROBE" >&2; exit 2; }
trap 'rm -rf "$scratch"' EXIT
export TMPDIR=$scratch

TOOLS=(
  "$FLEET/scripts/sources-census.sh"
  "$LANE/scripts/proxy-check.mjs"
  "$PROBE/dispatch61-probe.mjs"
  "$PROBE/doctrine61-probe.mjs"
  "$LANE/scripts/dispatch-evidence.mjs"
)
counter() {
  case $1 in
    1) set -- "$FLEET/scripts/sources-census.sh" validate --root "$FLEET" kumitate ;;
    2) set -- node "$LANE/scripts/proxy-check.mjs" ;;
    3) set -- node "$PROBE/dispatch61-probe.mjs" "$LANE" "$REV" ;;
    4) set -- node "$PROBE/doctrine61-probe.mjs" "$LANE" "$REV" --census-root "$FLEET" ;;
    5) set -- node "$LANE/scripts/dispatch-evidence.mjs" --root "$LANE" --round 61 --wave w1 ;;
  esac
  if [ "${SHOW:-0}" = 1 ]; then printf '%q ' "$@"; else (cd "$LANE" && "$@" 2>&1); fi
}
COUNT=5
VERDICT_RE='^(PROXY[A-Z_]*|DISPATCH61|DOCTRINE61|DISPATCH_EVIDENCE|ERROR|COUNTERS61)[:=]|^proxy-check:|^kumitate	(ok|E[0-9]{2})	'

echo "COUNTERS61 pack rev=$REV sha=$SHA lane=$LANE node=$(node --version)"
echo "## tool sha256"
for t in "${TOOLS[@]}"; do
  if [ -f "$t" ]; then sha256sum "$t"; else echo "absent  $t"; fi
done

declare -a CODES=() VERDICTS=()
for n in $(seq 1 "$COUNT"); do
  echo
  echo "## [$n/$COUNT] \$ $(SHOW=1 counter "$n")"
  out=$(counter "$n")
  code=$?
  [ -n "$out" ] && printf '%s\n' "$out"
  echo "-- exit=$code"
  CODES+=("$code")
  v=$(printf '%s\n' "$out" | grep -E -m1 "$VERDICT_RE" || true)
  VERDICTS+=("${v:-(no verdict line; exit code is the verdict)}")
done

echo
echo "## summary rev=$REV sha=$SHA"
fail=0
for i in "${!CODES[@]}"; do
  [ "${CODES[$i]}" -eq 0 ] || fail=$((fail + 1))
  printf '[%d] exit=%s %s\n' "$((i + 1))" "${CODES[$i]}" "${VERDICTS[$i]}"
done
echo "COUNTERS61: $([ "$fail" -eq 0 ] && echo ALL_EXIT0 || echo NONZERO) nonzero=$fail/$COUNT rev=$REV"
[ "$fail" -eq 0 ]
