#!/usr/bin/env bash
# SIMULATION ONLY: models a child hung mid-probe (e.g. live network fetch to the
# pinned URL never returns). Receipt partial/empty at kill time.
set -euo pipefail
MODE="${1:?mode}"
W="${2:?workdir}"; mkdir -p "$W"
R="$W/c2-$MODE.txt"
printf 'DEPREC69_ fetch in progress...\n' > "$R"
sleep 60
echo "CONTROL-PASS $MODE"
exit 0
