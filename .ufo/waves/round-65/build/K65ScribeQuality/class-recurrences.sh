#!/usr/bin/env bash
# class-recurrences.sh — DRAFT for QUALITY Q62 (kumitate), seat K65ScribeQuality.
# Contract kumitate-class-recurrences-v1.
#
#   bash scripts/class-recurrences.sh --emit [--lessons DIR]
#   bash scripts/class-recurrences.sh --check FILE [--lessons DIR] [--min 3]
#   bash scripts/class-recurrences.sh --selftest
#
# A *class record* is one of:
#   (a) a `## Mistakes` table row whose FIRST cell begins with a backticked class token, e.g.
#       | `reference-drift` — … | … |   (round-61, round-64 lesson form)
#   (b) a line carrying `Class: `token`` (round-54/55 lesson form).
# A class is counted once per lesson file that records it. Files that merely mention the token in prose
# (round-63:39 quotes `reference-drift` inside a quarantine list) are not records.
#
# --emit prints one line per class, count-descending: CLASS <class> <count> <file,file,...>
# --check reads a lesson file's `## Recurrence classes` section, one row per class:
#       | class | count | rounds | structural fix | gate |
#   and fails when: the section or table is absent and some class reaches --min (TABLE_ABSENT);
#   a row's `count` cell disagrees with the recomputed count (COUNT_MISMATCH); a class at >= --min has an
#   empty fix, a fix that names no existing path, or a fix that defers ("routed", "next round", "TBD")
#   (CLASS_ROUTED / FIX_ABSENT); a class at >= --min recorded by the lessons has no row (CLASS_MISSING).
#   `gate` is optional; when it names a gate id it must exist in scripts/harm-matrix-gates.json (GATE_UNKNOWN).
#   Prose is never counted as a structural fix: the cell must name a path that exists at the lane root.
#
# Exit 0 CLEAN · 1 FAIL · 2 fail-closed (lessons dir absent / unreadable) · 64 usage.
# Limits (stated): semantic. A recurrence the lane records only in prose cannot be counted (round-64's own
# "tenth recurrence of the R56-V3 class" is prose; nine lines carry `R56-V3`, four files carry the token);
# class identity is the literal token, so two spellings of one class count as two classes.

set -u
LANE=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
LESSONS=""
MIN=3
MODE=""
FILE=""
usage() { echo "usage: class-recurrences.sh --emit|--check FILE|--selftest [--lessons DIR] [--min N]" >&2; exit 64; }

records() { # $1 = lessons dir -> "class<TAB>file" per record, one per line
  local d=$1 f
  for f in "$d"/*.md; do
    [ -e "$f" ] || continue
    awk -v F="$f" '
      /^## / { m = ($0 ~ /^## Mistakes/) }
      m && /^\| *`[a-z][a-z0-9-]+`/ { l=$0; sub(/^\| *`/,"",l); sub(/`.*/,"",l); print l "\t" F; next }
      /Class: `[a-z][a-z0-9-]+`/ { l=$0; sub(/.*Class: `/,"",l); sub(/`.*/,"",l); print l "\t" F }
    ' "$f"
  done
}

do_emit() {
  local out
  out=$(records "$LESSONS") || { echo "CLASS_RECUR: FAIL_CLOSED reason=LESSONS_UNREADABLE"; exit 2; }
  [ -n "$out" ] || { echo "CLASS_RECUR: FAIL_CLOSED reason=NO_RECORDS"; exit 2; }
  printf '%s\n' "$out" | awk -F'\t' '
    { if (!(( $1 SUBSEP $2 ) in seen)) { seen[$1 SUBSEP $2]=1; n[$1]++; f[$1]=($1 in f)?f[$1]","$2:$2 } }
    END { for (c in n) printf "CLASS %s %d %s\n", c, n[c], f[c] }' | sort -k3,3nr -k2,2
}

# Extract the `## Recurrence classes` table as "class<TAB>count<TAB>rounds<TAB>fix<TAB>gate".
table_rows() { # $1 = lesson file
  awk '
    /^## / { m = ($0 ~ /^## Recurrence classes/) }
    m && /^\|/ {
      if ($0 ~ /^\| *class *\|/) next
      t = $0; gsub(/[|: -]/, "", t); if (t == "") next
      n = split($0, c, "|")
      gsub(/^ +| +$/, "", c[2]); gsub(/^ +| +$/, "", c[3]); gsub(/^ +| +$/, "", c[4]); gsub(/^ +| +$/, "", c[5]); gsub(/^ +| +$/, "", c[6]); gsub(/`/, "", c[2])
      if (c[2] != "") print c[2] "\t" c[3] "\t" c[4] "\t" c[5] "\t" c[6]
    }' "$1"
}

do_check() {
  [ -f "$FILE" ] || { echo "CLASS_RECUR: FAIL_CLOSED reason=FILE_ABSENT file=$FILE"; exit 2; }
  local rec rows
  [ -d "$LESSONS" ] || { echo "CLASS_RECUR: FAIL_CLOSED reason=LESSONS_ABSENT dir=$LESSONS"; exit 2; }
  rec=$(records "$LESSONS") || { echo "CLASS_RECUR: FAIL_CLOSED reason=LESSONS_UNREADABLE"; exit 2; }
  rows=$(table_rows "$FILE")
  if [ -z "$rows" ]; then
    if printf '%s\n' "$rec" | awk -F'\t' '{ n[$1]++ } END { for (c in n) if (n[c] >= '"$MIN"') { print c; exit 0 } exit 1 }'; then
      echo "CLASS_RECUR: FAIL reason=TABLE_ABSENT file=$FILE"; exit 1
    fi
    echo "CLASS_RECUR: CLEAN classes=0 at3=none note=TABLE_ABSENT"; exit 0
  fi
  local fail=0 nrows=0 at3="" cls cnt fix gate want
  while IFS=$'\t' read -r cls cnt rounds fix gate; do
    [ -n "$cls" ] || continue
    nrows=$((nrows + 1))
    want=$(printf '%s\n' "$rec" | awk -F'\t' -v c="$cls" '$1 == c && !($2 in s) { s[$2]=1; n++ } END { print n + 0 }')
    if [ "$cnt" != "$want" ]; then
      echo "CLASS_RECUR: FAIL reason=COUNT_MISMATCH class=$cls table=$cnt recount=$want"; fail=1
    fi
    if [ "$want" -ge "$MIN" ]; then
      at3="$at3${at3:+,}$cls"
      if [ -z "$fix" ] || printf '%s' "$fix" | grep -qiE 'routed|next round|TBD|to be (fixed|decided)|follow-?up'; then
        echo "CLASS_RECUR: FAIL reason=CLASS_ROUTED class=$cls count=$want fix=\"$fix\""; fail=1
      else
        # every existing path token in the cell must resolve at the lane root (a path is a token with a / or an extension)
        for tok in $fix; do
          case "$tok" in */*|*.md|*.mjs|*.sh|*.json|*.txt|*.pin) ;;
            *) continue ;;
          esac
          tok=${tok//\`/}; tok=${tok%,}; tok=${tok%.}
          if [ ! -e "$LANE/$tok" ]; then
            echo "CLASS_RECUR: FAIL reason=FIX_ABSENT class=$cls fix=$tok"; fail=1
          fi
        done
      fi
    fi
    if [ -n "$gate" ] && [ "$gate" != "-" ]; then
      if ! node -e 'const g=require(process.argv[1]);const l=Array.isArray(g)?g:g.gates;process.exit(l.some(x=>x.id===process.argv[2])?0:1)' "$LANE/scripts/harm-matrix-gates.json" "$gate"; then
        echo "CLASS_RECUR: FAIL reason=GATE_UNKNOWN class=$cls gate=$gate"; fail=1
      fi
    fi
  done <<< "$rows"
  # every class the lessons record at >= MIN must have a row
  while IFS=$'\t' read -r cls want; do
    if [ "$want" -ge "$MIN" ] && ! printf '%s\n' "$rows" | cut -f1 | grep -qxF "$cls"; then
      echo "CLASS_RECUR: FAIL reason=CLASS_MISSING class=$cls count=$want"; fail=1
    fi
  done <<< "$(printf '%s\n' "$rec" | awk -F'\t' '{ if (!(($1 SUBSEP $2) in s)) { s[$1 SUBSEP $2]=1; n[$1]++ } } END { for (c in n) print c "\t" n[c] }')"
  [ "$fail" -eq 0 ] || exit 1
  echo "CLASS_RECUR: CLEAN classes=$nrows at3=${at3:-none} file=$FILE"
  exit 0
}

# --- selftest: builds its own throwaway tree; the fixture commits are never citable ---
do_selftest() {
  local d n=0 ok=0 out
  d=$(mktemp -d)
  mkdir -p "$d/lessons" "$d/lane/scripts"
  cat > "$d/lane/scripts/harm-matrix-gates.json" <<'JSON'
{"gates":[{"id":"readme-map","argv":["node","scripts/readme-map.mjs"],"verdict":"^README_MAP: (\\w+)","clean":["CLEAN"]}]}
JSON
  printf '## Mistakes\n\n| class | evidence | captured-by | fix |\n|---|---|---|---|\n| `alpha` — x | a | b | c |\n' > "$d/lessons/r1.md"
  printf '## Mistakes\n\n| class | evidence | captured-by | fix |\n|---|---|---|---|\n| `alpha` — x | a | b | c |\n| `beta` — y | a | b | c |\n' > "$d/lessons/r2.md"
  printf '## Mistakes\n\n| class | evidence | captured-by | fix |\n|---|---|---|---|\n| `alpha` — x | a | b | c |\n' > "$d/lessons/r3.md"
  printf '## Mistakes\n\n| class | evidence | captured-by | fix |\n|---|---|---|---|\n| `gamma` — y | a | b | c |\n' > "$d/lessons/r4.md"
  printf 'notes: `gamma` is mentioned in prose only here\n' > "$d/lessons/r5.md"
  LESSONS="$d/lessons" LANE="$d/lane"
  local ec
  ec=$(records "$LESSONS" | awk -F'\t' '{n[$1]++} END{for(c in n) print c, n[c]}' | sort | tr '\n' ' ')
  n=$((n + 1))
  case "$ec" in
    "alpha 3 beta 1 gamma 1 ") ok=$((ok + 1)); echo "CASE ok emit-counts ($ec)" ;;
    *) echo "CASE FAIL emit-counts ($ec)" ;;
  esac

  cat > "$d/t-honest.md" <<'MD'
## Recurrence classes

| class | count | rounds | structural fix | gate |
|---|---|---|---|---|
| `alpha` | 3 | 1,2,3 | `scripts/harm-matrix-gates.json` | readme-map |
| `beta` | 1 | 2 | - | - |
MD
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-honest.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 0 ] && ok=$((ok + 1)); echo "CASE $([ "${out#CLASS_RECUR: CLEAN}" != "$out" ] && echo ok || echo FAIL) honest $out"

  sed 's/| 3 | 1,2,3 |/| 2 | 1,2,3 |/' "$d/t-honest.md" > "$d/t-count.md"
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-count.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 1 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*COUNT_MISMATCH}" != "$out" ] && echo ok || echo FAIL) count-mismatch $out"

  sed 's/`scripts\/harm-matrix-gates.json`/routed to round 66/' "$d/t-honest.md" > "$d/t-routed.md"
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-routed.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 1 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*CLASS_ROUTED}" != "$out" ] && echo ok || echo FAIL) routed $out"

  sed 's/`scripts\/harm-matrix-gates.json`/`scripts\/nope.mjs`/' "$d/t-honest.md" > "$d/t-absent.md"
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-absent.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 1 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*FIX_ABSENT}" != "$out" ] && echo ok || echo FAIL) fix-absent $out"

  sed '/`alpha`/d' "$d/t-honest.md" > "$d/t-missing.md"
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-missing.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 1 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*CLASS_MISSING}" != "$out" ] && echo ok || echo FAIL) class-missing $out"

  sed 's/| readme-map |/| no-such-gate |/' "$d/t-honest.md" > "$d/t-gate.md"
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-gate.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 1 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*GATE_UNKNOWN}" != "$out" ] && echo ok || echo FAIL) gate-unknown $out"

  printf '# no table here\n' > "$d/t-none.md"
  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-none.md" --lessons "$d/lessons" --lane "$d/lane" 2>&1); [ $? -eq 1 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*TABLE_ABSENT}" != "$out" ] && echo ok || echo FAIL) table-absent $out"

  n=$((n + 1)); out=$(bash "${BASH_SOURCE[0]}" --check "$d/t-none.md" --lessons "$d/empty-x" --lane "$d/lane" 2>&1); [ $? -eq 2 ] && ok=$((ok + 1)); echo "CASE $([ "${out#*FAIL_CLOSED}" != "$out" ] && echo ok || echo FAIL) lessons-absent $out"

  rm -rf "$d"
  if [ "$ok" -eq "$n" ]; then echo "CLASS_RECUR_SELFTEST: PASS ($ok/$n)"; else echo "CLASS_RECUR_SELFTEST: FAIL ($ok/$n)"; exit 1; fi
}

while [ $# -gt 0 ]; do
  case "$1" in
    --emit) MODE=emit ;;
    --check) MODE=check; FILE=${2:-}; shift ;;
    --selftest) MODE=selftest ;;
    --lessons) LESSONS=${2:-}; shift ;;
    --lane) LANE=${2:-}; shift ;;
    --min) MIN=${2:-3}; shift ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
  shift
done
[ -n "$LESSONS" ] || LESSONS="$LANE/corpus/lessons"
case "$MODE" in
  emit) do_emit ;;
  check) do_check ;;
  selftest) do_selftest ;;
  *) usage ;;
esac
