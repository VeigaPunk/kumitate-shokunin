#!/usr/bin/env bash
# SYNTHETIC c2-controls.sh — pinned-source fixture for seat K70ExecFixtureTests.
# This is NOT the frozen round-69 original. It models the original's transform surface:
# exactly one LANE=/PROBE=/W=/S= assignment each, a case block over the three c2 modes,
# the known unused fixed temporary write (forge-sed.txt, mirroring r69 c2 line 80), a
# fixture-root git invocation, and a receipt tail the replay tool must surface.
set -euo pipefail
MODE="${1:?usage: c2-controls.sh donothing|autoorigin|forgecapture}"
LANE=/nonexistent/fixture-lane
PROBE="$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs"
W="$LANE/.ufo/waves/round-69/controls"
S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r70/K70ExecFixtureTests-unsubst/c2-controls-$MODE"
rm -rf "$S"; mkdir -p "$S/fx"
cd "$S/fx"
git init -q
printf 'synthetic c2 base tree\n' > seed.txt
mkdir -p corpus/knowledge .ufo/pins
printf '# registry\n' > corpus/knowledge/mcp-deprecation-registry.md
case "$MODE" in
  donothing)
    : # the base tree, byte-exact
    ;;
  autoorigin)
    printf '%s\n' '## Capture origin' '' '- S907 — synthetic stub row' >> corpus/knowledge/mcp-deprecation-registry.md
    ;;
  forgecapture)
    printf '%s\n' '- S210 — synthetic tamper marker' >> corpus/knowledge/mcp-deprecation-registry.md
    printf '%s\n' '- S207 — synthetic pinned' > /tmp/r70synth-forge-sed.txt
    # r70synth-fixed-tmp-write: known unused fixed temporary write; the replay tool removes this line.
    ;;
  *) echo "unknown mode $MODE"; exit 64 ;;
esac
git add -A
git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c2-$MODE fixture"
REV=$(git -C "$S/fx" rev-parse HEAD)
mkdir -p "$W"
TMPDIR="$S" bash -c 'true' # placeholder for the frozen probe invocation
{
  echo "DEPREC69_UNMET held=2/10 checks=10 rev=$REV rule=M69 live=no-live(synthetic-fixture)"
  echo "M11 MISS origin-section-absent"
} > "$W/c2-$MODE.txt"
cat "$W/c2-$MODE.txt"
echo "control=$MODE live=no-live(synthetic-fixture) exit=0 rev=$REV" >> "$W/c2-$MODE.txt"
echo "scratch=$S" >> "$W/c2-$MODE.txt"
case "$(head -1 "$W/c2-$MODE.txt")" in
  DEPREC69_UNMET*) echo "CONTROL-PASS $MODE"; exit 0 ;;
esac
echo "CONTROL-FAIL $MODE"
exit 1
