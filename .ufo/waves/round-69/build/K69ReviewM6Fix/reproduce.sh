#!/usr/bin/env bash
set -euo pipefail
S=/fast/scratch/hyaku/kumitate-r69/K69ReviewM6Fix
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B="$L/.ufo/waves/round-69/build/K69ReviewM6Fix"
mkdir -p "$S/base"
trap 'rm -rf -- "$S"' EXIT
export TMPDIR="$S"
git -C "$L" archive 9401d8655970d542b81d318bdad558d6dea39397 \
  .ufo/waves/round-69/probe/deprec69-probe.mjs \
  .ufo/waves/round-68/probe/deprec68-probe.mjs \
  corpus/knowledge/mcp-deprecation-registry.md \
  .ufo/waves/round-68/build/K68ScribeEntry/captures/S207-deprecated-2026-07-28.md \
  | tar -x -C "$S/base"
node "$B/attack.mjs" "$S/base" "$B"
