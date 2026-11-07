#!/bin/bash
trim_cell() {
  local value=$1
  while [[ "$value" == [[:space:]]* ]]; do value=${value#?}; done
  while [[ "$value" == *[[:space:]] ]]; do value=${value%?}; done
  printf '%s' "$value"
}
hex() { printf '%s' "$1" | od -An -tx1 | tr -d '\n'; echo "  [$(printf '%s' "$1" | wc -c) bytes]"; }
for loc in C C.UTF-8 en_US.UTF-8; do
  echo "locale $loc"
  for spec in "NBSP:\u00a0" "EMSP:\u2003" "VT:\u000b" "TAB:\t" "SP: "; do
    name=${spec%%:*}; esc=${spec#*:}
    lead=$'\u0058'"$(printf "$esc")"   # not used
    v="corpus/knowledge/a.md$(printf "$esc")"
    out=$(LC_ALL=$loc LANG=$loc bash -c 'source /dev/stdin <<< "$0"' 2>/dev/null) # noop
    r=$(LC_ALL=$loc LANG=$loc bash -c 'trim_cell() { local value=$1; while [[ "$value" == [[:space:]]* ]]; do value=${value#?}; done; while [[ "$value" == *[[:space:]] ]]; do value=${value%?}; done; printf "%s" "$value"; }; x=$1; trim_cell "$x"' _ "$v")
    printf '  %-5s in-bytes=%s out-bytes=%s out-hex=%s\n' "$name" "$(printf '%s' "$v" | wc -c)" "$(printf '%s' "$r" | wc -c)" "$(printf '%s' "$r" | od -An -tx1 | tr -d '\n')"
  done
  # heading shape
  h=$'## \u2003Registry'
  rh=$(LC_ALL=$loc LANG=$loc bash -c 'trim_cell() { local value=$1; while [[ "$value" == [[:space:]]* ]]; do value=${value#?}; done; while [[ "$value" == *[[:space:]] ]]; do value=${value%?}; done; printf "%s" "$value"; }; x=$1; l="${x#"${x%%[! ]*}"}"; trim_cell "${l:2}"' _ "$h")
  printf '  heading trimmed=[%s] hex=%s\n' "$rh" "$(printf '%s' "$rh" | od -An -tx1 | tr -d '\n')"
done
