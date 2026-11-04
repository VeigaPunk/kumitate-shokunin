#!/usr/bin/env bash
# Round-75 C1 specificity fixture builder (shape-only; never reads member content).
# Usage: mk-shape-fixture.sh <live-root> <fixture-dir> [bogus-name]
# Copies the depth-1 SHAPE of <live-root> (dir -> mkdir with the same 0755 ceiling bits,
# file -> empty file with the same mode, no content) and optionally adds one bogus member.
set -euo pipefail
live=${1:?live root}; fix=${2:?fixture dir}; bogus=${3:-}
rm -rf -- "$fix"; mkdir -p -- "$fix"
for n in $(ls -1 -- "$live"); do
  if [ -d "$live/$n" ]; then
    mkdir -p -- "$fix/$n"; chmod "$(stat -c %a "$live/$n")" "$fix/$n"
  else
    : > "$fix/$n"; chmod "$(stat -c %a "$live/$n")" "$fix/$n"
  fi
done
if [ -n "$bogus" ]; then : > "$fix/$bogus"; chmod 600 "$fix/$bogus"; fi
echo "FIXTURE entries=$(ls -1 "$fix" | wc -l) root=$fix bogus=${bogus:-none}"
