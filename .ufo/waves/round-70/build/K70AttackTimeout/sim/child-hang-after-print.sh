#!/usr/bin/env bash
# SIMULATION ONLY (not a frozen original): models a private control child that
# completes its receipt, prints it, then STALLS before echoing CONTROL-PASS.
# Models e.g. a live-fetch arm whose process lingers after output (open handle,
# wedged git/network child) — the receipt looks complete, the PASS marker never arrives.
set -euo pipefail
MODE="${1:?mode}"
W="${2:?workdir}"; mkdir -p "$W"
R="$W/c1-$MODE.txt"
printf 'LEDGER69_UNMET held=2/7 checks=7 rev=0000000000000000000000000000000000000000 rule=L69\n' > "$R"
printf 'control=%s exit=1 rev=0000000000000000000000000000000000000000\n' "$MODE" >> "$R"
cat "$R"
sleep 60
echo "CONTROL-PASS $MODE"
exit 0
