# usage: rc.sh <outfile> <tool-abs> <cmd...>   (cwd = lane)
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin; out=$1; tool=$2; shift 2
cd $L; REV=$(git -C $L rev-parse HEAD)
o=$(TMPDIR=/fast/scratch/hyaku/kumitate-r88/K88Scout "$@" 2>&1); rc=$?
{ echo "rev=$REV"; echo "tool_sha256=$(git -C $L cat-file blob $REV:${tool#$L/} | sha256sum | cut -d' ' -f1)"; echo "cmd=$*"; echo "$o"; echo "exit=$rc"; echo "signal=none"; } > $out
echo "$out exit=$rc"; echo "$o" | tail -3
