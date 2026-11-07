#!/usr/bin/env bash
# run-selftests.sh <mutants dir> <runs dir> [jobs]
# One `node <mutant> --selftest` per mutant dir; exit code, FAIL arms and verdict to runs/<name>/selftest.txt.
set -u
MUT=$1; RUNS=$2; J=${3:-4}
mkdir -p "$RUNS"
for d in "$MUT"/m-*; do
  n=$(basename "$d")
  mkdir -p "$RUNS/$n"
  printf '%s\n' "$d/round-gate.mjs" >> "$RUNS/$n/.todo"
done
run_one() {
  n=$(basename "$1")
  out="$RUNS/$n"
  t=$(mktemp -d -p /fast/scratch/hyaku/kumitate-r98/K98Mutation "tmp-$n.XXXXXX")
  TMPDIR="$t" timeout 600 node "$1/round-gate.mjs" --selftest > "$out/selftest.out" 2> "$out/selftest.err"
  echo "exit=$?" > "$out/selftest.status"
  grep -E '^(FAIL|SKIP)' "$out/selftest.out" > "$out/fails.txt" || true
  grep -E '^ROUND_GATE_SELFTEST:' "$out/selftest.out" > "$out/summary.txt" || true
  grep -E '^VERDICT:' "$out/selftest.out" >> "$out/summary.txt" || true
  rm -rf -- "$t"
  echo "$n $(cat "$out/selftest.status") $(tr '\n' '|' < "$out/summary.txt")"
}
export -f run_one
export RUNS
printf '%s\n' "$MUT"/m-*/ | xargs -P "$J" -I{} bash -c 'run_one "$@"' _ {}
