#!/usr/bin/env bash
# K99ExecSibling — FIXED-reader parity run on the same fixture.
set -u
S=/fast/scratch/hyaku/kumitate-r99/K99ExecSibling
FX=$S/fx
OUT=$S/out
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
CS=$S/fixed/cite-sources.mjs
SC=$S/fixed/source-capture.mjs

IDS="S901 S902 S903 S904 S905 S906 S907 S908 S909 S910 S911 S912 S913 S914 S915"

: > "$OUT/cite-fixed-per-id.txt"
for id in $IDS; do
  node "$CS" --readme "$FX/README-$id.md" --sources "$FX/SOURCES.md" > "$OUT/cs-fixed-$id.txt" 2>&1
  rc=$?
  printf '%s\texit=%s\t%s\n' "$id" "$rc" "$(tail -1 "$OUT/cs-fixed-$id.txt")" >> "$OUT/cite-fixed-per-id.txt"
done
node "$CS" --readme "$FX/README-all.md" --sources "$FX/SOURCES.md" > "$OUT/cs-fixed-all.txt" 2>&1
echo "cite-all exit=$? $(tail -1 "$OUT/cs-fixed-all.txt")" >> "$OUT/cite-fixed-per-id.txt"

node "$SC" --registry "$FX/reg.json" --sources "$FX/SOURCES.md" > "$OUT/sc-fixed.txt" 2>&1
echo "source-capture-fixed exit=$?" | tee "$OUT/sc-fixed.exit"

node "$CS" --selftest > "$OUT/cs-fixed-selftest.txt" 2>&1; echo "cs-fixed-selftest exit=$?" >> "$OUT/selftests-fixed.exit"
node "$SC" --selftest > "$OUT/sc-fixed-selftest.txt" 2>&1; echo "sc-fixed-selftest exit=$?" >> "$OUT/selftests-fixed.exit"

echo "=== cite-fixed-per-id.txt ==="; cat "$OUT/cite-fixed-per-id.txt"
echo "=== sc-fixed.txt ==="; cat "$OUT/sc-fixed.txt"
echo "=== selftests-fixed.exit ==="; cat "$OUT/selftests-fixed.exit"
tail -3 "$OUT/cs-fixed-selftest.txt"; tail -3 "$OUT/sc-fixed-selftest.txt"
