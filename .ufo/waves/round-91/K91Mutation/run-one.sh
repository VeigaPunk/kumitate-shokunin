#!/usr/bin/env bash
# Score one candidate (pristine or mutant) with the frozen predicate. Args: <id> <tool-path>
set -u
id="$1"; tool="$2"
S=/fast/scratch/hyaku/kumitate-r91/K91Mutation
SEAT=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Mutation
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
PROBE="$LANE/.ufo/waves/round-91/probe/probe91-c1.mjs"
REV=2b1b8bf3d274db8e608035bffb27bd3b3d4009d4
mkdir -p "$S/p-$id"
export TMPDIR="$S"
start=$(date +%s)
prlimit --as=2147483648 timeout 300 node "$PROBE" \
  --lane "$LANE" --work "$S/p-$id" --alt /fast/scratch/hyaku \
  --rev "$REV" --tool "$tool" >"$SEAT/receipts/$id.txt" 2>"$SEAT/receipts/$id.err"
rc=$?
end=$(date +%s)
verdict=$(grep -E '^C91_C1:' "$SEAT/receipts/$id.txt" | tail -1)
echo -e "${id}\trc=${rc}\t$((end-start))s\t${verdict:-NO-VERDICT-LINE}"
