#!/usr/bin/env bash
# score.sh <name> <candidate.mjs>: run the FROZEN probe88-c1 against one candidate, write a receipt.
set -u
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$L/.ufo/waves/round-88/build/K88Critic
S=/fast/scratch/hyaku/kumitate-r88/K88Critic
P=$L/.ufo/waves/round-88/probe/probe88-c1.mjs
R=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
name=$1; cand=$2
W=$S/w-$name
mkdir -p "$W"
out=$B/transcript-$name.txt
cmd="node $P --lane $L --work $W --rev $R --tool $cand"
{
  echo "rev=$R"
  echo "tool_sha256=$(sha256sum "$P" | cut -d' ' -f1)"
  echo "cmd=$cmd"
  echo "candidate=$cand"
  echo "candidate_sha256=$(sha256sum "$cand" | cut -d' ' -f1)"
  TMPDIR=$W $cmd 2>&1
  rc=$?
  echo "exit=$rc"
  echo "signal=none"
} > "$out"
grep -E '^C88_C1' "$out" | sed "s|^|$name |"
