#!/usr/bin/env bash
# K90CriticB harm-sweep runner (sequential foreground; survives scratch job reaping).
# usage: sweep-run.sh <listfile> <first> <count> <kind:d|s>
#   kind d: lines are receipt dirs relative to $S/receipts (bind the whole dir)
#   kind s: lines are receipt paths relative to $S/receipts (bind singleton hardlink dir)
# Idempotent: skips a stamp whose both .out files already exist non-empty.
set -u
S=/fast/scratch/hyaku/kumitate-r90/K90CriticB
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=7218699cfbdec702ba42f35ceac0a8e52d1bd564
SEAT=$L/.ufo/waves/round-90/K90CriticB
O=$SEAT/sweep
R=$S/receipts
list="$1"; first="$2"; count="$3"; kind="$4"
mkdir -p "$O/dirs-v3" "$O/dirs-v4" "$O/singles-v3" "$O/singles-v4"
ran=0; skip=0; end=$((first+count-1))
i=0
while IFS= read -r line; do
  i=$((i+1))
  [ "$i" -ge "$first" ] || continue
  [ "$i" -le "$end" ] || break
  if [ "$kind" = d ]; then
    stamp=${line//\//__}; v3dir="$R/$line"; v4dir="$R/$line"; o3=dirs-v3; o4=dirs-v4
  else
    stamp=${line//\//__}; v3dir="$S/singles/$stamp"; v4dir="$S/singles/$stamp"; o3=singles-v3; o4=singles-v4
  fi
  if [ -s "$O/$o3/$stamp.out" ] && [ -s "$O/$o4/$stamp.out" ]; then skip=$((skip+1)); continue; fi
  TMPDIR=$S node "$SEAT/v3.mjs" --dir "$v3dir" --rev "$B" --lane "$L" > "$O/$o3/$stamp.out" 2> "$O/$o3/$stamp.err"
  echo "$?" > "$O/$o3/$stamp.exit"
  TMPDIR=$S node "$SEAT/v4-standin.mjs" --dir "$v4dir" --rev "$B" --lane "$L" > "$O/$o4/$stamp.out" 2> "$O/$o4/$stamp.err"
  echo "$?" > "$O/$o4/$stamp.exit"
  ran=$((ran+1))
done < "$list"
echo "RAN=$ran SKIPPED=$skip"
