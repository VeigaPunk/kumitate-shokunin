#!/usr/bin/env bash
# run-mutants.sh — score every generated mutant with the FROZEN probe89-c1 and with the mutant's
# own --selftest. One receipt pair per mutant under receipts/.
#
#   run-mutants.sh <build-dir> <scratch-dir> <rev>
set -u
BUILD=$1; S=$2; REV=$3
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
PROBE=$LANE/.ufo/waves/round-89/probe/probe89-c1.mjs
R=$BUILD/receipts
mkdir -p "$R" "$S/probe" "$S/st"
export LANE PROBE R S REV
score_one() {
  id=$1
  tool=$BUILD/mutants/$id.mjs
  node "$PROBE" --lane "$LANE" --work "$S/probe/$id" --rev "$REV" --tool "$tool" > "$R/$id.probe.txt" 2>&1
  echo "probe_exit=$?" >> "$R/$id.probe.txt"
  node "$tool" --selftest --work "$S/st/$id" > "$R/$id.selftest.txt" 2>&1
  echo "selftest_exit=$?" >> "$R/$id.selftest.txt"
}
export -f score_one
export BUILD
ls "$BUILD/mutants"/*.mjs | xargs -n1 -P 8 -I{} basename {} .mjs | xargs -n1 -P 8 -I{} bash -c 'score_one "$@"' _ {}
# baseline: the pristine candidate, same two detectors
node "$PROBE" --lane "$LANE" --work "$S/probe/baseline" --rev "$REV" --tool "$BUILD/candidate-v3.mjs" > "$R/baseline.probe.txt" 2>&1
echo "probe_exit=$?" >> "$R/baseline.probe.txt"
node "$BUILD/candidate-v3.mjs" --selftest --work "$S/st/baseline" > "$R/baseline.selftest.txt" 2>&1
echo "selftest_exit=$?" >> "$R/baseline.selftest.txt"
echo DONE
