#!/bin/bash
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin; B=$L/.ufo/waves/round-88/build/K88Scout; REV=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
mkdir -p $B/walk; cd /fast/scratch/hyaku/kumitate-r88/K88Scout
: > $B/walk/table.tsv
for d in $(ls -d $L/.ufo/waves/round-*/close | sort -t- -k2 -n); do
  r=$(basename $(dirname $d)); r=${r#round-}
  row="$r"
  for v in v1 v2; do
    if [ $v = v1 ]; then T=$B/receipt-bind-v1.mjs; else T=$L/scripts/receipt-bind.mjs; fi
    C="node $T --dir $d --rev $REV --lane $L"
    out=$(TMPDIR=/fast/scratch/hyaku/kumitate-r88/K88Scout $C 2>&1); rc=$?
    { echo "rev=$REV"; echo "tool_sha256=$(sha256sum $T | cut -d' ' -f1)"; echo "cmd=$C"; echo "$out"; echo "exit=$rc"; echo "signal=none"; } > $B/walk/r$r-$v.txt
    row="$row	$rc	$(echo "$out" | tail -1)"
  done
  echo "$row" >> $B/walk/table.tsv
done
