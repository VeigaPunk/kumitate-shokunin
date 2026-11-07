#!/usr/bin/env bash
set -eu
S=/fast/scratch/hyaku/kumitate-r97/K97ExecTool
P=/home/vgpnk/Projects/shokunin/kumitate-shokunin
R=$P/.ufo/waves/round-97/K97ExecTool
export TMPDIR=$S
cd "$S"
node "$R/sources-check.mjs" --selftest > "$R/selftest.txt" 2>&1
sha256sum "$R/sources-check.mjs" > "$R/sha256.txt"
diff -u "$P/scripts/sources-check.mjs" "$R/sources-check.mjs" > "$R/diff.txt" || test "$?" = 1
for n in 1 2; do
  timeout 540 prlimit --as=4294967296 node "$P/.ufo/waves/round-97/probe/probe97-c1.mjs" --tool "$R/sources-check.mjs" --work "$S/probe" --freeze 38eb197c17de7ce0dc562539f2f31f41bea037ec --rev 38eb197c17de7ce0dc562539f2f31f41bea037ec > "$R/score$n.txt" 2>&1
  printf 'score%s: ' "$n"
  /usr/bin/tail -n 1 "$R/score$n.txt"
done
