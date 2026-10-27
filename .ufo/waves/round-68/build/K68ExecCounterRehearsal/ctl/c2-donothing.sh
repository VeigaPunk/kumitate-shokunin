#!/usr/bin/env bash
# c2-donothing.sh — do-nothing control for round-68 C2 (rule M68 v1).
# Copies the staged shokuknow deprecation entry byte-for-byte into a synthetic fixture lane
# (plus a PROVINCE line naming it, nothing else) and runs the frozen counter against it.
# Expectation (committed as the control receipt): DEPREC68_UNMET, exit 1.
set -euo pipefail
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
PROBE="$LANE/.ufo/waves/round-68/probe/deprec68-probe.mjs"
STAGED=/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md
W="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecCounterRehearsal/ctl"
S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r68/c2-donothing"
rm -rf "$S"; mkdir -p "$S/fx/corpus/knowledge"
cd "$S/fx"
git init -q
cp "$STAGED" corpus/knowledge/mcp-deprecation-registry.md
printf '# Province\n\n- MCP protocol revisions: corpus/knowledge/mcp-deprecation-registry.md\n' > PROVINCE.md
git add -A
git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c2-donothing fixture"
REV=$(git rev-parse HEAD)
mkdir -p "$W"
TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r68" node "$PROBE" "$S/fx" "$REV" --no-live > "$W/c2-donothing.txt" 2>&1 || RC=$?
RC=${RC:-0}
echo "control=c2-donothing exit=$RC rev=$REV" >> "$W/c2-donothing.txt"
cat "$W/c2-donothing.txt"
case "$(head -1 "$W/c2-donothing.txt")" in
  DEPREC68_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS c2-donothing"; exit 0; } ;;
esac
echo "CONTROL-FAIL c2-donothing"
exit 1
