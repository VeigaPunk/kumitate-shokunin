#!/usr/bin/env bash
# K97Scout fleet differential: BASE sources-check (at lane base 477afff) vs the fleet census,
# on every lane's real corpus/SOURCES.md.
set -u
S=/fast/scratch/hyaku/kumitate-r97/K97Scout
BASE_TOOL="$S/sources-check-base.mjs"
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
CENSUS=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
TODAY=2026-11-06

cd "$LANE" && git show 477afff790787cd2ce48ccf976afafcb5aef0cbc:scripts/sources-check.mjs > "$BASE_TOOL"
sha256sum "$BASE_TOOL"

out="$S/differential.tsv"
printf 'lane\ttool_rows\tcensus_rows\trows_eq\ttool_e12\tcensus_e12\te12_eq\n' > "$out"

for d in /home/vgpnk/Projects/shokunin/*-shokunin; do
  lane=$(basename "$d")
  f="$d/corpus/SOURCES.md"
  [ -f "$f" ] || continue
  # tool: run BASE tool with --self = this lane root
  tjson=$(node "$BASE_TOOL" --self "$d" --today "$TODAY" --json 2>/dev/null)
  trows=$(printf '%s' "$tjson" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(j.counts?j.counts.rows:"ERR")}catch(e){console.log("ERR")}})')
  te12=$(printf '%s' "$tjson" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log((j.findings||[]).filter(f=>f.kind==="ROW_OUTSIDE_REGISTRY").map(f=>f.detail.replace(/^id=/,"").split(" ")[0]).join(","))}catch(e){console.log("ERR")}})')
  # census
  cval=$(bash "$CENSUS" validate --file "$f" 2>/dev/null)
  ce12=$(printf '%s\n' "$cval" | awk -F'\t' '$2=="E12"{print $3}' | awk '{print $1}' | paste -sd, -)
  ccnt=$(bash "$CENSUS" census --file "$f" 2>/dev/null | awk -F'\t' '$1=="file" && $2=="rows"{print $3}')
  [ "$te12" = "ERR" ] && te12=""
  [ "$ce12" = "" ] && te12_val="<none>" || te12_val="$te12"
  [ "$ce12" = "" ] && ce12_val="<none>" || ce12_val="$ce12"
  [ "$trows" = "$ccnt" ] && rows_eq=yes || rows_eq=NO
  [ "$te12" = "$ce12" ] && e12_eq=yes || e12_eq=NO
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$lane" "$trows" "$ccnt" "$rows_eq" "$te12_val" "$ce12_val" "$e12_eq" >> "$out"
done
column -t -s$'\t' "$out"
