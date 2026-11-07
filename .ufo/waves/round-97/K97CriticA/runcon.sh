#!/usr/bin/env bash
# runcon.sh <construction name> [extra args...] — score one K97CriticA construction with the frozen counter.
set -u
N=$1; shift
S=/fast/scratch/hyaku/kumitate-r97/K97CriticA
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
P=$L/.ufo/waves/round-97/probe/probe97-c1.mjs
export TMPDIR=$S
mkdir -p "$S/probe/$N"
node "$P" --tool "$S/con/$N.mjs" --work "$S/probe/$N" "$@" \
  --freeze 38eb197c17de7ce0dc562539f2f31f41bea037ec --rev 38eb197c17de7ce0dc562539f2f31f41bea037ec \
  > "$L/.ufo/waves/round-97/K97CriticA/run-$N.txt" 2>&1
echo "exit=$? $N"
grep -E '^(# battery|a:|b:|c:|d:|e:|f:|C97_C1:|SETUP)' "$L/.ufo/waves/round-97/K97CriticA/run-$N.txt" | grep -v 'disagree' | cut -c1-220
