#!/usr/bin/env bash
# K85Review receipt runner — read-only against the lane; writes only this seat's
# scratch and its own build/receipts subtree. Every receipt names command, exit
# code and the revision it measured.
set -uo pipefail
seat=K85Review
build=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/$seat
scratch=/fast/scratch/hyaku/kumitate-r85/$seat
lane=/home/vgpnk/Projects/shokunin/kumitate-shokunin
harness="$1"
target="$2"
tag="$3"

mkdir -p "$build/receipts" "$scratch"

case "$harness" in
  probe)
    cmd=(node "$lane/.ufo/waves/round-85/probe/probe85-c1.mjs" --lane "$target" --work "$scratch/p-$tag")
    ;;
  cv)
    cmd=(node "$lane/.ufo/waves/round-85/controls/content-variation.mjs" --lane "$target" --work "$scratch/p-$tag")
    ;;
  cvrandom)
    cmd=(node "$lane/.ufo/waves/round-85/build/K85Review/attempts/content-variation-random-proposal.mjs" --lane "$target" --work "$scratch/p-$tag")
    ;;
  *)
    echo "run-receipt: unknown harness '$harness'" >&2
    exit 2
    ;;
esac

rev=$(git -C "$lane" rev-parse HEAD)
started=$(date -Is)
"${cmd[@]}" > "$scratch/$tag.out" 2>&1
ec=$?
finished=$(date -Is)

{
  printf 'seat: %s\nrev: %s\ncommand: %s\nstarted: %s\nfinished: %s\nexit: %s\n---\n' \
    "$seat" "$rev" "${cmd[*]}" "$started" "$finished" "$ec"
  cat "$scratch/$tag.out"
} > "$build/receipts/$tag.txt"

cat "$scratch/$tag.out"
printf 'RUN %s exit=%s last=%s\n' "$tag" "$ec" "$(awk 'END{print}' "$scratch/$tag.out")"
