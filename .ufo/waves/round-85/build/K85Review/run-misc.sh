#!/usr/bin/env bash
# K85Review miscellaneous receipts: real-task recount, candidate selftest,
# name/content cross-over demonstration, read-only canary. Read-only against the
# lane; writes only this seat's scratch and build/receipts.
set -uo pipefail
seat=K85Review
build=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/$seat
scratch=/fast/scratch/hyaku/kumitate-r85/$seat
lane=/home/vgpnk/Projects/shokunin/kumitate-shokunin
cand=$lane/.ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs
rev=$(git -C "$lane" rev-parse HEAD)
mkdir -p "$build/receipts" "$scratch"

rec() {
  local tag="$1"; shift
  local out="$scratch/$tag.out"
  {
    printf 'seat: %s\nrev: %s\ncommand: %s\nstarted: %s\n' "$seat" "$rev" "$*" "$(date -Is)"
  } > "$build/receipts/$tag.txt"
  "$@" > "$out" 2>&1
  local ec=$?
  {
    printf 'finished: %s\nexit: %s\n---\n' "$(date -Is)" "$ec"
    cat "$out"
  } >> "$build/receipts/$tag.txt"
  cat "$out"
  printf 'MISC %s exit=%s last=%s\n' "$tag" "$ec" "$(awk 'END{print}' "$out")"
  return 0
}

mode="$1"; shift
case "$mode" in
  real)
    for f in "$lane/.ufo/waves/round-83/close/c1-probe.txt" \
             "$lane/.ufo/waves/round-83/close/c1-repair.txt" \
             "$lane/.ufo/waves/round-83/close/c2-probe.txt" \
             "$lane/.ufo/waves/round-84/close/history-red.txt" \
             "$lane/.ufo/waves/round-84/close/history-repair.txt"; do
      tag="real-$(basename "$f" .txt)"
      rec "$tag" node "$cand" --receipt "$f"
      printf 'sha256=%s bytes=%s\n' "$(sha256sum "$f" | awk '{print $1}')" "$(stat -c %s "$f")"
    done
    ;;
  selftest)
    rec selftest-recount node "$cand" --selftest --work "$scratch/selftest-work"
    ;;
  crossover)
    # $1 = tag, $2 = tool path. A red payload served under the fixture basename
    # clean.txt: a name-keyed tool answers CLEAN, a content-derived tool DRIFTs.
    local_tag="$1"
    local_tool="$2"
    dir="$scratch/crossover-$local_tag"
    mkdir -p "$dir"
    printf 'rev=deadbeefdeadbeef\nX arm a FAIL\nX: UNMET held=0/1\n' > "$dir/clean.txt"
    rec "crossover-$local_tag" node "$local_tool" --receipt "$dir/clean.txt"
    ;;
  canary)
    dir="$scratch/canary"
    mkdir -p "$dir"
    canary="$dir/CANARY"
    rm -f "$canary"
    receipt="$dir/canary-receipt.txt"
    printf "command: require('node:fs').writeFileSync('%s','executed')\nX arm a ok\nX arm b ok\nX: HELD held=2/2\n" "$canary" > "$receipt"
    before=$(sha256sum "$receipt" | awk '{print $1}')
    out="$scratch/canary.out"
    ( cd "$dir" && node "$cand" --receipt "$receipt" ) > "$out" 2>&1
    ec=$?
    after=$(sha256sum "$receipt" | awk '{print $1}')
    {
      printf 'seat: %s\nrev: %s\ncommand: (cd %s && node %s --receipt %s)\nstarted: %s\n' \
        "$seat" "$rev" "$dir" "$cand" "$receipt" "$(date -Is)"
      printf 'receipt_before=%s receipt_after=%s canary_executed=%s exit=%s\n---\n' \
        "$before" "$after" "$([ -e "$canary" ] && echo yes || echo no)" "$ec"
      cat "$out"
    } > "$build/receipts/canary.txt"
    cat "$out"
    printf 'MISC canary exit=%s before=%s after=%s canary=%s\n' \
      "$ec" "$before" "$after" "$([ -e "$canary" ] && echo yes || echo no)"
    ;;
  *)
    echo "run-misc: unknown mode '$mode'" >&2
    exit 2
    ;;
esac
