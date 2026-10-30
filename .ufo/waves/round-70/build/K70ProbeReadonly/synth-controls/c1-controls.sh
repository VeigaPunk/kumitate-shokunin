#!/usr/bin/env bash
# SYNTHETIC c1-controls.sh — pinned-source fixture for seat K70ExecFixtureTests.
# This is NOT the frozen round-69 original. It models the original's transform surface:
# exactly one LANE=/PROBE=/W=/S= assignment each, a fixture-root git invocation, and a
# receipt tail the replay tool must surface. Executed only as a private substituted copy
# inside scratch; the byte-identical original in the fixture lane is never executed.
set -euo pipefail
MODE="${1:?usage: c1-controls.sh donothing|autoledger}"
LANE=/nonexistent/fixture-lane
PROBE="$LANE/.ufo/waves/round-69/probe/ledger69-probe.mjs"
W="$LANE/.ufo/waves/round-69/controls"
S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c1-controls-$MODE"
rm -rf "$S"; mkdir -p "$S/fx"
cd "$S/fx"
git init -q
printf 'synthetic c1 %s fixture\n' "$MODE" > seed.txt
mkdir -p scripts corpus
printf '# synth skill\n' > SKILL.md
git add -A
git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c1-$MODE fixture"
REV=$(git -C "$S/fx" rev-parse HEAD)
mkdir -p "$W"
TMPDIR="$S" bash -c 'true' # placeholder for the frozen probe invocation
{
  echo "LEDGER69_UNMET held=2/10 checks=10 rev=$REV rule=L69 live=no-live(synthetic-fixture)"
  echo "R1 PASS frozen scripts unchanged"
  echo "R10 MISS registration triad"
} > "$W/c1-$MODE.txt"
cat "$W/c1-$MODE.txt"
echo "control=$MODE live=no-live(synthetic-fixture) exit=0 rev=$REV" >> "$W/c1-$MODE.txt"
echo "scratch=$S" >> "$W/c1-$MODE.txt"
case "$(head -1 "$W/c1-$MODE.txt")" in
  LEDGER69_UNMET*) echo "CONTROL-PASS $MODE"; exit 0 ;;
esac
echo "CONTROL-FAIL $MODE"
exit 1
