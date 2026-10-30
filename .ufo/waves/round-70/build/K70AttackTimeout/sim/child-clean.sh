#!/usr/bin/env bash
# SIMULATION ONLY: the honest success shape — receipt complete, CONTROL-PASS on stdout, exit 0.
set -euo pipefail
MODE="${1:?mode}"
W="${2:?workdir}"; mkdir -p "$W"
R="$W/c1-$MODE.txt"
printf 'LEDGER69_UNMET held=2/7 checks=7 rev=0000000000000000000000000000000000000000 rule=L69\n' > "$R"
printf 'control=%s exit=1 rev=0000000000000000000000000000000000000000\n' "$MODE" >> "$R"
cat "$R"
echo "CONTROL-PASS $MODE"
exit 0
