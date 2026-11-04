#!/usr/bin/env bash
# byte-identical.sh <workdir> <orig.mjs> <patched.mjs> <lane-clone>
# Every pre-existing finding class must read byte-identically before and after the patch.
# Only the resolving-symlink case may differ.
set -u
W=$1; ORIG=$2; PAT=$3; LANE=$4
M=$W/matrix
rm -rf "$M"; mkdir -p "$M"
fails=0

mk() { # mk <name>; sets D
  D=$M/$1
  mkdir -p "$D/corpus/knowledge" "$D/corpus/lessons"
  printf '# a\n' > "$D/corpus/knowledge/a.md"
  printf '# b\n' > "$D/corpus/lessons/b.md"
}

rows3='| `knowledge/a.md` | d | p |
| `lessons/b.md` | d | p |
| `lessons/link.md` | d | p |'
rows2='| `knowledge/a.md` | d | p |
| `lessons/b.md` | d | p |'

# c1 clean
mk clean; printf '# README\n\n## Coverage map\n\n%s\n' "$rows2" > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md"]}\n' > "$D/reg.json"
# c2 dangling symlink (v2 stale-covered must NOT change)
mk dangling; ln -s ../knowledge/no-such.md "$D/corpus/lessons/link.md"
printf '# README\n\n## Coverage map\n\n%s\n' "$rows3" > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md","lessons/link.md"]}\n' > "$D/reg.json"
# c3 covered member that is a directory
mk dirfile; mkdir -p "$D/corpus/knowledge/dir.md"
printf '# README\n\n## Coverage map\n\n%s\n' "$rows3" > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md","knowledge/dir.md"]}\n' > "$D/reg.json"
# c4 covered member that is a fifo
mk fifo; mkfifo "$D/corpus/lessons/link.md"
printf '# README\n\n## Coverage map\n\n%s\n' "$rows3" > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md","lessons/link.md"]}\n' > "$D/reg.json"
# c5 outside-map + uncovered + orphan + duplicate + format-unmapped
mk mixed
printf '# README\n\n## Coverage map\n\n| `knowledge/a.md` | d | p |\n| `knowledge/a.md` | d2 | p2 |\n| `lessons/gone.md` | d | p |\n| lessons/stray.md | d | p |\n\n## Frontier\n\n| `lessons/b.md` | d | p |\n' > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md"]}\n' > "$D/reg.json"
# c6 registry version 1 (fail-closed)
mk regv1; printf '# README\n\n## Coverage map\n\n%s\n' "$rows2" > "$D/corpus/README.md"
printf '{"version":1,"covered":[]}\n' > "$D/reg.json"
# c7 covered scope violation (fail-closed)
mk scope; printf '# README\n\n## Coverage map\n\n%s\n' "$rows2" > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md","scripts/x.md"]}\n' > "$D/reg.json"
# c8 stale-covered: covered entry with no file at all
mk stale; printf '# README\n\n## Coverage map\n\n%s\n' "$rows2" > "$D/corpus/README.md"
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md","lessons/gone.md"]}\n' > "$D/reg.json"

run() { # run <bin> <dir> -> writes $M/<case>.<which>.out, echoes exit
  local bin=$1 d=$2 which=$3
  node "$bin" --registry "$d/reg.json" --readme "$d/corpus/README.md" \
    --corpus "$d/corpus/knowledge" --corpus "$d/corpus/lessons" > "$d/$which.out" 2>&1
  echo $?
}

for c in clean dangling dirfile fifo mixed regv1 scope stale; do
  d=$M/$c
  eo=$(run "$ORIG" "$d" orig); ep=$(run "$PAT" "$d" patched)
  if diff -q "$d/orig.out" "$d/patched.out" >/dev/null && [ "$eo" = "$ep" ]; then
    printf 'CASE %-9s IDENTICAL exit=%s  %s\n' "$c" "$eo" "$(tr '\n' '|' < "$d/orig.out")"
  else
    fails=$((fails+1))
    printf 'CASE %-9s DIFFERS orig_exit=%s patched_exit=%s\n' "$c" "$eo" "$ep"
    diff -u "$d/orig.out" "$d/patched.out"
  fi
done

# the lane itself, at the committed revision (no symlinks in corpus at base)
LA=(--registry "$LANE/.ufo/pins/readme-map.json" --readme "$LANE/corpus/README.md"
    --corpus "$LANE/corpus/knowledge" --corpus "$LANE/corpus/lessons")
node "$ORIG" "${LA[@]}" > "$M/lane.orig.out" 2>&1; eo=$?
node "$PAT" "${LA[@]}" > "$M/lane.patched.out" 2>&1; ep=$?
if diff -q "$M/lane.orig.out" "$M/lane.patched.out" >/dev/null && [ "$eo" = "$ep" ]; then
  printf 'CASE %-9s IDENTICAL exit=%s  %s\n' lane "$eo" "$(tr '\n' '|' < "$M/lane.orig.out")"
else
  fails=$((fails+1))
  printf 'CASE %-9s DIFFERS orig_exit=%s patched_exit=%s\n' lane "$eo" "$ep"
  diff -u "$M/lane.orig.out" "$M/lane.patched.out"
fi

echo "MATRIX_DIFFERENCES=$fails"
