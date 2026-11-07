#!/usr/bin/env bash
# K97Scout: empirical class matrix — for each heading variant, what does the census say
# (in-Registry?) and what does the BASE sources-check reader say (in-Registry?).
# Census truth is taken from the LIVE census (rows count + E12), not from a model.
set -u
S=/fast/scratch/hyaku/kumitate-r97/K97Scout
CENSUS=/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
W=$S/matrix; rm -rf "$W"; mkdir -p "$W"

mk() { # $1 = name, $2 = heading line (with escapes interpreted by printf %b)
  printf '%b\n\n| id | source |\n|---|---|\n| S001 | x |\n' "$2" > "$W/$1.md"
}

mk plain '## Registry'
mk dblsp '##  Registry'
mk tabsep '##\tRegistry'
mk cr '## Registry\r'
mk nbsp '##\u00a0Registry'
mk vt '##\vRegistry'
mk ff '##\fRegistry'
mk trailsp '## Registry '
mk trailtab '## Registry\t'
mk trailcr '## Registry\r'
mk trailnbsp '## Registry\u00a0'
mk trailspcr '## Registry \r'
mk closesq '## Registry ##'
mk lower '## registry'
mk sp3 '   ## Registry'
mk sp4 '    ## Registry'
mk tabind '\t## Registry'
mk h1 '## Registry'
mk empty '## '
mk h3 '### Registry'
mk leadspace ' ## Registry'
mk barehash '#'
mk hashspace '# '
mk hashtab '#\tX'
mk lead2sp '  ## Registry'

out=$S/class-matrix.tsv
printf 'case\theading_bytes\tcensus_rows\tcensus_e12\tcensus_in_registry\tBASE_in_registry\tAGREE\n' > "$out"

for f in "$W"/*.md; do
  name=$(basename "$f" .md)
  head=$(sed -n '1p' "$f" | hexdump -C | head -1 | sed 's/.*  //')
  # census
  crows=$(bash "$CENSUS" census --file "$f" 2>/dev/null | awk -F'\t' '$1=="file" && $2=="rows"{print $3}')
  ce12=$(bash "$CENSUS" validate --file "$f" 2>/dev/null | awk -F'\t' '$2=="E12"{print $3}' | awk '{print $1}' | paste -sd, -)
  [ -z "$ce12" ] && ce12="<none>"
  # census in_registry = (rows>0)  (row S001 counted only when in Registry)
  if [ "$crows" -gt 0 ] 2>/dev/null; then cin=yes; else cin=no; fi
  # BASE reader, modelled exactly as sources-check.mjs runCheck (lines 191-208)
  bins=$(node -e '
const fs=require("fs");
const t=fs.readFileSync(process.argv[1],"utf8");
const norm=(l)=>l.replace(/^ {1,3}(?=\S)/u,"");
const lines=t.split(/\r?\n/).map(norm);
let a=null;
for(const l of lines){const m=/^## (.+?)\s*$/.exec(l); if(m)a=m[1]; else if(/^#(?:\s|$)/.test(l))a=null;}
console.log(a==="Registry"?"yes":"no");
' "$f")
  if [ "$cin" = "$bins" ]; then ag=yes; else ag=NO; fi
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$name" "$head" "$crows" "$ce12" "$cin" "$bins" "$ag" >> "$out"
done
column -t -s$'\t' "$out"
