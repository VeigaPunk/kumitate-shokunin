#!/usr/bin/env bash
# run-selftest.sh <mutant dir> -- run the planted tool's --selftest, write selftest.txt + exit
set -u
S=/fast/scratch/hyaku/kumitate-r99/K99Mutation
d=$1
mkdir -p "$S/tmp"
TMPDIR="$S/tmp" SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin LANG=C.UTF-8 \
  timeout 180 node "$d/scripts/sources-check.mjs" --selftest > "$d/selftest.txt" 2>&1
printf '%s\n' "$?" > "$d/exit"
