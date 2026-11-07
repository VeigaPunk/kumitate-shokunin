#!/usr/bin/env bash
# Run the frozen round-94 counter over every mutant (parallel P=4).
set -u
S=/fast/scratch/hyaku/kumitate-r94/K94Mutation
PROBE=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-94/probe/probe94-c1.mjs
FREEZE=73317eca18c3927fc3c92fe492cd882dc4cda953
SEAT=${1:-$S}
mkdir -p "$SEAT/runs" "$SEAT/work"
export TMPDIR=$SEAT/tmp
run_one() {
  local m="$1" n
  n=$(basename "$m" .mjs)
  timeout 300 node "$PROBE" --tool "$m" --work "$SEAT/work/$n" --freeze "$FREEZE" \
    > "$SEAT/runs/$n-counter.txt" 2>&1
  echo "$n counter_exit=$?" >> "$SEAT/runs/counter-status.log"
}
export PROBE FREEZE SEAT
export -f run_one
ls "$SEAT"/mutants/m*.mjs | xargs -P 4 -I{} bash -c 'run_one "$@"' _ {}
