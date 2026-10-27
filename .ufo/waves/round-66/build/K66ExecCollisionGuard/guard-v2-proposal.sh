#!/usr/bin/env bash
# PROPOSAL (not integrated) — kumitate assimilation id-collision guard, v2.
# Strengthens the round-66 pipeline in three ways, relaxing nothing:
#   1. id patterns also accept backticked / tab-indented id cells, so a row the
#      lane's own markdown could carry is never skipped (v1 silently skipped them:
#      0 live instances today, proven reachable in proof/).
#   2. exits non-zero on a non-empty collision file (v1's comm exits 0 either way;
#      the guard only "fails" if a human reads the file).
#   3. adds a URL-level duplicate check, because an id-only guard cannot see a
#      re-staged source appended under a fresh id (6 of the 12 live collisions, and
#      17 URL groups inside the staged set, are exactly that).
set -euo pipefail
REG=${1:?registry}; STAGED=${2:?staged}; OUT=${3:?outdir}
mkdir -p "$OUT"
IDRE='^[[:space:]]*\|[[:space:]]*`?S[0-9]{3,}`?'
grep -oE "$IDRE" "$REG"    | grep -oE 'S[0-9]+' | sort -u > "$OUT/reg-ids"
grep -oE "$IDRE" "$STAGED" | grep -oE 'S[0-9]+' | sort -u > "$OUT/staged-ids"
comm -12 "$OUT/reg-ids" "$OUT/staged-ids" > "$OUT/collisions"
rc=0
if [ -s "$OUT/collisions" ]; then
  echo "COLLISION_IDS: $(wc -l < "$OUT/collisions")"
  rc=1
fi
# URL-level duplicates (new capability)
urlof() { awk -F'|' 'NF>=12{id=$2;gsub(/^ +| +$/,"",id); if(id !~ /^`?S[0-9]+`?$/) next;
  if(match($3,/https?:\/\/[^ )]+/)) print substr($3,RSTART,RLENGTH)"\t"id}' "$1" | sort -u; }
urlof "$REG" > "$OUT/reg-urls.tsv"; urlof "$STAGED" > "$OUT/staged-urls.tsv"
join -t$'\t' -1 1 -2 1 -o 1.1,1.2,2.2 "$OUT/reg-urls.tsv" "$OUT/staged-urls.tsv" > "$OUT/url-dupes.tsv" || true
if [ -s "$OUT/url-dupes.tsv" ]; then
  echo "COLLISION_URLS: $(wc -l < "$OUT/url-dupes.tsv")"; rc=1
fi
echo "GUARD_V2 exit=$rc"
exit $rc
