#!/usr/bin/env bash
# battery.sh <lane dir> <label>: runs the K3 harm battery in <lane dir>; each command's own exit code is printed.
cd "$1" || exit 2
echo "# battery at $2 (dir $1, rev $(git rev-parse HEAD))"
for c in "node scripts/proxy-check.mjs" "node scripts/proxy-check.mjs --strict" "node scripts/readme-map.mjs" "node scripts/sources-check.mjs" "node scripts/counter-pins.mjs" "node scripts/spotcheck-adopt.mjs --check" "node scripts/round-gate.mjs --tracked --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin" "node scripts/round-gate.mjs --round 95 --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin" "/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md"; do
  echo "\$ $c"; o=$($c 2>&1); rc=$?; printf '%s\n' "$o" | tail -4; echo "exit=$rc"
done
