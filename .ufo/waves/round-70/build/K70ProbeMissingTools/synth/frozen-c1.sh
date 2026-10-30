#!/usr/bin/env bash
# SYNTHETIC frozen control for the K70ProbeMissingTools mechanism probe.
# This is NOT a copy of any round-69 control; it is an original minimal script
# shaped like the frozen controls so the replay-implementation-contract
# mechanisms (single substitution of LANE/PROBE/W/S, removal of the unused
# fixed temporary write, explicit fixture-root git, scrubbed env) can be
# exercised in isolation. Label is SYNTH69_* (synthetic), never LEDGER69_*
# or DEPREC69_* (real control labels).
set -euo pipefail
MODE="${1:?usage: frozen-c1.sh donothing|autoledger}"
LANE=/nonexistent/frozen-lane
PROBE="$LANE/probe/synth-probe.mjs"
W="$LANE/controls"
S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-synth/c1-controls-$MODE"
# unused fixed temporary write (models the r69 c2 line-80 class of defect);
# a contract-conformant replay driver removes this line in the private copy.
touch "$W/.fixed-unused-tmp"
rm -rf "$S"
mkdir -p "$S/fx"
git -C "$S" init -q fx 2>/dev/null || git -C "$S/fx" init -q
printf '# synth fixture\n' > "$S/fx/README.md"
if [ "$MODE" = "autoledger" ]; then
  printf '| A1x1 | 1 | 1 | "auto row" | auto | open | - |\n' > "$S/fx/row.md"
fi
git -C "$S/fx" add -A
git -C "$S/fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "synth-$MODE fixture"
REV="$(git -C "$S/fx" rev-parse HEAD)"
mkdir -p "$W"
RC=0
node "$PROBE" "$S/fx" "$REV" > "$W/synth-$MODE.txt" 2>&1 || RC=$?
echo "control=$MODE exit=$RC rev=$REV" >> "$W/synth-$MODE.txt"
cat "$W/synth-$MODE.txt"
case "$(head -1 "$W/synth-$MODE.txt")" in
  SYNTH69_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS $MODE"; exit 0; } ;;
esac
echo "CONTROL-FAIL $MODE"
exit 1
