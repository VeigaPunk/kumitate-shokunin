#!/usr/bin/env bash
# run-counter.sh <mutants dir> <runs dir> <mutant name>... ; RUN_JOBS=n (default 2)
set -u
MUT=$1; RUNS=$2; shift 2
J=${RUN_JOBS:-2}
PROBE=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-98/probe/probe98-c1.mjs
FREEZE=7038ee4c487d8c8d3116d98ec831b8e754337239
run_one() {
  n=$(basename "$1")
  out="$RUNS/$n"
  w=$(mktemp -d -p /fast/scratch/hyaku/kumitate-r98/K98Mutation "cw-$n.XXXXXX")
  TMPDIR="$w" timeout 900 node "$PROBE" --tool "$1/round-gate.mjs" --work "$w" --freeze "$FREEZE" \
    > "$out/counter.out" 2> "$out/counter.err"
  echo "counter_exit=$?" > "$out/counter.status"
  grep -E '^C98_C1:' "$out/counter.out" > "$out/counter.verdict" || true
  rm -rf -- "$w"
  echo "$n $(cat "$out/counter.status") $(cat "$out/counter.verdict")"
}
export -f run_one
export RUNS PROBE FREEZE
printf '%s\n' "$@" | xargs -P "$J" -I{} bash -c 'run_one "$@"' _ "$MUT/{}"
