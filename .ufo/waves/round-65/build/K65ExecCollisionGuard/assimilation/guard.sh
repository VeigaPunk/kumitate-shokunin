#!/bin/sh
# Assimilation collision guard, draft v2 (K65ExecCollisionGuard, round 65 w1).
# Strengthens the round-64 inline guard; never relaxes it.
#   usage: guard.sh <lane-SOURCES.md> <staged-SOURCES.append.md>
# Checks, all read-only:
#   1. id collisions        (the round-64 check, kept verbatim in spirit: 0-3 ASCII spaces, whole file)
#   2. tab-indented rows    (invisible to the row regex AND to sources-census.sh:615 -> reported, not counted)
#   3. document collisions  (census url_of normalisation: scheme/fragment/trailing slash stripped, host lowercased)
#      flagged E04-BLOCKER when the two scope cells are equal (census E04 is an error), else W04-warn
#   4. within-staged duplicate documents (the round-64 guard compared only ids)
#   5. malformed rows       (cells != 11 -> sources-census.sh E01 on adoption)
# Exit 1 on any id collision, E04-blocker, malformed row; 0 otherwise. W04-warn pairs are printed and counted.
set -eu
[ $# -eq 2 ] || { echo "usage: guard.sh <lane-SOURCES.md> <staged-SOURCES.append.md>" >&2; exit 2; }
lane=$1; staged=$2
[ -f "$lane" ] && [ -f "$staged" ] || { echo "GUARD: missing input" >&2; exit 2; }
tmp=$(mktemp -d "${TMPDIR:-/tmp}/guard.XXXXXX"); trap 'rm -rf "$tmp"' EXIT

rows() { # <file> <registry|staged> -> id \t url \t scope \t raw_cells
  # Escaped pipes (\|) are replaced by \001 before splitting so cells line up the way a
  # human reads them; raw_cells keeps the census's own split, which does not unescape
  # (sources-census.sh row_pass) and therefore reports E01 on those rows.
  gawk -F'|' -v mode="$2" '
    function trim(s){ gsub(/^[ \t]+|[ \t]+$/,"",s); return s }
    function norm(s,  u,n){ if (match(s,/https?:\/\/[^[:space:]|]+/)) {
        u=substr(s,RSTART,RLENGTH); sub(/#.*$/,"",u); sub(/\/$/,"",u); sub(/^[A-Za-z]+:\/\//,"",u)
        n=index(u,"/"); if(n) return tolower(substr(u,1,n-1)) substr(u,n); return tolower(u) } return "" }
    BEGIN { inreg = (mode=="staged") }
    { orig=$0; nraw=split(orig,raw,"|"); line=orig
      if (line ~ /^ {0,3}##[ \t]/) { l=line; sub(/^ {0,3}/,"",l); inreg=(trim(substr(l,3))=="Registry"); next }
      if (line ~ /^ {0,3}#[ \t]/) { inreg=0; next }
      if (line ~ /^\t+\|[ \t]*S[0-9][0-9][0-9]*[ \t]*\|/) { tabs++; next }
      if (line ~ /^ {4,}\|[ \t]*S[0-9][0-9][0-9]*[ \t]*\|/) { deep++; next }
      if (line !~ /^ {0,3}\|/) next
      if (!inreg) next
      gsub(/\\\|/,"\001",$0)
      if (trim($2)=="id") next
      if ($2 ~ /^[ \t]*:?-+:?[ \t]*$/) next
      id=trim($2); if (id !~ /^S[0-9]{3,}$/) next
      scope=trim($6); gsub(/\001/,"\\|",scope)
      printf "%s\t%s\t%s\t%d\t%d\n", id, norm($3), scope, nraw-2, NF-2
    }
    END { printf "TABROWS\t%d\tDEEPROWS\t%d\n", tabs+0, deep+0 > "/dev/stderr" }
  ' "$1"
}

rows "$lane" registry  > "$tmp/lane"   2> "$tmp/lane.tab"
rows "$staged" staged   > "$tmp/staged" 2> "$tmp/staged.tab"
lane_tabs=$(awk '{for(i=1;i<=NF;i++) if($i=="TABROWS") print $(i+1)}' "$tmp/lane.tab")
lane_deep=$(awk '{for(i=1;i<=NF;i++) if($i=="DEEPROWS") print $(i+1)}' "$tmp/lane.tab")
staged_tabs=$(awk '{for(i=1;i<=NF;i++) if($i=="TABROWS") print $(i+1)}' "$tmp/staged.tab")
staged_deep=$(awk '{for(i=1;i<=NF;i++) if($i=="DEEPROWS") print $(i+1)}' "$tmp/staged.tab")

cut -f1 "$tmp/lane"   | sort > "$tmp/lane.ids"
cut -f1 "$tmp/staged" | sort > "$tmp/staged.ids"
comm -12 "$tmp/lane.ids" "$tmp/staged.ids" > "$tmp/id.col"

# within-file duplicate ids (never possible before; cheap)
printf 'DUPID\tlane\t%s\n' "$(uniq -d "$tmp/lane.ids"   | tr '\n' ' ')"
printf 'DUPID\tstaged\t%s\n' "$(uniq -d "$tmp/staged.ids" | tr '\n' ' ')"

# document collisions, census queue
awk -F'\t' 'NR==FNR{l[$2]=l[$2] " " $1; ls[$2]=$3; next}
  ($2!="" && ($2 in l)){ split(l[$2],a," ");
    for(i in a) if(a[i]!="") { if ($5!=11) v="W04-warn(scope-unreliable: unescaped_cells=" $5 ")";
      else if (ls[$2]==$3) v="E04-BLOCKER"; else v="W04-warn";
      printf "DOC\t%s\t%s\t%s\t%s\t%s\n", v, $1, a[i], $2, $3 } }' "$tmp/lane" "$tmp/staged" > "$tmp/doc.col"
awk -F'\t' 'function add(k,id){ c[k]=c[k] " " id }
  { if($2!="") add($2,$1) }
  END{ for(k in c){ n=split(c[k],a," "); if(n>1) printf "STAGEDDUP\t%s\t%s\n", substr(c[k],2), k } }' "$tmp/staged" > "$tmp/dup.staged"

awk -F'\t' '$4!=11{printf "MALFORMED\t%s\traw_cells=%d\n",$1,$4}' "$tmp/lane" "$tmp/staged" > "$tmp/bad"

ids=$(wc -l < "$tmp/id.col" | tr -d ' ')
doc_block=$(grep -c '^DOC	E04-BLOCKER' "$tmp/doc.col" || true)
doc_warn=$(grep -c '^DOC	W04-warn' "$tmp/doc.col" || true)
dup_staged=$(wc -l < "$tmp/dup.staged" | tr -d ' ')
bad=$(wc -l < "$tmp/bad" | tr -d ' ')

echo "COLLISION_GUARD ids=$ids doc_blockers=$doc_block doc_warnings=$doc_warn staged_dups=$dup_staged malformed=$bad lane_indent_skipped=$lane_tabs+$lane_deep staged_indent_skipped=$staged_tabs+$staged_deep"
echo "-- id collisions (staged id reused by the lane; documents differ unless shown):"
sed 's/^/   /' "$tmp/id.col"
echo "-- document collisions (same census-normalised url in both files):"
sed 's/^/   /' "$tmp/doc.col"
echo "-- within-staged duplicate documents:"
sed 's/^/   /' "$tmp/dup.staged"
echo "-- malformed rows (census E01 on adoption):"
sed 's/^/   /' "$tmp/bad"
[ "$lane_tabs$lane_deep$staged_tabs$staged_deep" = 0000 ] || echo "-- WARNING: $((lane_tabs+lane_deep))/$((staged_tabs+staged_deep)) row(s) with tab or >=4-space indent are invisible to both this guard and sources-census.sh:615"
[ "$ids" = 0 ] && [ "$doc_block" = 0 ] && [ "$bad" = 0 ]
