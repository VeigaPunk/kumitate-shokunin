#!/usr/bin/env bash
# tally-recount.sh — considerthese/2026-11-06.md proposal 1: re-count printed tallies from the committed receipts
# instead of trusting the printed ratio. Each line: what is printed vs what the receipt rows count. Exit 1 on mismatch.
W=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99
rc=0
chk() { # label printed counted
  if [ "$2" = "$3" ]; then echo "TALLY ok    $1 printed=$2 counted=$3"; else echo "TALLY DRIFT $1 printed=$2 counted=$3"; rc=1; fi
}
chk "controls matching expected (plan: all 17)" 17 "$(grep -c 'match=yes' "$W/controls/OBSERVED.txt")"
chk "control rows in OBSERVED" 17 "$(grep -c '^ctl-' "$W/controls/OBSERVED.txt")"
if [ -f "$W/close-l1/integration-remut.txt" ]; then
  p=$(sed -n 's/^REMUT: killed=\([0-9]*\)\/\([0-9]*\).*/\1/p' "$W/close-l1/integration-remut.txt")
  chk "REMUT killed (printed vs KILLED rows)" "$p" "$(grep -c ': KILLED ' "$W/close-l1/integration-remut.txt")"
  n=$(sed -n 's/^REMUT: killed=[0-9]*\/\([0-9]*\).*/\1/p' "$W/close-l1/integration-remut.txt")
  chk "REMUT total (printed vs mutant rows)" "$n" "$(grep -cE ': (KILLED|SURVIVED) ' "$W/close-l1/integration-remut.txt")"
fi
if [ -f "$W/close-l1/selftest-M.txt" ]; then
  s=$(sed -n 's/^SOURCES_SELFTEST: \([0-9]*\)\/[0-9]* pass$/\1/p' "$W/close-l1/selftest-M.txt")
  chk "selftest pass (printed vs PASS lines)" "$s" "$(grep -c '^PASS ' "$W/close-l1/selftest-M.txt")"
fi
exit $rc
