#!/usr/bin/env bash
# repro.sh <workdir> <orig.mjs> <patched.mjs>
# Hermetic fixture: a `covered` entry that is a symlink whose target EXISTS.
# Prints the original token and the patched token on the same fixture.
set -u
W=$1; ORIG=$2; PAT=$3
F=$W/fixture
rm -rf "$F"
mkdir -p "$F/corpus/knowledge" "$F/corpus/lessons"
printf '# a\n' > "$F/corpus/knowledge/a.md"
printf '# b\n' > "$F/corpus/lessons/b.md"
ln -s ../knowledge/a.md "$F/corpus/lessons/link.md"
cat > "$F/corpus/README.md" <<'EOF'
# README

## Coverage map

| `knowledge/a.md` | d | p |
| `lessons/b.md` | d | p |
| `lessons/link.md` | d | p |
EOF
printf '{"version":2,"covered":["knowledge/a.md","lessons/b.md","lessons/link.md"]}\n' > "$F/reg.json"

echo "--- fixture ---"
find "$F" -mindepth 1 | sort
echo "link: $(readlink "$F/corpus/lessons/link.md")"
if [ -f "$F/corpus/lessons/link.md" ]; then echo "link target resolves: yes"; else echo "link target resolves: NO"; fi
echo "--- corpus/lessons/link.md lstat/stat ---"
node -e 'const fs=require("fs");const p=process.argv[1];const l=fs.lstatSync(p);console.log("lstat isSymbolicLink="+l.isSymbolicLink()+" isFile="+l.isFile());console.log("stat isFile="+fs.statSync(p).isFile())' "$F/corpus/lessons/link.md"

ARGS=(--registry "$F/reg.json" --readme "$F/corpus/README.md" --corpus "$F/corpus/knowledge" --corpus "$F/corpus/lessons")
echo "--- orig: node readme-map.orig.mjs ${ARGS[*]} ---"
node "$ORIG" "${ARGS[@]}"
echo "ORIG_EXIT=$?"
echo "--- patched: node readme-map.patched.mjs ${ARGS[*]} ---"
node "$PAT" "${ARGS[@]}"
echo "PATCHED_EXIT=$?"
