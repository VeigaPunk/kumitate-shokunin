#!/usr/bin/env bash
# K88Mutation: score ONE mutant file with the frozen probe (--tool) and with its own --selftest.
#   run-mutant.sh <id> <mutant.mjs>
# Writes receipts/<id>.probe.txt and receipts/<id>.selftest.txt (receipt shape: rev=, tool_sha256=
# of cmd= token 2, cmd=, output, exit=, signal=none) and mutants/<id>.diff.
set -u
ID=$1; MUT=$2
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$LANE/.ufo/waves/round-88/build/K88Mutation
S=/fast/scratch/hyaku/kumitate-r88/K88Mutation
REV=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
PROBE=$LANE/.ufo/waves/round-88/probe/probe88-c1.mjs
W=$S/work-$ID; rm -rf "$W"; mkdir -p "$W"
export TMPDIR=$W
diff -u "$B/mutants/M00-pristine.mjs" "$MUT" > "$B/mutants/$ID.diff"
MSHA=$(sha256sum "$MUT" | cut -d' ' -f1)

CMD="node $PROBE --lane $LANE --work $W/probe --rev $REV --tool $MUT"
{
  echo "rev=$REV"
  echo "tool_sha256=$(sha256sum "$PROBE" | cut -d' ' -f1)"
  echo "cmd=$CMD"
  echo "mutant_sha256=$MSHA"
  OUT=$($CMD 2>&1); RC=$?
  printf '%s\n' "$OUT"
  echo "exit=$RC"
  echo "signal=none"
} > "$B/receipts/$ID.probe.txt"

CMD2="node $MUT --selftest --work $W/selftest"
{
  echo "rev=$REV"
  echo "tool_sha256=$MSHA"
  echo "cmd=$CMD2"
  OUT=$($CMD2 2>&1); RC=$?
  printf '%s\n' "$OUT"
  echo "exit=$RC"
  echo "signal=none"
} > "$B/receipts/$ID.selftest.txt"
rm -rf "$W"
echo "DONE $ID $(grep -h '^C88_C1:' "$B/receipts/$ID.probe.txt") | $(grep -h '^RECEIPT_BIND_SELFTEST: ' "$B/receipts/$ID.selftest.txt")"
