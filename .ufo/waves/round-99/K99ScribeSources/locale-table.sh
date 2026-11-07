#!/usr/bin/env bash
trim_cell() {   # verbatim logic from scripts/sources-census.sh 531-535
  local value=$1
  while [[ "$value" == [[:space:]]* ]]; do value=${value#?}; done
  while [[ "$value" == *[[:space:]] ]]; do value=${value%?}; done
  printf '%s' "$value"
}
hexns() { printf '%s' "$1" | od -An -tx1 | tr -d ' \n'; }
TARGET=53313233   # hex of "S123"
strip_test() { # <name> <utf8 bytes>
  local n=$1 v=$2 lead trail lflag=KEPT tflag=KEPT
  lead=$(trim_cell "${v}S123"); trail=$(trim_cell "S123${v}")
  [ "$(hexns "$lead")" = "$TARGET" ] && lflag=STRIPPED
  [ "$(hexns "$trail")" = "$TARGET" ] && tflag=STRIPPED
  printf '%-15s %-14s lead=%-9s trail=%s\n' "$n" "$(hexns "$v")" "$lflag" "$tflag"
}
strip_test SP_0020  ' '
strip_test TAB_0009 "$(printf '\t')"
strip_test VT_000B  "$(printf '\013')"
strip_test FF_000C  "$(printf '\014')"
strip_test CR_000D  "$(printf '\015')"
strip_test NEL_0085 "$(printf '\302\205')"
strip_test NBSP_00A0 "$(printf '\302\240')"
strip_test OGHAM_1680 "$(printf '\341\232\200')"
strip_test U2000    "$(printf '\342\200\200')"
strip_test U2003    "$(printf '\342\200\203')"
strip_test U200A    "$(printf '\342\200\212')"
strip_test LS_2028  "$(printf '\342\200\250')"
strip_test PS_2029  "$(printf '\342\200\251')"
strip_test NNBSP_202F "$(printf '\342\200\257')"
strip_test MMSP_205F "$(printf '\342\201\237')"
strip_test IDSP_3000 "$(printf '\343\200\200')"
strip_test ZWSP_200B "$(printf '\342\200\213')"
strip_test ZWNBSP_FEFF "$(printf '\357\273\277')"
