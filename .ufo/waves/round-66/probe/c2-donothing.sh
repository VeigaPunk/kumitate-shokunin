#!/usr/bin/env bash
# c2-donothing.sh — round-66 C2 pre-data do-nothing control for rule M66 (committed with the freeze).
#   bash .ufo/waves/round-66/probe/c2-donothing.sh <lane-dir>
# On a sandbox clone at the round base: copy the staged shokuknow entry
# merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md byte-for-byte to the claimed entry
# path and add a PROVINCE frontier line naming it; nothing else (no rows opened, no captures, no re-grounding).
# Committed inside the clone only. A control that scores DEPREC66_HELD means the counter or the target is wrong.
set -euo pipefail
LANE=$(cd "$1" && pwd)
BASE=8d557f85312de4fcc82e09ff735d21436bc3746d
STAGED=/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md
SCRATCH=${SCRATCH:-/fast/scratch/hyaku/kumitate-r66/controls}
mkdir -p "$SCRATCH"
D=$(mktemp -d "$SCRATCH/c2-donothing.XXXXXX")
trap 'rm -rf -- "$D"' EXIT
git clone -q --shared "$LANE" "$D/lane"
C="$D/lane"
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo "toplevel mismatch"; exit 2; }
git -C "$C" checkout -q --detach "$BASE"
cp "$STAGED" "$C/corpus/knowledge/mcp-deprecation-registry.md"
echo "staged-sha256 $(sha256sum "$STAGED" | cut -d' ' -f1)"
printf -- '- MCP deprecation registry, frontier band advanced by `corpus/knowledge/mcp-deprecation-registry.md` (control).\n' >> "$C/PROVINCE.md"
git -C "$C" add -A
git -C "$C" -c user.name=control -c user.email=control@invalid -c commit.gpgsign=false commit -q --no-verify -m "c2 do-nothing control"
REV=$(git -C "$C" rev-parse HEAD)
set +e
TMPDIR="$D" node "$LANE/.ufo/waves/round-66/probe/deprec66-probe.mjs" "$C" "$REV"
echo "EXIT=$?"
