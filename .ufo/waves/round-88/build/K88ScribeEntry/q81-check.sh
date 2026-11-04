S=$(mktemp -d -p "${Q81_SCRATCH:-/fast/scratch/hyaku}") REV=$(git rev-parse HEAD); P=.ufo/waves/round-88/probe/probe88-c1.mjs
node .ufo/waves/round-88/controls/make-worktree-variant.mjs scripts/receipt-bind.mjs "$S/twin.mjs" &&
node "$P" --lane "$PWD" --work "$S/a" --rev "$REV" > "$S/int.txt"; i=$?;
node "$P" --lane "$PWD" --work "$S/b" --rev "$REV" --tool "$S/twin.mjs" > "$S/twin.txt"; t=$?;
n=$(grep -cE '^ARM (rev-receipt-wins|worktree-forgery|default-rev|untracked-instrument): FAIL' "$S/twin.txt");
[ $i -eq 0 ] && [ $t -eq 1 ] && [ "$n" -eq 4 ] && echo Q81: PASS || echo "Q81: FAIL int=$i twin=$t worktree_arms_failed=$n/4"
