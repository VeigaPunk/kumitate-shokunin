#!/usr/bin/env bash
# jj-donothing-control.sh — the cheapest control that skips C2's work, scored with the frozen counter jj64-probe.mjs.
# Sandbox clone only (never the lane): copy the staged shokuknow entry byte-for-byte into the new entry path, add one
# PROVINCE frontier line and a one-line amendment, change nothing else (no rows, no captures, no demo outcomes).
# Usage: jj-donothing-control.sh <lane-dir> <base-rev> <probe.mjs>
set -eu
LANE=$1; BASE=$2; PROBE=$3
D=$(mktemp -d); trap 'rm -rf "$D"' EXIT
git clone -q --no-hardlinks "$LANE" "$D/c"
C="$D/c"
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
git -C "$C" checkout -q --detach "$BASE"
cp /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/jj-seat-staleness-outcome-2026-10-25.md "$C/corpus/knowledge/jj-workspace-seat-containment.md"
printf '\n- Do-nothing frontier line: `corpus/knowledge/jj-workspace-seat-containment.md`.\n' >> "$C/PROVINCE.md"
printf '\n## Amendment 2026-10-25\nM7 is covered by `corpus/knowledge/jj-workspace-seat-containment.md`.\n' >> "$C/corpus/knowledge/agent-isolation-substrates.md"
git -C "$C" add -A
git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'do-nothing control'
REV=$(git -C "$C" rev-parse HEAD)
node "$PROBE" "$C" "$REV" --no-live || true
