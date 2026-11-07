#!/usr/bin/env bash
set -uo pipefail
S=/fast/scratch/hyaku/kumitate-r94/K94Sentinel
TOOL=$1; LABEL=$2
OUT="$S/receipts"
run_case() {
  local name=$1
  local mode=$2
  local json=$3
  local D="$S/fx/lz.$name.$$"
  rm -rf -- "$D"; mkdir -p "$D/corpus" "$D/reports/round-93"
  git init -q "$D"; local top; top=$(git -C "$D" rev-parse --show-toplevel)
  [ "$top" = "$D" ] || { echo "NOT FIXTURE"; return 3; }
  printf '# SOURCES — lazy fixture\n\n| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n|---|---|---|---|---|---|---|---|---|---|---|\n| S001 | x — https://github.com/o/r/blob/%s/x.ts | docs | A | s | a | t | mined | 2026-11-06 | 30d | — |\n' 79fa222e8390aed3494f4bc6746814e6c74c21cf > "$D/corpus/SOURCES.md"
  printf '| round | v | n |\n|---|---|---|\n| 93 | ok | f |\n\n## Planned\nround 94\n' > "$D/SCORECARD.md"
  printf -- '- 2026-01-02 — round 93 fixture entry\n' > "$D/LOG.md"
  local cfg=(-c user.name=t -c user.email=t@t -c commit.gpgsign=false)
  git "${cfg[@]}" -C "$D" add -A >/dev/null 2>&1
  git "${cfg[@]}" -C "$D" commit -qm 'round 93 fixture' >/dev/null 2>&1
  local sha; sha=$(git -C "$D" rev-parse HEAD)
  # report cites the lane HEAD commit (resolves in lane) -> declared step never reached
  { printf '# round-93 report (lazy fixture)\n\n## Claims\nCites `%s`.\n\n## Evidence\n' "$sha"
    for i in $(seq 1 30); do printf 'Padding line for the report byte floor and heading count %s.\n' "$i"; done; } > "$D/reports/round-93/KumitateR94.md"
  case "$mode" in
    fifo) rm -f "$D/corpus/SOURCES.md"; mkfifo "$D/corpus/SOURCES.md" ;;
    devzero) rm -f "$D/corpus/SOURCES.md"; ln -s /dev/zero "$D/corpus/SOURCES.md" ;;
    unreadable) chmod 000 "$D/corpus/SOURCES.md" ;;
    loop) rm -f "$D/corpus/SOURCES.md"; ln -s SOURCES.md "$D/corpus/SOURCES.md" ;;
  esac
  local t0 t1 rc
  t0=$(date +%s%N)
  if [ "$json" = json ]; then
    timeout 25 prlimit --as=4294967296 -- node "$TOOL" --round 93 --lane KumitateR94 --repo "$D" --reports-dir "$D/reports" --main-repo "$D" --origin "$D" --json > "$OUT/$LABEL.$name.json.out" 2> "$OUT/$LABEL.$name.err"
  else
    timeout 25 prlimit --as=4294967296 -- node "$TOOL" --round 93 --lane KumitateR94 --repo "$D" --reports-dir "$D/reports" --main-repo "$D" --origin "$D" > "$OUT/$LABEL.$name.json.out" 2> "$OUT/$LABEL.$name.err"
  fi
  rc=$?; t1=$(date +%s%N)
  local ms=$(( (t1 - t0) / 1000000 ))
  echo "$LABEL $name mode=$mode exit=$rc ms=$ms verdict=$(grep -o 'ROUND_GATE: [A-Z-]*' "$OUT/$LABEL.$name.json.out" | head -1) leak=$(grep -c SENTINEL94 "$OUT/$LABEL.$name.json.out" "$OUT/$LABEL.$name.err" | awk -F: '{s+=$2} END{print s+0}')"
  rm -rf -- "$D"
}
run_case lazy_fifo fifo json
run_case lazy_devzero devzero json
run_case lazy_unreadable unreadable json
run_case lazy_loop loop json

