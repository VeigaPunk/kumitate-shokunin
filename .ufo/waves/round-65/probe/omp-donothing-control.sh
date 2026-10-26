#!/usr/bin/env bash
# omp-donothing-control.sh — the cheapest control that skips C2's work, scored with the frozen counter omp65-probe.mjs.
# Sandbox clone only (never the lane): copy the staged shokuknow OMP protocol-version entry byte-for-byte into the new
# entry path, add one PROVINCE frontier line, a README row and a one-line amendment to omp-task-contract.md, and change
# nothing else (no registry rows, no captures, no host measurements).
# Usage: omp-donothing-control.sh <lane-dir> <base-rev> <probe.mjs>
set -eu
LANE=$1; BASE=$2; PROBE=$3
D=$(mktemp -d); trap 'rm -rf "$D"' EXIT
git clone -q --no-hardlinks "$LANE" "$D/c"
C="$D/c"
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
git -C "$C" checkout -q --detach "$BASE"
E=corpus/knowledge/omp-installed-release-mcp-runtime.md
cp /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/omp-host-harness-protocol-skew-2026-10-27.md "$C/$E"
printf '\n- Do-nothing frontier line: `%s`.\n' "$E" >> "$C/PROVINCE.md"
printf '\n## Amendment 2026-10-25\nVersion skew: see `%s`.\n' "$E" >> "$C/corpus/knowledge/omp-task-contract.md"
git -C "$C" add -A
git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m 'do-nothing control'
REV=$(git -C "$C" rev-parse HEAD)
node "$PROBE" "$C" "$REV" --no-live || true
