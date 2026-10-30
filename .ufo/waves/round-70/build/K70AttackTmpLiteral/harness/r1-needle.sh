#!/usr/bin/env bash
# R1-mechanism needle: demonstrates the frozen-compare used by probe check R1 and shows
# that ANY edit applied to the frozen path (including the line-80 removal itself) would
# MISS R1, while the frozen bytes stay equal today. Read-only against the lane.
set -euo pipefail
ROOT=/fast/scratch/hyaku/kumitate-r70/K70AttackTmpLiteral
R=$ROOT/receipts/r1needle
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=78b98d762ccf3e3a0961f94c4042eaabd2bcb706
P=.ufo/waves/round-69/probe/c2-controls.sh
mkdir -p "$R"
git -C "$LANE" show "$B:$P" > "$R/frozen-B.txt"
{
  echo "frozen_B_sha256=$(sha256sum "$R/frozen-B.txt" | cut -d' ' -f1)"
  echo "lane_worktree_sha256=$(sha256sum "$LANE/$P" | cut -d' ' -f1)"
  if cmp -s "$R/frozen-B.txt" "$LANE/$P"; then echo 'compare(frozen B, lane worktree)=EQUAL (R1 PASS-shaped today)'; else echo 'compare(frozen B, lane worktree)=DIFFER'; fi
  cp "$R/frozen-B.txt" "$R/tamper-1byte.txt"
  sed -i 's#/tmp/forge-sed.txt#/tmp/forge-Sed.txt#' "$R/tamper-1byte.txt"
  if cmp -s "$R/frozen-B.txt" "$R/tamper-1byte.txt"; then echo 'compare(tampered 1-byte)=EQUAL (unexpected)'; else echo 'compare(tampered 1-byte path change)=DIFFER -> R1 would MISS'; fi
  cp "$R/frozen-B.txt" "$R/line80-removed.txt"
  sed -i '80d' "$R/line80-removed.txt"
  if cmp -s "$R/frozen-B.txt" "$R/line80-removed.txt"; then echo 'compare(line-80 removed in frozen copy)=EQUAL (unexpected)'; else echo 'compare(line-80 removed in frozen copy)=DIFFER -> R1 would MISS'; fi
  echo "line80_removed_copy_sha256=$(sha256sum "$R/line80-removed.txt" | cut -d' ' -f1)"
} | tee "$R/summary.txt"
