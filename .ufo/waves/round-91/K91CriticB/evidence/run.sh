#!/bin/bash
# K91CriticB harm check: v4 (base 0bff4bab) vs positive control ref-fd-fstat.mjs, at rev 2b1b8bf3.
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
REV=2b1b8bf3d274db8e608035bffb27bd3b3d4009d4
S=/fast/scratch/hyaku/kumitate-r91/K91CriticB
SEAT=$L/.ufo/waves/round-91/K91CriticB
V4=$S/receipt-bind-v4.mjs
CTL=$L/.ufo/waves/round-91/controls/ref-fd-fstat.mjs
export TMPDIR=$S
export S L REV V4 CTL

# run <tool> <dir> <outprefix>: stdout -> P.out, stderr -> P.err, exit -> P.rc
run() {
  local tool=$1 dir=$2 p=$3
  prlimit --as=2147483648 timeout 60 node "$tool" --dir "$dir" --rev "$REV" --lane "$L" \
    >"$p.out" 2>"$p.err" </dev/null
  echo $? >"$p.rc"
}
export -f run

# line <file-prefix>: one-line rendering of stdout (+stderr if any), truncated.
line() {
  local p=$1 o e
  o=$(tr '\n\t' '  ' < "$p.out")
  e=""; [ -s "$p.err" ] && e=" ERR:$(tr '\n\t' '  ' < "$p.err" | head -c 200)"
  printf '%s%s' "$o" "$e"
}

single_one() {
  local rel=$1 sd=$2 id
  id=$(printf '%s' "$rel" | tr '/' '_')
  run "$V4" "$sd" "$S/out/s-$id.v4"
  run "$CTL" "$sd" "$S/out/s-$id.ctl"
}
export -f single_one

mkdir -p "$S/out" "$S/singles"

# ---- dirs: 43 committed close dirs ----
cut -d/ -f1-4 "$S/close-files.txt" | sort -u > "$S/close-dirs.txt"
printf 'close_dir\tn_txt\tv4_rc\tctl_rc\tv4_line\tctl_line\tverdict\n' > "$SEAT/dirs.tsv"
while read -r d; do
  tag=$(printf '%s' "$d" | tr '/' '_')
  dir="$S/raw/$d"
  run "$V4" "$dir" "$S/out/dir-$tag.v4"
  run "$CTL" "$dir" "$S/out/dir-$tag.ctl"
  n=$(ls "$dir"/*.txt 2>/dev/null | wc -l)
  r4=$(cat "$S/out/dir-$tag.v4.rc"); rc=$(cat "$S/out/dir-$tag.ctl.rc")
  if [ "$(cat "$S/out/dir-$tag.v4.out")" = "$(cat "$S/out/dir-$tag.ctl.out")" ] && [ "$r4" = "$rc" ]; then v=AGREE; else v=DIFF; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$d" "$n" "$r4" "$rc" \
    "$(line "$S/out/dir-$tag.v4")" "$(line "$S/out/dir-$tag.ctl")" "$v" >> "$SEAT/dirs.tsv"
done < "$S/close-dirs.txt"
echo DIRS_DONE

# ---- singles: every *.txt receipt alone in its own dir ----
: > "$S/single-list.txt"
while read -r d; do
  tag=$(printf '%s' "$d" | tr '/' '_')
  for f in "$S/raw/$d"/*.txt; do
    [ -e "$f" ] || continue
    b=$(basename "$f")
    sd="$S/singles/${tag}__${b}.d"
    mkdir -p "$sd"; cp -- "$f" "$sd/$b"
    printf '%s/%s\t%s\n' "$d" "$b" "$sd" >> "$S/single-list.txt"
  done
done < "$S/close-dirs.txt"
echo "singles=$(wc -l < "$S/single-list.txt")"

# Feed NUL-separated pairs; -n2 consumes rel and sd together.
while IFS=$'\t' read -r rel sd; do
  printf '%s\0%s\0' "$rel" "$sd"
done < "$S/single-list.txt" | xargs -0 -n2 -P4 bash -c 'single_one "$0" "$1"'
echo SINGLES_RAN

printf 'receipt\tsingle_dir\tv4_rc\tctl_rc\tv4_line\tctl_line\tverdict\n' > "$SEAT/singles.tsv"
while IFS=$'\t' read -r rel sd; do
  id=$(printf '%s' "$rel" | tr '/' '_')
  p4="$S/out/s-$id.v4"; pc="$S/out/s-$id.ctl"
  r4=$(cat "$p4.rc"); rc=$(cat "$pc.rc")
  if [ "$(cat "$p4.out")" = "$(cat "$pc.out")" ] && [ "$r4" = "$rc" ]; then v=AGREE; else v=DIFF; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$rel" "$sd" "$r4" "$rc" \
    "$(line "$p4")" "$(line "$pc")" "$v" >> "$SEAT/singles.tsv"
done < "$S/single-list.txt"
echo ALL_DONE
