#!/bin/bash
# q33-locator-coverage.sh — Q33: for each SOURCES row admitted in a round lesson's
# "## Gate" table, every locator in the row's `anchor` cell must have a check line,
# at the named revision, in the lesson or in a committed .ufo/**.md receipt, that
# names the row id AND the locator on the same line.
# Usage: q33-locator-coverage.sh <repo-dir> <rev> <lesson-path>
# Exit 0 = all admitted rows fully covered; 1 = uncovered locator(s); 2 = usage.
set -u
[ $# -eq 3 ] || { echo "usage: $0 <repo> <rev> <lesson-path>" >&2; exit 2; }
repo=$1 rev=$2 lesson=$3
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT

git -C "$repo" show "$rev:$lesson" > "$work/lesson.md" 2>/dev/null || {
  echo "Q33 ERROR: cannot read $rev:$lesson" >&2; exit 2; }
git -C "$repo" show "$rev:corpus/SOURCES.md" > "$work/SOURCES.md" 2>/dev/null || {
  echo "Q33 ERROR: cannot read $rev:corpus/SOURCES.md" >&2; exit 2; }

# admitted row ids: gate-table rows whose decision cell contains "admit"
mapfile -t rows < <(awk -F'|' '/^\| S[0-9]+ \|/ && /admit/ {gsub(/^[ \t]+|[ \t]+$/,"",$2); print $2}' "$work/lesson.md" | sort -u)

# candidate check lines: whole lesson + every committed .ufo **/*.md at rev
cat "$work/lesson.md" > "$work/checklines.txt"
while IFS= read -r f; do
  git -C "$repo" show "$rev:$f" 2>/dev/null
done < <(git -C "$repo" ls-tree -r "$rev" --name-only -- '.ufo' | grep '\.md$') >> "$work/checklines.txt"

fail=0
for id in "${rows[@]}"; do
  # anchor = column 6 of the row's SOURCES.md line
  anchor=$(awk -F'|' -v id="$id" '$0 ~ "^\\| "id" \\|" {gsub(/^[ \t]+|[ \t]+$/,"",$7); print $7}' "$work/SOURCES.md")
  [ -n "$anchor" ] || { echo "Q33 WARN: $id admitted but no SOURCES row at $rev" >&2; continue; }
  # locators: file-like tokens (basename with real extension) or man tokens name(n)
  mapfile -t locs < <(printf '%s\n' "$anchor" \
    | grep -oE '[A-Za-z0-9_/.-]+\.(html|adoc|md|xml|ts|c|rs|json|txt|sh)|[a-z_][a-z0-9_-]*\([0-9][a-z]*\)' \
    | sed 's/[():].*$//; s|.*/||' | sort -u)
  # lines naming the row (word boundary so "a2-ReopenS073" does not count)
  grep -E "(^|[^A-Za-z0-9])${id}([^A-Za-z0-9]|$)" "$work/checklines.txt" > "$work/lines.$id" || true
  n=0; missing=()
  for L in "${locs[@]}"; do
    if grep -qF "$L" "$work/lines.$id"; then n=$((n+1)); else missing+=("$L"); fi
  done
  total=${#locs[@]}
  if [ "${#missing[@]}" -gt 0 ]; then
    fail=1
    echo "Q33 UNCOVERED $id anchor-locators-checked=$n/$total missing=[$(IFS=,; echo "${missing[*]}")]"
  else
    echo "Q33 COVERED $id locators=$total/$total"
  fi
done
if [ "$fail" -eq 0 ]; then echo "Q33 PASS rev=$rev rows=${#rows[@]} all-locators-checked"; exit 0; fi
echo "Q33 FAIL rev=$rev uncovered locators present (a row's teaches was not checked against every locator)"
exit 1
