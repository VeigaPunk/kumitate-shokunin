#!/usr/bin/env bash
# Cross-reader trim matrix over every pad class the frozen r99 counter draws.
# Readers: bash trim_cell ([[:space:]], sources-census.sh 531-535), gawk row_pass trim ([ \t], line 581),
#          node String.prototype.trim (sources-check.mjs line 134). Locales: C, C.UTF-8, en_US.UTF-8.
# Read-only on the lane; writes only $S.
set -u
S=${1:?scratch dir}
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
mkdir -p "$S/pads"
echo "# cross-reader trim matrix, $(date -Iseconds), bash $BASH_VERSION, gawk $(gawk --version | head -1), node $(node -v)"
echo "# generated locales: $(locale -a | grep -iE '\.utf-?8$' | tr '\n' ' ')"
echo "# fixture: pad class + marker 'X'; a reader STRIPS iff it returns exactly 'X'."
echo "# pads.tsv carries hex bytes so the tab-valued classes survive as fields."
node -e '
const fs=require("fs");
const src=fs.readFileSync(process.argv[1],"utf8");
const m=/const PADS = \{(.*?)\n\};/s.exec(src)[1];
const pads=eval("({"+m+"})");
fs.writeFileSync(process.argv[2], Object.keys(pads).map(k=>k+"\t"+Buffer.from(pads[k],"utf8").toString("hex")).join("\n")+"\n");
' "$LANE/.ufo/waves/round-99/probe/probe99-c1.mjs" "$S/pads/pads.tsv" || exit 2
echo "# pad classes read: $(wc -l < "$S/pads/pads.tsv")"
printf '%-11s %-12s %-10s %-10s %-14s %-14s %-16s %-16s %s\n' pad codes node trim_cell/C gawk_trim/C trim_cell/C.UTF-8 gawk_trim/C.UTF-8 trim_cell/en_US.UTF-8 gawk_trim/en_US.UTF-8
while IFS=$'\t' read -r name hex; do
  pad=$(printf '%s' "$hex" | xxd -r -p)
  n=$(node -e 'process.stdout.write((process.argv[1]+"X").trim()==="X"?"STRIP":"KEEP")' "$pad")
  printf '%-11s %-12s %-10s' "$name" "$hex" "$n"
  for loc in C C.UTF-8 en_US.UTF-8; do
    b=$(LC_ALL=$loc bash -c 'v=$1; while [[ "$v" == [[:space:]]* ]]; do v=${v#?}; done; while [[ "$v" == *[[:space:]] ]]; do v=${v%?}; done; printf %s "$v"' _ "${pad}X" | od -An -tx1 | tr -d ' \n')
    [ "$b" = "58" ] && printf '%-16s' STRIP || printf '%-16s' KEEP
    g=$(printf '%sX' "$pad" | LC_ALL=$loc gawk 'function trim(s){gsub(/^[ \t]+|[ \t]+$/,"",s);return s}{printf "%s",trim($0)}' | od -An -tx1 | tr -d ' \n')
    [ "$g" = "58" ] && printf '%-16s' STRIP || printf '%-16s' KEEP
  done
  printf '\n'
done < "$S/pads/pads.tsv"
echo "# note: locale strings are honoured only when generated; see the list above."
