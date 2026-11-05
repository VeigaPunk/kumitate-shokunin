#!/usr/bin/env bash
set -u
S=/fast/scratch/hyaku/kumitate-r90/K90CriticB
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=7218699cfbdec702ba42f35ceac0a8e52d1bd564
SEAT=$L/.ufo/waves/round-90/K90CriticB
R=$S/receipts
O=$SEAT/sweep
mkdir -p "$O/dirs-v3" "$O/dirs-v4" "$O/singles-v3" "$O/singles-v4" "$O/fix"
run() { # instrument outdir dirpath stamp
  local instr="$1" od="$2" dp="$3" stamp="$4"
  TMPDIR=$S node "$SEAT/$instr" --dir "$dp" --rev "$B" --lane "$L" > "$O/$od/$stamp.out" 2> "$O/$od/$stamp.err"
  echo "$?" > "$O/$od/$stamp.exit"
}
pids=0
launch() { run "$@" & pids=$((pids+1)); if [ "$pids" -ge 8 ]; then wait -n; pids=$((pids-1)); fi; }
while IFS= read -r d; do
  stamp=${d//\//__}
  launch v3.mjs dirs-v3 "$R/$d" "$stamp"
  launch v4-standin.mjs dirs-v4 "$R/$d" "$stamp"
done < "$S/close-dirs-rel.txt"
wait
while IFS= read -r p; do
  stamp=${p//\//__}
  launch v3.mjs singles-v3 "$S/singles/$stamp" "$stamp"
  launch v4-standin.mjs singles-v4 "$S/singles/$stamp" "$stamp"
done < "$S/close-files.txt"
wait
# repair pass: rerun anything missing, sequentially
rep=0
while IFS= read -r d; do
  stamp=${d//\//__}
  for pair in "v3.mjs dirs-v3" "v4-standin.mjs dirs-v4"; do set -- $pair; [ -s "$O/$2/$stamp.out" ] || { run "$1" "$2" "$R/$d" "$stamp"; rep=$((rep+1)); }; done
done < "$S/close-dirs-rel.txt"
while IFS= read -r p; do
  stamp=${p//\//__}
  for pair in "v3.mjs singles-v3" "v4-standin.mjs singles-v4"; do set -- $pair; [ -s "$O/$2/$stamp.out" ] || { run "$1" "$2" "$S/singles/$stamp" "$stamp"; rep=$((rep+1)); }; done
done < "$S/close-files.txt"
echo "REPAIR-RUNS=$rep"
for d in zwsp-mid-cmd nbsp-tail-sha all-prefixed-zwsp; do
  for pair in "v3.mjs v3" "v4-standin.mjs v4"; do set -- $pair
    TMPDIR=$S node "$SEAT/$1" --dir "$S/fixtures/$d" --rev "$B" --lane "$L" > "$O/fix/$d.$2.out" 2> "$O/fix/$d.$2.err"; echo "$?" > "$O/fix/$d.$2.exit"
  done
done
TMPDIR=$S node "$SEAT/v3.mjs" --selftest --work "$S/selftest-v3" > "$O/selftest-v3.txt" 2>&1; echo "$?" > "$O/selftest-v3.exit"
TMPDIR=$S node "$SEAT/v4-standin.mjs" --selftest --work "$S/selftest-v4" > "$O/selftest-v4.txt" 2>&1; echo "$?" > "$O/selftest-v4.exit"
echo "COUNTS dirs-v3=$(ls "$O/dirs-v3" | grep -c '\.out$') dirs-v4=$(ls "$O/dirs-v4" | grep -c '\.out$') singles-v3=$(ls "$O/singles-v3" | grep -c '\.out$') singles-v4=$(ls "$O/singles-v4" | grep -c '\.out$') fix=$(ls "$O/fix" | grep -c '\.out$')"
