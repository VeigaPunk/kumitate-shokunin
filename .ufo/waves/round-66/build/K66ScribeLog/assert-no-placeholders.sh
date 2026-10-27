#!/usr/bin/env bash
# assert-no-placeholders.sh — round-66 LOG/SCORECARD paste check (seat K66ScribeLog).
#   bash .ufo/waves/round-66/build/K66ScribeLog/assert-no-placeholders.sh [lane]
# Exit 0  — neither LOG.md nor SCORECARD.md carries the literal placeholder token, and each new
#           round-66 heading appears exactly once.
# Exit 1  — a finding; every finding is printed.
# Exit 64 — usage.
# Read-only: greps the lane files, writes nothing.
set -uo pipefail
LANE=${1:-/home/vgpnk/Projects/shokunin/kumitate-shokunin}
[ -d "$LANE" ] || { echo "usage: assert-no-placeholders.sh <lane>"; exit 64; }

rc=0
hits=$(grep -n 'MEASURE_ME' "$LANE/LOG.md" "$LANE/SCORECARD.md" 2>/dev/null)
if [ -n "$hits" ]; then
  printf '%s\n' "$hits"
  echo "FAIL placeholder token left in a landed file"
  rc=1
fi

check_heading() {
  local f=$1 h=$2 n
  n=$(grep -cF -- "$h" "$LANE/$f" 2>/dev/null)
  n=${n:-0}
  if [ "$n" = 1 ]; then echo "ok $f: heading once"
  else echo "FAIL $f: heading count=$n for: $h"; rc=1; fi
}
check_heading LOG.md '## 2026-10-27 — round 66'
check_heading SCORECARD.md '## Round 66 — claims, verdicts, limits (2026-10-27)'

exit $rc
