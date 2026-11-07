#!/usr/bin/env bash
trim_cell() {   # verbatim logic from scripts/sources-census.sh 531-535
  local value=$1
  while [[ "$value" == [[:space:]]* ]]; do value=${value#?}; done
  while [[ "$value" == *[[:space:]] ]]; do value=${value%?}; done
  printf '%s' "$value"
}
hex_of() { printf '%s' "$1" | od -An -tx1 | tr -d '\n' | sed 's/^ *//'; }
nbsp=$(printf '\302\240'); emsp=$(printf '\342\200\203'); nel=$(printf '\302\205')
for name in nbsp emsp nel; do
  eval "v=\$$name"
  out=$(trim_cell "x${v}S123")
  printf '%-10s in=x+%s+S123  len(in)=%s  out=[%s] out_hex=%s\n' "$name" "$(hex_of "$v")" "${#v}" "$out" "$(hex_of "$out")"
done
