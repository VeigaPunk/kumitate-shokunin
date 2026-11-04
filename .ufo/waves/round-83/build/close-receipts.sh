#!/usr/bin/env bash
# close-receipts.sh — run the round-83 close gate battery and stamp every receipt with the
# measured revision. Writes under .ufo/waves/round-83/close/. Never mutates the lane tree.
set -u
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
W=$LANE/.ufo/waves/round-83
OUT=$W/close
SCRATCH=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r83/close
mkdir -p "$OUT" "$SCRATCH"
REV=$(git -C "$LANE" rev-parse master)
stamp() { printf 'rev=%s\n' "$REV"; }

run() { # name command...
  local name=$1; shift
  { stamp; "$@" 2>&1; printf 'exit=%s\n' "$?"; } > "$OUT/$name.txt"
  printf '%-22s %s\n' "$name" "$(tail -1 "$OUT/$name.txt")"
}

{
  stamp
  echo "== round-83 close battery $(date -Is)"
} > "$OUT/summary.txt"

run c1-probe node "$W/probe/probe83-c1.mjs" --set c1 --lane "$LANE" --work "$SCRATCH/probe-c1"
run c1-repair node "$W/probe/probe83-c1-repair.mjs" --set c1 --lane "$LANE" --work "$SCRATCH/probe-c1r"
run c2-probe node "$W/probe/probe83-c2.mjs" --set c2 --lane "$LANE" --work "$SCRATCH/probe-c2"
run c1-suite node "$LANE/scripts/ready-handoff.mjs" --selftest
run c2-suite node "$LANE/scripts/omp-census.mjs" --selftest
run handoff-admission node "$LANE/scripts/ready-handoff.mjs" --round 83 --wave w1 --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json --lane "$LANE"
run proxy-check node "$LANE/scripts/proxy-check.mjs" --strict
run claims-check node "$LANE/scripts/claims-check.mjs"
run sources-check node "$LANE/scripts/sources-check.mjs"
run anchor-truth node "$LANE/scripts/anchor-truth.mjs"
run source-dupes node "$LANE/scripts/source-dupes.mjs"
run source-capture node "$LANE/scripts/source-capture.mjs"
run readme-map node "$LANE/scripts/readme-map.mjs"
run counter-pins node "$LANE/scripts/counter-pins.mjs"
run spotcheck-map node "$LANE/scripts/spotcheck-adopt.mjs" --check
run cite-sources node "$LANE/scripts/cite-sources.mjs"
run kimi-census node "$LANE/scripts/kimi-census.mjs"
run census-shape node "$LANE/scripts/omp-census.mjs" --shape "$LANE/.ufo/pins/omp-shape.json"
run census-compare node "$LANE/scripts/omp-census.mjs" --compare "$LANE/.ufo/pins/omp-shape.json"
run sources-census /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
{
  stamp
  echo "== round-83 lesson"
  grep -oE 'S[0-9]{3,}' "$LANE/corpus/lessons/round-83.md" | sort -u | while read -r id; do
    grep -q "^| $id " "$LANE/corpus/SOURCES.md" || echo "gate-absent:$id"; done
  echo "== synthetic S999"
  printf 'Gate row S999 absent test\n' | grep -oE 'S[0-9]{3,}' | sort -u | while read -r id; do
    grep -q "^| $id " "$LANE/corpus/SOURCES.md" || echo "gate-absent:$id"; done
} > "$OUT/gate-registry-check.txt" 2>&1
run round-gate node "$LANE/scripts/round-gate.mjs" --round 83
run plan-before-ready bash "$LANE/scripts/plan-before-ready.sh" --round 83
run harm-matrix node "$LANE/scripts/harm-matrix.mjs" --base eb8e0095 --tip master --timeout 60

printf '\n== summary (rev=%s)\n' "$REV" >> "$OUT/summary.txt"
for f in "$OUT"/*.txt; do
  case "$f" in "$OUT/summary.txt") continue;; esac
  printf '%-22s %s\n' "$(basename "$f" .txt)" "$(tail -1 "$f")" >> "$OUT/summary.txt"
done
cat "$OUT/summary.txt"
