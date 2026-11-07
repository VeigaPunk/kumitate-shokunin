trim_cell() {
  local value=$1
  while [[ "$value" == [[:space:]]* ]]; do value=${value#?}; done
  while [[ "$value" == *[[:space:]] ]]; do value=${value%?}; done
  printf '%s' "$value"
}
for f in p_SP.txt p_TAB.txt p_VT.txt p_FF.txt p_CR.txt p_NBSP.txt p_U+2003.txt p_U+2028.txt p_U+FEFF.txt; do
  cell=$(head -1 "$f" | sed 's/^|//; s/|.*//')
  out=$(trim_cell "$cell")
  printf '%-14s cell=%q -> trimmed=%q\n' "$f" "$cell" "$out"
done
