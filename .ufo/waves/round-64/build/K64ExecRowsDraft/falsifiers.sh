#!/usr/bin/env bash
# falsifiers.sh — K64ExecRowsDraft: prove the validators can fail on the staged rows and on
# mutations of the drafted block. Scratch only (/tmp); read-only against the lane.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$LANE/.ufo/waves/round-64/build/K64ExecRowsDraft
S=/tmp/kumitate-r64/K64ExecRowsDraft
CEN=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
STAGED=/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md

mklinks() { # $1 = mirror root
  ln -sfn "$LANE/scripts" "$1/scripts"
  ln -sfn "$LANE/SKILL.md" "$1/SKILL.md"
  ln -sfn "$LANE/.ufo" "$1/.ufo"
}

run() { # $1 = label, $2 = mirror root
  local out rc
  out=$(bash "$CEN" validate --file "$2/corpus/SOURCES.md" 2>&1); rc=$?
  echo "--- $1"
  printf '%s\n' "$out" | grep -v 'W04' || true
  echo "exit=$rc"
}

echo "== F1: the four staged rows appended verbatim to the base registry (no drafted block) =="
rm -rf "$S/f1"; mkdir -p "$S/f1"
cp -a "$LANE/corpus" "$S/f1/corpus"; mklinks "$S/f1"
awk 'NR==71||NR==82||NR==102||NR==103' "$STAGED" > "$S/f1/staged-rows.txt"
sed -i '151r '"$S"'/f1/staged-rows.txt' "$S/f1/corpus/SOURCES.md"
echo "inserted ids: $(grep -o '^| S[0-9]*' "$S/f1/staged-rows.txt" | tr '\n' ' ')"
echo "escaped pipes per staged row: $(awk '{n=gsub(/\\\|/,""); print $2"\\|x"n}' "$S/f1/staged-rows.txt" | tr '\n' ' ')"
run "staged rows as-is" "$S/f1"

echo
echo "== F2: mutation — S198 recheck cell carries prose instead of NNd =="
rm -rf "$S/f2"; cp -a "$B/validate" "$S/f2"
sed -i 's#^\(| S198 |.*| mined | 2026-10-25 | \)180d |#\1180d - `curl` -> 1 (ran 2026-10-25) |#' "$S/f2/corpus/SOURCES.md"
run "S198 recheck prose" "$S/f2"

echo
echo "== F3: mutation — S199 used-by points at a non-existent entry =="
rm -rf "$S/f3"; cp -a "$B/validate" "$S/f3"
sed -i 's#^\(| S199 |.*| mined | 2026-10-25 | 180d | \)corpus/knowledge/jj-workspace-seat-containment.md |$#\1corpus/knowledge/jj-seat-workspace-containment-2026-10-24.md |#' "$S/f3/corpus/SOURCES.md"
run "S199 dangling used-by" "$S/f3"

echo
echo "== F4: mutation — S200 loses its teaches cell (NF drops by 2) =="
rm -rf "$S/f4"; cp -a "$B/validate" "$S/f4"
sed -i 's#^\(| S200 | [^|]* | docs | A | [^|]* | [^|]* \)|\s*releasing a seat[^|]*|#\1|#' "$S/f4/corpus/SOURCES.md"
run "S200 malformed" "$S/f4"

echo
echo "== F5: control — the drafted mirror as delivered =="
run "drafted mirror" "$B/validate"
