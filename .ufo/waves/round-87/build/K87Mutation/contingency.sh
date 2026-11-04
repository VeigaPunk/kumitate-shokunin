#!/usr/bin/env bash
# Contingency measurement: m07 (per-receipt rev ignored) and m08 (worktree instead of
# `git show`) are invisible to arm detect-r86 only while every script named by a
# round-86 receipt has identical bytes at 19b4e and at the measured rev. Arm
# detect-r86's single `matched=1` comes from round-86 selftest.txt, which names
# scripts/counter-receipt.mjs. This script builds two scratch revisions:
#   M2 = base + an edit to scripts/spotcheck-adopt.mjs  (a *non*-matched receipt's script)
#   M3 = M2   + an edit to scripts/counter-receipt.mjs  (the matched receipt's script)
# and re-runs the frozen probe for pristine / m07 / m08 at each.
set -u
S=/fast/scratch/hyaku/kumitate-r87/K87Mutation
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Mutation
PROBE=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs
REF=/fast/scratch/hyaku/kumitate-r87/L1/ref/receipt-bind.mjs
LM=$S/lane-contingent
OUT=$B/contingency
rm -rf "$LM" "$OUT"; mkdir -p "$OUT"

git clone -q --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin "$LM"
TOPO=$(git -C "$LM" rev-parse --show-toplevel)
[ "$TOPO" = "$LM" ] || { echo "ABORT toplevel=$TOPO"; exit 2; }
git -C "$LM" checkout -q db97929212bb61ae970b10abac3cc4cd976713ae

gen_receipts() { # gen_receipts <rev>
  local rev=$1 d
  mkdir -p "$LM/.ufo/waves/round-87/close"
  for pair in "c1-probe.txt:cap-run.mjs" "receipt-bind.txt:receipt-evidence.mjs" \
              "proxy.txt:proxy-check.mjs" "map.txt:readme-map.mjs" \
              "spotcheck.txt:spotcheck-adopt.mjs" "sources.txt:sources-check.mjs" \
              "ready.txt:ready-handoff.mjs" "census.txt:wave-census.mjs"; do
    d=$(git -C "$LM" show "$rev:scripts/${pair##*:}" | sha256sum | cut -d' ' -f1)
    printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/%s --selftest\nexit=0\nsignal=none\n' \
      "$rev" "$d" "${pair##*:}" >"$LM/.ufo/waves/round-87/close/${pair%%:*}"
  done
}

run3() { # run3 <label> <rev>
  local label=$1 rev=$2 t id
  for t in "$REF" "$B/mutants/m07.mjs" "$B/mutants/m08.mjs"; do
    id=$(basename "$t" .mjs)
    cp "$t" "$LM/scripts/receipt-bind.mjs"
    node "$PROBE" --lane "$LM" --work "$S/work/ct-$label-$id" --rev "$rev" \
      --tool "$LM/scripts/receipt-bind.mjs" >"$OUT/$label.$id.txt" 2>&1
    echo "probe_exit=$?" >>"$OUT/$label.$id.txt"
    echo "[$label/$id] $(grep -E '^(C87_C1|ARM detect-r86)' "$OUT/$label.$id.txt" | tr '\n' ' ')"
  done
  cp "$REF" "$LM/scripts/receipt-bind.mjs"
}

printf '\n// r87 contingency: non-matched receipt script\n' >>"$LM/scripts/spotcheck-adopt.mjs"
git -C "$LM" add -A
git -C "$LM" -c user.name=t -c user.email=t@t commit -qm 'contingency M2'
M2=$(git -C "$LM" rev-parse HEAD)
gen_receipts "$M2"
echo "M2=$M2 spotcheck-adopt-only"
run3 m2 "$M2"

printf '\n// r87 contingency: matched receipt script\n' >>"$LM/scripts/counter-receipt.mjs"
git -C "$LM" add -A
git -C "$LM" -c user.name=t -c user.email=t@t commit -qm 'contingency M3'
M3=$(git -C "$LM" rev-parse HEAD)
gen_receipts "$M3"
echo "M3=$M3 counter-receipt-edited"
run3 m3 "$M3"

echo "=== toplevel re-check: $(git -C "$LM" rev-parse --show-toplevel) ==="
echo "M2=$M2" >"$OUT/revs.txt"; echo "M3=$M3" >>"$OUT/revs.txt"
