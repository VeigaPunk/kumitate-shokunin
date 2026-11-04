L=/home/vgpnk/Projects/shokunin/kumitate-shokunin; REV=7ac24afa477a44304a3b125e320ef86929218189
git -C $L ls-tree -r --name-only $REV > /fast/scratch/hyaku/kumitate-r88/K88Scout/tree.txt
for f in $L/.ufo/waves/round-87/w1/*.md; do
  node $L/scripts/report-receipt-diff.mjs --lane $L --round 87 --report $f --rev $REV 2>&1 | awk -v r=$(basename $f) '/^POINTER_DEAD /{print r"\t"$2}'
done | while IFS=$'\t' read r t; do
  if grep -qxF "$t" /fast/scratch/hyaku/kumitate-r88/K88Scout/tree.txt || grep -q "/$(printf %s "$t" | sed 's/[.[\*^$/]/\\&/g')\$" /fast/scratch/hyaku/kumitate-r88/K88Scout/tree.txt; then c=suffix-exists-in-tree; else c=absent-from-tree; fi
  echo "$r	$t	$c"
done
