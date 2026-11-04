#!/usr/bin/env bash
# K88Mutation: run boundary-battery.mjs against one mutant; receipt to receipts/<id>.battery.txt.
set -u
ID=$1
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88Mutation
S=/fast/scratch/hyaku/kumitate-r88/K88Mutation
REV=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
CMD="node $B/boundary-battery.mjs --tool $B/mutants/$ID.mjs --work $S/bb-$ID"
{
  echo "rev=$REV"
  echo "tool_sha256=$(sha256sum "$B/boundary-battery.mjs" | cut -d' ' -f1)"
  echo "cmd=$CMD"
  echo "mutant_sha256=$(sha256sum "$B/mutants/$ID.mjs" | cut -d' ' -f1)"
  OUT=$(TMPDIR=$S timeout 600 $CMD 2>&1); RC=$?
  printf '%s\n' "$OUT"
  echo "exit=$RC"
  echo "signal=none"
} > "$B/receipts/$ID.battery.txt"
echo "DONE $ID $(grep -h '^BATTERY' "$B/receipts/$ID.battery.txt") fails=[$(grep -h '^CASE' "$B/receipts/$ID.battery.txt" | grep ': FAIL ' | cut -d: -f1 | sed 's/^CASE //' | tr '\n' ' ')]"
