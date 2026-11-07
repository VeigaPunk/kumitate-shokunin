#!/usr/bin/env bash
# K99ExecSibling — BASE-reader parity run on the hermetic fixture.
set -u
S=/fast/scratch/hyaku/kumitate-r99/K99ExecSibling
FX=$S/fx
OUT=$S/out
mkdir -p "$OUT"
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
CENSUS=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
CS=$LANE/scripts/cite-sources.mjs
SC=$LANE/scripts/source-capture.mjs

IDS="S901 S902 S903 S904 S905 S906 S907 S908 S909 S910 S911 S912 S913 S914 S915"

# 1. census validate (exact assignment command shape)
bash "$CENSUS" validate --file "$FX/SOURCES.md" --today 2026-11-07 > "$OUT/census-validate.txt" 2>&1
echo "census-validate exit=$?" | tee "$OUT/census-validate.exit"

# 2. cite-sources BASE: one run per fixture id + one all-ids run
: > "$OUT/cite-base-per-id.txt"
for id in $IDS; do
  node "$CS" --readme "$FX/README-$id.md" --sources "$FX/SOURCES.md" > "$OUT/cs-base-$id.txt" 2>&1
  rc=$?
  printf '%s\texit=%s\t%s\n' "$id" "$rc" "$(tail -1 "$OUT/cs-base-$id.txt")" >> "$OUT/cite-base-per-id.txt"
done
node "$CS" --readme "$FX/README-all.md" --sources "$FX/SOURCES.md" > "$OUT/cs-base-all.txt" 2>&1
echo "cite-all exit=$? $(tail -1 "$OUT/cs-base-all.txt")" >> "$OUT/cite-base-per-id.txt"

# 3. source-capture BASE
node "$SC" --registry "$FX/reg.json" --sources "$FX/SOURCES.md" > "$OUT/sc-base.txt" 2>&1
echo "source-capture-base exit=$?" | tee "$OUT/sc-base.exit"

# 4. BASE selftests (context)
node "$CS" --selftest > "$OUT/cs-base-selftest.txt" 2>&1; echo "cs-base-selftest exit=$?" >> "$OUT/selftests.exit"
node "$SC" --selftest > "$OUT/sc-base-selftest.txt" 2>&1; echo "sc-base-selftest exit=$?" >> "$OUT/selftests.exit"

echo "=== census-validate.txt ==="; cat "$OUT/census-validate.txt"
echo "=== cite-base-per-id.txt ==="; cat "$OUT/cite-base-per-id.txt"
echo "=== sc-base.txt ==="; cat "$OUT/sc-base.txt"
echo "=== selftests.exit ==="; cat "$OUT/selftests.exit"
