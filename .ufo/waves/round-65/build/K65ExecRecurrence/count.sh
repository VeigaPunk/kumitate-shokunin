#!/bin/sh
# count.sh — re-runnable recurrence counter for routed-defect classes (considerthese/2026-10-25 idea 4).
# Usage: sh count.sh [LANE_ROOT]        default LANE_ROOT=/home/vgpnk/Projects/shokunin/kumitate-shokunin
# Prints one "class <name> count=<n> first=<rN|none> last=<rN|none> fix=<...> [detail]" line per class.
# Read-only: greps committed lane bytes. No writes, no network, no git.
#
# Two counting units, stated so the number can be checked:
#   (a) reference-drift is counted as ROUND OPENS: a round whose committed open/base/baseline receipt
#       reads a live corpus-map drift (proxy C2_total delta or readme-map DRIFT/note). One line of
#       evidence per counted round; the round list is printed in `detail=`.
#   (b) every other class is counted as DISTINCT ROUTED ITEM IDS. The id->(file) map is data below;
#       each id is verified present in its cited lesson file before it is counted, and a missing
#       citation is reported on stderr and excluded from the count (never silently counted).
set -u

LANE=${1:-/home/vgpnk/Projects/shokunin/kumitate-shokunin}
cd "$LANE" || { echo "count.sh: no lane at $LANE" >&2; exit 2; }

DRIFT_RE='C2_TOTAL_DRIFT|C2_total declared=|README_MAP: DRIFT|README_MAP: note'

# ---------------------------------------------------------------- reference-drift
drift_rounds() {
  for d in .ufo/waves/round-*/base .ufo/waves/round-*/open .ufo/waves/round-*/baseline; do
    [ -d "$d" ] || continue
    grep -rqE "$DRIFT_RE" "$d" 2>/dev/null || continue
    printf '%s\n' "$d" | sed -E 's#\.ufo/waves/round-([0-9]+)/.*#\1#'
  done
  # readings that live in wave evidence rather than base/open/baseline
  grep -rlE 'README_MAP: DRIFT files=142 rows=141' .ufo/waves/round-60 2>/dev/null |
    sed -E 's#\.ufo/waves/round-([0-9]+)/.*#\1#'
  grep -rlE 'README_MAP: DRIFT files=149 rows=149|README_MAP: DRIFT files=149 rows=148' .ufo/waves/round-62 2>/dev/null |
    sed -E 's#\.ufo/waves/round-([0-9]+)/.*#\1#'
}

DRIFT_LIST=$(drift_rounds | sort -n -u | tr '\n' ' ' | sed -E 's/ +$//')
DRIFT_N=$(printf '%s\n' $DRIFT_LIST | grep -c '[0-9]')
DRIFT_FIRST=$(printf '%s\n' $DRIFT_LIST | sed -n '1p')
DRIFT_LAST=$(printf '%s\n' $DRIFT_LIST | sed -n '$p')
# named-culprit subset: rounds whose reading names the uncovered/punpinned file
NAMED=$(grep -rhoE '(first=uncovered|note unpinned):lessons/round-[0-9]+-verifier-spotcheck\.md' \
          .ufo/waves/round-*/base/ .ufo/waves/round-60/w1/ .ufo/waves/round-61/base/ .ufo/waves/round-62/ 2>/dev/null |
        sed -E 's/.*://' | sort -u | wc -l | tr -d ' ')
printf 'class reference-drift count=%s first=r%s last=r%s fix=scripts/readme-map.mjs+Q48+Q60(before-freeze only) named_culprit_readings=%s detail=rounds(%s)\n' \
  "$DRIFT_N" "$DRIFT_FIRST" "$DRIFT_LAST" "$NAMED" "$DRIFT_LIST"

# ---------------------------------------------------------------- other classes (id map)
# id  file-under-corpus/lessons
IDS='
number-drift|R55-V2|round-55-verifier-spotcheck.md
number-drift|R58-V1|round-58-verifier-spotcheck.md
number-drift|R58-V4|round-58-verifier-spotcheck.md
number-drift|R58-V5|round-58-verifier-spotcheck.md
number-drift|R60-V3|round-60-verifier-spotcheck.md
number-drift|D2|round-63-verifier-spotcheck.md
number-drift|D1|round-64-verifier-spotcheck.md
placeholder|R60-V2|round-60-verifier-spotcheck.md
placeholder|R61-V4|round-61-verifier-spotcheck.md
dangling-pointer|R52-11|round-51-verifier-spotcheck.md
dangling-pointer|R60-V4|round-60-verifier-spotcheck.md
dangling-pointer|R61-V1|round-61-verifier-spotcheck.md
dangling-pointer|D3|round-64-verifier-spotcheck.md
dangling-pointer|D5|round-63-verifier-spotcheck.md
vacuous-counter|R57-V1|round-57.md
vacuous-counter|R57-V2|round-57.md
vacuous-counter|R57-V3|round-57.md
vacuous-counter|R61-V2|round-61-verifier-spotcheck.md
vacuous-counter|D5|round-63-verifier-spotcheck.md
forgery|R57-V4|round-57.md
forgery|R61-V2|round-61-verifier-spotcheck.md
dead-seat|R53-2|round-53-verifier-spotcheck.md
dead-seat|R56-V1|round-56-verifier-spotcheck.md
dead-seat|R60-V6|round-60-verifier-spotcheck.md
dead-seat|R61-V6|round-61-verifier-spotcheck.md
stale-premise|R56-V2|round-56-verifier-spotcheck.md
stale-premise|R58-V3|round-58-verifier-spotcheck.md
stale-premise|R60-V9|round-60-verifier-spotcheck.md
stale-premise|D4|round-64-verifier-spotcheck.md
landing-attribution|R55-V1|round-55-verifier-spotcheck.md
landing-attribution|R58-V2|round-58-verifier-spotcheck.md
landing-attribution|R58-V6|round-58-verifier-spotcheck.md
landing-attribution|R60-V1|round-60-verifier-spotcheck.md
landing-attribution|R60-V7|round-60-verifier-spotcheck.md
landing-attribution|R61-V3|round-61-verifier-spotcheck.md
landing-attribution|D3|round-63-verifier-spotcheck.md
'

fix_for() {
  case "$1" in
    number-drift)        echo 'Q50+Q53+Q61/report-receipt-diff(report-scope)' ;;
    placeholder)         echo 'report-receipt-diff PLACEHOLDER(report-scope)' ;;
    dangling-pointer)    echo 'Q52+report-receipt-diff RECEIPT_MISSING(report-scope)' ;;
    vacuous-counter)     echo 'Q43+Q57+gate-mutants.mjs(per-counter,no harness)' ;;
    forgery)             echo 'receipt-evidence.mjs+dispatch-evidence.mjs+Q57+Q59' ;;
    dead-seat)           echo 'wave-census --expect+dispatch-evidence.mjs+Q54' ;;
    stale-premise)       echo 'counter-pins.mjs+amendment convention(Q43)' ;;
    landing-attribution) echo 'Q51+Q52+Q55+report-receipt-diff' ;;
    *)                   echo 'none' ;;
  esac
}

for cls in number-drift placeholder dangling-pointer vacuous-counter forgery dead-seat stale-premise landing-attribution; do
  n=0
  rfirst=''
  rmax=0
  for row in $(printf '%s\n' "$IDS" | awk -F'|' -v c="$cls" 'NF==3 && $1==c {print $2"@"$3}'); do
    id=${row%@*}
    f=${row#*@}
    path="corpus/lessons/$f"
    if [ ! -f "$path" ]; then
      echo "count.sh: MISSING FILE $path for id $id (excluded)" >&2
      continue
    fi
    if ! grep -qF -- "$id" "$path"; then
      echo "count.sh: UNCITED id $id in $path (excluded)" >&2
      continue
    fi
    n=$((n + 1))
    case "$id" in
      R[0-9]*) rnum=$(printf '%s\n' "$id" | sed -E 's/^R([0-9]+)-.*/\1/') ;;
      *)       rnum=$(printf '%s\n' "$f" | sed -E 's/^round-([0-9]+)-.*/\1/') ;;
    esac
    [ -z "$rfirst" ] && rfirst=$rnum
    [ "$rnum" -gt "${rmax:-0}" ] && rmax=$rnum
  done
  printf 'class %s count=%s first=r%s last=r%s fix=%s\n' \
    "$cls" "$n" "${rfirst:-none}" "${rmax:-none}" "$(fix_for "$cls")"
done

exit 0
